/**
 * Created by root on 10/17/16.
 */

define('dianwei-basestation',
    [
        'nova-notify',
        '../../tpl/dianwei/tpl-dianwei-basestation',
        '../search-operation-define',
        'jquery.datatables',
    ],
    function (Notify,
              tpl_basestation,
              search_operation_define) {

        var search_operation_dic = search_operation_define.get_search_operation_dic();
        var search_relation_dic = search_operation_define.get_search_relation_dic();

        var basestation_tpl = _.template(tpl_basestation);

        var carrier_list = [];

        function get_carrier_by_display(display) {

            var carrier = null;
            $.each(carrier_list, function(i){
                if(carrier_list[i].value == display){
                    carrier = carrier_list[i];
                    return false;
                }
            });

            return carrier;
        }

        function is_lacci_exist(carrier_code, lacci, datas){
            for(var i = 0; i< datas.length; i++){
                if((lacci == datas[i].lacci) && (carrier_code == datas[i].carrier_code)){
                    return true;
                }
            }
            return false;
        }

        function init_carriers(){
            $.ajax({
                url: '/datasearch/datasearch/get_carriers',
                type: 'POST',
                async: true,
                data: {},
                dataType: 'json',
                success: function (rsp) {
                    var selectTag = document.getElementById("bs_carrier");

                    for(var i = 0; i < rsp.length; i++){
                        if(selectTag){
                            if(rsp[i].key == "-1") {
                                continue;
                            }
                            selectTag.options.add(new Option(rsp[i].value,rsp[i].key));
                        }

                        carrier_list.push(rsp[i]);
                    }
                }

            });

        }

        function init(container_id) {
            $("#" + container_id).html(basestation_tpl());
            init_carriers();
            $("#" + container_id + " [data-i18n]").localize();

            var datatable = $('#basestation_table').DataTable({
                'bAutoWidth': false,
                'paging': false,
                'info': false,
                'searching': false,
                'scrollY': true,
                //'data': {},
                //'sDom': '<"top">rt<"bottom"flip><"clear">',
                'language': {
                    'processing': i18n.t("datasearch.searchdianwei.datatable.processing"),
                    'lengthMenu': i18n.t("datasearch.searchdianwei.datatable.lengthMenu"),
                    'sZeroRecords': i18n.t("datasearch.searchdianwei.datatable.sZeroRecords"),
                    'info': i18n.t("datasearch.searchdianwei.datatable.info"),
                    'search': i18n.t("datasearch.searchdianwei.datatable.search"),
                    'paginate': {
                        'sFirst': i18n.t("datasearch.searchdianwei.datatable.sFirst"),
                        'previous': i18n.t("datasearch.searchdianwei.datatable.previous"),
                        'next': i18n.t("datasearch.searchdianwei.datatable.next"),
                        'sLast': i18n.t("datasearch.searchdianwei.datatable.sLast")
                    }
                },
                columns: [
                    {
                        data: "carrier",
                        width: '30%'
                    },
                    {
                        data: "carrier_code",
                        visible: false
                    },
                    {
                        data: "lacci",
                        width: '30%'
                    },
                    {
                        data: "switchcode",
                        width: '30%'
                    },
                    {
                        data: "operate",
                        width: '10%'
                    }
                ]
            });

            $("#add_lacci").click(function () {
                if ($("#bs_lac").val() == "" || $("#bs_ci").val() == "") {
                    return;
                }

                var carrier_code = $("#bs_carrier").val();
                var carrier = $("#bs_carrier").find("option:selected").text();
                var lacci = $("#bs_lac").val() + ',' + $("#bs_ci").val();
                var swith = $("#bs_switch").val();

                var datas = datatable.data();
                if (is_lacci_exist(carrier_code, lacci, datas)) {
                    Notify.show({
                        title: i18n.t("datasearch.searchdianwei.notify-title.basestation-already-exist"),
                        text: "",
                        type: "warning"
                    });

                    return;
                }
                datatable.row.add({
                    carrier: carrier,
                    carrier_code: carrier_code,
                    lacci: lacci,
                    switchcode: swith,
                    operate: "<a href='#' class='del_lacci'>" +
                    i18n.t("datasearch.searchdianwei.button.delete") + "</a>"
                }).draw();
            });

            $("#import_lacci").click(function () {
                $("#file_selector").trigger("click");
            });

            $("#file_selector").change(function (e) {

                var files = e.target.files || e.dataTransfer.files;

                if (files) {
                    var reader2 = new FileReader;
                    reader2.onload = function (e) {
                        var current_data = $('#basestation_table').DataTable().data();
                        console.log(current_data);
                        var import_value = this.result;
                        var import_datas = import_value.split('\n');
                        var final_import_data = [];
                        var is_data_error = false;
                        for (var i = 0; i < import_datas.length; i++) {
                            var line_data = import_datas[i].trim();
                            var line_data_list = line_data.split(' ');
                            var carrier = line_data_list[0];
                            var carrier_data = get_carrier_by_display(carrier);
                            if (carrier_data == null) {
                                is_data_error = true;
                                continue;
                            }
                            var carrier_code = carrier_data.key;
                            var lacci = line_data_list[1] + ',' + line_data_list[2];
                            var switchcode = "";
                            if (line_data_list.length == 4) {
                                switchcode = line_data_list[3];
                            }

                            if(is_lacci_exist(carrier_code, lacci, current_data) || is_lacci_exist(carrier_code, lacci, final_import_data)){
                                is_data_error = true;
                                continue;
                            }

                            final_import_data.push({
                                carrier: carrier,
                                carrier_code: carrier_code,
                                lacci: lacci,
                                switchcode: switchcode,
                                operate: "<a href='#' class='del_lacci'>" +
                                i18n.t("datasearch.searchdianwei.button.delete") + "</a>"
                            });


                        }

                        if(is_data_error){
                            Notify.show({
                                title: i18n.t("datasearch.searchdianwei.notify-title.part-data-import-success"),
                                text: "",
                                type: "warning"
                            });
                        }

                        $('#basestation_table').DataTable().rows.add(final_import_data).draw();
                    };
                    reader2.readAsText(files[0]);

                    $("#file_selector").val('');
                }

            });

            $(document).delegate(".del_lacci", "click", function () {
                datatable.row($(this).parents("tr")).remove().draw();
            });
        }

        function get_params(params) {
            if (params == null) {
                return;
            }

            var lacci_data = $("#basestation_table").DataTable().data();

            if(lacci_data.length == 0){
                Notify.show({
                    title: i18n.t("datasearch.searchdianwei.notify-title.input-basestation-info"),
                    text: "",
                    type: "warning"
                });
                return;
            }

            if (lacci_data.length > 1000) {
                Notify.show({
                    title: i18n.t("datasearch.searchdianwei.notify-title.too-much-search-condition"),
                    text: i18n.t("datasearch.searchdianwei.notify-title.cannot-greater-than-1000"),
                    type: "warning"
                });
                return;
            }

            var value_condition = {
                type: 'relation',
                operation: search_relation_dic.OR.name,
                items: []
            };

            var detail = "";
            for (var i = 0; i < lacci_data.length; i++) {

                try{
                    value_condition.items.push({
                            type: 'relation',
                            operation: search_relation_dic.AND.name,
                            items: [{
                                "type": "item",
                                "code": "CARRIER_CODE",
                                "title": i18n.t("datasearch.searchdianwei.param-str.carrier-code"),
                                "operation": search_operation_dic.EQ.name,
                                "value": lacci_data[i]["carrier_code"]
                            }, {
                                "type": "item",
                                "code": "USER_MSC",
                                "title": i18n.t("datasearch.searchdianwei.param-str.user-msc"),
                                "operation": search_operation_dic.EQ.name,
                                "value": lacci_data[i]["switchcode"]
                            }, {
                                "type": "item",
                                "code": "USER_BASE_STATION",
                                "title": i18n.t("datasearch.searchdianwei.param-str.user-bs"),
                                "operation": search_operation_dic.EQ.name,
                                "value": lacci_data[i]["lacci"]
                            }]
                        }
                    );

                    params.audit_datas = params.audit_datas.concat([
                        {
                            Type: "KEYWORD",
                            Content: lacci_data[i]["carrier_code"]
                        },
                        {
                            Type: "BASESTATION",
                            Content: lacci_data[i]["lacci"]
                        }
                    ]);

                    if(lacci_data[i]["switchcode"] != ""){
                        params.audit_datas.push({
                            Type: "KEYWORD",
                            Content: lacci_data[i]["switchcode"]
                        });
                    }

                    if(detail == ""){
                        detail = i18n.t("datasearch.searchdianwei.param-str.bs-info") + ":" + lacci_data[i]["carrier"] + " " + lacci_data[i]["lacci"] + " " + lacci_data[i]["switchcode"];
                    }
                    else{
                        detail += ";" + lacci_data[i]["carrier"] + " " + lacci_data[i]["lacci"] + " " + lacci_data[i]["switchcode"];
                    }

                }
                catch(e){
                    continue;
                }

            }

            params.search_condition.items.push(value_condition);

            params.detail += detail + "; " + i18n.t("datasearch.searchdianwei.param-str.cap-time") + ":" + params.spytime.Begin + "," + params.spytime.End + ";";

            params.task_name = detail + "; " + i18n.t("datasearch.searchdianwei.param-str.cap-time") + ":" + params.spytime.Begin + "," + params.spytime.End + ";";

            return params;
        }

        return {
            init: init,
            get_params: get_params
        }
    });