// Generated by method-generator.js. DOT NOT MODIFY!！

var path = require('path');
var _ = require('underscore');
var jws = require(path.join(process.cwd(), 'utils/jws'));
var jws = require(path.join(process.cwd(), 'utils/jws'));
var appConfig = require('../config.js');
//var url = 'http://' + appConfig['app-analysis'] + ':' + '9080' + '/Tools/cxf/InvokeToolServiceSoap?wsdl';
//var url = 'http://' + appConfig['cache-db'] + '/Tools/cxf/InvokeToolServiceSoap?wsdl';
var url = 'http://192.168.19.114:9080/Tools/cxf/InvokeToolServiceSoap?wsdl';
module.exports = function (req, res) {
	return {
		
		
		"getIpsAddrInfo": function (args, callback) {
			if (_.isFunction(args)) {
				callback = args;
				args = {};
			}
			return jws(url, "getIpsAddrInfo", args, callback, req, res);
		},
		"getTelNumberAddrInfo": function (args, callback) {
			if (_.isFunction(args)) {
				callback = args;
				args = {};
			}
			return jws(url, "getTelNumberAddrInfo", args, callback, req, res);
		},
		url: 'http://192.168.19.114:9080/Tools/cxf/InvokeToolServiceSoap?wsdl'
	}
}
