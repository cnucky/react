/**
 * Created by root on 10/17/16.
 */

define('dianwei-sms',
    [
        'nova-notify',
        '../../tpl/dianwei/tpl-dianwei-sms',
        '../search-operation-define',
    ],
    function (Notify,
              tpl_sms,
              search_operation_define) {

        var search_operation_dic = search_operation_define.get_search_operation_dic();
        var search_relation_dic = search_operation_define.get_search_relation_dic();

        var sms_tpl = _.template(tpl_sms);

        function init(container_id) {
            $("#" + container_id).html(sms_tpl());

            $("#" + container_id + " [data-i18n]").localize();
        }

        function get_params(params) {
            if (params == null) {
                return;
            }

            var sms_ctrl = $("#dianwei_sms");
            var value = sms_ctrl.val().trim();
            var code = sms_ctrl.attr("code");
            var display = sms_ctrl.attr("display");

            if (value == "") {
                Notify.show({
                    title: i18n.t("datasearch.searchdianwei.notify-title.input-sms-content"),
                    text: "",
                    type: "warning"
                });
                return;
            }

            if (value.length > 20) {
                Notify.show({
                    title: i18n.t("datasearch.searchdianwei.notify-title.sms-content-too-long"),
                    text: "",
                    type: "warning"
                });
                return;
            }

            var value_condition = {
                type: 'relation',
                operation: search_relation_dic.OR.name,
                items: [
                    {
                        "type": "item",
                        "code": code,
                        "title": display,
                        "operation": search_operation_dic.EQ.name,
                        "value": value
                    }
                ]
            };


            params.audit_datas.push({
                Type: "KEYWORD",
                Content: value
            });

            params.search_condition.items.push(value_condition);

            params.detail += display + ":" + value + "; " + i18n.t("datasearch.searchdianwei.param-str.cap-time") + ":" + params.spytime.Begin + "," + params.spytime.End + ";";

            params.task_name = display + ":" + value + "; " + i18n.t("datasearch.searchdianwei.param-str.cap-time") + ":" + params.spytime.Begin + "," + params.spytime.End + ";";

            return params;
        }

        return {
            init: init,
            get_params: get_params
        }
    });