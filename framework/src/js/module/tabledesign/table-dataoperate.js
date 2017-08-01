/**
 * Created by root on 10/19/16.
 */
define([
    'nova-notify',
], function (Notify) {
    function saveData(obj, data, callBack) {
        $.post("/spycommon/saveTableDetail", {data: JSON.stringify(data)}, function (rsp) {
            rsp = JSON.parse(rsp);
            if (rsp.code == 0) {
                Notify.show({
                    text: "保存成功！",
                    type: "success"
                });
                if (_.isFunction(callBack)) {
                    callBack(rsp.data.recId);
                }
            } else {
                Notify.show({
                    title: "保存失败",
                    text: rsp.message,
                    type: "error"
                });
            }
        });
    }

    return {
        saveData: saveData,
    }
});