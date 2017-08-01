/**
 * Created by xuxiaogang on 2016/10/8.
 */
    function DataLayer(url) {
        this._url=url;
        this._tiles={};
        this._layerGroup= L.featureGroup();
        this.options = {
            minZoom: 0,
            maxZoom: 18,
            tileSize: 256,
            subdomains: 'abc',
            errorTileUrl: '',
            attribution: '',
            zoomOffset: 0,
            opacity: 1
        };
		this.markers_layer = new L.MarkerClusterGroup({
            //spiderfyOnMaxZoom: false,
            //showCoverageOnHover: false,
            //zoomToBoundsOnClick: false
        });
    };
    DataLayer.prototype={
        //http://localhost:8080/LayerService/layer/getLayerPOIDataIndex?layerID=0&layerLevel=10&row=235&column=468
        addTo: function (map) {
			if(this._map!=undefined && this._map==map){
				this._reset();
				this._update();
				return;
			}
			this._map=undefined;
            this._map=map;
            this._layerGroup.addTo(this._map);
			this.markers_layer.addTo(this._map);
            this._map.on({
                'viewreset':this._reset,
                'moveend':this._update
            },this);
            this._reset();
            this._update();
        },
		hideLayer: function(){
			if(this._map){
				if(this._map.hasLayer(this._layerGroup)){
					this._map.removeLayer(this._layerGroup);
				}
				if(this._map.hasLayer(this.markers_layer)){
					this._map.removeLayer(this.markers_layer);
				}
				this._map.off({
                'viewreset':this._reset,
                'moveend':this._update
				},this);
			}
		},
		showLayer: function(){
			if(this._map){
				if(!this._map.hasLayer(this._layerGroup)){
					this._map.addLayer(this._layerGroup);
				}
				if(!this._map.hasLayer(this.markers_layer)){
					this._map.addLayer(this.markers_layer);
				}
				this._map.on({
                'viewreset':this._reset,
                'moveend':this._update
				},this);
				this._reset();
				this._update();
			}
		},
		setOptions:function(options){
			this._reset();
			this._hostname=options.hostname;
			this._layerID=options.layerID;
			this._overLayerName=options.layerName;
		},
        _reset:function(e){
			this.markers_layer.clearLayers();
            this._tiles={};
            this._tilesToLoad=0;
            this._layerGroup.clearLayers();
        },
        _update:function(){
            if(!this._map){return;}
			if(this._map.getZoom()<5){
				return;
			}
            if(this._map.getZoom()<12 && this._map.getZoom()>=5){
                this._addGlobalTile(this._map.getZoom());
                return;
            }
            if(this._map.getZoom()>=12){
                return;
            }
            var map=this._map,
                bounds=map.getPixelBounds(),
                zoom=map.getZoom(),
                tileSize=this.options.tileSize;
            if(zoom>this.options.maxZoom||zoom<this.options.minZoom){
                return;
            }
            var tileBounds = L.bounds(
                bounds.min.divideBy(tileSize)._floor(),
                bounds.max.divideBy(tileSize)._floor());
            this._addTilesFromCenterOut(tileBounds);
            this._removeOtherTiles(tileBounds);
        },
        _addTilesFromCenterOut:function(bounds){
            var queue =[],
                center=bounds.getCenter();
            var j, i,point;
            for(j=bounds.min.y;j<=bounds.max.y;j++){
                for(i=bounds.min.x;i<=bounds.max.x;i++){
                    point =new L.Point(i,j);
                    if(this._tileShouldBeLoaded(point)){
                        queue.push(point);
                    }
                }
            }
            var tilesToLoad = queue.length;
            if(tilesToLoad===0){return;}
            queue.sort(function(a,b){
                return a.distanceTo(center)- b.distanceTo(center);
            });
            if(!this._tilesToLoad){
//                this.fire('loading');
            }
            this._tilesToLoad +=tilesToLoad;
            if(this._map.getZoom()<16) {
                for (i = 0; i < tilesToLoad; i++) {
                    this._addClusterTile(queue[i]);
                }
            }else{
                for (i = 0; i < tilesToLoad; i++) {
                    this._addTile(queue[i]);
                }
            }
        },
        _tileShouldBeLoaded:function(tilePoint){
            if((tilePoint.x+':'+tilePoint.y) in this._tiles){
                return false;
            }
            return true;
        },
        _removeOtherTiles: function (bounds) {
            var kArr, x, y, key;
            for (key in this._tiles) {
                kArr = key.split(':');
                x = parseInt(kArr[0], 10);
                y = parseInt(kArr[1], 10);
                // remove tile if it's out of bounds
                if (x < bounds.min.x || x > bounds.max.x || y < bounds.min.y || y > bounds.max.y) {
                    this._removeTile(key);
                }
            }
        },
        _removeTile: function (key) {
			if(this._tiles[key] instanceof Array){
				this.markers_layer.removeLayers(this._tiles[key]);
				delete this._tiles[key];
				return;
			}
            this._tiles[key].clearLayers();
            this._layerGroup.removeLayer(this._tiles[key]);
            delete this._tiles[key];
        },
        _addClusterTile:function(tilePoint){
            var z=this._map.getZoom();
            var obj=this;
            $.ajax({
                type: 'GET',
                //url: this._url + '/getLayerPOIDataIndexCount?layerID=0&layerLevel=' + z + '&row=' + tilePoint.y + '&column=' + tilePoint.x,
				url:this._url,
				data:{
					hostname:this._hostname,
					path:'/LayerService/layer/getLayerPOIDataIndexCount',
					layerID:this._layerID,
					layerLevel:z,
					row:tilePoint.y,
					column:tilePoint.x
				},
                dataType: 'text',
                success: function (tile) {
					if(tile!='0'){
						obj._loadClusterTile(tile,tilePoint);
					}
                },
                error: function (errorMsg) {
                    console.log("未获取图层信息。");
                }
            });
        },
        _addTile:function(tilePoint){
            var z=this._map.getZoom();
            var obj=this;
            $.ajax({
                type: 'GET',
                //url: this._url + '/getLayerPOIDataIndex?layerID=0&layerLevel=' + z + '&row=' + tilePoint.y + '&column=' + tilePoint.x,
				url:this._url,
				data:{
					hostname:this._hostname,
					path:'/LayerService/layer/getLayerPOIDataIndex',
					layerID:this._layerID,
					layerLevel:z,
					row:tilePoint.y,
					column:tilePoint.x
				},
                dataType: 'text',
                success: function (tile) {
                    obj._loadTile(tile,tilePoint);
                },
                error: function (errorMsg) {
                    console.log("未获取图层信息。");
                }
            });
        },
        _loadTile:function(tile,tilePoint){
            var tileObj=JSON.parse(tile);
            var layerGroup= [];
            this._tiles[tilePoint.x + ':' + tilePoint.y] = layerGroup;
            //layerGroup.addTo(this.markers_layer);
            for(var i=0;i<tileObj.length;i++){
                var marker=L.marker([tileObj[i][1],tileObj[i][2]]).bindPopup(tileObj[i][0].toString());
				marker.addTo(this.markers_layer);
				layerGroup.push(marker);
            }
        },
        _loadClusterTile:function(tile,tilePoint){
            var layerGroup= L.featureGroup();
            this._tiles[tilePoint.x + ':' + tilePoint.y] = layerGroup;
            layerGroup.addTo(this._layerGroup);
            tilePoint=tilePoint.multiplyBy(256);
            var point=this._map.unproject(tilePoint,this._map.getZoom());
            //L.marker([point.lat,point.lng]).bindPopup(tile).addTo(layerGroup);
			var c = 'marker-cluster';
			var size=new L.Point(40, 40);
			if (tile < 10) {
				c += ' marker-cluster-small';
				size=new L.Point(40, 40);
			} else if (tile < 100) {
				c += ' marker-cluster-medium';
				size=new L.Point(40, 40);
			} else if(tile < 10000){
				c += ' marker-cluster-large';
				size=new L.Point(40, 40);
			} else {
				c += '-huge marker-cluster-huge';
				size=new L.Point(60, 60);
			}
			var divicon=new L.DivIcon({ html: '<div><span>' + tile + '</span></div>', className: c, iconSize: size });
			L.marker([point.lat,point.lng],{icon:divicon}).addTo(layerGroup);
        },
        _addGlobalTile:function(zoom){
            var zoneType=3;
            if(zoom<=6){
                zoneType=1;
            }else if(zoom<=9){
                zoneType=2;
            }else{
                zoneType=3;
            }
            if(zoneType.toString() in this._tiles){
                return;
            }
            var obj=this;
            $.ajax({
                type: 'GET',
                //url: this._url + '/getLayerPOIGobalStatis?layer=0&zoneType='+zoneType,
				url:this._url,
				data:{
					hostname:this._hostname,
					path:'/LayerService/layer/getLayerPOIGobalStatis',
					layer:this._layerID,
					zoneType:zoneType
				},
                dataType: 'text',
                success: function (tile) {
                    var tileObj=JSON.parse(tile);
                    var layerGroup= L.featureGroup();
                    obj._tiles[zoneType.toString()] = layerGroup;
                    layerGroup.addTo(obj._layerGroup);
                    for(var i=0;i<tileObj.length;i++){
                        if(tileObj[i]['poiCount']==0){
                            continue;
                        }
                        //L.marker(tileObj[i].coordinates).bindPopup(tileObj[i]['poiCount'].toString()).addTo(layerGroup);
						var c = 'marker-cluster';
						var size=new L.Point(40, 40);
						if (tileObj[i]['poiCount'] < 10) {
							c += ' marker-cluster-small';
							size=new L.Point(40, 40);
						} else if (tileObj[i]['poiCount'] < 100) {
							c += ' marker-cluster-medium';
							size=new L.Point(40, 40);
						} else if(tileObj[i]['poiCount'] < 10000){
							c += ' marker-cluster-large';
							size=new L.Point(40, 40);
						} else {
							c += '-huge marker-cluster-huge';
							size=new L.Point(60, 60);
						}
						var divicon=new L.DivIcon({ html: '<div><span>' + tileObj[i]['poiCount'] + '</span></div>', className: c, iconSize: size });
						L.marker(tileObj[i].coordinates,{icon:divicon}).addTo(layerGroup);
                    }
                },
                error: function (errorMsg) {
                    console.log("未获取图层信息。");
                }
            });
        }
    };
    dataLayer = function (url) {
        return new DataLayer(url);
    };