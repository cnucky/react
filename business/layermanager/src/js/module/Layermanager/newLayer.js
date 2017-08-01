/**
 * Created by THINK on 2016/8/19.
 * 图层管理新建图层功能模块
 */
define('module/Layermanager/newLayer', ['nova-notify', 'nova-bootbox-dialog'], function(Notify, bootbox) {
    //  newLayer= _.template(newLayer);
    var USERID; //用户ID
    var TabID; //标签页ID
    var OperaType; //标签页类型
    var BASEURL; //查询接口地址
    var LayerID; //图层ID
    //初始化
    function init(type, tabID, directory, userId, nodeName, layerID, baseURL) {
        USERID = userId;
        OperaType = type;
        TabID = tabID;
        LayerID = layerID;
        BASEURL = baseURL;
        _addNewLayer(directory, layerID);
        _resize();
        _addEvent();
        //当是"图层定义"时
        if (OperaType == 2) {
            $(".nav.nav-tabs li").hide();
            //将已有字段信息删除
            $("#existItem" + TabID).empty();
            //调用后台服务获取参数，将参数填入对应位置
            _addArgs(nodeName, layerID);
        }
        TableEditable.init("table_edit_" + TabID, _findExistItem());
    }
    //添加“新建图层”tab内容
    function _addNewLayer(directory, directoryID) {
        //需要动态加载的数据
        //      var parameters = [
        //          {TabPage:TabID,EditTable:"table_edit_"+TabID,PortletTab:"tab_"+TabID,TableParent:"tablePar"+TabID,
        //              OK:"ok"+TabID,Cancel:"cancel"+TabID,Directory:directory,Scale:"scale"+TabID,ExistItem:"existItem"+TabID,
        //          NewItem:"newItem"+TabID,DireID:directoryID,LayerNameID:"name"+TabID,LONGID:"long"+TabID,LATID:"lat"+TabID,
        //          NameID:"nameID"+TabID,ImgId:"image"+TabID,Address:"addr"+TabID}
        //      ];
        ////        $('#tabContent').append(newLayer(parameters));
        //        $.template("template",newLayer);
        //        $.tmpl("template",parameters)
        //            .appendTo("#tabContent");
        $(_createTabContent(TabID, directoryID, directory)).appendTo("#tabContent");

        _GetScaleInfo("#scale" + TabID + "_1");
        _GetScaleInfo("#scale" + TabID + "_2");
    }
    //生成Html
    function _createTabContent(tabid, dirid, dir) {
        var innerHtml = '<div id="' + tabid + '">' +
            '<div class="portlet box green">' +
            '<div class="portlet-title" style="padding: 5px 0px 1px 10px;">' +
            '<div class="caption" style="font-size: 14px;margin-bottom: 3px;">' +
            '<i class="icon-edit" style="margin-top: 3px;"></i>' +
            i18n.t('gismodule.LayerManager.newLayer.uiItem.title') +
            '</div>' +
            '</div>' +

            '<div class="portlet-body">' +
            '<table border="0" style="width: 100%;">' +
            '<tr>' +
            '<th style="width: 100px;height: 30px;">' + i18n.t('gismodule.LayerManager.newLayer.uiItem.table.col.indexContent') + '</td>' +
            '<td style="width: 250px;"><input type="text" name="directory" class="" style="width: 200px;" value="' + dir + '" readonly="true"></td>' +
            '<th style="width: 50px;">' + i18n.t('gismodule.LayerManager.newLayer.uiItem.table.col.icon') + '</td>' +
            '<td>' +
            '<img class="layerIcon" id="image' + tabid + '" iconName="marker-icon.png" title="' + i18n.t('gismodule.LayerManager.newLayer.uiItem.table.tip1') + '" src="../layermanager/img/LayerManager/newLayer/icon/marker-icon.png" style="cursor: pointer;"  height="20px" width="20px">' +
            '</td>' +
            '<td style="width: 100px;height: 30px;">' + i18n.t('gismodule.LayerManager.newLayer.uiItem.table.col.lngField') + '</td>' +
            '<td><input id="long' + tabid + '" type="text" name="longField" class="" value="' + i18n.t('gismodule.LayerManager.newLayer.uiItem.table.col.lng') + '" readonly="true"></td>' +
            '</tr>' +
            '<tr>' +
            '<th  style="width: 100px;height: 30px;">' + i18n.t('gismodule.LayerManager.newLayer.uiItem.table.col.name') + '</td>' +
            '<td><input id="name' + tabid + '" title="' + i18n.t('gismodule.LayerManager.newLayer.uiItem.table.tip2') + '" type="text" name="layerName" class="" style="width: 200px;"></td>' +
            '<td></td>' +
            '<td></td>' +
            '<td style="width: 100px;height: 30px;">' + i18n.t('gismodule.LayerManager.newLayer.uiItem.table.col.latField') + '</td>' +
            '<td><input id="lat' + tabid + '" type="text" name="latField" class="" readonly="true" value="' + i18n.t('gismodule.LayerManager.newLayer.uiItem.table.col.lat') + '"></td>' +
            '</tr>' +
            '<tr>' +
            '<th  style="width: 100px;height: 30px;">' + '</td>' +
            '<td>' +
            '<select id="scale' + tabid + '_1" class="medium m-wrap" style="height: 27px !important;width: 200px !important;border: 1px solid #A8A8A8;display:none">' +
            //                                                        <!--<option value="1">比例尺_国家</option>-->
            //                                                        <!--<option value="2" selected="selected">比例尺_省</option>-->
            //                                                        <!--<option value="3">比例尺_市</option>-->
            //                                                        <!--<option value="4">比例尺_县区</option>-->
            //                                                        <!--<option value="5">比例尺_街道</option>-->
            '</select>' +
            '</td>' +
            '<td></td>' +
            '<td></td>' +
            '<td style="width: 100px;height: 30px;">' + i18n.t('gismodule.LayerManager.newLayer.uiItem.table.col.nameField') + '</td>' +
            '<td><input id="nameID' + tabid + '" type="text" name="nameField" class="" readonly="true" value="' + i18n.t('gismodule.LayerManager.newLayer.uiItem.table.col.name') + '"></td>' +
            '</tr>' +
            '<tr>' +
            '<th style="width: 100px;height: 30px;">' + '</td>' +
            '<td>' +
            '<select id="scale' + tabid + '_2" class="medium m-wrap" tabindex="1" style="height: 27px !important;width: 200px !important;border: 1px solid #A8A8A8;display:none">' +
            '</select>' +
            '</td>' +
            '<td></td>' +
            '<td></td>' +
            '<td style="width: 100px;height: 30px;">' + i18n.t('gismodule.LayerManager.newLayer.uiItem.table.col.addrField') + '</td>' +
            '<td><input id="addr' + tabid + '" type="text" name="addrField" class="" readonly="true" value="' + i18n.t('gismodule.LayerManager.newLayer.uiItem.table.col.addr') + '"></td>' +
            '</tr>' +
            '</table>' +
            '</div>' +
            '</div>' +

            '<div class="portlet box green tabbable">' +
            '<div class="portlet-title" style="padding: 5px 0px 1px 10px;">' +
            '<div class="caption" style="font-size: 14px;margin-bottom: 3px;">' +
            '<i class="icon-reorder" style="margin-top: 3px;"></i>' +
            i18n.t('gismodule.LayerManager.newLayer.uiItem.table.title') +
            '</div>' +
            '</div>' +

            '<div class="portlet-body">' +
            '<div class="tabbable portlet-tabs">' +
            '<ul class="nav nav-tabs">' +
            '<li><a href="#tab_' + tabid + '2" data-toggle="tab">' + i18n.t('gismodule.LayerManager.newLayer.uiItem.table.fieldToAdd') + '</a></li>' +
            '<li class="active"><a href="#tab_' + tabid + '1" data-toggle="tab">' + i18n.t('gismodule.LayerManager.newLayer.uiItem.table.addedField') + '</a></li>' +
            '</ul>' +

            '<div class="tab-content" style="margin-top: -35px !important">' +
            '<div class="tab-pane active" id="tab_' + tabid + '1" >' +
            '<table class="table table-striped table-hover">' +
            '<thead>' +
            '<tr>' +
            '<th style="font-weight: 800;width: 20%;">' + i18n.t('gismodule.LayerManager.newLayer.uiItem.table.col.index') + '</th>' +
            '<th style="font-weight: 800;width: 20%;">' + i18n.t('gismodule.LayerManager.newLayer.uiItem.table.col.displayName') + '</th>' +
            '<th style="font-weight: 800;width: 20%;">' + i18n.t('gismodule.LayerManager.newLayer.uiItem.table.col.type') + '</th>' +
            '<th style="font-weight: 800;width: 20%;">' + i18n.t('gismodule.LayerManager.newLayer.uiItem.table.col.length') + '</th>' +
            '<th style="font-weight: 800;width: 20%;">' + i18n.t('gismodule.LayerManager.newLayer.uiItem.table.col.accuracy') + '</th>' +
            '</tr>' +
            '</thead>' +
            '</table>' +

            '<div id="tablePar' + tabid + '1" style="overflow-y:auto;height: 100px;">' +
            '<table class="table table-striped table-hover">' +
            '<tbody id="existItem' + tabid + '">' +
            '<tr>' +
            '<td style="width: 20%;">1</td>' +
            '<td style="width: 20%;">' + i18n.t('gismodule.LayerManager.newLayer.uiItem.table.col.lng') + '</td>' +
            '<td style="width: 20%;">' + i18n.t('gismodule.LayerManager.newLayer.uiItem.table.col.num') + '</td>' +
            '<td style="width: 20%;">40</td>' +
            '<td style="width: 20%;">10</td>' +
            '</tr>' +

            '<tr>' +
            '<td>2</td>' +
            '<td>' + i18n.t('gismodule.LayerManager.newLayer.uiItem.table.col.lat') + '</td>' +
            '<td>' + i18n.t('gismodule.LayerManager.newLayer.uiItem.table.col.num') + '</td>' +
            '<td>40</td>' +
            '<td>10</td>' +
            '</tr>' +

            '<tr>' +
            '<td>3</td>' +
            '<td>' + i18n.t('gismodule.LayerManager.newLayer.uiItem.table.col.name') + '</td>' +
            '<td>' + i18n.t('gismodule.LayerManager.newLayer.uiItem.table.col.string') + '</td>' +
            '<td>500</td>' +
            '<td>0</td>' +
            '</tr>' +

            '<tr>' +
            '<td>4</td>' +
            '<td>' + i18n.t('gismodule.LayerManager.newLayer.uiItem.table.col.addr') + '</td>' +
            '<td>' + i18n.t('gismodule.LayerManager.newLayer.uiItem.table.col.string') + '</td>' +
            '<td>500</td>' +
            '<td>0</td>' +
            '</tr>' +
            '</tbody>' +
            '</table>' +
            '</div>' +

            '</div>' +

            '<div class="tab-pane" id="tab_' + tabid + '2">' +
            '<div class="clearfix">' +
            '<div class="btn-group">' +
            '<button id="table_edit_' + tabid + '_new" class="btn blue">' + i18n.t('gismodule.LayerManager.newLayer.uiItem.table.addField') + ' <i class="icon-plus"></i></button>' +
            '</div>' +
            '</div>' +

            '<table class="table table-striped table-hover">' +
            '<thead>' +
            '<tr>' +
            '<th style="font-weight: 800;width: 25%;">' + i18n.t('gismodule.LayerManager.newLayer.uiItem.table.col.displayName') + '</th>' +
            '<th style="font-weight: 800;width: 25%;">' + i18n.t('gismodule.LayerManager.newLayer.uiItem.table.col.type') + '</th>' +
            '<th style="font-weight: 800;width: 15%;">' + i18n.t('gismodule.LayerManager.newLayer.uiItem.table.col.length') + '</th>' +
            '<th style="font-weight: 800;width: 15%;">' + i18n.t('gismodule.LayerManager.newLayer.uiItem.table.col.accuracy') + '</th>' +
            '<th style="font-weight: 800;text-align: center;width: 10%;">' + i18n.t('gismodule.LayerManager.newLayer.uiItem.table.col.edit') + '</th>' +
            '<th style="font-weight: 800;text-align: center;width: 10%;">' + i18n.t('gismodule.LayerManager.newLayer.uiItem.table.col.delete') + '</th>' +
            '</tr>' +
            '</thead>' +
            '</table>' +

            '<div id="tablePar' + tabid + '2"  style="overflow-y:auto;">' +
            '<table class="table table-striped table-hover" id="table_edit_' + tabid + '">' +

            '<thead style="display: none;">' +
            '<tr>' +
            '<th style="font-weight: 800;">' + i18n.t('gismodule.LayerManager.newLayer.uiItem.table.col.displayName') + '</th>' +
            '<th style="font-weight: 800;">' + i18n.t('gismodule.LayerManager.newLayer.uiItem.table.col.type') + '</th>' +
            '<th style="font-weight: 800;">' + i18n.t('gismodule.LayerManager.newLayer.uiItem.table.col.length') + '</th>' +
            '<th style="font-weight: 800;">' + i18n.t('gismodule.LayerManager.newLayer.uiItem.table.col.accuracy') + '</th>' +
            '<th style="font-weight: 800;text-align: center;">' + i18n.t('gismodule.LayerManager.newLayer.uiItem.table.col.edit') + '</th>' +
            '<th style="font-weight: 800;text-align: center;">' + i18n.t('gismodule.LayerManager.newLayer.uiItem.table.col.delete') + '</th>' +
            '</tr>' +
            '</thead>' +

            '<tbody id="newItem' + tabid + '">' +

            '</tbody>' +

            '</table>' +
            '</div>' +
            '</div>' +
            '</div>' +

            '</div>' +
            '</div>' +
            '</div>' +

            '<div style="text-align: center;">' +
            '<a id="ok' + tabid + '" href="#" class="btn blue btn-primary" style="margin-right: 15px;" direId="' + dirid + '"><i class="icon-ok"></i>' + i18n.t('gismodule.LayerManager.newLayer.uiItem.table.ok') + '</a>' +
            '<a id="cancel' + tabid + '" href="#" class="btn blue" style="margin-left: 15px;"><i class="icon-remove"></i>' + i18n.t('gismodule.LayerManager.newLayer.uiItem.table.cancel') + '</a>' +
            '</div>' +

            '</div>';
        return innerHtml;

    }
    //后台服务接口——获取比例尺信息
    function _GetScaleInfo(element) {
        $.ajax({
            type: 'GET',
            url: '/gisapi/gisGetQuery',
            data: {
                hostname: BASEURL,
                path: '/LayerService/layer/GetScaleInfo',
                userID: USERID
            },
            // url:BASEURL + '/layer/GetScaleInfo',
            dataType: 'text',
            success: function(result) {
                result = eval(result);
                var scaleInfo = "";
                for (var i = 0; i < result.length; i++) {
                    var name = result[i].chineseName;
                    var id = result[i].scaleID;
                    scaleInfo += '<option value="' + id + '">' + name + '</option>';
                }
                $(element)[0].innerHTML = scaleInfo;
            },
            error: function() {}
        });
    }
    //计算元素的高和宽
    function _resize() {
        $("#tablePar" + TabID + "1").height($(".tabContent-Style").height() - 351);
        $("#tablePar" + TabID + "2").height($(".tabContent-Style").height() - 395);
    }
    //添加事件
    function _addEvent() {
        //"确定"操作
        $("#ok" + TabID).click(function() {
            var layerName = $("#name" + TabID)[0].value; //名称
            var maxScaleID = $("#scale" + TabID + "_1").val(); //最大比例尺选中的ID
            var minScaleID = $("#scale" + TabID + "_2").val(); //最小比例尺选中的ID（minScaleID>=maxScaleID）
            //"名称"不能为空
            if (layerName == "") {
                // alert(i18n.t('gismodule.LayerManager.newLayer.alert1'));
                Notify.show({
                    title: i18n.t('gismodule.LayerManager.newLayer.alert1'),
                    type: "warning"
                });
                return;
            }
            //最大比例尺ID不能大于最小比例尺ID
            if (maxScaleID > minScaleID) {
                // alert(i18n.t('gismodule.LayerManager.newLayer.alert2'));
                Notify.show({
                    title: i18n.t('gismodule.LayerManager.newLayer.alert2'),
                    type: "warning"
                });
                return;
            }
            //"待添加字段"表中，不能有未编辑完成的字段
            if ($("#newItem" + TabID + " input").length > 0) {
                // alert(i18n.t('gismodule.LayerManager.newLayer.alert3'));
                Notify.show({
                    title: i18n.t('gismodule.LayerManager.newLayer.alert3'),
                    type: "warning"
                });
                return;
            }
            var direID = $(this).attr("direId"); //目录ID
            var iconName = $("#image" + TabID).attr("iconName"); //图标名称
            var longField = $("#long" + TabID).val(); //经度字段
            var latField = $("#lat" + TabID).val(); //纬度字段
            var nameField = $("#nameID" + TabID).val(); //名称字段
            var addressField = $("#addr" + TabID).val(); //地址字段
            var fieldInfo = new Array();
            //"新建图层"时，需添加已有字段
            if (OperaType == 1) {
                //已有字段
                var existItems = $("#existItem" + TabID)[0].children;
                var index = 1;
                for (var i = 0; i < existItems.length; i++) {
                    var tds = existItems[i].children;
                    var disName = tds[1].innerHTML; //展示名称
                    var type = tds[2].innerHTML; //类型
                    var length = tds[3].innerHTML; //长度
                    var precision = tds[4].innerHTML; //精度
                    var oneRow = {};
                    oneRow["disName"] = disName;
                    oneRow["type"] = _typeStringToInt(type, precision);
                    oneRow["length"] = parseInt(length);
                    oneRow["precision"] = parseInt(precision);
                    oneRow["info"] = index++; //在后台服务写死的，用以建立查询索引（经度为1，纬度为2，名称为3，地址为4）
                    if (disName == i18n.t('gismodule.LayerManager.newLayer.lng') || disName == i18n.t('gismodule.LayerManager.newLayer.lat')) {
                        oneRow["mustMatch"] = 1; //该字段必须映射
                    } else {
                        oneRow["mustMatch"] = 0; //该字段可以不被映射
                    }
                    if (disName == i18n.t('gismodule.LayerManager.newLayer.uiItem.table.col.lng')) {
                        oneRow["disName"] = '经度';
                    }
                    if (disName == i18n.t('gismodule.LayerManager.newLayer.uiItem.table.col.lat')) {
                        oneRow["disName"] = '纬度';
                    }
                    if (disName == i18n.t('gismodule.LayerManager.newLayer.uiItem.table.col.name')) {
                        oneRow["disName"] = '名称';
                    }
                    if (disName == i18n.t('gismodule.LayerManager.newLayer.uiItem.table.col.addr')) {
                        oneRow["disName"] = '地址';
                    }
                    fieldInfo.push(oneRow);
                }
            }
            //待添加字段
            var newItem = $("#newItem" + TabID)[0].children;
            if (newItem.length != 1 || newItem[0].innerText != i18n.t('gismodule.LayerManager.newLayer.itemInfo')) {
                for (var i = 0; i < newItem.length; i++) {
                    var tds = newItem[i].children;
                    var disName = tds[0].innerHTML; //展示名称
                    var type = tds[1].innerHTML; //类型
                    var length = tds[2].innerHTML; //长度
                    var precision = tds[3].innerHTML; //精度
                    var oneRow = {};
                    oneRow["disName"] = disName;
                    oneRow["type"] = _typeStringToInt(type, precision);
                    oneRow["length"] = parseInt(length);
                    oneRow["precision"] = parseInt(precision);
                    oneRow["info"] = 0;
                    oneRow["mustMatch"] = 0; //该字段可以不被映射
                    fieldInfo.push(oneRow);
                }
            }
            //构建"新建图层"的输入参数
            var createArgs = {};
            createArgs["userID"] = USERID; //用户ID
            createArgs["dicID"] = direID; //目录ID
            createArgs["name"] = layerName; //图层名称
            createArgs["iconName"] = iconName; //图片名称
            createArgs["maxScale"] = maxScaleID; //最大比例尺
            createArgs["minScale"] = minScaleID; //最小比例尺
            createArgs["longField"] = longField; //经度字段
            createArgs["latField"] = latField; //纬度字段
            createArgs["nameField"] = nameField; //名称字段
            createArgs["addressField"] = addressField; //地址字段
            createArgs["columnCount"] = fieldInfo.length;
            createArgs["fieldInfo"] = fieldInfo; //字段信息
            //新建图层
            if (OperaType == 1) {
                _CreateNewLayer(createArgs); //调用后台服务，新建图层
            }
            //编辑图层
            if (OperaType == 2) {
                createArgs["layerID"] = LayerID; //图层ID
                _EditLayer(createArgs); //调用后台服务，编辑图层
            }
        });
        //"取消"操作
        $("#cancel" + TabID).click(function() {
            // var messageBox = confirm(i18n.t('gismodule.LayerManager.newLayer.confirm'));
            // if (messageBox == true) { //用户同意取消操作
            //     //删除tab页
            //     _delTab($("#tabHead .activeTab").attr("tabID"));
            // } else { //不同意，退出本次操作
            //     return;
            // }
            var msg=i18n.t('gismodule.LayerManager.newLayer.confirm');
            bootbox.confirm(msg, function(rlt) {
                if (rlt) {
                    //删除tab页
                    _delTab($("#tabHead .activeTab").attr("tabID"));
                }
            });
        });
        //图标点击操作
        $(".layerIcon").click(function() {
            var preIconName = $(this).attr("iconName"); //获取当前的图标名称
            build({
                title: i18n.t('gismodule.LayerManager.newLayer.layerIconTitle'),
                content: _addIcon(),
                rightBtnCallback: function() {
                    $("#image" + TabID)[0].src = $($(".iconSelect")[0].children)[0].src;
                    $("#image" + TabID).attr("iconName", $(".oneIcon.iconSelect").attr("iconName"));
                    $.magnificPopup.close();
                }
            }).show(function() {
                var oneIcon = $(".oneIcon");
                //添加图标点击事件
                $(".oneIcon").unbind("click");
                $(".oneIcon").click(function() {
                    for (var i = 0; i < oneIcon.length; i++) {
                        if ($(oneIcon[i]).hasClass("iconSelect")) {
                            $(oneIcon[i]).removeClass("iconSelect");
                            break;
                        }
                    }
                    $(this).addClass("iconSelect");
                });
                //选中当前设置的图标
                for (var i = 0; i < oneIcon.length; i++) {
                    if (preIconName == $(oneIcon[i]).attr("iconName")) {
                        $(oneIcon[i]).addClass("iconSelect");
                        break;
                    }
                }
            });
        });
        //窗口大小变化事件
        $(window).resize(function() {
            //_resize();
        })
    }
    //后台服务接口——新建图层
    function _CreateNewLayer(json) {
        json.hostname = BASEURL;
        json.path = '/LayerService/layer/CreateNewLayer';
        $.ajax({
            type: 'POST',
            url: '/layermanager/layermanager/gisPostQuery',
            // url: BASEURL + '/layer/CreateNewLayer',
            data: json,
            dataType: 'text',
            success: function(layerID) {
                if (layerID == '') {
                    // alert(i18n.t('gismodule.LayerManager.newLayer.alert4'));
                    Notify.show({
                        title: i18n.t('gismodule.LayerManager.newLayer.alert4'),
                        type: "warning"
                    });
                    return;
                }
                //新建图层操作成功，在对应目录上新添该节点，并删除该tab页
                //添加节点
                var tree = $("#layerTree").fancytree("getTree");
                tree.getNodeByKey(json["dicID"]).addChildren({
                    title: json["name"],
                    folder: false,
                    key: layerID,
                    "lazy": false,
                    "icon": json["iconName"]
                });
                tree.getNodeByKey(layerID).setFocus();
                tree.getNodeByKey(layerID).setActive();
                //删除tab页
                _delTab($("#tabHead .activeTab").attr("tabID"));
            },
            error: function(errorMsg) {
                // alert(i18n.t('gismodule.LayerManager.newLayer.alert4'));
                Notify.show({
                    title: i18n.t('gismodule.LayerManager.newLayer.alert4'),
                    type: "warning"
                });
            }
        });
    }
    //删除tab页（tabID：tab页ID）
    function _delTab(tabID) {
        var tabsItems = $("#tabHead").children();
        var thisTab;
        for (var i = 0; i < tabsItems.length; i++) {
            if ($(tabsItems[i]).attr("tabID") == tabID) {
                thisTab = $(tabsItems[i]);
            }
        }
        var isActive = thisTab.hasClass("activeTab"); //是否为活动状态
        $("#" + tabID).remove(); //删除Tab页内容
        thisTab.remove(); //删除tab页头
        //判断主框架中是否包含tab页,若不包含tab页，则隐藏“横线”
        tabsItems = $("#tabHead").children();
        if (tabsItems.length == 0) {
            $(".hr-sepratorTab").hide();
        } else {
            if (isActive) { //若删除的tab为活动状态，且删除后还包含tab页，则将第一个tab页设置为活动状态
                _setActiveTab($($("#tabHead")[0].children).attr("tabID"));
            }
        }
    }
    //将某tab页设为活动状态
    function _setActiveTab(tabID) {
        var tabHeads = $("#tabHead")[0].children;
        var needActTabHead = null;
        var needActTabCon = null;
        for (var i = 0; i < tabHeads.length; i++) {
            var thisTab = $(tabHeads[i]);
            if (thisTab.hasClass("activeTab")) {
                var tabConId = thisTab.attr("tabid");
                if (tabID == tabConId) {
                    return;
                } else {
                    thisTab.removeClass("activeTab")
                        .addClass("unActiveTab");
                    $("#" + tabConId).hide();
                }
            } else {
                var tabConId = thisTab.attr("tabid");
                if (tabID == tabConId) {
                    needActTabHead = $(tabHeads[i]);
                    needActTabCon = $("#" + tabID);
                }
            }
        }
        if (needActTabHead != null && needActTabCon != null) {
            needActTabHead.addClass("activeTab")
                .removeClass("unActiveTab");
            needActTabCon.show();
        }
    }
    //后台服务接口——编辑图层
    function _EditLayer(json) {
        json.hostname = BASEURL;
        json.path = '/LayerService/layer/EditLayer';
        $.ajax({
            type: 'POST',
            url: '/layermanager/layermanager/gisPostQuery',
            // url: BASEURL + '/layer/EditLayer',
            data: json,
            dataType: 'text',
            success: function() {
                var tree = $("#layerTree").fancytree("getTree");
                var node = tree.getNodeByKey(LayerID);
                node.setTitle(json["name"]);
                node.icon = json["iconName"];
                node.renderTitle();
                node.setFocus()
                TableEditablenode.setActive();
                //删除tab页
                _delTab($("#tabHead .activeTab").attr("tabID"));
            },
            error: function(errorMsg) {
                // alert(i18n.t('gismodule.LayerManager.newLayer.alert5'));
                Notify.show({
                    title: i18n.t('gismodule.LayerManager.newLayer.alert5'),
                    type: "warning"
                });
            }
        });
    }
    //设置图标库图标
    function _addIcon() {
        var innerHtml =
            '<div style="width: 400px;height: 300px;">' +
            '<table style="width: 100%;height: 100%;">' +
            '<tr>' +
            '<td align="center" class="oneIcon" iconName="airport-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/airport-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '<td align="center" class="oneIcon" iconName="atm-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/atm-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '<td align="center" class="oneIcon" iconName="bank_dollar-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/bank_dollar-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '<td align="center" class="oneIcon" iconName="bank_rmb-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/bank_rmb-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '<td align="center" class="oneIcon" iconName="bar-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/bar-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '<td align="center" class="oneIcon" iconName="beijing-metro-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/beijing-metro-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '<td align="center" class="oneIcon" iconName="boating-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/boating-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '<td align="center" class="oneIcon" iconName="bridge-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/bridge-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '</tr>' +
            '<tr>' +
            '<td align="center" class="oneIcon" iconName="bus-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/bus-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '<td align="center" class="oneIcon" iconName="cafe-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/cafe-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '<td align="center" class="oneIcon" iconName="camera-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/camera-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '<td align="center" class="oneIcon" iconName="car_rental-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/car_rental-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '<td align="center" class="oneIcon" iconName="cemetery-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/cemetery-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '<td align="center" class="oneIcon" iconName="changchun-metro-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/changchun-metro-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '<td align="center" class="oneIcon" iconName="chongqing-metro-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/chongqing-metro-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '<td align="center" class="oneIcon" iconName="civic_bldg-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/civic_bldg-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '</tr>' +
            '<tr>' +
            '<td align="center" class="oneIcon" iconName="dalian-metro_stripes-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/dalian-metro_stripes-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '<td align="center" class="oneIcon" iconName="event_venue-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/event_venue-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '<td align="center" class="oneIcon" iconName="fishing-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/fishing-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '<td align="center" class="oneIcon" iconName="flower-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/flower-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '<td align="center" class="oneIcon" iconName="gas-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/gas-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '<td align="center" class="oneIcon" iconName="generic-2-medium (1).png"><img src="../layermanager/img/LayerManager/newLayer/icon/generic-2-medium (1).png" style="width: 20px;height: 20px;"/></td>' +
            '<td align="center" class="oneIcon" iconName="generic-2-medium (2).png"><img src="../layermanager/img/LayerManager/newLayer/icon/generic-2-medium (2).png" style="width: 20px;height: 20px;"/></td>' +
            '<td align="center" class="oneIcon" iconName="generic-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/generic-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '</tr>' +
            '<tr>' +
            '<td align="center" class="oneIcon" iconName="golf-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/golf-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '<td align="center" class="oneIcon" iconName="government_cn-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/government_cn-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '<td align="center" class="oneIcon" iconName="guangzhou-metro_symbol-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/guangzhou-metro_symbol-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '<td align="center" class="oneIcon" iconName="hospital_cross-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/hospital_cross-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '<td align="center" class="oneIcon" iconName="hospital_H-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/hospital_H-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '<td align="center" class="oneIcon" iconName="library-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/library-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '<td align="center" class="oneIcon" iconName="lodging-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/lodging-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '<td align="center" class="oneIcon" iconName="measle-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/measle-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '</tr>' +
            '<tr>' +
            '<td align="center" class="oneIcon" iconName="movie-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/movie-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '<td align="center" class="oneIcon" iconName="mrt_symbol-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/mrt_symbol-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '<td align="center" class="oneIcon" iconName="museum-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/museum-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '<td align="center" class="oneIcon" iconName="nanjing-metro_symbol-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/nanjing-metro_symbol-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '<td align="center" class="oneIcon" iconName="palette-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/palette-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '<td align="center" class="oneIcon" iconName="paw-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/paw-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '<td align="center" class="oneIcon" iconName="police-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/police-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '<td align="center" class="oneIcon" iconName="postoffice-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/postoffice-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '</tr>' +
            '<tr>' +
            '<td align="center" class="oneIcon" iconName="resort-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/resort-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '<td align="center" class="oneIcon" iconName="restaurant-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/restaurant-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '<td align="center" class="oneIcon" iconName="restroom-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/restroom-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '<td align="center" class="oneIcon" iconName="school_cn_jp-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/school_cn_jp-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '<td align="center" class="oneIcon" iconName="school-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/school-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '<td align="center" class="oneIcon" iconName="shanghai-metro_symbol-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/shanghai-metro_symbol-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '<td align="center" class="oneIcon" iconName="shenzhen-metro_symbol-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/shenzhen-metro_symbol-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '<td align="center" class="oneIcon" iconName="shoppingbag-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/shoppingbag-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '</tr>' +
            '<tr>' +
            '<td align="center" class="oneIcon" iconName="shoppingcart-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/shoppingcart-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '<td align="center" class="oneIcon" iconName="stadium-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/stadium-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '<td align="center" class="oneIcon" iconName="theater-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/theater-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '<td align="center" class="oneIcon" iconName="tianjin-metro_symbol-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/tianjin-metro_symbol-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '<td align="center" class="oneIcon" iconName="train-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/train-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '<td align="center" class="oneIcon" iconName="tram-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/tram-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '<td align="center" class="oneIcon" iconName="tree-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/tree-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '<td align="center" class="oneIcon" iconName="worship_dharma-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/worship_dharma-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '</tr>' +
            '<tr>' +
            '<td align="center" class="oneIcon" iconName="worship_islam-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/worship_islam-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '<td align="center" class="oneIcon" iconName="worship_temple-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/worship_temple-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '<td align="center" class="oneIcon" iconName="wuhan-metro_symbol-2-medium.png"><img src="../layermanager/img/LayerManager/newLayer/icon/wuhan-metro_symbol-2-medium.png" style="width: 20px;height: 20px;"/></td>' +
            '<td align="center" class="oneIcon" iconName="marker-icon.png"><img src="../layermanager/img/LayerManager/newLayer/icon/marker-icon.png" style="width: 20px;height: 20px;"/></td>' +
            '</tr>' +
            '</table>' +
            '</div>';
        return innerHtml;
    }
    //根据类型（中文）和精度，返回对应的int型type值
    function _typeStringToInt(type, precision) {
        switch (type) {
            case i18n.t('gismodule.LayerManager.newLayer.dataType.string'):
                return 1;
            case i18n.t('gismodule.LayerManager.newLayer.dataType.num'):
                if (precision == "0") {
                    return 2;
                } else {
                    return 4;
                }
            case i18n.t('gismodule.LayerManager.newLayer.dataType.time'):
                return 3;
        }
    }
    //添加“图层定义”参数
    function _addArgs(nodeName, layerID) {
        _GetLayerInfo(nodeName, layerID); //后台服务接口——获取图层信息
    }
    //后台服务接口——获取图层信息
    function _GetLayerInfo(nodeName, layerID) {
        $.ajax({
            type: 'GET',
            url: '/gisapi/gisGetQuery',
            data: {
                hostname: BASEURL,
                path: '/LayerService/layer/GetLayerInfo',
                layerID: layerID
            },
            // url: BASEURL + '/layer/GetLayerInfo?layerID=' + layerID,
            dataType: 'text',
            success: function(result) {
                var args = JSON.parse(result);
                var layerName = args.layerName; //图层名称
                var maxScaleID = args.maxScaleID; //最大比例尺
                var minScaleID = args.minScaleID; //最小比例尺
                var iconName = args.iconName; //图片名称
                var fieldInfo = args.fieldInfo; //已存在字段
                $("#name" + TabID)[0].value = layerName;
                $("#scale" + TabID + "_1 option[value=" + maxScaleID + "]").attr('selected', true);
                $("#scale" + TabID + "_2 option[value=" + minScaleID + "]").attr('selected', true);
                $("#image" + TabID).attr("iconName", iconName);
                var preSrc = $("#image" + TabID).attr("src");
                var temp = preSrc.split('/');
                temp[temp.length - 1] = iconName;
                $("#image" + TabID).attr("src", temp.join('/'));
                var innerHtml = "";
                for (var i = 0; i < fieldInfo.length; i++) {
                    var disName = fieldInfo[i].disName; //名称
                    switch (disName) {
                        case '经度':
                            disName = i18n.t('gismodule.LayerManager.newLayer.uiItem.table.col.lng');
                            break;
                        case '纬度':
                            disName = i18n.t('gismodule.LayerManager.newLayer.uiItem.table.col.lat');
                            break;
                        case '名称':
                            disName = i18n.t('gismodule.LayerManager.newLayer.uiItem.table.col.name');
                            break;
                        case '地址':
                            disName = i18n.t('gismodule.LayerManager.newLayer.uiItem.table.col.addr');
                            break;
                        case '运营商':
                            disName = i18n.t('gismodule.LayerManager.newLayer.uiItem.table.col.carrier');
                            break;
                        case '原始经度':
                            disName = i18n.t('gismodule.LayerManager.newLayer.uiItem.table.col.originalLng');
                            break;
                        case '原始纬度':
                            disName = i18n.t('gismodule.LayerManager.newLayer.uiItem.table.col.originalLat');
                            break;
                        case '车站名称':
                            disName = i18n.t('gismodule.LayerManager.newLayer.uiItem.table.col.railwayStationName');
                            break;
                        case '车站简称':
                            disName = i18n.t('gismodule.LayerManager.newLayer.uiItem.table.col.railwayStationShortName');
                            break;
                        case '机场代码':
                            disName = i18n.t('gismodule.LayerManager.newLayer.uiItem.table.col.airportCode');
                            break;
                        case '机场名称':
                            disName = i18n.t('gismodule.LayerManager.newLayer.uiItem.table.col.airportName');
                            break;
                    }
                    var length = fieldInfo[i].length; //长度
                    var precision = fieldInfo[i].precision; //经度
                    var fieldType = _typeIntToString(fieldInfo[i].type); //类型
                    innerHtml +=
                        '<tr>' +
                        '<td style="width: 20%;">' + (i + 1) + '</td>' +
                        '<td style="width: 20%;">' + disName + '</td>' +
                        '<td style="width: 20%;">' + fieldType + '</td>' +
                        '<td style="width: 20%;">' + length + '</td>' +
                        '<td style="width: 20%;">' + precision + '</td>' +
                        '</tr>';
                }
                $("#existItem" + TabID)[0].innerHTML = innerHtml;
            },
            error: function(errorMsg) {
                // alert(i18n.t('gismodule.LayerManager.newLayer.alert6') + nodeName + i18n.t('gismodule.LayerManager.newLayer.alert7'));
                Notify.show({
                    title: i18n.t('gismodule.LayerManager.newLayer.alert6') + nodeName + i18n.t('gismodule.LayerManager.newLayer.alert7'),
                    type: "warning"
                });
            }
        });
    }
    //根据对应的int型，转成中文
    function _typeIntToString(type) {
        switch (type) {
            case 1:
                return i18n.t('gismodule.LayerManager.newLayer.dataType.string');
            case 2:
            case 4:
                return i18n.t('gismodule.LayerManager.newLayer.dataType.num');
            case 3:
                return i18n.t('gismodule.LayerManager.newLayer.dataType.time');
            default:
                return "";
        }
    }
    //找出已经添加的字段信息
    function _findExistItem() {
        var EXISTITEM = new Array(); //已存在的字段
        var tbody = $("#existItem" + TabID);
        var trs = tbody[0].children;
        for (var i = 0; i < trs.length; i++) {
            var tds = trs[i].children;
            var item = tds[1].innerHTML;
            EXISTITEM.push(item);
        }
        return EXISTITEM;
    }
    return {
        init: init
    }
})