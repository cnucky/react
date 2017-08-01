/**
 * Created by xuxiaogang on 2016/3/1.
 */
(function (window, document, undefined){
    L.Control.Toolbar = L.Control.extend({
            options:{
                collapsed: true,
                position: 'topright',
                autoZIndex: true
            },
            //override
            initialize: function (options){
                L.setOptions(this,options);
            },
            //override
            onAdd: function (map){
                this._initLayout();
                return this._container;
            },
            //private
            _initLayout: function(){
                var className = 'leaflet-bar',
                    container = this._container = L.DomUtil.create('div',className);
                container.setAttribute('style','background-color:white');
                if(this.options.id) {
                    container.setAttribute('id',this.options.id);
                }
                if (!L.Browser.touch) {
                    L.DomEvent.disableClickPropagation(container);
                    L.DomEvent.on(container, 'wheel', L.DomEvent.stopPropagation);
                } else {
                    L.DomEvent.on(container, 'click', L.DomEvent.stopPropagation);
                }
            }
        }
    );
    L.control.toolbar =function (options){
        return new L.Control.Toolbar(options);
    };
}(window, document));