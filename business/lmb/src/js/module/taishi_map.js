/**
 * Created by maxiaodan on 2016/11/28.
 */
define([], function () {
    var mapControl = {
        map: {},
        overlays: {},
        PosLayer: {},
        Heatmap: {},
        traceLayer: {},
        warnPointLayer: {},
        caseLayer: {},
        casePoints: {},
        _colorIdx: 0,
        playcontrol: {},
        playback: {},

        Init: function (mapServer) {
            this.initMap(mapServer);
            this.initOverlayers();
        },

        InitCase: function (mapServer) { //特殊案件页面相关接口
            this.initMap(mapServer);
            this.caseLayer = L.featureGroup();
            this.caseLayer.addTo(this.map);
        },

        LoadCaseData: function (data, callback) { //特殊案件页面相关接口
            var myIcon = L.AwesomeMarkers.icon({
                prefix: 'fa',
                icon: 'bullseye',
                markerColor: 'red'
            });
            this.caseLayer.clearLayers();
            if (data == 'undefined' || data.length == 0)
                return;
            for (var i = 0; i < data.length; i++) {
                var p = new L.marker([data[i].lat, data[i].lng], {
                    icon: myIcon,
                    objid: data[i].id
                }).setBouncingOptions({
                    exclusive: true,
                    elastic: false
                }).on("click", function (e) {
                    callback(this.options.objid);
                });
                this.casePoints[data[i].id] = p;
                this.caseLayer.addLayer(p);
            }
            this.map.fitBounds(this.caseLayer.getBounds());
        },

        SelectCaseData: function (id) { //特殊案件页面相关接口
            if (this.casePoints[id].isBouncing())
                return;
            L.Marker.stopAllBouncingMarkers();
            this.casePoints[id].toggleBouncing();
            this.map.panTo(this.casePoints[id].getLatLng());
        },

        initMap: function (mapServer) {
            if (this.map) {
                delete this.map;
            }
            this.map = L.map('map', {
                attributionControl: false,
                zoomControl: false
            }).setView([39, 105], 4);
            this.map.options.maxZoom = 16;
            L.tileLayer(mapServer).addTo(this.map);
            //invert map
            $('.leaflet-tile-pane').addClass('invert');
        },

        initOverlayers: function () {
            var layers = {};
            this.overlays[''] = layers;
            layers['热点图层'] = this.initHeatmapLayer();
            layers['当前位置'] = this.initCurrentPosLayer();
            layers['轨迹图层'] = this.initTraceLayer();
            L.control.groupedLayers(null, this.overlays, {
                collapsed: false,
                position: "bottomleft"
            }).addTo(this.map);
        },

        initCurrentPosLayer: function () {
            this.PosLayer = L.markerClusterGroup({
                spiderfyOnMaxZoom: true,
                showCoverageOnHover: false,
                zoomToBoundsOnClick: false,
                iconCreateFunction: this.clusterIconCreate
            });
            this.PosLayer.addTo(this.map);
            return this.PosLayer;
        },

        clusterIconCreate: function (cluster) {
            var childCount = cluster.getChildCount();
            var c = ' my-marker-cluster-';
            if (childCount < 100) {
                c += 'small';
                return new L.DivIcon({
                    html: '<div><span>' + childCount + '</span></div>',
                    className: 'my-marker-cluster-s' + c,
                    iconSize: new L.Point(20, 20)
                });
            } else if (childCount < 1000) {
                c += 'medium';
                return new L.DivIcon({
                    html: '<div><span>' + childCount + '</span></div>',
                    className: 'my-marker-cluster-m' + c,
                    iconSize: new L.Point(30, 30)
                });
            } else {
                c += 'large';
                return new L.DivIcon({
                    html: '<div><span>' + childCount + '</span></div>',
                    className: 'my-marker-cluster-l' + c,
                    iconSize: new L.Point(40, 40)
                });
            }
        },

        setCurrentPosLayer: function (data, callback) {
            this.PosLayer.clearLayers();
            var myIcon = L.AwesomeMarkers.icon({
                prefix: 'fa',
                icon: 'bullseye',
                markerColor: 'blue'
            })
            for (var i = 0; i < data.length; i++) {
                var len = data[i].tracepath.length;
                this.PosLayer.addLayer(L.marker([data[i].tracepath[len - 1].lat, data[i].tracepath[len - 1].lon], {
                    icon: myIcon,
                    objid: data[i].userid
                }).on("click", function (e) {
                    callback(this.options.objid);
                }));
            }
        },

        initHeatmapLayer: function () {
            var cfg = {
                "radius": 1,
                "maxOpacity": .8,
                "scaleRadius": true,
                "useLocalExtrema": false,
                latField: 'lat',
                lngField: 'lng',
                valueField: 'count'
            };
            this.Heatmap = new HeatmapOverlay(cfg);
            this.Heatmap.addTo(this.map);
            return this.Heatmap;
        },

        setHeatmapLayer: function (data) {
            var heatmapPoints = [];
            for (var i = 0; i < data.length; i++) {
                for (var j = 0; j < data[i].tracepath.length; j++) {
                    var lat_value = data[i].tracepath[j].lat; //纬度值
                    var lon_value = data[i].tracepath[j].lon; //经度值

                    if (heatmapPoints[lat_value + ',' + lon_value] == undefined) {
                        heatmapPoints[lat_value + ',' + lon_value] = [lat_value, lon_value, 1];
                    } else {
                        heatmapPoints[lat_value + ',' + lon_value][2]++;
                    }
                }
            }
            var points = new L.featureGroup();
            var data = [];
            var max = 0;
            for (var i in heatmapPoints) {
                data.push({
                    lat: heatmapPoints[i][0],
                    lng: heatmapPoints[i][1],
                    count: heatmapPoints[i][2]
                });
                L.marker(new L.latLng(heatmapPoints[i][0], heatmapPoints[i][1])).addTo(points);
                if (max < heatmapPoints[i][2]) {
                    max = heatmapPoints[i][2];
                }
            }
            var heatData = {
                data: data,
                max: max
            };
            if (max == 0)
                this.Heatmap.setData({
                    data: [],
                    max: 0
                });
            else {
                this.Heatmap.setData(heatData);
                this.map.fitBounds(points.getBounds());
            }
        },

        initTraceLayer: function () {
            this.traceLayer = L.featureGroup();
            this.traceLayer.addTo(this.map);
            return this.traceLayer;
        },

        setTraceLayer: function (data, callback) {
            var myIcon = L.AwesomeMarkers.icon({
                prefix: 'fa',
                icon: 'bullseye',
                markerColor: 'blue'
            })
            var points = [];
            var smoothPoitns;
            this.traceLayer.clearLayers();
            for (var i = 0; i < data[0].tracepath.length; i++) {
                points.push({
                    lat: parseFloat(data[0].tracepath[i].lat),
                    lng: parseFloat(data[0].tracepath[i].lon),
                    time: Date.parse(data[0].tracepath[i].time)
                });
                console.log(Date.parse(data[0].tracepath[i].time));
            }

            if (points.length <= 1)
                return callback();

            var npoints = [];
            for (var i = 0; i < points.length; i++) {
                npoints.push(points[points.length - i - 1]);
            }

            smoothPoitns = this.smoothLine(npoints);
            //        var movingMarker = new L.Marker.movingMarker(smoothPoitns, 500 * data[0].tracepath.length, {
            //            icon: myIcon,
            //            color: '#ff9900'
            //        }).addTo(this.traceLayer);
            //        movingMarker.on("end", function () {
            //            //remove
            //            if (mapControl.traceLayer.hasLayer(movingMarker)) {
            //                mapControl.traceLayer.removeLayer(movingMarker);
            //            }
            //            //add
            //            var antPath = new L.Polyline.AntPath(smoothPoitns, {
            //                stroke: true,
            //                color: '#000000',
            //                pulseColor: '#ff9900',
            //                dashArray: [8, 10],
            //                lineCap: null,
            //                lineJoin: null,
            //                weight: 3,
            //                opacity: 0.7,
            //                fill: false,
            //                fillColor: '#ff0000', //same as color by default
            //                fillOpacity: 0.2,
            //                clickable: false,
            //                delay: 1000
            //            }).addTo(mapControl.traceLayer);
            //            callback();
            //        });
            //        movingMarker.start();

            var antPath = new L.Polyline.AntPath(smoothPoitns.points, {
                stroke: true,
                color: '#000000',
                pulseColor: '#ff9900',
                dashArray: [8, 10],
                lineCap: null,
                lineJoin: null,
                weight: 3,
                opacity: 0.7,
                fill: false,
                fillColor: '#ff0000', //same as color by default
                fillOpacity: 0.2,
                clickable: false,
                delay: 1000
            }).addTo(this.traceLayer);
            callback();
            var playbaclData = [{
                "type": "Feature",
                "geometry": {
                    "type": "MultiPoint",
                    "coordinates": smoothPoitns.points_playback
                },
                "properties": {
                    "title": data.username,
                    "time": smoothPoitns.time
                }
            }];
            this.initPlaybackLayer(playbaclData);
        },

        smoothLine: function (originPoints) {
            var points = [];
            var points_playback = [];
            var time = [];
            var inputPoints = originPoints;
            var vector_time = {};
            var vector_line_points = {};
            for (var i = 0; i < inputPoints.length - 1; i++) {
                if (originPoints[i].lat == originPoints[i + 1].lat && originPoints[i].lng == originPoints[i + 1].lng)
                    continue;
                var vector_name = originPoints[i].lat.toString() + ',' + originPoints[i].lng.toString() + '-' + originPoints[i + 1].lat.toString() + ',' + originPoints[i + 1].lng.toString();
                points.push([originPoints[i].lat, originPoints[i].lng]);
                points_playback.push([originPoints[i].lng, originPoints[i].lat]);
                time.push(parseInt(originPoints[i].time));
                if (!(vector_name in vector_line_points)) {
                    var pts = [];
                    pts.push([originPoints[i].lng, originPoints[i].lat]);
                    pts.push([originPoints[i + 1].lng, originPoints[i + 1].lat]);
                    var line_seg = bezier(pts);
                    vector_line_points[vector_name] = line_seg;
                    var time_seg = [];
                    var time_Interval = (parseInt(originPoints[i + 1].time) - parseInt(originPoints[i].time)) / 100;
                    for (var t = 0; t < 100; t++) {
                        time_seg.push(parseInt(originPoints[i].time) + t * time_Interval);
                    }
                    vector_time[vector_name] = time_seg;
                }
                for (var j = 1; j < vector_line_points[vector_name].length - 1; j++) {
                    points.push([vector_line_points[vector_name][j][1], vector_line_points[vector_name][j][0]]);
                    points_playback.push([vector_line_points[vector_name][j][0], vector_line_points[vector_name][j][1]]);
                    time.push(vector_time[vector_name][j])
                }
            }
            points.push([originPoints[inputPoints.length - 1].lat, originPoints[inputPoints.length - 1].lng]);
            points_playback.push([originPoints[inputPoints.length - 1].lng, originPoints[inputPoints.length - 1].lat]);
            time.push(parseInt(originPoints[inputPoints.length - 1].time));
            return {
                "points": points,
                "time": time,
                "points_playback": points_playback
            };
        },

        ShowData: function (data, callback) {
            this.setHeatmapLayer(data);
            if (data.length == 1) {
                this.setTraceLayer(data, function () {
                    mapControl.setCurrentPosLayer(data, callback);
                });
            } else {
                this.destroyPlaybackLayer();
                if (this.map.hasLayer(this.warnPointLayer)) {
                    this.map.removeLayer(this.warnPointLayer);
                }
                this.traceLayer.clearLayers();
                this.setCurrentPosLayer(data, callback);
            }
        },

        ClearMap: function () {
            this.PosLayer.clearLayers();
            this.Heatmap.setData({
                data: [],
                max: 0
            });
            this.traceLayer.clearLayers();
            if (this.map.hasLayer(this.warnPointLayer)) {
                this.map.removeLayer(this.warnPointLayer);
            }
        },

        AddWarnPoint: function (lng, lat) {
            var myicon = new L.DivIcon({
                html: '<div class="pulse"></div>',
                className: 'warnpoint',
                iconSize: new L.Point(10, 10)
            });
            if (this.map.hasLayer(this.warnPointLayer)) {
                this.map.removeLayer(this.warnPointLayer);
            }
            this.warnPointLayer = L.marker([lat, lng], {
                icon: myicon
            });
            this.warnPointLayer.addTo(map);
            this.map.panTo([lat, lng]);
        },

        initPlaybackLayer: function (track) {
            // Playback options
            var playbackOptions = {
                tickLen: 360,
                // layer and marker options
                layer: {
                    pointToLayer: function (featureData, latlng) {
                        var result = {};

                        if (featureData && featureData.properties && featureData.properties.path_options) {
                            result = featureData.properties.path_options;
                        }

                        if (!result.radius) {
                            result.radius = 5;
                        }

                        return new L.CircleMarker(latlng, result);
                    }
                },

                marker: function () {
                    return {
                        icon: L.AwesomeMarkers.icon({
                            prefix: 'fa',
                            icon: 'bullseye',
                            markerColor: 'orange'
                        })
                    };
                }
            };

            // Initialize playback
            this.playback = new L.Playback(this.map, track, null, playbackOptions);

            // Initialize custom control
            this.playcontrol = new L.Playback.Control(this.playback);
            this.playcontrol.addTo(this.map);
        },

        destroyPlaybackLayer: function () {
            if ($(".lp").length != 0) {
                this.playback.clearData();
                $(".lp").remove();
            }
        }
    };
    function getmap(){
        return mapControl;
    }
    return{
        getmap:getmap
    }
});