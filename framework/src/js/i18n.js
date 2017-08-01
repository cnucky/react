var i18next = require('i18next');
var jqueryI18next = require('jquery-i18next');
var _ = require('underscore');
var sysConfig = require('config-system');

window.initLocales = function(localesContext){
    if(!window.i18n)
        init(localesContext);
    else
        register(localesContext);
    $(document).localize();
}
window.registerLocales = function(localesContext, ns){
    if(!window.i18n)
        init();
    register(localesContext, ns);
}

function init(localesContext) {
    var language = sysConfig.get_language();
    var locales = {};
    var keys = [];
    if(localesContext){
        locales = localesContext.keys().map(localesContext);
        keys = localesContext.keys().map(function(key){
            return key.substring(key.lastIndexOf('/') + 1,key.lastIndexOf('.'));
        });
        locales = _.map(locales, function(item){
            if(!item['translation']){
                return {
                    "translation":item
                }
            }
            return item;
        })
        locales = _.object(keys, locales);
    }
    // console.log('initLocales>>>', locales);
    window.i18n = i18next.init({
        lng: language,
        fallbackLng: keys[0],
        resources: locales
    }, function() {
        jqueryI18next.init(i18next, $);
        //$(document).localize();
    })
    window.i18n.on('languageChanged', function() {
        $(document).localize();
    })
    if(this.registerLocales){
        this.registerLocales(require.context('../locales/base-frame',false,/\.js/),'base');
    }
}

/*function register(localesContext, ns) {
    if (this.i18n && localesContext) {
        ns = ns || 'translation';
        var locales = localesContext.keys().map(localesContext);
        var keys = localesContext.keys().map(function(key) {
            return key.substring(key.lastIndexOf('/') + 1, key.lastIndexOf('.'))
        });
        locales = _.object(keys, locales);
        _.map(locales, function(locale, lng) {
            this.i18n.addResourceBundle(lng, ns, locale, true);
        })
        console.log(this.i18n);
    }
}*/


function register(localesContext, ns) {
    if (this.i18n && localesContext) {
        ns = ns || 'translation';
        var locales = localesContext.keys().map(localesContext);
        var keys = localesContext.keys().map(function(key) {
            return key.substring(key.lastIndexOf('/') + 1, key.lastIndexOf('.'))
        });
        locales = _.map(locales, function(item){
            if(item['translation'])
                return item['translation'];
            else
                return item;
        })
        locales = _.object(keys, locales);
        _.map(locales, function(locale, lng) {
            this.i18n.addResourceBundle(lng, ns, locale, true);
        })
        // console.log(this.i18n);
    }
}