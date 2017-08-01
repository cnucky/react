var Config = require('../config/config');

var current_system = Config.systemType;

var system_type = {
    standard:"standard",
    oversea:"oversea"
}

function ConfigSystem() {
};

function _getThemeConfigOf(key) {
    var themeConfig = Config.theme;
    return themeConfig && themeConfig[key];
}


ConfigSystem.prototype.get_current_system = function(){
    return current_system;
};

ConfigSystem.prototype.get_current_language = function(){
    switch(current_system)
    {
        case system_type.oversea:
            return "en_us";
        default :
            return "zh_cn";
    }
};

ConfigSystem.prototype.get_language = function(){
    switch(current_system)
    {
        case system_type.oversea:
            return "en";
        default :
            return "zh";
    }
};

ConfigSystem.prototype.get_exam_flag = function(){
    switch(current_system)
    {
        case system_type.oversea:
            return 0;
        default :
            return 1;       //????
    }
};

ConfigSystem.prototype.ignore_authority = function(){
    switch(current_system)
    {
        case system_type.oversea:
            return true;
        default :
            return false;
    }
};

ConfigSystem.prototype.support_minority_fonts = function(){
    switch(current_system)
    {
        case system_type.oversea:
            return false;
        default :
            return true;
    }
}

ConfigSystem.prototype.support_extract = function(){
    switch(current_system)
    {
        case system_type.oversea:
            return false;
        default :
            return true;
    }
}

ConfigSystem.prototype.load_materialedit = function(){
	switch(current_system){
		case system_type.oversea:
            return false;
		default:
            return true;
	}
}

ConfigSystem.prototype.is_oversea = function(){
    return current_system == system_type.oversea;
}

ConfigSystem.prototype.homeUrl = function() {
    return _getThemeConfigOf('homeUrl') || 'home.html';
}

ConfigSystem.prototype.loginUrl =  function() {
    return _getThemeConfigOf('loginUrl') || '/user/login.html';
}

module.exports = new ConfigSystem();
