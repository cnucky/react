var through = require('through2');
var gutil = require('gulp-util');

const PLUGIN_NAME = 'gulp-compile-template';

function encode(html) {
	return html.replace(/"/g, '\\"')
		.replace(/\r/g, '\\r')
		.replace(/\n/g, '\\n');
}

module.exports = through.obj(function(file, enc, cb) {
	var content = file.contents.toString();
	var result = 'define(function () { return "' + encode(content) + '"; });';
	file.contents = new Buffer(result);
	file.path = gutil.replaceExtension(file.path, '.js');
	cb(null, file);
});