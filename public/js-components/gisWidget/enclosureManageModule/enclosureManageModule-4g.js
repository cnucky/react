/**
 * Created by zhangxinyue on 2016/4/6.
 */
(function(window, document, undefined) {
    var USERID; //当前登录的用户ID
    var Dialog; //dialog对象
    var Notify; //notify对象
    var drawRect; //四边形对象
    var drawCircle; //圆形对象
    var drawPolygon; //多边形对象
    var SetEnclosure; //_setEnclosureInfo_4g对象
    var enclosureServer; //服务器地址
    var shapeDic; //图形字典，用于存储图形和对应基站
    var BSLayer; //基站显示图层
    var drawnItems; //围栏图层
    var BSLimited; //一次最多框选的基站数量
    var callback; //回调函数
    var carriers={};
    var carrierNames={};

    function _setEnclosureInfo_4g(options) {
        this.options = options;
        enclosureServer = options.enclosureServer;
        searchRecords = [];
        //Dialog = options.Dialog;
        Notify = options.Notify;
        BSLimited = options.BSLimited;
        callback = options.Callback;
    }

    //构造函数
    setEnclosureInfo_4g = function(options, userID) {
        USERID = userID;
        return new _setEnclosureInfo_4g(options);

    };

    _setEnclosureInfo_4g.prototype = {
        //初始化方法
        initialize: function(toolbar, setEnclosure) {
            this._container = toolbar._container;
            var map = this.map = toolbar._map;
            SetEnclosure = setEnclosure; //获取围栏管理类对象
            searchRecords = [];
            shapeDic = [];
            this._addPanel();
            this._initGraphicOperation(map, setEnclosure); //初始化围栏图形操作对象
            this._initEvent(); //初始化事件

            //定义dialog
            Dialog = new _defineDialog();
            Dialog.initialize();

            this._getCarriers();
        },

        _getCarriers:function(){
            $.ajax({
                url: '/datasearch/datasearch/get_carriers',
                type: 'POST',
                async: true,
                data: {},
                dataType: 'json',
                success: function (rsp) {

                    for(var i = 0; i<rsp.length;i++){
                        carriers[rsp[i].key] = rsp[i].value;
                        carrierNames[rsp[i].value] = rsp[i].key;
                    }

                }

            });
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

            BSLayer = new L.FeatureGroup(); //基站图层
            map.addLayer(BSLayer);
            drawnItems = new L.FeatureGroup(); //定义图层
            map.addLayer(drawnItems);
            map.on('draw:created', function(e) {
                var type = e.layerType,
                    layer = e.layer;
                drawnItems.addLayer(layer);
                //查询图形内的基站并添加显示
                SetEnclosure._queryBS(layer, type, map);
                SetEnclosure.ShowBSDetailTable();
            });
            map.on('draw:deleted', function(e) {
                var type = e.layerType,
                    layer = e.layer;
                //删除图形内的基站
                document.getElementById("BSInfoPanel").style.display = 'block';
                SetEnclosure._deleteBS(layer, type, map);
                SetEnclosure.ShowBSDetailTable();
            });
            map.on('draw:changed', function(e) {
                var type = e.layerType,
                    newLayer = e.newLayer,
                    oldLayer = e.olderLayer;
                //更改图形内的基站
                SetEnclosure._changeBS(newLayer, oldLayer, type, map);
                SetEnclosure.ShowBSDetailTable();
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

        //获取基站信息
        getRecords: function() {
            if (document.getElementById("BSInfoPanel").innerHTML == '') {} else {
                $('#BSInfoList tr').each(function(trindex, tritem) {
                    if ($(tritem).hasClass("checkbox-checked")) {
                        var operatorName = $(tritem).children()[3].innerText;
                        var operatorCode = SetEnclosure._operatorCode(operatorName);
                        var lac = $(tritem).children()[1].innerText;
                        var ci = $(tritem).children()[2].innerText;
                        searchRecords.push([operatorCode, operatorName, lac, ci]);
                    }
                });
            }
            if (searchRecords.length == 0) {
                //alert("未选择任何基站！");
                Notify.show({
                    title: i18n.t('gismodule.enclosureManageModule.notify.title'),
                    type: "warning",
                    text: i18n.t('gismodule.enclosureManageModule.notify.text')
                }); 
            }
            return searchRecords;
        },


        _operatorName: function(code) {
            if(code in carriers){
                return carriers[code];
            }
            else{
                console.log('can not match carrier code!');
                return 'undefined'
            }
            //var tempName = carriers[code];
            //switch(code)
            //{
            //    case '0':tempName = i18n.t('gismodule.common.carriers.unknow');
            //        break;
            //    case '1':tempName = i18n.t('gismodule.common.carriers.cmcc');
            //        break;
            //    case '2':tempName = i18n.t('gismodule.common.carriers.cucc');
            //        break;
            //    case '3':tempName = i18n.t('gismodule.common.carriers.ctc');
            //        break;
            //    case '4':tempName = i18n.t('gismodule.common.carriers.crc');
            //        break;
            //    case '5':tempName = i18n.t('gismodule.common.carriers.cnc');
            //        break;
            //    default:tempName = i18n.t('gismodule.common.carriers.unknow');
            //}
            //return tempName;
        },

        _operatorCode: function(name) {
            if(name in carrierNames){
                return carrierNames[name];
            }
            else{
                console.log('can not match carrier name!');
                return 'undefined'
            }
            //var tempName = carrierNames[name];
            //switch(name)
            //{
            //    case i18n.t('gismodule.common.carriers.unknow'):tempName = '0';
            //        break;
            //    case i18n.t('gismodule.common.carriers.cucc'):tempName = '1';
            //        break;
            //    case i18n.t('gismodule.common.carriers.cucc'):tempName = '2';
            //        break;
            //    case i18n.t('gismodule.common.carriers.ctc'):tempName = '3';
            //        break;
            //    case i18n.t('gismodule.common.carriers.crc'):tempName = '4';
            //        break;
            //    case i18n.t('gismodule.common.carriers.cnc'):tempName = '5';
            //        break;
            //    default:
            //        tempName = '0';
            //}
            //return tempName;
        },

        //（私有）添加图层面板上的元素
        _addPanel: function() {
            //添加工具栏
            this._container.innerHTML = this._createToolbarInnerHtml();
            //添加基站信息面板
            var parentId = document.getElementById(this.options.panelParentID);
            parentId.innerHTML = '<div id = "BSInfoPanel"></div>';
            //            $("#" + this.options.panelParentID).after(this._createMapMenuInnerHtml());
            document.getElementById("menu-panel").innerHTML = this._createMapMenuInnerHtml();
        },

        //初始化事件
        _initEvent: function() {
            //圆形围栏点击事件
            $("#circle").click(function(event) {
                event.preventDefault();
                //改变按钮状态
                if ($("#rectangle").hasClass("item-active"))
                    $("#rectangle").removeClass("item-active");
                if ($("#polygon").hasClass("item-active"))
                    $("#polygon").removeClass("item-active");
                if ($("#circle").hasClass("item-active"))
                    $("#circle").removeClass("item-active");
                if (drawRect.isEnabled) {
                    drawRect.disabled();
                }
                if (drawPolygon.isEnabled) {
                    drawPolygon.disabled();
                }
                if (drawCircle.isEnabled) {
                    drawCircle.disabled();
                } else {
                    drawCircle.enabled(); //设置圆形围栏可用状态
                    $(this).addClass("item-active");
                }
            });
            //四边形围栏点击事件
            $("#rectangle").click(function(event) {
                event.preventDefault();
                //改变按钮状态
                if ($("#rectangle").hasClass("item-active"))
                    $("#rectangle").removeClass("item-active");
                if ($("#polygon").hasClass("item-active"))
                    $("#polygon").removeClass("item-active");
                if ($("#circle").hasClass("item-active"))
                    $("#circle").removeClass("item-active");
                if (drawCircle.isEnabled) {
                    drawCircle.disabled();
                }
                if (drawPolygon.isEnabled) {
                    drawPolygon.disabled();
                }
                if (drawRect.isEnabled) {
                    drawRect.disabled();
                } else {
                    drawRect.enabled(); //设置围栏可用状态
                    $(this).addClass("item-active");
                }
            });
            //多边形围栏点击事件
            $("#polygon").click(function(event) {
                event.preventDefault();
                //改变按钮状态
                if ($("#rectangle").hasClass("item-active"))
                    $("#rectangle").removeClass("item-active");
                if ($("#polygon").hasClass("item-active"))
                    $("#polygon").removeClass("item-active");
                if ($("#circle").hasClass("item-active"))
                    $("#circle").removeClass("item-active");
                if (drawRect.isEnabled) {
                    drawRect.disabled();
                }
                if (drawCircle.isEnabled) {
                    drawCircle.disabled();
                }
                if (drawPolygon.isEnabled) {
                    drawPolygon.disabled();
                } else {
                    drawPolygon.enabled(); //设置围栏可用状态
                    $(this).addClass("item-active");
                }
            });

            //地图右击菜单相关事件
            $("#map").bind("contextmenu", function() {
                return false;
            });
            $("#mapMenu").bind("contextmenu", function() {
                return false;
            });
        },

        //生成工具条内部HTML
        _createToolbarInnerHtml:function(){
            var innerHtml = '<div style="border: 1px solid:#e2e2e2;background: #FFFFFF;box-shadow: 1px 2px 1px;padding: 5px;border-radius: 3px">'+
                                '<table>' +
                                    '<tr>'+
                                        '<td style="padding-left: 12px;padding-right: 12px">'+
                                            '<div id="circle" style="cursor: pointer">'+//type="button" class="btn btn-primary btn-gradient btn-alt btn-block btn-xs"
                                                '<img  style="width: 24px;height: 24px" title="'+i18n.t('gismodule.enclosureManageModule.enclosuretoolbar.drawcircle')+'" src="../js/components/gisWidget/enclosureManageModule/image/circle.png"/>' +
                                                '<span>'+i18n.t('gismodule.enclosureManageModule.enclosuretoolbar.circle')+'</span>'+
                                            '</div>'+
                                        '</td>'+
                                        '<td style="padding-left: 12px;padding-right: 12px">'+
                                            '<div id="rectangle" style="cursor: pointer">'+//type="button" class="btn btn-primary btn-gradient btn-alt btn-block btn-xs"
                                                '<img  style="width: 24px;height: 24px" title="'+i18n.t('gismodule.enclosureManageModule.enclosuretoolbar.drawrectangle')+'" src="../js/components/gisWidget/enclosureManageModule/image/rectangle.png"/>' +
                                                '<span>'+i18n.t('gismodule.enclosureManageModule.enclosuretoolbar.rectangle')+'</span>'+
                                            '</div>'+
                                        '</td>'+
                                        '<td style="padding-left: 12px;padding-right: 12px">'+
                                            '<div id="polygon" style="cursor: pointer">'+//type="button" class="btn btn-primary btn-gradient btn-alt btn-block btn-xs"
                                                '<img  style="width: 24px;height: 24px" title= "'+i18n.t('gismodule.enclosureManageModule.enclosuretoolbar.drawpolygon')+'" src="../js/components/gisWidget/enclosureManageModule/image/polygon.png"/>' +
                                                '<span>'+i18n.t('gismodule.enclosureManageModule.enclosuretoolbar.polygon')+'</span>'+
                                            '</div>'+
                                        '</td>'+
                                    '</tr>'+
                                '</table>'+
                            '</div>';
            return innerHtml;
        },

        //生成地图右键菜单内部Html
        _createMapMenuInnerHtml: function() {
            var innerHtml =
                '<div id="mapMenu" class="mapMenuParent-style">' +
                    '<table class="mapMenu-style">' +
                        '<tr class="mapMenu-oneItem" id="popEdit">' +
                            '<td>' +
                                '<div style="float: left;width: 25px;"><img src="../js/components/gisWidget/enclosureManageModule/image/mapMenu/layout_center_16_p.png" style="height: 16px;width: 16px;"></div>' +
                                '<div style="float:left;font-size: 12px;height: 16px;margin-top: 2px;">'+i18n.t('gismodule.common.mapmenu.edit')+'</div>' +
                            '</td>' +
                        '</tr>' +
                        '<tr class="mapMenu-oneItem" id="popDelete">' +
                            '<td>' +
                                '<div style="float: left;width: 25px;"><img src="../js/components/gisWidget/enclosureManageModule/image/mapMenu/error_16_p.png" style="height: 16px;width: 16px;"></div>' +
                                '<div style="float:left;font-size: 12px;height: 16px;margin-top: 2px;">'+i18n.t('gismodule.common.mapmenu.delete')+'</div>' +
                            '</td>' +
                        '</tr>' +
                        '<tr class="mapMenu-oneItem" id="popSave">' +
                            '<td>' +
                                '<div style="float: left;width: 25px;"><img src="../js/components/gisWidget/enclosureManageModule/image/mapMenu/disk_blue_ok_16_p.png" style="height: 16px;width: 16px;"></div>' +
                                '<div style="float:left;font-size: 12px;height: 16px;margin-top: 2px;">'+i18n.t('gismodule.common.mapmenu.save')+'</div>' +
                            '</td>' +
                        '</tr>' +
                    '</table>' +
                '</div>';
            return innerHtml
        },

        //生成基站表
        _createBSDetailTable: function() {

            var innerHtml = '<div class="table-responsive">' +
                '<table class="table table-striped table-bordered table-hover dataTable no-footer" cellspacing="0" style="table-layout: fixed;margin-left: 0px;border-collapse: inherit !important;margin-top: 0px !important;margin-bottom: 0px !important;" width="100%" role="grid">'+
                '<thead>'+
                '<tr role="row" class="checkbox-checked">'+
                '<th class="sorting_disabled" rowspan="1" colspan="1" style="width: 30px;padding-left: 9px !important;padding-right: 9px !important;" aria-label="'+i18n.t('gismodule.enclosureManageModule.BSDetailTable.selectAll')+'">'+
                '<label class="checkbox-in-tool" style="margin-left: 5px;margin-top: -10px;margin-bottom: -10px"></label></th>'+
                '<th class="sorting_disabled" rowspan="1" colspan="1" style="width: 40px;padding-left: 9px !important;padding-right: 9px !important;" aria-label="LAC">LAC</th>'+
                '<th class="sorting_disabled" rowspan="1" colspan="1" style="width: 40px;padding-left: 9px !important;padding-right: 9px !important;" aria-label="CI">CI</th>'+
                '<th class="sorting_disabled" rowspan="1" colspan="1" style="width: 70px;padding-left: 9px !important;padding-right: 9px !important;" aria-label="'+i18n.t('gismodule.enclosureManageModule.BSDetailTable.carrier')+'">'+i18n.t('gismodule.enclosureManageModule.BSDetailTable.carrier')+'</th>'+
                '<th class="sorting_disabled" rowspan="1" colspan="1"  aria-label="'+i18n.t('gismodule.enclosureManageModule.BSDetailTable.description')+'">'+i18n.t('gismodule.enclosureManageModule.BSDetailTable.description')+'</th>'+
                '</tr>'+
                '</thead>'+
                '<tbody id="BSInfoList">';

            var i = 0,
                j = 0;
            var len = shapeDic.length;
            for (i; i < len; i++) {
                var jlen = shapeDic[i].BS.length;
                for (j; j < jlen; j++) {
                    var operateName = SetEnclosure._operatorName(shapeDic[i].BS[j].operator);
                    var tempHtml = '<tr role="row" class="checkbox-checked">' +
                        '<td><label class="checkbox-in-table" style="margin-left: 5px;margin-top: -10px;margin-bottom: -10px"></label></td>' +
                        '<td>' + shapeDic[i].BS[j].LAC + '</td>' +
                        '<td>' + shapeDic[i].BS[j].CI + '</td>' +
                        '<td>' + operateName + '</td>' +
                        '<td>' + shapeDic[i].BS[j].name + '</td>' +
                        '</tr>';
                    innerHtml += tempHtml;
                }
            }

            innerHtml += '</tbody>' +
                '</table>' +
                '</div>';
            return innerHtml;
        },

        //修改围栏内基站显示
        _changeBS: function(newLayer, oldLayer, layerType, map) {
            var shapeType;
            var shape;
            if (layerType == 'circle') {
                shapeType = '1';
                shape = JSON.stringify({
                    center: [newLayer.getLatLng().lat, newLayer.getLatLng().lng],
                    radius: newLayer.getRadius()
                });
            } else if (layerType == 'rectangle') {
                shapeType = '3';
                var xys = [];
                var latlngs = newLayer.getLatLngs();
                for (var i = 0; i < latlngs.length; i++) {
                    xys.push([latlngs[i].lat, latlngs[i].lng]);
                }
                shape = JSON.stringify({
                    latlngs: xys
                });
            } else {
                shapeType = '2';
                var xys = [];
                var latlngs = newLayer.getLatLngs();
                for (var i = 0; i < latlngs.length; i++) {
                    xys.push([latlngs[i].lat, latlngs[i].lng]);
                }
                shape = JSON.stringify({
                    latlngs: xys
                });
            }

            //删除原来图形的基站
            for (i = 0; i < shapeDic.length; i++) {
                if (shapeDic[i].shape == oldLayer && shapeDic[i].shapeType == shapeType) {
                    for (j = 0; j < shapeDic[i].BS.length; j++) {
                        BSLayer.removeLayer(shapeDic[i].BS[j].point);
                    }
                    shapeDic.splice(i, 1);
                    break;
                }
            }
            //添加新图形的基站
            var FailedCallback = function() {
                map.removeLayer(newLayer);
            };
            shapeDic.push({"shape":shape,"shapeType":shapeType,"BS":[]});
            SetEnclosure._queryBaseStationByGraphic('0',shape,shapeType,'经度','纬度','LAC','CI','名称','运营商','1','100','',FailedCallback);//服务请求参数不需要转成英文
        },

        //删除围栏内基站
        _deleteBS: function(layer, layerType, map) {
            var shapeType;
            var shape;
            if (layerType == 'circle') {
                shapeType = '1';
                shape = JSON.stringify({
                    center: [layer.getLatLng().lat, layer.getLatLng().lng],
                    radius: layer.getRadius()
                });
            } else if (layerType == 'rectangle') {
                shapeType = '3';
                var xys = [];
                var latlngs = layer.getLatLngs();
                for (var i = 0; i < latlngs.length; i++) {
                    xys.push([latlngs[i].lat, latlngs[i].lng]);
                }
                shape = JSON.stringify({
                    latlngs: xys
                });
            } else {
                shapeType = '2';
                var xys = [];
                var latlngs = layer.getLatLngs();
                for (var i = 0; i < latlngs.length; i++) {
                    xys.push([latlngs[i].lat, latlngs[i].lng]);
                }
                shape = JSON.stringify({
                    latlngs: xys
                });
            }
            for (i = 0; i < shapeDic.length; i++) {
                if (shapeDic[i].shape == shape && shapeDic[i].shapeType == shapeType) {
                    for (j = 0; j < shapeDic[i].BS.length; j++) {
                        BSLayer.removeLayer(shapeDic[i].BS[j].point);
                    }
                    shapeDic.splice(i, 1);
                    break;
                }
            }
        },

        //查询围栏内基站
        _queryBS: function(layer, layerType, map) {
            var shapeType;
            var shape;
            if (layerType == 'circle') {
                shapeType = '1';
                shape = JSON.stringify({
                    center: [layer.getLatLng().lat, layer.getLatLng().lng],
                    radius: layer.getRadius()
                });
            } else if (layerType == 'rectangle') {
                shapeType = '3';
                var xys = [];
                var latlngs = layer.getLatLngs();
                for (var i = 0; i < latlngs.length; i++) {
                    xys.push([latlngs[i].lat, latlngs[i].lng]);
                }
                shape = JSON.stringify({
                    latlngs: xys
                });
            } else {
                shapeType = '2';
                var xys = [];
                var latlngs = layer.getLatLngs();
                for (var i = 0; i < latlngs.length; i++) {
                    xys.push([latlngs[i].lat, latlngs[i].lng]);
                }
                shape = JSON.stringify({
                    latlngs: xys
                });
            }
            var FailedCallback = function() {
                map.removeLayer(layer);
            };
            shapeDic.push({"shape":shape,"shapeType":shapeType,"BS":[]});
            SetEnclosure._queryBaseStationByGraphic('0',shape,shapeType,'经度','纬度','LAC','CI','名称','运营商','1','100','',FailedCallback);
        },

        //根据围栏获取基站
        _queryBaseStationByGraphic: function(featureID, shape, shapeType, requireFields1, requireFields2, requireFields3, requireFields4, requireFields5, requireFields6, pageNo, pageSize, searchID, callback) {
            var data = {
                hostname: enclosureServer,
                path: '/GisService/search/spatialQuery',
                featureID: featureID,
                pageNo: pageNo,
                pageSize: pageSize,
                shapeType: shapeType,
                shape: shape,
                requireFields: [requireFields1, requireFields2, requireFields3, requireFields4, requireFields5, requireFields6]
            };
            $.ajaxSettings.async = false;
            $.ajax({
//                type:'GET',
//                url:enclosureServer+'/GisService/search/spatialQuery?featureID='+featureID+'&shape='+shape+'&shapeType='+shapeType+'&requireFields='+requireFields1+'&requireFields='+requireFields2+'&requireFields='+requireFields3+'&requireFields='+requireFields4+'&requireFields='+requireFields5+'&requireFields='+requireFields6+'&pageNo='+pageNo+'&pageSize='+pageSize+'&searchID='+searchID,
//                dataType: 'json',
                type: 'GET',
                url: '/gisapi/gisGetQuery',
                data: data,
                conditions: data,
                async:false,
                dataType: 'json',
                success: function(result) {
                    if (result.currentPageNo == '1' && result.pageSize * result.totalPage > BSLimited) {
                        //alert("基站数量太多，请缩小范围!");
                        Notify.show({
                            title: i18n.t('gismodule.enclosureManageModule.notify.title'),
                            type: "warning",
                            text: i18n.t('gismodule.enclosureManageModule.notify.text2')
                        });
                        callback();
                        return;
                    }
                    //基站点位展示在地图上
                    for (j = 0; j < shapeDic.length; j++) {
                        if (shapeDic[j].shape == shape && shapeDic[j].shapeType == shapeType) {
                            for (l = 0; l < result.records.length; l++) {
                                var myicon = L.divIcon({
                                    className: 'marker-icon',
                                    iconSize: [4, 4]
                                });
                                var point = L.marker([result.records[l][1], result.records[l][0]], {
                                    icon: myicon
                                })

                                BSLayer.addLayer(point);
                                shapeDic[j].BS.push({
                                    "point": point,
                                    "name": result.records[l][4],
                                    "LAC": result.records[l][2],
                                    "CI": result.records[l][3],
                                    "operator": result.records[l][5]
                                });
                            }
                            break;
                        }
                    }
                    if (result.totalPage != '1' && result.currentPageNo == '1') {
                        for (i = 2; i <= result.totalPage; i++) {
                            SetEnclosure._queryBaseStationByGraphic(featureID, shape, shapeType, requireFields1, requireFields2, requireFields3, requireFields4, requireFields5, requireFields6, i.toString(), pageSize, result.searchID, callback);
                        }
                    }
                },
                error: function(result) {
                    //alert("获取基站数据失败！");
                    Notify.show({
                        title: i18n.t('gismodule.enclosureManageModule.notify.title'),
                        type: "error",
                        text: i18n.t('gismodule.enclosureManageModule.notify.text3')
                    });
                    callback();
                }
            });
        },

        //显示框选基站的详细信息表格
        ShowBSDetailTable: function() {
            var BSNum = 0;
            for (var i = 0; i < shapeDic.length; i++) {
                BSNum += shapeDic[i].BS.length;
            }
            if (BSNum <= 0) {
                document.getElementById("out-panel").style.display = 'none';
                document.getElementById("BSInfoPanel").innerHTML = "";
                return;
            } else {
                if (document.getElementById("out-panel").style.display == 'none') {
                    document.getElementById("out-panel").style.display = 'block';
                    $("#out-panel").addClass("fadeInDown");
                    setTimeout(function() {
                        $("#out-panel").removeClass("fadeInDown");
                    }, 1000);
                }
            }

            var panel = Dialog.build({
                title: i18n.t('gismodule.enclosureManageModule.panel.title'),
                content: SetEnclosure._createBSDetailTable(),
                leftBtnCallback: function() {
                    drawnItems.clearLayers();
                    BSLayer.clearLayers();
                    shapeDic = [];
                    if (document.getElementById("out-panel").style.display == 'block')
                        document.getElementById("out-panel").style.display = 'none';
                },
                rightBtnCallback: function() {
                    callback();
                }
            });
            document.getElementById("BSInfoPanel").innerHTML = panel;
            $(".checkbox-in-table").on("click", function() {
                if ($(this).parent().parent("tr").hasClass("checkbox-checked"))
                    $(this).parent().parent("tr").removeClass("checkbox-checked");
                else
                    $(this).parent().parent("tr").addClass("checkbox-checked");

            });
            $(".checkbox-in-tool").on("click", function() {

                if ($(this).parent().parent("tr").hasClass("checkbox-checked")) {
                    //自身状态改变
                    $(this).parent().parent("tr").removeClass("checkbox-checked");
                    //所有元素状态改变
                    $('#BSInfoList tr').each(function(trindex, tritem) {
                        if ($(tritem).hasClass("checkbox-checked")) {
                            $(tritem).removeClass("checkbox-checked");
                        }
                    });
                } else {
                    //自身状态改变
                    $(this).parent().parent("tr").addClass("checkbox-checked");
                    //所有元素状态改变
                    $('#BSInfoList tr').each(function(trindex, tritem) {
                        if (!$(tritem).hasClass("checkbox-checked")) {
                            $(tritem).addClass("checkbox-checked");
                        }
                    });
                }
            });
            Dialog.show(function() {});
        }

    };

    //定义对话框
    _defineDialog = function() {
        var attrs;
        var source;
        var tpl;

        this.initialize = function() {
            tpl = _.template(this._createPanel());
        }

        this._createPanel = function() {
            var innerHtml =
                '<div class="panel">' +
                '<div class="panel-heading">' +
                '<span id="nv-dialog-title" class="panel-title"> <%= title %> </span>' +
                '</div>' +
                '<div id="nv-dialog-body" class="panel-body " style="height:400px; overflow-x: auto; overflow-y: auto; padding: 0px">' +
                '<%= content %>' +
                '</div>' +
                '<div class="panel-footer text-center" id="nv-dialog-footer" style="background-color: #FFFFFF;border: 0px">' +
                '<button id="nv-dialog-leftbtn" class="btn btn-default btn-sm" type="button" style="margin-right:15px;min-width:60px">' +
                '<%= leftBtn %>' +
                '</button>' +
                '<button id="nv-dialog-rightbtn" class="btn btn-primary btn-sm" type="button" style="min-width:60px">' +
                '<%= rightBtn %>' +
                '</button>' +
                '</div>' +
                '</div>';
            return innerHtml;
        }


        this.build = function(opts) {
            attrs = {
                title: opts.title || "",
                content: opts.content || "",
                leftBtn: opts.leftBtn || i18n.t('gismodule.enclosureManageModule.panel.cancle'),
                rightBtn: opts.rightBtn || i18n.t('gismodule.enclosureManageModule.panel.OK'),
                hideLeftBtn: opts.hideLeftBtn,
                hideRightBtn: opts.hideRightBtn,
                hideFooter: opts.hideFooter,
                minHeight: opts.minHeight,
                leftBtnCallback: opts.leftBtnCallback || function() {
                    document.getElementById("BSInfoPanel").style.display = 'block';
                },
                rightBtnCallback: opts.rightBtnCallback || function() {
                    document.getElementById("BSInfoPanel").style.display = 'block';
                },
                extraBtn: opts.extraBtn || [],
                extraListener: opts.extraListener || [],
                style: opts.style || 'basic', // ENUM(basic: 450px, sm: 300px, lg: 700px, xl: 1000px, full: 90%)
                width: opts.width || 0,
                minHeight: opts.minHeight,
                closeOnBgClick: opts.closeOnBgClick || true
            };
            source = tpl(attrs);
            return source;
        }

        this.show = function(callback) {
            callback();
            if (attrs.minHeight) {
                $('#nv-dialog-body').css('min-height', attrs.minHeight);
            }
            if (attrs.hideLeftBtn == true) {
                $('#nv-dialog-leftbtn').hide();
            };
            if (attrs.hideRightBtn == true) {
                $('#nv-dialog-rightbtn').hide();
            };
            if (attrs.hideFooter) {
                $('#nv-dialog-footer').hide();
            }
            $('#nv-dialog-leftbtn').on('click', attrs.leftBtnCallback);
            $('#nv-dialog-rightbtn').on('click', attrs.rightBtnCallback);

        }
    }

}(window, document));