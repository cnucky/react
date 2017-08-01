var path = require('path');
var fs = require('fs');
var config = require('../utils/config-system');
var i18next = require('i18next');
var _ = require('underscore');
var frameworkConfig = require('../framework.config');

function init() {
    var locales = {};
    var language = config.get_language();
    var res = {translation:{}};
    var folder = path.join(process.cwd(), 'framework/route/locales', language);
    try {
        if (fs.statSync(folder).isDirectory()) {
            fs.readdirSync(folder).forEach(function(file) {
                if (file.match(/\.js$/) || file.match(/\.json$/)) {
                    var filename = path.parse(file).name;
                    res.translation[filename] = require(path.join(folder, file));
                }
            })
            _.each(frameworkConfig, function(item, name) {
                var dir = path.join(process.cwd(), item, 'route/locales',language);
                fs.existsSync(dir) && fs.statSync(dir).isDirectory() && fs.readdirSync(dir).forEach(function(file) {
                    if (file.match(/\.js$/) || file.match(/\.json$/)) {
                        var filename = path.parse(file).name;
                        res.translation[filename] = require(path.join(dir, file));
                    }
                })
            })
        }
    } catch (e) { console.log(e) }
    locales[language] = res;
    return i18next.init({
        lng: config.get_language(),
        fallbackLng: 'zh',
        resources: locales
    })
}

module.exports = function() {
    init();
    return function(req, res, next) {
        req.i18n = i18next;
        next();
    }
}
