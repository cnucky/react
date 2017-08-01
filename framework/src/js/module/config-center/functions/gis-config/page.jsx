initLocales();
/**
 * Created by root on 10/9/16.
 */
define([
    'config',
    'nova-dialog',
    'nova-notify',
    'nova-utils',
    'nova-bootbox-dialog',
    'module/config-center/functions/gis-config/tpl-activesetting',
    'module/config-center/functions/gis-config/tpl-layersetting',
], function(appConfig, Dialog, Notify, NovaUtils, bootbox, tpl_activesetting, tpl_layersetting) {
    
    const gisConfigInit = (function(){
    console.log(appConfig)
    hideLoader();
    //屏幕自适应
    $(function() {
        var leftTray = $('.tray.tray-left');
        var leftHeight = window.innerHeight - leftTray.offset().top;
        //console.log(leftHeight);

        $('.tray.tray-center').height(leftHeight);
    })
    $(window).on("resize", function() {
        var leftTray = $('.tray.tray-left');
        var leftHeight = window.innerHeight - leftTray.offset().top;
        $('.tray.tray-center').height(leftHeight);
    });

    var dataColNameMap = new Map();
    var layerColText = "";
    var dataColText = "";
    let selectedNode;
    let dataCol;


    $.getJSON('/smartquery/smartquery/listdatasource').done(function(rsp) {
        var data = rsp.data;
        $('#data-tree').fancytree({
            extensions: ["filter"],
            quicksearch: true,
            filter: {
                mode: "dimn",
                autoAppaly: true,
                hightlight: true
            },
            selectMode: 2,
            clickFolderMode: 2,
            checkbox: false,
            autoScroll: true,
            source: function(event, data) {
                var result = _.union(rsp.data.sysTree, rsp.data.personalTree);
                return result;
            },
            iconClass: function(event, data) {
                if (data.node.extraClasses.indexOf("nv-dir") != -1) {
                    return "fa fa-folder fa-fw";
                } else {
                    return "fa fa-database fa-fw";
                }
            },
            activate: function(event, data) {
                selectedNode = data.node.data;
                $("#actionContent").hide();
                $("#actionContent").html(tpl_activesetting);
                $("#layerContent").html(tpl_layersetting)
                if (data.node.extraClasses.indexOf("nv-dir") == -1) {
                    //console.log(selectedNode);
                    $("#dataType").html(selectedNode.caption);
                }
                getdatatypecoldef();
            }
        });
    })

    function getdatatypecoldef() {
        //初始化展示字段
        $("#displayCol").multiselect({
            maxHeight: 300,
            buttonClass: 'btn btn-primary',
            buttonWidth: 'auto', //'auto',
            enableFiltering: true,
            includeSelectAllOption: true,
            numberDisplayed: '10',
            selectAllText: ' 全选',
            nonSelectedText: '请选择展示字段',
            nSelectedText: '个已选择',
            allSelectedText: '全选',
        });
        //初始化目标字段
        $('.targetCol').multiselect({
            maxHeight: 250,
            buttonClass: 'btn btn-primary',
            buttonWidth: '200px', //'auto',
            enableFiltering: true,
            nonSelectedText: '请选择目标字段',
        });

        //获取数据类型的列定义
        $.getJSON('/smartquery/smartquery/getdatatypecoldef', {
            centerCode: selectedNode.centerCode,
            typeId: selectedNode.typeId,
            zoneId: selectedNode.zoneId,
            iswithfavor: 0
        }).done(
            function(rsp) {
                dataCol = rsp.data.outputColumnDescList;

                for (var i = 0; i < dataCol.length; i++) {
                    $(".targetCol").html($(".targetCol").html() +
                        "<option value=" + dataCol[i].columnName + " title=" + dataCol[i].columnName + ">" + dataCol[i].displayName + "</option>");
                }

                for (var i = 0; i < dataCol.length; i++) {
                    $("#displayCol").html($("#displayCol").html() +
                        "<option value=" + dataCol[i].columnName + " title=" + dataCol[i].displayName + ">" + dataCol[i].displayName + "</option>");
                }

                $("#displayCol").multiselect("rebuild");
                $('.targetCol').multiselect("rebuild");

                //获取已有配置如果有就回填否则就出现新的
                $.getJSON('/smartquery/smartquery/getGisQuerySetting', {
                    centerCode: selectedNode.centerCode,
                    typeId: selectedNode.typeId,
                    zoneId: selectedNode.zoneId,
                }).done(
                    function(rsp) {
                        //console.log(rsp.data);
                        var data = rsp.data;
                        if (data.DataTypeDisplayName == undefined) {
                            getGisLayer(dataCol);
                            $("#actionContent").show();
                        } else {
                            refreshSetPage(data, dataCol);
                        }
                    })

                //字段列名与字段展示名映射
                dataColNameMap = new Map();
                for (var i = 0; i < dataCol.length; i++) {
                    dataColNameMap[dataCol[i].columnName] = dataCol[i].displayName;
                }
            }
        )
    }

    function getGisLayer(dataCol) {
        var timeText = "";
        var dataColText = "";

        //配置时间字段和数据类型字段下拉框
        for (var i = 0; i < dataCol.length; i++) {
            if (dataCol[i].columnType == "date" || dataCol[i].columnType == "datetime") {
                timeText = timeText + "<option value=" + dataCol[i].columnName + " title=" + dataCol[i].columnName + ">" + dataCol[i].displayName + "</option>"
            };
        }
        dataColText = setDataColOptionText(dataCol);

        $(".timeColDisplay").html("<select class='timeCol'>" + timeText + "</select>");
        $('.timeCol').multiselect({
            maxHeight: 250,
            buttonClass: 'btn btn-primary',
            buttonWidth: '200px', //'auto',
            nonSelectedText: '请选择时间字段',
            enableFiltering: false,
            numberDisplayed: 1,
        });

        $(".LongitudeDisplay").html("<select class='longitudeCol'>" + dataColText + "</select>");
        $('.longitudeCol').multiselect({
            maxHeight: 250,
            buttonClass: 'btn btn-primary',
            buttonWidth: '200px', //'auto',
            single: true,
            nonSelectedText: '请选择经度字段',
            enableFiltering: true,
        });

        $(".LatitudeDisplay").html("<select class='latitudeCol'>" + dataColText + "</select>");
        $('.latitudeCol').multiselect({
            maxHeight: 250,
            buttonClass: 'btn btn-primary',
            buttonWidth: '200px', //'auto',
            single: true,
            nonSelectedText: '请选择纬度字段',
            enableFiltering: true,
        });

        $(".colMap").html("<td><select class='layerMap'>" + "</select></td>" + "<td><select class='datacolMap'>" + "</select></td>");
        initLayerMapCol();

        $(".carrierColSelect").html('<select class="carrierCol"><option value="" label="" title="无">无</option>' + dataColText + '</select>');
        $('.carrierCol').multiselect({
            maxHeight: 250,
            buttonClass: 'btn btn-primary',
            buttonWidth: '200px', //'auto',
            nonSelectedText: '请选择运营商字段',
            enableFiltering: true,
        });

        if ($(".isLongLat").is(":checked")) {
            $(".longLatDisplay").show();
            $(".layerMapData").hide();
            $(".chooseLayer").hide();
        } else {
            $(".longLatDisplay").hide();
            $(".layerMapData").show();
            $(".chooseLayer").show();
        };
    }

    function getActionCount() {
        var count = $("#layerContent .layerContent").length;
        return count;
    }

    //回填
    function refreshSetPage(data, dataCol) {
        $(".targetCol").val(data.targetField);
        $(".targetCol").multiselect('refresh');

        for (var i = 0; i < data.displayFields.length; i++) {
            $("#displayCol option").each(function() {
                if (this.value == data.displayFields[i].name) {
                    this.selected = true;
                }
            })
        }
        $("#displayCol").multiselect('refresh');

        //行为数大于1
        if (data.BussinessToGISFieldList.length > 1) {
            for (var i = 1; i < data.BussinessToGISFieldList.length; i++) {
                $("#layerContent").html($("#layerContent").html() + tpl_layersetting);
                getGisLayer(dataCol);
            }
            for (var i = 0; i < data.BussinessToGISFieldList.length; i++) {
                $(".actionName")[i].value = data.BussinessToGISFieldList[i].BussinessCaption;

                if (data.BussinessToGISFieldList[i].isLongLat) {
                    $(".isLongLat").eq(i).attr("checked", true);
                    $('.longitudeCol')[i].value = data.BussinessToGISFieldList[i].Longitude;
                    $('.latitudeCol')[i].value = data.BussinessToGISFieldList[i].Latitude;
                    $(".longitudeCol").multiselect('refresh');
                    $(".latitudeCol").multiselect('refresh');

                    var thisLayerContent = $($(".isLongLat").eq(i)).closest(".layerContent");
                    $(thisLayerContent).find(".longLatDisplay").show();
                    $(thisLayerContent).find(".layerMapData").hide();
                    $(thisLayerContent).find(".chooseLayer").hide();

                } else {
                    $(".isLongLat").eq(i).attr("checked", false);
                    $(".layerName")[i].value = data.BussinessToGISFieldList[i].LayerName;
                    $(".layerId")[i].value = data.BussinessToGISFieldList[i].LayerID;
                    var thisLayerContent = $($(".isLongLat").eq(i)).closest(".layerContent");
                    $(thisLayerContent).find(".longLatDisplay").hide();
                    $(thisLayerContent).find(".layerMapData").show();
                    $(thisLayerContent).find(".chooseLayer").show();

                    $.get('/gisapi/gisGetQuery', {
                        hostname: appConfig['gis-server'],
                        path: '/LayerService/layer/GetLayerInfo',
                        layerID:data.BussinessToGISFieldList[i].LayerID,
                    }).done(
                        function(rsp) {
                            rsp = JSON.parse(rsp);
                            var layerData = rsp.fieldInfo;
                            if (rsp.layerID == 0) {
                                layerData.push({
                                    "disName": "LAC,CI",
                                    "phyName": "LAC,CI"
                                });
                                $(".carrierColDisplay").show();
                            } else {
                                $(".carrierColDisplay").hide();
                            }

                            layerColText = setLayerOptionText(layerData);
                            dataColText = setDataColOptionText(dataCol);

                            $(".colMap").html("<td><select class='layerMap'>" + layerColText + "</select></td>" + "<td><select class='datacolMap'>" + dataColText + "</select></td>");
                            initLayerMapCol();

                            for (var i = 0; i < data.BussinessToGISFieldList.length; i++) {
                                $(".datacolMap")[i].value = data.BussinessToGISFieldList[i].BussinessPhysicalName;
                                $(".layerMap")[i].value = data.BussinessToGISFieldList[i].LayerFieldPhysicalName;
                                $(".datacolMap").multiselect('refresh');
                                $(".layerMap").multiselect('refresh');
                            }
                        })
                }

                $(".layerMap")[i].value = data.BussinessToGISFieldList[i].BussinessCaption;
                $(".actionName")[i].value = data.BussinessToGISFieldList[i].BussinessCaption;

                $(".timeCol")[i].value = data.BussinessToGISFieldList[i].BussinessTimeField;
                $(".timeCol").multiselect('refresh');

                $('.carrierCol').val(data.BussinessToGISFieldList[i].carrierField);
                $(".carrierCol").multiselect('refresh');
            }
        }
        //行为数为1
        else {
            getGisLayer(dataCol);
            $(".actionName").val(data.BussinessToGISFieldList[0].BussinessCaption);
            if (data.BussinessToGISFieldList[0].isLongLat) {
                $(".isLongLat").attr("checked", true);
                $('.longitudeCol').val(data.BussinessToGISFieldList[0].Longitude);
                $('.latitudeCol').val(data.BussinessToGISFieldList[0].Latitude);
                $(".longitudeCol").multiselect('refresh');
                $(".latitudeCol").multiselect('refresh');

                var thisLayerContent = $($(".isLongLat")).closest(".layerContent");
                $(thisLayerContent).find(".longLatDisplay").show();
                $(thisLayerContent).find(".layerMapData").hide();
                $(thisLayerContent).find(".chooseLayer").hide();

            } else {
                $(".isLongLat").attr("checked", false);
                $(".layerName").val(data.BussinessToGISFieldList[0].LayerName);
                $(".layerId").val(data.BussinessToGISFieldList[0].LayerID);
                var thisLayerContent = $($(".isLongLat")).closest(".layerContent");
                $(thisLayerContent).find(".longLatDisplay").hide();
                $(thisLayerContent).find(".layerMapData").show();
                $(thisLayerContent).find(".chooseLayer").show();

               $.get('/gisapi/gisGetQuery', {
                        hostname: appConfig['gis-server'],
                        path: '/LayerService/layer/GetLayerInfo',
                        layerID:data.BussinessToGISFieldList[0].LayerID,
                    }).done(
                        function(rsp) {
                            rsp = JSON.parse(rsp);
                    var layerData = rsp.fieldInfo;
                    if (rsp.layerID == 0) {
                        layerData.push({
                            "disName": "LAC,CI",
                            "phyName": "LAC,CI"
                        });
                        $(".carrierColDisplay").show();
                    } else {
                        $(".carrierColDisplay").hide();
                    }

                    layerColText = setLayerOptionText(layerData);
                    dataColText = setDataColOptionText(dataCol);

                    $(".colMap").html("<td><select class='layerMap'>" + layerColText + "</select></td>" + "<td><select class='datacolMap'>" + dataColText + "</select></td>");
                    initLayerMapCol();

                    for (var i = 0; i < data.BussinessToGISFieldList.length; i++) {
                        $(".datacolMap").val(data.BussinessToGISFieldList[0].BussinessPhysicalName);
                        $(".layerMap").val(data.BussinessToGISFieldList[0].LayerFieldPhysicalName);
                        $(".datacolMap").multiselect('refresh');
                        $(".layerMap").multiselect('refresh');
                    }
                })
            }

            $(".layerMap").value = data.BussinessToGISFieldList[0].BussinessCaption;
            $(".actionName").value = data.BussinessToGISFieldList[0].BussinessCaption;

            $(".timeCol").value = data.BussinessToGISFieldList[0].BussinessTimeField;
            $(".timeCol").multiselect('refresh');

            $('.carrierCol').val(data.BussinessToGISFieldList[0].carrierField);
            $(".carrierCol").multiselect('refresh');
        }

        $("#actionContent").show();
    }

    //获取设置数据
    function getSetData() {
        var data = {};
        data.DataTypeDisplayName = $("#dataType").html();

        data.targetField = $(".targetCol").val();

        data.timeField = {
            layerTime: "CAP_TIME",
            layerTimeCaption: "活动点时间"
        };

        var count = getActionCount();
        data.BussinessToGISFieldList = [];
        if (count == 1) {
            var actionConfig = {};
            actionConfig.BussinessTimeField = $(".timeCol").val();
            actionConfig.BussinessCaption = $(".actionName").val();
            actionConfig.isLongLat = $(".isLongLat").is(":checked");

            if ($(".isLongLat").is(":checked")) {
                actionConfig.Longitude = $('.longitudeCol').val();
                actionConfig.Latitude = $('.latitudeCol').val();
            } else {
                actionConfig.BussinessPhysicalName = $(".datacolMap").val();
                actionConfig.LayerFieldPhysicalName = $(".layerMap").val();
                actionConfig.LayerFieldDisplayName = $(".layerMap").val();
                actionConfig.carrierField = ($(".layerId").val() == 0) ? $(".carrierCol").val() : "";
                actionConfig.LayerName = $(".layerName").val();
                actionConfig.LayerID = $(".layerId").val();
            }
            data.BussinessToGISFieldList.push(actionConfig);
        } else {
            for (var i = 0; i < count; i++) {
                var actionConfig = {};
                actionConfig.BussinessTimeField = $(".timeCol")[i].value;
                actionConfig.BussinessCaption = $(".actionName")[i].value;
                actionConfig.isLongLat = $(".isLongLat").eq(i).is(":checked");
                if ($(".isLongLat").is(":checked")) {
                    actionConfig.isLongLat = $(".isLongLat").eq(i).is(":checked");
                    actionConfig.Longitude = $('.longitudeCol')[i].value;
                    actionConfig.Latitude = $('.latitudeCol')[i].value;
                } else {
                    actionConfig.BussinessPhysicalName = $(".datacolMap")[i].value;
                    actionConfig.LayerFieldPhysicalName = $(".layerMap")[i].value;
                    actionConfig.LayerFieldDisplayName = $(".layerMap")[i].value;
                    actionConfig.carrierField = ($(".layerId")[i].value == 0) ? $(".carrierCol")[i].value : "";
                    actionConfig.LayerName = $(".layerName")[i].value;
                    actionConfig.LayerID = $(".layerId")[i].value;
                }
                data.BussinessToGISFieldList.push(actionConfig);
            }
        }
        data.displayFields = [];
        for (var i = 0; i < $("#displayCol").val().length; i++) {
            data.displayFields[i] = {};
            data.displayFields[i].name = $("#displayCol").val()[i];
            data.displayFields[i].caption = dataColNameMap[$("#displayCol").val()[i]];
        }
        return data;
    }

    //获取行为数据添加时回填
    function getBussinesssData() {
        var data = {};
        data.BussinessToGISFieldList = [];
        var count = getActionCount();
        if (count == 1) {
            data.BussinessToGISFieldList.push({
                BussinessPhysicalName: $(".datacolMap").val(),
                LayerFieldPhysicalName: $(".layerMap").val(),
                LayerFieldDisplayName: $(".layerMap").val(),

                BussinessTimeField: $(".timeCol").val(),
                BussinessCaption: $(".actionName").val(),

                carrierField: $(".carrierCol").val(),

                LayerName: $(".layerName").val(),
                LayerID: $(".layerId").val(),

                isLongLat: $(".isLongLat").is(":checked"),
                Longitude: $('.longitudeCol').val(),
                Latitude: $('.latitudeCol').val(),
            });
        } else {
            for (var i = 0; i < count; i++) {
                data.BussinessToGISFieldList.push({
                    BussinessPhysicalName: $(".datacolMap")[i].value,
                    LayerFieldPhysicalName: $(".layerMap")[i].value,
                    LayerFieldDisplayName: $(".layerMap")[i].value,
                    BussinessTimeField: $(".timeCol")[i].value,
                    BussinessCaption: $(".actionName")[i].value,

                    carrierField: $(".carrierCol")[i].value,

                    LayerName: $(".layerName")[i].value,
                    LayerID: $(".layerId")[i].value,

                    isLongLat: $(".isLongLat").eq(i).is(":checked"),
                    Longitude: $('.longitudeCol')[i].value,
                    Latitude: $('.latitudeCol')[i].value,
                });
            }
        }
        return data;
    }

    function setBussinessData(data, count) {
        if (count > 1) {
            for (var i = 1; i < data.BussinessToGISFieldList.length; i++) {
                $("#layerContent").html($("#layerContent").html() + tpl_layersetting);
                getGisLayer(dataCol);
            }
            for (var i = 0; i < data.BussinessToGISFieldList.length; i++) {
                if (data.BussinessToGISFieldList[i].isLongLat) {
                    $(".isLongLat").attr("checked", true);
                    $('.longitudeCol')[i].value = data.BussinessToGISFieldList[i].Longitude;
                    $('.latitudeCol')[i].value = data.BussinessToGISFieldList[i].Latitude;
                    $(".longitudeCol").multiselect('refresh');
                    $(".latitudeCol").multiselect('refresh');

                    $(".longLatDisplay").show();
                    $(".layerMapData").hide();
                    $(".chooseLayer").hide();

                } else {
                    $(".isLongLat").attr("checked", false);
                    $(".layerName")[i].value = data.BussinessToGISFieldList[i].LayerName;
                    $(".layerId")[i].value = data.BussinessToGISFieldList[i].LayerID;

                    $(".longLatDisplay").hide();
                    $(".layerMapData").show();
                    $(".chooseLayer").show();


                     $.get('/gisapi/gisGetQuery', {
                        hostname: appConfig['gis-server'],
                        path: '/LayerService/layer/GetLayerInfo',
                        layerID:data.BussinessToGISFieldList[i].LayerID,
                    }).done(
                        function(rsp) {
                            rsp = JSON.parse(rsp);
                        var layerData = rsp.fieldInfo;
                        if (rsp.layerID == 0) {
                            layerData.push({
                                "disName": "LAC,CI",
                                "phyName": "LAC,CI"
                            });
                            $(".carrierColDisplay").show();
                        } else {
                            $(".carrierColDisplay").hide();
                        }

                        layerColText = setLayerOptionText(layerData);
                        dataColText = setDataColOptionText(dataCol);

                        $(".colMap").html("<td><select class='layerMap'>" + layerColText + "</select></td>" + "<td><select class='datacolMap'>" + dataColText + "</select></td>");
                        initLayerMapCol();

                        for (var i = 0; i < data.BussinessToGISFieldList.length; i++) {
                            $(".datacolMap")[i].value = data.BussinessToGISFieldList[i].BussinessPhysicalName;
                            $(".layerMap")[i].value = data.BussinessToGISFieldList[i].LayerFieldPhysicalName;
                            $(".datacolMap").multiselect('refresh');
                            $(".layerMap").multiselect('refresh');
                        }
                    })
                }
                $(".layerMap")[i].value = data.BussinessToGISFieldList[i].BussinessCaption;
                $(".actionName")[i].value = data.BussinessToGISFieldList[i].BussinessCaption;

                $(".timeCol")[i].value = data.BussinessToGISFieldList[i].BussinessTimeField;
                $(".timeCol").multiselect('refresh');

                $('.carrierCol').val(data.BussinessToGISFieldList[i].carrierField);
                $(".carrierCol").multiselect('refresh');
            }
        }
        $(".layerName").val(data.BussinessToGISFieldList[0].LayerName);
        $(".layerId").val(data.BussinessToGISFieldList[0].LayerID);
    }

    function setDataColOptionText(dataOption) {
        var text = "";
        for (var i = 0; i < dataOption.length; i++) {
            text = text + "<option value=" + dataOption[i].columnName + " title=" + dataOption[i].columnName + ">" + dataOption[i].displayName + "</option>"
        }
        return text;
    }

    function setLayerOptionText(dataOption) {
        var text = "";
        for (var i = 0; i < dataOption.length; i++) {
            text = text + "<option value=" + dataOption[i].phyName + " title=" + dataOption[i].disName + ">" + dataOption[i].disName + "</option>";
        }
        return text;
    }

    function initLayerMapCol() {
        $('.colMap .layerMap').multiselect({
            maxHeight: 250,
            buttonWidth: '200px', //'auto',
            single: true,
            nonSelectedText: '请选择图层字段',
            enableFiltering: false
        });
        $('.colMap .datacolMap').multiselect({
            maxHeight: 250,
            buttonClass: 'btn btn-primary',
            buttonWidth: '200px', //'auto',
            single: true,
            nonSelectedText: '请选择数据类型字段',
            enableFiltering: true,
        });
    }

    //删除行为
    $("#actionContent").on("click", "#delAction", function() {
        $(".fa-trash-o").show();
        $("#finishDelBtn").show();
        $("#addAction").hide();
        $("#delAction").hide();
    });
    $("#actionContent").on("click", ".fa-trash-o", function() {
        var count = getActionCount();
        if (count == 1) {
            Notify.show({
                title: "至少保留一个行为",
                type: "warning"
            });
        } else {
            $(this).closest(".layerContent").remove();
        }
    });

    $("#actionContent").on("click", "#finishDelBtn", function() {
            $(".fa-trash-o").hide();
            $("#finishDelBtn").hide();
            $("#addAction").show();
            $("#delAction").show();
        })
        //添加行为
    $("#actionContent").on("click", "#addAction", function() {
        var count = getActionCount();
        var maxCount = 2;

        if (count < maxCount) {
            var data = getBussinesssData();
            $("#layerContent").html($("#layerContent").html() + tpl_layersetting);
            count = getActionCount();

            getGisLayer(dataCol);
            setBussinessData(data, count);
        } else {
            Notify.show({
                title: "已达选择行为上限",
                type: "danger"
            });
        }
    })

    //保存设置
    $("#actionContent").on("click", "#saveSetting", function(e) {
        var str = JSON.stringify(getSetData());
        $.post('/smartquery/smartquery/saveGisQueryConfig', {
            centerCode: selectedNode.centerCode,
            typeId: selectedNode.typeId,
            zoneId: selectedNode.zoneId,
            queryConfig: str
        }).done(function(rsp) {
            rsp = JSON.parse(rsp);
            if (rsp.code == 0) {
                Notify.show({
                    title: "保存成功",
                    type: "success"
                });
            }
        })
    });
    //删除设置
    $("#actionContent").on("click", "#delSetting", function() {
        bootbox.confirm("确定删除此任务?", function(rlt) {
            if (rlt) {
                $.getJSON("/smartquery/smartquery/delGisQueryConfig", {
                    centerCode: selectedNode.centerCode,
                    typeId: selectedNode.typeId,
                    zoneId: selectedNode.zoneId,
                }).done(function(rsp) {
                    if (rsp.code == 0) {
                        Notify.show({
                            title: "删除成功",
                            type: "success"
                        });
                        var activeNode = $("#data-tree").fancytree("getTree").getActiveNode();
                        $("#actionContent").hide();
                        $("#actionContent").html(tpl_activesetting);
                        $("#layerContent").html(tpl_layersetting)
                        $("#dataType").html(activeNode.data.caption);

                        getdatatypecoldef();
                    } else {
                        Notify.show({
                            title: "删除失败",
                            type: "danger"
                        });
                    }
                })
            }
        });
    });
    //点击选经纬度上图
    $("#actionContent").on("click", ".isLongLat", function() {
            var thisLayerContent = $(this).closest(".layerContent");
            if ($(this).is(":checked")) {
                $(thisLayerContent).find(".longLatDisplay").show();
                $(thisLayerContent).find(".layerMapData").hide();
                $(thisLayerContent).find(".chooseLayer").hide();
            } else {
                $(thisLayerContent).find(".longLatDisplay").hide();
                $(thisLayerContent).find(".layerMapData").show();
                $(thisLayerContent).find(".chooseLayer").show();
            };
        })
        //选图层
    $("#actionContent").on("click", ".layer", function() {
        $.getJSON('/user/curuserinfo').done(function(response) {
            var userId = response.data.key;
            $.get('/gisapi/gisGetQuery', {
                hostname: appConfig['gis-server'],
                path: '/LayerService/layer/GetLayerTree',
                userID:userId
            }).done(function(rsp) {
                console.log(rsp);
                var layerTree = JSON.parse(rsp);
                for (var i = 0; i < layerTree.length; i++) {
                    layerTree[i].icon = ""
                }
                Dialog.build({
                    title: "选择要素图层",
                    content: "<div id='layer-picker'> Loading... </div>",
                    rightBtnCallback: function() {
                        var layerTreeNode = $("#layer-picker").fancytree("getTree").getActiveNode();
                        $(".layerName").val(layerTreeNode.title);
                        $(".layerId").val(layerTreeNode.key);
                        $.get('/gisapi/gisGetQuery', {
                            hostname: appConfig['gis-server'],
                            path: '/LayerService/layer/GetLayerInfo',
                            layerID: layerTreeNode.key,
                        }).done(function(rsp) {
                            rsp = JSON.parse(rsp);
                            var layerData = rsp.fieldInfo;
                            if (rsp.layerID == 0) {
                                layerData.push({
                                    "disName": "LAC,CI",
                                    "phyName": "LAC,CI"
                                });
                                $(".carrierColDisplay").show();
                            } else {
                                $(".carrierColDisplay").hide();
                            }
                            //layerColText = "";
                            //for (var i = 0; i < layerData.length; i++) {
                            //    layerColText = layerColText + "<option value=" + layerData[i].phyName + " title=" + layerData[i].disName + ">" + layerData[i].disName + "</option>";
                            //}
                            layerColText = setLayerOptionText(layerData);

                            //dataColText = "";
                            //for (var i = 0; i < dataCol.length; i++) {
                            //    dataColText = dataColText + "<option value=" + dataCol[i].columnName + " title=" + dataCol[i].columnName + ">" + dataCol[i].displayName + "</option>"
                            //}
                            dataColText = setDataColOptionText(dataCol);

                            $(".colMap").html("<td><select class='layerMap'>" + layerColText + "</select></td>" + "<td><select class='datacolMap'>" + dataColText + "</select></td>");
                            initLayerMapCol();
                            Dialog.dismiss();
                        })
                    }
                }).show(function() {
                    $('#layer-picker').html("");
                    $('#layer-picker').fancytree({
                        filter: {
                            mode: "dimn",
                            autoAppaly: true,
                            hightlight: true
                        },
                        selectMode: 2,
                        clickFolderMode: 2,
                        checkbox: false,
                        autoScroll: true,
                        source: layerTree,
                        activate: function(event, data) {
                            selectedLayerNode = data.node.title;
                        }
                    });
                })
            })
        })
    })


    });
    return {
        gisConfigInit : gisConfigInit
    }
})