/**
 * Created by panxiao_gs on 2016/7/25.
 */
registerLocales(require.context('../../locales/datasearch/', false, /\.js/));
define('../module/search-all-panel',
    [
        '../../module/datasearch/search-all-func',
        '../../module/datasearch/datacenter-range.js',
        '../../module/datasearch/time-range.js',
        '../datasearch/search-service',
        '../../dialog/nova-notify',
        '../../dialog/nova-dialog',
        '../../dialog/nova-bootbox-dialog',
        '../../tpl/datasearch/tpl-panel-search-all.html',
        '../../tpl/datasearch/tpl-protocol-checkbtn',
        '../../lib/jbase64.js'
    ],
    function(
        Search_all_func,
        datacenter_ran,
        time_ran,
        Service,
        Notify,
        Dialog,
        bootbox,
        panel_search_all,
        tpl_protocol_checkbtn
    ){

        var panel_search_all_tpl = _.template(panel_search_all);


        function search() {
            var search_params = Search_all_func.get_search_params();

            if(search_params == undefined){
                return;
            }

            submit_task('#txtCondition', search_params);
        }

        function submit_task(inputElementId, search_params) {
            var submit_params = Search_all_func.get_submit_params(inputElementId, search_params);

            if(submit_params == undefined){
                return;
            }

            submit_params.open_window = true;
            Service.onekey_submit_task(submit_params, function (task_id) {
                //window.open('../dataprocess/data-process.html?taskId=' + BASE64.encoder(task_id + "") + '&taskName=' + BASE64.encoder(submit_params.task_name));

            });
        }

        function show(container){
            $(container).html(panel_search_all_tpl());
            $(container + " [data-i18n]").localize();

            datacenter_ran.init({
                container: $('#datacenter_range'),
                labelwidth: 2,
                contentwidth: 10
            }, "");
            time_ran.init({
                container: $('#time_range'),
                labelwidth: 2,
                contentwidth: 10
            });
            time_ran.localize();

            $("#datacenter_range .control-label").css("text-align", "right");
            $("#time_range .control-label").css("text-align", "right");

            Search_all_func.datatype_init();
            Search_all_func.init_carriers();

            $("#btnSearch").click(function () {
                search();
            });

            $("#btn_lacci_search").click(function () {
                search();
            });

        }

        return {
            show:show
        }

    }
);