// Generated by method-generator.js. DOT NOT MODIFY!£¡

var _ = require('underscore');
var path = require('path');
var jws = require(path.join(process.cwd(), 'utils/jws'));
var appConfig = require('../config.js');
var url = 'http://' + appConfig['dc-analysis'] + '/PicRecogCore/services/FaceRecogCoreService?wsdl';

module.exports = function (req, res) {
	return {
		

			"addFaceRepository": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "addFaceRepository", args, callback, req, res);
			},
			

			"addPicIntoRepository": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "addPicIntoRepository", args, callback, req, res);
			},
			

			"addSinglePicIntoRepository": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "addSinglePicIntoRepository", args, callback, req, res);
			},
			

			"batchGetPersonSummary": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "batchGetPersonSummary", args, callback, req, res);
			},
			

			"checkFaceQuality": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "checkFaceQuality", args, callback, req, res);
			},
			

			"delFaceRepository": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "delFaceRepository", args, callback, req, res);
			},
			

			"deleteFace": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "deleteFace", args, callback, req, res);
			},
			

			"getFaceRecogResult": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getFaceRecogResult", args, callback, req, res);
			},
			

			"getFaceRecogTaskID": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getFaceRecogTaskID", args, callback, req, res);
			},
			

			"getFaceRepository": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getFaceRepository", args, callback, req, res);
			},
			

			"getFailedFace": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getFailedFace", args, callback, req, res);
			},
			

			"getPicUrlFromUri": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getPicUrlFromUri", args, callback, req, res);
			},
			

			"getPicUrlPrefix": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getPicUrlPrefix", args, callback, req, res);
			},
			

			"getSnapCamera": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getSnapCamera", args, callback, req, res);
			},
			

			"getSnapHitSearch": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getSnapHitSearch", args, callback, req, res);
			},
			

			"getSnapRealTimeHit": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "getSnapRealTimeHit", args, callback, req, res);
			},
			

			"searchFaceInRepository": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "searchFaceInRepository", args, callback, req, res);
			},
			

			"updateFace": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "updateFace", args, callback, req, res);
			},
			

			"updateFaceRepository": function (args, callback) {
				if (_.isFunction(args)) {
					callback = args;
					args = {};
				}
				return jws(url, "updateFaceRepository", args, callback, req, res);
			},
			

		url: 'http://' + appConfig['dc-analysis'] + '/PicRecogCore/services/FaceRecogCoreService?wsdl'
	}

}
