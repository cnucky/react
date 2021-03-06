// Generated by method-generator.js. DOT NOT MODIFY!£¡

var _ = require('underscore');
var path = require('path');
var jws = require(path.join(process.cwd(), 'utils/jws'));
var appConfig = require('../config.js');
var url = 'http://' + appConfig['dc-analysis'] + '/CloudTaskCommon/services/TacticsService?wsdl';

module.exports = function (req, res) {
	return {
		

			"addTacticsFavor": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "addTacticsFavor", args, callback, req, res);
			},
			

			"createTacticsType": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "createTacticsType", args, callback, req, res);
			},
			

			"deleteTacticsFavor": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "deleteTacticsFavor", args, callback, req, res);
			},
			

			"deleteTacticsType": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "deleteTacticsType", args, callback, req, res);
			},
			

			"getTactics": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getTactics", args, callback, req, res);
			},
			

			"getTacticsFavorByUser": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getTacticsFavorByUser", args, callback, req, res);
			},
			

			"getTacticsTypes": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getTacticsTypes", args, callback, req, res);
			},
			

			"modifyTacticsTypeName": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "modifyTacticsTypeName", args, callback, req, res);
			},
			

			"offTactics": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "offTactics", args, callback, req, res);
			},
			

			"releaseTactics": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "releaseTactics", args, callback, req, res);
			},
			

		url: 'http://' + appConfig['dc-analysis'] + '/CloudTaskCommon/services/TacticsService?wsdl'
	}

}