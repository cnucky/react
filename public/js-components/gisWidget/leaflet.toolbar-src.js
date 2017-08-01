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
                var className = 'info',
                    container = this._container = L.DomUtil.create('div',className);
            }
        }
    );
    L.control.toolbar =function (options){
        return new L.Control.Toolbar(options);
    };
}(window, document));