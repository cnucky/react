initLocales(require.context('../../locales/datasearch/', false, /\.js/));
require([

        '../module/search-all-func',
        '../module/search-service',
        '../module/identity-info',
        'nova-alert',
        'nova-notify',
        'widget/dialog/nova-map-dialog',
        '../module/search-validation',
        '../tpl/tpl-category-protocol-select',
        '../tpl/tpl-protocol-checkbtn',
        '../module/search-range',
        '../../../../giswidget/src/js/module/gis-enclosureManageModule',
        'utility/jquery-validate/jquery.validate.min',
        'utility/jbase64/jbase64'],
    function (Search_all_func,
              Service,
              identity_info,
              Alert,
              Notify,
              Dialog,
              search_validation,
              tpl_category_protocol_select,
              tpl_protocol_checkbtn,
              search_range,
              enclosureManage) {

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

        Search_all_func.init("#search-range", search_all_func_callback);

        function getUrlParms() {
            var args = new Object();
            var query = location.search.substring(1);
            var pairs = query.split("&");
            for (var i = 0; i < pairs.length; i++) {
                var pos = pairs[i].indexOf('=');
                if (pos == -1)   continue;
                var argname = pairs[i].substring(0, pos);
                var value = pairs[i].substring(pos + 1);
                args[argname] = BASE64.decoder(value);;
            }
            return args;
        }

        function url_init(){
            var urlParams = getUrlParms();

            if(urlParams.addr){
                $("#txtCondition").val(urlParams.addr);
                return;
            }
            if(urlParams.url){
                $("#txtCondition").val(urlParams.url);
                return;
            }
            if(urlParams.ip){
                $("#txtCondition").val(urlParams.ip);
                return;
            }
            if(urlParams.lacci){
                var lacci_value = urlParams.lacci.split(',');
                $("#bs_lac_s").val(lacci_value[0]);
                $("#bs_ci_s").val(lacci_value[1]);
                return;
            }
        }

        url_init();

        $("#btn_import").click(function () {
            $("#file_selector").trigger("click");
        })

        $("#btn_map").click(function () {
            //地图
            Dialog.build({
                title: i18n.t("datasearch.searchall.js.select_basestation"),
                content: enclosureManage.TplContent(),
                width: 1500,
                minHeight: 800,
                hideLeftBtn: true,
                hideRightBtn: true,
                hideFooter: true
            }).show(function () {
                enclosureManage.SetCallback(function () {
                    var records = enclosureManage.GetLacCiRecords();
                    var current_data = $('#basestation_table').DataTable().data();
                    var final_import_data = [];
                    var is_data_error = false;

                    _.each(records, function (record) {
                        var lacci = record[2] + "," + record[3];
                        var carrier_code = record[0];

                        if(Search_all_func.is_lacci_exist(carrier_code, lacci, current_data) || Search_all_func.is_lacci_exist(carrier_code, lacci, final_import_data)){
                            is_data_error = true;
                            return false;
                        }

                        final_import_data.push({
                            carrier: record[1],
                            carrier_code: carrier_code,
                            lacci: lacci,
                            operate: "<a href='#' class='del_lacci' data-i18n='datasearch.searchall.js.delete'></a>"
                        });
                    });

                    if(is_data_error){
                        Notify.show({
                            title: i18n.t("datasearch.searchall.js.import_warning"),
                            text: "",
                            type: "warning"
                        });
                    }

                    $('#basestation_table').DataTable().rows.add(final_import_data).draw();

                    $(".del_lacci[data-i18n]").localize();
                    /*var laccis = "";
                    _.each(records, function (record) {
                        laccis += record[2] + " " + record[3] + "\n";
                    });

                    $("#txtConditions").val(laccis.trim());*/

                    $.magnificPopup.close();
                });
                enclosureManage.Init();
            });
        })

        $("#file_selector").change(function (e) {

            var files = e.target.files || e.dataTransfer.files;

            if (files)
            {
                var reader2 = new FileReader;
                reader2.onload = function (e) {
                    $("#txtConditions").val(this.result);
                };
                reader2.readAsText(files[0],"GBK");

                $("#file_selector").val('');
            }

        })

        $("#txtCondition").focus();

        $("#btnSearch").click(function () {
            search();
        })

        $("#btnSearchb").click(function () {
            search();
        })

        $("#btn_lacci_search").click(function () {
            search();
        })

        $("#btnBatch").click(function () {
            switchToBatchMode();
            $("#btnSingle").addClass("gray");
            $("#btnBatch").removeClass("gray");
        })

        $("#btnSingle").click(function () {
            switchToSingleMode();
            $("#btnSingle").removeClass("gray");
            $("#btnBatch").addClass("gray");
        })

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



        //初始化业务类型和协议
        //init_categories_and_protocols();

        /*function init_categories_and_protocols(){
         $.getJSON('/search/onekey_search_category_init', {}, function (rsp) {

         var category_tpl = _.template(tpl_category_protocol_select);

         $('#divCategories').append(category_tpl({data: rsp}));

         $('.category-multiselect').each(function () {
         $(this).multiselect({
         includeSelectAllOption: true,
         buttonClass: 'multiselect dropdown-toggle btn btn-default',
         selectAllText: "全选",
         nonSelectedText: $(this).attr("caption"),
         nSelectedText: $(this).attr("caption"),
         allSelectedText: $(this).attr("caption"),
         numberDisplayed: 0,
         templates: {
         button: '<button type="button" style="width: 120px;height:32px;overflow: hidden;" class="btn-xs multiselect dropdown-toggle" data-toggle="dropdown"><span class="multiselect-selected-text " ></span> <b class="caret mv10" ></b></button>',
         ul: '<ul style="overflow-y: scroll; max-height: 200px;" class="multiselect-container dropdown-menu"></ul>',
         filter: '<li class="multiselect-item filter"><div class="input-group"><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span><input class="form-control multiselect-search" type="text"></div></li>',
         filterClearBtn: '<span class="input-group-btn"><button class="btn btn-default multiselect-clear-filter" type="button"><i class="glyphicon glyphicon-remove-circle"></i></button></span>',
         li: '<li><a tabindex="0"><label></label></a></li>',
         divider: '<li class="multiselect-item divider"></li>',
         liGroup: '<li class="multiselect-item multiselect-group"><label></label></li>'
         }
         })
         });

         $.getJSON('/search/get_onekey_datatypes', {}, function (rsp) {
         var protocols = rsp.data;
         tpl_protocol_checkbtn
         });

         /!*var lis = $("#divCategories").find(".btn-group ul li:not(.multiselect-item)");
         _.each(lis,function(li){
         $(li).find("input").attr("disabled","disabled");
         })*!/

         var preW = $("#panel_categories").width() - 36;
         var liNum = 2 * Math.floor(preW / 120);
         var leftSpace = preW % 120;
         if (leftSpace / liNum < 10) {
         $("#divCategories .pull-left,#checkPa").css('margin', '5px ' + (preW - (liNum - 2) * 60) / (liNum - 2) + 'px');
         } else {
         $("#divCategories .pull-left,#checkPa").css('margin', '5px ' + leftSpace / liNum + 'px');
         }
         ;
         $("#btnProtocolAll").trigger("click");
         $("#panel_categories").hide();
         })

         }*/


        /*function get_protocols()
         {
         var selected_lis = $("#divCategories").find(".btn-group ul li.active:not(.multiselect-item)");

         var checkboxes = selected_lis.find("a label input");

         var protocols = [];

         _.each(checkboxes, function (checkbox) {
         protocols.push($(checkbox).attr("value"));
         });

         return protocols;
         }
         */



        function search() {
            var search_params = Search_all_func.get_search_params();

            if(search_params == undefined){
                return;
            }

            if ($("#btnBatch").hasClass("gray")) {
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
            else {
                if ($("li.lacci").hasClass("active"))
                {
                    var laccis = $('#basestation_table').DataTable().data();
                    submit_lacci_task(laccis, search_params);
                }
                else
                {
                    submit_task('#txtConditions', search_params);
                }
            }
        }

        function switchToSingleMode() {
            $("#input_single").removeClass("hidden");
            $("#input_batch").addClass("hidden");
            $("#btnSearchb").addClass("hidden");
            $("#div_error").addClass("hidden");
            $(".tab_header").each(function () {
                if ($(this).parent().hasClass("active")) {
                    $("#txtCondition").attr("placeholder", $(this).attr("tip_s"));
                    $("#txtConditions").attr("placeholder", $(this).attr("tip_s"));
                    return false;
                }
            })

            if ($("li.lacci").hasClass("active"))
            {
                $("#div_lacci_s").removeClass("hidden");
                $("#div_lacci_s").prev("div").addClass("hidden");
            }
        }

        function switchToBatchMode() {
            $("#input_single").addClass("hidden");
            $("#input_batch").removeClass("hidden");
            $("#btnSearchb").removeClass("hidden");
            $("#div_error").addClass("hidden");
            $(".tab_header").each(function () {
                if ($(this).parent().hasClass("active")) {
                    $("#txtCondition").attr("placeholder", $(this).attr("tip_b"));
                    $("#txtConditions").attr("placeholder", $(this).attr("tip_b"));
                    return false;
                }
            })

            if ($("li.lacci").hasClass("active"))
            {
                Search_all_func.init_lacci();
            }
        }


        function submit_task(inputElementId, search_params) {
            var submit_params = Search_all_func.get_submit_params(inputElementId, search_params);

            if(submit_params == undefined){
                return;
            }

            submit_params.open_window = true;
            Service.onekey_submit_task(submit_params, function(task_id){
                //window.open('../dataprocess/data-process.html?taskId=' + BASE64.encoder(task_id + "") + '&taskName=' + BASE64.encoder(submit_params.task_name));
                if(window.parent != undefined){
                    window.parent.$.magnificPopup.close();
                }

            });
        }

        function submit_lacci_task(laccis, search_params) {
            var submit_params = Search_all_func.get_lacci_submit_params(laccis, search_params);

            if(submit_params == undefined){
                return;
            }

            submit_params.open_window = true;
            Service.onekey_submit_task(submit_params, function(task_id){
                //window.open('../dataprocess/data-process.html?taskId=' + BASE64.encoder(task_id + "") + '&taskName=' + BASE64.encoder(submit_params.task_name));

            });
        }

    });




