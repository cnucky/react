var through = require('through2');
var gutil = require('gulp-util');
var fs = require('fs');
var Path = require('path');
var colors = require('colors');
var _ = require('underscore');

// 替换main-layout中的占位符
const PLUGIN_NAME = 'gulp-compile-shim';

var webRoot = process.cwd() + '/framework/src/html/';

module.exports = function(opts) {
	var callback = _.isFunction(opts) ? opts : (opts.callback || function () {});
    return through.obj(function(file, enc, cb) {
        var isHtml = /\.html?$/.test(Path.extname(file.path));
        if (!isHtml || !file || !file.contents) {
            cb(null, file);
            return;
        }

        var content = file.contents.toString();
        if (content.substring(0, 10).match(/<!--\s*shim\s*/)) {
        	var path = 'framework/src/html/' + Path.relative(webRoot, file.path);
        	callback(path);
            var tpl = fs.readFileSync(webRoot + '/index.html').toString();
            tpl = _.template(tpl);
            var data = shim(content);
            file.contents = new Buffer(tpl(data));
            cb(null, file);
        } else {
            cb(null, file);
        }
    });
};

function shim(content) {
    var comps = content.split(/<!--\s*end shim\s*-->/);
    // console.log(comps);
    var data = {
        styles: '',
        toolbar: '',
        content: ''
    };
    comps.forEach(function(comp) {
        var matches = comp.match(/<!--\s*shim\s+([^\s]+)\s*-->/);
        if (matches) {
            var type = matches[1];
            if (type == 'styles') {
                data.styles = removeShimTag(comp);
            }
            if (type == 'toolbar') {
                data.toolbar = removeShimTag(comp);
            }
        } else {
            data.content += removeShimTag(comp);
        }
    });
    return data;
}

function removeShimTag(text) {
    return text.replace(/<!--\s*shim.*?-->/g, '').trim();
}
