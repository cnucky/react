/**
 * Created by xuxiaogang on 2016/3/29.
 */
(function (window, document, undefined) {
    //绘制线段
    function MyRectZoomIn(options){
        this.options={
            name:"拉框",
            repeatMode: false,
            shapeOptions: {
                stroke: true,
                color: '#000000',
                weight: 1,
                opacity: 1,
                fill: false,
                fillColor: null, //same as color by default
                fillOpacity: 0.2,
                clickable: false
            }
            };
    };
    MyRectZoomIn.prototype={
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
            L.DomEvent.on(btn,'click',function(){
                if(!this.isEnabled) {
                    this.enabled();
                }
                else{
                    this.disabled();
                }
            },this);
        },
        enabled:function(){
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
            this._isDrawing = false;
            this.isEnabled=false;
        },
        //鼠标移动事件
        _onMouseMove: function (e) {
            var latlng = e.latlng;
            if (this._isDrawing) {
                this._drawShape(latlng);
            }
        },
        //鼠标按键按下事件
        _onMouseDown: function (e) {
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
                this._fireCreatedEvent();
            }
            this.disabled();
            if (this.options.repeatMode) {
                this.enabled();
            }
        },
        //图形绘制结束事件，放大地图
        _fireCreatedEvent: function () {
            this._map.fitBounds(this._shape.getBounds());
            this._map.fire('drawRect', { rect:this._shape.getBounds() });
        },
        //绘制图形
        _drawShape: function (latlng) {
            if (!this._shape) {
                this._shape = new L.Rectangle(new L.LatLngBounds(this._startLatLng, latlng), this.options.shapeOptions);
                this._map.addLayer(this._shape);
            } else {
                this._shape.setBounds(new L.LatLngBounds(this._startLatLng, latlng));
            }
        }
    };
    myRectZoomIn=function(options){
        return new MyRectZoomIn(options);
    }
}(window, document));