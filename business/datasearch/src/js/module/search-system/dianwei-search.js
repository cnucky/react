/**
 * Created by panxiao_gs on 2016/7/27.
 */
define('dianwei',
    [
        'nova-notify',
        '../../tpl/tpl-protocol-checkbtn',
        '../../tpl/tpl-form-group',
        '../../tpl/dianwei/tpl-dianwei-search',
        './dianwei-number-search',
        './dianwei-area-search',
        './dianwei-basestation-search',
        './dianwei-sms-search',
        '../datacenter-range.js',
        '../time-range.js',
        '../search-service',
        '../search-operation-define',
        'jquery.datatables',
    ],
    function (Notify,
              protocol_checkbtn,
              form_group,
              tpl_dianwei_search,
              Dianwei_number,
              Dianwei_area,
              Dianwei_basestation,
              Dianwei_sms,
              datacenter_ran,
              time_ran,
              search_service,
              search_operation_define) {

        var search_operation_dic = search_operation_define.get_search_operation_dic();
        var search_relation_dic = search_operation_define.get_search_relation_dic();
        var country_trans = search_service.get_translate("DIC_USER_BELONG_COUNTRY_CODE");
        var area_trans = search_service.get_translate("DIC_PHONE_CITY");

        var protocol_checkbtn_tpl = _.template(protocol_checkbtn);
        var form_group_tpl = _.template(form_group);
        var dianwei_search_tpl = _.template(tpl_dianwei_search);

        var content_id = "dianwei_conditions";

        var PHONE_NUM = "phone_num";
        var AREA_CODE = "area_code";
        var BASE_STATION = "base_station";
        var SMS_CONTENT = "sms_content";
        var Current_Type = PHONE_NUM;

        var types = [
            {
                Name: PHONE_NUM,
                Caption: i18n.t("datasearch.searchdianwei.search-type.number-search")
            },
            {
                Name: AREA_CODE,
                Caption: i18n.t("datasearch.searchdianwei.search-type.area-search")
            },
            {
                Name: BASE_STATION,
                Caption: i18n.t("datasearch.searchdianwei.search-type.bs-search")
            },
            {
                Name: SMS_CONTENT,
                Caption: i18n.t("datasearch.searchdianwei.search-type.sms-search")
            }
        ];

        function content_change(protocol_name) {
            var content_ctrl = $("#" + content_id);
            Current_Type = protocol_name;
            switch (protocol_name) {
                case PHONE_NUM:
                    Dianwei_number.init(content_id);
                    break;
                case AREA_CODE:
                    Dianwei_area.init(content_id, {
                        Country: country_trans,
                        Area: area_trans
                    });
                    break;
                case BASE_STATION:
                    Dianwei_basestation.init(content_id);
                    break;
                case SMS_CONTENT:
                    Dianwei_sms.init(content_id);
                    break;
                default :
                    break;
            }
        }

        function types_change_event() {
            $('.protocol-check-btn').click(function () {
                $('.protocol-check-btn').each(function () {
                    $(this).removeClass('protocol-select');
                });
                $(this).addClass('protocol-select');

                var protocol_name = $(this).attr('protocol_name');

                content_change(protocol_name);
            })
        }

        function get_basic_params() {

            var zkqy = datacenter_ran.getZkqy();
            if (zkqy.length == 0) {
                Notify.show({
                    title: i18n.t("datasearch.searchdianwei.notify-title.choose-datacenter"),
                    text: "",
                    type: "warning"
                });
                return null;
            }

            var search_condition = {
                type: 'relation',
                operation: search_relation_dic.AND.name,
                items: []
            };
            var startTime = time_ran.get_start_time();
            var endTime = time_ran.get_end_time();
            search_condition.items.push({
                "type": "item",
                "code": "CAP_TIME",
                "title": i18n.t("datasearch.searchdianwei.param-str.cap-time") + ":",
                "operation": search_operation_dic.BTW.name,
                "value": [
                    startTime,
                    endTime
                ]
            });
            var spytime = {Begin:startTime,End:endTime};

            //var task_name = i18n.t("datasearch.dianwei-search");
            var task_name = "";
            var task_detail = ""; //i18n.t("datasearch.dianwei-search") + ": "

            return {
                zkqy: zkqy,
                search_condition: search_condition,
                audit_datas: [],
                protocols: ["DATA_CALL", "DATA_SMS", "DATA_FAX", "DATA_EVENT"],
                task_name: task_name,
                search_result_maxnum: datacenter_ran.get_search_result_maxnum(),
                detail: task_detail,
                spytime: spytime
            }
        }

        function phone_num_submit() {
            var params = get_basic_params();
            params = Dianwei_number.get_params(params);
            task_submit(params);
        }

        function area_code_submit() {
            var params = get_basic_params();
            params = Dianwei_area.get_params(params);
            task_submit(params);
        }

        function base_station_submit() {
            var params = get_basic_params();
            params = Dianwei_basestation.get_params(params);
            task_submit(params);
        }

        function sms_content_submit() {
            var params = get_basic_params();
            params = Dianwei_sms.get_params(params);
            task_submit(params);
        }

        function task_submit(submit_params) {
            var dscp_len = 500;
            if(submit_params.detail.length > dscp_len){
                submit_params.detail = submit_params.detail.substring(0, dscp_len) + "...";
            }

            if(submit_params.task_name.length > 50){
                submit_params.task_name = submit_params.task_name.substring(0, 50) + "...";
            }

            submit_params = $.extend(submit_params, {
                event_type_desc: i18n.t("datasearch.special-search")
            });

            submit_params.open_window = false;
            search_service.system_submit_task(submit_params);
        }

        function submint_event() {
            $(document).delegate("#btnSearch", "click", function (e) {
                e.preventDefault();
                switch (Current_Type) {
                    case PHONE_NUM:
                        phone_num_submit();
                        break;
                    case AREA_CODE:
                        area_code_submit();
                        break;
                    case BASE_STATION:
                        base_station_submit();
                        break;
                    case SMS_CONTENT:
                        sms_content_submit();
                        break;
                    default :
                        break;
                }

            })
        }

        function dianwei_type_init() {
            var first_protocol = $('.protocol-check-btn:first');
            first_protocol.addClass('protocol-select');
            content_change(first_protocol.attr('protocol_name'));

            Current_Type = PHONE_NUM;

            types_change_event();
        }

        var datacenter_ready = false;

        function ready_load(){
            if(datacenter_ready){
                hideLoader();
            }
        }

        var search_all_func_callback = {
            datacenter_ready_func: function(){
                datacenter_ready = true;
                ready_load();
            }
        };
        function init(container) {
            var protocol_form_group_param = {
                label: i18n.t("datasearch.searchdianwei.label.search-type") + ':',
                content: protocol_checkbtn_tpl({data: types}),
                labelwidth: 1,
                contentwidth: 11
            };

            var dianwei_param = {
                Types: form_group_tpl(protocol_form_group_param),
                ContentId: content_id
            };

            $(container).append(dianwei_search_tpl(dianwei_param));
            $(container + " [data-i18n]").localize();

            datacenter_ran.init({
                container: $('#datacenter_range')
            }, "remote-dw", search_all_func_callback.datacenter_ready_func);
            time_ran.init({
                container: $('#time_range')
            });

            time_ran.localize();

            dianwei_type_init();

            submint_event();

        }

        return {
            init: init
        }
    });

