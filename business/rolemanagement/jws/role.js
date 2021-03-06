// Generated by method-generator.js. DOT NOT MODIFY!£¡

var _ = require('underscore');
var path = require('path');
var jws = require(path.join(process.cwd(), 'utils/jws'));
var appConfig = require('../config.js');
var url = 'http://' + appConfig['app-common'] + '/CloudAuthorization/services/CloudAuthorizationService?wsdl';

module.exports = function (req, res) {
	return {
		

			"InitRealm": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "InitRealm", args, callback, req, res);
			},
			

			"addResourceToRole": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "addResourceToRole", args, callback, req, res);
			},
			

			"addTableRuleResourceToRole": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "addTableRuleResourceToRole", args, callback, req, res);
			},
			

			"checkPermissions": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "checkPermissions", args, callback, req, res);
			},
			

			"createRole": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "createRole", args, callback, req, res);
			},
			

			"deleteRole": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "deleteRole", args, callback, req, res);
			},
			

			"depriveRole": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "depriveRole", args, callback, req, res);
			},
			

			"findPermissions": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "findPermissions", args, callback, req, res);
			},
			

			"findRoles": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "findRoles", args, callback, req, res);
			},
			

			"getAllSystemCenters": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getAllSystemCenters", args, callback, req, res);
			},
			

			"getAuthableResourceByUserId": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getAuthableResourceByUserId", args, callback, req, res);
			},
			

			"getFunctionGroup": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getFunctionGroup", args, callback, req, res);
			},
			

			"getFunctionInfoByPageName": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getFunctionInfoByPageName", args, callback, req, res);
			},
			

			"getHasRoleTypeUsers": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getHasRoleTypeUsers", args, callback, req, res);
			},
			

			"getResourceByRoleId": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getResourceByRoleId", args, callback, req, res);
			},
			

			"getResourceDetail": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getResourceDetail", args, callback, req, res);
			},
			

			"getRoleSummary": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getRoleSummary", args, callback, req, res);
			},
			

			"getRoles": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getRoles", args, callback, req, res);
			},
			

			"getRolesDetail": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getRolesDetail", args, callback, req, res);
			},
			

			"getTableRuleResourceByRoleId": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getTableRuleResourceByRoleId", args, callback, req, res);
			},
			

			"getUsersOfRole": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getUsersOfRole", args, callback, req, res);
			},
			

			"grantRole": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "grantRole", args, callback, req, res);
			},
			

			"queryRole": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "queryRole", args, callback, req, res);
			},
			

			"queryUsersRole": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "queryUsersRole", args, callback, req, res);
			},
			

			"removeResourceFromRole": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "removeResourceFromRole", args, callback, req, res);
			},
			

			"removeTableRuleResourceFromRole": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "removeTableRuleResourceFromRole", args, callback, req, res);
			},
			

			"updateRole": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "updateRole", args, callback, req, res);
			},
			

			"updateRoleSummary": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "updateRoleSummary", args, callback, req, res);
			},
			

		url: 'http://' + appConfig['app-common'] + '/CloudAuthorization/services/CloudAuthorizationService?wsdl'
	}

}