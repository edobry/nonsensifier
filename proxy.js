var http = require('http'),
    url = require('url'),
    static = require('node-static');

var fileServer = new static.Server('./');

http.createServer(function(proxyReq, proxyResp) {
  var URL = proxyReq.url.substr(proxyReq.url.indexOf("/")+1, proxyReq.url.length);
  console.log(URL);

  if(URL.length == 0) fileServer.serveFile('/index.html', 200, {}, proxyReq, proxyResp);

  var destParams = url.parse("http://" + URL);
  console.log(destParams.query);

  var reqOptions = {
      host : destParams.host,
      port : 80,
      path : destParams.path,
      method : "GET"
  };

  var req = http.request(reqOptions, function(res) {
      var headers = res.headers;
      headers['Access-Control-Allow-Origin'] = '*';
      headers['Access-Control-Allow-Headers'] = 'X-Requested-With';
      proxyResp.writeHead(200, headers);

      res.on('data', function(chunk) {
          proxyResp.write(chunk);
      });

      res.on('end', function() {
          proxyResp.end();
      });
  });

  req.on('error', function(e) {
      console.log('An error occured: ' + e.message);
      proxyResp.writeHead(503);
      proxyResp.write("Error!");
      proxyResp.end();
  });
  req.end();

}).listen(8080);