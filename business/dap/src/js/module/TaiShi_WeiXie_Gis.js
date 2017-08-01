/**
 * Created by xuxiaogang on 2017/2/9.
 */
define([], function () {
    function TaiShi_Gis(options) {
        this.mapUrl = '/smartquery/tileMap?hostname=' + options.ip + '&x={x}&y={y}&z={z}';
    }

    TaiShi_Gis.prototype = {
        //设置任务信息
        setTask: function (options) {
            this.getHeatMap = options.getHeatMap;
            this.getCluster = options.getCluster;
            this.targetPopup = options.targetPopup;
            this.location = options.location; //[[30.2519,120.156],[30.2519,120.156]]
            if (this.map == undefined) {
                //初始化地图
                this.map = L.map('map', {
                    zoomControl: false,
                    attributionControl: false
                });
                L.tileLayer(this.mapUrl, {
                    maxZoom: 18
                }).addTo(this.map);
                this.map.setMaxBounds([
                    [-90, -180],
                    [90, 180]
                ]);
                this.init();
            } else {
                //更新目标分布图
                this.clusterLayer.clearLayers();
                this.getCluster();
                //更新热力图
                this.getHeatMap();
            }
            this.map.fitBounds(this.location);
        },
        //初始化地图
        init: function () {
            this.overlays = {};
            this.layers = {};
            this.overlays[''] = this.layers;
            this.layers['人口热力图'] = this._showGlobalHeatMap();
            this.layers['目标分布图'] = this._showClusterPoints();
            L.control.groupedLayers(null, this.overlays, {
                collapsed: false,
                position: "bottomleft"
            }).addTo(this.map);
        },
        _heatMap: function (rsps) {
            var dataSet = {};
            var data = [],
                max = 8;
            for (var i = 0; i < rsps.length; i++) {
                data.push({
                    lat: rsps[i]['lat'],
                    lng: rsps[i]['lng'],
                    count: 1
                }); //rsps[i]['count']
            }
            dataSet = {
                data: data,
                max: max
            };
            if (data.length > 0) {
                this.heatmap.setData(dataSet);
            }
        },

        //显示热力图
        _showGlobalHeatMap: function () {
            var cfg = {
                "radius": 0.0025, //0.005
                "maxOpacity": .8,
                "scaleRadius": true,
                "useLocalExtrema": false,
                latField: 'lat',
                lngField: 'lng',
                valueField: 'count'
            };
            var heatmapLayer = new HeatmapOverlay(cfg);
            heatmapLayer.addTo(this.map);

            this.heatmap = heatmapLayer;
            this.getHeatMap();
            //定时刷新热力图
            setInterval(
                this.getHeatMap.bind(this), 30 * 60 * 1000);
            return heatmapLayer;
        },

        _cluster: function (rsp) {
            for (var i = 0; i < rsp.length; i++) {
                var marker = L.marker([rsp[i]['lat'], rsp[i]['lng']], {
                    title: rsp[i]['name'] + '\n' + rsp[i]['time']
                }).addTo(this.clusterLayer);
                marker.msisdn = rsp[i]['target_id'];
                L.DomEvent.on(marker, 'click', function (e) {
                    this.targetPopup(e.target.msisdn);
                }, this);
            }
            this.clusterLayer.addTo(this.map);
        },
        //显示目标分布图（聚合展示）
        _showClusterPoints: function () {
            var markers_layer = new L.MarkerClusterGroup({});

            this.clusterLayer = markers_layer;
            this.getCluster();
            return markers_layer;
        }
    }

    function WeiXie_Gis(options) {
        this.mapUrl = '/smartquery/tileMap?hostname=' + options.ip + '&x={x}&y={y}&z={z}';
        this.ip = options.ip;

    }

    WeiXie_Gis.prototype = {
        //设置任务信息
        setTask: function (options) {
            this.getHeatMap = options.getHeatMap;
            this.getCluster = options.getCluster;
            this.targetPopup = options.targetPopup;
            //区域名称列表
            this.areanames = {};
            if (options.areanames instanceof Array) {
                var len = options.areanames.length;
                for (var i = 0; i < len; i++) {
                    this.areanames[options.areanames[i].name] = options.areanames[i].name;
                }
            }
            this.location = options.location; //[[30.2519,120.156],[30.2519,120.156]]
            if (this.map == undefined) {
                this.regionLayers = {}; //区域ID及图层字典列表
                this.regionMarkers = {}; //区域ID及图层中心点字典列表
                //目标活动相关
                this.actionsLayer = L.layerGroup();
                this.miniPointsLayer = L.layerGroup();
                //威胁相关
                this.threatsMap = {};
                this.autoLocateThreat = true;
                this.threatIDList = [];
                this.flag = false;
                this.id_index = 0;
                this.init();
            } else {
                //更新目标分布图
                this.clusterLayer.clearLayers();
                this.getCluster();
                //更新热力图
                this.getHeatMap();
                //更新区域信息
                for (var key in this.regionLayers) {
                    //从地图上清除老的区域
                    this.map.removeLayer(this.regionLayers[key]);
                }
                this.regionLayers = {};
                this._getRegions(this, '1');
                //更新鹰眼地图上区域点的信息
                for (var key in this.regionMarkers) {
                    this.miniMap._miniMap.removeLayer(this.regionMarkers[key]);
                }
                this.regionMarkers = {};
                //清除目标活动点的图层
                this.actionsLayer.clearLayers();
                this.miniPointsLayer.clearLayers();
                //清除威胁相关信息
                this.clearAllThreats();
                this.threatsMap = {};
                this.autoLocateThreat = true;
                this.threatIDList = [];
                this.flag = true;
                this.id_index = 0;
            }
            this.map.fitBounds(this.location);
        },
        init: function () {
            this.map = L.map('map', {
                zoomControl: false,
                attributionControl: false
            });
            L.tileLayer(this.mapUrl, {
                maxZoom: 18
            }).addTo(this.map);
            this.map.setMaxBounds([
                [-90, -180],
                [90, 180]
            ]);
            this.map.setView([39, 104], 5);
            this._initMiniMap();
            this._getRegions(this, '1');
            this.overlays = {};
            var layers = {};
            this.overlays[''] = layers;
            layers['人口热力图'] = this._showGlobalHeatMap();
            layers['目标分布图'] = this._showClusterPoints();
            L.control.groupedLayers(null, this.overlays, {
                collapsed: false,
                position: "bottomleft"
            }).addTo(this.map);
            this.actionsLayer.addTo(this.map);
            this.miniPointsLayer.addTo(this.map);
        },
        _heatMap: function (rsps) {
            var dataSet = {};
            var data = [],
                max = 8;
            for (var i = 0; i < rsps.length; i++) {
                data.push({
                    lat: rsps[i]['lat'],
                    lng: rsps[i]['lng'],
                    count: 1
                });
            }
            dataSet = {
                data: data,
                max: max
            };
            if (data.length > 0) {
                this.heatmap.setData(dataSet);
            }
        },
        //显示热力图
        _showGlobalHeatMap: function () {
            var cfg = {
                "radius": 0.0025, //0.005
                "maxOpacity": .8,
                "scaleRadius": true,
                "useLocalExtrema": false,
                latField: 'lat',
                lngField: 'lng',
                valueField: 'count'
            };
            var heatmapLayer = new HeatmapOverlay(cfg);
            heatmapLayer.addTo(this.map);

            this.heatmap = heatmapLayer;
            this.getHeatMap();
            //定时刷新热力图
            setInterval(
                this.getHeatMap.bind(this), 30 * 60 * 1000);
            return heatmapLayer;
        },
        _cluster: function (rsp) {
            for (var i = 0; i < rsp.length; i++) {
                var marker = L.marker([rsp[i]['lat'], rsp[i]['lng']], {
                    title: rsp[i]['name'] + '\n' + rsp[i]['time']
                }).addTo(this.clusterLayer);
                marker.msisdn = rsp[i]['target_id'];
                L.DomEvent.on(marker, 'click', function (e) {
                    this.targetPopup(e.target.msisdn);
                }, this);
            }
            this.clusterLayer.addTo(this.map);
        },
        //显示目标分布图（聚合展示）
        _showClusterPoints: function () {
            var markers_layer = new L.MarkerClusterGroup({});

            this.clusterLayer = markers_layer;
            this.getCluster();
            return markers_layer;
        },
        //初始化鹰眼地图
        _initMiniMap: function () {
            this.map2 = new L.TileLayer(this.mapUrl, {
                minZoom: 0,
                maxZoom: 15
            });
            this.miniMap = new L.Control.MiniMap(this.map2, {
                position: 'bottomright',
                toggleDisplay: true,
                zoomLevelOffset: -3,
                width: 400,
                height: 300,
                minimized: true
            }).addTo(this.map);
            this.miniMap._miniMap.removeLayer(this.miniMap._aimingRect);
            this.miniMap._miniMap.removeLayer(this.miniMap._shadowRect);
        },
        //获取重点区域围栏
        _getRegions: function (obj, key) {
            var url = 'http://' + obj.ip + ':8080/GisService/enclosure/GetChildren?key=1';
            $.ajax({
                url: '/smartquery/gisGetQuery',
                type: 'GET',
                data: {
                    hostname: obj.ip,
                    path: '/GisService/enclosure/GetChildren',
                    key: key
                },
                dataType: 'json',
                context: obj,
                success: function (rsp) {
                    var parameters = [];
                    for (var i = 0; i < rsp.length; i++) {
                        if (rsp[i].folder == false) {
                            //parameters += '&key=' + rsp[i].key;
                            parameters.push(rsp[i].key);
                        } else {
                            this._getRegions(this, rsp[i].key);
                        }
                    }
                    var newurl = '/GisService/enclosure/QueryEnclosureMapData';
                    this._loadRegions(newurl, parameters);
                }
            });
        },

        _loadRegions: function (newurl, parameters) {
            $.ajax({
                url: '/smartquery/gisGetQuery',
                type: 'GET',
                data: {
                    hostname: this.ip,
                    path: newurl,
                    key: parameters
                },
                dataType: 'json',
                context: this,
                success: function (rsp) {
                    //var center=[];
                    //                console.log(rsp);
                    for (var i = 0; i < rsp.length; i++) {
                        var shape = JSON.parse(rsp[i].graphic);
                        if (!(rsp[i].graphicAttr.name in this.areanames)) {
                            continue;
                        }
                        //regionList[rsp[i].graphicAttr.name]=rsp[i].key;
                        this.regionLayers[rsp[i].key] = this._shapeLayer(rsp[i].graphicType, shape, rsp[i].graphicAttr.color).bindPopup(rsp[i].graphicAttr.name + "<br>" + rsp[i].graphicAttr.remark);
                        this.regionLayers[rsp[i].key].addTo(this.map);
                        //将重点区域中心点添加至鹰眼地图中展示
                        this._addToMiniMap(this.regionLayers[rsp[i].key].getBounds().getCenter(), rsp[i].graphicAttr.name, rsp[i].key);
                        //center.push(this.regionLayers[rsp[i].key].getBounds().getCenter());
                    }
                }
            });
        },
        _shapeLayer: function (type, graphic, color) {
            switch (type) {
                case "1":
                    var _startLatLng = new L.LatLng(graphic.center[0], graphic.center[1]);
                    var _shape = new L.Circle(_startLatLng, graphic.radius, {
                        stroke: true,
                        color: color,
                        weight: 2,
                        opacity: 1,
                        fill: true,
                        fillColor: null, //same as color by default
                        fillOpacity: 0.4,
                        clickable: true
                    });
                    return _shape;
                case "3":
                    var _startLatLng = new L.LatLng(graphic.latlngs[0][0], graphic.latlngs[0][1]);
                    var _shape = new L.Rectangle(new L.LatLngBounds(_startLatLng, new L.LatLng(graphic.latlngs[2][0], graphic.latlngs[2][1])), {
                        stroke: true,
                        color: color,
                        weight: 2,
                        opacity: 1,
                        fill: true,
                        fillColor: null, //same as color by default
                        fillOpacity: 0.4,
                        clickable: true
                    });
                    return _shape;
                case "2":
                    var _poly = new L.Polygon(graphic.latlngs, {
                        stroke: true,
                        color: color,
                        weight: 2,
                        opacity: 1,
                        fill: true,
                        fillColor: null, //same as color by default
                        fillOpacity: 0.4,
                        clickable: true
                    });
                    return _poly;
            }
        },
        //将区域中心点添加在鹰眼地图上
        _addToMiniMap: function (center, label, regionID) {
            var marker = L.circleMarker(center, {
                stroke: false,
                color: "#f00",
                opacity: 1,
                fillOpacity: null,
                fillColor: "#f00",
                clickable: true
            }).bindLabel(label, {
                noHide: false
            });
            //将区域中心点与图层绑定
            this.regionMarkers[regionID] = marker;
            this.miniMap._miniMap.addLayer(marker);
        },
        /**********************************展示威胁接口***************************************/
        showThreats: function (threatData) {
            var threatType = ['warn_group_cluster', 'warn_area_target', 'warn_contact_target', 'warn_waybill_target', 'warn_person', 'warn_ex_province'];
            for (var i = 0; i < threatType.length; i++) {
                var threats = threatData[threatType[i]];
                if (threats == undefined) {
                    console.log('无' + threatType[i]);
                    continue;
                }
                if (threats.length > 0) {
                    for (var j = 0; j < threats.length; j++) {
                        var lat = parseFloat(threats[j].detail_info.lat);
                        var lng = parseFloat(threats[j].detail_info.lng);
                        if (isNaN(lat) || isNaN(lng) || (lng < -180) || (lng > 180) || (lat < -90) || (lat > 90) || (lng == 0.0) || (lat == 0.0)) {
                            console.log('经纬度不合法');
                            console.log(threats[j]);
                            continue;
                        }
                        var points = [];
                        var id = threats[j]['result_id'];
                        var infoText = _.template(threats[j].format_template)(threats[j].detail_info);
                        this.threatIDList.push(id);
                        switch (threatType[i]) {
                            case 'warn_group_cluster':
                                var clusterThreat = showTargetsClusterThreat([
                                    [lat, lng]
                                ], '重点目标聚集', this.map, infoText);
                                this.threatsMap[id] = clusterThreat;
                                break;
                            case 'warn_area_target':
                                points.push([lat, lng]);
                                if (('to_lat' in threats[j]['detail_info']) && ('to_lng' in threats[j]['detail_info'])) {
                                    var lat1 = parseFloat(threats[j]['detail_info'].to_lat);
                                    var lng1 = parseFloat(threats[j]['detail_info'].to_lng);
                                    if (isNaN(lat1) || isNaN(lng1) || (lng1 < -180) || (lng1 > 180) || (lat1 < -90) || (lat1 > 90)) {
                                        console.log('经纬度不合法');
                                        console.log(threats[j]);
                                    } else {
                                        points.push([lat1, lng1]);
                                    }
                                }
                                // points.push([lat, lng]);
                                var regionThreat;
                                if (points.length == 2) {
                                    regionThreat = showTargetEnterRegionThreat2(points, '目标进入重点区域', this.map, infoText);
                                } else {
                                    regionThreat = showTargetEnterRegionThreat([lat, lng], '目标进入重点区域', this.map, infoText);
                                }
                                this.threatsMap[id] = regionThreat;
                                break;
                            case 'warn_contact_target':
                                points.push([lat, lng]);
                                if (('to_lat' in threats[j]['detail_info']) && ('to_lng' in threats[j]['detail_info'])) {
                                    var lat2 = parseFloat(threats[j]['detail_info'].to_lat);
                                    var lng2 = parseFloat(threats[j]['detail_info'].to_lng);
                                    if (isNaN(lat2) || isNaN(lng2) || (lng2 < -180) || (lng2 > 180) || (lat2 < -90) || (lat2 > 90)) {
                                        console.log('经纬度不合法');
                                        console.log(threats[j]);
                                    } else {
                                        points.push([lat2, lng2]);
                                    }
                                }
                                var dangerPeopleThreat = showFindDangerPeopleThreat(points, '区内发现涉恐关系人', this.map, infoText);
                                this.threatsMap[id] = dangerPeopleThreat;
                                break;
                            case 'warn_waybill_target':
                                var dangerPeopleDeliveryThreat = showDangerPeopleDeliveryThreat([
                                    [lat, lng]
                                ], '涉恐人员向区内寄递', this.map, infoText);
                                this.threatsMap[id] = dangerPeopleDeliveryThreat;
                                break;
                            case 'warn_person':
                                var highScorePeopleThreat = showHighScorePeopleThreat([
                                    [lat, lng]
                                ], '高威胁人员', this.map, infoText);
                                this.threatsMap[id] = highScorePeopleThreat;
                                break;
                            case 'warn_ex_province':
                                //var regionThreat2 = showTargetEnterRegionThreat([lat, lng], '目标进入重点区域', map,infoText);
                                //threatsMap[id] = regionThreat2;
                                //break;
                                points.push([lat, lng]);
                                if (('to_lat' in threats[j]['detail_info']) && ('to_lng' in threats[j]['detail_info'])) {
                                    var lat1 = parseFloat(threats[j]['detail_info'].to_lat);
                                    var lng1 = parseFloat(threats[j]['detail_info'].to_lng);
                                    if (isNaN(lat1) || isNaN(lng1) || (lng1 < -180) || (lng1 > 180) || (lat1 < -90) || (lat1 > 90)) {
                                        console.log('经纬度不合法');
                                        console.log(threats[j]);
                                    } else {
                                        points.push([lat1, lng1]);
                                    }
                                }
                                // points.push([lat, lng]);
                                var regionThreat;
                                if (points.length == 2) {
                                    regionThreat = showTargetEnterRegionThreat2(points, '目标进入周边区域', this.map, infoText);
                                } else {
                                    regionThreat = showTargetEnterRegionThreat([lat, lng], '目标进入周边区域', this.map, infoText);
                                }
                                this.threatsMap[id] = regionThreat;
                                break;
                        }
                        //威胁的状态
                        switch (threats[j].status) {
                            //处理中，蓝色
                            case 'processing':
                                this.threatsMap[id].status = 'BEGIN';
                                handledThreat(this.threatsMap[id], this.map);
                                break;
                                //已处理，绿色
                            case 'processed':
                                this.threatsMap[id].status = 'END';
                                responsedThreat(this.threatsMap[id], this.map);
                                break;
                                //未处理，红色
                            default:
                                break;
                        }
                        //威胁自动定位开关
                        //					if(autoLocateThreat){
                        //                        locateThreatOnMap(id,true);
                        //					}
                    }
                }
            }
            if (this.flag) {
                this._playThreats();
                this.flag = false;
            }
        },
        //循环在地图上播放威胁
        _playThreats: function () {
            this.id_index = 0;
            setInterval(
                //            function(){
                //            if(this.autoLocateThreat) {
                //                if(this.threatIDList.length>0) {
                //                    if (id_index == this.threatIDList.length) {
                //                        id_index = 0;
                //                    }
                //                    if (!('status' in this.threatsMap[this.threatIDList[id_index]])) {
                //                        this.locateThreatOnMap(this.threatIDList[id_index], true);
                //                    }
                //                    id_index++;
                //                }
                //            }
                //        }
                this._autoThreat.bind(this), 10 * 1000);
        },
        _autoThreat: function () {
            if (this.autoLocateThreat) {
                if (this.threatIDList.length > 0) {
                    if (this.id_index == this.threatIDList.length) {
                        this.id_index = 0;
                    }
                    if (!('status' in this.threatsMap[this.threatIDList[this.id_index]])) {
                        this.locateThreatOnMap(this.threatIDList[this.id_index]);
                    }
                    this.id_index++;
                }
            }
        },
        /**********************************开始处理威胁接口************************************/
        handleThreatOnMap: function (e) {
            var threatID = e.ID;
            if (threatID in this.threatsMap) {
                this.threatsMap[threatID].status = 'BEGIN';
                handledThreat(this.threatsMap[threatID], this.map);
            }
        },
        /**********************************处理威胁结束接口************************************/
        responsedThreatOnMap: function (e) {
            var threatID = e.ID;
            if (threatID in this.threatsMap) {
                this.threatsMap[threatID].status = 'END';
                responsedThreat(this.threatsMap[threatID], this.map);
            }
        },
        /**********************************移除威胁接口***************************************/
        clearThreatOnMap: function (threatID) {
            if (threatID in this.threatsMap) {
                clearThreat(this.threatsMap[threatID], this.map);
            }
        },
        /**********************************清除所有威胁接口***************************************/
        clearAllThreats: function () {
            if (this.threatsMap) {
                for (var id in this.threatsMap) {
                    clearThreat(this.threatsMap[id], this.map);
                }
            }
        },
        /**********************************定位威胁接口***************************************/
        locateThreatOnMap: function (threatID, flag) {
            if (flag == undefined) {
                this.autoLocateThreat = false;
            } else {
                this.autoLocateThreat = true;
            }
            if (threatID in this.threatsMap) {
                var points = [];
                if ('from' in this.threatsMap[threatID]) {
                    points.push(this.threatsMap[threatID]['from']['markers']['marker'].getLatLng());
                    if ('to' in this.threatsMap[threatID]) {
                        points.push(this.threatsMap[threatID]['to']['markers']['marker'].getLatLng());
                        //map.fitBounds(points);
                        this.map.setView(points[1], 15);
                    } else {
                        this.map.setView(points[0], 15);
                    }
                    this.threatsMap[threatID]['from']['markers']['marker'].openPopup();
                } else {
                    var locate = this.threatsMap[threatID]['markers']['marker'].getLatLng();
                    this.map.setView(locate, 15);
                    this.threatsMap[threatID]['markers']['marker'].openPopup();
                }
            } else {
                this.map.closePopup();
            }
        },
        /**********************************展示活动接口***************************************/
        showAction: function (action) {
            var lat = parseFloat(action.lat);
            var lng = parseFloat(action.lng);
            if (isNaN(lat) || isNaN(lng) || (lng < -180) || (lng > 180) || (lat < -90) || (lat > 90) || (lng == 0.0) || (lat == 0.0)) {
                console.log('活动中的经纬度不合法');
                return;
            }
            if (this.pulsePoint == undefined) {
                this.pulsePoint = showActionPulsePoint([lat, lng], [20, 20], 'green', this.actionsLayer);
            } else {
                this.pulsePoint.setLatLng([lat, lng]);
            }
            this.map.setView([lat, lng], 15);
            var to_point;
            //两个点的活动情况，绘制连线
            if (('to_lat' in action) && ('to_lng' in action)) {
                var to_lat = parseFloat(action.to_lat);
                var to_lng = parseFloat(action.to_lng);
                if (isNaN(to_lat) || isNaN(to_lng) || (to_lng < -180) || (to_lng > 180) || (to_lat < -90) || (to_lat > 90)) {
                    console.log('经纬度不合法');
                    console.log(action);
                } else {
                    to_point = [to_lat, to_lng];
                    var line = createArcLine([
                        [lat, lng],
                        [to_lat, to_lng]
                    ]);
                    line.addTo(this.actionsLayer);
                }
            }
            switch (action.datatype) {
                case 'VPN':
                    showActionPoint([lat, lng], 'fa-number', 'vpn', 'green-light', this.actionsLayer);
                    break;
                case 'CALL': //TEL_COM
                    showActionPoint([lat, lng], 'fa-phone', '', 'green-light', this.actionsLayer);
                    if (to_point) {
                        showActionPoint(to_point, 'fa-phone', '', 'green-light', this.actionsLayer);
                    }
                    break;
                case 'EML':
                    showActionPoint([lat, lng], 'fa-envelope', '', 'green-light', this.actionsLayer);
                    break;
                case 'RAILWAY':
                    showActionPoint([lat, lng], 'fa-train', '', 'green-light', this.actionsLayer);
                    if (to_point) {
                        showActionPoint(to_point, 'fa-phone', '', 'green-light', this.actionsLayer);
                    }
                    break;
                case 'AIRPLANE': //AIRPORT
                    showActionPoint([lat, lng], 'fa-plane', '', 'green-light', this.actionsLayer);
                    if (to_point) {
                        showActionPoint(to_point, 'fa-phone', '', 'green-light', this.actionsLayer);
                    }
                    break;
                case 'WAYBILL':
                    showActionPoint([lat, lng], 'fa-truck', '', 'green-light', this.actionsLayer);
                    break;
                case 'IM':
                    showActionPoint([lat, lng], 'fa-comments', '', 'green-light', this.actionsLayer);
                    break;
                case 'FTP':
                    showActionPoint([lat, lng], 'fa-number', 'ftp', 'green-light', this.actionsLayer);
                    break;
                case 'DNS':
                    showActionPoint([lat, lng], 'fa-number', 'dns', 'green-light', this.actionsLayer);
                    if (to_point) {
                        showActionPoint(to_point, 'fa-phone', '', 'green-light', this.actionsLayer);
                    }
                    break;
                case 'SSL':
                    showActionPoint([lat, lng], 'fa-number', 'ssl', 'green-light', this.actionsLayer);
                    break;
                case 'LBS':
                    showActionPoint([lat, lng], 'fa-paw', '', 'green-light', this.actionsLayer);
                    break;
                default:
                    showActionPoint([lat, lng], 'fa-info-circle', '', 'green-light', this.actionsLayer);
                    if (to_point) {
                        showActionPoint(to_point, 'fa-phone', '', 'green-light', this.actionsLayer);
                    }
                    break;
            }
        },
        _createMiniPointOnMap: function (point) {
            var marker = L.circleMarker(point, {
                radius: 5,
                stroke: false,
                color: "#0f0",
                opacity: 1,
                fillOpacity: null,
                fillColor: "#0f0",
                clickable: false
            });
            marker.addTo(this.miniPointsLayer);
        },
        showActions: function (actionsobj) {
            clearActions(this.actionsLayer);
            this.miniPointsLayer.clearLayers();
            //var actions=actionsobj['ACTIONS'];
            var actions = actionsobj;
            var parray = [];
            for (var i = 0; i < actions.length; i++) {
                var lat = parseFloat(actions[i].lat);
                var lng = parseFloat(actions[i].lng);
                if (isNaN(lat) || isNaN(lng) || (lng < -180) || (lng > 180) || (lat < -90) || (lat > 90) || (lng == 0.0) || (lat == 0.0)) {
                    console.log('活动中的经纬度不合法');
                    continue;
                }
                this._createMiniPointOnMap([lat, lng]);
                parray.push([lat, lng]);
            }
        },
        /**********************************清除活动接口***************************************/
        clearActionsLayer: function () {
            clearActions(this.actionsLayer);
            this.miniPointsLayer.clearLayers();
            this.autoLocateThreat = true;
        }
    }

    //基础功能函数
    //////////////////////////////////////////////////////////////
    /*************************重点目标聚集************************/
    function showTargetsClusterThreat(targets, title, map, infoText) {
        var clusterThreat = {};
        clusterThreat['circle'] = createCircleArea(targets);
        clusterThreat['markers'] = createPulsePointAndMarker(clusterThreat['circle']['center'], title, [20, 20], 'red', 'fa-users', 'square', infoText);
        clusterThreat['circle']['circle'].addTo(map);
        clusterThreat['markers']['point'].addTo(map);
        clusterThreat['markers']['marker'].addTo(map);
        return clusterThreat;
    }
    /************************目标进入重点区域********************/
    function showTargetEnterRegionThreat(target, title, map, infoText) {
        var regionThreat = {};
        regionThreat['markers'] = createPulsePointAndMarker(target, title, [20, 20], 'red', 'fa-user', 'square', infoText);
        regionThreat['markers']['point'].addTo(map);
        regionThreat['markers']['marker'].addTo(map);
        return regionThreat;
    }

    function showTargetEnterRegionThreat2(targets, title, map, infoText) {
        var dangerPeopleThreat = {};
        dangerPeopleThreat['markers'] = createPulsePointAndMarker(targets[0], '', [20, 20], 'red', 'fa-user', 'square');
        dangerPeopleThreat['markers']['point'].addTo(map);
        dangerPeopleThreat['markers']['marker'].addTo(map);
        if (targets.length == 2) {
            var dangerPeopleThreat2 = {};
            dangerPeopleThreat2['markers'] = createPulsePointAndMarker(targets[1], title, [10, 10], 'red', 'fa-user', 'square', infoText);
            dangerPeopleThreat2['markers']['point'].addTo(map);
            dangerPeopleThreat2['markers']['marker'].addTo(map);
            var line = createArcLine(targets);
            line.addTo(map);
            return {
                from: dangerPeopleThreat,
                to: dangerPeopleThreat2,
                line: line
            };
        } else {
            return {
                from: dangerPeopleThreat
            };
        }
    }
    /************************发现暴恐联系人**********************/
    function showFindDangerPeopleThreat(targets, title, map, infoText) {
        var dangerPeopleThreat = {};
        dangerPeopleThreat['markers'] = createPulsePointAndMarker(targets[0], title, [20, 20], 'red', 'fa-phone', 'square', infoText);
        dangerPeopleThreat['markers']['point'].addTo(map);
        dangerPeopleThreat['markers']['marker'].addTo(map);
        if (targets.length == 2) {
            var dangerPeopleThreat2 = {};
            dangerPeopleThreat2['markers'] = createPulsePointAndMarker(targets[1], '', [10, 10], 'red', 'fa-phone', 'square');
            dangerPeopleThreat2['markers']['point'].addTo(map);
            dangerPeopleThreat2['markers']['marker'].addTo(map);
            var line = createArcLine(targets);
            line.addTo(map);
            return {
                from: dangerPeopleThreat,
                to: dangerPeopleThreat2,
                line: line
            };
        } else {
            return {
                from: dangerPeopleThreat
            };
        }
    }
    /************************涉暴恐人员向区内寄递**********************/
    function showDangerPeopleDeliveryThreat(targets, title, map, infoText) {
        var dangerPeopleThreat = {};
        dangerPeopleThreat['markers'] = createPulsePointAndMarker(targets[0], title, [20, 20], 'red', 'fa-truck', 'square', infoText);
        dangerPeopleThreat['markers']['point'].addTo(map);
        dangerPeopleThreat['markers']['marker'].addTo(map);
        if (targets.length == 2) {
            var dangerPeopleThreat2 = {};
            dangerPeopleThreat2['markers'] = createPulsePointAndMarker(targets[1], '', [10, 10], 'red', 'fa-truck', 'square');
            dangerPeopleThreat2['markers']['point'].addTo(map);
            dangerPeopleThreat2['markers']['marker'].addTo(map);
            var line = createArcLine(targets);
            line.addTo(map);
            return {
                from: dangerPeopleThreat,
                to: dangerPeopleThreat2,
                line: line
            };
        } else {
            return {
                from: dangerPeopleThreat
            };
        }
    }
    /************************发现高积分人员**********************/
    function showHighScorePeopleThreat(target, title, map, infoText) {
        var highScorePeopleThreat = {};
        highScorePeopleThreat['markers'] = createPulsePointAndMarker(target, title, [20, 20], 'red', 'fa-user-secret', 'square', infoText);
        highScorePeopleThreat['markers']['point'].addTo(map);
        highScorePeopleThreat['markers']['marker'].addTo(map);
        return highScorePeopleThreat;
    }
    /************************个人活动轨迹点**********************/
    function showActionPoint(point, icon, text, markerColor, layer) {
        var markerIcon = L.ExtraMarkers.icon({
            icon: icon,
            markerColor: markerColor,
            number: text,
            shape: 'circle',
            prefix: 'fa'
        });
        var marker = L.marker(point, {
            icon: markerIcon
        });
        marker.addTo(layer);
        return marker;
    }

    function showActionPulsePoint(point, pulsePointSize, color, layer) {
        var pulsingIcon = L.icon.pulse({
            iconSize: pulsePointSize,
            color: color
        });
        var pulsePoint = L.marker(point, {
            icon: pulsingIcon
        });
        pulsePoint.addTo(layer);
        return pulsePoint;
    }

    function clearActions(layer) {
        layer.clearLayers();
    }
    /**************************Utils*****************************/
    function clearThreat(threat, map) {
        if ('from' in threat) {
            clearMarkerAndPoint(threat['from']['markers'], map);
            if ('to' in threat) {
                clearMarkerAndPoint(threat['to']['markers'], map);
                if (map.hasLayer(threat['line'])) {
                    map.removeLayer(threat['line']);
                }
            }
        } else {
            clearMarkerAndPoint(threat['markers'], map);
            if ('circle' in threat) {
                if (map.hasLayer(threat['circle']['circle'])) {
                    map.removeLayer(threat['circle']['circle']);
                }
            }
        }
    }

    function clearMarkerAndPoint(obj, map) {
        if (map.hasLayer(obj['marker'])) {
            map.removeLayer(obj['marker']);
        }
        if (map.hasLayer(obj['point'])) {
            map.removeLayer(obj['point']);
        }
    }

    function handledThreat(threat, map) {
        if ('from' in threat) {
            setPulsePointAndMarker(threat['from'], 'blue', map);
            if ('to' in threat) {
                setPulsePointAndMarker(threat['to'], 'blue', map);
            }
        } else {
            setPulsePointAndMarker(threat, 'blue', map);
        }
    }

    function responsedThreat(threat, map) {
        if ('from' in threat) {
            setPulsePointAndMarker(threat['from'], 'green', map);
            if ('to' in threat) {
                setPulsePointAndMarker(threat['to'], 'green', map);
            }
        } else {
            setPulsePointAndMarker(threat, 'green', map);
        }
    }

    function createPulsePointAndMarker(point, title, pulsePointSize, markerColor, icon, shape, infoText) {
        var markerIcon = L.ExtraMarkers.icon({
            icon: icon,
            markerColor: markerColor,
            shape: shape,
            prefix: 'fa'
        });
        var marker = L.marker(point, {
            icon: markerIcon
        });
        if (infoText != undefined && infoText != '') {
            marker.bindPopup(infoText);
        }
        if (title != '') {
            marker.bindLabel(title, {
                noHide: true
            })
        }
        var pulsingIcon = L.icon.pulse({
            iconSize: pulsePointSize,
            color: 'red'
        });
        var pulsePoint = L.marker(point, {
            icon: pulsingIcon
        });
        return {
            point: pulsePoint,
            marker: marker
        };
    }

    function setPulsePointAndMarker(obj, markerColor, map) {
        var marker = obj['markers']['marker'];
        var markerIcon = L.ExtraMarkers.icon({
            icon: marker.options.icon.options.icon,
            markerColor: markerColor,
            shape: marker.options.icon.options.shape,
            prefix: 'fa'
        });
        marker.setIcon(markerIcon);
        if (map.hasLayer(obj['markers']['point'])) {
            map.removeLayer(obj['markers']['point']);
            delete obj['markers']['point'];
        }
    }

    function createCircleArea(points) {
        var center, radius;
        if (points.length == 1) {
            center = points[0];
            radius = 1000;
        } else {
            var bounds = L.bounds(points);
            center = bounds.getCenter();
            radius = (L.latLng(center[0], center[1])).distanceTo(bounds.getTopRight()) + 100;
        }
        var circle = new L.Circle(center, radius, {
            stroke: true,
            color: '#ffa500',
            weight: 4,
            opacity: 1,
            fill: true,
            fillColor: null, //same as color by default
            fillOpacity: 0.1,
            clickable: false
        });
        return {
            circle: circle,
            center: center
        };
    }

    function createArcLine(points) {
        var arc = new bezier(points);
        var line = L.polyline(arc, {
            stroke: true,
            color: '#00ff33',
            dashArray: [2, 10],
            lineCap: null,
            lineJoin: null,
            weight: 5,
            opacity: 0.5,
            fill: false,
            fillColor: null, //same as color by default
            fillOpacity: 0.2,
            clickable: false
        });
        var antPolyline = new L.Polyline.AntPath(arc, {
            stroke: true,
            color: '#00ff33',
            dashArray: [2, 15],
            lineCap: null,
            lineJoin: null,
            weight: 5,
            opacity: 0.5,
            fill: false,
            fillColor: null, //same as color by default
            fillOpacity: 0.2,
            clickable: false
        });
        return antPolyline;
    }

    module.exports = {
        "TaiShi_Gis": TaiShi_Gis,
        "WeiXie_Gis": WeiXie_Gis
    };
});