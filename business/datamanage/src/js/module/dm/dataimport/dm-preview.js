define(['nova-dialog',
        'nova-notify',
        '../../../../../../../public/widget/personalworktree',
        'nova-bootbox-dialog',
        '../../dm/dataimport/dm-basicsetup',
        '../../dm/dataimport/dm-fileimport',
        '../../dm/dataimport/dm-preview-init',
        '../../dm/dataimport/dm-preview-util',
        '../../dm/dataimport/dm-setparams',
        '../../dm/dataimport/dm-setruleparams',
        '../../dm/dataimport/dm-getruleparams',
        '../../dm/dataimport/dm-preview-cond',
        '../../dm/dataimport/dm-di-innerfun',
        '../../dm/dataimport/dm-getparams',],
    function (Dialog, Notify, PersonalWorkTree, bootbox, basicSetup, fileUtil, previewInit, previewUtil,
              setparams, setruleparams, getruleparams, cond, innerfun, getparams) {
        var addNewColRuleId = 1001;
        //1:新建；2：复制编辑; 3: 模型打开
        var pageType = 1;
        //所有列的预处理设置
        var selectedRulesOfAllCols = new Array();
        //当前列的预处理设置
        var selectedRulesOfCurCol;
        var curAddNode;
        var curDelNode;
        var curColIndex = -1;
        var curRowIndexOfCondition;

        var ruleClassArray;
        var ruleParameterArray;
        var conditionNames = new Array();

        var outputColIndex = [];
        //设置字段映射表格的数据
        var outputColArrayNew = new Array();

        var typeId;
        var header;
        var rulesArray;
        var preViewResultArray;

        var batchInfo;
        var isCopyForPreView = false;
        var isCopyForColMap = false;
        var isCopyForMapHead = false;
        var outColsIndexOfCopy;
        var fileRootPath = "";
        var UDPFileRootPath = "";
        //预览结果的列数
        var preViewColsNum = 0;
        //当前模型ID
        var curModelId = "0";

        var ruleInfos;

        function initRefresh(){
            preViewResultArray = [];
        }

//===============以下为复制任务、模型打开相关方法===============
        function setCopyOrModelInfo(modelId, batchId) {
            if (batchId != undefined && batchId > 0) {
                pageType = 2;
                setPageType(pageType, batchId);
            }
            else if (modelId != undefined && modelId > 0) {
                pageType = 3;
                curModelId = modelId;
                setPageType(pageType, modelId);
            }
            else {
                pageType = 1;
                setPageType(pageType, -1);
            }
        }

        //设置页面类型
        function setPageType(curPageType, id) {
            pageType = curPageType;
            switch (curPageType) {
                case 1:
                    isCopyForPreView = false;
                    isCopyForColMap = false;

                    selectedRulesOfAllCols = [];
                    outputColIndex = [];
                    outColsIndexOfCopy = [];
                    selectedRulesOfCurCol = undefined;
                    curAddNode = undefined;
                    curDelNode = undefined;
                    break;
                case 2:
                    isCopyForPreView = true;
                    isCopyForColMap = true;
                    getBatchInfoForCopy(id);
                    break;
                case 3:
                    isCopyForPreView = true;
                    isCopyForColMap = true;
                    getModelInfo(id);
                    break;
                default :
                    break;
            }
        }

        //将模型的信息拷贝到页面中
        function getModelInfo(modelId) {
            $.get('/datamanage/smartquery/checkModelPermission', {
                "modelId": modelId
            }, function (rspData) {
                var rsp = $.parseJSON(rspData);
                if (rsp.code == 0) {
                    if (rsp.data == 1) { //0为没有权限 1为有权限
                        $("#save-model").removeClass("disabled");
                    }
                }
            });

            $.getJSON('/datamanage/smartquery/openModel', {
                modelId: modelId,
            }).done(function (res) {
                if (res.code == 0) {
                    var data = res.data;
                    //modelInfoForCopy = data;
                    batchInfo = JSON.parse(data.modelDetail);
                    setInfoForCopyOrModel(batchInfo);
                }
                else {
                    console.log("获取模型信息出错：", res.message);
                    Notify.show({
                        title: "获取模型信息出错！",
                        type: "error"
                    });
                }
            });
        }

        //将复制编辑的信息拷贝到页面中
        function getBatchInfoForCopy(batchId) {
            $.post('/datamanage/importbatch/GetBatchInfoByBatchID', {
                batchID: batchId,
            }).done(function (res) {
                var data = JSON.parse(res);
                if (data.code == 0) {
                    batchInfo = data.data.batchInfo.SYSDB_LOAD_TASK;
                    //basicSetup.setDataTypeId(batchInfo.dataTypeID);
                    setInfoForCopyOrModel(batchInfo);
                }
                else {
                    //alert("获取任务信息出错：" + data.message);
                    console.log("获取任务信息出错：", data.message);
                    Notify.show({
                        title: "获取任务信息出错！",
                        type: "error"
                    });
                }
            });
        }

        function setInfoForCopyOrModel(info) {
            setparams.setTaskType(info.taskType);
            if(info.taskType == 6){
                basicSetup.setDBConnInfo(info.dbConnInfo);
            }
            basicSetup.taskTypeSelectedChanged();
            setparams.setFileFilterRule(info.fileFilterRule);
            setparams.setWatchDir(info.watchDir);
            setparams.setHeadDef(info.haveHeadDef);
            setparams.setEncoding(info.encoding);
            setparams.setRowDelimeter(info.rowDelimeter);
            setparams.setColDelimeter(info.colDelimeter);
            setRules(info.m_rules);
            setOutCols(info.m_outColsIndex);
        }

        function updateSelectedRulesOfAllColsBasedRulesArray(m_rules) {
            var newAddColsNum = 0;
            selectedRulesOfAllCols = [];
            for (var i = 0; i < m_rules.length; ++i) {
                var colIndex = m_rules[i].m_outputColName - 1;
                if (selectedRulesOfAllCols[colIndex] == undefined) {
                    selectedRulesOfAllCols[colIndex] = new Object({
                        "selectRulesList": [],
                        "ruleInfos": []
                    });
                    if (m_rules[i].m_ruleID == addNewColRuleId) {
                        ++newAddColsNum;
                    }

                    var rootNode = new Object({
                        "text": "已添加的规则",
                        "ID": -1,
                        "Level": 1,
                        "tags": ['0'],
                        "nodes": []
                    });
                    selectedRulesOfAllCols[colIndex].selectRulesList.push(rootNode);
                }

                if (m_rules[i].m_ruleID == addNewColRuleId) {
                    selectedRulesOfAllCols[colIndex].ruleInfos[m_rules[i].m_ruleID + '_0'] = m_rules[i];
                }
                else {
                    var ruleBasicInfo = previewUtil.getRuleBasicInfo(ruleInfos, m_rules[i].m_ruleID);
                    selectedRulesOfAllCols[colIndex].selectRulesList[0].nodes.push(new Object({
                        "text": ruleBasicInfo.ruleDisplayName,
                        "ID": ruleBasicInfo.ruleID,
                        "Level": 2,
                        "Desc": ruleBasicInfo.ruleDesc,
                        "seq": m_rules[i].m_stepSN
                    }));
                    selectedRulesOfAllCols[colIndex].selectRulesList[0].tags[0]
                        = selectedRulesOfAllCols[colIndex].selectRulesList[0].nodes.length;
                    selectedRulesOfAllCols[colIndex].ruleInfos[m_rules[i].m_ruleID + '_' + m_rules[i].m_stepSN] = m_rules[i];
                }
            }
        }

        //为页面设置预处理规则
        function setRules(m_rules) {
            var newAddColsNum = 0;
            selectedRulesOfAllCols = [];
            //for (var i = 0; i < m_rules.length; ++i) {
            //    if (selectedRulesOfAllCols[m_rules[i].m_outputColName - 1] == undefined) {
            //        selectedRulesOfAllCols[m_rules[i].m_outputColName - 1] = new Object({
            //            "selectRulesList": [],
            //            "ruleInfos": []
            //        });
            //        if (m_rules[i].m_ruleID == addNewColRuleId) {
            //            ++newAddColsNum;
            //        }
            //    }
            //
            //    selectedRulesOfAllCols[m_rules[i].m_outputColName - 1].ruleInfos[m_rules[i].m_ruleID] = m_rules[i];
            //}
            //
            //getparams.setnewAddColsNum(newAddColsNum);

            $.getJSON('/datamanage/dataimport/GetAllUsablePreProcessRules', function (rsp) {
                if (rsp.code == 0) {
                    ruleInfos = rsp.data.allPrepRuleInfo;

                    for (var i = 0; i < m_rules.length; ++i) {
                        colIndex = m_rules[i].m_outputColName - 1;
                        if (selectedRulesOfAllCols[colIndex] == undefined) {
                            selectedRulesOfAllCols[colIndex] = new Object({
                                "selectRulesList": [],
                                "ruleInfos": []
                            });
                            if (m_rules[i].m_ruleID == addNewColRuleId) {
                                ++newAddColsNum;
                            }

                            var rootNode = new Object({
                                "text": "已添加的规则",
                                "ID": -1,
                                "Level": 1,
                                "tags": ['0'],
                                "nodes": []
                            });
                            selectedRulesOfAllCols[colIndex].selectRulesList.push(rootNode);
                        }

                        if (m_rules[i].m_ruleID == addNewColRuleId) {
                            selectedRulesOfAllCols[colIndex].ruleInfos[m_rules[i].m_ruleID + '_0'] = m_rules[i];
                        }
                        else {
                            ruleBasicInfo = previewUtil.getRuleBasicInfo(ruleInfos, m_rules[i].m_ruleID);
                            selectedRulesOfAllCols[colIndex].selectRulesList[0].nodes.push(new Object({
                                "text": ruleBasicInfo.ruleDisplayName,
                                "ID": ruleBasicInfo.ruleID,
                                "Level": 2,
                                "Desc": ruleBasicInfo.ruleDesc,
                                "seq": m_rules[i].m_stepSN
                            }));
                            selectedRulesOfAllCols[colIndex].selectRulesList[0].tags[0]
                                = selectedRulesOfAllCols[colIndex].selectRulesList[0].nodes.length;
                            selectedRulesOfAllCols[colIndex].ruleInfos[m_rules[i].m_ruleID + '_' + m_rules[i].m_stepSN] = m_rules[i];
                        }
                    }

                    //getparams.setnewAddColsNum(newAddColsNum);

                    //for (var i = 0; i < selectedRulesOfAllCols.length; ++i) {
                    //    if (selectedRulesOfAllCols[i] != undefined && selectedRulesOfAllCols[i].ruleInfos.length > 0) {
                    //        var rootNode = new Object({
                    //            "text": "已添加的规则",
                    //            "ID": -1,
                    //            "Level": 1,
                    //            "tags": ['0'],
                    //            "nodes": []
                    //        });
                    //        selectedRulesOfAllCols[i].selectRulesList.push(rootNode);
                    //
                    //        var tempArray = selectedRulesOfAllCols[i].ruleInfos.concat();
                    //        tempArray.sort(function (a, b) {
                    //            return a.m_stepSN - b.m_stepSN;
                    //        });
                    //        for (var j = 0; j < tempArray.length; ++j) {
                    //            if (tempArray[j] == undefined)
                    //                continue;
                    //
                    //            for (var treeRule = 0; treeRule < ruleInfos.length; ++treeRule) {
                    //                if (tempArray[j].m_ruleID == ruleInfos[treeRule].ruleID) {
                    //                    selectedRulesOfAllCols[i].selectRulesList[0].nodes.push(new Object({
                    //                        "text": ruleInfos[treeRule].ruleDisplayName,
                    //                        "ID": ruleInfos[treeRule].ruleID,
                    //                        "Level": 2,
                    //                        "Desc": ruleInfos[treeRule].ruleDesc,
                    //                        //"seq":
                    //                    }));
                    //
                    //                    break;
                    //                }
                    //            }
                    //        }
                    //    }
                    //}
                }
                else {
                    //alert("获取预处理规则出错：" + rsp.message);
                    console.log("获取预处理规则出错:" + rsp.message);
                    Notify.show({
                        title: "获取预处理规则出错！",
                        type: "error"
                    });
                }
            });
        }

        //为页面设置outColsIndexOfCopy
        function setOutCols(m_outColsIndex) {
            outColsIndexOfCopy = m_outColsIndex;
        }

//===============以上为复制任务、模型打开相关方法===============

//===============以下为预处理规则生效条件相关方法===============
        //初始化条件View
        function initConditionView() {
            $('#conditionView')[0].innerHTML = "";

            $('#conditionView')[0].innerHTML = '<div class="panel panel-info heading-border"><div class="widget-box"><div class="widget-title">'
                + '<span class="icon"><i class="glyphicon glyphicon-star"></i></span><button type="button" id="addCondition-btn" class="btn btn-primary" style="vertical-align:middle; margin: 2px 2px 0px 0px;">'
                + '<i class="fa fa fa-plus" ></i><span> 增加条件</span></button><button type="button" id="delCondition-btn" class="btn btn-danger" style="vertical-align:middle; margin: 2px 0px 0px 2px;">'
                + '<i class="fa fa-minus"></i><span> 删除条件</span></button><h5>仅当以下条件都满足时规则生效</h5></div><div class="widget-content nopadding">'
                + '<table id="conditionsTable" class="table table-striped table-bordered infoTable" style="line-height: 25px"><thead><tr><th style="width:30%; text-align: center;">函数</th>'
                + '<th style="width:70%; text-align: center;">参数</th></tr></thead><tbody></tbody></table></div></div></div>';

            //预处理规则增加生效条件按钮，增加条件按钮绑定click事件
            $("#addCondition-btn").bind("click", cond.addCondition);

            //预处理规则删除生效条件按钮，删除条件按钮绑定click事件
            $("#delCondition-btn").bind("click", delCond);

            //单击响应事件
            $("#conditionsTable").delegate("tr", "click", function () {
                var curRowIndex = $(this).parent().children('tr').index($(this));
                if (curRowIndex > 0) {
                    for (var i = 0; i < $("#conditionsTable")[0].rows.length; ++i) {
                        $("#conditionsTable")[0].rows[i].classList.remove('conditonSelected');
                    }
                    var tr = $("#conditionsTable")[0].rows[curRowIndex].classList;
                    tr.add('conditonSelected');
                }
                updateCurRowOfCondition(curRowIndex);
            });
        }

        //删除条件
        function delCond() {
            cond.setcurRowIndexOfCondition(curRowIndexOfCondition);
            cond.delCondition();
        }

        //更新生效条件表，当前选择的行
        function updateCurRowOfCondition(rowIndex) {
            curRowIndexOfCondition = rowIndex;
        }

        //设置指定规则节点的条件页面
        function setConditionView(node) {
            for (var i = 0; i < selectedRulesOfCurCol.ruleInfos[node.ID + '_' + node.seq].m_conditionInfoArrary.length; ++i) {
                var conditionsTable = document.getElementById("conditionsTable");
                var curRow = conditionsTable.insertRow();
                curRow.style.height = '25px';

                cell = curRow.insertCell();
                cell.innerHTML = '<select><option value="包含">包含</option>' +
                    '<option value="不包含" >不包含</option>' +
                    '<option value="长度大于" >长度大于</option>' +
                    '<option value="长度等于" >长度等于</option>' +
                    '<option value="长度小于" >长度小于</option>' +
                    '<option value="为空" >为空</option>' +
                    '<option value="以...结尾" >以...结尾</option>' +
                    '<option value="不以...结尾" >不以...结尾</option>' +
                    '<option value="以...开头" >以...开头</option>' +
                    '<option value="不以...开头" >不以...开头</option>' +
                    '<option value="不为空" >不为空</option>' +
                    '</select>';
                //conditionsTable.rows[1].cells[0].childNodes[0].selectedIndex =
                curRow.cells[0].childNodes[0].selectedIndex =
                    getIndexOfConditionName(selectedRulesOfCurCol.ruleInfos[node.ID + '_' + node.seq].
                        m_conditionInfoArrary[i].m_conditionName);

                cell = curRow.insertCell();
                cell.innerHTML = '<input type="text" class="gui-input" style="width:90%">';
                //conditionsTable.rows[1].cells[1].childNodes[0].value =
                curRow.cells[1].childNodes[0].value =
                    selectedRulesOfCurCol.ruleInfos[node.ID + '_' + node.seq].m_conditionInfoArrary[i].m_argu;

            }
        }

        function getIndexOfConditionName(ConditionName) {
            if (conditionNames == undefined || conditionNames.length <= 0)
                conditionNames = previewInit.initConditionNames();

            return conditionNames.indexOf(ConditionName);
        }

//===============以上为预处理规则生效条件相关方法===============

//===============以下为预处理规则树、已选择的规则树相关方法===============
        //初始化可用预处理规则树
        function initRulsTree() {
            var defaultData = new Array();
            var ruleDic = new Array();
            var ruleDirInfos = new Array();
            // ruleInfos = [];
            ruleClassArray = previewInit.initRuleClassArray();
            ruleParameterArray = previewInit.initRuleParameterArray();
            preViewColsNum = basicSetup.getColNum();
            if ((pageType == 2 || pageType == 3) && outColsIndexOfCopy.length >= basicSetup.getColNum()) {
                preViewColsNum = outColsIndexOfCopy.length;
            }
            $("#delColumn-Button").addClass("disabled");

            $.getJSON('/datamanage/dataimport/GetAllUsablePreProcessRules', function (rsp) {
                if (rsp.code == 0) {
                    ruleDirInfos = rsp.data.allPrepRuleDirInfo;
                    ruleInfos = rsp.data.allPrepRuleInfo;

                    for (var i = 0; i < ruleDirInfos.length; ++i) {
                        ruleDic[ruleDirInfos[i].dirID] = new Object({
                            "text": ruleDirInfos[i].dirName,
                            "ID": ruleDirInfos[i].dirID,
                            "Level": 1,
                            "tags": ['0'],
                            "nodes": []
                        });
                    }

                    for (var i = 0; i < ruleInfos.length; ++i) {
                        if (innerfun.getRuleClass(ruleClassArray, ruleInfos[i].ruleID) >= 0) {
                            ruleDic[ruleInfos[i].DIRID].nodes.push(new Object(
                                {
                                    "text": ruleInfos[i].ruleDisplayName,
                                    "ID": ruleInfos[i].ruleID,
                                    "Level": 2,
                                    "Desc": ruleInfos[i].ruleDesc
                                }));
                        }
                        else {
                            ruleDic[ruleInfos[i].DIRID].nodes.push(new Object(
                                {
                                    "text": ruleInfos[i].ruleDisplayName,
                                    "ID": ruleInfos[i].ruleID,
                                    "Level": 2,
                                    "tags": ['实现中'],
                                    "Desc": ruleInfos[i].ruleDesc
                                }));
                        }
                    }

                    for (var i = 0; i < ruleDirInfos.length; ++i) {
                        ruleDic[ruleDirInfos[i].dirID].tags[0] = ruleDic[ruleDirInfos[i].dirID].nodes.length;
                    }

                    console.log("ruleDic: ", ruleDic);

                    for (var i = 0; i < ruleDirInfos.length; ++i) {
                        defaultData.push(ruleDic[ruleDirInfos[i].dirID]);
                    }

                    $('#preRulesTree').treeview({
                        color: "#428bca",
                        data: defaultData,
                        showTags: true,
                        expand: false,
                        //  nodeIcon: "glyphicon glyphicon-bookmark",
                        multiSelect: $('#chk-select-multi').is(':checked'),
                        onNodeSelected: function (event, node) {
                            rulesTreeNodeClick(event, node);
                        }
                    });
                }
                else {
                    console.log("获取预处理规则失败:" + rsp.message);
                    //alert("获取预处理规则失败：" + data.message);
                    Notify.show({
                        title: "获取预处理规则失败！",
                        type: "error"
                    });
                }
            });
        }

        //点击规则树的节点，触发该事件
        function rulesTreeNodeClick(event, node) {
            //console.log("Name", node.text);
            //console.log("ID", node.ID);
            //console.log("Level", node.Level);
            //console.log("node", node);
            curAddNode = node;
        }

        //点击已选择的规则树的节点，触发该事件
        function selectedRulesTreeNodeClick(event, node) {
            saveParameterSet();
            console.log("curDelNode", curDelNode);
            console.log("curDelNode ruleInfos", selectedRulesOfCurCol.ruleInfos[curDelNode.ID + '_' + curDelNode.seq]);

            //for (var i = 0; i < selectedRulesOfCurCol.selectRulesList[0].nodes.length; ++i) {
            //    if (selectedRulesOfCurCol.selectRulesList[0].nodes[i].ID == curDelNode.ID) {
            //        selectedRulesOfCurCol.selectRulesList[0].nodes[i].state.selected = false;
            //    }
            //}

            curDelNode = _.clone(node);
            console.log("curDelNode", curDelNode);
            console.log("curDelNode ruleInfos", selectedRulesOfCurCol.ruleInfos[curDelNode.ID + '_' + curDelNode.seq]);
            setParamsAndConds(curDelNode);
        }

        //向已选择规则树添加新规则，即增加新节点
        function addNode() {
            basicSetup.setToRefreshMapTable(true);
            if (curAddNode.Level != 2)
                return;

            //var isExist = false;
            //for (var i = 0; i < selectedRulesOfCurCol.selectRulesList[0].nodes.length; ++i) {
            //    selectedRulesOfCurCol.selectRulesList[0].nodes[i].state.selected = false;
            //    if (selectedRulesOfCurCol.selectRulesList[0].nodes[i].ID == curAddNode.ID) {
            //        selectedRulesOfCurCol.selectRulesList[0].nodes[i].state.selected = true;
            //        isExist = true;
            //        curDelNode = selectedRulesOfCurCol.selectRulesList[0].nodes[i];
            //    }
            //}

            ////该规则已经存在
            //if (isExist) {//该规则已经存在
            //    $('#selectedRulesTree').treeview({
            //        color: "#428bca",
            //        background: "ligntGrey",
            //        data: selectedRulesOfCurCol.selectRulesList,
            //        showTags: true,
            //        expand: true,
            //        nodeIcon: "glyphicon glyphicon-bookmark",
            //        multiSelect: $('#chk-select-multi').is(':checked'),
            //        onNodeSelected: function (event, node) {
            //            selectedRulesTreeNodeClick(event, node);
            //        }
            //    });
            //    setParamsAndConds(curDelNode);
            //    return;
            //}

            //取消原有规则的选中状态
            for (var i = 0; i < selectedRulesOfCurCol.selectRulesList[0].nodes.length; ++i) {
                selectedRulesOfCurCol.selectRulesList[0].nodes[i].state.selected = false;
            }

            //if (selectedRulesOfCurCol.ruleInfos.length <= curAddNode.ID ||
            //    selectedRulesOfCurCol.ruleInfos[curAddNode.ID] == undefined) {
            //    selectedRulesOfCurCol.ruleInfos[curAddNode.ID] = new Object({

            curAddNode.seq = previewUtil.getRulesListSeq(selectedRulesOfCurCol);
            if (selectedRulesOfCurCol.ruleInfos[curAddNode.ID + '_' + curAddNode.seq] == undefined) {
                selectedRulesOfCurCol.ruleInfos[curAddNode.ID + '_' + curAddNode.seq] = new Object({
                    "m_codeArray": [],
                    "m_conditionInfoArrary": [],
                    "m_discardFilterConditionInfoVec": [],
                    "m_inputColNamesArray": [],
                    "m_outputColName": curColIndex + 1,
                    "m_outputColType": "",
                    "m_paramsArray": [],
                    "m_regexExp": "",
                    "m_regexParamsArray": [],
                    "m_ruleID": curAddNode.ID,
                    "m_saveFilterConditionInfoVec": [],
                    "m_stepSN": previewUtil.getMaxStepSN(selectedRulesOfCurCol) + 1,
                    "m_viewGuid": ""
                });
            }
            //curAddNode.state.selected = true;
            var curAddNodeCopy = _.clone(curAddNode);
            curAddNodeCopy.state = _.clone(curAddNode.state);
            curAddNodeCopy.state.selected = true;
            //console.log("before selectedRulesOfCurCol", selectedRulesOfCurCol);
            //curAddNodeCopy.state.selected = true;
            selectedRulesOfCurCol.selectRulesList[0].nodes.push(curAddNodeCopy);
            selectedRulesOfCurCol.selectRulesList[0].tags[0] =
                selectedRulesOfCurCol.selectRulesList[0].nodes.length;
            $('#ruleName')[0].textContent = curAddNodeCopy.text + '(' + curAddNodeCopy.Desc + ')';// + curAddNodeCopy.seq;
            curDelNode = curAddNodeCopy;

            initParameterView(curDelNode);
            initConditionView();

            console.log("selectedRulesOfCurCol", selectedRulesOfCurCol);
            $('#selectedRulesTree').treeview({
                color: "#428bca",
                background: "ligntGrey",
                data: selectedRulesOfCurCol.selectRulesList,
                showTags: true,
                expand: true,
                nodeIcon: "glyphicon glyphicon-bookmark",
                multiSelect: $('#chk-select-multi').is(':checked'),
                onNodeSelected: function (event, node) {
                    selectedRulesTreeNodeClick(event, node);
                }
            });
        }

        //从已选择规则树删除规则，即删除节点
        function deleteNode() {
            basicSetup.setToRefreshMapTable(true);
            if (curDelNode == undefined)
                return;

            if (curDelNode.Level != 2)
                return;

            for (var i = 0; i < selectedRulesOfCurCol.selectRulesList[0].nodes.length; ++i) {
                if (curDelNode.ID == selectedRulesOfCurCol.selectRulesList[0].nodes[i].ID) {
                    selectedRulesOfCurCol.selectRulesList[0].nodes.splice(i, 1);
                    selectedRulesOfCurCol.ruleInfos[curDelNode.ID + '_' + curDelNode.seq] = undefined;
                    break;
                }
            }
            if (selectedRulesOfCurCol.selectRulesList[0].nodes.length > 0) {
                selectedRulesOfCurCol.selectRulesList[0].
                    nodes[selectedRulesOfCurCol.selectRulesList[0].nodes.length - 1].state.selected = true;
                curDelNode = selectedRulesOfCurCol.selectRulesList[0].nodes[selectedRulesOfCurCol.selectRulesList[0].nodes.length - 1];
                setParamsAndConds(curDelNode);
            }
            else {
                $('#parameterView')[0].innerHTML = "";
                $('#parameterView')[0].innerHTML += '<br /><br />';
                $('#conditionView')[0].innerHTML = "";
                curDelNode = undefined;
            }

            selectedRulesOfCurCol.selectRulesList[0].tags[0] = selectedRulesOfCurCol.selectRulesList[0].nodes.length;

            $('#selectedRulesTree').treeview({
                color: "#428bca",
                data: selectedRulesOfCurCol.selectRulesList,
                showTags: true,
                expand: true,
                nodeIcon: "glyphicon glyphicon-bookmark",
                multiSelect: $('#chk-select-multi').is(':checked'),
                onNodeSelected: function (event, node) {
                    selectedRulesTreeNodeClick(event, node);
                }
            });
        }

//===============以上为预处理规则树、已选择的规则树相关方法===============

//===============以下为预处理规则初始化、设置、保存相关方法===============
        //获取当前规则的参数
        function getParams(ruleClass, ruleID, seq) {
            var paramsArray = new Array();
            var codeArray = new Array();
            var res = new Object();
            switch (ruleClass) {
                case 0:
                    //"无参数";
                    res = new Object({
                        paramsArray: paramsArray,
                        codeArray: codeArray
                    });
                    break;
                case 1:
                    paramsArray = getruleparams.getParamsForClass1(ruleID, ruleParameterArray, selectedRulesOfCurCol, seq);
                    res = new Object({
                        paramsArray: paramsArray,
                        codeArray: codeArray
                    });
                    break;
                case 2:
                    paramsArray = getruleparams.getParamsForClass2(ruleID, ruleParameterArray, selectedRulesOfCurCol, seq);
                    res = new Object({
                        paramsArray: paramsArray,
                        codeArray: codeArray
                    });
                    break;
                case 3:
                    paramsArray = getruleparams.getParamsForClass3(ruleID, ruleParameterArray, selectedRulesOfCurCol, seq);
                    res = new Object({
                        paramsArray: paramsArray,
                        codeArray: codeArray
                    });
                    break;
                case 4:
                    res = getruleparams.getParamsForClass4(ruleID, ruleParameterArray, selectedRulesOfCurCol, seq);
                    break;
                case 5:
                    paramsArray = getruleparams.getParamsForClass5(ruleID, ruleParameterArray, selectedRulesOfCurCol, seq);
                    res = new Object({
                        paramsArray: paramsArray,
                        codeArray: codeArray
                    });
                    break;
                default :
                    break;
            }

            return res;
        }

        //保存当前列设置的预处理规则以及生效条件
        function saveSelectedRulesForCurCol() {
            if (curColIndex >= 0) {
                saveParameterSet();
                selectedRulesOfAllCols[curColIndex] = selectedRulesOfCurCol;
                if (selectedRulesOfCurCol !== undefined) {
                    //for (var i = 0; i < selectedRulesOfCurCol.selectRulesList[0].nodes.length; ++i) {
                    //    if (selectedRulesOfCurCol.selectRulesList[0].nodes[i].ID == curDelNode.ID) {
                    //        selectedRulesOfCurCol.selectRulesList[0].nodes[i].state.selected = true;
                    //        break;
                    //    }
                    //}
                    if (selectedRulesOfCurCol.selectRulesList[0].nodes.length > 0)
                        return curColIndex;
                }
            }
            return -1;
        }

        function checkCurColIsNewAdd() {
            if (curColIndex >= 0) {
                if (selectedRulesOfCurCol !== undefined &&
                    selectedRulesOfCurCol.ruleInfos[addNewColRuleId + '_0'] !== undefined){
                    return curColIndex;
                }
            }
            return -1;
        }

        //对当前列设置预处理规则以及生效条件
        function setSelectedRulesForCurCol(curCol) {
            curColIndex = curCol;
            selectedRulesOfCurCol = selectedRulesOfAllCols[curColIndex];

            if (selectedRulesOfCurCol == undefined || selectedRulesOfCurCol.ruleInfos[addNewColRuleId + '_0'] == undefined) {
                $("#delColumn-Button").addClass("disabled");
            }
            else if (selectedRulesOfCurCol.ruleInfos[addNewColRuleId + '_0'] !== undefined) {
                $("#delColumn-Button").removeClass("disabled");
                var htmlStr = '';
                // $("#selectedFieldName").html($("#preView-Table")[0].rows[0].cells[curColIndex].innerHTML
                //     + '('+selectedRulesOfCurCol.ruleInfos[addNewColRuleId + '_0'].m_inputColNamesArray.toString()+')');
                htmlStr += $("#preView-Table")[0].rows[0].cells[curColIndex].innerHTML + '(该列为新建列，由';
                for(var i=0, j=0; i<selectedRulesOfCurCol.ruleInfos[addNewColRuleId + '_0'].m_paramsArray.length; ++i){
                    if(selectedRulesOfCurCol.ruleInfos[addNewColRuleId + '_0'].m_paramsArray[i].length >0)
                        htmlStr += '值['+selectedRulesOfCurCol.ruleInfos[addNewColRuleId + '_0'].m_paramsArray[i]+'] ';
                    else if(selectedRulesOfCurCol.ruleInfos[addNewColRuleId + '_0'].m_inputColNamesArray[j]!=undefined){
                        htmlStr += '列[' + $("#preView-Table")[0].rows[0].cells[
                            selectedRulesOfCurCol.ruleInfos[addNewColRuleId + '_0'].m_inputColNamesArray[j]-1].innerHTML +'] ';
                        j++;
                    }
                }
                htmlStr += ' 组成)';
                $("#selectedFieldName").html(htmlStr);
            }

            if (selectedRulesOfCurCol == undefined) {
                $('#parameterView')[0].innerHTML = "";
                $('#conditionView')[0].innerHTML = "";
                selectedRulesOfCurCol = new Object({
                    "selectRulesList": [],
                    "ruleInfos": []
                });

                var rootNode = new Object({
                    "text": "已添加的规则",
                    "ID": -1,
                    "Level": 1,
                    "tags": ['0'],
                    "nodes": []
                });
                selectedRulesOfCurCol.selectRulesList.push(rootNode);
                curDelNode = undefined;
            }
            else {
                curDelNode = undefined;
                for (var i = 0; i < selectedRulesOfCurCol.selectRulesList[0].nodes.length; ++i) {
                    if (selectedRulesOfCurCol.selectRulesList[0].nodes[i].state == undefined) {
                        if (i == 0) {
                            curDelNode = selectedRulesOfCurCol.selectRulesList[0].nodes[i];
                            selectedRulesOfCurCol.selectRulesList[0].nodes[i].state = new Object({
                                "selected": true
                            });
                        }
                        else {
                            selectedRulesOfCurCol.selectRulesList[0].nodes[i].state = new Object({
                                "selected": false
                            });
                        }
                    }
                    else if (selectedRulesOfCurCol.selectRulesList[0].nodes[i].state.selected) {
                        curDelNode = selectedRulesOfCurCol.selectRulesList[0].nodes[i];
                        break;
                    }
                }
                if (curDelNode != undefined) {
                    setParamsAndConds(curDelNode);
                }
                else {
                    $('#parameterView')[0].innerHTML = "";
                    $('#conditionView')[0].innerHTML = "";
                }
            }

            $('#selectedRulesTree').treeview({
                color: "#428bca",
                data: selectedRulesOfCurCol.selectRulesList,
                showTags: true,
                expand: true,
                nodeIcon: "glyphicon glyphicon-bookmark",
                multiSelect: $('#chk-select-multi').is(':checked'),
                onNodeSelected: function (event, node) {
                    selectedRulesTreeNodeClick(event, node);
                }
            });
        }

        function initParameterView(node, isNeedSetParams, m_paramsArray) {
            $('#parameterView')[0].innerHTML = "";
            switch (innerfun.getRuleClass(ruleClassArray, node.ID)) {
                case 0:
                    $('#parameterView')[0].innerHTML = "无参数";
                    break;
                case 1:
                    previewInit.initParameterViewForClass1(node, ruleParameterArray);
                    break;
                case 2:
                    previewInit.initParameterViewForClass2(node, ruleParameterArray);
                    break;
                case 3:
                    previewInit.initParameterViewForClass3(node, ruleParameterArray);
                    break;
                case 4:
                    previewInit.initParameterViewForClass4(node, ruleParameterArray, isNeedSetParams, m_paramsArray);
                    break;
                case 5:
                    previewInit.initParameterViewForClass5(node, ruleParameterArray);
                    break;
                default :
                    $('#parameterView')[0].innerHTML = "未实现";
                    break;
            }
            $('#parameterView')[0].innerHTML += '<br /><br />';
        }

        //保存当前规则的参数设置
        function saveParameterSet() {
            if (curDelNode == undefined)
                return;

            var ruleClass = innerfun.getRuleClass(ruleClassArray, curDelNode.ID);

            //清空数组
            //selectedRulesOfCurCol.ruleInfos[curDelNode.ID].m_paramsArray.
            //    splice(0, selectedRulesOfCurCol.ruleInfos[curDelNode.ID].m_paramsArray.length);
            //selectedRulesOfCurCol.ruleInfos[curDelNode.ID].m_conditionInfoArrary.
            //    splice(0, selectedRulesOfCurCol.ruleInfos[curDelNode.ID].m_conditionInfoArrary.length);

            selectedRulesOfCurCol.ruleInfos[curDelNode.ID + '_' + curDelNode.seq].m_paramsArray = [];
            selectedRulesOfCurCol.ruleInfos[curDelNode.ID + '_' + curDelNode.seq].m_conditionInfoArrary = [];

            //获取参数
            //selectedRulesOfCurCol.ruleInfos[curDelNode.ID].m_inputColNamesArray = innerfun.getInputCols(curColIndex, ruleClass);
            //selectedRulesOfCurCol.ruleInfos[curDelNode.ID].m_conditionInfoArrary = innerfun.getConditions();

            selectedRulesOfCurCol.ruleInfos[curDelNode.ID + '_' + curDelNode.seq].m_inputColNamesArray = innerfun.getInputCols(curColIndex, ruleClass);
            selectedRulesOfCurCol.ruleInfos[curDelNode.ID + '_' + curDelNode.seq].m_conditionInfoArrary = innerfun.getConditions();

            //ruleClass为4时，需要调用服务或者读取文件，需要同步，所以在此页面实现
            //if(ruleClass == 4){
            //    var colIndex = curColIndex;
            //    var selectedRules = selectedRulesOfCurCol;
            //    var delNode = curDelNode;
            //    switch (delNode.ID) {
            //        case 1013:
            //            var transformType = $("#transform-type")[0].value;
            //            if(transformType == 0){
            //                getTransformType0Params(colIndex, selectedRules, delNode);
            //            }
            //            else if(transformType == 1){
            //                getTransformType1Params(colIndex, selectedRules, delNode);
            //            }
            //            break;
            //        default :
            //            break;
            //    }
            //}
            //else
            {
                var res = getParams(ruleClass, curDelNode.ID, curDelNode.seq);
                //selectedRulesOfCurCol.ruleInfos[curDelNode.ID].m_paramsArray = res.paramsArray;
                //selectedRulesOfCurCol.ruleInfos[curDelNode.ID].m_codeArray = res.codeArray;

                selectedRulesOfCurCol.ruleInfos[curDelNode.ID + '_' + curDelNode.seq].m_paramsArray = res.paramsArray;
                selectedRulesOfCurCol.ruleInfos[curDelNode.ID + '_' + curDelNode.seq].m_codeArray = res.codeArray;
            }
        }

        function setParameterView(node) {
            switch (innerfun.getRuleClass(ruleClassArray, node.ID)) {
                case 0:
                    break;
                case 1:
                    setruleparams.setParamsForClass1(node, ruleParameterArray, selectedRulesOfCurCol);
                    break;
                case 2:
                    setruleparams.setParamsForClass2(node, ruleParameterArray, selectedRulesOfCurCol);
                    break;
                case 3:
                    setruleparams.setParamsForClass3(node, ruleParameterArray, selectedRulesOfCurCol);
                    break;
                case 4:
                    setruleparams.setParamsForClass4(node, ruleParameterArray, selectedRulesOfCurCol);
                    break;
                case 5:
                    setruleparams.setParamsForClass5(node, ruleParameterArray, selectedRulesOfCurCol);
                    break;
                default :
                    break;
            }
        }

        function setParamsAndConds(node) {
            $('#ruleName')[0].textContent = node.text + '(' + node.Desc + ')' ;//+ node.seq;

            if (previewUtil.isNeedSetParams(node.ID)) {
                //initParameterView(node, true, selectedRulesOfCurCol.ruleInfos[node.ID].m_paramsArray);
                initParameterView(node, true,
                    selectedRulesOfCurCol.ruleInfos[node.ID + '_' + node.seq].m_paramsArray);
            }
            else {
                initParameterView(node);
            }
            initConditionView();
            setParameterView(node);
            setConditionView(node);
        }

        //设置预览表格数据
        function setPreViewTable() {
            //console.log("getToRefreshPreViewTable", basicSetup.getToRefreshPreViewTable());
            //console.log("preViewResultArray", preViewResultArray);
            //console.log("displayPreViewRes");

            if (basicSetup.getToRefreshPreViewTable() || preViewResultArray == undefined || preViewResultArray.length <= 0) {
                if (basicSetup.getFileType() == 'txt') {//file.type.indexOf("text") >= 0) {//文本文件
                    var file = document.getElementById("selectFile-Button").files[0];
                    var viewText = file.slice(0, basicSetup.getViewSize());
                    var read = new FileReader();
                    read.readAsText(viewText, basicSetup.getfileEncoding());//, "GB2312");

                    read.onload = function (e) {
                        basicSetup.setPreViewTableForFirstTime('txt', this.result);

                        if (isCopyForPreView) {
                            if (selectedRulesOfAllCols != undefined && selectedRulesOfAllCols.length >= 0) {
                                var setRulesCols = new Array();
                                var newAddCols = [];
                                for (var i = 0; i < selectedRulesOfAllCols.length; ++i) {
                                    // if (selectedRulesOfAllCols[i] != undefined && selectedRulesOfAllCols[i].selectRulesList != undefined
                                    //     && selectedRulesOfAllCols[i].selectRulesList[0].nodes.length > 0) {
                                    //     setRulesCols.push(i);
                                    // }
                                    if(innerfun.checkColHasSetRuls(selectedRulesOfAllCols, i)){
                                        setRulesCols.push(i);
                                    }
                                    if (selectedRulesOfAllCols[i] !== undefined &&
                                        selectedRulesOfAllCols[i].ruleInfos[addNewColRuleId + '_0'] !== undefined){
                                        newAddCols.push(i);
                                    }
                                }
                                innerfun.setClassForSelectedRules(setRulesCols);
                                innerfun.setClassForNewAddCol(newAddCols);
                            }
                            preViewByRules();
                            isCopyForPreView = false;
                        }
                    }
                    // basicSetup.setToRefreshMapTable(true);
                }
                else if (basicSetup.getFileType() == 'excel') {//(file.type.indexOf("sheet") >= 0) {
                    basicSetup.setPreViewTableForFirstTime('excel', "");

                    if (isCopyForPreView) {
                        if (selectedRulesOfAllCols != undefined && selectedRulesOfAllCols.length >= 0) {
                            var setRulesCols = new Array();
                            var newAddCols = [];
                            for (var i = 0; i < selectedRulesOfAllCols.length; ++i) {
                                if(innerfun.checkColHasSetRuls(selectedRulesOfAllCols, i)) {
                                    setRulesCols.push(i);
                                }
                                if (selectedRulesOfAllCols[i] !== undefined &&
                                    selectedRulesOfAllCols[i].ruleInfos[addNewColRuleId + '_0'] !== undefined){
                                    newAddCols.push(i);
                                }
                            }
                            innerfun.setClassForSelectedRules(setRulesCols);
                            innerfun.setClassForNewAddCol(newAddCols);
                        }
                        isCopyForPreView = false;
                    }
                }
                else if (basicSetup.getFileType() == 'dataBase') {//(file.type.indexOf("sheet") >= 0) {
                    basicSetup.setPreViewTableForFirstTime('dataBase', "");

                    if (isCopyForPreView) {
                        if (selectedRulesOfAllCols != undefined && selectedRulesOfAllCols.length >= 0) {
                            var setRulesCols = new Array();
                            var newAddCols = [];
                            for (var i = 0; i < selectedRulesOfAllCols.length; ++i) {
                                if(innerfun.checkColHasSetRuls(selectedRulesOfAllCols, i)) {
                                    setRulesCols.push(i);
                                }
                                if (selectedRulesOfAllCols[i] !== undefined &&
                                    selectedRulesOfAllCols[i].ruleInfos[addNewColRuleId + '_0'] !== undefined){
                                    newAddCols.push(i);
                                }
                            }
                            innerfun.setClassForSelectedRules(setRulesCols);
                            innerfun.setClassForNewAddCol(newAddCols);
                        }
                        isCopyForPreView = false;
                    }
                }
                else {
                    alert("该文件类型暂时不能解析！");
                }
            }
            else {
                console.log("setPreViewTable displayPreViewRes!!!");
                displayPreViewRes();
            }
        }

        //生成导入第四步的字段映射表
        function setMapTable() {
            if (!basicSetup.getToRefreshMapTable())
                return;

            var setTable = document.getElementById("setTable");

            for (var i = setTable.rows.length - 1; i >= 0; --i) {
                setTable.deleteRow(i);
            }

            if (preViewResultArray != undefined && preViewResultArray.length > 0) {
                for (var i = 0; i < preViewResultArray.length - 1; ++i) {
                    colArray = preViewResultArray[i];

                    curRow = setTable.insertRow();

                    for (var j = 0; j < preViewResultArray[i].length; ++j) {
                        cell = curRow.insertCell();
                        cell.innerHTML = preViewResultArray[i][j];
                    }
                }
                if (basicSetup.getIsFirstRowHead()) {
                    curRow = setTable.insertRow(0); //.insertRow();
                    curRow.classList.add('tableHead');
                    var headArray = basicSetup.getHeadArray();
                    var i = 0;
                    for (i = 0; i < headArray.length; ++i) {
                        cell = curRow.insertCell();
                        cell.innerHTML = headArray[i];
                    }
                    if (i < outputColIndex.length) {
                        for (; i < outputColIndex.length; ++i) {
                            cell = curRow.insertCell();
                            cell.innerHTML = "列" + (i + 1).toString();
                        }
                    }
                    //for (var i = 1; i <= headArray.length; ++i) {
                    //    cell = curRow.insertCell();
                    //    cell.innerHTML = headArray[i - 1];
                    //}
                }
            }
            else {
                if (basicSetup.getTextContent() == undefined)
                    return;
                var rowArray = basicSetup.getTextContent().split(basicSetup.getRowSplit(), basicSetup.getMaxRowNum());
                for (var i = 0; i < rowArray.length - 1; ++i) {
                    colArray = rowArray[i].split(basicSetup.getColSplit(), basicSetup.getColRowNum());

                    curRow = setTable.insertRow();
                    //if (basicSetup.getColNum() < colArray.length)
                    //    basicSetup.setColNum(colArray.length);
                    for (var j = 0; j < colArray.length; ++j) {
                        cell = curRow.insertCell();
                        cell.innerHTML = colArray[j];
                    }
                }
            }

            if (preViewResultArray.length > 0) {
                if (!basicSetup.getIsFirstRowHead()) {
                    curRow = setTable.insertRow(0); //.insertRow();
                    for (var i = 1; i <= preViewResultArray[0].length; ++i) {
                        cell = curRow.insertCell();
                        cell.innerHTML = "列" + i.toString();
                    }
                    curRow.classList.add('tableHead');
                }
            }

            $.post('/datamanage/dataimport/GetDataTypeDefineInfo', {
                dataTypeId: basicSetup.getDataTypeId(),
                centerCode: basicSetup.centerCodeOfCurDataType(),
                zoneId: basicSetup.zoneIdOfCurDataType()
            }).
                done(function (data1) {
                    var data = JSON.parse(data1);
                    console.log("GetDataTypeDefineInfo", data);
                    if (data.code == 0) {
                        var colArrayOfDataType = new Array();
                        isCopyForMapHead = true;
                        colArrayOfDataType = previewUtil.processDataTypeColList(data.data.datatype.columnList);
                        basicSetup.setColInfoArrayOfDataType(colArrayOfDataType);
                        console.log("colArrayOfDataType", colArrayOfDataType);
                        outputColArrayNew = basicSetup.getOutputColArray();
                        console.log("outputColArrayNew", outputColArrayNew);
                        setDataTypeColumFields(colArrayOfDataType);
                    }
                    else {
                        Notify.show({
                            title: "获取数据类型信息出错！",
                            type: "error"
                        });
                    }
                });
        }

        //生成字段映射的下拉菜单，以及初始化菜单选项
        function setDataTypeColumFields(colArrayOfDataType) {
            if (preViewResultArray != undefined && preViewResultArray.length > 0) {
                basicSetup.setDataTypeColumFieldsForFirstTime(preViewResultArray[0].length);
            }
            else {
                basicSetup.setDataTypeColumFieldsForFirstTime(basicSetup.getColNum());
            }

            if (isCopyForColMap) {
                var outputColArray = new Array();
                for (var i = 0, j = 0; i < preViewColsNum && j < outColsIndexOfCopy.length; ++i, ++j) {
                    var colSelect = document.getElementById(i);
                    if (outColsIndexOfCopy[j] == -1) {
                        colSelect.selectedIndex = 0;
                        outputColArray[i] = outColsIndexOfCopy[j];
                    }
                    else {
                        colSelect.selectedIndex = previewUtil.getselectedIndex(colSelect, outColsIndexOfCopy[j]);
                        outputColArray[i] = outColsIndexOfCopy[j];
                    }
                }
                basicSetup.setOutputColArray(outputColArray);
                isCopyForColMap = false;
            }

            if (outputColArrayNew != undefined) {
                basicSetup.cancelMapFields();
                var outputColArray = new Array();
                for (var i = 0, j = 0; i < preViewColsNum && j < outputColArrayNew.length; ++i, ++j) {
                    var colSelect = document.getElementById(i);
                    if (outputColArrayNew[j] == -1) {
                        colSelect.selectedIndex = 0;
                        outputColArray[i] = outputColArrayNew[j];
                    }
                    else {
                        colSelect.selectedIndex = 0;
                        outputColArray[i] = -1;
                        for (var index in colSelect.children) {
                            if (colSelect.children[index].value == outputColArrayNew[j]) {
                                colSelect.selectedIndex = index;//outputColArrayNew[j];
                                outputColArray[i] = outputColArrayNew[j];
                            }
                        }
                    }
                }
                basicSetup.setOutputColArray(outputColArray);
            }
        }

//===============以上为预处理规则初始化、设置、保存相关方法===============

//===============以下为预览相关方法===============
        //预览
        function preViewByRules(needSetMapTable) {
            saveParameterSet();
            selectedRulesOfAllCols[curColIndex] = selectedRulesOfCurCol;

            typeId = basicSetup.getDataTypeId();
            if (!basicSetup.getIsFirstRowHead())
                header = 0;
            else
                header = 1;

            var m_stepSN = 0;
            rulesArray = [];
            getRulesArray();
            processNewAddCols();
            outputColIndex = [];
            getOutputColIndex();

            console.log(" basicSetup.getColNum", basicSetup.getColNum());
            console.log("preViewColsNum", preViewColsNum);
            console.log("outputColIndex", outputColIndex);
            console.log("rulesArray", rulesArray);

            if (rulesArray.length >= 0) {
                $.post('/datamanage/dataimport/PreView', {
                    "text": basicSetup.getPreViewText(),
                    "dataTypeId": basicSetup.getDataTypeId(),
                    "centerCode": basicSetup.getCenterCodeOfCurDataType(),
                    "rowDelimeter": basicSetup.getRowSplit(),
                    "colDelimeter": basicSetup.getColSplit(),
                    "rules": JSON.stringify(rulesArray),
                    "outputColIndex": JSON.stringify(outputColIndex),//'[1,2,3]',
                    "headerDefinition": header,
                    "encoding": basicSetup.getfileEncoding()
                }).done(
                    function (res) {
                        var data = JSON.parse(res);
                        if (data.code == 0) {
                            preViewResultArray = data.data.resultArray;
                            basicSetup.setToRefreshPreViewTable(false);
                            console.log("preViewResultArray", preViewResultArray);
                            displayPreViewRes();
                            if (needSetMapTable == true) {
                                setMapTable();
                            }
                        }
                        else {
                            console.log("预览失败:" + data.message);
                            Notify.show({
                                title: "预览失败！",
                                type: "error"
                            });
                        }
                    });
            }
            else {
                setPreViewTable();
                if (needSetMapTable == true) {
                    setMapTable();
                }
            }
            basicSetup.setToRefreshMapTable(true);
        }

        function displayPreViewRes() {
            var preViewTable = document.getElementById("preView-Table");

            for (var i = preViewTable.rows.length - 1; i >= 0; --i)
                preViewTable.deleteRow(i);

            for (var i = 0; i < preViewResultArray.length - 1; ++i) {
                colArray = preViewResultArray[i];

                curRow = preViewTable.insertRow();

                for (var j = 0; j < preViewResultArray[i].length; ++j) {
                    cell = curRow.insertCell();
                    cell.innerHTML = preViewResultArray[i][j];
                }
            }

            if (!basicSetup.getIsFirstRowHead()) {
                curRow = preViewTable.insertRow(0); //.insertRow();
                if (outputColIndex.length > 0) {
                    for (var i = 1; i <= outputColIndex.length; ++i) {
                        cell = curRow.insertCell();
                        cell.innerHTML = "列" + i.toString(); //'<select> </select>';
                    }
                }
            }
            else {
                curRow = preViewTable.insertRow(0); //.insertRow();
                var headArray = basicSetup.getHeadArray();
                var i = 0;
                for (i = 0; i < headArray.length; ++i) {
                    cell = curRow.insertCell();
                    cell.innerHTML = headArray[i];
                }
                if (i < outputColIndex.length) {
                    for (; i < outputColIndex.length; ++i) {
                        cell = curRow.insertCell();
                        cell.innerHTML = "列" + (i + 1).toString();
                    }
                }
            }

            if (selectedRulesOfAllCols != undefined && selectedRulesOfAllCols.length >= 0) {
                var setRulesCols = [];
                var newAddCols = [];
                console.log("selectedRulesOfAllCols", selectedRulesOfAllCols.length);
                for (var i = 0; i < selectedRulesOfAllCols.length; ++i) {
                    // console.log("checkColHasSetRuls:", i);
                    if(innerfun.checkColHasSetRuls(selectedRulesOfAllCols, i)){
                        setRulesCols.push(i);
                    }
                    if (selectedRulesOfAllCols[i] !== undefined &&
                        selectedRulesOfAllCols[i].ruleInfos[addNewColRuleId + '_0'] !== undefined){
                        newAddCols.push(i);
                    }
                }
                innerfun.setClassForSelectedRules(setRulesCols);
                console.log("setRulesCols", setRulesCols);
                innerfun.setClassForNewAddCol(newAddCols);
                console.log("newAddCols", newAddCols);
            }

            if (curColIndex != undefined && curColIndex >= 0) {
                innerfun.setClassForCurSelectedCol(curColIndex);
            }

            if (preViewTable.rows.length > 0)
                preViewTable.rows[0].classList.add('tableHead');
        }

        function getRulesArray() {
            for (var i = 0; i < selectedRulesOfAllCols.length; ++i) {
                m_stepSN = 0;
                if (selectedRulesOfAllCols[i] != undefined) {
                    var tempArray = selectedRulesOfAllCols[i].ruleInfos;
                    tempArray.sort(function (a, b) {
                        return a.m_stepSN - b.m_stepSN;
                    });
                    for (var index in tempArray) {
                        if (tempArray[index] != undefined) {
                            rulesArray.push(tempArray[index]);
                        }
                    }
                }
            }
        }

        function processNewAddCols() {
            if (rulesArray.length >= 0) { //(pageType == 2 || pageType == 3) &&
                //新建列数量
                var newAddColsNum = 0;
                for (var i = 0; i < rulesArray.length; ++i) {
                    if (rulesArray[i].m_ruleID == addNewColRuleId) {
                        newAddColsNum++;
                        var outputColName = rulesArray[i].m_outputColName;
                        var newColNum = basicSetup.getColNum() + newAddColsNum;
                        for (var j = i+1; j < rulesArray.length; ++j) {
                            if (outputColName == rulesArray[j].m_outputColName) {
                                // if (rulesArray[j].m_ruleID != addNewColRuleId) {
                                //     rulesArray[j].m_inputColNamesArray[0] = newColNum;
                                // }
                                rulesArray[j].m_outputColName = newColNum;
                            }

                            for (var k = 0; k < rulesArray[j].m_inputColNamesArray.length; ++k) {
                                if (outputColName == rulesArray[j].m_inputColNamesArray[k]) {
                                    rulesArray[j].m_inputColNamesArray[k] = newColNum;
                                }
                            }
                        }
                        rulesArray[i].m_outputColName = newColNum;
                        outputColIndex.push(newColNum);
                        outColsIndexOfCopy.push(newColNum);
                    }
                }

                preViewColsNum = newAddColsNum + basicSetup.getColNum();
                updateSelectedRulesOfAllColsBasedRulesArray(rulesArray);
            }
            else{
                preViewColsNum = basicSetup.getColNum();
            }
        }

        function getOutputColIndex() {
            for (var i = 1; i <= preViewColsNum; ++i) {
                outputColIndex.push(i);
            }
        }

//===============以上为预览相关方法===============

//===============以下为保存、修改模型，提交任务相关方法===============
        //显示另存为模型页面
        function showTplTree(title, treeAreaFlag, messageFlag) {
            var temp = '<div><div id="folder-picker"> Loading... </div><div class="admin-form theme-info"><form><div class="section mt10"><label for="update-file-name" class="field-label">模型名称 *</label><label for="name" class="field"><input style="width:100%" type="text" name="update-file-name" id="update-file-name" class="gui-input"></label></div><div class="section"><label for="update-file-description" class="field-label">描述</label><label for="update-file-description" class="field"><textarea type="description" name="update-file-description" id="update-file-description" class="gui-textarea" style="vertical-align: top; width:100%"></textarea></label></div></div></form></div>';
            //Dialog = _opt.dialog;
            //Notify = _opt.notify;
            Dialog.build({
                title: title,
                content: temp,
                rightBtnCallback: function () {
                    // 确认
                    var newParentNode = $("#folder-picker").fancytree("getTree").getActiveNode();
                    var id = newParentNode.key;
                    var name = $("#update-file-name").val().trim();
                    if (name == null || name == "") {
                        Notify.show({
                            title: "请填写模型名称！",
                            type: "warning"
                        });
                        return;
                    }
                    var desc = $("#update-file-description").val().trim();
                    var modelInfo = {};
                    modelInfo.modelId = curModelId; //"0"; //_opt.modelId;

                    modelInfo.modelName = name;
                    modelInfo.modelDesc = desc;
                    modelInfo.dirId = id;
                    modelInfo.modelType = 201;

                    modelInfo['modelDetail'] = JSON.stringify(getModeInfo());
                    saveModelInfo(modelInfo, messageFlag);

                    $.magnificPopup.close();
                }
            }).show(function () {
                $("#folder-picker").empty();
                PersonalWorkTree.buildTree({
                    container: $("#folder-picker"),
                    treeAreaFlag: treeAreaFlag
                });
            });
        }

        //另存为模型，保存
        function saveModelInfo(modelInfo, messageFlag) {
            $.post('/datamanage/smartquery/saveModel', {
                "modelId": modelInfo.modelId,
                "modelName": modelInfo.modelName,
                "modelDesc": modelInfo.modelDesc,
                "dirId": modelInfo.dirId,
                "modelType": modelInfo.modelType,
                "modelDetail": modelInfo.modelDetail,
            }, function (rspData) {
                var rsp = $.parseJSON(rspData);
                if (rsp.code == 0) {
                    if (messageFlag == "1") {
                        Notify.show({
                            title: " 保存模型成功！",
                            type: "success"
                        });
                    } else {
                        Notify.show({
                            title: "另存模型成功！",
                            type: "success"
                        });
                    }
                }
                else {
                    if (messageFlag == "1") {
                        console.log("保存模型成功失败:" + rsp.message);
                        Notify.show({
                            title: "保存模型成功失败！",
                            type: "error"
                        });
                    } else {
                        console.log("另存模型失败:" + rsp.message);
                        Notify.show({
                            title: "另存模型失败！",
                            type: "error"
                        });
                    }
                }
            })
        }

        //修改模型信息
        function updateModelInfo() {
            //modelInfoForCopy = JSON.stringify(getModeInfo());
            $.post('/datamanage/smartquery/updateModel', {
                "modelId": curModelId,
                "modelDetail": JSON.stringify(getModeInfo()), //modelInfoForCopy,
            }, function (rspData) {
                var rsp = $.parseJSON(rspData);
                if (rsp.code == 0) {
                    Notify.show({
                        title: " 模型保存成功！",
                        type: "success"
                    });
                } else {
                    Notify.show({
                        title: rsp.message,
                        type: "warning"
                    });
                }
            })
        }

        //获取模型信息
        function getModeInfo() {
            //var fileNamesArray = new Array();
            var rulesArray = new Array();
            //var fileInfoArray = new Array();

            for (var i = 0; i < selectedRulesOfAllCols.length; ++i) {
                if (selectedRulesOfAllCols[i] != undefined) {
                    var tempArray = selectedRulesOfAllCols[i].ruleInfos;
                    tempArray.sort(function (a, b) {
                        return a.m_stepSN - b.m_stepSN;
                    });
                    for (var index in tempArray) {
                        if (tempArray[index] != undefined) {
                            rulesArray.push(tempArray[index]);
                        }
                    }
                }
            }

            if (!basicSetup.getIsFirstRowHead())
                header = 0;
            else
                header = 1;

            var taskType = $('#taskType-Select').val();
            var watchDir = "";
            var fileFilterStr = "";
            if (taskType == 2 && $("#unStructed-Checkbox").prop("checked") == true) {
                taskType = 3;
            }
            if (taskType == 2 || taskType == 3 || taskType == 5) {
                watchDir = $('#watchDir-Input').val().trim();
                fileFilterStr = $('#filterStart-Input').val().trim() + "/"
                    + $('#filterEnd-Input').val().trim() + "/" + $('#filterInclude-Input').val().trim();
            }
            else {
                watchDir = "";
                fileFilterStr = "";
            }

            return {
                "dataTypeId": basicSetup.getDataTypeId(),
                "zoneId": basicSetup.zoneIdOfCurDataType(),//"1",
                "centerCode": basicSetup.centerCodeOfCurDataType(),
                //"batchName": $('#batchName-Input').val().trim(),
                "fileFilterRule": fileFilterStr,
                "rowDelimeter": getparams.getRowSplit(),
                "colDelimeter": getparams.getColSplit(),
                "encoding": basicSetup.getfileEncoding(),
                "errorNumLimit": 500,
                //"fileCount": fileInfoArray.length,
                //"fileNames": JSON.stringify(fileNamesArray),
                "haveHeadDef": header,
                "m_outColsIndex": basicSetup.getOutputColArray(),
                "m_rules": rulesArray,
                //"recordSeparator": "",
                "taskType": taskType, //$('#taskType-Select').val(),
                //"userID": -1,
                "watchDir": watchDir,
                "dbType": basicSetup.getdbType(),
                "userName": basicSetup.getUserName(),
                "passWord": basicSetup.getPassWord(),
                "dbIP": basicSetup.getdbIP(),
                "dbInstance": basicSetup.getInstanceName(),
                "whereClause": basicSetup.getWhereClause(),
                "dbTableName": basicSetup.getdbTableName(),
                "columnCount": basicSetup.getColumnCount(),
                //"fileInfo": JSON.stringify(fileInfoArray)
            }
        }

        //创建导入任务
        function submitTask(userId) {
            var taskType = $('#taskType-Select').val();
            var filePath = "";
            var fileNamesArray = new Array();
            var rulesArray = new Array();
            var fileInfoArray = new Array();
            var fileArray = fileUtil.getFileInfo();
            if (taskType == 1 || taskType == 4) {
                if (taskType == 1)
                    filePath = fileRootPath;
                else if (taskType == 4)
                    filePath = UDPFileRootPath;

                for (var i = 0; i < fileArray.length; ++i) {
                    fileNamesArray.push(fileArray[i].oldName);
                    fileInfoArray.push({
                        ERROR_COUNT: 0,
                        ERROR_FILE_DOWNLOADED: -1,
                        ERROR_FILE_NAME: "",
                        ERROR_REASON: "",
                        FILE_ID: 0,
                        FILE_LOCATION_IP: "",
                        FILE_PATH: filePath + fileArray[i].newName,
                        FILE_SIZE: "",
                        INSERT_TIME: null,
                        LOAD_BATCH_ID: -1,
                        LOAD_FINISH_TIME: null,
                        LOAD_RATIO: 0,
                        LOAD_RECORD_COUNT: 0,
                        LOAD_START_TIME: null,
                        LOAD_STATE: -1,
                        NEW_NAME: fileArray[i].newName,
                        OLD_NAME: fileArray[i].oldName,
                        PREP_TIME: null,
                        PROC_RECORD_COUNT: 0,
                        TBL_NAME: "",
                        UNOUT_RECORD_COUNT: 0
                    });
                }

                if (taskType == 1 && fileInfoArray.length <= 0) {
                    bootbox.confirm("未发现上传文件，确定要创建导入任务吗?", function (rlt) {
                        if (!rlt) {
                            return;
                        }
                        else {
                            //saveParameterSet();
                            selectedRulesOfAllCols[curColIndex] = selectedRulesOfCurCol;

                            for (var i = 0; i < selectedRulesOfAllCols.length; ++i) {
                                if (selectedRulesOfAllCols[i] != undefined) {// && selectedRulesOfAllCols[i].ruleInfos.length > 0
                                    //rulesArray = rulesArray.concat(selectedRulesOfAllCols[i].ruleInfos.filter(function (x) {
                                    //    return x != undefined
                                    //}));

                                    //记录处理规则的顺序
                                    //var tempArray = selectedRulesOfAllCols[i].ruleInfos.concat();
                                    //tempArray.sort(function (a, b) {
                                    //    return a.m_stepSN - b.m_stepSN;
                                    //});
                                    //rulesArray = rulesArray.concat(tempArray)
                                    //    .filter(function (x) {
                                    //        return x != undefined;
                                    //    });

                                    var tempArray = selectedRulesOfAllCols[i].ruleInfos;
                                    tempArray.sort(function (a, b) {
                                        return a.m_stepSN - b.m_stepSN;
                                    });
                                    for (var index in tempArray) {
                                        if (tempArray[index] != undefined) {
                                            rulesArray.push(tempArray[index]);
                                        }
                                    }
                                }
                            }
                            console.log("rulesArray", rulesArray);

                            if (!basicSetup.getIsFirstRowHead())
                                header = 0;
                            else
                                header = 1;

                            var watchDir = "";
                            var fileFilterStr = "";
                            if (taskType == 2 && $("#unStructed-Checkbox").prop("checked") == true) {
                                taskType = 3;
                            }
                            if (taskType == 2 || taskType == 3 || taskType == 5) {
                                watchDir = $('#watchDir-Input').val().trim();
                                fileFilterStr = $('#filterStart-Input').val().trim() + "/"
                                    + $('#filterEnd-Input').val().trim() + "/" + $('#filterInclude-Input').val().trim();
                            }
                            else {
                                watchDir = "";
                                fileFilterStr = "";
                            }

                            $.post('/datamanage/dataimport/RegisterBatchAndFileID', {
                                "dataTypeId": basicSetup.getDataTypeId(),
                                "zoneId": basicSetup.zoneIdOfCurDataType,//"1",
                                "centerCode": basicSetup.centerCodeOfCurDataType(),
                                "batchName": $('#batchName-Input').val().trim(),
                                "fileFilter": fileFilterStr,
                                "rowDelimeter": basicSetup.getRowSplit(),
                                "colDelimeter": basicSetup.getColSplit(),
                                "encoding": basicSetup.getfileEncoding(),
                                "errorNumLimit": 500,
                                "fileCount": fileInfoArray.length,
                                "fileNames": JSON.stringify(fileNamesArray),
                                "haveHeadDef": header,
                                "m_outColsIndex": JSON.stringify(basicSetup.getOutputColArray()),
                                "m_rules": JSON.stringify(rulesArray),
                                "recordSeparator": "",
                                "taskType": taskType, //$('#taskType-Select').val(),
                                "userID": userId,
                                "watchDir": watchDir,
                                "dbType": basicSetup.getdbType(),
                                "userName": basicSetup.getUserName(),
                                "passWord": basicSetup.getPassWord(),
                                "dbIP": basicSetup.getdbIP(),
                                "dbInstance": basicSetup.getInstanceName(),
                                "whereClause": basicSetup.getWhereClause(),
                                "dbTableName": basicSetup.getdbTableName(),
                                "columnCount": basicSetup.getColumnCount(),
                                "fileInfo": JSON.stringify(fileInfoArray),
                                "files": JSON.stringify(new Array())
                            }).done(function (res) {
                                var data = JSON.parse(res);
                                if (data.code == 0) {
                                    window.location.href = '/datamanage/dm-datamanage.html?datatypeid=' + basicSetup.getDataTypeId()
                                        + '&centercode=' + basicSetup.centerCodeOfCurDataType()
                                        + '&zoneid=' + basicSetup.zoneIdOfCurDataType()
                                        + '&oprtype=2';
                                    console.log("window.location.href", window.location.href);
                                } else {
                                    alert("创建导入任务失败:" + data.message);
                                    console.log("创建导入任务失败:" + data.message);
                                }
                            });
                        }
                    });
                }
                else {
                    //saveParameterSet();
                    selectedRulesOfAllCols[curColIndex] = selectedRulesOfCurCol;

                    for (var i = 0; i < selectedRulesOfAllCols.length; ++i) {
                        if (selectedRulesOfAllCols[i] != undefined) {// && selectedRulesOfAllCols[i].ruleInfos.length > 0
                            //rulesArray = rulesArray.concat(selectedRulesOfAllCols[i].ruleInfos.filter(function (x) {
                            //    return x != undefined
                            //}));

                            //记录处理规则的顺序
                            //var tempArray = selectedRulesOfAllCols[i].ruleInfos.concat();
                            //tempArray.sort(function (a, b) {
                            //    return a.m_stepSN - b.m_stepSN;
                            //});
                            //rulesArray = rulesArray.concat(tempArray)
                            //    .filter(function (x) {
                            //        return x != undefined;
                            //    });

                            var tempArray = selectedRulesOfAllCols[i].ruleInfos;
                            tempArray.sort(function (a, b) {
                                return a.m_stepSN - b.m_stepSN;
                            });
                            for (var index in tempArray) {
                                if (tempArray[index] != undefined) {
                                    rulesArray.push(tempArray[index]);
                                }
                            }
                        }
                    }
                    console.log("rulesArray", rulesArray);

                    if (!basicSetup.getIsFirstRowHead())
                        header = 0;
                    else
                        header = 1;

                    var watchDir = "";
                    var fileFilterStr = "";
                    if (taskType == 2 && $("#unStructed-Checkbox").prop("checked") == true) {
                        taskType = 3;
                    }
                    if (taskType == 2 || taskType == 3 || taskType == 5) {
                        watchDir = $('#watchDir-Input').val().trim();
                        fileFilterStr = $('#filterStart-Input').val().trim() + "/"
                            + $('#filterEnd-Input').val().trim() + "/" + $('#filterInclude-Input').val().trim();
                    }
                    else {
                        watchDir = "";
                        fileFilterStr = "";
                    }

                    $.post('/datamanage/dataimport/RegisterBatchAndFileID', {
                        "dataTypeId": basicSetup.getDataTypeId(),
                        "zoneId": basicSetup.zoneIdOfCurDataType,//"1",
                        "centerCode": basicSetup.centerCodeOfCurDataType(),
                        "batchName": $('#batchName-Input').val().trim(),
                        "fileFilter": fileFilterStr,
                        "rowDelimeter": basicSetup.getRowSplit(),
                        "colDelimeter": basicSetup.getColSplit(),
                        "encoding": basicSetup.getfileEncoding(),
                        "errorNumLimit": 500,
                        "fileCount": fileInfoArray.length,
                        "fileNames": JSON.stringify(fileNamesArray),
                        "haveHeadDef": header,
                        "m_outColsIndex": JSON.stringify(basicSetup.getOutputColArray()),
                        "m_rules": JSON.stringify(rulesArray),
                        "recordSeparator": "",
                        "taskType": taskType, //$('#taskType-Select').val(),
                        "userID": userId,
                        "watchDir": watchDir,
                        "dbType": basicSetup.getdbType(),
                        "userName": basicSetup.getUserName(),
                        "passWord": basicSetup.getPassWord(),
                        "dbIP": basicSetup.getdbIP(),
                        "dbInstance": basicSetup.getInstanceName(),
                        "whereClause": basicSetup.getWhereClause(),
                        "dbTableName": basicSetup.getdbTableName(),
                        "columnCount": basicSetup.getColumnCount(),
                        "fileInfo": JSON.stringify(fileInfoArray),
                        "files": JSON.stringify(new Array())
                    }).done(function (res) {
                        var data = JSON.parse(res);
                        if (data.code == 0) {
                            window.location.href = '/datamanage/dm-datamanage.html?datatypeid=' + basicSetup.getDataTypeId()
                                + '&centercode=' + basicSetup.centerCodeOfCurDataType()
                                + '&zoneid=' + basicSetup.zoneIdOfCurDataType()
                                + '&oprtype=2';
                            console.log("window.location.href", window.location.href);
                        } else {
                            alert("创建导入任务失败:" + data.message);
                            console.log("创建导入任务失败:" + data.message);
                        }
                    });
                }
            }
            else {
                //saveParameterSet();
                selectedRulesOfAllCols[curColIndex] = selectedRulesOfCurCol;

                for (var i = 0; i < selectedRulesOfAllCols.length; ++i) {
                    if (selectedRulesOfAllCols[i] != undefined) {// && selectedRulesOfAllCols[i].ruleInfos.length > 0
                        //rulesArray = rulesArray.concat(selectedRulesOfAllCols[i].ruleInfos.filter(function (x) {
                        //    return x != undefined
                        //}));

                        //记录处理规则的顺序
                        //var tempArray = selectedRulesOfAllCols[i].ruleInfos.concat();
                        //tempArray.sort(function (a, b) {
                        //    return a.m_stepSN - b.m_stepSN;
                        //});
                        //rulesArray = rulesArray.concat(tempArray)
                        //    .filter(function (x) {
                        //        return x != undefined;
                        //    });

                        var tempArray = selectedRulesOfAllCols[i].ruleInfos;
                        tempArray.sort(function (a, b) {
                            return a.m_stepSN - b.m_stepSN;
                        });
                        for (var index in tempArray) {
                            if (tempArray[index] != undefined) {
                                rulesArray.push(tempArray[index]);
                            }
                        }
                    }
                }
                console.log("rulesArray", rulesArray);

                if (!basicSetup.getIsFirstRowHead())
                    header = 0;
                else
                    header = 1;

                var watchDir = "";
                var fileFilterStr = "";
                if (taskType == 2 && $("#unStructed-Checkbox").prop("checked") == true) {
                    taskType = 3;
                }
                if (taskType == 2 || taskType == 3 || taskType == 5) {
                    watchDir = $('#watchDir-Input').val().trim();
                    fileFilterStr = $('#filterStart-Input').val().trim() + "/"
                        + $('#filterEnd-Input').val().trim() + "/" + $('#filterInclude-Input').val().trim();
                }
                else {
                    watchDir = "";
                    fileFilterStr = "";
                }

                $.post('/datamanage/dataimport/RegisterBatchAndFileID', {
                    "dataTypeId": basicSetup.getDataTypeId(),
                    "zoneId": basicSetup.zoneIdOfCurDataType,//"1",
                    "centerCode": basicSetup.centerCodeOfCurDataType(),
                    "batchName": $('#batchName-Input').val().trim(),
                    "fileFilter": fileFilterStr,
                    "rowDelimeter": basicSetup.getRowSplit(),
                    "colDelimeter": basicSetup.getColSplit(),
                    "encoding": basicSetup.getfileEncoding(),
                    "errorNumLimit": 500,
                    "fileCount": fileInfoArray.length,
                    "fileNames": JSON.stringify(fileNamesArray),
                    "haveHeadDef": header,
                    "m_outColsIndex": JSON.stringify(basicSetup.getOutputColArray()),
                    "m_rules": JSON.stringify(rulesArray),
                    "recordSeparator": "",
                    "taskType": taskType, //$('#taskType-Select').val(),
                    "userID": userId,
                    "watchDir": watchDir,
                    "dbType": basicSetup.getdbType(),
                    "userName": basicSetup.getUserName(),
                    "passWord": basicSetup.getPassWord(),
                    "dbIP": basicSetup.getdbIP(),
                    "dbInstance": basicSetup.getInstanceName(),
                    "whereClause": basicSetup.getWhereClause(),
                    "dbTableName": basicSetup.getdbTableName(),
                    "columnCount": basicSetup.getColumnCount(),
                    "fileInfo": JSON.stringify(fileInfoArray),
                    "files": JSON.stringify(new Array())
                }).done(function (res) {
                    var data = JSON.parse(res);
                    if (data.code == 0) {
                        window.location.href = '/datamanage/dm-datamanage.html?datatypeid=' + basicSetup.getDataTypeId()
                            + '&centercode=' + basicSetup.centerCodeOfCurDataType()
                            + '&zoneid=' + basicSetup.zoneIdOfCurDataType()
                            + '&oprtype=2';
                        console.log("window.location.href", window.location.href);
                    } else {
                        alert("创建导入任务失败:" + data.message);
                        console.log("创建导入任务失败:" + data.message);
                    }
                });
            }
        }

        //创建非结构化导入任务
        function unStruct_submitTask() {
            var fileNamesArray = new Array();
            var rulesArray = new Array();
            var fileInfoArray = new Array();
            var fileArray = fileUtil.getFileInfo();
            var outputColArray = new Array();
            for (var i = 0; i < fileArray.length; ++i) {
                //var fileRootPath = getFileRootPath(fileArray[i].newName);
                // 'hdfs://192.168.102.1/data/personaldata/'+fileArray[i].newName;

                fileNamesArray.push(fileArray[i].oldName);
                fileInfoArray.push({
                    ERROR_COUNT: 0,
                    ERROR_FILE_DOWNLOADED: -1,
                    ERROR_FILE_NAME: "",
                    ERROR_REASON: "",
                    FILE_ID: 0,
                    FILE_LOCATION_IP: "",
                    FILE_PATH: UDPFileRootPath + fileArray[i].newName,
                    FILE_SIZE: "",
                    INSERT_TIME: null,
                    LOAD_BATCH_ID: -1,
                    LOAD_FINISH_TIME: null,
                    LOAD_RATIO: 0,
                    LOAD_RECORD_COUNT: 0,
                    LOAD_START_TIME: null,
                    LOAD_STATE: -1,
                    NEW_NAME: fileArray[i].newName,
                    OLD_NAME: fileArray[i].oldName,
                    PREP_TIME: null,
                    PROC_RECORD_COUNT: 0,
                    TBL_NAME: "",
                    UNOUT_RECORD_COUNT: 0
                });
            }

            var taskType = $('#taskType-Select').val();
            var watchDir = "";
            var fileFilterStr = "";
            if (taskType == 2 && $("#unStructed-Checkbox").prop("checked") == true) {
                taskType = 3;
            }
            if (taskType == 2 || taskType == 3 || taskType == 5) {
                watchDir = $('#watchDir-Input').val().trim();
                fileFilterStr = $('#filterStart-Input').val().trim() + "/"
                    + $('#filterEnd-Input').val().trim() + "/" + $('#filterInclude-Input').val().trim();
            }
            else {
                watchDir = "";
                fileFilterStr = "";
            }

            $.post('/datamanage/dataimport/RegisterBatchAndFileID', {
                "dataTypeId": basicSetup.getDataTypeId(),
                "zoneId": "1",
                "batchName": $('#batchName-unStruct').val().trim(),
                "fileFilter": fileFilterStr,
                "rowDelimeter": "b",
                "colDelimeter": "c",
                "encoding": "a",
                "errorNumLimit": 500,
                "fileCount": fileInfoArray.length,
                "fileNames": JSON.stringify(fileNamesArray),
                "haveHeadDef": 0,
                "m_outColsIndex": JSON.stringify(outputColArray),
                "m_rules": JSON.stringify(rulesArray),
                "recordSeparator": "",
                "taskType": $('#taskType-Select').val(),
                "userID": -1,
                "watchDir": watchDir,
                "dbType": 1,
                "userName": "",
                "passWord": "",
                "dbIP": "",
                "dbInstance": "",
                "whereClause": "",
                "dbTableName": "",
                "columnCount": "",
                "fileInfo": JSON.stringify(fileInfoArray),
                "files": JSON.stringify(new Array())
            }).done(
                function (res) {
                    console.log("成功返回!");
                    //alert(data.message);
                    var data = JSON.parse(res);
                    if (data.code == 0) {
                        //alert(data.message);
                        console.log("成功!");
                        //alert("成功！");

                        window.location.href = '/datamanage/dm-datamanage.html?datatypeid=' + basicSetup.getDataTypeId()
                            + '&givecentercode=' + basicSetup.centerCodeOfCurDataType()
                            + '&givezoneid=' + basicSetup.zoneIdOfCurDataType()
                            + '&oprtype=2';
                        //window.location.href = '../udp/taskmanage.html?dataTypeId=' + basicSetup.getDataTypeId();
                        console.log("window.location.href", window.location.href);
                    } else {
                        alert("创建非结构化导入任务失败:" + data.message);
                        console.log("创建非结构化导入任务失败:" + data.message);
                    }
                });
        }

//===============以上为保存、修改模型，提交任务相关方法===============

//===============以下为预处理规则：新建列和删除列相关方法===============
        var columnNodeAdd = {};
        var columnNodeDel;
        var selectedColumnTreeData = new Array();

        //新建列时原有的字段的表头名
        function getOldColumnNameData() {
            var oldColumnNameData = new Array();
            var oldColumnNameDataFromTable = new Array();
            for (var i = 0; i < $("#preView-Table")[0].rows[0].cells.length; ++i) {
                oldColumnNameDataFromTable[i] = new Object({
                    "text": $("#preView-Table")[0].rows[0].cells[i].innerHTML,
                    "Id": i,
                });
            }
            for (var i = 0; i < oldColumnNameDataFromTable.length; ++i) {
                oldColumnNameData.push(oldColumnNameDataFromTable[i]);
            }
            return oldColumnNameData;
        }

        //给新的列设置预处理规则
        function initAddNewColumnRule(curCol) {
            curColIndex = curCol;
            selectedRulesOfCurCol = selectedRulesOfAllCols[curColIndex];

            if (selectedRulesOfCurCol == undefined) {
                $('#parameterView')[0].innerHTML = "";
                $('#conditionView')[0].innerHTML = "";
                selectedRulesOfCurCol = new Object({
                    "selectRulesList": [],
                    "ruleInfos": []
                });

                var rootNode = new Object({
                    "text": "已添加的规则",
                    "ID": -1,
                    "Level": 1,
                    "tags": ['0'],
                    "nodes": []
                });
                selectedRulesOfCurCol.selectRulesList.push(rootNode);
                curDelNode = undefined;
            }
            $('#selectedRulesTree').treeview({
                color: "#428bca",
                data: selectedRulesOfCurCol.selectRulesList,
                showTags: true,
                expand: true,
                nodeIcon: "glyphicon glyphicon-bookmark",
                multiSelect: $('#chk-select-multi').is(':checked'),
                onNodeSelected: function (event, node) {
                    selectedRulesTreeNodeClick(event, node);
                }
            });
        }

        //给新建的列添加增加列的预处理规则addNewColRuleId
        function AddNewColumnRule() {
            if (selectedRulesOfCurCol.ruleInfos[addNewColRuleId + '_0'] == undefined) {
                selectedRulesOfCurCol.ruleInfos[addNewColRuleId + '_0'] = new Object({
                    "m_codeArray": [],
                    "m_conditionInfoArrary": [],
                    "m_discardFilterConditionInfoVec": [],
                    "m_inputColNamesArray": [],
                    "m_outputColName": curColIndex + 1,
                    "m_outputColType": "",
                    "m_paramsArray": [],
                    "m_regexExp": "",
                    "m_regexParamsArray": [],
                    "m_ruleID": addNewColRuleId,
                    "m_saveFilterConditionInfoVec": [],
                    "m_stepSN": previewUtil.getMaxStepSN(selectedRulesOfCurCol) + 1,
                    "m_viewGuid": ""
                });
            }
            console.log(selectedColumnTreeData);
            for (var i = 0; i < selectedColumnTreeData.length; i++) {
                if (selectedColumnTreeData[i].Id == undefined) {
                    selectedRulesOfCurCol.ruleInfos[addNewColRuleId + '_0'].m_paramsArray.push(selectedColumnTreeData[i].text);
                }
                else {
                    selectedRulesOfCurCol.ruleInfos[addNewColRuleId + '_0'].m_paramsArray.push("");
                    selectedRulesOfCurCol.ruleInfos[addNewColRuleId + '_0'].m_inputColNamesArray.push(selectedColumnTreeData[i].Id + 1)
                }
            }
            //console.log(selectedRulesOfCurCol.ruleInfos[addNewColRuleId+ '_0']);
            selectedRulesOfAllCols[curColIndex] = selectedRulesOfCurCol;
            //console.log(selectedColumnTreeData);
        }

        //新建列时删除的字段
        function delSelectedColumnTreeData() {
            console.log(selectedColumnTreeData);
            for (var i = 0; i < selectedColumnTreeData.length; ++i) {
                if (columnNodeDel.nodeId == i) {
                    selectedColumnTreeData.splice(i, 1);
                    console.log(selectedColumnTreeData);
                    break;
                }
            }
            console.log(selectedColumnTreeData);
            $('#selectedColumnTree').treeview({
                color: "#428bca",
                data: selectedColumnTreeData,
                showTags: true,
                expand: true,
                nodeIcon: "glyphicon glyphicon-bookmark",
                //multiSelect: $('#chk-select-multi').is(':checked'),
                onNodeSelected: function (event, node) {
                    columnNodeDel = node;
                    console.log(columnNodeDel);
                }
            });
        }

        //新建列时加入的字段
        function getSelectedColumnTreeData(oldColumnNodeId) {
            var newColumnNode = {
                text: oldColumnNodeId.text,
                Id: oldColumnNodeId.Id
            }
            selectedColumnTreeData.push(newColumnNode);
            console.log(selectedColumnTreeData);
            $('#selectedColumnTree').treeview({
                color: "#428bca",
                data: selectedColumnTreeData,
                showTags: true,
                expand: true,
                nodeIcon: "glyphicon glyphicon-bookmark",
                //multiSelect: $('#chk-select-multi').is(':checked'),
                onNodeSelected: function (event, node) {
                    columnNodeDel = node;
                    console.log(columnNodeDel);
                }
            });
        }

        //初始化新建列的时候选择的树的节点跟已选择的节点
        function initColumnSelect() {
            columnNodeAdd = {};
            columnNodeDel = {};
            selectedColumnTreeData = [];
        }

        //画出新建的表格
        function drawNewColumn() {
            var cellHead = $("#preView-Table")[0].rows[0].insertCell();
            cellHead.innerHTML = $("#newColumnName").val(); //$("#newColumnName").val() || '新建列'
            console.log("cellHead.innerHTML", cellHead.innerHTML);
            console.log("cellHead.innerHTML", $("#preView-Table")[0].rows[0].cells[$("#preView-Table")[0].rows[0].cells.length - 1].innerText);
            //preViewResultArray[0].push($("#newColumnName").val());
            for (var i = 1; i < $("#preView-Table")[0].rows.length; ++i) {
                var cell = $("#preView-Table")[0].rows[i].insertCell();
                for (var j = 0; j < selectedColumnTreeData.length; ++j) {
                    if (selectedColumnTreeData[j].Id !== undefined) {
                        cell.innerHTML = cell.innerText +
                            $("#preView-Table")[0].rows[i].cells[selectedColumnTreeData[j].Id].innerText;
                        //console.log($("#preView-Table")[0].rows[i].cells[selectedColumnTreeData[j].Id].innerText);
                    }
                    else {
                        cell.innerHTML = cell.innerText + selectedColumnTreeData[j].text;
                    }
                }
            }
        }

        //点击确定执行的函数
        function setAddColumnPreviewTable() {
            //保存之前的预处理设置，将当前列设置为新的列
            //preViewByRules();
            drawNewColumn();
            //console.log($("#preView-Table")[0].rows[0].cells.length - 1);
            //把新加的列设置成当前列并设置预处理规则
            initAddNewColumnRule($("#preView-Table")[0].rows[0].cells.length - 1);
            AddNewColumnRule();//新加addNewColRuleId预处理规则

            console.log("curColIndex", curColIndex);
            $("#preView-Table tbody tr td").removeClass("preViewColSelected");
            var td;
            var tableRows = $("#preView-Table tbody tr");
            for (var i = 0; i < tableRows.length; ++i) {
                td = $("#preView-Table")[0].rows[i].cells[curColIndex].classList;
                td.add('preViewColSelected');
                td.remove('settedPreRules');
            }
            if (tableRows.length > 0) {
                $("#selectedFieldName").html($("#preView-Table")[0].rows[0].cells[curColIndex].innerHTML);
                //preViewByRules();
            }
            else {
                $("#selectedFieldName").value = "";
            }
        }

        //点击增加列的函数
        function addColumn() {
            var oldColumnNameData = getOldColumnNameData();
            initColumnSelect();
            var colIndex = saveSelectedRulesForCurCol();
            basicSetup.setToRefreshMapTable(true);
            Dialog.build({
                title: "新建列",
                style: 'lg',
                content: '<div id="addColumnpart" class="hide"><span>新字段名称* &nbsp</span><input type="text" id="newColumnName"></div>' +
                '<div><span>选择的源字段</span></div><div id="choosenColumn"></div>' +
                '<div><input type="text" id="addNewColumnName" style="margin-top: 10px;"><button class="btn btn-primary" id="addNewColumnName-Button">增加</button></div>',
                rightBtnCallback: function (e) {
                    e.preventDefault();
                    //basicSetup.setColNum(basicSetup.getColNum() + 1);
                    preViewColsNum++;
                    //curColIndex++;
                    //curColIndex = preViewColsNum - 1;
                    //setSelectedRulesForCurCol(curColIndex);
                    setAddColumnPreviewTable();
                    preViewByRules();
                    $.magnificPopup.close();
                }
            }).show(function () {
                $("#choosenColumn").html('<div><aside class="tray tray-right" data-tray-height="match" style="float:left;border: 1px solid #D8D8D8; height:370px;vertical-align:top; padding: 10px 10px 5px 0px; width:250px">' +
                    '<div id="oldColumnTree" align="top" style="height:350px; overflow-y: auto;"></div>' +
                    '</aside>' +
                    '<aside class="tray tray-right" data-tray-height="match" style="float:left;height:370px; width: 50px;horiz-align: center; vertical-align:middle; padding: 10px 0px 5px 0px">' +
                    '<div style="horiz-align: center; margin: 0px 0px 0px 10px;">' +
                    '<button type="button" id="addOldColumn-Button" class="btn btn-primary" style="margin: 0px 0px 10px 0px;">' +
                    '<i class="fa fa-chevron-right" ></i></button> <span> &nbsp </span>' +
                    '<button type="button" id="delOldColumn-Button" class="btn btn-danger" style="margin: 10px 0px 0px 0px;">' +
                    '<i class="fa fa-chevron-left"></i>' +
                    '</button></div></aside>' +
                    '<aside class="tray tray-right" data-tray-height="match" style="float:left;border: 1px solid #D8D8D8; height:370px;vertical-align:top; padding: 10px 10px 5px 0px; width:250px">' +
                    '<div id="selectedColumnTree" align="top" style="height:350px; overflow-y: auto;"></div>' +
                    '</aside></div>');
            });
            $('#oldColumnTree').treeview({
                color: "#428bca",
                data: oldColumnNameData,
                showTags: true,
                expand: false,
                nodeIcon: "glyphicon glyphicon-bookmark",
                multiSelect: $('#chk-select-multi').is(':checked'),
                onNodeSelected: function (event, node) {
                    columnNodeAdd = node;
                    columnNodeAdd.state.selected = false
                }
            });

            //增加原有的字段
            $("#addOldColumn-Button").click(function () {
                getSelectedColumnTreeData(columnNodeAdd);
            });
            //增加新字段
            $("#addNewColumnName-Button").click(function () {
                var newColumnNode = {};
                console.log($("#addNewColumnName").val());
                newColumnNode.text = $("#addNewColumnName").val();
                getSelectedColumnTreeData(newColumnNode);
            });
            //删除增加的字段，单击触发事件
            $("#delOldColumn-Button").click(function () {
                delSelectedColumnTreeData();
                $('#selectedColumnTree').treeview({
                    color: "#428bca",
                    data: selectedColumnTreeData,
                    showTags: true,
                    expand: true,
                    nodeIcon: "glyphicon glyphicon-bookmark",
                    //multiSelect: $('#chk-select-multi').is(':checked'),
                    onNodeSelected: function (event, node) {
                        columnNodeDel = node;
                        console.log(columnNodeDel);
                    }
                });
            });

        }

        //点击删除列的函数
        function removeColumn(curCol) {
            basicSetup.setToRefreshMapTable(true);
            if (curCol != undefined && curCol > 0) {
                curColIndex = curCol;
                console.log("before del", curColIndex);
                selectedRulesOfCurCol = selectedRulesOfAllCols[curColIndex];
                console.log("selectedRulesOfCurCol", selectedRulesOfCurCol);
                console.log("selectedRulesOfAllCols", selectedRulesOfAllCols);
                for (var i = 0; i < selectedRulesOfAllCols.length; ++i) {
                    if (curColIndex < i) {
                        selectedRulesOfAllCols[i].ruleInfos[addNewColRuleId + '_0'].m_outputColName =
                            selectedRulesOfAllCols[i].ruleInfos[addNewColRuleId + '_0'].m_outputColName - 1;
                    }
                }
                selectedRulesOfAllCols.splice(curColIndex, 1);
                //console.log(selectedRulesOfAllCols);
                curColIndex = curColIndex - 1;
                curSelectedColChanged();
                setSelectedRulesForCurCol(curColIndex);
                console.log("after del", curColIndex);
                //selectedRulesOfCurCol = selectedRulesOfAllCols[curColIndex];
                //basicSetup.setColNum(basicSetup.getColNum() - 1);
                preViewColsNum--;
                //if (pageType == 2) {
                //    outColsIndexOfCopy.length -= 1;
                //}
                preViewByRules();
                return curColIndex;
            }
        }

        //删除列后，选中列变化
        function curSelectedColChanged() {
            $("#preView-Table tbody tr td").removeClass("preViewColSelected");
            var td;
            var tableRows = $("#preView-Table tbody tr");
            for (var i = 0; i < tableRows.length; ++i) {
                if ($("#preView-Table")[0].rows[i].cells.length > 0 && $("#preView-Table")[0].rows[i].cells[curColIndex - 1] != null) {
                    td = $("#preView-Table")[0].rows[i].cells[curColIndex - 1].classList;
                    td.add('preViewColSelected');
                    td.remove('settedPreRules');
                }
            }
            if (tableRows.length > 0) {
                if ($("#preView-Table")[0].rows[0].cells[curColIndex - 1] != undefined)
                    $("#selectedFieldName").html($("#preView-Table")[0].rows[0].cells[curColIndex - 1].innerHTML);
                else
                    $("#selectedFieldName").html("");
                //var colIndex = saveSelectedRulesForCurCol();
                //if(colIndex >= 0 && colIndex!=curColIndex)
                //{
                //    for(var i=0; i<tableRows.length; ++i)
                //    {
                //        td = $("#preView-Table")[0].rows[i].cells[colIndex].classList;
                //        td.add('settedPreRules');
                //    }
                //}
                //setSelectedRulesForCurCol(curColIndex);
            }
            else {
                $("#selectedFieldName").value = "";
            }
        }

//===============以上为预处理规则：新建列和删除列相关方法===============

//===============以下为暂未使用方法===============
        function getTransformType0Params() {
            var paramsArray = new Array();
            var codeArray = new Array();

            if ($("#caseSensitiveCheckbox").prop("checked") == true) {//参数1
                paramsArray.push("1");
            }
            else {
                paramsArray.push("0");
            }
            paramsArray.push($("#transform-error")[0].value);//参数2
            paramsArray.push($("#transform-type")[0].value);//参数3
            paramsArray.push($("#codetable-select")[0].selectedOptions[0].getAttribute('tableName'));
            paramsArray.push($("#codetable-select")[0].selectedOptions[0].getAttribute('codeField'));
            paramsArray.push($("#codetable-select")[0].selectedOptions[0].getAttribute('valueField'));
            paramsArray.push($("#codetable-select")[0].selectedOptions[0].getAttribute('tableCaption'));
            selectedRulesOfCurCol.ruleInfos[curDelNode.ID].m_paramsArray = paramsArray;


            selectedRulesOfCurCol.ruleInfos[curDelNode.ID].m_codeArray = codeArray;
        }

        function getTransformType1Params() {
            var paramsArray = new Array();
            var codeArray = new Array();

            if ($("#caseSensitiveCheckbox").prop("checked") == true) {//参数1
                paramsArray.push("1");
            }
            else {
                paramsArray.push("0");
            }
            paramsArray.push($("#transform-error")[0].value);//参数2
            paramsArray.push($("#transform-type")[0].value);//参数3
            paramsArray.push($("#transform-file-input").val()); //文件名
            var file = $("#transform-file-btn")[0].files[0];

            if (file == undefined) {
                Notify.show({
                    title: "未能读取到转换文件！",
                    type: "error"
                });
                return;
            }
            if (file.type.indexOf("text") >= 0) {//文本文件
                txtParse(file);
            }
            else {
                Notify.show({
                    title: "暂时只支持文本文件(.txt)！",
                    type: "error"
                });
                return;
            }
            selectedRulesOfCurCol.ruleInfos[curDelNode.ID].m_paramsArray = paramsArray;
        }

        function txtParse(file) {
            var viewSize = 8 * 5000 * 100 * 10000;
            var viewText = file.slice(0, viewSize);
            var codeArray = new Array();
            var read = new FileReader();
            read.readAsText(viewText, "UTF-8");
            read.onload = function (e) {
                var textContent = this.result;
                var isFirstRowHead = true;
                var rowSplit = "\r\n";
                var colSplit = "\t";
                codeArray = splitfile(textContent, isFirstRowHead, rowSplit, colSplit);
                //getruleparams.setCurCodeArray(codeArray);
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
            for (var i = 1; i < rowArray.length - 1; ++i) {
                var colArray = rowArray[i].split(colSplit, 2);
                codeArray.push(new Object({
                    'key': colArray[0],
                    'value': colArray[1],
                }));
            }

            selectedRulesOfCurCol.ruleInfos[curDelNode.ID].m_codeArray = codeArray;
        }

//===============以上为暂未使用方法===============

        return {
            initRefresh: initRefresh,
            updateModelInfo: updateModelInfo,
            showTplTree: function (title, treeAreaFlag, messageFlag) {
                return showTplTree(title, treeAreaFlag, messageFlag);
            },
            curRowIndexOfCondition: function () {
                return curRowIndexOfCondition;
            },

            setFileRootPath: function (_fileRootPath) {
                fileRootPath = _fileRootPath;
            },

            setUDPFileRootPath: function (_UDPfileRootPath) {
                UDPFileRootPath = _UDPfileRootPath;
            },

            setPreViewTable: setPreViewTable,

            setMapTable: setMapTable,

            setCopyOrModelInfo: setCopyOrModelInfo,

            setPageType: function (curPageType, id) {
                return setPageType(curPageType, id);
            },

            submitTask: function (userId) {
                return submitTask(userId);
            },

            unStruct_submitTask: function (userId) {
                return unStruct_submitTask();
            },

            saveSelectedRulesForCurCol: function () {
                return saveSelectedRulesForCurCol();
            },

            checkCurColIsNewAdd: checkCurColIsNewAdd,

            setSelectedRulesForCurCol: function (curColIndex) {
                return setSelectedRulesForCurCol(curColIndex);
            },

            updateCurRowOfCondition: function (curRowIndex) {
                return updateCurRowOfCondition(curRowIndex);
            },

            saveParameterSet: saveParameterSet,

            addNode: addNode,

            deleteNode: deleteNode,

            preView: function (needSetMapTable) {
                if (needSetMapTable === undefined)
                    preViewByRules();
                else
                    preViewByRules(needSetMapTable);
            },

            initRulsTree: initRulsTree,

            setRules: function (m_rules) {
                return setRules(m_rules);
            },

            setOutCols: function (m_outColsIndex) {
                return setOutCols(m_outColsIndex);
            },
            addColumn: addColumn,

            removeColumn: function (curColIndex) {
                return removeColumn(curColIndex);
            }
        }

    });