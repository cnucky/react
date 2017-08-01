/**
 * Created by xuxiaogang on 2016/2/26.
 */
(function (window, document, undefined){
    L.MarkerClusterGroup.prototype.addPoints=function(points){
        //定义点要素类图层
        this.markers_layer = L.featureGroup();
        //纬度索引位置
        var lat_index=-1;
        //经度索引位置
        var lon_index=-1;
        //在数据列名中搜索经纬度对应的索引号
        for(var i=0;i<points.columns.length;i++){
            if(points.columns[i]==points.latitude){
                lat_index=i;
                continue;
            }
            if(points.columns[i]==points.longitude){
                lon_index=i;
                continue;
            }
        }
        //获取数据列的长度
        var columnLen=points.columns.length;
        //遍历点集合，将点添加到点要素图层
        for(var i=0;i<points.data.length;i++){
            //获取点的经纬度值
            var lat=parseFloat(points.data[i][lat_index]);
            var lon=parseFloat(points.data[i][lon_index]);
            //验证经纬度的正确性
            if (isNaN(lat) || isNaN(lon)||(lon < -180) || (lon > 180) || (lat < -90) || (lat > 90)) {
                console.log( "["+lon+","+lat+ "]"+i18n.t('gismodule.manageAimTrack.alert1'));
                continue;
            }
            //配置点ToolTip信息
            var toolTipStr = '<div class="prtlet-extend"><div class="portlet-title-extend-popup">'+i18n.t('gismodule.manageAimTrack.tooltipTitle')+'</div><div class="portlet-body-extend-popup"><table>';
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
    L.MarkerClusterGroup.prototype.removePoints=function(){
        if(this.hasLayer(this.markers_layer)){
            this.removeLayer(this.markers_layer);
        }
    };
    //轨迹构造函数
    function MyTrack(options){
        if(options){
            this.options=options;
        }
        else{
            this.options={
                name:"Track"
            };
        }
        this.targetList={};
        this.selectedTargerList={};
        this.targetMovingTimes={};
    };
    MyTrack.prototype= {
        //public
        addTo: function (toolbar) {
            this._container = toolbar._container;
            this._map = toolbar._map;
            this._initLayout();
        },
        //private
        _initLayout: function () {
            var btn = document.createElement('button');
            btn.innerHTML = this.options.name;
            this._container.appendChild(btn);

            var mapUi = this._mapUi = document.getElementById("map-ui");
            L.DomEvent.on(btn,'click',function(){
//                this._map.addLayer(this.targetList['15026066270'].markers);
//                this._map.fitBounds(this.targetList['15026066270'].markers.getBounds());
//                //在各比例尺下分析获取聚类的森林结构
//                this._getClusterGrid(this.targetList['15026066270'].markers);
//                //生成目标轨迹，并将目标轨迹添加到目标列表中
//                this.targetList['15026066270'].lines=this._gridLine();
//                //目标列表勾选的触发事件，最多能够勾选5个目标
//
//                this._map.addLayer(this.targetList['15026066270'].lines[this._map.getZoom()]);
//                this._showTargerTrace('15026066270');
            },this);

            this._mapZoomShow();
            var ps=[[44,87.6],[44.3,87.63]];
            this._map.addLayer(L.polyline(ps, {weight: 2}));
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
            this.cp={};
            this.pc={};
            this.pointsID={};
        },
        //比例尺变化时的轨迹更新
        _mapZoomShow:function(){
            this._map.on('zoomend',function(e){
                //移除播放的动态轨迹
                if(this.current!=undefined){
                    if(this._map.hasLayer(this.current.marker)){
                        this.current.marker.stop();
                        this._map.removeLayer(this.current.marker);
                        this._resetTargetTrace(this.current.name,this.selectedTargerList[this.current.name]);
                    }
                    this.current=undefined;
                }
                for(var targetName in this.selectedTargerList){
                    //移除上一个比例尺下的目标轨迹
                    if(this._map.hasLayer(this.targetList[targetName].smoothlines[this.selectedTargerList[targetName]])) {
                        this._map.removeLayer(this.targetList[targetName].smoothlines[this.selectedTargerList[targetName]]);
                    }
                    //移除上一个比例尺下的目标起点终点图标
                    this._map.removeLayer(this.targetList[targetName].icons[this.selectedTargerList[targetName]][0]);
                    this._map.removeLayer(this.targetList[targetName].icons[this.selectedTargerList[targetName]][1]);
                    //记录下当前地图的比例尺
                    this.selectedTargerList[targetName]=this._map.getZoom();
                    //显示新比例尺下的目标轨迹
                    this._map.addLayer(this.targetList[targetName].smoothlines[this.selectedTargerList[targetName]]);
                    //显示新比例尺下的目标起点终点图标
                    this._map.addLayer(this.targetList[targetName].icons[this.selectedTargerList[targetName]][0]);
                    this._map.addLayer(this.targetList[targetName].icons[this.selectedTargerList[targetName]][1]);
                }
            },this);
        },
        //展示选中目标的轨迹
        _showTargerTrace: function(tagertName,color){
            //展示单个目标的聚合轨迹点
            this._map.addLayer(this.targetList[tagertName].markers);
            this._map.fitBounds(this.targetList[tagertName].markers.getBounds());
            if(this.targetList[tagertName].smoothlines==undefined) {
                this.targetList[tagertName].smoothlines={};
                this.targetList[tagertName].smoothpoints={};
                this.targetList[tagertName].movingmarker={};
                this.targetList[tagertName].icons={};
                if(this.targetList[tagertName].lines==undefined) {
                    this.cp[tagertName]={};
                    //在各比例尺下分析获取聚类的森林结构
                    this._getClusterGrid(this.targetList[tagertName].markers,tagertName);
                    //生成目标轨迹，并将目标轨迹添加到目标列表中
                    this.targetList[tagertName].lines = this._gridLine(tagertName);
                }
                this.targetMovingTimes[tagertName]={};
                //对地图各比例尺下的轨迹进行平滑
                for(var z=0;z <= this._map.getMaxZoom(); z++) {
                    //对目标轨迹进行平滑
                    var inputPoints = [];
                    for (var i = 0; i < this.targetList[tagertName].lines[z].length; i++) {
                        inputPoints.push(new Point2D(this.targetList[tagertName].lines[z][i].lng, this.targetList[tagertName].lines[z][i].lat));
                    }
                    var mysmooth = new mySmooth();
                    var smoothPoints = mysmooth.smooth(inputPoints);
                    var points = [];
                    var pointIndex=[];
                    for(var i = 0; i < smoothPoints.length; i++) {
                        points.push(new L.LatLng(smoothPoints[i].y, smoothPoints[i].x));
                        //纪录业务数据点索引
                        if(smoothPoints[i].m==1){
                            pointIndex.push(i);
                        }
                    }
                    this.targetList[tagertName].smoothpoints[z]=points;
                    //生成平滑后的轨迹
                    this.targetList[tagertName].smoothlines[z] = L.polyline(points, {weight: 2,color:color});
                    //生成轨迹动画对象
                    this.targetList[tagertName].movingmarker[z] = new L.Marker.movingMarker(points, 1000 * inputPoints.length,{color:color});
                    this.targetList[tagertName].movingmarker[z].on('start',function(e){
                        this._infoPopup(this.pc[tagertName][this.selectedTargerList[tagertName]][0],tagertName);},this);
                    this.targetList[tagertName].movingmarker[z].on('station',function(e){
                        this._infoPopup(this.pc[tagertName][this.selectedTargerList[tagertName]][e.index],tagertName);},this);
                    this.targetList[tagertName].movingmarker[z].on('end',function(e){
                        this._infoPopup(this.pc[tagertName][this.selectedTargerList[tagertName]][this.pc[tagertName][this.selectedTargerList[tagertName]].length-1],tagertName);},this);
                    //为业务数据点添加特殊处理,起点与终点不处理
                    var pcIndex={};
                    for(var i=1;i<pointIndex.length-1;i++){
                        this.targetList[tagertName].movingmarker[z].addStation(pointIndex[i],0);
                        pcIndex[pointIndex[i]]=this.pc[tagertName][z][i];
                    }
                    var pcs=this.pc[tagertName][z][0];
                    var pce=this.pc[tagertName][z][pointIndex.length-1];
                    var len=this.pc[tagertName][z].length;
                    this.pc[tagertName][z]=pcIndex;
                    this.pc[tagertName][z][0]=pcs;
                    this.pc[tagertName][z][len-1]=pce;
                    this.pc[tagertName][z].length=len;
                    //生成起点终点对象
                    this.targetList[tagertName].icons[z]=[new L.marker(points[0],{icon: this.starticon}),new L.marker(points[points.length-1],{icon: this.endicon})];
                    //不同比例尺目标轨迹的运行时间
                    this.targetMovingTimes[tagertName][z]=1000 * inputPoints.length;
                }
            }
            //在地图当前比例尺上添加目标平滑后的轨迹
            this._map.addLayer(this.targetList[tagertName].smoothlines[this._map.getZoom()]);
            //在地图当前比例尺上添加起点终点图标
            this._map.addLayer(this.targetList[tagertName].icons[this._map.getZoom()][0]);
            this._map.addLayer(this.targetList[tagertName].icons[this._map.getZoom()][1]);
            //记录所选目标及当前比例尺信息
            this.selectedTargerList[tagertName]=this._map.getZoom();
        },
        //移除选中目标的轨迹
        _hideTargerTrace: function(tagertName){
            var z=this._map.getZoom();
            if(this.selectedTargerList[tagertName]!=undefined){
                delete this.selectedTargerList[tagertName];
            }
            //移除静态轨迹线
            if(this._map.hasLayer(this.targetList[tagertName].smoothlines[z])){
                this._map.removeLayer(this.targetList[tagertName].smoothlines[z]);
            }
            //移除轨迹点
            if(this._map.hasLayer(this.targetList[tagertName].markers)){
                this._map.removeLayer(this.targetList[tagertName].markers);
            }
            //移除起点终点图标
            if(this._map.hasLayer(this.targetList[tagertName].icons[z][0])){
                this._map.removeLayer(this.targetList[tagertName].icons[z][0]);
            }
            if(this._map.hasLayer(this.targetList[tagertName].icons[z][1])){
                this._map.removeLayer(this.targetList[tagertName].icons[z][1]);
            }
            //移除播放后的动态轨迹线
            if(this.current!=undefined && this.current.name==tagertName){
                if(this._map.hasLayer(this.current.marker)){
                    this.current.marker.stop();
                    this._map.removeLayer(this.current.marker);
                    this._resetTargetTrace(this.current.name,z);
                }
                this.current=undefined;
            }
        },
        //设置目标轨迹线的颜色
        _setTargetTraceColor:function(tagertName,color){
            if(this.targetList[tagertName].smoothlines!=undefined){
                var linesLayer=this.targetList[tagertName].smoothlines[this._map.getZoom()];
                for(var z=0; z <= this._map.getMaxZoom(); z++){
                    this.targetList[tagertName].smoothlines[z] = L.polyline(this.targetList[tagertName].smoothpoints[z], {weight: 2,color:color});
                }
                if(this._map.hasLayer(linesLayer)){
                    this._map.removeLayer(linesLayer);
                    this._map.addLayer(this.targetList[tagertName].smoothlines[this._map.getZoom()]);
                }
            }
        },
        //播放目标轨迹，每次只播放一个目标，播放互斥
        playTargetTrace:function(targetName){
            var z=this._map.getZoom();
            //判断当前是否没有目标在播放
            if(this.current==undefined){
                //第一次播放，设置当前目标信息
                if(targetName in this.selectedTargerList) {
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
            else if(this.current.name!=targetName) {
                //移除之前目标播放的动态轨迹
                if (this._map.hasLayer(this.current.marker)) {
                    this.current.marker.stop();
                    this._map.removeLayer(this.current.marker);
                    this._resetTargetTrace(this.current.name,z);
                }
                //添加之前目标的静态轨迹
                if(!this._map.hasLayer(this.targetList[this.current.name].smoothlines[z])){
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
            return this.targetMovingTimes[this.current.name][z];
        },
        //对目标轨迹进行时间筛选
        filterTargetTrace:function(targetName,startIndex,endIndex){
            if(targetName in this.selectedTargerList){
                if(this.targetName==targetName && this.startIndex==startIndex && this.endIndex==endIndex){
                    return;
                }
                if(this.targetList[targetName].pLayers==undefined){
                    this.targetList[targetName].pLayers=[];
                    for(var id in this.targetList[targetName].markers.markers_layer._layers){
                        this.targetList[targetName].pLayers.push(this.targetList[targetName].markers.markers_layer._layers[id]);
                    }
                }
                if(this.targetList[targetName].pLayers!=undefined){
                    var len=this.targetList[targetName].pLayers.length;
                    if(startIndex<0 || endIndex>len-1 || startIndex>=endIndex){
                        console.log(i18n.t('gismodule.manageAimTrack.alert2'));
                        return;
                    }
                    if(len==(endIndex-startIndex+1) && (endIndex-startIndex+1)==this.targetList[targetName].markers.getLayers().length){
                        return;
                    }
                    var i=0;
                    //从头开始删点
                    for(;i<startIndex;i++){
                        if(this.targetList[targetName].markers.hasLayer(this.targetList[targetName].pLayers[i])){
                            this.targetList[targetName].markers.removeLayer(this.targetList[targetName].pLayers[i]);
                        }
                    }
                    //中间添加点
                    for(;i<=endIndex;i++){
                        if(!this.targetList[targetName].markers.hasLayer(this.targetList[targetName].pLayers[i])){
                            this.targetList[targetName].markers.addLayer(this.targetList[targetName].pLayers[i]);
                        }
                    }
                    //删到尾部的点
                    for(;i<len;i++){
                        if(this.targetList[targetName].markers.hasLayer(this.targetList[targetName].pLayers[i])){
                            this.targetList[targetName].markers.removeLayer(this.targetList[targetName].pLayers[i]);
                        }
                    }
                }
                var z=this.selectedTargerList[targetName];
                //移除当前目标轨迹信息
                if (this._map.hasLayer(this.targetList[targetName].smoothlines[z])) {
                    this._map.removeLayer(this.targetList[targetName].smoothlines[z]);
                }
                //移除起点终点图标
                if(this._map.hasLayer(this.targetList[targetName].icons[z][0])){
                    this._map.removeLayer(this.targetList[targetName].icons[z][0]);
                }
                if(this._map.hasLayer(this.targetList[targetName].icons[z][1])){
                    this._map.removeLayer(this.targetList[targetName].icons[z][1]);
                }
                this.targetName=targetName;
                this.startIndex=startIndex;
                this.endIndex=endIndex;
                var color=this.targetList[targetName].movingmarker[0].options.color;
                //重新计算并展示新的轨迹
                {
                    this.targetList[targetName].smoothlines = {};
                    this.targetList[targetName].smoothpoints = {};
                    this.targetList[targetName].movingmarker = {};
                    this.targetList[targetName].icons = {};
                    {
                        this.cp[targetName] = {};
                        //在各比例尺下分析获取聚类的森林结构
                        this._getClusterGrid(this.targetList[targetName].markers, targetName);
                        //生成目标轨迹，并将目标轨迹添加到目标列表中
                        this.targetList[targetName].lines = this._gridLine(targetName);
                    }
                    this.targetMovingTimes[targetName] = {};
                    //对地图各比例尺下的轨迹进行平滑
                    for (var z = 0; z <= this._map.getMaxZoom(); z++) {
                        //对目标轨迹进行平滑
                        var inputPoints = [];
                        for (var i = 0; i < this.targetList[targetName].lines[z].length; i++) {
                            inputPoints.push(new Point2D(this.targetList[targetName].lines[z][i].lng, this.targetList[targetName].lines[z][i].lat));
                        }
                        var mysmooth = new mySmooth();
                        var smoothPoints = mysmooth.smooth(inputPoints);
                        var points = [];
                        var pointIndex = [];
                        for (var i = 0; i < smoothPoints.length; i++) {
                            points.push(new L.LatLng(smoothPoints[i].y, smoothPoints[i].x));
                            //纪录业务数据点索引
                            if (smoothPoints[i].m == 1) {
                                pointIndex.push(i);
                            }
                        }
                        this.targetList[targetName].smoothpoints[z] = points;
                        //生成平滑后的轨迹
                        this.targetList[targetName].smoothlines[z] = L.polyline(points, {weight: 2, color: color});
                        //生成轨迹动画对象
                        this.targetList[targetName].movingmarker[z] = new L.Marker.movingMarker(points, 1000 * inputPoints.length, {color: color});
                        this.targetList[targetName].movingmarker[z].on('start',function(e){
                            this._infoPopup(this.pc[targetName][this.selectedTargerList[targetName]][0],targetName);},this);
                        this.targetList[targetName].movingmarker[z].on('station',function(e){
                            this._infoPopup(this.pc[targetName][this.selectedTargerList[targetName]][e.index],targetName);},this);
                        this.targetList[targetName].movingmarker[z].on('end',function(e){
                            this._infoPopup(this.pc[targetName][this.selectedTargerList[targetName]][this.pc[targetName][this.selectedTargerList[targetName]].length-1],targetName);},this);
                        //为业务数据点添加特殊处理,起点与终点不处理
                        var pcIndex={};
                        for(var i=1;i<pointIndex.length-1;i++){
                            this.targetList[targetName].movingmarker[z].addStation(pointIndex[i],0);
                            pcIndex[pointIndex[i]]=this.pc[targetName][z][i];
                        }
                        var pcs=this.pc[targetName][z][0];
                        var pce=this.pc[targetName][z][pointIndex.length-1];
                        var len=this.pc[targetName][z].length;
                        this.pc[targetName][z]=pcIndex;
                        this.pc[targetName][z][0]=pcs;
                        this.pc[targetName][z][len-1]=pce;
                        this.pc[targetName][z].length=len;
                        //生成起点终点对象
                        this.targetList[targetName].icons[z] = [new L.marker(points[0], {icon: this.starticon}), new L.marker(points[points.length - 1], {icon: this.endicon})];
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
        terminate:function(){
            if(this.current!=undefined){
                var z=this._map.getZoom();
                this.current.marker.stop();
                this._map.removeLayer(this.current.marker);
                this._resetTargetTrace(this.current.name,z);
                //添加目标的静态轨迹
                if(!this._map.hasLayer(this.targetList[this.current.name].smoothlines[z])){
                    this._map.addLayer(this.targetList[this.current.name].smoothlines[z]);
                }
                this.current=undefined;
            }
        },
        //暂停播放
        pauseTargetTrace:function(){
            if(this.current!=undefined){
                this.current.marker.pause();
            }
        },
        //快进播放
        speedUp:function(){
            if(this.current!=undefined){
                var len=this.current.marker._durations.length;
                for(var i=0;i<len;i++){
                    this.current.marker._durations[i]/=2;
                }
            }
        },
        //慢进播放
        speedDown:function(){
            if(this.current!=undefined){
                var len=this.current.marker._durations.length;
                for(var i=0;i<len;i++){
                    this.current.marker._durations[i]*=2;
                }
            }
        },
        //重新播放
        replayTargetTrace:function(){
            if(this.current!=undefined){
                var z=this._map.getZoom();
                this.current.marker.stop();
                this._map.removeLayer(this.current.marker);
                this.current.marker=this._resetTargetTrace(this.current.name,z);
                this.current.marker.addTo(this._map);
                this.current.marker.start();
            }
        },
        //恢复特定比例尺下目标轨迹播放设置
        _resetTargetTrace:function(targetName,z){
            var latlngs=this.targetList[targetName].smoothpoints[z];
            var len=this.targetList[targetName].lines[z].length;
            var color=this.targetList[targetName].movingmarker[z].options.color;
            var station=this.targetList[targetName].movingmarker[z]._stations;
            this.targetList[targetName].movingmarker[z]=new L.Marker.movingMarker(latlngs,1000*len,{color:color});
            this.targetList[targetName].movingmarker[z]._stations=station;
            return this.targetList[targetName].movingmarker[z];
        },
        //列表点击与地图联动事件
        _infoPopup:function(index,target){
            if(target!=undefined){
                var markers=this.targetList[target].markers;
                var marker=markers.markers_layer._layers[this.pointsID[target][index]];
                var z=this._map.getZoom();
                if(marker!=undefined){
                    var pos=this.cp[target][z][marker._leaflet_id];
                    //查找其聚合的父亲
                    if(pos==undefined){
                        pos=marker._latlng;
                    }
                    this._map.setView(pos);
                    this._map.openPopup(marker._popup._content,pos);
                }
            }
        },
        //private 界面上轨迹控制面板
        _trackPanel:function(){
            var trackPanel = document.createElement("div");
            trackPanel.className="track-ui";
            trackPanel.innerHTML= '<div class="sidebar_heading">' +
                                        '<span class="icon close">'+i18n.t('gismodule.manageAimTrack.trackPanel.closeBtn')+'</span>' +
                                        '<h4>'+i18n.t('gismodule.manageAimTrack.trackPanel.title')+'</h4>' +
                                    '</div>'+
                                    '<div class="ax_checkbox">' +
                                        '<label for="u12_input">' +
                                            '<div'+
                                        '</label>'+
                                    '</div>';
            return trackPanel;
        },
        //public 添加目标
        addTarget: function(target){
            //将目标的点信息聚合并生成轨迹信息
            var markers_layer=new L.MarkerClusterGroup({
                spiderfyOnMaxZoom: false,
                showCoverageOnHover: false,
                zoomToBoundsOnClick: false,
                iconCreateFunction: this._myiconCreateFunction
            });
            markers_layer.addPoints(target);
            this.targetList[target.name]={};
            //将目标点分布添加到目标列表中
            this.targetList[target.name].markers=markers_layer;
        },
        //目标生成轨迹变量初始化
        _init_cluster: function(target){
            this.clusterPoints = {};
            this.clusterChildPoints = {};
            this.child_cluster = {};
            this.pointsID[target] = [];
            this.pointsArray = {};
            for (var i = 0; i <= this._map.getMaxZoom(); i++) {
                this.clusterPoints[i] = {};
                this.child_cluster[i] = {};
                this.cp[target][i]={};
            }
        },
        //在地图各比例尺下生成轨迹
        _getClusterGrid:function(markers,target){
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
            this.pointsID[target].sort(function (a, b) {
                return a - b;
            });
//            var grid = markers._gridClusters[0]._grid;
//            for (var key1 in grid) {
//                for (var key2 in grid[key1]){
//                    //array
//                    var leafletid = grid[key1][key2][0]._leaflet_id;
//                    this.clusterPoints[0][leafletid] = grid[key1][key2][0]._latlng;
//                    this.clusterChildPoints[leafletid] = grid[key1][key2][0].getAllChildMarkers(); //array
//                    for (var j = 0; j < this.clusterChildPoints[leafletid].length; j++) {
//                        this.child_cluster[0][this.clusterChildPoints[leafletid][j]._leaflet_id] = leafletid;
//                        this.cp[target][0][this.clusterChildPoints[leafletid][j]._leaflet_id]=this.clusterPoints[0][leafletid];
//                    }
//                    for (var i = 0; i < grid[key1][key2][0]._childClusters.length; i++) {
//                        this._getClusterData(1, grid[key1][key2][0]._childClusters[i],target);
//                    }
//                }
//            }
            //2016-3-29修改
            var gridClusters=markers._gridClusters;
            for(var z in gridClusters){
                var grid=gridClusters[z]._grid;
                for(var key1 in grid){
                    for(var key2 in grid[key1]){
                        var leafletid=grid[key1][key2][0]._leaflet_id;
                        this.clusterPoints[z][leafletid] = grid[key1][key2][0]._latlng;
                        this.clusterChildPoints[leafletid] = grid[key1][key2][0].getAllChildMarkers();
                        for(var j=0;j<this.clusterChildPoints[leafletid].length;j++){
                            this.child_cluster[z][this.clusterChildPoints[leafletid][j]._leaflet_id] = leafletid;
                            this.cp[target][z][this.clusterChildPoints[leafletid][j]._leaflet_id]=this.clusterPoints[z][leafletid];
                        }
                    }
                }
            }
        },
        //递归的获取各比例尺下聚类的数据信息，（聚类为数据结构为森林）
        _getClusterData: function(zoom, childCluster,target){
            if (zoom > this._map.getMaxZoom()) {
                return;
            }
            var leafletid = childCluster._leaflet_id;
            this.clusterPoints[zoom][leafletid] = childCluster._latlng;
            this.clusterChildPoints[leafletid] = childCluster.getAllChildMarkers();
            for (var j = 0; j < this.clusterChildPoints[leafletid].length; j++) {
                this.child_cluster[zoom][this.clusterChildPoints[leafletid][j]._leaflet_id] = leafletid;
                this.cp[target][zoom][this.clusterChildPoints[leafletid][j]._leaflet_id]=this.clusterPoints[zoom][leafletid];
            }
            for (var i = 0; i < childCluster._childClusters.length; i++) {
                this._getClusterData(zoom + 1, childCluster._childClusters[i],target);
            }
        },
        //根据各比例尺聚类生成对应比例尺下的轨迹
        _gridLine:function(target){
            var gridlines = {};
            this.pc[target]={};
            for (var i = 0; i <= this._map.getMaxZoom(); i++) {
                this.pc[target][i]={};
                var index=0;
                //points array
                var p_array = [];
                var pre_cluster_id = null;
                //遍历点集合，进行连线
                for (var j = 0; j < this.pointsID[target].length; j++) {
                    if (this.pointsID[target][j] in this.child_cluster[i]) {
                        if (pre_cluster_id === this.child_cluster[i][this.pointsID[target][j]]) {
                            continue;
                        } else {
                            p_array.push(this.clusterPoints[i][this.child_cluster[i][this.pointsID[target][j]]]);
                            pre_cluster_id = this.child_cluster[i][this.pointsID[target][j]];
                            this.pc[target][i][index++]=j;
                        }
                    } else {
                        p_array.push(this.pointsArray[this.pointsID[target][j]]);
                        this.pc[target][i][index++]=j;
                    }
                }
                this.pc[target][i].length=index;
                gridlines[i] = p_array;
            }
            return gridlines;
        },
        //点聚类图标样式控制
        _myiconCreateFunction:function (cluster) {
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
        }
    };
    myTrack =function (options){
        return new MyTrack(options);
    };
}(window, document));