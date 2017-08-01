/**
 * Created by root on 3/14/16.
 */

define(['nova-notify',
        '../../dm/dataimport/dm-basicsetup',
        '../../../tpl/previewcond/tpl-transform',
        '../../dm/dataimport/dm-getruleparams',],
    function (Notify, basicSetup, transformRule, getruleparams) {
        var codeTableData = [];

        //获取代码表
        $.getJSON("/datamanage/udp/getCodeTable", function (rsp) {
            if (rsp.code == 0) {
                codeTableData = rsp.data.tableInfos;
            } else {
                console.log("获取代码表失败, err msg:" + rsp.message);
            }
        });

        //初始化预处理规则的条件
        function initConditionNames() {
            //var conditionNames = new Array();
            return ["包含", "不包含",
                "长度大于", "长度等于", "长度小于", "为空",
                "以...结尾", "不以...结尾",
                "以...开头", "不以...开头",
                "不为空"];
        }

        //初始化各个预处理规则参数数组
        function initRuleParameterArray() {
            var ruleParameterArray = new Array();

            ruleParameterArray[1005] = new Object({
                "labelName": "在文本前添加前缀：",
                "isCaseSensitive": false,
                "parameterNum": 1
            });

            ruleParameterArray[1006] = new Object({
                "labelName": "在文本后添加后缀：",
                "isCaseSensitive": false,
                "parameterNum": 1
            });

            ruleParameterArray[1010] = new Object({
                "labelName": "移除能找到的前缀：",
                "isCaseSensitive": true,
                "parameterNum": 2
            });

            ruleParameterArray[1011] = new Object({
                "labelName": "移除能找到的后缀：",
                "isCaseSensitive": true,
                "parameterNum": 2
            });

            ruleParameterArray[1002] = new Object({
                "labelName": "匹配值：",
                "isCaseSensitive": true,
                "labelName1": "替换为：",
                "parameterNum": 3
            });

            ruleParameterArray[27] = new Object({
                "labelName": "输入的时间日期格式：",
                "dateFormatArray": new Array("yyyy-MM-dd HH:mm:ss",
                    "yyyy/MM/dd HH:mm:ss",
                    "yyyyMMddHHmmss",
                    "MM/dd/yyyy HH:mm:ss",
                    "MM-dd-yyyy HH:mm:ss",
                    "yyyy/MM/dd",
                    "yyyy-MM-dd",
                    "yyyyMMdd",
                    "MM/dd/yyyy",
                    "MM-dd-yyyy",
                    "MM/dd/yy",
                    "MM-dd-yy",
                    "dd/MM/yyyy",
                    "dd-MM-yyyy",
                    "HHmmss",
                    "yyyy年MM月dd日 HH时mm分ss秒",
                    //"dd-MMM-yy",
                    //"MMM-dd-yy",
                    //"MMM dd yyyy hh:mm:ss.SSSa",
                    "dd-MM-yyyy HH:mm:ss",
                    "dd/MM/yyyy HH:mm:ss"),
                "parameterNum": 2
            });

            ruleParameterArray[1003] = new Object({
                "isAddOtherCol": false,
                "type": 1,
                "lableArray": ["删除首尾Tab字符", "删除首尾空格字符"],
                "signArray": ["\t", " "],
                "other": "删除下面列出的其他首尾字符：",
                "isCaseSensitive": true,
                "parameterNum": 5
            });

            ruleParameterArray[1012] = new Object({
                "isAddOtherCol": false,
                "type": 1,
                "lableArray": ["移除Tab字符", "移除空格字符", "移除回车字符"],
                "signArray": ["\t", " ", "\r\n"],
                "other": "移除下面列出的其他字符：",
                "isCaseSensitive": true,
                "parameterNum": 5
            });

            ruleParameterArray[1007] = new Object({
                "isAddOtherCol": true,
                "type": 2,
                "lableArray": ["无分隔符", "空格分隔符", "逗号分隔符"],
                "signArray": ["", " ", ","],
                "other": "其他分隔符：",
                "isCaseSensitive": false,
                "parameterNum": 5
            });

            ruleParameterArray[1008] = new Object({
                "isAddOtherCol": true,
                "type": 2,
                "lableArray": ["无分隔符", "空格分隔符", "逗号分隔符"],
                "signArray": ["", " ", ","],
                "other": "其他分隔符：",
                "isCaseSensitive": false,
                "parameterNum": 5
            });

            ruleParameterArray[9] = new Object({
                "type": 3,
                "labelName": "格式化后字符串的长度：",
                "parameterNum": 5
            });

            ruleParameterArray[1004] = new Object({
                "type": 4,
                "parameterNum": 4
            });

            ruleParameterArray[1021] = new Object({
                "type": 5,
                "labelName": "操作符：",
                "dateFormatArray": new Array("包含", "不包含",
                    "长度大于", "长度等于", "长度小于", "为空",
                    "以...结尾", "不以...结尾",
                    "以...开头", "不以...开头",
                    "不为空","在列表中(空格分割)"),
                "parameterNum": 5
            });

            ruleParameterArray[1022] = new Object({
                "type": 7,
                "labelName": "操作符：",
                "dateFormatArray": new Array("大于", "小于", "等于", "大于等于", "小于等于", "在范围内"),
                "parameterNum": 5
            });


            ruleParameterArray[1024] = new Object({
                "type": 6,
                "labelName": "操作符：",
                "dateFormatArray": new Array("+", "-", "*", "/"),
                "parameterNum": 5
            });

            ruleParameterArray[1013] = new Object({});

            ruleParameterArray[8] = new Object({
                "typeLabelName": "",
                "typeArray": [{'caption': "自定义设值", 'value': '1'}, {'caption': "当前标准时间", 'value': '2'},
                    {'caption': "当前时间戳(毫秒)", 'value': '3'}, {'caption': "生成随机字符串", 'value': '4'}],
                "labelName": "要设定的值：",
                "isCaseSensitive": false,
                "parameterNum": 2
            });

            return ruleParameterArray;
        }

        //初始化预处理规则分类数组
        function initRuleClassArray() {
            var ruleClassArray = new Array();
            ruleClassArray[0] = [2, 3, 5, 6, 10, 11, 101, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24, 25, 26, 28, 29];
            ruleClassArray[1] = [1005, 1006, 1010, 1011, 1002];
            ruleClassArray[2] = [27];
            ruleClassArray[3] = [9, 1003, 1004, 1012, 1007, 1008, 1021, 1022, 1024];
            ruleClassArray[4] = [1013];
            ruleClassArray[5] = [8];

            return ruleClassArray;
        }

        function initParameterViewForClass1(node, ruleParameterArray) {
            $('#parameterView')[0].innerHTML = '<label class="field-label">' + ruleParameterArray[node.ID].labelName + '</label>'
                + '<input type="text" id="parameterInput" class="gui-input" style="width: 90%">';
            if (ruleParameterArray[node.ID].isCaseSensitive)
                $('#parameterView')[0].innerHTML += ' <label class="checkbox"><input unchecked id="caseSensitiveCheckbox" type="checkbox">忽略大小写</label>';
            if (ruleParameterArray[node.ID].labelName1 != undefined)
                $('#parameterView')[0].innerHTML += '<label class="field-label">' + ruleParameterArray[node.ID].labelName1 + '</label>'
                    + '<input type="text" id="parameterInput1" class="gui-input" style="width: 90%">';
        }

        function initParameterViewForClass2(node, ruleParameterArray) {
            $('#parameterView')[0].innerHTML = '<label class="field-label">' + ruleParameterArray[node.ID].labelName + '</label>'
                + '<select id="parameterSelect" class="gui-input" style="width: 90%"></select>';
            var parameterSelect = document.getElementById("parameterSelect");
            for (var i = 0; i < ruleParameterArray[node.ID].dateFormatArray.length; ++i) {
                parameterSelect.options[i] = new Option(ruleParameterArray[node.ID].dateFormatArray[i], i + 1);
            }
        }

        function initParameterViewForClass3(node, ruleParameterArray) {
            if (ruleParameterArray[node.ID].isAddOtherCol) {
                $('#parameterView')[0].innerHTML = '<label class="field-label">' + '选择要增加的列：' + '</label>'
                    + '<select id="colAddSelect" style="width: 80%"></select>';

                var colAddSelect = document.getElementById("colAddSelect");
                if (!basicSetup.getIsFirstRowHead()) {
                    for (var i = 0; i < basicSetup.getColNum(); ++i) {
                        colAddSelect.options[i] = new Option('列' + String(i + 1), i);
                    }
                }
                else {
                    if (basicSetup.getRowArray().length > 0) {
                        colArray = basicSetup.getRowArray()[0].split(basicSetup.getColSplit(), basicSetup.getColRowNum());
                        for (var i = 0; i < colArray.length; ++i) {
                            colAddSelect.options[i] = new Option(colArray[i], i);
                        }
                    }
                }
            }

            switch (ruleParameterArray[node.ID].type) {
                //删除首尾字符, 移除指定字符
                case 1:
                    for (var i = 0; i < ruleParameterArray[node.ID].lableArray.length; ++i) {
                        $('#parameterView')[0].innerHTML += '<label class="checkbox" style="padding-top: 0px;padding-bottom: 3px"><input unchecked id="'//checkbox'
                                //+ i
                            + ruleParameterArray[node.ID].lableArray[i] + '" type="checkbox">'
                            + ruleParameterArray[node.ID].lableArray[i] + '</label>';
                    }
                    if (ruleParameterArray[node.ID].other.length > 0) {
                        $('#parameterView')[0].innerHTML += '<label class="checkbox" style="padding-top: 0px;padding-bottom: 3px"><input unchecked id="otherCheckbox" type="checkbox">'
                            + ruleParameterArray[node.ID].other + '</label>'
                            + '<label style="margin-left: 30px;"><input type="checkbox" id="isHexData">十六进制</label>'
                            + '<input type="text" id="parameterInput1" class="gui-input" style="width: 90%">';
                    }
                    if (ruleParameterArray[node.ID].isCaseSensitive)
                        $('#parameterView')[0].innerHTML += ' <label class="checkbox"><input unchecked id="caseSensitiveCheckbox" type="checkbox">忽略大小写</label>';
                    break;

                //添加其他字段作为前缀， 添加其他字段作为后缀
                case 2:
                    for (var i = 0; i < ruleParameterArray[node.ID].lableArray.length; ++i) {
                        if(i == 0){
                            $('#parameterView')[0].innerHTML += '<label class="radio" style="padding-top: 0px;padding-bottom: 3px">'
                                +'<input checked id="'
                                + ruleParameterArray[node.ID].lableArray[i] + '" type="radio" name="selectradio" >'
                                + ruleParameterArray[node.ID].lableArray[i] + '</label>';
                        }
                        else{
                            $('#parameterView')[0].innerHTML += '<label class="radio" style="padding-top: 0px;padding-bottom: 3px">'
                                +'<input unchecked id="'
                                + ruleParameterArray[node.ID].lableArray[i] + '" type="radio" name="selectradio" >'
                                + ruleParameterArray[node.ID].lableArray[i] + '</label>';
                        }
                    }
                    if (ruleParameterArray[node.ID].other.length > 0) {
                        $('#parameterView')[0].innerHTML += '<label class="radio" style="padding-top: 0px;padding-bottom: 3px">'
                            + '<input unchecked id="otherCheckbox" type="radio" name="selectradio" >'
                            + ruleParameterArray[node.ID].other + '</label>'
                            + '<input type="text" id="parameterInput1" class="gui-input" style="width: 90%">';
                    }
                    if (ruleParameterArray[node.ID].isCaseSensitive)
                        $('#parameterView')[0].innerHTML += ' <label class="checkbox"><input unchecked id="caseSensitiveCheckbox" type="checkbox">忽略大小写</label>';
                    break;

                //格式化字符串长度
                case 3:
                    $('#parameterView')[0].innerHTML = '<label class="field-label">' + ruleParameterArray[node.ID].labelName + '</label>'
                        + '<input type="number" id="formatStringLength" class="gui-input" min = "0" style="width: 90%;margin-bottom:15px">'
                        + '<label class = "field-label">'
                        + '<input type="checkbox" id="supplyEnough">原字符串长度不够则补全：'
                        + '<input type="radio" checked name="supplyFromHeadOrTail" value="0" style="margin-left:10px">从头部补齐'
                        + '<input type="radio" name="supplyFromHeadOrTail" value="1" style="margin-left:10px">从尾部补齐'
                        + '<input type="text" id="parameterInput" class="gui-input" min = "0" style="width: 90%;margin-bottom:15px">'
                        + '</label>'
                        + '<label class = "field-label">原字符串超过指定长度时：'
                        + '<input type="radio" checked name="cutFromHeadOrTail" value="0" style="margin-left:10px">截掉头部'
                        + '<input type="radio" name="cutFromHeadOrTail" value="1" style="margin-left:10px">截掉尾部';
                    +'</label>'
                    break;

                //提取字符串
                case 4:
                    $('#parameterView')[0].innerHTML = '<label class="field-label">第一个字符:</label>'
                        + '<label class = "field-label">'
                        + '<input type="radio" checked name="firstFromHeadOrTail" value="1" style="margin-left:10px">从开头'
                        + '<input type="radio" name="firstFromHeadOrTail" value="0" style="margin-left:10px">从结尾</label>'
                        + '<label class = "field-label">'
                        + '<input type="number" id="firstPosition" class="gui-input" min = "0" style="width: 90%;margin-bottom:20px"></label>'
                        + '<label class="field-label">最后一个字符:</label>'
                        + '<label class = "field-label">'
                        + '<input type="radio" checked name="lastFromHeadOrTail" value="1" style="margin-left:10px">从开头'
                        + '<input type="radio" name="lastFromHeadOrTail" value="0" style="margin-left:10px">从结尾</label>'
                        + '<label class = "field-label">'
                        + '<input type="number" id="lastPosition" class="gui-input" min = "0" style="width: 90%;margin-bottom:20px"></label>'
                    break;

                //内容筛选
                case 5:
                    $('#parameterView')[0].innerHTML += '<label class="field-label" style="padding-bottom: 3px;">'
                        + ruleParameterArray[node.ID].labelName + '</label>'
                        + '<select id="operateSelect" class="gui-input" style="width: 90%;margin-bottom: 5px;"></select>';
                    var operateSelect = document.getElementById("operateSelect");
                    for (var i = 0; i < ruleParameterArray[node.ID].dateFormatArray.length; ++i) {
                        operateSelect.options[i] = new Option(ruleParameterArray[node.ID].dateFormatArray[i]);
                    }
                    $('#parameterView')[0].innerHTML += '<label class="field-label" style="padding-bottom: 3px">值'
                        + '<input type="text" id="textEditValue" style="margin-left:10px"></label>';
                    $('#parameterView')[0].innerHTML += '<label class="field-label">筛选策略'
                        + '<input type="radio" checked name="filterWay" value="1" style="margin-left:10px">保留'
                        + '<input type="radio" name="filterWay" value="0" style="margin-left:10px">丢弃</label>'
                    break;

                //数值四则运算
                case 6:
                    $('#parameterView')[0].innerHTML += '<label class="field-label" style="padding-bottom: 3px;">' + ruleParameterArray[node.ID].labelName
                        + '<select id="calOperateSelect" class="gui-input" style="width: 70%;margin-bottom: 5px;margin-left:10px"></select></label>';
                    var calOperateSelect = document.getElementById("calOperateSelect");
                    for (var i = 0; i < ruleParameterArray[node.ID].dateFormatArray.length; ++i) {
                        calOperateSelect.options[i] = new Option(ruleParameterArray[node.ID].dateFormatArray[i]);
                    }
                    $('#parameterView')[0].innerHTML += '<label id="judgeMinusDiv" class="field-label" style="padding-bottom: 3px">' +
                        '<input type="checkbox" id="isMinuendOrDividend" style="margin-bottom: 5px;margin-left:60px">该列为被减数或被除数</label>'
                    $('#parameterView')[0].innerHTML += '<label class="field-label" style="padding-bottom: 3px">参数：'
                        + '<select id="parameterType" class="gui-input" style="width: 70%;margin-bottom: 5px;margin-left:23px">' +
                        '<option value="自定义">自定义</option><option value="字段">字段</option></select></label>' +
                        '<label class="field-label" style="padding-bottom: 3px">参数值：' +
                        '<input type="text" id="parameterValue" style="margin-left:10px;display: inline">' +
                        '<select id="parameterValueColSelect" style="width: 70%;margin-left:10px;display: none"></select></label>';

                    var parameterValueColSelect = document.getElementById("parameterValueColSelect");
                    if (!basicSetup.getIsFirstRowHead()) {
                        for (var i = 0; i < basicSetup.getColNum(); ++i) {
                            parameterValueColSelect.options[i] = new Option('列' + String(i + 1), i);
                        }
                    } else {
                        if (basicSetup.getRowArray().length > 0) {
                            colArray = basicSetup.getRowArray()[0].split(basicSetup.getColSplit(), basicSetup.getColRowNum());
                            for (var i = 0; i < colArray.length; ++i) {
                                parameterValueColSelect.options[i] = new Option(colArray[i], i);
                            }
                        }
                    }

                    $("#judgeMinusDiv").hide();

                    $('#parameterView').on("change", "#calOperateSelect", function () {
                        if ($("#calOperateSelect").val() == "-" || $("#calOperateSelect").val() == "/") {
                            $("#judgeMinusDiv").show();
                        }
                        else {
                            $("#judgeMinusDiv").hide();
                        }
                    })

                    $("#parameterValue").show();
                    $("#parameterValueColSelect").hide();
                    $('#parameterView').on("change", "#parameterType", function () {
                        if ($("#parameterType").val() == "自定义") {
                            $("#parameterValue").show();
                            $("#parameterValueColSelect").hide();
                        }
                        else if ($("#parameterType").val() == "字段") {
                            $("#parameterValue").hide();
                            $("#parameterValueColSelect").show();
                        }

                    })

                    break;

                //数值筛选
                case 7:
                    $('#parameterView')[0].innerHTML += '<label class="field-label" style="padding-bottom: 3px;">' + ruleParameterArray[node.ID].labelName
                        + '<select id="operateSelectNum" class="gui-input" style="width: 70%;margin-bottom: 5px;margin-left:10px""></select>' + '</label>';
                    var operateSelect = document.getElementById("operateSelectNum");
                    for (var i = 0; i < ruleParameterArray[node.ID].dateFormatArray.length; ++i) {
                        operateSelect.options[i] = new Option(ruleParameterArray[node.ID].dateFormatArray[i], i + 1);
                    }
                    $('#parameterView')[0].innerHTML += '<label class="field-label" style="padding-bottom: 3px">参数：'
                        + '<select id="parameterTypeNumFliter" class="gui-input" style="width: 70%;margin-bottom: 5px;margin-left:23px">' +
                        '<option value="自定义">自定义</option><option value="字段">字段</option></select></label>';
                    $('#parameterView')[0].innerHTML += '<label class="field-label" style="padding-bottom: 3px">参数值：' +
                        '<input type="text" id="parameterValueNumFliter" style="margin-left:10px;display: inline">' +
                        '<select id="parameterValueNumFliterColSelect" style="width: 70%;margin-left:10px;display: none"></select></label>';
                    $('#parameterView')[0].innerHTML += '<label class="field-label" style="padding-bottom: 3px">筛选策略：'
                        + '<input type="radio" checked name="NumfilterWay" value="1" style="margin-left:10px">保留'
                        + '<input type="radio" name="NumfilterWay" value="0" style="margin-left:10px">丢弃</label>';
                    $('#parameterView')[0].innerHTML += '<label class="field-label" style="padding-bottom: 3px">'
                        + '<input type="checkbox" id="ifOutputDiscardNum" style="margin-bottom: 5px;margin-left:60px">输出被丢弃的部分'
                        + '</label>'

                    var parameterValueNumFliterColSelect = document.getElementById("parameterValueNumFliterColSelect");
                    if (!basicSetup.getIsFirstRowHead()) {
                        for (var i = 0; i < basicSetup.getColNum(); ++i) {
                            parameterValueNumFliterColSelect.options[i] = new Option('列' + String(i + 1), i);
                        }
                    }
                    else {
                        if (basicSetup.getRowArray().length > 0) {
                            colArray = basicSetup.getRowArray()[0].split(basicSetup.getColSplit(), basicSetup.getColRowNum());
                            for (var i = 0; i < colArray.length; ++i) {
                                parameterValueNumFliterColSelect.options[i] = new Option(colArray[i], i);
                            }
                        }
                    }

                    $("#parameterValueNumFliter").show();
                    $("#parameterValueNumFliterColSelect").hide();
                    $('#parameterView').on("change", "#parameterTypeNumFliter", function () {
                        if ($("#parameterTypeNumFliter").val() == "自定义") {
                            $("#parameterValueNumFliter").show();
                            $("#parameterValueNumFliterColSelect").hide();
                        }
                        else if ($("#parameterTypeNumFliter").val() == "字段") {
                            $("#parameterValueNumFliter").hide();
                            $("#parameterValueNumFliterColSelect").show();
                        }

                    })

                    break;

                default :
                    break;
            }
        }

        function initParameterViewForClass4(node, ruleParameterArray, isNeedSetParams, paramsArray) {
            $('#parameterView').empty();
            switch (node.ID) {
                case 1013:
                    initParameterViewForRule1013(isNeedSetParams, paramsArray);
                    break;
                default:
                    break;
            }
        }

        function initParameterViewForClass5(node, ruleParameterArray) {
            var selectHtml = ('<select id="setvalue-select" class="gui-input" style="width: 63%; margin-bottom: 5px; display: inline;">');
            //selectHtml += '<option></option>';
            _.each(ruleParameterArray[node.ID].typeArray, function (item) {
                selectHtml += ('<option value="' + item.value + '">' + item.caption + '</option>');
            });
            selectHtml += '</select>';

            $('#parameterView')[0].innerHTML = selectHtml + '<div id="hideDiv">' + '<label class="field-label">' + ruleParameterArray[node.ID].labelName + '</label>'
                + '<input type="text" id="parameterInput" class="gui-input" style="width: 90%">';
            if (ruleParameterArray[node.ID].isCaseSensitive)
                $('#parameterView')[0].innerHTML += ' <label class="checkbox"><input unchecked id="caseSensitiveCheckbox" type="checkbox">忽略大小写</label>';
            if (ruleParameterArray[node.ID].labelName1 != undefined)
                $('#parameterView')[0].innerHTML += '<label class="field-label">' + ruleParameterArray[node.ID].labelName1 + '</label>'
                    + '<input type="text" id="parameterInput1" class="gui-input" style="width: 90%"></div>';

            $('#parameterView').on("change", "#setvalue-select", function () {
                if ($("#setvalue-select").val() == '1') {
                    $('#hideDiv').show();
                }
                else {
                    $('#hideDiv').hide();
                }
            });
        }

        function initParameterViewForRule1013(isNeedSetParams, paramsArray) {
            $('#parameterView').append(transformRule);

            var codeTableHtml = ('<select id="codetable-select" class="gui-input" style="width: 63%; margin-bottom: 5px; display: inline;">');
            codeTableHtml += '<option></option>';
            _.each(codeTableData, function (item) {
                codeTableHtml += ('<option codeField="' + item.codeField + '" tableName="' + item.tableName
                + '" valueField="' + item.valueField + '" tableCaption ="' + item.tableCaption + '" value="'
                + item.tableCaption + '">'
                + item.tableCaption + '</option>');
            });
            codeTableHtml += '</select>';

            $('#codeTableDiv').empty();
            $('#codeTableDiv').append(codeTableHtml);

            if (isNeedSetParams) {
                //if (paramsArray[2] == "0")
                {
                    $('#codetable-select option[value="' + paramsArray[6] + '"]').attr("selected", "true");
                    $('#transform-type   option[value="' + paramsArray[2] + '"]').attr("selected", "true");
                    $('#transform-error   option[value="' + paramsArray[1] + '"]').attr("selected", "true");
                }

                if ($("#transform-type").val() == "0") {
                    $("#codeTableDiv").show();
                    $("#fileDiv").hide();

                    var tableName = $("#codetable-select")[0].selectedOptions[0].getAttribute('tableName');
                    console.log("tableName", tableName);
                    $.post("/datamanage/importbatch/GetCodeTableInfo", {
                        "tableName": tableName,
                    }, function (rsp) {
                        var rspData = $.parseJSON(rsp);
                        if (rspData.code == 0) {
                            console.log("GetCodeTableInfo", rspData.data.codeValues);
                            //codeTableData = rsp.data.codeValues;
                            getruleparams.setCurCodeArray(rspData.data.codeValues);
                        }
                        else {
                            console.log("获取代码表内容信息失败, err msg:" + rspData.message);
                            Notify.show({
                                title: "获取代码表内容信息失败！",
                                type: "error"
                            });
                        }
                    });
                }
                else {
                    $("#codeTableDiv").hide();
                    $("#fileDiv").show();
                    $("#transform-file-input").attr("value", paramsArray[3]);
                }
            }

            $('#parameterView').on("change", "#transform-type", function () {
                if ($("#transform-type").val() == "0") {
                    $("#codeTableDiv").show();
                    $("#fileDiv").hide();

                    var tableName = $("#codetable-select")[0].selectedOptions[0].getAttribute('tableName');
                    console.log("tableName", tableName);
                    $.post("/datamanage/importbatch/GetCodeTableInfo", {
                        "tableName": tableName,
                    }, function (rsp) {
                        var rspData = $.parseJSON(rsp);
                        if (rspData.code == 0) {
                            console.log("GetCodeTableInfo", rspData.data.codeValues);
                            //codeTableData = rsp.data.codeValues;
                            getruleparams.setCurCodeArray(rspData.data.codeValues);
                        }
                        else {
                            console.log("获取代码表内容信息失败, err msg:" + rspData.message);
                            Notify.show({
                                title: "获取代码表内容信息失败！",
                                type: "error"
                            });
                        }
                    });
                }
                else {
                    $("#codeTableDiv").hide();
                    $("#fileDiv").show();
                    $("#transform-file-input").attr("value", "");
                }
            });

            $('#parameterView').on("click", "#transform-file-btn", function () {
                var obj = $("#transform-file-btn")[0];
                console.log("click obj", obj);
                if (obj) {
                    $("#transform-file-input").attr("value", obj.files.item(0).name);
                    txtParse(obj.files[0]);
                }
            });

            $('#parameterView').on("change", "#transform-file-btn", function () {
                var obj = $("#transform-file-btn")[0];
                console.log("change obj", obj);
                if (obj) {
                    $("#transform-file-input").attr("value", obj.files.item(0).name);
                    txtParse(obj.files[0]);
                }
            });

            //$("#transform-file-btn").unbind("change", transformFileChanged);
            //$("#transform-file-btn").bind("change", transformFileChanged);
            $('#parameterView').on("change", "#codetable-select", function () {
                var tableName = $("#codetable-select")[0].selectedOptions[0].getAttribute('tableName');
                console.log("tableName", tableName);
                $.post("/datamanage/importbatch/GetCodeTableInfo", {
                    "tableName": tableName,
                }, function (rsp) {
                    var rspData = $.parseJSON(rsp);
                    if (rspData.code == 0) {
                        console.log("GetCodeTableInfo", rspData.data.codeValues);
                        //codeTableData = rsp.data.codeValues;
                        getruleparams.setCurCodeArray(rspData.data.codeValues);
                    }
                    else {
                        console.log("获取代码表内容信息失败, err msg:" + rspData.message);
                        Notify.show({
                            title: "获取代码表内容信息失败！",
                            type: "error"
                        });
                    }
                });

            });
        }

        function transformFileChanged() {
            var obj = $("#transform-file-btn")[0];
            console.log("obj", obj);
            if (obj) {
                $("#transform-file-input").attr("value", obj.files.item(0).name);
                txtParse(obj.files[0]);
            }
        }

        function txtParse(file) {
            var viewSize = 8 * 5000 * 100 * 10000;
            var viewText = file.slice(0, viewSize);
            var codeArray = new Array();
            var read = new FileReader();
            read.readAsText(viewText, "UTF-8");
            read.onload = function (e) {
                var textContent = this.result;
                var isFirstRowHead = false;
                var rowSplit = "\r\n";
                var colSplit = "\t";
                codeArray = splitfile(textContent, isFirstRowHead, rowSplit, colSplit);
                getruleparams.setCurCodeArray(codeArray);
            }
        }

        function splitfile(textContent, isFirstRowHead, rowSplit, colSplit) {
            var codeArray = new Array();
            var rowArray = textContent.split(rowSplit, 100000);
            if (rowArray.length - 1 < 0) {
                Notify.show({
                    title: "文件切分失败，可能是行列分割符设置错误！",
                    type: "error"
                });
            }
            for (var i = 0; i < rowArray.length; ++i) {
                var colArray = rowArray[i].split(colSplit, 2);
                codeArray.push(new Object({
                    'key': colArray[0],
                    'value': colArray[1],
                }));
            }
            return codeArray;
        }

        return {
            initConditionNames: initConditionNames,
            initRuleParameterArray: initRuleParameterArray,
            initRuleClassArray: initRuleClassArray,
            initParameterViewForClass1: initParameterViewForClass1,
            initParameterViewForClass2: initParameterViewForClass2,
            initParameterViewForClass3: initParameterViewForClass3,
            initParameterViewForClass4: initParameterViewForClass4,
            initParameterViewForClass5: initParameterViewForClass5,
        }

    });
