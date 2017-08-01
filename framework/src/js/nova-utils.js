/**
 * author: yaco
 * utils methods for this project
 */
var Q = require('q');
var $ = require('jquery');
var _ = require('underscore');
var objectHash = require('object-hash');
var stableStringify = require('json-stable-stringify');
require("../../../public/utility/jbase64.js");

function makeRetryGet(url, params, retryTimes) {
    retryTimes = retryTimes || 5;
    var defer = Q.defer();

    function request() {
        $.getJSON(url, params, function(rsp) {
            if (rsp.code == 0) {
                defer.resolve(rsp.data);
            } else if (retryTimes > 0) {
                retryTimes--;
                request();
            } else {
                defer.reject(rsp.message);
            }
        });
    }
    request();
    return defer.promise;
}

function makePost(url, params) {
    var defer = Q.defer();
    $.post(url, params, function(rsp) {
        rsp = JSON.parse(rsp);
        if (rsp.code == 0) {
            defer.resolve(rsp.data);
        } else {
            defer.reject(rsp.message);
        }
    });
    return defer.promise;
}

// 从 URL 传参中获得搜索关键字
function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [undefined, ""])[1].replace(/\+/g, '%20')) || null;
}

function enCodeString(str) {
    return BASE64.encoder(str);
}

function deCodeString(str){
    return BASE64.decoder(str);
}

// 获取 cookie 中的信息
function getCookiekey(key) {
    var cookies = document.cookie.split('; ');
    var map = {};
    cookies.forEach(function(cookie) {
        var kv = cookie.split('=');
        map[kv[0]] = kv[1];
    });

    return map[key];
}

function logout() {
    makeRetryGet('/user/logout').finally(function() {
        window.location.href = window.__CONF__.config_system.loginUrl;
    });
}

function addPageStash(page, item) {
    if (window.localStorage) {
        var stash = window.localStorage[page];
        stash = stash ? JSON.parse(stash) : [];
        stash.push(item);
        window.localStorage[page] = JSON.stringify(stash);
    }
}

function setPageStash(page, stash) {
    if (window.localStorage) {
        window.localStorage[page] = JSON.stringify(stash);
    }
}

function clearPageStash(page) {
    if (window.localStorage) {
        window.localStorage.removeItem(page);
    }
}

function getPageStash(page) {
    if (window.localStorage) {
        var stash = window.localStorage[page];
        stash = stash ? JSON.parse(stash) : [];
        return stash;
    }
    return [];
}

/**
 * @deprecated 使用moment.js替代
 * 对日期进行格式化，
 * @param date 要格式化的日期
 * @param format 进行格式化的模式字符串
 *     支持的模式字母有：
 *     y:年,
 *     M:年中的月份(1-12),
 *     d:月份中的天(1-31),
 *     h:小时(0-23),
 *     m:分(0-59),
 *     s:秒(0-59),
 *     S:毫秒(0-999),
 *     q:季度(1-4)
 * @return String
 * @author yanis.wang@gmail.com
 */
function dateFormat(date, format) {
    if (format === undefined) {
        format = date;
        date = new Date();
    }
    var map = {
        "M": date.getMonth() + 1, //月份
        "d": date.getDate(), //日
        "h": date.getHours(), //小时
        "m": date.getMinutes(), //分
        "s": date.getSeconds(), //秒
        "q": Math.floor((date.getMonth() + 3) / 3), //季度
        "S": date.getMilliseconds() //毫秒
    };
    format = format.replace(/([yMdhmsqS])+/g, function(all, t) {
        var v = map[t];
        if (v !== undefined) {
            if (all.length > 1) {
                v = '0' + v;
                v = v.substr(v.length - 2);
            }
            return v;
        } else if (t === 'y') {
            return (date.getFullYear() + '').substr(4 - all.length);
        }
        return all;
    });
    return format;
}

/**
 * 结合bject-hash与stable-stringify避免对象生成hash因为字段顺序不同造成的影响
 */
function hash(obj) {
    return objectHash(stableStringify(obj));
}

function getUrlPath() {
    var url = document.location.toString();
    var arrUrl = url.split("//");

    var start = arrUrl[1].indexOf("/");
    var relUrl = arrUrl[1].substring(start); //stop省略，截取从start开始到结尾的所有字符

    if (relUrl.indexOf("?") != -1) {
        relUrl = relUrl.split("?")[0];
    }
    return relUrl;
}

function checkValidName(name) {
    return !(/[:*?"'<>|\\\\]+/g).test(name);
}

function dynamicLoadingCss(path) {
    if (!path || path.length === 0) {
        throw new Error("argument path is required");
    }

    var head = document.getElementsByTagName("head")[0];
    var link = document.createElement("link");
    link.href = path;
    link.rel = "stylesheet";
    link.type = "text/css";
    head.appendChild(link);
}

module.exports = {
    dynamicLoadingCss:dynamicLoadingCss,
    makeRetryGet: makeRetryGet,
    makePost: makePost,
    getURLParameter: getURLParameter,
    enCodeString: enCodeString,
    deCodeString: deCodeString,
    getCookiekey: getCookiekey,
    logout: logout,
    stash: {
        addPageStash: addPageStash,
        clearPageStash: clearPageStash,
        getPageStash: getPageStash,
        setPageStash: setPageStash
    },
    hash: hash,
    stableStringify: stableStringify,
    getUrlPath: getUrlPath,
    checkValidName: checkValidName
};