/**
 * Created by zhangxinyue on 2016/3/3.
 */

(function(window,document,undefined){
    /* 设置和图层相关的元素
     panelParentID：承载图层面板的父节点ID
    * */
    function _setLayerInfo(options)
    {
        this.options = options;
    }

    _setLayerInfo.prototype={
        //初始化
        initialize:function(toolbar){
            this._container = toolbar._container;
            var map = toolbar._map;
            this.relativeBtn = this._addBtn();
            this._addPanel();

            //基站图层
            var bs_layer = L.esri.clusteredFeatureLayer({
                spiderfyOnMaxZoom: false,
                showCoverageOnHover: false,
                zoomToBoundsOnClick: false,
                url: 'http://192.168.30.240:6080/arcgis/rest/services/GisModule/GIS_LAYER_2100/FeatureServer/0',
                pointToLayer: function(geojson, latlng) {
                    return L.marker(latlng, {
                        icon: L.icon({
                            iconUrl: '../js/components/gisWidget/gisLibs/leaflet/selfDefination/image/base.png',
                            iconSize: [21, 21],
                            iconAnchor: [10.5, 10.5]
                        })
                    });
                }
            });
            bs_layer.bindPopup(function(feature) {
                return L.Util.template('<div class="prtlet-extend"><div class="portlet-title-extend-popup">信息</div><div class="portlet-body-extend-popup"><table><tr><th>LAC_CI</th><td>{LAC_CI}</td></tr><tr class="odd"><th>名称</th><td>{FIELD_3903}</td></tr><tr><th>经度</th><td>{FIELD_3901}</td></tr><tr class="odd"><th>纬度</th><td>{FIELD_3902}</td></tr></table></div></div>', feature.properties);
            });
            //机场图层
            var ap_layer = L.esri.clusteredFeatureLayer({
                spiderfyOnMaxZoom: false,
                showCoverageOnHover: false,
                zoomToBoundsOnClick: false,
                url: 'http://192.168.30.240:6080/arcgis/rest/services/GisModule/GIS_LAYER_2102/FeatureServer/0',
                pointToLayer: function(geojson, latlng) {
                    return L.marker(latlng, {
                        icon: L.icon({
                            iconUrl: '../js/components/gisWidget/gisLibs/leaflet/selfDefination/image/airport-2-medium.png',
                            iconSize: [21, 21],
                            iconAnchor: [10.5, 10.5]
                        })
                    });
                }
            });
            ap_layer.bindPopup(function(feature) {
                return L.Util.template('<div class="prtlet-extend"><div class="portlet-title-extend-popup">信息</div><div class="portlet-body-extend-popup"><table><tr><th>名称</th><td>{FIELD_3915}</td></tr><tr class="odd"><th>代码</th><td>{FIELD_3914}</td></tr><tr><th>经度</th><td>{FIELD_3912}</td></tr><tr class="odd"><th>纬度</th><td>{FIELD_3913}</td></tr></table></div></div>', feature.properties);
            });
            //火车站图层
            var tr_layer = L.esri.clusteredFeatureLayer({
                spiderfyOnMaxZoom: false,
                showCoverageOnHover: false,
                zoomToBoundsOnClick: false,
                url: 'http://192.168.30.240:6080/arcgis/rest/services/GisModule/GIS_LAYER_2112/FeatureServer/0',
                pointToLayer: function(geojson, latlng) {
                    return L.marker(latlng, {
                        icon:  L.icon({
                            iconUrl: '../js/components/gisWidget/gisLibs/leaflet/selfDefination/image/train-2-medium.png',
                            iconSize: [21, 21],
                            iconAnchor: [10.5, 10.5]
                        })
                    });
                }
            });
            tr_layer.bindPopup(function(feature) {
                return L.Util.template('<div class="prtlet-extend"><div class="portlet-title-extend-popup">信息</div><div class="portlet-body-extend-popup"><table><tr><th>名称</th><td>{FIELD_3956}</td></tr><tr class="odd"><th>经度</th><td>{FIELD_3954}</td></tr><tr><th>纬度</th><td>{FIELD_3955}</td></tr></table></div></div>', feature.properties);
            });

            $(".threeLayers").click(function()
            {
                var currentLayer = $(this);

//                alert($(currentLayer).attr("layerName"));
                //若点击的图层已被选中，则取消选中图层
                if(this.className.indexOf("threeLayers_select") > 0)
                {
                    currentLayer.removeClass("threeLayers_select");

                    switch($(currentLayer).attr("layerName"))
                    {
                        case "bs_layer":map.removeLayer(bs_layer);break;
                        case "ap_layer":map.removeLayer(ap_layer);break;
                        case "tr_layer":map.removeLayer(tr_layer);
                    }
                    return;
                }

                //删除原选中图层的样式
                for(var i = 0; i < $(".threeLayers").length; i++)
                {
                    var chooseLayer = $($(".threeLayers")[i]);
                    if($(".threeLayers")[i].className.indexOf("threeLayers_select") > 0)
                    {
                        chooseLayer.removeClass("threeLayers_select");
                        switch($(chooseLayer).attr("layerName"))
                        {
                            case "bs_layer":map.removeLayer(bs_layer);break;
                            case "ap_layer":map.removeLayer(ap_layer);break;
                            case "tr_layer":map.removeLayer(tr_layer);
                        }
                        break;
                    }
                }

                //设置现选中图层的样式
                currentLayer.addClass("threeLayers_select");
                switch($(currentLayer).attr("layerName"))
                {
                    case "bs_layer":
                        map.addLayer(bs_layer);
                        break;
                    case "ap_layer":map.addLayer(ap_layer);break;
                    case "tr_layer":map.addLayer(tr_layer);
                }
            });
        },

        //获取和图层面板相关联的按钮（在工具栏上）
        getRelativeBtn:function(){
            return this.relativeBtn;
        },

        //获取图层面板上的关闭按钮
        getCloseElement:function(){
            return document.getElementById("hideLayerPanel");
        },

        //（私有）添加工具栏上的按钮
        _addBtn:function(){
/*            var toolButton = document.createElement('img');
            toolButton.src = "../js/components/gisWidget/setLayerModule/image/layers.png";*/
                        var toolButton = document.createElement('span');
            toolButton.height = 24;
            toolButton.width = 24;
            toolButton.title = "图层设置";
            toolButton.className = "buttonInToolbar-style fa fa-align-left";
            this._container.appendChild(toolButton);

            return toolButton;
        },

        //（私有）添加图层面板上的元素
        _addPanel:function(){
            var parentId = document.getElementById(this.options.panelParentID);
            parentId.innerHTML = this._createPanelInnerHtml();
        },

        //生成图层面板的内部HTML
        _createPanelInnerHtml:function(){
            var innerHtml =
                '<div class="layer-group-title">'+
                    '<label style="position: absolute;top:8px;left: 5px;">图层设置</label>'+
                    '<img id="hideLayerPanel" src="../js/components/gisWidget/setPositionModule/image/remove-icon-small.png" style="position: absolute;top:10px;right: 8px;cursor: pointer;"/>'+
                '</div>'+
                '<div class="layer-group-body">'+
                    '<table border = "0" class="layer_table">'+
                        '<tr class = "threeLayers" layerName="bs_layer">'+
                            '<td><img src="../js/components/gisWidget/gisLibs/imgs/base.png" height="18" width="18"/>&nbsp;基站</td>'+
                        '</tr>'+
                        '<tr class = "threeLayers" layerName="ap_layer">'+
                            '<td><img src="../js/components/gisWidget/gisLibs/imgs/airport-2-medium.png"/>&nbsp;机场</td>'+
                        '</tr>'+
                        '<tr class = "threeLayers" layerName="tr_layer">'+
                            '<td><img src="../js/components/gisWidget/gisLibs/imgs/train-2-medium.png"/>&nbsp;火车站</td>'+
                        '</tr>'+
                    '</table>'+
                '</div>';

            return innerHtml;
        }
    };

    //构造函数
    setLayerInfo = function(options)
    {
        return new _setLayerInfo(options);
    };


}(window,document));
