/**
 * Created by root on 5/24/16.
 */
define('./dataimport', [
    '../../tpl/tpl-dataimport',
    'nova-notify', 'nova-dialog', 'nova-bootbox-dialog',
    '../dm/dataimport/dm-basicsetup',
    '../dm/dataimport/dm-preview',
    '../dm/dataimport/dm-fileimport',
    '../dm/dataimport/dm-setparams',
    '../dm/dataimport/dm-getparams',
    '../dm/dataimport/dm-preview-util',
    // '../../../../../config.js',
    '../dm/dataimport/dm-bootstrap-treeview',
], function (dataimportTpl, Notify, Dialog, bootbox, basicSetup, preView,
             FileUtil, setparams, getparams, prviewUtil) {
    var appConfig = window.__CONF__.framework;
    var _opts;
    var selectedNode;
    var curColIndex = -1;
    var hasSetAll = false;
    var UDPfilepath = '';

    //导航每步跳转，触发的事件
    var stepNow = "#step1";
    var stepNext;

    dataimportTpl = _.template(dataimportTpl);

    function init(opts) {
        _opts = opts;
    }

    function renderDataimportInfo(info, modelId, batchId) {
        if (_.isUndefined(info.data.typeId)) {
            $(_opts.container).empty();
            return;
        }

        selectedNode = info;
        $(_opts.container).empty().append(dataimportTpl(info));

        dynamicLoading.css("/datamanage/css/dataimport/bootplus.css");
        dynamicLoading.css("/datamanage/css/dataimport/dataimport.css");
        FileUtil.clearFileInfo();
        preView.initRefresh();
        basicSetup.initRefresh();

        stepNow = "#step1";
        initParams();
        bindEvent();

        preView.setCopyOrModelInfo(modelId, batchId);

        if (batchId != undefined && batchId > 0) {
            basicSetup.setDataTypeInfo(info.data, true);
        }
        else {
            basicSetup.setDataTypeInfo(info.data, false);
        }
    }

    var dynamicLoading = {
        css: function (path) {
            if (!path || path.length === 0) {
                throw new Error('argument "path" is required !');
            }
            var head = document.getElementsByTagName('head')[0];
            var link = document.createElement('link');
            link.href = path;
            link.rel = 'stylesheet';
            link.type = 'text/css';
            head.appendChild(link);
        },
        js: function (path) {
            if (!path || path.length === 0) {
                throw new Error('argument "path" is required !');
            }
            var head = document.getElementsByTagName('head')[0];
            var script = document.createElement('script');
            script.src = path;
            script.type = 'text/javascript';
            head.appendChild(script);
        }
    }

    function initParams() {
        var uploadFilePath = appConfig['uploadFilePath'];
        console.log("uploadFilePath", uploadFilePath);
        var fileRootPath = "hdfs://" + uploadFilePath + "/data/personaldata/";
        var udpFileRootPath = "hdfs://" + uploadFilePath + "/data/udp_upload/";
        preView.setFileRootPath(fileRootPath);
        basicSetup.setFileRootPath(fileRootPath);
        UDPfilepath = udpFileRootPath;
        preView.setUDPFileRootPath(udpFileRootPath);
    }

    function bindEvent() {
        // //读取管理库，获取文件上传至HDFS的根目录信息
        // $.getJSON("/dataimport/GetSystemConfig?key=uploadFilePath", function (rsp) {
        //     if (rsp.code == 0) {
        //         console.log(" uploadFilePath:" + rsp.data);
        //         var uploadFilePath = rsp.data.SystemConfingInfo.value;
        //         var fileRootPath = "hdfs://" + uploadFilePath + "/data/personaldata/";
        //         var udpFileRootPath = "hdfs://" + uploadFilePath + "/data/udp_upload/";
        //         preView.setFileRootPath(fileRootPath);
        //         basicSetup.setFileRootPath(fileRootPath);
        //         UDPfilepath = udpFileRootPath;
        //         preView.setUDPFileRootPath(udpFileRootPath);
        //         //preView.setFileRootPath(rsp.data.SystemConfingInfo.value);
        //         //basicSetup.setFileRootPath(rsp.data.SystemConfingInfo.value);
        //         //preView.setUDPFileRootPath(rsp.data.SystemConfingInfo.value);
        //     }
        //     else {
        //         console.log(rsp.message);
        //     }
        // });

        //预处理预览结果表格，单击一个表格单元触发的事件
        $("#preView-Table").delegate("td", "click", function () {
            curColIndex = $(this).parent().children('td').index($(this));

            $("#preView-Table tbody tr td").removeClass("preViewColSelected");
            var td;
            var tableRows = $("#preView-Table tbody tr");
            for (var i = 0; i < tableRows.length; ++i) {
                if ($("#preView-Table")[0].rows[i].cells.length > 0 && $("#preView-Table")[0].rows[i].cells[curColIndex] != null) {
                    td = $("#preView-Table")[0].rows[i].cells[curColIndex].classList;
                    td.add('preViewColSelected');
                    td.remove('settedPreRules');
                    td.remove('newAddCol');
                }
            }
            if (tableRows.length > 0) {
                if ($("#preView-Table")[0].rows[0].cells[curColIndex] != undefined)
                    $("#selectedFieldName").html($("#preView-Table")[0].rows[0].cells[curColIndex].innerHTML);
                else
                    $("#selectedFieldName").html("");

                var colIndex = preView.saveSelectedRulesForCurCol();
                if (colIndex >= 0 && colIndex != curColIndex) {
                    for (var i = 0; i < tableRows.length; ++i) {
                        td = $("#preView-Table")[0].rows[i].cells[colIndex].classList;
                        td.add('settedPreRules');
                    }
                }
                var colIndex = preView.checkCurColIsNewAdd();
                if (colIndex >= 0 && colIndex != curColIndex) {
                    for (var i = 0; i < tableRows.length; ++i) {
                        td = $("#preView-Table")[0].rows[i].cells[colIndex].classList;
                        td.add('newAddCol');
                    }
                }
                preView.setSelectedRulesForCurCol(curColIndex);
            }
            else {
                $("#selectedFieldName").value = "";
            }
        });

        //预处理规则生效条件表格，单击一列触发的事件
        $("#conditionsTable").delegate("tr", "click", function () {
            var curRowIndex = $(this).parent().children('tr').index($(this));
            if (curRowIndex > 0) {
                //$("#conditionsTable tbody tr td").removeClass("conditonSelected");
                for (var i = 0; i < $("#conditionsTable")[0].rows.length; ++i) {
                    $("#conditionsTable")[0].rows[i].classList.remove('conditonSelected');
                }
                var tr = $("#conditionsTable")[0].rows[curRowIndex].classList;
                tr.add('conditonSelected');
            }
            preView.updateCurRowOfCondition(curRowIndex);
        });

        //上传文件按钮
        $("#upload-file").click(function () {
            var path = basicSetup.getFileRootPath();
            var ipExp = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
            var ipStr = ipExp.exec(path);
            var isUDP = false;
            var accept = '.txt,.bcp';
            if ($('#taskType-Select').val() == 4) {
                isUDP = true;
                ipStr = ipExp.exec(UDPfilepath);
                accept = '';
            }
            //console.log(ipStr);

            var fileType = getparams.getFileType();
            var isaddexcel = false;
            if (fileType == 'excel') {
                isaddexcel = true;
                accept = '.xls, .xlsx';
            }
            var opts = {
                ip: ipStr,
                isUDP: isUDP,
                isAddExcel: isaddexcel,
                UDPfilepath: UDPfilepath,
                fileEncoding: getparams.getfileEncoding(),
                rowSplit: getparams.getRowSplitFor16(),
                accept: accept
            };
            FileUtil.uploadFile(opts);
        });

        $(".step").click(function (event) {
            event.preventDefault();
            //console.log("$(this)", $(this));
            stepNext = $(this).attr("href");
            //console.log('stepNow1', stepNow);
            //console.log('stepNext1', stepNext);
            if (validateForm(stepNow, stepNext)) {
                stepNow = $(this).attr("href");
                //此时stepNext和stepNow一样
                //console.log('stepNow2', stepNow);
                //console.log('stepNext2', stepNext);
                $(".stepDetails").hide();
                $(stepNow).css("visibility", "visible").show();
                //$(_step).show();
                $("#back-Button").hide();

                if (stepNext != "#step1") {
                    $("#back-Button").css("visibility", "visible").show();
                }

                if (stepNext == "#step3") {
                    preView.setPreViewTable();
                    preView.initRulsTree();
                    //preView.preView();
                    //alert("hello");
                }
                if (stepNext == "#step4") {
                    //console.log('preView.preView(true);');
                    preView.preView(true);
                    //if(!basicSetup.getIsFirstRowHead()){
                    //    $("#smartMappingBtn").hide();
                    //}
                    //else{
                    //    $("#smartMappingBtn").show();
                    //}
                }
                if (stepNext != "#step5") {
                    $("#next-Button").show();
                    $("#submit-Button").hide();
                    $("#submit-lable").hide();
                }
                else {
                    $("#next-Button").hide();
                    $("#submit-Button").css("visibility", "visible").show();
                }
                $(".step").parent().removeClass("active");
                $(this).parent().addClass("active");
            }
        });

        //单击导航页面中的下一页
        $("#next-Button").click(function () {
            if ($('#taskType-Select').val() == 4 || $('#taskType-Select').val() == 5) {
                $("#step5_href").click();
            } else {
                $("ul.nav-pills li.active").next().find("a").click();
            }
        });

        //单击导航页面中的上一页，返回按钮
        $("#back-Button").click(function () {
            if ($('#taskType-Select').val() == 4 || $('#taskType-Select').val() == 5) {
                $("#step1_href").click();
            } else {
                $("ul.nav-pills li.active").prev().find("a").click();
            }
        });

        //单击创建任务按钮，触发该事件
        $("#submit-Button").click(function (event) {
            if ($("#batchName-Input").val() !== "") {
                preView.submitTask(-1);
            }
            else if ($("#batchName-Input").val() == "") {
                Notify.show({
                    title: "请输入任务名！",
                    type: "danger"
                });
            }
        });

        //增加预处理规则按钮，单击触发事件
        $("#btn-add").click(function () {
            //console.log('btn-add');
            preView.saveParameterSet();
            preView.addNode();
        });

        //删除预处理规则按钮，单击触发事件
        $("#btn-delnode").click(function () {
            //console.log('btn-delnode');
            preView.deleteNode();
        });

        //选择文件按钮绑定change事件，当文件变时要更新名字
        $("#selectFile-Button").bind("change", function () {
            $("#fileEcoding-Select")[0].selectedIndex = 7;
            basicSetup.getSelectedFilePath();
            hasSetAll = false;
            basicSetup.autoGetEncoding();
            basicSetup.setToRefreshPreViewTable(true);
            basicSetup.setToRefreshPreViewTable(true);
        });

        $("#selectFile-Button").bind("click", function(){
            if(getparams.getFileType() == 'excel'){
                basicSetup.uploadExcelForPreview();
            }
        });

        $("#tableTitle-Checkbox").bind("change", function () {
            console.log("tableTitle-Checkbox change");
            basicSetup.setToRefreshPreViewTable(true);
            basicSetup.setToRefreshPreViewTable(true);
        });

        //增加列的按钮
        $("#addColumn-Button").bind("click", preView.addColumn);

        //删除列的按钮
        $("#delColumn-Button").bind("click", function () {
            curColIndex = preView.removeColumn(curColIndex);
        });// preView.removeColumn(curColIndex));

        //暂时用不到
        {
            //var _url = location.href;
            //if (_url.indexOf("#") > -1) {
            //    //console.log('location.href');
            //    $(".step[href='" + _url.substring(_url.indexOf("#"), _url.length) + "']").click();
            //}

            //$("#id_table-field_terminator_1").css("margin-left", "4px").attr("placeholder", "在此处输入您的字段终止符").hide();
            //$("#id_table-field_terminator_0").change(function () {
            //    if ($(this).val() == "__other__") {
            //        $("#id_table-field_terminator_1").show();
            //    }
            //    else {
            //        $("#id_table-field_terminator_1").hide().nextAll(".error-inline").addClass("hide");
            //    }
            //});
            //$("#id_table-collection_terminator_1").css("margin-left", "4px").attr("placeholder", "在此处输入您的集合终止符").hide();
            //$("#id_table-collection_terminator_0").change(function () {
            //    if ($(this).val() == "__other__") {
            //        $("#id_table-collection_terminator_1").show();
            //    }
            //    else {
            //        $("#id_table-collection_terminator_1").hide().nextAll(".error-inline").addClass("hide");
            //    }
            //});
            //$("#id_table-map_key_terminator_1").css("margin-left", "4px").attr("placeholder", "在此处输入您的 Map 键终止符").hide();
            //$("#id_table-map_key_terminator_0").change(function () {
            //    if ($(this).val() == "__other__") {
            //        $("#id_table-map_key_terminator_1").show();
            //    }
            //    else {
            //        $("#id_table-map_key_terminator_1").hide().nextAll(".error-inline").addClass("hide");
            //    }
            //});

            //// fire the event on page load
            //$("#id_table-field_terminator_0").change();
            //$("#id_table-collection_terminator_0").change();
            //$("#id_table-map_key_terminator_0").change();

            //// show the first validation error if any
            //if ($(".errorlist").length > 0) {
            //    $(".step[href='#" + $(".errorlist").eq(0).closest(".stepDetails").attr("id") + "']").click();
            //}
            //
            //$("input[name='table-row_format']").change(function () {
            //    $(".stepDetailsInner").hide();
            //    $("#step3" + $(this).val()).show();
            //});
            //
            //$("input[name='table-file_format']").change(function () {
            //    $("#inputFormatDetails").hide();
            //    if ($(this).val() == "InputFormat") {
            //        $("#inputFormatDetails").slideDown();
            //    }
            //});
            //
            //$("#id_table-use_default_location").change(function () {
            //    if (!$(this).is(":checked")) {
            //        $("#location").slideDown();
            //    }
            //    else {
            //        $("#location").slideUp();
            //    }
            //});

            //$("#step6").find("button").click(function () {
            //    $("#mainForm").attr("action", "#step6");
            //});
            //
            //$(".columnType").find("select").change(function () {
            //    $(this).parents(".cnt").find(".arraySpec").hide();
            //    $(this).parents(".cnt").find(".mapSpec").hide();
            //    if ($(this).val() == "array") {
            //        $(this).parents(".cnt").find(".arraySpec").show();
            //    }
            //    if ($(this).val() == "map") {
            //        $(this).parents(".cnt").find(".mapSpec").show();
            //    }
            //});
            //
            //$("#step4").find("ul").addClass("inputs-list");
            //
            //$(".addColumnBtn, .addPartitionBtn").click(function (e) {
            //    if (!validateStep6()) {
            //        e.preventDefault();
            //    }
            //});

        }

        //行分隔符选择其他时显示十六进制的输入框
        $("#id_delimiter_row1").css("margin-left", "4px").attr("placeholder", "在此处输入您的行分隔符").hide();
        //$("#delimiter_row_label").hide();
        $("#delimiter_row_check").hide();
        $("#delimiter_row_text").hide();
        $("#id_delimiter_row0-Select").change(function () {
            if ($(this).val() == "__other__") {
                //$("#delimiter_row_label").show();
                $("#id_delimiter_row1").show();
                //$("#delimiter_row_check").show();
                $("#delimiter_row_check")[0].style.display = "inline";
                $("#delimiter_row_text").show();
            }
            else {
                //$("#delimiter_row_label").hide();
                $("#id_delimiter_row1").hide();
                $("#delimiter_row_check").hide();
                $("#delimiter_row_text").hide();
                $("#id_delimiter_row1").val('');
            }
        });
        $("#id_delimiter_row0-Select").change();

        //行分隔符选择其他时显示十六进制的输入框
        $("#id_delimiter_col1").css("margin-left", "4px").attr("placeholder", "在此处输入您的列分隔符").hide();
        $("#delimiter_col_check").hide();
        $("#delimiter_col_text").hide();
        $("#id_delimiter_col0").change(function () {
            if ($(this).val() == "__other__") {
                $("#id_delimiter_col1").show();
                //$("#delimiter_col_check").show();
                $("#delimiter_col_check")[0].style.display = "inline";
                $("#delimiter_col_text").show();
            }
            else {
                $("#id_delimiter_col1").hide();
                $("#id_delimiter_col1").val('');
                $("#delimiter_col_check").hide();
                $("#delimiter_col_text").hide();
            }
        });
        $("#id_delimiter_col0").change();

        $("#preView-Button").bind("click", preView.preView);
        $("#submit_preview").bind("click", basicSetup.displayFile);

        //文件编码自动识别按钮，单击触发事件
        $("#autoGetEncodingBtn").on("click", function (event) {
            event.preventDefault();
            basicSetup.autoGetEncoding();
        });

        $("#dataType-Select").bind("click", function () {
            basicSetup.getDataType();
            hasSetAll = false;
        });

        //$("#watchDir-Input").bind("click", basicSetup.getWatchDir);
        $("#watchDir-btn").bind("click", basicSetup.getWatchDir);

        $("#taskType-Select").bind("change", basicSetup.taskTypeSelectedChanged);

        $("#fileType-Select").bind("change", basicSetup.fileTypeChanged);

        $("#save-as-model").click(function () {
            preView.showTplTree("另存数据导入模型", "saveModel", "2")
        });
        $("#save-model").click(function () {
            preView.updateModelInfo();
        });
        $("#orderMappingBtn").bind("click", basicSetup.orderMapFields);
        $("#smartMappingBtn").bind("click", basicSetup.setRecommendFiledsParams);
        $("#cancle-mapping-btn").bind("click", basicSetup.cancelMapFields);
        $("#check-mapping-btn").bind("click", basicSetup.checkMapFields);
        //$("#generate-tableHead-btn").bind("click", basicSetup.generateTableHead);
        $("#get-mapSet-btn").bind("click", basicSetup.getMapSet);
    }

    //导航每一步跳转时，验证
    function validateForm(stepNow, stepNext) {
        //console.log('validateForm()');
        if ($('#taskType-Select').val() == 4 || $('#taskType-Select').val() == 5)
            return true;
        //console.log("stepnow", stepNow);
        //console.log("stepNext", stepNext);
        // step 1
        if (stepNow == "#step1" && stepNext == "#step2") {
            var step1Valid = true;
            //console.log($("#dataType-Select").val());
            if ($("#dataType-Select").val() == "") {
                step1Valid = false;
                Notify.show({
                    title: "请选择数据类型！",
                    type: "danger"
                });
            }
            else {
                step1Valid = true;
                if ($("#taskType-Select").val() == 2 || $("#taskType-Select").val() == 5) {
                    if ($("#watchDir-Input").val() == "") {
                        step1Valid = false;
                        Notify.show({
                            title: "请选择监视目录！",
                            type: "danger"
                        });
                    }
                    else if ($("#watchDir-Input").val() !== "") {
                        if (prviewUtil.checkFilefiterInput($('#filterStart-Input').val().trim())) {
                            step1Valid = false;
                            Notify.show({
                                title: "\"以...开头\"包含非法字符！",
                                type: "error"
                            });
                        }
                        else if (prviewUtil.checkFilefiterInput($('#filterEnd-Input').val().trim())) {
                            step1Valid = false;
                            Notify.show({
                                title: "\"以...结尾\"包含非法字符！",
                                type: "error"
                            });
                        }
                        else if (prviewUtil.checkFilefiterInput($('#filterInclude-Input').val().trim())) {
                            step1Valid = false;
                            Notify.show({
                                title: "\"包含\"包含非法字符！",
                                type: "error"
                            });
                        }
                        else {
                            var fileFilterStr = $('#filterStart-Input').val().trim() + "/"
                                + $('#filterEnd-Input').val().trim() + "/" + $('#filterInclude-Input').val().trim();
                            $.post('/datamanage/dataimport/CheckWatchDirIsUnique', {
                                "watchDir": $("#watchDir-Input").val().trim(),
                                "fileFilterRule": fileFilterStr,
                            }).done(function (data1) {
                                var data = JSON.parse(data1);
                                console.log(data);
                                if (data.code == 0) {
                                    step1Valid = true;
                                }
                                else {
                                    step1Valid = false;
                                    Notify.show({
                                        title: "该监视目录不可用！",
                                        type: "error"
                                    });
                                }
                            });
                        }
                    }
                }
            }
            if (step1Valid) {
                return true;
            }
            else {
                return false;
            }
        }

        if (stepNow == "#step1" && stepNext !== "#step2") {
            if (hasSetAll == false) {
                Notify.show({
                    title: "请前往第二步！",
                    type: "danger"
                });
                return false;
            }
            else if (hasSetAll == true) {
                return true;
            }
        }

        //step 2
        if (stepNow == "#step2" && stepNext == "#step3") {
            var step2Valid = true;
            console.log($("#filepath-Input").val());
            if ($("#filepath-Input").val() == "") {
                step2Valid = false;
                Notify.show({
                    title: "请选择文件！",
                    type: "danger"
                });
            }
            if (step2Valid) {
                return true;
            }
            else {
                return false;
            }
        }

        if (stepNext == "#step3" && basicSetup.getFileType != 'excel' && basicSetup.getFileType != 'dataBase') {
            if ($("#filepath-Input").val() == "") {
                alert("请输入文件");
            }
        }

        if (stepNow == "#step2" && stepNext == "#step1") {
            return true;
        }

        if (stepNow == "#step2" && (stepNext !== "#step1" || stepNext !== "#step3")) {
            if (hasSetAll == false) {
                Notify.show({
                    title: "请返回上一步或者前往第三步！",
                    type: "danger"
                });
                return false;
            }
            else if (hasSetAll == true) {
                return true;
            }
        }
        // step 3
        if (stepNow == "#step3") {
            return true;
        }
        // step 4
        if (stepNow == "#step4") {
            //if (stepNext == "#step3")
            //    preView.preView();
            return basicSetup.checkMapFields();
        }
        // step 5
        if (stepNow == "#step5") {
            hasSetAll = true;
            return true;
        }
    }

    {
        //function validateStep6() {
        //    var scrollTo = 0;
        //    // step 6
        //    var step6Valid = true;
        //    $(".column").each(function () {
        //        var _field = $(this);
        //        if (!isValid($.trim(_field.val()))) {
        //            showFieldError(_field);
        //            if (scrollTo == 0) {
        //                scrollTo = $(this).position().top - $(this).closest(".well").height();
        //            }
        //            step6Valid = false;
        //        }
        //        else {
        //            hideFieldError(_field);
        //        }
        //        var _lastSecondErrorField = null;
        //        $(".column").not("[name='" + _field.attr("name") + "']").each(function () {
        //            if ($.trim($(this).val()) != "" && $.trim($(this).val()) == $.trim(_field.val())) {
        //                _lastSecondErrorField = $(this);
        //                if (scrollTo == 0) {
        //                    scrollTo = _field.position().top - _field.closest(".well").height();
        //                }
        //                step6Valid = false;
        //            }
        //        });
        //        if (_lastSecondErrorField != null) {
        //            showSecondFieldError(_lastSecondErrorField);
        //        }
        //        else {
        //            hideSecondFieldError(_field);
        //        }
        //    });
        //    if (!step6Valid && scrollTo > 0) {
        //        $(window).scrollTop(scrollTo);
        //    }
        //    return step6Valid;
        //}

        //function isValid(str) {
        //    return (str != "" && str.indexOf(" ") == -1);
        //}
        //
        //function showFieldError(field) {
        //    field.nextAll(".error-inline").not(".error-inline-bis").removeClass("hide");
        //}
        //
        //function showSecondFieldError(field) {
        //    field.nextAll(".error-inline-bis").removeClass("hide");
        //}
        //
        //function hideFieldError(field) {
        //    if (!(field.nextAll(".error-inline").hasClass("hide"))) {
        //        field.nextAll(".error-inline").addClass("hide");
        //    }
        //}
        //
        //function hideSecondFieldError(field) {
        //    if (!(field.nextAll(".error-inline-bis").hasClass("hide"))) {
        //        field.nextAll(".error-inline-bis").addClass("hide");
        //    }
        //}
    }

    return {
        init: init,
        renderDataimportInfo: renderDataimportInfo,
    };
});