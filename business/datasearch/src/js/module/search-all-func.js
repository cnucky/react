/**
 * Created by panxiao_gs on 2016/7/12.
 */
registerLocales(require.context('../../locales/datasearch/', false, /\.js/));
define('../module/search-all-modal',
    [
        '../module/search-operation-define',
        'nova-notify',
        'nova-dialog',
        'nova-bootbox-dialog',
        '../tpl/tpl-protocol-checkbtn',
        '../module/search-range',
        '../module/search-validation',
        'utility/jquery-datatables/jquery.datatables.min'
    ],
    function (search_operation_define,
              Notify,
              Dialog,
              bootbox,
              tpl_protocol_checkbtn,
              search_range,
              search_validation) {

        var lacci_inited = false;

        var search_operation_dic = search_operation_define.get_search_operation_dic();
        var search_relation_dic = search_operation_define.get_search_relation_dic();
        var carrier_dic = {};

        function endWith(str, char) {
            if (str == null || str.length == 0 || char == null || char.length == 0 || char.length > str.length) {
                return false;
            }

            if (str.substring(str.length - char.length) == char) {
                return true;
            }
            else {
                return false;
            }
        }

        function startWith(str, char) {
            if (str == null || str.length == 0 || char == null || char.length == 0 || char.length > str.length) {
                return false;
            }

            if (str.substring(0, char.length) == char) {
                return true;
            }
            else {
                return false;
            }
        }


        //协议全选 全不选
        function checkAllProtocols(f) {
            $("#btnProtocolAll").removeClass("a");
            if (f == 1) {
                $("#divCategories").find('.btn-group').each(function () {
                    $(this).addClass("open");
                    if ($(this).find('li.multiselect-all').hasClass('active')) {
                    } else {
                        $(this).find('li.multiselect-all label').trigger("click");
                    }
                    $(this).removeClass("open");
                })
                $("#btnProtocolAll").addClass("a");
            } else if (f == 0) {
                $("#divCategories").find('.btn-group').each(function () {
                    $(this).addClass("open");
                    if ($(this).find('li.multiselect-all').hasClass('active')) {
                        $(this).find('li.multiselect-all label').trigger("click");
                    } else {
                        $(this).find('li.multiselect-all label').trigger("click");
                        $(this).find('li.multiselect-all label').trigger("click");
                    }
                    $(this).removeClass("open");
                })
            }
        }

        //数据类型全选 全不选
        function checkAllCategories(f) {
            var btns = $("#divCategories").find('.protocol-check-btn');

            $("#btnProtocolAll").removeClass("a");
            if (f == 1) {
                $("#divCategories").find('.protocol-check-btn').each(function () {
                    $(this).addClass("btn-primary").addClass("btn-selected");
                })
                $("#btnProtocolAll").addClass("a");
            }
            else if (f == 0) {
                $("#divCategories").find('.protocol-check-btn').each(function () {
                    $(this).removeClass("btn-primary").removeClass("btn-selected");
                })
            }
        }

        function checkIp(line) {
            //不允许条件为空
            if (line == "") {
                return false;
            }

            var result_sections = split_to_sections_by_minus(line);

            if (result_sections.length == 1) {
                result_sections.push("");
            }

            if (result_sections.length != 2) {
                return false;
            }

            return search_validation.isValidIp(result_sections[0], result_sections[1]);
        }

        function checkIps(lines) {
            for (var i = 0; i < lines.length; i++) {
                if (!checkIp(lines[i])) {
                    return false;
                }
            }

            return true;
        }

        function isInt(param) {
            var re = /^[0-9]*[1-9][0-9]*$/;
            return re.test(param);
        }

        function checkMazhis(lines) {
            for (var i = 0; i < lines.length; i++) {
                if (lines[i].length == 0) {
                    return false;
                }
            }

            return true;
        }

        function init_categories(callback) {
            $.getJSON('/datasearch/datasearch/get_datatypes', {data_types: ['DATA', 'FILE']}, function (rsp) {
                var protocols = rsp.data;
                if(protocols.length == 0) {
                    Notify.show({
                        title: i18n.t("datasearch.protocol-checkbtn.message.no-data-type"),
                        text: "",
                        type: "warning"
                    });
                }

                var protocol_checkbtn_tpl = _.template(tpl_protocol_checkbtn);
                $('#divCategories').append(protocol_checkbtn_tpl({data: protocols}));

                $("#divCategories .protocol-check-btn").click(function () {
                    if ($(this).hasClass("btn-primary")) {
                        $(this).removeClass("btn-primary");
                        $(this).removeClass("btn-selected");
                    }
                    else {
                        $(this).addClass("btn-primary");
                        $(this).addClass("btn-selected");
                    }

                    if ($("#divCategories .protocol-check-btn.btn-primary").length == $("#divCategories .protocol-check-btn").length) {
                        if (!$("#btnProtocolAll").is(':checked')) {
                            $("#btnProtocolAll").trigger("click");
                        }
                    }
                    else {
                        $("#btnProtocolAll").removeAttr('checked');
                    }

                    /*if($("#divCategories .protocol-check-btn.btn-primary").length == 0)
                     {
                     $("#btnProtocolAll").removeAttr('checked');
                     }

                     if($("#divCategories .protocol-check-btn.btn-primary").length == $("#divCategories .protocol-check-btn").length)
                     {
                     if (!$("#btnProtocolAll").is(':checked'))
                     {
                     $("#btnProtocolAll").trigger("click");
                     }
                     }*/

                })

                $("#btnProtocolAll").trigger("click");
                $("#panel_categories").hide();

                if(typeof callback === 'function'){
                    callback();
                }
            });
        }

        function report_something_null(title) {
            Notify.show({
                title: title,
                text: "",
                type: "warning"
            });
        }

        function get_search_positions() {
            var search_position = [];
            $('.search-position').each(function () {
                if ($(this).is(':checked')) {
                    search_position.push($(this).attr("search_position"));
                }
            });
            return search_position;
        }

        function get_selected_categories() {
            var selected_btns = $("#divCategories").find(".protocol-check-btn.btn-primary");

            var categories = [];

            _.each(selected_btns, function (btn) {
                categories.push($(btn).attr("protocol_name"));
            });

            return categories;
        }

        function is_noneSplitCondition(line) {
            if (startWith(line, '"') && endWith(line, '"')) {
                return true;
            }
            else {
                return false;
            }
        }

        function add_keyword_conditions(conditions, lines, code, title, audit_datas) {
            if (lines.length == 1) {
                add_and_keyword_conditions(conditions, lines[0], code, title, true, audit_datas);
            }
            else {
                var outterCons =
                {
                    "type": "relation",
                    "operation": search_relation_dic.OR.name,
                    "items": new Array()
                };

                _.each(lines, function (line) {
                    add_and_keyword_conditions(outterCons, line, code, title, false, audit_datas);
                });

                conditions.items.push(outterCons);
            }
        }

        function add_and_keyword_conditions(parent_conditions, line, code, title, singleLine, audit_datas) {
            line = line.trim();

            //分词匹配
            var keywords = line.split(' ');

            if (keywords.length > 1) {
                var outterCons = {
                    "type": "relation",
                    "operation": search_relation_dic.AND.name,
                    "items": new Array()
                };

                _.each(keywords, function (keyword) {
                    if(keyword == ""){
                        return true;
                    }

                    outterCons.items.push({
                        "type": "item",
                        "code": code,
                        "title": title,
                        "operation": search_operation_dic.EQ.name,
                        "value": keyword
                    });

                    audit_datas.push({
                        Type: "KEYWORD",
                        Content: keyword
                    });
                })

                parent_conditions.items.push(outterCons);
            }
            else {
                if (singleLine) {
                    var outterCons = {
                        "type": "relation",
                        "operation": search_relation_dic.AND.name,
                        "items": new Array()
                    };

                    outterCons.items.push({
                        "type": "item",
                        "code": code,
                        "title": title,
                        "operation": search_operation_dic.EQ.name,
                        "value": keywords[0]
                    })

                    audit_datas.push({
                        Type: "KEYWORD",
                        Content: keywords[0]
                    });

                    parent_conditions.items.push(outterCons);
                }
                else {
                    parent_conditions.items.push({
                        "type": "item",
                        "code": code,
                        "title": title,
                        "operation": search_operation_dic.EQ.name,
                        "value": keywords[0]
                    })

                    audit_datas.push({
                        Type: "KEYWORD",
                        Content: keywords[0]
                    });
                }

            }

        }

        function add_url_conditions(conditions, lines, code, title, audit_datas) {
            if (lines.length == 1) {
                var outterCons = {
                    "type": "relation",
                    "operation": search_relation_dic.AND.name,
                    "items": new Array()
                };

                var line = lines[0].trim();

                outterCons.items.push({
                    "type": "item",
                    "code": code,
                    "title": title,
                    "operation": search_operation_dic.EQ.name,
                    "value": line
                });

                audit_datas.push({
                    Type: "URL",
                    Content: line
                });

                conditions.items.push(outterCons);
            }
            else {
                var outterCons = {
                    "type": "relation",
                    "operation": search_relation_dic.OR.name,
                    "items": new Array()
                };

                _.each(lines, function (line) {
                    line = line.trim();

                    outterCons.items.push({
                        "type": "item",
                        "code": code,
                        "title": title,
                        "operation": search_operation_dic.EQ.name,
                        "value": line
                    });

                    audit_datas.push({
                        Type: "URL",
                        Content: line
                    });
                });

                conditions.items.push(outterCons);
            }


        }

        function split_to_sections_by_minus(line) {
            var sections = line.split("-");

            var result_sections = [];
            _.each(sections, function (section) {
                if (section != "") {
                    result_sections.push(section);
                }
            });

            return result_sections;
        }

        function add_lacci_condition(line, array, audit_datas) {
            array.push({
                "type": "item",
                "code": "lacci",
                "title": i18n.t("datasearch.searchall.js.basestation"),
                "operation": search_operation_dic.EQ.name,
                "value": line.lacci
            });

            audit_datas.push({
                Type: "BASESTATION",
                Content: line.lacci
            });

            /*if (line.carrier_code == "-1")
             {
             array.push({
             "type": "item",
             "code": "lacci",
             "title": i18n.t("datasearch.searchall.js.basestation"),
             "operation": search_operation_dic.EQ.name,
             "value": line.lacci
             });
             }
             else
             {
             var andCons = {
             "type": "relation",
             "operation": search_relation_dic.AND.name,
             "items": new Array()
             };
             andCons.items.push({
             "type": "item",
             "code": "lacci",
             "title": i18n.t("datasearch.searchall.js.basestation"),
             "operation": search_operation_dic.EQ.name,
             "value": line.lacci
             });
             andCons.items.push({
             "type": "item",
             "code": "carrier_code",
             "title": i18n.t("datasearch.searchall.js.carrier"),
             "operation": search_operation_dic.EQ.name,
             "value": line.carrier_code
             });

             array.push(andCons);
             }  */
        }

        function add_lacci_conditions(conditions, lines, audit_datas) {
            if (lines.length == 1) {
                var andCons = {
                    "type": "relation",
                    "operation": search_relation_dic.AND.name,
                    "items": new Array()
                };
                conditions.items.push(andCons);
                add_lacci_condition(lines[0], andCons.items, audit_datas);

                /*if (lines[0].carrier_code == "-1") {
                 var andCons = {
                 "type": "relation",
                 "operation": search_relation_dic.AND.name,
                 "items": new Array()
                 };
                 conditions.items.push(andCons);
                 add_lacci_condition(lines[0], andCons.items);
                 }
                 else {
                 add_lacci_condition(lines[0], conditions.items);
                 }*/
            }
            else {
                var orCons = {
                    "type": "relation",
                    "operation": search_relation_dic.OR.name,
                    "items": new Array()
                };

                conditions.items.push(orCons);

                _.each(lines, function (line) {
                    add_lacci_condition(line, orCons.items, audit_datas);
                });
            }
        }

        function add_ip_conditions(conditions, lines, audit_datas) {
            if (lines.length == 1) {
                var andCons = {
                    "type": "relation",
                    "operation": search_relation_dic.AND.name,
                    "items": new Array()
                };
                conditions.items.push(andCons);
                add_ip_condition(lines[0], andCons.items, audit_datas);
            }
            else {
                var orCons = {
                    "type": "relation",
                    "operation": search_relation_dic.OR.name,
                    "items": new Array()
                };

                conditions.items.push(orCons);

                _.each(lines, function (line) {
                    add_ip_condition(line, orCons.items, audit_datas);
                });
            }
        }

        function add_ip_condition(line, array, audit_datas) {
            var result_sections = split_to_sections_by_minus(line);

            if (result_sections.length == 1) {
                array.push({
                    "type": "item",
                    "code": "ip",
                    "title": "IP:",
                    "operation": search_operation_dic.EQ.name,
                    "value": result_sections[0]
                });

                audit_datas.push({
                    Type: "IP",
                    Content: result_sections[0]
                });
            }
            else {
                array.push({
                    "type": "item",
                    "code": "ip",
                    "title": "IP:",
                    "operation": search_operation_dic.BTW.name,
                    "value": [result_sections[0], result_sections[1]]
                });

                audit_datas.push({
                    Type: "IPSEG",
                    Content: [result_sections[0], result_sections[1]].toString()
                });
            }
        }

        function get_search_params() {
            var startTime = search_range.get_start_time();
            var endTime = search_range.get_end_time();
            if (!search_validation.isValidDateRange(startTime, endTime)) {
                report_something_null(i18n.t("datasearch.searchall.js.wrong_time_range"));
                return;
            }

            var zkqy = search_range.getZkqy();
            if (zkqy.length == 0) {
                report_something_null(i18n.t("datasearch.searchall.js.lack_datacenter"));
                return;
            }

            var search_position = get_search_positions();
            if (search_position.length == 0) {
                report_something_null(i18n.t("datasearch.searchall.js.lack_search_position"));
                return;
            }


            var categories = get_selected_categories();
            if (categories.length == 0) {
                report_something_null(i18n.t("datasearch.searchall.js.lack_datatype"));
                return;
            }

            var search_params = {
                categories: categories,
                startTime: startTime,
                endTime: endTime,
                zkqy: zkqy,
                search_position: search_position
            };

            return search_params;
        }

        function get_submit_params(inputElementId, search_params, search_type_param,rlf_invoke) {

            var condition = $(inputElementId).val().trim();
            $(inputElementId).val(condition);

            var lines = condition.split("\n");

            if (lines.length > 1000) {
                Notify.show({
                    title: i18n.t("datasearch.searchall.js.too_many_conditions"),
                    text: i18n.t("datasearch.searchall.js.max_conditions"),
                    type: "warning"
                });
                return;
            }

            var conditions = {
                "type": "relation",
                "operation": search_relation_dic.AND.name,
                "items": []
            };
            var audit_datas = [];

            var task_name_prefix = ""; //i18n.t("datasearch.searchall.js.one_key_search") + ": ";
            var task_name = task_name_prefix;

            if (lines.length > 1) {
                task_name = task_name + i18n.t("datasearch.searchall.js.batch");
            }

            var search_type = "";
            var search_type_name = "";
            if (search_type_param != undefined) {
                search_type = search_type_param.search_type;
                search_type_name = search_type_param.search_type_name;
            }
            else {
                $(".tab_header").each(function () {
                    if ($(this).parent().hasClass("active")) {
                        search_type = $(this).attr("search_type");
                        search_type_name = this.innerText;
                        return false;
                    }
                });
            }

            switch (search_type) {
                case "address":
                    if (!checkMazhis(lines)) {
                        $("#input_error").html(i18n.t("datasearch.searchall.js.wrong_address"));
                        $("#div_error").removeClass("hidden");
                        return;
                    }
                    add_keyword_conditions(conditions, lines, "address", i18n.t("datasearch.searchall.js.address"), audit_datas);
                    break;
                case "url":
                    if (!checkMazhis(lines)) {
                        $("#input_error").html(i18n.t("datasearch.searchall.js.wrong_url"));
                        $("#div_error").removeClass("hidden");
                        return;
                    }
                    add_url_conditions(conditions, lines, "url", "Url:", audit_datas);
                    break;
                case "ip":
                    if (!checkIps(lines)) {
                        $("#input_error").html(i18n.t("datasearch.searchall.js.wrong_ip"));
                        $("#div_error").removeClass("hidden");
                        return;
                    }
                    add_ip_conditions(conditions, lines, audit_datas);
                    break;
                /*case "lacci":
                 if (!checkLaccis(lines)) {
                 $("#input_error").html("请输入合法的LAC,CI值");
                 $("#div_error").removeClass("hidden");
                 return;
                 }
                 add_lacci_conditions(conditions, lines);
                 break;*/
            }

            var task_detail = task_name_prefix
                + search_type_name + ':' + condition.replace(/\n/g, ';') + ";" + " "
                + i18n.t("datasearch.searchall.js.cap_time") + ":" + search_params.startTime + "," + search_params.endTime + ";";

            if (task_detail.length > 500) {
                task_detail = task_detail.substring(0, 500) + "...";
            }

            //task_name += search_type_name + ":" + condition.replace(/\n/g, ';');
            task_name = task_name_prefix
                + search_type_name + ':' + condition.replace(/\n/g, ';') + ";" + " "
                + i18n.t("datasearch.searchall.js.cap_time") + ":" + search_params.startTime + "," + search_params.endTime + ";";

            if (task_name.length > 50) {
                task_name = task_name.substring(0, 50) + "...";
            }

            var spy_time = {
                Begin: search_params.startTime,
                End: search_params.endTime
            };

            $("#div_error").addClass("hidden");

            conditions.items.push(
                {
                    "type": "item",
                    "code": "CAP_TIME",
                    "title": i18n.t("datasearch.searchall.js.cap_time"),
                    "operation": search_operation_dic.BTW.name,
                    "value": [
                        search_params.startTime,
                        search_params.endTime
                    ]
                });

            var submit_params = {
                task_name: task_name,
                onekey_param: {
                    data_scope: {
                        "type": "item",
                        "code": "DATA_SCOPE",
                        "title": i18n.t("datasearch.searchall.js.search_position"),
                        "value": search_params.search_position
                    },
                    search_application_type: {
                        "type": "item",
                        "code": "SEARCH_APPLICATION_TYPE",
                        "title": i18n.t("datasearch.searchall.js.one_key_search_type"),
                        "value": search_type
                    }
                },
                detail: task_detail,
                spytime: spy_time,
                zkqy: search_params.zkqy,
                protocols: search_params.categories,
                search_condition: conditions,
                audit_datas: audit_datas,
                search_result_maxnum: rlf_invoke==undefined? search_range.get_search_result_maxnum():rlf_invoke.maxnum
            };
            console.log('in get params')
            console.log(rlf_invoke)
            console.log(submit_params)

            return submit_params;

        }

        function get_lacci_submit_params(laccis, search_params, search_type_param) {
            if (laccis.length > 1000) {
                Notify.show({
                    title: i18n.t("datasearch.searchall.js.too_many_conditions"),
                    text: i18n.t("datasearch.searchall.js.max_conditions"),
                    type: "warning"
                });
                return;
            }

            var conditions = {
                "type": "relation",
                "operation": search_relation_dic.AND.name,
                "items": []
            };
            var audit_datas = [];

            var task_name_prefix = ""; //i18n.t("datasearch.searchall.js.one_key_search") + ":";
            var task_name = task_name_prefix;

            if (laccis.length > 1) {
                task_name = task_name + i18n.t("datasearch.searchall.js.batch");
            }

            var search_type = "";
            var search_type_name = "";
            if (search_type_param != undefined) {
                search_type = search_type_param.search_type;
                search_type_name = search_type_param.search_type_name;
            }
            else {
                $(".tab_header").each(function () {
                    if ($(this).parent().hasClass("active")) {
                        search_type = $(this).attr("search_type");
                        search_type_name = this.innerText;
                        return false;
                    }
                });
            }

            add_lacci_conditions(conditions, laccis, audit_datas);

            var task_detail = task_name_prefix + search_type_name + ':' + lacci_to_string(laccis) + " "
                + i18n.t("datasearch.searchall.js.cap_time") + ":" + search_params.startTime + "," + search_params.endTime + ";" ;

            if (task_detail.length > 500) {
                task_detail = task_detail.substring(0, 500) + "...";
            }

            //task_name += search_type_name + ":" + lacci_to_string(laccis);
            task_name = task_name_prefix + search_type_name + ':' + lacci_to_string(laccis) + " "
                + i18n.t("datasearch.searchall.js.cap_time") + ":" + search_params.startTime + "," + search_params.endTime + ";" ;

            if (task_name.length > 50) {
                task_name = task_name.substring(0, 50) + "...";
            }

            var spy_time = {
                Begin: search_params.startTime,
                End: search_params.endTime
            };

            $("#div_error").addClass("hidden");

            conditions.items.push(
                {
                    "type": "item",
                    "code": "CAP_TIME",
                    "title": i18n.t("datasearch.searchall.js.cap_time"),
                    "operation": search_operation_dic.BTW.name,
                    "value": [
                        search_params.startTime,
                        search_params.endTime
                    ]
                });

            var submit_params = {
                task_name: task_name,
                onekey_param: {
                    data_scope: {
                        "type": "item",
                        "code": "DATA_SCOPE",
                        "title": i18n.t("datasearch.searchall.js.search_position"),
                        "value": search_params.search_position
                    },
                    search_application_type: {
                        "type": "item",
                        "code": "SEARCH_APPLICATION_TYPE",
                        "title": i18n.t("datasearch.searchall.js.one_key_search_type"),
                        "value": search_type
                    }
                },
                detail: task_detail,
                spytime: spy_time,
                zkqy: search_params.zkqy,
                protocols: search_params.categories,
                search_condition: conditions,
                audit_datas: audit_datas,
                search_result_maxnum: search_range.get_search_result_maxnum()
            };

            return submit_params;

        }

        function lacci_to_string(laccis) {
            var result = "";
            _.each(laccis, function (item) {
                result += item.carrier + "," + item.lacci + ";";
            })

            return result;
        }

        function datatype_init(callback) {
            init_categories(callback);

            $("#radio_all_categories").click(function () {
                if (!$("#btnProtocolAll").is(':checked')) {
                    $("#btnProtocolAll").trigger("click");
                }

                checkAllProtocols(1);
                checkAllCategories(1);
                $("#panel_categories,#checkPa").hide();
            });

            $("#radio_self_categories").click(function () {
                $("#panel_categories,#checkPa").show();
                $("#panel_categories .panel-body").css({"border": "1px solid #e2e2e2", "padding": "15px"});
            });

            $("#btnProtocolAll").change(function () {
                if ($(this).is(':checked')) {
                    checkAllProtocols(1);
                    checkAllCategories(1);
                } else {
                    checkAllProtocols(0);
                    checkAllCategories(0);
                }
            });

            $(".tab_header").click(function () {
                var li = $(this).parent();
                li.addClass('buble-container');
                li.siblings().removeClass('buble-container');

                if (li.hasClass("lacci")) {
                    $("#btn_map").removeClass("hidden");
                    $("#divLacciBatch").removeClass("hidden");
                    $("#divNormalBatch").addClass("hidden");

                    if ($("#btnSingle").hasClass("gray")) {
                        init_lacci();
                    }
                    else {
                        $("#div_lacci_s").removeClass("hidden");
                        $("#div_lacci_s").prev("div").addClass("hidden");
                    }
                }
                else {
                    $("#btn_map").addClass("hidden");
                    $("#divLacciBatch").addClass("hidden");
                    $("#divNormalBatch").removeClass("hidden");

                    $("#div_lacci_s").addClass("hidden");
                    $("#div_lacci_s").prev("div").removeClass("hidden");
                }

                /*if (!li.hasClass("active")) {
                 $("#txtCondition").val("");
                 $("#txtConditions").val("");
                 }*/


                $("#div_error").addClass("hidden");
                if ($("#btnBatch").hasClass("gray")) {
                    $("#txtCondition").attr("placeholder", $(this).attr("tip_s"));
                    $("#txtConditions").attr("placeholder", $(this).attr("tip_s"));
                }
                else {
                    $("#txtCondition").attr("placeholder", $(this).attr("tip_b"));
                    $("#txtConditions").attr("placeholder", $(this).attr("tip_b"));
                }
            });
        }

        function set_lacci_init_status(status) {
            lacci_inited = status;
        }

        function init_lacci(lacci_list) {
            if (!lacci_inited) {
                var datatable = $('#basestation_table').DataTable({
                    'bAutoWidth': false,
                    'paging': false,
                    'info': false,
                    'searching': false,
                    'scrollY': true,
                    //'data': {},
                    //'sDom': '<"top">rt<"bottom"flip><"clear">',
                    'language': {
                        'processing': i18n.t("datasearch.searchall.js.datatable.processing"),
                        'lengthMenu': i18n.t("datasearch.searchall.js.datatable.lengthMenu"),
                        'sZeroRecords': i18n.t("datasearch.searchall.js.datatable.sZeroRecords"),
                        'info': i18n.t("datasearch.searchall.js.datatable.info"),
                        'search': i18n.t("datasearch.searchall.js.datatable.search"),
                        'paginate': {
                            'sFirst': i18n.t("datasearch.searchall.js.datatable.paginate.sFirst"),
                            'previous': i18n.t("datasearch.searchall.js.datatable.paginate.previous"),
                            'next': i18n.t("datasearch.searchall.js.datatable.paginate.next"),
                            'sLast': i18n.t("datasearch.searchall.js.datatable.paginate.sLast")
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
                            width: '60%'
                        },
                        {
                            data: "operate",
                            width: '150px'
                        }
                    ]
                });

                if (lacci_list != undefined && lacci_list.length > 0) {
                    var final_import_data = [];
                    var is_data_error = false;
                    for (var i = 0; i < lacci_list.length; i++) {
                        var line_data = lacci_list[i].trim();
                        var line_data_list = line_data.split(' ');
                        var carrier = line_data_list[0];
                        var carrier_data = get_carrier_by_display(carrier);
                        if (carrier_data == null) {
                            is_data_error = true;
                            continue;
                        }
                        var carrier_code = carrier_data.key;
                        var lacci = line_data_list[1] + ',' + line_data_list[2];

                        if (!isInt(line_data_list[1]) || !isInt(line_data_list[2])) {
                            is_data_error = true;
                            continue;
                        }

                        if (is_lacci_exist(carrier_code, lacci, final_import_data)) {
                            is_data_error = true;
                            continue;
                        }

                        final_import_data.push({
                            carrier: carrier,
                            carrier_code: carrier_code,
                            lacci: lacci,
                            operate: "<a href='#' class='del_lacci'>" + i18n.t("datasearch.searchall.js.delete") + "</a>"
                        });
                    }

                    if (is_data_error) {
                        Notify.show({
                            title: i18n.t("datasearch.searchall.js.import_warning"),
                            text: "",
                            type: "warning"
                        });
                    }

                    $('#basestation_table').DataTable().rows.add(final_import_data).draw();
                }

                $("#add_lacci").click(function () {
                    $("#bs_lac").val($("#bs_lac").val().trim());
                    $("#bs_ci").val($("#bs_ci").val().trim());
                    if ($("#bs_lac").val() == "" || $("#bs_ci").val() == "") {
                        return;
                    }

                    if (!isInt($("#bs_lac").val()) || !isInt($("#bs_ci").val())) {
                        Notify.show({
                            title: i18n.t("datasearch.searchall.js.illegal_input"),
                            text: "",
                            type: "warning"
                        });
                        return;
                    }

                    var carrier_code = $("#bs_carrier").val();
                    var carrier = $("#bs_carrier").find("option:selected").text();
                    var lacci = $("#bs_lac").val() + ',' + $("#bs_ci").val();

                    var datas = datatable.data();
                    if (is_lacci_exist(carrier_code, lacci, datas)) {
                        Notify.show({
                            title: i18n.t("datasearch.searchall.js.basestation_exists"),
                            text: "",
                            type: "warning"
                        });

                        return;
                    }
                    datatable.row.add({
                        carrier: carrier,
                        carrier_code: carrier_code,
                        lacci: lacci,
                        operate: "<a href='#' class='del_lacci' data-i18n='datasearch.searchall.js.delete'></a>"
                    }).draw();

                    $(".del_lacci[data-i18n]").localize();
                });

                $("#import_lacci").click(function () {
                    $("#lacci_file_selector").trigger("click");
                });


                $("#lacci_file_selector").change(function (e) {

                    var files = e.target.files || e.dataTransfer.files;

                    if (files) {
                        var file = files[0];
                        var readerTxt = new FileReader;
                        readerTxt.onload = function (e) {
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

                                if (!isInt(line_data_list[1]) || !isInt(line_data_list[2])) {
                                    is_data_error = true;
                                    continue;
                                }

                                if (is_lacci_exist(carrier_code, lacci, current_data) || is_lacci_exist(carrier_code, lacci, final_import_data)) {
                                    is_data_error = true;
                                    continue;
                                }

                                final_import_data.push({
                                    carrier: carrier,
                                    carrier_code: carrier_code,
                                    lacci: lacci,
                                    operate: "<a href='#' class='del_lacci' data-i18n='datasearch.searchall.js.delete'></a>"
                                });
                            }

                            if (is_data_error) {
                                Notify.show({
                                    title: i18n.t("datasearch.searchall.js.import_warning"),
                                    text: "",
                                    type: "warning"
                                });
                            }

                            $('#basestation_table').DataTable().rows.add(final_import_data).draw();

                            $(".del_lacci[data-i18n]").localize();
                        };
                        readerTxt.readAsText(file, "GBK");

                        $("#lacci_file_selector").val('');
                    }

                });


                $(document).delegate(".del_lacci", "click", function () {
                    datatable.row($(this).parents("tr")).remove().draw();
                });


                lacci_inited = true;
            }

        }

        function init_lacci_1(lacci_list) {
            if (!lacci_inited) {
                var datatable = $('#basestation_table').DataTable({
                    'bAutoWidth': false,
                    'paging': false,
                    'info': false,
                    'searching': false,
                    'scrollY': true,
                    //'data': {},
                    //'sDom': '<"top">rt<"bottom"flip><"clear">',
                    'language': {
                        'processing': i18n.t("datasearch.searchall.js.datatable.processing"),
                        'lengthMenu': i18n.t("datasearch.searchall.js.datatable.lengthMenu"),
                        'sZeroRecords': i18n.t("datasearch.searchall.js.datatable.sZeroRecords"),
                        'info': i18n.t("datasearch.searchall.js.datatable.info"),
                        'search': i18n.t("datasearch.searchall.js.datatable.search"),
                        'paginate': {
                            'sFirst': i18n.t("datasearch.searchall.js.datatable.paginate.sFirst"),
                            'previous': i18n.t("datasearch.searchall.js.datatable.paginate.previous"),
                            'next': i18n.t("datasearch.searchall.js.datatable.paginate.next"),
                            'sLast': i18n.t("datasearch.searchall.js.datatable.paginate.sLast")
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
                            width: '60%'
                        },
                        {
                            data: "operate",
                            width: '150px'
                        }
                    ]
                });

                if (lacci_list != undefined && lacci_list.length > 0) {
                    $('#basestation_table').DataTable().rows.add(lacci_list).draw();
                }

                $("#add_lacci").click(function () {
                    $("#bs_lac").val($("#bs_lac").val().trim());
                    $("#bs_ci").val($("#bs_ci").val().trim());
                    if ($("#bs_lac").val() == "" || $("#bs_ci").val() == "") {
                        return;
                    }

                    if (!isInt($("#bs_lac").val()) || !isInt($("#bs_ci").val())) {
                        Notify.show({
                            title: i18n.t("datasearch.searchall.js.illegal_input"),
                            text: "",
                            type: "warning"
                        });
                        return;
                    }

                    var carrier_code = $("#bs_carrier").val();
                    var carrier = $("#bs_carrier").find("option:selected").text();
                    var lacci = $("#bs_lac").val() + ',' + $("#bs_ci").val();

                    var datas = datatable.data();
                    if (is_lacci_exist(carrier_code, lacci, datas)) {
                        Notify.show({
                            title: i18n.t("datasearch.searchall.js.basestation_exists"),
                            text: "",
                            type: "warning"
                        });

                        return;
                    }
                    datatable.row.add({
                        carrier: carrier,
                        carrier_code: carrier_code,
                        lacci: lacci,
                        operate: "<a href='#' class='del_lacci' data-i18n='datasearch.searchall.js.delete'></a>"
                    }).draw();

                    $(".del_lacci[data-i18n]").localize();
                });

                $("#import_lacci").click(function () {
                    $("#lacci_file_selector").trigger("click");
                });


                $("#lacci_file_selector").change(function (e) {

                    var files = e.target.files || e.dataTransfer.files;

                    if (files) {
                        var file = files[0];
                        var readerTxt = new FileReader;
                        readerTxt.onload = function (e) {
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

                                if (!isInt(line_data_list[1]) || !isInt(line_data_list[2])) {
                                    is_data_error = true;
                                    continue;
                                }

                                if (is_lacci_exist(carrier_code, lacci, current_data) || is_lacci_exist(carrier_code, lacci, final_import_data)) {
                                    is_data_error = true;
                                    continue;
                                }

                                final_import_data.push({
                                    carrier: carrier,
                                    carrier_code: carrier_code,
                                    lacci: lacci,
                                    operate: "<a href='#' class='del_lacci' data-i18n='datasearch.searchall.js.delete'></a>"
                                });
                            }

                            if (is_data_error) {
                                Notify.show({
                                    title: i18n.t("datasearch.searchall.js.import_warning"),
                                    text: "",
                                    type: "warning"
                                });
                            }

                            $('#basestation_table').DataTable().rows.add(final_import_data).draw();

                            $(".del_lacci[data-i18n]").localize();
                        };
                        readerTxt.readAsText(file, "GBK");

                        $("#lacci_file_selector").val('');
                    }

                });


                $(document).delegate(".del_lacci", "click", function () {
                    datatable.row($(this).parents("tr")).remove().draw();
                });


                lacci_inited = true;
            }

        }

        function get_carrier_by_display(display) {
            for (var key in carrier_dic) {
                if (carrier_dic[key].value && carrier_dic[key].value == display) {
                    return carrier_dic[key];
                }
            }
            return null;
        }

        function is_lacci_exist(carrier_code, lacci, datas) {
            for (var i = 0; i < datas.length; i++) {
                if ((lacci == datas[i].lacci) && (carrier_code == datas[i].carrier_code)) {
                    return true;
                }
            }
            return false;
        }

        function init_carriers(callback) {
            $.ajax({
                url: '/datasearch/datasearch/get_carriers',
                type: 'POST',
                async: true,
                data: {},
                dataType: 'json',
                success: function (rsp) {
                    var selectTag1 = document.getElementById("bs_carrier_s");
                    var selectTag2 = document.getElementById("bs_carrier");

                    for (var i = 0; i < rsp.length; i++) {
                        if (selectTag1) {
                            selectTag1.options.add(new Option(rsp[i].value, rsp[i].key));
                        }
                        if (selectTag2) {
                            selectTag2.options.add(new Option(rsp[i].value, rsp[i].key));
                        }

                        carrier_dic[i] = rsp[i];
                    }

                    if (typeof callback === 'function') {
                        callback();
                    }
                }

            });

        }

        function init(search_range_container, callbackobj) {
            search_range.init(
                {
                    container: $(search_range_container)
                }, callbackobj.datacenter_ready_func
            );

            datatype_init(callbackobj.datatype_ready_func);

            init_carriers(callbackobj.carrier_ready_func);
        }

        return {
            init: init,
            isInt: isInt,
            datatype_init: datatype_init,
            init_carriers: init_carriers,
            init_lacci: init_lacci,
            init_lacci_1: init_lacci_1,
            set_lacci_init_status: set_lacci_init_status,
            is_lacci_exist: is_lacci_exist,
            get_lacci_submit_params: get_lacci_submit_params,
            init_categories: init_categories,
            checkAllProtocols: checkAllProtocols,
            checkAllCategories: checkAllCategories,
            checkIp: checkIp,
            checkIps: checkIps,
            checkMazhis: checkMazhis,
            report_something_null: report_something_null,
            get_search_positions: get_search_positions,
            get_selected_categories: get_selected_categories,
            add_keyword_conditions: add_keyword_conditions,
            add_url_conditions: add_url_conditions,
            add_lacci_condition: add_lacci_condition,
            add_lacci_conditions: add_lacci_conditions,
            add_ip_conditions: add_ip_conditions,
            add_ip_condition: add_ip_condition,
            get_search_params: get_search_params,
            get_submit_params: get_submit_params
        }

    }
);