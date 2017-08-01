// Generated by method-generator.js. DOT NOT MODIFY!£¡

var _ = require('underscore');
var path = require('path');
var jws = require(path.join(process.cwd(), 'utils/jws'));
var appConfig = require('../config.js');
var url = 'http://' + appConfig['dc-analysis'] + '/CloudAlertReport/services/TaskRuleService?wsdl';

module.exports = function (req, res) {
	return {
		

			"getTaskRule": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getTaskRule", args, callback, req, res);
			},
			

			"updateTask": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "updateTask", args, callback, req, res);
			},
			

		url: 'http://' + appConfig['dc-analysis'] + '/CloudAlertReport/services/TaskRuleService?wsdl'
	}

}