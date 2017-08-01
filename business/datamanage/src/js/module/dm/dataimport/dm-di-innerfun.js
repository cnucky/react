/**
 * Created by root on 3/15/16.
 */

define(['../../dm/dataimport/dm-preview-util'],
    function (previewUtil) {
        //获取预处理设置的条件
        function getConditions(conditionNames) {
            if (conditionNames == undefined || conditionNames.length <= 0)
                conditionNames = initConditionNames();

            var conditionsTable = document.getElementById("conditionsTable");

            var conditionArray = new Array();
            if (conditionsTable != undefined && conditionsTable.rows != undefined){//$('#conditionView')[0].innerHTML.length > 0) {
                for (var i = 1; i < conditionsTable.rows.length; ++i) {
                    var condCode = conditionsTable.rows[i].cells[0].childNodes[0].value;
                    conditionArray.push(new Object({
                            "m_conditionName": condCode,
                            "m_argu": conditionsTable.rows[i].cells[1].childNodes[0].value.trim(),
                            "m_regex": previewUtil.getCondRegex(condCode, conditionsTable.rows[i].cells[1].childNodes[0].value.trim()),
                            "m_not": previewUtil.getm_not(condCode)
                        })
                    );
                }
            }

            return conditionArray;
        }

        function initConditionNames() {
            //var conditionNames = new Array();
            return ["包含", "不包含",
                "长度大于", "长度等于", "长度小于", "为空",
                "以...结尾", "不以...结尾",
                "以...开头", "不以...开头",
                "不为空"];
        }

        function getInputCols(curColIndex, ruleClass) {
            var inputColsArray = new Array();
            switch (ruleClass) {
                case 0:
                    inputColsArray.push(curColIndex + 1);
                    break;
                case 1:
                    inputColsArray.push(curColIndex + 1);
                    break;
                default :
                    inputColsArray.push(curColIndex + 1);
                    break;
            }

            return inputColsArray;
        }

        //获取预处理规则的类别
        function getRuleClass(ruleClassArray, ruleID) {
            for (var i = 0; i < ruleClassArray.length; ++i) {
                if (previewUtil.in_array(ruleClassArray[i], ruleID))
                    return i;
            }
            return -1;
        }

        function setClassForCurSelectedCol(curColIndex) {
            if (curColIndex >= 0) {
                var tableRows = $("#preView-Table tbody tr");
                var td;
                for (var i = 0; i < tableRows.length; ++i) {
                    if($("#preView-Table")[0].rows[i].cells[curColIndex] != undefined){
                        td = $("#preView-Table")[0].rows[i].cells[curColIndex].classList;
                        td.add('preViewColSelected');
                        td.remove('settedPreRules');
                        td.remove('newAddCol');
                    }
                }
            }
        }

        function setClassForSelectedRules(colsIndex) {
            if (colsIndex.length >= 0) {
                var tableRows = $("#preView-Table tbody tr");
                for (var index = 0; index < colsIndex.length; ++index) {
                    for (var i = 0; i < tableRows.length; ++i) {
                        if($("#preView-Table")[0].rows[i].cells[colsIndex[index]]!=null) {
                            if($("#preView-Table")[0].rows[i].cells[colsIndex[index]] != undefined){
                                td = $("#preView-Table")[0].rows[i].cells[colsIndex[index]].classList;
                                td.add('settedPreRules');
                            }
                        }
                    }
                }
            }
        }

        function setClassForNewAddCol(colsIndex) {
            if (colsIndex.length >= 0) {
                var tableRows = $("#preView-Table tbody tr");
                for (var index = 0; index < colsIndex.length; ++index) {
                    for (var i = 0; i < tableRows.length; ++i) {
                        if($("#preView-Table")[0].rows[i].cells[colsIndex[index]]!=null) {
                            if($("#preView-Table")[0].rows[i].cells[colsIndex[index]] != undefined){
                                td = $("#preView-Table")[0].rows[i].cells[colsIndex[index]].classList;
                                td.remove('settedPreRules');
                                td.add('newAddCol');
                            }
                        }
                    }
                }
            }
        }

        function setFileEcodingForDJ(){
            setEncoding('UTF-8');
            $("#fileEcoding-Select")[0].disabled = true;
            $("#fileEcodingSpan")[0].innerHTML = '对接任务的文件编码只支持UTF-8!';
        }

        function cancelFileEcodingForDJ(){
            $("#fileEcoding-Select")[0].selectedIndex = 0;
            $("#fileEcoding-Select")[0].disabled = false;
            $("#fileEcodingSpan")[0].innerHTML = '文件编码，必须设置。';
        }

        function setEncoding(encoding) {
            if (encoding != undefined) {
                for (var i = 0; i < $("#fileEcoding-Select")[0].options.length; ++i) {
                    if ($("#fileEcoding-Select")[0].options[i].value == encoding) {
                        $("#fileEcoding-Select")[0].selectedIndex = i;
                        return;
                    }
                }
            }
        }

        function checkColHasSetRuls(selectedRulesOfAllCols, i){
            if (selectedRulesOfAllCols[i] != undefined && selectedRulesOfAllCols[i].selectRulesList != undefined
                && selectedRulesOfAllCols[i].selectRulesList[0].nodes.length > 0) {
                return true;
            }
            else{
                return false;
            }
        }

        return {
            getConditions: getConditions,
            getInputCols: getInputCols,
            getRuleClass: getRuleClass,
            setClassForCurSelectedCol: setClassForCurSelectedCol,
            setClassForSelectedRules: setClassForSelectedRules,
            setFileEcodingForDJ: setFileEcodingForDJ,
            cancelFileEcodingForDJ: cancelFileEcodingForDJ,
            checkColHasSetRuls: checkColHasSetRuls,
            setClassForNewAddCol: setClassForNewAddCol
        }

    });