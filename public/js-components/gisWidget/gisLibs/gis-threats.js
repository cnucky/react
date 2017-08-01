/**
 * Created by THINK on 2016/6/15.
 */
//(function (window, document, undefined) {
/***********************目标热力图***************************/
    function showGlobalHeatMap(map){
        var cfg = {
            "radius": 0.005,
            "maxOpacity": .8,
            "scaleRadius": true,
            "useLocalExtrema": false,
            latField: 'lat',
            lngField: 'lng',
            valueField: 'count'
        };
        var heatmapLayer = new HeatmapOverlay(cfg);
        heatmapLayer.addTo(map);
        $.getJSON('/dap-gis/getGlobalHeatMap',{},function(rsp){
            var data=[],max=0;
            for(var i=0;i<rsp.length;i++){
                data.push({lat:rsp[i][1],lng: rsp[i][0],count: rsp[i][2]});
                if(max<rsp[i][2]){
                    max=rsp[i][2];
                }
            }
            var testData={data:data,max:max};
            heatmapLayer.setData(testData);
        });
        return heatmapLayer;
    }
/*************************目标分布图************************/
    function showClusterPoints(map){
        var markers_layer = new L.MarkerClusterGroup({
            spiderfyOnMaxZoom: false,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: false
        });
        $.getJSON('/dap-gis/getClusterPoints',{},function(rsp){
            for(var i=0;i<rsp.length;i++){
                L.marker([rsp[i][2],rsp[i][1]]).addTo(markers_layer);
            }
            markers_layer.addTo(map);
            map.fitBounds(markers_layer.getBounds());
        });
        return markers_layer;
    }
/*************************重点目标聚集************************/
    function showTargetsClusterThreat(targets,title,map,infoText){
        var clusterThreat={};
        clusterThreat['circle']=createCircleArea(targets);
        clusterThreat['markers']=createPulsePointAndMarker(clusterThreat['circle']['center'],title,[20,20],'red','fa-users','square',infoText);
        clusterThreat['circle']['circle'].addTo(map);
        clusterThreat['markers']['point'].addTo(map);
        clusterThreat['markers']['marker'].addTo(map);
        return clusterThreat;
    }
/************************目标进入重点区域********************/
    function showTargetEnterRegionThreat(target,title,map,infoText){
        var regionThreat={};
        regionThreat['markers']=createPulsePointAndMarker(target,title,[20,20],'red','fa-user','square',infoText);
        regionThreat['markers']['point'].addTo(map);
        regionThreat['markers']['marker'].addTo(map);
        return regionThreat;
    }
    function showTargetEnterRegionThreat2(targets,title,map,infoText)
    {
        var dangerPeopleThreat={};
        dangerPeopleThreat['markers']=createPulsePointAndMarker(targets[0],'',[20,20],'red','fa-user','square');
        dangerPeopleThreat['markers']['point'].addTo(map);
        dangerPeopleThreat['markers']['marker'].addTo(map);
        if(targets.length==2) {
            var dangerPeopleThreat2 = {};
            dangerPeopleThreat2['markers'] = createPulsePointAndMarker(targets[1], title, [10, 10], 'red', 'fa-user', 'square', infoText);
            dangerPeopleThreat2['markers']['point'].addTo(map);
            dangerPeopleThreat2['markers']['marker'].addTo(map);
            var line = createArcLine(targets);
            line.addTo(map);
            return {from:dangerPeopleThreat,to:dangerPeopleThreat2,line:line};
        }else{
            return {from:dangerPeopleThreat};
        }
    }
/************************发现暴恐联系人**********************/
    function showFindDangerPeopleThreat(targets,title,map,infoText){
        var dangerPeopleThreat={};
        dangerPeopleThreat['markers']=createPulsePointAndMarker(targets[0],title,[20,20],'red','fa-phone','square',infoText);
        dangerPeopleThreat['markers']['point'].addTo(map);
        dangerPeopleThreat['markers']['marker'].addTo(map);
        if(targets.length==2) {
            var dangerPeopleThreat2 = {};
            dangerPeopleThreat2['markers'] = createPulsePointAndMarker(targets[1], '', [10, 10], 'red', 'fa-phone', 'square');
            dangerPeopleThreat2['markers']['point'].addTo(map);
            dangerPeopleThreat2['markers']['marker'].addTo(map);
            var line = createArcLine(targets);
            line.addTo(map);
            return {from:dangerPeopleThreat,to:dangerPeopleThreat2,line:line};
        }else{
            return {from:dangerPeopleThreat};
        }
    }
/************************涉暴恐人员向区内寄递**********************/
    function showDangerPeopleDeliveryThreat(targets,title,map,infoText){
        var dangerPeopleThreat={};
        dangerPeopleThreat['markers']=createPulsePointAndMarker(targets[0],title,[20,20],'red','fa-truck','square',infoText);
        dangerPeopleThreat['markers']['point'].addTo(map);
        dangerPeopleThreat['markers']['marker'].addTo(map);
        if(targets.length==2) {
            var dangerPeopleThreat2 = {};
            dangerPeopleThreat2['markers'] = createPulsePointAndMarker(targets[1], '', [10, 10], 'red', 'fa-truck', 'square');
            dangerPeopleThreat2['markers']['point'].addTo(map);
            dangerPeopleThreat2['markers']['marker'].addTo(map);
            var line = createArcLine(targets);
            line.addTo(map);
            return {from:dangerPeopleThreat,to:dangerPeopleThreat2,line:line};
        }else{
            return {from:dangerPeopleThreat};
        }
    }
