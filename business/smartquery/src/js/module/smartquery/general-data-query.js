define('./general-data-query', [
    '../../tpl/smartquery/general-data-query',
    '../../tpl/smartquery/tpl-sq-group',
    '../../tpl/smartquery/tpl-sq-string',
    '../../tpl/smartquery/tpl-sq-number',
    '../../tpl/smartquery/tpl-sq-codetable',
    '../../tpl/smartquery/tpl-sq-date',
    '../../tpl/smartquery/tpl-sq-datetime',
    '../../widget/operator',
    './tpl-sq-datetimepicker',
    'nova-dialog',
    'nova-notify',
    'udp-file-util',
    './toolbar',
    './smartQueryHelper',
    '../../../../../readcontrol/src/js/pages/jqx-binding',
    'underscore',
    './grid-localization',
    '../../../../../datafence/src/js/module/datafence/gis-module',
    'jquery',
    'jquery.validate',
    'tagsinput',
], function(tpl, tpl_group, tpl_string, tpl_number, tpl_codetable, tpl_date, tpl_datetime,
    operator_map, datetimepicker, Dialog, Notify, udpFileUtil, toolbar, queryHelper, jqxBinding, _, localization, gismodule) {



    var _opts;
    tpl = _.template(tpl);
    tpl_group = _.template(tpl_group);
    tpl_string = _.template(tpl_string);
    tpl_number = _.template(tpl_number);
    tpl_codetable = _.template(tpl_codetable);
    tpl_date = _.template(tpl_date);
    tpl_datetime = _.template(tpl_datetime);

    var fieldName = "field-name";
    var tagsinputPrefix = "tagsinput";
    var codetablePrefix = "codetable";
    var stringOprPrefix = "string-opr";
    var intOprPrefix = "int-opr";
    var divSuffix = "_div";
    var oprSuffix = "_opr";
    var taskID = 0;
    var fieldMap = {};
    var operator = operator_map.SMARTQUERY_OPR_MAP;

    function init(opts) {
        _opts = opts;
        $(window).on("resize", function() {
            $('#gridContainer').height(queryHelper.calGridHeight());
            $("#dataGrid").jqxGrid('height', queryHelper.calGridHeight());
            $('#dataGrid').jqxGrid('refresh');
        });
    }

    function renderGeneralDataQuery() {
        $(_opts.container).empty().append(tpl());
        toolbar.init({
            container: $('#panel-menu'),
            typeId: _opts.datatype,
            queryArg: constructQueryArg,
            modelId: _opts.modelId,
            gismodule: gismodule,
            submit: true,
            saveTask: true,
            saveModel: true,
            saveAsModel: true,
            exportData: true,
            download: true,
            statistic: true,
            filter: true,
            group: true,
            locate: true,
            tab: true,

        });
        toolbar.renderToolbar();

        getFieldDefine();

        var initOpt = {};
        initOpt.dialog = Dialog;
        initOpt.notify = Notify;
        initOpt.queryArg = constructQueryArg;
        initOpt.udpFileUtil = udpFileUtil;
        initOpt.localization = localization.getLocalization;

        initOpt.showInput = showInput;
        initOpt.jqxBinding = jqxBinding;

        queryHelper.init(initOpt);
    }

    function showInput(Data) {
        var reg = new RegExp("-", "g");
        var start = "";
        var end = "";
        _.each(Data, function(cond) {
            if (fieldMap[cond.column].fieldType == 'string' || fieldMap[cond.column].fieldType == 'decimal') {
                if (fieldMap[cond.column].codeTag == 0) {
                    queryHelper.changeMaxTags(cond.column, cond.opr);
                    _.each(cond.value, function(value) {
                        $("#" + cond.column).tagsinput('add', value);
                    });
                    $("#" + cond.column + "_opr").multiselect('select', [cond.opr]);
                } else {
                    var fieldInfo = {};
                    fieldInfo.typeId = _opts.datatype.typeId;
                    fieldInfo.fieldName = cond.column;
                    fieldInfo.code = cond.value;
                    queryHelper.inputCodeTable(fieldInfo);
                    $("#" + cond.column + "_opr").multiselect('select', [cond.opr]);

                    if (cond.opr == 'isNull' || cond.opr == 'isNotNull') {
                        var tag = document.getElementById(cond.column);
                        // $(tag).attr("disabled", "disabled");
                        $(tag).attr("disabled", true);
                    }
                }
            } else if (fieldMap[cond.column].fieldType == 'date' || fieldMap[cond.column].fieldType == 'datetime') {
                $("#" + cond.column + "_opr").multiselect('select', [cond.opr]).trigger('change');
                switch (cond.opr) {
                    case 'isNull':
                    case 'isNotNull':
                        break;
                    case 'between':
                    case 'notBetween':
                        start = cond.value[0].replace(reg, "/").trim();
                        end = cond.value[1].replace(reg, "/").trim();
                        $("#" + cond.column + "_begin").val(start);
                        $("#" + cond.column + "_end").val(end);
                        break;
                    default:
                        start = cond.value[0].replace(reg, "/").trim();
                        $("#" + cond.column).val(start);
                        break;
                }
            }
        })
        $(".opr-selector").multiselect('refresh');
    }

    function modelInputGeneralDataQuery(modelId) {
        queryHelper.modelInput(modelId);
    }

    function inputGeneralDataQuery(taskId) {
        queryHelper.taskInput(taskId);
    }

    function inputTelcomMobile(mobile) {
        $("#USER_NUM").tagsinput('add', mobile);
    }

    var list = [];

    function getFieldDefine() {
        $.getJSON('/smartquery/smartquery/getdatatypequeryconfig', _opts.datatype).done(function(rsp) {

            list = rsp.data;
            allFileds = rsp.data;

            _.each(list, function(field) {
                fieldMap[field.fieldName] = field;
            })

            var commomfields = [];


            // var index = 0;
            var groupMap = {};
            var groupInfo = {};
            var groupList = [];

            //edit by hjw,reject elements that groupOrder lower than 0
            list = _.reject(list, function(e) {
                return e.groupOrder < 0;
            });

            groupInfo = _.groupBy(list, function(e) {
                return e.group;
            });


            for (groupName in groupInfo) {
                groupInfo[groupName] = _.sortBy(groupInfo[groupName], function(e) {
                    return e.fieldOrder;
                });
                groupList.push({
                    groupOrder: groupInfo[groupName][0].groupOrder,
                    groupName: groupName,
                    groupInfo: groupInfo[groupName]
                });
            }
            groupList = _.sortBy(groupList, function(e) {
                return e.groupOrder;
            });

            _.each(groupList, function(e, index) {
                $('#panel-body-container').append(tpl_group());
                var element = document.getElementById('group-span');
                element.id = 'group-span-' + index;
                element.innerHTML = e.groupName;

                var group = document.getElementById('group');
                group.id = 'group-' + index;
                groupMap[e.groupName] = '#' + group.id;
            });


            _.each(groupList, function(e, index) {
                var newRow = 0;
                var id = 0;
                _.each(e.groupInfo, function(el) {
                    if (newRow % 2 == 0) {
                        id = newRow;
                        $(groupMap[e.groupName]).closest('form').append("<div class='row' id=" + "'" + e.groupName + id + "'" + "></div>");
                    }
                    if (el.codeTag == 1) {
                        $("#" + e.groupName + id).append(tpl_codetable());
                        var div = document.getElementById(fieldName);
                        div.id = el.fieldName + divSuffix;
                        document.getElementById(div.id).innerHTML = el.caption;

                        var tag = document.getElementById(codetablePrefix);

                        tag.id = el.fieldName;

                        var tagOpr = document.getElementById('codetable_opr');
                        tagOpr.id = el.fieldName + '_opr';
                        _.each(operator.typeOpr, function(opr) {
                            $(tagOpr).append('<option value="' + opr.key + '">' + opr.name + '</option>');
                        })
                        $(tagOpr).bind("change", function() {
                            var aa = $(tag.parentElement).find(".selection");
                            //console.log("tag", aa);
                            if ($("#" + tagOpr.id).val() == 'isNull' ||
                                $("#" + tagOpr.id).val() == 'isNotNull') {
                                //$(tag.parentElement).addClass('disabled');
                                //aa.addClass('disabled');
                                // aa.find(".select2-selection__rendered").empty();
                                tag.innerHTML = '';

                                //edit by shishu
                                $(tag).val("").trigger("change");
                                $(tag).attr("disabled", true)
                            } else {
                                $(tag).attr("disabled", false);

                                // $(tag).removeAttr("disabled");
                                //aa.removeClass('disabled');
                                //$(tag.parentElement).removeClass('disabled');
                            }
                        });

                        var fieldInfo = {};
                        fieldInfo.typeId = _opts.datatype.typeId;
                        fieldInfo.fieldName = el.fieldName;
                        queryHelper.getCodeTable(fieldInfo);
                        newRow++;
                    } else {
                        if (el.fieldType == 'string') {
                            $("#" + e.groupName + id).append(tpl_string({
                                fieldName: el.fieldName + divSuffix,
                                fieldCaption: el.caption,
                                tagsinput: el.fieldName,
                                opr: el.fieldName + oprSuffix
                            }));
                            _.each(operator.stringOpr, function(opr) {
                                $('#' + el.fieldName + oprSuffix).append('<option value="' + opr.key + '">' + opr.name + '</option>')

                            })
                            newRow++;
                        }
                        if (el.fieldType == 'decimal') {
                            $("#" + e.groupName + id).append(tpl_number({
                                fieldName: el.fieldName + divSuffix,
                                fieldCaption: el.caption,
                                tagsinput: el.fieldName,
                                opr: el.fieldName + oprSuffix
                            }));

                            _.each(operator.numberOpr, function(opr) {
                                $('#' + el.fieldName + oprSuffix).append('<option value="' + opr.key + '">' + opr.name + '</option>')

                            });
                            newRow++;
                        }
                        if (el.fieldType.toLowerCase() == 'date') {
                            $("#" + e.groupName + id).append(tpl_date());

                            var div = document.getElementById(fieldName);

                            div.id = el.fieldName + divSuffix;
                            document.getElementById(div.id).innerHTML = el.caption;

                            var dateinput = document.getElementById('date-input');
                            dateinput.id = el.fieldName;

                            var dateBegininput = document.getElementById('date-begin-input');
                            dateBegininput.id = el.fieldName + "_begin";

                            var dateEndinput = document.getElementById('date-end-input');
                            dateEndinput.id = el.fieldName + "_end";

                            var dateOpr = document.getElementById('date_opr');
                            dateOpr.id = el.fieldName + "_opr";

                            //edit by hjw,解除对operator.js操作符表中操作符顺序的依赖，此处添加代码保证第一个为起始于或终止于，以与tpl模板匹配，否则保错
                            var equalTypeOprExist = false;
                            var dateOprList = _.sortBy(operator.dateOpr, function(opr) {
                                if (opr.key == 'notLessThan' || opr.key == 'notGreaterThan') {
                                    equalTypeOprExist = true;
                                    return 0;
                                } else {
                                    return 1;
                                }
                            });
                            if (!equalTypeOprExist) {
                                Notify.show({
                                    title: "日期类型操作符中找不到等于单值类型的操作符",
                                    type: "warning",
                                    message: '需要修改代码,模板src/js/tpl/smartquery/tpl-sq-date.html'
                                });
                            }


                            _.each(dateOprList, function(opr) {
                                $("#" + dateOpr.id).append('<option value="' + opr.key + '">' + opr.name + '</option>');
                            })

                            var equalDiv = document.getElementById('date_equal_div');
                            equalDiv.id = el.fieldName + "_equal_div";
                            var betweenDiv = document.getElementById('date_between_div');
                            betweenDiv.id = el.fieldName + "_between_div";
                            var nullDiv = document.getElementById('date_null_div');
                            nullDiv.id = el.fieldName + "_null_div";
                            $("#" + dateOpr.id).bind("change", function() {
                                if ($("#" + dateOpr.id).val() == 'between' ||
                                    $("#" + dateOpr.id).val() == 'notBetween') {
                                    $("#" + equalDiv.id).hide();
                                    $("#" + betweenDiv.id).show();
                                    $("#" + nullDiv.id).hide();
                                } else if ($("#" + dateOpr.id).val() == 'isNull' ||
                                    $("#" + dateOpr.id).val() == 'isNotNull') {
                                    $("#" + equalDiv.id).hide();
                                    $("#" + betweenDiv.id).hide();
                                    $("#" + nullDiv.id).show();
                                } else {
                                    $("#" + equalDiv.id).show();
                                    $("#" + betweenDiv.id).hide();
                                    $("#" + nullDiv.id).hide();
                                }
                            });

                            datetimepicker.initSingleDate(dateinput.id);
                            datetimepicker.initSingleDate(dateBegininput.id);
                            datetimepicker.initSingleDate(dateEndinput.id);
                            newRow++;
                        }
                        if (el.fieldType.toLowerCase() == 'datetime') {
                            $("#" + e.groupName + id).append(tpl_datetime());

                            var div = document.getElementById(fieldName);

                            div.id = el.fieldName + divSuffix;
                            document.getElementById(div.id).innerHTML = el.caption;

                            var datetimeinput = document.getElementById('datetime-input');
                            datetimeinput.id = el.fieldName;

                            var datetimeBegininput = document.getElementById('datetime-begin-input');
                            datetimeBegininput.id = el.fieldName + "_begin";

                            var datetimeEndinput = document.getElementById('datetime-end-input');
                            datetimeEndinput.id = el.fieldName + "_end";

                            var datetimeOpr = document.getElementById('datetime_opr');
                            datetimeOpr.id = el.fieldName + "_opr";

                            //edit by hjw,解除对operator.js操作符表中操作符顺序的依赖，此处添加代码保证第一个为between或notBetween，以与tpl模板匹配，否则保错
                            var betweenTypeOprExist = false;
                            var datetimeOprList = _.sortBy(operator.dateTimeOpr, function(opr) {
                                if (opr.key == 'between' || opr.key == 'notBetween') {
                                    betweenTypeOprExist = true;
                                    return 0;
                                } else {
                                    return 1;
                                }
                            });
                            if (!betweenTypeOprExist) {
                                Notify.show({
                                    title: "日期类型操作符中找不到between类型的操作符",
                                    type: "warning",
                                    message: '需要修改代码,模板src/js/tpl/smartquery/tpl-sq-datetime.html'
                                });
                            }

                            _.each(datetimeOprList, function(opr) {
                                $("#" + datetimeOpr.id).append('<option value="' + opr.key + '">' + opr.name + '</option>');
                            })

                            var equalDiv = document.getElementById('datetime_equal_div');
                            equalDiv.id = el.fieldName + "_equal_div";
                            var betweenDiv = document.getElementById('datetime_between_div');
                            betweenDiv.id = el.fieldName + "_between_div";
                            var nullDiv = document.getElementById('datetime_null_div');
                            nullDiv.id = el.fieldName + "_null_div";

                            $("#" + datetimeOpr.id).bind("change", function() {
                                //edit by hjw,新增起始于终止于的支持 
                                switch ($("#" + datetimeOpr.id).val()) {
                                    case 'between':
                                    case 'notBetween':
                                        $("#" + equalDiv.id).hide();
                                        $("#" + betweenDiv.id).show();
                                        $("#" + nullDiv.id).hide();
                                        break;
                                    case 'isNull':
                                    case 'isNotNull':
                                        // case 'notLessThan':
                                        // case 'notGreaterThan':
                                        $("#" + equalDiv.id).hide();
                                        $("#" + betweenDiv.id).hide();
                                        $("#" + nullDiv.id).show();
                                        break;
                                    default:
                                        $("#" + equalDiv.id).show();
                                        $("#" + betweenDiv.id).hide();
                                        $("#" + nullDiv.id).hide();
                                        break;
                                }


                            });

                            datetimepicker.initSingleDatetime(datetimeinput.id);
                            datetimepicker.initSingleDatetime(datetimeBegininput.id);
                            datetimepicker.initSingleDatetime(datetimeEndinput.id);

                            // $("#" + datetimeBegininput.id).bind("focusout", function(e) {
                            //     if (e.relatedTarget && e.relatedTarget.id == datetimeEndinput.id) {} else {
                            //         if ($("#" + datetimeBegininput.id).val()!=="" && $("#" + datetimeBegininput.id).val().indexOf("__") == "-1"&& $("#" + datetimeEndinput.id).val() =="") {
                            //             console.log($("#" + datetimeBegininput.id).val().indexOf("__"));
                            //             console.log($("#" + datetimeEndinput.id).val());
                            //             Notify.show({
                            //                 title: "请填写结束时间",
                            //                 type: "warning",
                            //             })
                            //         }
                            //     }
                            // })

                            newRow++;
                        }
                    }
                    if (el.caption.length > 11) {
                        $('#' + el.fieldName + divSuffix).text(el.caption.substr(0, 11) + "...");
                        $('#' + el.fieldName + divSuffix).attr("title", el.caption);
                    }
                });


            });

            queryHelper.initTagsInput();
            queryHelper.initMultiselect();

        })
    }

    function constructQueryArg() {
        var request = {};
        request.name = "smartquery";
        request.mode = 3;
        request.taskType = 101;
        request.priority = 1;

        var taskDetail = {};
        var dataType = {};
        var dataType = _opts.datatype;
        dataType.name = $('#topbar .breadcrumb .crumb-trail').html();

        taskDetail.dataType = dataType;
        var cond = {};
        cond.composite = true;
        cond.logicOperator = "and";

        var condDetail = {};
        condDetail.children = [];
        condDetail.condStr = [];
        condDetail.condStr.push('数据类型:' + dataType.name);

        _.each(list, function(field) {

            if (field.codeTag == 1) {
                queryHelper.setCodeTableVal(field.fieldName, field.caption, condDetail);
            } else {
                if (field.fieldType == 'string') {
                    queryHelper.setStringVal(field.fieldName, field.caption, condDetail);
                }

                if (field.fieldType == 'decimal') {
                    var str = $('#' + field.fieldName).val().trim().split(",");
                    var opr = $('#' + field.fieldName + oprSuffix).val().trim();
                    if (opr == "isNull" || opr == "isNotNull") {
                        condDetail.condStr.push(field.caption + ':' + queryHelper.getOprName(opr));
                        condDetail.children.push({
                            composite: false,
                            column: field.fieldName,
                            opr: opr,
                        });
                    } else if (str != null && str != "") {
                        condDetail.condStr.push(field.caption + ':' + queryHelper.getOprName(opr) + ' ' + str);
                        condDetail.children.push({
                            composite: false,
                            column: field.fieldName,
                            opr: opr,
                            value: str
                        });
                    }
                }

                if (field.fieldType == 'date') {
                    queryHelper.setDateVal(field.fieldName, field.caption, condDetail);
                }

                if (field.fieldType == 'datetime') {
                    queryHelper.setDatetime(field.fieldName, field.caption, condDetail);
                }
            }
        });

        if (condDetail.children.length != 0) {
            cond.children = condDetail.children;
            taskDetail.cond = cond;
        }
        request.taskDetail = taskDetail;
        request.condStr = condDetail.condStr.join('\r\n');
        // console.log("request", request);
        return request;
    }

    function exposeQueryHelper() {
        return queryHelper;
    }

    return {
        init: init,
        renderGeneralDataQuery: renderGeneralDataQuery,
        inputGeneralDataQuery: inputGeneralDataQuery,
        inputTelcomMobile: inputTelcomMobile,
        modelInputGeneralDataQuery: modelInputGeneralDataQuery,
        exposeQueryHelper: exposeQueryHelper,
        stopCurrentQuery: toolbar.stopCurrentQuery
    }

})