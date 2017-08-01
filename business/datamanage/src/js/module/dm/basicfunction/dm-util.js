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
        var reg = new RegExp("[\\/:*?\"\"<>|@]", "g");
        return reg.test(inputStr);
    }

    function getURLParameter(name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [undefined, ""])[1].replace(/\+/g, '%20')) || null;
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
            "^$");
        var condInfoDicName = new Array("包含", "不包含",
            "长度大于", "长度等于", "长度小于", "为空",
            "以...结尾", "不以...结尾",
            "以...开头", "不以...开头",
            "不为空");
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
        str = str.replace("$1", argu);
        console.log("参数二:" + str)
        return str;
    }

    return {
        getm_not: getm_not,
        changeArithmetic: changeArithmetic,
        changeNumToOperation: changeNumToOperation,
        changeHexCheck: changeHexCheck,
        changeUnvisibleCode: changeUnvisibleCode,
        in_array: in_array,
        hexToString: hexToString,
        hexToStringForModel: hexToStringForModel,
        getCondRegex: getCondRegex,
        checkFilefiterInput: checkFilefiterInput,
        checkIsNum: checkIsNum,
        getURLParameter: getURLParameter
    }
});

