initLocales(require.context('../../locales/datasearch/', false, /\.js/));
require([

        '../module/search-all-func',
        '../module/search-service',
        '../module/identity-info',
        'nova-alert',
        'nova-notify',
        'widget/dialog/nova-map-dialog',
        '../../../../giswidget/src/js/module/gis-enclosureManageModule',
        'utility/jquery-validate/jquery.validate.min',
        'utility/jbase64/jbase64'],
    function (Search_all_func,
              Service,
              identity_info,
              Alert,
              Notify,
              Dialog,
              enclosureManage) {

        var Search_Code = "";
        var Search_Code_Name = "";
        var Pickup_Taskid = "";
        var Pickup_Code = "";

        function getUrlParms() {
            var args = new Object();
            var query = location.search.substring(1);
            var pairs = query.split("&");
            for (var i = 0; i < pairs.length; i++) {
                var pos = pairs[i].indexOf('=');
                if (pos == -1)   continue;
                var argname = pairs[i].substring(0, pos);
                var value = pairs[i].substring(pos + 1);
                args[argname] = BASE64.decoder(value);
            }
            return args;
        }

        function url_init(){
            var urlParams = getUrlParms();
            var search_all_param = JSON.parse(urlParams.searchall);

            if(search_all_param.pickup_taskid && search_all_param.pickup_taskid != ""){
                Pickup_Taskid = search_all_param.pickup_taskid;
            }

            Pickup_Code = search_all_param.searchcode;
            switch (Pickup_Code){
                case "PHONE":
                case "ADDRESS":
                case "PHONE_NUM":
                case "IMSI":
                case "IMEI":
                case "ADSL":
                case "KEYWORD":
                case "EML_ADDR":
                case "USER_NAME":
                case "USER_ID":
                case "USER_NUM":
                case "GROUP_ID":
                    Search_Code = "address";
                    $("#txtConditions").val(search_all_param.searchcondition);
                    Search_Code_Name = i18n.t("datasearch.searchall.tab_header.li_address.text");
                    $("#search_code").text(Search_Code_Name + ":");
                    $("#divNormalBatch").show();
                    break;
                case "IP":
                case "MAC":
                    Search_Code = "ip";
                    $("#txtConditions").val(search_all_param.searchcondition);
                    Search_Code_Name = i18n.t("datasearch.searchall.tab_header.li_ip.text");
                    $("#search_code").text(Search_Code_Name + ":");
                    $("#divNormalBatch").show();
                    break;
                case "URL":
                case "HOST":
                case "DOMAIN":
                    Search_Code = "url";
                    $("#txtConditions").val(search_all_param.searchcondition);
                    Search_Code_Name = i18n.t("datasearch.searchall.tab_header.li_url.text");
                    $("#search_code").text(Search_Code_Name + ":");
                    $("#divNormalBatch").show();
                    break;
                case "LAC_CI":
                    Search_Code = "lacci";
                    Search_Code_Name = i18n.t("datasearch.searchall.tab_header.li_lacci.text");
                    $("#search_code").text(Search_Code_Name + ":");
                    $("#divLacciBatch").show();

                    var laccis = search_all_param.searchcondition.split('\n');
                    Search_all_func.init_lacci(laccis);



                    break;

            }

            if(search_all_param.searchcodename && search_all_param.searchcodename != ""){
                Search_Code_Name = search_all_param.searchcodename;
            }

            return;
        }

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
                url_init();
            }
        };


        Search_all_func.init("#search-range", search_all_func_callback);

        $("#btn_import").click(function () {
            $("#file_selector").trigger("click");
        })

        $("#btn_map").click(function () {
            //地图
            Dialog.build({
                title: i18n.t("datasearch.searchall.js.select_basestation"),
                content: enclosureManage.TplContent(),
                width: 800,
                minHeight: 480,
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

        $("#btnSearchb").click(function () {
            search();
        })

        $("#iframe_cancel").click(function(){
            window.parent.IframeDialog.dismiss();
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


        function search() {
            var search_params = Search_all_func.get_search_params();

            if(search_params == undefined){
                return;
            }

            if (Search_Code == "lacci")
            {
                var laccis = $('#basestation_table').DataTable().data();
                submit_lacci_task(laccis, search_params);
            }
            else
            {
                submit_task('#txtConditions', search_params);
            }
        }

        function submit_task(inputElementId, search_params) {
            var search_type = {
                search_type: Search_Code,
                search_type_name: Search_Code_Name
            };
            var submit_params = Search_all_func.get_submit_params(inputElementId, search_params, search_type);

            if(submit_params == undefined){
                return;
            }

            var parent_frame_param = {
                search_code: Search_Code,
                search_code_name: Search_Code_Name,
                pickup_taskid: Pickup_Taskid,
                pickup_code: Pickup_Code
            };

            submit_params.open_window = false;
            Service.modal_onekey_submit_task(submit_params, parent_frame_param, function(task_id){
                //window.open('../dataprocess/data-process.html?taskId=' + BASE64.encoder(task_id + "") + '&taskName=' + BASE64.encoder(submit_params.task_name));
                if(self.frameElement && self.frameElement.tagName == 'IFRAME'){
                    window.parent.IframeDialog.dismiss();
                }

            });
        }

        function submit_lacci_task(laccis, search_params) {
            var search_type = {
                search_type: Search_Code,
                search_type_name: Search_Code_Name
            };
            var submit_params = Search_all_func.get_lacci_submit_params(laccis, search_params, search_type);

            if(submit_params == undefined){
                return;
            }

            var parent_frame_param = {
                search_code: Search_Code,
                search_code_name: Search_Code_Name,
                pickup_taskid: Pickup_Taskid,
                pickup_code: Pickup_Code
            };

            submit_params.open_window = false;
            Service.modal_onekey_submit_task(submit_params, parent_frame_param, function(task_id){
                //window.open('../dataprocess/data-process.html?taskId=' + BASE64.encoder(task_id + "") + '&taskName=' + BASE64.encoder(submit_params.task_name));
                if(self.frameElement && self.frameElement.tagName == 'IFRAME'){
                    window.parent.IframeDialog.dismiss();
                }
            });
        }

    });