/************************发现高积分人员**********************/
    function showHighScorePeopleThreat(target,title,map,infoText){
        var highScorePeopleThreat={};
        highScorePeopleThreat['markers']=createPulsePointAndMarker(target,title,[20,20],'red','fa-user-secret','square',infoText);
        highScorePeopleThreat['markers']['point'].addTo(map);
        highScorePeopleThreat['markers']['marker'].addTo(map);
        return highScorePeopleThreat;
    }
/************************个人活动轨迹点**********************/
    function showActionPoint(point,icon,text,markerColor,layer){
        var markerIcon = L.ExtraMarkers.icon({
            icon: icon,
            markerColor: markerColor,
            number:text,
            shape: 'circle',
            prefix: 'fa'
        });
        var marker=L.marker(point, {icon: markerIcon});
        marker.addTo(layer);
        return marker;
    }
    function showActionPulsePoint(point,pulsePointSize,color,layer){
        var pulsingIcon=L.icon.pulse({iconSize:pulsePointSize,color:color});
        var pulsePoint = L.marker(point,{icon: pulsingIcon});
        pulsePoint.addTo(layer);
        return pulsePoint;
    }
    function clearActions(layer){
        layer.clearLayers();
    }
/**************************Utils*****************************/
    function clearThreat(threat,map){
        if('from' in threat){
            clearMarkerAndPoint(threat['from']['markers']);
            if('to' in threat){
                clearMarkerAndPoint(threat['to']['markers']);
                if(map.hasLayer(threat['line'])){
                    map.removeLayer(threat['line']);
                }
            }
        }else{
            clearMarkerAndPoint(threat['markers']);
            if('circle' in threat){
                if(map.hasLayer(threat['circle']['circle'])){
                    map.removeLayer(threat['circle']['circle']);
                }
            }
        }
    }
    function clearMarkerAndPoint(obj){
        if(map.hasLayer(obj['marker'])){
            map.removeLayer(obj['marker']);
        }
        if(map.hasLayer(obj['point'])){
            map.removeLayer(obj['point']);
        }
    }
    function handledThreat(threat,map){
        if('from' in threat){
            setPulsePointAndMarker(threat['from'],'blue',map);
            if('to' in threat){
                setPulsePointAndMarker(threat['to'],'blue',map);
            }
        }else{
            setPulsePointAndMarker(threat,'blue',map);
        }
    }
    function responsedThreat(threat,map){
        if('from' in threat){
            setPulsePointAndMarker(threat['from'],'green',map);
            if('to' in threat){
                setPulsePointAndMarker(threat['to'],'green',map);
            }
        }else{
            setPulsePointAndMarker(threat,'green',map);
        }
    }
    function createPulsePointAndMarker(point,title,pulsePointSize,markerColor,icon,shape,infoText){
        var markerIcon = L.ExtraMarkers.icon({
            icon: icon,
            markerColor: markerColor,
            shape: shape,
            prefix: 'fa'
        });
        var marker=L.marker(point, {icon: markerIcon});
        if(infoText!=undefined && infoText!=''){
            marker.bindPopup(infoText);
        }
        if(title!=''){
            marker.bindLabel(title, { noHide: true })
        }
        var pulsingIcon=L.icon.pulse({iconSize:pulsePointSize,color:'red'});
        var pulsePoint = L.marker(point,{icon: pulsingIcon});
        return {point:pulsePoint,marker:marker};
    }
    function setPulsePointAndMarker(obj,markerColor,map){
        var marker=obj['markers']['marker'];
        var markerIcon = L.ExtraMarkers.icon({
            icon: marker.options.icon.options.icon,
            markerColor: markerColor,
            shape: marker.options.icon.options.shape,
            prefix: 'fa'
        });
        marker.setIcon(markerIcon);
        if(map.hasLayer(obj['markers']['point'])){
            map.removeLayer(obj['markers']['point']);
            delete obj['markers']['point'];
        }
    }
    function createCircleArea(points){
        var center,radius;
        if(points.length==1){
            center=points[0];
            radius=1000;
        }
        else{
            var bounds=L.bounds(points);
            center=bounds.getCenter();
            radius= (L.latLng(center[0],center[1])).distanceTo(bounds.getTopRight())+100;
        }
        var circle = new L.Circle(center, radius,
            {
                stroke: true,
                color: '#ffa500',
                weight: 4,
                opacity: 1,
                fill: true,
                fillColor: null, //same as color by default
                fillOpacity: 0.1,
                clickable: false
            }
        );
        return {circle:circle,center:center};
    }
    function createArcLine(points){
        var arc=new bezier(points);
        var line= L.polyline(arc,
            {
                stroke: true,
                color: '#00ff33',
                dashArray: [2, 10],
                lineCap: null,
                lineJoin: null,
                weight: 5,
                opacity: 0.5,
                fill: false,
                fillColor: null, //same as color by default
                fillOpacity: 0.2,
                clickable: false
            });
        var antPolyline = new L.Polyline.AntPath(arc, {
            stroke: true,
            color: '#00ff33',
            dashArray: [2, 15],
            lineCap: null,
            lineJoin: null,
            weight: 5,
            opacity: 0.5,
            fill: false,
            fillColor: null, //same as color by default
            fillOpacity: 0.2,
            clickable: false
        });
        return antPolyline;
    }
//}(window, document));