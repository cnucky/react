var Q = require('q');
var _ = require('underscore');
var request = require('request');

var host = 'http://localhost:3000';

var TIMEOUT = 10000;
var tgt = '';

var assert = require("assert");

function _request(method, api, data, assert_done, log) {
    return Q.promise(function(resolve, reject) {
        var j = request.jar();
        var cookie = request.cookie('tgt=' + tgt);
        j.setCookie(cookie, host);

        if (_.isFunction(data)) {
            log = !!assert_done;
            assert_done = data;
            data = {};
        }

        request({
            url: host + api,
            method: method,
            qs: data || {},
            form: data,
            json: true,
            jar: j
        }, function(err, rsp, body) {
            if (_.isFunction(assert_done)) {
                try {
                    assert.equal(0, body.code);
                    assert_done();
                } catch (e) {
                    assert_done(e);
                }
            }
            if (!!log) {
                var text = JSON.stringify(body, true, 4);
                if (body && body.code != 0) {
                    console.log(text.yellow);
                } else {
                    console.log(text);
                }

            }
            resolve(body);
        });
    });
}

function get(api, data, assert_done, log) {
    return _request('GET', api, data, assert_done, log);
}

function post(api, data, assert_done, log) {
    return _request('POST', api, data, assert_done, log);
}

function login(done) {
    post('/user/login', {
            username: 'test',
            password: '123456'
        })
        .then(function(rsp) {
            tgt = rsp.data;
            console.log('use tgt:', tgt);
            done();
        });
}

function logout(done) {
    get('/user/logout')
        .then(function(rsp) {
            console.log('logout:', rsp);
            done();
        });
}

module.exports = {
    get: get,
    post: post,
    login: login,
    logout: logout,
    timeout: TIMEOUT
}
