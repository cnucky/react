// Generated by method-generator.js. DOT NOT MODIFY!£¡

var _ = require('underscore');
var path = require('path');
var jws = require(path.join(process.cwd(), 'utils/jws'));
var appConfig = require('../config.js');
var url = 'http://' + appConfig['dc-analysis'] + '/DataTag_Service/services/DataTagService?wsdl';

module.exports = function (req, res) {
	return {
		

			"addCategary": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "addCategary", args, callback, req, res);
			},
			

			"addDataTag": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "addDataTag", args, callback, req, res);
			},
			

			"createImportTask": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "createImportTask", args, callback, req, res);
			},
			

			"getCategary": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getCategary", args, callback, req, res);
			},
			

			"getEntityType": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getEntityType", args, callback, req, res);
			},
			

			"getFrequentTag": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getFrequentTag", args, callback, req, res);
			},
			

			"getFrequentTagStat": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getFrequentTagStat", args, callback, req, res);
			},
			

			"getImportTaskInfo": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getImportTaskInfo", args, callback, req, res);
			},
			

			"getTagSearchResult": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getTagSearchResult", args, callback, req, res);
			},
			

			"getTagSearchResultCustomed": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getTagSearchResultCustomed", args, callback, req, res);
			},
			

			"getTagTree": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getTagTree", args, callback, req, res);
			},
			

			"getTagValueList": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getTagValueList", args, callback, req, res);
			},
			

			"queryDataTagInfo": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "queryDataTagInfo", args, callback, req, res);
			},
			

			"queryDataTagInfoById": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "queryDataTagInfoById", args, callback, req, res);
			},
			

			"submitPersonSearch": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "submitPersonSearch", args, callback, req, res);
			},
			

			"submitTagSearch": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "submitTagSearch", args, callback, req, res);
			},
			

			"tagSearchResult": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "tagSearchResult", args, callback, req, res);
			},
			

		url: 'http://' + appConfig['dc-analysis'] + '/DataTag_Service/services/DataTagService?wsdl'
	}

}