var router = require('express').Router();
var http = require('http');
var qs = require('querystring');

router.get('/tileMap', function(req, res) {
    var reqData = req.query;
    console.log(req.query)
    var options = {
        hostname: req.query.hostname,
        port: 8080,
        path: '/TileMapService/arcgis/rest/services/world/MapServer/tile/' + req.query.z + '/' + req.query.y + '/' + req.query.x + '.png',
        method: 'GET',
    };
    var pageStr = [];
    var size = 0;
    var req2 = http.get(options, function(rsp) {
        console.log(rsp.statusCode);

        rsp.on('data', function(data) {
            pageStr.push(data);
            size += data.length;
        })

        rsp.on('end', function() {
            res.writeHeader(200, {
                'ContentType': 'image/png',
                'Content-length': size
            });
            var data = Buffer.concat(pageStr);
            res.end(data);
        });
    })

    req2.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });

    req2.end();
});


router.post('/gisPostQuery', function(req, res) {
    var reqData = req.query;
    var postData = {};
    for (var i in reqData) {
        console.log(reqData[i] instanceof Array);
        if (reqData[i] instanceof Array) {
            var key = i + '[]';
            postData[key] = reqData[i];
        } else {
            postData[i] = reqData[i];
        }
    }

    var options = {
        hostname: req.query.hostname,
        port: 8080,
        path: req.query.path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        }
    };
    var pageStr = [];
    var size = 0;

    var req2 = http.request(options, function(rsp) {
        console.log(rsp.statusCode);

        rsp.on('data', function(data) {
            pageStr.push(data);
            size += data.length;
        })

        rsp.on('end', function() {
           var data = Buffer.concat(pageStr);
            res.end(data);
        });
    })
    req2.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });
    req2.write(qs.stringify(postData));

    req2.end();
});

router.get('/gisGetQuery', function(req, res) {
    var reqData = req.query;

    var options = {
        hostname: req.query.hostname,
        port: req.query.port || 8080,
        path: req.query.path + '?' + qs.stringify(req.query),
        method: 'GET',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        }
    };
    var pageStr = [];
    var size = 0;
    var req2 = http.request(options, function(rsp) {
        rsp.on('data', function(data) {
            pageStr.push(data);
            size += data.length;
        })

        rsp.on('end', function() {
            var data = Buffer.concat(pageStr);
            res.end(data);
        });
    })

    req2.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });
    req2.end();
});

module.exports = router;