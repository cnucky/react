/**
 * Created by user on 2016/10/11.
 */
define('module/Layermanager/mapTool', ['nova-notify'], function(Notify) {
    var map; //地图对象
    var scales = ['5.91657527591555E8', '2.95828763795777E8', '1.47914381897889E8', '7.3957190948944E7',
        '3.6978595474472E7', '1.8489297737236E7', '9244648.868618', '4622324.434309',
        '2311162.217155', '1155581.108577', '577790.554289', '288895.277144',
        '144447.638572', '72223.819286', '36111.909643', '18055.954822',
        '9027.977411', '4513.988705', '2256.994353'
    ];
    var layerFields;
    var hostName;
    var layerID;
    var Dialog;
    var pointsGroup;
    var locatePoint;
    var pointArray;
    //初始化
    function init(tabID, mapServer) {
        _addMapTool(tabID);
        _initMap(mapServer);
        _addEvent();
        _resize();
        //定义dialog
        Dialog = new _defineDialog();
        Dialog.initialize();
    }

    //添加“地图查询工具”tab内容
    function _addMapTool(tabID) {
        $(_createTabContent(tabID)).appendTo("#tabContent");
    }

    //生成Html
    function _createTabContent(tabid) {
        var innerHtml = '<div id="' + tabid + '" style="height:100%">' +
            '<div id="out-panel" class="out-panel">' +
            '<div class="panel" style="opacity: 0.9;margin-bottom:0">' +
            '<div class="track-group-title" unselectable="on" style="-webkit-user-select: none;  display:none">' +
            '<span class="fa fa-exchange text-primary" style="font-size: 23px;padding-left: 12px;padding-right: 12px;"></span>' +
            '<span class="panel-title">' + i18n.t('gismodule.LayerManager.mapTool.title') + '</span>' +
            '</div>' +
            '<div class="track-group-body" >' +
            '<div id="queryCondition" style="margin: 8px;height: 40px">' +
            '<input name="searchInput" id="searchInput" type="text" class="form-control ng-pristine ng-untouched ng-valid ng-empty" placeholder="' + i18n.t('gismodule.LayerManager.mapTool.placeholder') + '" ng-model="keyword" style="width: 85%;float: left;display: inline">' +
            '<button class="btn-custom btn-primary" id="searchBtn" style="width: 15%;float: left;display: inline"><i class="fa fa-search"></i></button>' +
            '</div>' +
            '<div id="menuBtn" style="margin: 10px;height: 20px;">' +
            '<button id="editDataBtn" type="button" class="btn_custom_small btn-success">' +
            '<i class="fa fa-edit"></i>' + i18n.t('gismodule.LayerManager.mapTool.edit') +
            '</button>' +
            '<button id="addDataBtn" type="button" class="btn_custom_small btn-success">' +
            '<i class="fa fa-home"></i>' + i18n.t('gismodule.LayerManager.mapTool.add') +
            '</button>' +
            '<button id="delDataBtn" type="button" class="btn_custom_small btn-success" style="background-color: red;">' +
            '<i class="fa fa-coffee"></i>' + i18n.t('gismodule.LayerManager.mapTool.delete') +
            '</button>' +
            '<button id="clearBtn" type="button" class="btn_custom_small btn-success" style="background-color: red;">' +
            '<i class="fa fa-save"></i>' + i18n.t('gismodule.LayerManager.mapTool.clear') +
            '</button>' +
            '</div>' +
            '<div id="resultTab" style="overflow: scroll">' +
            '</div>' +
            '<div id="dialogPanel" style="background-color:transparent;display:none">' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +

            '<div id="map" style="height: 100%">' +
            '</div>' +
            '</div>';
        return innerHtml;

    }

    function _createEditPanel(columns, record) {
        var innerHtml = '';
        for (var i = 0; i < columns.length; i++) {
            var flag = '';
            var color = '';
            var column = columns[i];
            if (column == 'LAC' || column == 'CI' || column == i18n.t('gismodule.LayerManager.mapTool.columns.carrier') || column == 'Record_ID') {
                flag = 'readonly="true"';
                color = 'color:red;';
            }
            if (column == i18n.t('gismodule.LayerManager.mapTool.columns.lng') || column == i18n.t('gismodule.LayerManager.mapTool.columns.lat')) {
                column += '(*)';
                color = 'color:red;';
            }
            var temp = '<div class="section mv5" style="margin-left:10px;margin-right:10px">' +
                '<div class="row">' +
                '<label class="control-label col-md-4 " style="text-align: left;' + color + '">' + column + ':</label>' +

                '<div class="col-md-8">' +
                '<div class="bs-component ">' +
                '<input type="text" class="form-control search-condition-text" id="txtOfficeTitle" condition_item="MT_TITLE" value="' + record[i] + '" ' + flag + ' style="height:20px">' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
            innerHtml += temp;
        };

        return innerHtml;
    }

    function _createAddPanel(columns) {
        var innerHtml = '';
        for (var i = 0; i < columns.length - 1; i++) {
            var color = '';
            var column = columns[i];
            if (column == 'LAC' || column == 'CI' || column == i18n.t('gismodule.LayerManager.mapTool.columns.carrier') || column == i18n.t('gismodule.LayerManager.mapTool.columns.lng') || column == i18n.t('gismodule.LayerManager.mapTool.columns.lat')) {
                column += '(*)';
                color = 'color:red;';
            }
            var temp = '<div class="section mv5" style="margin-left:10px;margin-right:10px">' +
                '<div class="row">' +
                '<label class="control-label col-md-4 " style="text-align: left;' + color + '">' + column + ':</label>' +

                '<div class="col-md-8">' +
                '<div class="bs-component ">' +
                '<input type="text" class="form-control search-condition-text" id="txtOfficeTitle" condition_item="MT_TITLE" style="height:20px">' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
            innerHtml += temp;
        };

        return innerHtml;
    }

    //初始化地图
    function _initMap(url) {
        map = L.map('map', {
            attributionControl: false
        }).setView([39, 105], 5);
        L.tileLayer(url, {
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
        $(".leaflet-control-scale-line").after('<div id="scale">' + i18n.t('gismodule.LayerManager.mapTool.scale') + scales[map.getZoom()] + '</div>');
        map.on('zoomend', function(e) {
            $("#scale")[0].innerText = i18n.t('gismodule.LayerManager.mapTool.scale') + scales[map.getZoom()];
        });
        pointsGroup = new L.FeatureGroup();
        pointsGroup.addTo(map);
    }

    function _addEvent() {
        //hidden and show panel
        $(".track-group-title").click(function() {
            if ($("#out-panel").hasClass("out-panel-open")) {
                $("#out-panel").removeClass("out-panel-open");
            } else {
                $("#out-panel").addClass("out-panel-open");
            }
        });
        //search Btn event processor
        $('#searchBtn').click(function(e) {
            var mapBounds = map.getBounds();
            var leftDownLng = mapBounds._southWest.lng; //左下角经度
            var leftDownLat = mapBounds._southWest.lat; //左下角纬度
            var rightTopLng = mapBounds._northEast.lng; //右上角经度
            var rightTopLat = mapBounds._northEast.lat; //右上角纬度
            var shape = {
                "latlngs": [
                    [leftDownLat, leftDownLng],
                    [rightTopLat, leftDownLng],
                    [rightTopLat, rightTopLng],
                    [leftDownLat, rightTopLng]
                ]
            };
            var shapeType = '3';
            // var center=mapBounds.getCenter();
            // var shape={"center":[center.lat,center.lng],"radius":center.distanceTo(mapBounds._southWest)};
            // var shapeType='1';
            showLoader();
            $.ajax({
                type: 'GET',
                url: '/gisapi/gisGetQuery',
                data: {
                    hostname: hostName,
                    path: '/LayerService/search/fullTextQuery',
                    layerID: layerID,
                    queryType: '1',
                    fullText: $('#searchInput')[0].value,
                    requireFields: layerFields.names,
                    pageNo: '1',
                    pageSize: '1000',
                    shapeType: shapeType,
                    shape: JSON.stringify(shape)
                },
                async: true,
                dataType: 'json',
                success: function(args) {
                    if (args == '') {
                        hideLoader();
                        // alert('Query Layer Error.');
                        Notify.show({
                            title: i18n.t('gismodule.LayerManager.mapTool.alert1'),
                            type: "warning"
                        });
                        return;
                    } else {
                        _showPointOnMap(args.records);
                        if (args.records.length == 0) {
                            Notify.show({
                                title: i18n.t('gismodule.LayerManager.mapTool.alert6'),
                                type: "warning"
                            });
                        }else{
                            _createTable(layerFields.names, args.records);
                        }
                        hideLoader();
                    }
                },
                error: function(errorMsg) {
                    hideLoader();
                    // alert('Query Layer Error.');
                    Notify.show({
                        title: i18n.t('gismodule.LayerManager.mapTool.alert1'),
                        type: "warning"
                    });
                }
            });
        });
        //editBtn event peocessor
        $('#editDataBtn').click(function() {
            if ($('#BSInfoList .checkbox-checked').length == 0)
                return;
            if ($('#BSInfoList .checkbox-checked').length > 1)
                _showDialogPanel(i18n.t('gismodule.LayerManager.mapTool.editData'), '<div style="margin:20px;font-size:15px">' + i18n.t('gismodule.LayerManager.mapTool.editAlert') + '</div>', undefined, function() {});
            else {
                var data = [];
                $($('#BSInfoList .checkbox-checked')[0].children).each(function(index, element) {
                    if (index > 0)
                        data.push(this.innerText);
                })
                _showDialogPanel(i18n.t('gismodule.LayerManager.mapTool.editData'), _createEditPanel(layerFields.names, data), layerFields, function(cloumnValues) {
                    showLoader();
                    $.ajax({
                        type: 'POST',
                        url: '/gisapi/gisPostQuery',
                        data: {
                            hostname: hostName,
                            path: '/LayerService/layer/updatedata',
                            layerID: layerID,
                            cloumnNames: layerFields.names,
                            cloumnValues: cloumnValues
                        },
                        async: true,
                        dataType: 'json',
                        success: function(args) {
                            if (args == false) {
                                hideLoader();
                                // alert('Edit Record Error.');
                                Notify.show({
                                    title: i18n.t('gismodule.LayerManager.mapTool.alert2'),
                                    type: "warning"
                                });
                                return;
                            }
                            var len = cloumnValues.length;
                            var rid = cloumnValues[len - 1];
                            var children = $('#' + rid)[0].children;
                            for (var i = 1; i < children.length; i++) {
                                if (layerFields.names[i - 1] == i18n.t('gismodule.LayerManager.mapTool.columns.name') || layerFields.names[i - 1] == i18n.t('gismodule.LayerManager.mapTool.columns.address')) {
                                    children[i].innerHTML = '<p data-original-title="' + cloumnValues[i - 1] + '">' + cloumnValues[i - 1] + '</p>';
                                } else {
                                    children[i].innerText = cloumnValues[i - 1];
                                }
                            }
                            $("#resultTab p").tooltip();
                            var point = pointArray[rid];
                            L.DomEvent.off(point, 'click', _pointClick);
                            pointsGroup.removeLayer(point);
                            _addSinglePointToMap(layerFields.names, cloumnValues, len - 3, len - 2, pointsGroup);
                            _locateCenter(rid);
                            hideLoader();
                        },
                        error: function(errorMsg) {
                            hideLoader();
                            // alert('Edit Record Error.');
                            Notify.show({
                                title: i18n.t('gismodule.LayerManager.mapTool.alert2'),
                                type: "warning"
                            });
                        }
                    });
                });
            }
        });
        //addBtn event peocessor
        $('#addDataBtn').click(function() {
            _showDialogPanel(i18n.t('gismodule.LayerManager.mapTool.addData'), _createAddPanel(layerFields.names), layerFields, function(cloumnValues) {
                showLoader();
                $.ajax({
                    type: 'POST',
                    url: '/gisapi/gisPostQuery',
                    data: {
                        hostname: hostName,
                        path: '/LayerService/layer/addnew',
                        layerID: layerID,
                        cloumnNames: layerFields.names.slice(0, layerFields.names.length - 1),
                        cloumnValues: cloumnValues
                    },
                    async: true,
                    dataType: 'json',
                    success: function(args) {
                        if (args == -1) {
                            hideLoader();
                            // alert('Add Record Error.');
                            Notify.show({
                                title: i18n.t('gismodule.LayerManager.mapTool.alert3'),
                                type: "warning"
                            });
                            return;
                        }
                        args = args.toString();
                        var len = cloumnValues.length + 1;
                        if ($('#BSInfoList').length == 0) {
                            cloumnValues.push(args);
                            _createTable(layerFields.names, [cloumnValues]);
                        } else {
                            cloumnValues.push(args);
                            var trHtml = '<tr role="row" class="" id="' + args + '">' +
                                '<td><label class="checkbox-in-table" style="margin-left: 5px;margin-top: -10px;margin-bottom: -10px"></label></td>';
                            for (var i = 0; i < 2; i++) {
                                trHtml += '<td><p data-original-title="' + cloumnValues[i] + '">' + cloumnValues[i] + '</p></td>';
                            }
                            for (var i = 2; i < len; i++) {
                                trHtml += '<td>' + cloumnValues[i] + '</td>';
                            }
                            trHtml += '</tr>';
                            $('#BSInfoList')[0].innerHTML += trHtml;
                            var rowIndex = $('#' + args)[0].rowIndex;
                            $('#resultTab')[0].scrollTop = rowIndex * 63 - 38;
                            if ($('.td-hover').length > 0) {
                                $('.td-hover').removeClass('td-hover');
                            }
                            $('#' + args + ' td').addClass('td-hover');
                        }
                        _addSinglePointToMap(layerFields.names, cloumnValues, len - 3, len - 2, pointsGroup);
                        _locateCenter(args);
                        hideLoader();
                    },
                    error: function(errorMsg) {
                        hideLoader();
                        // alert('Add Record Error.');
                        Notify.show({
                            title: i18n.t('gismodule.LayerManager.mapTool.alert3'),
                            type: "warning"
                        });
                    }
                });
            });
        });
        //delBtn event processor
        $('#delDataBtn').click(function() {
            if ($('#BSInfoList .checkbox-checked').length == 0)
                return;
            _showDialogPanel(i18n.t('gismodule.LayerManager.mapTool.deleteData'), '<div style="margin:20px;font-size:15px">' + i18n.t('gismodule.LayerManager.mapTool.deleteAlert') + '</div>', undefined, function() {
                //delete data 
                var deleteIDs = [];
                $('#BSInfoList tr').each(function(index, element) {
                    if ($(this).hasClass("checkbox-checked")) {
                        var record_id = $(this).attr("id");
                        deleteIDs.push(record_id);
                    }
                });
                showLoader();
                $.ajax({
                    type: 'POST',
                    url: '/gisapi/gisPostQuery',
                    data: {
                        hostname: hostName,
                        path: '/LayerService/layer/batchdelete',
                        layerID: layerID,
                        dataIDs: deleteIDs
                    },
                    async: true,
                    dataType: 'json',
                    success: function(args) {
                        if (args == false) {
                            hideLoader();
                            // alert('Delete Records Error.');
                            Notify.show({
                                title: i18n.t('gismodule.LayerManager.mapTool.alert4'),
                                type: "warning"
                            });
                            return;
                        }
                        for (var i = 0; i < deleteIDs.length; i++) {
                            var record_id = deleteIDs[i];
                            if (record_id in pointArray) {
                                var point = pointArray[record_id];
                                if (pointsGroup.hasLayer(point)) {
                                    pointsGroup.removeLayer(point);
                                }
                                delete pointArray[record_id];
                            }
                            if (locatePoint != undefined && locatePoint.record_id == record_id) {
                                if (pointsGroup.hasLayer(locatePoint)) {
                                    pointsGroup.removeLayer(locatePoint);
                                }
                            }
                            $('#' + record_id).remove();
                        }
                        hideLoader();
                    },
                    error: function(errorMsg) {
                        hideLoader();
                        // alert('Delete Records Error.');
                        Notify.show({
                            title: i18n.t('gismodule.LayerManager.mapTool.alert4'),
                            type: "warning"
                        });
                    }
                });
            });
        });
        //clearBtn event processor
        $('#clearBtn').click(function() {
            $('table tr').unbind('click');
            $(".checkbox-in-table").unbind('click');
            $(".checkbox-in-tool").unbind('click');
            $("#resultTab")[0].innerHTML = '';
            //clear map
            pointsGroup.clearLayers();
        });
    }

    function _showPointOnMap(data) {
        pointArray = {};
        var len = layerFields.names.length;
        var xindex = len - 3;
        var yindex = len - 2;
        pointsGroup.clearLayers();
        for (var i = 0; i < data.length; i++) {
            _addSinglePointToMap(layerFields.names, data[i], xindex, yindex, pointsGroup);
        }
    }

    function _addSinglePointToMap(columns, record, xindex, yindex, pointsGroup) {
        var popupInfo = '<div class="portlet-extend"><div class="portlet-title-extend-popup">' + i18n.t('gismodule.LayerManager.mapTool.tooltip') + '</div>' +
            '<div class="portlet-body-extend-popup"><table>';
        for (var j = 0; j < columns.length; j++) {
            if (j % 2 == 0) {
                popupInfo += '<tr><th>' + columns[j] + '</th><td>' + record[j] + '</td></tr>';
            } else {
                popupInfo += '<tr style="background-color: white;"><th>' + columns[j] + '</th><td>' + record[j] + '</td></tr>';
            }
        }
        popupInfo += '</table></div></div>';
        var point = L.circleMarker(new L.latLng(record[yindex], record[xindex]), {
            stroke: false,
            fill: true,
            fillColor: '#ff0000',
            fillOpacity: 1,
            radius: 8
        }).bindPopup(popupInfo);
        point.addTo(pointsGroup);
        point.rid = record[columns.length - 1];
        pointArray[point.rid] = point;
        L.DomEvent.on(point, 'click', _pointClick);
    }

    function _pointClick(e) {
        var rid = e.target.rid;
        var rowIndex = $('#' + rid)[0].rowIndex;
        $('#resultTab')[0].scrollTop = rowIndex * 63 - 38;
        if ($('.td-hover').length > 0) {
            $('.td-hover').removeClass('td-hover');
        }
        $('#' + rid + ' td').addClass('td-hover');
    }

    function _createTable(columns, data) {

        var innerHtml = '<div class="table-responsive">' +
            '<table class="table table-striped table-bordered table-hover dataTable no-footer" cellspacing="0" style="table-layout: fixed;margin-left: 0px;border-collapse: inherit !important;margin-top: 0px !important;margin-bottom: 0px !important;" width="100%" role="grid">' +
            '<thead>' +
            '<tr role="row" class="">' +
            '<th class="sorting_disabled" rowspan="1" colspan="1" style="width: 50px;padding-left: 9px !important;padding-right: 9px !important;" aria-label="selectAll">' +
            '<label class="checkbox-in-tool" style="margin-left: 5px;margin-top: -10px;margin-bottom: -10px"></label></th>';
        var i = 0;
        var nameIndex, addrIndex;
        for (i = 0; i < columns.length; i++) {
            var rowName = columns[i];
            switch (columns[i]) {
                case i18n.t('gismodule.LayerManager.mapTool.columns.name'):
                    nameIndex = i;
                    break;
                case i18n.t('gismodule.LayerManager.mapTool.columns.address'):
                    addrIndex = i;
                    break;
            }
            innerHtml += '<th class="sorting_disabled" rowspan="1" colspan="1" style="width: 110px;padding-left: 9px !important;padding-right: 9px !important;">' + rowName + '</th>';
        }
        innerHtml += '</tr>' + '</thead>' + '<tbody id="BSInfoList">';
        var len = data.length;
        for (i = 0; i < len; i++) {
            var tempHtml = '<tr role="row" class="" id="' + data[i][columns.length - 1] + '">' +
                '<td><label class="checkbox-in-table" style="margin-left: 5px;margin-top: -10px;margin-bottom: -10px"></label></td>';
            for (var j = 0; j < data[i].length; j++) {
                if (j == nameIndex || j == addrIndex) {
                    tempHtml += '<td><p data-original-title="' + data[i][j] + '">' + data[i][j] + '</p></td>';
                } else {
                    tempHtml += '<td>' + data[i][j] + '</td>';
                }
            }
            tempHtml += '</tr>';
            innerHtml += tempHtml;
        }
        innerHtml += '</tbody>' + '</table>' + '</div>';
        $("#resultTab")[0].innerHTML = innerHtml;
        _addTableEvent();
    }

    function _addTableEvent() {
        $("#resultTab p").tooltip();
        $(".checkbox-in-table").on("click", function(e) {
            if ($(this).parent().parent("tr").hasClass("checkbox-checked")) {
                $(this).parent().parent("tr").removeClass("checkbox-checked");
                if ($(e.target.parentElement.parentElement).attr('id') == locatePoint.record_id) {
                    if (pointsGroup.hasLayer(locatePoint)) {
                        pointsGroup.removeLayer(locatePoint);
                    }
                }
                e.stopPropagation();
            } else {
                $(this).parent().parent("tr").addClass("checkbox-checked");
                if ($('.td-hover').length > 0) {
                    $('.td-hover').removeClass('td-hover');
                }
                $(this).parent().parent('tr').children().addClass('td-hover');
            }
        });
        $(".checkbox-in-tool").on("click", function(e) {
            e.stopPropagation();
            if ($(this).parent().parent("tr").hasClass("checkbox-checked")) {
                //自身状态改变
                $(this).parent().parent("tr").removeClass("checkbox-checked");
                //所有元素状态改变
                $('#BSInfoList tr').each(function(trindex, tritem) {
                    if ($(tritem).hasClass("checkbox-checked")) {
                        $(tritem).removeClass("checkbox-checked");
                    }
                });
            } else {
                //自身状态改变
                $(this).parent().parent("tr").addClass("checkbox-checked");
                //所有元素状态改变
                $('#BSInfoList tr').each(function(trindex, tritem) {
                    if (!$(tritem).hasClass("checkbox-checked")) {
                        $(tritem).addClass("checkbox-checked");
                    }
                });
            }
        });
        $('table tr').on("click", function(e) {
            var record_id = $(this).attr("id");
            _locateCenter(record_id);
        });
    }

    function _locateCenter(record_id) {
        if (record_id in pointArray) {
            var point = pointArray[record_id];
            if (locatePoint == undefined) {
                locatePoint = new L.marker(point.getLatLng());
                locatePoint.addTo(pointsGroup);
            } else {
                if (!pointsGroup.hasLayer(locatePoint)) {
                    locatePoint.addTo(pointsGroup);
                }
                locatePoint.setLatLng(point.getLatLng());
            }
            map.panTo(point.getLatLng());
            locatePoint.record_id = record_id;
            locatePoint.bindPopup(point._popup._content);
            locatePoint.openPopup();
        }
    }

    function _showDialogPanel(title, content, layerFields, callback) {
        var panel = Dialog.build({
            title: title,
            content: content,
            leftBtnCallback: function() {
                $('#dialogPanel').hide();
                $('#resultTab').show();
            },
            rightBtnCallback: function() {
                if (layerFields == undefined) {
                    $('#dialogPanel').hide();
                    $('#resultTab').show();
                    callback();
                } else {
                    var cloumnValues = [];
                    $('.bs-component input').each(function(index, element) {
                        cloumnValues.push(element.value);
                    });
                    var msg = _checkRecordFields(layerFields, cloumnValues);
                    if (msg != '') {
                        // alert(msg);
                        Notify.show({
                            title: msg,
                            type: "warning"
                        });
                        return;
                    } else {
                        $('#dialogPanel').hide();
                        $('#resultTab').show();
                        callback(cloumnValues);
                    }
                }
            }
        });
        $('#dialogPanel').show();
        $('#resultTab').hide();
        document.getElementById("dialogPanel").innerHTML = panel;
        Dialog.show(function() {});
    }

    function _resize() {
        $(".track-group-body").height($("#map").height() - $(".track-group-title").height() - 30);
        $("#resultTab").height($(".track-group-body").height() - $("#queryCondition").height() - $("#menuBtn").height());
        $('#dialogPanel').height($("#resultTab").height());
    }

    function _addLayer(dataLayer) {
        if (map) {
            hostName = dataLayer._hostname;
            layerID = dataLayer._layerID;
            _getLayerFieldsInfo(hostName, layerID);
            dataLayer.addTo(map);
            if ($('#displayLayer').length == 0) {
                $(".leaflet-control-scale-line").before("<div id='displayLayer'>" +
                    "<input id='displayLayer_check' type='checkbox'>" +
                    "<label id='displayLayer_label' style='font-size: 15px;background-color: rgba(255,255,255,0.7);'>" + dataLayer._overLayerName + "</label>" +
                    "</input>" +
                    "</div>");
                L.DomEvent.disableClickPropagation(document.getElementById('displayLayer'));
                $('#displayLayer_check')[0].checked = true;
                _displaylayerEvent(dataLayer);
            } else {
                $('#displayLayer').children()[1].innerText = dataLayer._overLayerName;
            }
            $('#clearBtn').trigger("click");
            $('#dialogPanel').hide();
        }
    }

    function _displaylayerEvent(dataLayer) {
        $('#displayLayer_check').click(function(e) {
            if (e.target.checked) {
                dataLayer.showLayer();
            } else {
                dataLayer.hideLayer();
            }
        });
        $('#displayLayer_label').click(function(e) {
            if ($('#displayLayer_check')[0].checked) {
                $('#displayLayer_check')[0].checked = false;
                dataLayer.hideLayer();
            } else {
                $('#displayLayer_check')[0].checked = true;
                dataLayer.showLayer();
            }
        });
    }

    function _getLayerFieldsInfo(hostName, layerID) {
        $.ajax({
            type: 'GET',
            url: '/gisapi/gisGetQuery',
            data: {
                hostname: hostName,
                path: '/LayerService/layer/GetLayerInfo',
                layerID: layerID
            },
            dataType: 'json',
            success: function(args) {
                var names = [],
                    ids = [],
                    mustMatchs = [],
                    types = [],
                    lengths = [],
                    precisions = [];
                var indexs = {};
                var fieldInfo = args.extraFieldInfos;
                for (var i = 0; i < fieldInfo.length; i++) {
                    if (fieldInfo[i].disName == '经度' || fieldInfo[i].disName == '纬度' || fieldInfo[i].disName == 'Record_ID') {
                        indexs[fieldInfo[i].disName] = i;
                        continue;
                    }
                    if (fieldInfo[i].disName == 'TaskID') {
                        continue;
                    }
                    names.push(fieldInfo[i].disName);
                    ids.push(fieldInfo[i].id);
                    mustMatchs.push(fieldInfo[i].mapflag);
                    types.push(fieldInfo[i].type);
                    lengths.push(fieldInfo[i].length);
                    precisions.push(fieldInfo[i].precision);
                }
                var indexnames = ['经度', '纬度', 'Record_ID'];
                for (var i = 0; i < indexnames.length; i++) {
                    names.push(indexnames[i]);
                    var j = indexs[indexnames[i]];
                    ids.push(fieldInfo[j].id);
                    mustMatchs.push(fieldInfo[j].mapflag);
                    types.push(fieldInfo[j].type);
                    lengths.push(fieldInfo[j]['length']);
                    precisions.push(fieldInfo[j].precision);
                }
                for (var i = 0; i < names.length; i++) {
                    switch (names[i]) {
                        case '经度':
                            names[i] = i18n.t('gismodule.LayerManager.mapTool.columns.lng');
                            break;
                        case '纬度':
                            names[i] = i18n.t('gismodule.LayerManager.mapTool.columns.lat');
                            break;
                        case '名称':
                            names[i] = i18n.t('gismodule.LayerManager.mapTool.columns.name');
                            break;
                        case '地址':
                            names[i] = i18n.t('gismodule.LayerManager.mapTool.columns.address');
                            break;
                        case '运营商':
                            names[i] = i18n.t('gismodule.LayerManager.mapTool.columns.carrier');
                            break;
                        case '原始经度':
                            names[i] = i18n.t('gismodule.LayerManager.mapTool.columns.originalLng');
                            break;
                        case '原始纬度':
                            names[i] = i18n.t('gismodule.LayerManager.mapTool.columns.originalLat');
                            break;
                        case '车站名称':
                            names[i] = i18n.t('gismodule.LayerManager.mapTool.columns.railwayStationName');
                            break;
                        case '车站简称':
                            names[i] = i18n.t('gismodule.LayerManager.mapTool.columns.railwayStationShortName');
                            break;
                        case '机场代码':
                            names[i] = i18n.t('gismodule.LayerManager.mapTool.columns.airportCode');
                            break;
                        case '机场名称':
                            names[i] = i18n.t('gismodule.LayerManager.mapTool.columns.airportName');
                            break;
                    }
                }
                layerFields = {};
                layerFields.names = names;
                layerFields.ids = ids;
                layerFields.mustMatchs = mustMatchs;
                layerFields.types = types;
                layerFields.lengths = lengths;
                layerFields.precisions = precisions;
            },
            error: function(errorMsg) {
                // alert('Get Layer Field Error.');
                Notify.show({
                    title: i18n.t('gismodule.LayerManager.mapTool.alert5'),
                    type: "warning"
                });
            }
        });
    }

    function _checkRecordFields(layerFields, record) {
        var len = record.length;
        var type, length, precision, name;
        var msg = '';
        for (var i = 0; i < len; i++) {
            var value = record[i].toString().trim();
            var type = layerFields.types[i];
            var length = layerFields.lengths[i];
            var precision = layerFields.precisions[i];
            var name = layerFields.names[i];
            var mustmatch = layerFields.mustMatchs[i];
            record[i] = value;
            switch (type) {
                //string
                case 1:
                    if (mustmatch == '0' && value == '') {
                        break;
                    }
                    record[i] = value.slice(0, length);
                    break;
                    //long
                case 2:
                    if (mustmatch == '0' && value == '') {
                        break;
                    }
                    if ((/^\d+$/.test(value))) {
                        if (value.length > length) {
                            msg += i18n.t('gismodule.LayerManager.mapTool.column') + '"' + name + '"' + i18n.t('gismodule.LayerManager.mapTool.lengthAlert') + length + i18n.t('gismodule.LayerManager.mapTool.size') + '\r\n';
                        }
                    } else {
                        msg += i18n.t('gismodule.LayerManager.mapTool.column') + '"' + name + '"' + i18n.t('gismodule.LayerManager.mapTool.integerAlert') + '\r\n';
                    }
                    break;
                    //time
                case 3:
                    if (mustmatch == '0' && value == '') {
                        break;
                    }
                    if ((/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.test(value)) == false) {
                        msg += i18n.t('gismodule.LayerManager.mapTool.column') + '"' + name + '"' + i18n.t('gismodule.LayerManager.mapTool.dateAlert') + ':yyyy-mm-dd hh:mi:ss\r\n';
                    }
                    break;
                    //double
                case 4:
                    if (mustmatch == '0' && value == '') {
                        break;
                    }
                    if ((/^[-\+]?\d+(\.\d+)?$/.test(value))) {
                        var v = parseFloat(value);
                        if (isNaN(v)) {
                            msg += i18n.t('gismodule.LayerManager.mapTool.column') + '"' + name + '"' + i18n.t('gismodule.LayerManager.mapTool.floatAlert') + '\r\n';
                        } else {
                            if (name == i18n.t('gismodule.LayerManager.mapTool.columns.lng') || name == i18n.t('gismodule.LayerManager.mapTool.columns.originalLng')) {
                                if (v < -180 || v > 180) {
                                    msg += i18n.t('gismodule.LayerManager.mapTool.column') + '"' + name + '"' + i18n.t('gismodule.LayerManager.mapTool.lngAlert') + '\r\n';
                                }
                            } else if (name == i18n.t('gismodule.LayerManager.mapTool.columns.lat') || name == i18n.t('gismodule.LayerManager.mapTool.columns.originalLat')) {
                                if (v < -90 || v > 90) {
                                    msg += i18n.t('gismodule.LayerManager.mapTool.column') + '"' + name + '"' + i18n.t('gismodule.LayerManager.mapTool.latAlert') + '\r\n';
                                }
                            }
                            var temp = value.split('.');
                            if (temp.length == 1) {
                                temp.push('0');
                            }
                            temp[1] = temp[1].slice(0, precision);
                            record[i] = (temp[0] + '.' + temp[1]).slice(0, length);
                        }
                    } else {
                        msg += i18n.t('gismodule.LayerManager.mapTool.column') + '"' + name + '"' + i18n.t('gismodule.LayerManager.mapTool.floatAlert') + '\r\n';
                    }
                    break;
            }
        }
        return msg;
    }

    function _destroy() {
        map = undefined;
        $(".track-group-title").unbind('click');
        $(".checkbox-in-table").unbind('click');
        $(".checkbox-in-tool").unbind('click');
        $('#displayLayer_check').unbind('click');
        $('#displayLayer_label').unbind('click');
        $('#searchBtn').unbind('click');
        $('table tr').unbind('click');
    }

    function _defineDialog() {
        var attrs;
        var source;
        var tpl;

        this.initialize = function() {
            tpl = _.template(this._createPanel());
        }

        this._createPanel = function() {
            var innerHtml =
                '<div class="panel">' +
                '<div class="panel-heading">' +
                '<span id="nv-dialog-title" class="panel-title"> <%= title %> </span>' +
                '</div>' +
                '<div id="nv-dialog-body" class="panel-body " style="min-height:100px; overflow-x: hidden; overflow-y: auto; padding: 0px">' +
                '<%= content %>' +
                '</div>' +
                '<div class="panel-footer text-center" id="nv-dialog-footer" style="background-color: #FFFFFF;border: 0px">' +
                '<button id="nv-dialog-leftbtn" class="btn btn-default btn-sm" type="button" style="margin-right:15px;min-width:60px">' +
                '<%= leftBtn %>' +
                '</button>' +
                '<button id="nv-dialog-rightbtn" class="btn btn-custom btn-sm" type="button" style="min-width:60px">' +
                '<%= rightBtn %>' +
                '</button>' +
                '</div>' +
                '</div>';
            return innerHtml;
        }


        this.build = function(opts) {
            attrs = {
                title: opts.title || "",
                content: opts.content || "",
                leftBtn: opts.leftBtn || i18n.t('gismodule.LayerManager.mapTool.cancel'),
                rightBtn: opts.rightBtn || i18n.t('gismodule.LayerManager.mapTool.ok'),
                hideLeftBtn: opts.hideLeftBtn,
                hideRightBtn: opts.hideRightBtn,
                hideFooter: opts.hideFooter,
                minHeight: opts.minHeight,
                leftBtnCallback: opts.leftBtnCallback || function() {
                    $('#dialogPanel').hide();
                    $('#resultTab').show();
                },
                rightBtnCallback: opts.rightBtnCallback || function() {
                    $('#dialogPanel').hide();
                    $('#resultTab').show();
                },
                extraBtn: opts.extraBtn || [],
                extraListener: opts.extraListener || [],
                style: opts.style || 'basic', // ENUM(basic: 450px, sm: 300px, lg: 700px, xl: 1000px, full: 90%)
                width: opts.width || 0,
                minHeight: opts.minHeight,
                closeOnBgClick: opts.closeOnBgClick || true
            };
            source = tpl(attrs);
            return source;
        }

        this.show = function(callback) {
            callback();
            if (attrs.minHeight) {
                $('#nv-dialog-body').css('min-height', attrs.minHeight);
            }
            if (attrs.hideLeftBtn == true) {
                $('#nv-dialog-leftbtn').hide();
            };
            if (attrs.hideRightBtn == true) {
                $('#nv-dialog-rightbtn').hide();
            };
            if (attrs.hideFooter) {
                $('#nv-dialog-footer').hide();
            }
            $('#nv-dialog-leftbtn').on('click', attrs.leftBtnCallback);
            $('#nv-dialog-rightbtn').on('click', attrs.rightBtnCallback);

        }
    }

    return {
        init: init,
        addLayer: _addLayer,
        destroy: _destroy
    }
})