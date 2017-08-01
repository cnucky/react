// Generated by method-generator.js. DOT NOT MODIFY!£¡

var _ = require('underscore');
var path = require('path');
var jws = require(path.join(process.cwd(), 'utils/jws'));
var appConfig = require('../config.js');
var url = 'http://' + appConfig['app-common'] + '/CloudUserManagement/services/LoginService?wsdl';

module.exports = function (req, res) {
	return {
		

			"getTicketGrantingTicket": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getTicketGrantingTicket", args, callback, req, res);
			},
			

			"getUserIdByName": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getUserIdByName", args, callback, req, res);
			},
			

			"loginVerify": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "loginVerify", args, callback, req, res);
			},
			

			"removeTickGrantingTicket": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "removeTickGrantingTicket", args, callback, req, res);
			},
			

		url: 'http://' + appConfig['app-common'] + '/CloudUserManagement/services/LoginService?wsdl'
	}

}