define("module/gis/enclosureBoxModule", [
    "./enclosureTree",
    "./enclosureDrawCircle",
    "./enclosureDrawRect",
    "./enclosureDrawPolygon",
    'nova-notify',
    "jquery",
    "underscore",
], function(tree, Circle, Rect, Polygon, Notify) {
    var USERID; //当前登录的用户ID
    var gisServer;
    var map;
    var layerFields = {}; //2016-10-26 layer fields map
    var pointsLayer = {}; //2016-10-25 query layer in enclosure

    function init(options) {
        gisServer = options.gisServer;
        USERID = options.userID;
        map = options.map;
        _getRootID(USERID);
    }

    //后台服务接口——获取对应用户的根节点ID（用户ID）
    function _getRootID(userId) {
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
                $('#boxes').append('<div id="enclosureBox" tabindex="-1"></div>');
                $('#enclosureBox').append("<span id='closeOffBox'><i class='fa fa-times'></i></span>");
                $('#enclosureBox').append(_createPanelInnerHtml(result));
                _createMapMenuInnerHtml('enclosureBox');
                tree.init({
                    map: map,
                    gisServer: gisServer,
                    rootID: result,
                    pointsLayer: pointsLayer,
                    userID: userId
                });
                _initGraphicOperation(map, tree);
                _initEvent(map);
            },
            error: function(result) {
                // alert(i18n.t('gismodule.enclosureManage.alert1'))
                Notify.show({
                    title: i18n.t('gismodule.enclosureManage.alert1'),
                    type: "warning"
                });
            }
        });
        $.ajaxSettings.async = true;
    }

    //初始化围栏图形操作对象
    function _initGraphicOperation(map, setEnclosure) {
        var menu = document.getElementById("mapMenu");
        menu.enclosureNum = 0;
        drawRect = new Rect.MyDrawRectangle({
            enclosureObj: setEnclosure
        }, menu); //四边形对象
        drawRect.addTo(map);

        drawCircle = new Circle.MyDrawCircle({
            enclosureObj: setEnclosure
        }, menu); //圆形对象
        drawCircle.addTo(map);

        drawPolygon = new Polygon.MyDrawPolygon({
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
    }

    //初始化事件
    function _initEvent(map) {
        $("#enclosureBox").on("click", "#closeOffBox", function() {
                $("#enclosureBox").hide();
            })
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
                async: true,
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
                            async: true,
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
                                    // alert(msg);
                                    Notify.show({
                                        title: msg,
                                        type: "warning"
                                    });
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
                        async: true,
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
    }

    //生成围栏面板的HTML
    function _createPanelInnerHtml(rootID) {
        var innerHtml =
            // '<div class="enclosure-group-title">' +
            // '<label style="position: absolute;top:8px;left: 5px;">' + i18n.t('gismodule.enclosureManage.title') + '</label>' +
            // '<img id="hideEnclosurePanel" src="../js/components/gisWidget/enclosureManageModule/image/remove-icon-small.png" style="position: absolute;top:10px;right: 8px;cursor: pointer;">' +
            // '</div>' +

            '<div class="enclosure-group-body blue-scoll-bar">' +
            // '<div style="background-color: aliceblue;border: 1px solid aliceblue;margin: 5px;">' +
            // '<img id="circle" class="circle-style" title="' + i18n.t('gismodule.enclosureManage.toolbarBtn.circle') + '" src="../js/components/gisWidget/enclosureManageModule/image/circle.png"/>' +
            // '<img id="rectangle" class="rectangle-style" title="' + i18n.t('gismodule.enclosureManage.toolbarBtn.rectangle') + '" src="../js/components/gisWidget/enclosureManageModule/image/rectangle.png"/>' +
            // '<img id="polygon" class="polygon-style" title= "' + i18n.t('gismodule.enclosureManage.toolbarBtn.polygon') + '" src="../js/components/gisWidget/enclosureManageModule/image/polygon.png"/>' +
            // '</div>' +
            '<div>' +
            '<div style="position: relative; width: 238px; left: 55px; top: 5px; background: #FFFFFF;padding: 5px;">' +
            '<table><tbody>' +
            '<tr>' +
            '<td style="padding-left: 12px;padding-right: 12px">' +
            '<div id="circle" style="cursor: pointer">' +
            '<img style="vertical-align: middle;width: 24px;height: 24px" title="' + i18n.t('gismodule.enclosureManage.toolbarBtn.circle') + '" src="../js/components/gisWidget/enclosureManageModule/image/circle.png">' +
            '<span>' + i18n.t('gismodule.enclosureManage.toolbarBtn.circle') + '</span>' +
            '</div>' +
            '</td>' +
            '<td style="padding-left: 12px;padding-right: 12px">' +
            '<div id="rectangle" style="cursor: pointer">' +
            '<img style="vertical-align: middle;width: 24px;height: 24px" title="' + i18n.t('gismodule.enclosureManage.toolbarBtn.rectangle') + '" src="../js/components/gisWidget/enclosureManageModule/image/rectangle.png">' +
            '<span>' + i18n.t('gismodule.enclosureManage.toolbarBtn.rectangle') + '</span>' +
            '</div>' +
            '</td>' +
            '<td style="padding-left: 12px;padding-right: 12px">' +
            '<div id="polygon" style="cursor: pointer">' +
            '<img style="vertical-align: middle;width: 24px;height: 24px" title="' + i18n.t('gismodule.enclosureManage.toolbarBtn.polygon') + '" src="../js/components/gisWidget/enclosureManageModule/image/polygon.png">' +
            '<span>' + i18n.t('gismodule.enclosureManage.toolbarBtn.polygon') + '</span>' +
            '</div>' +
            '</td>' +
            '</tr>' +
            '</tbody></table>' +
            '</div>' +
            '</div>' +
            '<div id="enclosureList" class="enclosureList-style">' +
            '<div id="tree">' +
            // '<ul><li id="' + rootID + '" class="lazy folder" data-json=\'{"icon": "branch_16_p.png"}\'>' + i18n.t('gismodule.enclosureManage.dirName') + '</ul>' +
            '</div>' +
            '</div>' +
            '</div>';
        return innerHtml;
    }

    //生成右键菜单Html
    function _createMapMenuInnerHtml(panelParentID) {
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
            '<div style="float: left;width: 25px;"><img src="../js/components/gisWidget/enclosureManageModule/image/mapMenu/error_16_p.png" style="height: 16px;width: 16px;"></div>' +
            '<div style="float:left;font-size: 12px;height: 16px;margin-top: 2px;">' + i18n.t('gismodule.enclosureManage.mapMenu.clear') + '</div>' +
            '</td>' +
            '</tr>' +
            // '<tr class="mapMenu-oneItem" id="searchByShape">' +
            // '<td>' +
            // '<div style="float: left;width: 25px;"><img src="../js/components/gisWidget/enclosureManageModule/image/mapMenu/find_text_16_p.png" style="height: 16px;width: 16px;"></div>' +
            // '<div style="float:left;font-size: 12px;height: 16px;margin-top: 2px;">围栏内离线查询</div>' +
            // '</td>' +
            // '</tr>' +
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
        _getAllLayerInfo(innerHtml, panelParentID);
    }

    function _getAllLayerInfo(layerItemMenuHtml, panelParentID) {
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
                for (var i = 0; i < layerIDs.length; i++) {
                    _getLayerFields(layerIDs[i]);
                }
            },
            error: function(errorMsg) {
                // alert(i18n.t('gismodule.LayerManager.fancyTree.alert4'));
                Notify.show({
                    title: i18n.t('gismodule.LayerManager.fancyTree.alert4'),
                    type: "warning"
                });
                source = "";
                obj = {};
            }
        });
    }

    function _getLayerFields(layerID) {
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
                // alert(i18n.t('gismodule.LayerManager.importData.alert9'));
                Notify.show({
                    title: i18n.t('gismodule.LayerManager.importData.alert9'),
                    type: "warning"
                });
            }
        });
    }

    function hideBox() {
        $('#enclosureBox').hide();
        tree.clearShapes();
    }

    return {
        init: init,
        hideBox: hideBox
    }
});