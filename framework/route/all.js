var router = require('express').Router();
var LoginApi = require('../jws/login');
var _ = require('underscore');
var Code = require('../../utils/code');
var argv = require('yargs').argv;
var logger = require('../../utils/routeLogger');
var sysConfig = require('../../utils/config-system');

var loginUrl = sysConfig.loginUrl();
var homeUrl = sysConfig.homeUrl();
var whiteList = {
    '/user/login': true,
    '/user/logout': true,
    [loginUrl]: true
};

function isHtmlPage(path) {
    return path == '/' || /\.html?$/.test(path);
}

function addLog(req, message, level) {
    req._novaLogs.push({
        level: level || 'info',
        message: message
    });
}


var _requestId = 0;
router.all('*', function(req, res, next) {
    // console.log('all:', req.url);
    req._novaRequestId = ++_requestId; //new Date().getTime();
    req._novaLogs = [];
    req._novaStart = Date.now();

    req.generalArgument = req.generalArgument || {};
    _.extend(req.generalArgument, {
        ip: req.connection.remoteAddress.substr(req.connection.remoteAddress.lastIndexOf(':')+1) 
    });
    
    // valid tgt
    // console.log('cookie', req.cookies);
    var tgt = req.cookies['tgt'];
    // console.log('get tgt:', tgt);

    if (whiteList[req.path]) {
        next();
        return;
    } else if (!isHtmlPage(req.path) && req.path.indexOf('.') != -1  // resources
        || argv.web) {
        // console.log('inWhiteList', req.url);
        next();
        return;
    } else if (req.path === '/' || req.path === '/home2.html') {
        if(_.isEmpty(tgt)){
            res.status(302);
            res.setHeader('Location', loginUrl);
            res.end();
        } else{
            res.redirect(homeUrl);
        }
        return;
    }

    if (_.isEmpty(tgt)) {
        addLog(req, 'tgt is empty', 'error');
        if (isHtmlPage(req.path)) {
            res.status(302);
            res.setHeader('Location', loginUrl + '?fromurl=' + encodeURIComponent(req.url));
            res.end();
        } else {
            res.endj({
                code: Code.TGT_INVALID,
                message: '需要登录',
                data: []
            });
        }
        return;
    }

    LoginApi(req).loginVerify({
            tgt: tgt
        })
        .then(function(rsp) {
            _.extend(req.generalArgument, {
                loginName: rsp.data.loginName,
                userId: rsp.data.userId
            });

            res.cookie('userid',rsp.data.userId,{
                path: '/',
                expires: new Date(Date.now() + 3600 * 24 * 1000)
            });

            next();
        })
        .catch(function(rsp) {
            addLog(req, 'login verify failed.', 'error');
            if (isHtmlPage(req.path)) {
                res.status(302);
                res.setHeader('Location', loginUrl + '?fromurl=' + encodeURIComponent(req.url));
                res.end();
            } else {
                if (rsp) {
                    rsp.code = rsp.code ? Code.TGT_INVALID : Code.SERVICE_ERROR;
                    rsp.data = [];
                }
                res.endj(rsp);
            }
        });
});

module.exports = router;
