/**
 * Created by root on 1/20/16.
 */
var router = require('express').Router();
var soap = require('soap');
var DLApi = require('../jws/dataLink');
var Util = require('../utils/util');
var _ = require('underscore');
var fs = require('fs');

router.all('/MapTableRecommend', function (req, res) {
    console.log("MapTableRecommend");
    //var isHaveHead = req.query.params.isHaveHead;
    var fieldsNameArray = req.query.params.fieldsNameArray;
    var fieldIndexArray = req.query.params.fieldIndexArray;
    //var fieldsNameArray = JSON.parse(req.query.fieldsNameArray);
    var colNum = req.query.params.colNum;
    var colsContentArray = req.query.params.colsContentArray;

    //console.log("fieldIndexArray", fieldIndexArray);
    var contentMarkArray = new Array();
    var MarkAppearTimesArray = new Array();
    var recommendFiledsArray = new Array();

    for (var r = 0; r < colsContentArray.length; ++r) {
        for (var i = 0; i < colsContentArray[r].length; i++) {
            if (r == 0) {
                contentMarkArray[i] = new Array();
                MarkAppearTimesArray[i] = new Array();
            }
            getContentRecMarks(contentMarkArray[i], MarkAppearTimesArray[i], colsContentArray[r][i]);
        }
    }
    //console.log("contentMarkArray" + contentMarkArray);

    for (var i = 0; i < contentMarkArray.length; i++) {
        var curcolRecArray = [];
        //var curColRecPerArray = [];
        //console.log("contentMarkArray[i]", contentMarkArray[i].length);
        for (var j = 0; j < contentMarkArray[i].length; j++) {
            //curcolRecArray = curcolRecArray.push(getContentRecFields(contentMarkArray[i][j],fieldsNameArray));
            curcolRecArray = curcolRecArray.concat(curcolRecArray,
                getContentRecFields(contentMarkArray[i][j], MarkAppearTimesArray[i][j], fieldsNameArray, fieldIndexArray));
        }
        if (curcolRecArray.length) {
            var sumP = 0;
            for (var k = 0; k < curcolRecArray.length; k++) {
                sumP += curcolRecArray[k].maxComparePercent;
                //console.log("i+sumPcurcolRecArray[k].maxComparePercent", curcolRecArray[k].maxComparePercent);
            }
            //console.log("sumP", sumP);
            for (var k = 0; k < curcolRecArray.length; k++) {
                curcolRecArray[k].maxComparePercent = (100 * curcolRecArray[k].maxComparePercent / sumP);
            }
        }
        recommendFiledsArray[i] = curcolRecArray;
    }
    //console.log("recommendFiledsArray" + recommendFiledsArray);
    res.writeHead(200, {'content-type': 'text/plain;charset=utf-8'});
    resText = {"recommendFiledsArray": recommendFiledsArray};
    res.write(JSON.stringify(resText));
    res.end();
});

function getContentRecMarks(contentMarkArray, MarkAppearTimesArray, content) {
    switch (JudgeContent(content)) {
        case 1 :
            getNumRecMarks(contentMarkArray, MarkAppearTimesArray, content);
            break;
        case 2 :
            getStringRecMarks(contentMarkArray, MarkAppearTimesArray, content);
            break;
        case 3 :
            getDateRecMarks(contentMarkArray, MarkAppearTimesArray, content);
            break;
    }
}

//通过标签找数据类型中推荐的字段名
function getContentRecFields(mark, appearTimes, fieldsNameArray, fieldIndexArray) {
    var curcolRecArray = new Array();
    switch (mark) {
        case "区号":
            addFieldsName("区号", appearTimes, curcolRecArray, fieldsNameArray, fieldIndexArray);
            break;
        case "时间":
            addFieldsName("时间", appearTimes, curcolRecArray, fieldsNameArray, fieldIndexArray);
            break;
        case "日期":
            addFieldsName("日期", appearTimes, curcolRecArray, fieldsNameArray, fieldIndexArray);
            break;
        case "手机号码":
            addFieldsName("号码", appearTimes, curcolRecArray, fieldsNameArray, fieldIndexArray);
            break;
        case "身份证号":
            addFieldsName("证件号", appearTimes, curcolRecArray, fieldsNameArray, fieldIndexArray);
            break;
        //case "号":
        //    addFieldsName("号", appearTimes, curcolRecArray, fieldsNameArray, fieldIndexArray);
        //    break;
        case "城市":
            addFieldsName("市", appearTimes, curcolRecArray, fieldsNameArray, fieldIndexArray);
            break;
        case "火车站":
            addFieldsName("站", appearTimes, curcolRecArray, fieldsNameArray, fieldIndexArray);
            break;
    }
    return curcolRecArray;
}

