initLocales(require.context('../../locales/datasearch/', false, /\.js/));
require(
    [
        '../module/search-operation-define',
        '../module/identity-info',
        '../module/search-service',
        '../../../../giswidget/src/js/module/gis-LatLngRangeModule',
        'nova-alert',
        'nova-notify',
        'nova-map-dialog',
        'jquery',
        'underscore',
        '../module/search-range',
        '../module/search-validation',
        '../tpl/tpl-office-meta-search',
        '../tpl/tpl-photo-meta-search',
        '../tpl/tpl-md5-search',
        'widget/md5-hash',
        'utility/jbase64/jbase64'

    ],
    function (search_operation_define,
              identity_info,
              Service,
              LatLngRange,
              Alert,
              Notify,
              Dialog,
              $,
              _,
              search_range,
              search_validation, tpl_office, tpl_photo, tpl_md5, md5_hash) {

        var search_operation_dic = search_operation_define.get_search_operation_dic();
        var search_relation_dic = search_operation_define.get_search_relation_dic();

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
        search_range.init(
            {
                container: $('#search-range')
            }, search_all_func_callback.datacenter_ready_func
        );

        $.ajax({
            url: "/datasearch/datasearch/get_datatypes",
            type: 'POST',
            async: true,
            data: {data_types: ["FILE"]},
            dataType: 'json',
            success: function (rsp) {
                if (rsp.code == 0) {
                    var datatypes = rsp.data;
                    if(dataTypes.length == 0) {
                        Notify.show({
                            title: i18n.t("datasearch.protocol-checkbtn.message.no-data-type"),
                            text: "",
                            type: "warning"
                        });
                    }

                    var inited = false;
                    $(".tab_header.file_type").each(function () {
                        if (has_Authority(datatypes, $(this).attr("protocol"))) {
                            $(this).removeClass("hidden");

                            if (!inited) {
                                var template = _.template(getTemplate($(this).attr("template")));
                                search_validation.init("#form-search-file", search_btn_submit);
                                add_validation_rules();

                                $('#tab-pane').append(template());
                                $("#tab-pane [data-i18n]").localize();

                                inited = true;
                            }
                        }
                    });

                    hideLoader();
                }
                else {
                    Notify.show({
                        title: i18n.t("datasearch.searchfile.message.not_authorized"),
                        text: rsp.message,
                        type: "error"
                    });

                    hideLoader();
                }
            }
        });


        $(".tab_header").click(function () {
            $('#tab-pane').empty();

            var template = _.template(getTemplate($(this).attr("template")));

            $('#tab-pane').append(template());

            $("#tab-pane [data-i18n]").localize();

            add_validation_rules();

            if ($("#mapbutton")) {
                $("#mapbutton").click(function () {
                    Dialog.build({
                        title: i18n.t("datasearch.searchfile.title.coordinate_position"),
                        content: LatLngRange.TplContent(),
                        width: 1500,
                        minHeight: 800,
                        hideLeftBtn: true,
                        hideRightBtn: true,
                        hideFooter: true
                    }).show(function () {
                        LatLngRange.SetCallback(function () {
                            var xyRange = LatLngRange.GetXYRange();
                            $("#LongitudeFrom").val(xyRange.xmin);
                            $("#LongitudeTo").val(xyRange.xmax);
                            $("#LatitudeFrom").val(xyRange.ymin);
                            $("#LatitudeTo").val(xyRange.ymax);
                            $.magnificPopup.close();
                        });
                        LatLngRange.Init();
                    });
                });
            }

            if ($("#btn_file_md5")) {
                $("#btn_file_md5").click(function (e) {
                    e.preventDefault();
                    $("#md5_file_selector").trigger("click");
                });

                $("#md5_file_selector").change(function (e) {
                    var files = e.target.files || e.dataTransfer.files;

                    if (files) {
                        md5_hash.ParseFile(files[0], hashmd5_callback);
                        $("#md5_file_selector").val('');
                    }
                })
            }

            if ($("#btn_file_import")) {
                $("#btn_file_import").click(function (e) {
                    e.preventDefault();
                    $("#import_file_selector").trigger("click");
                });

                $("#import_file_selector").change(function (e) {
                    var files = e.target.files || e.dataTransfer.files;

                    if (files) {
                        var reader2 = new FileReader;
                        reader2.onload = function (e) {
                            $("#txtmd5").val(this.result);
                        };
                        reader2.readAsText(files[0]);
                        $("#import_file_selector").val('');
                    }


                })
            }

        });

        $('input.search-input-ip').bind("change", function (event) {
            $(this).parent().parent().next(".nj-error").remove();
        });

        //切换查询类型
        $('ul.tray-nav > li > a').on('click', function (e) {
            e.preventDefault();

            //切换左侧标签
            $(this).parents('.tray-nav').children('li').removeClass('active');
            $(this).parent('li').addClass('active');

            //切换右侧内容
            $('.tab-content').children('.tab-pane').removeClass('active');

            var btnHref = $(this).attr('href');
            $(btnHref).addClass('active');
        });

        function has_Authority(dataTypes, theDataType) {
            var dt = _.find(dataTypes, function (dataType) {
                return dataType.Name == theDataType;
            });

            return dt != undefined;
        }

        function getTemplate(name) {
            switch (name) {
                case "tpl_office":
                    return tpl_office;
                case "tpl_photo":
                    return tpl_photo;
                case "tpl_md5":
                    return tpl_md5;
                default :
                    return null;
            }
        }

        function add_validation_rules() {
            var input_elements = new Array();
            input_elements.push({
                id: "clientIpFrom",
                name: "clientIpFrom",
                rule: "ip"
            });
            input_elements.push({
                id: "clientIpTo",
                name: "clientIpTo",
                rule: "ip"
            });
            input_elements.push({
                id: "serverIpFrom",
                name: "serverIpFrom",
                rule: "ip"
            });
            input_elements.push({
                id: "serverIpTo",
                name: "serverIpTo",
                rule: "ip"
            });

            search_validation.add_rules(input_elements);
        }

        function hashmd5_callback(md5) {
            var txt = $('#txtmd5').val().trim();
            if (txt.length > 0) {
                txt += "\n";
            }
            txt += md5;

            $('#txtmd5').val(txt);
        }

        function file_conditions_to_string(prefix, conditions) {
            var cons = prefix;

            _.each(conditions.items, function (condition) {
                switch (condition.operation) {
                    case search_operation_dic.EQ.name:
                        cons += condition.title + condition.value + ";";
                        break;
                    case search_operation_dic.BTW.name:
                        cons += condition.title + condition.value[0] + "," + condition.value[1] + ";";
                        break;

                }
            });

            return cons;
        }

        function search_btn_submit() {
            var search_result_maxnum = search_range.get_search_result_maxnum();

            var zkqy = search_range.getZkqy();
            if (zkqy.length == 0) {
                report_something_null(i18n.t("datasearch.searchfile.message.lack_datacenter"));
                return;
            }

            var startTime = search_range.get_start_time();
            var endTime = search_range.get_end_time();
            if (!search_validation.isValidDateRange(startTime, endTime)) {
                report_something_null(i18n.t("datasearch.searchfile.message.wrong_time_range"));
                return;
            }

            var conditions = {
                "type": "relation",
                "operation": search_relation_dic.AND.name,
                "items": new Array()
            };
            var audit_datas = [];

            $('.search-condition-textrange').each(function () {
                var title = $(this).parent().parent().prev()[0].innerText;
                var condition_item = $(this).attr('condition_item');

                var condition_from = $(this).find('.search-condition-textrange-from');
                var condition_from_value = condition_from.val();

                var condition_to = $(this).find('.search-condition-textrange-to');
                var condition_to_value = condition_to.val();

                var condition_param_list = new Array();
                if (!(condition_from_value == null || condition_from_value == undefined || condition_from_value == '')) {
                    condition_param_list.push(condition_from_value);
                }
                if (!(condition_to_value == null || condition_to_value == undefined || condition_to_value == '')) {
                    condition_param_list.push(condition_to_value);
                }

                if (condition_param_list.length == 0) {
                    return true;
                }

                var relation_item;

                if (condition_param_list.length == 1) {
                    relation_item = get_relation_item(title, condition_item, condition_param_list, search_operation_dic.EQ.name, audit_datas);
                }

                if (condition_param_list.length == 2) {
                    relation_item = get_relation_item(title, condition_item, condition_param_list, search_operation_dic.BTW.name, audit_datas);
                }

                conditions.items.push(relation_item);

            });

            $(".search-condition-tuderange").each(function () {
                var title = $(this).attr('title');//$(this).parent().parent().prev()[0].innerText;
                var condition_item = $(this).attr('condition_item');

                var condition_from = $(this).find('.search-condition-textrange-from');
                var condition_from_value = condition_from.val();

                var condition_to = $(this).find('.search-condition-textrange-to');
                var condition_to_value = condition_to.val();

                var condition_param_list = new Array();
                if (!(condition_from_value == null || condition_from_value == undefined || condition_from_value == '')) {
                    condition_param_list.push(condition_from_value);
                }
                if (!(condition_to_value == null || condition_to_value == undefined || condition_to_value == '')) {
                    condition_param_list.push(condition_to_value);
                }

                if (condition_param_list.length == 0) {
                    return true;
                }

                var relation_item;

                if (condition_param_list.length == 1) {
                    relation_item = get_relation_item(title, condition_item, condition_param_list, search_operation_dic.EQ.name, audit_datas);
                }

                if (condition_param_list.length == 2) {
                    relation_item = get_relation_item(title, condition_item, condition_param_list, search_operation_dic.BTW.name, audit_datas);
                }

                conditions.items.push(relation_item);
            });

            $('.search-condition-text').each(function () {
                addCondition(conditions.items, $(this), audit_datas);
            });

            $('.search-condition-text-batch').each(function () {
                addCondition(conditions.items, $(this), audit_datas);
            });

            /*if (conditions.items.length == 0) {
             report_something_null("请输入查询条件");
             return;
             }*/

            var activeTab = getActiveTab();
            var prefix = $(activeTab)[0].innerText + ":";

            //var task_name = file_conditions_to_string(prefix, conditions);
            var task_name = prefix + file_conditions_to_string("", conditions) + " "
                + i18n.t("datasearch.searchfile.text.cap_time") + startTime + "," + endTime + ";";

            var task_detail = prefix + file_conditions_to_string("", conditions) + " "
                + i18n.t("datasearch.searchfile.text.cap_time") + startTime + "," + endTime + ";";

            var spy_time = {
                Begin: startTime,
                End: endTime
            };

            if (task_name.length > 50) {
                task_name = task_name.substring(0, 50) + "...";
            }

            if (task_detail.length > 500) {
                task_detail = task_detail.substring(0, 500) + "...";
            }

            conditions.items.push(
                {
                    "type": "item",
                    "code": "CAP_TIME",
                    "title": i18n.t("datasearch.searchfile.text.cap_time"),
                    "operation": search_operation_dic.BTW.name,
                    "value": [
                        startTime,
                        endTime
                    ]
                });

            var submit_params = {
                task_name: task_name,
                zkqy: zkqy,
                detail: task_detail,
                spytime: spy_time,
                protocols: [getProtocols()],
                search_condition: conditions,
                audit_datas: audit_datas,
                search_result_maxnum: search_result_maxnum
            };

            submit_params.open_window = true;
            Service.file_submit_task(submit_params, function (task_id) {
                //window.open('../dataprocess/data-process.html?taskId=' + BASE64.encoder(task_id + "") + '&taskName=' + BASE64.encoder(submit_params.task_name));

            });
        }

        function get_relation_item(title, condition_item, condition_param_list, operation, audit_datas) {
            var relation_item = {};

            var condition_item_list = condition_item.split(',');
            if (condition_item_list.length > 1) {
                relation_item = {
                    type: 'relation',
                    operation: search_relation_dic.OR.name,
                    items: []
                };

                $.each(condition_item_list, function (i) {
                    var or_relation_item = {
                        type: 'item',
                        code: condition_item_list[i],
                        title: title,
                        operation: operation,
                        value: condition_param_list
                    };

                    relation_item.items.push(or_relation_item);

                    if (i == 0) {
                        audit_datas.push({
                            Type: "KEYWORD",
                            Content: condition_param_list.toString()
                        });

                    }
                });


            }
            else if (condition_item_list.length == 1) {
                relation_item = {
                    type: 'item',
                    code: condition_item_list[0],
                    title: title,
                    operation: operation,
                    value: condition_param_list
                };

                audit_datas.push({
                    Type: "KEYWORD",
                    Content: condition_param_list.toString()
                });
            }

            return relation_item;
        }

        function getProtocols() {
            var activeTab = getActiveTab();
            if (activeTab != null) {
                return $(activeTab).attr("protocol");
            }

            return null;
        }

        function getActiveTab() {
            var activeTab = null;
            $(".tab_header").each(function () {

                if ($(this).parent().hasClass("active")) {
                    activeTab = this;
                    return false;
                }
            })

            return activeTab;
        }

        function addCondition(conditions, jqueryelement, audit_datas) {
            jqueryelement.val(jqueryelement.val().trim());

            var code = jqueryelement.attr("condition_item");
            var title = jqueryelement.parent().parent().prev()[0].innerText;

            //经纬度条件要分别提供title
            switch (code) {
                case "Longitude":
                    title = i18n.t("datasearch.searchfile.title.longitude");
                    break;
                case "Latitude":
                    title = i18n.t("datasearch.searchfile.title.latitude");
                    break;
                default :
                    break;
            }

            var value = jqueryelement.val().toString();

            var lines = value.split("\n");
            var validConditions = [];
            _.each(lines, function (line) {
                line = line.trim();
                if (line != "") {
                    validConditions.push(line);
                }
            });

            if (jqueryelement.attr("supportBatch") && validConditions.length > 1) {
                var subConditions = {
                    "type": "relation",
                    "operation": search_relation_dic.OR.name,
                    "items": new Array()
                };

                _.each(validConditions, function (validCondition) {
                    subConditions.items.push({
                        "type": "item",
                        "code": code,
                        "title": title,
                        "operation": search_operation_dic.EQ.name,
                        "value": validCondition
                    });

                    audit_datas.push({
                        Type: "KEYWORD",
                        Content: validCondition
                    });
                });

                conditions.push(subConditions);
            }
            else if (jqueryelement.val() != "") {
                conditions.push({
                    "type": "item",
                    "code": code,
                    "title": title,
                    "operation": search_operation_dic.EQ.name,
                    "value": value
                });

                audit_datas.push({
                    Type: "KEYWORD",
                    Content: value
                });
            }
        }

        function report_something_null(title) {
            Notify.show({
                title: title,
                text: "",
                type: "warning"
            });
        }

    });