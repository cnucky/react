// Generated by method-generator.js. DOT NOT MODIFY!£¡

var _ = require('underscore');
var path = require('path');
var jws = require(path.join(process.cwd(), 'utils/jws'));
var appConfig = require('../config.js');
var url = 'http://' + appConfig['dc-analysis'] + '/CloudPersonCore/services/PersonCoreManagerService?wsdl';

module.exports = function (req, res) {
	return {
		

			"checkImportTask": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "checkImportTask", args, callback, req, res);
			},
			

			"deleteTask": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "deleteTask", args, callback, req, res);
			},
			

			"getBasicProperty": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getBasicProperty", args, callback, req, res);
			},
			

			"getBatchInfo": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getBatchInfo", args, callback, req, res);
			},
			

			"getDataItemInfo": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getDataItemInfo", args, callback, req, res);
			},
			

			"getDataType": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getDataType", args, callback, req, res);
			},
			

			"getDataTypeColDef": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getDataTypeColDef", args, callback, req, res);
			},
			

			"getModelingTaskData": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getModelingTaskData", args, callback, req, res);
			},
			

			"getRecords": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getRecords", args, callback, req, res);
			},
			

			"getTaskDetail": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getTaskDetail", args, callback, req, res);
			},
			

			"getTaskInfo": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getTaskInfo", args, callback, req, res);
			},
			

			"importPreView": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "importPreView", args, callback, req, res);
			},
			

			"searchCodeTable": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "searchCodeTable", args, callback, req, res);
			},
			

			"submitTask": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "submitTask", args, callback, req, res);
			},
			

			"updateTaskState": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "updateTaskState", args, callback, req, res);
			},
			

		url: 'http://' + appConfig['dc-analysis'] + '/CloudPersonCore/services/PersonCoreManagerService?wsdl'
	}

}