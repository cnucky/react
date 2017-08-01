var $ = require('jquery');
var _ = require('underscore');
var Q = require('q');
var Notify = require('nova-notify');
var Util = require('nova-utils');

var EXPIRE_TIME = 60 * 1000; // 过期时间1min
var loginUrl = window.__CONF__.config_system.loginUrl;
var whiteList = {
    [loginUrl]: true
};

function loadPermission(defer, times) {
    times = times || 0;
    defer = defer || Q.defer();
    $.getJSON('/userrole/getpermission', function(rsp) {
        if (rsp.code == 0) {
        	var save = {timestamp: new Date().getTime()};
        	var tgt = Util.getCookiekey('tgt');
        	save[tgt] = rsp.data;
            window.localStorage['userPermissions'] = JSON.stringify(save);
            defer.resolve(rsp.data);
        } else if (times < 2) {
            loadPermission(defer, ++times);
        } else {
            defer.resolve([]);
        }
    });
    return defer.promise;
}

function getPermissions() {
    var defer = Q.defer();
    if (window.localStorage) {
        var rlt = window.localStorage.getItem('userPermissions');
        rlt = JSON.parse(rlt);
        var tgt = Util.getCookiekey('tgt');
        if (rlt && rlt[tgt] && new Date().getTime() - rlt.timestamp < EXPIRE_TIME) {
            defer.resolve(rlt[tgt]);
        } else {
            window.localStorage.removeItem('userPermissions');
            loadPermission(defer);
        }
    } else {
        loadPermission(defer);
    }
    return defer.promise;
}

// function checkEntry(ul, filter) {
// 	var rlt = false;
//     $(ul).children().each(function() {
//         var key = $(this).children('a').attr('data-key');
//         var matched = _.find(filter, function(item) {
//             return item.name == key;
//         });
//         var children = $(this).children('ul');
//         if(!checkEntry(children) && !matched) {
//         	$(this).hide();
//         } else {
//         	rlt = true;
//         }
//     })
//     return rlt;
// }

module.exports.getPermissions = getPermissions;

module.exports.authorize = function(callback) {
    if (whiteList[window.location.pathname]) {
        callback();
        return;  
    } 
    getPermissions().then(function(filter) {
        if (_.isEmpty(filter)) {
            $('.sidebar-menu').show();
            Notify.show({
                title: '用户权限异常',
                text: '功能使用可能受到限制，请联系管理员',
                type: 'error'
            });
        }
        callback(filter);
    }).catch(function(error){
        console.error(error);
    })
}
