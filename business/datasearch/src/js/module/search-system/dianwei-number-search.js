/**
 * Created by root on 10/17/16.
 */

define('dianwei-number',
    [
        'nova-notify',
        '../../tpl/dianwei/tpl-dianwei-num',
        '../search-operation-define',
    ],
    function (Notify,
              tpl_num,
              search_operation_define) {

        var search_operation_dic = search_operation_define.get_search_operation_dic();
        var search_relation_dic = search_operation_define.get_search_relation_dic();

        var num_tpl = _.template(tpl_num);

        function init(container_id) {
            $("#" + container_id).html(num_tpl());
            $("#" + container_id + " [data-i18n]").localize();

            $(".dw-num-type").change(function () {
                var selectedvalue = $("input[name='dw_num_type']:checked").val();
                if (selectedvalue == "NUM") {
                    $("#num_check").show();
                }
                else {
                    $("#num_check").hide();
                }
            });


        }

        function get_audit_type(selectedvalue){
            var audit_type = "";
            switch (selectedvalue){
                case "NUM":
                    audit_type = "MSISDN";
                    break;
                case "USER_IMSI":
                    audit_type = "IMSI";
                    break;
                case "USER_IMEI":
                    audit_type = "IMEI";
                    break;
            }

            return audit_type;
        }

        function get_params(params) {
            if (params == null) {
                return;
            }

            var search_value = $("#batch_input_num").val().trim();
            if(search_value == ""){
                Notify.show({
                    title: i18n.t("datasearch.searchdianwei.notify-title.input-number"),
                    text: "",
                    type: "warning"
                });
                return;
            }

            var search_value_list = search_value.split('\n');

            var select_type = $("input[name='dw_num_type']:checked");
            var selectedvalue = select_type.val();
            var select_display = select_type.attr("display");
            var value_display = "";

            var audit_type = get_audit_type(selectedvalue);

            var value_condition = {
                type: 'relation',
                operation: search_relation_dic.OR.name,
                items: []
            };

            if (selectedvalue == "NUM") {
                var num_check = $("input[name='num-check']:checked");
                if (num_check.length == 0) {
                    Notify.show({
                        title: i18n.t("datasearch.searchdianwei.notify-title.choose-num-side"),
                        text: "",
                        type: "warning"
                    });
                    return;
                }
                else if (num_check.length > 1) {
                    $.each(search_value_list, function () {
                        var value = this.trim();
                        $.each(num_check, function () {
                            value_condition.items.push({
                                "type": "item",
                                "code": $(this).val() + "_" + selectedvalue,
                                "title": $(this).attr("display") + select_display,
                                "operation": search_operation_dic.EQ.name,
                                "value": value
                            });
                        });

                        params.audit_datas.push({
                            Type: audit_type,
                            Content: value
                        });

                        if(value_display == ""){
                            value_display = value;
                        }
                        else{
                            value_display += ',' + value;
                        }
                    });
                    var select_display_tmp = "";
                    $.each(num_check, function () {
                        if(select_display_tmp == ""){
                            select_display_tmp = $(this).attr("display");
                        }
                        else{
                            select_display_tmp += "/" + $(this).attr("display");
                        }
                    });
                    select_display = select_display_tmp + select_display;
                }
                else {
                    $.each(search_value_list, function () {
                        var value = this.trim();
                        value_condition.items.push({
                            "type": "item",
                            "code": num_check.val() + "_" + selectedvalue,
                            "title": num_check.attr("display") + select_display,
                            "operation": search_operation_dic.EQ.name,
                            "value": value
                        });

                        params.audit_datas.push({
                            Type: audit_type,
                            Content: value
                        });

                        if(value_display == ""){
                            value_display = value;
                        }
                        else{
                            value_display += ',' + value;
                        }
                    });
                    select_display = num_check.attr("display") + select_display;
                }

            }
            else {
                $.each(search_value_list, function () {
                    var value = this.trim();
                    value_condition.items.push({
                        "type": "item",
                        "code": selectedvalue,
                        "title": select_display,
                        "operation": search_operation_dic.EQ.name,
                        "value": value
                    });

                    params.audit_datas.push({
                        Type: audit_type,
                        Content: value
                    });

                    if(value_display == ""){
                        value_display = value;
                    }
                    else{
                        value_display += ',' + value;
                    }
                });
            }

            params.search_condition.items.push(value_condition);

            params.detail += select_display + ':' + value_display + "; " + i18n.t("datasearch.searchdianwei.param-str.cap-time") + ":" + params.spytime.Begin + "," + params.spytime.End + ";";

            params.task_name = select_display + ':' + value_display + "; " + i18n.t("datasearch.searchdianwei.param-str.cap-time") + ":" + params.spytime.Begin + "," + params.spytime.End + ";";

            return params;
        }

        return {
            init: init,
            get_params: get_params
        }
    });