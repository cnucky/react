/**
 * Created by root on 3/14/16.
 */
define(['../../dm/dataimport/dm-getruleparams',
        '../../dm/dataimport/dm-preview-util'],
    function (getruleparams, previewUtil) {
        function setParamsForClass1(nodeInfo, ruleParameterArray, selectedRulesOfCurCol) {
            switch (ruleParameterArray[nodeInfo.ID].parameterNum) {
                case 1:
                    $("#parameterInput")[0].value = selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[0];
                    break;
                case 2:
                    $("#parameterInput")[0].value = selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[1];
                    if (selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[0] == "1")
                        $("#caseSensitiveCheckbox")[0].checked = 'checked';
                    //curSelectedRuleArray.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[1];
                    else
                        $("#caseSensitiveCheckbox")[0].checked = "unchecked";
                    break;
                case 3:
                    $("#parameterInput")[0].value = selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[1];
                    $("#parameterInput1")[0].value = selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[2];
                    if (selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[0] == "1")
                        $("#caseSensitiveCheckbox")[0].checked = true;
                    //'checked';//curSelectedRuleArray.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[1];
                    else
                        $("#caseSensitiveCheckbox")[0].checked = false;
                    //"unchecked";
                    break;
                default :
                    break;
            }
        }

        function setParamsForClass2(nodeInfo, ruleParameterArray, selectedRulesOfCurCol) {
            switch (ruleParameterArray[nodeInfo.ID].parameterNum) {
                case 2:
                    $("#parameterSelect")[0].options[selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[0] - 1].
                        selected = true;
                    break;
                default :
                    break;
            }
        }

        function setParamsForClass3(nodeInfo, ruleParameterArray, selectedRulesOfCurCol) {
            switch (ruleParameterArray[nodeInfo.ID].type) {
                case 1:
                    if (ruleParameterArray[nodeInfo.ID].isCaseSensitive) {
                        if (selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[0] == "1")
                            $("#caseSensitiveCheckbox")[0].checked = true;
                        else
                            $("#caseSensitiveCheckbox")[0].checked = false;
                    }

                    for (var i = 0; i < ruleParameterArray[nodeInfo.ID].lableArray.length; ++i) {
                        var elementId = ruleParameterArray[nodeInfo.ID].lableArray[i];
                        var colAddSelect = document.getElementById(elementId);
                        if (selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[i + 2] == "1")
                            colAddSelect.checked = true;
                        else
                            colAddSelect.checked = false;
                    }

                    //m_paramsArray最后一个元素保存其他输入框的值
                    if (ruleParameterArray[nodeInfo.ID].other.length > 0) {
                        if (selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].
                                m_paramsArray[selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].
                                m_paramsArray.length - 2] == "1")
                            $("#otherCheckbox")[0].checked = true;
                        else
                            $("#otherCheckbox")[0].checked = false;
                        var otherStr = selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].
                            m_paramsArray[selectedRulesOfCurCol.
                            ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray.length - 1];
                        // console.log(changeUnvisibleCode(otherStr));
                        previewUtil.changeUnvisibleCode(otherStr);
                        $("#isHexData")[0].checked = previewUtil.changeHexCheck(otherStr);
                        $("#parameterInput1")[0].value = previewUtil.changeUnvisibleCode(otherStr);
                    }
                    break;

                case 2:
                    $("#colAddSelect")[0].selectedIndex = selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].
                            m_inputColNamesArray[1] - 1;
                    if (ruleParameterArray[nodeInfo.ID].isCaseSensitive) {
                        if (selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[0] == "1")
                            $("#caseSensitiveCheckbox")[0].checked = true;
                        else
                            $("#caseSensitiveCheckbox")[0].checked = false;
                    }

                    if (selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[1]
                        < ruleParameterArray[nodeInfo.ID].lableArray.length) {
                        var elementId = ruleParameterArray[nodeInfo.ID].
                            lableArray[selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[1]];
                        var colAddSelect = document.getElementById(elementId);
                        colAddSelect.checked = true;
                    }

                    if (ruleParameterArray[nodeInfo.ID].other.length > 0) {
                        if (selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[1]
                            >= ruleParameterArray[nodeInfo.ID].lableArray.length)
                            $("#otherCheckbox")[0].checked = true;
                        else
                            $("#otherCheckbox")[0].checked = false;
                        $("#parameterInput1")[0].value =
                            selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray.length - 1];
                    }
                    break;

                case 3:
                    console.log(selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray);
                    if (selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[0] == "1") {
                        $("#supplyEnough")[0].checked = true;
                    }
                    $("#formatStringLength").val(selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[1]);
                    if (selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[2] == "1") {
                        $('input[name="supplyFromHeadOrTail"]')[1].checked = true;
                    }
                    else if (selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[2] == "0") {
                        $('input[name="supplyFromHeadOrTail"]')[0].checked = true;
                    }

                    $("#parameterInput").val(selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[3]);//参数3

                    //参数4
                    if (selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[4] == "1") {
                        $('input[name="cutFromHeadOrTail"]')[1].checked = true;
                    }
                    else if (selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[4] == "0") {
                        $('input[name="cutFromHeadOrTail"]')[0].checked = true;
                    }
                    break;
                case 4:
                    //参数0
                    if (selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[0] == "0") {
                        $('input[name="firstFromHeadOrTail"]')[1].checked = true;
                    }
                    else if (selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[0] == "1") {
                        $('input[name="firstFromHeadOrTail"]')[0].checked = true;
                    }
                    $("#firstPosition").val(selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[1]);//参数1
                    //参数2
                    if (selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[2] == "0") {
                        $('input[name="lastFromHeadOrTail"]')[1].checked = true;
                    }
                    else if (selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[2] == "1") {
                        $('input[name="lastFromHeadOrTail"]')[0].checked = true;
                    }
                    $("#lastPosition").val(selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[3]);//参数3
                    break;
                case 5:
                    //参数0
                    if (selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[0] == "0") {
                        $('input[name="filterWay"]')[1].checked = true;
                    }
                    else if (selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[0] == "1") {
                        $('input[name="filterWay"]')[0].checked = true;
                    }
                    //回填值
                    $("#textEditValue").val(selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[2]);
                    //回填操作符
                    $("#operateSelect").val(selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[4]);

                    break;
                case 6:
                    $("#calOperateSelect").val(previewUtil.changeNumToOperation(selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[0]));//参数0

                    //参数二即分辨是字段还是自定义
                    if (selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[2] == 0) {
                        $("#parameterType").val("自定义");
                    }
                    else if (selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[2] == 1) {
                        $("#parameterType").val("字段");
                    }


                    if (selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[0] == "-" || selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[0] == "/") {
                        $("#judgeMinusDiv").show();
                        if (selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[1] == "1") {
                            $("#isMinuendOrDividend")[0].checked = true;
                        }
                        else {
                            $("#isMinuendOrDividend")[0].checked = false;
                        }
                    }
                    else {
                        $("#judgeMinusDiv").hide();
                    }
                    if (selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[2] == "0") {//自定义
                        $("#parameterValue").show();
                        $("#parameterValueColSelect").hide();
                        $("#parameterValue").val(selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[3]);
                    }
                    else if (selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[2] == "1") {
                        $("#parameterValue").hide();
                        $("#parameterValueColSelect").show();
                        $("#parameterValueColSelect")[0].selectedIndex = selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_inputColNamesArray[1] - 1;
                    }
                    break;

                case 7:
                    //参数0
                    if (selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[0] == "0") {
                        $('input[name="NumfilterWay"]')[1].checked = true;
                    }
                    else if (selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[0] == "1") {
                        $('input[name="NumfilterWay"]')[0].checked = true;
                    }
                    //参数1
                    $("#operateSelectNum")[0].selectedIndex = selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[1] - 1;
                    //参数二即分辨是字段还是自定义
                    if (selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[2] == 0) {
                        $("#parameterTypeNumFliter").val("自定义");
                    }
                    else if (selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[2] == 1) {
                        $("#parameterTypeNumFliter").val("字段");
                    }
                    //参数三
                    if (selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[2] == "0") {//自定义
                        $("#parameterValueNumFliter").show();
                        $("#parameterValueNumFliterColSelect").hide();
                        $("#parameterValueNumFliter").val(selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[3]);
                    }
                    else if (selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[2] == "1") {
                        $("#parameterValueNumFliter").hide();
                        $("#parameterValueNumFliterColSelect").show();
                        $("#parameterValueNumFliterColSelect")[0].selectedIndex = selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_inputColNamesArray[1] - 1;
                    }
                    //参数四被丢弃的部分是否输出
                    if (selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[4] == "1") {
                        $("#ifOutputDiscardNum")[0].checked = true;
                    }
                    else {
                        $("#ifOutputDiscardNum")[0].checked = false;
                    }
                    break;

                default :
                    break;
            }
        }

        function setParamsForClass4(nodeInfo, ruleParameterArray, selectedRulesOfCurCol) {
            switch (nodeInfo.ID+'_'+nodeInfo.seq) {
                case 1013:
                    console.log("selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq]", selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq]);
                    paramsArray = selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray;
                    if (paramsArray[0] == 1) {
                        $("#caseSensitiveCheckbox")[0].checked = true;
                    }
                    else {
                        $("#caseSensitiveCheckbox")[0].checked = false;
                    }
                    $('#transform-error option[value="' + paramsArray[1] + '"]').attr("selected", "true");
                    $('#transform-type option[value="' + paramsArray[2] + '"]').attr("selected", "true");
                    if ($("#transform-type").val() == "0") {
                        $("#codeTableDiv").show();
                        //$('#codetable-select option[value="'+ paramsArray[6] + '"]').attr("selected", "true");
                        $("#fileDiv").hide();
                    }
                    else {
                        $("#codeTableDiv").hide();
                        $("#fileDiv").show();
                        $("#transform-file-input")[0].value = paramsArray[3];
                        getruleparams.setCurCodeArray(selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_codeArray);
                    }
                    break;
                default :
                    break;
            }
        }

        function setParamsForClass5(nodeInfo, ruleParameterArray, selectedRulesOfCurCol) {
            switch (ruleParameterArray[nodeInfo.ID].parameterNum) {
                case 2:
                    $('#setvalue-select option[value="' + selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[0] + '"]').attr("selected", "true");
                    if (selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[0] == "1") {
                        $('#hideDiv').show();
                        $("#parameterInput")[0].value = selectedRulesOfCurCol.ruleInfos[nodeInfo.ID+'_'+nodeInfo.seq].m_paramsArray[1];
                    }
                    else
                        $('#hideDiv').hide();
                    break;
                default :
                    break;
            }
        }

        return {
            setParamsForClass1: setParamsForClass1,
            setParamsForClass2: setParamsForClass2,
            setParamsForClass3: setParamsForClass3,
            setParamsForClass4: setParamsForClass4,
            setParamsForClass5: setParamsForClass5,
        }

    });