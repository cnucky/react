var through = require('through2');

const PLUGIN_NAME = 'gulp-compile-empty';

module.exports = function () {
	return through.obj(function(file, enc, cb) {
		cb(null, file);
	});
}
