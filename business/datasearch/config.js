var _ = require('underscore'),
	config = require('../../config/config'),
	configValue;

configValue = {
	//TODO: 此处添加自定义配置
	exports: [
		{
			name: "search-all-modal",
			url: "/datasearch/search-all-modal.html",
			param: "searchall"
		}
	]
}

_.each(_.keys(config), function(itemKey){
	if(configValue[itemKey] != undefined) return;

	configValue[itemKey] = config[itemKey];
});

module.exports = configValue;