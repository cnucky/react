/**
 * Created by root on 16-7-12.
 */

registerLocales(require.context('../../locales/datasearch/', false, /\.js/));
define('../module/search-all-modal',
    [
        './search-all-func',
        './search-service',
        '../../../../minddiagram/src/js/module/minddiagramExtend',
        // '../circlemenu/circlemenu',
        // '../../utility/gojs/go',
        'nova-notify',
        'nova-dialog',
        'nova-bootbox-dialog',
        'nova-utils',
        '../../../../minddiagram/src/js/tpl/tpl-add-node',
        '../tpl/tpl-modal-search-all',
        '../tpl/tpl-protocol-checkbtn',
        './search-range',
        // '../../../js-components/magnific-popup/jquery.magnific-popup.min'
    ],
    function (Search_all_func,
              Service,
              Minddiagram_extend,
              // CircleMenu,
              // go,
              Notify,
              Dialog,
              bootbox,
              nova_utils,
              add_node,
              modal_search_all,
              tpl_protocol_checkbtn,
              search_range) {
        var search_all_params = {};

        var address_type = {search_type: "address", search_type_name: i18n.t("datasearch.searchall.js.address_type")};
        var url_type = {search_type: "url", search_type_name: i18n.t("datasearch.searchall.js.url_type")};
        var ip_type = {search_type: "ip", search_type_name: i18n.t("datasearch.searchall.js.ip_type")};
        var lacci_type = {search_type: "lacci", search_type_name: i18n.t("datasearch.searchall.js.basestation_type")};

        var search_type_dic = {
            PHONE: address_type,
            ADDRESS: address_type,
            PHONE_NUM: address_type,
            IMSI: address_type,
            IMEI: address_type,
            ADSL: address_type,
            IP: ip_type,
            MAC: ip_type,
            LAC_CI: lacci_type,
            URL: url_type,
            HOST: url_type,
            DOMAIN: url_type,
            KEYWORD: address_type,
            EML_ADDR: address_type,
            USER_NAME: address_type,
            USER_ID: address_type,
            USER_NUM: address_type,
            GROUP_ID: address_type
        };

        var modal_search_all_tpl = _.template(modal_search_all);

        var is_task_show = false;

        function search(callback) {
            var search_params = Search_all_func.get_search_params();

            if (search_params == undefined) {
                return;
            }

            submit_task('#txtConditions', search_params, callback);

        }

        function get_lacici_condition(laccis) {
            var condition = [];
            for(var i = 0; i < laccis.length; i++){
                condition.push(laccis[i]);
            }

            return condition;
        }

        function submit_task(inputElementId, search_params, callback) {
            var search_type = search_type_dic[search_all_params.search_code];

            if (search_all_params.search_code == "LAC_CI") {
                var laccis = $('#basestation_table').DataTable().data();
                var submit_params = Search_all_func.get_lacci_submit_params(laccis, search_params, search_type);
                var condition = get_lacici_condition(laccis);
                var condition_text = submit_params.task_name;
                var condition_detail_text = submit_params.task_name;
            }
            else {
                var submit_params = Search_all_func.get_submit_params(inputElementId, search_params, search_type);
                var condition = $(inputElementId).val().trim();
                var condition_text = submit_params.task_name;
                var condition_detail_text = submit_params.detail;
            }

            if (submit_params == undefined) {
                return;
            }

            submit_params.open_window = false;
            if(is_task_show){
                submit_params.open_window = true;
            }

            Service.onekey_submit_task(submit_params, function (task_id, exam_flag) {
                if (typeof callback === 'function') {
                    var param = {
                        task_id: task_id,
                        condition: condition,
                        condition_text: condition_text,
                        condition_detail_text: condition_detail_text
                    };
                    if(exam_flag != 1){
                        $.magnificPopup.close();
                    }
                    callback(param);
                }

                if(is_task_show){
                    //window.open('../dataprocess/data-process.html?taskId=' + BASE64.encoder(task_id + "") + '&taskName=' + BASE64.encoder(submit_params.task_name));
                }
            });
        }

        $(document).ready(function(){
            nova_utils.dynamicLoadingCss("/datasearch/css/searchAll.css");
        });

        function show(params, pickup_param, obj, _this, istaskshow) {
            if(istaskshow){
                is_task_show = true;
            }
            search_all_params = params;
            search_all_params.search_code_name = search_type_dic[search_all_params.search_code].search_type_name;

            // nova_utils.dynamicLoadingCss("../css/searchAll/searchAll.css");

            Dialog.build({
                title: i18n.t("datasearch.searchall.js.one_key_search"),
                content: modal_search_all_tpl(search_all_params),
                width: 1300,
                minHeight: 600,
                rightBtnCallback: function (e) {
                    e.preventDefault();

                    if (pickup_param == null) {
                        search(function (task_param) {
                            //$.magnificPopup.close();
                            if(obj != undefined && _this != undefined){
                                Minddiagram_extend.minddiagram_submit_event("search-all", i18n.t("datasearch.searchall.js.one_key_search"), "dataprocess/data-process.html", task_param, obj, _this);
                            }
                        });
                    }
                    else {
                        search(function (task_param) {
                            //$.magnificPopup.close();
                            Minddiagram_extend.task_submit_event("search-all", i18n.t("datasearch.searchall.js.one_key_search"), "dataprocess/data-process.html", pickup_param, task_param);
                        });
                    }
                }
            }).show(function () {
                Search_all_func.init("#search-range");
                $(".i18n-localize" + " [data-i18n]").localize();

                if (search_all_params.search_code == "LAC_CI") {
                    Search_all_func.set_lacci_init_status(false);
                    Search_all_func.init_lacci(search_all_params.conditions);
                }

            });


        }

        return {
            show: show
        }

    }
);