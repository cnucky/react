/**
 * Created by zhangxinyue on 2016/4/6.
 */
(function(window, document, undefined) {
    var USERID; //当前登录的用户ID
    var DISENCLOSUREMAP = {}; //[当前显示在地图上的围栏ID,围栏树上节点ID项][ecId,ecKey]
    var selectedGraphics = ""; //表示当前选中的的是哪种类型的围栏
    var attrPanelMove = false; //属性面板移动参数
    var offset_x; //横坐标偏移量
    var offset_y; //纵坐标偏移量
    var FANCYTREE; //fancyTree对象
    var drawRect; //四边形对象
    var drawCircle; //圆形对象
    var drawPolygon; //多边形对象
    var rootID; //根节点ID
    var SetEnclosure; //_setEnclosureInfo对象
    var CODESELECTNODE = false; //该变量标记是从代码中选中节点，不必执行fancytreeSelect方法
    var pointsLayer = {}; //2016-10-25 query layer in enclosure
    var layerFields = {}; //2016-10-26 layer fields map


    /* 设置和轨迹相关的元素
     panelParentID：承载围栏面板的父节点ID
     * */
    var gisServer;

    function _setEnclosureInfo(options) {
        this.options = options;
        gisServer = options.gisServer;
        Dialog = options.Dialog;
    }




    //构造函数
    setEnclosureInfo = function(options, userID) {
        USERID = userID;
        return new _setEnclosureInfo(options);

    };

    _setEnclosureInfo.prototype = {
        //初始化方法
        initialize: function(toolbar, setEnclosure) {
            this._container = toolbar._container;
            var map = this.map = toolbar._map;
            SetEnclosure = setEnclosure; //获取围栏管理类对象
            this.relativeBtn = this._addBtn();
            this._getRootID(USERID); //获取树根节点ID
            this._addPanel();
            this._initEvent(map); //初始化事件

            //定义fancyTree
            FANCYTREE = new _defineFancyTree();
            FANCYTREE.initialize();

            //初始化围栏图形操作对象
            this._initGraphicOperation(map, setEnclosure);

            //设置pannel长度
            this.windowResize();
        },

        //初始化围栏图形操作对象
        _initGraphicOperation: function(map, setEnclosure) {
            var menu = document.getElementById("mapMenu");
            menu.enclosureNum = 0;
            drawRect = new myDrawRectangle({
                enclosureObj: setEnclosure
            }, menu); //四边形对象
            drawRect.addTo(map);

            drawCircle = new myDrawCircle({
                enclosureObj: setEnclosure
            }, menu); //圆形对象
            drawCircle.addTo(map);

            drawPolygon = new myDrawPolygon({
                enclosureObj: setEnclosure
            }, menu); //多边形对象
            drawPolygon.addTo(map);

            var drawnItems = new L.FeatureGroup(); //定义图层
            map.addLayer(drawnItems);
            map.on('draw:created', function(e) {
                var type = e.layerType,
                    layer = e.layer;
                drawnItems.addLayer(layer);
            });
            map.on({
                mousedown: hideMenu,
                movestart: hideMenu,
                zoomstart: hideMenu
            }, menu);

            function hideMenu() {
                this.style.display = "none";
            }
        },

        //获取和图层面板相关联的按钮（在工具栏上）
        getRelativeBtn: function() {
            return this.relativeBtn;
        },

        //获取图层面板上的关闭按钮
        getCloseElement: function() {
            return document.getElementById("hideEnclosurePanel");
        },

        //设置面板大小
        windowResize: function() {
            // var windowHeight = $(window).height();
            // var bodyHeight = windowHeight - 38;
            // if (bodyHeight < 505) {
            //     $(".enclosure-group-body").css("height", 505 - 38);
            // } else {
            //     $(".enclosure-group-body").css("height", bodyHeight);
            // }

            $(".enclosure-group-body").css("height", parseInt($("#map").css("height")) - 50);
            $(".enclosureList-style").css("height", parseInt($(".enclosure-group-body").css("height")) - 50);
        },

        //（私有）添加工具栏上的按钮
        _addBtn: function() {
            /* var toolButton = document.createElement('img');
             toolButton.src = "../js/components/gisWidget/enclosureManageModule/image/enclosure.png";*/

            var toolButton = document.createElement('span');
            toolButton.height = 24;
            toolButton.width = 24;
            toolButton.title = i18n.t('gismodule.enclosureManage.title');
            toolButton.className = "buttonInToolbar-style fa fa-globe";
            this._container.appendChild(toolButton);

            return toolButton;
        },

        //（私有）添加图层面板上的元素
        _addPanel: function() {
            var parentId = document.getElementById(this.options.panelParentID);
            parentId.innerHTML = this._createPanelInnerHtml();

            // $("#" + this.options.panelParentID).after(this._createMapMenuInnerHtml());
            this._createMapMenuInnerHtml(this.options.panelParentID);
        },

        //初始化事件
        _initEvent: function(map) {
            //圆形围栏点击事件
            $("#circle").click(function(event) {
                event.preventDefault()
                if (drawRect.isEnabled) {
                    drawRect.disabled();
                    $("#rectangle").css("background-color", ""); //取消原围栏点击样式
                }
                if (drawPolygon.isEnabled) {
                    drawPolygon.disabled();
                    $("#polygon").css("background-color", ""); //取消原围栏点击样式
                }
                if (drawCircle.isEnabled) {
                    drawCircle.disabled();
                    $("#circle").css("background-color", ""); //取消原围栏点击样式
                } else {
                    drawCircle.enabled(); //设置圆形围栏可用状态
                    $(this).css("background-color", "#87ceeb"); //设置圆形围栏按钮点击状态
                }
            });
            //四边形围栏点击事件
            $("#rectangle").click(function(event) {
                event.preventDefault();
                if (drawCircle.isEnabled) {
                    drawCircle.disabled();
                    $("#circle").css("background-color", ""); //取消原围栏点击样式
                }
                if (drawPolygon.isEnabled) {
                    drawPolygon.disabled();
                    $("#polygon").css("background-color", ""); //取消原围栏点击样式
                }
                if (drawRect.isEnabled) {
                    drawRect.disabled();
                    $("#rectangle").css("background-color", ""); //取消原围栏点击样式
                } else {
                    drawRect.enabled(); //设置围栏可用状态
                    $(this).css("background-color", "#87ceeb"); //设置围栏按钮点击状态
                }
            });
            //多边形围栏点击事件
            $("#polygon").click(function(event) {
                event.preventDefault();
                if (drawRect.isEnabled) {
                    drawRect.disabled();
                    $("#rectangle").css("background-color", ""); //取消原围栏点击样式
                }
                if (drawCircle.isEnabled) {
                    drawCircle.disabled();
                    $("#circle").css("background-color", ""); //取消原围栏点击样式
                }
                if (drawPolygon.isEnabled) {
                    drawPolygon.disabled();
                    $("#polygon").css("background-color", ""); //取消原围栏点击样式
                } else {
                    drawPolygon.enabled(); //设置围栏可用状态
                    $(this).css("background-color", "#87ceeb"); //设置围栏按钮点击状态
                }
            });

            //地图右击菜单相关事件
            $("#map").bind("contextmenu", function() {
                return false;
            });
            $("#mapMenu").bind("contextmenu", function() {
                return false;
            });
            $("#innerPoint").bind("contextmenu", function() {
                return false;
            });
            var childMenuTag = false;
            var timeControl = null; //计时器
            $("#displayInnerPoint").mouseenter(function() {
                var left = parseInt($("#mapMenu").css("left")) + 182;
                var top = parseInt($("#mapMenu").css("top")) + 20;
                $("#innerPoint").css({
                    "left": left,
                    "top": top,
                    "display": "block"
                });
            });
            $("#displayInnerPoint").mouseleave(function() {
                timeControl = setTimeout(TimeOut, 100); //鼠标离开0.1秒后，执行TimeOut
            });
            $("#innerPoint").mouseenter(function() {
                childMenuTag = true;
            });
            $("#innerPoint").mouseleave(function() {
                if (childMenuTag) {
                    $("#innerPoint").hide();
                    childMenuTag = false;
                }
            });

            function TimeOut() {
                if (!childMenuTag) {
                    $("#innerPoint").hide();
                }
                timeControl = null;
            }
            //Layer Query
            var menu = document.getElementById("mapMenu");
            $("#innerMenu").click(function(e) {
                menu.style.display = "none";
                $("#innerPoint").hide();
                var layerID = e.target.getAttribute("key");
                var icon = e.target.getAttribute("icon");
                var shape, shapeType;
                var id = menu._source._leaflet_id;
                if (!(id in pointsLayer)) {
                    var points = new L.FeatureGroup(); //定义图层
                    points.addTo(map);
                    pointsLayer[id] = points;
                }
                switch (menu._parent.options.name) {
                    case "DrawCircle":
                        shapeType = '1';
                        shape = JSON.stringify({
                            center: [menu._parent.currentTarget.getLatLng().lat, menu._parent.currentTarget.getLatLng().lng],
                            radius: menu._parent.currentTarget.getRadius()
                        });
                        break;
                    case "DrawPolygon":
                        shapeType = '2';
                        var xys = [];
                        var latlngs = menu._parent.currentTarget.getLatLngs();
                        for (var i = 0; i < latlngs.length; i++) {
                            xys.push([latlngs[i].lat, latlngs[i].lng]);
                        }
                        shape = JSON.stringify({
                            latlngs: xys
                        });
                        break;
                    case "DrawRectangle":
                        shapeType = '3';
                        var xys = [];
                        var latlngs = menu._parent.currentTarget.getLatLngs();
                        for (var i = 0; i < latlngs.length; i++) {
                            xys.push([latlngs[i].lat, latlngs[i].lng]);
                        }
                        shape = JSON.stringify({
                            latlngs: xys
                        });
                        break;
                }
                var data = {
                    hostname: gisServer,
                    path: '/GisService/search/spatialQuery',
                    featureID: layerID,
                    pageNo: '1',
                    pageSize: '1',
                    shapeType: shapeType,
                    shape: shape,
                    requireFields: ['纬度', '经度', 'Record_ID']
                };
                $.ajax({
                    type: 'GET',
                    url: '/gisapi/gisGetQuery',
                    data: data,
                    conditions: data,
                    points: pointsLayer[id],
                    icon: icon,
                    async:true,
                    dataType: 'text',
                    success: function(result) {
                        var obj = JSON.parse(result);
                        var points = this.points;
                        var icon = this.icon;
                        var pointsIcon = new L.Icon.Default;
                        var data = this.conditions;
                        var lid = data.featureID;
                        if (icon != 'null') {
                            pointsIcon = L.icon({
                                iconUrl: '../img/LayerManager/newLayer/icon/' + icon,
                                iconSize: [21, 21],
                                iconAnchor: [10.5, 10.5]
                            });
                        }
                        if (obj.totalPage > 1) {
                            var args = data;
                            args.pageSize = obj.totalPage.toString();
                            var msg = '';
                            if (args.pageSize > 1000) {
                                args.pageSize = 1000;
                                msg += '由于所选范围内的数据量较大，界面最多展示1000条';
                            }
                            $.ajax({
                                type: 'GET',
                                url: '/gisapi/gisGetQuery',
                                data: args,
                                dataType: 'text',
                                async:true,
                                success: function(res) {
                                    points.clearLayers();
                                    var pointsObj = JSON.parse(res);
                                    var len = pointsObj.records.length;
                                    for (var i = 0; i < len; i++) {
                                        var pointMarker = new L.marker([pointsObj.records[i][0], pointsObj.records[i][1]], {
                                            icon: pointsIcon
                                        });
                                        pointClick(pointMarker, pointsObj.records[i][2], lid);
                                        pointMarker.addTo(points);
                                    }
                                    if (msg != '') {
                                        alert(msg);
                                    }
                                },
                                error: function(err) {
                                    console.log(err);
                                }
                            });

                        } else {
                            points.clearLayers();
                            var len = obj.records.length;
                            for (var i = 0; i < len; i++) {
                                var pointMarker = new L.marker([obj.records[i][0], obj.records[i][1]], {
                                    icon: pointsIcon
                                });
                                pointClick(pointMarker, obj.records[i][2], lid);
                                pointMarker.addTo(points);
                            }
                        }
                    },
                    error: function(errorMsg) {
                        console.log(errorMsg);
                    }
                });
            });
            $("#clearLayer").click(function(event) {
                menu.style.display = "none";
                var id = menu._source._leaflet_id;
                if (id in pointsLayer) {
                    var points = pointsLayer[id];
                    points.clearLayers();
                    delete pointsLayer[id];
                }
            });
            //display tooltip
            function pointClick(point, id, layerID) {
                point.key = id;
                point.lid = layerID;
                L.DomEvent.on(point, 'click', function(e) {
                    if (e.target.getPopup() != undefined) {
                        return;
                    }
                    if (e.target.lid in layerFields) {
                        var fieldsInfo = layerFields[e.target.lid];
                        var len = fieldsInfo.names.length;
                        var requireFields = [];
                        for (var i = 0; i < len; i++) {
                            switch (fieldsInfo.names[i]) {
                                case "经度":
                                    continue;
                                case "纬度":
                                    continue;
                                case "Record_ID":
                                    continue;
                                case "原始经度":
                                    continue;
                                case "原始纬度":
                                    continue;
                            }
                            requireFields.push(fieldsInfo.names[i]);
                        }
                        requireFields.push('经度');
                        requireFields.push('纬度');
                        $.ajax({
                            type: 'GET',
                            url: '/gisapi/gisGetQuery',
                            data: {
                                hostname: gisServer,
                                path: '/LayerService/search/normalQuery',
                                featureID: e.target.lid,
                                fieldName: 'Record_ID',
                                requireFields: requireFields,
                                fieldValues: [e.target.key]
                            },
                            async:true,
                            dataType: 'text',
                            success: function(result) {
                                var tooltip = JSON.parse(result)[0];
                                var popupInfo = '<div class="portlet-extend"><div class="portlet-title-extend-popup">详细信息' + '</div>' +
                                    '<div class="portlet-body-extend-popup"><table>';
                                for (var i = 0; i < requireFields.length; i++) {
                                    if (i % 2 == 0) {
                                        popupInfo += '<tr><th>' + requireFields[i] + '</th><td>' + tooltip[i] + '</td></tr>';
                                    } else {
                                        popupInfo += '<tr style="background-color: white;"><th>' + requireFields[i] + '</th><td>' + tooltip[i] + '</td></tr>';
                                    }
                                }
                                popupInfo += '</table></div></div>';
                                e.target.bindPopup(popupInfo);
                                e.target.openPopup();
                            },
                            error: function(errorMsg) {
                                console.log(errorMsg);
                            }
                        });
                    }
                });
            };
        },

        //（私有）生成围栏面板的内部HTML
        _createPanelInnerHtml: function() {
            var innerHtml =
                '<div class="enclosure-group-title">' +
                '<label style="position: absolute;top:8px;left: 5px;">' + i18n.t('gismodule.enclosureManage.title') + '</label>' +
                '<img id="hideEnclosurePanel" src="../js/components/gisWidget/enclosureManageModule/image/remove-icon-small.png" style="position: absolute;top:10px;right: 8px;cursor: pointer;">' +
                '</div>' +
                '<div class="enclosure-group-body">' +
                '<div style="background-color: aliceblue;border: 1px solid aliceblue;margin: 5px;">' +
                '<img id="circle" class="circle-style" title="' + i18n.t('gismodule.enclosureManage.toolbarBtn.circle') + '" src="../js/components/gisWidget/enclosureManageModule/image/circle.png"/>' +
                '<img id="rectangle" class="rectangle-style" title="' + i18n.t('gismodule.enclosureManage.toolbarBtn.rectangle') + '" src="../js/components/gisWidget/enclosureManageModule/image/rectangle.png"/>' +
                '<img id="polygon" class="polygon-style" title= "' + i18n.t('gismodule.enclosureManage.toolbarBtn.polygon') + '" src="../js/components/gisWidget/enclosureManageModule/image/polygon.png"/>' +
                '</div>' +
                '<div id="enclosureList" class="enclosureList-style">' +
                '<div id="tree">' +
                '<ul><li id="' + rootID + '" class="lazy folder" data-json=\'{"icon": "branch_16_p.png"}\'>' + i18n.t('gismodule.enclosureManage.dirName') + '</ul>' +
                '</div>' +
                '</div>' +
                '</div>';

            return innerHtml;
        },

        //生成地图右键菜单内部Html
        _createMapMenuInnerHtml: function(panelParentID) {
            var innerHtml =
                '<div id="mapMenu" class="mapMenuParent-style">' +
                '<table class="mapMenu-style">' +
                '<tr class="mapMenu-oneItem" id="displayInnerPoint">' +
                '<td>' +
                '<div style="float: left;width: 25px;"><img src="../js/components/gisWidget/enclosureManageModule/image/mapMenu/dot-chart_16_p.png" style="height: 16px;width: 16px;"></div>' +
                '<div style="float:left;font-size: 12px;height: 16px;margin-top: 2px;">' + i18n.t('gismodule.enclosureManage.mapMenu.display') + '</div>' +
                '<div style="float:right;margin-top:5px;width: 0;height: 0;border-top: 4px solid transparent;border-bottom: 4px solid transparent;border-left: 4px solid #000000;"></div>' +
                '</td>' +
                '</tr>' +
                '<tr class="mapMenu-oneItem" id="clearLayer">' +
                '<td>' +
                '<div style="float: left;width: 25px;"><img src="../js/components/gisWidget/enclosureManageModule/image/mapMenu/find_text_16_p.png" style="height: 16px;width: 16px;"></div>' +
                '<div style="float:left;font-size: 12px;height: 16px;margin-top: 2px;">' + i18n.t('gismodule.enclosureManage.mapMenu.clear') + '</div>' +
                '</td>' +
                '</tr>' +
                '<tr ><td><hr style="-webkit-margin-before:0;-webkit-margin-after:0;border-top: 1px solid lightgrey;"/></td></tr>' +
                '<tr class="mapMenu-oneItem" id="popEdit">' +
                '<td>' +
                '<div style="float: left;width: 25px;"><img src="../js/components/gisWidget/enclosureManageModule/image/mapMenu/layout_center_16_p.png" style="height: 16px;width: 16px;"></div>' +
                '<div style="float:left;font-size: 12px;height: 16px;margin-top: 2px;">' + i18n.t('gismodule.enclosureManage.mapMenu.edit') + '</div>' +
                '</td>' +
                '</tr>' +
                '<tr class="mapMenu-oneItem" id="popAttribute">' +
                '<td>' +
                '<div style="float: left;width: 25px;"><img src="../js/components/gisWidget/enclosureManageModule/image/mapMenu/document_edit_16_p.png" style="height: 16px;width: 16px;"></div>' +
                '<div style="float:left;font-size: 12px;height: 16px;margin-top: 2px;">' + i18n.t('gismodule.enclosureManage.mapMenu.property') + '</div>' +
                '</td>' +
                '</tr>' +
                '<tr class="mapMenu-oneItem" id="popDelete">' +
                '<td>' +
                '<div style="float: left;width: 25px;"><img src="../js/components/gisWidget/enclosureManageModule/image/mapMenu/error_16_p.png" style="height: 16px;width: 16px;"></div>' +
                '<div style="float:left;font-size: 12px;height: 16px;margin-top: 2px;">' + i18n.t('gismodule.enclosureManage.mapMenu.delete') + '</div>' +
                '</td>' +
                '</tr>' +
                '<tr class="mapMenu-oneItem" id="popSave">' +
                '<td>' +
                '<div style="float: left;width: 25px;"><img src="../js/components/gisWidget/enclosureManageModule/image/mapMenu/disk_blue_ok_16_p.png" style="height: 16px;width: 16px;"></div>' +
                '<div style="float:left;font-size: 12px;height: 16px;margin-top: 2px;">' + i18n.t('gismodule.enclosureManage.mapMenu.save') + '</div>' +
                '</td>' +
                '</tr>' +
                '</table>' +
                '</div>';
            // '<div id="innerPoint" class="innerPointParent-style">' +
            // '<table class="innerPoint-style">' +
            // // '<tr style="height: 25px;" class="mapMenu-oneItem"><td style="padding-left: 15px;">'+i18n.t('gismodule.enclosureManage.pointType.tollGate')+'</td></tr>' +
            // '<tr style="height: 25px;" class="mapMenu-oneItem"><td style="padding-left: 15px;">' + i18n.t('gismodule.enclosureManage.pointType.airport') + '</td></tr>' +
            // '<tr style="height: 25px;" class="mapMenu-oneItem"><td style="padding-left: 15px;">' + i18n.t('gismodule.enclosureManage.pointType.railwayStation') + '</td></tr>' +
            // '<tr style="height: 25px;" class="mapMenu-oneItem"><td style="padding-left: 15px;">' + i18n.t('gismodule.enclosureManage.pointType.baseStation') + '</td></tr>' +
            // // '<tr style="height: 25px;" class="mapMenu-oneItem"><td style="padding-left: 15px;">'+i18n.t('gismodule.enclosureManage.pointType.busStation')+'</td></tr>' +
            // // '<tr style="height: 25px;" class="mapMenu-oneItem"><td style="padding-left: 15px;">'+i18n.t('gismodule.enclosureManage.pointType.port')+'</td></tr>' +
            // '</table>' +
            // '</div>';
            this._getAllLayerInfo(innerHtml, panelParentID);
        },

        //从地图上擦除图形（图形ID）
        unloadShape: function(graphID) {
            var layers = this.map._layers;
            for (var key in layers) {
                if (layers[key].graphID != undefined && layers[key].graphID == graphID) {
                    var id = layers[key]._leaflet_id;
                    this.map.removeLayer(layers[key].nameMarker);
                    this.map.removeLayer(layers[key]);
                    if (id in pointsLayer) {
                        var points = pointsLayer[id];
                        points.clearLayers();
                        delete pointsLayer[id];
                    }
                    delete layers[key];
                    break;
                }
            }
        },

        //根据图形ID，修改图形颜色、名称
        editShape: function(graphID, name, color) {
            var layers = this.map._layers;
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
        },

        //后台服务接口——获取对应用户的根节点ID（用户ID）
        _getRootID: function(userId) {
            $.ajaxSettings.async = false;
            $.ajax({
                type: 'GET',
                url: '/gisapi/gisGetQuery',
                data: {
                    hostname: gisServer,
                    path: '/GisService/enclosure/getRootDirectoryID',
                    userID: userId
                },
                dataType: 'text',
                success: function(result) {
                    rootID = result;
                },
                error: function(result) {
                    alert(i18n.t('gismodule.enclosureManage.alert1'))
                }
            });
        },

        //后台服务接口——获取当前目录下的第一层子节点（lazy方法的参数，节点key值）
        GetChildren: function(data, key) {
            //$.ajaxSettings.async = false;
            $.ajax({
                type: 'GET',
                url: '/gisapi/gisGetQuery',
                data: {
                    hostname: gisServer,
                    path: '/GisService/enclosure/GetChildren',
                    key: key
                },
                dataType: 'text',
                success: function(result) {
                    data.result = eval(result);
                },
                error: function(result) {
                    data.result = $.Deferred(function(dfd) {
                        dfd.reject(new Error(i18n.t('gismodule.enclosureManage.alert2')));
                    });
                }
            });
        },

        //后台服务接口——新建文件夹（fancyTree的close事件的data参数）
        CreateFolder: function(data) {
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
                    data.node.key = result;
                },
                error: function(result) {
                    alert(i18n.t('gismodule.enclosureManage.alert3'));
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
        },

        //后台服务接口——编辑目录（fancyTree的close事件的data参数）
        ModifyFolderName: function(data) {
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
                dataType: 'text',
                success: function(result) {
                    if (result) {} else {
                        alert(i18n.t('gismodule.enclosureManage.alert4'));
                        //重新设置目录名称
                        var tree = $("#tree").fancytree("getTree");
                        var node = tree.getNodeByKey(key);
                        node.title = preName;
                        $(".fancytree-title", node.span)[0].innerHTML = preName;
                    }
                },
                error: function(result) {
                    alert(i18n.t('gismodule.enclosureManage.alert4'));
                    //重新设置目录名称
                    var tree = $("#tree").fancytree("getTree");
                    var node = tree.getNodeByKey(key);
                    node.title = preName;
                    $(".fancytree-title", node.span)[0].innerHTML = preName;
                }
            });
        },

        //后台服务接口——新建围栏（围栏名称、路径ID，颜色，备注，图形数据，图形类型）
        CreateEnclosure: function(name, directoryID, color, remark, graphic, graphicType) {
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
                    alert(i18n.t('gismodule.enclosureManage.alert5'));
                }
            });
        },

        //后台服务接口——编辑围栏属性（围栏ID，名称、目录ID，颜色，备注）
        ModidfyEnclosureAttr: function(enclosureID, name, directoryID, color, remark) {
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
                            var isMove = false; //标识是否需要在围栏树上执行围栏节点移动操作
                            if (aimDirNode != null && aimDirNode.expanded != null) {
                                isMove = true; //若此目录已经延时加载过，则需要fancytree在界面上进行节点移动操作
                            }
                            /*若该目录还未经过延时加载，则在接下来的展开目录操作时，会自动进行延时加载，而此时已经在后台执行了节点移动操作
                             所以在延时加载时，会把已经移动过去的节点加载出来，界面只需要把原目录下的节点删除即可 */
                            if (!isMove) {
                                node.remove(); //2016.4.29
                            }
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
                            //若需要执行移动操作，则移动该围栏节点，并将目标目录展开
                            if (isMove) {
                                tree.getNodeByKey(enclosureID).moveTo(aimDirNode, "child");
                                aimDirNode.setExpanded();
                            }
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
                            SetEnclosure.editShape(graphID, name, color);
                            //设置选中
                            CODESELECTNODE = true;
                            tree.getNodeByKey(enclosureID).setSelected(); //2016.4.29
                            CODESELECTNODE = false; //2016.4.29
                        }
                    }
                    if (result == "false") {
                        alert(i18n.t('gismodule.enclosureManage.alert6'));
                    }
                },
                error: function(result) {
                    alert(i18n.t('gismodule.enclosureManage.alert6'));
                }
            });
        },

        //后台服务接口——编辑围栏图形（图形ID，图形数据，图形类型）
        ModifyGraphics: function(graphicID, graphic, graphicType) {
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
                        alert(i18n.t('gismodule.enclosureManage.alert7'));
                    }
                },
                error: function(data) {
                    alert(i18n.t('gismodule.enclosureManage.alert7'));
                }
            });
        },

        //后台服务接口——获取围栏属性（围栏ID，操作场景<1、新建围栏 2、属性编辑 3、属性查看>）
        QueryEnclosureAttribute: function(key, type) {
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
                    SetEnclosure.ShowDialog(type, key, name, directory, directoryId, color, remark, "", "");
                },
                error: function(result) {
                    alert(i18n.t('gismodule.enclosureManage.alert8'));
                }
            });
        },

        //后台服务接口——删除围栏树节点（围栏节点ID，是否是文件夹）
        DelNode: function(key, isFolder) {
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
                        SetEnclosure.unloadShape(ecId);
                        //后台删除成功后在围栏树上删除节点
                        var tree = $("#tree").fancytree("getTree");
                        var node = tree.getNodeByKey(key);
                        var refNode = node.getNextSibling() || node.getPrevSibling() || node.getParent();
                        node.remove();
                        if (refNode) {
                            refNode.setActive();
                        }
                        return true;
                    }
                    if (result == "false") {
                        alert(i18n.t('gismodule.enclosureManage.alert9'));
                        return false;
                    }
                },
                error: function(result) {
                    alert(i18n.t('gismodule.enclosureManage.alert9'));
                    return false;
                }
            });
        },

        //后台服务接口——获取围栏树对应的图形数据（需要添加的围栏key值字符串）
        QueryEnclosureMapData: function(needAddKeyStr) {
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

                        //调地图接口，展示出图形
                        switch (graphicType) {
                            case "1":
                                drawCircle.loadShape(data[j], graphicName, color);
                                break;
                            case "2":
                                drawPolygon.loadShape(data[j], graphicName, color);
                                break;
                            case "3":
                                drawRect.loadShape(data[j], graphicName, color);
                                break;
                        }
                    }
                },
                error: function(result) {
                    alert(i18n.t('gismodule.enclosureManage.alert10'))
                }
            });
        },

        //后台服务接口——获取围栏树目录结构
        GetAllDir: function() {
            $.ajaxSettings.async = false;
            $.ajax({
                type: 'GET',
                url: '/gisapi/gisGetQuery',
                data: {
                    hostname: gisServer,
                    path: '/GisService/enclosure/GetAllDir',
                    rootDirectoryID: rootID
                },
                dataType: 'text',
                success: function(result) {
                    var data = '[{"title":"' + i18n.t('gismodule.enclosureManage.dirName') + '","folder":true,"lazy":false,"icon":"branch_16_p.png","key":"' + rootID + '","children":' + result + '}]';
                    var source = eval(data);
                    FANCYTREE._defineDirFancyTree(source); //初始化目录树
                },
                error: function(result) {
                    alert(i18n.t('gismodule.enclosureManage.alert11'));
                }
            });
        },


        //leaflet接口——删除围栏（围栏图形ID）
        DeleteEnclosure: function(graphicID) {
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
            SetEnclosure.DelNode(DISENCLOSUREMAP[graphicID], false);
        },

        //leaflet接口——保存围栏,（是否为新建围栏、围栏类型、围栏json数据、围栏图形ID
        SaveEnclosure: function(isNew, graphicType, graphic, graphicID) {
            // this.ShowDialog();
            // Dialog.build({
            //         title: '保存',
            //         content: '<div id="save-dialog"></div>',
            //         rightBtnCallback: function() {

            //             $.magnificPopup.close();
            //         },
            //     }).show(function() {

            //     });

            if (isNew) //若是新建围栏，则需弹出围栏属性面板，进行围栏属性设置
            {
                //参数：类型（1、新建围栏 2、属性编辑 3、属性查看）、围栏ID、名称、目录、目录ID、填充色、描述、图形数据、图形类型
                //  FANCYTREE.ShowAttributePanel(1,"","","",-1,"","",graphic,graphicType);
                SetEnclosure.ShowDialog(1, "", "", "", -1, "", "", graphic, graphicType);


            } else //若不是新建围栏，则根据围栏图形ID，更改围栏图形在后台的数据
            {
                SetEnclosure.ModifyGraphics(graphicID, graphic, graphicType); //编辑围栏图形
            }
        },

        //leaflet接口——查看围栏属性
        QueryEnclosureAttr: function(graphicID) {
            if (graphicID == null) {
                alert(i18n.t('gismodule.enclosureManage.alert12'));
                return;
            }

            SetEnclosure.QueryEnclosureAttribute(DISENCLOSUREMAP[graphicID], 3); //通过键值对，找到树节点key，调后台接口，获取属性信息
        },

        //显示属性面板，参数：类型（1、新建围栏 2、属性编辑 3、属性查看）、围栏ID、名称、目录、目录ID、填充色、描述、图形数据、图形类型
        ShowDialog: function(type, enclosureID, name, directory, directoryID, color, remark, graphicData, graphicType) {
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
                content: FANCYTREE._createAttrPanelInnerHtml(directoryID),
                rightBtnCallback: function() {
                    if (type != 3) {
                        var name = $("#ecName").val(); //名称
                        var directory = $("#ecDir")[0].innerHTML; //目录
                        var directoryID = $("#ecDir").attr("key"); //目录ID
                        var color = $("#ecColor").val(); //颜色
                        var remark = $("#ecRemark").val(); //备注
                        var ecID = $("#ecName").attr("enclosureID");

                        if (name == "" || directory == "" || color == "") {
                            alert(i18n.t('gismodule.enclosureManage.alert13'));
                            return;
                        }

                        //新建围栏
                        if (type == 1) {
                            //调用后台服务新建围栏接口
                            SetEnclosure.CreateEnclosure(name, directoryID, color, remark, graphicData, graphicType);
                        }

                        //属性编辑
                        if (type == 2) {
                            //调用后台服务编辑围栏属性接口
                            SetEnclosure.ModidfyEnclosureAttr(ecID, name, directoryID, color, remark);
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

                    SetEnclosure.GetAllDir(); //调接口，获取围栏树目录结构

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
        },
        //2016-10-21
        _getAllLayerInfo: function(layerItemMenuHtml, panelParentID) {
            layerItemMenuHtml += '<div id="innerPoint" class="innerPointParent-style">' +
                '<table id="innerMenu" class="innerPoint-style">';
            var source = "";
            var obj;
            $.ajax({
                type: 'GET',
                url: '/gisapi/gisGetQuery',
                data: {
                    hostname: gisServer,
                    path: '/LayerService/layer/GetLayerTree',
                    userID: USERID
                },
                dataType: 'text',
                success: function(result) {
                    source += result;
                    obj = eval(source);
                    var layerIDs = [];
                    for (var i = 0; i < obj.length; i++) {
                        switch (obj[i].title) {
                            case "个人图层":
                                for (var j = 0; j < obj[i].children.length; j++) {
                                    if (!obj[i].children[j].folder) {
                                        layerIDs.push(obj[i].children[j].key);
                                        layerItemMenuHtml += '<tr style="height: 25px;" class="mapMenu-oneItem"><td key="' + obj[i].children[j].key + '" icon="' + obj[i].children[j].icon + ' "style="padding-left: 15px;">' + obj[i].children[j].title + '</td></tr>';
                                    }
                                }
                                break;
                            case "基础图层":
                                for (var j = 0; j < obj[i].children.length; j++) {
                                    layerIDs.push(obj[i].children[j].key);
                                    switch (obj[i].children[j].title) {
                                        case "基站数据":
                                            layerItemMenuHtml += '<tr style="height: 25px;" class="mapMenu-oneItem"><td key="' + obj[i].children[j].key + '" icon="' + obj[i].children[j].icon + '" style="padding-left: 15px;">' + i18n.t('gismodule.enclosureManage.pointType.baseStation') + '</td></tr>';
                                            break;
                                        case "火车站数据":
                                            layerItemMenuHtml += '<tr style="height: 25px;" class="mapMenu-oneItem"><td key="' + obj[i].children[j].key + '" icon="' + obj[i].children[j].icon + '" style="padding-left: 15px;">' + i18n.t('gismodule.enclosureManage.pointType.railwayStation') + '</td></tr>';
                                            break;
                                        case "飞机场数据":
                                            layerItemMenuHtml += '<tr style="height: 25px;" class="mapMenu-oneItem"><td key="' + obj[i].children[j].key + '" icon="' + obj[i].children[j].icon + '" style="padding-left: 15px;">' + i18n.t('gismodule.enclosureManage.pointType.airport') + '</td></tr>';
                                            break;
                                    }
                                }
                                break;
                            case "共享图层":
                                for (var j = 0; j < obj[i].children.length; j++) {
                                    layerIDs.push(obj[i].children[j].key);
                                    layerItemMenuHtml += '<tr style="height: 25px;" class="mapMenu-oneItem"><td key="' + obj[i].children[j].key + '" icon="' + obj[i].children[j].icon + '" style="padding-left: 15px;">' + obj[i].children[j].title + '</td></tr>';
                                }
                                break;
                        }
                    }
                    layerItemMenuHtml += '</table></div>';
                    $("#" + panelParentID).after(layerItemMenuHtml);
                    //2016-10-26
                    function getLayerFields(layerID) {
                        $.ajax({
                            type: 'GET',
                            url: '/gisapi/gisGetQuery',
                            data: {
                                hostname: gisServer,
                                path: '/LayerService/layer/GetLayerField',
                                layerID: layerID
                            },
                            dataType: 'text',
                            success: function(args) {
                                layerFields[layerID] = JSON.parse(args);
                            },
                            error: function(errorMsg) {
                                alert(i18n.t('gismodule.LayerManager.importData.alert9'));
                            }
                        });
                    };
                    for (var i = 0; i < layerIDs.length; i++) {
                        getLayerFields(layerIDs[i]);
                    }
                },
                error: function(errorMsg) {
                    alert(i18n.t('gismodule.LayerManager.fancyTree.alert4'));
                    source = "";
                    obj = {};
                }
            });
        }
    };

    //定义fancyTree
    _defineFancyTree = function() {
        //延时加载
        function lazyLoad(event, data) {
            data.result = {
                url: '/gisapi/gisGetQuery',
                data: {
                    hostname: gisServer,
                    path: '/GisService/enclosure/GetChildren',
                    key: data.node.key
                }
            };
            //SetEnclosure.GetChildren(data, data.node.key); //获取当前目录下的第一层子节点
        }

        //加载错误提示
        function loadError(e, data) {
            var error = data.error;
            if (error.status && error.statusText) {
                data.message = "Ajax error: " + i18n.t('gismodule.enclosureManage.alert14');
            } else {
                data.message = "Custom error: " + data.message;
            }
        }

        //编辑结束事件
        function close(event, data) {
            //编辑目录
            if (data.save && !data.isNew) {
                SetEnclosure.ModifyFolderName(data); //调用编辑目录接口
            }
            //新建目录
            if (data.save && data.isNew) {
                SetEnclosure.CreateFolder(data); //调用新建目录接口
            }
        }

        //定义在菜单展现之前的操作
        function beforeOpen(event, ui) {
            var node = $.ui.fancytree.getNode(ui.target); //获取节点

            if (node.parent.title == "root") //若是根节点，则除了“新建目录”，其他都不能操作
            {
                $("#tree").contextmenu("enableEntry", "addChild", true);
                $("#tree").contextmenu("enableEntry", "queryAttribute", false);
                $("#tree").contextmenu("enableEntry", "edit", false);
                $("#tree").contextmenu("enableEntry", "remove", false);
            } else {
                $("#tree").contextmenu("enableEntry", "edit", true);
                $("#tree").contextmenu("enableEntry", "remove", true);

                if (node.folder) //当前焦点在文件夹上时，新建目录功能可用，查看属性功能不可用
                {
                    $("#tree").contextmenu("enableEntry", "addChild", true);
                    $("#tree").contextmenu("enableEntry", "queryAttribute", false);
                } else //当前焦点不在文件夹上时，新建目录功能不可用，查看属性功能可用
                {
                    $("#tree").contextmenu("enableEntry", "addChild", false);
                    $("#tree").contextmenu("enableEntry", "queryAttribute", true);
                }
            }

            node.setActive(); //将当前节点设置为active状态
        }

        //定义选中菜单中的项的操作
        function contextMenuSelect(event, ui) {
            //延时0.1秒执行命令，以确保菜单关闭和执行命令两件事情不冲突
            var that = this;
            setTimeout(function() {
                $(that).trigger("nodeCommand", {
                    cmd: ui.cmd
                });
            }, 100);
        }

        //遍历子节点，进行展开和选中操作
        function reviewChildren(node) {
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
                        reviewChildren(childNode);
                    }
                }
            }
        }

        //定义选中围栏树节点的操作
        function fancytreeSelect(event, data) {
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
                    reviewChildren(node); //对本节点进行遍历
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
                SetEnclosure.unloadShape(ecId);
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

            SetEnclosure.QueryEnclosureMapData(addArr); //调用后台服务，获取围栏信息
        }

        //生成围栏属性面板内部HTML
        this._createAttrPanelInnerHtml = function(directoryID) {
            var innerHtml =
                // '<div id="enclosureAttribute"' +
                // '<div id="enclosureAttribute" class="enclosureAttribute-style"' +
                // '<div class="attributeTitle-style">' +
                //     '<div id="attrOptTitle" style="float:left;"></div>' +
                //     '<div style="float:right;"><img id="cancelEdit1" src="../js/components/gisWidget/enclosureManageModule/image/remove-icon-small.png"/></div>' +
                // '</div>' +
                // '<div class="attributeBody-style">' +
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
                // '<button id="cancelSetDir" style="float: right;">取消</button>' +
                // '<button id="ensureSetDir" style="float: right;">确定</button>' +
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
                // '<tr>' +
                //     '<td style="width: 40%;"></td>' +
                //     '<td style="width: 60%;">' +
                //         '<button id="cancelEdit2" style="float: right;">取消</button>' +
                //         '<button id="ensureEdit" style="float: right;">确定</button>' +
                //     '</td>' +
                // '</tr>' +
                '</table>';
            // '</div>' +
            // '</div>';

            return innerHtml;
        }

        //显示属性面板，参数：类型（1、新建围栏 2、属性编辑 3、属性查看）、围栏ID、名称、目录、目录ID、填充色、描述、图形数据、图形类型
        this.ShowAttributePanel = function(type, enclosureID, name, directory, directoryID, color, remark, graphicData, graphicType) {
            if ($("#enclosureAttribute").length == 0) {
                $("#enclosureManagePanel").after(_createAttrPanelInnerHtml());

                //设置目录
                $("#dirTreeButt").click(function(event) {
                    event.preventDefault();
                    //若目录树页面还未创建，则创建该页面
                    if ($("#dirTreePanel").length == 0) {
                        SetEnclosure.GetAllDir(); //调接口，获取围栏树目录结构
                    } else {
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
                    }

                    //计算面板位置
                    var left = parseInt($("#enclosureAttribute").css("left")) + 60;
                    var top = parseInt($("#enclosureAttribute").css("top")) + 81;
                    $("#dirTreePanel").css({
                        "left": left,
                        "top": top
                    }); //设置目录树面板位置
                });

                //关闭属性编辑页面
                $("#cancelEdit1").click(function(event) {
                    event.preventDefault();
                    $("#enclosureAttribute").hide();
                    if ($("#dirTreePanel").is(':visible')) {
                        $("#dirTreePanel").hide(); //隐藏目录树面板
                    }
                });

                //取消
                $("#cancelEdit2").click(function(event) {
                    event.preventDefault();
                    $("#enclosureAttribute").hide();
                    if ($("#dirTreePanel").is(':visible')) {
                        $("#dirTreePanel").hide(); //隐藏目录树面板
                    }
                });

                //确定
                $("#ensureEdit").click(function(event) {
                    event.preventDefault();
                    var showType = parseInt($("#ensureEdit").attr("showType"));

                    if (showType != 3) {
                        var name = $("#ecName").val(); //名称
                        var directory = $("#ecDir")[0].innerHTML; //目录
                        var directoryID = $("#ecDir").attr("key"); //目录ID
                        var color = $("#ecColor").val(); //颜色
                        var remark = $("#ecRemark").val(); //备注
                        var ecID = $("#ecName").attr("enclosureID");

                        if (name == "" || directory == "" || color == "") {
                            alert(i18n.t('gismodule.enclosureManage.alert13'));
                            return;
                        }

                        //新建围栏
                        if (showType == 1) {
                            //调用后台服务新建围栏接口
                            SetEnclosure.CreateEnclosure(name, directoryID, color, remark, $(this).attr("graphicData"), $(this).attr("graphicType"));
                        }

                        //属性编辑
                        if (showType == 2) {
                            //调用后台服务编辑围栏属性接口
                            SetEnclosure.ModidfyEnclosureAttr(ecID, name, directoryID, color, remark);
                        }
                    }

                    $("#enclosureAttribute").hide();
                    if ($("#dirTreePanel").is(':visible')) {
                        $("#dirTreePanel").hide(); //隐藏目录树面板
                    }
                });

                //移动
                $(".attributeTitle-style").mousedown(function(e) {
                    attrPanelMove = true;

                    //计算属性面板左上角的坐标
                    var panelLeft = parseInt($("#enclosureAttribute").css("left"));
                    var panelTop = parseInt($("#enclosureAttribute").css("top"));

                    //计算点击点坐标
                    var clickLeft = e.pageX;
                    var clickTop = e.pageY;

                    //计算点击的点距离属性面板左上角的偏移量
                    offset_x = clickLeft - panelLeft;
                    offset_y = clickTop - panelTop;
                });
                $(document).mousemove(function(e) {
                        if (attrPanelMove) {
                            //根据移动的位置，设置属性面板左上角坐标
                            $("#enclosureAttribute").css({
                                "left": e.pageX - offset_x,
                                "top": e.pageY - offset_y
                            });

                            if ($("#dirTreePanel").is(':visible')) {
                                //计算目录树面板位置
                                var left = parseInt($("#enclosureAttribute").css("left")) + 60;
                                var top = parseInt($("#enclosureAttribute").css("top")) + 81;
                                $("#dirTreePanel").css({
                                    "left": left,
                                    "top": top
                                }); //设置目录树面板位置
                            }
                        }
                    })
                    .mouseup(function(e) {
                        if (!attrPanelMove) return;
                        attrPanelMove = false;
                    })
            }

            if ($("#enclosureAttribute").is(':visible')) {
                $("#enclosureAttribute").hide();
            }

            $("#ecName").removeAttr("readonly"); //删除名称的只读属性
            $("#ecDir").css("width", "153px"); //修改目录框长度
            $("#dirTreeButt").show(); //显示目录选择下拉列表
            $("#ecColor").removeAttr("disabled"); //删除颜色的不可编辑属性
            $("#ecRemark").removeAttr("readonly"); //删除备注的只读属性
            $("#cancelEdit2").show(); //设置取消按钮为显示状态
            $("#ensureEdit").removeAttr("graphicData"); //删除确定按钮中的围栏图形数据信息
            $("#ensureEdit").removeAttr("graphicType"); //删除确定按钮中的围栏图形类型信息

            switch (type) {
                case 1:
                    $("#attrOptTitle")[0].innerHTML = i18n.t('gismodule.enclosureManage.operateType.newEnclosure');
                    $("#ensureEdit").attr("showType", "1");
                    $("#ensureEdit").attr("graphicData", graphicData);
                    $("#ensureEdit").attr("graphicType", graphicType);
                    break;
                case 2:
                    $("#attrOptTitle")[0].innerHTML = i18n.t('gismodule.enclosureManage.operateType.editProperty');
                    $("#ensureEdit").attr("showType", "2");
                    $("#ecDir").attr("key", directoryID);
                    break;
                case 3:
                    $("#attrOptTitle")[0].innerHTML = i18n.t('gismodule.enclosureManage.operateType.viewProperty');
                    $("#ensureEdit").attr("showType", "3");
                    $("#ecName").attr("readonly", "readonly"); //添加名称的只读属性
                    $("#ecDir").css("width", "165"); //修改目录框长度
                    $("#dirTreeButt").hide(); //隐藏目录选择下拉列表
                    $("#ecColor").attr("disabled", "disabled"); //添加颜色的不可编辑属性
                    $("#ecRemark").attr("readonly", "readonly"); //添加备注的只读属性
                    $("#cancelEdit2").hide(); //设置取消按钮为隐藏状态
                    break;
            }

            $("#ecName").val(name);
            $("#ecDir")[0].innerHTML = directory;
            $("#ecColor").val(color);
            $("#ecRemark").val(remark);
            $("#ecName").attr("enclosureID", enclosureID);

            //设置属性面板的位置并显示
            $("#enclosureAttribute").css({
                "top": $(window).height() / 2 - $("#enclosureAttribute").height() / 2,
                "left": $(window).width() / 2 - $("#enclosureAttribute").width() / 2
            }).show();
        };

        //定义目录树
        this._defineDirFancyTree = function(source) {
            //生成目录树
            function _createDirTreeInnerHtml() {
                var innerHtml =
                    '<div id="dirTreePanel" class="dirTreePanel-style">' +
                    '<div style="width: 200px;;height: 170px;">' +
                    '<div id="dirTree"></div>' +
                    '</div>' +
                    '<button id="cancelSetDir" style="float: right;">' + i18n.t('gismodule.enclosureManage.toolbarBtn.ok') + '</button>' +
                    '<button id="ensureSetDir" style="float: right;">' + i18n.t('gismodule.enclosureManage.toolbarBtn.cancel') + '</button>' +
                    '</div>';
                return innerHtml;
            }

            //双击树节点
            function doubleClick(event, data) {
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

            // $("#dialogContent").after(_createDirTreeInnerHtml()); //添加面板

            //加载目录树
            $("#dirTree").fancytree({
                source: source, //数据源
                imagePath: "../js/components/gisWidget/enclosureManageModule/fancyTree/image/", //设置树节点图片路径
                dblclick: doubleClick, //双击事件
                autoScroll: true,
            });

            //定义事件---取消
            // $("#cancelSetDir").click(function(event) {
            //     event.preventDefault();
            //     $("#dirTreePanel").hide();
            // });
            //定义事件---确定
            // $("#ensureSetDir").click(function(event) {
            //     event.preventDefault();
            //     //获取选中节点信息
            //     var node = $("#dirTree").fancytree("getActiveNode");
            //     var key = node.key;
            //     var dic = "\\" + node.title;
            //     while (node.parent.title != "root") {
            //         node = node.parent;
            //         dic = "\\" + node.title + dic;
            //     }

            //     //修改路径，记录目录ID
            //     $("#ecDir").attr("key", key);
            //     $("#ecDir")[0].innerHTML = dic;
            //     $("#dirTreePanel").hide();
            // });
        }

        this.initialize = function() {
            $("#tree").fancytree({
                    checkbox: true, //设置显示复选框
                    selectMode: 3, //设置选中模式（当父节点选中时，子节点全部选中）
                    imagePath: "../js/components/gisWidget/enclosureManageModule/fancyTree/image/", //设置树节点图片路径
                    lazyLoad: lazyLoad, //延时加载
                    loadError: loadError, //延时加载时，获取数据失败，加载错误信息
                    select: fancytreeSelect,
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
                            if (node.parent.title == "root") return;
                            if (node.folder) node.editStart();
                            else {
                                SetEnclosure.QueryEnclosureAttribute(node.key, 2); //调后台接口，获取属性信息
                            }
                            break;
                        case "remove": //删除
                            if (node.parent.title == "root") return;
                            //调用后台服务，删除节点
                            SetEnclosure.DelNode(node.key, node.folder);
                            break;
                        case "queryAttribute":
                            if (node.folder) return;
                            SetEnclosure.QueryEnclosureAttribute(node.key, 3); //调后台接口，获取属性信息
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
                    title: i18n.t('gismodule.enclosureManage.treeMenu.newDir') + " <kbd>[Ctrl+D]</kbd>",
                    cmd: "addChild",
                    uiIcon: "my-ui-icon-newDir",
                    disabled: true
                }, {
                    title: i18n.t('gismodule.enclosureManage.treeMenu.edit') + " <kbd>[Ctrl+E]</kbd>",
                    cmd: "edit",
                    'uiIcon': 'my-ui-icon-edit'
                }, {
                    title: i18n.t('gismodule.enclosureManage.treeMenu.delete') + " <kbd>[Del]</kbd>",
                    cmd: "remove",
                    uiIcon: "my-ui-icon-del"
                }, {
                    title: i18n.t('gismodule.enclosureManage.treeMenu.property') + " <kbd>[Ctrl+Q]</kbd>",
                    cmd: "queryAttribute",
                    uiIcon: "my-ui-icon-attribute",
                    disabled: true
                }],
                beforeOpen: beforeOpen, //定义在菜单展现之前的操作
                select: contextMenuSelect //定义选中菜单中的项的操作
            });
        }
    }

}(window, document));