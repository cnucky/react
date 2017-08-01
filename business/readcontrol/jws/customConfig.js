// Generated by method-generator.js. DOT NOT MODIFY!！
var path = require('path');
var _ = require('underscore');
var jws = require(path.join(process.cwd(), 'utils/jws'));
var appConfig = require('../config.js');
var url = 'http://' + appConfig['app-analysis'] + '/MiddleService/services/CustomConfigService?wsdl';

module.exports = function (req, res) {
	return {
		
		
		"addConfigInfo": function (args, callback) {
			if (_.isFunction(args)) {
				callback = args;
				args = {};
			}
			return jws(url, "addConfigInfo", args, callback, req, res);
		},
		
		
		"delConfigInfo": function (args, callback) {
			if (_.isFunction(args)) {
				callback = args;
				args = {};
			}
			return jws(url, "delConfigInfo", args, callback, req, res);
		},
		
		
		"getConfigInfo": function (args, callback) {
			if (_.isFunction(args)) {
				callback = args;
				args = {};
			}
			return jws(url, "getConfigInfo", args, callback, req, res);
		},
		
		
		"updateConfigInfo": function (args, callback) {
			if (_.isFunction(args)) {
				callback = args;
				args = {};
			}
			return jws(url, "updateConfigInfo", args, callback, req, res);
		},
		

		url: 'http://' + appConfig['app-analysis'] + '/MiddleService/services/CustomConfigService?wsdl'
	}
}
