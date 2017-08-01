define("module/gis/enclosureUtil", [
    'nova-dialog',
    'nova-notify',
    'nova-bootbox-dialog',
    "jquery",
    "underscore",
], function(Dialog, Notify, bootbox) {
    var CODESELECTNODE = false; //该变量标记是从代码中选中节点，不必执行fancytreeSelect方法
    var gisServer;
    var map;
    var DISENCLOSUREMAP = {}; //[当前显示在地图上的围栏ID,围栏树上节点ID项][ecId,ecKey]
    var pointsLayer;
    var rootID;
    var USERID;

    function init(options) {
        map = options.map;
        gisServer = options.gisServer;
        pointsLayer = options.pointsLayer;
        rootID = options.rootID;
        USERID = options.userID;
        _GetAllDir(options.rootID);
    }

    //后台服务接口——获取围栏树目录结构
    function _GetAllDir(rootID) {
        $.ajaxSettings.async = false;
        $.ajax({
            type: 'GET',
            url: '/gisapi/gisGetQuery',
            data: {
                hostname: gisServer,
                // path: '/GisService/enclosure/GetAllDir',
                // rootDirectoryID: rootID
                path: '/GisService/enclosure/GetAllEnclosure',
                dirId: rootID
            },
            dataType: 'json',
            success: function(result) {
                // var data = '[{"title":"' + i18n.t('gismodule.enclosureManage.dirName') + '","folder":true,"lazy":false,"icon":"branch_16_p.png","key":"' + rootID + '","children":' + result + '}]';
                // var source = eval(data);
                if (result[0]) {
                    result[0].title = i18n.t('gismodule.enclosureManage.dirName');
                    result[0].icon = 'branch_16_p.png';
                }
                // var source=result;
                // //加载目录树
                // $("#dirTree").fancytree({
                //     source: source, //数据源
                //     imagePath: "../js/components/gisWidget/enclosureManageModule/fancyTree/image/", //设置树节点图片路径
                //     dblclick: _doubleClick, //双击事件
                //     autoScroll: true,
                // });
                _initialize(result);
            },
            error: function(result) {
                // alert(i18n.t('gismodule.enclosureManage.alert11'));
                Notify.show({
                    title: i18n.t('gismodule.enclosureManage.alert11'),
                    type: "warning"
                });
            }
        });
    }

    function _initPanelDirTree(rootID) {
        $.ajaxSettings.async = false;
        $.ajax({
            type: 'GET',
            url: '/gisapi/gisGetQuery',
            data: {
                hostname: gisServer,
                path: '/GisService/enclosure/GetAllDir',
                rootDirectoryID: rootID
                    // path:'/GisService/enclosure/GetAllEnclosure',
                    // dirId:rootID
            },
            dataType: 'text',
            success: function(result) {
                var data = '[{"title":"' + i18n.t('gismodule.enclosureManage.dirName') + '","folder":true,"lazy":false,"icon":"branch_16_p.png","key":"' + rootID + '","children":' + result + '}]';
                var source = eval(data);
                //加载目录树
                $("#dirTree").fancytree({
                    source: source, //数据源
                    imagePath: "../js/components/gisWidget/enclosureManageModule/fancyTree/image/", //ÉèÖÃÊ÷½ÚµãÍ¼Æ¬Â·¾¶
                    dblclick: _doubleClick, //双击事件
                    autoScroll: true,
                });
            },
            error: function(result) {
                // alert(i18n.t('gismodule.enclosureManage.alert11'));
                Notify.show({
                    title: i18n.t('gismodule.enclosureManage.alert11'),
                    type: "warning"
                });
            }
        });
    }

    //双击树节点
    function _doubleClick(event, data) {
        // $("#ensureSetDir").trigger("click");
        //获取选中节点信息
        var node = $("#dirTree").fancytree("getActiveNode");
        var key = node.key;
        var dic = "\\" + node.title;
        while (node.parent.title != "root") {
            node = node.parent;
            dic = "\\" + node.title + dic;
        }
        //修改路径，记录目录ID
        $("#ecDir").attr("key", key);
        $("#ecDir")[0].innerHTML = dic;
        $("#dirTreePanel").hide();
    }

    function _initialize(source) {
        $("#tree").fancytree({
                checkbox: true, //设置显示复选框
                selectMode: 3, //设置选中模式（当父节点选中时，子节点全部选中）
                imagePath: "../js/components/gisWidget/enclosureManageModule/fancyTree/image/", //设置树节点图片路径
                source: source,
                // lazyLoad: _lazyLoad, //延时加载
                // loadError: _loadError, //延时加载时，获取数据失败，加载错误信息
                select: _fancytreeSelect,
                extensions: ["edit"],
                edit: {
                    triggerStart: ["f2", "shift+click"],
                    close: close //编辑结束事件
                }
            })
            .on("nodeCommand", function(event, data) {
                var refNode;
                var tree = $(this).fancytree("getTree");
                var node = tree.getActiveNode();

                switch (data.cmd) {
                    case "addChild": //新建目录
                        if (!node.folder) return;
                        node.editCreateNode("child", {
                            title: "",
                            folder: true
                        });
                        break;
                    case "edit": //编辑
                    case "rename":
                        if (node.parent.title == "root") return;
                        if (node.folder) node.editStart();
                        else {
                            _QueryEnclosureAttribute(node.key, 2); //调后台接口，获取属性信息
                        }
                        break;
                    case "remove": //删除
                        if (node.parent.title == "root") return;
                        //调用后台服务，删除节点
                        _DelNode(node.key, node.folder);
                        break;
                    case "queryAttribute":
                        if (node.folder) return;
                        _QueryEnclosureAttribute(node.key, 3); //调后台接口，获取属性信息
                        break;
                    default:
                        // alert("Unhandled command: " + data.cmd);
                        Notify.show({
                            title: "Unhandled command: " + data.cmd,
                            type: "warning"
                        });
                        return;
                }
            })
            .on("keydown", function(e) {
                var cmd = null;
                switch ($.ui.fancytree.eventToString(e)) {
                    case "ctrl+d":
                        cmd = "addChild";
                        break; //新建目录
                    case "del":
                        cmd = "remove";
                        break; //删除
                    case "ctrl+e":
                        cmd = "edit";
                        break; //编辑
                    case "ctrl+q":
                        cmd = "queryAttribute";
                        break; //属性
                }
                if (cmd) {
                    $(this).trigger("nodeCommand", {
                        cmd: cmd
                    }); //触发nodeCommand事件
                    return false;
                }
            });

        $("#tree").contextmenu({
            delegate: "span.fancytree-node",
            menu: [{
                title: i18n.t('gismodule.enclosureManage.treeMenu.newDir'),
                cmd: "addChild",
                uiIcon: "my-ui-icon-newDir",
                disabled: true
            }, {
                title: i18n.t('gismodule.enclosureManage.treeMenu.edit'),
                cmd: "edit",
                'uiIcon': 'my-ui-icon-edit'
            }, {
                title: i18n.t('gismodule.enclosureManage.treeMenu.rename'),
                cmd: "rename",
                'uiIcon': 'my-ui-icon-edit'
            }, {
                title: i18n.t('gismodule.enclosureManage.treeMenu.delete'),
                cmd: "remove",
                uiIcon: "my-ui-icon-del"
            }, {
                title: i18n.t('gismodule.enclosureManage.treeMenu.property'),
                cmd: "queryAttribute",
                uiIcon: "my-ui-icon-attribute",
                disabled: true
            }],
            beforeOpen: _beforeOpen, //定义在菜单展现之前的操作
            select: _contextMenuSelect //定义选中菜单中的项的操作
        });
    }

    //延时加载
    function _lazyLoad(event, data) {
        data.result = {
            url: '/gisapi/gisGetQuery',
            data: {
                hostname: gisServer,
                path: '/GisService/enclosure/GetChildren',
                key: data.node.key
            }
        };
    }

    //加载错误提示
    function _loadError(e, data) {
        var error = data.error;
        if (error.status && error.statusText) {
            data.message = "Ajax error: " + i18n.t('gismodule.enclosureManage.alert14');
        } else {
            data.message = "Custom error: " + data.message;
        }
    }

    function clearShapes() {
        $('#enclosureList .fancytree-node.fancytree-selected').not('.fancytree-folder').find('.fancytree-checkbox').trigger('click');
        for (ecId in DISENCLOSUREMAP) {
            //调用地图接口，擦除围栏
            _unloadShape(ecId);
        }
        DISENCLOSUREMAP = {};
    }

    //定义选中围栏树节点的操作
    function _fancytreeSelect(event, data) {
        //判断若是在代码中执行的选中，则退回本次操作
        if (CODESELECTNODE) {
            CODESELECTNODE = false;
            return;
        }
        var selectedNodes = data.tree.getSelectedNodes(); //获取所有选中的节点
        for (var i = 0; i < selectedNodes.length; i++) //遍历选中的节点
        {
            var node = selectedNodes[i]; //获取当前节点
            //若当前节点是文件夹，且是未展开状态
            if (node.folder) {
                node.setExpanded(); //展开文件夹
                _reviewChildren(node); //对本节点进行遍历
            }
        }

        var nodesArr = new Array(); //当前选中的节点ID数组
        var addArr = new Array(); //需要添加的的围栏节点ID数组
        var deleteArr = new Array(); //需要删除的围栏节点ID数组
        var nodes = data.tree.getSelectedNodes(); //再次获取选中的节点（与之前的不一行）
        var leafNodesNum = 0;
        for (var i = 0; i < nodes.length; i++) //遍历选中的节点，获取所有节点ID
        {
            var node = nodes[i]; //获取当前节点
            if (node.folder) continue;
            nodesArr[leafNodesNum++] = node.key; //围栏节点ID
        }
        //找出需要删除的围栏
        var delNum = 0;
        for (ecId in DISENCLOSUREMAP) {
            var needDel = true;
            for (var i = 0; i < nodesArr.length; i++) {
                var ecKey = nodesArr[i];
                if (DISENCLOSUREMAP[ecId] == ecKey) {
                    needDel = false;
                    break;
                }
            }

            if (needDel) {
                deleteArr[delNum++] = DISENCLOSUREMAP[ecId];
            }
        }

        //找出需要添加的围栏
        var addNun = 0;
        for (var i = 0; i < nodesArr.length; i++) {
            var ecKey = nodesArr[i];
            var needAdd = true;
            for (ecId in DISENCLOSUREMAP) {
                if (DISENCLOSUREMAP[ecId] == ecKey) {
                    needAdd = false;
                    break;
                }
            }

            if (needAdd) {
                addArr[addNun++] = ecKey;
            }
        }

        //处理需要删除的围栏图形
        for (var i = 0; i < deleteArr.length; i++) {
            var ecKey = deleteArr[i];
            var delEcId;
            for (ecId in DISENCLOSUREMAP) {
                if (DISENCLOSUREMAP[ecId] == ecKey) {
                    delEcId = ecId;
                    break;
                }
            }
            delete DISENCLOSUREMAP[ecId]; //根据键值，删除该键值对

            //调用地图接口，擦除围栏
            _unloadShape(ecId);
        }

        //没有需要添加的围栏图形，则退出
        if (addArr.length == 0) return;

        //处理需要添加的围栏图形
        var needAddKeyStr = "";
        for (var j = 0; j < addArr.length; j++) {
            needAddKeyStr += ("key=" + addArr[j]);
            if (j != addArr.length - 1) {
                needAddKeyStr += "&";
            }
        }

        _QueryEnclosureMapData(addArr); //调用后台服务，获取围栏信息
    }

    //编辑结束事件
    function close(event, data) {
        //编辑目录
        if (data.save && !data.isNew) {
            _ModifyFolderName(data); //调用编辑目录接口
        }
        //新建目录
        if (data.save && data.isNew) {
            _CreateFolder(data); //调用新建目录接口
        }
    }
    //后台服务接口——新建文件夹（fancyTree的close事件的data参数）
    function _CreateFolder(data) {
        var parentID = data.node.parent.key;
        var name = data.node.title;
        var defaultKey = data.node.key; //获取系统为新建的目录添加的默认key值

        $.ajaxSettings.async = false;
        $.ajax({
            type: 'POST',
            url: '/gisapi/gisPostQuery',
            data: {
                hostname: gisServer,
                path: '/GisService/enclosure/CreateFolder',
                parentID: parentID,
                name: name,
                userID: USERID
            },
            dataType: 'text',
            success: function(result) {
                if (result == "") {
                    data.node.remove();
                    Notify.show({
                        title: i18n.t('gismodule.enclosureManage.alert3'),
                        type: "warning"
                    });
                    return;
                }
                data.node.key = result;
            },
            error: function(result) {
                // alert(i18n.t('gismodule.enclosureManage.alert3'));
                Notify.show({
                    title: i18n.t('gismodule.enclosureManage.alert3'),
                    type: "warning"
                });
                //从树上删除新建的目录
                var tree = $("#tree").fancytree("getTree");
                var node = tree.getNodeByKey(defaultKey);
                var refNode = node.getNextSibling() || node.getPrevSibling() || node.getParent();
                node.remove();
                if (refNode) {
                    refNode.setActive();
                }
            }
        });
    }
    //后台服务接口——编辑目录（fancyTree的close事件的data参数）
    function _ModifyFolderName(data) {
        var key = data.node.key;
        var name = data.node.title; //修改后的名称
        var preName = data.orgTitle; //原名称

        $.ajaxSettings.async = false;
        $.ajax({
            type: 'POST',
            url: '/gisapi/gisPostQuery',
            data: {
                hostname: gisServer,
                path: '/GisService/enclosure/ModifyFolderName',
                key: key,
                name: name
            },
            dataType: 'json',
            success: function(result) {
                if (result) {} else {
                    // alert(i18n.t('gismodule.enclosureManage.alert4'));
                    Notify.show({
                        title: i18n.t('gismodule.enclosureManage.alert4'),
                        type: "warning"
                    });
                    //重新设置目录名称
                    var tree = $("#tree").fancytree("getTree");
                    var node = tree.getNodeByKey(key);
                    node.title = preName;
                    $(".fancytree-title", node.span)[0].innerHTML = preName;
                }
            },
            error: function(result) {
                // alert(i18n.t('gismodule.enclosureManage.alert4'));
                Notify.show({
                    title: i18n.t('gismodule.enclosureManage.alert4'),
                    type: "warning"
                });
                //重新设置目录名称
                var tree = $("#tree").fancytree("getTree");
                var node = tree.getNodeByKey(key);
                node.title = preName;
                $(".fancytree-title", node.span)[0].innerHTML = preName;
            }
        });
    }

    //定义在菜单展现之前的操作
    function _beforeOpen(event, ui) {
        var node = $.ui.fancytree.getNode(ui.target); //获取节点

        if (node.parent.title == "root") //若是根节点，则除了“新建目录”，其他都不能操作
        {
            $("#ui-id-3").hide();
            $("#ui-id-4").show();
            $("#tree").contextmenu("enableEntry", "addChild", true);
            $("#tree").contextmenu("enableEntry", "queryAttribute", false);
            $("#tree").contextmenu("enableEntry", "rename", false);
            $("#tree").contextmenu("enableEntry", "remove", false);
        } else {
            // $("#tree").contextmenu("enableEntry", "edit", true);
            $("#tree").contextmenu("enableEntry", "remove", true);

            if (node.folder) //当前焦点在文件夹上时，新建目录功能可用，查看属性功能不可用
            {
                $("#ui-id-3").hide();
                $("#ui-id-4").show();
                $("#tree").contextmenu("enableEntry", "rename", true);
                $("#tree").contextmenu("enableEntry", "addChild", true);
                $("#tree").contextmenu("enableEntry", "queryAttribute", false);
            } else //当前焦点不在文件夹上时，新建目录功能不可用，查看属性功能可用
            {
                $("#ui-id-3").show();
                $("#ui-id-4").hide();
                $("#tree").contextmenu("enableEntry", "edit", true);
                $("#tree").contextmenu("enableEntry", "addChild", false);
                $("#tree").contextmenu("enableEntry", "queryAttribute", true);
            }
        }

        node.setActive(); //将当前节点设置为active状态
    }

    //遍历子节点，进行展开和选中操作
    function _reviewChildren(node) {
        if (node.hasChildren()) {
            var nodeChildren = node.children; //获取所有子节点
            //遍历子节点
            for (var i = 0; i < nodeChildren.length; i++) {
                var childNode = nodeChildren[i]; //按顺序获取单个节点
                if (!childNode.folder && !childNode.selected) {
                    //若为叶子节点，且未被选中，则执行选中，并在地图上添加对应围栏
                    CODESELECTNODE = true;
                    childNode.setSelected();
                    CODESELECTNODE = false; //2016.4.29
                } else {
                    if (childNode.lazy != true && !childNode.hasChildren()) {
                        continue;
                    }
                    childNode.setExpanded(); //展开文件夹
                    CODESELECTNODE = true;
                    childNode.setSelected();
                    CODESELECTNODE = false; //2016.4.29
                    _reviewChildren(childNode);
                }
            }
        }
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

    //从地图上擦除图形（图形ID）
    function _unloadShape(graphID) {
        var layers = map._layers;
        for (var key in layers) {
            if (layers[key].graphID != undefined && layers[key].graphID == graphID) {
                var id = layers[key]._leaflet_id;
                map.removeLayer(layers[key].nameMarker);
                map.removeLayer(layers[key]);
                if (id in pointsLayer) {
                    var points = pointsLayer[id];
                    points.clearLayers();
                    delete pointsLayer[id];
                }
                delete layers[key];
                break;
            }
        }
    }

    //根据图形ID，修改图形颜色、名称
    function _editShape(graphID, name, color) {
        var layers = map._layers;
        for (var key in layers) {
            if (layers[key].graphID != undefined && layers[key].graphID == graphID) {
                var icon = new L.DivIcon({
                    html: '<div><span>' + name + '</span></div>',
                    className: 'shapeName',
                    iconSize: new L.Point(40, 20)
                });
                layers[key].nameMarker.setIcon(icon);
                layers[key]._path.attributes['stroke'].value = color;
                layers[key]._path.attributes['fill'].value = color;
                break;
            }
        }
    }

    //后台服务接口——获取围栏树对应的图形数据（需要添加的围栏key值字符串）
    function _QueryEnclosureMapData(needAddKeyStr) {
        $.ajaxSettings.async = true;
        $.ajax({
            type: 'GET',
            url: '/gisapi/gisGetQuery',
            data: {
                hostname: gisServer,
                path: '/GisService/enclosure/QueryEnclosureMapData',
                key: needAddKeyStr
            },
            dataType: 'text',
            success: function(result) {
                var data = eval(result); //批量获取围栏图形信息
                for (var j = 0; j < data.length; j++) {
                    var key = data[j].key; //围栏ID
                    var graphicID = data[j].graphID; //图形ID
                    var graphic = data[j].graphic; //图形类的JSON字符串
                    var graphicType = data[j].graphicType; //图形类别（”1”：圆；”2”：多边形；”3”:矩形）

                    DISENCLOSUREMAP[graphicID] = key;
                    var graphicName = $("#tree").fancytree("getTree").getNodeByKey(key).title;
                    var color = data[j].graphicAttr.color;

                    var islocate = false;
                    if (j == data.length - 1) {
                        islocate = true;
                    }
                    //调地图接口，展示出图形
                    switch (graphicType) {
                        case "1":
                            drawCircle.loadShape(data[j], graphicName, color, islocate);
                            break;
                        case "2":
                            drawPolygon.loadShape(data[j], graphicName, color, islocate);
                            break;
                        case "3":
                            drawRect.loadShape(data[j], graphicName, color, islocate);
                            break;
                    }
                }
            },
            error: function(result) {
                // alert(i18n.t('gismodule.enclosureManage.alert10'))
                Notify.show({
                    title: i18n.t('gismodule.enclosureManage.alert10'),
                    type: "warning"
                });
            }
        });
    }

    //leaflet接口——保存围栏,（是否为新建围栏、围栏类型、围栏json数据、围栏图形ID
    function SaveEnclosure(isNew, graphicType, graphic, graphicID) {
        if (isNew) { //若是新建围栏，则需弹出围栏属性面板，进行围栏属性设置
            //参数：类型（1、新建围栏 2、属性编辑 3、属性查看）、围栏ID、名称、目录、目录ID、填充色、描述、图形数据、图形类型
            //  FANCYTREE.ShowAttributePanel(1,"","","",-1,"","",graphic,graphicType);
            _ShowDialog(1, "", "", "", -1, "", "", graphic, graphicType);
        } else { //若不是新建围栏，则根据围栏图形ID，更改围栏图形在后台的数据
            _ModifyGraphics(graphicID, graphic, graphicType); //编辑围栏图形
        }
    }
    //leaflet接口——删除围栏（围栏图形ID）
    function DeleteEnclosure(graphicID) {
        var menu = document.getElementById("mapMenu");
        var id = menu._source._leaflet_id;
        if (id in pointsLayer) {
            var points = pointsLayer[id];
            points.clearLayers();
            delete pointsLayer[id];
        }
        //若围栏图形不存在ID，则退出
        if (graphicID == null) return;
        //通过键值对，找到树节点key，调用后台服务，删除节点
        _DelNode(DISENCLOSUREMAP[graphicID], false);
    }
    //leaflet接口——查看围栏属性
    function QueryEnclosureAttr(graphicID) {
        if (graphicID == null) {
            // alert(i18n.t('gismodule.enclosureManage.alert12'));
            Notify.show({
                title: i18n.t('gismodule.enclosureManage.alert12'),
                type: "warning"
            });
            return;
        }
        _QueryEnclosureAttribute(DISENCLOSUREMAP[graphicID], 3); //通过键值对，找到树节点key，调后台接口，获取属性信息
    }

    function _createAttrPanelInnerHtml(directoryID) {
        var innerHtml =
            '<table id="dialogContent" style="font-size:14px;">' +
            '<tr>' +
            '<td style="width:15px;"></td>' +
            '<td style="width: 80px;"><lable>' + i18n.t('gismodule.enclosureManage.tableCol.name') + '</lable><lable class="necessary" style="color:red;">&nbsp*</lable></td>' +
            '<td style="width: 300px;height:45px;"><input id="ecName" type="text" style="height:30px;width:100%;"/></td>' +
            '</tr>' +
            '<tr>' +
            '<td style="width:15px;"></td>' +
            '<td style="width: 80px;">' + i18n.t('gismodule.enclosureManage.tableCol.dir') + '<lable class="necessary" style="color:red;">&nbsp*</lable></td>' +
            '<td style="width: 300px;height:45px;">' +
            '<div id="ecDir" key="' + directoryID + '" class="ecDir-style"></div>' +
            '<div id="dirTreeButt" class="dirTreeButt-style">' +
            '<div class="dirTreeButtChild-style"></div>' +
            '</div>' +

            '<div id="dirTreePanel" class="dirTreePanel-style">' +
            '<div style="width: 300px;">' +
            '<div id="dirTree" style="width: 100%;;height: 100%;"></div>' +
            '</div>' +
            '</div>' +

            '</td>' +
            '</tr>' +
            '<tr>' +
            '<td style="width:15px;"></td>' +
            '<td style="width: 80px;">' + i18n.t('gismodule.enclosureManage.tableCol.fillColor') + '<lable class="necessary" style="color:red;">&nbsp*</lable></td>' +
            '<td style="width: 300px;height:45px;"><input id="ecColor" type="color" value="#FF0000" style="width:100%;height:30px;"/></td>' +
            '</tr>' +
            '<tr>' +
            '<td style="width:15px;"></td>' +
            '<td style="width: 80px">' + i18n.t('gismodule.enclosureManage.tableCol.description') + '</td>' +
            '<td style="width: 300px;height:100px;"><textarea id="ecRemark" style="height: 100%;width: 100%;"></textarea></td>' +
            '</tr>' +
            '</table>';
        return innerHtml;
    }
    //显示属性面板，参数：类型（1、新建围栏 2、属性编辑 3、属性查看）、围栏ID、名称、目录、目录ID、填充色、描述、图形数据、图形类型
    function _ShowDialog(type, enclosureID, name, directory, directoryID, color, remark, graphicData, graphicType) {
        var titleName = "";
        switch (type) {
            case 1:
                titleName = i18n.t('gismodule.enclosureManage.operateType.newEnclosure');
                break;
            case 2:
                titleName = i18n.t('gismodule.enclosureManage.operateType.editProperty');
                break;
            case 3:
                titleName = i18n.t('gismodule.enclosureManage.operateType.viewProperty');
                break;
            default:
                titleName = i18n.t('gismodule.enclosureManage.operateType.newEnclosure');
        }
        Dialog.build({
            title: titleName,
            content: _createAttrPanelInnerHtml(directoryID),
            rightBtnCallback: function() {
                if (type != 3) {
                    var name = $("#ecName").val().trim(); //名称
                    var directory = $("#ecDir")[0].innerHTML; //目录
                    var directoryID = $("#ecDir").attr("key"); //目录ID
                    var color = $("#ecColor").val(); //颜色
                    var remark = $("#ecRemark").val(); //备注
                    var ecID = $("#ecName").attr("enclosureID");
                    if (name == "" || directory == "" || color == "") {
                        // alert(i18n.t('gismodule.enclosureManage.alert13'));
                        Notify.show({
                            title: i18n.t('gismodule.enclosureManage.alert13'),
                            type: "warning"
                        });
                        return;
                    }
                    //新建围栏
                    if (type == 1) {
                        //调用后台服务新建围栏接口
                        _CreateEnclosure(name, directoryID, color, remark, graphicData, graphicType);
                    }
                    //属性编辑
                    if (type == 2) {
                        //调用后台服务编辑围栏属性接口
                        _ModidfyEnclosureAttr(ecID, name, directoryID, color, remark);
                    }
                }
                $.magnificPopup.close();
            },
        }).show(function() {
            if (type == 3) {
                $("#ecName").attr("readonly", "readonly"); //添加名称的只读属性
                $("#ecDir").css("width", "300"); //修改目录框长度
                $("#dirTreeButt").hide(); //隐藏目录选择下拉列表
                $("#ecColor").attr("disabled", "disabled"); //添加颜色的不可编辑属性
                $("#ecRemark").attr("readonly", "readonly"); //添加备注的只读属性
                $(".necessary").hide();
            }
            $("#ecName").val(name);
            $("#ecDir")[0].innerHTML = directory;
            $("#ecColor").val(color);
            $("#ecRemark").val(remark);
            $("#ecName").attr("enclosureID", enclosureID);
            //设置目录
            $("#dirTreeButt").click(function(event) {
                event.preventDefault();
                _initPanelDirTree(rootID); //调接口，获取围栏树目录结构
                if ($("#dirTreePanel").is(':visible')) {
                    $("#dirTreePanel").hide();
                } else {
                    var tree = $("#dirTree").fancytree("getTree");
                    //折叠树
                    $("#dirTree").fancytree("getRootNode").visit(function(node) {
                        node.setExpanded(false);
                    });
                    //选中目录节点
                    var node = tree.getNodeByKey($("#ecDir").attr("key"));
                    if (node != null) {
                        node.setFocus();
                    }
                    $("#dirTreePanel").show();
                }
            });
        });
    }
    //后台服务接口——编辑围栏图形（图形ID，图形数据，图形类型）
    function _ModifyGraphics(graphicID, graphic, graphicType) {
        $.ajaxSettings.async = false;
        $.ajax({
            type: 'POST',
            url: '/gisapi/gisPostQuery',
            data: {
                hostname: gisServer,
                path: '/GisService/enclosure/ModifyGraphics',
                graphicID: graphicID,
                graphic: graphic,
                graphicType: graphicType
            },
            dataType: 'text',
            success: function(data) {
                if (data == "false") {
                    // alert(i18n.t('gismodule.enclosureManage.alert7'));
                    Notify.show({
                        title: i18n.t('gismodule.enclosureManage.alert7'),
                        type: "warning"
                    });
                }
            },
            error: function(data) {
                // alert(i18n.t('gismodule.enclosureManage.alert7'));
                Notify.show({
                    title: i18n.t('gismodule.enclosureManage.alert7'),
                    type: "warning"
                });
            }
        });
    }
    //后台服务接口——删除围栏树节点（围栏节点ID，是否是文件夹）
    function _DelNode(key, isFolder) {
        var msg = "确定删除此围栏?";
        if (isFolder) {
            msg = "确定删除该目录及包含的所有围栏吗？";
        }
        bootbox.confirm(msg, function(rlt) {
            if (rlt) {
                $.ajaxSettings.async = false;
                $.ajax({
                    type: 'POST',
                    url: '/gisapi/gisPostQuery',
                    data: {
                        hostname: gisServer,
                        path: '/GisService/enclosure/DelNode',
                        key: key,
                        isFolder: isFolder.toString()
                    },
                    dataType: 'text',
                    success: function(result) {
                        if (result == "true") {
                            var ecId;
                            for (ecId in DISENCLOSUREMAP) {
                                if (DISENCLOSUREMAP[ecId] == key) {
                                    break;
                                }
                            }
                            delete DISENCLOSUREMAP[ecId]; //根据键值，删除该键值对
                            _unloadShape(ecId);
                            //后台删除成功后在围栏树上删除节点
                            var tree = $("#tree").fancytree("getTree");
                            var node = tree.getNodeByKey(key);
                            var refNode = node.getNextSibling() || node.getPrevSibling() || node.getParent();
                            node.remove();
                            if (refNode) {
                                refNode.setActive();
                            }
                            Notify.show({
                                title: '删除成功',
                                type: "success"
                            });
                            return true;
                        }
                        if (result == "false") {
                            // alert(i18n.t('gismodule.enclosureManage.alert9'));
                            Notify.show({
                                title: i18n.t('gismodule.enclosureManage.alert9'),
                                type: "warning"
                            });
                            return false;
                        }
                    },
                    error: function(result) {
                        // alert(i18n.t('gismodule.enclosureManage.alert9'));
                        Notify.show({
                            title: i18n.t('gismodule.enclosureManage.alert9'),
                            type: "warning"
                        });
                        return false;
                    }
                });
            }
        });

    }
    //后台服务接口——获取围栏属性（围栏ID，操作场景<1、新建围栏 2、属性编辑 3、属性查看>）
    function _QueryEnclosureAttribute(key, type) {
        $.ajaxSettings.async = false;
        $.ajax({
            type: 'GET',
            url: '/gisapi/gisGetQuery',
            data: {
                hostname: gisServer,
                path: '/GisService/enclosure/QueryEnclosureAttr',
                key: key
            },
            dataType: 'text',
            success: function(result) {
                var data = JSON.parse(result);
                var name = data.name; //名称
                var directoryId = data.directoryID; //目录ID
                var directory = data.directory; //目录
                var color = data.color; //填充色
                var remark = data.remark; //描述
                _ShowDialog(type, key, name, directory, directoryId, color, remark, "", "");
            },
            error: function(result) {
                // alert(i18n.t('gismodule.enclosureManage.alert8'));
                Notify.show({
                    title: i18n.t('gismodule.enclosureManage.alert8'),
                    type: "warning"
                });
            }
        });
    }

    //后台服务接口——新建围栏（围栏名称、路径ID，颜色，备注，图形数据，图形类型）
    function _CreateEnclosure(name, directoryID, color, remark, graphic, graphicType) {
        $.ajaxSettings.async = false;
        $.ajax({
            type: 'POST',
            url: '/gisapi/gisPostQuery',
            data: {
                hostname: gisServer,
                path: '/GisService/enclosure/CreateEnclosure',
                name: name,
                parentID: directoryID,
                color: color,
                remark: remark,
                graphic: graphic,
                graphicType: graphicType
            },
            dataType: 'text',
            success: function(result) {
                if (result == "") {
                    Notify.show({
                        title: i18n.t('gismodule.enclosureManage.alert5'),
                        type: "warning"
                    });
                    return;
                }
                var data = JSON.parse(result); //返回Json串（enclosureID,graphID,graphType）
                var enclosureID = data.enclosureID.toString(); //围栏节点ID
                var graphID = data.graphID; //围栏图形ID
                var graphType = data.graphType; //围栏图形类型

                //在围栏树上添加新建围栏
                var tree = $("#tree").fancytree("getTree");

                //逐层展开目录
                var dirTree = $("#dirTree").fancytree("getTree"); //目录树
                var dirArr = new Array(); //存放路径ID的数组
                var i = 0;
                var parentNodeInDir = dirTree.getNodeByKey(directoryID);
                //逐层向上遍历，记录下每层的目录
                while (parentNodeInDir.title != "root") {
                    dirArr[i++] = parentNodeInDir.key;
                    parentNodeInDir = parentNodeInDir.parent;
                }

                //逐层展开
                for (var j = dirArr.length - 1; j >= 0; j--) {
                    tree.getNodeByKey(dirArr[j]).setExpanded();
                }

                //添加键值对关系
                DISENCLOSUREMAP[graphID] = enclosureID;

                //设置勾选
                CODESELECTNODE = true;
                var leafNode = tree.getNodeByKey(enclosureID); //获取围栏节点
                if (leafNode == null) {
                    //添加该围栏节点
                    tree.getNodeByKey(directoryID).addChildren({
                        title: name,
                        folder: false,
                        key: enclosureID,
                        "lazy": false,
                        "icon": "leaf.png"
                    });
                    leafNode = tree.getNodeByKey(enclosureID);
                }
                leafNode.setSelected();
                CODESELECTNODE = false; //2016.4.29
                leafNode.setActive();

                //调地图接口，修改新建围栏的名称和ID
                switch (graphType.toString()) {
                    case "1":
                        drawCircle.updateShare(graphID, color, name);
                        break;
                    case "2":
                        drawPolygon.updateShare(graphID, color, name);
                        break;
                    case "3":
                        drawRect.updateShare(graphID, color, name);
                        break;
                }
            },
            error: function(result) {
                // alert(i18n.t('gismodule.enclosureManage.alert5'));
                Notify.show({
                    title: i18n.t('gismodule.enclosureManage.alert5'),
                    type: "warning"
                });
            }
        });
    }

    //后台服务接口——编辑围栏属性（围栏ID，名称、目录ID，颜色，备注）
    function _ModidfyEnclosureAttr(enclosureID, name, directoryID, color, remark) {
        var tree = $("#tree").fancytree("getTree");
        $.ajaxSettings.async = false;
        $.ajax({
            type: 'POST',
            url: '/gisapi/gisPostQuery',
            data: {
                hostname: gisServer,
                path: '/GisService/enclosure/ModidfyEnclosureAttr',
                key: enclosureID,
                name: name,
                parentID: directoryID,
                color: color,
                remark: remark
            },
            dataType: 'text',
            success: function(result) {
                if (result == "true") {
                    var node = tree.getNodeByKey(enclosureID); //获取围栏节点
                    //更改围栏名称
                    if (node.title != name) {
                        node.title = name;
                        $(".fancytree-title", node.span)[0].innerHTML = name;
                    }
                    //更改围栏目录
                    if (node.parent.key != directoryID) {
                        var aimDirNode = tree.getNodeByKey(directoryID); //在围栏树上需要移动的目标目录
                        // var isMove = false; //标识是否需要在围栏树上执行围栏节点移动操作
                        // if (aimDirNode != null && aimDirNode.expanded != null) {
                        //     isMove = true; //若此目录已经延时加载过，则需要fancytree在界面上进行节点移动操作
                        // }
                        // /*若该目录还未经过延时加载，则在接下来的展开目录操作时，会自动进行延时加载，而此时已经在后台执行了节点移动操作
                        //  所以在延时加载时，会把已经移动过去的节点加载出来，界面只需要把原目录下的节点删除即可 */
                        // if (!isMove) {
                        //     node.remove(); //2016.4.29
                        // }
                        // var dirTree = $("#dirTree").fancytree("getTree"); //目录树
                        // var dirArr = new Array(); //存放路径ID的数组
                        // var i = 0;
                        // var parentNodeInDir = dirTree.getNodeByKey(directoryID);
                        // //逐层向上遍历，记录下每层的目录
                        // while (parentNodeInDir.title != "root") {
                        //     dirArr[i++] = parentNodeInDir.key;
                        //     parentNodeInDir = parentNodeInDir.parent;
                        // }
                        // //逐层展开
                        // for (var j = dirArr.length - 1; j >= 0; j--) {
                        //     tree.getNodeByKey(dirArr[j]).setExpanded();
                        // }
                        // //若需要执行移动操作，则移动该围栏节点，并将目标目录展开
                        // if (isMove) {
                        //     tree.getNodeByKey(enclosureID).moveTo(aimDirNode, "child");
                        //     aimDirNode.setExpanded();
                        // }
                        tree.getNodeByKey(enclosureID).moveTo(aimDirNode, "child");
                        aimDirNode.setExpanded();
                        //设置移动的节点为active
                        tree.getNodeByKey(enclosureID).setActive();
                    }
                    //若该围栏显示在地图上，则更改围栏颜色
                    var graphID = -1;
                    for (ecID in DISENCLOSUREMAP) {
                        if (DISENCLOSUREMAP[ecID] == enclosureID) {
                            graphID = ecID;
                            break;
                        }
                    }
                    if (graphID != -1) {
                        //调地图接口，修改围栏的名称和颜色
                        _editShape(graphID, name, color);
                        //设置选中
                        CODESELECTNODE = true;
                        tree.getNodeByKey(enclosureID).setSelected(); //2016.4.29
                        CODESELECTNODE = false; //2016.4.29
                    }
                }
                if (result == "false") {
                    // alert(i18n.t('gismodule.enclosureManage.alert6'));
                    Notify.show({
                        title: i18n.t('gismodule.enclosureManage.alert6'),
                        type: "warning"
                    });
                }
            },
            error: function(result) {
                // alert(i18n.t('gismodule.enclosureManage.alert6'));
                Notify.show({
                    title: i18n.t('gismodule.enclosureManage.alert6'),
                    type: "warning"
                });
            }
        });
    }

    return {
        init: init,
        SaveEnclosure: SaveEnclosure,
        DeleteEnclosure: DeleteEnclosure,
        QueryEnclosureAttr: QueryEnclosureAttr,
        clearShapes: clearShapes
    }
});