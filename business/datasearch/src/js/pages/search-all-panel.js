initLocales(require.context('../../locales/datasearch/', false, /\.js/));
require([

        '../module/search-all-func',
        '../module/datacenter-range.js',
        '../module/time-range.js',
        '../module/search-service',
        '../module/identity-info',
        'nova-alert',
        'nova-notify',
        'widget/dialog/nova-map-dialog',

        'utility/jquery-validate/jquery.validate.min',
        'utility/jbase64/jbase64'],
    function (Search_all_func,
              datacenter_ran,
              time_ran,
              Service,
              identity_info,
              Alert,
              Notify,
              Dialog
              ) {

        var datacenter_ready = false;
        var datatype_ready = false;
        var carrier_ready = false;

        function ready_load(){
            if(datacenter_ready && datatype_ready && carrier_ready){
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
            },
            carrier_ready_func: function() {
                carrier_ready = true;
                ready_load();
            }
        };

        function init(){
            datacenter_ran.init({
                container: $('#datacenter_range'),
                labelwidth: 2,
                contentwidth: 10
            }, "", search_all_func_callback.datacenter_ready_func);
            time_ran.init({
                container: $('#time_range'),
                labelwidth: 2,
                contentwidth: 10
            });
            time_ran.localize();

            $("#datacenter_range .control-label").css("text-align", "right");
            $("#time_range .control-label").css("text-align", "right");

            Search_all_func.datatype_init(search_all_func_callback.datatype_ready_func);
            Search_all_func.init_carriers(search_all_func_callback.carrier_ready_func);

            $("#btnSearch").click(function () {
                search();
            });

            $("#btn_lacci_search").click(function () {
                search();
            });
        }

        init();

        $("#txtCondition").focus();

        $('#divCategories').delegate('.btn-group li input', 'change', function () {
            var parUl = $(this).parents('ul');
            var liAll = parUl.find('li:first');
            var num1 = $("#divCategories").find('.btn-group li.multiselect-all').length;
            var num2 = $("#divCategories").find('.btn-group li.multiselect-all.active').length;
            if (liAll.hasClass('active')) {
                parUl.prev('button').removeClass('btn-default').removeClass('btn-gradient').addClass('btn-primary');
            } else {
                if (parUl.find('li.active').length == 0) {
                    parUl.prev('button').removeClass('btn-primary').removeClass('btn-gradient').addClass('btn-default');
                } else {
                    parUl.prev('button').removeClass('btn-default').removeClass('btn-primary').addClass('btn-gradient');
                }
            }
            ;
            if (num1 == num2) {
                if ($("#btnProtocolAll").is(':checked')) {
                } else {
                    $("#btnProtocolAll").trigger("click");
                }
            } else {
                if ($("#btnProtocolAll").is(':checked') && $("#btnProtocolAll").hasClass("a")) {
                    $("#btnProtocolAll").removeAttr('checked');
                }
            }
        });

        function search() {
            var search_params = Search_all_func.get_search_params();

            if(search_params == undefined){
                return;
            }

            if ($("li.lacci").hasClass("active"))
            {
                $("#bs_lac_s").val($("#bs_lac_s").val().trim());
                $("#bs_ci_s").val($("#bs_ci_s").val().trim());

                if (!Search_all_func.isInt($("#bs_lac_s").val()) || !Search_all_func.isInt($("#bs_ci_s").val()))
                {
                    Notify.show({
                        title: i18n.t("datasearch.searchall.js.illegal_input"),
                        text: "",
                        type: "warning"
                    });
                    return;
                }

                var laccis = [];
                laccis.push({
                    carrier_code:$("#bs_carrier_s").val(),
                    carrier:$("#bs_carrier_s").find("option:selected").text(),
                    lacci:$("#bs_lac_s").val().trim() + "," + $("#bs_ci_s").val().trim()
                });

                submit_lacci_task(laccis, search_params);
            }
            else
            {
                submit_task('#txtCondition', search_params);
            }
        }

        function submit_task(inputElementId, search_params) {
            var submit_params = Search_all_func.get_submit_params(inputElementId, search_params);

            if(submit_params == undefined){
                return;
            }

            submit_params.open_window = true;
            Service.panel_onekey_submit_task(submit_params, function(task_id){
                //window.open('../dataprocess/data-process.html?taskId=' + BASE64.encoder(task_id + "") + '&taskName=' + BASE64.encoder(submit_params.task_name));

            });
        }

        function submit_lacci_task(laccis, search_params) {
            var submit_params = Search_all_func.get_lacci_submit_params(laccis, search_params);

            if(submit_params == undefined){
                return;
            }

            submit_params.open_window = true;
            Service.panel_onekey_submit_task(submit_params, function(task_id){
                //window.open('../dataprocess/data-process.html?taskId=' + BASE64.encoder(task_id + "") + '&taskName=' + BASE64.encoder(submit_params.task_name));
            });
        }

    });






