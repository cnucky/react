// Generated by method-generator.js. DOT NOT MODIFY!£¡

var _ = require('underscore');
var path = require('path');
var jws = require(path.join(process.cwd(), 'utils/jws'));
var appConfig = require('../config.js');
var url = 'http://' + appConfig['app-common'] + '/CloudUtility/services/AppService?wsdl';

module.exports = function (req, res) {
	return {
		

			"addAppToDesktop": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "addAppToDesktop", args, callback, req, res);
			},
			

			"checkAppNameValid": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "checkAppNameValid", args, callback, req, res);
			},
			

			"delAppFromDesktop": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "delAppFromDesktop", args, callback, req, res);
			},
			

			"getAllApps": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getAllApps", args, callback, req, res);
			},
			

			"getAppDetail": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getAppDetail", args, callback, req, res);
			},
			

			"getAppsByCategory": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getAppsByCategory", args, callback, req, res);
			},
			

			"getAvailableAppImages": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getAvailableAppImages", args, callback, req, res);
			},
			

			"getCategories": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getCategories", args, callback, req, res);
			},
			

			"getDefaultAppInfo": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getDefaultAppInfo", args, callback, req, res);
			},
			

			"saveAppDetail": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "saveAppDetail", args, callback, req, res);
			},
			

			"updateAppDownloads": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "updateAppDownloads", args, callback, req, res);
			},
			

		url: 'http://' + appConfig['app-common'] + '/CloudUtility/services/AppService?wsdl'
	}

}