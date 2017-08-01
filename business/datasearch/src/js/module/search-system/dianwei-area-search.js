/**
 * Created by root on 10/17/16.
 */

define('dianwei-area',
    [
        'nova-notify',
        '../../tpl/dianwei/tpl-dianwei-area',
        '../search-operation-define',
    ],
    function (Notify,
              tpl_area,
              search_operation_define) {

        var search_operation_dic = search_operation_define.get_search_operation_dic();
        var search_relation_dic = search_operation_define.get_search_relation_dic();

        var area_tpl = _.template(tpl_area);

        function init(container_id, tpl_params) {
            $("#" + container_id).html(area_tpl(tpl_params));
            $("#" + container_id + " [data-i18n]").localize();

            $('.dropdown-multi-select').multiselect({
                buttonClass: 'multiselect dropdown-toggle btn btn-default bg-none',
                buttonWidth: '100%',
                selectAllText: i18n.t("datasearch.searchdianwei.dropdown-multi-select-param.select-all-text"),
                nonSelectedText: i18n.t("datasearch.searchdianwei.dropdown-multi-select-param.non-selected-text"),
                nSelectedText: i18n.t("datasearch.searchdianwei.dropdown-multi-select-param.selected-text"),
                allSelectedText: i18n.t("datasearch.searchdianwei.dropdown-multi-select-param.all-selected-text"),
                numberDisplayed: 3,
                maxHeight: 200,
                templates: {
                    ul: '<ul style="width: 100%;" class="multiselect-container dropdown-menu"></ul>',

                }
            });


        }

        function get_value_display(ctrl){
            var display = "";
            ctrl.find("option:selected").each(function(){
                var text = $(this).text();
                if(display == ""){
                    display = text;
                }
                else{
                    display += ',' +text;
                }
            });
            return display;
        }

        function get_params(params) {
            if (params == null) {
                return;
            }

            var user_country_ctrl = $("#user_country");
            var oppo_country_ctrl = $("#oppo_country");
            var user_area_ctrl = $("#user_area");
            var oppo_area_ctrl = $("#oppo_area");

            var user_country_value = user_country_ctrl.val();
            var oppo_country_value = oppo_country_ctrl.val();

            var user_area_value = user_area_ctrl.val();
            var oppo_area_value = oppo_area_ctrl.val();

            if (!(user_country_value || oppo_country_value || user_area_value || oppo_area_value)) {
                Notify.show({
                    title: i18n.t("datasearch.searchdianwei.notify-title.choose-country-or-area"),
                    text: "",
                    type: "warning"
                });
                return;
            }

            if ((user_country_value || oppo_country_value) && (user_area_value || oppo_area_value)) {
                Notify.show({
                    title: i18n.t("datasearch.searchdianwei.notify-title.only-country-or-area"),
                    text: "",
                    type: "warning"
                });
                return;
            }

            var detail = "";

            var value_condition = {
                type: 'relation',
                operation: search_relation_dic.OR.name,
                items: []
            };
            var user_country_code = user_country_ctrl.attr("code");
            var user_country_display = user_country_ctrl.attr("display");
            var oppo_country_code = oppo_country_ctrl.attr("code");
            var oppo_country_display = oppo_country_ctrl.attr("display");
            var user_area_code = user_area_ctrl.attr("code");
            var user_area_display = user_area_ctrl.attr("display");
            var oppo_area_code = oppo_area_ctrl.attr("code");
            var oppo_area_display = oppo_area_ctrl.attr("display");

            var user_country_value_display = get_value_display(user_country_ctrl);
            var oppo_country_value_display = get_value_display(oppo_country_ctrl);
            var user_area_value_display = get_value_display(user_area_ctrl);
            var oppo_area_value_display = get_value_display(oppo_area_ctrl);

            var audit_type = "";
            if (user_country_value || oppo_country_value) {
                audit_type = "INTERNATION";
                if (user_country_value && oppo_country_value) {
                    value_condition.items.push({
                        type: 'relation',
                        operation: search_relation_dic.AND.name,
                        items: [
                            {
                                "type": "item",
                                "code": user_country_code,
                                "title": user_country_display,
                                "operation": search_operation_dic.IN.name,
                                "value": user_country_value.toString()
                            },
                            {
                                "type": "item",
                                "code": oppo_country_code,
                                "title": oppo_country_display,
                                "operation": search_operation_dic.IN.name,
                                "value": oppo_country_value.toString()
                            }
                        ]
                    });

                    detail = user_country_display + ":" + user_country_value_display + ";" +
                        oppo_country_display  + ":" + oppo_country_value_display + ";";

                    params.audit_datas = params.audit_datas.concat([
                        {
                            Type: audit_type,
                            Content: user_country_value.toString()
                        },
                        {
                            Type: audit_type,
                            Content: oppo_country_value.toString()
                        }
                    ]);
                }
                else {
                    if (user_country_value) {
                        value_condition.items.push({
                            "type": "item",
                            "code": user_country_code,
                            "title": user_country_display,
                            "operation": search_operation_dic.IN.name,
                            "value": user_country_value.toString()
                        });
                        detail = user_country_display + ":" + user_country_value_display + ";";

                        params.audit_datas.push({
                            Type: audit_type,
                            Content: user_country_value.toString()
                        });
                    }
                    else {
                        value_condition.items.push({
                            "type": "item",
                            "code": oppo_country_code,
                            "title": oppo_country_display,
                            "operation": search_operation_dic.IN.name,
                            "value": oppo_country_value.toString()
                        });
                        detail = oppo_country_display  + ":" + oppo_country_value_display + ";";

                        params.audit_datas.push({
                            Type: audit_type,
                            Content: oppo_country_value.toString()
                        });
                    }
                }

            }
            else {
                audit_type = "INLAND";
                if (user_area_value && oppo_area_value) {
                    value_condition.items.push({
                        type: 'relation',
                        operation: search_relation_dic.AND.name,
                        items: [
                            {
                                "type": "item",
                                "code": user_area_code,
                                "title": user_area_display,
                                "operation": search_operation_dic.IN.name,
                                "value": user_area_value.toString()
                            },
                            {
                                "type": "item",
                                "code": oppo_area_code,
                                "title": oppo_area_display,
                                "operation": search_operation_dic.IN.name,
                                "value": oppo_area_value.toString()
                            }
                        ]
                    });
                    detail = user_area_display + ":" + user_area_value_display + ";" +
                        oppo_area_display  + ":" + oppo_area_value_display + ";";

                    params.audit_datas = params.audit_datas.concat([
                        {
                            Type: audit_type,
                            Content: user_area_value.toString()
                        },
                        {
                            Type: audit_type,
                            Content: oppo_area_value.toString()
                        }
                    ]);
                } else {
                    if (user_area_value) {
                        value_condition.items.push({
                            "type": "item",
                            "code": user_area_code,
                            "title": user_area_display,
                            "operation": search_operation_dic.IN.name,
                            "value": user_area_value.toString()
                        });
                        detail = user_area_display + ":" + user_area_value_display + ";";

                        params.audit_datas.push({
                            Type: audit_type,
                            Content: user_area_value.toString()
                        });
                    }
                    else {
                        value_condition.items.push({
                            "type": "item",
                            "code": oppo_area_code,
                            "title": oppo_area_display,
                            "operation": search_operation_dic.IN.name,
                            "value": oppo_area_value.toString()
                        });
                        detail = oppo_area_display  + ":" + oppo_area_value_display + ";";

                        params.audit_datas.push({
                            Type: audit_type,
                            Content: oppo_area_value.toString()
                        });
                    }
                }

            }

            params.search_condition.items.push(value_condition);

            params.detail += detail + " " + i18n.t("datasearch.searchdianwei.param-str.cap-time") + ":" + params.spytime.Begin + "," + params.spytime.End + ";";

            params.task_name = detail + " " + i18n.t("datasearch.searchdianwei.param-str.cap-time") + ":" + params.spytime.Begin + "," + params.spytime.End + ";";

            return params;
        }



        return {
            init: init,
            get_params: get_params
        }
    });

