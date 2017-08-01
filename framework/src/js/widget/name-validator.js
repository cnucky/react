var Notify = require('nova-notify');
function validate(name,str) {
    if (name == "" || name == undefined) {
        Notify.show({
            title: str+i18n.t('base:workspace.alert-cannotempty'),
            type: 'warning'
        });
        return false;
    }
    var illegal = /[:*?"'<>|\\\\]+/g.test(name);
    if (illegal) {
        Notify.show({
            title: str+i18n.t('base:workspace.alert-haveillegal'),
            type: 'warning'
        });
        return false;
    }
    return true;
}

function validateforWS(name,str) {
    if (name == "" || name == undefined) {
        Notify.show({
            title: str+i18n.t('base:workspace.alert-cannotempty'),
            type: 'warning'
        });
        return false;
    }
    var illegal = /[*?"'<>|\\\\]+/g.test(name);
    if (illegal) {
        Notify.show({
            title: str+i18n.t('base:workspace.alert-haveillegal'),
            type: 'warning'
        });
        return false;
    }
    return true;
}

module.exports = {
    validate:validate,
    VfWS:validateforWS
}