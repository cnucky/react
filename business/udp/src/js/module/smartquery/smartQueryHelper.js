require(['nova-notify', '../../widget/operator'], function(Notify, operator_map) {
    var operator = operator_map.SMARTQUERY_OPR_MAP;
    var queryHelper = function(obj) {
        if (obj instanceof queryHelper) return obj;
        if (!(this instanceof queryHelper)) return new _(obj);
        this._wrapped = obj;
    };

    var _opt = {};
    queryHelper.init = function(opt) {
        _opt.config = opt.config;
        _opt.dialog = opt.dialog;
        _opt.notify = opt.notify;
        _opt.udpFileUtil = opt.udpFileUtil;
        _opt.localization = opt.localization;
        _opt.showInput = opt.showInput;
        _opt.jqxBinding = opt.jqxBinding;
    };

    /* EDIT BY huangjingwei BEGIN*/
    queryHelper.getOprName = function(key) {
        var oprType = undefined;
        for (k in operator) {
            oprType = _.findWhere(operator[k], {
                key: key
            });
            if (oprType) {
                return oprType.name;
            }
        }
        Notify.show({
            title: "在五种数据类型中都没有找到对应操作符的名称:" + key,
            type: "failed"
        });

    }

    /* EDIT BY huangjingwei END*/
    queryHelper.setStringVal = function(fieldName, caption, condDetail) {
        var psr_cname = $('#' + fieldName).tagsinput('items');
        var psr_cname_opr = $('#' + fieldName + '_opr').val().trim();
        if (psr_cname_opr == "isNull" || psr_cname_opr == "isNotNull") {
            condDetail.condStr.push(caption + ':' + queryHelper.getOprName(psr_cname_opr));
            condDetail.children.push({
                composite: false,
                column: fieldName,
                opr: psr_cname_opr,
            });
        } else {
            if (psr_cname != null && psr_cname != "") {
                condDetail.condStr.push(caption + ':' + queryHelper.getOprName(psr_cname_opr) + '(' + psr_cname + ')');
                condDetail.children.push({
                    composite: false,
                    column: fieldName,
                    opr: psr_cname_opr,
                    value: psr_cname
                });
            }
        }
        return condDetail;
    }

    queryHelper.setCodeTableVal = function(fieldName, caption, condDetail) {
        var seg_dept_code = $('#' + fieldName).val();
        var seg_dept_opr = $('#' + fieldName + '_opr').val();
        if (seg_dept_opr == "isNull" || seg_dept_opr == "isNotNull") {
            condDetail.condStr.push(caption + ':' + queryHelper.getOprName(seg_dept_opr));
            condDetail.children.push({
                composite: false,
                column: fieldName,
                opr: seg_dept_opr,
            });
        } else if (seg_dept_code != null && seg_dept_code != "") {
            condDetail.condStr.push(caption + ':' + queryHelper.getOprName(seg_dept_opr) + ' (' + _.pluck($('#' + fieldName).select2('data'), 'text').join(',') + ')');
            if (seg_dept_opr == "equal" && seg_dept_code.length > 1) {
                seg_dept_opr = "in";
            }
            console.log("seg_dept_code", seg_dept_code);
            condDetail.children.push({
                composite: false,
                column: fieldName,
                opr: seg_dept_opr, //'in',
                value: seg_dept_code
            });
        }

        //console.log("setCodeTableVal", condDetail);
        return condDetail;
    }

    queryHelper.setDateVal = function(fieldName, caption, condDetail) {
        var date_opr = $('#' + fieldName + '_opr').val().trim();
        switch (date_opr) {
            case 'between':
            case 'notBetween':
                setDateRange(date_opr, fieldName, caption, condDetail);
                break;
            case 'isNull':
            case 'isNotNull':
                setDateNull(date_opr, fieldName, caption, condDetail);
                break;
            default:
                setDate(date_opr, fieldName, caption, condDetail);
                break;
        }
    }

    function setDateNull(date_opr, fieldName, caption, condDetail) {
        condDetail.condStr.push(caption + ':' + queryHelper.getOprName(date_opr));
        condDetail.children.push({
            composite: false,
            column: fieldName,
            opr: date_opr
        });
        return condDetail;
    }

    function setDate(date_opr, fieldName, caption, condDetail) {
        var eventtimerange = $('#' + fieldName).val();
        if (eventtimerange != '' && eventtimerange != null) {
            var reg = new RegExp("/", "g");
            var event_start = eventtimerange.trim().replace(reg, "-").trim();
            var neweventtime = [];
            neweventtime.push(event_start);
            if (neweventtime != null && neweventtime != "") {
                condDetail.condStr.push(caption + ':' + queryHelper.getOprName(date_opr) + '(' + neweventtime.join(',') + ')');
                //condDetail.condStr.push(caption + ':在(' + neweventtime + ')之间');
                condDetail.children.push({
                    composite: false,
                    column: fieldName,
                    opr: date_opr,
                    value: neweventtime
                });
                return condDetail;
            }
        }
    }

    function setDateRange(date_opr, fieldName, caption, condDetail) {
        var reg = new RegExp("/", "g");
        var event_start = $('#' + fieldName + '_begin').val().trim().replace(reg, "-").trim();
        var event_end = $('#' + fieldName + '_end').val().trim().replace(reg, "-").trim();
        var neweventtime = [];
        neweventtime.push(event_start);
        neweventtime.push(event_end);
        if (neweventtime != null && neweventtime != "") {
            if (event_start == "" && event_end == "") {

            } else if ((event_start == "" && event_end !== "") || (event_start !== "" && event_end == "")) {
                Notify.show({
                    title: '请完整输入开始日期和结束日期',
                    type: "info"
                });
                condDetail.children.push({
                    legal: false
                });
            } else {
                condDetail.condStr.push(caption + ':' + queryHelper.getOprName(date_opr) + '(' + neweventtime.join(',') + ')');
                //condDetail.condStr.push(caption + ':在(' + neweventtime + ')之间');
                condDetail.children.push({
                    composite: false,
                    column: fieldName,
                    opr: date_opr,
                    value: neweventtime
                });
            }
            // if(event_start != null && event_start != "" && event_end != null && event_end != "") {

            // }
            // else{
            //    condDetail.children.push(false);
            //    Notify.show({
            //        title: caption + '未能完整输入开始时间和结束时间，已丢弃该条件',
            //        type: "info"
            //    });
            //    return false
            // }

        }

        var eventtimerange = $('#' + fieldName).val();
        if (eventtimerange != '' && eventtimerange != null) {}
    }

    queryHelper.setDatetime = function(fieldName, caption, condDetail) {
        var dateTime_opr = $('#' + fieldName + '_opr').val().trim();
        switch (dateTime_opr) {
            case 'between':
            case 'notBetween':
                setDatetimeRangeVal(dateTime_opr, fieldName, caption, condDetail);
                break;
            case 'isNull':
            case 'isNotNull':
                setDatetimeNull(dateTime_opr, fieldName, caption, condDetail);
                break;
            default:
                setDatetimeVal(dateTime_opr, fieldName, caption, condDetail);
                break;
        }
    }

    function setDatetimeNull(dateTime_opr, fieldName, caption, condDetail) {
        condDetail.condStr.push(caption + ':' + queryHelper.getOprName(dateTime_opr));
        condDetail.children.push({
            composite: false,
            column: fieldName,
            opr: dateTime_opr
        });
        return condDetail;
    }

    function setDatetimeVal(dateTime_opr, fieldName, caption, condDetail) {
        var eventtimerange = $('#' + fieldName).val();
        if (eventtimerange != '' && eventtimerange != null) {
            var reg = new RegExp("/", "g");
            var event_start = eventtimerange.trim().replace(reg, "-").trim();
            var neweventtime = [];
            neweventtime.push(event_start);
            if (neweventtime != null && neweventtime != "") {
                //condDetail.condStr.push(caption + ':' + queryHelper.getOprName(date_opr)
                //    + '(' + neweventtime.join(',') + ')');

                condDetail.condStr.push(caption + ':' + queryHelper.getOprName(dateTime_opr) + '(' + neweventtime + ')');
                condDetail.children.push({
                    composite: false,
                    column: fieldName,
                    opr: dateTime_opr,
                    value: neweventtime
                });
                return condDetail;
            }
        }
    }

    function setDatetimeRangeVal(dateTime_opr, fieldName, caption, condDetail) {
        var reg = new RegExp("/", "g");
        var event_start = $('#' + fieldName + '_begin').val().trim().replace(reg, "-").trim();
        var event_end = $('#' + fieldName + '_end').val().trim().replace(reg, "-").trim();
        var neweventtime = [];
        neweventtime.push(event_start);
        neweventtime.push(event_end);
        if (neweventtime != null && neweventtime != "") {
            //都为空，不保存该条件
            if (event_start == "" && event_end == "") {} else if ((event_start == "" && event_end !== "") || (event_start !== "" && event_end == "")) {
                Notify.show({
                    title: '请完整输入开始时间和结束时间',
                    type: "info"
                });
                condDetail.children.push({
                    legal: false
                });
            } else {
                condDetail.condStr.push(caption + ':' + queryHelper.getOprName(dateTime_opr) + '(' + neweventtime.join(',') + ')');
                condDetail.children.push({
                    composite: false,
                    column: fieldName,
                    opr: dateTime_opr,
                    value: neweventtime
                });
            }
            return condDetail;
        }
    }

    queryHelper.getCodeTable = function(fieldInfo) {
        $("#" + fieldInfo.fieldName).select2({
            ajax: {
                url: "/smartquery/getCodeTable?typeId=" + fieldInfo.typeId + "&fieldName=" + fieldInfo.fieldName,
                dataType: 'json',
                delay: 250,
                data: function(params) {
                    //console.log(params);
                    if (!params.term) {
                        return {
                            queryWord: ""
                        };
                    } else {
                        return {
                            queryWord: params.term
                        };
                    }
                },
                processResults: function(data, params) {
                    return {
                        results: data.data
                    }
                },
                cache: true
            },
            minimumInputLength: 0,
            allowClear: true,
            language: 'zh-CN'
        });
    };

    queryHelper.inputCodeTable = function(fieldInfo) {
        $.getJSON('/smartquery/getCodeTableByCode', fieldInfo).done(function(rsp) {
            if (rsp.data) {
                //console.log(rsp.data);
                _.each(rsp.data, function(field) {
                    var content = '<option value="' + field.id + '" selected="selected">' + field.text + '</option>';
                    $("#" + fieldInfo.fieldName).append(content);
                });
                $("#" + fieldInfo.fieldName).trigger('change');
            }
        })
    };

    queryHelper.initTagsInput = function() {
        $('.tagsinput').tagsinput({
            tagClass: function(item) {
                return 'label bg-primary light';
            },
            maxTags: 1,
            delimiter: ',',
            //edit by hjw
            trimValue: true
                // maxChars:10
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
            trimValue: true
        });
        $('#OPPO_LACCI').tagsinput('destroy');
        $('#OPPO_LACCI').tagsinput({
            tagClass: function(item) {
                return 'label bg-primary light';
            },
            maxTags: 1,
            confirmKeys: [13, 59],
            delimiter: ';',
            trimValue: true
        });
        $('#USER_BASE_STATION').tagsinput('destroy');
        $('#USER_BASE_STATION').tagsinput({
            tagClass: function(item) {
                return 'label bg-primary light';
            },
            maxTags: 1,
            confirmKeys: [13, 59],
            delimiter: ';',
            trimValue: true
        });
        $('#OPPO_BASE_STATION').tagsinput('destroy');
        $('#OPPO_BASE_STATION').tagsinput({
            tagClass: function(item) {
                return 'label bg-primary light';
            },
            maxTags: 1,
            confirmKeys: [13, 59],
            delimiter: ';',
            trimValue: true
        });
        $('#BASE_STATION').tagsinput('destroy');
        $('#BASE_STATION').tagsinput({
            tagClass: function(item) {
                return 'label bg-primary light';
            },
            maxTags: 1,
            confirmKeys: [13, 59],
            delimiter: ';',
            trimValue: true
        });
    }

    queryHelper.changeMaxTags = function(id, opr) {
        var psr_cname = $('#' + id).tagsinput('items');
        console.log("changeMaxTags", psr_cname)
        var isLACCI = id == 'USER_LACCI' || id == 'OPPO_LACCI' || id == 'USER_BASE_STATION' || id == 'BASE_STATION' || id == 'OPPO_BASE_STATION';
        switch (opr) {
            case 'between':
            case 'notBetween':
                if (psr_cname.length > 2) {
                    $('#' + id).tagsinput('removeAll');
                }
                $('#' + id).tagsinput('destroy');
                if (isLACCI) {
                    $('#' + id).tagsinput({
                        maxTags: 2,
                        confirmKeys: [13, 59],
                        delimiter: ';',
                        trimValue: true
                    })
                } else {
                    $('#' + id).tagsinput({
                        maxTags: 2,
                        delimiter: ',',
                        trimValue: true
                    })
                }
                break;
            case 'in':
            case 'notIn':
                $('#' + id).tagsinput('destroy');
                if (isLACCI) {
                    $('#' + id).tagsinput({
                        maxTags: undefined,
                        confirmKeys: [13, 59],
                        delimiter: ';',
                        trimValue: true
                    })
                } else {
                    $('#' + id).tagsinput({
                        maxTags: undefined,
                        delimiter: ',',
                        trimValue: true
                    })
                }
                break;
            case 'equal':
            case 'notEqual':
            case 'startWith':
            case 'notStartWith':
            case 'endWith':
            case 'notEndWith':
            case 'like':
            case 'notLike':
            case 'greaterThan':
            case 'lessThan':
                if (psr_cname.length > 1) {
                    $('#' + id).tagsinput('removeAll');
                }
                $('#' + id).tagsinput('destroy');
                if (isLACCI) {
                    $('#' + id).tagsinput({
                        maxTags: 1,
                        confirmKeys: [13, 59],
                        delimiter: ';',
                        trimValue: true
                    })
                } else {
                    $('#' + id).tagsinput({
                        maxTags: 1,
                        delimiter: ',',
                        trimValue: true
                    })
                }
                break;
            case 'isNull':
            case 'isNotNull':
                $('#' + id).tagsinput('removeAll');
                $('#' + id).tagsinput('destroy');
                if (isLACCI) {
                    $('#' + id).tagsinput({
                        maxTags: -1,
                        confirmKeys: [13, 59],
                        delimiter: ';'
                    })
                } else {
                    $('#' + id).tagsinput({
                        maxTags: -1,
                        delimiter: ','
                    })
                }
                break;
            default:
                $('#' + id).tagsinput('removeAll');
                $('#' + id).tagsinput('destroy');
                if (isLACCI) {
                    $('#' + id).tagsinput({
                        maxTags: undefined,
                        confirmKeys: [13, 59],
                        delimiter: ';',
                        trimValue: true
                    })
                } else {
                    $('#' + id).tagsinput({
                        maxTags: undefined,
                        delimiter: ',',
                        trimValue: true
                    })
                }
        }
    }

    queryHelper.initMultiselect = function() {
        $('.opr-selector').multiselect({
            buttonClass: 'multiselect dropdown-toggle btn btn-default btn-primary mr0',
            buttonWidth: '100px',
            onChange: function(option, checked) {
                var oprId = option[0].parentNode.id;
                var id = oprId.substr(0, oprId.indexOf('_opr'));
                var tagInput = $('#' + id);
                if ($(tagInput).hasClass("tagsinput")) {
                    //$(tagInput).tagsinput('removeAll');
                    queryHelper.changeMaxTags(id, option[0].value);
                }
                //$('#' + id).tagsinput('removeAll');
                /*    switch (option[0].value) {
                 case 'between':
                 case 'notBetween':
                 $('#' + id).tagsinput('destroy');
                 $('#' + id).tagsinput({
                 maxTags: 2
                 })
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
                 $('#' + id).tagsinput({
                 maxTags: 1
                 })
                 break;
                 case 'isNull':
                 case 'isNotNull':
                 $('#' + id).tagsinput('destroy');
                 $('#' + id).tagsinput({
                 maxTags: -1
                 })
                 break;
                 default:
                 $('#' + id).tagsinput('destroy');
                 $('#' + id).tagsinput({
                 maxTags: undefined
                 })

                 }*/
            }
        });
    }

    queryHelper.initTooltip = function() {
        $("[data-toggle='tooltip']").tooltip();
    }

    queryHelper.calGridHeight = function() {
        var panelHeight = document.getElementById('sq-panel').offsetHeight;
        var panelHeadHeight = document.getElementById('sq-head').offsetHeight;
        var tabHead = document.getElementById('panel-menu').offsetHeight;
        var gridHeight = panelHeight - panelHeadHeight - tabHead;
        return gridHeight;
    }

    queryHelper.reset = function() {
        $('#statistic-button').css('background-color', '#37bc9b');
        $("#statistic-div").slideUp();

        $("#dataGrid").jqxGrid('height', queryHelper.calGridHeight());
        $('#dataGrid').jqxGrid('refresh');
    }

    if (typeof define === 'function' && define.amd) {
        define('queryHelper', [], function() {
            return queryHelper;
        });
    }

    queryHelper.modelInput = function(modelId) {
        $.getJSON('/smartquery/openModel', {
            'modelId': modelId
        }).done(function(rsp) {
            if (rsp.data != null && rsp.data != "") {
                var modelCon = $.parseJSON(rsp.data.modelDetail).taskDetail.cond.children;
                _opt.showInput(modelCon);
            }
        })
    }

    queryHelper.taskInput = function(taskId) {
        $.getJSON('/smartquery/getTaskCondition', {
            'taskId': taskId
        }).done(function(rsp) {
            if (rsp.data != null && rsp.data.length > 0) {
                _opt.showInput(rsp.data);
            }
            $('#gridContainer').height(queryHelper.calGridHeight());
            $("#res-li a").trigger('click');
            _opt.jqxBinding.TryBindResult('#gridContainer', {
                'taskId': taskId,
                'queryType': 1
            });
        });
    }

    queryHelper.exposeJqxBinding = function() {
        return _opt.jqxBinding;
    }
});