var _ = require('underscore');
var config = require('../../config/config');
var configValue;

configValue = {};

_.each(_.keys(config), function(itemKey){
	if(configValue[itemKey] != undefined) return;
	configValue[itemKey] = config[itemKey];
});

module.exports = configValue;