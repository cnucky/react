var http = require('http');
var exec = require('exec');
var child_process = require('child_process');
var winston = require('winston');
var path = require('path');

var workspace = process.env.pm_cwd || __dirname;

var filename = path.join(workspace, 'logs/webhook.log');

var logger = new(winston.Logger)({
    transports: [
        new(winston.transports.Console)(),
        new(winston.transports.File)({
            filename: filename
        })
    ]
});



http.createServer(function(req, res) {
    var data = new Buffer(0);
    req.on('data', function(chunk) {
        data = Buffer.concat([data, chunk]);
    });
    req.on('end', function(chunk) {
        if (chunk) {
            data = Buffer.concat([data, chunk]);
        }
        var str = data.toString();
        logger.info(str);
        try {
            var json = JSON.parse(str);
            if (json.ref != 'refs/heads/release') {
                logger.info('not release branch:', json.ref);
                res.end('not release: ' + json.ref);
                return ;
            }
            child_process.exec('cd ' + workspace + '/devtools/ && sh git-hook-publish.sh', function(error, out, code) {
                if (code == 0) {
                    logger.info('success');
                    res.end(out);
                } else {
                    logger.error(error);
                    res.writeHead(200, {
                        'Content-type': 'text/plain'
                    });
                    res.write('[Error]\n' + error + '\n\n');
                    res.write('[Stdout]\n' + out + '\n\n');
                    res.write('[Code]\n' + code);
                    res.end();
                }
            });
        } catch (e) {
            logger.error(e);
            res.end('Error:' + e.toString());
        }
    });

}).listen(3001);