function addFieldsName(str, appearTimes, curcolRecArray, fieldsNameArray, fieldIndexArray) {
    for (var i = 0; i < fieldsNameArray.length; ++i) {
        if (fieldsNameArray[i].indexOf(str) !== -1) {
            var j = 0;
            //for (; j < curcolRecArray.length; ++j) {
            //    if (i == curcolRecArray[j].suitFiledName) {
            //        curcolRecArray[j].maxComparePercent += appearTimes;
            //        break;
            //    }
            //}

            //if ((curcolRecArray.length != undefined && j < curcolRecArray.length) || curcolRecArray.length === 0) {
            var recFieldName = {};
            recFieldName.suitFiledName = fieldIndexArray[i]; //i;
            recFieldName.suitFiled = fieldsNameArray[i];
            //console.log("recFieldName.suitFiled", recFieldName.suitFiled);
            recFieldName.maxComparePercent = appearTimes;
            curcolRecArray.push(recFieldName);
            //}
        }
    }
}

//判断内容类型，1是纯数字，2是字符串，3是日期时间
function JudgeContent(content) {
    var numRegx = /(^\d*$)|^(^\d{17}(\d|X|x)$)/;
    var dateRegx = /^\d*-\d*-\d*/;
    if (numRegx.test(content)) {
        return 1;
    }
    else if (dateRegx.test(content)) {
        return 3;
    }
    else {
        return 2;
    }
}

//为纯数字打标签
function getNumRecMarks(contentMarkArray, MarkAppearTimesArray, content) {
    var formatAreaTelCode = /^(0[0-9]{2,3})$/;
    if (formatAreaTelCode.test(content)) {
        if (contentMarkArray.indexOf("区号") == -1) {
            contentMarkArray.push("区号");
            MarkAppearTimesArray.push(1);
        }
        else {
            MarkAppearTimesArray[contentMarkArray.indexOf("区号")]++;
        }
    }

    var formatMobile = /^(1[0-9]{10})$/;
    if (formatMobile.test(content)) {
        if (contentMarkArray.indexOf("手机号码") == -1) {
            contentMarkArray.push("手机号码");
            MarkAppearTimesArray.push(1);
        }
        else {
            MarkAppearTimesArray[contentMarkArray.indexOf("手机号码")]++;
        }
    }

    var formatIdentityId = /^(\d{15}$|\d{18}$|^\d{17}(\d|X|x))$/
    if (formatIdentityId.test(content)) {
        if (contentMarkArray.indexOf("身份证号") == -1) {
            contentMarkArray.push("身份证号");
            MarkAppearTimesArray.push(1);
        }
        else {
            MarkAppearTimesArray[contentMarkArray.indexOf("身份证号")]++;
        }
    }

    if (contentMarkArray.indexOf("号") == -1) {
        contentMarkArray.push("号");
        MarkAppearTimesArray.push(1);
    }
    else {
        MarkAppearTimesArray[contentMarkArray.indexOf("号")]++;
    }
}

//为字符串打标签
function getStringRecMarks(contentMarkArray, MarkAppearTimesArray, content) {
    var citystr = "" + fs.readFileSync(__dirname + '/dataMap/city.txt');
    if (citystr.indexOf(content) !== -1) {
        contentMarkArray.push("城市");
    }
    //if(citystr.indexOf(content) == -1){
    //    contentMarkArray.push("城市");
    //    MarkAppearTimesArray.push(1);
    //}
    //else{
    //    MarkAppearTimesArray[contentMarkArray.indexOf("城市")]++;
    //}

    var railwayStation = "" + fs.readFileSync(__dirname + '/dataMap/railway.txt');
    if (railwayStation.indexOf(content) !== -1) {
        contentMarkArray.push("火车站");
    }
    //if(railwayStation.indexOf(content) == -1){
    //    contentMarkArray.push("火车站");
    //    MarkAppearTimesArray.push(1);
    //}
    //else{
    //    MarkAppearTimesArray[contentMarkArray.indexOf("火车站")]++;
    //}
}

//为日期时间打标签
function getDateRecMarks(contentMarkArray, MarkAppearTimesArray, content) {
    var formatDateTime = /^(\d{1,4})\-(\d{1,2})\-(\d{1,2}\s)(\d{1,2}):(\d{1,2}):(\d{1,2})/;
    if (formatDateTime.test(content)) {
        //if(contentMarkArray.indexOf("时间") == -1)
        //contentMarkArray.push("时间");

        if (contentMarkArray.indexOf("时间") == -1) {
            contentMarkArray.push("时间");
            MarkAppearTimesArray.push(1);
        }
        else {
            MarkAppearTimesArray[contentMarkArray.indexOf("时间")]++;
        }
    }


    var formatDate = /^(\d{1,4})\-(\d{1,2})\-(\d{1,2})$/;
    if (formatDate.test(content)) {
        //if(contentMarkArray.indexOf("日期") == -1)
        //contentMarkArray.push("日期");

        if (contentMarkArray.indexOf("日期") == -1) {
            contentMarkArray.push("日期");
            MarkAppearTimesArray.push(1);
        }
        else {
            MarkAppearTimesArray[contentMarkArray.indexOf("日期")]++;
        }
    }
}

module.exports = router;