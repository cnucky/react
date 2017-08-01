var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer');
var argv = require('yargs').argv;
var path = require('path');
var fs = require('fs');
var config = require('./config/config.js');

var _ = require('underscore');

var server = require('http').createServer(app);
server.setTimeout(5000000, function() {
    console.log("http server Timeout!");
});

var serverHttps;
if (config.useHttps) {
    var privateKey = fs.readFileSync('ssl/njxx.key', 'utf8');
    var certificate = fs.readFileSync('ssl/njxx.cer', 'utf8');
    var credentials = {
        key: privateKey,
        cert: certificate,
        passphrase: '841_sjzc',
        // ca: [fs.readFileSync('ssl/ca.cer')],
        // requestCert: true,
        // rejectUnauthorized: true,
    };
    serverHttps = require('https').createServer(credentials, app);
    serverHttps.setTimeout(5000000, function() {
        console.log("https server Timeout!");
    });
}


//add socket.io
var io = require('socket.io')(server);

var middleware = require('./framework/utils/express-middleware');
var i18n = require('./utils/i18n-util');

//var addMenuCache = require('./utils/cache-add-menu');

app.use(cookieParser());

app.use(bodyParser.json({
    limit: '20mb'
})); // for parsing application/json
app.use(bodyParser.urlencoded({
    extended: true,
    parameterLimit: 10000000000,
    limit: '20mb'
})); // for parsing application/x-www-form-urlencoded
// app.use(multer()); // for parsing multipart/form-data

app.use(middleware());
app.use(i18n());

// route
if (argv.mock) {
    console.log('Enable mock');
    app.use('/', require('./framework/route/mock'));
}

// use webpack-dev-server
if (argv.dev) {
    var webpack = require('webpack');
    var webpackConfig = require('./webpack.config').createConfig(); // hot loader
    // webpackConfig.forEach(function(config) {
        var compiler = webpack(webpackConfig);

        /**
         * https://github.com/webpack/webpack-dev-middleware
         * noInfo -- 是否仅在出错时输出信息
         * quiet -- 控制台不输出任何信息
         */
        app.use(require('webpack-dev-middleware')(compiler, {
            stats: {colors: true},
            noInfo: true,
            // publicPath: config.output.publicPath
        }));
        app.use(require('webpack-hot-middleware')(compiler));
    // })
}

app.use('/', require('./framework/route/all'));
app.use('/user/', require('./framework/route/user'));
app.use('/department/', require('./framework/route/department'));
app.use('/usergroup/', require('./framework/route/usergroup'));
app.use('/userrole/', require('./framework/route/userrole'));

app.use('/log/', require('./framework/route/log'));
app.use('/thirdparty', require('./framework/route/thirdparty'));

app.use('/workspacedir/', require('./framework/route/workspacedir'));
app.use('/utility', require('./framework/route/utility'));
app.use('/messagecenter',require('./framework/route/messagecenter'));
app.use('/appstore', require('./framework/route/appstore'));
app.use('/workflow/', require('./framework/route/workflow'));

app.use('/tabledesign/', require('./framework/route/tabledesign'));
app.use('/spycommon/', require('./framework/route/spycommon'));
app.use('/tbl-design', require('./framework/route/tbl-design'));
app.use('/gisapi', require('./framework/route/gisapi'));
app.use('/uploadfiles', require('./framework/route/uploadfiles'));
app.use('/smalltoolset', require('./framework/route/smalltoolset'));
// framework config
var frameworkConfig = require('./framework.config');
_.each(frameworkConfig, function (dir, name) {
  var path = './' + dir + '/router.js';
  if (fs.statSync(path).isFile()) {
      if (name == 'main') {
          name = '';
      }
    app.use('/' + name, require(path));
  }
})

var options = {
    //etag: false,
    extentions: ['css'],
    maxAge: '10000000',
    //setHeaders: function(res, path, stat){
    //    res.set('x-timestamp', Date.now())
    //}
};
app.use(express.static('_build', options));

//addMenuCache.addMenuCache();

var httpPort = 3000, httpsPort = 3001;
var httpServer = server.listen(httpPort, function() {
    var port = httpServer.address().port;
    console.log('app listening at http://localhost:%s', port);
});
/*
if (config.useHttps) {
    var httpsServer = serverHttps.listen(httpsPort, function() {
        var port = httpsServer.address().port;
        console.log('app listening at https://localhost:%s', port);
    });
}
*/

