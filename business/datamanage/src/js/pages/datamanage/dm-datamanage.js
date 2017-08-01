initLocales();
require(['../../module/dm/basicfunction/dm-tree',
        'nova-notify', 'nova-dialog', 'nova-bootbox-dialog',
        'nova-utils',
        '../../module/dm/datatypemanage',
        '../../module/dm/taskmanage',
        '../../module/dm/dataimport',
        '../../module/dm/basicfunction/dataview',
        '../../module/dm/basicfunction/dm-powerManage',
        '../../tpl/tpl-dataTypeDetail',
        '../../tpl/tpl-userTree',
        'utility/select2/select2.min',
        'jquery.datatables'
    ],
    function (Tree, Notify, Dialog, bootbox, Util, Datatypemanage, Taskmanage, Dataimport,
              Dataview, powerManage, tplDdataTypeDetail, tplUserTree) {
        tplDdataTypeDetail = _.template(tplDdataTypeDetail);
        tplUserTree = _.template(tplUserTree);

        var giveDataTypeId, giveCenterCode, giveZoneId;
        giveDataTypeId = getURLParameter("datatypeid");
        giveCenterCode = getURLParameter("centercode");
        giveZoneId = getURLParameter("zoneid");

        //1:编辑数据类型; 2:查看导入任务; 3:导入数据; 4:浏览数据
        var oprType = 0;
        oprType = getURLParameter("oprtype");
        var modelId = 0;
        modelId = getURLParameter("modelid");
        var batchId = 0;
        batchId = getURLParameter('batchId');
        var fileId = 0;
        fileId = getURLParameter('fileId');

        var selectedNode;
        var hasSysMGRFunction = false;
        //目录操作类型：1.创建； 2.修改
        var dirOprType = 1;

        var lastX;

        $(window).on("resize", function () {
            //var leftTray = $('.tray.tray-left');
            //
            //var leftHeight = window.innerHeight - leftTray.offset().top;
            //console.log("window.innerHeight", window.innerHeight);
            //console.log("leftTray.offset().top", leftTray.offset().top);
            //console.log("leftHeight", leftHeight);
            //
            //$('#form-container').height(leftHeight);
            //$('.tray.tray-center').height(leftHeight);
            //
            //console.log("('#dir-tree-panel').position().top", $('#dir-tree-panel').position().top);
            //$('#data-treeview').height(leftHeight - $('#dir-tree-panel').position().top - 40);
            //leftTray.height(leftHeight);

            var leftTray = $('.tray.tray-left');
            var leftHeight = window.innerHeight - leftTray.offset().top;
            $('#form-container').height(leftHeight);
        });

        init();

        //初始化
        function init(){
            //构建数据类型树
            $.post('/datamanage/dataimport/GetDataTypeWithTag', {}).done(function (res) {
                var data = JSON.parse(res);
                console.log("GetDataTypeWithTag", data);
                var dataTypeTagInfoArray = [];
                if (data.code == 0) {
                    dataTypeTagInfoArray = data.data;
                }
                else {
                    console.log("GetDataTypeWithTag error message:", data.message);
                }
                buildTreeAndInit(dataTypeTagInfoArray);
            });

            $.getJSON('/userrole/getpermission', function (rsp) {
                if (rsp.code == 0) {
                    //console.log("getpermission: ", rsp.message);
                    hasSysMGRFunction = false;
                    for (var i = 0; i < rsp.data.length; ++i) {
                        if (rsp.data[i].id == 438) {
                            hasSysMGRFunction = true;
                            break;
                        }
                    }
                    addcontextmenu();
                }
                else {
                    Notify.show({
                        title: "获取用户权限失败！",
                        content: data.message,
                        type: "danger",
                    });
                    console.log("getpermission,获取用户权限失败: ", rsp.message);
                    hasSysMGRFunction = false;
                }
            });

            bindEvent();
        }

        //给控件绑定响应事件
        function bindEvent(){
            $("#createfolder").on('click', function (event) {
                var foldername = $("#folder_create").val();
                var folderDesc = $("#folder_Desc").val();
                if (_.isEmpty(foldername)) {
                    Notify.show({
                        title: '目录名称不能为空！',
                        type: 'warning'
                    });
                }
                else {
                    if (dirOprType == 1) {
                        $.post('/datamanage/udp/adddir', {
                            'dirName': foldername,
                            'dirDesc': folderDesc,
                            'parentDirId': selectedNode.data.dirId
                        }).done(function (data) {
                            data = JSON.parse(data);
                            $.magnificPopup.close();
                            if (data.code == 0) {
                                //displayTextLibTree();
                                Notify.show({
                                    title: '创建目录成功！',
                                    type: 'success'
                                });
                                reloadTree();
                            }
                            else {
                                Notify.show({
                                    title: '创建目录出错！',
                                    type: 'error'
                                });
                                console.log("创建目录出错：" + data.message);
                            }
                        });
                        return false;
                    }
                    else if (dirOprType == 2) {
                        $.post('/workspacedir/updateDir', {
                            id: selectedNode.data.dirId,
                            newName: foldername,
                            oldName: selectedNode.data.dirName,
                            desc: folderDesc,
                            type: 4,
                            tgt: Util.getCookiekey('tgt'),
                            dirType: 3,
                            force: "0"
                        }).done(function(data) {
                            data = JSON.parse(data);
                            $.magnificPopup.close();
                            if (data.code == 0) {
                                //displayTextLibTree();
                                Notify.show({
                                    title: '修改目录成功！',
                                    type: 'success'
                                });
                                reloadTree();
                            }
                            else {
                                Notify.show({
                                    title: '修改目录失败！',
                                    type: 'error'
                                });
                                console.log("修改目录失败：" + data.message);
                            }
                        });

                        //$.post('/udp/modifyDir', {
                        //    'newName': foldername,
                        //    'newDesc': folderDesc,
                        //    'dirId': selectedNode.data.dirId,
                        //    'oldName': selectedNode.data.dirName
                        //}).done(function (data) {
                        //    data = JSON.parse(data);
                        //    $.magnificPopup.close();
                        //    if (data.code == 0) {
                        //        //displayTextLibTree();
                        //        Notify.show({
                        //            title: '修改目录成功！',
                        //            type: 'success'
                        //        });
                        //        reloadTree();
                        //    }
                        //    else {
                        //        Notify.show({
                        //            title: '修改目录失败！',
                        //            type: 'error'
                        //        });
                        //    }
                        //});

                    }
                }
            });

            //
            $('#left-panel-toggle').click(function () {
                if ($('.tray.tray-left').hasClass('hide')) {
                    leftPanelShow();
                } else {
                    leftPanelHide();
                }
            });

            $('#right-panel-splitter').draggable({
                cursor: "w-resize",
                axis: 'x',
                distance: 10,
                containment: '#container1',
                scorll: false,
                start: function (event, ui) {
                    //if ($('#right-panel-container').hasClass('hide')) {
                    //    event.preventDefault();
                    //    return;
                    //}

                    $('#right-panel-splitter').addClass('btn-info light');
                    lastX = ui.position.left;
                },
                drag: function (event, ui) {
                    var deltaX = ui.position.left - lastX;
                    //console.log("drag event", event);
                    console.log("drag ui", ui.position.left);
                    console.log("drag lastX", lastX);
                    console.log("drag deltaX", deltaX);
                    lastX = ui.position.left;

                    var newWidth = $('#right-panel-container').width() + deltaX;
                    if (newWidth < 200 && deltaX < 0 || newWidth > window.innerWidth / 2 && deltaX > 0) {
                        $('#right-panel-splitter').removeClass('btn-info light');
                        console.log("preventDefault");
                        event.preventDefault();
                        return;
                    }
                    $('#right-panel-container').width(newWidth);
                },
                stop: function (event, ui) {
                    var deltaX = ui.position.left - lastX;
                    lastX = ui.position.left;

                    console.log("deltaX", deltaX);
                    console.log("newWidth", newWidth);
                    var newWidth = $('#right-panel-container').width() + deltaX;
                    $('#right-panel-container').width(newWidth);
                    console.log("container2", $('#right-panel-container').width());

                    $('#right-panel-splitter').removeClass('btn-info light')
                        .css({
                            left: 'auto',
                            right: 0
                        });
                }
            });

            hideLoader();
        }

        var refreshDirCallbackFunc = function (selectedNode) {
            var focusTreeNode = setInterval(function () {
                var focusNode = $('#data-treeview').fancytree("getTree").
                    getNodeByKey(selectedNode.data.centerCode + selectedNode.data.typeId
                    + selectedNode.data.zoneId);

                Datatypemanage.renderDatatypemanageInfo(focusNode, "2", "查看数据结构");
                console.log("focusNode", focusNode);
                if(focusNode){
                    focusNode.setActive();
                }
                window.clearInterval(focusTreeNode);
            }, 100);
        };

        function buildTreeAndInit(dataTypeTagInfoArray){
            Tree.build({
                container: $('#data-treeview'),
                expandAll: true,
                checkbox: false,
                dataTypeTagInfoArray: dataTypeTagInfoArray
            }).
                config('activate', function (event, data) {
                    //$("#btn-move").removeAttr("disabled");
                    //$("#btn-delete").removeAttr("disabled");
                    //processSelectNode(data.node);
                }).
                config('dblclick', function (event, data) {
                    console.log("data.node", data.node);
                    if (hasSysMGRFunction) {
                        if (data.node.extraClasses == "nv-dir" || data.node.data.source == 3)
                            return;
                        else {
                            Taskmanage.init({
                                container: $('#form-container')
                            });
                            Taskmanage.renderTaskmanageInfo(data.node);
                        }
                    }

                    else {
                        if (data.node.extraClasses == "nv-dir") return;
                        else if (data.node.data.source == 2) {
                            Taskmanage.init({
                                container: $('#form-container')
                            });
                            Taskmanage.renderTaskmanageInfo(data.node);
                        }
                    }
                });

            Datatypemanage.init({
                container: $('#form-container'),
                rootNode: $('#data-treeview').fancytree("getTree").getRootNode(),
                refreshDirCallbackFunc: refreshDirCallbackFunc
            });

            Taskmanage.init({
                container: $('#form-container')
            });

            Dataimport.init({
                container: $('#form-container')
            });

            Dataview.init({
                container: $('#form-container')
            });

            //页面有初始数据类型ID，则加载该数据类型任务信息
            if (giveDataTypeId != null) {
                var focusTreeNode = setInterval(function () {
                    var focusNode = $('#data-treeview').fancytree("getTree").
                        getNodeByKey(giveCenterCode + giveDataTypeId + giveZoneId);

                    if (focusNode) {
                        switch (oprType) {
                            case "1":
                                Datatypemanage.renderDatatypemanageInfo(focusNode, "2", "查看数据结构");
                                break;
                            case "2":
                                Taskmanage.renderTaskmanageInfo(focusNode);
                                break;
                            case "3":
                                Dataimport.renderDataimportInfo(focusNode, modelId, batchId);
                                break;
                            case "4":
                                if (focusNode.data.category != 2)
                                    Dataview.renderDataView(1, focusNode, batchId, fileId);
                                else{
                                    Notify.show({
                                        title: '非结构化库无法浏览数据！',
                                        type: 'info'
                                    });
                                }
                                break;
                            default:
                                break;
                        }

                        if(focusNode){
                            focusNode.setActive();
                        }
                        window.clearInterval(focusTreeNode);
                    }
                }, 100);
            }
            else {
                if (modelId != null) {
                    $.getJSON('/datamanage/smartquery/openModel', {
                        modelId: modelId,
                    }).done(function (res) {
                        if (res.code == 0) {
                            var data = res.data;
                            batchInfo = JSON.parse(data.modelDetail);
                            var focusTreeNode = setInterval(function () {
                                var focusNode = $('#data-treeview').fancytree("getTree").
                                    getNodeByKey(batchInfo.centerCode + batchInfo.dataTypeId + batchInfo.zoneId);

                                if (focusNode) {
                                    switch (oprType) {
                                        case "1":
                                            break;
                                        case "2":
                                            break;
                                        case "3":
                                            Dataimport.renderDataimportInfo(focusNode, modelId, batchId);
                                            break;
                                        default:
                                            break;
                                    }

                                    if(focusNode){
                                        focusNode.setActive();
                                    }
                                    window.clearInterval(focusTreeNode);
                                }
                            }, 100);
                        }
                        else {
                            Notify.show({
                                title: '获取模型信息出错！' + data.message,
                                type: 'error'
                            });
                            console.log("获取模型信息出错：" + data.message);
                        }
                    });
                }
                else {
                    if (oprType == 4) {
                        if (fileId > 0)
                            Dataview.renderDataView(3, selectedNode, batchId, fileId);
                        else if (batchId > 0)
                            Dataview.renderDataView(2, selectedNode, batchId, fileId);
                    }

                    var expandRootNode = setInterval(function () {
                        var rootNode = $('#data-treeview').fancytree("getTree").getNodeByKey("dir12");
                        if (rootNode) {
                            rootNode.setExpanded(true);
                        }
                        window.clearInterval(expandRootNode);
                    }, 100);
                }
            }
        }

        //刷新数据类型树,展开根节点
        function reloadTree() {
            $.post('/datamanage/dataimport/GetDataTypeWithTag', {}).done(function (res) {
                var data = JSON.parse(res);
                console.log("GetDataTypeWithTag", data);
                var dataTypeTagInfoArray = [];
                if (data.code == 0) {
                    dataTypeTagInfoArray = data.data;
                    Tree.build({
                        container: $('#data-treeview'),
                        expandAll: true,
                        checkbox: false,
                        dataTypeTagInfoArray: dataTypeTagInfoArray
                    }).
                        config('activate', function (event, data) {
                            //$("#btn-move").removeAttr("disabled");
                            //$("#btn-delete").removeAttr("disabled");
                            //processSelectNode(data.node);
                        }).
                        config('dblclick', function (event, data) {
                            console.log("data.node", data.node);
                            if (hasSysMGRFunction) {
                                if (data.node.extraClasses == "nv-dir" || data.node.data.source == 3)
                                    return;
                                else {
                                    Taskmanage.init({
                                        container: $('#form-container')
                                    });
                                    Taskmanage.renderTaskmanageInfo(data.node);
                                }
                            }

                            else {
                                if (data.node.extraClasses == "nv-dir")
                                    return;
                                else if (data.node.data.source == 2) {
                                    Taskmanage.init({
                                        container: $('#form-container')
                                    });
                                    Taskmanage.renderTaskmanageInfo(data.node);
                                }
                            }
                        });
                }
                else {
                    console.log("GetDataTypeWithTag error message:", data.message);
                }
                buildTreeAndInit(dataTypeTagInfoArray);
            });

            //$('#data-treeview').fancytree("getTree").reload();
            var expandRootNode = setInterval(function () {
                var rootNode = $('#data-treeview').fancytree("getTree").getNodeByKey("dir12");
                if (rootNode) {
                    rootNode.setExpanded(true);
                }
                window.clearInterval(expandRootNode);
            }, 100);

            var focusTreeNode = setInterval(function () {
                var focusNode = $('#data-treeview').fancytree("getTree").
                    getNodeByKey(selectedNode.data.centerCode + selectedNode.data.typeId
                    + selectedNode.data.zoneId);
                if(focusNode){
                    focusNode.setActive();
                }
                window.clearInterval(focusTreeNode);
            }, 100);

            //if(selectedNode != undefined){
            //    selectedNode.setActive();
            //    window.clearInterval(focusTreeNode);
            //}
        }

        // 从 taskmanage.html URL 传参中获得搜索关键字
        function getURLParameter(name) {
            return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || null;
        }

        //给数据类型树添加右击菜单
        function addcontextmenu() {
            $("#data-treeview").contextmenu({
                delegate: "span.fancytree-node",
                menu: [
                    {
                        title: "<i class='fa fa-plus' style='color: #519f50'></i> &nbsp&nbsp新建目录",
                        cmd: "addChild"
                    },
                    {
                        title: "<i class='fa fa-minus' style='color: #519f50'></i> &nbsp&nbsp删除目录",
                        cmd: "delChild"
                        //disabled: false
                    },
                    {
                        title: "<i class='fa fa-level-up' style='color: #519f50'></i> &nbsp&nbsp移动",
                        cmd: "moveObject"
                    },
                    {
                        title: "<i class='glyphicon glyphicon-share-alt' style='color: #519f50'></i> &nbsp&nbsp修改目录",
                        cmd: "modifydir"
                    },
                    {
                        title: "<i class='glyphicons glyphicons-database_plus' style='color: #519f50'></i> &nbsp&nbsp新建系统库",
                        cmd: "createsysdatatype",
                    },
                    {
                        title: "<i class='fa fa-user' style='color: #519f50'></i> &nbsp&nbsp新建个人库",
                        cmd: "createuserdatatype",
                    },
                    {
                        title: "<i class='glyphicon glyphicon-arrow-down' style='color: #519f50'></i> &nbsp&nbsp降为个人库",
                        cmd: "downtoUdd",
                    },
                    {
                        title: "<i class='glyphicon glyphicon-arrow-up' style='color: #519f50'></i> &nbsp&nbsp升为系统库",
                        cmd: "uptoSys",
                    },
                    {
                        title: "<i class='glyphicons glyphicons-database_minus' style='color: #519f50'></i> &nbsp&nbsp删除数据类型",
                        cmd: "deldatatype",
                    },
                    {
                        title: "<i class='glyphicon glyphicon-file' style='color: #519f50'></i> &nbsp&nbsp查看数据结构",
                        cmd: "checkStructure",
                    },
                    {
                        title: "<i class='fa fa-edit' style='color: #519f50'></i> &nbsp&nbsp编辑数据类型",
                        cmd: "edit",
                    },
                    {
                        title: "<i class='imoon imoon-copy' style='color: #519f50'></i> &nbsp&nbsp克隆数据类型",
                        cmd: "copydatatype",
                    },
                    {
                        title: "<i class='fa fa-columns' style='color: #519f50'></i> &nbsp&nbsp浏览数据",
                        cmd: "viewdata",
                    },
                    {
                        title: "<i class='fa fa-tasks' style='color: #519f50'></i> &nbsp&nbsp查看导入任务",
                        cmd: "checktasks",
                    },
                    {
                        title: "<i class='glyphicon glyphicon-import' style='color: #519f50'></i> &nbsp&nbsp导入数据",
                        cmd: "dataimport",
                    },
                    {
                        title: "<i class='glyphicon glyphicons-notes' style='color: #519f50'></i> &nbsp&nbsp查看数据类型详情",
                        cmd: "checkDetails",
                    },
                    {
                        title: "<i class='fa fa-user' style='color: #519f50'></i> &nbsp&nbsp更换管理员",
                        cmd: "updateManager",
                    },
                    {
                        title: "<i class='fa fa-refresh' style='color: #519f50'></i> &nbsp&nbsp全部刷新",
                        cmd: "refreshall",
                    },
                ],
                beforeOpen: beforeOpen,  //定义在菜单展现之前的操作
                select: contextMenuSelect           //定义选中菜单中的项的操作
            });

            $("#data-treeview").on("nodeCommand", function (event, data) {
                var refNode;
                var tree = $(this).fancytree("getTree");
                var node = tree.getActiveNode();
                selectedNode = node;
                switch (data.cmd) {
                    case "addChild":  //新建目录
                        if (!node.extraClasses == "nv-dir") return;
                        addfolder(); //node.editCreateNode("child", {title:"",folder:true});
                        break;
                    case "delChild":  //删除目录
                        if (!node.extraClasses == "nv-dir") return;
                        delfolder();
                        break;
                    case "moveObject":  //移动
                        if (!node.extraClasses == "nv-dir") return;
                        moveObject();
                        break;
                    case "modifydir":  //修改目录
                        if (!node.extraClasses == "nv-dir") return;
                        modifydir(); //node.editCreateNode("child", {title:"",folder:true});
                        break;
                    case "createsysdatatype":  //新建系统库
                        if (!node.extraClasses == "nv-dir") return;
                        else {
                            Datatypemanage.renderDatatypemanageInfo(node, "4", "新建系统库");
                        }
                        break;
                    case "createuserdatatype":  //新建个人库
                        if (!node.extraClasses == "nv-dir") return;
                        else {
                            Datatypemanage.renderDatatypemanageInfo(node, "4", "新建个人库");
                        }
                        break;
                    case "downtoUdd":  //降为个人库
                        if (!node.extraClasses == "nv-dir") return;
                        else {
                            changeDatatypeZone(2);
                        }
                        break;
                    case "uptoSys":  //升为系统库
                        if (!node.extraClasses == "nv-dir") return;
                        else {
                            changeDatatypeZone(1);
                        }
                        break;
                    case "deldatatype":  //删除数据类型
                        if (!node.extraClasses == "nv-dir") return;
                        deldatatype();
                        break;
                    case "edit":  //编辑数据类型
                        if (node.extraClasses == "nv-dir") return;
                        else {
                            Datatypemanage.renderDatatypemanageInfo(node, "3-1", "编辑数据类型");
                        }
                        break;
                    case "copydatatype":  //克隆数据类型
                        if (node.extraClasses == "nv-dir") return;
                        else {
                            Datatypemanage.renderDatatypemanageInfo(node, "0", "克隆数据类型");
                            //Datatypemanage.renderDatatypemanageInfo(node, "3-2", "克隆数据类型");
                        }
                        break;
                    case "viewdata":  //浏览数据
                        if (node.extraClasses == "nv-dir") return;
                        else {
                            Dataview.renderDataView(1, node, batchId, fileId);
                        }
                        break;
                    case "checkStructure":  //查看数据结构
                        if (node.extraClasses == "nv-dir") return;
                        else {
                            Datatypemanage.renderDatatypemanageInfo(node, "2", "查看数据结构");
                        }
                        break;
                    case "checktasks":  //查看导入任务
                        if (node.extraClasses == "nv-dir") return;
                        else {
                            Taskmanage.renderTaskmanageInfo(node);
                        }
                        break;
                    case "dataimport":  //导入数据
                        if (node.extraClasses == "nv-dir") return;
                        else {
                            Dataimport.renderDataimportInfo(node, -1, -1);
                        }
                        break;
                    case "checkDetails":  //查看数据类型详情
                        if (node.extraClasses == "nv-dir") return;
                        else {
                            checkDetails();
                        }
                        break;
                    case "updateManager":  //更换管理员
                        if (node.extraClasses == "nv-dir") return;
                        else {
                            updateDatatypeManager();
                        }
                        break;
                    case "refreshall":  //全部刷新
                        reloadTree();
                        break;
                    default:
                        return;
                }
            });
        }

        //定义在菜单展现之前的操作
        function beforeOpen(event, ui) {
            //获取节点
            var node = $.ui.fancytree.getNode(ui.target);
            selectedNode = node;
            console.log("beforeOpen node", node);
            //刷新功能始终能用
            $("#data-treeview").contextmenu("showEntry", "refreshall", true);
            //获取数据类型树节点的类型，返回值：1：根目录节点，2：系统区目录节点，3：个人区目录节点，
            // 4：系统区数据类型节点，5：个人区数据类型节点，6:共享目录下数据类型节点，0：其他。
            var nodeType = powerManage.getTreeNodeType(node);

            powerManage.setNoPower();
            switch (nodeType) {
                case 0:
                    break;
                case 1:
                    powerManage.setPowerForRoot(node, hasSysMGRFunction);
                    break;
                case 2:
                    powerManage.setPowerForSysDir(node, hasSysMGRFunction);
                    break;
                case 3:
                    powerManage.setPowerForUserDir(node, hasSysMGRFunction);
                    break;
                case 4:
                    powerManage.setPowerForSysDataType(node, hasSysMGRFunction);
                    break;
                case 5:
                    powerManage.setPowerForUserDataType(node, hasSysMGRFunction);
                    break;
                case 6:
                    powerManage.setPowerForShareDataType(node, hasSysMGRFunction);
                    break;
                default :
                    break;
            }

            node.setActive(); //将当前节点设置为active状态
        }

        //定义选中菜单中的项的操作
        function contextMenuSelect(event, ui) {
            //延时0.1秒执行命令，以确保菜单关闭和执行命令两件事情不冲突
            var that = this;
            setTimeout(function () {
                $(that).trigger("nodeCommand", {cmd: ui.cmd});
            }, 100);
        }

        function updateDatatypeManager(){
            Dialog.build({
                title: "<i class='fa fa-user' style='color: #519f50'></i>更换数据类型管理员",
                content: tplUserTree({
                    //loginname: "高级设置"
                }),
                rightBtnCallback: function () {
                    var departmentTree = $("#users-choose").fancytree("getTree");
                    var selectedUserNodes = departmentTree.getSelectedNodes();
                    if (selectedUserNodes.length > 0) {
                        if(selectedUserNodes.length > 1){
                            Notify.show({
                                title: "只能选择一个节点!",
                                type: "error",
                            });
                        }
                        else{
                            var userNode = selectedUserNodes[0];
                            console.log("userNode", userNode);
                            if (userNode.extraClasses != "nv-department-people"){
                                Notify.show({
                                    title: "必须选择用户!",
                                    type: "error",
                                });
                            }
                            else{
                                $.post('/datamanage/dataimport/UpdateOwnerForDataType', {
                                    dataTypeId: selectedNode.data.typeId,
                                    centerCode: selectedNode.data.centerCode,
                                    dataTypeName: selectedNode.data.caption,
                                    zoneId: selectedNode.data.zoneId,
                                    oldOwnerId: selectedNode.data.ownerId,
                                    newOwnerName: userNode.data.loginName,
                                    newOwnerId: userNode.data.userId,
                                    newDirId: -10000-userNode.data.userId
                                }).done(function(data) {
                                    var updateZoneData = JSON.parse(data);
                                    if (updateZoneData.code == 0) {
                                        Notify.show({
                                            title: "更换数据类型管理员成功(该数据类型将挂载在该用户的【个人工作区】目录下)！",
                                            type: "success",
                                        });
                                        reloadTree();
                                        $('#form-container').empty();
                                        $.magnificPopup.close();
                                    }
                                    else {
                                        Notify.show({
                                            title: "更换数据类型管理员失败！",
                                            content: data.message,
                                            type: "danger",
                                        });
                                        console.log("更换数据类型管理员失败：" + data.message);
                                        $.magnificPopup.close();
                                    }
                                });
                                $.magnificPopup.close();
                            }
                        }
                    }
                }

            }).show(function () {
                $.get('/workspacedir/selectusers', {
                    shareUserList: []
                }).done(function(rspData) {
                    rspData = JSON.parse(rspData);
                    if (rspData.code == 0) {
                        $("#users-choose").empty();
                        Tree.buildDepartmentTree({
                            source: rspData.data,
                            container: $("#users-choose"),
                            autoCollapse: true,
                            expandAll: true
                        });
                    }
                    else {
                        Notify.show({
                            title: "目录树选中已共享用户失败!",
                            type: "warning",
                        });
                        console.log("目录树选中已共享用户失败：" + data.message);
                    }
                })
            });
        }

        function changeDatatypeZone(changeType) {
            if (changeType == 1) {
                $.getJSON('/workspacedir/shareinfo', {
                    resourceType: 2,
                    resourceId: selectedNode.data.typeId
                }).done(function (rsp) {
                    var shareList = rsp.data;
                    var shareUserListStr = '';
                    if (shareList.length > 0) {
                        _.each(shareList, function (user) {
                            shareUserListStr += user.userName + ',';
                        })
                        shareUserListStr = shareUserListStr.substr(0, shareUserListStr.length-1);
                        bootbox.confirm("确定升为系统库？该数据类型[" + selectedNode.title
                            + "]已被共享给（" + shareUserListStr + ")，升为系统库后所有共享将取消，" +
                            "其他用户需要授权才能使用该数据类型！",
                            function (rlt) {
                                if (rlt) {
                                    showchangeDatatypeZoneDialog(changeType);
                                    $.post('/workspacedir/shareresource', {
                                        resourceId: selectedNode.data.typeId,
                                        resourceName: selectedNode.data.caption,
                                        resourceType: 2,
                                        shareInfos: []
                                    }).done(function(data) {
                                        Dialog.dismiss();
                                        data = JSON.parse(data);
                                        if (data.code == 0) {
                                            Notify.show({
                                                title: "成功取消共享设置！",
                                                type: "success",
                                            });
                                        }
                                        else {
                                            Notify.show({
                                                title: "共享设置失败！",
                                                content: data.message,
                                                type: "danger",
                                            });
                                            console.log("更换数据类型管理员失败：" + data.message);
                                        }
                                    });
                                }
                            });
                    }
                    else
                        showchangeDatatypeZoneDialog(changeType);
                });
            }
            else
                showchangeDatatypeZoneDialog(changeType);
        }

        function showchangeDatatypeZoneDialog(changeType) {
            Dialog.build({
                title: "<i class='glyphicon glyphicon-arrow-up' style='color: #519f50'></i>升为系统库,选择挂载目录:",
                content: "<div id='folder-picker'> Loading... </div>",
                rightBtnCallback: function () {
                    var newParentNode = $("#folder-picker").fancytree("getTree").getActiveNode();
                    console.log("newParentNode", newParentNode);
                    $.post('/datamanage/dataimport/UpdateZoneForDataType', {
                        dataTypeId: selectedNode.data.typeId,
                        centerCode: selectedNode.data.centerCode,
                        dataTypeName: selectedNode.data.caption,
                        oldZoneId: selectedNode.data.zoneId,
                        newZoneId: 1,
                        oldDirId: selectedNode.data.dirId,
                        newDirName: newParentNode.data.name,
                        newDirId: newParentNode.data.id
                    }).done(function(data) {
                        var updateZoneData = JSON.parse(data);
                        if (updateZoneData.code == 0) {
                            Notify.show({
                                title: "升为系统库成功！",
                                type: "success",
                            });
                            selectedNode.data.zoneId = 1;
                            reloadTree();
                            $.magnificPopup.close();
                        }
                        else {
                            Notify.show({
                                title: "升为系统库失败,"+updateZoneData.message+"！",
                                content: data.message,
                                type: "danger",
                            });
                            $.magnificPopup.close();
                        }
                    });
                }
            }).show(function () {
                $("#folder-picker").empty();
                var curRootDirId = 12;
                var rootNodes = $('#data-treeview').fancytree("getTree").getRootNode();
                console.log("changeType", changeType);
                console.log("selectedNode", selectedNode);
                curRootDirId = getRootDirId(rootNodes, changeType);
                Tree.build({
                    container: $("#folder-picker"),
                    selectMode: 1,
                    checkbox: false,
                    expandAll: true,
                    source: {
                        url: "/udp/listDir",
                        data: {
                            id: curRootDirId,
                            dirType: 1
                        }
                    }
                });
            });
        }

        //查看数据类型详情
        function checkDetails() {
            Dialog.build({
                title: "<i class='glyphicon glyphicons-notes' style='color: #519f50'></i>查看数据详情",
                content: tplDdataTypeDetail({
                    //loginname: "高级设置"
                }),
                hideLeftBtn: true,
                width: 600,
                rightBtnCallback: function () {// 确认
                    $.magnificPopup.close();
                }
            }).show(function () {
                showLoader();
                $.getJSON('/datamanage/dataimport/GetDataTypeDefineInfo', {
                        dataTypeId: selectedNode.data.typeId,
                        zoneId: selectedNode.data.zoneId,
                        centerCode: selectedNode.data.centerCode,
                    },
                    function (rsp) {
                        hideLoader();
                        var datatypeInfo = rsp.data.datatype;
                        console.log("datatypeInfo", datatypeInfo);
                        $('#dataTypeDisName').val(datatypeInfo.displayName);
                        $('#description').val(datatypeInfo.description);
                        $('#description')[0].title = datatypeInfo.description;
                        $('#creator').val(datatypeInfo.userName == null ? '' : datatypeInfo.userName);
                        $('#createtime').val(datatypeInfo.createTime == null ? '' : datatypeInfo.createTime);
                        $('#recordCont').val(datatypeInfo.dataCount == null ? '' : datatypeInfo.dataCount);
                        if((datatypeInfo.maxBusTime == null || datatypeInfo.maxBusTime.length <= 0) &&
                            (datatypeInfo.minBusTime == null || datatypeInfo.minBusTime.length <= 0) ){
                            $('#recordMaxTimeDiv').hide();
                            $('#recordMinTimeDiv').hide();
                        }
                        else{
                            $('#recordMaxTimeDiv').show();
                            $('#recordMinTimeDiv').show();
                            $('#recordMaxTime').val(datatypeInfo.maxBusTime == null ? '' : datatypeInfo.maxBusTime);
                            $('#recordMinTime').val(datatypeInfo.minBusTime == null ? '' : datatypeInfo.minBusTime);
                        }
                    });
            });
        }

        //修改目录信息
        function modifydir() {
            dirOprType = 2;
            $("#createfolder")[0].innerHTML = "修改";
            $("#createfolderhead")[0].innerHTML = "<span class='panel-title'> <i class='fa fa-pencil-square'></i>修改目录</span>";
            $.post('/datamanage/dataimport/queryDir', {
                "dirId": selectedNode.data.dirId,
                "queryType": 0,
            }).done(function (res) {
                var data = JSON.parse(res);
                if (data.code == 0) {
                    $("#createfolder").show();
                    console.log("selectedNode", selectedNode);
                    if (!selectedNode || !selectedNode.extraClasses == "nv-dir") {
                        Notify.show({
                            title: '请选择一个目录！',
                            type: 'warning'
                        });
                    }
                    else {
                        $("#folder_create")[0].value = data.data[0].name;
                        $("#folder_Desc")[0].value = data.data[0].desc;
                        $('#btn-add-folder').removeClass('active-animation');
                        $(this).addClass('active-animation item-checked');

                        $.magnificPopup.open({
                            removalDelay: 500, //delay removal by X to allow out-animation,
                            items: {
                                src: "#modal-form-createfolder"
                            },
                            // overflowY: 'hidden', //
                            callbacks: {
                                beforeOpen: function (e) {
                                    var Animation = "mfp-zoomIn";
                                    this.st.mainClass = Animation;
                                }
                            },
                            midClick: true
                        });
                    }
                }
                else {
                    Notify.show({
                        title: '获取目录信息出错！' + data.message,
                        type: 'error'
                    });
                    console.log("获取目录信息出错：" + data.message);
                }
            });
        }

        //删除目录
        function delfolder() {
            console.log("selectedNode.data", selectedNode.data);
            if (selectedNode.children != null) {
                Notify.show({
                    title: '此目录含有数据或子目录,不支持删除！',
                    type: 'danger'
                });
            }
            else {
                //if(selectedNode.data.dirType != 5 && selectedNode.data.dirType != 21){
                //    Notify.show({
                //        title: '该类型目录不支持删除！',
                //        type: 'danger'
                //    });
                //    return;
                //}
                bootbox.confirm("确定删除目录:" + selectedNode.title + "?", function (rlt) {
                    if (rlt) {
                        var dirList = [];
                        dirList.push(selectedNode.data.dirId);

                        var curDirType = 5;
                        switch (selectedNode.data.dirType) {
                            case 1:
                                curDirType = 5;
                                break;
                            case 2:
                                curDirType = 21;
                                break;
                            default:
                                Notify.show({
                                    title: '该类型目录不支持删除！',
                                    type: 'danger'
                                });
                                return;
                        }
                        $.get('/workspacedir/getResourceByDirId', {
                            'dirId': selectedNode.data.dirId,
                            'dirType': curDirType,
                            'shareFlag': 0,
                            'path': ''
                        }).done(function (rsp) {
                            if (JSON.parse(rsp).code == 0) {
                                if (JSON.parse(rsp).data.length > 0) {
                                    Notify.show({
                                        title: '该目录下有其他数据类型或者资源，不能删除！',
                                        type: 'danger'
                                    });
                                }
                                else {
                                    $.post('/datamanage/udp/delDir', {
                                        'dirList': dirList
                                    }).done(function (rsp) {
                                        if (JSON.parse(rsp).code == 0) {
                                            Notify.show({
                                                title: '删除目录成功！',
                                                type: 'success'
                                            });
                                            selectedNode.remove();
                                            selectedNode = null;
                                        }
                                        else {
                                            console.log("删除目录失败", JSON.parse(rsp).message);
                                            Notify.show({
                                                title: '删除目录失败！',
                                                type: 'danger'
                                            });
                                        }
                                    });
                                    selectedNode.remove();
                                    selectedNode = null;
                                }
                            }
                            else {
                                console.log("获取目录信息失败", JSON.parse(rsp).message);
                                Notify.show({
                                    title: '获取目录信息失败！',
                                    type: 'danger'
                                });
                            }
                        });


                    }
                });
            }
        }

        //删除数据类型
        function deldatatype() {
            bootbox.confirm("确定删除数据:" + selectedNode.title + "?", function (rlt) {
                if (rlt) {
                    $.post('/datamanage/udp/deleteDataType', {
                        'centerCode': selectedNode.data.centerCode,
                        'dataTypeId': selectedNode.data.typeId
                    }).done(function (rsp) {
                        if (JSON.parse(rsp).code == 0) {
                            Notify.show({
                                title: '删除数据类型成功！',
                                type: 'success'
                            });
                            selectedNode.remove();
                            selectedNode = null;
                        }
                        else {
                            console.log("删除数据类型失败", JSON.parse(rsp).message);
                            Notify.show({
                                title: '删除数据类型失败:' + JSON.parse(rsp).message,
                                type: 'danger'
                            });
                        }
                    });
                }
            });
        }

        //新建目录
        function addfolder() {
            dirOprType = 1;
            $("#createfolder")[0].innerHTML = "新建";
            $("#createfolderhead")[0].innerHTML = "<span class='panel-title'> <i class='fa fa-pencil-square'></i>新建目录</span>";
            $("#createfolder").show();
            if (!selectedNode || !selectedNode.extraClasses == "nv-dir") {
                Notify.show({
                    title: '请选择一个父目录来创建新目录！',
                    type: 'warning'
                });
            }
            else {
                $('#btn-add-folder').removeClass('active-animation');
                $(this).addClass('active-animation item-checked');

                $.magnificPopup.open({
                    removalDelay: 500, //delay removal by X to allow out-animation,
                    items: {
                        src: "#modal-form-createfolder"
                    },
                    // overflowY: 'hidden', //
                    callbacks: {
                        beforeOpen: function (e) {
                            var Animation = "mfp-zoomIn";
                            this.st.mainClass = Animation;
                        }
                    },
                    midClick: true
                });
            }
        }

        //转移
        function moveObject(event) {
            Dialog.build({
                title: "<i class='fa fa-level-up' style='color: #519f50'></i>移动到",
                content: "<div id='folder-picker'> Loading... </div>",
                rightBtnCallback: function () {
                    var folderTreeNode = $("#folder-picker").fancytree("getTree").getActiveNode();
                    if (selectedNode.extraClasses == "nv-dir" || selectedNode.extraClasses == "nv-folder") {
                        var dirList = [];
                        dirList.push(selectedNode.data.dirId);
                        $.post('/datamanage/udp/moveDir', {
                            dirList: dirList,
                            newParentId: folderTreeNode.data.id
                        }).done(function (data) {
                            Dialog.dismiss();
                            data = JSON.parse(data);
                            //console.log(data);
                            if (data.code == 0) {
                                Notify.show({
                                    title: "移动成功",
                                    text: "可以到'" + folderTreeNode.data.path + "'中查看",
                                    type: "success"
                                });
                                //parentNode = $('#data-treeview').fancytree("getTree").getNodeByKey(folderTreeNode.key);
                                //selectedNode.moveTo(parentNode);
                                reloadTree();
                            } else {
                                Notify.show({
                                    title: "移动失败:" + data.message,
                                    type: "error"
                                });
                                console.log("移动失败：" + data.message);
                            }
                        });
                    }
                    else {
                        $.post('/datamanage/udp/moveData', {
                            dataTypeId: selectedNode.data.typeId,
                            newParentDirId: folderTreeNode.data.id,
                            oldParentDirId: selectedNode.data.dirId,
                            centerCode: selectedNode.data.centerCode,
                            dataTypeDisplayName: selectedNode.data.caption,
                            zoneId: selectedNode.data.zoneId
                        }).done(function (data) {
                            console.log("selectedNode", selectedNode);
                            console.log("folderTreeNode", folderTreeNode);
                            Dialog.dismiss();
                            data = JSON.parse(data);
                            if (data.code == 0) {
                                Notify.show({
                                    title: "移动数据类型成功",
                                    text: "可以到'" + folderTreeNode.data.path + "'中查看",
                                    type: "success"
                                });
                                //parentNode = $('#data-treeview').fancytree("getTree").getNodeByKey(folderTreeNode.key);
                                //selectedNode.moveTo(parentNode);
                                reloadTree();
                            } else {
                                Notify.show({
                                    title: "移动数据类型失败:" + data.message,
                                    type: "error"
                                });
                                console.log("移动数据类型失败：" + data.message);
                            }
                        });
                    }
                }
            }).show(function () {
                $("#folder-picker").empty();
                var curRootDirId = 12;
                var rootNodes = $('#data-treeview').fancytree("getTree").getRootNode();
                curRootDirId = getRootDirId(rootNodes, selectedNode.data.dirType);
                Tree.build({
                    container: $("#folder-picker"),
                    selectMode: 1,
                    clickFolderMode: 1,
                    checkbox: false,
                    expandAll: true,
                    source: {
                        url: "/udp/listDir",
                        data: {
                            id: curRootDirId,
                            dirType: 1
                        }
                    }
                });
            });
        }

        function getRootDirId(rootNodes, curZoneId) {
            for (var nodeIndex in rootNodes.children) {
                if (rootNodes.children[nodeIndex].data.dirType == curZoneId)
                    return rootNodes.children[nodeIndex].data.dirId;
            }
        }

        function leftPanelShow() {
            $('.tray.tray-left').removeClass('hide');
            $('#left-panel-toggle i').removeClass('fa-caret-right').addClass('fa-caret-left');
        };
        function leftPanelHide() {
            $('.tray.tray-left').addClass('hide');
            $('#left-panel-toggle i').removeClass('fa-caret-left').addClass('fa-caret-right');
        };

    });