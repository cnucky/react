/**
 * Created by root on 7/1/16.
 */
define(['nova-notify', 'utility/loaders',
        '../../dm/datatypemanage/dm-fromfile-getparams',
        '../../dm/dataimport/dm-fileimport'],
    function (Notify, loader, getparams, FileUtil) {
        var viewSize = 8 * 5000 * 100;
        var contentArray = new Array();
        var colNum = 0;
        var rowNum = 0;
        var fieldType = [
            {"logictype": "string", "displayname": "字符串"},
            {"logictype": "decimal", "displayname": "数值"},
            {"logictype": "date", "displayname": "日期"},
            {"logictype": "datetime", "displayname": "日期时间"}
        ];

        function initFunction() {
            $("#filetype-select").change(function () {
                switch (getparams.getFileType()) {
                    case "1":
                        contentArray = [];
                        $("#file-encoding-select").removeAttr("disabled");
                        //$("#selectfile-btn").removeAttr("disabled");
                        $("#row-delimiter-select").removeAttr("disabled");
                        $("#col-delimiter-select").removeAttr("disabled");
                        $("#selectfile-btn")[0].type = 'file';
                        $("#file-preview").show(); //[0].style.color = "blue";
                        //$("#file-preview")[0].textContent = "列定义预览";
                        break;
                    case "2":
                        contentArray = [];
                        $("#file-encoding-select").prop("disabled", "disabled");
                        //$("#selectfile-btn").prop("disabled", "disabled");
                        $("#row-delimiter-select").prop("disabled", "disabled");
                        $("#col-delimiter-select").prop("disabled", "disabled");
                        $("#selectfile-btn")[0].type = '';
                        $("#file-preview").hide();//[0].style.color = "red";
                        //$("#file-preview")[0].textContent = "上传文件并预览列定义";
                        break;
                    default :
                        return;
                }
            });

            $("#tableheader-Checkbox").change(function () {
                var isFirstRowHead = getparams.getIsFirstRowHead();
                switch (getparams.getFileType()) {
                    case "1":
                    //break;
                    case "2":
                        if (contentArray.length > 0) {
                            for (var i = 0; i < contentArray.length && i < 12; ++i) {
                                if (contentArray[i].length > colNum)
                                    colNum = contentArray[i].length;
                            }
                            if (!isFirstRowHead) {
                                var headArray = new Array();
                                for (var i = 0; i < colNum; ++i) {
                                    headArray.push("字段" + (i + 1));
                                }
                                contentArray.unshift(headArray);
                            }
                            else {
                                contentArray.shift();
                            }

                            if (contentArray.length > 11)
                                rowNum = 10;
                            else
                                rowNum = contentArray.length - 1;
                            //rowNum = contentArray.length - 1;
                            console.log("contentArray", contentArray);
                            console.log("colNum", colNum);

                            drawTable();
                        }
                        break;
                    default :
                        return;
                }
            });

            $("#row-delimiter-select").change(function () {
                if ($(this).val() == "__other__") {
                    $("#row-delimiter-form-group").show();
                }
                else {
                    $("#row-delimiter-form-group").hide();
                }
            });

            $("#col-delimiter-select").change(function () {
                if ($(this).val() == "__other__") {
                    $("#col-delimiter-form-group").show();
                }
                else {
                    $("#col-delimiter-form-group").hide();
                }
            });

            $("#selectfile-btn").bind("change", function () {
                if (getparams.getFileType() == 1) {
                    getSelectedFilePath();
                    getparams.autoGetEncoding();
                }
            });

            $("#selectfile-btn").bind("click", function () {
                console.log("selectfile-btn-click");
                if (getparams.getFileType() == 2) {
                    displayExcelFile();
                }
            });

            $("#file-preview").bind("click", function () {
                displayFile();
            });
        }

        //获取选择文件的文件名称
        function getSelectedFilePath() {
            var obj = $("#selectfile-btn")[0];
            if (obj) {
                $("#filename-Input").attr("value", obj.files.item(0).name);
            }
        }

        //根据用户设置，切分、展示文件
        function displayFile() {
            switch (getparams.getFileType()) {
                case "1":
                    displayTxtFile();
                    break;
                case "2":
                    //displayExcelFile();
                    break;
                default :
                    return;
            }
        }

        //txt文件
        function displayTxtFile() {
            var file = document.getElementById("selectfile-btn").files[0];
            if (file.type.indexOf("text") >= 0) {//文本文件
                txtParse(file);
            }
            else {
                var fileNameArray = file.name.split(".", 1000);
                if (fileNameArray.length > 0) {
                    var postfixStr = fileNameArray[fileNameArray.length - 1];
                    switch (postfixStr) {
                        case "bcp":
                            txtParse(file);
                            break;
                        default :
                            Notify.show({
                                title: "该文件类型暂时不能解析！",
                                type: "warn"
                            });
                            break;
                    }
                }
                else {
                    Notify.show({
                        title: "该文件类型暂时不能解析！",
                        type: "warn"
                    });
                }
            }
        }

        function txtParse(file) {
            var viewText = file.slice(0, viewSize);
            //console.log(viewText.size);
            var read = new FileReader();
            var encoding = getparams.getfileEncoding();
            console.log("ecoding", encoding);
            read.readAsText(viewText, encoding);//, "GB2312");
            read.onload = function (e) {
                var textContent = this.result;
                var isFirstRowHead = getparams.getIsFirstRowHead();
                var rowSplit = getparams.getRowSplit();
                var colSplit = getparams.getColSplit();
                viewFileContent(textContent, isFirstRowHead, rowSplit, colSplit);
            }
        }

        function viewFileContent(textContent, isFirstRowHead, rowSplit, colSplit) {
            var maxRowNum = 15;
            var maxcolNum = 500;
            contentArray = new Array();
            var rowArray = textContent.split(rowSplit, maxRowNum);

            colNum = 0;
            for (var i = 0; i < rowArray.length - 1 && i < 11; ++i) {
                colArray = rowArray[i].split(colSplit, maxcolNum);
                contentArray.push(colArray);

                if (colNum < colArray.length) {
                    colNum = colArray.length;// + getparams.getnewAddColsNum();
                }
            }
            if (!isFirstRowHead) {
                var headArray = new Array();
                for (var i = 0; i < colNum; ++i) {
                    headArray.push("字段" + (i + 1));
                }
                contentArray.unshift(headArray);
            }
            rowNum = contentArray.length - 1;
            console.log("contentArray", contentArray);
            console.log("colNum", colNum);

            drawTable();
        }

        function drawTable() {
            $('#createdatatype-fromfile-table tbody').empty();

            for (var i = 0; i < colNum; i++) {
                generateRow(i);
                $('#createdatatype-fromfile-table tbody tr:last-child td').find("select").each(function () {
                    $(this).select2();
                });
            }

            $(".disabledType").prop("disabled", "disabled");
            $("select.logicType").unbind("change", logicTypeChanged);
            $("select.logicType").bind("change", logicTypeChanged);
        }

        function logicTypeChanged(event) {
            var curTr = event.currentTarget.parentElement.parentElement;
            var logicType = curTr.children[1].children[0].value;
            console.log("logicType", logicType);
            var classList3 = curTr.children[2].children[0].classList;
            var classList4 = curTr.children[3].children[0].classList;
            console.log("classList3", classList3);
            console.log("classList4", classList4);
            $(".disabledType").removeAttr("disabled");
            switch (logicType) {
                case 'decimal':
                    curTr.children[2].children[0].value = "20";
                    curTr.children[3].children[0].value = "0";
                    classList3.remove("disabledType");
                    classList4.remove("disabledType");
                    break;
                case 'string':
                    curTr.children[2].children[0].value = "255";
                    curTr.children[3].children[0].value = "0";
                    classList3.remove("disabledType");
                    classList4.remove("disabledType");
                    break;
                case 'decimalip':
                    curTr.children[2].children[0].value = "20";
                    curTr.children[3].children[0].value = "0";
                    classList3.remove("disabledType");
                    classList4.remove("disabledType");
                    break;
                default :
                    curTr.children[2].children[0].value = "0";
                    curTr.children[3].children[0].value = "0";
                    classList3.add("disabledType");
                    classList4.add('disabledType');

                    break;
            }

            curTr.children[2].children[0].classList = classList3;
            curTr.children[3].children[0].classList = classList4;
            $(".disabledType").prop("disabled", "disabled");
        }

        function generateRow(i) {
            var fieldType = "string";
            var fieldLength = 255;
            var fieldScale = 0;
            fieldType = getFieldType(i);
            fieldLength = getFieldLength(fieldType);
            fieldScale = getFieldScale(fieldType);

            rowHtml = '<tr>' + '' +
                '<td><input type="text" class="edit lock-edit" style="border:0px" placeholder=""></td>' +
                '<td>' + generateTypeHtml() + '</td>' +
                '<td><input type="text" class="edit lock-edit" style="border:0px; width: 45px; height: 22px;"></td>' +
                '<td><input type="text" class="edit lock-edit" style="border:0px; width: 45px; height: 22px;" ></td>';


            for (var j = 1; j <= rowNum; ++j) {
                if (contentArray[j][i] != undefined)
                    rowHtml += '<td><lable type="text"  style="border:0px" placeholder="">'
                        + contentArray[j][i] + '</lable></td>';
                else
                    rowHtml += '<td><lable type="text"  style="border:0px" placeholder=""></lable></td>';
            }
            rowHtml += '</tr>'
            $('#createdatatype-fromfile-table tbody').append(rowHtml);

            var curTr = $('#createdatatype-fromfile-table tbody > tr:nth-child(' + (i + 1) + ')');
            $('#createdatatype-fromfile-table tbody > tr:nth-child(' + (i + 1) + ') > td:nth-child(1) :input').
                val(contentArray[0][i]);
            $('#createdatatype-fromfile-table tbody > tr:nth-child(' + (i + 1) + ') > td:nth-child(1) :input')[0].
                title = contentArray[0][i];
            $('#createdatatype-fromfile-table tbody > tr:nth-child(' + (i + 1) + ') > td:nth-child(2) option[value="'
                + fieldType + '"]').attr("selected", "true");

            if (fieldType.toLowerCase() == 'date' || fieldType.toLowerCase() == 'datetime') {
                $('#createdatatype-fromfile-table tbody > tr:nth-child(' + (i + 1) + ') > td:nth-child(3) :input').
                    val(fieldLength);
                $('#createdatatype-fromfile-table tbody > tr:nth-child(' + (i + 1) + ') > td:nth-child(4) :input').
                    val(fieldScale);
                $('#createdatatype-fromfile-table tbody > tr:nth-child(' + (i + 1) + ') > td:nth-child(3) :input')
                    .addClass('disabledType');
                $('#createdatatype-fromfile-table tbody > tr:nth-child(' + (i + 1) + ') > td:nth-child(4) :input')
                    .addClass('disabledType');
            }
            else {
                $('#createdatatype-fromfile-table tbody > tr:nth-child(' + (i + 1) + ') > td:nth-child(3) :input').
                    val(fieldLength);
                $('#createdatatype-fromfile-table tbody > tr:nth-child(' + (i + 1) + ') > td:nth-child(4) :input').
                    val(fieldScale);
            }
        }

        function getFieldType(i) {
            var fieldTypeDic = new Array();
            var fieldType;
            for (var rowIndex = 1; rowIndex != 10 && rowIndex <= rowNum; rowIndex++) {
                if (contentArray[rowIndex][i] != undefined && contentArray[rowIndex][i].length > 0) {
                    fieldType = JudgeContent(contentArray[rowIndex][i]);
                    if (fieldTypeDic[fieldType] == undefined) {
                        fieldTypeDic[fieldType] = 1;
                    }
                    else {
                        fieldTypeDic[fieldType]++;
                    }
                }
            }

            fieldType = "string";
            var fieldVal = 0;
            var fieldTypeNum = 0;
            var unDateTimeNum = 0;
            for (var j in fieldTypeDic) {
                fieldTypeNum++;
                if (j != "datetime" && j != "date")
                    unDateTimeNum++;
                if (fieldTypeDic[j] > fieldVal) {
                    fieldType = j;
                    fieldVal = fieldTypeDic[j];
                }
            }
            //console.log("fieldType", fieldType);
            if (fieldTypeNum > 1) {
                console.log("unDateTimeNum", unDateTimeNum);
                if (unDateTimeNum <= 0)
                    return "datetime";
                else
                    return "string";
            }
            else
                return fieldType;
        }

        function getFieldLength(fieldType) {
            switch (fieldType) {
                case "decimal":
                    return 20;
                case "string":
                    return 255;
                default:
                    return 0;
            }
        }

        function getFieldScale(fieldType) {
            switch (fieldType) {
                default:
                    return 0;
            }
        }

        //判断内容类型，1是纯数字，2是字符串，3是日期时间
        function JudgeContent(content) {
            content = content.toString();

            var numRegx = /(^\d*$)|^(^\d{17}(\d|X|x)$)/;
            var dateRegx = /^\d*-\d*-\d*/;
            var dateRegx1 = /^\d*\/\d*\/\d*/;
            var dateTimeRegx = /^\d*-\d*-\d* \d*:\d*:\d*/;
            var dateTimeRegx1 = /^\d*\/\d*\/\d* \d*:\d*:\d*/;
            if ((numRegx.test(content) && content.length < 11 && content[0] != '0' && content.length > 0) || content == '0') {
                return "decimal";
            }
            else if (dateTimeRegx.test(content) || dateTimeRegx1.test(content)) {
                return "datetime";
            }
            else if (dateRegx.test(content) || dateRegx1.test(content)) {
                return "date";
            }
            else {
                return "string";
            }
        }

        //excel文件
        function displayExcelFile() {
            try {
                var opts = {
                    width: 600,
                    height: 500,
                    ip: "",
                    isFromDialog: true,
                    initState: 'modal',
                    isexcel: true,
                    accept: '.xls, .xlsx'
                    //ipUDP: ipStrForUDP,
                    //type: document.getElementById('taskType-Select').value,
                };
                FileUtil.setInitUploadPanel();
                FileUtil.uploadFile(opts);
            }
            catch (e) {
                hideLoader();
            }
        }

        function xlsxParse(newFileName, oldFileName) {
            //showLoader();
            Notify.show({
                title: "解析文件需要一定时间请耐心等待！",
                type: "info"
            });
            $('#warn-info').show();
            $.post('/datamanage/dataimport/xlsxParse', {
                newName: newFileName,
                oldFileName: oldFileName
            }).done(function (res) {
                //hideLoader();
                $('#warn-info').hide();
                var data = JSON.parse(res);
                if (data.code == 0) {
                    contentArray = data.data;
                    colNum = 0;
                    var isFirstRowHead = getparams.getIsFirstRowHead();
                    for (var i = 0; i < contentArray.length && i < 12; ++i) {
                        if (contentArray[i].length > colNum)
                            colNum = contentArray[i].length;
                    }
                    if (!isFirstRowHead) {
                        var headArray = new Array();
                        for (var i = 0; i < colNum; ++i) {
                            headArray.push("字段" + (i + 1));
                        }
                        contentArray.unshift(headArray);
                    }
                    if (contentArray.length > 11)
                        rowNum = 10;
                    else
                        rowNum = contentArray.length - 1;
                    console.log("contentArray", contentArray);
                    console.log("colNum", colNum);

                    drawTable();
                }
                else {
                    Notify.show({
                        title: '文件解析失败！',
                        type: 'error'
                    });
                }
            });
            //hideLoader();
        }

        function getFilePreViewRes(newFileName, oldFileName, tmpNewName) {
            var load = loader($('#modal-panel'));//loader($('#createdatatype-fromfile'));
            $("#filename-Input").attr("value", oldFileName);
            //showLoader();
            Notify.show({
                title: "解析文件需要一定时间请耐心等待！",
                type: "info"
            });
            $('#warn-info').show();
            console.log("tmpNewName", tmpNewName);
            $.post('/datamanage/dataimport/checkUploadResult', {
                fileName: tmpNewName
            }).done(function (res) {
                //hideLoader();
                load.hide();
                $('#warn-info').hide();
                var data = JSON.parse(res);
                if (data.code == 0) {
                    contentArray = data.data.resultArray;
                    colNum = 0;
                    var isFirstRowHead = getparams.getIsFirstRowHead();
                    for (var i = 0; i < contentArray.length && i < 12; ++i) {
                        if (contentArray[i].length > colNum)
                            colNum = contentArray[i].length;
                    }
                    if (!isFirstRowHead) {
                        var headArray = new Array();
                        for (var i = 0; i < colNum; ++i) {
                            headArray.push("字段" + (i + 1));
                        }
                        contentArray.unshift(headArray);
                    }
                    if (contentArray.length > 11)
                        rowNum = 10;
                    else
                        rowNum = contentArray.length - 1;
                    //rowNum = contentArray.length - 1;
                    console.log("contentArray", contentArray);
                    console.log("colNum", colNum);

                    drawTable();
                }
                else {
                    Notify.show({
                        title: '文件解析失败！',
                        type: 'error'
                    });
                    //hideLoader();
                }
            });
            //hideLoader();
        }

        //生成策略类型html
        function generateTypeHtml(isSet, policyInfo) {
            typeHtml = ('<select class="select2-white form-control edit lock-edit logicType" >');

            _.each(fieldType, function (item) {
                typeHtml += ('<option value="' + item.logictype + '">' + item.displayname + '</option>');
            });

            typeHtml += '</select>';
            return typeHtml;
        }

        function saveFromFileSet() {
            var rowNum = $('#createdatatype-fromfile-table tbody > tr').length;
            var columnList = [];
            for (var i = 1; i <= rowNum; i++) {
                var tr = $('#createdatatype-fromfile-table tbody > tr:nth-child(' + i + ')');

                var colInfo = getColumn(i);
                if (colInfo) {
                    columnList.push(colInfo);
                }
                //else {
                //    return;
                //}
            }
            return columnList;
        }

        //获取字段信息
        function getColumn(i) {
            var tr = $('#createdatatype-fromfile-table tbody > tr:nth-child(' + i + ')');
            //console.log("tr", tr);
            var fieldIndex = i;
            var colName = $('#createdatatype-fromfile-table tbody > tr:nth-child(' + i + ') > td:nth-child(1) :input').val();
            var colLogicType = $('#createdatatype-fromfile-table tbody > tr:nth-child(' + i + ') > td:nth-child(2) :selected').val();
            var colLength = $('#createdatatype-fromfile-table tbody > tr:nth-child(' + i + ') > td:nth-child(3) :input').val();
            var colScale = $('#createdatatype-fromfile-table tbody > tr:nth-child(' + i + ') > td:nth-child(4) :input').val() || 0;
            if (colLogicType == "string" && _.isEmpty(colLength)) {
                colLength = 255;
            }
            if (colLogicType == "decimal" && _.isEmpty(colLength)) {
                colLength = 20;
            }

            col = {
                displayName: colName,
                fieldIndex: fieldIndex,
                fieldType: colLogicType,
                length: colLength,
                fieldScale: colScale,
            }
            return col;
        }

        return {
            initFunction: initFunction,
            saveFromFileSet: saveFromFileSet,
            xlsxParse: xlsxParse,
            getFilePreViewRes: getFilePreViewRes
        }

    });