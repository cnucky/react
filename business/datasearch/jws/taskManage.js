// Generated by method-generator.js. DOT NOT MODIFY!！

var _ = require('underscore');
var path = require('path');
var jws = require(path.join(process.cwd(), 'utils/jws'));
var appConfig = require('../config.js');
var url = 'http://' + appConfig['app-common'] + '/TaskManage/services/TaskManageService?wsdl';

module.exports = function (req, res) {
	return {
		

			"approveNotice": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "approveNotice", args, callback, req, res);
			},
			

			"batchUpdateTask": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "batchUpdateTask", args, callback, req, res);
			},
			

			"deleteBatchTasks": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "deleteBatchTasks", args, callback, req, res);
			},
			

			"fetchTask": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "fetchTask", args, callback, req, res);
			},
			

			"insertTask": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "insertTask", args, callback, req, res);
			},
			

			"insertTasks": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "insertTasks", args, callback, req, res);
			},
			

			"updateTask": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "updateTask", args, callback, req, res);
			},
			

		url: 'http://' + appConfig['app-common'] + '/TaskManage/services/TaskManageService?wsdl'
}
}