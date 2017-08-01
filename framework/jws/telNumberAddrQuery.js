// Generated by method-generator.js. DOT NOT MODIFY!！

var path = require('path');
var _ = require('underscore');
var jws = require(path.join(process.cwd(), 'utils/jws'));
var appConfig = require('../config.js');
var url = 'http://' + appConfig['app-common'] + '/TelNumberAddrQuery/cxf/TelNumberAddrQuerySoap?wsdl';
module.exports = function (req, res) {
    return {
        "getTelNumberAddrInfo": function (args, callback) {
            if (_.isFunction(args)) {
                callback = args;
                args = {};
            }
            return jws(url, "getTelNumberAddrInfo", args, callback, req, res);
        },
        url: 'http://' + appConfig['app-common'] + '/TelNumberAddrQuery/cxf/TelNumberAddrQuerySoap?wsdl'
    }
}