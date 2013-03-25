var http = require('http'),
    url = require('url'),
    static = require('node-static'),
    $ = require("jquery"),
    S = require("string");

var fileServer = new static.Server('./');

http.createServer(function(proxyReq, proxyResp) {
    function processPage(page) {
        var div = $(page).find("div").filter(function() {
            return $(this).attr("style") == "width: 728px;";
        });

        var nodes = div.contents().not("h2, h3, hr, p").filter(function() {
            return this.textContent[0] == destParams.query['q'];
        }).toArray();

        var words = {};
        $.each(nodes, function(i, elem) {
            var tempArr = S(elem.textContent).trim().chompRight(',').split(", ");
            words[tempArr[0].length] = tempArr;
        });

        return words;
    }

    var URL = proxyReq.url.substr(proxyReq.url.indexOf("/") + 1, proxyReq.url.length);
    console.log(URL);

    if (URL.length == 0) {
        fileServer.serveFile('/index.html', 200, {}, proxyReq, proxyResp);
        return;
    }

    var destParams = url.parse("http://" + URL, true);

    var reqOptions = {
        host: destParams.host,
        port: 80,
        path: destParams.path,
        method: "GET"
    };

    var req = http.request(reqOptions, function(res) {
        // var headers = res.headers;
        // headers['Access-Control-Allow-Origin'] = '*';
        // headers['Access-Control-Allow-Headers'] = 'X-Requested-With';
        // proxyResp.writeHead(200, headers);

        var page = "";
        res.on('data', function(chunk) {
            page += chunk;
        });

        res.on('end', function() {
            proxyResp.end(JSON.stringify(processPage(page), null, 4));
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