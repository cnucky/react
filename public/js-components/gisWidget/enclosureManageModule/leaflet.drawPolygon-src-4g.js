/**
 * Created by xuxiaogang on 2016/3/29.
 */
(function (window, document, undefined) {
    var enclosureObj;
    var shapeBeforeEdit;
    //绘制线段
    function MyDrawPolygon(options,editMenu){
        this.options={
            name:"DrawPolygon",
            allowIntersection: true,
            repeatMode: false,
            icon: new L.DivIcon({
                iconSize: new L.Point(8, 8),
                className: 'leaflet-div-icon leaflet-editing-icon'
            }),
            touchIcon: new L.DivIcon({
                iconSize: new L.Point(20, 20),
                className: 'leaflet-div-icon leaflet-editing-icon leaflet-touch-icon'
            }),
            guidelineDistance: 20,
            maxGuideLineLength: 4000,
            shapeOptions: {
                stroke: true,
                color: '#f06eaa',
                weight: 2,
                opacity: 0.5,
                fill: true,
                fillColor: null, //same as color by default
                fillOpacity: 0.2,
                clickable: true
            },
            metric: true, // Whether to use the metric meaurement system or imperial
            feet: true, // When not metric, to use feet instead of yards for display.
            showLength: true, // Whether to display distance in the tooltip
            zIndexOffset: 2000 // This should be > than the highest z-index any map layers
        };
        this.editPopup=editMenu;
        enclosureObj = options.enclosureObj;
    };
    MyDrawPolygon.prototype={
        type:'polygon',
        Poly: L.Polygon,
        addTo: function (map) {
//            this._container = toolbar._container;
            this._map = map;
            this._initLayout();
        },
        //private
        _initLayout: function () {
//            var btn = document.createElement('button');
//            btn.innerHTML = this.options.name;
//            this._container.appendChild(btn);
//            var btn=document.getElementById('polygon');
//            L.DomEvent.on(btn,'click',function(){
//                if(!this.isEnabled) {
//                    this.enabled();
//                }
//                else{
//                    this.disabled();
//                }
//            },this);
        },
        enabled:function(){
            this._markers = [];
            this._markerGroup = new L.LayerGroup();
            this._map.addLayer(this._markerGroup);
            this._poly = new L.Polyline([], this.options.shapeOptions);
            this._overlayPane = this._map._panes.overlayPane;
            if (!this._mouseMarker) {
                this._mouseMarker = L.marker(this._map.getCenter(), {
                    icon: L.divIcon({
                        className: 'leaflet-mouse-marker',
                        iconAnchor: [20, 20],
                        iconSize: [40, 40]
                    }),
                    opacity: 0,
                    zIndexOffset: this.options.zIndexOffset
                });
            }
            this._mouseMarker
                .on('mousedown', this._onMouseDown, this)
                .on('mouseout', this._onMouseOut, this)
                .on('mouseup', this._onMouseUp, this) // Necessary for 0.8 compatibility
                .on('mousemove', this._onMouseMove, this) // Necessary to prevent 0.8 stutter
                .addTo(this._map);
            this._map
                .on('mouseup', this._onMouseUp, this) // Necessary for 0.7 compatibility
                .on('mousemove', this._onMouseMove, this)
                .on('zoomlevelschange', this._onZoomEnd, this)
                .on('click', this._onTouch, this)
                .on('zoomend', this._onZoomEnd, this);
            this.isEnabled=true;
        },
        disabled:function(){
            this._cleanUpShape();
            // 从地图中移除所有marker
            this._map.removeLayer(this._markerGroup);
            delete this._markerGroup;
            delete this._markers;

            this._map.removeLayer(this._poly);
            delete this._poly;

            this._mouseMarker
                .off('mousedown', this._onMouseDown, this)
                .off('mouseout', this._onMouseOut, this)
                .off('mouseup', this._onMouseUp, this)
                .off('mousemove', this._onMouseMove, this);
            this._map.removeLayer(this._mouseMarker);
            delete this._mouseMarker;

            // 移除指导曲线
            this._clearGuides();

            this._map
                .off('mouseup', this._onMouseUp, this)
                .off('mousemove', this._onMouseMove, this)
                .off('mouseup', this._onMouseUp, this)
                .off('zoomend', this._onZoomEnd, this)
                .off('click', this._onTouch, this);
            this.isEnabled=false;
        },
        //鼠标移动事件
        _onMouseMove: function (e) {
            var newPos = this._map.mouseEventToLayerPoint(e.originalEvent);
            var latlng = this._map.layerPointToLatLng(newPos);
            // 保存新的经纬度坐标
            this._currentLatLng = latlng;
            // 实时更新指导曲线
            this._updateGuide(newPos);
            // 更新鼠标标志位置
            this._mouseMarker.setLatLng(latlng);
            L.DomEvent.preventDefault(e.originalEvent);
        },
        //鼠标按键按下事件
        _onMouseDown: function (e) {
            if(e.originalEvent.button==2){
                return;
            }
            var originalEvent = e.originalEvent;
            this._mouseDownOrigin = L.point(originalEvent.clientX, originalEvent.clientY);
        },
        //鼠标按键松开事件
        _onMouseUp: function (e) {
            if (this._mouseDownOrigin) {
                // 通过一定的像素阀值来捕获鼠标点击事件，否是认为是拖拽
                var distance = L.point(e.originalEvent.clientX, e.originalEvent.clientY)
                    .distanceTo(this._mouseDownOrigin);
                if (Math.abs(distance) < 9 * (window.devicePixelRatio || 1)) {
                    this.addVertex(e.latlng);
                }
            }
            this._mouseDownOrigin = null;
        },
        //触屏事件
        _onTouch: function (e) {
            if (L.Browser.touch) {
                this._onMouseDown(e);
                this._onMouseUp(e);
            }
        },
        _onMouseOut: function () {
            if (this._tooltip) {
                this._tooltip._onMouseOut.call(this._tooltip);
            }
        },
        //更新指导曲线
        _updateGuide: function (newPos) {
            var markerCount = this._markers.length;
            if (markerCount > 0) {
                newPos = newPos || this._map.latLngToLayerPoint(this._currentLatLng);
                // 清除旧指导曲线
                this._clearGuides();
                // 绘制新的指导曲线
                this._drawGuide(
                    this._map.latLngToLayerPoint(this._markers[markerCount - 1].getLatLng()),
                    newPos
                );
            }
        },
        // 移除指导曲线
        _clearGuides: function () {
            if (this._guidesContainer) {
                while (this._guidesContainer.firstChild) {
                    this._guidesContainer.removeChild(this._guidesContainer.firstChild);
                }
            }
        },
        //　绘制指导曲线
        _drawGuide: function (pointA, pointB) {
            var length = Math.floor(Math.sqrt(Math.pow((pointB.x - pointA.x), 2) + Math.pow((pointB.y - pointA.y), 2))),
                guidelineDistance = this.options.guidelineDistance,
                maxGuideLineLength = this.options.maxGuideLineLength,
            // 指导曲线最大长度检测
                i = length > maxGuideLineLength ? length - maxGuideLineLength : guidelineDistance,
                fraction,
                dashPoint,
                dash;
            //初始化指导曲线容器
            if (!this._guidesContainer) {
                this._guidesContainer = L.DomUtil.create('div', 'leaflet-draw-guides', this._overlayPane);
            }
            //绘制虚线作为指导曲线
            for (; i < length; i += this.options.guidelineDistance) {
                //指导曲线虚线间隔
                fraction = i / length;
                //计算虚线点坐标
                dashPoint = {
                    x: Math.floor((pointA.x * (1 - fraction)) + (fraction * pointB.x)),
                    y: Math.floor((pointA.y * (1 - fraction)) + (fraction * pointB.y))
                };
                //添加指导曲线虚线点
                dash = L.DomUtil.create('div', 'leaflet-draw-guide-dash', this._guidesContainer);
                dash.style.backgroundColor = this.options.shapeOptions.color;
                L.DomUtil.setPosition(dash, dashPoint);
            }
        },
        // 向绘制的曲线中添加新的坐标点
        addVertex: function (latlng) {
            var markersLength = this._markers.length;
            this._markers.push(this._createMarker(latlng));
            this._poly.addLatLng(latlng);
            if (this._poly.getLatLngs().length === 2) {
                this._map.addLayer(this._poly);
            }
            this._vertexChanged(latlng, true);
        },
        _vertexChanged: function (latlng, added) {
            this._map.fire('draw:drawvertex', { layers: this._markerGroup });
            this._updateFinishHandler();
//            this._updateRunningMeasure(latlng, added);
            this._clearGuides();
        },
        //更新结束触发事件
        _updateFinishHandler: function () {
            var markerCount = this._markers.length;
            if (markerCount === 1) {
                this._markers[0].on('click', this._finishShape, this);
            }
            if (markerCount > 2) {
                this._markers[markerCount - 1].on('dblclick', this._finishShape, this);
                // Only need to remove handler if has been added before
                if (markerCount > 3) {
                    this._markers[markerCount - 2].off('dblclick', this._finishShape, this);
                }
            }
        },
        _finishShape: function () {
//            var intersects = this._poly.newLatLngIntersects(this._poly.getLatLngs()[0], true);
            if ( !this._shapeIsValid()) {
                return;
            }
            this._fireCreatedEvent(this._poly.options);
            this.disable();
            //document.getElementById('polygon').style.backgroundColor='';
            if($("#polygon").hasClass("item-active"))
                $("#polygon").removeClass("item-active");
            //重复绘制模式状态
            if (this.options.repeatMode) {
                this.enabled();
            }
        },
        _shapeIsValid: function () {
            return this._markers.length >= 3;
        },
        //地图缩放事件
        _onZoomEnd: function () {
            this._updateGuide();
        },
        //清除marker
        _cleanUpShape: function () {
            var markerCount = this._markers.length;
            if (markerCount > 0) {
                this._markers[0].off('click', this._finishShape, this);

                if (markerCount > 2) {
                    this._markers[markerCount - 1].off('dblclick', this._finishShape, this);
                }
            }
        },
        //图形的名称
        _shapeName:function(source,graphicName){
            var bounds = source.getBounds(),
                center = bounds.getCenter();
            if(graphicName==undefined) {
                this.editPopup.enclosureNum++;
                graphicName='围栏'+this.editPopup.enclosureNum.toString();
            }
            var icon=new L.DivIcon({ html: '<div><span>'+graphicName+'</span></div>', className: 'shapeName', iconSize: new L.Point(40, 20) });
            var marker= new L.marker(center,{icon:icon}).addTo(this._map);
            source.nameMarker=marker;
            L.DomEvent.on(marker,'contextmenu',function(e){
                if(this.isEnabled){
                    this.disabled();
                }
                if(this.editPopup._parent!=undefined){
                    //不同图形之间切换处理
                    if(!(this.editPopup._parent instanceof MyDrawPolygon)) {
                        this.editPopup._parent._cancelMenu();
                        this._setMenu(e,source);
                        this._bindMenu();
                    }
                    //相同图形切换处理
                    else{
                        if(this.currentid!=undefined){
                            if(this.currentid!=e.target._leaflet_id) {
                                this._cancelMenu();
                                this._setMenu(e,source);
                                this._bindMenu();
                            }
                            else{
                                this._setMenu(e,source);
                            }
                        }
                        else{
                            this._setMenu(e,source);
                        }
                    }
                }
                else {
                    this._setMenu(e,source);
                    this._bindMenu();
                }
            },this);
        },
        //曲线绘制触发事件
        _fireCreatedEvent: function (shapeOptions) {
            var poly = new this.Poly(this._poly.getLatLngs(), shapeOptions);
            poly.graphID=this._poly.graphID;
            this._map.fire('draw:created', { layer: poly, layerType: this.type });
            L.DomEvent.on(poly,'contextmenu',function(e){
                if(this.isEnabled){
                    this.disabled();
                }
                if(this.editPopup._parent!=undefined){
                    //不同图形之间切换处理
                    if(!(this.editPopup._parent instanceof MyDrawPolygon)) {
                        this.editPopup._parent._cancelMenu();
                        this._setMenu(e,poly);
                        this._bindMenu();
                    }
                    //相同图形切换处理
                    else{
                        if(this.currentid!=undefined){
                            if(this.currentid!=e.target._leaflet_id) {
                                this._cancelMenu();
                                this._setMenu(e,poly);
                                this._bindMenu();
                            }
                            else{
                                this._setMenu(e,poly);
                            }
                        }
                        else{
                            this._setMenu(e,poly);
                        }
                    }
                }
                else {
                    this._setMenu(e,poly);
                    this._bindMenu();
                }
            },this);
            //this._shapeName(poly,this.graphicName);
        },
        disable: function () {
            this.disabled();
            this._map.fire('draw:drawstop', { layerType: this.type });
        },
        //创建线段顶点marker
        _createMarker: function (latlng) {
            var marker = new L.Marker(latlng, {
                icon: this.options.icon,
                zIndexOffset: this.options.zIndexOffset * 2
            });
            this._markerGroup.addLayer(marker);
            return marker;
        },
        //加载图形
        loadShape:function(graphicObj,graphicName,color){
            if(!graphicObj){
                return;
            } else{
                if(graphicObj.graphicType=='2'){
                    var graphic=JSON.parse(graphicObj.graphic);
                    if (this._poly) {
                        if(this._map.hasLayer(this._poly)) {
                            this._map.removeLayer(this._poly);
                        }
                        delete this._poly;
                    }
                    this._poly = new this.Poly(graphic.latlngs, {
                        stroke: true,
                        color: color,
                        weight: 4,
                        opacity: 0.5,
                        fill: true,
                        fillColor: null, //same as color by default
                        fillOpacity: 0.2,
                        clickable: true
                    });
                    this.graphicName=graphicName;
                    this._poly.graphID=graphicObj.graphID;
                    this._map.fitBounds(this._poly.getBounds());
                    this._fireCreatedEvent(this._poly.options);
                    this.graphicName=undefined;
                    this._map.removeLayer(this._poly);
                    delete this._poly;
                }
            }
        },
/**********************************************************************************************************************/
        _setMenu:function(e,source){
            this.editPopup.style.left= e.originalEvent.layerX+"px";
            this.editPopup.style.top = e.originalEvent.layerY+"px";
            this.editPopup.style.display= "block";
            this.currentTarget = source;
            this.editPopup._source = source;
            this.editPopup._parent = this;
        },
        _bindMenu:function(){
            //编辑菜单
            L.DomEvent.on(document.getElementById("popEdit"),'click',this._editMenu,this);
            //保存菜单
            L.DomEvent.on(document.getElementById("popSave"),'click', this._saveMenu,this);
            //删除菜单
            L.DomEvent.on(document.getElementById("popDelete"),'click', this._deleteMenu,this);
//            //查看属性
//            L.DomEvent.on(document.getElementById("popAttribute"),'click', this._queryMenu,this);
        },
        _unbindMenu:function(){
            //编辑菜单
            L.DomEvent.off(document.getElementById("popEdit"),'click',this._editMenu,this);
            //保存菜单
            L.DomEvent.off(document.getElementById("popSave"),'click', this._saveMenu,this);
            //删除菜单
            L.DomEvent.off(document.getElementById("popDelete"),'click', this._deleteMenu,this);
//            //查看属性
//            L.DomEvent.off(document.getElementById("popAttribute"),'click', this._queryMenu,this);
        },
        _editMenu:function(){
            var editItem= document.getElementById("popEdit").children[0].children[1];
            if(editItem.innerHTML==i18n.t('gismodule.common.mapmenu.edit')) {
                if (this.currentid != this.currentTarget._leaflet_id) {
                    this.oldLayer=[];
                    var latlngs=this.currentTarget.getLatLngs();
                    for(var i=0;i< latlngs.length;i++)
                    {
                        this.oldLayer.push(new L.latLng(latlngs[i].lat,latlngs[i].lng));
                    }
                    this._editSinglePolygon(this.currentTarget);
                    this.currentid = this.currentTarget._leaflet_id;
                    editItem.innerHTML = i18n.t('gismodule.common.mapmenu.cancleEdit');
                }
                this.editPopup.style.display="none";
            }
            else{
                this._cancelMenu();
                editItem.innerHTML = i18n.t('gismodule.common.mapmenu.edit');
            }
        },
        _saveMenu:function(){
            this.editPopup.style.display="none";
            var xys=[];
            var latlngs=this.currentTarget.getLatLngs();
            for(var i=0;i<latlngs.length;i++){
                xys.push([latlngs[i].lat,latlngs[i].lng]);
            }
            //var isNew=(this.currentTarget.graphID==undefined)?true:false;

            //调用接口，保存图形
            //enclosureObj.SaveEnclosure(isNew,'2',JSON.stringify({latlngs:xys}),this.currentTarget.graphID);
            //if(isNew==false) {
            //    this._finishEditSinglePolygon();
            //}
            this._finishEditSinglePolygon();
        },
        _deleteMenu:function(){
            //this.currentTarget._map.removeLayer(this.currentTarget.nameMarker);
            this.currentTarget._map.removeLayer(this.currentTarget);
            this._map.fire('draw:deleted', { layer: this.currentTarget, layerType: this.type });
            //enclosureObj.DeleteEnclosure(this.currentTarget.graphID);
            this._finishEditSinglePolygon();
        },
        _cancelMenu:function(){
            if(this.oldLayer!=undefined){
                //josn化图形
                var xys=[];
                var latlngs=this.currentTarget.getLatLngs();
                for(var i=0;i<latlngs.length;i++){
                    xys.push([latlngs[i].lat,latlngs[i].lng]);
                }
                this.currentTarget.setLatLngs(this.oldLayer);
                //this.currentTarget.nameMarker.setLatLng(this.currentTarget.getBounds().getCenter());

                this._map.fire('draw:changed', { newLayer: this.currentTarget, olderLayer:JSON.stringify({latlngs:xys}), layerType: this.type });
            }
            this._finishEditSinglePolygon();
        },
        _queryMenu:function(){
            enclosureObj.QueryEnclosureAttr(this.currentTarget.graphID);
            this._finishEditSingleRect();
        },
        updateShare:function(graphID,color,name)
        {
            this.currentTarget.graphID = graphID;
            var icon = new L.DivIcon({ html: '<div><span>'+name+'</span></div>', className: 'shapeName', iconSize: new L.Point(40, 20) });
            //this.currentTarget.nameMarker.setIcon(icon);
            this.currentTarget._path.attributes['stroke'].value = color;
            this.currentTarget._path.attributes['fill'].value = color;
            this._finishEditSinglePolygon();
        },
/**********************************************************************************************************************/
        //编辑曲线
        _editSinglePolygon: function (polygon) {
            polygon._path.setAttribute("class","edit-look");
            if(!this._markerGroup) {
                this._markerGroup = new L.LayerGroup();
                this._map.addLayer(this._markerGroup);
            }
            this._latlngs=polygon.getLatLngs();
            this._poly=polygon;
            this._initMarkers();
        },
        //编辑结束事件
        _finishEditSinglePolygon:function(){
            document.getElementById("popEdit").children[0].children[1].innerHTML=i18n.t('gismodule.common.mapmenu.edit');
            this.editPopup.style.display="none";
            this._unbindMenu();
            this.editPopup._parent=undefined;
            this.oldLayer=undefined;
            this.currentid=undefined;
            this.currentTarget=undefined;
            if(this._poly==undefined){
                return;
            }
            else{
                this._poly._path.setAttribute("class","");
            }
            var poly = this._poly;
            poly.setStyle(poly.options.original);
            this._map.removeLayer(this._markerGroup);
//            if (poly._map) {
//                this._map.removeLayer(this._markerGroup);
                delete this._markerGroup;
                delete this._markers;
                delete this._latlngs;
                delete this._poly;
//            }
        },
        //初始化编辑点
        _initMarkers: function () {
            this._markers = [];
            var latlngs = this._latlngs,
                i, j, len, marker;
            for (i = 0, len = latlngs.length; i < len; i++) {
                marker = this._createEditMarker(latlngs[i], i);
                marker.on('click', this._onMarkerClick, this);
                this._markers.push(marker);
            }
            var markerLeft, markerRight;
            for (i = 0, j = len - 1; i < len; j = i++) {
                if (i === 0 && !(L.Polygon && (this._poly instanceof L.Polygon))) {
                    continue;
                }
                markerLeft = this._markers[j];
                markerRight = this._markers[i];
                this._createMiddleMarker(markerLeft, markerRight);
                this._updatePrevNext(markerLeft, markerRight);
            }
        },
        //移除编辑点
        _removeMarker: function (marker) {
            var i = marker._index;

            this._markerGroup.removeLayer(marker);
            this._markers.splice(i, 1);
            this._spliceLatLngs(i, 1);
            this._updateIndexes(i, -1);

            marker
                .off('dragstart', this._onMarkerDragStart, this)
                .off('drag', this._onMarkerDrag, this)
                .off('dragend', this._fireEdit, this)
                .off('touchmove', this._onMarkerDrag, this)
                .off('touchend', this._fireEdit, this)
                .off('click', this._onMarkerClick, this);
        },
        //触发编辑事件
        _fireEdit: function () {
            this._poly.edited = true;
            //this._poly.nameMarker.setLatLng(this._poly.getBounds().getCenter());
            this._poly.fire('edit');
            this._poly._map.fire('draw:editvertex', { layers: this._markerGroup });
            this._map.fire('draw:changed', { newLayer: this._poly, olderLayer:shapeBeforeEdit, layerType: this.type });
            shapeBeforeEdit = null;
        },
        //编辑点点击事件
        _onMarkerClick: function (e) {
            var minPoints = L.Polygon && (this._poly instanceof L.Polygon) ? 4 : 3,
                marker = e.target;
            if (this._latlngs.length < minPoints) {
                return;
            }
            this._removeMarker(marker);
            this._updatePrevNext(marker._prev, marker._next);
            if (marker._middleLeft) {
                this._markerGroup.removeLayer(marker._middleLeft);
            }
            if (marker._middleRight) {
                this._markerGroup.removeLayer(marker._middleRight);
            }
            if (marker._prev && marker._next) {
                this._createMiddleMarker(marker._prev, marker._next);
            } else if (!marker._prev) {
                marker._next._middleLeft = null;
            } else if (!marker._next) {
                marker._prev._middleRight = null;
            }
            this._fireEdit();
        },
        //触发开始编辑事件
        _onMarkerDragStart: function () {
            //编辑前保存形状json格式
            var xys=[];
            var latlngs=this._poly.getLatLngs();
            for(var i=0;i<latlngs.length;i++){
                xys.push([latlngs[i].lat,latlngs[i].lng]);
            }
            shapeBeforeEdit = JSON.stringify({latlngs:xys});

            this._poly.fire('editstart');
        },
        //触控移动事件
        _onTouchMove: function (e) {
            var layerPoint = this._map.mouseEventToLayerPoint(e.originalEvent.touches[0]),
                latlng = this._map.layerPointToLatLng(layerPoint),
                marker = e.target;
            L.extend(marker._origLatLng, latlng);
            if (marker._middleLeft) {
                marker._middleLeft.setLatLng(this._getMiddleLatLng(marker._prev, marker));
            }
            if (marker._middleRight) {
                marker._middleRight.setLatLng(this._getMiddleLatLng(marker, marker._next));
            }
            this._poly.redraw();
            this.updateMarkers();
        },
        //编辑点拖拽
        _onMarkerDrag: function (e) {
            var marker = e.target;
            L.extend(marker._origLatLng, marker._latlng);
            if (marker._middleLeft) {
                marker._middleLeft.setLatLng(this._getMiddleLatLng(marker._prev, marker));
            }
            if (marker._middleRight) {
                marker._middleRight.setLatLng(this._getMiddleLatLng(marker, marker._next));
            }
            this._poly.redraw();
            this._poly.fire('editdrag');
        },
        _createEditMarker: function (latlng, index) {
            // 扩展marker的触摸属性
            var marker = new L.Marker(latlng, {
                draggable: true,
                icon: this.options.icon
            });
            marker._origLatLng = latlng;
            marker._index = index;
            marker
                .on('dragstart', this._onMarkerDragStart, this)
                .on('drag', this._onMarkerDrag, this)
                .on('dragend', this._fireEdit, this)
                .on('touchmove', this._onTouchMove, this)
                .on('MSPointerMove', this._onTouchMove, this)
                .on('touchend', this._fireEdit, this)
                .on('MSPointerUp', this._fireEdit, this);
            this._markerGroup.addLayer(marker);
            return marker;
        },
        //创建中间编辑点
        _createMiddleMarker: function (marker1, marker2) {
            var latlng = this._getMiddleLatLng(marker1, marker2),
                marker = this._createEditMarker(latlng),
                onClick,
                onDragStart,
                onDragEnd;
            marker.setOpacity(0.6);
            marker1._middleRight = marker2._middleLeft = marker;

            onDragStart = function () {
                var i = marker2._index;
                marker._index = i;
                marker
                    .off('click', onClick, this)
                    .on('click', this._onMarkerClick, this);
                latlng.lat = marker.getLatLng().lat;
                latlng.lng = marker.getLatLng().lng;
                this._spliceLatLngs(i, 0, latlng);
                this._markers.splice(i, 0, marker);
                marker.setOpacity(1);
                this._updateIndexes(i, 1);
                marker2._index++;
                this._updatePrevNext(marker1, marker);
                this._updatePrevNext(marker, marker2);
                this._poly.fire('editstart');
            };

            onDragEnd = function () {
                marker.off('dragstart', onDragStart, this);
                marker.off('dragend', onDragEnd, this);
                marker.off('touchmove', onDragStart, this);

                this._createMiddleMarker(marker1, marker);
                this._createMiddleMarker(marker, marker2);
            };

            onClick = function () {
                onDragStart.call(this);
                onDragEnd.call(this);
                this._fireEdit();
            };

            marker
                .on('click', onClick, this)
                .on('dragstart', onDragStart, this)
                .on('dragend', onDragEnd, this)
                .on('touchmove', onDragStart, this);

            this._markerGroup.addLayer(marker);
        },
        //更新编辑点索引
        _updateIndexes: function (index, delta) {
            this._markerGroup.eachLayer(function (marker) {
                if (marker._index > index) {
                    marker._index += delta;
                }
            });
        },
        _updatePrevNext: function (marker1, marker2) {
            if (marker1) {
                marker1._next = marker2;
            }
            if (marker2) {
                marker2._prev = marker1;
            }
        },
        _getMiddleLatLng: function (marker1, marker2) {
            var map = this._map,
                p1 = map.project(marker1.getLatLng()),
                p2 = map.project(marker2.getLatLng());
            return map.unproject(p1._add(p2)._divideBy(2));
        },
        _spliceLatLngs: function () {
            var removed = [].splice.apply(this._latlngs, arguments);
            this._poly._convertLatLngs(this._latlngs, true);
            this._poly.redraw();
            return removed;
        }
    };
    myDrawPolygon=function(options,editMenu){
        return new MyDrawPolygon(options,editMenu);
    }
}(window, document));