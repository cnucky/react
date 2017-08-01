/**
 * Created by root on 3/14/16.
 */

define([], function () {
    //判断操作符中是否含有“非”
    function getm_not(condCode) {
        if (condCode.indexOf("非") !== -1 || condCode.indexOf("不") !== -1) {
            return 1;
        }
        else
            return 0;
    }

    //将+-*/变成1、2、3、4
    function changeArithmetic(operation) {
        switch (operation) {
            case "+" :
                return "1";
                break;
            case "-" :
                return "2";
                break;
            case "*" :
                return "3";
                break;
            case "/" :
                return "4";
                break;

            default :
                return;
        }
    }

    //将1、2、3、4变成+-*/
    function changeNumToOperation(num) {
        switch (num) {
            case "1" :
                return "+";
                break;
            case "2" :
                return "-";
                break;
            case "3" :
                return "*";
                break;
            case "4" :
                return "/";
                break;

            default :
                return;
        }
    }

    //判断不可见字符含有不可见字符的话返回true
    function changeHexCheck(str) {
        for (var i = 0; i < str.length; i++) {
            if ((str.charCodeAt(i) >= 0 && str.charCodeAt(i) < 32) || str.charCodeAt(i) == 127) {
                return true;
            }
        }
        return false;
    }

    //将含有不可见字符的字符串转化成十六进制可见字符
    function changeUnvisibleCode(str) {
        var val = "";
        for (var i = 0; i < str.length; i++) {
            // console.log(str.charCodeAt(i).toString(16));
            if (str.charCodeAt(i) >= 0 && str.charCodeAt(i) < 16) {
                val += "0" + str.charCodeAt(i).toString(16);
            }
            else if ((str.charCodeAt(i) > 15 && str.charCodeAt(i) < 32) || str.charCodeAt(i) == 127) {
                val += str.charCodeAt(i).toString(16);
            }
            else {
                val = str;
            }
        }
        return val;
    }

    //判断规则是否为某一类规则类别的
    function in_array(ruleClass, ruleID) {
        for (var i = 0; i < ruleClass.length; ++i) {
            if (ruleClass[i] == ruleID)
                return true;
        }
        return false;
    }

    function hexToString(str) {
        var val = "";
        for (var i = 0; i < str.length; i += 2) {
            val += String.fromCharCode(parseInt(str.substring(i, i + 2), 16));
        }
        //.charAt(i);//fromCharCode(i);

        return val;
    }

    function stringToHex(str) {
        var val = "";
        for (var i = 0; i < str.length; i++) {
            val += str.charCodeAt(i).toString(16);
        }
        return val;
    }

    function hexToStringForModel(str) {
        var val = "";
        for (var i = 0; i < str.length; i += 2) {
            var tmpstr = "";
            switch (str.substring(i, i + 2)) {
                case '0d':
                    tmpstr = "\\r";
                    break;
                case '0a':
                    tmpstr = "\\n";
                    break;
                default:
                    tmpstr = "\\" + String.fromCharCode(parseInt(str.substring(i, i + 2), 16));
                    break;
            }
            val += tmpstr;
        }
        return val;
    }

    function checkFilefiterInput(inputStr) {
        var reg = new RegExp("[\\/:*?\"\"<>|@\\\\]", "g");
        return reg.test(inputStr);
    }

    function checkIsNum(inputStr) {
        var reg = new RegExp("[^-,0-9]", "g");
        return reg.test(inputStr);
    }

    //获取正则的值
    function getCondRegex(condName, argu) {
        var condInfoDic = new Array("$1", "$1",
            "^.{$1,}$", "^.{$1}$",
            "^.{0,$1}$", "^$",
            "$1$", "$1$",
            "^$1", "^$1",
            "^$", "$1");
        var condInfoDicName = new Array("包含", "不包含",
            "长度大于", "长度等于", "长度小于", "为空",
            "以...结尾", "不以...结尾",
            "以...开头", "不以...开头",
            "不为空", "在列表中(空格分割)");
        var str = "";
        //console.log(condName);
        str = condInfoDic[condInfoDicName.indexOf(condName)];
        //console.log(str);
        if (condName == "长度大于") {
            argu = (parseInt(argu) + 1).toString();
        }
        else if (condName == "长度小于") {
            argu = (parseInt(argu) - 1).toString();
        }

        var regx = "([-[\]{}()*+?.,/^$|#\s])";
        for (var i = 0; i < regx.length; i++) {
            argu = argu.replace(regx.charAt(i), "\\\\" + regx.charAt(i));
        }
        if (condName != "在列表中(空格分割)") {
            str = str.replace("$1", argu);
        }
        else {
            //在列表中
            str = "";
            var argus = argu.split(' ');
            for (var i = 0; i < argus.length; ++i) {
                if (i != argus.length - 1)
                    str += argus[i] + '|';
                else
                    str += argus[i];
            }
        }
        console.log("参数二:" + str)
        return str;
    }

    //初始化usedFieldIndexArray
    function initUsedFieldIndexArray(setColNum, offSet, colArrayOfDataType) {
        var usedFieldIndexArray = new Array();

        for (var i = 0; i < setColNum && i < colArrayOfDataType.length; ++i) {
            usedFieldIndexArray.push(colArrayOfDataType[(i + offSet) % colArrayOfDataType.length].fieldIndex);
        }

        return usedFieldIndexArray;
    }

    //更新usedFieldIndexArray
    function updateUsedFieldIndexArray(outputColArray) {
        var usedFieldIndexArray = new Array();

        for (var i = 0; i < outputColArray.length; ++i) {
            if (outputColArray[i] >= 0)
                usedFieldIndexArray.push(outputColArray[i]);
        }

        return usedFieldIndexArray;
    }

    //去除数据类型列定义里的内置列
    function processDataTypeColList(colArrayOfDataType) {
        for (var fIndex = 0; fIndex < colArrayOfDataType.length; ++fIndex) {
            if (colArrayOfDataType[fIndex].name == 'RECORD_ID'
                || colArrayOfDataType[fIndex].name == 'LOAD_ID') {
                colArrayOfDataType.splice(fIndex, 1);
                fIndex--;
            }
        }
        return colArrayOfDataType;
    }

    function getMaxStepSN(selectedRulesOfCurCol) {
        var maxStepSN = 0;
        //for (var i = 0; i < selectedRulesOfCurCol.ruleInfos.length; ++i) {
        //    if (selectedRulesOfCurCol.ruleInfos[i] != undefined) {
        //        maxStepSN = selectedRulesOfCurCol.ruleInfos[i].m_stepSN > maxStepSN
        //            ? selectedRulesOfCurCol.ruleInfos[i].m_stepSN : maxStepSN;
        //    }
        //}

        for (var ruleIndex in selectedRulesOfCurCol.ruleInfos) {
            if (selectedRulesOfCurCol.ruleInfos[ruleIndex] != undefined) {
                maxStepSN = selectedRulesOfCurCol.ruleInfos[ruleIndex].m_stepSN > maxStepSN
                    ? selectedRulesOfCurCol.ruleInfos[ruleIndex].m_stepSN : maxStepSN;
            }
        }
        return maxStepSN;
    }

    function getRulesListSeq(selectedRulesOfCurCol) {
        if (selectedRulesOfCurCol.selectRulesList[0].nodes.length <= 0)
            return 1;
        else
            return selectedRulesOfCurCol.selectRulesList[0].
                    nodes[selectedRulesOfCurCol.selectRulesList[0].nodes.length - 1].seq + 1;
    }

    function isNeedSetParams(ruleID) {
        if (ruleID = 1013)
            return true;
        else
            return false;
    }

    function getRuleBasicInfo(ruleBasicInfos, ruleID) {
        for (var treeRule = 0; treeRule < ruleBasicInfos.length; ++treeRule) {
            if (ruleID == ruleBasicInfos[treeRule].ruleID) {
                return ruleBasicInfos[treeRule];
            }
        }
    }

    function processStr(inputStr) {
        var outputStr = inputStr;
        var firstOne = 0;
        var lastOne = 0;
        var prefix = "";
        var content = "";
        var postfix = "";

        for (var i = 0; i < outputStr.length; ++i) {
            if (outputStr.charAt(i) != "\t" && outputStr.charAt(i) != " ") {
                firstOne = i;
                break;
            }
        }
        for (var i = outputStr.length - 1; i >= firstOne; --i) {
            if (outputStr.charAt(i) != "\t" && outputStr.charAt(i) != " ") {
                lastOne = i;
                break;
            }
        }
        if (firstOne > 0) {
            prefix = outputStr.substring(0, firstOne);
        }
        if (lastOne < outputStr.length - 1) {
            postfix = outputStr.substring(lastOne + 1, outputStr.length);
        }
        if (lastOne > firstOne) {
            content = outputStr.substring(firstOne, lastOne + 1);
        }
        else {
            content = inputStr;
        }

        if (prefix.length > 0) {
            for (var i = firstOne - 1; i >= 0; --i) {
                if (outputStr.charAt(i) == " ")
                    content = "&nbsp;" + content;
                if (outputStr.charAt(i) == "\t")
                    content = "&emsp;" + content;
            }
        }

        if (postfix.length > 0) {
            for (var i = lastOne + 1; i <= outputStr.length; ++i) {
                if (outputStr.charAt(i) == " ")
                    content = content + "&nbsp;";
                if (outputStr.charAt(i) == "\t")
                    content = content + "&emsp;";
            }
        }

        return content;
    }

    //字段映射，根据outColsIndex获取select的selectedIndex
    function getselectedIndex(colSelect, outColsIndex) {
        for (var i = 0; i < colSelect.length; ++i) {
            if (colSelect[i].value == outColsIndex)
                return i;
        }
        return 0;
    }

    return {
        getselectedIndex: getselectedIndex,
        getm_not: getm_not,
        changeArithmetic: changeArithmetic,
        changeNumToOperation: changeNumToOperation,
        changeHexCheck: changeHexCheck,
        changeUnvisibleCode: changeUnvisibleCode,
        in_array: in_array,
        hexToString: hexToString,
        stringToHex: stringToHex,
        hexToStringForModel: hexToStringForModel,
        getCondRegex: getCondRegex,
        checkFilefiterInput: checkFilefiterInput,
        checkIsNum: checkIsNum,
        initUsedFieldIndexArray: initUsedFieldIndexArray,
        processDataTypeColList: processDataTypeColList,
        updateUsedFieldIndexArray: updateUsedFieldIndexArray,
        getMaxStepSN: getMaxStepSN,
        getRulesListSeq: getRulesListSeq,
        isNeedSetParams: isNeedSetParams,
        getRuleBasicInfo: getRuleBasicInfo,
        processStr: processStr,
    }

});

