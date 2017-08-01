var _ = require('underscore');
var config = require('../../config/config');
var configValue;

configValue = {
	"wikiSearchIp": "http://95.10.205.243:6505",
	"hasFaceDB": false,
	"pcRequireExternalInfo":false,
	"requireNewDataSource":true
}

_.each(_.keys(config), function(itemKey){
	if(configValue[itemKey] != undefined) return;


	configValue[itemKey] = config[itemKey];
});

module.exports = configValue;
