define("module/gis/pathBoxModule", [
    '../../tpl/gis/tpl-path-box',
    '../../tpl/gis/tpl-path',
    "jquery",
    "underscore",
], function(tpl_path_box, tpl_path) {
    tpl_path_box = _.template(tpl_path_box);
    tpl_path = _.template(tpl_path);

    function pathBox(options) {
        this.options = options;
        this.targetList = {};
        this.selectedTargerList = {};
        this.targetMovingTimes = {};
        this._container = options._container;
        this.aimList = {};
        var map = this._map = options._map;
        // this.relativeBtn = this._addBtn();

        this.starticon = L.divIcon({
            className: 'img-start',
            iconSize: [26, 40],
            iconAnchor: [13, 40]
        });
        this.endicon = L.divIcon({
            className: 'img-end',
            iconSize: [26, 40],
            iconAnchor: [13, 40]
        });

        this.fitMapFlag = true;
    }

    pathBox.prototype = {
        init: function() {
            //查看目标点分布
            L.MarkerClusterGroup.prototype.showAimDistribute = function(aimListArgs, map) {
                if (this.markers_layer != undefined) {
                    this.addTo(map);
                    map.fitBounds(this.markers_layer.getBounds());
                    return;
                }
                //定义点要素类图层
                this.markers_layer = L.featureGroup();

                for (aim in aimListArgs) {
                    var lat_index = -1; //纬度索引位置
                    var lon_index = -1; //经度索引位置
                    var time_index = -1; //时间索引位置
                    var aimName = aimListArgs[aim].name; //目标名称信息
                    var lat_name = aimListArgs[aim].latitude; //纬度信息名称
                    var lon_name = aimListArgs[aim].longitude; //经度信息名称
                    var time_name = aimListArgs[aim].time; //时间信息名称

                    //找出纬度、经度、时间对应的索引位置
                    for (var i = 0; i < aimListArgs[aim].columns.length; i++) {
                        if (aimListArgs[aim].columns[i] == lat_name) {
                            lat_index = i;
                            continue;
                        }
                        if (aimListArgs[aim].columns[i] == lon_name) {
                            lon_index = i;
                            continue;
                        }
                        if (aimListArgs[aim].columns[i] == time_name) {
                            time_index = i;
                        }
                    }

                    //遍历数据
                    for (var i = 0; i < aimListArgs[aim].data.length; i++) {
                        var pointInfo = {};
                        var lat_value = -1; //纬度值
                        var lon_value = -1; //经度值
                        var time_value = ""; //时间值
                        var thisData = aimListArgs[aim].data[i];

                        for (var j = 0; j < thisData.length; j++) {
                            var pointCol = ""; //列名
                            var pointVal = thisData[j]; //列值
                            switch (j) {
                                case lat_index:
                                    pointCol = i18n.t('gismodule.manageAimTrack.tooltipCol.lat');
                                    lat_value = parseFloat(pointVal);
                                    break;
                                case lon_index:
                                    pointCol = i18n.t('gismodule.manageAimTrack.tooltipCol.lng');
                                    lon_value = parseFloat(pointVal);
                                    break;
                                case time_index:
                                    pointCol = i18n.t('gismodule.manageAimTrack.tooltipCol.time');
                                    time_value = pointVal;
                                    break;
                                default:
                                    pointCol = aimListArgs[aim].columns[j];
                            }

                            pointInfo[pointCol] = pointVal;
                        }

                        //定义点
                        //                var toolTipStr = '<div class="portlet-extend"><div class="portlet-body-extend-popup"><table><tr><th>地址</th><td>' + address + '</td></tr><tr  style="background-color: white;"><th>类别</th><td>' + kindName + '</td></tr><tr><th >地图坐标</th><td>(经度:' + longitudeVal + ',纬度:' + latitudeVal + ')</td></tr></table></div></div>';
                        //设置点的tooltip信息
                        var toolTipStr = '<div class="portlet-extend"><div class="aim-distribute-toolTip"><table>';
                        for (eachInfo in pointInfo) {
                            var th = eachInfo;
                            var td = pointInfo[eachInfo];

                            toolTipStr += '<tr><th>' +
                                th +
                                '</th><td>' +
                                td +
                                '</td></tr>';
                        }
                        toolTipStr += '</table></div></div>';

                        L.circleMarker(new L.latLng(lat_value, lon_value), {
                            stroke: false,
                            fill: true,
                            fillColor: '#ff0000',
                            fillOpacity: 1,
                            radius: 8
                        }).bindPopup(toolTipStr).addTo(this.markers_layer);
                    }
                }

                //添加到地图
                this.addLayer(this.markers_layer);
                this.addTo(map);
                if (this.markers_layer.getLayers().length > 0) {
                    map.fitBounds(this.markers_layer.getBounds());
                }
            };

            //隐藏目标点分布
            L.MarkerClusterGroup.prototype.hideAimDistribute = function(map) {
                if (map.hasLayer(this)) {
                    map.removeLayer(this);
                }
            };
            //扩展聚类添加点接口
            L.MarkerClusterGroup.prototype.addPoints = function(points) {
                //定义点要素类图层
                this.markers_layer = L.featureGroup();
                //纬度索引位置
                var lat_index = -1;
                //经度索引位置
                var lon_index = -1;
                //在数据列名中搜索经纬度对应的索引号
                for (var i = 0; i < points.columns.length; i++) {
                    if (points.columns[i] == points.latitude) {
                        lat_index = i;
                        continue;
                    }
                    if (points.columns[i] == points.longitude) {
                        lon_index = i;
                        continue;
                    }
                }
                //获取数据列的长度
                var columnLen = points.columns.length;
                //遍历点集合，将点添加到点要素图层
                for (var i = 0; i < points.data.length; i++) {
                    //获取点的经纬度值
                    var lat = parseFloat(points.data[i][lat_index]);
                    var lon = parseFloat(points.data[i][lon_index]);
                    //验证经纬度的正确性
                    if (isNaN(lat) || isNaN(lon) || (lon < -180) || (lon > 180) || (lat < -90) || (lat > 90)) {
                        console.log("[" + lon + "," + lat + "]" + i18n.t('gismodule.manageAimTrack.alert1'));
                        continue;
                    }
                    //配置点ToolTip信息
                    var toolTipStr = '<div class="prtlet-extend"><div class="portlet-title-extend-popup">' + i18n.t('gismodule.manageAimTrack.tooltipTitle') + '</div><div class="portlet-body-extend-popup"><table>';
                    for (var t = 0; t < columnLen; t++) {
                        if (t % 2 === 0) {
                            toolTipStr += ("<tr><th>" + points.columns[t] + "</th><td>" + points.data[i][t]) + "</td></tr>";
                        } else {
                            toolTipStr += ("<tr class='odd'><th>" + points.columns[t] + "</th><td>" + points.data[i][t]) + "</td></tr>";
                        }
                    }
                    toolTipStr += "</table></div></div>";
                    L.circleMarker(new L.latLng(lat, lon), {
                        stroke: false,
                        fill: true,
                        fillColor: '#ff0000',
                        fillOpacity: 1,
                        radius: 8
                    }).bindPopup(toolTipStr).addTo(this.markers_layer);
                }
                this.addLayer(this.markers_layer);
            };
            _render();

            // this.setTargetData();
            this._mapZoomShow();
        },
        execSmartQuery: function(datafenceHelperOpt) {
            // console.log(this.options)
            this.showLoadingBox();

            this.options.datafenceHelper.submitQuery(datafenceHelperOpt);
        },
        showLoadingBox: function() {
            $('#pathBox').show();
            $('#pathLoadingBox').show();
            $('#targetSelectionBox').hide();
            $('#pathDisplayBox').hide();
        },
        setTargetData: function() {
            for (var id in this.targetList) {
                this._hideTargerTrace(id);
            }
            delete this.targetList;
            delete this.selectedTargerList;
            delete this.targetMovingTimes;
            delete this.current;
            delete this.cp;
            delete this.pc;
            delete this.pointsID;
            this.targetList = {};
            this.selectedTargerList = {};
            this.targetMovingTimes = {};
            this.current = undefined;
            this.cp = {};
            this.pc = {};
            this.pointsID = {};


            //this._addPanel();
            // this._addAimList();


            // $(".track-group-body").height($("#map").height() - 32); //\u8bbe\u7f6e\u8f68\u8ff9\u9875\u9762\u9ad8\u5ea6

            //画出目标轨迹信息
            this.appendPathInfos();

            //初始化开关目标点分布、轨迹展示按钮的逻辑
            this.initToggles();




        },

        //画出目标轨迹信息
        appendPathInfos: function() {
            $('#planList div.planlist_wrap.planlist_car').empty();
            var colors = ["#FF0000", "#0000FF", "#FF00FF", "#000000", "#8800FF"];
            var num = 0;
            for (key in this.aimList) {
                // let n = num;
                if (this.aimList.hasOwnProperty(key)) {
                    var tabName = i18n.t('gismodule.manageAimTrack.aimName') + (num + 1);
                    _createAimPhoneBillList(this.aimList[key], tabName, colors[num], num, key);
                    this._showTargetTrace(key, colors[num]);
                    num++;
                }

            }
            console.log(num);
            if (num != 0 && num!=5) {
                $('#planList div.planlist_wrap.planlist_car').append("<div style='height:30px'></div>");
            }else if (num == 5){
                $('#planList div.planlist_wrap.planlist_car').append("<div style='height:30px;padding:3px'>关注目标上限为5个</div>");
            }
        },

        //初始化开关目标点分布、轨迹展示按钮的逻辑
        initToggles: function() {
            this._bindExpandPath();
            this._bindClickPathInfo();
            _addTrackPlayerEvent(this);
            // _addTrackSliderOprationEvent(this);
            _applyComponentsJQuery();
            this.bindColorPicker();
            _resizeHeight();


            if (this._markGroup != undefined && this._map.hasLayer(this._markGroup)) {
                this._map.removeLayer(this._markGroup);
                delete this._markGroup;
            }

            this._markGroup = new L.MarkerClusterGroup({
                spiderfyOnMaxZoom: false,
                showCoverageOnHover: false,
                zoomToBoundsOnClick: false,
                iconCreateFunction: this._myiconCreateFunction
            });
            this._markGroup.showAimDistribute(this.aimList, this._map);

            var that = this;

            // $("#aimDistribute").change(function(e) {
            //     if (this.checked) {
            //         var ignoreAimIdList = [];
            //         $('input[name="reviewAim"]').each(function() {
            //             if (!$(this).is(':checked')) {
            //                 var ignoreAimId = $(this).closest('div.planTitle').attr('data-aim-id');
            //                 ignoreAimIdList.push(ignoreAimId);
            //             }
            //         });
            //         console.log(that.aimList)
            //         var showAimList = _.omit(that.aimList, ignoreAimIdList);
            //         console.log(showAimList)

            //         that._markGroup.hideAimDistribute(that._map);
            //         that._markGroup.showAimDistribute(showAimList, that._map);
            //     } else {
            //         that._markGroup.hideAimDistribute(that._map);
            //     }
            // });



            $('#backToQuery span.dir_close').on('click', function() {
                that.switchBox();
            });

            var taskId = $('#openAllResult').attr('taskId');
            $('#openAllResult').attr('href', '/smartquery/task-result.html?taskId=' + taskId);

            //绑定点击'显示目标'开关
            this.bindClickToggle();
        },
        switchBox: function() {
            $('#pathBox').hide();
            $('#offlineSearchBox').show();

        },

        bindColorPicker: function() {
            var that = this;
            $('.color-picker').on('change', function(e) {
                var aimId = $(this).closest('.planTitle').attr('data-aim-id');
                var newColor = e.currentTarget.value;
                // console.log('in _bindColorPicker')
                that._setTargetTraceColor(aimId, newColor);
            })

        },
        bindClickToggle: function() {
            var that = this;
            $('input[name="reviewAim"]').on('change', function(e) {
                var aimId = $(this).closest('.planTitle').attr('data-aim-id');
                if ($(this).is(':checked')) {
                    var color = $('.planTitle[data-aim-id="' + aimId + '"] .color-box').val();
                    that._showTargetTrace(aimId, color);
                    if ($('.planTitle[data-aim-id="' + aimId + '"]').hasClass('open')) {
                        $('.trackPlay[data-aim-id="' + aimId + '"]').show();
                    } else {
                        $('.trackPlay[data-aim-id="' + aimId + '"]').hide();
                    }
                } else {
                    that._hideTargerTrace(aimId);
                    $('.trackPlay[data-aim-id="' + aimId + '"]').hide();
                }
            });
        },



        //比例尺变化时的轨迹更新
        _mapZoomShow: function() {
            this._map.on('zoomend', function(e) {
                //移除播放的动态轨迹
                if (this.current != undefined) {
                    if (this._map.hasLayer(this.current.marker)) {
                        this.current.marker.stop();
                        this._map.removeLayer(this.current.marker);
                        this._resetTargetTrace(this.current.name, this.selectedTargerList[this.current.name]);
                    }
                    this.current = undefined;
                }
                for (var targetName in this.selectedTargerList) {
                    //移除上一个比例尺下的目标轨迹
                    if (this._map.hasLayer(this.targetList[targetName].smoothlines[this.selectedTargerList[targetName]])) {
                        this._map.removeLayer(this.targetList[targetName].smoothlines[this.selectedTargerList[targetName]]);
                    }
                    //移除上一个比例尺下的目标起点终点图标
                    this._map.removeLayer(this.targetList[targetName].icons[this.selectedTargerList[targetName]][0]);
                    this._map.removeLayer(this.targetList[targetName].icons[this.selectedTargerList[targetName]][1]);
                    //记录下当前地图的比例尺
                    this.selectedTargerList[targetName] = this._map.getZoom();
                    //显示新比例尺下的目标轨迹
                    this._map.addLayer(this.targetList[targetName].smoothlines[this.selectedTargerList[targetName]]);
                    //显示新比例尺下的目标起点终点图标
                    this._map.addLayer(this.targetList[targetName].icons[this.selectedTargerList[targetName]][0]);
                    this._map.addLayer(this.targetList[targetName].icons[this.selectedTargerList[targetName]][1]);
                }

                if ($(".trackPlay").length > 0 && $(".trackPlay").is(':visible')) {
                    _endingPlay($(".planTitle.open").attr("data-aim-id"), false, this);
                    // _setPlayerStatus(false, false, false, null, null, -1, -1, -1);
                    // $("#track-player-progressTip")[0].innerHTML = i18n.t('gismodule.manageAimTrack.playPanel.currentSpeed') + "1x"; //设置重放速度
                    var aimID = $(".planTitle.open").attr("data-aim-id");
                    var thisPlayer = _getCurPlayer(aimID);
                    $(thisPlayer + " .progress-bar").width("0%");
                    // speed = parseInt($(thisPlayer + ' .playing-speed').attr("data-cur-speed"));
                    $(thisPlayer + ' .playing-speed').attr("data-cur-speed","1");
                    $(thisPlayer + ' .playing-speed').html("1x");

                    $(thisPlayer + " .trackPlayerPause").hide();
                    $(thisPlayer + " .trackPlayerPlay").show();
                }
            }, this);

        },
        _fitTargetTrace: function(tagertName) {
            if (this.targetList[tagertName] != undefined) {
                this._map.fitBounds(this.targetList[tagertName].markers.getBounds());
            }
        },
        //展示选中目标的轨迹
        _showTargetTrace: function(tagertName, color) {
            if (this.targetList[tagertName] == undefined) {
                var target = this.aimList[tagertName]
                    //将目标的点信息聚合并生成轨迹信息
                var markers_layer = new L.MarkerClusterGroup({
                    spiderfyOnMaxZoom: false,
                    showCoverageOnHover: false,
                    zoomToBoundsOnClick: false,
                    iconCreateFunction: this._myiconCreateFunction
                });
                markers_layer.addPoints(target);
                this.targetList[target.name] = {};
                //将目标点分布添加到目标列表中
                this.targetList[target.name].markers = markers_layer;
            }
            //展示单个目标的聚合轨迹点
            this._map.addLayer(this.targetList[tagertName].markers);
            if (this.fitMapFlag) { //20160826
                this._map.fitBounds(this.targetList[tagertName].markers.getBounds());
            }
            if (this.targetList[tagertName].smoothlines == undefined) {
                this.targetList[tagertName].smoothlines = {};
                this.targetList[tagertName].smoothpoints = {};
                this.targetList[tagertName].movingmarker = {};
                this.targetList[tagertName].icons = {};
                if (this.targetList[tagertName].lines == undefined) {
                    this.cp[tagertName] = {};
                    //在各比例尺下分析获取聚类的森林结构
                    this._getClusterGrid(this.targetList[tagertName].markers, tagertName);
                    //生成目标轨迹，并将目标轨迹添加到目标列表中
                    var grid = this._gridLine(tagertName);
                    this.targetList[tagertName].lines = grid.gridlines;
                    this.targetList[tagertName].points = grid.gridpoints;
                }
                //目标轨迹运行时间对象
                this.targetMovingTimes[tagertName] = {};
                //对地图各比例尺下的轨迹进行平滑
                for (var z = 0; z <= this._map.getMaxZoom(); z++) {
                    //对目标轨迹进行平滑
                    var points = [];
                    var pointIndex = [];
                    var m = 0;
                    var inputPoints = this.targetList[tagertName].lines[z];
                    var vector_line_points = {};
                    for (var i = 0; i < this.targetList[tagertName].lines[z].length - 1; i++) {
                        var vector_name = this.targetList[tagertName].points[z][i].toString() + '-' + this.targetList[tagertName].points[z][i + 1].toString();
                        points.push([this.targetList[tagertName].lines[z][i].lat, this.targetList[tagertName].lines[z][i].lng]);
                        pointIndex.push(m);
                        if (!(vector_name in vector_line_points)) {
                            var pts = [];
                            pts.push([this.targetList[tagertName].lines[z][i].lng, this.targetList[tagertName].lines[z][i].lat]);
                            pts.push([this.targetList[tagertName].lines[z][i + 1].lng, this.targetList[tagertName].lines[z][i + 1].lat]);
                            var line_seg = bezier(pts);
                            vector_line_points[vector_name] = line_seg;
                        }
                        for (var j = 1; j < vector_line_points[vector_name].length - 1; j++) {
                            points.push([vector_line_points[vector_name][j][1], vector_line_points[vector_name][j][0]]);
                        }
                        m += vector_line_points[vector_name].length - 1;
                    }
                    pointIndex.push(m);
                    points.push([this.targetList[tagertName].lines[z][inputPoints.length - 1].lat, this.targetList[tagertName].lines[z][inputPoints.length - 1].lng]);

                    this.targetList[tagertName].smoothpoints[z] = points;
                    //生成平滑后的轨迹
                    this.targetList[tagertName].smoothlines[z] = new L.Polyline(points, {
                        weight: 2,
                        color: color,
                        dashArray: [8, 10],
                        delay: 1000,
                        className:'antpath'
                    });
                    //生成轨迹动画对象
                    this.targetList[tagertName].movingmarker[z] = new L.Marker.movingMarker(points, 1000 * inputPoints.length, {
                        color: color
                    });
                    //添加轨迹播放与话单数据联动事件
                    {
                        // this.targetList[tagertName].movingmarker[z].on('start', function(e) {
                        //     _setPhoneBillSelectedStyle(this.pc[tagertName][this.selectedTargerList[tagertName]][0], null);
                        // }, this);
                        // this.targetList[tagertName].movingmarker[z].on('station', function(e) {
                        //     _setPhoneBillSelectedStyle(this.pc[tagertName][this.selectedTargerList[tagertName]][e.index], null);
                        // }, this);
                        // this.targetList[tagertName].movingmarker[z].on('end', function(e) {
                        //     _setPhoneBillSelectedStyle(this.pc[tagertName][this.selectedTargerList[tagertName]][this.pc[tagertName][this.selectedTargerList[tagertName]].length - 1], null);
                        // }, this);
                        //为业务数据点添加特殊处理,起点与终点不处理
                        var pcIndex = {};
                        for (var i = 1; i < pointIndex.length - 1; i++) {
                            this.targetList[tagertName].movingmarker[z].addStation(pointIndex[i], 0);
                            pcIndex[pointIndex[i]] = this.pc[tagertName][z][i];
                        }
                        var pcs = this.pc[tagertName][z][0];
                        var pce = this.pc[tagertName][z][pointIndex.length - 1];
                        var len = this.pc[tagertName][z].length;
                        this.pc[tagertName][z] = pcIndex;
                        this.pc[tagertName][z][0] = pcs;
                        this.pc[tagertName][z][len - 1] = pce;
                        this.pc[tagertName][z].length = len;
                    }
                    //生成起点终点对象
                    this.targetList[tagertName].icons[z] = [new L.marker(points[0], {
                        icon: this.starticon
                    }), new L.marker(points[points.length - 1], {
                        icon: this.endicon
                    })];
                    //不同比例尺下设置目标运行时间
                    this.targetMovingTimes[tagertName][z] = 1000 * inputPoints.length;
                }
            }
            //在地图当前比例尺上添加目标平滑后的轨迹
            this._map.addLayer(this.targetList[tagertName].smoothlines[this._map.getZoom()]);
            //在地图当前比例尺上添加起点终点图标
            this._map.addLayer(this.targetList[tagertName].icons[this._map.getZoom()][0]);
            this._map.addLayer(this.targetList[tagertName].icons[this._map.getZoom()][1]);
            //记录所选目标及当前比例尺信息
            this.selectedTargerList[tagertName] = this._map.getZoom();
        },
        //移除选中目标的轨迹
        _hideTargerTrace: function(tagertName) {
            if (this.targetList[tagertName].pLayers != undefined) {
                this.filterTargetTrace(tagertName, 0, this.targetList[tagertName].pLayers.length - 1);
            }
            var z = this._map.getZoom();
            if (this.selectedTargerList[tagertName] != undefined) {
                delete this.selectedTargerList[tagertName];
            }
            //移除静态轨迹线
            if (this._map.hasLayer(this.targetList[tagertName].smoothlines[z])) {
                this._map.removeLayer(this.targetList[tagertName].smoothlines[z]);
            }
            //移除轨迹点
            if (this._map.hasLayer(this.targetList[tagertName].markers)) {
                this._map.removeLayer(this.targetList[tagertName].markers);
            }
            //移除起点终点图标
            if (this._map.hasLayer(this.targetList[tagertName].icons[z][0])) {
                this._map.removeLayer(this.targetList[tagertName].icons[z][0]);
            }
            if (this._map.hasLayer(this.targetList[tagertName].icons[z][1])) {
                this._map.removeLayer(this.targetList[tagertName].icons[z][1]);
            }
            //移除播放后的动态轨迹线
            if (this.current != undefined && this.current.name == tagertName) {
                if (this._map.hasLayer(this.current.marker)) {
                    this.current.marker.stop();
                    this._map.removeLayer(this.current.marker);
                    this._resetTargetTrace(this.current.name, z);
                }
                this.current = undefined;
            }
        },
        //设置目标轨迹线的颜色
        _setTargetTraceColor: function(tagertName, color) {
            if (this.targetList[tagertName].smoothlines != undefined) {
                var linesLayer = this.targetList[tagertName].smoothlines[this._map.getZoom()];
                for (var z = 0; z <= this._map.getMaxZoom(); z++) {
                    this.targetList[tagertName].smoothlines[z] = new L.Polyline(this.targetList[tagertName].smoothpoints[z], {
                        weight: 2,
                        color: color,
                        dashArray: [8, 10],
                        delay: 1000,
                        className:'antpath'
                    });
                    this.targetList[tagertName].movingmarker[z].options.color = color;
                }
                if (this._map.hasLayer(linesLayer)) {
                    this._map.removeLayer(linesLayer);
                    this._map.addLayer(this.targetList[tagertName].smoothlines[this._map.getZoom()]);
                }
            }
        },
        //播放目标轨迹，每次只播放一个目标，播放互斥
        playTargetTrace: function(targetName) {
            var z = this._map.getZoom();
            //判断当前是否没有目标在播放
            if (this.current == undefined) {
                //第一次播放，设置当前目标信息
                if (targetName in this.selectedTargerList) {
                    this.current = {};
                    this.targetList[targetName].movingmarker[z].addTo(this._map);
                    this.current.name = targetName;
                    this.current.marker = this.targetList[targetName].movingmarker[z];
                    //移除当前目标轨迹信息
                    if (this._map.hasLayer(this.targetList[targetName].smoothlines[z])) {
                        this._map.removeLayer(this.targetList[targetName].smoothlines[z]);
                    }
                }
            }
            //播放其他目标
            else if (this.current.name != targetName) {
                //移除之前目标播放的动态轨迹
                if (this._map.hasLayer(this.current.marker)) {
                    this.current.marker.stop();
                    this._map.removeLayer(this.current.marker);
                    this._resetTargetTrace(this.current.name, z);
                }
                //添加之前目标的静态轨迹
                if (!this._map.hasLayer(this.targetList[this.current.name].smoothlines[z])) {
                    this._map.addLayer(this.targetList[this.current.name].smoothlines[z]);
                }
                //设置当前目标信息
                this.targetList[targetName].movingmarker[z].addTo(this._map);
                this.current.name = targetName;
                this.current.marker = this.targetList[targetName].movingmarker[z];
                //移除当前目标轨迹信息
                if (this._map.hasLayer(this.targetList[targetName].smoothlines[z])) {
                    this._map.removeLayer(this.targetList[targetName].smoothlines[z]);
                }
            }
            //播放当前目标
            this.current.marker.start();
            //返回当前比例尺下目标的轨迹运行时间
            return this.targetMovingTimes[this.current.name][z];
        },
        //轨迹时间区间设置
        filterTargetTrace: function(targetName, startIndex, endIndex) {
            if (targetName in this.selectedTargerList) {
                if (this.targetName == targetName && this.startIndex == startIndex && this.endIndex == endIndex) {
                    return;
                }
                if (this.targetList[targetName].pLayers == undefined) {
                    this.targetList[targetName].pLayers = [];
                    for (var id in this.targetList[targetName].markers.markers_layer._layers) {
                        this.targetList[targetName].pLayers.push(this.targetList[targetName].markers.markers_layer._layers[id]);
                    }
                }
                if (this.targetList[targetName].pLayers != undefined) {
                    var len = this.targetList[targetName].pLayers.length;
                    if (startIndex < 0 || endIndex > len - 1 || startIndex >= endIndex) {
                        // console.log(i18n.t('gismodule.manageAimTrack.alert2'));
                        return;
                    }
                    if (len == (endIndex - startIndex + 1) && (endIndex - startIndex + 1) == this.targetList[targetName].markers.getLayers().length) {
                        return;
                    }
                    var i = 0;
                    //从头开始删点
                    for (; i < startIndex; i++) {
                        if (this.targetList[targetName].markers.hasLayer(this.targetList[targetName].pLayers[i])) {
                            this.targetList[targetName].markers.removeLayer(this.targetList[targetName].pLayers[i]);
                        }
                    }
                    //中间添加点
                    for (; i <= endIndex; i++) {
                        if (!this.targetList[targetName].markers.hasLayer(this.targetList[targetName].pLayers[i])) {
                            this.targetList[targetName].markers.addLayer(this.targetList[targetName].pLayers[i]);
                        }
                    }
                    //删到尾部的点
                    for (; i < len; i++) {
                        if (this.targetList[targetName].markers.hasLayer(this.targetList[targetName].pLayers[i])) {
                            this.targetList[targetName].markers.removeLayer(this.targetList[targetName].pLayers[i]);
                        }
                    }
                }
                var z = this.selectedTargerList[targetName];
                //移除当前目标轨迹信息
                if (this._map.hasLayer(this.targetList[targetName].smoothlines[z])) {
                    this._map.removeLayer(this.targetList[targetName].smoothlines[z]);
                }
                //移除起点终点图标
                if (this._map.hasLayer(this.targetList[targetName].icons[z][0])) {
                    this._map.removeLayer(this.targetList[targetName].icons[z][0]);
                }
                if (this._map.hasLayer(this.targetList[targetName].icons[z][1])) {
                    this._map.removeLayer(this.targetList[targetName].icons[z][1]);
                }
                //移除播放后的动态轨迹线
                if (this.current != undefined && this.current.name == targetName) {
                    if (this._map.hasLayer(this.current.marker)) {
                        this.current.marker.stop();
                        this._map.removeLayer(this.current.marker);
                    }
                    this.current = undefined;
                }
                this.targetName = targetName;
                this.startIndex = startIndex;
                this.endIndex = endIndex;
                var color = this.targetList[targetName].movingmarker[0].options.color;
                //重新计算并展示新的轨迹
                {
                    this.targetList[targetName].smoothlines = {};
                    this.targetList[targetName].smoothpoints = {};
                    this.targetList[targetName].movingmarker = {};
                    this.targetList[targetName].icons = {}; {
                        this.cp[targetName] = {};
                        //在各比例尺下分析获取聚类的森林结构
                        this._getClusterGrid(this.targetList[targetName].markers, targetName);
                        var grid = this._gridLine(targetName);
                        //生成目标轨迹，并将目标轨迹添加到目标列表中
                        this.targetList[targetName].lines = grid.gridlines;
                        this.targetList[targetName].points = grid.gridpoints;
                        //                        this.targetList[targetName].vector= grid.gridvector;
                    }
                    this.targetMovingTimes[targetName] = {};
                    //对地图各比例尺下的轨迹进行平滑
                    for (var z = 0; z <= this._map.getMaxZoom(); z++) {
                        //对目标轨迹进行平滑
                        var points = [];
                        var pointIndex = [];
                        var m = 0;
                        var inputPoints = this.targetList[targetName].lines[z];
                        var vector_line_points = {};
                        for (var i = 0; i < this.targetList[targetName].lines[z].length - 1; i++) {
                            var vector_name = this.targetList[targetName].points[z][i].toString() + '-' + this.targetList[targetName].points[z][i + 1].toString();
                            points.push([this.targetList[targetName].lines[z][i].lat, this.targetList[targetName].lines[z][i].lng]);
                            pointIndex.push(m);
                            if (!(vector_name in vector_line_points)) {
                                var pts = [];
                                pts.push([this.targetList[targetName].lines[z][i].lng, this.targetList[targetName].lines[z][i].lat]);
                                pts.push([this.targetList[targetName].lines[z][i + 1].lng, this.targetList[targetName].lines[z][i + 1].lat]);
                                var line_seg = bezier(pts);
                                vector_line_points[vector_name] = line_seg;
                            }
                            for (var j = 1; j < vector_line_points[vector_name].length - 1; j++) {
                                points.push([vector_line_points[vector_name][j][1], vector_line_points[vector_name][j][0]]);
                            }
                            m += vector_line_points[vector_name].length - 1;
                        }
                        pointIndex.push(m);
                        points.push([this.targetList[targetName].lines[z][inputPoints.length - 1].lat, this.targetList[targetName].lines[z][inputPoints.length - 1].lng]);

                        this.targetList[targetName].smoothpoints[z] = points;
                        //生成平滑后的轨迹
                        this.targetList[targetName].smoothlines[z] = new L.Polyline(points, {
                            weight: 2,
                            color: color,
                            dashArray: [8, 10],
                            delay: 1000,
                            className:'antpath'
                        });
                        //生成轨迹动画对象
                        this.targetList[targetName].movingmarker[z] = new L.Marker.movingMarker(points, 1000 * inputPoints.length, {
                            color: color
                        });
                        //添加轨迹播放与话单数据联动事件
                        {
                            // this.targetList[targetName].movingmarker[z].on('start', function(e) {
                            //     _setPhoneBillSelectedStyle(this.pc[targetName][this.selectedTargerList[targetName]][0], null);
                            // }, this);
                            // this.targetList[targetName].movingmarker[z].on('station', function(e) {
                            //     _setPhoneBillSelectedStyle(this.pc[targetName][this.selectedTargerList[targetName]][e.index], null);
                            // }, this);
                            // this.targetList[targetName].movingmarker[z].on('end', function(e) {
                            //     _setPhoneBillSelectedStyle(this.pc[targetName][this.selectedTargerList[targetName]][this.pc[targetName][this.selectedTargerList[targetName]].length - 1], null);
                            // }, this);
                            //为业务数据点添加特殊处理,起点与终点不处理
                            var pcIndex = {};
                            for (var i = 1; i < pointIndex.length - 1; i++) {
                                this.targetList[targetName].movingmarker[z].addStation(pointIndex[i], 0);
                                pcIndex[pointIndex[i]] = this.pc[targetName][z][i];
                            }
                            var pcs = this.pc[targetName][z][0];
                            var pce = this.pc[targetName][z][pointIndex.length - 1];
                            var len = this.pc[targetName][z].length;
                            this.pc[targetName][z] = pcIndex;
                            this.pc[targetName][z][0] = pcs;
                            this.pc[targetName][z][len - 1] = pce;
                            this.pc[targetName][z].length = len;
                        }
                        //生成起点终点对象
                        this.targetList[targetName].icons[z] = [new L.marker(points[0], {
                            icon: this.starticon
                        }), new L.marker(points[points.length - 1], {
                            icon: this.endicon
                        })];
                        //不同比例尺目标轨迹的运行时间
                        this.targetMovingTimes[targetName][z] = 1000 * inputPoints.length;
                    }
                    //在地图当前比例尺上添加目标平滑后的轨迹
                    this._map.addLayer(this.targetList[targetName].smoothlines[this._map.getZoom()]);
                    //在地图当前比例尺上添加起点终点图标
                    this._map.addLayer(this.targetList[targetName].icons[this._map.getZoom()][0]);
                    this._map.addLayer(this.targetList[targetName].icons[this._map.getZoom()][1]);
                }
            }
        },
        //终止播放
        terminate: function() {
            if (this.current != undefined) {
                var z = this._map.getZoom();
                this.current.marker.stop();
                this._map.removeLayer(this.current.marker);
                this._resetTargetTrace(this.current.name, z);
                //添加目标的静态轨迹
                if (!this._map.hasLayer(this.targetList[this.current.name].smoothlines[z])) {
                    this._map.addLayer(this.targetList[this.current.name].smoothlines[z]);
                }
                this.current = undefined;
            }
        },
        //暂停播放
        pauseTargetTrace: function() {
            if (this.current != undefined) {
                this.current.marker.pause();
            }
        },
        //快进播放
        speedUp: function() {
            if (this.current != undefined) {
                var len = this.current.marker._durations.length;
                for (var i = 0; i < len; i++) {
                    this.current.marker._durations[i] /= 2;
                }
            }
        },
        //慢进播放
        speedDown: function() {
            if (this.current != undefined) {
                var len = this.current.marker._durations.length;
                for (var i = 0; i < len; i++) {
                    this.current.marker._durations[i] *= 2;
                }
            }
        },
        //重新播放
        replayTargetTrace: function(targetName) {
           var z = this._map.getZoom();
            //判断当前是否没有目标在播放
            if (this.current == undefined) {
                //第一次播放，设置当前目标信息
                if (targetName in this.selectedTargerList) {
                    this.current = {};
                    this.targetList[targetName].movingmarker[z].addTo(this._map);
                    this.current.name = targetName;
                    this.current.marker = this.targetList[targetName].movingmarker[z];
                    //移除当前目标轨迹信息
                    if (this._map.hasLayer(this.targetList[targetName].smoothlines[z])) {
                        this._map.removeLayer(this.targetList[targetName].smoothlines[z]);
                    }
                }
            }
            //播放其他目标
            else if (this.current.name != targetName) {
                //移除之前目标播放的动态轨迹
                if (this._map.hasLayer(this.current.marker)) {
                    this.current.marker.stop();
                    this._map.removeLayer(this.current.marker);
                    this._resetTargetTrace(this.current.name, z);
                }
                //添加之前目标的静态轨迹
                if (!this._map.hasLayer(this.targetList[this.current.name].smoothlines[z])) {
                    this._map.addLayer(this.targetList[this.current.name].smoothlines[z]);
                }
                //设置当前目标信息
                this.targetList[targetName].movingmarker[z].addTo(this._map);
                this.current.name = targetName;
                this.current.marker = this.targetList[targetName].movingmarker[z];
                //移除当前目标轨迹信息
                if (this._map.hasLayer(this.targetList[targetName].smoothlines[z])) {
                    this._map.removeLayer(this.targetList[targetName].smoothlines[z]);
                }
            }
            //播放当前目标
            this.current.marker.start();

            if (this.current != undefined) {
                var z = this._map.getZoom();
                this.current.marker.stop();
                this._map.removeLayer(this.current.marker);
                this.current.marker = this._resetTargetTrace(this.current.name, z);
                this.current.marker.addTo(this._map);
                this.current.marker.start();
            }
        },
        //恢复特定比例尺下目标轨迹播放设置
        _resetTargetTrace: function(targetName, z) {
            var latlngs = this.targetList[targetName].smoothpoints[z];
            var len = this.targetList[targetName].lines[z].length;
            var color = this.targetList[targetName].movingmarker[z].options.color;
            var station = this.targetList[targetName].movingmarker[z]._stations;
            this.targetList[targetName].movingmarker[z] = new L.Marker.movingMarker(latlngs, 1000 * len, {
                color: color
            });
            this.targetList[targetName].movingmarker[z]._stations = station;
            return this.targetList[targetName].movingmarker[z];
        },
        //列表点击与地图联动事件
        _infoPopup: function(index, target) {
            if (target != undefined) {
                var markers = this.targetList[target].markers;
                var marker = markers.markers_layer._layers[this.pointsID[target][index]];
                var z = this._map.getZoom();
                if (marker != undefined) {
                    var pos = this.cp[target][z][marker._leaflet_id];
                    //查找其聚合的父亲
                    if (pos == undefined) {
                        pos = marker._latlng;
                    }
                    this._map.setView(pos);
                    this._map.openPopup(marker._popup._content, pos);
                }
            }
        },
        //目标生成轨迹变量初始化
        _init_cluster: function(target) {
            this.clusterPoints = {};
            this.clusterChildPoints = {};
            this.child_cluster = {};
            this.pointsID[target] = [];
            this.pointsArray = {};
            for (var i = 0; i <= this._map.getMaxZoom(); i++) {
                this.clusterPoints[i] = {};
                this.child_cluster[i] = {};
                this.cp[target][i] = {};
            }
        },
        //在地图各比例尺下生成轨迹
        _getClusterGrid: function(markers, target) {
            this._init_cluster(target);
            if (markers.getLayers().length === 0) {
                return;
            }
            var points = markers.getLayers();
            for (var i = 0; i < points.length; i++) {
                this.pointsID[target].push(points[i]._leaflet_id);
                this.pointsArray[points[i]._leaflet_id] = points[i]._latlng;
            }
            //根据id从小到大排序（即时间先后顺序）
            this.pointsID[target].sort(function(a, b) {
                return a - b;
            });
            //2016-3-29修改
            var gridClusters = markers._gridClusters;
            for (var z in gridClusters) {
                var grid = gridClusters[z]._grid;
                for (var key1 in grid) {
                    for (var key2 in grid[key1]) {
                        var leafletid = grid[key1][key2][0]._leaflet_id;
                        this.clusterPoints[z][leafletid] = grid[key1][key2][0]._latlng;
                        this.clusterChildPoints[leafletid] = grid[key1][key2][0].getAllChildMarkers();
                        for (var j = 0; j < this.clusterChildPoints[leafletid].length; j++) {
                            this.child_cluster[z][this.clusterChildPoints[leafletid][j]._leaflet_id] = leafletid;
                            this.cp[target][z][this.clusterChildPoints[leafletid][j]._leaflet_id] = this.clusterPoints[z][leafletid];
                        }
                    }
                }
            }
        },
        //递归的获取各比例尺下聚类的数据信息，（聚类为数据结构为森林）
        _getClusterData: function(zoom, childCluster, target) {
            if (zoom > this._map.getMaxZoom()) {
                return;
            }
            var leafletid = childCluster._leaflet_id;
            this.clusterPoints[zoom][leafletid] = childCluster._latlng;
            this.clusterChildPoints[leafletid] = childCluster.getAllChildMarkers();
            for (var j = 0; j < this.clusterChildPoints[leafletid].length; j++) {
                this.child_cluster[zoom][this.clusterChildPoints[leafletid][j]._leaflet_id] = leafletid;
                this.cp[target][zoom][this.clusterChildPoints[leafletid][j]._leaflet_id] = this.clusterPoints[zoom][leafletid];
            }
            for (var i = 0; i < childCluster._childClusters.length; i++) {
                this._getClusterData(zoom + 1, childCluster._childClusters[i], target);
            }
        },
        //根据各比例尺聚类生成对应比例尺下的轨迹
        _gridLine: function(target) {
            var grid = {};
            var gridpoints = {};
            var gridlines = {};
            this.pc[target] = {};
            for (var i = 0; i <= this._map.getMaxZoom(); i++) {
                this.pc[target][i] = {};
                var index = 0;
                //points array
                var p_array = [];
                var pre_cluster_id = null;
                //轨迹线段向量
                var pointsSeq = []; //记录点的ID序列
                var line_vector = {};
                //遍历点集合，进行连线
                for (var j = 0; j < this.pointsID[target].length; j++) {
                    //检测是否属于聚合点
                    if (this.pointsID[target][j] in this.child_cluster[i]) {
                        if (pre_cluster_id === this.child_cluster[i][this.pointsID[target][j]]) {
                            continue;
                        } else {
                            p_array.push(this.clusterPoints[i][this.child_cluster[i][this.pointsID[target][j]]]);
                            pre_cluster_id = this.child_cluster[i][this.pointsID[target][j]];
                            this.pc[target][i][index++] = j;
                            pointsSeq.push(pre_cluster_id);
                        }
                    } else {
                        pre_cluster_id = null; //20160825
                        p_array.push(this.pointsArray[this.pointsID[target][j]]);
                        this.pc[target][i][index++] = j;
                        pointsSeq.push(this.pointsID[target][j]);
                    }
                }
                this.pc[target][i].length = index;
                gridlines[i] = p_array;
                gridpoints[i] = pointsSeq;
            }
            grid.gridlines = gridlines;
            grid.gridpoints = gridpoints;
            return grid;
        },
        //点聚类图标样式控制
        _myiconCreateFunction: function(cluster) {
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

        AddTargetData: function(json) {
            if (_.keys(this.aimList).length <= 5) {
                if (json.data.length > 0) {
                    this.aimList[json.name] = json;
                }

            } else {
                console.log('关注目标上限为5个，更多数据不被加载');
            }

        },
        ClearTargetData: function() {
            this.aimList = {};
        },
        _bindExpandPath: function() {
            var that = this;
            $('.planTitle').on('click', function(e) {
                e.stopPropagation();
                var aimId = $(this).attr('data-aim-id');
                $('.trackPlay').hide();
                if ($(this).hasClass('open')) {
                    $(this).removeClass('open');
                    // $(this).removeClass('current');
                    $('div.sidebar i', this).removeClass('fa-angle-up');
                    $('div.sidebar i', this).addClass('fa-angle-down');

                    // that._hideTargerTrace($(this).attr('data-aim-id'));

                    //关闭后需要去除选中样式
                    $('.plan.plan-nobus dt').removeClass('selected-info');
                } else {
                    //切换tab后需要去除选中样式
                    $('.plan.plan-nobus dt').removeClass('selected-info');
                    if ($("#showTargetBtn" + aimId)[0].checked == true) {
                        $('.trackPlay[data-aim-id="' + aimId + '"]').show();
                    } else {
                        $('.trackPlay[data-aim-id="' + aimId + '"]').hide();
                    }
                    var $openedTab = $('.planTitle.open');

                    if ($openedTab.length != 0) {
                        // that._hideTargerTrace($openedTab.attr('data-aim-id'));
                        $openedTab.removeClass('open');
                        $('div.sidebar i', $openedTab).removeClass('fa-angle-up').addClass('fa-angle-down');;
                    }

                    $(this).addClass('open');
                    $('div.sidebar i', this).removeClass('fa-angle-down').addClass('fa-angle-up');

                    $('.planTitle.open+.trackPlay .playing-speed').attr("data-cur-speed", "1");
                    $('.planTitle.open+.trackPlay .playing-speed').html("1" + "x");

                    var index = parseInt($(this).attr('index'));
                    $('#dirBox').scrollTop(index * 100);

                    that._fitTargetTrace($(this).attr('data-aim-id'), $('.color-picker', this).val());
                }

            })

            //点击颜色选择框和开启显示目标时不打开轨迹详情
            $('.planTitle .control-line input,.planTitle .control-line label').on('click', function(e) {
                e.stopPropagation();
            })
        },

        _bindClickPathInfo: function() {
            var that = this;
            $('.plan.plan-nobus dt').on('click', function() {
                // console.log('in click path info')
                var clickIndex = $(this).attr('index');
                var aimId = $(this).closest('.plan.plan-nobus').attr('data-aim-id');
                that._infoPopup(clickIndex, aimId);
                $('.plan.plan-nobus dt').removeClass('selected-info');
                $(this).addClass('selected-info');
            })
        },

        hideBox: function() {
            //$('#pathBox').empty();
            $('#pathBox').hide();
        },
        showBox: function() {

        },
        clearBox: function() {

        }

    };

    function _appendBox() {
        if ($('#pathBox').length == 0) {
            $('#boxes').append("<div id='pathBox' tabindex='-1' class='blue-scroll-bar'></div>");
        }
    }

    function _render() {
        _appendBox();
        $('#pathBox').append(tpl_path_box);
        _i18nOverall();

        _applyComponentsJQuery();

    }


    function _applyComponentsJQuery() {
        $('.chkbox').chkbox();
        $('.rdo').rdo();
        $('.chkbox2').chkbox2();

        $('.control-line').on('click', function(e) {
            e.stopPropagation();
        });
        // $('.control-line').on('focus',function(e){
        //     e.stopPropagation();
        // });
    }

    function _i18nOverall() {
        $('label[for=aimDistribute].title-label').html(i18n.t('gismodule.manageAimTrack.trackPanel.distributeBtn'));
    }

    //针对小屏幕显示器，结果高度需要限制。在结果可见之后才能调用此函数
    function _resizeHeight() {
        var restHeight = $(window).innerHeight() - $('#toolbar').offset().top - 50;
        var pathDisplayBoxHeight = restHeight - 100;
        $('#pathDisplayBox').css({
            'max-height': pathDisplayBoxHeight
        });
        $('#dirBox').css({
            'max-height': pathDisplayBoxHeight
        });

    }





    //生成轨迹播放器
    function _createTrackPlayPanel(aimId, beginTime, endTime, endIndex) {
        var innerHtml =
            '<div class="trackPlay" data-aim-id="' + aimId + '">' +
            '<table style="width: 100%;"> ' +
            '<tr><td id="track-player-status" class="track-player-status-style" colspan="6">' + i18n.t('gismodule.manageAimTrack.playPanel.stateFilter') + '</td></tr>' +
            '<tr style="height: 20px;">' +
            '<td colspan="6" style="padding: 0px 10px;">' +
            '<div style="position: relative;">' +
            '<div id="rang-progressBar-full" class="rang-progressBar-full-style"></div>' +
            '<div class="pre-rang-progressBar-full-style"></div>' +
            '<div class="after-rang-progressBar-full-style"></div>' +
            '<div id="rang-progressBar-left" class="rang-progressBar-left-style"></div>' +
            '<div id="rang-progressBar-right" class="rang-progressBar-right-style"></div>' +
            '<div id="rang-progressBar-excute_parent" style="position: relative;height: 5px; width: 250px;left: 8px;">' +
            '<div id="rang-progressBar-excute" class="rang-progressBar-excute-style"></div>' +
            '</div>' +
            '<div id="rang-slider-begin" class="rang-slider-begin-style" startIndex="0"></div>' +
            '<div id="rang-slider-end" class="rang-slider-end-style" endIndex="' + endIndex + '"></div>' +
            '<div id="rang-slider-excute" class="rang-slider-excute-style"></div>' +
            '</div>' +
            '</td>' +
            '</tr>' +
            '<tr style="height: 30px;">' +
            '<td colspan="6">' +
            '<table style="width: 100%;">' +
            '<tr>' +
            '<td id="rang-beginTime-tip" class="rang-time-tip">' + beginTime[0] + '<br/>' + beginTime[1] + '</td>' +
            '<td id="rang-selectedBeginTime-tip" class="rang-selectedTime-tip"></td>' +
            '<td id="rang-selectedEndTime-tip" class="rang-selectedTime-tip"></td>' +
            '<td id="rang-endTime-tip" class="rang-time-tip" style="text-align: right;">' + endTime[0] + '<br/>' + endTime[1] + '</td>' +
            '</tr>' +
            '</table>' +
            '</td>' +
            '</tr>' +
            '<tr style="height: 30px;">' +
            '<td style="width: 20%;"></td>' +
            '<td style="width: 15%;text-align: center;"><img id="trackPlayerSlow" title="' + i18n.t('gismodule.manageAimTrack.playPanel.speeddown') + '" src="../js/components/gisWidget/manageAimTrackModule/image/media_rewind_24_p.png" height="20px" width="20px"/></td>' +
            '<td style="width: 15%;text-align: center;">' +
            '<img id="trackPlayerPlay" title="' + i18n.t('gismodule.manageAimTrack.playPanel.play') + '" src="../js/components/gisWidget/manageAimTrackModule/image/media_play_24_p.png" height="20px" width="20px"/>' +
            '<img id="trackPlayerPause" title="' + i18n.t('gismodule.manageAimTrack.playPanel.pause') + '" src="../js/components/gisWidget/manageAimTrackModule/image/media_pause_24_p.png" height="20px" width="20px" style="display: none;"/>' +
            '</td>' +
            '<td style="width: 15%;text-align: center;"><img id="trackPlayerFast" title="' + i18n.t('gismodule.manageAimTrack.playPanel.speedup') + '" src="../js/components/gisWidget/manageAimTrackModule/image/media_fast_forward_24_p.png" height="20px" width="20px"/></td>' +
            '<td style="width: 15%;text-align: center;"><img id="trackPlayerReplay" title="' + i18n.t('gismodule.manageAimTrack.playPanel.replay') + '" src="../js/components/gisWidget/manageAimTrackModule/image/media_stop_24_p.png" height="20px" width="20px"/></td>' +
            '<td style="width: 20%;"></td>' +
            '</tr>' +
            '<tr><td id="track-player-progressTip" class="track-player-progressTip-style" colspan="6" progress="1">' + i18n.t('gismodule.manageAimTrack.playPanel.currentSpeed') + '1x</td></tr>' +
            '</table>' +
            '</div>';
        return innerHtml;
    }

    function _getCurPlayer(aimID) {
        var curPlayer = "div[data-aim-id=" + aimID + "][class='trackPlay']";
        return curPlayer;
    }
    //添加播放器事件
    function _addTrackPlayerEvent(thisObject) {
        //播放
        $(".trackPlayerPlay").click(function() {
            //更改图标状态
            $(this).hide();
            var aimID = $(this).closest('.trackPlay').attr("data-aim-id");
            var thisPlayer = _getCurPlayer(aimID);
            $(thisPlayer + " .trackPlayerPause").show();
            //设置轨迹状态显示
            // $("#track-player-status")[0].innerHTML = i18n.t('gismodule.manageAimTrack.playPanel.statePlay');

            //设置播放速度提示（不为0时保持原速度）
            // var progressTip = $("#track-player-progressTip");
            // if (progressTip.attr("progress") == "0") {
            //     progressTip.attr("progress", "1");
            //     progressTip[0].innerHTML = i18n.t('gismodule.manageAimTrack.playPanel.currentSpeed') + "1x";
            // }


            //设置当前播放的轨迹颜色不可更改
            var colors = $('.color-box');
            for (var i = 0; i < colors.length; i++) {
                if ($(colors[i]).attr("Id") == aimID) {
                    $(colors[i]).attr("disabled", "true");
                    $(colors[i]).css("cursor", "default");
                    $(colors[i]).attr("title", i18n.t('gismodule.manageAimTrack.info1'));
                    break;
                }
            }

            //调用轨迹播放接口
            totalTime = thisObject.playTargetTrace(aimID);
            //set speed
            // if (excuteProcess) {
            //     speed = parseInt($(thisPlayer + ' .playing-speed').attr("data-cur-speed"));
            //     for (var i = 1; i < speed; i++) {
            //         thisObject.speedUp();
            //     }
            // }
            //播放器执行播放
            _playerProcessBarExcutePlay(aimID, thisPlayer, thisObject);
        });

        //暂停
        $(".trackPlayerPause").click(function() {
            //更改图标状态
            $(this).hide();
            var aimID = $(this).closest('.trackPlay').attr("data-aim-id");
            var thisPlayer = _getCurPlayer(aimID);
            $(thisPlayer + " .trackPlayerPlay").show();

            //设置轨迹状态显示
            // $("#track-player-status")[0].innerHTML = i18n.t('gismodule.manageAimTrack.playPanel.statePause');

            //调用轨迹播放暂停接口
            thisObject.pauseTargetTrace();
            // clearTimeout(timeControl);
            clearInterval(timeControl);
        });

        //减速
        $(".trackPlayerSlow").click(function() {
            var aimID = $(this).closest('.trackPlay').attr("data-aim-id");
            var thisPlayer = _getCurPlayer(aimID);
            //设置播放速度提示
            var progressTip = $(thisPlayer + " .playing-speed");
            if (progressTip.attr("data-cur-speed") == "1") {
                return;
            }
            if (thisObject.current == undefined) {
                return;
            }
            var progress = parseInt(progressTip.attr("data-cur-speed"));
            progress--;
            progressTip.attr("data-cur-speed", progress.toString());
            progressTip.html(progress + "x");

            //调用轨迹播减速停接口
            thisObject.speedDown();
            speed = parseInt($(thisPlayer + ' .playing-speed').attr("data-cur-speed"));
        });

        //加速
        $(".trackPlayerFast").click(function() {
            //设置播放速度提示
            var aimID = $(this).closest('.trackPlay').attr("data-aim-id");
            var thisPlayer = _getCurPlayer(aimID);
            //设置播放速度提示
            var progressTip = $(thisPlayer + " .playing-speed");
            if (progressTip.attr("data-cur-speed") == "4") {
                return;
            }
            if (thisObject.current == undefined) {
                return;
            }

            var progress = parseInt(progressTip.attr("data-cur-speed"));
            progress++;
            progressTip.attr("data-cur-speed", progress.toString());
            progressTip.html(progress + "x");

            //调用轨迹播加速停接口
            thisObject.speedUp();
            speed = parseInt($(thisPlayer + ' .playing-speed').attr("data-cur-speed"));
        });

        //重放
        $(".trackPlayerReplay").click(function() {
            //设置播放器状态
            var aimID = $(this).closest('.trackPlay').attr("data-aim-id");
            var thisPlayer = _getCurPlayer(aimID);
            var progressTip = $(thisPlayer + " .playing-speed");
            progressTip.attr("data-cur-speed", "1");
            progressTip.html("1" + "x");

            $(thisPlayer + " .trackPlayerPause").show();
            $(thisPlayer + " .trackPlayerPlay").hide();

            clearInterval(timeControl);
            excuteProcess = 0; //计数设为0
            timeControl = null;

            thisObject.replayTargetTrace(aimID); //调用轨迹重放接口
            var aimID = $(this).closest('.trackPlay').attr("data-aim-id");
            var thisPlayer = _getCurPlayer(aimID);
            _playerProcessBarExcutePlay(aimID, thisPlayer, thisObject); //开始播放
        });
    }

    //播放器状态(标记是否为重放操作,标记是否播放完毕,标记是否为播放器初始化，话单开始时间，话单结束时间，话单选择范围起始索引百分比，话单选择范围末尾索引百分比，话单总量)
    function _setPlayerStatus(isReplay, isEnding, isInit, beginTime, endTime, leftPercent, rightPercent, totalNum) {
        if (isReplay) //若是“重放”
        {
            $("#track-player-status")[0].innerHTML = i18n.t('gismodule.manageAimTrack.playPanel.statePlay'); //修改状态提示
            $("#trackPlayerPlay").hide(); //隐藏“播放”键
            $("#trackPlayerPause").show(); //显示“暂停”键
            $("#track-player-progressTip")[0].innerHTML = i18n.t('gismodule.manageAimTrack.playPanel.currentSpeed') + "1x"; //设置重放速度
            var progress = parseInt($("#track-player-progressTip").attr("progress"));
            speed = speed / Math.pow(2, progress - 1); //reset the player speed
            $("#track-player-progressTip").attr("progress", "1");
        } else {
            $("#track-player-status")[0].innerHTML = i18n.t('gismodule.manageAimTrack.playPanel.stateFilter');
            $("#trackPlayerPlay").show();
            $("#trackPlayerPause").hide();
            //$("#track-player-progressTip")[0].innerHTML = "当前播放速度0x";
            //$(".track-player-progressTip").attr("progress", "0");
        }

        if (isEnding) //若是播放结束
        {
            $("#track-player-status")[0].innerHTML = i18n.t('gismodule.manageAimTrack.playPanel.stateFinish'); //修改状态提示
            $("#rang-progressBar-excute").css({
                "left": 0,
                "width": "100%"
            });
        } else {
            //设置执行进度为0
            $("#rang-progressBar-excute").css({
                "left": 0,
                "width": 0
            });
        }

        if (isInit) {
            $("#track-player-progressTip")[0].innerHTML = i18n.t('gismodule.manageAimTrack.playPanel.currentSpeed') + "1x"; //设置重放速度
            var progress = parseInt($("#track-player-progressTip").attr("progress"));
            speed = speed / Math.pow(2, progress - 1); //reset the player speed
            $("#track-player-progressTip").attr("progress", "1");
            if (!beginTime[1]) {
                beginTime[1] = '';
            }
            if (!endTime[1]) {
                endTime[1] = '';
            }
            $("#rang-beginTime-tip")[0].innerHTML = beginTime[0] + '<br/>' + beginTime[1]; //设置话单开始时间
            $("#rang-endTime-tip")[0].innerHTML = endTime[0] + '<br/>' + endTime[1]; //设置话单结束时间
            var phoneBillDataObj = $("." + $(".activeTab").attr("tabName")); //获取当前活动的话单列表对象

            //当没有选择话单范围（默认为最大范围）时，不必显示选中范围起止时间
            var startIndex = parseInt(totalNum * leftPercent);
            var endIndex = totalNum - parseInt(totalNum * rightPercent) - 1;
            if (startIndex != 0 || endIndex < (totalNum - 1)) {
                var selectStartTime = $(phoneBillDataObj[0].children[startIndex]).attr("time").split(" ");
                var selectEndTime = $(phoneBillDataObj[0].children[endIndex]).attr("time").split(" ");
                $("#rang-selectedBeginTime-tip")[0].innerHTML = selectStartTime[0] + "<br/>" + selectStartTime[1]; //设置话单范围起始时间
                $("#rang-selectedEndTime-tip")[0].innerHTML = selectEndTime[0] + "<br/>" + selectEndTime[1]; //设置话单范围结束时间
                $("#rang-selectedBeginTime-tip").show();
                $("#rang-selectedEndTime-tip").show();
            } else {
                $("#rang-selectedBeginTime-tip").innerHTML = ""; //设置话单范围起始时间
                $("#rang-selectedEndTime-tip").innerHTML = ""; //设置话单范围结束时间
                $("#rang-selectedBeginTime-tip").hide();
                $("#rang-selectedEndTime-tip").hide();
            }
            $("#rang-slider-begin").attr("startindex", startIndex);
            $("#rang-slider-end").attr("endindex", endIndex);

            //设置话单选择范围
            var barWidth = parseInt($("#rang-progressBar-full")[0].offsetWidth); //获取进度条宽度
            $("#rang-progressBar-left").css("width", parseInt(barWidth * leftPercent)); //左侧范围
            $("#rang-progressBar-right").css({
                "left": barWidth - parseInt(barWidth * rightPercent - 8),
                "width": parseInt(barWidth * rightPercent)
            }); //右侧范围
            var left = parseInt($("#rang-progressBar-left").css("left")) + parseInt($("#rang-progressBar-left").css("width"));
            var right = parseInt($("#rang-progressBar-right").css("left"));
            $("#rang-slider-begin").css("left", left - 8); //“开始”滑块
            $("#rang-slider-end").css("left", right); //“结束”滑块
            $("#rang-progressBar-excute_parent").css({
                "left": left,
                "width": barWidth - parseInt(barWidth * leftPercent) - parseInt(barWidth * rightPercent)
            });
        }
    }

    //结束播放（播放完毕、正在播放时目标切换时调用）
    //参数：aimID（目标ID），isFinish（标记是否播放完毕）
    function _endingPlay(aimID, isFinish, thisObject) {
        if (timeControl != null) {
            // clearTimeout(timeControl); //终止播放轨迹播放器
            clearInterval(timeControl);
            excuteProcess = 0; //计数设为0
            timeControl = null;
        }

        //设置播放完毕的轨迹颜色可更改
        var colors = $('.color-box');
        for (var i = 0; i < colors.length; i++) {
            if ($(colors[i]).attr("Id") == aimID) {
                $(colors[i]).removeAttr("disabled");
                $(colors[i]).css("cursor", "pointer");
                $(colors[i]).removeAttr("title");
                break;
            }
        }

        if (isFinish) {
            var thisPlayer = "div[data-aim-id=" + aimID + "][class='trackPlay']";
            $(thisPlayer + ' .trackPlayerPlay').show();
            $(thisPlayer + '.trackPlayerPause').hide();
            // $('.progress-bar').width('0px');
            // _setPlayerStatus(false, true, false, null, null, -1, -1, -1); //修改播放器状态，标记播放完毕
        } else {
            thisObject.terminate(); //终止播放轨迹
        }

        //若当前有话单列表中的话单处于选中状态，则取消对话单的选中
        var selectBill = $(".talkBubble-select");
        if (selectBill.length > 0) {
            selectBill.removeClass("talkBubble-select")
                .addClass("talkBubble");
        }
    }

    //添加轨迹筛选进度条的操作事件
    function _addTrackSliderOprationEvent(thisObject) {
        var move_begin = false;
        var move_end = false;
        var begin_x, end_x;

        $("#rang-slider-begin").mousedown(function(e) {
            _endingPlay($(".planTitle.open").attr("data-aim-id"), false, thisObject); //结束播放
            move_begin = true; //设置开始移动标识
            begin_x = parseInt($("#rang-slider-begin").css("width")) - (e.pageX - parseInt($("#rang-slider-begin").css("left"))); //计算点击的位置距离“开始”滑块右侧的距离
        });
        $("#rang-slider-end").mousedown(function(e) {
            _endingPlay($(".planTitle.open").attr("data-aim-id"), false, thisObject); //结束播放
            move_end = true; //设置开始移动标识
            end_x = e.pageX - parseInt($("#rang-slider-end").css("left")); //计算点击的位置距离“结束”滑块左侧的距离
        });
        $(document).mousemove(function(e) {
            if (move_begin) {
                var sliderWidth = parseInt($("#rang-slider-begin").css("width")); //“开始”滑块的宽度
                var sliderRight = e.pageX + begin_x; //计算若滑块移动后，滑块右侧的位置

                var barLeft = parseInt($("#rang-progressBar-full")[0].offsetLeft); //进度条左侧偏移量
                var sliderEndLeft = parseInt($("#rang-slider-end").css("left")); //“结束”滑块左侧位置

                //移动后，“开始”滑块右侧的位置应该介于进度条左侧和“结束”滑块左侧位置
                if ((sliderRight >= barLeft) && (sliderRight <= sliderEndLeft)) {
                    //设置“开始”滑块的位置
                    $("#rang-slider-begin").css("left", sliderRight - sliderWidth);
                    //设置左侧灰色进度条的宽度
                    $("#rang-progressBar-left").css("width", sliderRight - barLeft);
                }
            }
            if (move_end) {
                var sliderLeft = e.pageX - end_x; //计算若滑块移动后，滑块左侧的位置
                //进度条右侧位置
                var barRight = parseInt($("#rang-progressBar-full")[0].offsetLeft) + parseInt($("#rang-progressBar-full")[0].offsetWidth);
                //“开始”滑块右侧位置
                var sliderStartRight = parseInt($("#rang-slider-begin")[0].offsetLeft) + parseInt($("#rang-slider-begin")[0].offsetWidth);
                //移动后，“结束”滑块左侧的位置应该介于“开始”滑块右侧位置和进度条右侧之间
                if ((sliderLeft >= sliderStartRight) && (sliderLeft <= barRight)) {
                    //设置“结束”滑块的位置
                    $("#rang-slider-end").css("left", sliderLeft);
                    //设置右侧灰色进度条的位置及宽度
                    $("#rang-progressBar-right").css("left", sliderLeft).css("width", barRight - sliderLeft);
                }
            }
        }).mouseup(function() {
            if (!move_begin && !move_end) {
                return;
            }

            move_begin = false;
            move_end = false;

            var barWidth = parseInt($("#rang-progressBar-full")[0].offsetWidth);
            var leftPercent = parseInt($("#rang-progressBar-left").css("width")) / barWidth;
            var rightPercent = parseInt($("#rang-progressBar-right").css("width")) / barWidth;
            var dataCount = thisObject.aimList[$(".planTitle.open").attr("data-aim-id")].data.length;
            var phoneBills = $('.planTitle.open');
            var startIndex = parseInt(dataCount * leftPercent);
            var endIndex = dataCount - parseInt(dataCount * rightPercent) - 1;
            var beginTime = phoneBills.attr("data-begin-time").split(" ");
            var endTime = phoneBills.attr("data-end-time").split(" ");

            _setPlayerStatus(false, false, true, beginTime, endTime, leftPercent, rightPercent, dataCount); //设置播放器
            thisObject.filterTargetTrace($(".planTitle.open").attr("data-aim-id"), startIndex, endIndex); //筛选轨迹范围
            // _setPhoneBillRange(startIndex, endIndex, leftPercent, rightPercent, $(".activeTab").attr("tabName")); //过滤话单列表
        });
    }

    //播放器进度条执行播放
    var totalTime = 0; //总时间
    var excuteProcess = 0; //计数器
    var timeControl = null; //计时器
    var perInterval = 0; //时间间隔
    var excuteLength = 0; //经度条执行长度
    var speed = 1; //当前速度
    //计时方法
    function startTimeout(aimID, thisPlayer, thisObject) {
        // if (excuteProcess < 100) {
        //     //设置播放进度条的宽度
        //     // document.getElementById("rang-progressBar-excute").style.width = excuteProcess + 1 + "%";
        //     console.log(thisPlayer)
        //     $(thisPlayer + ' .progress-bar').width(excuteProcess + 5 + "%");
        //     speed = parseInt($(thisPlayer + ' .playing-speed').attr("data-cur-speed"));
        //     excuteProcess = excuteProcess + speed;
        //     timeControl = setTimeout(startTimeout(aimID,thisPlayer,thisObject), perInterval);
        // } else {
        //     //更新状态(播放完毕)
        //     _endingPlay($(".planTitle.open").attr("data-aim-id"), true, thisObject);
        // }

        timeControl = setInterval(function() {
            $(thisPlayer + ' .progress-bar').width(excuteProcess + 5 + "%");
            speed = parseInt($(thisPlayer + ' .playing-speed').attr("data-cur-speed"));
            excuteProcess = excuteProcess + Math.pow(2, (speed - 1));
            if (excuteProcess > 100) {
                clearInterval(timeControl);
                _endingPlay($(".planTitle.open").attr("data-aim-id"), true, thisObject);
            }
        }, perInterval);
    }

    function _playerProcessBarExcutePlay(aimID, thisPlayer, thisObject) {
        //设置播放进度条的起始位置
        // $("#rang-progressBar-excute_parent").css("left", parseFloat($("#rang-slider-begin").css("left")) + 8);
        //计算时间间隔
        // console.log(totalTime);
        perInterval = totalTime / 100;
        //设置进度条执行长度
        // excuteLength = parseFloat($("#rang-slider-end").css("left")) - (parseFloat($("#rang-slider-begin").css("left")) + parseFloat($("#rang-slider-begin").css("width"))) + 1;
        // $("#rang-progressBar-excute_parent").css("width", excuteLength);
        //开始执行
        startTimeout(aimID, thisPlayer);
    }


    // //查看目标点分布
    // L.MarkerClusterGroup.prototype.showAimDistribute = function(aimListArgs, map) {
    //     if (this.markers_layer != undefined) {
    //         this.addTo(map);
    //         map.fitBounds(this.markers_layer.getBounds());
    //         return;
    //     }
    //     //定义点要素类图层
    //     this.markers_layer = L.featureGroup();

    //     for (aim in aimListArgs) {
    //         var lat_index = -1; //纬度索引位置
    //         var lon_index = -1; //经度索引位置
    //         var time_index = -1; //时间索引位置
    //         var aimName = aimListArgs[aim].name; //目标名称信息
    //         var lat_name = aimListArgs[aim].latitude; //纬度信息名称
    //         var lon_name = aimListArgs[aim].longitude; //经度信息名称
    //         var time_name = aimListArgs[aim].time; //时间信息名称

    //         //找出纬度、经度、时间对应的索引位置
    //         for (var i = 0; i < aimListArgs[aim].columns.length; i++) {
    //             if (aimListArgs[aim].columns[i] == lat_name) {
    //                 lat_index = i;
    //                 continue;
    //             }
    //             if (aimListArgs[aim].columns[i] == lon_name) {
    //                 lon_index = i;
    //                 continue;
    //             }
    //             if (aimListArgs[aim].columns[i] == time_name) {
    //                 time_index = i;
    //             }
    //         }

    //         //遍历数据
    //         for (var i = 0; i < aimListArgs[aim].data.length; i++) {
    //             var pointInfo = {};
    //             var lat_value = -1; //纬度值
    //             var lon_value = -1; //经度值
    //             var time_value = ""; //时间值
    //             var thisData = aimListArgs[aim].data[i];

    //             for (var j = 0; j < thisData.length; j++) {
    //                 var pointCol = ""; //列名
    //                 var pointVal = thisData[j]; //列值
    //                 switch (j) {
    //                     case lat_index:
    //                         pointCol = i18n.t('gismodule.manageAimTrack.tooltipCol.lat');
    //                         lat_value = parseFloat(pointVal);
    //                         break;
    //                     case lon_index:
    //                         pointCol = i18n.t('gismodule.manageAimTrack.tooltipCol.lng');
    //                         lon_value = parseFloat(pointVal);
    //                         break;
    //                     case time_index:
    //                         pointCol = i18n.t('gismodule.manageAimTrack.tooltipCol.time');
    //                         time_value = pointVal;
    //                         break;
    //                     default:
    //                         pointCol = aimListArgs[aim].columns[j];
    //                 }

    //                 pointInfo[pointCol] = pointVal;
    //             }

    //             //定义点
    //             //                var toolTipStr = '<div class="portlet-extend"><div class="portlet-body-extend-popup"><table><tr><th>地址</th><td>' + address + '</td></tr><tr  style="background-color: white;"><th>类别</th><td>' + kindName + '</td></tr><tr><th >地图坐标</th><td>(经度:' + longitudeVal + ',纬度:' + latitudeVal + ')</td></tr></table></div></div>';
    //             //设置点的tooltip信息
    //             var toolTipStr = '<div class="portlet-extend"><div class="aim-distribute-toolTip"><table>';
    //             for (eachInfo in pointInfo) {
    //                 var th = eachInfo;
    //                 var td = pointInfo[eachInfo];

    //                 toolTipStr += '<tr><th>' +
    //                     th +
    //                     '</th><td>' +
    //                     td +
    //                     '</td></tr>';
    //             }
    //             toolTipStr += '</table></div></div>';

    //             L.circleMarker(new L.latLng(lat_value, lon_value), {
    //                 stroke: false,
    //                 fill: true,
    //                 fillColor: '#ff0000',
    //                 fillOpacity: 1,
    //                 radius: 8
    //             }).bindPopup(toolTipStr).addTo(this.markers_layer);
    //         }
    //     }

    //     //添加到地图
    //     this.addLayer(this.markers_layer);
    //     this.addTo(map);
    //     if (this.markers_layer.getLayers().length > 0) {
    //         map.fitBounds(this.markers_layer.getBounds());
    //     }
    // };

    // //隐藏目标点分布
    // L.MarkerClusterGroup.prototype.hideAimDistribute = function(map) {
    //     if (map.hasLayer(this)) {
    //         map.removeLayer(this);
    //     }
    // };
    // //扩展聚类添加点接口
    // L.MarkerClusterGroup.prototype.addPoints = function(points) {
    //     //定义点要素类图层
    //     this.markers_layer = L.featureGroup();
    //     //纬度索引位置
    //     var lat_index = -1;
    //     //经度索引位置
    //     var lon_index = -1;
    //     //在数据列名中搜索经纬度对应的索引号
    //     for (var i = 0; i < points.columns.length; i++) {
    //         if (points.columns[i] == points.latitude) {
    //             lat_index = i;
    //             continue;
    //         }
    //         if (points.columns[i] == points.longitude) {
    //             lon_index = i;
    //             continue;
    //         }
    //     }
    //     //获取数据列的长度
    //     var columnLen = points.columns.length;
    //     //遍历点集合，将点添加到点要素图层
    //     for (var i = 0; i < points.data.length; i++) {
    //         //获取点的经纬度值
    //         var lat = parseFloat(points.data[i][lat_index]);
    //         var lon = parseFloat(points.data[i][lon_index]);
    //         //验证经纬度的正确性
    //         if (isNaN(lat) || isNaN(lon) || (lon < -180) || (lon > 180) || (lat < -90) || (lat > 90)) {
    //             console.log("[" + lon + "," + lat + "]" + i18n.t('gismodule.manageAimTrack.alert1'));
    //             continue;
    //         }
    //         //配置点ToolTip信息
    //         var toolTipStr = '<div class="prtlet-extend"><div class="portlet-title-extend-popup">' + i18n.t('gismodule.manageAimTrack.tooltipTitle') + '</div><div class="portlet-body-extend-popup"><table>';
    //         for (var t = 0; t < columnLen; t++) {
    //             if (t % 2 === 0) {
    //                 toolTipStr += ("<tr><th>" + points.columns[t] + "</th><td>" + points.data[i][t]) + "</td></tr>";
    //             } else {
    //                 toolTipStr += ("<tr class='odd'><th>" + points.columns[t] + "</th><td>" + points.data[i][t]) + "</td></tr>";
    //             }
    //         }
    //         toolTipStr += "</table></div></div>";
    //         L.circleMarker(new L.latLng(lat, lon), {
    //             stroke: false,
    //             fill: true,
    //             fillColor: '#ff0000',
    //             fillOpacity: 1,
    //             radius: 8
    //         }).bindPopup(toolTipStr).addTo(this.markers_layer);
    //     }
    //     this.addLayer(this.markers_layer);
    // };


    //本函数利用模板绘制传入的单个目标的面板轨迹信息。复用了原来代码
    function _createAimPhoneBillList(aimJson, tabName, color, index, aimId) {
        var longitude = -1; //经度
        var latitude = -1; //纬度
        var billTime = ""; //时间
        var otherInfo = {};

        //定位需要展现的列
        for (item in aimJson) {
            if (item == "columns" || item == "data" || item == "name") {
                continue;
            }

            var colName = aimJson[item];
            var colPosi = -1;

            var columns = aimJson["columns"];
            for (var i = 0; i < columns.length; i++) {
                if (columns[i] == colName) {
                    colPosi = i;
                    break;
                }
            }

            if (item == "longitude") {
                longitude = colPosi;
                continue;
            }
            if (item == "latitude") {
                latitude = colPosi;
                continue;
            }
            if (item == "time") {
                billTime = colPosi;
            }

            otherInfo[colName] = colPosi;
        }

        var data = aimJson["data"];
        var beginTime = data[0][billTime];
        var endTime = data[data.length - 1][billTime];


        var tplParams = {};
        tplParams.index = index;
        tplParams.aimId = aimId;
        tplParams.color = color;
        tplParams.tabName = tabName;
        tplParams.beginTime = beginTime;
        tplParams.endTime = endTime;
        tplParams.endIndex = data.length - 1;




        tplParams.path = [];


        var i = 0;
        for (num in data) {
            tplParams.path[i] = {};
            tplParams.path[i].otherInfo = [];
            var eachData = data[num];
            var posiInfo = '(' + eachData[longitude] + ',' + eachData[latitude] + ')';
            var firstOtherInfo = true;
            for (info in otherInfo) {
                if (firstOtherInfo) {
                    tplParams.path[i].mainInfo = eachData[otherInfo[info]];
                    firstOtherInfo = false;
                } else {
                    tplParams.path.otherInfo.push(eachData[otherInfo[info]]);
                }

            }
            tplParams.path[i].otherInfo.push(posiInfo);
            i++;

        }



        var tplPathHTML = tpl_path(tplParams);
        $('#planList div.planlist_wrap.planlist_car').append(tplPathHTML);
        // $('.planTitle[data-aim-id="' + aimId + '"]').after(_createTrackPlayPanel(aimId, tplParams.beginTime.split(" "), tplParams.endTime.split(" "), tplParams.endIndex));

    };

    //以下代码在Jquery中扩展了chkbox,rdo函数用以支持特别样式的checkbox,radio

    $.fn.chkbox = function() {
        return $(this).each(function(k, v) {
            var $this = $(v);
            if ($this.is(':checkbox') && !$this.data('checkbox-replaced')) {
                // add some data to this checkbox so we can avoid re-replacing it.
                $this.data('checkbox-replaced', true);
                // create HTML for the new checkbox.
                var $l = $('<label for="' + $this.attr('id') + '" class="chkbox"></label>');
                var $y = $('<span class="yes">checked</span>');
                var $n = $('<span class="no">unchecked</span>');
                var $t = $('<span class="toggle"></span>');
                // insert the HTML in before the checkbox.
                $l.append($y, $n, $t).insertBefore($this);
                $this.addClass('replaced');
                // check if the checkbox is checked, apply styling. trigger focus.
                $this.on('change', function(e) {
                    e.stopPropagation();


                    if ($this.is(':checked')) {
                        $l.addClass('on');
                    } else {
                        $l.removeClass('on');
                    }

                    $this.trigger('focus');

                });
                $this.on('focus', function() {
                    $l.addClass('focus')
                });
                $this.on('blur', function() {
                    $l.removeClass('focus')
                });
                // check if the checkbox is checked on init.
                if ($this.is(':checked')) {
                    $l.addClass('on');
                } else {
                    $l.removeClass('on');
                }

            }

        });

    };
    $.fn.rdo = function() {

        return $(this).each(function(k, v) {

            var $this = $(v);
            if ($this.is(':radio') && !$this.data('radio-replaced')) {
                // add some data to this checkbox so we can avoid re-replacing it.
                $this.data('radio-replaced', true);

                // create HTML for the new checkbox.
                var $l = $('<label for="' + $this.attr('id') + '" class="rdo"></label>');
                var $p = $('<span class="pip"></span>');

                // insert the HTML in before the checkbox.
                $l.append($p).insertBefore($this);
                $this.addClass('replaced');

                // check if the radio is checked, apply styling. trigger focus.
                $this.on('change', function() {
                    $('label.rdo').each(function(k, v) {

                        var $v = $(v);
                        if ($('#' + $v.attr('for')).is(':checked')) {
                            $v.addClass('on');
                        } else {
                            $v.removeClass('on');
                        }

                    });

                    $this.trigger('focus');

                });
                $this.on('focus', function() {
                    $l.addClass('focus')
                });
                $this.on('blur', function() {
                    $l.removeClass('focus')
                });
                // check if the radio is checked on init.
                $('label.rdo').each(function(k, v) {

                    var $v = $(v);
                    if ($('#' + $v.attr('for')).is(':checked')) {
                        $v.addClass('on');
                    } else {
                        $v.removeClass('on');
                    }

                });
            }
        });

    };
    $.fn.chkbox2 = function() {
        return $(this).each(function(k, v) {
            var $this = $(v);
            if ($this.is(':checkbox') && !$this.data('checkbox-replaced')) {
                // add some data to this checkbox so we can avoid re-replacing it.
                $this.data('checkbox-replaced', true);
                // create HTML for the new checkbox.
                var $l = $('<label for="' + $this.attr('id') + '"></label>');
                // insert the HTML in before the checkbox.
                $l.insertAfter($this);
                $this.addClass('replaced');
                // check if the checkbox is checked, apply styling. trigger focus.
                $this.on('change', function(e) {
                    e.stopPropagation();
                    if ($this.is(':checked')) {
                        $l.addClass('on');
                    } else {
                        $l.removeClass('on');
                    }

                    $this.trigger('focus');

                });
                $this.on('focus', function() {
                    $l.addClass('focus')
                });
                $this.on('blur', function() {
                    $l.removeClass('focus')
                });
                // check if the checkbox is checked on init.
                if ($this.is(':checked')) {
                    $l.addClass('on');
                } else {
                    $l.removeClass('on');
                }

            }

        });

    };


    //调试使用数据
    var rowRecords = [{
        CERT_NO: "142333470721161",
        CERT_TYPE: "个人身份证",
        FLT_AIRLCODE: "南方航空公司",
        FLT_CODE: "CZ3530",
        FLT_DATE: "2008-04-07 00:00:00",
        FLT_DEPT: "太原武宿",
        FLT_DEPT_AREA: "山西_太原市",
        FLT_DEPT_COUN: "中国",
        FLT_DEST: "广州",
        FLT_DEST_AREA: "广东_广州市",
        FLT_DEST_COUN: "中国",
        FLT_ID: 3245160,
        PAS_FOR_FLAG: "中国人",
        PAS_NATION: "中国",
        PDT_BIRTHDAY: "",
        PDT_EXPRIRYDATE: "",
        PDT_FULNAME: "",
        PDT_LAST_NAME: "",
        PSR_CNAME: "吴长贵",
        PSR_ENAME: "WUCHANGGUI/",
        PSR_GENDER: "男",
        PSR_TYPE: "",
        SEG_DEPT_CODE: "太原武宿",
        SEG_DEST_CODE: "广州",
        STA_ARVETM: "2008-04-07 17:05:00",
        STA_DEPTTM: "2008-04-07 14:45:00",
        _checkboxcolumn: true,
        uid: 4
    }, {
        CERT_NO: "142333194909091819",
        CERT_TYPE: "个人身份证",
        FLT_AIRLCODE: "南方航空公司",
        FLT_CODE: "CZ3530",
        FLT_DATE: "2008-04-07 00:00:00",
        FLT_DEPT: "太原武宿",
        FLT_DEPT_AREA: "山西_太原市",
        FLT_DEPT_COUN: "中国",
        FLT_DEST: "广州",
        FLT_DEST_AREA: "广东_广州市",
        FLT_DEST_COUN: "中国",
        FLT_ID: 3245160,
        PAS_FOR_FLAG: "中国人",
        PAS_NATION: "中国",
        PDT_BIRTHDAY: "",
        PDT_EXPRIRYDATE: "",
        PDT_FULNAME: "",
        PDT_LAST_NAME: "",
        PSR_CNAME: "刘青山",
        PSR_ENAME: "LIUQINGSHAN/",
        PSR_GENDER: "男",
        PSR_TYPE: "",
        SEG_DEPT_CODE: "太原武宿",
        SEG_DEST_CODE: "广州",
        STA_ARVETM: "2008-04-07 17:05:00",
        STA_DEPTTM: "2008-04-07 14:45:00",
        _checkboxcolumn: true,
        uid: 5
    }];
    var datatype = {
        caption: "民航旅客离港数据",
        category: 1,
        centerCode: "100000",
        dirId: 201,
        dirType: 1,
        name: "民航旅客离港数据",
        ownerId: -1,
        source: 1,
        srcTypeId: 8,
        taskType: -1,
        typeId: 8,
        zoneId: 1
    };



    return {
        pathBox: pathBox,
        testData: {
            rowRecords: rowRecords,
            datatype: datatype
        }
    }
});