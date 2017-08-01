 registerLocales(require.context('../../../locales/gismodule/', false, /\.js/));
 define('./gis-module', [
     //'../../../../config',
     'nova-utils',
     './datafenceFuncHelper',
     '../../widget/gis/loadChinaRegionModule',
     '../../widget/gis/searchBoxModule',
     '../../widget/gis/pathBoxModule',
     '../../widget/gis/offlineSearchModule',
     '../../widget/gis/gisCollisionModule',
     '../../widget/gis/enclosureBoxModule',
     '../../tpl/gis/tpl-gismodule',
     '../../tpl/gis/tpl-toolbar',
     '../../tpl/gis/tpl-search-box',
     '../../tpl/gis/tpl-path-box',
     '../../tpl/gis/tpl-offlineSearch-box',
     '../../../../../../public/widget/personalworktree/personalwork-tree',
     'nova-dialog',
     'nova-notify',
     'moment',
     'utility/select2/select2',
     'utility/select2/i18n/zh-CN',
     'utility/multiselect/bootstrap-multiselect'
 ], function(Util, datafenceHelper, loadChinaRegionModule, searchBoxModule, pathBoxModule, offlineSearchModule, gisCollisionModule, enclosureBoxModule, tpl_gis, tpl_toolbar, tpl_search_box, tpl_path_box, tpl_offlineSearch_box, PersonalWorkTree, Dialog, Notify, moment) {

     var appConfig = window.__CONF__.business.datafence;
     var settings = {};
     var map;
     var showPanelID = "setPositionPanel";
     // tpl_common = _.template(tpl_common);
     // tpl_string = _.template(tpl_string);
     tpl_gis = _.template(tpl_gis);
     tpl_toolbar = _.template(tpl_toolbar);
     tpl_search_box = _.template(tpl_search_box);
     tpl_path_box = _.template(tpl_path_box);
     var userID = Util.getCookiekey('userid');
     var curRegion;

     var offlineSearchBox;
     var gisCollisionBox;
     var pathBox;
     var gisCollisionBox;

     var isCollisionBoxInited = 0;
     var isOfflineSearchBoxInited = 0;
     var isEnclosureBoxInited = 0;




     var scales = ['5.91657527591555E8', '2.95828763795777E8', '1.47914381897889E8', '7.3957190948944E7',
         '3.6978595474472E7', '1.8489297737236E7', '9244648.868618', '4622324.434309',
         '2311162.217155', '1155581.108577', '577790.554289', '288895.277144',
         '144447.638572', '72223.819286', '36111.909643', '18055.954822',
         '9027.977411', '4513.988705', '2256.994353'
     ];

     var carrierDic = //JSON.parse(JSON.parse(appConfig['gisCarrierDic'])) ||
         {
             '移动': '0',
             '电信': '11',
             '联通': '1',
             '铁通': '',
             '网通': '',
             '中国移动': '1',
             '中国联通': '2',
             '中国电信': '3',
             '中国铁通': '4',
             '中国网通': '5',
         }
         // var carrierDic = {};

     function _getGisConfig() {
         $.ajax({
             type: 'GET',
             url: '/smartquery/smartquery/get_gis_init_params',
             async: false,
             dataType: 'json',
             success: function(rsp) {
                 settings["center"] = rsp.default_coordinate;
                 settings["zoom"] = rsp.default_z;
                 settings["showToolbar"] = rsp.show_districts;
             },
             error: function(rsp) {
                 settings["center"] = [39, 105];
                 settings["zoom"] = 5;
                 settings["showToolbar"] = true;
             }
         });
     }

     function _setInitGisConfig() {
        settings["center"] = [39, 105];
        settings["zoom"] = 5;
        settings["showToolbar"] = true;
     }

     function _getCarriers() {
         $.ajax({
             url: '/datasearch/get_carriers',
             type: 'POST',
             async: false,
             data: {},
             dataType: 'json',
             success: function(rsp) {

                 for (var i = 0; i < rsp.length; i++) {
                     carrierDic[rsp[i].value] = rsp[i].key;
                 }

             }

         });
     }
     //展示地图
     function showMap() {

         if (settings["showToolbar"] == false) {
             $("#mapToolBar").hide();
         }
         map = L.map('map', {
             attributionControl: false
                 // }).setView(settings["center"], settings["zoom"]);
         }).setView([39, 105], 5);
         // var ip = 'http://'+appConfig['gisServer'] + ':8080/TileMapService/arcgis/rest/services/world/MapServer/tile/{z}/{y}/{x}.png'
         var ip = '/gisapi/tileMap?hostname=' + appConfig['gis-server'] + '&x={x}&y={y}&z={z}'
         L.tileLayer(ip, {
             minZoom: 3,
             maxZoom: 18
         }).addTo(map);
         map.setMaxBounds([
             [-90, -180],
             [90, 180]
         ]);
         L.control.scale({
             position: "bottomleft",
             metric: true,
             imperial: false
         }).addTo(map);
         var map2 = L.tileLayer(ip, {
             minZoom: 0,
             maxZoom: 14
         });
         var miniMap = new L.Control.MiniMap(map2, {
             position: 'bottomright',
             zoomLevelOffset: -4,
             toggleDisplay: true,
             width: 200,
             height: 200
         }).addTo(map);
         var mapToolBar = document.getElementById('mapToolBar');
         L.DomEvent.disableClickPropagation(mapToolBar);
         L.DomEvent.on(mapToolBar, 'wheel', L.DomEvent.stopPropagation);
         $(".leaflet-control-scale-line").after('<div id="scale">' + i18n.t('gismodule.common.mapToolbar.scale') + scales[map.getZoom()] + '</div>');
         map.on('mousemove', function(e) {
             $("#lng")[0].innerText = "" + e.latlng.lng.toFixed(6);
             $("#lat")[0].innerText = "" + e.latlng.lat.toFixed(6);
         });
         map.on('zoomend', function(e) {
             $("#scale")[0].innerText = i18n.t('gismodule.common.mapToolbar.scale') + scales[map.getZoom()];
         });
         $('#regionCheck').on('click', function(e) {
             if (this.checked) {
                 if (curRegion != undefined) {
                     if (!map.hasLayer(curRegion)) {
                         curRegion.addTo(map);
                         map.fitBounds(curRegion.getBounds());
                     }
                 }
             } else {
                 if (curRegion != undefined) {
                     if (map.hasLayer(curRegion)) {
                         map.removeLayer(curRegion);
                     }
                 }
             }
         });
         //loadUserLastTimeRegion();
         if ($('#left-panel-toggle') != undefined) {
             $('#left-panel-toggle').click(function() {
                 map.invalidateSize();
             });
         }
     }

     function destroy() {
         map = undefined;
         curRegion = undefined;
     }
     //地图定位
     function addSetPositionPanel() {
         var toolbar = new L.control.toolbar({
             collapsed: true,
             position: 'topright',
             autoZIndex: true
         });
         toolbar.addTo(map);

         var setPositionBtn = new setPosition({
             panelParentID: "setPositionPanel"
         });
         setPositionBtn.addTo(toolbar);

         var hidePanelImg = setPositionBtn.getHidePanelImg();
         hidePanelImg.onclick = function() {
             $("#out-panel").animate({
                 width: "hide"
             }, 500); //隐藏地图定位面板
         };

         var outBtn = setPositionBtn.getBtn();
         outBtn.onclick = function() {
             if ($("#out-panel").is(':visible')) {
                 if (showPanelID == "setPositionPanel") {
                     $("#out-panel").animate({
                         width: "hide"
                     }, 500); //隐藏地图定位面板
                 } else {
                     $("#" + showPanelID).hide();
                     showPanelID = "setPositionPanel";
                     $("#" + showPanelID).show();
                 }
             } else {
                 if (showPanelID != "setPositionPanel") {
                     $("#" + showPanelID).hide();
                     showPanelID = "setPositionPanel";
                     $("#" + showPanelID).show();
                 }
                 $("#out-panel").animate({
                     width: "show"
                 }, 500); //显示地图定位面板
             }

             $("#map").css("min-height", "190px");
         }
     }
     //图层展示
     function addSetLayerPanel() {
         var toolbar = new L.control.toolbar({
             collapsed: true,
             position: 'topright',
             autoZIndex: true
         });
         toolbar.addTo(map);

         var setLayer = new setLayerInfo({
             panelParentID: "setLayerPanel"
         });
         setLayer.initialize(toolbar);

         setLayer.getCloseElement().onclick = function() {
             $("#out-panel").animate({
                 width: "hide"
             }, 500); //隐藏面板
         };

         setLayer.getRelativeBtn().onclick = function() {
             if ($("#out-panel").is(':visible')) {
                 if (showPanelID == "setLayerPanel") {
                     $("#out-panel").animate({
                         width: "hide"
                     }, 500); //隐藏面板
                 } else {
                     $("#" + showPanelID).hide();
                     showPanelID = "setLayerPanel";
                     $("#" + showPanelID).show();
                 }
             } else {
                 if (showPanelID != "setLayerPanel") {
                     $("#" + showPanelID).hide();
                     showPanelID = "setLayerPanel";
                     $("#" + showPanelID).show();
                 }
                 $("#out-panel").animate({
                     width: "show"
                 }, 500); //显示地图定位面板
             }
             $("#map").css("min-height", "150px");
         }
     }

     //模拟加目标数据
     function addTargetDatas(jsonObj) {
         pathBox.AddTargetData(jsonObj);
         // setData();
     }

     function clearTargerDatas() {
         pathBox.ClearTargetData();
     }

     function setData() {
         // console.log(pathBox)
         pathBox.setTargetData();
     }

     //edit by hjw, used to save crawled city data

     function getCityInfo(provinceList) {
         var infoList = {};
         infoList.cityList = [];
         infoList.provinceList = provinceList;
         for (var i = 0; i < provinceList.length; i++) {
             var count = i;
             $.get('/gisapi/gisGetQuery', {
                     hostname: appConfig['gis-server'],
                     path: '/GisService/regions/provinces/' + provinceList[i]['zoneCode'] + '/cities',
                 },

                 function(cities) {
                     // console.log(cities)
                     var cityList = JSON.parse(cities);
                     if (cityList.length == 0) {
                         infoList.cityList.push(provinceList[i]);
                         return;
                     } else {
                         for (var j = 0; j < cityList.length; j++) {
                             cityList[j].provinceCode = provinceList[count]['zoneCode'];
                             infoList.cityList.push(cityList[j]);
                         }
                     }

                 }
             );
         }
         // $.post('/smartquery/writeCityData', {
         //     infoList: JSON.stringify(infoList)
         // }, function(rsp) {
         //     console.log(JSON.parse(rsp))
         // });

     }

     function makeGisJSON(rowRecords, datatype) {
         //rowRecords = rowRecords.slice(0, 5)
         var gisJson = [];
         $.getJSON('/smartquery/smartquery/getGisQueryConfig', datatype).done(function(rsp) {
             if (rsp.code == 0) {
                 var data = rsp.data;

                 group = _.groupBy(rowRecords, data.targetField);
                 var index = 0;
                 for (var item in group) {
                     // console.log(item);
                     if (index > 4) {
                         break;
                     }
                     if (item == "") {
                         Notify.simpleNotify("目标字段为空无法上图")
                         continue;
                     }
                     index++;

                     var json = {};
                     json.name = item;
                     json.time = '活动点时间';
                     json.latitude = '纬度';
                     json.longitude = '经度';

                     var columns = [];
                     _.each(data.displayFields, function(item) {
                         columns.push(item.caption);
                     })
                     json.columns = columns.concat(['活动点时间', '经度', '纬度']);

                     var records = [];
                     var rows = group[item];




                     var layerField;
                     var fieldValues = [];



                     for (var i = 0; i < rows.length; i++) {
                         var row = rows[i];

                         var record = [];
                         _.each(data.displayFields, function(item) {
                             record.push(row[item.name]);
                         })

                         var fieldValue;
                         var supportLongLat = false;
                         var isBaseStation = false;
                         record.push("Bussinesstime");
                         _.each(data.BussinessToGISFieldList, function(item) {
                             if (item.isLongLat == true) {
                                 supportLongLat = true;
                                 record[record.length - 1] = row[item.BussinessTimeField];
                                 record.push(item.Longitude ? row[item.Longitude] : row['USER_LONGITUDE']);
                                 record.push(item.Latitude ? row[item.Latitude] : row['USER_LATITUDE']);
                             } else {
                                 if (item.LayerID == 0) { //基站图层
                                     supportLongLat = false;
                                     isBaseStation = true;
                                     if (item.carrierField && item.carrierField != '') {
                                         var carrierCode = carrierDic[row[item.carrierField]];
                                         carrierCode = carrierCode != undefined ? carrierCode : '';
                                         value = carrierCode + ',' + row[item.BussinessPhysicalName];
                                     } else {
                                         value = "," + row[item.BussinessPhysicalName];
                                     }
                                     fieldValues.push(value);
                                 } else { //其他上图
                                     supportLongLat = false;
                                     isBaseStation = false;
                                     var value;
                                     value = row[item.BussinessPhysicalName];

                                     fieldValues.push(value);
                                     layerField = item.LayerFieldDisplayName;
                                 }
                                 record[record.length - 1] = row[item.BussinessTimeField];
                             }

                             records.push(record.slice(0));
                         })
                     }
                     if (supportLongLat) {
                         recordsCopy = _.groupBy(records, records[0].length - 3);
                         var tempRecord = [];
                         for (var item2 in recordsCopy) {
                             if (item2 == undefined) {
                                 continue;
                             }
                             tempRecord.push(recordsCopy[item2][0]);
                         }
                         recordsCopy = tempRecord;
                         recordsCopy = _.sortBy(recordsCopy, recordsCopy[0].length - 3);

                         json.data = recordsCopy;
                         gisJson.push(json);
                         clearTargerDatas();
                         _.each(gisJson, function(obj) {
                             addTargetDatas(obj);
                         });
                     } else {
                         if (isBaseStation) {
                             $.ajax({
                                 type: 'post',
                                 url: '/gisapi/gisPostQuery',
                                 data: {
                                     fieldValues: fieldValues,
                                     hostname: appConfig['gis-server'],
                                     path: '/GisService/search/baseQuery'
                                 },
                                 datatype: 'text',
                                 async: false,
                                 success: function(rsp1) {
                                     var rspJson = eval(rsp1);
                                     if (rspJson == undefined) {
                                         Notify.simpleNotify("目标" + item + "无可查询基站数据");
                                         clearTargerDatas();
                                         return;
                                     }
                                     var recordsCopy = [];
                                     for (var j = 0; j < rspJson.length; j++) {
                                         if (rspJson[j] == null || rspJson[j] == null) {
                                             continue;
                                         }
                                         var lon = rspJson[j].longitude.toString();
                                         var lat = rspJson[j].latitude.toString();
                                         var startlon = lon.indexOf(".");
                                         lon = lon.substr(0, startlon) + lon.substr(startlon, 9);
                                         var startlat = lat.indexOf(".");
                                         lat = lat.substr(0, startlat) + lat.substr(startlat, 9);

                                         records[j].push(lon);
                                         records[j].push(lat);
                                         recordsCopy.push(records[j]);
                                     }

                                     if (recordsCopy.length > 0) {
                                         if (recordsCopy.length < rspJson.length) {
                                             Notify.simpleNotify("目标" + item + "部分基站数据无法查询")
                                             console.log(recordsCopy);
                                         }
                                         recordsCopy2 = _.groupBy(recordsCopy, recordsCopy[0].length - 3);
                                         var tempRecord = [];
                                         for (var item2 in recordsCopy2) {
                                             if (item2 == undefined) {
                                                 continue;
                                             }
                                             tempRecord.push(recordsCopy2[item2][0]);
                                         }
                                         recordsCopy2 = tempRecord;
                                         recordsCopy2 = _.sortBy(recordsCopy2, recordsCopy2[0].length - 3);

                                         json.data = recordsCopy2;
                                         gisJson.push(json);
                                         console.log(gisJson);
                                         clearTargerDatas();
                                         _.each(gisJson, function(obj) {
                                             addTargetDatas(obj);
                                         });
                                     } else {
                                         Notify.simpleNotify("目标" + item + "无可查询基站数据");
                                     }
                                 }
                             });
                         } else {
                             $.ajax({
                                 type: 'post',
                                 url: '/gisapi/gisPostQuery',
                                 data: {
                                     featureID: data.BussinessToGISFieldList[0].LayerID,
                                     fieldName: layerField,
                                     fieldValues: fieldValues,
                                     requireFields: ['经度', '纬度'],
                                     hostname: appConfig['gis-server'],
                                     path: '/GisService/search/normalQuery'
                                 },
                                 datatype: 'text',
                                 async: false,
                                 success: function(rsp2) {

                                     var rspJson = eval(rsp2);
                                     if (rspJson == undefined) {
                                         Notify.simpleNotify("目标" + item + "无可查询数据");
                                         clearTargerDatas();
                                         return;
                                     }
                                     var recordsCopy = [];
                                     for (var j = 0; j < rspJson.length; j++) {
                                         if (rspJson[j] == null || rspJson[j][0] == null || rspJson[j][1] == null) {
                                             continue;
                                         }
                                         var lon = rspJson[j][0].toString();
                                         var lat = rspJson[j][1].toString();
                                         var startlon = lon.indexOf(".");
                                         lon = lon.substr(0, startlon) + lon.substr(startlon, 9);
                                         var startlat = lat.indexOf(".");
                                         lat = lat.substr(0, startlat) + lat.substr(startlat, 9);

                                         records[j].push(lon);
                                         records[j].push(lat);
                                         recordsCopy.push(records[j]);
                                     }


                                     if (recordsCopy.length > 0) {
                                         if (recordsCopy.length < rspJson.length) {
                                             Notify.simpleNotify("目标" + item + "部分数据无法查询")
                                             console.log(recordsCopy);
                                         }
                                         recordsCopy2 = _.groupBy(recordsCopy, recordsCopy[0].length - 3);
                                         var tempRecord = [];
                                         for (var item2 in recordsCopy2) {
                                             if (item2 == undefined) {
                                                 continue;
                                             }
                                             tempRecord.push(recordsCopy2[item2][0]);
                                         }
                                         recordsCopy2 = tempRecord;
                                         recordsCopy2 = _.sortBy(recordsCopy2, recordsCopy2[0].length - 3);

                                         json.data = recordsCopy2;
                                         gisJson.push(json);
                                         clearTargerDatas();
                                         _.each(gisJson, function(obj) {
                                             addTargetDatas(obj);
                                         });
                                     } else {
                                         Notify.simpleNotify("目标" + item + "无可上图数据");
                                     }
                                 }
                             });
                         }
                     }


                 }

                 setData();

                 // $("#manageAimTrackPanel").show();

             }
         });

     }


     function addBoxesContainer() {

         $('#boxes').draggable({
             containment: "#main-container",
             cancel: ".trackPlay,input,#mapMenu,#collision-result,#innerPoint"
         });

         $('#loadChinaRegion').draggable({
             containment: "#main-container",
             cancel: ".trackPlay,input,#mapMenu,#collision-result"
         });

         $("#btn-analysis").on("mouseover", function(e) {
             $("#toolbar .navigation ul").show(10);
         });
         $("#toolbar .navigation ul").on("mouseover", function(e) {
             $("#toolbar .navigation ul").show();
         });
         $("#btn-analysis").on("mouseout", function(e) {
             $("#toolbar .navigation ul").hide();
         });
         $("#toolbar .navigation ul").on("mouseout", function(e) {
             $("#toolbar .navigation ul").hide();
         });
     }

     function appendToolBar() {
         $('#boxes').append(tpl_toolbar);
     }


     function switchLogic() {
         // $('#searchBox,.poibar').on('focusin', function(e) {
         //     //offlineSearchBox.hideBox();
         //     $('#offlineSearchBox').hide();
         //     pathBox.hideBox();
         //     $('#enclosureBox').hide();
         //     $('#searchBox').show();
         //     $('#catePanel').css({
         //         'display': 'block',
         //         'overflow': 'visible'
         //     })

         // });

         $('.poibar input,.poibar #excuteQuery').on('click', function() {
             if ($('#catePanel').height() == 0) {
                 console.log('click');
                 $('#offlineSearchBox').hide();
                 $('#collisionBox').hide();
                 pathBox.hideBox();
                 searchBoxModule.showBox();
                 $('#enclosureBox').hide();

             }

         });



         // $('#searchBox').on('click',function(){
         //    $(this).focus();
         // })

         $("#offlineSearchBtn").on('click', function(e) {
             if (isOfflineSearchBoxInited == 0) {
                 isOfflineSearchBoxInited = 1;
                 offlineSearchBox._initialize();
             } else {
                 offlineSearchBox.reloadTree();
             }

             searchBoxModule.hideBox();
             enclosureBoxModule.hideBox();

             $('#pathDisplayBox').hide();
             $('#pathLoadingBox').hide();

             $('#offlineSearchBox').show();
             $('#collisionBox').hide();
         })

         $("#collisionBtn").on('click', function(e) {
             if (isCollisionBoxInited == 0) {
                 isCollisionBoxInited = 1;
                 gisCollisionBox._initialize();
             }
             searchBoxModule.hideBox();
             enclosureBoxModule.hideBox();

             $('#pathDisplayBox').hide();
             $('#pathLoadingBox').hide();

             $('#offlineSearchBox').hide();
             $('#collisionBox').show();

         })



         $('#btn-fence').on('click', function(e) {
             if (isEnclosureBoxInited == 0) {
                 isEnclosureBoxInited = 1;
                 enclosureBoxModule.init({
                     gisServer: appConfig['gis-server'],
                     userID: userID,
                     map: map
                 });
             }

             searchBoxModule.hideBox();
             pathBox.hideBox();
             $('#offlineSearchBox').hide();
             $('#collisionBox').hide();

             $('#enclosureBox').show();
         })

         $('#loadChinaRegionButton').on('click', function() {
             if ($('#loadChinaRegionBox').is(':visible')) {
                 loadChinaRegionModule.hideBox();
             } else {
                 loadChinaRegionModule.showBox();
             }
         })

     }

     function switchToOfflineSearch() {
         $("#boxes").on("click", "#searchByShape", function() {
             var menu = document.getElementById("mapMenu");
             if (!isOfflineSearchBoxInited) {
                 isOfflineSearchBoxInited = 1;
                 offlineSearchBox._initialize();
             }
             $("#offlineSearchBox").show();
             $("#enclosureBox").hide();
             $("#offlineSearchBox #fence-input").val("当前围栏");
             $("#offlineSearchBox #fence-input").attr("curfence",true);
             $("#offlineSearchBox #fence-input").attr("title","");
             $("#offlineSearchBox #fence-input").attr("fenceid","");
             console.log(menu._source);
             menu.style.display = "none";
             // console.log(shape);
         })
     }

     function showPathBox() {
         $('#boxes').draggable({
             containment: "#main-container",
             cancel: ".trackPlay,input"
         });
         $("#pathLoadingBox").hide();
         $("#backToQuery").hide();
         $("#openResult").hide();
         $("#pathBox").show();
         $("#pathDisplayBox").show();

     }

     function Init(opts) {
         if (map) {
             destroy();
         }
         // _getGisConfig();
         _setInitGisConfig();
         // _getCarriers();
         $(opts.container).empty().append(tpl_gis);
         showMap();
         // loadChinaRegion();
         // loadChinaRegionModule.init({
         //    appConfig:appConfig,
         //    map:map,
         //    curRegion:curRegion
         // });

         appendToolBar();

         pathBox = new pathBoxModule.pathBox({
             _map: map,
             _container: '',
             datafenceHelper: datafenceHelper,
         });
         pathBox.init();


         switch (opts.pageSource) {
             case 'smartquery':
                 $('#toolbar').hide();
                 showPathBox();
                 break;
             case 'taskresult':
                 $('#toolbar').hide();
                 break;
             case 'datafence':
             default:
                 // loadChinaRegion();

                 searchBoxModule.init({
                     panelParentID: "searchPOIPanel",
                     map: map,
                     gisServer: appConfig['gis-server']
                 });

                 // enclosureBoxModule.init({
                 //     gisServer: appConfig['gis-server'],
                 //     userID: userID,
                 //     map: map
                 // });


                 var task = {};
                 offlineSearchBox = new offlineSearchModule.offlineSearchBox({
                     panelParentID: "offlineSearchBox",
                     appConfig: appConfig,
                     moment: moment,
                     datafenceHelper: datafenceHelper,
                     PersonalWorkTree: PersonalWorkTree,
                     addTargetDatas: addTargetDatas,
                     makeGisJSON: makeGisJSON,
                     pathBox: pathBox,
                     userID: userID
                 });
                 // offlineSearchBox._initialize();

                 gisCollisionBox = new gisCollisionModule.gisCollisionBox({
                     panelParentID: "gisCollisionBox",
                     appConfig: appConfig,
                     moment: moment,
                     datafenceHelper: datafenceHelper,
                     PersonalWorkTree: PersonalWorkTree,
                     makeGisJSON: makeGisJSON,
                 });
                 // gisCollisionBox._initialize();

                 task.analysisType = String(Util.getURLParameter('tasktype'));
                 if (task.analysisType && task.analysisType != "null") {
                     loadChinaRegionModule.init({
                         appConfig: appConfig,
                         map: map,
                         curRegion: curRegion,
                         needLoadPreference: false
                     });
                     switch (task.analysisType) {
                         case "111":
                             isOfflineSearchBoxInited = 1;
                             offlineSearchBox._initialize();
                             offlineSearchBox._loadData();
                             break;
                         case "113":
                         case "114":
                         case "115":
                             isCollisionBoxInited = 1;
                             gisCollisionBox._initialize();
                             gisCollisionBox.showCollisionBox();
                             break;
                         default:
                             break;
                     }
                 } else {
                     loadChinaRegionModule.init({
                         appConfig: appConfig,
                         map: map,
                         curRegion: curRegion,
                         needLoadPreference: true
                     });
                 }

                 addBoxesContainer();
                 switchToOfflineSearch()

                 break;
         }

         switchLogic();

     }

     return {
         Init: Init,
         addTargetDatas: addTargetDatas,
         map: map,
         makeGisJSON: makeGisJSON,
     }
 })