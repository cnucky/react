/**
 * Created by root on 6/27/16.
 */
define([], function () {
    var policyRules = [
        {"value": 1, "displayname": "取全值"},
        {"value": 2, "displayname": "取模"},
        {"value": 3, "displayname": "取年份"},
        {"value": 4, "displayname": "取月份"},
        {"value": 5, "displayname": "取天"},
        {"value": 6, "displayname": "设值"},
        {"value": 7, "displayname": "取值"},
        {"value": 8, "displayname": "ASCII码取模"}
    ];
    var policyType = [
        {"logictype": "decimal", "displayname": "数值"},
        {"logictype": "string", "displayname": "字符串"}
    ];

    function initAdvancedSetPage(colInfoList, curCenterCode, statFieldArray) {
        //console.log("colInfoList", colInfoList);
        //console.log("statFieldArray", statFieldArray);
        $("#center-select")[0].innerHTML = "";
        //$("#center-select")[0].innerHTML += '<option value=" "> </option>';
        $("#business-field-select")[0].innerHTML = "";
        $("#index-partition-field")[0].innerHTML = "";
        $("#index-id-field")[0].innerHTML = "";
        $("#business-field-select")[0].innerHTML += '<option value=" "> </option>';
        $("#index-partition-field")[0].innerHTML += '<option value=" "> </option>';

        $("#index-id-field")[0].innerHTML += '<option value=" "> </option>';
        _.each(colInfoList, function (item) {
            $("#index-id-field")[0].innerHTML += ('<option value="' + item.fieldIndex + '">' + item.displayName + '</option>');
        });

        $.getJSON('/datamanage/dataimport/GetCenterCodeInfo', {},
            function (rsp) {
                //console.log("rsp.data", rsp);
                if (rsp.code == 0) {
                    var centerCodeInfoArray = rsp.data.centerCodeInfo; //JSON.parse(rsp.data);
                    for (var i = 0; i < centerCodeInfoArray.length; ++i) {
                        $("#center-select")[0].innerHTML += '<option value="' + centerCodeInfoArray[i].centerCode
                            + '">' + centerCodeInfoArray[i].centerName + '</option>';
                    }
                    $('#center-select option[value="' + curCenterCode + '"]').attr("selected", "true");
                }
                else {
                    Notify.show({
                        title: '获取分区信息失败!',
                        type: 'danger'
                    });
                }
            });

        //设置业务时间字段名称下拉框
        for (var i = 0; i < colInfoList.length; ++i) {
            if (colInfoList[i].fieldType == "date" || colInfoList[i].fieldType == "datetime") {
                $("#business-field-select")[0].innerHTML += '<option value="' + colInfoList[i].fieldIndex
                    + '">' + colInfoList[i].displayName + '</option>';
                $("#index-partition-field")[0].innerHTML += '<option value="' + colInfoList[i].fieldIndex
                    + '">' + colInfoList[i].displayName + '</option>';
            }
            if (colInfoList[i].colUsage != "" && colInfoList[i].colUsage.length > 0) {
                if (colInfoList[i].colUsage == 35) {
                    $('#index-partition-field option[value="' + colInfoList[i].fieldIndex + '"]').attr("selected", "true");
                }
                if (colInfoList[i].colUsage == 30) {
                    $('#index-id-field option[value="' + colInfoList[i].fieldIndex + '"]').attr("selected", "true");
                }
            }
        }
        if (statFieldArray.length > 0) {
            $('#business-field-select option[value="' + statFieldArray[0] + '"]').attr("selected", "true");
        }
    }

    function drawPolicyRows(ptArray, colInfoList) {
        for (var i = 0; i < ptArray.length; i++) {
            generateRowForPolicy(i, 0, true, colInfoList, true, ptArray[i]);
            $('#partition-policy-table tbody tr:last-child td').find("select").each(function () {
                $(this).select2();
            });
        }
    }

    //为分区策略表生成一行
    function generateRowForPolicy(i, j, isvisible, colInfoList, isSet, policyInfo) {
        if (isvisible)
            rowHtml = '<tr>'
        else
            rowHtml = '<tr class="hide">'

        if (isSet) {
            console.log("policyInfo", policyInfo);
            rowHtml +=
                '<td>' + generateFieldHtml(colInfoList, isSet, policyInfo) + '</td>' +
                '<td>' + generatePolicyHtml(isSet, policyInfo) + '</td>' +
                '<td>无</td>' +
                '<td><input type="text" class="form-control edit lock-edit policy-param" name="spinner" style="border:0px !important" disabled></td>' +
                '<td><input type="text" class="form-control edit lock-edit" style="border:0px;" placeholder="" disabled></td>' +
                '<td>' + generateTypeHtml(isSet, policyInfo) + '</td>' +
                '<td><input type="text" class="form-control edit lock-edit" name="spinner" value="8" style="border:0px !important"></td>' +
                '<td><input type="text" class="form-control edit lock-edit" style="border:0px" placeholder=""></td>' +
                '</tr>';
            $('#partition-policy-table tbody').append(rowHtml);

            var curTr = $('#partition-policy-table tbody > tr:nth-child(' + (i + 1) + ')');
            setPolicyParam(policyInfo.func_id, curTr[0], i, policyInfo.func_params);

            $('#partition-policy-table tbody > tr:nth-child(' + (i + 1) + ') > td:nth-child(7) :input').
                val(policyInfo.len);
            $('#partition-policy-table tbody > tr:nth-child(' + (i + 1) + ') > td:nth-child(8) :input').
                val(policyInfo.scale);
        }
        else {
            rowHtml +=
                //'<td style="text-align:center" class="hide">' + (i - j) + '</td>' +
                '<td>' + generateFieldHtml(colInfoList, isSet, policyInfo) + '</td>' +
                '<td>' + generatePolicyHtml(isSet, policyInfo) + '</td>' +
                '<td>无</td>' +
                '<td><input type="text" class="form-control edit lock-edit policy-param" name="spinner" style="border:0px !important" disabled></td>' +
                '<td><input type="text" class="form-control edit lock-edit" style="border:0px;" placeholder="" disabled></td>' +
                '<td>' + generateTypeHtml(isSet, policyInfo) + '</td>' +
                '<td><input type="text" class="form-control edit lock-edit" name="spinner" value="8" style="border:0px !important"></td>' +
                '<td><input type="text" class="form-control edit lock-edit" style="border:0px" placeholder=""></td>' +
                '</tr>';
            $('#partition-policy-table tbody').append(rowHtml);
        }
        $("select.policySelect").unbind("change", policySelectChanged);
        $("select.policySelect").bind("change", policySelectChanged);
    }

    //生成参数tml
    function generateParamHtml(policyValue) {
        var policyHtml = ('<select class="select2-white edit lock-edit" style="font-size: 13px;height:30px;width: 100%; padding-left: 5px; padding-right: 5px;">');
        switch (policyValue) {
            case 2:
                policyHtml += ('<option value="1">从前往后取值</option><option value="0">从后往前取值</option>');
                break;
            case 7:
                policyHtml += ('<option value="1">从前往后取值</option><option value="0">从后往前取值</option>');
                break;
            case 8:
                policyHtml += ('<option value="1">取第一个字符</option><option value="0">取最后一个字符</option>');
                break;
            default :
                break;
        }
        policyHtml += '</select>';

        return policyHtml;
    }

    //生成字段tml
    function generateFieldHtml(colInfoList, isSet, policyInfo) {
        var fieldHtml = ('<select class="select2-white form-control edit lock-edit"> ');
        if (!isSet) {
            _.each(colInfoList, function (item) {
                fieldHtml += ('<option value="' + item.fieldIndex + '">' + item.displayName + '</option>');
            });
        }
        else {
            _.each(colInfoList, function (item) {
                if (policyInfo.field_index == item.fieldIndex) {
                    fieldHtml += ('<option selected value="' + item.fieldIndex + '">' + item.displayName + '</option>');
                }
                else {
                    fieldHtml += ('<option value="' + item.fieldIndex + '">' + item.displayName + '</option>');
                }
            });
        }
        fieldHtml += '</select>';
        return fieldHtml;
    }

    //生成策略tml
    function generatePolicyHtml(isSet, policyInfo) {
        var policyHtml = ('<select class="select2-white form-control edit lock-edit policySelect">');
        if (!isSet) {
            _.each(policyRules, function (item) {
                policyHtml += ('<option value="' + item.value + '">' + item.displayname + '</option>');
            });
        }
        else {
            _.each(policyRules, function (item) {
                if (policyInfo.func_id == item.value) {
                    policyHtml += ('<option selected value="' + item.value + '">' + item.displayname + '</option>');
                }
                else {
                    policyHtml += ('<option value="' + item.value + '">' + item.displayname + '</option>');
                }
            });
        }
        policyHtml += '</select>';
        return policyHtml;
    }

    //生成策略类型html
    function generateTypeHtml(isSet, policyInfo) {
        typeHtml = ('<select class="select2-white form-control edit lock-edit" >');
        if (!isSet) {
            _.each(policyType, function (item) {
                typeHtml += ('<option value="' + item.logictype + '">' + item.displayname + '</option>');
            });
        }
        else {
            _.each(policyType, function (item) {
                if (policyInfo.type.toLowerCase() == item.logictype) {
                    typeHtml += ('<option selected value="' + item.logictype + '">' + item.displayname + '</option>');
                }
                else {
                    typeHtml += ('<option value="' + item.logictype + '">' + item.displayname + '</option>');
                }
            });
        }
        typeHtml += '</select>';
        return typeHtml;
    }

    function policySelectChanged(event) {
        console.log("policySelectChangeEvent", event);
        var selectPolicyIndex = event.currentTarget.selectedIndex + 1;
        var curTr = event.currentTarget.parentElement.parentElement;
        switch (selectPolicyIndex) {
            case 2:
                curTr.children[2].innerHTML = generateParamHtml(2);//"取模";
                curTr.children[3].children[0].removeAttribute("disabled");//prop("disabled", "");
                curTr.children[3].children[0].value = "";
                curTr.children[4].children[0].removeAttribute("disabled");
                curTr.children[4].children[0].value = "";
                break;
            case 7:
                curTr.children[2].innerHTML = generateParamHtml(7);//"取值";
                curTr.children[3].children[0].removeAttribute("disabled");
                curTr.children[3].children[0].value = "";
                curTr.children[4].children[0].setAttribute("disabled", "disabled");
                curTr.children[4].children[0].value = "无";
                break;
            case 8:
                curTr.children[2].innerHTML = generateParamHtml(8);//"ASCII码取模";
                curTr.children[3].children[0].setAttribute("disabled", "disabled");
                curTr.children[3].children[0].value = "无";
                curTr.children[4].children[0].removeAttribute("disabled");
                curTr.children[4].children[0].value = "";
                break;
            default:
                curTr.children[2].innerHTML = "无";
                curTr.children[3].children[0].setAttribute("disabled", "disabled");
                curTr.children[3].children[0].value = "无";
                curTr.children[4].children[0].setAttribute("disabled", "disabled");
                curTr.children[4].children[0].value = "无";
                break;
        }
    }

    function setPolicyParam(selectPolicyIndex, curTr, i, params) {
        var paramsArray = params.split(";", 10);
        switch (selectPolicyIndex) {
            case 2:
                curTr.children[2].innerHTML = generateParamHtml(2);//"取模";
                $('#partition-policy-table tbody > tr:nth-child(' + (i + 1) + ') > td:nth-child(3) option[value="'
                    + paramsArray[0] + '"]').attr("selected", "true");
                curTr.children[3].children[0].removeAttribute("disabled");//prop("disabled", "");
                curTr.children[3].children[0].value = paramsArray[1];
                curTr.children[4].children[0].removeAttribute("disabled");
                curTr.children[4].children[0].value = paramsArray[2];
                break;
            case 7:
                curTr.children[2].innerHTML = generateParamHtml(7);//"取值";
                $('#partition-policy-table tbody > tr:nth-child(' + (i + 1) + ') > td:nth-child(3) option[value="'
                    + paramsArray[0] + '"]').attr("selected", "true");
                curTr.children[3].children[0].removeAttribute("disabled");
                curTr.children[3].children[0].value = paramsArray[1];
                curTr.children[4].children[0].setAttribute("disabled", "disabled");
                curTr.children[4].children[0].value = "无";
                break;
            case 8:
                curTr.children[2].innerHTML = generateParamHtml(8);//"ASCII码取模";
                $('#partition-policy-table tbody > tr:nth-child(' + (i + 1) + ') > td:nth-child(3) option[value="'
                    + paramsArray[0] + '"]').attr("selected", "true");
                curTr.children[3].children[0].setAttribute("disabled", "disabled");
                curTr.children[3].children[0].value = "无";
                curTr.children[4].children[0].removeAttribute("disabled");
                curTr.children[4].children[0].value = paramsArray[1];
                break;
            default:
                curTr.children[2].innerHTML = "无";
                curTr.children[3].children[0].setAttribute("disabled", "disabled");
                curTr.children[3].children[0].value = "无";
                curTr.children[4].children[0].setAttribute("disabled", "disabled");
                curTr.children[4].children[0].value = "无";
                break;
        }
    }

    function getParams(i, funcId) {
        var paramsStr = "";
        var splitStr = ";";
        switch (funcId) {
            case '2':
                paramsStr = $('#partition-policy-table tbody > tr:nth-child(' + i + ') > td:nth-child(3) :selected').val();
                paramsStr += splitStr;
                paramsStr += $('#partition-policy-table tbody > tr:nth-child(' + i + ') > td:nth-child(4) :input').val();
                paramsStr += splitStr;
                paramsStr += $('#partition-policy-table tbody > tr:nth-child(' + i + ') > td:nth-child(5) :input').val();
                break;
            case '7':
                paramsStr = $('#partition-policy-table tbody > tr:nth-child(' + i + ') > td:nth-child(3) :selected').val();
                paramsStr += splitStr;
                paramsStr += $('#partition-policy-table tbody > tr:nth-child(' + i + ') > td:nth-child(4) :input').val();
                break;
            case '8':
                paramsStr = $('#partition-policy-table tbody > tr:nth-child(' + i + ') > td:nth-child(3) :selected').val();
                paramsStr += splitStr;
                paramsStr += $('#partition-policy-table tbody > tr:nth-child(' + i + ') > td:nth-child(5) :input').val();
                break;
            default:
                break;
        }
        return paramsStr;
    }

    //获取策略信息
    function getPolicy(i, typeId) {
        var displayName = $('#partition-policy-table tbody > tr:nth-child(' + i + ') > td:nth-child(1) :selected')[0].text;
        //console.log("displayName", $('#partition-policy-table tbody > tr:nth-child(' + i + ') > td:nth-child(1) :selected'));
        var fieldIndex = $('#partition-policy-table tbody > tr:nth-child(' + i + ') > td:nth-child(1) :selected').val();
        var funcId = $('#partition-policy-table tbody > tr:nth-child(' + i + ') > td:nth-child(2) :selected').val();
        var params = getParams(i, funcId);
        var colLogicType = $('#partition-policy-table tbody > tr:nth-child(' + i + ') > td:nth-child(6) :selected').val();
        var colLength = $('#partition-policy-table tbody > tr:nth-child(' + i + ') > td:nth-child(7) :input').val();
        var colScale = $('#partition-policy-table tbody > tr:nth-child(' + i + ') > td:nth-child(8) :input').val() || 0;
        if (colLogicType == "string" || colLogicType == "decimal") {
            if (_.isEmpty(colLength)) {
                colLength = 16;
            }
        }

        if (typeId == undefined)
            typeId = -1;

        var policy = {
            field_index: parseInt(fieldIndex),
            displayName: displayName,
            func_id: parseInt(funcId),
            func_params: params,
            type: colLogicType,
            len: parseInt(colLength),
            scale: parseInt(colScale),
            field_name: "",
            part_name: "",
            as_realcol_name: "",
            is_as_realcol: 1,
            part_seq: 1,
            type_id: typeId
        }
        return policy;
    }

    return {
        drawPolicyRows: drawPolicyRows,
        generateRowForPolicy: generateRowForPolicy,
        initAdvancedSetPage: initAdvancedSetPage,
        getPolicy: getPolicy,
    }

});