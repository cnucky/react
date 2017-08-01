var stringOprDic = {
    "equal": "等于",
    "startWith": "以...开头",
    "endWith": "以...结尾",
    "isNull": "为空",
    "isNotNull": "不为空",
    "in": "在列表中"
};

var numberOprDic= {
    "equal": "等于",
    "greaterThan": "大于",
    "lessThan": "小于",
    "between": "在...之间"
    
};

var dateTimeOprDic= {
    "lessThan": "终止于",
    "between": "在...之间"
};

function generateOprSource(dicSource) {
    var source = new Array();
    for (var obj in dicSource) {
        source.push(dicSource[obj]);
    }
    return source;
}

function generateStringOprSource()
{
  return generateOprSource(stringOprDic);
}

function generateNumberOprSource()
{
  return generateOprSource(numberOprDic);
}

function generateDateTimeOprSource()
{
  return generateOprSource(dateTimeOprDic);
}




