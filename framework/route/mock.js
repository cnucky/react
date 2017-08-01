var router = require('express').Router();
var winston = require('winston');
var fs = require('fs');

var pwd = process.env.PWD;

router.get('/getlink', function(req, res) {
    var  data= [
        {"name":"indexl","link":"/dataareaperceive/dap-index-left.html"},
        {"name":"indexr","link":"/dataareaperceive/dap-index-right.html"},
        {"name":"areal","link":"/dataareaperceive/dap-area-left.html"},
        {"name":"arear","link":"/dataareaperceive/dap-area-right.html"},
        {"name":"personl","link":"/dataareaperceive/dap-person-left.html"},
        {"name":"personr","link":"/dataareaperceive/dap-person-right.html"},
        {"name":"groupl","link":"/dataareaperceive/dap-group-left.html"},
        {"name":"groupr","link":"/dataareaperceive/dap-group-right.html"},
        {"name":"eventl","link":"/dataareaperceive/dap-event-left.html"},
        {"name":"eventr","link":"/dataareaperceive/dap-event-right.html"}
];

res.endj(data);
});

router.all('*', function(req, res, next) {
    if (!req.xhr) {
        next();
        return;
    }
    var path = req.path;
    // like /businessA/routeB/getC
    var isBusinessRoute = path.match(/\//g).length == 3;

    var filePath;
    if (isBusinessRoute) {
        // like ['', 'businessA', routeB', 'getC']
        var pathSegments = path.split('/');
        pathSegments.splice(2, 0, 'route-mock');
        var mockPath = pathSegments.join('/');
        filePath = pwd + '/business' + mockPath + '.json';
    } else {
        filePath = pwd + '/framework/route-mock' + path + '.json';
    }
    if(fs.existsSync(filePath)) {
        console.log('business:', isBusinessRoute, 'mock-path:', filePath);
        winston.info('Mock:' + req.url);
        res.writeHead(200, {
            'Content-type': 'text/json'
        });
        fs.createReadStream(filePath).pipe(res);
    } else {
        next();
    }
});

module.exports = router;
