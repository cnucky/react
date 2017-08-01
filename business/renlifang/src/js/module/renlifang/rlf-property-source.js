define("./rlf-property-source", [
    "tpl/rlf/rlf-property-source",
    "nova-dialog",
    "nova-notify",
    "jquery",
    "underscore"
], function(tplSource, Dialog, Notify, $, _) {
    tplSource = _.template(tplSource);

    var propertySource;

    function render(name, sourceValue, sourceArray) {

        Dialog.build({
            title: "原始数据",
            content: "<div id='source-table'> 加载中... </div>",
            hideLeftBtn: true,
            rightBtn: "关闭",
            rightBtnCallback: function(e) {
                e.preventDefault();

                $.magnificPopup.close();
            }
        }).show(function() {
            $.getJSON('/renlifang/personcore/getpropertysource', {
                key: name,
                value: sourceValue,
                source: sourceArray
            }, function(rsp) {
                if (rsp.code != 0) {
                    Notify.show({
                        title: "获取原始数据失败",
                        text: rsp.message,
                        type: "error"
                    })
                }
                propertySource = rsp.data;

                var table = $("#source-table");
                var source;

                table.empty();
                _.each(propertySource, function(item) {
                    source = $(tplSource(item));
                    table.append(source);
                });
            });
        })
    }


    return {
        render: render
    }
});
