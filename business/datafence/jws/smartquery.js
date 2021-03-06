// Generated by method-generator.js. DOT NOT MODIFY!£¡

var _ = require('underscore');
var path = require('path');
var jws = require(path.join(process.cwd(), 'utils/jws'));
var appConfig = require('../config.js');
var url = 'http://' + appConfig['dc-analysis'] + '/CloudTaskCommon/services/IntelligentQueryService?wsdl';

module.exports = function (req, res) {
	return {
		

			"delStatisticPattern": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "delStatisticPattern", args, callback, req, res);
			},
			

			"deleteCustomQueryModel": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "deleteCustomQueryModel", args, callback, req, res);
			},
			

			"getAggregateFunc": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getAggregateFunc", args, callback, req, res);
			},
			

			"getCustomQueryModel": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getCustomQueryModel", args, callback, req, res);
			},
			

			"getDataTypeColDef": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getDataTypeColDef", args, callback, req, res);
			},
			

			"getDataTypeQueryConfig": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getDataTypeQueryConfig", args, callback, req, res);
			},
			

			"getGisDataType": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getGisDataType", args, callback, req, res);
			},
			

			"getStatisticPatternById": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getStatisticPatternById", args, callback, req, res);
			},
			

			"getStatisticResult": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getStatisticResult", args, callback, req, res);
			},
			

			"saveCustomQueryModel": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "saveCustomQueryModel", args, callback, req, res);
			},
			

			"saveStatisticPattern": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "saveStatisticPattern", args, callback, req, res);
			},
			

			"updateStatisticPattern": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "updateStatisticPattern", args, callback, req, res);
			},
			

		url: 'http://' + appConfig['dc-analysis'] + '/CloudTaskCommon/services/IntelligentQueryService?wsdl'
	}

}