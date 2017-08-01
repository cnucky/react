/**
 * Created by xuxiaogang on 2016/3/29.
 */
(function (window, document, undefined) {
    var enclosureObj;
    var shapeBeforeEdit;
    //绘制线段
    function MyDrawCircle(options,editMenu){
        this.options={
            name:"DrawCircle",
            repeatMode: false,
            moveIcon: new L.DivIcon({
                iconSize: new L.Point(8, 8),
                className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-move'
            }),
            resizeIcon: new L.DivIcon({
                iconSize: new L.Point(8, 8),
                className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-resize'
            }),
            touchMoveIcon: new L.DivIcon({
                iconSize: new L.Point(20, 20),
                className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-move leaflet-touch-icon'
            }),
            touchResizeIcon: new L.DivIcon({
                iconSize: new L.Point(20, 20),
                className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-resize leaflet-touch-icon'
            }),
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
            zIndexOffset: 2000 // This should be > than the highest z-index any map layers
            };
        this.editPopup=editMenu;
        enclosureObj = options.enclosureObj;
    };
    MyDrawCircle.prototype={
        type:'circle',
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
//            var btn=document.getElementById('circle');
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
            this._mouseMarker.addTo(this._map);
            //启用地图drag模式
            this._mapDraggable = this._map.dragging.enabled();
            if (this._mapDraggable) {
                this._map.dragging.disable();
            }
            this._map._container.style.cursor = 'crosshair';
            this._map
                .on('mousedown', this._onMouseDown, this)
                .on('mousemove', this._onMouseMove, this)
                .on('touchstart', this._onMouseDown, this)
                .on('touchmove', this._onMouseMove, this);
            this.isEnabled=true;
        },
        disabled:function(){
            //禁用地图drag模式
            if (this._mapDraggable) {
                this._map.dragging.enable();
            }
            this._map._container.style.cursor = '';
            this._map
                .off('mousedown', this._onMouseDown, this)
                .off('mousemove', this._onMouseMove, this)
                .off('touchstart', this._onMouseDown, this)
                .off('touchmove', this._onMouseMove, this);
            L.DomEvent.off(document, 'mouseup', this._onMouseUp, this);
            L.DomEvent.off(document, 'touchend', this._onMouseUp, this);
            if (this._shape) {
                this._map.removeLayer(this._shape);
                delete this._shape;
            }
            if(this._mouseMarker!=undefined) {
                this._map.removeLayer(this._mouseMarker);
            }
            this._isDrawing = false;
            this.isEnabled=false;
        },
        //鼠标移动事件
        _onMouseMove: function (e) {
            var latlng = e.latlng;
            if (this._isDrawing ) {
                this._drawShape(latlng);
            }
            this._mouseMarker.setLatLng(latlng);
        },
        //鼠标按键按下事件
        _onMouseDown: function (e) {
            if(e.originalEvent.button==2){
                return;
            }
            this._isDrawing = true;
            this._startLatLng= e.latlng;
            L.DomEvent
                .on(document, 'mouseup', this._onMouseUp, this)
                .on(document, 'touchend', this._onMouseUp, this)
                .preventDefault(e.originalEvent);
        },
        //鼠标按钮松开事件
        _onMouseUp: function () {
            if (this._shape) {
                this._fireCreatedEvent(this._shape.options);
                this.disabled();
                //document.getElementById('circle').style.backgroundColor='';
                if($("#circle").hasClass("item-active"))
                    $("#circle").removeClass("item-active");
                if (this.options.repeatMode) {
                    this.enabled();
                }
            }

        },
        //图形的名称
        _shapeName:function(source,graphicName){
            var center = source.getLatLng();
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
                    if(!(this.editPopup._parent instanceof MyDrawCircle)) {
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
        //图形绘制结束事件
        _fireCreatedEvent: function (shapeOptions) {
            var circle = new L.Circle(this._startLatLng, this._shape.getRadius(), shapeOptions);
            circle.graphID=this._shape.graphID;
            this._map.fire('draw:created', { layer: circle, layerType: this.type });
            L.DomEvent.on(circle,'contextmenu',function(e){
                if(this.isEnabled){
                    this.disabled();
                }
                if(this.editPopup._parent!=undefined){
                    //不同图形之间切换处理
                    if(!(this.editPopup._parent instanceof MyDrawCircle)) {
                        this.editPopup._parent._cancelMenu();
                        this._setMenu(e,circle);
                        this._bindMenu();
                    }
                    //相同图形切换处理
                    else{
                        if(this.currentid!=undefined){
                            if(this.currentid!=e.target._leaflet_id) {
                                this._cancelMenu();
                                this._setMenu(e, circle);
                                this._bindMenu();
                            }
                            else{
                                this._setMenu(e, circle);
                            }
                        }
                        else{
                            this._setMenu(e, circle);
                        }
                    }
                }
                else {
                    this._setMenu(e,circle);
                    this._bindMenu();
                }
            },this);
            //this._shapeName(circle,this.graphicName);
        },
        //绘制图形
        _drawShape: function (latlng) {
            if (!this._shape) {
                this._shape = new L.Circle(this._startLatLng, this._startLatLng.distanceTo(latlng), this.options.shapeOptions);
                this._map.addLayer(this._shape);
            } else {
                this._shape.setRadius(this._startLatLng.distanceTo(latlng));
            }
        },
        //加载图形
        loadShape:function(graphicObj,graphicName,color){
            if(!graphicObj){
                return;
            } else{
                if(graphicObj.graphicType=='1'){
                    var graphic=JSON.parse(graphicObj.graphic);
                    if (this._shape) {
                        if(this._map.hasLayer(this._shape)) {
                            this._map.removeLayer(this._shape);
                        }
                        delete this._shape;
                    }
                    this._startLatLng=new L.LatLng(graphic.center[0],graphic.center[1]);
                    this._shape = new L.Circle(this._startLatLng, graphic.radius, {
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
                    this._shape.graphID=graphicObj.graphID;
                    this._map.fitBounds(this._shape.getBounds());
                    this._fireCreatedEvent(this._shape.options);
                    this.graphicName=undefined;
                    this.disabled();
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
                    this.oldLayer = new L.Circle(this.currentTarget.getLatLng(), this.currentTarget.getRadius(), this.options.shapeOptions);
                    this._editSingleCircle(this.currentTarget);
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
//            var isNew=(this.currentTarget.graphID==undefined)?true:false;
//            //调用接口，保存图形
//            enclosureObj.SaveEnclosure(isNew,'1',JSON.stringify({center:[this.currentTarget.getLatLng().lat,this.currentTarget.getLatLng().lng],radius:this.currentTarget.getRadius()}),this.currentTarget.graphID);
//            if(isNew==false) {
//                this._finishEditSingleCircle();
//            }
            this._finishEditSingleCircle();
        },
        _deleteMenu:function(){
            //this.currentTarget._map.removeLayer(this.currentTarget.nameMarker);
            this.currentTarget._map.removeLayer(this.currentTarget);
            this._map.fire('draw:deleted', { layer: this.currentTarget, layerType: this.type });
            //enclosureObj.DeleteEnclosure(this.currentTarget.graphID);
            this._finishEditSingleCircle();
        },
        _cancelMenu:function(){
            if(this.oldLayer!=undefined){
                var currentCircleJson = JSON.stringify({center:[this.currentTarget.getLatLng().lat,this.currentTarget.getLatLng().lng],radius:this.currentTarget.getRadius()});
                this.currentTarget.setLatLng(this.oldLayer.getLatLng());
                this.currentTarget.setRadius(this.oldLayer.getRadius());
                //this.currentTarget.nameMarker.setLatLng(this.oldLayer.getLatLng());

                this._map.fire('draw:changed', { newLayer: this.oldLayer, olderLayer:currentCircleJson, layerType: this.type });
            }
            this._finishEditSingleCircle();
        },
        _queryMenu:function(){
            enclosureObj.QueryEnclosureAttr(this.currentTarget.graphID);
            this._finishEditSingleCircle();
        },
        updateShare:function(graphID,color,name)
        {
            this.currentTarget.graphID = graphID;
            var icon = new L.DivIcon({ html: '<div><span>'+name+'</span></div>', className: 'shapeName', iconSize: new L.Point(40, 20) });
            //this.currentTarget.nameMarker.setIcon(icon);
            this.currentTarget._path.attributes['stroke'].value = color;
            this.currentTarget._path.attributes['fill'].value = color;
            this._finishEditSingleCircle();
        },
/**********************************************************************************************************************/
        //编辑矩形
        _editSingleCircle:function(circle){
            circle._path.setAttribute("class","edit-look");
            if (!this._markerGroup) {
                this._markerGroup = new L.LayerGroup();
                this._map.addLayer(this._markerGroup);
            }
            this._shape=circle;
            this._initMarkers();
        },
        //结束编辑
        _finishEditSingleCircle:function(){
            document.getElementById("popEdit").children[0].children[1].innerHTML=i18n.t('gismodule.common.mapmenu.edit');
            this.editPopup.style.display="none";
            this._unbindMenu();
            this.editPopup._parent=undefined;
            this.oldLayer=undefined;
            this.currentid=undefined;
            this.currentTarget=undefined;
            if(this._shape==undefined){
                return;
            }
            else{
                this._shape._path.setAttribute("class","");
            }
            this._map.removeLayer(this._markerGroup);
            this._unbindMarker(this._moveMarker);
            for (var i = 0, l = this._resizeMarkers.length; i < l; i++) {
                this._unbindMarker(this._resizeMarkers[i]);
            }
            delete this._markerGroup;
            delete this._resizeMarkers;
            delete this._moveMarker;
            delete this._shape;
        },
        //初始化编辑点
        _initMarkers: function () {
            // 创建移动点
            this._createMoveMarker();
            // 创建编辑点
            this._createResizeMarker();
        },
        //创建移动点
        _createMoveMarker: function () {
            var center = this._shape.getLatLng();
            this._moveMarker = this._createMarker(center, this.options.moveIcon);
        },
        //创建编辑点
        _createResizeMarker: function () {
            var center = this._shape.getLatLng(),
                resizemarkerPoint = this._getResizeMarkerPoint(center);
            this._resizeMarkers = [];
            this._resizeMarkers.push(this._createMarker(resizemarkerPoint, this.options.resizeIcon));
        },
        //右上点为编辑点
        _getResizeMarkerPoint: function (latlng) {
            // From L.shape.getBounds()
            var delta = this._shape._radius * Math.cos(Math.PI / 4),
                point = this._map.project(latlng);
            return this._map.unproject([point.x + delta, point.y - delta]);
        },
        //创建点
        _createMarker: function (latlng, icon) {
            var marker = new L.Marker(latlng, {
                draggable: true,
                icon: icon,
                zIndexOffset: 10
            });
            this._bindMarker(marker);
            this._markerGroup.addLayer(marker);
            return marker;
        },
        //给点绑定相关事件
        _bindMarker: function (marker) {
            marker
                .on('dragstart', this._onMarkerDragStart, this)
                .on('drag', this._onMarkerDrag, this)
                .on('dragend', this._onMarkerDragEnd, this);
//                .on('touchstart', this._onTouchStart, this)
//                .on('touchmove', this._onTouchMove, this)
//                .on('MSPointerMove', this._onTouchMove, this)
//                .on('touchend', this._onTouchEnd, this)
//                .on('MSPointerUp', this._onTouchEnd, this);
        },
        _unbindMarker: function (marker) {
            marker
                .off('dragstart', this._onMarkerDragStart, this)
                .off('drag', this._onMarkerDrag, this)
                .off('dragend', this._onMarkerDragEnd, this);
//                .off('touchstart', this._onTouchStart, this)
//                .off('touchmove', this._onTouchMove, this)
//                .off('MSPointerMove', this._onTouchMove, this)
//                .off('touchend', this._onTouchEnd, this)
//                .off('MSPointerUp', this._onTouchEnd, this);
        },
        //开始编辑事件
        _onMarkerDragStart: function (e) {
            var marker = e.target;
            marker.setOpacity(0);

            //编辑前保存形状json格式
            shapeBeforeEdit = JSON.stringify({center:[this._shape.getLatLng().lat,this._shape.getLatLng().lng],radius:this._shape.getRadius()});

            this._shape.fire('editstart');
        },
        //拖拽事件
        _onMarkerDrag: function (e) {
            var marker = e.target,
                latlng = marker.getLatLng();
            if (marker === this._moveMarker) {
                this._move(latlng);
            } else {
                this._resize(latlng);
            }
            this._shape.redraw();
            this._shape.fire('editdrag');
        },
        //拖拽结束事件
        _onMarkerDragEnd: function (e) {
            var marker = e.target;
            marker.setOpacity(1);
            this._fireEdit();

            //触发形状更改事件
            this._map.fire('draw:changed', { newLayer: this._shape, olderLayer:shapeBeforeEdit, layerType: this.type });
            shapeBeforeEdit = null;
        },
        //编辑结束后触发事件
        _fireEdit: function () {
            this._shape.edited = true;
            this._shape.fire('edit');
        },
        //固定对角线定点，设置点的透明度
        _toggleCornerMarkers: function (opacity) {
            for (var i = 0, l = this._resizeMarkers.length; i < l; i++) {
                this._resizeMarkers[i].setOpacity(opacity);
            }
        },
        //整体移动事件
        _move: function (latlng) {
            var resizemarkerPoint = this._getResizeMarkerPoint(latlng);
            // Move the resize marker
            this._resizeMarkers[0].setLatLng(resizemarkerPoint);
            // Move the circle
            this._shape.setLatLng(latlng);
            //this._shape.nameMarker.setLatLng(latlng);
        },
        //边框resize事件
        _resize: function (latlng) {
            var moveLatLng = this._moveMarker.getLatLng(),
                radius = moveLatLng.distanceTo(latlng);
            this._shape.setRadius(radius);
        },
        //对编辑点进行移动
        _repositionCornerMarkers: function () {
            var corners = this._getCorners();
            for (var i = 0, l = this._resizeMarkers.length; i < l; i++) {
                this._resizeMarkers[i].setLatLng(corners[i]);
            }
        }
    };
    myDrawCircle=function(options,editMenu){
        return new MyDrawCircle(options,editMenu);
    }
}(window, document));