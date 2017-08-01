/**
 * Created by panxiao on 16-3-31.
 */
initLocales(require.context('../../locales/datasearch/', false, /\.js/));
require([
    '../module/search-operation-define',
    '../module/identity-info',
    '../module/protocol-checkbtn',
    '../module/search-service',
    '../module/search-range',
    '../module/search-validation',
    '../tpl/tpl-condition-group',
    'nova-notify',
    'utility/jquery-validate/jquery.validate.min',
    'utility/jbase64/jbase64'
], function (search_operation_define,
             identity_info,
             protocol_checkbtn,
             Service,
             search_range,
             search_validation,
             condition_group,
             Notify) {

    var search_operation_dic = search_operation_define.get_search_operation_dic();
    var search_relation_dic = search_operation_define.get_search_relation_dic();

    var condition_group_tpl = _.template(condition_group);
    var search_range_content = '<div id="search-range"></div>'
        + '<div id="protocol-group"></div>';

    var condition_group_param = {
        GroupName: i18n.t("datasearch.searchsort.group-name.search-range"),
        Content: search_range_content
    };
    $("#search-range-protocol").append(condition_group_tpl(condition_group_param));

    var datacenter_ready = false;
    var datatype_ready = false;

    function ready_load(){
        if(datacenter_ready && datatype_ready){
            hideLoader();
        }
    }

    var search_all_func_callback = {
        datacenter_ready_func: function(){
            datacenter_ready = true;
            ready_load();
        },
        datatype_ready_func: function() {
            datatype_ready = true;
            ready_load();
        }
    };
    search_range.init(
        {
            container: $('#search-range')
        }, search_all_func_callback.datacenter_ready_func
    );

    protocol_checkbtn.init(
        {
            container: $('#protocol-group')
        }, search_all_func_callback.datatype_ready_func
    );

    //查询
    $(document).delegate("#search_btn", "click", function (e) {
        e.preventDefault();
        if (!search_validation.valid("#search_sort_form")) {
            return;
        }
        search_btn_submit();
    });

    function search_btn_submit() {
        var protocol_name = protocol_checkbtn.get_select_protocol();

        if (protocol_name == '') {

        }

        var zkqy = search_range.getZkqy();
        if (zkqy.length == 0) {
            reportNullDataCenter();
            return;
        }

        var search_datas = protocol_checkbtn.get_search_condition();
        var search_condition = search_datas.search_condition;
        var audit_datas = search_datas.audit_datas;
        if (protocol_checkbtn.is_num_btw_error()) {
            Notify.show({
                title: i18n.t("datasearch.searchsort.notify-title.input-right-num-range"),
                text: "",
                type: "warning"
            });

            return;
        }
        /*if (search_condition.items.length == 0){
         Notify.show({
         title: "请填写查询条件!",
         text: "",
         type: "warning"
         });

         return;
         }*/
        var startTime = search_range.get_start_time();
        var endTime = search_range.get_end_time();
        search_condition.items.push(
            {
                "type": "item",
                "code": "CAP_TIME",
                "title": i18n.t("datasearch.searchsort.param-str.cap-time") + ":",
                "operation": search_operation_dic.BTW.name,
                "value": [
                    startTime,
                    endTime
                ]
            });
        var spytime = {Begin: startTime, End: endTime};

        var protocol_item = protocol_checkbtn.get_select_protocol_value();
        //var task_name = i18n.t("datasearch.sort-search") + ":" + protocol_item.category_name;
        var search_detail = protocol_checkbtn.get_detail();
        var task_name = protocol_item.category_name + ": " + search_detail + " "
            + i18n.t("datasearch.searchsort.param-str.cap-time") + ":" + startTime + "," + endTime + ";";

        if (task_name.length > 50) {
            task_name = task_name.substring(0, 50) + "...";
        }

        var task_detail = protocol_item.category_name + ": " + search_detail + " "
            + i18n.t("datasearch.searchsort.param-str.cap-time") + ":" + startTime + "," + endTime + ";";

        var dscp_len = 500;
        if (task_detail.length > dscp_len) {
            task_detail = task_detail.substring(0, dscp_len) + "...";
        }

        var isfulltext = protocol_checkbtn.is_full_text_search() ? "True" : "False";

        var submit_params = {
            zkqy: zkqy,
            search_condition: search_condition,
            audit_datas: audit_datas,
            protocols: protocol_item.protocols.split(','),
            task_name: task_name,
            search_result_maxnum: search_range.get_search_result_maxnum(),
            detail: task_detail,
            isfulltext: isfulltext,
            spytime: spytime
        };

        submit_params.open_window = true;
        Service.sort_submit_task(submit_params, function (task_id) {
            //window.open('../dataprocess/data-process.html?taskId=' + BASE64.encoder(task_id + "") + '&taskName=' + BASE64.encoder(submit_params.task_name));

        });

    }

    function reportNullDataCenter() {
        Notify.show({
            title: i18n.t("datasearch.searchsort.notify-title.choose-datacenter"),
            text: "",
            type: "warning"
        });
    }

});