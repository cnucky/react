/**
 * Created by xuxiaogang on 2016/3/4.
 */

var layersArray=new Array();
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
layersArray.push(bs_layer);
layersArray.push(ap_layer);
layersArray.push(tr_layer);

//地图添加某个图层，比如基站图层
map.addLayer(bs_layer);
//地图移除某个图层，比如基站图层
map.removeLayer(bs_layer);