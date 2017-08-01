var through = require('through2');
var gutil = require('gulp-util');
var fs = require('fs');
var Path = require('path');
var colors = require('colors');

// 替换main-layout中的占位符
const PLUGIN_NAME = 'gulp-compile-placeholder';

module.exports = function(data) {
		var webRoot = process.cwd() + '/framework/src/html/';

  	return through.obj(function(file, enc, cb) {
				var relativePath = Path.relative(Path.dirname(file.path), webRoot) || '';
				data = data || {};
				data.root = data.root || '';
                data.ctxRoot = data.ctxRoot || relativePath;
				data.entryRoot = data.entryRoot || relativePath;

        var isHtml = /\.html?$/.test(Path.extname(file.path));
        if (!isHtml) {
            cb(null, file);
            return;
        }

        var content = file.contents.toString();
        content = content.replace(/\$\{\s*([^\s]+?)\s*\}/g, function($0, $1) {
            return data[$1];
        })

        file.contents = new Buffer(content);
        cb(null, file);
    });
}
