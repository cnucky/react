define('./datafence-operateFunc', [
    '../../tpl/datafence/tpl-sq-string',
    '../../tpl/datafence/tpl-sq-number',
    '../../tpl/datafence/tpl-sq-codetable',
    '../../tpl/datafence/tpl-sq-date',
    '../../tpl/datafence/tpl-sq-checkbox',
    '../../tpl/datafence/tpl-sq-datetime',
    '../../widget/operator',
    // '../smartquery/tpl-sq-datetimepicker',
    // '../smartquery/smartQueryHelper',
    '../../../../../smartquery/src/js/module/smartquery/tpl-sq-datetimepicker.js',
    '../../../../../smartquery/src/js/module/smartquery/smartQueryHelper.js',
    'utility/loaders',
    'nova-utils',
    'nova-dialog',
    'nova-notify',
    'utility/select2/select2.min',
    'utility/select2/i18n/zh-CN',
    'tagsinput'
], function(tpl_string, tpl_number, tpl_codetable, tpl_date, tpl_checkbox, tpl_datetime, operator_map, datetimepicker,
    queryHelper, loader, Util, Dialog, Notify) {

    tpl_string = _.template(tpl_string);
    tpl_number = _.template(tpl_number);
    tpl_codetable = _.template(tpl_codetable);
    tpl_date = _.template(tpl_date);
    tpl_datetime = _.template(tpl_datetime);
    tpl_checkbox = _.template(tpl_checkbox);
    operator = operator_map.SMARTQUERY_OPR_MAP;

    var divSuffix = "_div";
    var oprSuffix = "_opr";
    var taskID = 0;
    var _opt;
    var allFileds = [];
    var fieldMap = {};
    var globledataTypeId = null;

    function init(opt) {
        _opt = opt;
    }

    function submitQuery(datafenceHelperOpt) {
        // showLoader();
        var queryArg = constructQueryArg(datafenceHelperOpt.dataType, datafenceHelperOpt.taskName, datafenceHelperOpt.taskDirId, datafenceHelperOpt.datafenceId, datafenceHelperOpt.datafenceName, datafenceHelperOpt.curFenceShape);
        globledataTypeId = datafenceHelperOpt.dataType.typeId;
        //$('#mainSplitter').jqxSplitter('expand');

        $('#offlineSearchBox').hide();
        $('#pathBox').show();
        $("#pathLoadingBox").show();
        setTimeout(function() {
            $.getJSON('/datafence/datafence/submitintelligentquery', queryArg).done(function(rsp) {
                // if (rsp.code == undefined) {
                //     Notify.show({
                //         title: "提交任务失败",
                //         type: "failed"
                //     });
                // }
                if (rsp.code != 0) {
                    Notify.show({
                        title: rsp.message,
                        type: "failed"
                    });
                    $('#offlineSearchBox').show();
                    $("#pathLoadingBox").hide();
                } else {
                    // $('#offlineSearchBox').hide();
                    $("#backToResult").show();
                    taskID = rsp.data.taskId;
                    $('#openAllResult').attr("taskId", taskID);
                    tryGetTaskResult(taskID).then(function(rsp) {
                            // console.log(rsp);
                            var rows = [];
                            for (var i = 0; i < rsp.records.length; i++) {
                                var row = {};
                                for (var j = 0; j < rsp.meta.length; j++) {
                                    var name = rsp.meta[j].name;
                                    row[name] = rsp.records[i][j]
                                }
                                rows.push(row)
                            }
                            // console.log(rows);
                            // console.log(datafenceHelperOpt.dataType);
                            if (rows.length > 0) {
                                $("#noResult").hide();
                                datafenceHelperOpt.makeGisJSON(rows, datafenceHelperOpt.dataType);
                            } else {
                                $("#noResult").show();
                                datafenceHelperOpt.makeGisJSON(rows, datafenceHelperOpt.dataType);
                            }
                            datafenceHelperOpt.switchBox();
                        })
                        //jqxBinding.TryBindResult('#gridContainer', rsp.data);
                }
            });
        }, 10)
    }

    function tryGetTaskResult(taskID) {
        var dfd = Q.defer();

        function request() {
            jqxhr = $.getJSON("/smartquery/smartquery/getintelligentqueryresult", {
                taskId: taskID,
                needMeta: 1,
                startIndex: 0,
                length: 1000
            }, function(rsp) {
                if (rsp.code == 0) {
                    if (rsp.data && rsp.data.taskRatio == 100) {
                        loaded = !_.isEmpty(rsp.data);
                        dfd.resolve(rsp.data);
                    } else if (rsp.data.taskStatus == 'error') {
                        dfd.reject({
                            progress: undefined,
                            hints: '查询数据源失败' + (rsp.message ? '：' + rsp.message : '')
                        });
                    } else {
                        rsp = {};
                        setTimeout(function() {
                            request()
                        }, 100);
                    }

                } else {
                    dfd.reject({
                        progress: undefined,
                        hints: '查询数据源失败' + (rsp.message ? '：' + rsp.message : '')
                    });
                }
            });
        }
        request();


        return dfd.promise;
    }

    function constructQueryArg(dataTypeArg, taskName, taskDirId, fenceId, fenceName, curFenceShape) {
        var request = {};
        request.name = taskName;
        request.mode = 3;
        request.taskType = 111;
        request.priority = 1;
        request.dirId = taskDirId;

        var taskDetail = {};
        var dataType = {};
        dataType.centerCode = dataTypeArg.centerCode;
        dataType.zoneId = dataTypeArg.zoneId;
        dataType.typeId = dataTypeArg.typeId;
        dataType.srcTypeId = dataTypeArg.typeId;
        dataType.name = dataTypeArg.name;
        taskDetail.dataType = dataType;

        var cond = {};
        cond.composite = true;
        cond.logicOperator = "and";
        var fence = {};
        var fenceIds = [];
        var queryFieldsChecked = [];
        var children = [];


        var condDetail = {};
        condDetail.children = [];
        condDetail.condStr = [];
        condDetail.condStr.push('对 ' + dataType.name + ' 进行数据围栏分析');

        _.each(allFileds, function(field) {
            if (field.codeTag == 1) {
                queryHelper.setCodeTableVal(field.fieldName, field.caption, condDetail);
            } else {
                if (field.fieldType == 'string') {
                    queryHelper.setStringVal(field.fieldName, field.caption, condDetail);
                }

                if (field.fieldType == 'decimal') {
                    var str = $('#' + field.fieldName).val().trim().split(",");
                    if (str != null && str != "") {
                        condDetail.condStr.push(field.caption + ':' + queryHelper.getOprName(opr));
                        condDetail.children.push({
                            composite: false,
                            column: field.fieldName,
                            opr: $('#' + field.fieldName + oprSuffix).val().trim(),
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

        if (queryFields.length == 1) {
            queryFieldsChecked.push(queryFields[0].fieldName);
        } else {
            _.each(queryFields, function(field) {
                if ($("#" + field.fieldName).is(':checked')) {
                    queryFieldsChecked.push(field.fieldName);
                }
            })
        }

        //todo:modify code below to support multi fences
        if (fenceId != null && fenceId != "") {
            fenceIds = fenceId.split(",");
            fence.fenceId = fenceIds;
            fence.fenceName = fenceName;
        }

        if (curFenceShape != null && curFenceShape != undefined) {
            fence = curFenceShape;
        }


        if (queryFieldsChecked.length > 0) {
            fence.queryField = queryFieldsChecked;
        }

        if (fence.fenceId != undefined || fence.shape != undefined) {
            taskDetail.fence = fence;
        }

        if (condDetail.children.length != 0) {
            cond.children = condDetail.children;
            taskDetail.baseCond = cond;
        }
        request.taskDetail = taskDetail;
        request.condStr = condDetail.condStr.join('\r\n');
        request.taskDetail = taskDetail;

        return request;
    }

    function mkQueryConfigByDatatype(datatype) {
        $.getJSON('/smartquery/smartquery/getdatatypequeryconfig', datatype).done(function(rsp) {
            list = rsp.data;
            allFileds = [];
            queryFields = [];

            $('#queryCond').empty();
            _.each(list, function(field) {
                fieldMap[field.fieldName] = field;
                if (field.isGisField == 1) {
                    allFileds.push(field);
                };
            })

            allFileds.sort(function(a, b) {
                var order1 = a.fieldOrder;
                var order2 = b.fieldOrder;
                return order1 - order2;
            });

            var id = 0;
            var newRow = 0;
            _.each(allFileds, function(field) {
                id = newRow;
                $('#queryCond').append("<div class='row' id=" + "'" + field.group + id + "'" + "></div>");
                if (field.codeTag == 1) {
                    $("#" + field.group + id).append(tpl_codetable({
                        fieldName: field.fieldName + divSuffix,
                        fieldCaption: field.caption,
                        tagsinput: field.fieldName,
                    }));

                    _.each(operator.typeOpr, function(opr) {
                        $('#' + field.fieldName + oprSuffix).append('<option value="' + opr.key + '">' + opr.name + '</option>')
                    })

                    var fieldInfo = {};
                    fieldInfo.typeId = datatype.typeId;
                    fieldInfo.fieldName = field.fieldName;
                    queryHelper.getCodeTable(fieldInfo);
                    newRow++;
                } else {
                    if (field.fieldType == 'string') {
                        $("#" + field.group + id).append(tpl_string({
                            fieldName: field.fieldName + divSuffix,
                            fieldCaption: field.caption,
                            tagsinput: field.fieldName,
                            opr: field.fieldName + oprSuffix
                        }));

                        _.each(operator.stringOpr, function(opr) {
                            $('#' + field.fieldName + oprSuffix).append('<option value="' + opr.key + '">' + opr.name + '</option>')
                        })
                        newRow++;
                    }

                    if (field.fieldType == 'decimal') {
                        $("#" + field.group + id).append(tpl_number({
                            fieldName: field.fieldName + divSuffix,
                            fieldCaption: field.caption,
                            tagsinput: field.fieldName,
                            opr: field.fieldName + oprSuffix
                        }));

                        _.each(operator.numberOpr, function(opr) {
                            $('#' + field.fieldName + oprSuffix).append('<option value="' + opr.key + '">' + opr.name + '</option>')
                        })

                        newRow++;
                    }

                    if (field.fieldType == 'date') {
                        $("#" + field.group + id).append(tpl_date({
                            fieldName: field.fieldName,
                            fieldCaption: field.caption,
                        }));
                        datetimepicker.initSingleDate(field.fieldName + "_begin");
                        datetimepicker.initSingleDate(field.fieldName + "_end");
                        newRow++;

                    }

                    if (field.fieldType == 'datetime') {
                        $("#" + field.group + id).append(tpl_datetime({
                            fieldName: field.fieldName,
                            fieldCaption: field.caption,
                        }));
                        datetimepicker.initSingleDatetime(field.fieldName + "_begin");
                        datetimepicker.initSingleDatetime(field.fieldName + "_end");
                        newRow++;
                    }
                }
            })

            $.getJSON('/smartquery/smartquery/getGisQueryConfig', datatype).done(function(rsp) {
                var gisconfig = rsp.data;
                if (gisconfig.BussinessToGISFieldList[0].BussinessPhysicalName) {
                    _.each(gisconfig.BussinessToGISFieldList, function(gisfield) {
                        queryFields.push(fieldMap[gisfield.BussinessPhysicalName.toUpperCase()]);
                    })

                    queryFields.sort(function(a, b) {
                        var order1 = a.fieldOrder;
                        var order2 = b.fieldOrder;
                        return order1 - order2;
                    });

                    if (queryFields.length > 1) {
                        newRow = 0;
                        _.each(queryFields, function(field) {
                            if (newRow % 2 == 0) {
                                id = newRow;
                                $('#queryCond').append("<hr class='seprator' /><div class='row' id=" + "'" + field.group + id + "'" + "></div>");
                            }

                            $("#" + field.group + id).append(tpl_checkbox({
                                fieldName: field.fieldName,
                                fieldCaption: field.caption,
                            }));

                            newRow++;
                        })
                    };
                }

            })

            initTagsInput();
            initMultiselect();

        })
    }

    function initMultiselect() {
        $('#offlineSearchBox .opr-selector').multiselect({
            buttonClass: 'multiselect dropdown-toggle btn btn-default btn-primary mr0',
            buttonWidth: "100%",
            onChange: function(option, checked) {
                var oprId = option[0].parentNode.id;
                var id = oprId.substr(0, oprId.indexOf('_opr'));
                var tagInput = $('#' + id);
                if ($(tagInput).hasClass("tagsinput")) {
                    $(tagInput).tagsinput('removeAll');
                    changeMaxTags(id, option[0].value);
                }
            }
        });
    }

    function generateMainPath(node) {
        var curNode = node;
        var path = [];
        var pathStr = "";

        if (curNode) {
            var pa = {
                id: node.key,
                name: node.title,
            };
            path.push(pa);
            while (curNode.getParent()) {
                curNode = curNode.getParent();
                if (curNode.title != 'root') {
                    path.push({
                        id: curNode.key,
                        name: curNode.title,
                    });
                }
            }

            _.each(path, function(node) {
                pathStr = "/" + node.name + pathStr;
            })
        }
        return pathStr;
    }

    function initTagsInput() {
        $('.tagsinput').tagsinput({
            tagClass: function(item) {
                return 'label bg-primary light';
            },
            maxTags: 1,
            delimiter: ',',
            trimValue: true
        });

        //reset lacci input
        $('#USER_LACCI').tagsinput('destroy');
        $('#USER_LACCI').tagsinput({
            tagClass: function(item) {
                return 'label bg-primary light';
            },
            maxTags: 1,
            confirmKeys: [13, 59],
            delimiter: ';',
        });
        $('#OPPO_LACCI').tagsinput('destroy');
        $('#OPPO_LACCI').tagsinput({
            tagClass: function(item) {
                return 'label bg-primary light';
            },
            maxTags: 1,
            confirmKeys: [13, 59],
            delimiter: ';',
        });
        $('#USER_BASE_STATION').tagsinput('destroy');
        $('#USER_BASE_STATION').tagsinput({
            tagClass: function(item) {
                return 'label bg-primary light';
            },
            maxTags: 1,
            confirmKeys: [13, 59],
            delimiter: ';',
        });
        $('#OPPO_BASE_STATION').tagsinput('destroy');
        $('#OPPO_BASE_STATION').tagsinput({
            tagClass: function(item) {
                return 'label bg-primary light';
            },
            maxTags: 1,
            confirmKeys: [13, 59],
            delimiter: ';',
        });
        $('#BASE_STATION').tagsinput('destroy');
        $('#BASE_STATION').tagsinput({
            tagClass: function(item) {
                return 'label bg-primary light';
            },
            maxTags: 1,
            confirmKeys: [13, 59],
            delimiter: ';',
        });
    }

    function changeMaxTags(id, opr) {
        var isLACCI = id == 'USER_LACCI' || id == 'OPPO_LACCI' || id == 'USER_BASE_STATION' || id == 'BASE_STATION' || id == 'OPPO_BASE_STATION';
        switch (opr) {
            case 'between':
            case 'notBetween':
                $('#' + id).tagsinput('destroy');
                if (isLACCI) {
                    $('#' + id).tagsinput({
                        maxTags: 2,
                        tagClass: function(item) {
                            return 'label bg-primary light';
                        },
                        confirmKeys: [13, 59],
                        delimiter: ';'
                    })
                } else {
                    $('#' + id).tagsinput({
                        maxTags: 2,
                        tagClass: function(item) {
                            return 'label bg-primary light';
                        },
                        delimiter: ','
                    })
                }
                break;
            case 'equal':
            case 'notEqual':
            case 'greaterThan':
            case 'lessThan':
            case 'startWith':
            case 'notStartWith':
            case 'endWith':
            case 'notEndWith':
            case 'like':
            case 'notLike':
                $('#' + id).tagsinput('destroy');
                if (isLACCI) {
                    $('#' + id).tagsinput({
                        maxTags: 1,
                        confirmKeys: [13, 59],
                        tagClass: function(item) {
                            return 'label bg-primary light';
                        },
                        delimiter: ';'
                    })
                } else {
                    $('#' + id).tagsinput({
                        maxTags: 1,
                        delimiter: ',',
                        tagClass: function(item) {
                            return 'label bg-primary light';
                        },
                    })
                }
                break;
            case 'isNull':
            case 'isNotNull':
                $('#' + id).tagsinput('destroy');
                if (isLACCI) {
                    $('#' + id).tagsinput({
                        maxTags: -1,
                        confirmKeys: [13, 59],
                        tagClass: function(item) {
                            return 'label bg-primary light';
                        },
                        delimiter: ';'
                    })
                } else {
                    $('#' + id).tagsinput({
                        maxTags: -1,
                        tagClass: function(item) {
                            return 'label bg-primary light';
                        },
                        delimiter: ','
                    })
                }
                break;
            default:
                $('#' + id).tagsinput('destroy');
                if (isLACCI) {
                    $('#' + id).tagsinput({
                        maxTags: undefined,
                        tagClass: function(item) {
                            return 'label bg-primary light';
                        },
                        confirmKeys: [13, 59],
                        delimiter: ';'
                    })
                } else {
                    $('#' + id).tagsinput({
                        maxTags: undefined,
                        tagClass: function(item) {
                            return 'label bg-primary light';
                        },
                        delimiter: ','
                    })
                }
        }
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
                // $("#" + cond.column + "_opr").multiselect('select', [cond.opr]).trigger('change');
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
    //return
    return {
        init: init,
        submitQuery: submitQuery,
        mkQueryConfigByDatatype: mkQueryConfigByDatatype,
        tryGetTaskResult: tryGetTaskResult,
        generateMainPath: generateMainPath,
        showInput: showInput
    };
});