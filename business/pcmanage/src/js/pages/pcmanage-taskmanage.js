initLocales();
require([ 'jquery', 'underscore', 'nova-alert',
        'nova-notify', 'nova-dialog', 'nova-bootbox-dialog','moment',
        'utility/fancytree/jquery.fancytree-all',
        '../../../../../public/widget/personalworktree',
        '../module/pcmanage-func-helper',
        '../module/pcmanage-firstpart',
        '../module/pcmanage-secondpart',
        '../module/pcmanage-thirdpart',
        '../module/pcmanage-forthpart',
        '../module/pcmanage-fifthpart',
        'jquery.magnific-popup',
        'jquery.datatables',
        'datatables.bootstrap',
        'jquery-ui',
        'utility/contextmenu/jquery.ui-contextmenu',
        'utility/select2/select2.min'
    ],
    function($, _, Alert, Notify, Dialog, bootbox, moment, fancytree, PersonalWorkTree, PcmanageFuncHelper, FirstPart, SecondPart, ThirdPart, ForthPart, FifthPart) {
        hideLoader();
        var selectedTaskId;
        var selectedNode = "";
        var windowHeight = $("#dataimport-content")[0].scrollHeight;

        var ruleData = [];

        var _property = [];
        var _entityType = [];
        var _relationType = [];

        var _dataType = {};
        var _dataImportType = "1";
        var _timeStampField = "";
        var _colDef = [];
        var _stringColDef = [];

        var _stepTo = "#step1";
        var _taskName = "";
        var _taskDes = "";

        var _switchButton = false;
        var _taskId = -1;

        var _modelId = getURLParameter("modelid") || "0";

        function getURLParameter(name) {
            return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || null;
        }

        
        (function() {
            $(window).on('nv-resize resize', _.debounce(resizeCanvas, 100));
        })(); // end resize events

        $(window).trigger("resize");
        function resizeCanvas() {
            var leftTray = $('.tray.tray-left');

            var leftHeight = window.innerHeight - leftTray.offset().top;
            $('.tray.tray-center').height(leftHeight);

            // fanceytree需要设置高度以启用滚动条
            $('.datatype-tree').height(leftHeight - $('#datatype-tree-panel').position().top);
            $('#loadtaskmanage').height(leftHeight);
            leftTray.height(leftHeight);
        }

        function setReactHeight(){
            var leftTray = $('.tray.tray-left');
            var leftHeight = window.innerHeight - $('#dataimport-div').position().top;
            $('#mainForm').height(leftHeight);
        }

        //支持模型从工作区打开
        if (_modelId != "0") {
            $("#taskmanage-content").hide();
            $("#dataimport-content").hide();
            $("#dataimport-content").show();
            setReactHeight();
            $.get('/smartquery/smartquery/openModel', {
                "modelId": _modelId
            }, function(rspDetail) {
                var rspData = $.parseJSON(rspDetail);
                if (rspData.code == 0) {
                    var consData = $.parseJSON(rspData.data.modelDetail);
                    restoreCondition(consData);
                }
            })

            $.get('/smartquery/smartquery/checkModelPermission', {
                "modelId": _modelId
            }, function(rspPermissionData) {
                var rsp = $.parseJSON(rspPermissionData);
                if (rsp.code == 0) {
                    if (rsp.data == 1) { //0为有权限 1为没有权限
                        $("#btn-save-model").attr("disabled", true);
                    }
                }
            })
        } else {
            $("#taskmanage-content").show();
            loadTaskDetail(-1);
            $("#btn-save-model").attr("disabled", true);
        }

        //查看所有导入任务
        $("#showAllTasks").on('click', function() {
            var Tree = $('#task-treeview').fancytree('getTree');
            Tree.reload();
            selectedNode = "";
            setDataManageState(-1);
        })

        //
        $('#importFromFile').on('click', function() {
            event.preventDefault();
            try {
                PcmanageFuncHelper.importFromFile(restoreCondition);
                $("#taskmanage-content").hide();
                $("#dataimport-content").hide();
                $("#dataimport-content").show();
                $("#dataimport-nav-tabs li:nth-child(2)").siblings().removeClass("active");
                $("#dataimport-nav-tabs li:nth-child(2)").addClass("active");
                $("#step1").siblings().hide();
                $("#step1").show();
                $("#back-Button").addClass("disabled");
                if($("#next-Button").hasClass("disabled")){
                    $("#next-Button").removeClass("disabled");
                }
                _stepTo = "#step1";
            } catch (e) {

            }
        })


        FirstPart.render($("#ruleSets")[0]);

        function processSelect(node) {
            selectedNode = node;
            $("#loadTaskTable").dataTable().fnClearTable();
            $("#loadItemTable").dataTable().fnClearTable();
            hasMoreFiles = true;
            loadTaskInfo(node.key);
        }

        //禁用浏览器自带的右键菜单
        $('#task-treeview ').on('contextmenu', function(e) {
            e.preventDefault();
            return false;
        })

        //初始化数据类型树
        $.getJSON('/pcmanage/rlfdatamanage/datatypetree', {
            // userId:_userId
        }).done(function(rsp) {
            $('#task-treeview').fancytree({
                selectMode: 2,
                clickFolderMode: 1,
                autoScroll: true,
                source: function() {
                    return rsp.data;
                },
                init: function(event, data) {
                    data.tree.visit(function(node) {
                        if (node.data.dirId == 12) {
                            node.setExpanded(true);
                        }
                    })
                },
                iconClass: function(event, data) {
                    if (!data.node.extraClasses) {
                        console.log(data.node);
                        return "fa fa-folder fa-fw";
                    }
                    if (data.node.extraClasses.indexOf("nv-dir") != -1) {
                        return "fa fa-folder fa-fw";
                    } else {
                        return "fa fa-database fa-fw";
                    }
                },
                lazyLoad: function(event, data) {
                    console.log(data.node.data);
                    data.result = {
                        url: "/pcmanage/pcmanage/getModelingTaskData",
                        data: {
                            taskId: data.node.data.typeId
                        }
                    };
                },
                activate: function(event, data) {
                    selectedNode = data.node;
                    if (selectedNode.extraClasses.indexOf('nv-dir') == -1) {
                        if (event.which == 1) {
                            setDataManageState(selectedNode.data.typeId);
                        }
                    }
                }
            }).on("nodeCommand", function(event, data) {
                var tree = $(this).fancytree("getTree");
                selectedNode = tree.getActiveNode();
                if (selectedNode.extraClasses.indexOf('nv-dir') == -1) {
                    _dataType = selectedNode.data;
                    switch (data.cmd) {
                        case "taskimport":
                            setDataimportState(selectedNode.data);
                            
                            break;
                        case "taskmanage":
                            setDataManageState(selectedNode.data.typeId);
                            break;
                    }
                }
            })
        });

        //自定义右键菜单
        $("#task-treeview ").contextmenu({
            delegate: '.nv-data',
            menu: [{
                title: '数据导入',
                cmd: 'taskimport',
                uiIcon: 'my-icon-dataimport'
            }, {
                title: '任务管理',
                cmd: 'taskmanage',
                uiIcon: 'my-icon-taskmanage'
            }],
            beforeOpen: beforeOpen, //定义在菜单展现之前的操作
            select: contextMenuSelect //定义选中菜单中的项的操作
        });

        function beforeOpen(event, ui) {
            var node = $.ui.fancytree.getNode(ui.target); //获取节点

            if (node.extraClasses.indexOf('nv-dir') == -1) {
                $("#task-treeview").contextmenu("enableEntry", "taskimport", true);
                $("#task-treeview").contextmenu("enableEntry", "taskmanage", true);
            } else {
                $("#task-treeview").contextmenu("enableEntry", "taskimport", false);
                $("#task-treeview").contextmenu("enableEntry", "taskmanage", false);
            }
            node.setActive(); //将当前节点设置为active状态
        }

        function contextMenuSelect(event, ui) {
            //延时0.1秒执行命令，以确保菜单关闭和执行命令两件事情不冲突
            var that = this;
            setTimeout(function() {
                $(that).trigger("nodeCommand", {
                    cmd: ui.cmd
                });
            }, 100);
        }

        //初始化React页面状态
        function setInitState(data) {
            $.getJSON('/pcmanage/rlfdatamanage/getDataTypeColDef', {
                typeId: data.typeId,
                zoneId: data.zoneId,
                centerCode: data.centerCode
            }).done(function(rsp) {
                if (rsp.data) {
                    _colDef = rsp.data;
                    _stringColDef = [];
                    $.extend(true, _stringColDef, PcmanageFuncHelper.getStringColDef(_colDef));

                    PcmanageFuncHelper.initSelectData(_colDef);

                    if (_property.length <= 0) {
                        $.getJSON('/pcmanage/rlfdatamanage/getbasicproperty', {}).done(function(rsp) {
                            if (rsp.data) {
                                _property = rsp.data.property;
                                _entityType = rsp.data.entityType;
                                _relationType = rsp.data.relationType;
                                setInitReactState(data.typeId);
                            }
                        })
                    } else {
                        setInitReactState(data.typeId);
                    }
                }
            })
        }

        //将页面state置空
        function setInitReactState(typeIdData) {
            var thirdPartData = ThirdPart.getSelectedState();
            var forthPartData = ForthPart.getSelectedState();
            if (thirdPartData.length <= 0) {
                SecondPart.renderSecond($("#step2")[0], _switchButton, ruleData, _stringColDef, [], typeIdData);
                FirstPart.renderFirst($("#ruleSets")[0], []);
            } else if (forthPartData.length <= 0) {
                ThirdPart.renderThird($("#step3")[0], _property, _colDef, _entityType, []);
                SecondPart.renderSecond($("#step2")[0], _switchButton, ruleData, _stringColDef, [], typeIdData);
                FirstPart.renderFirst($("#ruleSets")[0], []);
            } else {
                FifthPart.renderFifth($("#step5")[0], _switchButton, ruleData,thirdPartData, forthPartData, _relationType, []);
                ForthPart.renderForth($("#step4")[0], _switchButton, ruleData, _entityType, thirdPartData, []);
                ThirdPart.renderThird($("#step3")[0], _property, _colDef, _entityType, []);
                SecondPart.renderSecond($("#step2")[0], _switchButton, ruleData, _stringColDef, [], typeIdData);
                FirstPart.renderFirst($("#ruleSets")[0], []);
            }
        }

        // 初始化第一个页面元素
        function setInitFirstPage() {
            _stepTo = "#step1";
            _dataImportType = "1";
            $("#ruleSets").hide();
            $('input[name=selectFileType]:eq(0)').click();
            if (_switchButton == true) {
                $("#checkboxSwitch").click();
                _switchButton = false;
            }
        }

        //右键选择数据导入，页面初始化
        function setDataimportState(nodeData) {
            $.get('/pcmanage/rlfdatamanage/checkImportTask',{
                dataTypeId:nodeData.typeId
            },function(rsp){
                rsp = JSON.parse(rsp);
                if(!rsp.data.isImport){
                    $("#taskmanage-content").hide();
                    showLoader();
                    setInitState(nodeData);
                    hideLoader();

                    $("#dataimport-content").show();
                    $("#data-type-text").val(nodeData.caption);
                    $("#dataimport-nav-tabs li:nth-child(2)").siblings().removeClass("active");
                    $("#dataimport-nav-tabs li:nth-child(2)").addClass("active");
                    $("#step1").siblings().hide();
                    $("#step1").show();
                    $("#back-Button").addClass("disabled");
                    if($("#next-Button").hasClass("disabled")){
                        $("#next-Button").removeClass("disabled");
                    }

                    setInitFirstPage();
                    _stepTo = "#step1";
                    getColDef(nodeData);

                    setReactHeight();
                    _dataType = nodeData;
                }else{
                    Notify.show({
                        title: '当前数据类型下存在正在运行的导入任务，暂时无法进行导入!',
                        type: "warning"
                    });
                }
            })
        }

        //右键选择任务管理，页面初始化
        function setDataManageState(typeId) {
            $("#taskmanage-content").hide();
            $("#dataimport-content").hide();
            showLoader();
            hideLoader();
            $("#taskmanage-content").show();

            loadTaskDetail(typeId);
        }

        initLoadTaskTable();
        initLoadBatchTable();
        initLoadItemTable();


        //=======================================任务管理 -start===============================
        //初始化任务列表
        function initLoadTaskTable() {
            $('#loadTaskTable').dataTable({
                'data': [],
                'bAutoWidth': false,
                // 'columnDefs':[{
                //     "targets":[8],
                //     "visible":false
                // }],
                'aaSorting': [
                    [0, 'desc']
                ],
                "oLanguage": {
                    "sProcessing": "正在加载任务信息...",
                    "sLengthMenu": "每页显示_MENU_条记录",
                    "sInfo": "当前显示_START_到_END_条，共_TOTAL_条任务",
                    "sInfoEmpty": "未查询到相关的任务信息",
                    "sZeroRecords": "对不起，查询不到相关任务信息",
                    "sInfoFiltered": "",
                    "sSearch": "搜索",
                    "oPaginate": {
                        "sPrevious": "前一页",
                        "sNext": "后一页"
                    }
                },
                "bPaginate": true,
                "iDisplayLength": 5,
                "aLengthMenu": [
                    [5, 10, 25, 50, -1],
                    [5, 10, 25, 50, "All"]
                ],
                "sDom": '<"clearfix"fr>t<"dt-panelfooter clearfix"ip>',
            });

            $("#loadTaskTable").on('click', 'tbody > tr', function(event) {
                $file = $(this);
                if (!$('td', $file).hasClass('dataTables_empty')) {
                    $file.siblings('.selectedRow').removeClass('selectedRow');
                    if ($file.hasClass('selectedRow')) {
                        $file.removeClass('selectedRow');
                        $('#btn-delete-loadtask').attr('disabled', 'disabled');
                        $('#btn-begin-loadtask').attr('disabled', 'disabled');
                        $('#btn-stop-loadtask').attr('disabled', 'disabled');
                    } else {
                        $file.addClass('selectedRow');
                        $('#btn-delete-loadtask').removeAttr('disabled');
                        $('#btn-begin-loadtask').removeAttr('disabled');
                        var taskType = $file.find('>:nth-child(3)').html();
                        taskType == "自定义导入" ? $('#btn-stop-loadtask').attr('disabled', 'disabled') : $('#btn-stop-loadtask').removeAttr('disabled');
                        $('#btn-copy-loadtask').removeAttr('disabled');
                        selectedTaskId = $file.find('>:first-child').html();
                        loadBatchDetail(selectedTaskId);
                    }
                }
            });
        }

        //初始化批次列表
        function initLoadBatchTable() {
            $('#loadBatchTable').dataTable({
                'data': [],
                "bAutoWidth": false,
                'searching': false,
                'aaSorting': [

                    [0, 'desc']
                ],
                "oLanguage": {
                    "sProcessing": "正在加载批次信息...",
                    "sLengthMenu": "每页显示_MENU_条记录",
                    "sInfo": "当前显示_START_到_END_条，共_TOTAL_条批次",
                    "sInfoEmpty": "未查询到相关的批次信息",
                    "sZeroRecords": "对不起，查询不到相关批次信息",
                    "sInfoFiltered": "",
                    "sSearch": "搜索",
                    "oPaginate": {
                        "sPrevious": "前一页",
                        "sNext": "后一页"
                    }
                },
                "bPaginate": true,
                "iDisplayLength": 5,
                "aLengthMenu": [
                    [5, 10, 25, 50, -1],
                    [5, 10, 25, 50, "All"]
                ],
                "sDom": '<"clearfix"fr>t<"dt-panelfooter clearfix"ip>',
            });

            $("#loadBatchTable").on('click', 'tbody > tr', function(event) {
                $file = $(this);
                $file.siblings('.selectedRow').removeClass('selectedRow');
                $file.addClass('selectedRow');
                var batchId = $file.find('>:first-child').html();
                loadItemDetail(batchId);
            });
        }

        //初始化数据项列表
        function initLoadItemTable() {
            $('#loadItemTable').dataTable({
                'data': [],
                "bAutoWidth": false,
                'searching': false,
                'aaSorting': [
                    [0, 'desc']
                ],
                "oLanguage": {
                    "sProcessing": "正在加载导入文件信息...",
                    "sLengthMenu": "每页显示_MENU_条记录",
                    "sInfo": "当前显示_START_到_END_条，共_TOTAL_条文件信息",
                    "sInfoEmpty": "未查询到相关的文件信息",
                    "sZeroRecords": "对不起，查询不到相关文件信息",
                    "sInfoFiltered": "",
                    "sSearch": "搜索",
                    "oPaginate": {
                        "sPrevious": "前一页",
                        "sNext": "后一页"
                    }
                },
                "bPaginate": true,
                "iDisplayLength": 5,
                "aLengthMenu": [
                    [5, 10, 25, 50, -1],
                    [5, 10, 25, 50, "All"]
                ],
                "sDom": '<"clearfix"fr>t<"dt-panelfooter clearfix"ip>',
            });

            $("#loadItemTable").on('click', 'tbody > tr', function() {
                $file = $(this);
                $file.siblings().removeClass('selectedRow');
                $file.addClass('selectedRow');
            });
        }

        function loadTaskDetail(typeId) {
            var taskTableData = [];
            $.getJSON('/pcmanage/rlfdatamanage/gettaskinfo', {
                dataTypeId: typeId
            }, function(rsp) {
                if (rsp.code == 0) {
                    if (rsp.data.length > 0) {
                        _.each(rsp.data, function(e) {
                            var rowData = [];
                            rowData.push(e['taskId']);
                            rowData.push(e['taskName']);
                            rowData.push(e['taskType']);
                            rowData.push(e['dataType']);
                            rowData.push(e['runState']);
                            rowData.push(e['startTime']);
                            rowData.push(e['endTime']);
                            rowData.push(e['percentage']);
                            rowData.push(e['creator']);
                            taskTableData.push(rowData);
                        });
                        $("#loadTaskTable").dataTable().fnClearTable();
                        $("#loadTaskTable").dataTable().fnAddData(taskTableData);
                    } else {
                        $("#loadTaskTable").dataTable().fnClearTable();
                    }
                    disableTaskOp();
                }
            });
        }

        function loadBatchDetail(taskId) {
            var batchTableData = [];
            $.getJSON('/pcmanage/rlfdatamanage/getbatchinfo', {
                taskId: taskId
            }, function(rsp) {
                if (rsp.code == 0) {
                    if (rsp.data.length > 0) {
                        _.each(rsp.data, function(e) {
                            var rowData = [];
                            rowData.push(e['batchId']);
                            rowData.push(e['startTime']);
                            rowData.push(e['endTime']);
                            rowData.push(e['percentage']);
                            rowData.push(e['importState']);
                            rowData.push(e['batchType']);
                            batchTableData.push(rowData);
                        });
                        $("#loadBatchTable").dataTable().fnClearTable();
                        $("#loadBatchTable").dataTable().fnAddData(batchTableData);
                    } else {
                        $("#loadBatchTable").dataTable().fnClearTable();
                    }
                }
            });
        }

        function loadItemDetail(batchId) {
            var itemTableData = [];
            $.getJSON('/pcmanage/rlfdatamanage/getdataiteminfo', {
                batchId: batchId
            }, function(rsp) {
                if (rsp.code == 0) {
                    if (rsp.data.length > 0) {
                        _.each(rsp.data, function(e) {
                            var rowData = [];
                            rowData.push(e['itemId']);
                            rowData.push(e['itemName']);
                            rowData.push(e['itemType']);
                            itemTableData.push(rowData);
                        });
                        $("#loadItemTable").dataTable().fnClearTable();
                        $("#loadItemTable").dataTable().fnAddData(itemTableData);
                    } else {
                        $("#loadItemTable").dataTable().fnClearTable();
                    }
                }
            });
        }

        //任务管理按钮状态控制
        function disableTaskOp() {
            $('#btn-delete-loadtask').attr('disabled', 'disabled');
            $('#btn-begin-loadtask').attr('disabled', 'disabled');
            $('#btn-stop-loadtask').attr('disabled', 'disabled');
            $('#btn-copy-loadtask').attr('disabled', 'disabled');
        }

        //删除任务
        $('#btn-delete-loadtask').on('click', function() {
            $.post('/pcmanage/rlfdatamanage/deletetask', {
                taskId: selectedTaskId
            }, function(rsp) {
                if (JSON.parse(rsp).code == 0) {
                    Notify.show({
                        title: '删除任务成功！',
                        type: "success"
                    });
                }
            });
            $('.selectedRow').remove();
            disableTaskOp();
            showLoader();
            if (selectedNode != "") {
                if (selectedNode.extraClasses.indexOf('nv-dir') == -1) {
                    loadTaskDetail(selectedNode.data.typeId);
                } else {
                    Notify.show({
                        title: '请选中某一数据类型!',
                        type: "warning"
                    });
                    return;
                }
            } else {
                loadTaskDetail(-1);
            }
            hideLoader();
        });

        $('#btn-refresh-loadtask').on('click', function() {
            if (selectedNode != "") {
                if (selectedNode.extraClasses.indexOf('nv-dir') == -1) {
                    typeId = selectedNode.data.typeId;
                } else {
                    Notify.show({
                        title: '请选中某一数据类型!',
                        type: "warning"
                    });
                    return;
                }
            } else {
                typeId = -1
            }
            showLoader();
            setDataManageState(typeId);
            hideLoader();
        })

        //开始任务
        $('#btn-begin-loadtask').on('click', function() {
            $.post('/pcmanage/rlfdatamanage/updatetaskstate', {
                taskId: selectedTaskId,
                toState: 2
            }, function(rsp) {
                if (JSON.parse(rsp).code == 0) {
                    Notify.show({
                        title: '任务已设置为开始状态',
                        type: "success"
                    });
                    if (selectedNode != "") {
                        if (selectedNode.extraClasses.indexOf('nv-dir') == -1) {
                            loadTaskDetail(selectedNode.data.typeId);
                        } else {
                            Notify.show({
                                title: '请选中某一数据类型!',
                                type: "warning"
                            });
                            return;
                        }
                    } else {
                        loadTaskDetail(-1);
                    }
                }
            });
        });

        //任务停止
        $('#btn-stop-loadtask').on('click', function() {
            $.post('/pcmanage/rlfdatamanage/updatetaskstate', {
                taskId: selectedTaskId,
                toState: 3
            }, function(rsp) {
                if (JSON.parse(rsp).code == 0) {
                    Notify.show({
                        title: '任务已设置为停止状态',
                        type: "success"
                    });
                    if (selectedNode != "") {
                        if (selectedNode.extraClasses.indexOf('nv-dir') == -1) {
                            loadTaskDetail(selectedNode.data.typeId);
                        } else {
                            Notify.show({
                                title: '请选中某一数据类型!',
                                type: "warning"
                            });
                            return;
                        }
                    } else {
                        loadTaskDetail(-1);
                    }
                }
            });
        });

        //复制编辑按钮
        $('#btn-copy-loadtask').on('click', function() {
            var copyTaskId = parseInt($("#loadTaskTable tbody .selectedRow td:first").html());
            if (copyTaskId) {
                // _taskId = copyTaskId;
                $("#taskmanage-content").hide();
                $("#dataimport-content").show();
                $("#dataimport-nav-tabs li:nth-child(2)").siblings().removeClass("active");
                $("#dataimport-nav-tabs li:nth-child(2)").addClass("active");
                $("#step1").siblings().hide();
                $("#step1").show();
                $("#back-Button").addClass("disabled");
                if($("#next-Button").hasClass("disabled")){
                    $("#next-Button").removeClass("disabled");
                }
                // setInitFirstPage();
                _stepTo = "#step1";
                getDataimportDetails(copyTaskId);
            }
        });

        function getDataimportDetails(taskId) {
            $.post('/pcmanage/rlfdatamanage/gettaskdetail', {
                taskId: taskId
            }).done(function(rsp) {
                var rspData = JSON.parse(rsp);
                if (rspData.code == 0) {
                    restoreCondition(rspData.data);
                } else {
                    Notify.show({
                        title: "获取任务详情失败!",
                        type: "warning"
                    });
                }
            })
        }

        //=============================================任务管理 -end =========================

        //=============================================数据导入 -start=======================
        //设置tab页状态
        function setStepState(selectedNode, stepTo) {
            $(selectedNode).parent().siblings().removeClass("active");
            $(selectedNode).parent().addClass("active");
            $(stepTo).siblings().hide();
            $(stepTo).show();
        }

        //下一步按钮显示与隐藏
        function showBackButton(step) {
            if (step != "#step1") {
                $("#back-Button").removeClass("disabled");
            } else {
                $("#back-Button").addClass("disabled");
            }
        }

        //上一步按钮显示与隐藏
        function showNextButton(step) {
            if (step != "#step6") {
                $("#next-Button").removeClass("disabled");
            } else {
                $("#next-Button").addClass("disabled");
            }
        }

        //点击tab页响应事件
        $(".step").click(function(event) {
            event.preventDefault();
            var stepTo = $(this).attr("href");
            SecondPart.getInputData();

            ruleData = [];
            $.extend(true, ruleData, FirstPart.getSelectedState());

            if (_stepTo == "#step1" && (stepTo == "#step2" || stepTo == "#step3")) {
                if (_colDef.length <= 0) {
                    Notify.show({
                        title: "请先选择数据类型或该数据类型字段为空！",
                        type: "warning"
                    });
                } else {
                    render(stepTo);
                    _stepTo = stepTo;
                    showBackButton(_stepTo);
                    showNextButton(_stepTo);
                    setStepState(this, stepTo);
                }
            } else if (stepTo == "#step4" || stepTo == "#step5" || stepTo == "#step6") {
                var getThirdState = [];
                var propsName = [];
                $.extend(getThirdState, ThirdPart.getSelectedState());
                if (getThirdState.length <= 0) {
                    Notify.show({
                        title: "请先完成第三步设置！",
                        type: "warning"
                    });
                } else if (getThirdState[0].selectedEntitysId.length <= 0) {
                    Notify.show({
                        title: "请先选择第三步中将要操作的实体！",
                        type: "warning"
                    });
                } else {
                    var propSet = true;
                    var propSetName = true;
                    var selectedEntitysKeyPropsId = getThirdState[0].selectedEntitysKeyPropsId;
                    for (var i = 0; i < selectedEntitysKeyPropsId.length; i++) {
                        var flag = false;
                        _.map(getThirdState, function(stateItem, stateIndex) {
                            if (selectedEntitysKeyPropsId[i] == stateItem.propid) {
                                flag = true;
                            }
                        })
                        if (!flag) {
                            propSet = false;
                            Notify.show({
                                title: "必配的属性配置不全，请重配！",
                                type: "warning"
                            });
                            break;
                        }
                    }

                    for (var j = 0; j < getThirdState.length; j++) {
                        if (_.contains(propsName, getThirdState[j].propRuleName)) {
                            propSetName = false;
                            Notify.show({
                                title: "属性名不能相同，请重新设置属性名！",
                                type: "warning"
                            });
                            break;
                        } else {
                            propsName.push(getThirdState[j].propRuleName);
                        }
                    }

                    if (propSet && propSetName) {
                        if (stepTo == "#step5" || stepTo == "#step6") {
                            var getForthState = [];
                            var forthFlag = false;
                            var continueTestFlag = true;

                            $.extend(getForthState, ForthPart.getSelectedState());

                            for (var ruleIndex = 0; ruleIndex < ruleData.length; ruleIndex++) {
                                var forthPropName = [];
                                var forthPropNameFlag = false;
                                for (var con = 0; con < getForthState.length; con++) {
                                    if (ruleData[ruleIndex].caption == getForthState[con].rule) {
                                        if (_.contains(forthPropName, getForthState[con].entityRuleName)) {
                                            forthPropNameFlag = true;
                                            continueTestFlag = false;
                                            Notify.show({
                                                title: "第四步中,实体名称不能相同，请重新设置实体名称！",
                                                type: "warning"
                                            });
                                            break;
                                        } else {
                                            forthPropName.push(getForthState[con].entityRuleName);
                                        }
                                    }
                                }
                                if (forthPropNameFlag) {
                                    break;
                                }
                            }

                            if (continueTestFlag) {
                                if (stepTo == "#step6") {
                                    if (getForthState.length <= 0) {
                                        Notify.show({
                                            title: "第四步设置设置不能为空！",
                                            type: "warning"
                                        });
                                    } else {
                                        for (var index = 0; index < getForthState.length; index++) {
                                            if (getForthState[index].keyPropTemp.length > getForthState[index].keyProp.length) {
                                                Notify.show({
                                                    title: "第四步设置中,条件" + (index + 1) + "必配属性配置不全!",
                                                    type: "warning"
                                                });

                                                forthFlag = true;
                                                break;
                                            } else {
                                                for (var keyIndex = 0; keyIndex < getForthState[index].keyPropTemp.length; keyIndex++) {
                                                    var count = 0;
                                                    _.map(getForthState[index].keyProp, function(keyPropItem) {
                                                        if (getForthState[index].keyPropTemp[keyIndex] == keyPropItem.propId) {
                                                            count++;
                                                        }
                                                    })
                                                    if (count == 0) {
                                                        Notify.show({
                                                            title: "第四步设置中,条件" + (index + 1) + "必配属性配置不全!",
                                                            type: "warning"
                                                        });
                                                        forthFlag = true;
                                                        break;
                                                    } else if (count > 1) {
                                                        Notify.show({
                                                            title: "第四步设置中,条件" + (index + 1) + "必配属性配置重复!",
                                                            type: "warning"
                                                        });
                                                        forthFlag = true;
                                                        break;
                                                    }
                                                }

                                                if (forthFlag) {
                                                    break;
                                                }
                                            }
                                        }

                                        if (!forthFlag) {
                                            render(stepTo);
                                            _stepTo = stepTo;
                                            showBackButton(_stepTo);
                                            showNextButton(_stepTo);
                                            setStepState(this, stepTo);
                                        }
                                    }
                                } else {
                                    render(stepTo);
                                    _stepTo = stepTo;
                                    showBackButton(_stepTo);
                                    showNextButton(_stepTo);
                                    setStepState(this, stepTo);
                                }
                            }
                        } else {
                            render(stepTo);
                            _stepTo = stepTo;
                            showBackButton(_stepTo);
                            showNextButton(_stepTo);
                            setStepState(this, stepTo);
                        }
                    }
                }
            } else {
                render(stepTo);
                _stepTo = stepTo;
                showBackButton(_stepTo);
                showNextButton(_stepTo);
                setStepState(this, stepTo);
            }
        })

        $("#checkboxSwitch").change(function(e) {
            _switchButton = this.checked ? true : false;
            if (_switchButton) {
                $("#ruleSets").show();
            } else {
                $("#ruleSets").hide();
            }
        });

        //下一步按钮点击响应事件
        $("#next-Button").click(function() {
            if ($("ul.nav-tabs li.active").attr("href") == "#step6") {
                $("#step6_href").click();
            } else {
                $("ul.nav-tabs li.active").next().find("a").click();
            }
        });

        //上一步按钮点击响应事件
        $("#back-Button").click(function() {
            if ($("ul.nav-tabs li.active").attr("href") == "#step1") {
                $("#step1_href").click();
            } else {
                $("ul.nav-tabs li.active").prev().find("a").click();
            }
        });

        //React页面组件render
        function render(container) {
            if (container == "#step2") {
                SecondPart.render($(container)[0], _switchButton, ruleData, _stringColDef, _dataType.typeId);
            } else if (container == "#step3") {
                ThirdPart.render($(container)[0], _property, _colDef, _entityType);
            } else if (container == "#step4") {
                var getThirdState = [];
                $.extend(getThirdState, ThirdPart.getSelectedState());
                ForthPart.render($(container)[0], _switchButton, ruleData, _entityType, getThirdState);
            } else if (container == "#step5") {
                var thirdState = ThirdPart.getSelectedState();
                var forthState = ForthPart.getSelectedState();
                FifthPart.render($(container)[0], _switchButton, ruleData,thirdState, forthState, _relationType);
            }
        }

        //选择数据类型按钮
        $('#choose-data-button').on('click', function(e) {
            getDataType();
        })

        //选择文件导入类型
        $('#choose-fileImport-type :radio').on('click', function(e) {
            _dataImportType = $(this).val();
        })

        //任务提交 
        $('#taskCommitButton').on('click', function() {
            var ruleSets = [];
            var uiDetailSets = [];
            _.map(ruleData, function(item, index) {
                var rule = getRuleSet(item.caption);
                var uiDetailRule = getUIDeatil(item.caption);
                ruleSets.push(rule);
                uiDetailSets.push(uiDetailRule);
            })
            var taskDetailSet = {
                "timestampField": $('#select2').val(),
                "ruleSet": ruleSets,
            }
            var uiDetail = {
                "timestampField": $('#select2').val(),
                "ruleSetNames": ruleData,
                "dataTypeName": _dataType.caption,
                "switchButton": _switchButton,
                "ruleSet": uiDetailSets
            }
            var taskDetailStr = JSON.stringify(taskDetailSet);
            var uiDetailStr = JSON.stringify(uiDetail);
            // var createNewFlag;
            // if (_taskId == -1) {
            //     createNewFlag = true;
            //     _taskId = -1;
            // } else {
            //     createNewFlag = false;
            // }
            $.get("pcmanage-taskSubmitDialog.html", function(result) {
                Dialog.build({
                    title: '提交任务',
                    content: result,
                    rightBtn: '确定',
                    rightBtnCallback: function() {
                        var name = $("#update-file-name").val().trim();
                        var desc = $("#update-file-description").val().trim();
                        if (name == "") {
                            Notify.show({
                                title: "任务名称不能为空！",
                                type: "warning"
                            });
                            return;
                        }
                        $.post('/pcmanage/rlfdatamanage/submitTask', {
                            "createNew": true,
                            "taskId": _taskId,
                            "taskName": name,
                            "taskType": _dataImportType,
                            "taskRemark": desc,
                            "centerCode": _dataType.centerCode,
                            "zoneId": _dataType.zoneId,
                            "ruleSetNames": ruleData,
                            "dataTypeId": _dataType.typeId,
                            "taskDetail": taskDetailStr,
                            "uiDetail": uiDetailStr
                        }).done(function(data) {
                            Dialog.dismiss();
                            data = JSON.parse(data);
                            if (data.code == 0) {
                                Notify.show({
                                    title: "任务提交成功！",
                                    type: "success"
                                });
                            } else {
                                Notify.show({
                                    title: data.message,
                                    type: "failed"
                                });
                            }
                        })
                    }
                }).show(function() {
                    if (_taskName == "") {
                        $("#update-file-name").val("");
                        $("#update-file-description").text("");
                    } else {
                        $("#update-file-name").val(_taskName);
                        $("#update-file-description").text(_taskDes);
                    }
                });
            });
        })

        //=====================数据导入 -end======================================

        //=====================任务提交,获取taskDetail -start============================
        function getRuleSet(ruleNum) {
            var getFilterRules = getFilterRule(ruleNum);
            var getPropertyFieldSRules = getPropertyFieldSRule(ruleNum);
            var getEntityRules = getEntityRule(ruleNum);
            var getRelationRules = getRelationRule(ruleNum);
            return {
                "ruleSetName": ruleNum,
                "filterRule": getFilterRules,
                "propertyFieldMap": getPropertyFieldSRules,
                "entityExtractRule": getEntityRules,
                "relationExtractRule": getRelationRules
            }
        }

        function getFilterRule(ruleNum) {
            var secondConditions = SecondPart.getSelectedState();
            var returnData = [];
            _.map(secondConditions, function(item, index) {
                if (item.rule == ruleNum) {
                    returnData.push({
                        filterRuleName: item.filterRuleName,
                        field: item.field,
                        fieldType: item.fieldType,
                        opType: item.opType,
                        opValue: item.opValue
                    });
                }
            })
            return returnData;
        }

        function getPropertyFieldSRule(ruleNum) {
            var temp = ThirdPart.getSelectedState();
            var thirdConditions = [];
            _.map(temp, function(itemInfo, index) {
                thirdConditions.push({
                    propRuleName: itemInfo.propRuleName,
                    propid: itemInfo.propid,
                    proptype: itemInfo.proptype,
                    field: itemInfo.field
                })
            })
            return thirdConditions;
        }

        function getEntityRule(ruleNum) {
            var forthConditions = ForthPart.getSelectedState();;
            var returnData = [];
            _.map(forthConditions, function(item, index) {
                var temp = [];
                _.map(item.keyProp, function(keyPropItem) {
                    temp.push(keyPropItem.propName);
                })
                if (item.rule == ruleNum) {
                    returnData.push({
                        entityRuleName: item.entityRuleName,
                        needMerge: item.needMerge,
                        entityType: item.entityType,
                        keyProp: temp,
                        prop: item.prop,
                    });
                }
            })
            return returnData;
        }

        function getRelationRule(ruleNum) {
            var fifthConditions = FifthPart.getSelectedState();
            var returnData = [];
            _.map(fifthConditions, function(item, index) {
                if (item.rule == ruleNum) {
                    returnData.push({
                        relationRuleName: item.relationRuleName,
                        needMerge: item.needMerge,
                        relationType: item.relationType,
                        bidirection: item.bidirection,
                        entityRuleName1: item.entityRuleName1,
                        entityRuleName2: item.entityRuleName2,
                        relationProp: item.relationProp
                    });
                }
            })
            return returnData;
        }
        //=====================任务提交,获取taskDetail -end==========================

        //=====================任务提交,获取uiDetail -start============================
        function getUIDeatil(ruleNum) {
            var getUIDeatilFilterRules = getUIDeatilFilterRule(ruleNum);
            var getUIDeatilPropertyFieldSRules = getUIDeatilPropertyFieldSRule(ruleNum);
            var getUIDeatilEntityRules = getUIDeatilEntityRule(ruleNum);
            var getUIDeatilRelationRules = getUIDeatilRelationRule(ruleNum);
            return {
                "filterRule": getUIDeatilFilterRules,
                "propertyFieldMap": getUIDeatilPropertyFieldSRules,
                "entityExtractRule": getUIDeatilEntityRules,
                "relationExtractRule": getUIDeatilRelationRules
            }
        }

        function getUIDeatilFilterRule(ruleNum) {
            var secondConditions = SecondPart.getSelectedState();
            var returnData = [];
            _.map(secondConditions, function(item, index) {
                if (item.rule == ruleNum) {
                    returnData.push(item);
                }
            })
            return returnData;
        }

        function getUIDeatilPropertyFieldSRule(ruleNum) {
            var thirdConditions = ThirdPart.getSelectedState();
            return thirdConditions;
        }

        function getUIDeatilEntityRule(ruleNum) {
            var forthConditions = ForthPart.getSelectedState();;
            var returnData = [];
            _.map(forthConditions, function(item, index) {
                if (item.rule == ruleNum) {
                    returnData.push(item);
                }
            })
            return returnData;
        }

        function getUIDeatilRelationRule(ruleNum) {
            var fifthConditions = FifthPart.getSelectedState();
            var returnData = [];
            _.map(fifthConditions, function(item, index) {
                if (item.rule == ruleNum) {
                    returnData.push(item);
                }
            })
            return returnData;
        }
        //=====================任务提交,获取uiDetail -end==========================

        //=====================条件还原 -start====================================
        //条件还原
        function restoreCondition(data) {
            // _taskName = data.taskName || "";
            // _taskDes = data.taskRemark || "";
            var uiDetail;
            typeof(data.uiDetail) == "string" ? uiDetail = JSON.parse(data.uiDetail) : uiDetail = data.uiDetail;
            _dataType = {
                "centerCode": data.centerCode,
                "zoneId": data.zoneId,
                "typeId": data.dataTypeId,
                "caption": uiDetail.dataTypeName,
            }
            $("#data-type-text").val(uiDetail.dataTypeName);
            _dataImportType = data.taskType;
            if (uiDetail.switchButton == false) {
                _switchButton = false;
                $("#ruleSets").hide();
            } else {
                _switchButton = true;
                $("#ruleSets").show();
            }
            if (_switchButton) {
                $("#checkboxSwitch").attr("checked", 'checked');
            }
            if (data.taskType == "1") {
                $('input[name=selectFileType]:eq(0)').click();
            } else if (data.taskType == "2") {
                $('input[name=selectFileType]:eq(1)').click();
            } else if (data.taskType == "3") {
                $('input[name=selectFileType]:eq(2)').click();
            }

            $.getJSON('/pcmanage/rlfdatamanage/getDataTypeColDef', {
                typeId: data.dataTypeId,
                zoneId: data.zoneId,
                centerCode: data.centerCode
            }).done(function(rsp) {
                if (rsp.data) {
                    _colDef = rsp.data;
                    _stringColDef = [];
                    $.extend(true, _stringColDef, PcmanageFuncHelper.getStringColDef(_colDef));

                    PcmanageFuncHelper.initSelectData(_colDef);
                    $('#select2').find("option[value='" + uiDetail.timestampField + "']").attr("selected", true);
                }
                $.getJSON('/pcmanage/rlfdatamanage/getbasicproperty', {}).done(function(rsp) {
                    if (rsp.data) {
                        _property = [];
                        _property = rsp.data.property;
                        _entityType = [];
                        _entityType = rsp.data.entityType;
                        _relationType = [];
                        _relationType = rsp.data.relationType;
                        ruleData = [];
                        var rulesData = uiDetail.ruleSetNames;
                        $.extend(true, ruleData, rulesData);

                        setInitReactState(_dataType.typeId);

                        var secondPartData = PcmanageFuncHelper.getSecondPartData(uiDetail.ruleSet);
                        var thirdPartData = PcmanageFuncHelper.getThirdPartData(uiDetail.ruleSet);
                        var forthPartData = PcmanageFuncHelper.getForthPartData(uiDetail.ruleSet);
                        var fifthPartData = PcmanageFuncHelper.getFifthPartData(uiDetail.ruleSet);
                        FirstPart.renderFirst($("#ruleSets")[0], ruleData);
                        SecondPart.renderSecond($("#step2")[0], _switchButton, ruleData, _stringColDef, secondPartData, _dataType.typeId);
                        ThirdPart.renderThird($("#step3")[0], _property, _colDef, _entityType, thirdPartData);
                        ForthPart.renderForth($("#step4")[0], _switchButton, ruleData, _entityType, thirdPartData, forthPartData);
                        FifthPart.renderFifth($("#step5")[0], _switchButton, ruleData,thirdPartData, forthPartData, _relationType, fifthPartData);
                    }
                })
            })
        }
        //=====================条件还原 -end====================================

        //根据数据类型获取字段
        function getColDef(dataType) {
            $.getJSON('/pcmanage/rlfdatamanage/getDataTypeColDef', {
                typeId: dataType.typeId,
                zoneId: dataType.zoneId,
                centerCode: dataType.centerCode
            }).done(function(rsp) {
                if (rsp.data) {
                    _colDef = rsp.data;
                    _stringColDef = [];
                    $.extend(true, _stringColDef, PcmanageFuncHelper.getStringColDef(_colDef));

                    PcmanageFuncHelper.initSelectData(_colDef);
                }
                if (_property.length <= 0) {
                    $.getJSON('/pcmanage/rlfdatamanage/getbasicproperty', {}).done(function(rsp) {
                        if (rsp.data) {
                            _property = rsp.data.property;
                            _entityType = rsp.data.entityType;
                            _relationType = rsp.data.relationType;
                        }
                    })
                }
            })
        }

        //弹出选择数据类型对话框
        function getDataType() {
            $.getJSON('/pcmanage/rlfdatamanage/datatypetree', {
                // userId:_userId
            }).done(function(rsp) {
                Dialog.build({
                    title: "选择数据类型",
                    content: "<div id='dataTypeChoose'></div>",
                    rightBtnCallback: function() {
                        toRefreshMapTable = true;
                        toRefreshMapTableHead = true;
                        toRefreshPreViewTable = true;
                        // 确认
                        var selectedTree = $("#dataTypeChoose");
                        var selectedNode = $(selectedTree).fancytree("getTree").getActiveNode();
                        if (selectedNode) {
                            _dataType = {};
                            _dataType = selectedNode.data;
                            $.magnificPopup.close();
                            $("#data-type-text").val(_dataType.caption);
                            setInitFirstPage();
                            setInitState(_dataType);
                        } else {
                            Notify.show({
                                title: "请选择正确的数据类型！",
                                type: "failed"
                            });
                        }
                    }
                }).show(function() {
                    $('#dataTypeChoose').fancytree({
                        selectMode: 2,
                        clickFolderMode: 1,
                        autoScroll: true,
                        source: function() {
                            return rsp.data;
                        },
                        iconClass: function(event, data) {
                            if (data.node.extraClasses.indexOf("nv-dir") != -1) {
                                return "fa fa-folder fa-fw";
                            } else {
                                return "fa fa-database fa-fw";
                            }
                        }
                    });
                });
            })
        }

        //================================模型保存和另存为 -start======================

        $('#btn-save-as-file').on('click', function() {
            event.preventDefault();
            var modelInfo = {};
            modelInfo.modelId = 0;

            modelInfo.modelName = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
            modelInfo.modelDesc = "";
            modelInfo.dirId = 0;
            modelInfo.modelType = 440; //人立方导入modeType

            var temp = getModelInfo();
            modelInfo.modelDetail = temp;

            var codArg = JSON.stringify(modelInfo)
            PcmanageFuncHelper.exportFile(codArg);

        })

        //模型保存
        $('#btn-save-model').on('click', function() {
            event.preventDefault();
            var codArg = getModelInfo();
            PcmanageFuncHelper.updateTplInfo(_modelId, codArg);
        })

        //模型另存为
        $("#btn-save-as-model").on("click", function(event) {
            event.preventDefault();
            var treeAreaFlag = "saveModel";
            if (_modelId == "0") {
                showTplTree("保存模型", treeAreaFlag, "1");
            } else {
                showTplTree("模型另存为", treeAreaFlag, "2");
            }
        })

        //获取模型信息
        function getModelInfo() {
            var uiDetailSets = [];
            _.map(ruleData, function(item, index) {
                var uiDetailRule = getUIDeatil(item.caption);
                uiDetailSets.push(uiDetailRule);
            })
            var uiDetail = {
                    "timestampField": $('#select2').val(),
                    "ruleSetNames": ruleData,
                    "dataTypeName": _dataType.caption,
                    "switchButton": _switchButton,
                    "ruleSet": uiDetailSets
                }
                // var createNewFlag;
                // if (_taskId == -1) {
                //     createNewFlag = true;
                //     _taskId = -1;
                // } else {
                //     createNewFlag = false;
                // }
            var modelInfo = {
                "createNew": true,
                "taskType": _dataImportType,
                "taskId": -1,
                "taskName": "",
                "taskType": _dataImportType,
                "taskRemark": "",
                "centerCode": _dataType.centerCode,
                "zoneId": _dataType.zoneId,
                "ruleSetNames": JSON.stringify(ruleData),
                "dataTypeId": _dataType.typeId,
                "uiDetail": JSON.stringify(uiDetail)
            }
            var modelInfoStr = JSON.stringify(modelInfo);
            return modelInfoStr;
        }

        function showTplTree(title, treeAreaFlag, messageFlag) {
            var temp = '<div><div id="folder-picker"> Loading... </div><div class="admin-form theme-info"><form><div class="section mt10"><label for="update-file-name" class="field-label">模型名称 *</label><label for="name" class="field"><input style="width:100%" type="text" name="update-file-name" id="update-file-name" class="gui-input"></label></div><div class="section"><label for="update-file-description" class="field-label">描述 *</label><label for="update-file-description" class="field"><textarea type="description" name="update-file-description" id="update-file-description" class="gui-textarea" style="vertical-align: top; width:100%"></textarea></label></div></div></form></div>';
            Dialog.build({
                title: title,
                content: temp,
                rightBtnCallback: function() {
                    // 确认
                    var newParentNode = $("#folder-picker").fancytree("getTree").getActiveNode();
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
                    modelInfo.modelId = _modelId;

                    modelInfo.modelName = name;
                    modelInfo.modelDesc = desc;
                    modelInfo.dirId = id;
                    modelInfo.modelType = 440; //人立方导入modeType

                    var temp = getModelInfo();
                    modelInfo.modelDetail = temp;
                    PcmanageFuncHelper.saveTplInfo(modelInfo, messageFlag);

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

    });