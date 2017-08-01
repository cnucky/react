// Generated by method-generator.js. DOT NOT MODIFY!£¡

var _ = require('underscore');
var path = require('path');
var jws = require(path.join(process.cwd(), 'utils/jws'));
var appConfig = require('../config.js');
var url = 'http://' + appConfig['app-common'] + '/ConfigManage/services/ConfigManageService?wsdl';

module.exports = function (req, res) {
	return {
		

			"checkConfigExist": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "checkConfigExist", args, callback, req, res);
			},
			

			"checkConfigFormat": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "checkConfigFormat", args, callback, req, res);
			},
			

			"deleteConfigFile": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "deleteConfigFile", args, callback, req, res);
			},
			

			"getConfigContent": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getConfigContent", args, callback, req, res);
			},
			

			"getConfigList": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getConfigList", args, callback, req, res);
			},
			

			"getFileMD5": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getFileMD5", args, callback, req, res);
			},
			

			"uploadConfigFile": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "uploadConfigFile", args, callback, req, res);
			},
			

		url: 'http://' + appConfig['app-common'] + '/ConfigManage/services/ConfigManageService?wsdl'
	}

}