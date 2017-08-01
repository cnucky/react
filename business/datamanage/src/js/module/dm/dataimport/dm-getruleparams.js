/**
 * Created by root on 3/14/16.
 */

define(['../../dm/dataimport/dm-preview-util', 'nova-notify'],
    function (previewUtil, Notify) {
        var curCodeArray = new Array();

        function getParamsForClass1(ruleID, ruleParameterArray, selectedRulesOfCurCol, seq) {
            var paramsArray = new Array();

            switch (ruleParameterArray[ruleID].parameterNum) {
                case 1:
                    paramsArray.push($("#parameterInput")[0].value);
                    break;
                case 2:
                    if ($("#caseSensitiveCheckbox").prop("checked") == true)
                        paramsArray.push("1");
                    else
                        paramsArray.push("0");
                    paramsArray.push($("#parameterInput")[0].value);
                    break;
                case 3:
                    if ($("#caseSensitiveCheckbox").prop("checked") == true)
                        paramsArray.push("1"); //paramsArray.push(true);
                    else
                        paramsArray.push("0"); //paramsArray.push(false);
                    paramsArray.push($("#parameterInput")[0].value);
                    paramsArray.push($("#parameterInput1")[0].value);
                    break;
                default :
                    break;
            }

            return paramsArray;
        }

        function getParamsForClass2(ruleID, ruleParameterArray, selectedRulesOfCurCol, seq) {
            var paramsArray = new Array();

            switch (ruleParameterArray[ruleID].parameterNum) {
                case 2:
                    paramsArray.push($("#parameterSelect")[0].value);
                    break;
                default :
                    break;
            }

            return paramsArray;
        }

        function getParamsForClass3(ruleID, ruleParameterArray, selectedRulesOfCurCol, seq) {
            var paramsArray = new Array();

            switch (ruleParameterArray[ruleID].type) {
                //删除首尾字符, 移除指定字符
                case 1:
                    if (ruleParameterArray[ruleID].isCaseSensitive) {
                        if ($("#caseSensitiveCheckbox").prop("checked") == true) //0
                            paramsArray.push("1");
                        else
                            paramsArray.push("0");
                    }

                    var str = "";
                    paramsArray.push(str);

                    for (var i = 0; i < ruleParameterArray[ruleID].lableArray.length; ++i) {
                        var elementId = ruleParameterArray[ruleID].lableArray[i];
                        var colAddSelect = document.getElementById(elementId);
                        if (colAddSelect.checked) {
                            paramsArray.push("1");
                            paramsArray[1] += ruleParameterArray[ruleID].signArray[i];
                        }
                        else
                            paramsArray.push("0");
                    }

                    if (ruleParameterArray[ruleID].other.length > 0) {
                        if ($("#otherCheckbox").prop("checked") == true) {
                            if ($("#isHexData").prop("checked") == false) {
                                paramsArray.push("1");
                                if($("#parameterInput1")[0].value == undefined || $("#parameterInput1")[0].value.length <= 0){
                                    Notify.show({
                                        title: "参数输入值非法或者为空，请重新设置！",
                                        type: "error"
                                    });
                                }

                                paramsArray[1] += $("#parameterInput1")[0].value;
                                paramsArray.push($("#parameterInput1")[0].value);
                            }
                            else {
                                paramsArray.push("1");
                                paramsArray[1] += previewUtil.hexToString($("#parameterInput1").val().trim());
                                paramsArray.push(previewUtil.hexToString($("#parameterInput1").val().trim()));
                            }
                        }
                        else {
                            paramsArray.push("0");
                            paramsArray.push($("#parameterInput1")[0].value);
                        }
                        //paramsArray.push($("#parameterInput1")[0].value);
                        console.log(paramsArray);

                    }
                    break;

                //添加其他字段作为前缀， 添加其他字段作为后缀
                case 2:
                    selectedRulesOfCurCol.ruleInfos[ruleID+ '_' + seq].m_inputColNamesArray.push(Number($("#colAddSelect")[0].value) + 1);
                    if (ruleParameterArray[ruleID].isCaseSensitive) {
                        if ($("#caseSensitiveCheckbox").prop("checked") == true) //0
                            paramsArray.push("1");
                        else
                            paramsArray.push("0");
                    }

                    var str = "";
                    paramsArray.push(str);

                    for (var i = 0; i < ruleParameterArray[ruleID].lableArray.length; ++i) {
                        var elementId = ruleParameterArray[ruleID].lableArray[i];
                        var colAddSelect = document.getElementById(elementId);
                        if (colAddSelect.checked) {
                            paramsArray.push(String(i));
                            paramsArray[0] = ruleParameterArray[ruleID].signArray[i];
                        }
                    }

                    if (ruleParameterArray[ruleID].other.length > 0) {
                        if ($("#otherCheckbox").prop("checked") == true) {
                            paramsArray.push(String(ruleParameterArray[ruleID].lableArray.length));
                            paramsArray.push(String(ruleParameterArray[ruleID].lableArray.length));
                            paramsArray[0] = $("#parameterInput1")[0].value;
                            if($("#parameterInput1")[0].value == undefined || $("#parameterInput1")[0].value.length <= 0){
                                Notify.show({
                                    title: "参数输入值非法或者为空，请重新设置！",
                                    type: "error"
                                });
                            }
                        }
                        else
                            paramsArray.push("0");

                        paramsArray.push($("#parameterInput1")[0].value);

                    }
                    break;

                //格式化字符串长度
                case 3:
                    if ($("#supplyEnough").prop("checked") == true) {
                        paramsArray.push("1");
                    }
                    else {
                        paramsArray.push("0");
                    }//参数0
                    if($("#formatStringLength").val() == undefined || $("#parameterInput1").val() <= 0){
                        Notify.show({
                            title: "参数输入值非法或者为空，请重新设置！",
                            type: "error"
                        });
                    }
                    paramsArray.push($("#formatStringLength").val());//参数1

                    paramsArray.push($('input[name="supplyFromHeadOrTail"]:checked').val());//参数2
                    paramsArray.push($("#parameterInput").val());//参数3
                    paramsArray.push($('input[name="cutFromHeadOrTail"]:checked').val());//参数4
                    console.log(paramsArray);
                    break;

                //提取字符串
                case 4:
                    paramsArray.push($('input[name="firstFromHeadOrTail"]:checked').val());//参数0
                    if($("#firstPosition").val() == undefined || $("#firstPosition").val() <= 0){
                        Notify.show({
                            title: "参数输入值非法或者为空，请重新设置！",
                            type: "error"
                        });
                    }
                    paramsArray.push($("#firstPosition").val());//参数1
                    paramsArray.push($('input[name="lastFromHeadOrTail"]:checked').val());//参数2
                    if($("#lastPosition").val() == undefined || $("#lastPosition").val() <= 0){
                        Notify.show({
                            title: "参数输入值非法或者为空，请重新设置！",
                            type: "error"
                        });
                    }
                    paramsArray.push($("#lastPosition").val());//参数3
                    break;

                //内容筛选
                case 5:
                    paramsArray.push($("input[name='filterWay']:checked").val());//参数0

                    paramsArray.push(previewUtil.getCondRegex($("#operateSelect").val(), $("#textEditValue").val()));//参数1

                    if($("#textEditValue").val() == undefined || $("#textEditValue").val() <= 0){
                        Notify.show({
                            title: "参数输入值非法或者为空，请重新设置！",
                            type: "error"
                        });
                    }
                    paramsArray.push($("#textEditValue").val());//参数2

                    if ($("#operateSelect").val().indexOf("非") !== -1 || $("#operateSelect").val().indexOf("不") !== -1) {
                        paramsArray.push("1");
                    }
                    else
                        paramsArray.push("0");//参数3

                    paramsArray.push($("#operateSelect").val());//参数4
                    break;

                //数值四则运算
                case 6:
                    paramsArray.push(previewUtil.changeArithmetic($("#calOperateSelect").val()));//参数0
                    if ($("#isMinuendOrDividend").prop("checked") == true) {
                        paramsArray.push("1");
                    }
                    else {
                        paramsArray.push("0");
                    }//参数1
                    if ($("#parameterType").val() == "自定义") {
                        paramsArray.push("0");
                        paramsArray.push($("#parameterValue").val());
                        if($("#parameterValue").val() == undefined || $("#parameterValue").val() <= 0){
                            Notify.show({
                                title: "参数输入值非法或者为空，请重新设置！",
                                type: "error"
                            });
                        }
                        //paramsArray.push($("#parameterType").val());
                    }
                    else if ($("#parameterType").val() == "字段") {
                        paramsArray.push("1");
                        var parameterValueColSelectIndex = (Number($("#parameterValueColSelect")[0].value) + 1).toString();
                        paramsArray.push(parameterValueColSelectIndex);
                        selectedRulesOfCurCol.ruleInfos[ruleID+ '_' + seq].m_inputColNamesArray.push(Number($("#parameterValueColSelect")[0].value) + 1);
                        // paramsArray.push($("#parameterType").val());
                    }
                    break;

                //数值筛选
                case 7:
                    paramsArray.push($("input[name='NumfilterWay']:checked").val());//参数0
                    paramsArray.push($("#operateSelectNum").val());//参数1
                    if ($("#parameterTypeNumFliter").val() == "自定义") {
                        paramsArray.push("0");//参数三
                        paramsArray.push($("#parameterValueNumFliter").val());//参数四
                        if($("#parameterValueNumFliter").val() == undefined || $("#parameterValueNumFliter").val() <= 0){
                            Notify.show({
                                title: "参数输入值非法或者为空，请重新设置！",
                                type: "error"
                            });
                        }
                    }
                    else if ($("#parameterTypeNumFliter").val() == "字段") {
                        paramsArray.push("1");
                        var parameterValueColSelectIndex = (Number($("#parameterValueNumFliterColSelect")[0].value) + 1).toString();
                        paramsArray.push(parameterValueColSelectIndex);//参数三
                        selectedRulesOfCurCol.ruleInfos[ruleID+ '_' + seq].m_inputColNamesArray.push(Number($("#parameterValueNumFliterColSelect")[0].value) + 1);
                        //参数四
                    }
                    if ($("#ifOutputDiscardNum").prop("checked") == true) {
                        paramsArray.push("1");
                    }
                    else {
                        paramsArray.push("0");
                    }
                    break;

                default :
                    break;
            }

            return paramsArray;
        }

        function getParamsForClass4(ruleID, ruleParameterArray, selectedRulesOfCurCol, seq) {
            var paramsArray = new Array();
            var codeArray = new Array();

            switch (ruleID) {
                case 1013:
                    if ($("#caseSensitiveCheckbox").prop("checked") == true) {//参数1
                        paramsArray.push("1");
                    }
                    else {
                        paramsArray.push("0");
                    }
                    paramsArray.push($("#transform-error")[0].value);//参数2
                    paramsArray.push($("#transform-type")[0].value);//参数3
                    switch ($("#transform-type")[0].value) {
                        case "0":
                            paramsArray.push($("#codetable-select")[0].selectedOptions[0].getAttribute('tableName'));
                            paramsArray.push($("#codetable-select")[0].selectedOptions[0].getAttribute('codeField'));
                            paramsArray.push($("#codetable-select")[0].selectedOptions[0].getAttribute('valueField'));
                            paramsArray.push($("#codetable-select")[0].selectedOptions[0].getAttribute('tableCaption'));
                            codeArray = curCodeArray;
                            break;
                        case "1":
                            paramsArray.push($("#transform-file-input").val()); //文件名
                            var file = $("#transform-file-btn")[0].files[0];
                            if (file == undefined && curCodeArray.length > 0) {
                                codeArray = curCodeArray;
                                break;
                            }
                            if (file == undefined) {
                                Notify.show({
                                    title: "未能读取到转换文件！",
                                    type: "error"
                                });
                                break;
                            }
                            if (file.type.indexOf("text") >= 0) {//文本文件
                                codeArray = curCodeArray; //txtParse(file);
                            }
                            else {
                                Notify.show({
                                    title: "暂时只支持文本文件(.txt)！",
                                    type: "error"
                                });
                            }
                            break;
                        default:
                            break;
                    }
                    break;
                default :
                    break;
            }

            var res = new Object({
                paramsArray: paramsArray,
                codeArray: codeArray,
            });
            console.log("getParamsForClass4paramsArray", res);
            return res;
        }

        function getParamsForClass5(ruleID, ruleParameterArray, selectedRulesOfCurCol, seq) {
            var paramsArray = new Array();

            switch (ruleParameterArray[ruleID].parameterNum) {
                case 2:
                    paramsArray.push($("#setvalue-select").val());
                    if ($("#setvalue-select").val() == '1') {
                        paramsArray.push($("#parameterInput")[0].value.trim());
                    }
                    break;
                default :
                    break;
            }

            return paramsArray;
        }

        function setCurCodeArray(codeArray) {
            curCodeArray = codeArray;
            console.log("curCodeArray", curCodeArray);
        }

        return {
            getParamsForClass1: getParamsForClass1,
            getParamsForClass2: getParamsForClass2,
            getParamsForClass3: getParamsForClass3,
            getParamsForClass4: getParamsForClass4,
            getParamsForClass5: getParamsForClass5,
            setCurCodeArray: setCurCodeArray,
        }

    });