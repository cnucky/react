// Generated by method-generator.js. DOT NOT MODIFY!£¡

var _ = require('underscore');
var path = require('path');
var jws = require(path.join(process.cwd(), 'utils/jws'));
var appConfig = require('../config.js');
var url = 'http://' + appConfig['dc-analysis'] + '/CloudGraphAnalysis/services/RelationGraphService?wsdl';

module.exports = function (req, res) {
	return {
		

			"createGraphAnalysis": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "createGraphAnalysis", args, callback, req, res);
			},
			

			"deleteSnapshot": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "deleteSnapshot", args, callback, req, res);
			},
			

			"deleteTask": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "deleteTask", args, callback, req, res);
			},
			

			"editSnapshot": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "editSnapshot", args, callback, req, res);
			},
			

			"editTask": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "editTask", args, callback, req, res);
			},
			

			"getAllNodeExtendMenu": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getAllNodeExtendMenu", args, callback, req, res);
			},
			

			"getAllNodeType": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getAllNodeType", args, callback, req, res);
			},
			

			"getGATaskList": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getGATaskList", args, callback, req, res);
			},
			

			"getLinkDetail": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getLinkDetail", args, callback, req, res);
			},
			

			"getNodeDetail": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getNodeDetail", args, callback, req, res);
			},
			

			"getSnapshotList": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getSnapshotList", args, callback, req, res);
			},
			

			"nodeExpand": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "nodeExpand", args, callback, req, res);
			},
			

			"nodeExpandAll": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "nodeExpandAll", args, callback, req, res);
			},
			

			"queryNode": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "queryNode", args, callback, req, res);
			},
			

			"saveSnapshot": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "saveSnapshot", args, callback, req, res);
			},
			

			"testGetData": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "testGetData", args, callback, req, res);
			},
			

		url: 'http://' + appConfig['dc-analysis'] + '/CloudGraphAnalysis/services/RelationGraphService?wsdl'
	}

}