var Notify = require('nova-notify');
function validate(name,str) {
    if (name == "" || name == undefined) {
        Notify.show({
            title: str+"不能为空",
            type: 'warning'
        });
        return false;
    }
    var illegal = /[:*?"'<>|\\\\]+/g.test(name);
    if (illegal) {
        Notify.show({
            title: str+"包含非法字符",
            type: 'warning'
        });
        return false;
    }
    return true;
}

module.exports = {
	validate:validate
}