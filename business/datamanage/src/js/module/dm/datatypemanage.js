define('./datatypemanage', [
    'nova-dialog', 'nova-notify', 'utility/loaders',
    '../../tpl/tpl-datatypemanage',
    '../../tpl/tpl-advanced-set',
    '../../tpl/tpl-createdatatype-fromfile',
    '../../tpl/tpl-colFill',
    '../dm/datatypemanage/dm-datatypemanage-util',
    '../dm/datatypemanage/dm-datatypemanage-inner',
    '../dm/datatypemanage/dm-advancedset',
    '../dm/datatypemanage/dm-createdatatype-fromfile',
    '../dm/basicfunction/dm-tree',
], function (Dialog, Notify, loader, tplDatatypemanage, tplAadvancedSetDialog, tplFromfileDialog,
             colFillDialog, util, inner, advancedset, fromfile, Tree) {
    tplDatatypemanage = _.template(tplDatatypemanage);
    tplAadvancedSetDialog = _.template(tplAadvancedSetDialog);
    tplFromfileDialog = _.template(tplFromfileDialog);
    colFillDialog = _.template(colFillDialog);

    var _opts;
    var selectedNode;
    //是否进行字段类型检测：0，不检测；1，检测。
    var checkFlag = 1;
    //元字符转义标志位: 0,不转义；1，转义
    var metaCharacterFlag = 1;
    var state = "1";
    //0：全部不可编辑；1：全部可以编辑；2：可部分编辑
    var isEditState = 0;
    var modifyClass = 4;
    var columnListData = new Array();
    var udpFlag = 0;
    var curModifyClass = 3;
    var curMaxFieldIndex = 1;
    var ptArray = new Array();
    var ptResultArray = new Array();
    var statFieldArray = new Array();
    var statFieldResultArray = new Array();
    var seniorSearchArray = new Array();
    var curZoneId = 1;
    var curCenterCode = 100000;
    var originalCenterCode = 100000;
    var curRootDirId = 12;
    var colsDisplayNameArrays = [];
    var udpFileIdNum = 0;
    var udpFileTimeNum = 0;
    var colInfoList = [];
    var isClone = false;
    var numRegx = /(^\d*$)|^(^\d{17}(\d|X|x)$)/;
    var logicTypeData, codeTableData, seniorSearchData;

    function init(opts) {
        _opts = opts;
    }

    function renderDatatypemanageInfo(info, state, oprName) {
        if (_.isUndefined(info.data.typeId) && state != "4") {
            $(_opts.container).empty();
            return;
        }
        selectedNode = info;
        $(_opts.container).empty().append(tplDatatypemanage(info));

        util.delDynamicLoading.css("/datamanage/css/dataimport/bootplus.css");
        util.delDynamicLoading.css("/datamanage/css/dataimport/dataimport.css");

        initData();
        bindEvent();

        if (oprName == "新建系统库") {
            curZoneId = 1;
            curRootDirId = getRootDirId();
        }
        else if (oprName == "新建个人库") {
            curZoneId = 2;
            curRootDirId = getRootDirId();
        }
        if (!_.isUndefined(selectedNode.data.typeId)) {
            curZoneId = selectedNode.data.zoneId;
            curCenterCode = selectedNode.data.centerCode;
            originalCenterCode = selectedNode.data.centerCode;
            curRootDirId = getRootDirId();
        }
        else {
            //读取管理库，获取系统配置的当前centerCode
            $.getJSON("/datamanage/dataimport/GetSystemConfig?key=DataTypeCenterCode", function (rsp) {
                if (rsp.code == 0) {
                    console.log("DataTypeCenterCode:" + rsp.data);
                    curCenterCode = rsp.data.SystemConfingInfo.value;
                }
                else {
                    console.log("GetSystemConfig?key=DataTypeCenterCode", rsp.message);
                    curCenterCode = 100000;
                }
            });
        }

        curMaxFieldIndex = 1;
        ptArray = [];
        ptResultArray = [];
        statFieldArray = [];
        renderPage(state);
    }

    //数据类型创建、编辑页面展示
    function renderPage(innerState) {
        state = innerState;
        isClone = false;
        $("#btn-fromfile").hide();
        switch (innerState) {
            case "0": //克隆数据类型
                isClone = true;
                inner.setReadOnlyStat();
                setReadOnly(0);
                break;
            case "1": //初始状态，未选中数据
                inner.setInitStat();
                break;
            case "2": //选中了数据，预览字段定义
                console.log("2");
                inner.setReadOnlyStat();
                setReadOnly(0);
                break;
            case "3-1": //编辑当前数据类型的字段定义
                showLoader();
                $("#oprlabel")[0].innerHTML = "编辑数据类型";
                $.post('/datamanage/importbatch/JudgeDataTypeModifyType', {
                    "centerCode": selectedNode.data.centerCode,
                    "dataTypeId": selectedNode.data.typeId,
                }).done(function (res) {
                    hideLoader();
                    var data = JSON.parse(res);
                    if (data.code == 0) {
                        modifyClass = data.data.modifyClass;
                        console.log("modifyClass", modifyClass);
                        //modifyClass = 3;
                        if (modifyClass >= 1 && modifyClass <= 4) {
                            editDataType(modifyClass);
                        }
                        else {
                            Notify.show({
                                title: '获取的该数据类型的编辑权限异常！',
                                type: 'danger'
                            });
                            modifyClass = 4;
                            editDataType(modifyClass);
                        }
                    }
                    else {
                        Notify.show({
                            title: '获取该数据类型的编辑权限失败！',
                            type: 'danger'
                        });
                        modifyClass = 4;
                        editDataType(modifyClass);
                        console.log(data.message);
                    }
                });
                break;

            case "3-2": //编辑字段定义并保存为新的数据类型
                //renderPage("2");
                isClone = true;
                //colInfoList = getAllColsBasicInfo();
                console.log("3-2");
                $("#oprlabel")[0].innerHTML = "克隆为新数据";
                $('#table-panel-footer').show();
                $("#btn-save-as").show();
                //$("#btn-edit-submit").show();
                $("#btn-edit-new").hide();
                $("#btn-delete-row").show();
                $("#btn-add-row").show();
                $("#add-multiple-row").show();
                $("#colFill").show();
                //$("#btn-manual-create").attr("disabled", "disabled");
                $("#btn-fromfile-create").attr("disabled", "disabled");
                $("#btn-add-folder").attr("disabled", "disabled");
                $("#btn-move").attr("disabled", "disabled");
                $("#btn-delete").attr("disabled", "disabled");
                $("#btn-reload-tree").attr("disabled", "disabled");
                $("#btn-edit").removeClass("btn-primary");
                $("#btn-edit").addClass("btn-danger");
                $("#btn-edit").html("放弃更改");
                setEditable("noReloadAndAllEdit");

                var hasAttachment = $("#hasattachment:checked").length;
                if (hasAttachment == 0) {
                    $("#isindex").removeAttr("disabled");
                }
                else if (hasAttachment == 1) {
                    $("#isindex").attr("disabled", "disabled");
                    document.getElementById('isindex').checked = true;
                }
                break;

            case "4": //从空白新建数据
                $("#btn-fromfile").show();
                metaCharacterFlag = 1;
                checkFlag = 1;
                if (curZoneId == 1) {
                    $("#oprlabel")[0].innerHTML = "新建系统库";
                    //checkFlag = 0;
                }
                else if (curZoneId == 2) {
                    $("#oprlabel")[0].innerHTML = "新建个人库";
                    //checkFlag = 1;
                }
                else {
                    //checkFlag = 0;
                    $("#oprlabel")[0].innerHTML = "";
                }

                //$("#btn-manual-create").attr("disabled", "disabled");
                $("#btn-fromfile-create").removeAttr("disabled");
                clearEntireTable();
                $(".edit").removeAttr("disabled");
                isEditState = 1;
                $("#datapanel").show();
                $("#colFill").show();
                $('#table-panel-footer').show();
                $("#btn-edit").hide();
                $("#btn-delete-row").show();
                $("#btn-add-row").show();
                $("#add-multiple-row").show();
                $("#create-data").show();
                $("#btn-edit-new").hide();
                $("#isindex").attr("disabled", "disabled");
                writedatapath(selectedNode);
                break;

            case "5":
                //isEditState
                $("#datapanel").hide();
                $("#btn-save-as").hide();
                $("#btn-edit-submit").hide();
                $("#btn-edit").hide();
                break;
            default:
                break;
        }
    }

    function initData() {
        logicTypeData = [
            {"logictype": "string", "displayname": "字符串"},
            //{"logictype": "decimal", "displayname": "数值型IP地址"},
            {"logictype": "decimal", "displayname": "数值"},
            {"logictype": "date", "displayname": "日期"},
            {"logictype": "datetime", "displayname": "日期时间"}
        ];

        seniorSearchData = [];
        //获取高级检索项
        $.getJSON('/datamanage/udp/getSearchItem', function (rsp) {
            if (rsp.code == 0) {
                seniorSearchData = rsp.data;
            } else {
                console.log("get udp senior search item failed, err msg:" + rsp.message);
            }
        });
        console.log("seniorSearchData", seniorSearchData);

        codeTableData = [];
        //获取代码表
        $.getJSON("/datamanage/udp/getCodeTable", function (rsp) {
            if (rsp.code == 0) {
                codeTableData = rsp.data.tableInfos;
            } else {
                console.log("get code table failed, err msg:" + rsp.message);
                Notify.show({
                    title: '获取代码表信息失败！',
                    type: 'error'
                });
            }
        });
    }

    function bindEvent() {
        $('#hasattachment').on('click', function () {
            var hasAttachment = $("#hasattachment:checked").length;
            if (hasAttachment == 0) {
                $("#isindex").removeAttr("disabled");
            }
            else if (hasAttachment == 1) {
                $("#isindex").attr("disabled", "disabled");
                document.getElementById('isindex').checked = true;
            }
        });

        $('#colFill').on('click', function () {
            Dialog.build({
                title: "填充字段",
                content: colFillDialog({
                    //loginname: "高级设置"
                }),
                width: 400,
                minHeight: 400,
                rightBtnCallback: colsFill,
                rightBtn: "生成字段",
            }).show(
            )
        });

        $("#btn-edit").on('click', function () {
            if (state == "2") {
                renderPage("2");
            } else {
                renderPage("3-1");
            }
        });

        $("#btn-edit-new").on('click', function () {
            if (state == "2") {
                renderPage("3-2");
            } else {
                renderPage("2");
            }
        });

        //新建数据类型，字段填充功能
        $("#btn-advanced-set").on('click', function () {
            var dataTypeTitle = "新建数据类型";
            if (selectedNode.data.caption != undefined)
                dataTypeTitle = selectedNode.data.caption;
            colInfoList = getAllColsBasicInfo();
            //console.log("advanced colInfoList", colInfoList);

            Dialog.build({
                title: "高级设置" + "(" + dataTypeTitle + ")",
                content: tplAadvancedSetDialog({
                    //loginname: "高级设置"
                }),
                width: 1000,
                minHeight: 450,
                rightBtnCallback: checkAndSaveAdvancedSet,
            }).show(
                function () {
                    $('#fieldTypeCheck')[0].checked = checkFlag == 1 ? true : false;
                    $('#metaCheck')[0].checked = metaCharacterFlag == 1 ? true : false;

                    if (!document.getElementById('isindex').checked) {
                        $("#index-partition-field-div").hide();
                        $("#index-id-field-div").hide();
                    }
                    else {
                        $("#index-partition-field-div").show();
                        $("#index-id-field-div").show();
                    }

                    console.log("colInfoList", colInfoList);
                    console.log("curCenterCode", curCenterCode);
                    console.log("statFieldArray", statFieldArray);
                    advancedset.initAdvancedSetPage(colInfoList, curCenterCode, statFieldArray);

                    $("#partition-policy-table").on('click', 'tbody > tr', function (event) {
                        $task = $(this);
                        inner.removeSelectedStyleForPolicy();
                        $("#partition-policy-table tr").removeClass('trSelected');
                        $task.addClass('trSelected');
                        inner.addSelectedStyleForPolicy();
                    });

                    //添加一条分区策略
                    $("#btn-add-policy").on("click", function (event) {
                        if (colInfoList.length <= 0) {
                            Notify.show({
                                title: '该数据类型的字段信息为空或者有错误！',
                                type: 'error'
                            });
                        }
                        else {
                            var i = $('#partition-policy-table tbody > tr').length + 1;
                            advancedset.generateRowForPolicy(i, 0, true, colInfoList, false);
                            $('#partition-policy-table tbody tr:last-child td').find("select").each(function () {
                                $(this).select2();
                            });
                        }
                    }); //addPartitionPolicy

                    $("#btn-delete-policy").on("click", function (event) {
                        var $selectedLine = $('#partition-policy-table tbody').find(".trSelected");
                        if ($selectedLine.length != 0) {
                            var $nextLine = $selectedLine.next();
                            if ($nextLine.length != 0) {
                                $selectedLine.remove();
                                $nextLine.addClass("trSelected");
                                inner.addSelectedStyle();
                            } else {
                                var $previousLine = $selectedLine.prev();
                                if ($previousLine.length != 0) {
                                    $selectedLine.remove();
                                    $previousLine.addClass("trSelected");
                                    inner.addSelectedStyle();
                                } else {
                                    $selectedLine.remove();
                                }
                            }
                        } else {
                            Notify.show({
                                title: '请指定要删除的行！',
                                type: 'danger'
                            });
                        }
                    });

                    //console.log("ptArray", ptArray);
                    advancedset.drawPolicyRows(ptArray, colInfoList);

                    $("#btn-delete-policy").hide();
                    $("#btn-add-policy").hide();

                    switch (state) {
                        case "1":
                        case "2":
                            $(".edit").prop("disabled", "disabled");
                            break;
                        case "3-1":
                            //0：全部不可编辑；
                            if (modifyClass == 0) {
                                $(".edit").prop("disabled", "disabled");
                            }
                            //1：部分不可编辑
                            else if (modifyClass == 3 || modifyClass == 4) {
                                $(".lock-edit").prop("disabled", "disabled");
                            }
                            //2：可部分编辑
                            else if (modifyClass == 2) {
                                $(".lock-edit").prop("disabled", "disabled");
                            }
                            //1：全部可以编辑；
                            else if (modifyClass == 1) {
                                $("#btn-delete-policy").show();
                                $("#btn-add-policy").show();
                            }
                            $("#center-select").prop("disabled", "disabled");
                            break;
                        case "3-2":
                            $("#center-select").prop("disabled", "disabled");
                        case "4":
                            $("#btn-delete-policy").show();
                            $("#btn-add-policy").show();
                            break;

                    }
                })
        });

        //新建数据类型，从文件生成字段定义功能
        $("#btn-fromfile").on('click', function () {
            Dialog.build({
                title: "从数据文件获取字段",
                content: tplFromfileDialog({//loginname: "高级设置"
                }),
                width: 1200,
                minHeight: 640,
                rightBtnCallback: saveAndGenerateColsDef,
                rightBtn: "生成字段定义",
            }).show(
                function () {
                    fromfile.initFunction();
                })
        });

        //数据类型创建、保存
        $('#create-data,#btn-save-as').on("click", function (event) {
            showLoader();
            var dataName = $("#dataname").val().trim();
            if (_.isEmpty(dataName)) {
                Notify.show({
                    title: '数据名称不能为空！',
                    type: 'danger'
                });
                hideLoader();
                return;
            }
            if (util.checkDataTypeName(dataName)) {
                Notify.show({
                    title: "数据名称包含非法字符！",
                    type: "error"
                });
                hideLoader();
                return;
            }
            var hasAttachment = $("#hasattachment:checked").length;
            var isIndex = $("#isindex:checked").length;
            //Alert.show({
            //    container: $("#alert-container"),
            //    alertid: "alert-check-hasattachment",
            //    alertclass: "alert-warning",
            //    content: "<i class='fa fa-keyboard-o pr10'></i><strong> hasAttachment:" + hasAttachment + " </strong>"
            //});
            dirId = $("#datapath").attr('dirId');
            dataDesc = $("#datadesc").val();

            rows = $('#createDataTable tbody > tr').length;
            var category = (hasAttachment == 0) ? 1 : (rows == 0 ? 2 : 3);
            if (category == 1 && rows <= 0) {
                hideLoader();
                Notify.show({
                    title: '结构化数据类型至少要有一列！',
                    type: 'danger'
                });
                return;
            }

            udpFlag = isIndex; //(category != 1) ? 1 : 0;
            columnList = [];
            clearBeforeGetColsInfo();
            for (i = 1; i <= rows; i++) {
                var tr = $('#createDataTable tbody > tr:nth-child(' + i + ')');
                var colName = $('#createDataTable tbody > tr:nth-child(' + i + ') > td:nth-child(2) :input').val().trim();
                if (tr[0].classList.contains('hide') && (colName == '导入批次' || colName == '记录标识')) {
                    continue;
                }
                col = getColumn(i, false);
                if (col) {
                    columnList.push(col);
                }
                else {
                    hideLoader();
                    return;
                }
            }

            //console.log("createDataType", columnList);
            //提交创建数据类型请求
            $.post("/datamanage/udp/createDataType", {
                "centerCode": curCenterCode,
                "description": dataDesc,
                "dirID": dirId,
                "displayName": dataName,
                "zoneID": curZoneId,
                "category": category,
                "columnList": columnList,
                "udpFlag": udpFlag,
                "checkFlag": checkFlag,
                "metaCharacterFlag": metaCharacterFlag
            }).done(function (rsp) {
                hideLoader();
                if (JSON.parse(rsp).code == 0) {
                    //console.log("create-data,btn-save-as", columnList);
                    Notify.show({
                        title: '创建数据类型成功！',
                        type: 'success'
                    });
                    reloadTree();
                    renderPage("1");
                }
                else {
                    Notify.show({
                        title: '创建数据类型失败,' + JSON.parse(rsp).message,
                        type: 'danger'
                    });
                    console.log("create-data,btn-save-as error-message", JSON.parse(rsp).message);
                }
            });
        });

        //数据类型编辑
        $('#btn-edit-submit').on("click", function (event) {
            showLoader();
            dataTypeId = selectedNode.data.typeId;
            dataName = $("#dataname").val();
            if (_.isEmpty(dataName)) {
                Notify.show({
                    title: '数据名称不能为空！',
                    type: 'danger'
                });
                hideLoader();
                return;
            }
            hasAttachment = $("#hasattachment:checked").length;
            //Alert.show({
            //    container: $("#alert-container"),
            //    alertid: "alert-check-hasattachment",
            //    alertclass: "alert-warning",
            //    content: "<i class='fa fa-keyboard-o pr10'></i><strong> hasAttachment:" + hasAttachment + " </strong>"
            //});
            dirId = $("#datapath").attr('dirId');
            dataDesc = $("#datadesc").val();

            rows = $('#createDataTable tbody > tr').length;
            var category = (hasAttachment == 0) ? 1 : (rows == 0 ? 2 : 3);
            var isIndex = $("#isindex:checked").length;
            var isIndex = $("#isindex:checked").length;
            udpFlag = isIndex; //(category != 1) ? 1 : 0;

            columnList = [];
            clearBeforeGetColsInfo();
            for (i = 1; i <= rows; i++) {
                col = getColumn(i, true);
                if (col) {
                    columnList.push(col);
                }
                else {
                    hideLoader();
                    return;
                }
            }

            console.log("modifyDataType", columnList);
            //提交数据类型编辑请求
            $.post("/datamanage/udp/modifyDataType", {
                "description": dataDesc,
                "dirID": dirId,
                "displayName": dataName,
                "centerCode": curCenterCode,
                "originalCenterCode": originalCenterCode,
                "dataTypeId": dataTypeId,
                'zoneId': curZoneId,
                "category": category,
                "columnList": columnList,
                "udpFlag": udpFlag,
                "modifyClass": curModifyClass,
                "checkFlag": checkFlag,
                "metaCharacterFlag": metaCharacterFlag
            }).done(function (rsp) {
                hideLoader();
                var data = JSON.parse(rsp);
                if (data.code == 0) {
                    Notify.show({
                        title: '保存修改成功！',
                        type: 'success'
                    });
                    //console.log("modifyDataType_columnList", JSON.stringify(columnList));
                    //var curKey = selectedNode.key;
                    //reloadTree();
                    reloadTree();
                    //renderPage("2");
                    _opts.refreshDirCallbackFunc(selectedNode);
                }
                else {
                    Notify.show({
                        title: '保存修改失败！' + data.message,
                        type: 'danger'
                    });
                    console.log("modifyDataType_rspdata", data);
                    //renderPage("2");
                }
            });
        });

        $("#path").on("click", function (e) {
            e.preventDefault();
            if (isEditState >= 1 && isEditState <= 3) {
                Dialog.build({
                    title: "选择目录",
                    content: "<div id='folder-picker'> 加载中... </div>",
                    rightBtnCallback: function (e) {
                        e.preventDefault();

                        var selectedDir = $("#folder-picker").fancytree("getTree").getActiveNode();
                        if (isClone) {
                            $("#datapath").val(selectedDir.data.path.slice(4, selectedDir.data.path.length));
                            $("#datapath").attr('dirId', selectedDir.data.id);
                        }
                        else if (selectedDir) {
                            //$("#datapath").val(selectedDir.data.path);
                            if (curZoneId == 1)
                                $("#datapath").val(selectedDir.data.path.slice(8, selectedDir.data.path.length));
                            else if (curZoneId == 2)
                                $("#datapath").val(selectedDir.data.path.slice(4, selectedDir.data.path.length));
                            else
                                $("#datapath").val(selectedDir.data.path);
                            $("#datapath").attr('dirId', selectedDir.data.id);
                        }
                        $.magnificPopup.close();
                    }
                }).show(function () {
                    var rootDirID = curRootDirId;
                    if (isClone) {
                        rootDirID = _opts.rootNode.children[1].data.dirId;
                    }
                    console.log("rootDirID", rootDirID);
                    $("#folder-picker").empty();
                    Tree.build({
                        container: $("#folder-picker"),
                        selectMode: 1,
                        clickFolderMode: 1,
                        checkbox: false,
                        expandAll: true,
                        source: {
                            url: '/udp/listDir',
                            data: {
                                id: rootDirID,
                                dirType: 1
                            }
                        }
                    });
                });
            }
        });

        //单击字段表某一列
        $("#createDataTable").on('click', 'tbody > tr', function (event) {
            $task = $(this);
            //console.log("$task", $task);
            inner.removeSelectedStyle();
            $("#createDataTable tr").removeClass('trSelected');
            //$("#createDataTable tr").removeClass('trError');
            $task.removeClass('trError');
            $task.removeClass('danger');
            $task.addClass('trSelected');
            //console.log("tr", $("#createDataTable tr"));
            //console.log("$task", $task);
            inner.addSelectedStyle();

            if (curModifyClass == 2 || curModifyClass == 3) {
                if ($task.hasClass('isAdded'))
                    $("#btn-delete-row").show();
                else
                    $("#btn-delete-row").hide();
            }
        });

        //添加一列按钮
        $("#btn-add-row").on("click", function (event) {
            var i = $('#createDataTable tbody > tr').length + 1;
            var rowHtml = generateRow(i, 0, true, true);
            $('#createDataTable tbody').append(rowHtml);
            $(".displayNameChanged").unbind("change", displayNameChanged);
            $(".displayNameChanged").bind("change", displayNameChanged);
            $("select.logicType").unbind("change", logicTypeChanged);
            $("select.logicType").bind("change", logicTypeChanged);
            //console.log("i", i);
            $('#createDataTable tbody > tr:nth-child(' + (i) + ') > td:nth-child(1) :input').val(curMaxFieldIndex);
            curMaxFieldIndex++;
            $('#createDataTable tbody tr:last-child td').find("select").each(function () {
                $(this).select2();
            });
        });

        //删除一列按钮
        $("#btn-delete-row").on("click", function (event) {
            var $selectedLine = $('#createDataTable tbody').find(".trSelected");
            console.log("$selectedLine", $selectedLine);
            if ($selectedLine.length != 0) {
                var $nextLine = $selectedLine.next();
                if ($nextLine.length != 0) {
                    $selectedLine.remove();
                    $nextLine.addClass("trSelected");
                    if ($nextLine.hasClass('isAdded'))
                        $("#btn-delete-row").show();
                    else
                        $("#btn-delete-row").hide();
                    inner.addSelectedStyle();
                }
                else {
                    var $previousLine = $selectedLine.prev();
                    if ($previousLine.length != 0) {
                        $selectedLine.remove();
                        $previousLine.addClass("trSelected");
                        if ($previousLine.hasClass('isAdded'))
                            $("#btn-delete-row").show();
                        else
                            $("#btn-delete-row").hide();
                        inner.addSelectedStyle();
                    }
                    else {
                        $selectedLine.remove();
                    }
                }
            }
            else {
                Notify.show({
                    title: '请指定要删除的行！',
                    type: 'danger'
                });
            }
        });

        //添加多列按钮
        $("#btn-add-row-multiple").on('click', function () {
            var lineCount = parseInt($("#line-count").val());
            for (var i = 1; i <= lineCount; i++) {
                var j = $('#createDataTable tbody > tr').length + 1;
                rowHtml = generateRow(j, 0, true, true);
                $('#createDataTable tbody').append(rowHtml);
                $(".displayNameChanged").unbind("change", displayNameChanged);
                $(".displayNameChanged").bind("change", displayNameChanged);
                $("select.logicType").unbind("change", logicTypeChanged);
                $("select.logicType").bind("change", logicTypeChanged);
                console.log("i", i);
                $('#createDataTable tbody > tr:nth-child(' + (i) + ') > td:nth-child(1) :input').val(curMaxFieldIndex);
                curMaxFieldIndex++;
                $('#createDataTable tbody tr:last-child td').find("select").each(function () {
                    $(this).select2();
                });
            }
        });
    }

    function colsFill() {
        //console.log("colsFill");
        //$('#nv-dialog-rightbtn').hide();
        var load = loader($('#modal-col-itemlist'));
        //var load = loader($('#modal-col-itemlist'));
        var inputstr = $("#colTextArea").val();
        setTimeout(function () {
            showLoader();
            var colList = inputstr.split(/\s|\r\n/);
            _.each(colList, function (item) {
                if (!_.isEmpty(item)) {
                    i = $('#createDataTable tbody > tr').length + 1;
                    rowHtml = generateRow(i, 0, true, true);
                    $('#createDataTable tbody').append(rowHtml);
                    $('#createDataTable tbody tr:last-child td').find("select").each(function () {
                        $(this).select2();
                    });
                    $('#createDataTable tbody > tr:last-child > td:nth-child(2) :input').val(item)
                }
            });
            $(".displayNameChanged").unbind("change", displayNameChanged);
            $(".displayNameChanged").bind("change", displayNameChanged);
            $("select.logicType").unbind("change", logicTypeChanged);
            $("select.logicType").bind("change", logicTypeChanged);
            load.hide();
            hideLoader();
        }, 500);

        $.magnificPopup.close();
    }

    function saveAndGenerateColsDef() {
        $.magnificPopup.close();
        showLoader();
        var load = loader($('#createdatatype-fromfile-dialog'));
        var columnList = fromfile.saveFromFileSet();
        clearColumnList();
        curMaxFieldIndex = 1;
        ptArray = [];
        statFieldArray = [];
        for (var i = 1; i <= columnList.length; i++) {
            rowHtml = generateRow(i, 0, true, true);
            $('#createDataTable tbody').append(rowHtml);

            $('#createDataTable tbody > tr:nth-child(' + (i) + ') > td:nth-child(1) :input').val(columnList[i - 1].fieldIndex);
            $('#createDataTable tbody > tr:nth-child(' + (i) + ') > td:nth-child(2) :input').val(columnList[i - 1].displayName);
            $('#createDataTable tbody > tr:nth-child(' + (i) + ') > td:nth-child(2) :input')[0].title
                = columnList[i - 1].displayName;
            $('#createDataTable tbody > tr:nth-child(' + (i) + ') > td:nth-child(3) option[value="'
                + columnList[i - 1].fieldType.trim().toLowerCase() + '"]').attr("selected", "true");

            if (columnList[i - 1].fieldType.trim().toLowerCase() == 'date'
                || columnList[i - 1].fieldType.trim().toLowerCase() == 'datetime') {
                $('#createDataTable tbody > tr:nth-child(' + (i) + ') > td:nth-child(4) :input').val(columnList[i - 1].length);
                $('#createDataTable tbody > tr:nth-child(' + (i) + ') > td:nth-child(4) :input').addClass('disabledType')
                $('#createDataTable tbody > tr:nth-child(' + (i) + ') > td:nth-child(5) :input').val(columnList[i - 1].fieldScale);
                $('#createDataTable tbody > tr:nth-child(' + (i) + ') > td:nth-child(5) :input').addClass('disabledType')
            }
            else {
                $('#createDataTable tbody > tr:nth-child(' + (i) + ') > td:nth-child(4) :input').val(columnList[i - 1].length);
                $('#createDataTable tbody > tr:nth-child(' + (i) + ') > td:nth-child(5) :input').val(columnList[i - 1].fieldScale);
            }

            curMaxFieldIndex++;
        }

        $('#createDataTable tbody tr td').find("select").each(function () {
            $(this).select2();
        });
        $(".disabledType").prop("disabled", "disabled");
        $("select.logicType").unbind("change", logicTypeChanged);
        $("select.logicType").bind("change", logicTypeChanged);
        hideLoader();
    }

    function getRootDirId() {
        //console.log("curZoneId", curZoneId);
        for (var nodeIndex in _opts.rootNode.children) {
            if (_opts.rootNode.children[nodeIndex].data.dirType == curZoneId)
                return _opts.rootNode.children[nodeIndex].data.dirId;
        }
    }

    function modifyOprlabelByClass(modifyClass) {
        //oprlabel
        switch (modifyClass) {
            case 4:
                $("#oprInfolabel")[0].innerHTML += "可以修改基本信息，以及字段的显示名称、是否可查、代码表等";
                break;
            case 4:
                $("#oprInfolabel")[0].innerHTML += "可以修改基本信息，后台正在处理数据，结束后可以添加字段";
                break;
            case 2:
                $("#oprInfolabel")[0].innerHTML += "除已有字段不能修改逻辑类型等关键信息外，可以修改全部信息";
                break;
            case 1:
                $("#oprInfolabel")[0].innerHTML += "可以修改全部信息";
                break;
            default:
                break;
        }
        //$("#oprlabel")[0].innerHTML += modifyClass;
    }

    function editDataType(modifyClass) {
        curModifyClass = modifyClass;
        modifyOprlabelByClass(curModifyClass);

        $("#btn-save-as").hide();
        $("#btn-edit-submit").hide();
        $("#btn-edit").show();
        $("#btn-edit").removeClass("btn-danger");
        $("#btn-edit").addClass("btn-primary");
        $("#btn-edit").html("编辑");
        $("#btn-edit-new").hide();
        $("#btn-edit-new").html("编辑为新数据");
        $("#btn-delete-row").hide();
        $("#btn-add-row").hide();
        $("#add-multiple-row").hide();
        //$("#btn-manual-create").removeAttr("disabled");
        $("#btn-fromfile-create").removeAttr("disabled");
        $("#btn-add-folder").removeAttr("disabled");
        $("#btn-move").removeAttr("disabled");
        $("#btn-delete").removeAttr("disabled");
        $("#btn-reload-tree").removeAttr("disabled");
        $("#datapanel").show();
        $('#table-panel-footer').hide();

        $('#table-panel-footer').show();
        //$("#btn-save-as").show();
        $("#btn-edit-submit").show();
        $("#btn-edit-new").hide();
        $("#btn-delete-row").hide();
        $("#btn-add-row").hide();
        $("#add-multiple-row").hide();
        $("#create-data").hide();
        //$("#btn-manual-create").attr("disabled", "disabled");
        $("#btn-fromfile-create").attr("disabled", "disabled");
        $("#btn-add-folder").attr("disabled", "disabled");
        $("#btn-move").attr("disabled", "disabled");
        $("#btn-delete").attr("disabled", "disabled");
        $("#btn-reload-tree").attr("disabled", "disabled");
        $("#btn-edit").removeClass("btn-primary");
        $("#btn-edit").addClass("btn-danger");
        $("#btn-edit").html("放弃更改");
        $("#colFill").hide();

        switch (modifyClass) {
            case 4:
                setReadOnly(3);
                break;
            case 3:
                setReadOnly(4);
                break;
            case 2:
                setReadOnly(2);
                break;
            case 1:
                setReadOnly(1);
                break;
            default:
                setReadOnly(0);
                break;
        }
    }

    //清空所填信息
    function clearColumnList() {
        $('#createDataTable tbody').empty();
    }

    function clearEntireTable() {
        $("#dataname").val("");
        $("#datapath").val("/系统数据");
        //$("#datapath").val("/");
        $("#datapath").attr("dirId", "12");
        document.getElementById('hasattachment').checked = true;
        document.getElementById('isindex').checked = true;
        $("#datadesc").val("");

        clearColumnList();
    }

    function setReadOnly(editState) {
        isEditState = editState;
        clearEntireTable();
        drawNode(selectedNode);
    }

    function setEditable(needReload) {
        isEditState = 1;
        switch (needReload) {
            case "needReload":
                clearEntireTable();
                drawNode(selectedNode);
                break;
            case "noReloadAndAllEdit":
                $(".edit").removeAttr("disabled");
                break;
            case "noReloadAndPartEdit":
                $(".edit").removeAttr("disabled");
                $(".lock-edit").prop("disabled", "disabled");
                break;
        }
    }

    function writedatapath(node) {
        //console.log("writedatapath node", node);
        var dirId;
        if (node.extraClasses == "nv-dir")
            dirId = node.data.dirId;
        else
            dirId = node.parent.data.dirId;

        $.post('/datamanage/dataimport/queryDir', {
            "dirId": dirId,
            "queryType": 0,
        }).done(function (res) {
            var data = JSON.parse(res);
            if (data.code == 0) {
                if (node.data.zoneId == 1)
                    $("#datapath").val(data.data[0].path.slice(8, data.data[0].path.length));
                else if (node.data.zoneId == 2)
                    $("#datapath").val(data.data[0].path.slice(4, data.data[0].path.length));
                else
                    $("#datapath").val(data.data[0].path.slice(4, data.data[0].path.length));
                //$("#datapath").val(data.data[0].path);

                $("#datapath").attr('dirId', dirId);
            }
            else {
                Notify.show({
                    title: '获取目录信息异常！',
                    type: 'danger'
                });
                console.log("dataimport/queryDir", data.message);
            }
        });
    }

    //获取数据类型信息，初始化页面
    function drawNode(node) {
        var t1 = new Date();
        if (node != null && !(node.extraClasses == "nv-dir")) {
            //$('#dataname').val(node.title);
            $("#datapath").attr('dirId', node.data.dirId);
            if (isClone) {
                writedatapath(_opts.rootNode.children[1]);
            }
            else
                writedatapath(node);

            showLoader();
            $.getJSON('/datamanage/dataimport/GetDataTypeDefineInfo', {
                    dataTypeId: node.data.typeId,
                    zoneId: node.data.zoneId,
                    centerCode: node.data.centerCode,
                },
                function (res) {
                    var data = res;
                    if (data.code == 0) {
                        console.log("GetDataTypeDefineInfo", data.data);
                        var datainfo = data.data.datatype;
                        document.getElementById('hasattachment').checked = datainfo.category == 1 ? false : true;
                        //console.log("category", datainfo.category);
                        document.getElementById('isindex').checked = datainfo.udp_flag == 1 ? true : false;
                        var hasAttachment = $("#hasattachment:checked").length;
                        if (hasAttachment == 0) {
                            $("#isindex").removeAttr("disabled");
                        }
                        else if (hasAttachment == 1) {
                            $("#isindex").attr("disabled", "disabled");
                            document.getElementById('isindex').checked = true;
                        }
                        //非结构化
                        if (datainfo.category == 2) {
                            $("#isindex").attr("disabled", "disabled");

                        }
                        $('#dataname').val(datainfo.displayName);
                        columnListData = datainfo.columnList;
                        $('#datadesc').val(datainfo.description);
                        $('#datadesc')[0].title = datainfo.description;
                        $('#username').val(datainfo.userName == null ? '' : datainfo.userName);
                        $('#createtime').val(datainfo.createTime == null ? '' : datainfo.createTime);
                        checkFlag = datainfo.check_flag;
                        metaCharacterFlag = datainfo.meta_character_flag;

                        //fill columnList
                        clearColumnList();
                        curMaxFieldIndex = 1;
                        ptArray = [];
                        statFieldArray = [];

                        var rowHtml = "";
                        for (var i = 1, j = 0; i <= datainfo.columnList.length; i++) {
                            if (datainfo.columnList[i - 1].name == 'RECORD_ID' || datainfo.columnList[i - 1].name == 'LOAD_ID') {
                                ++j;
                                rowHtml += generateRowWithContent(i, j, false, false, datainfo.columnList[i - 1]);
                            }
                            else
                                rowHtml += generateRowWithContent(i, j, true, false, datainfo.columnList[i - 1]);

                            if (datainfo.columnList[i - 1].partitionPolicyInfo.length > 0) {
                                ptArray = ptArray.concat(datainfo.columnList[i - 1].partitionPolicyInfo);
                            }
                            if (datainfo.columnList[i - 1].statTag == 1) {
                                statFieldArray.push(datainfo.columnList[i - 1].fieldIndex);
                            }
                            curMaxFieldIndex++;
                        }

                        $('#createDataTable tbody').append(rowHtml);
                        $(".displayNameChanged").unbind("change", displayNameChanged);
                        $(".displayNameChanged").bind("change", displayNameChanged);
                        $("select.logicType").unbind("change", logicTypeChanged);
                        $("select.logicType").bind("change", logicTypeChanged);


                        var t2 = new Date();
                        for (var i = 1; i <= datainfo.columnList.length; i++) {
                            // $('#createDataTable tbody > tr:nth-child(' + (i) + ') > td:nth-child(1) :input').
                            // val(datainfo.columnList[i - 1].fieldIndex);
                            // $('#createDataTable tbody > tr:nth-child(' + (i) + ') > td:nth-child(2) :input').
                            // val(datainfo.columnList[i - 1].displayName);
                            // $('#createDataTable tbody > tr:nth-child(' + (i) + ') > td:nth-child(2) :input')[0].
                            //     title = datainfo.columnList[i - 1].displayName;

                            // $('#createDataTable tbody > tr:nth-child(' + (i) + ') > td:nth-child(3) option[value="'
                            //     + datainfo.columnList[i - 1].fieldType.trim().toLowerCase() + '"]').attr("selected", "true");
                            // if (datainfo.columnList[i - 1].fieldType.trim().toLowerCase() == 'date'
                            //     || datainfo.columnList[i - 1].fieldType.trim().toLowerCase() == 'datetime') {
                            //     $('#createDataTable tbody > tr:nth-child(' + (i) + ') > td:nth-child(4) :input').val(datainfo.columnList[i - 1].length);
                            //     $('#createDataTable tbody > tr:nth-child(' + (i) + ') > td:nth-child(4) :input').addClass('disabledType')
                            //     $('#createDataTable tbody > tr:nth-child(' + (i) + ') > td:nth-child(5) :input').val(datainfo.columnList[i - 1].fieldScale);
                            //     $('#createDataTable tbody > tr:nth-child(' + (i) + ') > td:nth-child(5) :input').addClass('disabledType')
                            // }
                            // else {
                            //     $('#createDataTable tbody > tr:nth-child(' + (i) + ') > td:nth-child(4) :input').val(datainfo.columnList[i - 1].length);
                            //     $('#createDataTable tbody > tr:nth-child(' + (i) + ') > td:nth-child(5) :input').val(datainfo.columnList[i - 1].fieldScale);
                            // }

                            // var chebox = $('#createDataTable tbody > tr:nth-child(' + ((i)) + ') > td:nth-child(6) :input').attr('id');
                            // document.getElementById(chebox).checked = datainfo.columnList[i - 1].isQuery == 1 ? true : false;

                            $('#createDataTable tbody > tr:nth-child(' + (i) + ') > td:nth-child(6)').checked
                                = datainfo.columnList[i - 1].isQuery == 1 ? true : false;

                            // $('#createDataTable tbody > tr:nth-child(' + (i) + ') > td:nth-child(7) ' +
                            //     'option[tablename="' + datainfo.columnList[i - 1].codeTable.trim().toLowerCase() + '"]').attr("selected", "true");
                            // $('#createDataTable tbody > tr:nth-child(' + (i) + ') > td:nth-child(8) ' +
                            //     'option[value="' + datainfo.columnList[i - 1].col_usage + '"]').attr("selected", "true");

                            // $('#createDataTable tbody > tr:nth-child(' + (i) + ') > td:nth-child(9) :input').
                            // val(datainfo.columnList[i - 1].description);
                            // $('#createDataTable tbody > tr:nth-child(' + (i) + ') > td:nth-child(10) :input').
                            // val(datainfo.columnList[i - 1].name);
                        }
                        var t3 = new Date();
                        console.log("t3", t3 - t2);

                        //0：全部不可编辑；
                        if (isEditState == 0) {
                            $(".edit").prop("disabled", "disabled");
                        }
                        //3.4：部分不可编辑
                        else if (isEditState == 3 || isEditState == 4) {
                            $(".lock-edit").prop("disabled", "disabled");
                        }
                        //2：可部分编辑
                        else if (isEditState == 2) {
                            $(".lock-edit").prop("disabled", "disabled");
                            $("#datapanel").show();
                            $("#colFill").show();
                            $('#table-panel-footer').show();
                            //$("#btn-delete-row").show();
                            $("#btn-add-row").show();
                            $("#add-multiple-row").show();
                        }
                        //1：全部可以编辑；
                        else if (isEditState == 1) {
                            $("#datapanel").show();
                            $("#colFill").show();
                            $('#table-panel-footer').show();
                            //$("#btn-edit").hide();
                            $("#btn-delete-row").show();
                            $("#btn-add-row").show();
                            $("#add-multiple-row").show();
                        }

                        $('#createDataTable tbody tr td').find("select").each(function () {
                            $(this).select2();
                        });

                        $(".disabledType").prop("disabled", "disabled");
                        initAdvancedParams();
                        if (isClone) {
                            curZoneId = 2;
                            renderPage("3-2");
                        }

                        var t4 = new Date();
                        console.log("t4", t4 - t1);
                        hideLoader();
                    }
                    else {
                        hideLoader();
                        Notify.show({
                            title: '获取数据类型信息失败！',
                            type: 'danger'
                        });
                        console.log("/dataimport/GetDataTypeDefineInfo", data.message);
                    }
                });
        }
    }

    //检查分区策略设置的合法性
    function checkPolicy(policy) {
        if (policy.func_id == 3 || policy.func_id == 4 || policy.func_id == 5) {
            for (var i in colInfoList) {
                if (colInfoList[i].fieldIndex == policy.field_index &&
                    colInfoList[i].fieldType != 'date' && colInfoList[i].fieldType != 'datetime') {
                    Notify.show({
                        title: '字段【' + colInfoList[i].displayName + '】不是日期、日期时间类型！',
                        type: 'error'
                    });
                    return false;
                }
            }
            //_.each(colInfoList, function (item) {
            //    if (item.fieldIndex == policy.field_index && (item.fieldType != 'date' || item.fieldType != 'datetime'))
            //        return false;
            //});
        }
        return true;
    }

    function initAdvancedParams() {
        ptResultArray = [];
        statFieldResultArray = [];
        for (var index in ptArray) {
            var policy = ptArray[index];
            if (ptResultArray[policy.field_index] == undefined) {
                ptResultArray[policy.field_index] = new Array();
                ptResultArray[policy.field_index].push(policy);
            }
            else {
                ptResultArray[policy.field_index].push(policy);
                Notify.show({
                    title: '字段【' + policy.displayName + '】被重复设置了分区策略！',
                    type: 'warn'
                });
            }
        }
        for (var index in statFieldArray) {
            statFieldResultArray[statFieldArray[index]] = statFieldArray[index];
        }
    }

    //检查并保存高级设置
    function checkAndSaveAdvancedSet() {
        var rows = $('#partition-policy-table tbody > tr').length;
        ptResultArray = new Array();
        ptArray = [];
        for (i = 1; i <= rows; i++) {
            policy = advancedset.getPolicy(i, selectedNode.data.typeId);
            //console.log("displayName", policy.displayName);
            if (policy) {
                if (!checkPolicy(policy)) {
                    return;
                }
                if (ptResultArray[policy.field_index] == undefined) {
                    ptResultArray[policy.field_index] = new Array();
                    ptResultArray[policy.field_index].push(policy);
                    ptArray.push(policy);
                }
                else {
                    ptResultArray[policy.field_index].push(policy);
                    ptArray.push(policy);
                    Notify.show({
                        title: '字段【' + policy.displayName + '】被重复设置了分区策略！',
                        type: 'error'
                    });
                    return;
                }
            }
        }
        curCenterCode = $('#center-select')[0].value;
        statFieldResultArray = new Array();
        seniorSearchArray = new Array();
        statFieldArray = [];
        statFieldResultArray[parseInt($("#business-field-select")[0].value)] = true;
        statFieldArray.push($("#business-field-select")[0].value);
        seniorSearchArray[parseInt($("#index-partition-field")[0].value)] = 35;
        seniorSearchArray[parseInt($("#index-id-field")[0].value)] = 30;
        console.log("checkAndSavePolicys", ptResultArray);
        console.log("center", curCenterCode);
        console.log("business", statFieldResultArray);

        if ($('#fieldTypeCheck')[0].checked) {
            checkFlag = 1;
        }
        else {
            checkFlag = 0;
        }
        if ($('#metaCheck')[0].checked) {
            metaCharacterFlag = 1;
        }
        else {
            metaCharacterFlag = 0;
        }
        $.magnificPopup.close();
    }

    //进行高级设置前，获取所有字段的基本信息
    function getAllColsBasicInfo() {
        var rows = $('#createDataTable tbody > tr').length;
        var colInfoList = [];
        clearBeforeGetColsInfo();
        for (var i = 1; i <= rows; i++) {
            var tr = $('#createDataTable tbody > tr:nth-child(' + i + ')');
            var colName = $('#createDataTable tbody > tr:nth-child(' + i + ') > td:nth-child(2) :input').val().trim();
            if (tr[0].classList.contains('hide') && (colName == '导入批次' || colName == '记录标识')) {
                continue;
            }
            var colInfo = getColBasicInfo(i);
            if (colInfo) {
                colInfoList.push(colInfo);
            }
            else {
                return [];
            }
        }
        return colInfoList;
    }

    //获取字段基本信息
    function getColBasicInfo(i) {
        colName = $('#createDataTable tbody > tr:nth-child(' + i + ') > td:nth-child(2) :input').val().trim();
        if (_.isEmpty(colName)) {
            Notify.show({
                title: '字段名不能为空！',
                type: 'danger'
            });
            hideLoader();
            return null;
        }
        if (colsDisplayNameArrays.indexOf(colName) > -1) {
            Notify.show({
                title: '字段名[' + colName + ']被重复使用！',
                type: 'danger'
            });
            hideLoader();
            return null;
        }
        else if (colName == '导入批次' || colName == '记录标识') {
            Notify.show({
                title: "[" + colName + "]为内置字段名称，请勿使用！",
                type: "error"
            });
            hideLoader();
            return null;
        }
        else {
            colsDisplayNameArrays.push(colName);
        }

        colLogicType = $('#createDataTable tbody > tr:nth-child(' + i + ') > td:nth-child(3) :selected').val();

        col = {
            displayIndex: i,
            displayName: colName,
            fieldIndex: $('#createDataTable tbody > tr:nth-child(' + i + ') > td:nth-child(1) :input').val(),
            fieldType: colLogicType,
            colUsage: $('#createDataTable tbody > tr:nth-child(' + i + ') > td:nth-child(8) :selected').val() //.attr('valueField') || ""
            //name: (columnListData[i - 1] == undefined) ? "" : (columnListData[i - 1].name)
        }
        return col;
    }

    //刷新数据类型树,展开根节点
    function reloadTree() {
        $('#data-treeview').fancytree("getTree").reload();
        var expandRootNode = setInterval(function () {
            rootNode = $('#data-treeview').fancytree("getTree").getNodeByKey("dir12");
            if (rootNode) {
                rootNode.setExpanded(true);
                window.clearInterval(expandRootNode);
            }
        }, 100);
    }

    //生成逻辑类型html
    function generateLogicTypeHtml() {
        var logicTypeHtml = ('<select class="select2-white form-control edit lock-edit logicType">');
        _.each(logicTypeData, function (item) {
            logicTypeHtml += ('<option value="' + item.logictype + '">' + item.displayname + '</option>');
        });
        logicTypeHtml += '</select>';
        return logicTypeHtml;
    }

    //生成逻辑类型html
    function generateLogicTypeHtmlWithContent(columnInfo) {
        var logicTypeHtml = ('<select class="select2-white form-control edit lock-edit logicType">');
        _.each(logicTypeData, function (item) {
            if (item.logictype == columnInfo.fieldType.trim().toLowerCase())
                logicTypeHtml += ('<option value="' + item.logictype + '" selected>' + item.displayname + '</option>');
            else
                logicTypeHtml += ('<option value="' + item.logictype + '">' + item.displayname + '</option>');
        });
        logicTypeHtml += '</select>';
        return logicTypeHtml;
    }

    //生成代码表html
    function generateCodeTableHtml() {
        var codeTableHtml = ('<select class="select2-white form-control edit">');
        codeTableHtml += '<option></option>';
        _.each(codeTableData, function (item) {
            codeTableHtml += ('<option codeField="' + item.codeField + '" tableName="' + item.tableName.trim().toLowerCase()
            + '" valueField="' + item.valueField + '">' + item.tableCaption + '</option>');
        });
        codeTableHtml += '</select>';
        return codeTableHtml;
    }

    //生成代码表html
    function generateCodeTableWithContent(columnInfo) {
        var codeTableHtml = ('<select class="select2-white form-control edit">');
        codeTableHtml += '<option></option>';
        _.each(codeTableData, function (item) {
            if (item.tableName.trim().toLowerCase() == columnInfo.codeTable.trim().toLowerCase())
                codeTableHtml += ('<option codeField="' + item.codeField + '" tableName="' + item.tableName.trim().toLowerCase()
                + '" valueField="' + item.valueField + '" selected>' + item.tableCaption + '</option>');
            else
                codeTableHtml += ('<option codeField="' + item.codeField + '" tableName="' + item.tableName.trim().toLowerCase()
                + '" valueField="' + item.valueField + '">' + item.tableCaption + '</option>');

        });
        codeTableHtml += '</select>';
        return codeTableHtml;
    }

    //生成高级检索项html
    function generateSeniorSearchHtml() {
        var seniorSearchHtml = ('<select class="select2-white form-control edit lock-edit">');
        seniorSearchHtml += '<option></option>';
        _.each(seniorSearchData, function (item) {
            seniorSearchHtml += ('<option value="' + item.semanticID + '">' + item.semanticDisplayName + '</option>');
        });
        seniorSearchHtml += '</select>';
        return seniorSearchHtml;
    }

    //生成高级检索项html
    function generateSeniorSearchHtmlWithContent(columnInfo) {
        var seniorSearchHtml = ('<select class="select2-white form-control edit lock-edit">');
        seniorSearchHtml += '<option></option>';
        _.each(seniorSearchData, function (item) {
            if (item.semanticID == columnInfo.col_usage)
                seniorSearchHtml += ('<option value="' + item.semanticID + '" selected>' + item.semanticDisplayName + '</option>');
            else
                seniorSearchHtml += ('<option value="' + item.semanticID + '">' + item.semanticDisplayName + '</option>');
        });
        seniorSearchHtml += '</select>';
        return seniorSearchHtml;
    }

    //生成添加字段模板
    function generateRowWithContent(i, j, isvisible, isAdded, columnInfo) {
        var checkbox = util.generateRandomId(10);
        var rowHtml = '';
        if (isvisible) {
            if (isAdded)
                rowHtml = '<tr class="isAdded">'
            else
                rowHtml = '<tr>'
        }
        else
            rowHtml = '<tr class="hide">'

        if (columnInfo.fieldType.trim().toLowerCase() == 'date' || columnInfo.fieldType.trim().toLowerCase() == 'datetime') {
            rowHtml +=
                '<td class="hide" style="text-align:center"><input type="text" class="form-control edit" style="border:0px" value="' + columnInfo.fieldIndex + '">' + '</td>' + // + (i - j)
                '<td><input type="text" class="form-control edit displayNameChanged" style="border:0px" title="' + columnInfo.displayName + '" ' + 'value="' + columnInfo.displayName + '"></td>' +
                '<td>' + generateLogicTypeHtmlWithContent(columnInfo) + '</td>' +
                '<td>' + '<input type="text" class="form-control edit lock-edit disabledType" name="spinner" value="' + columnInfo.length + '" style="border:0px !important">' + '</td>' +
                '<td>' + '<input type="text" class="form-control edit lock-edit disabledType" style="border:0px" value="' + columnInfo.fieldScale + '">' + '</td>' +
                '<td>' +
                '    <div class="checkbox-custom checkbox-primary increasing-box-div-style mtn20" style="color:#1e2028">' +
                '        <input type="checkbox" class="edit" checked="true" name="' + checkbox + '" id="' + checkbox + '" style="width:18px;height:18px">' +
                '        <label for="' + checkbox + '"></label>' +
                '    </div>' +
                '</td>' +
                '<td>' + generateCodeTableWithContent(columnInfo) + '</td>' +
                '<td class="seniorSearch" >' + generateSeniorSearchHtmlWithContent(columnInfo) + '</td>' +
                '<td><input type="text" class="form-control edit" style="border:0px" value="' + columnInfo.description + '"></td>' +
                '<td><input type="text" class="form-control edit hide" style="border:0px"  value="' + columnInfo.name + '"></td>' +
                '</tr>';
        }
        else {
            rowHtml +=
                '<td class="hide" style="text-align:center"><input type="text" class="form-control edit" style="border:0px" value="' + columnInfo.fieldIndex + '">' + '</td>' + // + (i - j)
                '<td><input type="text" class="form-control edit displayNameChanged" style="border:0px" title="' + columnInfo.displayName + '" ' + 'value="' + columnInfo.displayName + '"></td>' +
                '<td>' + generateLogicTypeHtmlWithContent(columnInfo) + '</td>' +
                '<td>' + '<input type="text" class="form-control edit lock-edit" name="spinner" value="' + columnInfo.length + '" style="border:0px !important">' + '</td>' +
                '<td>' + '<input type="text" class="form-control edit lock-edit" style="border:0px" value="' + columnInfo.fieldScale + '">' + '</td>' +
                '<td>' +
                '    <div class="checkbox-custom checkbox-primary increasing-box-div-style mtn20" style="color:#1e2028">' +
                '        <input type="checkbox" class="edit" checked="true" name="' + checkbox + '" id="' + checkbox + '" style="width:18px;height:18px">' +
                '        <label for="' + checkbox + '"></label>' +
                '    </div>' +
                '</td>' +
                '<td>' + generateCodeTableWithContent(columnInfo) + '</td>' +
                '<td class="seniorSearch" >' + generateSeniorSearchHtmlWithContent(columnInfo) + '</td>' +
                '<td><input type="text" class="form-control edit" style="border:0px" value="' + columnInfo.description + '"></td>' +
                '<td><input type="text" class="form-control edit hide" style="border:0px"  value="' + columnInfo.name + '"></td>' +
                '</tr>';
        }

        return rowHtml;
    }

    //生成添加字段模板
    function generateRow(i, j, isvisible, isAdded) {
        var checkbox = util.generateRandomId(10);
        var rowHtml = '';
        if (isvisible) {
            if (isAdded)
                rowHtml = '<tr class="isAdded">'
            else
                rowHtml = '<tr>'
        }
        else
            rowHtml = '<tr class="hide">'

        rowHtml += // class="hide"
            '<td class="hide" style="text-align:center"><input type="text" class="form-control edit " style="border:0px" placeholder="">' + '</td>' + // + (i - j)
            '<td><input type="text" class="form-control edit displayNameChanged" style="border:0px" placeholder=""></td>' +
            '<td>' + generateLogicTypeHtml() + '</td>' +
            '<td>' + '<input type="text" class="form-control edit lock-edit" name="spinner" value="255" style="border:0px !important">' + '</td>' +
            '<td>' + '<input type="text" class="form-control edit lock-edit" style="border:0px" placeholder="">' + '</td>' +
            '<td>' +
            '    <div class="checkbox-custom checkbox-primary increasing-box-div-style mtn20" style="color:#1e2028">' +
            '        <input type="checkbox" class="edit" checked="true" name="' + checkbox + '" id="' + checkbox
            + '" style="width:18px;height:18px">' +
            '        <label for="' + checkbox + '"></label>' +
            '    </div>' +
            '</td>' +
            '<td>' + generateCodeTableHtml() + '</td>' +
            '<td class="seniorSearch" >' + generateSeniorSearchHtml() + '</td>' +
            '<td><input type="text" class="form-control edit" style="border:0px" placeholder=""></td>' +
            '<td><input type="text" class="form-control edit hide" style="border:0px"  placeholder=""></td>' +
            '</tr>';

        return rowHtml;
    }

    function displayNameChanged(event) {
        //console.log("displayNameChanged", event);
        var curTr = event.currentTarget.parentElement.parentElement;
        //curTr.children[9].children[0].value = "";
        //console.log("displayNameChanged", curTr);
        if (event.currentTarget.value == '导入批次' || event.currentTarget.value == '记录标识') {
            Notify.show({
                title: "[" + event.currentTarget.value + "]为内置字段名称，请勿使用！",
                type: "error"
            });
            curTr.children[2].children[0].value = "";
            curTr.children[2].children[0].title = "";
        }
        else {
            curTr.children[2].children[0].title = event.currentTarget.value;
        }
    }

    function logicTypeChanged(event) {
        var curTr = event.currentTarget.parentElement.parentElement;
        var logicType = curTr.children[2].children[0].value;
        //console.log("logicType", logicType);
        var classList3 = curTr.children[3].children[0].classList;
        var classList4 = curTr.children[4].children[0].classList;
        //console.log("classList3", classList3);
        //console.log("classList4", classList4);
        $(".disabledType").removeAttr("disabled");
        switch (logicType) {
            case 'decimal':
                curTr.children[3].children[0].value = "20";
                curTr.children[4].children[0].value = "0";
                classList3.remove("disabledType");
                classList4.remove("disabledType");
                break;
            case 'string':
                curTr.children[3].children[0].value = "255";
                curTr.children[4].children[0].value = "0";
                classList3.remove("disabledType");
                classList4.remove("disabledType");
                break;
            case 'decimalip':
                curTr.children[3].children[0].value = "20";
                curTr.children[4].children[0].value = "0";
                classList3.remove("disabledType");
                classList4.remove("disabledType");
                break;
            default :
                curTr.children[3].children[0].value = "0";
                curTr.children[4].children[0].value = "0";
                classList3.add("disabledType");
                classList4.add('disabledType');
                break;
        }

        curTr.children[3].children[0].classList = classList3;
        curTr.children[4].children[0].classList = classList4;
        $(".disabledType").prop("disabled", "disabled");
    }

    function getPtInfos(fieldIndex, name) {
        var ptInfo = new Array();
        if (ptResultArray[fieldIndex] != undefined) {
            if (name.length <= 0) {
                ptInfo = ptResultArray[fieldIndex];
            }
            else {
                for (var i in ptResultArray[fieldIndex]) {
                    ptResultArray[fieldIndex][i].field_name = name;
                    if (i > 0) {
                        ptResultArray[fieldIndex][i].part_name = "P_" + name + "_" + i;
                        ptResultArray[fieldIndex][i].as_realcol_name = "FAKE_" + name + "_" + i;
                    }
                    else {
                        ptResultArray[fieldIndex][i].part_name = "P_" + name;
                        ptResultArray[fieldIndex][i].as_realcol_name = "FAKE_" + name;
                    }
                }
                ptInfo = ptResultArray[fieldIndex];
            }
        }
        return ptInfo;
    }

    //获取字段信息
    function getColumn(i, isModifyMode) {
        var tr = $('#createDataTable tbody > tr:nth-child(' + i + ')');
        //console.log("tr", tr);
        var fieldIndex = $('#createDataTable tbody > tr:nth-child(' + i + ') > td:nth-child(1) :input').val().trim();
        var colDBName = $('#createDataTable tbody > tr:nth-child(' + i + ') > td:nth-child(10) :input').val();
        //console.log("colDBName1", colDBName);
        var ptTag = 0;
        var statTag = 0;
        var ptInfo = getPtInfos(fieldIndex, colDBName);
        if (ptInfo.length > 0)
            ptTag = 1;
        if (statFieldResultArray[fieldIndex] != undefined && statFieldResultArray[fieldIndex])
            statTag = 1;

        colLogicType = $('#createDataTable tbody > tr:nth-child(' + i + ') > td:nth-child(3) :selected').val();
        colLength = $('#createDataTable tbody > tr:nth-child(' + i + ') > td:nth-child(4) :input').val();

        var colSearchItem = "";
        //if (document.getElementById('isindex').checked)
        {
            colSearchItem = $('#createDataTable tbody > tr:nth-child(' + i + ') > td:nth-child(8) :input').val() || "";
            if (colSearchItem == 30) {
                udpFileIdNum++;
                if (udpFileIdNum > 1) {
                    Notify.show({
                        title: '【索引唯一标识字段名称】只能设置一次！',
                        type: 'danger'
                    });
                    tr.addClass('trError');
                    tr.addClass('danger');
                    hideLoader();
                    return null;
                }
            }
            if (colSearchItem == 35) {
                udpFileTimeNum++;
                if (udpFileTimeNum > 1) {
                    Notify.show({
                        title: '【索引分库字段名称】只能设置一次！',
                        type: 'danger'
                    });
                    tr.addClass('trError');
                    tr.addClass('danger');
                    hideLoader();
                    return null;
                }
                else {
                    if (colLogicType != "date" && colLogicType != "datetime") {
                        Notify.show({
                            title: '【索引分库字段名称】只能对日期或日期时间类型的字段设置！',
                            type: 'danger'
                        });
                        tr.addClass('trError');
                        tr.addClass('danger');
                        hideLoader();
                        return null;
                    }
                }
            }
            //if (seniorSearchArray[fieldIndex] != undefined
            //    && seniorSearchArray[fieldIndex])
            //    colSearchItem = seniorSearchArray[fieldIndex];
            //else {
            //    colSearchItem = $('#createDataTable tbody > tr:nth-child(' + i + ') > td:nth-child(8) :input').val() || "";
            //}
        }

        var colName = $('#createDataTable tbody > tr:nth-child(' + i + ') > td:nth-child(2) :input').val().trim();
        if (_.isEmpty(colName)) {
            Notify.show({
                title: '字段名不能为空！',
                type: 'danger'
            });
            //tr[0].classList.add('errorRow');
            tr.addClass('trError');
            tr.addClass('danger');
            hideLoader();
            return null;
        }
        if (!tr[0].classList.contains('hide') && (colName == '导入批次' || colName == '记录标识')) {
            Notify.show({
                title: '字段名[' + colName + ']不能使用！',
                type: 'danger'
            });
            //tr[0].classList.add('errorRow');
            tr.addClass('trError');
            tr.addClass('danger');
            hideLoader();
            return null;
        }
        if (colsDisplayNameArrays.indexOf(colName) > -1) {
            Notify.show({
                title: '字段名[' + colName + ']被重复使用！',
                type: 'danger'
            });
            //tr[0].classList.add('errorRow');
            tr.addClass('trError');
            tr.addClass('danger');
            hideLoader();
            return null;
        }
        else {
            colsDisplayNameArrays.push(colName);
        }

        if (!numRegx.test(colLength)) {
            Notify.show({
                title: '字段长度为非法值！',
                type: 'danger'
            });
            //tr[0].classList.add('errorRow');
            tr.addClass('trError');
            tr.addClass('danger');
            hideLoader();
            return null;
        }
        colScale = $('#createDataTable tbody > tr:nth-child(' + i + ') > td:nth-child(5) :input').val() || 0;
        if (!numRegx.test(colScale)) {
            Notify.show({
                title: '字段精度为非法值！',
                type: 'danger'
            });
            //tr[0].classList.add('errorRow');
            tr.addClass('trError');
            tr.addClass('danger');
            hideLoader();
            return null;
        }
        if (colLogicType == "string" || colLogicType == "decimal") {
            if (_.isEmpty(colLength)) {
                Notify.show({
                    title: '字段类型为字符串或数值时，长度不能为空！',
                    type: 'danger'
                });
                //tr[0].classList.add('errorRow');
                tr.addClass('trError');
                tr.addClass('danger');
                hideLoader();
                return null;
            }
        }
        if (colLogicType == "decimal" && (_toInt(colLength) <= 0 || _toInt(colLength) > 38)) {
            Notify.show({
                title: '字段长度值超出范围，最大38！',
                type: 'danger'
            });
            //tr[0].classList.add('errorRow');
            tr.addClass('trError');
            tr.addClass('danger');
            //inner.addErrorStyle();
            hideLoader();
            return null;
        }
        if (colLogicType == "decimal" && _toInt(colScale) > _toInt(colLength)) {
            Notify.show({
                title: '字段精度不能超过长度！',
                type: 'danger'
            });
            //tr[0].classList.add('errorRow');
            tr.addClass('trError');
            tr.addClass('danger');
            hideLoader();
            return null;
        }

        colQueryable = $('#createDataTable tbody > tr:nth-child(' + i + ') > td:nth-child(6) :checked').length;
        codeField = $('#createDataTable tbody > tr:nth-child(' + i + ') > td:nth-child(7) :selected').attr('codeField') || "";
        codeTableName = $('#createDataTable tbody > tr:nth-child(' + i + ') > td:nth-child(7) :selected').attr('tableName') || "";
        codeValueField = $('#createDataTable tbody > tr:nth-child(' + i + ') > td:nth-child(7) :selected').attr('valueField') || "";
        //if (colSearchItem) {
        //    udpFlag = 1;
        //}
        colDesc = $('#createDataTable tbody > tr:nth-child(' + i + ') > td:nth-child(9) :input').val();

        var colVisible = 1;
        if (tr[0].classList.contains('hide')) {
            colVisible = 0;
            //Notify.show({
            //    title: colVisible,
            //    type: 'danger'
            //});
        }

        //console.log("colDBName2", colDBName);
        if (!isModifyMode) {
            col = {
                centerCode: curCenterCode,
                codeDisNameField: codeValueField,
                codeField: codeField,
                codeTable: codeTableName,
                codeTag: _.isEmpty(codeField) ? 0 : 1,
                col_usage: colSearchItem,
                dataTypeID: -1,
                description: colDesc,
                displayIndex: i,
                displayName: colName,
                fieldIndex: fieldIndex,
                fieldScale: colScale,
                fieldType: colLogicType,
                isQuery: colQueryable,
                isVisible: colVisible,
                length: colLength,
                name: colDBName,
                pt_tag: ptTag,
                partitionPolicyInfo: ptInfo,
                statTag: statTag
            }
        }
        else {
            col = {
                centerCode: curCenterCode,
                codeDisNameField: codeValueField,
                codeField: codeField,
                codeTable: codeTableName,
                codeTag: _.isEmpty(codeField) ? 0 : 1,
                col_usage: colSearchItem,
                dataTypeID: (columnListData[i - 1] == undefined) ? -1 : (columnListData[i - 1].dataTypeID),
                description: colDesc,
                displayIndex: i,
                displayName: colName,
                fieldIndex: fieldIndex,
                fieldScale: colScale,
                fieldType: colLogicType,
                isQuery: colQueryable,
                isVisible: colVisible,
                length: colLength,
                name: colDBName,
                pt_tag: ptTag,
                partitionPolicyInfo: ptInfo,
                statTag: statTag
            }
        }
        return col;
    }

    function _toInt(s) {
        var v = parseInt(s);
        if (isNaN(v)) {
            return 0;
        }
        return v;
    }

    function clearBeforeGetColsInfo() {
        colsDisplayNameArrays = [];
        udpFileIdNum = 0;
        udpFileTimeNum = 0;
    }

    return {
        init: init,
        renderDatatypemanageInfo: renderDatatypemanageInfo,
    };

});