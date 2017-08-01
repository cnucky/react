var fs = require('fs');
var _ = require('underscore');
var sysConfig = require('../utils/config-system');
var businessList = require('../framework.config');
var __CONF__ = {};

var config = require('../config/config');
__CONF__['config'] = config;

var framework = {};
__CONF__['framework'] = require('../framework/config');

var business = {};
_(businessList).each(function(value, key) {
    business[key] = require('../' + value + '/config');
})
__CONF__['business'] = business;

var config_system = {};
_.each(sysConfig.__proto__, function(value, key) {
    config_system[key] = value();
})
__CONF__['config_system'] = config_system;

var content = 'window.__CONF__ = ' + JSON.stringify(__CONF__, null, 2);

var windowConfigPath = '_build/config-window.js';
if (!fs.existsSync('_build')) {
    fs.mkdirSync('_build');
}
fs.writeFileSync(windowConfigPath, content);
