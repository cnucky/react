/**
 * Created by THINK on 2016/8/19.
 * 图层管理图层目录树功能模块
 */
registerLocales(require.context('../../../locales/gismodule/', false, /\.js/));
define('module/Layermanager/defineFancyTree', [ //'config',
        './newLayer', './importData', './queryTask', './mapTool', 'nova-notify', 'nova-bootbox-dialog'
    ],
    function(aNewLayer, aImportData, aQueryTask, mapTool, Notify, bootbox) {
        var appConfig = window.__CONF__.business.layermanager;
        var USERID; //用户ID
        var TABNUM; //tab页编号
        var BASEURL; //查询接口地址
        var CONTAINERID; //页面DIV标签ID
        var myLayer;
        //初始化
        function init(opt) {
            USERID = opt.userID;
            TABNUM = 0;
            BASEURL = opt.baseURL;
            CONTAINERID = opt.panelParentID;
            _addLayerPage(CONTAINERID);
            _initLayerTree(BASEURL, USERID);
            myLayer = new dataLayer('/gisapi/gisGetQuery');
            _addTab('MAP', '', 0, undefined);
            //_resize();
            //_addEvent();
            // $.ajax({
            //     type: 'POST',
            //     url: '/gisapi/gisPostQuery',
            //     // url: BASEURL + '/layer/CreateFolder',
            //     data: {
            //         hostname: BASEURL,
            //         path: '/GisService/search/baseQuery',
            //         fieldValues: [",64899,58263",",5745,66745",",64903,58342"]
            //     },
            //     dataType: 'json',
            //     success: function(result) { //返回新创建的目录ID
            //         console.log(result);
            //     },
            //     error: function(errorMsg) {

            //     }
            // });
        }
        //（私有）添加图层初始化页面元素
        function _addLayerPage(containerID) {
            var parentId = document.getElementById(containerID);
            parentId.innerHTML = _createLayerPageInnerHtml();
        }
        //（私有）构建图层初始化页面元素
        function _createLayerPageInnerHtml() {
            var height = $(window).height() - $('.navbar.navbar-fixed-top.navbar-shadow.bg-primary').height() - 1 - $('#topbar').height() - 21;
            $('#' + CONTAINERID).height(height);
            var innerHtml =
                // '<div class="layer-header"><div>图层管理</div></div>'+
                '<aside class="tray tray-left" data-tray-height="match" style="vertical-align:top; padding: 5px 5px 5px 5px; height: 100%;; background: white">' +
                '<div class="layer-left-tree" id="layerTree"></div>' + //左侧导航树
                '</aside>' +
                '<div class="layer-right-content" id="layerContent">' + //右侧内容
                '<div id="tabHead" style="height: 21px;"></div>' + //右侧tab页头
                '<hr class="hr-sepratorTab" style="display: none;">' +
                '<div id="tabContent" class="tabContent-Style"></div>' + //右侧每个tab页内容
                '</div>';
            return innerHtml;
        }
        //计算大小
        function _resize() {
            var parent = $("#" + CONTAINERID); //父容器对象
            var totalHeight = parseInt(parent.height()); //父容器高度值
            var totalWidth = parseInt(parent.width()); //父容器宽度值
            var layerHeadHeight = parseInt($(".layer-header").outerHeight() + 1); //页头高度
            $(".layer-body").height(totalHeight - layerHeadHeight); //设置图层管理页面body部分高度
            var leftTreeWidth = $(".layer-left-tree").outerWidth() + 2; //左侧导航树的宽度
            $(".layer-left-tree").height(totalHeight - layerHeadHeight); //设置左侧导航树的高度
            $(".layer-right-content").width(totalWidth - leftTreeWidth - 28); //设置右侧内容的宽度
            $(".layer-right-content").height(totalHeight - layerHeadHeight - 10); //设置右侧内容的高度
            $(".tabContent-Style").height($(".layer-right-content").height() - $("#tabHead").height() - 10);
        }
        //添加窗口大小变化事件
        function _addEvent() {
            //窗口大小变化事件
            $(window).resize(function() {
                _resize();
            })
        }
        //初始化图层目录树
        function _initLayerTree() {
            $("#layerTree").fancytree({
                    selectMode: 2,
                    clickFolderMode: 2,
                    source: _GetLayerTree(), //异步方式加载数据源
                    // source: {
                    //     // url: BASEURL + '/layer/GetLayerTree?userID=' + USERID,
                    //     url: '/gisapi/gisGetQuery',
                    //     data: {
                    //         hostname: BASEURL,
                    //         path: '/LayerService/layer/GetLayerTree',
                    //         userID: USERID
                    //     },
                    // },
                    checkbox: false, //设置显示复选框
                    selectMode: 3, //设置选中模式（当父节点选中时，子节点全部选中）
                    imagePath: '../layermanager/img/LayerManager/newLayer/icon/', //设置树节点图片路径
                    extensions: ["edit"],
                    edit: {
                        triggerStart: ["f2", "shift+click"],
                        close: _close //编辑结束事件
                    },
                    autoScroll: true
                })
                .on("nodeCommand", function(event, data) {
                    var refNode;
                    var tree = $(this).fancytree("getTree");
                    var node = tree.getActiveNode();

                    switch (data.cmd) {
                        case "addNewFolder": //新建文件夹
                            if (!node.folder) return;
                            node.editCreateNode("child", {
                                title: "",
                                icon: "folder.png",
                                folder: true
                            });
                            break;
                        case "editFolder": //编辑文件夹
                            if (node.parent.title == "root") return;
                            if (node.folder) node.editStart();
                            break;
                        case "delFolderOrLayer": //删除文件夹或图层
                            if (node.folder) { //删除文件夹
                                _HasRunningTaskInFolder(node); //判断文件夹下的图层是否包含运行中的任务   
                            } else { //删除图层
                                _HasRunningTaskInLayer(node); //判断图层是否包含运行中的任务
                            }
                            break;
                        case "addNewLayer": //新建图层
                            var dirName = "";
                            var tempNode = node;
                            while (tempNode.key != "root_1") {
                                dirName = "\\" + tempNode.title + dirName;
                                tempNode = tempNode.parent;
                            }
                            _addTab(node.key, node.title, 1, dirName);
                            break;
                        case "queryData": //检索数据
                            alert(i18n.t('gismodule.LayerManager.fancyTree.alert1'));
                            break;
                        case "editLayer": //图层定义
                            var dirName = "";
                            var tempNode = node;
                            while (tempNode.key != "root_1") {
                                dirName = "\\" + tempNode.title + dirName;
                                tempNode = tempNode.parent;
                            }
                            _addTab(node.key, node.title, 2, dirName);
                            break;
                        case "importData": //数据导入
                            _addTab(node.key, node.title, 3, "");
                            break;
                        case "queryTask": //查看任务
                            _addTab(node.key, node.title, 4, "");
                            break;
                        case "optimize": //优化显示
                            _addTab(node.key, node.title, 0, "");
                            break;
                        case "rebuildIndex": //重建索引
                            alert(i18n.t('gismodule.LayerManager.fancyTree.alert3'));
                            break;
                        default:
                            alert("Unhandled command: " + data.cmd);
                            return;
                    }
                })
                .on("keydown", function(e) {
                    var cmd = null;
                    switch ($.ui.fancytree.eventToString(e)) {
                        case "ctrl+d":
                            cmd = "addNewFolder";
                            break; //新建文件夹
                        case "del":
                            cmd = "delFolderOrLayer";
                            break; //删除文件夹或图层
                        case "ctrl+e":
                            cmd = "editFolder";
                            break; //编辑文件夹
                    }
                    if (cmd) {
                        $(this).trigger("nodeCommand", {
                            cmd: cmd
                        }); //触发nodeCommand事件
                        return false;
                    }
                });
            $("#layerTree").contextmenu({
                delegate: "span.fancytree-node",
                menu: [{
                        title: "&nbsp&nbsp" + i18n.t('gismodule.LayerManager.fancyTree.contextMenu.newFolder'),
                        cmd: "addNewFolder",
                        uiIcon: "my-ui-icon-newFolder"
                    }, {
                        title: "&nbsp&nbsp" + i18n.t('gismodule.LayerManager.fancyTree.contextMenu.editFolder'),
                        cmd: "editFolder",
                        'uiIcon': 'my-ui-icon-editFolder'
                    }, {
                        title: "&nbsp&nbsp" + i18n.t('gismodule.LayerManager.fancyTree.contextMenu.deleteFolder'),
                        cmd: "delFolderOrLayer",
                        uiIcon: "my-ui-icon-delFolder"
                    }, {
                        title: "&nbsp&nbsp" + i18n.t('gismodule.LayerManager.fancyTree.contextMenu.newLayer'),
                        cmd: "addNewLayer",
                        uiIcon: "my-ui-icon-newLayer"
                    },
                    // {
                    //     title: "&nbsp&nbsp" + i18n.t('gismodule.LayerManager.fancyTree.contextMenu.queryData'),
                    //     cmd: "queryData",
                    //     uiIcon: "my-ui-icon-queryData"
                    // }, 
                    {
                        title: "&nbsp&nbsp" + i18n.t('gismodule.LayerManager.fancyTree.contextMenu.defineLayer'),
                        cmd: "editLayer",
                        uiIcon: "my-ui-icon-editLayer"
                    }, {
                        title: "&nbsp&nbsp" + i18n.t('gismodule.LayerManager.fancyTree.contextMenu.deleteLayer'),
                        cmd: "delFolderOrLayer",
                        uiIcon: "my-ui-icon-delLayer"
                    }, {
                        title: "&nbsp&nbsp" + i18n.t('gismodule.LayerManager.fancyTree.contextMenu.importData'),
                        cmd: "importData",
                        uiIcon: "my-ui-icon-importData"
                    }, {
                        title: "&nbsp&nbsp" + i18n.t('gismodule.LayerManager.fancyTree.contextMenu.checkTask'),
                        cmd: "queryTask",
                        uiIcon: "my-ui-icon-queryTask"
                    }, {
                        title: "&nbsp&nbsp" + i18n.t('gismodule.LayerManager.fancyTree.contextMenu.optimizeDisplay'),
                        cmd: "optimize",
                        uiIcon: "my-ui-icon-optimize"
                    }
                    // , {
                    //     title: "&nbsp&nbsp" + i18n.t('gismodule.LayerManager.fancyTree.contextMenu.rebuildIndex'),
                    //     cmd: "rebuildIndex",
                    //     uiIcon: "my-ui-icon-rebuildIndex"
                    // }
                ],
                beforeOpen: _beforeOpen, //定义在菜单展现之前的操作
                select: _contextMenuSelect //定义选中菜单中的项的操作
            });
            $("#layerTree").fancytree("getRootNode").visit(function(node) {
                node.setExpanded(true);
            });
        }
        //编辑结束事件
        function _close(event, data) {
            //编辑文件夹
            if (data.save && !data.isNew) {
                _EditFolder(data); //调后台服务，编辑文件夹接口
            }
            //新建文件夹
            if (data.save && data.isNew) {
                _CreateFolder(data.node); //调后台服务，新建文件夹接口
            }
        }
        //定义在菜单展现之前的操作
        function _beforeOpen(event, ui) {
            var node = $.ui.fancytree.getNode(ui.target); //获取节点
            if (node.folder) {
                for (var i = 2; i < 6; i++) {
                    $("#ui-id-" + i).removeClass("noDisplay");
                }
                for (var i = 6; i < 13; i++) {
                    $("#ui-id-" + i).addClass("noDisplay");
                }
                if (node.parent.title == "root") {
                    $("#layerTree").contextmenu("enableEntry", "delFolderOrLayer", false);
                    $("#layerTree").contextmenu("enableEntry", "editFolder", false);
                    if (node.title != i18n.t('gismodule.LayerManager.fancyTree.layerDir.personal')) {
                        $("#layerTree").contextmenu("enableEntry", "addNewFolder", false);
                        $("#layerTree").contextmenu("enableEntry", "addNewLayer", false);
                    } else {
                        $("#layerTree").contextmenu("enableEntry", "addNewFolder", true);
                        $("#layerTree").contextmenu("enableEntry", "addNewLayer", true);
                    }
                } else {
                    $("#layerTree").contextmenu("enableEntry", "addNewFolder", true);
                    $("#layerTree").contextmenu("enableEntry", "editFolder", true);
                    $("#layerTree").contextmenu("enableEntry", "delFolderOrLayer", true);
                    $("#layerTree").contextmenu("enableEntry", "addNewLayer", true);
                }
            } else {
                for (var i = 2; i < 6; i++) {
                    $("#ui-id-" + i).addClass("noDisplay");
                }
                for (var i = 6; i < 13; i++) {
                    $("#ui-id-" + i).removeClass("noDisplay");
                }
                $("#layerTree").contextmenu("enableEntry", "delFolderOrLayer", true);
                if (node.key == '0' || node.key == '-1' || node.key == '-2') {
                    $("#layerTree").contextmenu("enableEntry", "delFolderOrLayer", false);
                }
            }
            node.setActive(); //将当前节点设置为active状态
        }
        //定义选中菜单中的项的操作
        function _contextMenuSelect(event, ui) {
            //延时0.1秒执行命令，以确保菜单关闭和执行命令两件事情不冲突
            var that = this;
            setTimeout(function() {
                $(that).trigger("nodeCommand", {
                    cmd: ui.cmd
                });
            }, 100);
        }

        //后台服务接口——获取图层管理树数据
        function _GetLayerTree() {
            var source = "";
            var obj;
            $.ajaxSettings.async = false;
            $.ajax({
                type: 'GET',
                url: '/gisapi/gisGetQuery',
                data: {
                    hostname: BASEURL,
                    path: '/LayerService/layer/GetLayerTree',
                    userID: USERID
                },
                // url: BASEURL+'/layer/GetLayerTree?userID='+USERID,
                dataType: 'text',
                success: function(result) {
                    source += result;
                    obj = eval(source);
                    var shareIndex = -1;
                    for (var i = 0; i < obj.length; i++) {
                        switch (obj[i].title) {
                            case "个人图层":
                                obj[i].title = i18n.t('gismodule.LayerManager.fancyTree.layerDir.personal');
                                break;
                            case "基础图层":
                                obj[i].title = i18n.t('gismodule.LayerManager.fancyTree.layerDir.basic');
                                for (var j = 0; j < obj[i].children.length; j++) {
                                    switch (obj[i].children[j].title) {
                                        case "基站数据":
                                            obj[i].children[j].title = i18n.t('gismodule.LayerManager.fancyTree.basicLayers.baseStation');
                                            break;
                                        case "火车站数据":
                                            obj[i].children[j].title = i18n.t('gismodule.LayerManager.fancyTree.basicLayers.railwayStation');
                                            break;
                                        case "飞机场数据":
                                            obj[i].children[j].title = i18n.t('gismodule.LayerManager.fancyTree.basicLayers.airport');
                                            break;
                                    }
                                }
                                break;
                            case "共享图层":
                                obj[i].title = i18n.t('gismodule.LayerManager.fancyTree.layerDir.share');
                                shareIndex = i;
                                break;
                        }
                    }
                    obj.splice(shareIndex, 1);
                },
                error: function(errorMsg) {
                    // alert(i18n.t('gismodule.LayerManager.fancyTree.alert14'));
                    Notify.show({
                        title: i18n.t('gismodule.LayerManager.fancyTree.alert14'),
                        type: "warning"
                    });
                    source = "";
                    obj = {};
                }
            });
            return obj;
        }
        //后台服务接口——新建文件夹(新建的节点)
        function _CreateFolder(node) {
            var parentID = node.parent.key; //父节点ID
            var name = node.title; //新添文件夹名称
            var defaultKey = node.key; //获取系统为新建的目录添加的默认key值
            $.ajax({
                type: 'POST',
                url: '/gisapi/gisPostQuery',
                // url: BASEURL + '/layer/CreateFolder',
                data: {
                    hostname: BASEURL,
                    path: '/LayerService/layer/CreateFolder',
                    parentID: parentID,
                    name: name,
                    userID: USERID
                },
                dataType: 'text',
                success: function(folderID) { //返回新创建的目录ID
                    if (folderID == "") {
                        node.remove();
                        Notify.show({
                            title: i18n.t('gismodule.LayerManager.fancyTree.alert5'),
                            type: "warning"
                        });
                        return;
                    }
                    node.key = folderID;
                },
                error: function(errorMsg) {
                    Notify.show({
                        title: i18n.t('gismodule.LayerManager.fancyTree.alert5'),
                        type: "warning"
                    });
                    //从树上删除新建的目录
                    var tree = $("#layerTree").fancytree("getTree");
                    var node = tree.getNodeByKey(defaultKey);
                    var refNode = node.getNextSibling() || node.getPrevSibling() || node.getParent();
                    node.remove();
                    if (refNode) {
                        refNode.setActive();
                    }
                }
            });
        }
        //后台服务接口——编辑文件夹(编辑的节点)
        function _EditFolder(data) {
            var key = data.node.key;
            var name = data.node.title; //修改后的名称
            var preName = data.orgTitle; //原名称
            $.ajax({
                type: 'POST',
                url: '/gisapi/gisPostQuery',
                // url: BASEURL + '/layer/EditFolder',
                data: {
                    hostname: BASEURL,
                    path: '/LayerService/layer/EditFolder',
                    folderID: key,
                    name: name
                },
                dataType: 'text',
                success: function(result) {},
                error: function(errorMsg) {
                    // alert(i18n.t('gismodule.LayerManager.fancyTree.alert6'));
                    Notify.show({
                        title: i18n.t('gismodule.LayerManager.fancyTree.alert6'),
                        type: "warning"
                    });
                    //重新设置文件夹名称
                    var node = data.node;
                    node.title = preName;
                    $(".fancytree-title", node.span)[0].innerHTML = preName;
                }
            });
        }
        //后台服务接口——判断文件夹下的图层是否包含运行中的任务(文件夹ID)
        function _HasRunningTaskInFolder(node) {
            var result = "";
            $.ajax({
                type: 'GET',
                url: '/gisapi/gisGetQuery',
                data: {
                    hostname: BASEURL,
                    path: '/LayerService/layer/HasRunningTaskInFolder',
                    dirID: node.key
                },
                // url: BASEURL + '/layer/HasRunningTaskInFolder?dirID=' + node.key,
                dataType: 'text',
                success: function(data) { //返回"true" or "false"字符串
                    result = data;
                    var alertMsg = "";
                    switch (result) {
                        case "true":
                            alertMsg = i18n.t('gismodule.LayerManager.fancyTree.alert7');
                            break;
                        case "false":
                            alertMsg = i18n.t('gismodule.LayerManager.fancyTree.alert8');
                            break;
                    }
                    //弹出交互框
                    // var messageBox = confirm(alertMsg);
                    // if (messageBox == true) { //用户同意删除时，删除文件夹
                    //     _DeleteFolder(node); //调用后台服务，删除文件夹
                    // } else { //不同意删除时，退出本次操作
                    //     return;
                    // }
                    bootbox.confirm(alertMsg, function(rlt) {
                        if (rlt) {
                            _DeleteFolder(node); //调用后台服务，删除文件夹
                        }
                    });
                },
                error: function(errorMsg) {
                    result = errorMsg;
                    // alert(i18n.t('gismodule.LayerManager.fancyTree.alert9'));
                    Notify.show({
                        title: i18n.t('gismodule.LayerManager.fancyTree.alert9'),
                        type: "warning"
                    });
                }
            });
        }
        //后台服务接口——删除文件夹(文件夹ID)
        function _DeleteFolder(node) {
            $.ajax({
                type: 'GET',
                url: '/gisapi/gisGetQuery',
                data: {
                    hostname: BASEURL,
                    path: '/LayerService/layer/DeleteFolder',
                    folderID: node.key
                },
                // url: BASEURL + '/layer/DeleteFolder?folderID=' + node.key,
                dataType: 'text',
                success: function(result) {
                    //后台删除成功后在图层管理树上删除该文件夹节点
                    var refNode = node.getNextSibling() || node.getPrevSibling() || node.getParent();
                    node.remove();
                    if (refNode) {
                        refNode.setActive();
                    }
                },
                error: function() {
                    // alert(i18n.t('gismodule.LayerManager.fancyTree.alert9'));
                    Notify.show({
                        title: i18n.t('gismodule.LayerManager.fancyTree.alert9'),
                        type: "warning"
                    });
                }
            });
        }
        //后台服务接口——判断图层是否包含运行中的任务
        function _HasRunningTaskInLayer(node) {
            var result = "";
            $.ajax({
                type: 'GET',
                url: '/gisapi/gisGetQuery',
                data: {
                    hostname: BASEURL,
                    path: '/LayerService/layer/HasRunningTaskInLayer',
                    layerID: node.key
                },
                // url: BASEURL + '/layer/HasRunningTaskInLayer?layerID=' + node.key,
                dataType: 'text',
                success: function(data) {
                    result = data;
                    var alertMsg = "";
                    switch (result) {
                        case "true":
                            alertMsg = i18n.t('gismodule.LayerManager.fancyTree.alert10');
                            break;
                        case "false":
                            alertMsg = i18n.t('gismodule.LayerManager.fancyTree.alert11');
                            break;
                    }
                    //弹出交互框
                    // var messageBox = confirm(alertMsg);
                    // if (messageBox == true) { //用户同意删除时，删除文件夹
                    //     _DelLayer(node) //调用后台服务，删除图层节点
                    // }
                    bootbox.confirm(alertMsg, function(rlt) {
                        if (rlt) {
                            _DelLayer(node) //调用后台服务，删除图层节点
                        }
                    });
                },
                error: function(errorMsg) {
                    result = errorMsg;
                    // alert(i18n.t('gismodule.LayerManager.fancyTree.alert9'));
                    Notify.show({
                        title: i18n.t('gismodule.LayerManager.fancyTree.alert9'),
                        type: "warning"
                    });
                }
            });
        }
        //后台服务接口——删除图层
        function _DelLayer(node) {
            var result = "";
            $.ajax({
                type: 'GET',
                url: '/gisapi/gisGetQuery',
                data: {
                    hostname: BASEURL,
                    path: '/LayerService/layer/DelLayer',
                    layerID: node.key
                },
                // url: BASEURL + '/layer/DelLayer?layerID=' + node.key,
                dataType: 'text',
                success: function() { //返回"true" or "false"字符串
                    result = true;
                    var nodeID = node.key;
                    var nodeName = node.title;
                    //后台删除成功后在树上删除图层节点
                    var refNode = node.getNextSibling() || node.getPrevSibling() || node.getParent();
                    node.remove();
                    if (refNode) {
                        refNode.setActive();
                    }
                    //delete Tabs
                    if ($("." + nodeID + "_2").length != 0) {
                        _delTab($($("." + nodeID + "_2")[0]).attr("tabID"));
                    }
                    if ($("." + nodeID + "_3").length != 0) {
                        _delTab($($("." + nodeID + "_3")[0]).attr("tabID"));
                    }
                    if ($("." + nodeID + "_4").length != 0) {
                        _delTab($($("." + nodeID + "_4")[0]).attr("tabID"));
                    }
                    if ($(".MAP_TAB").length != 0) {
                        var tName = "(" + nodeName + ")" + i18n.t('gismodule.LayerManager.tabPage.title.optimizeDisplay');
                        var curTabName = ($($(".MAP_TAB")[0])[0].children[0].innerText).trim();
                        if (curTabName == tName) {
                            _delTab($($(".MAP_TAB")[0]).attr("tabID"));
                        }
                        return;
                    }
                },
                error: function(errorMsg) {
                    result = false;
                    // alert(i18n.t('gismodule.LayerManager.fancyTree.alert12') + node.name + i18n.t('gismodule.LayerManager.fancyTree.alert13'));
                    Notify.show({
                        title: i18n.t('gismodule.LayerManager.fancyTree.alert12') + node.name + i18n.t('gismodule.LayerManager.fancyTree.alert13'),
                        type: "warning"
                    });
                }
            });
        }
        //添加tab页（nodeID:节点ID，nodeName:节点名称,type:类型[1、新建图层 2、图层定义 3、数据导入 4、查询任务],directory:目录）
        function _addTab(nodeID, nodeName, type, directory) {
            if (type == 0) {
                if ($(".MAP_TAB").length != 0) {
                    _setActiveTab($($(".MAP_TAB")[0]).attr("tabID"));
                    var tName = "(" + nodeName + ")" + i18n.t('gismodule.LayerManager.tabPage.title.optimizeDisplay');
                    var curTabName = ($($(".MAP_TAB")[0])[0].children[0].innerText).trim();
                    $(".track-group-title")[0].style.display = "block";
                    if (curTabName != tName) {
                        $($(".MAP_TAB")[0])[0].children[0].innerText = tName;
                        myLayer.setOptions({
                            hostname: BASEURL,
                            layerID: nodeID,
                            layerName: nodeName
                        });
                        mapTool.addLayer(myLayer);
                    }
                    return;
                }
            }
            //当为图层定义
            if (type == 2) {
                if ($("." + nodeID + "_2").length != 0) {
                    _setActiveTab($($("." + nodeID + "_2")[0]).attr("tabID"));
                    return;
                }
            }
            if (type == 3) {
                if ($("." + nodeID + "_3").length != 0) {
                    _setActiveTab($($("." + nodeID + "_3")[0]).attr("tabID"));
                    return;
                }
            }
            if (type == 4) {
                if ($("." + nodeID + "_4").length != 0) {
                    _setActiveTab($($("." + nodeID + "_4")[0]).attr("tabID"));
                    return;
                }
            }
            var tabHead = $("#tabHead");
            //获取tab页头展示名称
            var tabHeadName = "";
            switch (type) {
                case 0:
                    tabHeadName = "(" + nodeName + ")" + i18n.t('gismodule.LayerManager.tabPage.title.optimizeDisplay');
                    break;
                case 1:
                    tabHeadName = "(" + nodeName + ")" + i18n.t('gismodule.LayerManager.tabPage.title.newLayer');
                    break;
                case 2:
                    tabHeadName = "(" + nodeName + ")" + i18n.t('gismodule.LayerManager.tabPage.title.defineLayer');
                    break;
                case 3:
                    tabHeadName = "(" + nodeName + ")" + i18n.t('gismodule.LayerManager.tabPage.title.importData');
                    break;
                case 4:
                    tabHeadName = "(" + nodeName + ")" + i18n.t('gismodule.LayerManager.tabPage.title.queryTask');
                    break;
            }
            //获取tab页内容ID
            var tabHeadClass = nodeID + '_' + type;
            var tabID = nodeID + '_' + type + '_' + (TABNUM++);
            if (type == 0) {
                tabHeadClass = 'MAP_TAB';
                if (nodeName == '') {
                    tabHeadName = i18n.t('gismodule.LayerManager.tabPage.title.optimizeDisplay');
                }
            }
            //添加tab页头
            tabHead[0].innerHTML +=
                '<div class="tabTitle ' + tabHeadClass + '" tabID="' + tabID + '">' +
                '<div class="tabTitleName" style="float: left;">' + tabHeadName + '&nbsp</div>' +
                '<div class="closeTab" style="float: right;cursor: pointer !important;"><img src="../layermanager/img/LayerManager/image/remove-icon-small.png"></div>' +
                '</div>';
            //设置tab页面的横线显示
            $(".hr-sepratorTab").show();
            $(".tabContent-Style").show();
            $(".tabContent-Style").height($(".layer-right-content").height() - $("#tabHead").height() - 11);
            //添加tab页内容
            var tabContent = $("#tabContent");
            switch (type) {
                case 0: //map
                    //var ip = 'http://'+appConfig['gisServer'] + ':8080/TileMapService/arcgis/rest/services/world/MapServer/tile/{z}/{y}/{x}.png';
                    var ip = '/gisapi/tileMap?hostname=' + appConfig['gis-server'] + '&x={x}&y={y}&z={z}';
                    mapTool.init(tabID, ip);
                    if (nodeName != '') {
                        $(".track-group-title")[0].style.display = "block";
                        myLayer.setOptions({
                            hostname: BASEURL,
                            layerID: nodeID,
                            layerName: nodeName
                        });
                        mapTool.addLayer(myLayer);
                    }
                    break;
                case 1: //新建图层
                    aNewLayer.init(1, tabID, directory, USERID, nodeName, nodeID, BASEURL);
                    break;
                case 2: //图层定义
                    aNewLayer.init(2, tabID, directory, USERID, nodeName, nodeID, BASEURL);
                    break;
                case 3: //导入数据
                    aImportData.init(tabID, nodeID, USERID, BASEURL);
                    break;
                case 4: //任务查询
                    aQueryTask.init(nodeID, tabID, BASEURL);
                    break;
            }
            _setActiveTab(tabID);
            _addTabClickEvent();
        }
        //将某tab页设为活动状态
        function _setActiveTab(tabID) {
            var tabHeads = $("#tabHead")[0].children;
            var needActTabHead = null;
            var needActTabCon = null;
            for (var i = 0; i < tabHeads.length; i++) {
                var thisTab = $(tabHeads[i]);
                if (thisTab.hasClass("activeTab")) {
                    var tabConId = thisTab.attr("tabid");
                    if (tabID == tabConId) {
                        return;
                    } else {
                        thisTab.removeClass("activeTab")
                            .addClass("unActiveTab");
                        $("#" + tabConId).hide();
                    }
                } else {
                    var tabConId = thisTab.attr("tabid");
                    if (tabID == tabConId) {
                        needActTabHead = $(tabHeads[i]);
                        needActTabCon = $("#" + tabID);
                    }
                }
            }
            if (needActTabHead != null && needActTabCon != null) {
                needActTabHead.addClass("activeTab")
                    .removeClass("unActiveTab");
                needActTabCon.show();
            }
        }
        //添加Tab页头点击事件
        function _addTabClickEvent() {
            //点击页头，进行tab页之间的切换
            $(".tabTitleName").unbind("click");
            $(".tabTitleName").click(function() {
                var thisTab = $(this).parent();
                var tabsItems = $("#tabHead").children();
                //遍历tab页头
                for (tabItem in tabsItems) {
                    //找出原活动状态的tab页
                    var temp = $(tabsItems[tabItem]);
                    if (temp.hasClass("activeTab")) {
                        //标记为非活动状态
                        temp.removeClass("activeTab")
                            .addClass("unActiveTab");
                        //隐藏该目标列表
                        $("#" + temp.attr("tabID")).hide();
                        break;
                    }
                }
                thisTab.addClass("activeTab").removeClass("unActiveTab"); //将当前选中的tab页头标记为活动状态
                var tabID = thisTab.attr("tabID");
                $("#" + tabID).show(); //显示tab页内容
            });
            //点击关闭按钮，关闭tab页
            $(".closeTab").unbind("click");
            $(".closeTab").click(function() {
                var thisTab = $(this).parent();
                var tabID = thisTab.attr("tabID"); //获取tab页ID
                if (thisTab.hasClass('MAP_TAB')) {
                    mapTool.destroy();
                }
                _delTab(tabID);
            });
        }
        //删除tab页（tabID：tab页ID）
        function _delTab(tabID) {
            var tabsItems = $("#tabHead").children();
            var thisTab;
            for (var i = 0; i < tabsItems.length; i++) {
                if ($(tabsItems[i]).attr("tabID") == tabID) {
                    thisTab = $(tabsItems[i]);
                }
            }
            var isActive = thisTab.hasClass("activeTab"); //是否为活动状态
            $("#" + tabID).remove(); //删除Tab页内容
            thisTab.remove(); //删除tab页头
            //判断主框架中是否包含tab页,若不包含tab页，则隐藏“横线”
            tabsItems = $("#tabHead").children();
            if (tabsItems.length == 0) {
                $(".hr-sepratorTab").hide();
                $('#tabContent').hide();
            } else {
                if (isActive) { //若删除的tab为活动状态，且删除后还包含tab页，则将第一个tab页设置为活动状态
                    _setActiveTab($($("#tabHead")[0].children).attr("tabID"));
                }
            }
        }
        return {
            init: init
        }
    })