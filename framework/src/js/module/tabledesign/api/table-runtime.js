define([
    'nova-notify',
    'nova-bootbox-dialog',
    'nova-dialog',
    '../../../tpl/tabledesign/table-runtime',
    '../cy',
    '../table-dataoperate',
    '../../../../../config',
    'jquery-ui',
    'jquery.datatables',
    'datatables.bootstrap'
], function (Notify, bootBox, Dialog, tplTableRuntime, tblDesignCY, tblDataOperate, appConfig) {

    tplTableRuntime = _.template(tplTableRuntime);
    // var avaDollar;
    // var avaDialog;
    var avaNotify;
    /*
     container: ‘#container’,  //表单显示位置
     moduleId: '1000',         //模块Id，4G：201
     tableId: '100001',        //主表类型ID 
     viewId: '123123',         //主表布局ID 可不传，获取默认布局
     recId: '1234',            //主表记录ID 可不传，默认新建
     versionId: '-1',          //可不传，获取最新版本
     data: {fields:[], subTables: []}     //加载初始值,可不传
     isTrans: false              //fieldName 转 fieldId   true或者false
     uploadCallBack: function()
     mode: {
         readOnly: true              //true或者false
         editSubTable: true          //true
         fieldEdit: [{
            fieldId: '123',
            fieldValue: true
         }]          //表单展示模式（只读、编辑、部分编辑…）
     }
     */
    function buildTable(opts) {
        var tableOpr = {};
        tableOpr.opts = opts;
        tableOpr.opts.container = $(opts.container).selector;

        // avaDialog = _.has(opts, "dialog") ? opts.dialog : Dialog;
        avaNotify = _.has(opts, "notify") ? opts.notify : Notify;
        // avaDollar = _.has(opts, "dollar") ? opts.dollar : $;

        if (_.has(opts, 'recId') && opts.recId > 0) {
        } else {
            opts.recId = -1;
        }
        tableOpr.inner = {};

        if(_.has(opts, 'isTrans') && opts.isTrans == true){
            $.getJSON('/spycommon/getFieldIdAndFieldNameMap', {
                tableId: opts.tableId
            }, function(rsp){
                if(rsp.code == 0){
                    tableOpr.inner.idNameMap = rsp.data;

                    if(_.has(opts, 'data'))
                    {
                        if(_.has(opts.data, 'fields')){
                            _.each(opts.data.fields, function (item) {
                                item.fieldId = tableOpr.inner.idNameMap[opts.tableId].nameToId[item.fieldName];
                            })
                        }
                        if(_.has(opts.data, 'subTables')){
                            _.each(opts.data.subTables, function(table){
                                var tableId = table.tableId;
                                _.each(table.records, function(row){
                                    _.each(row.fields, function(item){
                                        item.fieldId = tableOpr.inner.idNameMap[tableId].nameToId[item.fieldName];
                                    });
                                });
                            });
                        }
                    }
                    
                    $(opts.container).empty().append(tplTableRuntime());
                    initMainTable(tableOpr);
                }else{
                    avaNotify.show({
                        title: '获取转换规则失败！',
                        message: rsp.data,
                        type: 'error'
                    });
                    return;
                }
            });
        }else{
            $(opts.container).empty().append(tplTableRuntime());
            initMainTable(tableOpr);
        }
        
        /*
        {
            fields: [],
            subTables: []
        }
        */
        tableOpr.setData = function (data) {
            var mainFields = data.fields;
            var subTables = data.subTables;

            setMainData(this, mainFields);
            setSubTableData(this, subTables);
        }

        tableOpr.getData = function () {
            var mainFields = getMainData(this);
            var subTables = getSubTableData(this);

            if(_.has(tableOpr.opts, 'isTrans') && tableOpr.opts.isTrans == true){
                _.each(mainFields, function (item) {
                    item.fieldName = tableOpr.inner.idNameMap[tableOpr.opts.tableId].idToName[item.fieldId];
                });

                _.each(subTables, function(table){
                    var tableId = table.tableId;
                    _.each(table.records, function(row){
                        _.each(row.fields, function(item){
                            item.fieldName = tableOpr.inner.idNameMap[tableId].idToName[item.fieldId];
                        });
                    });
                });
            }

            return {
                moduleId: parseInt(this.opts.moduleId),
                tableId: parseInt(this.opts.tableId),
                recId: parseInt(this.opts.recId),
                fields: mainFields,
                subTables: subTables
            }
        }

        /*
        [{
            fieldId: ,
            fieldValue: ,
        }, {},....] 
        */
        tableOpr.setFieldValue = function (data) {
            this.inner.metaMainDataSet.openKVData(data);
        }

        /*
        ['fieldId', ....]
        */
        tableOpr.getFieldValue = function (data) {
            var result = [];
            _.each(data, function(item){
                result.push({
                    fieldId: item,
                    fieldValue: this.inner.metaMainDataSet.getFieldText(item)
                });
            });
            return result;
        }

        tableOpr.changeMode = function (mode) {
            if(_.has(mode, 'readOnly')){
                this.inner.metaMainDataSet.readOnlyAll(mode.readOnly);
            }
            if(_.has(mode, 'fieldEdit')){
                _.each(mode.readOnlyField, function(item){
                    this.inner.metaMainDataSet.readOnly(item.fieldId, item.fieldValue);
                });
            }
        }

        tableOpr.upload = function (container) {
            $(container + " .dz-clickable").click();
        }

        tableOpr.print = function () {
            var ip = appConfig["reportURL"];
            window.open(ip + "tableid=" + tableOpr.opts.tableId + "&recid=" + tableOpr.opts.recId)
        }

        tableOpr.saveData = function (data, callBack) {
            if (!_.isFunction(opts.saveData)) {
                tblDataOperate.saveData(tableOpr, tableOpr.getData(), callBack);
            } else {
                opts.saveData(tableOpr, data, callBack);
            }
        }
        return tableOpr;
    }

    function print(tableid, recid) {
        var ip = appConfig["reportURL"];
        window.open(ip + "tableid=" + tableOpr.opts.tableId + "&recid=" + tableOpr.opts.recId)
    }

    function initMainTable(tableOpr) {
        tblDesignCY.loadCode({
            viewId: tableOpr.opts.viewId,
            tblId: tableOpr.opts.tableId,
            entityId: tableOpr.opts.recId,
            uploadCallBack: tableOpr.opts.uploadCallBack
        }, $(tableOpr.opts.container + " #mainTable"), function (jsObj) {
            if(_.has(tableOpr.opts.mode, 'readOnly') && tableOpr.opts.mode.readOnly == true){
                jsObj.readOnlyAll(true);
            }
            if(_.has(tableOpr.opts.mode, 'fieldEdit')){
                _.each(tableOpr.opts.mode.fieldEdit, function(item){
                    jsObj.readOnly(item.fieldId, item.fieldValue);
                });
            }
            tableOpr.inner.metaMainDataSet = jsObj;
            initSubTables(tableOpr);
            if (_.has(tableOpr.opts, 'data') && _.has(tableOpr.opts.data, 'fields')) {
                tableOpr.inner.metaMainDataSet.openKVData(tableOpr.opts.data.fields);
            }
        });
    }

    function initSubTables(tableOpr) {

        $.getJSON('/spycommon/getCodeTable', {
            tableType: tableOpr.opts.tableId
        }, function (rsp) {
            if(rsp.code == 0){
                tableOpr.opts.codeTable = {};
                _.each(rsp.data, function(table){
                    tableOpr.opts.codeTable[table.codeTableName] = table.content;
                });

                $.getJSON('/tabledesign/getInitTableData', {
                    tableId: tableOpr.opts.tableId,
                    moduleId:parseInt(tableOpr.opts.moduleId)
                }, function(rsp) {
                    if (rsp.code == 0) {
                        var subTableStruct = rsp.data.subTables;
                        var subTableStructCount = rsp.data.subTables.length;
                        if (subTableStructCount != 0) {
                            $(tableOpr.opts.container + " #subTables").removeClass("hidden");
                            $(tableOpr.opts.container + " #subTables .nav-tabs").empty();
                            $(tableOpr.opts.container + " #subTables .tab-content").empty();
                            var columnStruct = [];
                            tableOpr.inner.subTableMultiColumn = [];
                            tableOpr.inner.metaSubtable = {};
                            var uuContainer = uuid(14, 16);
                            for (var index = 0; index < subTableStructCount; index++) {
                                $(tableOpr.opts.container + " #subTables .nav-tabs").append('<li><a href= "#' + uuContainer +'subtab_' + index + '"' +
                                    ' data-toggle="tab" tableId=' + subTableStruct[index].tableId +
                                    ' aria-expanded="true">' + subTableStruct[index].tableName + '</a></li>');
                                // $(tableOpr.opts.container + " #subTables .tab-content").append('<div id="' + uuContainer + 'subtab_' + index + '" class="tab-pane">' +
                                //     '<table class="table table-hover admin-form theme-warning" tableId=' + subTableStruct[index].tableId + ' cellspacing="0">' +
                                //     '<thead id="people-column" class="bg-light text-primary"><tr></tr></thead></table></div>');
                                $(tableOpr.opts.container + " #subTables .tab-content").append('<div id="' + uuContainer + 'subtab_' + index + '" class="tab-pane">' +
                                    '<table class="table table-hover admin-form theme-warning" tableId=' + subTableStruct[index].tableId + ' cellspacing="0">' +
                                    '<thead id="people-column" class="bg-light text-primary"><tr></tr></thead></table>' +
                                    '<div id="subTableDiv" class="hidden">' +
                                    '<div class="row"><button data-original-title="返回" type="button" class="btn btn-xs btn-primary" id="btn-back" data-placement="bottom" title="" style="float:left;margin-top:10px;margin-left:10px;">' +
                                    '<i class="fa fa-mail-reply fa-fw"></i>' +
                                    '<span>返回</span>' +
                                    '</button>' +
                                    '<button data-original-title="保存" type="button" class="btn btn-xs btn-primary" id="btn-save" data-placement="bottom" title="" style="float:left;margin-top:10px;margin-left:10px;">' +
                                    '<i class="fa fa-save fa-fw"></i>' +
                                    '<span>保存</span>' +
                                    '</button>' +
                                    '</div><div id="subTableDetail"></div></div></div>');

                                $(tableOpr.opts.container + " #subTables .nav-tabs li:first-child").addClass("active");
                                $(tableOpr.opts.container + " #subTables .tab-content #"+ uuContainer +"subtab_0").addClass("active");

                                var column = [];
                                var multiColumn = [];
                                $(tableOpr.opts.container + " #subTables .tab-content table[tableId='" + subTableStruct[index].tableId + "'] thead tr").empty().append('<th>选择</th>');
                                column.push({
                                    data: 'selectCheck',
                                    render: function(data, type, full) {
                                        return '<label class="option block mn" style="text-align: center; width:21px">' + '<input name="mobileos" value="false" type="checkbox">' + '<span class="checkbox mn"></span>' + '</label>';
                                    },
                                })
                                _.each(subTableStruct[index].fields, function(item) {
                                    var str = "<th style='text-align: center'>" + item.fieldDisplayName + "</th>";
                                    if(!item.isDisplay)
                                    {
                                        str = "<th style='text-align: center' hidden>" + item.fieldDisplayName + "</th>";
                                    }
                                    $(tableOpr.opts.container + " #subTables .tab-content table[tableId='" + subTableStruct[index].tableId + "'] thead tr").append(str);
                                    if(item.isMultiValue == true){
                                        multiColumn.push(item.fieldId);
                                    }
                                    if (item.fieldName == "REC_ID"){
                                        column.push({
                                            data: item.fieldName,
                                            visible: item.isDisplay,
                                            defaultContent: '<div style="text-align: center">' + -1 + "</div>",
                                            render: function(data, type, full){
                                                return '<div style="text-align: center">'+ data +"</div>";
                                            }
                                        });
                                    }else if(item.isCode == true){
                                        if(item.isMultiValue == true){
                                            column.push({
                                                data: item.fieldId,
                                                visible: item.isDisplay,
                                                defaultContent: "",
                                                render: function(data, type, full){
                                                    if(_.isEmpty(data)){
                                                        return '<div style="text-align: center"></div>';
                                                    }
                                                    var codeData = data.split(';');
                                                    var tmpData = "";
                                                    _.each(codeData, function(code){
                                                        _.each(tableOpr.opts.codeTable[item.codeTable], function (field) {
                                                            if(code == field.code)
                                                                tmpData = tmpData + field.value + ";";
                                                        });
                                                    });
                                                    return '<div style="text-align: center">' + tmpData + "</div>";
                                                }
                                            });
                                        }else{
                                            column.push({
                                                data: item.fieldId,
                                                visible: item.isDisplay,
                                                defaultContent: "",
                                                render: function(data, type, full){
                                                    if(_.isEmpty(data)){
                                                        return '<div style="text-align: center"></div>';
                                                    }
                                                    var tmpData = "";
                                                    _.each(tableOpr.opts.codeTable[item.codeTable], function (field) {
                                                        if(data == field.code)
                                                            tmpData = field.value;
                                                    });
                                                    return '<div style="text-align: center">' + tmpData + "</div>";
                                                }
                                            });
                                        }

                                    }else {
                                        column.push({
                                            data: item.fieldId,
                                            visible: item.isDisplay,
                                            defaultContent: "",
                                            render: function (data, type, full) {
                                                if (!_.isEmpty(data))
                                                    return '<div style="text-align: center">' + data + "</div>";
                                            }
                                        });
                                    }
                                });
                                columnStruct[subTableStruct[index].tableId] = column;
                                tableOpr.inner.subTableMultiColumn[subTableStruct[index].tableId] = multiColumn;

                                var tableData = [];
                                var subDataTable = $(tableOpr.opts.container + " #subTables .tab-content table[tableId='" + subTableStruct[index].tableId + "']").DataTable({
                                    "aoColumnDefs": [{
                                        'bSortable': true,
                                        'aTargets': [-1]
                                    }],
                                    'language': {
                                        'processing': '正在加载数据...',
                                        'lengthMenu': '每页显示_MENU_条数据',
                                        'sZeroRecords': '0条数据',
                                        'infoEmpty': '当前没有数据',
                                        'info': '当前显示_START_到_END_条，共有_TOTAL_条数据',
                                        'search': '搜索',
                                        'paginate': {
                                            'First': '首页',
                                            'previous': '前一页',
                                            'next': '后一页',
                                            'Last': '尾页'
                                        }
                                    },
                                    "iDisplayLength": 30,
                                    "aLengthMenu": [15, 30, 50, 100],
                                    'ordering': false,
                                    "autoWidth": false,
                                    //"sDom": '<"#buttonCollection"><"dt-panelmenu clearfix "fr>t<"dt-panelfooter clearfix"ip>',
                                    "sDom": '<"#buttonCollection' + subTableStruct[index].tableId + '"><"clearfix"fr>t<"clearfix"p><"clear">', //'<"clearfix">rt<"clearfix"lp><"clear">',
                                    initComplete: function() {
                                        $(tableOpr.opts.container + ' #buttonCollection' + subTableStruct[index].tableId).append('<button data-original-title="新增" type="button" class="btn btn-xs btn-primary" id="btn-add" data-placement="bottom" style="float:left;margin-top:10px;margin-left:10px;">' +
                                            '<i class="fa fa-plus fa-fw"></i>' +
                                            '<span>新增</span>' +
                                            '</button>' +
                                            '<button data-original-title="编辑" type="button" class="btn btn-xs btn-primary" id="btn-edit" data-placement="bottom" title="" style="float:left;margin-top:10px;margin-left:10px;">' +
                                            '<i class="fa fa-edit fa-fw"></i>' +
                                            '<span>编辑</span>' +
                                            '</button>' +
                                            '<button data-original-title="删除" type="button" class="btn btn-xs btn-primary" id="btn-delete" data-placement="bottom" title="" style="float:left;margin-top:10px;margin-left:10px;">' +
                                            '<i class="fa fa-times fa-fw"></i>' +
                                            '<span>删除</span>' +
                                            '</button>');
                                    },
                                    // 'data': tableData,
                                    'columns': columnStruct[subTableStruct[index].tableId],
                                });

                                tableOpr.inner.metaSubtable["" + subTableStruct[index].tableId] = subDataTable;

                                initSubTableClick(tableOpr, subTableStruct[index].tableId);
                            }
                        }

                        if (_.has(tableOpr.opts, 'data') && _.has(tableOpr.opts.data, 'subTables')) {
                            setSubTableData(tableOpr, tableOpr.opts.data.subTables);
                        }

                        initDataFromService(tableOpr);

                    } else {
                        avaNotify.show({
                            title: "获取表单元数据失败",
                            text: rsp.message,
                            type: "error"
                        });
                    }
                });
            }else{
                avaNotify.show({
                    title: "获取代码表信息失败!",
                    type: "error"
                });
            }
        });

        
    }

    function initSubTableClick(tableOpr, tableId) {

        if(_.has(tableOpr.opts.mode, 'readOnly') && tableOpr.opts.mode.readOnly == true){
            $(tableOpr.opts.container + " #buttonCollection" + tableId + " #btn-add").addClass('hidden');
            $(tableOpr.opts.container + " #buttonCollection" + tableId + " #btn-edit").addClass('hidden');
            $("#buttonCollection" + tableId + " #btn-delete", tableOpr.opts.container).addClass('hidden');
        }

        if(_.has(tableOpr.opts.mode, 'editSubTable') && tableOpr.opts.mode.editSubTable == true){
            $(tableOpr.opts.container + " #buttonCollection" + tableId + " #btn-add").removeClass('hidden');
            $(tableOpr.opts.container + " #buttonCollection" + tableId + " #btn-edit").removeClass('hidden');
            $(" #buttonCollection" + tableId + " #btn-delete", tableOpr.opts.container).removeClass('hidden');
        }

        $(tableOpr.opts.container + " #buttonCollection" + tableId + " #btn-add").on("click", function (event) {

            var tblDataSet = {};
            // avaDialog.build({
            //     title: "新增记录",
            //     leftBtn: "取消",
            //     rightBtn: "新增",
            //     style: "lg",
            //     content: "<div id='subTableDialog'> Loading... </div>",
            //     rightBtnCallback: function () {
            //         avaDialog.dismiss();

            //         var tableData = tblDataSet.getValue();
            //         if (_.keys(tableData).length == 0)
            //             return;
            //         tableData.REC_ID = -1;
            //         var tmpDataTable = $(tableOpr.opts.container + " #subTables .tab-content table[tableId='" + tableId + "']").dataTable();
            //         tmpDataTable.fnAddData(tableData);
            //     }
            // }).show(function () {
            //     tblDesignCY.loadCode({
            //         tblId: tableId,
            //         entityId: -1
            //     }, avaDollar("#subTableDialog"), function (jsObj) {
            //         tblDataSet = jsObj;
            //     });
            // });
            $(tableOpr.opts.container + " #subTables .tab-content table[tableId='" + tableId + "']").parent().addClass("hidden");
            var parentId = $(tableOpr.opts.container + " #subTables .tab-content table[tableId='" + tableId + "']").parent().parent()[0].id;
            $("#" + parentId + " #subTableDiv").removeClass("hidden");
            $("#" + parentId + " #subTableDetail").empty();
            $("#" + parentId + " #subTableDetail").removeClass("cy");
            tblDesignCY.loadCode({
                tblId: tableId,
                entityId: -1
            }, $("#" + parentId + " #subTableDetail"), function (jsObj) {
                tblDataSet = jsObj;
            });

            $("#" + parentId + " #subTableDiv #btn-back").off('click');
            $("#" + parentId + " #subTableDiv #btn-back").on('click', function(){
                $("#" + parentId + " #subTableDiv").addClass("hidden");
                $(tableOpr.opts.container + " #subTables .tab-content table[tableId='" + tableId + "']").parent().removeClass("hidden");
            });

            $("#" + parentId + " #subTableDiv #btn-save").off('click');
            $("#" + parentId + " #subTableDiv #btn-save").on('click', function(){

                $("#" + parentId + " #subTableDiv #btn-back").click();

                var tableData = tblDataSet.getValue();
                if (_.keys(tableData).length == 0)
                    return;
                tableData.REC_ID = -1;
                var tmpDataTable = $(tableOpr.opts.container + " #subTables .tab-content table[tableId='" + tableId + "']").dataTable();
                tmpDataTable.fnAddData(tableData);

            });

        });

        $(tableOpr.opts.container + " #buttonCollection" + tableId + " #btn-edit").on("click", function (event) {

            var rowsData = getSelectRows(tableOpr, tableId);
            if (rowsData.length != 1) {
                avaNotify.show({
                    title: "请勾选唯一编辑记录！",
                    type: "info"
                });
                return;
            }

            _.each(_.keys(rowsData[0].data), function(item){
                if(tableOpr.inner.subTableMultiColumn[tableId].indexOf(item) != -1 && rowsData[0].data[item] != undefined){
                    var tmpData = rowsData[0].data[item].split(';');
                    rowsData[0].data[item] = tmpData;
                }
            });

            var tblDataSet = {};
            // avaDialog.build({
            //     title: "编辑记录",
            //     leftBtn: "取消",
            //     rightBtn: "保存",
            //     style: "lg",
            //     content: "<div id='subTableDialog'> Loading... </div>",
            //     rightBtnCallback: function () {
            //         avaDialog.dismiss();

            //         var tableData = tblDataSet.getValue();
            //         tableData.REC_ID = rowsData[0].data.REC_ID;

            //         var tmpDataTable = $(tableOpr.opts.container + " #subTables .tab-content table[tableId='" + tableId + "']").dataTable();
            //         tmpDataTable.fnUpdate(tableData, rowsData[0].id);
            //     }
            // }).show(function () {
            //     tblDesignCY.loadCode({
            //         tblId: tableId,
            //         entityId: rowsData[0].data.REC_ID
            //     }, avaDollar("#subTableDialog"), function (jsObj) {
            //         tblDataSet = jsObj;
            //         tblDataSet.openData(rowsData[0].data);
            //     });
            // });
            $(tableOpr.opts.container + " #subTables .tab-content table[tableId='" + tableId + "']").parent().addClass("hidden");
            var parentId = $(tableOpr.opts.container + " #subTables .tab-content table[tableId='" + tableId + "']").parent().parent()[0].id;
            $("#" + parentId + " #subTableDiv").removeClass("hidden");
            $("#" + parentId + " #subTableDetail").empty();
            tblDesignCY.loadCode({
                tblId: tableId,
                entityId: rowsData[0].data.REC_ID
            }, $("#" + parentId + " #subTableDetail"), function (jsObj) {
                tblDataSet = jsObj;
                tblDataSet.openData(rowsData[0].data);
            });

            $("#" + parentId + " #subTableDiv #btn-back").off('click');
            $("#" + parentId + " #subTableDiv #btn-back").on('click', function(){
                $("#" + parentId + " #subTableDiv").addClass("hidden");
                $(tableOpr.opts.container + " #subTables .tab-content table[tableId='" + tableId + "']").parent().removeClass("hidden");
            });

            $("#" + parentId + " #subTableDiv #btn-save").off('click');
            $("#" + parentId + " #subTableDiv #btn-save").on('click', function(){

                $("#" + parentId + " #subTableDiv #btn-back").click();

                var tableData = tblDataSet.getValue();
                tableData.REC_ID = rowsData[0].data.REC_ID;

                var tmpDataTable = $(tableOpr.opts.container + " #subTables .tab-content table[tableId='" + tableId + "']").dataTable();
                tmpDataTable.fnUpdate(tableData, rowsData[0].id);

            });
        });

        $("#buttonCollection" + tableId + " #btn-delete", tableOpr.opts.container).on("click", function (event) {

            var rowsData = getSelectRows(tableOpr, tableId);
            if (rowsData.length == 0) {
                avaNotify.show({
                    text: "请勾选记录！",
                    type: "info"
                });
                return;
            }

            var tmpDataTable = $(tableOpr.opts.container + " #subTables .tab-content table[tableId='" + tableId + "']").dataTable();
            _.each(rowsData, function (item) {
                tmpDataTable.fnDeleteRow(item.id);
            });
        });

        $(tableOpr.opts.container + " #subTables .tab-content table[tableId='" + tableId + "']").on('click', '> tbody > tr > td > label > .checkbox', function (e) {
            $parentTr = $(this).parent();
            var selectedMsgId = $parentTr.find('input').val();
            if (selectedMsgId == "false") {
                $parentTr.find('input').attr('value', "true");
            } else {
                $parentTr.find('input').attr('value', "false");
            }
        });
    }

    function initDataFromService(tableOpr) {
        var versionId = _.has(tableOpr.opts, 'versionId') ? tableOpr.opts.versionId : -1;
        if (_.has(tableOpr.opts, 'recId') && tableOpr.opts.recId > 0) {
            $.getJSON('/tabledesign/getTableDetail', {
                tableId: tableOpr.opts.tableId,
                recId: tableOpr.opts.recId,
                versionId: versionId
            }, function (rsp) {
                if (rsp.code == 0) {
                    var mainFields = rsp.data.fields;
                    var subTables = rsp.data.subTables;

                    setMainData(tableOpr, mainFields);
                    setSubTableData(tableOpr, subTables);
                } else {
                    avaNotify.show({
                        title: "获取表单内容数据失败",
                        text: rsp.message,
                        type: "error"
                    });
                }
            });
        } else {
            tableOpr.opts.recId = -1;
        }
    }

    function getSelectRows(tableOpr, tableId) {

        var result = [];
        var tmpData = tableOpr.inner.metaSubtable[tableId];

        tmpData.rows(function (idx, data, node) {
            if ($(node).find('>:nth-child(1)>label > input')[0].checked == true) {
                result.push({
                    id: idx,
                    data: data
                });
            }
        });

        return result;
    }

    function getMainData(tableOpr) {
        var tmpObject = tableOpr.inner.metaMainDataSet;
        var mainTable = tmpObject.getMetaDataValue();
        return mainTable;
    }

    function getSubTableData(tableOpr) {

        var subTables = [];
        _.each(_.keys(tableOpr.inner.metaSubtable), function (tableId) {
            var tmpDataTable = tableOpr.inner.metaSubtable[tableId];
            var records = [];
            if(tmpDataTable.data().length == 0){
                subTables.push({
                    tableId: tableId,
                    records: []
                });
                return;
            }
            _.each(tmpDataTable.data(), function (row) {
                var fields = [];
                var recId = -1;
                _.each(_.keys(row), function (column) {
                    if(column == "REC_ID") {
                        recId = row[column];
                    }else if(tableOpr.inner.subTableMultiColumn[tableId].indexOf(column) != -1){
                        if(row[column] != ""){
                            var tmpData = row[column].split(';');
                            _.each(tmpData, function(item){
                                if(item != ''){
                                    fields.push({
                                        fieldId: column,
                                        fieldValue: item
                                    });
                                }
                            });
                        }
                    }else{
                        fields.push({
                            fieldId: column,
                            fieldValue: row[column]
                        });
                    }

                });
                records.push({
                    recId: recId,
                    fields: fields
                });
            });
            if (records.length != 0) {
                subTables.push({
                    tableId: tableId,
                    records: records
                });
            }
        });

        return subTables;
    }

    function setMainData(tableOpr, data) {

        var tmpObject = tableOpr.inner.metaMainDataSet;
        tmpObject.openKVData(data);
    }

    function setSubTableData(tableOpr, data) {
        _.each(data, function (table) {
            var tmpDataTable = $(tableOpr.opts.container + " #subTables .tab-content table[tableId='" + table.tableId + "']").dataTable();
            var tmpData = [];
            _.each(table.records, function (row) {
                var tmpRow = {};
                var recId = _.has(row, 'recId') ? row.recId : -1;
                tmpRow['REC_ID'] = recId;

                _.each(row.fields, function (column) {
                    if(_.has(tmpRow, column.fieldId)){
                        tmpRow[column.fieldId] = tmpRow[column.fieldId] + ";" + column.fieldValue;
                    }else{
                        tmpRow[column.fieldId] = column.fieldValue;
                    }
                });
                tmpData.push(tmpRow);
            });
            tmpDataTable.fnClearTable();
            tmpDataTable.fnAddData(tmpData);
        });
    }

    function uuid(len, radix) {
        var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
        var uuid = [], i;
        if(len) {
            for(i=0;i < len;i++) {
                uuid[i] = chars[0 | Math.random()*radix];
            }
        }
        else {
            var r;
            uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
            uuid[14] = '4';

            for(i = 0;i < 36;i++) {
                if(!uuid[i]) {
                   r = 0 | Math.random()*16;
                uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r]; 
                }
            }
        }
        return uuid.join('');
    }

    Array.prototype.indexOf = function (val) {
        for (var i = 0; i < this.length; i++) {
            if (this[i] == val) return i;
        }
        return -1;
    };

    Array.prototype.remove = function (val) {
        var index = this.indexOf(val);
        if (index > -1) {
            this.splice(index, 1);
        }
    };



    return {
        buildTable: buildTable,
        print: print
    }
});