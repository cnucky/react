registerLocales(require.context('../../../locales/dataprocess/', false, /\.js/));
define('widget/jqx-binding', ['udp-file-util', 'nova-notify', 'utility/loaders', './tpl-result-demo', './tpl-result-demo-table',
        // '../../../../config',
        '../../module/readcontrol/readJson',
        '../../module/readcontrol/library',
        '../../module/readcontrol/loadEmail',
        '../../module/readcontrol/loadMms',
        '../../module/readcontrol/loadHttp',
        '../../module/readcontrol/loadOther',
        '../../module/readcontrol/loadChat',
        '../../module/readcontrol/loadAddr',
        '../../module/readcontrol/loadAudio',
        '../../tpl/tpl_readEmail',
        '../../tpl/tpl_readMms',
        '../../tpl/tpl_readHttp',
        '../../tpl/tpl_readChat',
        '../../tpl/tpl_readOther',
        '../../tpl/tpl_readAddr',
        '../../tpl/tpl_readAudio',
        'moment'
    ],
    function(udpFileUtil, Notify, loader, resultDemoTpl, resultDemoTableTpl,
        // Config,
        readJson,
        lib,
        loadEmail,
        loadMms,
        loadHttp,
        loadOther,
        loadChat,
        loadAddr,
        loadAudio,
        tpl_readEmail,
        tpl_readMms,
        tpl_readHttp,
        tpl_readChat,
        tpl_readOther,
        tpl_readAddr,
        tpl_readAudio,
        moment
    ) {
        Config = window.__CONF__.framework;
        var smartqueryConfig = window.__CONF__.business.smartquery;
        var readcontrolIp = smartqueryConfig["readcontrolIp"];
        var _resultCount;
        var _taskId;
        var _state;
        var _selectCount = 0;
        var _loadedCount = 0;
        var _recordsLabel;
        var _showstatusbar = true;
        var _shiftActivateState = 'notDetected';
        var _shiftStartIndex;
        var _selectAllActivated = false;
        var _unselectAllActivated = true;
        var _resultTableOpen = false;
        var _demoIndex;
        var _opt;
        var count = 0;

        var support_minority_fonts = false;


        function init(opts) {
            _opt = opts;
            // 更改字体

        }

        function constructSource(result) {

            var datafields = constructDataFields(result);
            return {
                localdata: constructdata(result, datafields),
                datafields: datafields,
                datatype: "array",
            };
        }

        function constructVirtualSource(taskID, resultData) {
            var datafields = constructDataFields(resultData);
            var source = {
                //localdata: {},
                datatype: "json",
                type: "GET",
                url: "/smartquery/smartquery/getintelligentqueryresult",
                data: {
                    taskId: taskID,
                    needMeta: 1,
                    startIndex: 1,
                    length: 1000
                },
                datafields: constructDataFields(resultData),
                totalrecords: 5000,
            };
        }

        function constructdata(result, datafields) {


            var dataArr = new Array();

            var records = result.records;
            for (var i = 0; i < records.length; i++) {
                var row = {};
                var record = records[i];
                for (var j = 0; j < datafields.length; j++) {
                    var field = datafields[j];

                    var dateformat = undefined;
                    var needParseInt = false;
                    switch (field.type.toLowerCase()) {
                        case 'date':
                            dateformat = "YYYY-MM-DD";
                            break;
                        case 'datetime':
                            dateformat = "YYYY-MM-DD HH:mm:ss";
                            break;
                        case 'number':
                            needParseInt = true;
                            break;
                        default:
                            break;
                    }
                    var data = record[j];
                    if (dateformat) {
                        var formatDate = moment(data).format(dateformat)
                            // var formatDate = new Date(data)
                        row[field.name] = formatDate == 'Invalid date' ? '' : formatDate;

                    } else {
                        if (needParseInt) {
                            if ((typeof data) == 'string' && data.indexOf('.') >= 0) {
                                row[field.name] = isNaN(parseFloat(data)) ? '' : parseFloat(data);
                            } else {
                                row[field.name] = isNaN(parseInt(data)) ? '' : parseInt(data);
                            }



                        } else {
                            row[field.name] = data == 'NULL' ? '' : data;
                            // row[field.name] = (data == 'NULL' || data=='undefined' || data==undefined) ? '' : data;
                        }
                    }

                }
                dataArr.push(row);
            }
            return dataArr;
        }

        function constructColumns(result) {
            var columns = new Array();

            var className;

            if (
                _.findWhere(result.meta, {
                    name: 'filename'
                }) != undefined
                /*&& _.findWhere(result.meta, {
                        name: 'INTERCEPT_TIME'
                        }) != undefined*/
            ) {
                className = 'jqx-filename-cell';
            }

            for (var i = 0; i < result.meta.length; i++) {
                var column = {};
                var obj = result.meta[i];
                column.datafield = obj.name;
                column.text = obj.caption;
                column.width = 100;
                column.minwidth = 100;
                // column.maxwidth = 200;
                column.codeTag = obj.codeTag;
                column.codeTable = obj.codeTable;
                column.codeField = obj.codeField;
                column.codeDisNameField = obj.codeDisNameField;

                if (obj.name.toLowerCase() == 'filename' && className) {
                    column.cellclassname = className;
                    column.editable = false;
                }

                switch (obj.type.toLowerCase()) {
                    case 'date':
                        column.cellsformat = 'yyyy-MM-dd';
                        column.datatype = 'date';
                        column.filtertype = 'range';
                        break;
                    case 'datetime':
                        column.cellsformat = 'yyyy-MM-dd HH:mm:ss';
                        column.datatype = 'datetime';
                        break;
                    case 'decimal':
                        if (column.codeTag == 1)
                            column.datatype = 'string';
                        else {
                            column.datatype = 'decimal';
                            column.cellsalign = 'right'
                        }
                        break;
                    case 'int':
                    case 'bigint':
                    case 'double':
                        column.datatype = 'decimal';
                        column.cellsalign = 'right';
                        break;
                    case 'string':
                    default:
                        column.datatype = 'string';
                        break;
                }
                column.headertext = obj.caption;

                columns.push(column);
            }
            return columns;
        }

        function constructDataFields(result) {
            var datafields = new Array();
            for (var i = 0; i < result.meta.length; i++) {
                var field = {};
                var obj = result.meta[i];

                field.name = obj.name;
                switch (obj.type.toLowerCase()) {
                    case 'date':
                        field.type = 'date';
                        break;
                    case 'datetime':
                        field.type = 'datetime';
                        break;
                    case 'decimal':
                        if (obj.codeTag == 1)
                            field.type = 'string';
                        else
                            field.type = 'number';
                        break;

                    case 'int':
                    case 'bigint':
                    case 'double':
                        field.type = 'number';
                        break;
                    case 'string':
                        field.type = 'string';
                        break;
                    default:
                        field.type = 'string';
                        break;
                }
                datafields.push(field);
            }
            return datafields;
        }

        function TryBindResult(container, queryCond) {
            var load = loader(container);
            // console.log('try')
            switch (queryCond.queryType) {
                case 1: //提交任务查询 
                    {
                        _taskId = queryCond.taskId;
                        var length = Config['smartQueryFirstBatchResult'];
                        TryBindTotalResult(_taskId, 0, length).then(function(rsp) {
                            _resultCount = rsp.resultCount;
                            _selectCount = 0;
                            // rsp.records = [];
                            jqxDataBinding(container, rsp);
                        }).catch(function(err) {
                            load.hide();
                            $(container).empty().append('<p style="white-space: nowrap; float: left; margin-left: 50%; position: relative; left: -32.5px; top: 269px;">获取结果失败...</p>')
                        });
                        break;
                    }
                case 2: //数据预览
                    {
                        //edit by hjw,临时解决上方表头出现statusbar和undefined的问题

                        _showstatusbar = false;
                        TryPreviewData(queryCond.dataType, queryCond.queryArea).then(function(rsp) {
                            jqxDataBinding(container, rsp);
                            $('#statusbardataGrid').hide();
                            // $('#dataGrid').jqxGrid({showstatusbar:false})
                        }).catch(function(err) {
                            load.hide();
                            $(container).empty().append('<p style="white-space: nowrap; float: left; margin-left: 50%; position: relative; left: -32.5px; top: 269px;">获取结果失败...</p>')
                        });
                        break;
                    }
                default:
                    break;
            }
        }
        var jqxhr;
        var stopFlag = false;

        function TryBindTotalResult(taskID, startIndex, length) {

            var dfd = Q.defer();
            stopFlag = false;

            function request() {

                jqxhr = $.getJSON("/smartquery/smartquery/getintelligentqueryresult", {
                    taskId: taskID,
                    needMeta: 1,
                    startIndex: startIndex,
                    length: length
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
                        } else if (stopFlag) {
                            dfd.reject({
                                progress: undefined,
                                hints: '查询数据源失败,在等待查询结果时切换数据类型,终止当前查询',
                                type: 'switchDataType'
                            });
                            // $('#gridContainer').empty();
                            stopFlag = false;
                        } else {
                            rsp = {};
                            setTimeout(function() {
                                request()
                            }, 50);
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

        function stopCurrentQuery() {
            stopFlag = true;
        }

        //edit by huangjingwei
        //添加边栏表格查看功能，双击事件响应弹出表格
        //变量声明
        var $splitter;
        var $wrapbox;
        var $tableContainer;
        var initHeight, initWidth;

        //数据管理功能  预览数据时使用
        //datatype 数据类型
        //queryArea  0-历史区 1-历史区+实时区
        function TryPreviewData(datatype, queryArea) {

            var dfd = Q.defer();
            var jqxhr = $.getJSON("/smartquery/smartquery/previewNodeData", {
                centerCode: datatype.centerCode,
                zoneId: datatype.zoneId,
                typeId: datatype.typeId,
                length: datatype.length,
                queryArea: queryArea
            }, function(rsp) {
                if (rsp.code == 0) {
                    loaded = !_.isEmpty(rsp.data);
                    dfd.resolve(rsp.data);
                } else {
                    dfd.reject({
                        progress: undefined,
                        hints: '查询数据源失败' + (rsp.message ? '：' + rsp.message : '')
                    });
                }
            });
            return dfd.promise;
        }


        function jqxDataBinding(container, resultdata) {
            // console.log('showstatusbar')
            // console.log(_showstatusbar)
            storeMetaToSession(resultdata.meta);

            initHeight = window.innerHeight - $('#grid-div').offset().top - 2;
            var id = container.slice(1, container.length)

            var splitterHtml = '<div id="mainSplitter" ><div class="splitter-panel" id="tableBox"><div id="' + id + '" style="height:' + initHeight + 'px"></div></div><div class="splitter-panel" id="wrapBox"></div></div>';
            $('#grid-div').empty();
            $('#grid-div').append(splitterHtml);

            var containerId = '#dataGrid';
            $(containerId).remove();

            $(container).html('<div id="dataGrid" style="display:none;border:0"></div>');
            $(containerId).show();
            $(containerId).jqxGrid('clearfilters');
            $(containerId).jqxGrid('clearselection');
            $(containerId).jqxGrid('clear');

            columns = constructColumns(resultdata);
            var source = constructSource(resultdata);
            var dataAdapter = new $.jqx.dataAdapter(source, {
                formatData: function(data) {
                    data.name_startsWith = $("#search-input").val();
                    return data;
                }
            });

            $(containerId).jqxGrid({
                source: dataAdapter,
                columns: columns,
                sortable: true,
                //  pageable: true,
                columnsresize: true,
                // pagermode: 'simple',
                theme: 'bootstrap',
                autoshowfiltericon: true,
                width: '100%',
                height: '100%',
                clipboard: true,
                showfiltercolumnbackground: true,
                editable: false,
                // showfilterrow: true,
                // editmode: 'selectedcell',
                //    pagesize: 1000,
                selectionmode: 'multiplerowscustomed',
                // selectionmode: 'multiplerowsadvanced',
                // selectionmode: 'checkbox',
                keyboardnavigation: true,
                localization: getLocalization("ch"),
                rendered: function() {
                    hideLoader();
                    $(containerId).jqxGrid('autoresizecolumns', 'all');
                },
                showstatusbar: _showstatusbar,
                renderstatusbar: function(statusbar) {
                    // appends buttons to the status bar.
                    _loadedCount = $(containerId).jqxGrid('getrows').length;
                    var disabledButtonState = _loadedCount == _resultCount ? "disabled='disabled'" : "";
                    var container = $("<div style='overflow: hidden; position: relative; margin: 5px;'></div>");
                    var searchButton = $("<button id ='searchButton' class='btn btn-xs btn-default' style='float: left; margin-left: 5px;' " + disabledButtonState + "><span class='fa fa-angle-double-right' style='margin-left: 4px; position: relative; '>下一批</span></button>");
                    var LoadingTip = $("<span id='loadingTip' style='display:none;margin-left: 4px; position: relative; top: 4px;'>正在获取数据，请稍等...</span>");
                    _recordsLabel = $("<div id='recordsLabel' style='margin-right: 7px; float: right; margin-left: 0px;'></div>");
                    //  var selectCount = $(containerId).jqxGrid('getselectedrowindex').length;
                    var _hint = $("<div id='hint' style='float:right;display:none'></div>");
                    var recordsLimit = 20000;
                    _recordsLabel.text('当前 ' + _loadedCount + ' 选中 ' + _selectCount + ' 共 ' + _resultCount + ',界面最多支持展示20000条数据')

                    _recordsLabel.text('当前 ' + _loadedCount + ' 选中 ' + _selectCount + ' 共 ' + _resultCount)
                    _hint.text(',最多支持展示' + recordsLimit);

                    container.append(searchButton);
                    container.append(LoadingTip);
                    container.append(_hint);
                    container.append(_recordsLabel);

                    statusbar.append(container);

                    if (_resultCount > recordsLimit) {
                        _hint.show();
                    }
                    // _state = $(containerId).jqxGrid('savestate');
                    $('#searchButton').on('click', function(event) {
                        //   $(containerId).jqxGrid('loadstate', _state);
                        $('#searchButton').attr('disabled', 'disabled');
                        $('#loadingTip').show();
                        var startIndex = $(containerId).jqxGrid('getboundrows').length;
                        TryBindTotalResult(_taskId, startIndex, 10000).then(function(rsp) {
                            $(containerId).jqxGrid('removesort');
                            
                            $(containerId).jqxGrid('addrow', null, constructdata(rsp, constructDataFields(rsp)));
                            _loadedCount = $(containerId).jqxGrid('getrows').length;
                            _recordsLabel.text('当前 ' + _loadedCount + ' 选中 ' + _selectCount + ' 共 ' + _resultCount);
                            if (_loadedCount < recordsLimit) {
                                $('#searchButton').removeAttr('disabled');
                            }
                            if ($('#statistic-div').is(':visible')) {
                                // _opt.refreshStatitic();
                                $('#hidden-refresh').trigger('click')
                            }
                            $('#loadingTip').hide();
                        });
                    });
                }
            });
            gridEvent(containerId);
        }

        function getRecordCount() {

            return _resultCount;
        }

        function gridEvent(containerId) {
            function updatePageCount(cid) {
                _selectCount = $(cid).jqxGrid('selectedrowindexes').length;
                if (_selectCount > _loadedCount) {
                    _selectCount = _loadedCount;
                }
                _recordsLabel.text('当前 ' + _loadedCount + ' 选中 ' + _selectCount + ' 共 ' + _resultCount)
            }

            $(containerId).on("pagechanged", function(event) {
                $(containerId).jqxGrid('autoresizecolumns');
            });
            $(containerId).on("groupschanged", function(event) {
                $(containerId).jqxGrid('autoresizecolumns');
                $('#dataGrid').trigger('initialized');
            });
            $(containerId).on("groupcollapse", function(event) {
                $(containerId).jqxGrid('autoresizecolumns');
                $('#dataGrid').trigger('initialized');
            });

            $(containerId).on("groupexpand", function(event) {
                $(containerId).jqxGrid('autoresizecolumns');
                $('#dataGrid').trigger('initialized');

            });
            $(containerId).on("filter", function(event) {
                _shiftStartIndex = undefined;
                // $(containerId).jqxGrid('autoresizecolumns');
                $('#dataGrid').trigger('initialized');
                updatePageCount(containerId);

            });
            $(containerId).on("sort", function(event) {
                _shiftStartIndex = undefined;

            });

            $(containerId).on("initialized", function(event) {
                var instance = $(containerId).jqxGrid('getInstance');
                $(instance._checkboxcolumn.checkboxelement).on('change', function(event) {
                    // console.log('in checkboxelement changed')
                    if (event.args.checked == true) {
                        _selectAllActivated = true;
                        // console.log('in checkboxelement true')

                        setTimeout(function() {
                            _selectAllActivated = false;
                            $('.readCont .panel-heading').empty();
                            $('#tableContainer tbody').empty();
                            updatePageCount(containerId);

                        }, 500);
                    } else if (event.args.checked == false && _unselectAllActivated == true) {
                        // console.log('in checkboxelement false')
                        setTimeout(function() {
                            $('.readCont .panel-heading').empty();
                            updatePageCount(containerId);

                        }, 100);


                    } else if (event.args.checked == null) {
                        // console.log('in checkboxelement null')
                    }
                });
            });


            $(containerId).on("rowunselect", function(event) {
                if (_selectAllActivated == true) {
                    return;
                }
                if (_shiftActivateState == 'activated') {
                    return;
                }
                updatePageCount(containerId)
            })
            $(containerId).on("rowselect", function(event) {
                if (_selectAllActivated == true) {
                    return;
                }
                if (_shiftActivateState == 'activated') {
                    return;
                }

                var rowDisplayIndex = $(containerId).jqxGrid('getrowdisplayindex', event.args.rowindex);
                var instance = $(containerId).jqxGrid('getInstance');
                // console.log(instance)

                if (_shiftActivateState == 'notDetected') {
                    // console.log('in rowselect')

                    // renderWrapBox();
                    // console.log(_resultTableOpen)
                    if (_resultTableOpen) {

                        var data = generateWrapBoxData(event);
                        var boundata = getBoundata(event);
                        refreshWrapBox(data, boundata);
                    }

                    _shiftStartIndex = rowDisplayIndex;

                    instance.setcellvalue(event.args.rowindex, '_checkboxcolumn', true);

                }

                updatePageCount(containerId)
            });



            $(containerId).on('cellclick', function(event) {
                if (event.args.datafield == 'filename') {
                    event.preventDefault();

                    var data = {
                        fileName: event.args.value,
                        //interceptTime: event.args.row.bounddata.INTERCEPT_TIME,
                    }
                    var opts = {};
                    opts.fileName = data.fileName;
                    opts.uuidName = data.fileName;
                    udpFileUtil.downloadFile(opts);
                }
            })

            //edit by huangjingwei
            $(containerId).on('rowdoubleclick', function(event) {
                var data = generateWrapBoxData(event);
                var boundata = getBoundata(event);
                setTimeout(function() {
                    renderWrapBox();
                    initSplitter();
                    refreshWrapBox(data, boundata);
                }, 50)


                // $(containerId).jqxGrid('clearselection');
                // $(containerId).jqxGrid('selectrow', event.args.rowindex);

            });

            // $(containerId).on('filter', function(event) {
            //     var filterinfo = $(containerId).jqxGrid('getfilterinformation');
            //     var filtinfo = $(containerId).jqxGrid('getdisplayrows');
            //     // console.log(filtinfo)
            //     if(filtinfo.length == 0){
            //         console.log(columns)
            //         console.log(dataAdapter)
            //          $(containerId).jqxGrid({
            //             columns: columns,
            //             source: [],
            //          });
            //     }
            // });

            $(window).on('keydown', function(event) {
                if (event.which == 16) {
                    _shiftActivateState = 'activated'
                }
            })

            $(window).on('keyup', function(event) {
                if (event.which == 16) {
                    _shiftActivateState = 'notDetected'
                    setTimeout(function() {
                        updatePageCount(containerId)
                    }, 100);
                }
            })

            // $(document).on("click", "#fontFamily li a", function() {
            //     $(this).addClass("a").parent().siblings().find("a").removeClass("a");
            //     var newFontFamily = $(this).attr("code");
            //     $("#tab1_1").find(".checkkeyword,.checkkeyword pre").each(function() {
            //         $(this).css("font-family", newFontFamily);
            //     });
            //     if (contType == "email" || contType == "http") {
            //         $("#tplContBox").children("iframe").contents().find(".checkkeyword").css("font-family", newFontFamily);
            //     }
            // });


            // //更改主题编码&内容编码
            $(document).on("click", '#titleEnCode li a,#contEnCode li a', function() {
                $(this).addClass("a").parent().siblings().find("a").removeClass("a");
                var $encodeType = $(this).parents("ul:first").attr("id") == "titleEnCode" ? "subjectEncode" : "contentEncode";
                readJson.load_json_cont(fileUrl, changeEncode($encodeType, $(this).attr("code")), function(url, cont) {
                    cont = JSON.parse(cont);
                    switch (contType) {
                        case "email":
                            loadEmail.load_email_cont(cont.obj, markWord, false);
                            break;
                        case "http":
                            loadHttp.load_http_cont(cont.obj, markWord, false);
                            break;
                        case "mms":
                            loadMms.load_mms_cont(cont.obj);
                            break;
                        case "other":
                            loadOther.load_other_cont(cont);
                            break;
                        case "addr":
                            loadAddr.load_addr_cont(cont.obj);
                            break;
                    }
                    $(".readCont").find(".checkkeyword").each(function() {
                        lib.SearchHighlight($(this), markWord);
                    });
                });
            });


            // //http切换视图
            // $(document).on("click", '#viewType li a', function() {
            //     $(this).addClass("a").parent().siblings().find("a").removeClass("a");
            //     var num = $(this).parent().index();
            //     var p1 = $("#contEnCode").parents(".btn-group:first");
            //     var p2 = $("#fontFamily").parents(".btn-group:first");
            //     var cont = $("#tplContBox").children(".content");
            //     cont.eq(num).show();
            //     cont.eq(num).siblings(".content").hide();
            //     if (num != 0) {
            //         p1.hide();
            //         p2.hide();
            //     } else {
            //         p1.show();
            //         p2.show();
            //     }
            //     //加载16进制内容
            //     if (num == 2) {
            //         params.push({
            //             key: "hexBytes",
            //             val: "1"
            //         });
            //         readJson.load_json_cont("/readcontrol/dataprocess/ProtocolAnalysis", params, function(url, data) {
            //             data = JSON.parse(data);
            //             if (data.code != 0) {
            //                 Notify.show({
            //                     title: data.msg,
            //                     type: "error"
            //                 });
            //                 return;
            //             }
            //             $(".content").eq(2).html('<pre style="min-width: 620px;">' + data.obj.bytes.replace(/</ig, "&lt;").replace(/>/ig, "&gt;").replace(/\r\n/ig, "<br>") + '</pre>');
            //         })
            //     }

            // });


            //查看、收起情/更多
            $(document).on('click', '.readCont h5 a.fa', function(e) {
                e.preventDefault();
                $(this).parent().next().fadeToggle("fast");
                if ($(this).hasClass("fa-minus-square")) {
                    $(this).attr("class", "fa fa-plus-square");
                } else {
                    $(this).attr("class", "fa fa-minus-square");
                }
            });


        }

        //编码信息更改
        function changeEncode(type, val) {
            for (var i = 0; i < params.length; i++) {
                if (params[i].key == type) params.splice(i, 1);
            }
            params.push({
                "key": type,
                "val": val
            });
            return params;
        }

        function selectAllCallback(event) {}

        function getBoundata(event) {
            var bounddata;
            var data = [];
            if (event.type == 'rowdoubleclick') {
                bounddata = event.args.row.bounddata;
            }
            if (event.type == 'rowselect') {
                bounddata = event.args.row;
            }
            var instance = $('#dataGrid').jqxGrid('getInstance');
            var columns = instance._columns;

            var translateCodeArray = [];
            for (var j = 0, k = columns.length; j < k; j++) {
                if (columns[j] && columns[j].codeTag == 1) {
                    var codeNeedTranslate = {};
                    codeNeedTranslate.codeTable = columns[j].codeTable;
                    codeNeedTranslate.codeField = columns[j].codeField;
                    codeNeedTranslate.codeDisNameField = columns[j].codeDisNameField;
                    codeNeedTranslate.queryWord = [bounddata[columns[j].datafield]];
                    translateCodeArray.push(codeNeedTranslate);
                }
            }

            var flag = true;
            for (var item in bounddata) {
                if (item.toUpperCase() == "FILENAME" && bounddata[item] != "") flag = false;
            }

            if (flag) {
                var i = 0;
                for (var item in bounddata) {
                    var row = {};
                    row['key'] = item;
                    row['val'] = bounddata[item];
                    data[i] = row;
                    i++;
                }
                return data
            } else {
                var codeTableResult = [];
                $.ajax({
                    type: 'POST',
                    url: '/smartquery/smartquery/getCodeTableBatch',
                    data: {
                        data: translateCodeArray
                    },
                    async: false,
                    dataType: 'text',
                    success: function(result) {
                        result = JSON.parse(result);
                        codeTableResult = result.data;
                    },
                    error: function(errorMsg) {
                        console.log(errorMsg);
                    }
                });

                var i = 0;
                for (var item in bounddata) {
                    var row = {};
                    row['key'] = item;
                    row['val'] = bounddata[item];

                    if (columns[i] && columns[i].codeTag == 1) {
                        var thisCodeTable;
                        thisCodeTable = columns[i].codeTable;
                        // bounddata[item] = codeTableResult.thisCodeTable;
                        row['val'] = codeTableResult[thisCodeTable][0];
                    }

                    data[i] = row;
                    i++;
                }
                return data
            }
        }

        function generateWrapBoxData(event) {
            var bounddata;
            if (event.type == 'rowdoubleclick') {
                bounddata = event.args.row.bounddata;

            }
            if (event.type == 'rowselect') {
                bounddata = event.args.row;
            }


            var gridColumns = $('#dataGrid').jqxGrid('columns');
            var displayNameMap = {};
            _.each(gridColumns.records, function(col) {

                if (col.displayfield != null) {
                    displayNameMap[col.displayfield] = col.text;
                }
            })

            var tableData = [];
            var i = 0;
            var instance = $('#dataGrid').jqxGrid('getInstance');
            var columns = instance._columns;
            for (var item in bounddata) {
                var row = {};
                var text = displayNameMap[item]
                if (text != null) {
                    var dateformat = undefined;
                    if (columns[i].datatype == 'datetime') {
                        dateformat = "YYYY-MM-DD HH:mm:ss";
                    }
                    if (columns[i].datatype == 'date') {
                        dateformat = "YYYY-MM-DD";
                    }
                    if (dateformat) {
                        var formatDate = moment(bounddata[item]).format(dateformat)
                            // var formatDate = new Date(bounddata[item])
                        bounddata[item] = formatDate == 'Invalid date' ? '' : formatDate;

                    }
                    row['key'] = text;
                    row['value'] = bounddata[item];
                    tableData[i] = row;
                    i++;
                }
            }
            var data = {};
            data.tableData = tableData;
            data.rowindex = event.args.rowindex;
            return data;

        }


        function renderWrapBox() {

            $wrapbox = $('#wrapBox');
            $wrapbox.html(_.template(resultDemoTpl)());
            $wrapbox.show();


        }

        //refresh table data only
        function refreshWrapBox(data, bounddata) {
            var passParamsObj = {};
            passParamsObj.tableData = data.tableData;
            var tableHtml = _.template(resultDemoTableTpl)(passParamsObj);
            // var tab1 = document.getElementById('tab1');
            // tab1.innerHTML = tableHtml;
            $tableContainer = $('#tableContainer');
            if ($tableContainer) {
                $tableContainer.html(tableHtml);

                var panelHeadingHtml = '<span class="pull-right fs12"><a href="javascript:void(0)" class="pre">上一条</a><a href="javascript:void(0)" class="next">下一条</a>' +
                    '<a href="javascript:void(0)" class="close" title="关闭" style="opacity:0.8!important;margin-left:10px;margin-top:13px;"><span class="fa fa-times" id="close-span" style="color:#3498db;font-size: 18px"></span></a></span>' +
                    '<ul class="nav panel-tabs-border panel-tabs panel-tabs-left" style="max-width: 302px;border-bottom:none;height:100%">' +
                    '<li class="active"><a href="#tab1_1" data-toggle="tab" aria-expanded="true">主文件内容</a></li><li class=""><a href="#tableContainer" data-toggle="tab" aria-expanded="false">结构化信息</a>' +
                    '</li></ul>'; //

                $('.readCont .panel-heading').empty();
                $('.readCont .panel-heading').append(panelHeadingHtml);

                refreshContent(bounddata);

                $('#close-span').on('click', function() {
                    closeSplitter();
                });

                $('.readCont a.show-record').on('click', function() {
                    $('#dataGrid').jqxGrid('ensurerowvisible', data.rowindex);
                })

                if (data.rowindex != 0) {
                    $('.readCont a.pre').on('click', function() {
                        _unselectAllActivated = false;
                        $('#dataGrid').jqxGrid('clearselection');
                        $('#dataGrid').jqxGrid('selectrow', data.rowindex - 1);
                        var rowDisplayIndex = $('#dataGrid').jqxGrid('getrowdisplayindex', data.rowindex);
                        $('#dataGrid').jqxGrid('ensurerowvisible', rowDisplayIndex - 1);
                        _unselectAllActivated = true;
                    });
                } else {
                    $('.readCont a.pre').hide();
                }

                if (data.rowindex != _loadedCount - 1) {
                    $('.readCont a.next').on('click', function() {
                        _unselectAllActivated = false;
                        $('#dataGrid').jqxGrid('clearselection');
                        $('#dataGrid').jqxGrid('selectrow', data.rowindex + 1);
                        var rowDisplayIndex = $('#dataGrid').jqxGrid('getrowdisplayindex', data.rowindex);
                        $('#dataGrid').jqxGrid('ensurerowvisible', rowDisplayIndex + 1);
                        _unselectAllActivated = true;
                    });
                } else {
                    $('.readCont a.next').hide();
                }




            }
            _demoIndex = data.rowindex;
            // initSplitter();

        }


        //附件阅读变量
        var $wrapBox = $("#wrapBox");
        var params = []; //传入接口参数
        var serverIp;
        $.getJSON("/smartquery/smartquery/dnsip", {
            dnsFind: readcontrolIp,
        }, function(rsp) {
            console.log(rsp)
            serverIp = rsp.data;
        }); //Config['attachServerIp'];

        //Config['attachServerIp'];
        var markWord = "no_sush_words"; //关键字 多个关键字用空格分开

        function refreshContent(boundata) {
            //加载页面基本模板及结构化信息
            var flag = true;
            params = boundata;

            $.each(params, function(i, val) {
                val.key = val.key.toUpperCase();
                if (val.key.toUpperCase() == "FILENAME" && val.val != "") {
                    flag = false;
                    // params.push({
                    //     key: "FILENAME",
                    //     val: val.val
                    // })
                }
            });
            params.push({
                key: "contentEncode",
                val: ""
            });

            var useDefaultServerIp = true;
            //代码表转化
            $.each(params, function(i, val) {
                if (val.key.toUpperCase() == "FILEREADSERVERIP" && val.val != "") {
                    serverIp = val.val;
                    useDefaultServerIp = false;
                }
                // if (val.key.toUpperCase() == "ACT_TYPE" && val.val != "") {
                //     val.val = "MAIL_READ_ATT";
                //     // serverIp = val.val;
                //     // useDefaultServerIp = false;
                // }
                // if (val.key.toUpperCase() == "FILE_TYPE" && val.val != "") {
                //     val.val = "CDP_MIME";
                // }

            });
            if (useDefaultServerIp)
                params.push({
                    key: "fileReadServerIp",
                    val: serverIp
                });

            params.push({
                key: "businessType",
                val: 2
            });

            if (flag) {
                var $p_header = $("#wrapBox").find(".panel-heading");
                $p_header.find("ul li:first").hide();
                $p_header.find("ul li:last").addClass("active");
                $("#tableContainer").show();
                $("#tab1_1").hide();
                return;
            }
            //读取解析结果
            readJson.load_json_cont("/readcontrol/dataprocess/ProtocolAnalysis", params, function(url, data) {
                data = JSON.parse(data);
                // console.log(data);
                // $("#testBox").find("textarea").eq(1).val(JSON.stringify(data,"",4)).css("height","300px");
                switch (data.code) {
                    case "0":
                        var msg = '';
                        if (data.warnings && data.warnings.length > 0) {
                            for (var i = 0; i < data.warnings.length; i++) {
                                msg += data.warnings[i] + "</br>";
                            }
                            Notify.show({
                                title: msg,
                                type: "error"
                            });
                        }
                        $wrapBox.css("min-height", "1000px");
                        break;
                    case "1":
                        Notify.show({
                            title: data.msg,
                            type: "error"
                        });
                        break;
                    case "2":
                        Notify.show({
                            title: data.msg,
                            type: "error"
                        });
                        $("#savaUrl").parent().hide();
                        return;
                        break;
                }


                fileUrl = url;
                contType = data.type;
                // //根据内容类型加载相应的模板
                var $readCont = $(".readCont");
                $readCont.attr("id", contType + "-page");
                var tplName = "tpl_read" + contType.substring(0, 1).toUpperCase() + contType.substring(1);
                $("#tab1_1").html(_.template(eval(tplName))());
                $("#tab1_1 .tab-content > .tab-pane").show();
                $("#tab1_1 [data-i18n]").localize();
                $("#tab1_1").addClass("active");
                $("#tab1_1").show();
                $("#tableContainer").hide();
                // //加载保存信息

                if (data.code == 0 || data.code == 1) {
                    load_sava_addr(data.metaFiles);
                }
                //加载模板内容
                load_template_cont(data);
            });

            //加载模板内容
            function load_template_cont(data) {
                switch (contType) {
                    case "email":
                        loadEmail.load_encode_info();
                        loadEmail.load_email_cont(data.obj, markWord, true);
                        break;
                    case "mms":
                        loadMms.load_encode_info();
                        loadMms.load_mms_cont(data.obj);
                        break;
                    case "http":
                        loadHttp.load_encode_info();
                        loadHttp.load_http_cont(data.obj, markWord, true);
                        break;
                    case "chat":
                        loadChat.load_encode_info();
                        loadChat.load_chat_cont(data.obj);
                        break;
                    case "other":
                        loadOther.load_encode_info();
                        loadOther.load_other_cont(data);
                        break;
                    case "addr":
                        loadAddr.load_encode_info();
                        loadAddr.load_addr_cont(data.obj);
                        break;
                    case "audio":
                        loadAudio.load_audio_cont(data.obj, serverIp);
                        break;
                }

                load_sava_addr(data.metaFiles);
                if (!support_minority_fonts) {
                    $("#fontFamily").parent().addClass("hidden");
                }


                //显示关键字
                $(".readCont").find(".checkkeyword").each(function() {
                    lib.SearchHighlight($(this), markWord);
                });
            }
            //加载保存路径
            function load_sava_addr(addr) {
                if (lib.checkBlank(addr)) {
                    $("#warpBoxTools").show();
                    var savaUrlUl = $("#savaUrl");
                    savaUrlUl.find("li:eq(0) a").attr("href", lib.replace_server_IP(lib.get_file_href(addr, "ctype", "inxx").path, serverIp));
                    savaUrlUl.find("li:eq(1) a").attr("href", lib.replace_server_IP(lib.get_file_href(addr, "ctype", "offxx").path, serverIp));
                }
            }
        }

        function initSplitter() {
            $splitter = $('#mainSplitter');
            initHeight = window.innerHeight - $splitter.offset().top - 2;
            initWidth = window.innerWidth - $('#grid-div').offset().left;

            //wrapbox has to be initialized by now
            var conf_size = 400;
            var minSpace = 100;


            $splitter.jqxSplitter({
                width: initWidth,
                height: initHeight,
                showSplitBar: true,
                orientation: 'vertical',
                panels: [{
                    size: initWidth - conf_size - 7,
                    min: minSpace,
                    collapsible: false
                }]
            });

            tableContainer = $('#tableContainer');
            var tableHeight = window.innerHeight - $('.readCont .panel-body').offset().top - 40;
            tableContainer.height(tableHeight);

            resizeGrid();
            $splitter.on('resize', function() {
                resizeGrid();
            })
            _resultTableOpen = true;

        }

        function closeSplitter() {
            $splitter = $('#mainSplitter');
            initHeight = window.innerHeight - $splitter.offset().top - 2;
            initWidth = window.innerWidth - $('#grid-div').offset().left;
            $splitter.jqxSplitter({
                width: initWidth,
                height: initHeight,
                showSplitBar: false,
                panels: [{
                    size: initWidth
                }]
            });
            $wrapbox.hide();
            resizeGrid();
            _resultTableOpen = false;
        }

        function resizeGrid() {
            $('#dataGrid').jqxGrid('width', $('#tableBox').width() - 2);
        }

        function isResultTableOpen() {
            return _resultTableOpen;
        }

        function storeMetaToSession(meta) {
            window.sessionStorage.setItem('smartqueryMeta', JSON.stringify(meta))
        }



        function getLocalization(culture) {
            var localization = null;
            switch (culture) {
                case "ch":
                    localization = {
                        // separator of parts of a date (e.g. '/' in 11/05/1955)
                        '/': "/",
                        // separator of parts of a time (e.g. ':' in 05:44 PM)
                        ':': ":",
                        // the first day of the week (0 = Sunday, 1 = Monday, etc)
                        firstDay: 0,
                        days: {
                            // full day names
                            names: ["日", "一", "二", "三", "四", "五", "六"],
                            // abbreviated day names
                            namesAbbr: ["日", "一", "二", "三", "四", "五", "六"],
                            // shortest day names
                            namesShort: ["日", "一", "二", "三", "四", "五", "六"]
                        },
                        months: {
                            // full month names (13 months for lunar calendards -- 13th month should be "" if not lunar)
                            names: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月", ""],
                            // abbreviated month names
                            namesAbbr: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月", ""]
                        },
                        // AM and PM designators in one of these forms:
                        // The usual view, and the upper and lower case versions
                        //      [standard,lowercase,uppercase]
                        // The culture does not use AM or PM (likely all standard date formats use 24 hour time)
                        //      null
                        AM: ["AM", "am", "AM"],
                        PM: ["PM", "pm", "PM"],
                        eras: [
                            // eras in reverse chronological order.
                            // name: the name of the era in this culture (e.g. A.D., C.E.)
                            // start: when the era starts in ticks (gregorian, gmt), null if it is the earliest supported era.
                            // offset: offset in years from gregorian calendar
                            {
                                "name": "A.D.",
                                "start": null,
                                "offset": 0
                            }
                        ],
                        twoDigitYearMax: 2029,
                        patterns: {
                            // short date pattern
                            d: "M/d/yyyy",
                            // long date pattern
                            D: "dddd, MMMM dd, yyyy",
                            // short time pattern
                            t: "h:mm tt",
                            // long time pattern
                            T: "h:mm:ss tt",
                            // long date, short time pattern
                            f: "dddd, MMMM dd, yyyy h:mm tt",
                            // long date, long time pattern
                            F: "dddd, MMMM dd, yyyy h:mm:ss tt",
                            // month/day pattern
                            M: "MMMM dd",
                            // month/year pattern
                            Y: "yyyy MMMM",
                            // S is a sortable format that does not vary by culture
                            S: "yyyy\u0027-\u0027MM\u0027-\u0027dd\u0027T\u0027HH\u0027:\u0027mm\u0027:\u0027ss",
                            // formatting of dates in MySQL DataBases
                            ISO: "yyyy-MM-dd hh:mm:ss",
                            ISO2: "yyyy-MM-dd HH:mm:ss",
                            d1: "dd.MM.yyyy",
                            d2: "dd-MM-yyyy",
                            d3: "dd-MMMM-yyyy",
                            d4: "dd-MM-yy",
                            d5: "H:mm",
                            d6: "HH:mm",
                            d7: "HH:mm tt",
                            d8: "dd/MMMM/yyyy",
                            d9: "MMMM-dd",
                            d10: "MM-dd",
                            d11: "MM-dd-yyyy"
                        },
                        percentsymbol: "%",
                        currencysymbol: "$",
                        currencysymbolposition: "before",
                        decimalseparator: '.',
                        thousandsseparator: ',',
                        pagergotopagestring: "转到:",
                        pagershowrowsstring: "显示行数:",
                        pagerrangestring: " 共 ",
                        pagerpreviousbuttonstring: "上一页",
                        pagernextbuttonstring: "下一页",
                        pagerfirstbuttonstring: "首页",
                        pagerlastbuttonstring: "尾页",
                        groupsheaderstring: "拖拽列到此处进行分组",
                        sortascendingstring: "升序排列",
                        sortdescendingstring: "降序排列",
                        sortremovestring: "移除排序",
                        groupbystring: "根据此列分组",
                        groupremovestring: "Remove from groups",
                        filterclearstring: "清空",
                        filterstring: "过滤",
                        filtershowrowstring: "Show rows where:",
                        filterorconditionstring: "或",
                        filterandconditionstring: "与",
                        filterselectallstring: "(选择所有)",
                        filterchoosestring: "请选择:",
                        filterstringcomparisonoperators: ['为空', '不为空', 'enthalten', 'enthalten(match case)',
                            'does not contain', 'does not contain(match case)', '以..开始', 'starts with(match case)',
                            '以..结尾', 'ends with(match case)', '等于', 'equal(match case)', '为空', '不为空'
                        ],
                        filternumericcomparisonoperators: ['equal', 'not equal', '小于', '小于等于', '大于', '大于等于', '为空', '不为空'],
                        filterdatecomparisonoperators: ['等于', '不等于', '小于', '小于等于', '大于', '大于等于', '为空', '不为空'],
                        filterbooleancomparisonoperators: ['等于', '不等于'],
                        validationstring: "输入值无效",
                        emptydatastring: "无查询结果",
                        filterselectstring: "Select Filter",
                        loadtext: "Loading...",
                        clearstring: "清空",
                        todaystring: "今天"
                    }
                    break;
                case "en":
                default:
                    localization = {
                        // separator of parts of a date (e.g. '/' in 11/05/1955)
                        '/': "/",
                        // separator of parts of a time (e.g. ':' in 05:44 PM)
                        ':': ":",
                        // the first day of the week (0 = Sunday, 1 = Monday, etc)
                        firstDay: 0,
                        days: {
                            // full day names
                            names: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                            // abbreviated day names
                            namesAbbr: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                            // shortest day names
                            namesShort: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
                        },
                        months: {
                            // full month names (13 months for lunar calendards -- 13th month should be "" if not lunar)
                            names: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December", ""],
                            // abbreviated month names
                            namesAbbr: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", ""]
                        },
                        // AM and PM designators in one of these forms:
                        // The usual view, and the upper and lower case versions
                        //      [standard,lowercase,uppercase]
                        // The culture does not use AM or PM (likely all standard date formats use 24 hour time)
                        //      null
                        AM: ["AM", "am", "AM"],
                        PM: ["PM", "pm", "PM"],
                        eras: [
                            // eras in reverse chronological order.
                            // name: the name of the era in this culture (e.g. A.D., C.E.)
                            // start: when the era starts in ticks (gregorian, gmt), null if it is the earliest supported era.
                            // offset: offset in years from gregorian calendar
                            {
                                "name": "A.D.",
                                "start": null,
                                "offset": 0
                            }
                        ],
                        twoDigitYearMax: 2029,
                        patterns: {
                            // short date pattern
                            d: "M/d/yyyy",
                            // long date pattern
                            D: "dddd, MMMM dd, yyyy",
                            // short time pattern
                            t: "h:mm tt",
                            // long time pattern
                            T: "h:mm:ss tt",
                            // long date, short time pattern
                            f: "dddd, MMMM dd, yyyy h:mm tt",
                            // long date, long time pattern
                            F: "dddd, MMMM dd, yyyy h:mm:ss tt",
                            // month/day pattern
                            M: "MMMM dd",
                            // month/year pattern
                            Y: "yyyy MMMM",
                            // S is a sortable format that does not vary by culture
                            S: "yyyy\u0027-\u0027MM\u0027-\u0027dd\u0027T\u0027HH\u0027:\u0027mm\u0027:\u0027ss",
                            // formatting of dates in MySQL DataBases
                            ISO: "yyyy-MM-dd hh:mm:ss",
                            ISO2: "yyyy-MM-dd HH:mm:ss",
                            d1: "dd.MM.yyyy",
                            d2: "dd-MM-yyyy",
                            d3: "dd-MMMM-yyyy",
                            d4: "dd-MM-yy",
                            d5: "H:mm",
                            d6: "HH:mm",
                            d7: "HH:mm tt",
                            d8: "dd/MMMM/yyyy",
                            d9: "MMMM-dd",
                            d10: "MM-dd",
                            d11: "MM-dd-yyyy"
                        },
                        percentsymbol: "%",
                        currencysymbol: "$",
                        currencysymbolposition: "before",
                        decimalseparator: '.',
                        thousandsseparator: ',',
                        pagergotopagestring: "Go to page:",
                        pagershowrowsstring: "Show rows:",
                        pagerrangestring: " of ",
                        pagerpreviousbuttonstring: "previous",
                        pagernextbuttonstring: "next",
                        pagerfirstbuttonstring: "first",
                        pagerlastbuttonstring: "last",
                        groupsheaderstring: "Drag a column and drop it here to group by that column",
                        sortascendingstring: "Sort Ascending",
                        sortdescendingstring: "Sort Descending",
                        sortremovestring: "Remove Sort",
                        groupbystring: "Group By this column",
                        groupremovestring: "Remove from groups",
                        filterclearstring: "Clear",
                        filterstring: "Filter",
                        filtershowrowstring: "Show rows where:",
                        filterorconditionstring: "Or",
                        filterandconditionstring: "And",
                        filterselectallstring: "(Select All)",
                        filterchoosestring: "Please Choose:",
                        filterstringcomparisonoperators: ['empty', 'not empty', 'enthalten', 'enthalten(match case)',
                            'does not contain', 'does not contain(match case)', 'starts with', 'starts with(match case)',
                            'ends with', 'ends with(match case)', 'equal', 'equal(match case)', 'null', 'not null'
                        ],
                        filternumericcomparisonoperators: ['equal', 'not equal', 'less than', 'less than or equal', 'greater than', 'greater than or equal', 'null', 'not null'],
                        filterdatecomparisonoperators: ['equal', 'not equal', 'less than', 'less than or equal', 'greater than', 'greater than or equal', 'null', 'not null'],
                        filterbooleancomparisonoperators: ['equal', 'not equal'],
                        validationstring: "Entered value is not valid",
                        emptydatastring: "No data to display",
                        filterselectstring: "Select Filter",
                        loadtext: "Loading...",
                        clearstring: "Clear",
                        todaystring: "Today"
                    }
                    break;
            }
            return localization;
        }

        return {
            init: init,
            jqxDataBinding: jqxDataBinding,
            TryBindResult: TryBindResult,
            constructSource: constructSource,
            constructColumns: constructColumns,
            getRecordCount: getRecordCount,
            initSplitter: initSplitter,
            closeSplitter: closeSplitter,
            isResultTableOpen: isResultTableOpen,
            stopCurrentQuery: stopCurrentQuery,
            selectAllCallback: selectAllCallback
        }

    })