// Generated by method-generator.js. DOT NOT MODIFY!！
var path = require('path');
var _ = require('underscore');
var jws = require(path.join(process.cwd(), 'utils/jws'));
var appConfig = require('../config.js');
var url = 'http://' + appConfig['cache-db'] + '/BusinessDataAccessor/services/BusinessDataAccessor?wsdl';
var cachedbServerIp = appConfig['cache-db'].split(':')[0];

module.exports = function (req, res) {
	return {

		"countCache": function (args, callback) {
			if (_.isFunction(args)) {
				callback = args;
				args = {};
			}
			var myUrl = url.replace(cachedbServerIp, args.serverIp);
			return jws(myUrl, "countCache", args, callback, req, res);
		},

		"countGroup": function (args, callback) {
			if (_.isFunction(args)) {
				callback = args;
				args = {};
			}
			return jws(url, "countGroup", args, callback, req, res);
		},

		"countTotal": function (args, callback) {
			if (_.isFunction(args)) {
				callback = args;
				args = {};
			}
			return jws(url, "countTotal", args, callback, req, res);
		},

		"extract": function (args, callback) {
			if (_.isFunction(args)) {
				callback = args;
				args = {};
			}
			//var myUrl = url.replace(appConfig['cache-db'],args.serverIp);
			//return jws(myUrl, "extract", args, callback, req, res);
			return jws(url, "extract", args, callback, req, res);
		},

		"getMergeFileNames": function (args, callback) {
			if (_.isFunction(args)) {
				callback = args;
				args = {};
			}
			var myUrl = url.replace(cachedbServerIp, args.serverIp);
			return jws(myUrl, "getMergeFileNames", args, callback, req, res);
		},

		"getResults": function (args, callback) {
			if (_.isFunction(args)) {
				callback = args;
				args = {};
			}
			var myUrl = url.replace(cachedbServerIp, args.serverIp);
			return jws(myUrl, "getResults", args, callback, req, res);
		},

		"noteRecords": function (args, callback) {
			if (_.isFunction(args)) {
				callback = args;
				args = {};
			}
			var myUrl = url.replace(cachedbServerIp, args.serverIp);
			return jws(myUrl, "noteRecords", args, callback, req, res);
		},

		"queryResults": function (args, callback) {
			if (_.isFunction(args)) {
				callback = args;
				args = {};
			}
			if (args.serverIp)
			{
				var myUrl = url.replace(cachedbServerIp, args.serverIp);
				return jws(myUrl, "queryResults", args, callback, req, res);
			}
			else
			{
				return jws(url, "queryResults", args, callback, req, res);
			}
		},

		"entityCountCache": function (args, callback) {
			if (_.isFunction(args)) {
				callback = args;
				args = {};
			}
			return jws(url, "entityCountCache", args, callback, req, res);
		},

		"entityCountTotal": function (args, callback) {
			if (_.isFunction(args)) {
				callback = args;
				args = {};
			}
			return jws(url, "entityCountTotal", args, callback, req, res);
		},

		"entityGetResult": function (args, callback) {
			if (_.isFunction(args)) {
				callback = args;
				args = {};
			}
			return jws(url, "entityGetResult", args, callback, req, res);
		},

		"entityQueryResult": function (args, callback) {
			if (_.isFunction(args)) {
				callback = args;
				args = {};
			}
			return jws(url, "entityQueryResult", args, callback, req, res);
		},

		url: 'http://' + appConfig['cache-db'] + '/BusinessDataAccessor/services/BusinessDataAccessor?wsdl'
	}
}