var router = require('express').Router();
var fs = require('fs');
var multipart = require('connect-multiparty');
var http = require('http');
var qs = require('querystring');
var appConfig = require('../../../config/config.js');
var options = {
    hostname: appConfig['gis-server'],
    port: 8080,
    path: '/LayerService/layer/transfile',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    }
};
var baseDir = '/tmp/LayerManager';

function sendFileNamesToGIS(src, dest) {
    console.log(src);
    fs.rename(src, dest, function(err) {
        if (err) {
            console.log('rename error: ' + err);
        } else {
            console.log('rename to:' + dest);
            var req2 = http.request(options, function(rsp) {
                console.log(rsp.statusCode);
                console.log('return from gis:' + dest);
                fs.unlink(dest, function() {
                    console.log('Delete ' + dest + ' success');
                });
            });
            req2.on('error', function(e) {
                console.log('problem with request: ' + e.message);
            });
            req2.write(qs.stringify({
                'filename[]': [dest]
            }));
            req2.end();
        }
    });
};
if (!fs.existsSync('/tmp')) {
    fs.mkdirSync('/tmp');
    console.log('Make dir /tmp');
}
if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir);
    console.log('Make dir ' + baseDir);
}
router.post('/UploadFile', multipart({
    uploadDir: baseDir
}), function(req, res) {
    var files = [];
    if (req.files.file.length != undefined) {
        for (var i = 0; i < req.files.file.length; i++) {
            var filename = req.files.file[i].originalFilename;
            var dotIndex = filename.lastIndexOf(".");
            var id;
            if (dotIndex != -1) {
                var sname = filename.substring(0, dotIndex);
                var ename = filename.substring(dotIndex + 1);
                id = req.body[sname][ename];
            } else {
                id = req.body[filename];
            }
            var targetPath = baseDir + '/' + id + '_' + filename + '.RENAME';
            console.log(filename);
            files.push(targetPath);
            sendFileNamesToGIS(req.files.file[i].path, targetPath);
        }
    } else {
        var filename = req.files.file.originalFilename;
        var dotIndex = filename.lastIndexOf(".");
        var id;
        if (dotIndex != -1) {
            var sname = filename.substring(0, dotIndex);
            var ename = filename.substring(dotIndex + 1);
            id = req.body[sname][ename];
        } else {
            id = req.body[filename];
        }
        var targetPath = baseDir + '/' + id + '_' + filename + '.RENAME';
        console.log('else:' + filename);
        files.push(targetPath);
        sendFileNamesToGIS(req.files.file.path, targetPath);
    }

    // var req2 = http.request(options, function(rsp) {
    //     // console.log(rsp.IncomingMessage);
    //     // for (var i = 0; i < files.length; i++) {
    //     //     fs.unlink(files[i], function() {
    //     //         // console.log('Delete ' + e + ' success');
    //     //     });
    //     // }
    // });
    // req2.on('error', function(e) {
    //     console.log('problem with request: ' + e.message);
    // });
    // req2.write(qs.stringify({
    //     'filename[]': files
    // }));
    // req2.end();

    res.writeHead(200, {
        'content-type': 'text/plain;charset=utf-8'
    });
    resText = {
        files: files,
    };
    res.write(JSON.stringify(resText));
    res.end();
});

router.post('/gisPostQuery', function(req, res) {
    var reqData = req.query;
    var postData = {};
    for (var i in reqData) {
        console.log(reqData[i] instanceof Array);
        if (reqData[i] instanceof Array) {
            if (i === 'fieldInfo') {
                for (var j = 0; j < reqData[i].length; j++) {
                    for (var k in reqData[i][j]) {
                        var key = i + '[' + j + '][' + k + ']';
                        postData[key] = reqData[i][j][k];
                    }
                }
            } else {
                var key = i + '[]';
                postData[key] = reqData[i];
            }
        } else if (i === 'MapField') {
            for (var k in reqData[i]) {
                var key = i + '[' + k + '][]';
                postData[key] = reqData[i][k];
            }
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
            var data = null;
            // switch (pageStr.length) {
            //     case 0:
            //         data = new Buffer(0);
            //         break;
            //     case 1:
            //         data = pageStr[0];
            //         break;
            //     default:
            //         data = new Buffer(size);
            //         for (var i = 0, pos = 0, l = pageStr.length; i < l; i++) {
            //             var chunk = pageStr[i];
            //             chunk.copy(data, pos);
            //             pos += chunk.length
            //         }
            //         break;
            // }
            data = Buffer.concat(pageStr);
            res.end(data);
        });
    })
    req2.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });
    req2.write(qs.stringify(postData));

    req2.end();
});

module.exports = router;