define('./toolbar', [
    '../../tpl/smartquery/tpl-sq-toolbar',
    '../smartquery/smartQueryHelper',
    './udp-jqx-binding',
    //'widget/jqx-binding',
    'utility/loaders',
    '../../../../../../public/widget/personalworktree',
    '../../module/smartquery/jquery.battatech.excelexport',
    'udp-file-util',
    '../smartquery/statistic',
    'moment',
    'nova-dialog',
    'nova-notify',
], function(tplToolbar, queryHelper, jqxBinding, loader, PersonalWorkTree,
            excelexport, udpFileUtil, statistic, moment, Dialog, Notify) {
    var _opt;
    tplToolbar = _.template(tplToolbar);
    var _taskID ;
    var _resultCount;
    var _selectCount;
    var _loadedCount;
    var gismodule;
    /* submit:false,
     saveTask:false,
     saveModel:false,
     saveAsModel:false,
     exportData:true,
     download:true,
     statistic:false,
     filter:true,
     group:true,
     locate:true*/
    function init(opts) {
        _opt = opts;
        gismodule = opts.gismodule;
    }
    var supportGIS = false;


    function renderToolbar() {
        $(_opt.container).empty().append(tplToolbar());

        if (_opt.submit) {
            submitQuery();
        }
        if (_opt.saveTask) {
            saveTask();
        }
        if (_opt.saveModel) {
            saveTpl();
        }
        if (_opt.saveAsModel) {
            saveAsTpl();
        }
        if (_opt.exportData) {
            exportData();
        }
        if (_opt.download) {
            download();
        }
        if (_opt.group) {
            group();
            ungroup();
        }
        if (_opt.filter) {
            filter();
            unfilter();
        }
        if (_opt.locate) {
            getGisQueryConfig().then(function(rsp) {
                if (!_.isEmpty(rsp)) {
                    supportGIS = true;
                    locate();
                } else {
                    supportGIS = false;
                }
            }).catch(function(err) {

            });

        }
        if (_opt.statistic) {
            renderStatisticInfo(_opt.typeId);
        }
        if (_opt.tab) {
            tabSwitch();
        }
        keySearch();

        if (_.isEmpty(_opt.modelId)) {
            $("#save-tpl-button").attr("disabled", true);
        } else {
            $.get('/smartquery/checkModelPermission', {
                "modelId": _opt.modelId
            }, function(rspData) {
                var rsp = $.parseJSON(rspData);
                if (rsp.code == 0) {
                    if (rsp.data == 0) { //1为有权限 0为没有权限
                        $("#save-tpl-button").attr("disabled", true);
                    }
                }
            })
        }
    }
    var jqxhr;
    var getGisQueryConfig = function() {
        var dfd = Q.defer();

        jqxhr = $.get('/smartquery/getGisQueryConfig', _opt.typeId, function(rsp) {
            rsp = JSON.parse(rsp);
            if (rsp.code == 0) {

                dfd.resolve(rsp.data);

            } else {
                dfd.reject();
            }
        });
        return dfd.promise;
    }


    var renderStatisticInfo = function(typeId) {

        $("#statistic-div").resizable({
            ghost: true,
            handles: "n",
            minHeight: 320,
            stop: function(event) {
                var panelHeight = document.getElementById('sq-panel').offsetHeight;
                var panelHeadHeight = document.getElementById('sq-head').offsetHeight;
                var tabHead = document.getElementById('panel-menu').offsetHeight;
                var gridHeight = panelHeight - panelHeadHeight - tabHead;
                $("#dataGrid").jqxGrid('height', gridHeight - event.target.offsetHeight);
                $('#dataGrid').jqxGrid('refresh');
                $('#tabContent').height(event.target.offsetHeight);

                var activeIdString = $('#statisticList .active a').attr('href');
                var activeId = activeIdString.slice(4, activeIdString.length);

                if (barArray[activeId] != null) {
                    var carouselHeight = $('.carousel-inner').css('height');
                    var carouselWidth = $('.carousel-inner').css('width');
                    $('#ec-bar' + activeId).css({
                        height: carouselHeight,
                        width: carouselWidth
                    });
                    $('#ec-pie' + activeId).css({
                        height: carouselHeight,
                        width: carouselWidth
                    });

                } else {

                }
            }
        });

        $("#statistic-button").on("click", function(event) {

            event.preventDefault();

            if ($('#statistic-div').css('display') == 'none') {
                var opt = {
                    dataType: typeId
                }
                statistic.init(opt);
                statistic.refreshTab();
            } else {
                queryHelper.reset();
            }

        });
    }

    //edit bu zhangu
    function saveTplInfo(modelInfo, messageFlag) {
        $.post('/smartquery/saveModel', {
            "modelId": modelInfo.modelId,
            "modelName": modelInfo.modelName,
            "modelDesc": modelInfo.modelDesc,
            "dirId": modelInfo.dirId,
            "modelType": modelInfo.modelType,
            "modelDetail": modelInfo.modelDetail,
        }, function(rspData) {
            var rsp = $.parseJSON(rspData);
            if (rsp.code == 0) {
                if (messageFlag == "1") {
                    Notify.show({
                        title: " 保存模型成功！",
                        type: "success"
                    });
                } else {
                    Notify.show({
                        title: " 模型另存为成功！",
                        type: "success"
                    });
                }

            } else {
                Notify.show({
                    title: rsp.message,
                    type: "warning"
                });
            }
        })
    }

    function updateTplInfo(modelId, modelDetail) {
        $.post('/smartquery/updateModel', {
            "modelId": modelId,
            "modelDetail": modelDetail,
        }, function(rspData) {
            var rsp = $.parseJSON(rspData);
            if (rsp.code == 0) {
                Notify.show({
                    title: " 模型保存成功！",
                    type: "success"
                });
            } else {
                Notify.show({
                    title: rsp.message,
                    type: "warning"
                });
            }
        })
    }


    function showTplTree(title, treeAreaFlag, messageFlag) {
        var temp = '<div><div class="admin-form theme-info"><form><div class="section mt10"><label for="update-file-name" class="field-label">模型名称 *</label><label for="name" class="field"><input style="width:100%" type="text" name="update-file-name" id="update-file-name" class="gui-input"></label></div><div class="section"><label for="update-file-description" class="field-label">描述 *</label><label for="update-file-description" class="field"><input type="text" name="update-file-description" id="update-file-description" class="gui-input"></input></label></div></div><div id="folder-picker"> Loading... </div></form></div>';
        Dialog.build({
            title: title,
            content: temp,
            rightBtnCallback: function() {
                // 确认
                var newParentNode = $("#folder-picker").fancytree("getTree").getActiveNode();
                /* EDIT BY huangjingwei BEGIN*/
                if (newParentNode == undefined) {
                    Notify.show({
                        title: "请选择目录！",
                        type: "warning"
                    });
                    return;
                }
                /* EDIT BY huangjingwei END*/
                var id = newParentNode.key;
                var name = $("#update-file-name").val().trim();
                if (name == null || name == "") {
                    Notify.show({
                        title: "请填写模型名称！",
                        type: "warning"
                    });
                    return;
                }
                var desc = $("#update-file-description").val().trim();
                var modelInfo = {};
                modelInfo.modelId = _opt.modelId;

                modelInfo.modelName = name;
                modelInfo.modelDesc = desc;
                modelInfo.dirId = id;
                modelInfo.modelType = 101; //101专项查询模型类型

                modelInfo['modelDetail'] = JSON.stringify(_opt.queryArg());
                saveTplInfo(modelInfo, messageFlag);

                $.magnificPopup.close();
            }
        }).show(function() {
            $("#folder-picker").empty();
            PersonalWorkTree.buildTree({
                container: $("#folder-picker"),
                treeAreaFlag: treeAreaFlag
            });
        });
    }

    var saveTpl = function() {
        $("#save-tpl-button").show();
        $("#save-tpl-button").on("click", function(event) {
            event.preventDefault();
            var codArg = JSON.stringify(_opt.queryArg());
            updateTplInfo(_opt.modelId, codArg);
        })
    }


    var saveAsTpl = function() {
        $("#save-as-tpl-button").show();
        $("#save-as-tpl-button").on("click", function(event) {
            event.preventDefault();
            var treeAreaFlag = "saveModel";
            if (_opt.modelId == "0") {
                showTplTree("保存模型", treeAreaFlag, "1");
            } else {
                showTplTree("模型另存为", treeAreaFlag, "2");
            }
        })
    }

    //end by zhangu




    function locate() {

        $("#locate-button").hide();
        $("#locate-button").on("click", function(event) {

            $('#map-li a').trigger('click');
            var panelHeight = document.getElementById('sq-panel').offsetHeight;

            var panelHeadHeight = document.getElementById('sq-head').offsetHeight;
            var panelMenu = document.getElementById('panel-menu').offsetHeight;
            var mapHeight = panelHeight - panelHeadHeight - panelMenu;
            $('#map-panel').css('height', mapHeight);

            event.preventDefault();
            $("#map-form").show();

            gismodule.Init({
                container: '#mapContainer',
                traceFlag: true
            });

            var selectedRowIndexs = $('#dataGrid').jqxGrid('getselectedrowindexes');
            var rows = [];

            for (var i = 0; i < selectedRowIndexs.length; i++) {
                var index = selectedRowIndexs[i];
                var row = $('#dataGrid').jqxGrid('getrowdata', index);
                rows.push(row)
            }

            var dataType = _opt.typeId;
            gismodule.makeGisJSON(getRows(), dataType);
        })
    }

    var getRows = function() {
        var selectedRowIndexs = $('#dataGrid').jqxGrid('getselectedrowindexes');
        if (selectedRowIndexs.length == 0) {
            Notify.show({
                title: '',
                type: "info"
            });
            return false;
        }
        var rows = [];
        var dateCol = _.union(_.where(columns, {
            datatype: 'date'
        }), _.where(columns, {
            datatype: 'datetime'
        }));


        var datafieldMap = {};
        _.each(dateCol, function(col) {
            datafieldMap[col.datafield] = col;
        })
        for (var i = 0; i < selectedRowIndexs.length; i++) {
            var index = selectedRowIndexs[i];
            var row = $('#dataGrid').jqxGrid('getrowdata', index);
            for (var item in row) {
                var matched = datafieldMap[item];
                if (matched) {
                    var dateformat = "YYYY-MM-DD";
                    if (matched.datatype == 'datetime') {
                        dateformat = "YYYY-MM-DD HH:mm:ss";
                    }
                    var data = row[item];
                    if (data) {
                        row[item] = moment(data).format(dateformat);
                    }
                }
            }
            rows.push(row)
        }
        return rows;
    }

    function tabSwitch() {

        $("#submit-button").show();

        $("#export-button").hide();
        $("#download-button").hide();
        $("#statistic-button").hide();
        $("#filter-button").hide();
        $("#unfilter-button").hide();

        $("#group-button").hide();
        $("#unroup-button").hide();

        $("#locate-button").hide();
        $("#search-div").hide();

        $('#map-li a').on('click', function(e) {

            if ($('#mapContainer').contents().length == 0) {
                e.preventDefault()
                $("#tab1").removeClass('active');
                $("#tab2").removeClass('active');
                $("#tab3").toggleClass('active');

                var panelHeight = document.getElementById('sq-panel').offsetHeight;

                var panelHeadHeight = document.getElementById('sq-head').offsetHeight;

                var panelMenu = document.getElementById('panel-menu').offsetHeight;
                var mapHeight = panelHeight - panelHeadHeight - panelMenu;
                $('#map-panel').css('height', mapHeight);

                gismodule.Init({
                    container: '#mapContainer',
                    traceFlag: true
                });
                $("#manageAimTrackPanel").show();
            }

            $("#submit-button").hide();

            $("#export-button").hide();
            $("#download-button").hide();
            $("#statistic-button").hide();
            $("#filter-button").hide();
            $("#unfilter-button").hide();

            $("#group-button").hide();
            $("#unroup-button").hide();

            $("#locate-button").hide();
            $("#search-div").hide();
        });
        $('#cond-li a').on('click', function(e) {
            e.preventDefault();

            $("#submit-button").show();

            $("#export-button").hide();
            $("#download-button").hide();
            $("#statistic-button").hide();
            $("#filter-button").hide();
            $("#unfilter-button").hide();

            $("#group-button").hide();
            $("#unroup-button").hide();

            $("#locate-button").hide();
            $("#search-div").hide();

        })
        $('#res-li a').on('click', function(e) {
            $("#submit-button").hide();
            $("#export-button").show();
            $("#download-button").show();
            $("#statistic-button").show();
            $("#filter-button").show();
            $("#unfilter-button").hide();
            $("#group-button").show();
            $("#ungroup-button").hide();

            if (supportGIS) {
                $("#locate-button").show();
            } else {
                getGisQueryConfig().then(function(rsp) {
                    if (!_.isEmpty(rsp)) {
                        supportGIS = true;
                        $("#locate-button").show();
                    } else {
                        supportGIS = false;
                        $("#locate-button").hide();
                    }
                }).catch(function(err) {

                });
            }



            $("#search-div").show();
        })


    }


    var reset = function() {

        $('#statistic-button').css('background-color', '#37bc9b');
        $("#statistic-div").slideUp();
        var panelHeight = document.getElementById('sq-panel').offsetHeight;
        var panelHeadHeight = document.getElementById('sq-head').offsetHeight;
        var tabHead = document.getElementById('panel-menu').offsetHeight;
        var gridHeight = panelHeight - panelHeadHeight - tabHead;

        $("#dataGrid").jqxGrid('height', gridHeight);
        $('#dataGrid').jqxGrid('refresh');
    }

    var saveTaskTree = function(taskID) {

        var temp = '<div><div class="admin-form theme-info"><form><div class="section mt10"><label for="update-file-name" class="field-label">任务名称 *</label><label for="name" class="field"><input style="width:100%" type="text" name="update-file-name" id="update-file-name" class="gui-input"></label></div><div class="section"><label for="update-file-description" class="field-label">描述 *</label><label for="update-file-description" class="field"><input type="text" name="update-file-description" id="update-file-description" class="gui-input"></input></label></div></div><div id="folder-picker"> Loading... </div></form></div>';
        //.get("select-datatype-dialog.html", function(result) {
        Dialog.build({
            title: "保存任务",
            content: temp,
            rightBtnCallback: function() {
                // 确认
                var newParentNode = $("#folder-picker").fancytree("getTree").getActiveNode();
                var id = newParentNode.key;
                var name = $("#update-file-name").val().trim();
                if (name == null || name == "") {
                    Notify.show({
                        title: "请填写任务名称！",
                        type: "warning"
                    });
                    return;
                }
                var desc = $("#update-file-description").val().trim();
                var taskInfo = {};
                taskInfo.taskId = taskID;

                taskInfo.taskName = name;
                taskInfo.taskDesc = desc;
                taskInfo.dirId = id;
                saveTaskInfo(taskInfo);
                $.magnificPopup.close();
            }
        }).show(function() {
            $("#folder-picker").empty();
            PersonalWorkTree.buildTree({
                container: $("#folder-picker"),
                treeAreaFlag: "saveTask"
            });
        });
    }

    var download = function() {
        $("#download-button").show();
        $("#download-button").on("click", function(event) {
            event.preventDefault();

            var selectedRowIndexs = $('#dataGrid').jqxGrid('getselectedrowindexes');

            var fileInfoArray = [];
            for (var i = 0; i < selectedRowIndexs.length; i++) {
                var index = selectedRowIndexs[i];
                var row = $('#dataGrid').jqxGrid('getrowdata', index);

                if (row.FILENAME /*&& row.INTERCEPT_TIME*/ ) {

                    var data = {
                        fileName: row.FILENAME,
                        fileId: row.FILENAME,
                        dataTypeId: -1
                    }
                    fileInfoArray.push(data);
                }
            }

            if (fileInfoArray.length == 0) {
                Notify.show({
                    title: "在结果中未找到下载文件",
                    type: "warning"
                });
                return;
            }
            fileInfo = {};
            fileInfo.fileInfo = fileInfoArray;

            _.each(fileInfoArray, function(file) {
                var opts = {};
                opts.fileName = file.fileName;
                opts.uuidName = file.fileName;
                udpFileUtil.downloadFile(opts);
            })


            /*$.post('/smartquery/batchgetfilepath', fileInfo, function(rsp) {
             rsp = JSON.parse(rsp);
             if (rsp.code != 0) {
             Notify.show({
             title: rsp.message,
             type: "failed"
             });
             } else {
             var opts = {};
             for (var i = 0; i < rsp.data.length; i++) {
             var path = rsp.data[i];
             opts.fileName = _.last(path.filePath.split('/'));
             opts.uuidName = path.filePath;
             if (opts.filePath != '') {
             udpFileUtil.downloadFile(opts);
             }
             };
             }
             })*/
        })
    }

    function saveTaskInfo(taskInfo) {

        $.get('/smartquery/saveintelligentqueryresult', {
            "taskId": taskInfo.taskId,
            "taskName": taskInfo.taskName,
            "taskDesc": taskInfo.taskDesc,
            "dirId": taskInfo.dirId
        }, function(rsp) {
            rsp = JSON.parse(rsp);
            if (rsp.code == 0) {
                $('#save-button').attr("disabled", "");
                Notify.show({
                    title: " 保存任务成功！",
                    type: "success"
                });
            } else {
                Notify.show({
                    title: " 保存任务失败" + (rsp.message ? ':' + rsp.message : ""),
                    type: "failed"
                });
            }
        })
    }
    var saveTask = function() {
        $("#save-button").show()
        $("#save-button").on("click", function(event) {
            event.preventDefault();
            saveTaskTree(_taskID);
        })
    }

    var group = function() {
        $("#group-button").show()
        $("#group-button").on("click", function(event) {
            event.preventDefault();
            $("#group-button").hide();
            $("#ungroup-button").show();
            $('.jqx-grid-group-drag-line').css('background-color', '');
            $("#dataGrid").jqxGrid({
                groupable: true,
            });
        })
    }

    var ungroup = function() {
        $("#ungroup-button").on("click", function(event) {
            event.preventDefault();
            $("#ungroup-button").hide();
            $("#group-button").show();
            $("#dataGrid").jqxGrid({
                groupable: false
            });

            $('#dataGrid').jqxGrid('cleargroups');
            //$('.jqx-grid-group-drag-line').css('background', 'initial');
        })
    }

    var filter = function() {
        $("#filter-button").show();
        $("#filter-button").on("click", function(event) {
            event.preventDefault();
            $("#filter-button").hide();
            $("#unfilter-button").show();

            $('#dataGrid').jqxGrid('clearfilters');

            var columns = $('#dataGrid').jqxGrid('columns');
            _.each(columns.records, function(column) {
                $('#dataGrid').jqxGrid('removefilter', column.displayfield, true);
            })

            $("#dataGrid").jqxGrid({
                filterable: true,
                showfilterrow: true,
                filtermode: 'default'
            });
            _state = $("#dataGrid").jqxGrid('savestate');
        })
    }

    var unfilter = function() {
        $("#unfilter-button").on("click", function(event) {
            event.preventDefault();
            $("#unfilter-button").hide();
            $("#filter-button").show();
            $("#dataGrid").jqxGrid({
                filterable: false
            });
            $("#dataGrid").jqxGrid('loadstate', _state);
            _selectCount = $("#dataGrid").jqxGrid('selectedrowindexes').length;
            _loadedCount = $("#dataGrid").jqxGrid('getrows').length;
            _resultCount = jqxBinding.getRecordCount();
            $('#dataGrid').jqxGrid('clearfilters');

            // _recordsLabel.text('当前 ' + _loadedCount + ' 选中 ' + _selectCount + ' 共 ' + _resultCount);
        })
    }


    var keySearch = function() {

        $("#search-btn").on("click", function(event) {
            event.preventDefault();

            var filtergroup = new $.jqx.filter();
            var filtervalue = $("#search-input").val(); // Each cell value is compared with the filter's value.
            var filter = filtergroup.createfilter('stringfilter', filtervalue, 'CONTAINS');
            filtergroup.addfilter(1, filter);
            filtergroup.operator = 'or';
            var columns = $('#dataGrid').jqxGrid('columns');
            _.each(columns.records, function(column) {
                $('#dataGrid').jqxGrid('addfilter', column.displayfield, filtergroup, true);
            })
        })
        $("#search-input").on('keyup', function(event) {
            if (event.which == $.ui.keyCode.DELETE || event.which == $.ui.keyCode.BACKSPACE) {
                event.preventDefault();
                if ($("#search-input").val().length == 0) {
                    $('#dataGrid').jqxGrid('clearfilters');

                    var columns = $('#dataGrid').jqxGrid('columns');
                    _.each(columns.records, function(column) {
                        $('#dataGrid').jqxGrid('removefilter', column.displayfield, true);
                    })
                }
            }
        })
        $("#search-input").on("keydown", function(event) {
            if (event.which == $.ui.keyCode.ENTER) {
                event.preventDefault();
                var filtergroup = new $.jqx.filter();
                var filtervalue = $("#search-input").val(); // Each cell value is compared with the filter's value.
                var filter = filtergroup.createfilter('stringfilter', filtervalue, 'CONTAINS');
                filtergroup.addfilter(1, filter);
                filtergroup.operator = 'or';
                var columns = $('#dataGrid').jqxGrid('columns');
                _.each(columns.records, function(column) {
                    $('#dataGrid').jqxGrid('addfilter', column.displayfield, filtergroup, true);
                })

            }

        })
    }


    var getRows = function() {

        var selectedRowIndexs = $('#dataGrid').jqxGrid('getselectedrowindexes');
        if (selectedRowIndexs.length == 0) {
            Notify.show({
                title: '未选中任何导出记录!',
                type: "info"
            });
            return false;
        }
        var rows = [];

        var dateCol = _.union(_.where(columns, {
            datatype: 'date'
        }), _.where(columns, {
            datatype: 'datetime'
        }));


        var datafieldMap = {};
        _.each(dateCol, function(col) {
            datafieldMap[col.datafield] = col;
        })


        for (var i = 0; i < selectedRowIndexs.length; i++) {
            var index = selectedRowIndexs[i];
            var row = $('#dataGrid').jqxGrid('getrowdata', index);
            for (var item in row) {
                var matched = datafieldMap[item];
                if (matched) {
                    var dateformat = "YYYY-MM-DD";
                    if (matched.datatype == 'datetime') {
                        dateformat = "YYYY-MM-DD HH:mm:ss";
                    }
                    var data = row[item];
                    if (data) {
                        row[item] = moment(data).format(dateformat);
                    }
                }
            }
            rows.push(row)
        }
        return rows;
    }

    var dataUid;
    // var exportData = function() {
    //     $("#export-button").show();
    //     $("#export-button").on("click", function(event) {
    //         event.preventDefault();

    //         var selectedRowIndexs = $('#dataGrid').jqxGrid('getselectedrowindexes');
    //         if (selectedRowIndexs.length == 0) {
    //             Notify.show({
    //                 title: '未选中任何导出记录!',
    //                 type: "info"
    //             });
    //             return false;
    //         }

    //         Dialog.build({
    //             title: "数据导出中",
    //             content: '<div><img class="msg-count" style="position: relative;width: 80px;height: 80px;'
    //             + 'margin-left:170px;margin-top:80px;" src="../../img/udp/Loading.gif"></div>',
    //             hideFooter: true,
    //         }).show(function() {
    //             $.post('/smartquery/newExport', {
    //                 change: true
    //             }, function(rsp) {
    //                 console.log(rsp);
    //                 rsp = JSON.parse(rsp);
    //                 if (rsp.code != 0) {
    //                     Notify.show({
    //                         title: rsp.message,
    //                         type: "failed"
    //                     });
    //                 } else {
    //                     var rows = [];
    //                     var dateCol = _.union(_.where(columns, {
    //                         datatype: 'date'
    //                     }), _.where(columns, {
    //                         datatype: 'datetime'
    //                     }));

    //                     var datafieldMap = {};
    //                     _.each(dateCol, function(col) {
    //                         datafieldMap[col.datafield] = col;
    //                     })

    //                     for (var i = 0; i < selectedRowIndexs.length; i++) {
    //                         var index = selectedRowIndexs[i];
    //                         var row = $('#dataGrid').jqxGrid('getrowdata', index);
    //                         //EDIT BY huangjingwei
    //                         //此处导出数据最后有一列UID需要去除
    //                         row = _.pick(row, function(value, key, object) {
    //                             return key != 'uid';
    //                         });
    //                         for (var item in row) {
    //                             var matched = datafieldMap[item];
    //                             if (matched) {
    //                                 var dateformat = "YYYY-MM-DD";
    //                                 if (matched.datatype == 'datetime') {
    //                                     dateformat = "YYYY-MM-DD HH:mm:ss";
    //                                 }
    //                                 var data = row[item];
    //                                 if (data) {
    //                                     row[item] = moment(data).format(dateformat);
    //                                 }
    //                             }
    //                         }
    //                         rows.push(row);
    //                     }

    //                     //console.log(rows);
    //                     //$("#dataGrid").battatech_excelexport({
    //                     //    containerid: "dataGrid",
    //                     //    datatype: 'json',
    //                     //    dataset: rows,
    //                     //    columns: columns
    //                     //});

    //                     var excelInfo = [];
    //                     var rowL = parseInt((rows.length - 1) / 5000);
    //                     console.log(rowL);
    //                     for (var i = 0; i <= rowL; i++) {
    //                         excelInfo[i] = {
    //                             dataset: rows.slice(5000 * i, 5000 * i + 5000),
    //                             columns: columns,
    //                             taskId: _taskID
    //                         }

    //                     }
    //                     //var excelInfo = {
    //                     //        dataset: rows,
    //                     //        columns: columns,
    //                     //        taskId:_taskID
    //                     //    }
    //                     dataUid = 0;
    //                     console.log(rowL);
    //                     console.log(excelInfo);

    //                     $.post('/smartquery/exportExcel', excelInfo[dataUid], function(rsp) {
    //                         exportDataExcel(rsp, rowL, excelInfo);
    //                         //    console.log(rsp);
    //                         //    dataUid = dataUid + 1
    //                         //    $.post('/smartquery/exportExcel', excelInfo[dataUid], function(rsp) {
    //                         //      console.log(rsp);
    //                         //    })

    //                         //if(dataUid != rowL){
    //                         //    dataUid = dataUid + 1;
    //                         //    console.log(rowL);
    //                         //    console.log(dataUid);
    //                         //    $.post('/smartquery/exportExcel', excelInfo[dataUid], function(rsp) {
    //                         //        rsp = JSON.parse(rsp);
    //                         //        if (rsp.code != 0) {
    //                         //            Notify.show({
    //                         //                title: rsp.message,
    //                         //                type: "failed"
    //                         //            });
    //                         //        }
    //                         //    })
    //                         //}
    //                         //else{
    //                         //    window.location.href = '/smartquery/excelDownloadFile?filePath=' + rsp.data + '&fileName=' + rsp.data;
    //                         //}
    //                     })
    //                 }
    //             })
    //         })
    //     })
    // }

    // function exportDataExcel(rsp, lastValue, excelInfo) {
    //     dataUid = dataUid + 1;
    //     if (dataUid >= lastValue + 1) {
    //         rsp = JSON.parse(rsp);
    //         $.magnificPopup.close();
    //         window.location.href = '/smartquery/excelDownloadFile?filePath=' + rsp.data + '&fileName=' + rsp.data;
    //         return true;
    //     } else {
    //         console.log("pici" + dataUid);
    //         rsp = JSON.parse(rsp);
    //         console.log(rsp);
    //         if (rsp.code != 0) {
    //             Notify.show({
    //                 title: rsp.message,
    //                 type: "failed"
    //             });
    //         } else {
    //             console.log(excelInfo[dataUid]);
    //             $.post('/smartquery/exportExcel', excelInfo[dataUid], function(response) {
    //                 exportDataExcel(response, lastValue, excelInfo);
    //             })
    //         }
    //     }
    // }

    var exportData = function() {
        $("#export-button").show();
        $("#export-button-cur").show();
        $("#export-button").on('mouseover', function(event) {
            $('.val').show();
        });
        $("#export-button").on('mouseout', function(event) {
            $('.val').hide();
        });
        $('.val').on('click', function(event) {
            var exportNum = parseInt($(this).attr('data-value'));
            var exportType = 'xlsx';
            // console.log(_taskID)
            $(this).hide();

            var taskid = _opt.sessionId ;
            Notify.show({
                title: "正在导出中，请勿关闭页面",
                type: "info"
            });
            $.get('/udp/udp/exportSearchResult', {
                taskId: taskid,
                limit: exportNum,
                format: exportType
            }, function(rsp) {
                rsp = JSON.parse(rsp);
                if (rsp.code == 0) {
                    // window.open(rsp.data.path)
                    // window.location.href = rsp.data.path;

                var alink = document.createElement('a');
                var evt = document.createEvent("HTMLEvents");
                evt.initEvent("click", false, false);
                alink.download = '离线查询导出数据';
                alink.href = rsp.data;
                alink.click();

                } else {
                    Notify.show({
                        title: '导出出错!',
                        type: "error"
                    });
                }
            })
        })

        $("#export-button-cur").on("click", function(event) {
            event.preventDefault();

            var selectedRowIndexs = $('#dataGrid').jqxGrid('getselectedrowindexes');
            if (selectedRowIndexs.length == 0) {
                Notify.show({
                    title: '未选中任何导出记录!',
                    type: "info"
                });
                return false;
            }

            Dialog.build({
                title: "数据导出中",
                content: '<div><img class="msg-count" style="width: 80px;height: 80px;margin-left:170px;margin-top:80px;" src="../../img/udp/Loading.gif"></div>',
                hideFooter: true,
            }).show(function() {
                $.post('/smartquery/smartquery/newExport', {
                    change: true
                }, function(rsp) {
                    console.log(rsp);
                    rsp = JSON.parse(rsp);
                    if (rsp.code != 0) {
                        Notify.show({
                            title: rsp.message,
                            type: "failed"
                        });
                    } else {
                        var rows = [];
                        var dateCol = _.union(_.where(columns, {
                            datatype: 'date'
                        }), _.where(columns, {
                            datatype: 'datetime'
                        }));

                        var datafieldMap = {};
                        _.each(dateCol, function(col) {
                            datafieldMap[col.datafield] = col;
                        })

                        for (var i = 0; i < selectedRowIndexs.length; i++) {
                            var index = selectedRowIndexs[i];
                            var row = $('#dataGrid').jqxGrid('getrowdata', index);
                            //EDIT BY huangjingwei
                            //此处导出数据最后有一列UID需要去除
                            row = _.pick(row, function(value, key, object) {
                                return key != 'uid';
                            });
                            for (var item in row) {
                                var matched = datafieldMap[item];
                                if (matched) {
                                    var dateformat = "YYYY-MM-DD";
                                    if (matched.datatype == 'datetime') {
                                        dateformat = "YYYY-MM-DD HH:mm:ss";
                                    }
                                    var data = row[item];
                                    if (data) {
                                        row[item] = moment(data).format(dateformat);
                                    }
                                }
                            }
                            rows.push(row);
                        }


                        var excelInfo = [];
                        var rowL = parseInt((rows.length - 1) / 5000);
                        console.log(rowL);
                        for (var i = 0; i <= rowL; i++) {
                            excelInfo[i] = {
                                dataset: rows.slice(5000 * i, 5000 * i + 5000),
                                columns: columns,
                                taskId: _opt.taskId != undefined ? _opt.taskId : _taskID
                            }

                        }

                        dataUid = 0;
                        console.log(rowL);
                        console.log(excelInfo);

                        $.post('/smartquery/smartquery/exportExcel', excelInfo[dataUid], function(rsp) {
                            exportDataExcel(rsp, rowL, excelInfo);
                        })
                    }
                })
            })
        })
    }

    function exportDataExcel(rsp, lastValue, excelInfo) {
        dataUid = dataUid + 1;
        if (dataUid >= lastValue + 1) {
            rsp = JSON.parse(rsp);
            $.magnificPopup.close();
            window.location.href = '/smartquery/smartquery/excelDownloadFile?filePath=' + rsp.data + '&fileName=' + rsp.data;
            return true;
        } else {
            console.log("pici" + dataUid);
            rsp = JSON.parse(rsp);
            console.log(rsp);
            if (rsp.code != 0) {
                Notify.show({
                    title: rsp.message,
                    type: "failed"
                });
            } else {
                console.log(excelInfo[dataUid]);
                $.post('/smartquery/smartquery/exportExcel', excelInfo[dataUid], function(response) {
                    exportDataExcel(response, lastValue, excelInfo);
                })
            }
        }
    }
    var submitQuery = function() {
        $("#submit-button").show();
        $("#submit-button").on("click", function(event) {

            if ($('#statistic-div').css('display') != 'none') {
                reset();
            }
            if ($("#search-input").val() != '') {
                $("#search-input").val('');
            }
            $("#resultform").show();

            $("#dataGrid").hide();
            $('#save-button').removeAttr("disabled");
            event.preventDefault();
            $('#res-li a').trigger('click')

            $('#gridContainer').height(queryHelper.calGridHeight());

            $.getJSON('/smartquery/submitintelligentquery', _opt.queryArg()).done(function(rsp) {
                if (rsp.code != 0) {
                    Notify.show({
                        title: rsp.message,
                        type: "failed"
                    });
                } else {
                    _taskID = rsp.data;


                    jqxBinding.TryBindResult('#gridContainer', rsp.data);
                }

            });



        });
    }

    return {
        init: init,
        renderToolbar: renderToolbar
    }
})