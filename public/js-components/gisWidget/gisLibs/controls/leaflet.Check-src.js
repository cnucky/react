/**
 * Created by xuxiaogang on 2016/3/29.
 */
(function (window, document, undefined) {
    //绘制线段
    function MyCheck(options){
        this.options={
            name:options.name,
            myclick:options.myclick
            };
    };
    MyCheck.prototype={
        addTo: function (toolbar) {
            this._container = toolbar._container;
            this._map = toolbar._map;
            this._initLayout();
        },
        //private
        _initLayout: function () {
            var btn = document.createElement('input');
            btn.setAttribute('type','checkbox');
            this._container.appendChild(btn);
            var groupName = document.createElement('span');
            groupName.className = 'leaflet-control-layers-group-name';
            groupName.innerHTML = this.options.name;
            this._container.appendChild(groupName);
            L.DomEvent.on(btn,'click',this.options.myclick);
        }
    };
    myCheck=function(options){
        return new MyCheck(options);
    }
}(window, document));