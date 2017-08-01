/**
 * Created by root on 3/16/16.
 */
define(["../datastat/dm-datastat-init.js",
        "../datastat/dm-datastat-util.js",
        "../datastat/jquery.treetable.js",],
    function (init, util) {
        //$('#treeTable-sum-datastat').treeTable(option);
        var curId = 0;
        var sysStructureInfo = new Object({
            "dirInfoDic": [],
            "dataTypeInfoDic": [],
            "isVisible": false,
        });
        var userStructureInfo = new Object({
            "dirInfoDic": [],
            "dataTypeInfoDic": [],
            "isVisible": false,
        });

        var treeTableHtml = '';

        function initId() {
            curId = 0;
            treeTableHtml = '';
        }

        //获取数据类型树的层级结构，主要获取每个目录、数据类型的信息以及每个目录包含的数据类型
        function getTreeStructureForUser(sysTree, curPid) {
            curId++;
            if (sysTree.extraClasses == "nv-dir") {
                //该节点是一个目录节点
                userStructureInfo.dirInfoDic[sysTree.dirId] = new Object({
                    "name": sysTree.title,
                    "Id": curId,
                    "dirId": sysTree.dirId,
                    "Pid": curPid,
                    "dataTypeList": [],
                    "statInfo": new Object({
                        "batchFlag": 0,
                        "sumStorageSize": 0,
                        "sumCounts": 0,
                        "todaydayCounts": 0,
                        "yesterdayCounts": 0,
                        "beforeYesterdayCounts": 0,
                        "weekCounts": 0,
                        "monthCounts": 0,
                        "yearCounts": 0,
                        "sumCountsRec": 0,
                        "todaydayCountsRec": 0,
                        "yesterdayCountsRec": 0,
                        "beforeYesterdayCountsRec": 0,
                        "weekCountsRec": 0,
                        "monthCountsRec": 0,
                        "yearCountsRec": 0,
                    }),
                });
                var curPid = sysTree.dirId;
                for (var i = 0; i < sysTree.children.length; ++i) {
                    getTreeStructureForUser(sysTree.children[i], curPid);
                }
            }
            else {
                //该节点是一个数据类型，叶子节点
                if (userStructureInfo.dataTypeInfoDic[(sysTree.typeId + '_' + sysTree.centerCode).toString()] == undefined) {
                    userStructureInfo.dataTypeInfoDic[(sysTree.typeId + '_' + sysTree.centerCode).toString()] = new Object({
                        "name": sysTree.title,
                        "Id": sysTree.typeId,
                        "Pid": curPid,
                        "centerCode": sysTree.centerCode,
                        "isVisible": false,
                        "isFilter": false,
                        "statInfo": null,
                    });
                }
                else {
                    userStructureInfo.dataTypeInfoDic[(sysTree.typeId + '_' + sysTree.centerCode).toString()] = new Object({
                        "name": sysTree.title,
                        "Id": sysTree.typeId,
                        "Pid": curPid,
                        "centerCode": sysTree.centerCode,
                        "isVisible": false,
                        "isFilter": false,
                        "statInfo": new Object({
                            "batchFlag": 0,
                            "sumStorageSize": 0,
                            "sumCounts": 0,
                            "todaydayCounts": 0,
                            "yesterdayCounts": 0,
                            "beforeYesterdayCounts": 0,
                            "weekCounts": 0,
                            "monthCounts": 0,
                            "yearCounts": 0,
                            "sumCountsRec": 0,
                            "todaydayCountsRec": 0,
                            "yesterdayCountsRec": 0,
                            "beforeYesterdayCountsRec": 0,
                            "weekCountsRec": 0,
                            "monthCountsRec": 0,
                            "yearCountsRec": 0,
                            "beginDateStr": "",
                            "endDateStr": ""
                        }),
                    });
                }

                var dataTypeDirId = curPid;
                while (dataTypeDirId != -1) {
                    userStructureInfo.dirInfoDic[dataTypeDirId].dataTypeList.push((sysTree.typeId + '_' + sysTree.centerCode).toString());
                    dataTypeDirId = userStructureInfo.dirInfoDic[dataTypeDirId].Pid;
                }
            }
        }

        //获取数据类型树的层级结构，主要获取每个目录、数据类型的信息以及每个目录包含的数据类型
        function getTreeStructure(sysTree, curPid) {
            curId++;
            if (sysTree.extraClasses == "nv-dir" && sysTree.taskType != 107) {
                //该节点是一个目录节点
                sysStructureInfo.dirInfoDic[sysTree.dirId] = new Object({
                    "name": sysTree.title,
                    "Id": curId,
                    "dirId": sysTree.dirId,
                    "Pid": curPid,
                    "dataTypeList": [],
                    "statInfo": new Object({
                        "batchFlag": 0,
                        "sumStorageSize": 0,
                        "sumCounts": 0,
                        "todaydayCounts": 0,
                        "yesterdayCounts": 0,
                        "beforeYesterdayCounts": 0,
                        "weekCounts": 0,
                        "monthCounts": 0,
                        "yearCounts": 0,
                        "sumCountsRec": 0,
                        "todaydayCountsRec": 0,
                        "yesterdayCountsRec": 0,
                        "beforeYesterdayCountsRec": 0,
                        "weekCountsRec": 0,
                        "monthCountsRec": 0,
                        "yearCountsRec": 0,
                    }),
                });
                var curPid = sysTree.dirId;
                if(sysTree.children != undefined){
                    for (var i = 0; i < sysTree.children.length; ++i) {
                        getTreeStructure(sysTree.children[i], curPid);
                    }
                }
            }
            else if(sysTree.extraClasses == "nv-data") {
                //该节点是一个数据类型，叶子节点
                if (sysStructureInfo.dataTypeInfoDic[(sysTree.typeId + '_' + sysTree.centerCode).toString()] == undefined) {
                    sysStructureInfo.dataTypeInfoDic[(sysTree.typeId + '_' + sysTree.centerCode).toString()] = new Object({
                        "name": sysTree.title,
                        "Id": sysTree.typeId,
                        "Pid": curPid,
                        "centerCode": sysTree.centerCode,
                        "isVisible": false,
                        "isFilter": false,
                        "statInfo": null,
                    });
                }
                else {
                    sysStructureInfo.dataTypeInfoDic[(sysTree.typeId + '_' + sysTree.centerCode).toString()] = new Object({
                        "name": sysTree.title,
                        "Id": sysTree.typeId,
                        "Pid": curPid,
                        "centerCode": sysTree.centerCode,
                        "isVisible": false,
                        "isFilter": false,
                        "statInfo": new Object({
                            "batchFlag": 0,
                            "sumStorageSize": 0,
                            "sumCounts": 0,
                            "todaydayCounts": 0,
                            "yesterdayCounts": 0,
                            "beforeYesterdayCounts": 0,
                            "weekCounts": 0,
                            "monthCounts": 0,
                            "yearCounts": 0,
                            "sumCountsRec": 0,
                            "todaydayCountsRec": 0,
                            "yesterdayCountsRec": 0,
                            "beforeYesterdayCountsRec": 0,
                            "weekCountsRec": 0,
                            "monthCountsRec": 0,
                            "yearCountsRec": 0,
                            "beginDateStr": "",
                            "endDateStr": ""
                        }),
                    });
                }

                var dataTypeDirId = curPid;
                while (dataTypeDirId != -1) {
                    sysStructureInfo.dirInfoDic[dataTypeDirId].dataTypeList.push((sysTree.typeId + '_' + sysTree.centerCode).toString());
                    dataTypeDirId = sysStructureInfo.dirInfoDic[dataTypeDirId].Pid;
                }
            }
        }

        function initTreeTable(sysTree, curPid, statType) {
            curId++;
            //console.log("curId: ", curId);
            if (sysTree.extraClasses == "nv-dir") {
                //该节点是一个目录节点
                if (curPid <= 0) {
                    $('#treeTable-sum-datastat')[0].children[1].innerHTML += '<tr type="1" id="' + curId + '"> <td><span controller="true">'
                        + sysTree.title
                        + '</span></td>'
                        + '</td> <td>'
                        +'<td>2334665479780</td> <td>2334665479780</td> <td>2334665479780</td> <td>2334665479780</td> <td>2334665479780</td> <td>2334665479780</td> <td>2334665479780</td> <td>2334665479780</td> <td>2334665479780</td> <td>2334665479780</td> <td>2334665479780</td> <td>2334665479780</td> <td>2334665479780</td> <td>2334665479780</td> <td>2015-01-01</td> <td>2016-03-01</td> </tr>';
                }
                else {
                    $('#treeTable-sum-datastat')[0].children[1].innerHTML += '<tr type="1" id="' + curId + '" pid="' + curPid + '"> <td><span controller="true">'
                        + sysTree.title
                        + '</span>'+
                        + '</td> <td>'
                        +'</td> <td>2334665479780</td> <td>2334665479780</td> <td>2334665479780</td> <td>2334665479780</td> <td>2334665479780</td> <td>2334665479780</td> <td>2334665479780</td> <td>2334665479780</td> <td>2334665479780</td> <td>2334665479780</td> <td>2334665479780</td> <td>2334665479780</td> <td>2334665479780</td> <td>2334665479780</td> <td>2015-01-01</td> <td>2016-03-01</td> </tr>';
                }

                sysStructureInfo.dirInfoDic[curId] = new Object({
                    "name": sysTree.title,
                    "Id": curId,
                    "Pid": curPid,
                    "dataTypeList": []
                });

                var curPid = curId;
                for (var i = 0; i < sysTree.children.length; ++i) {
                    initTreeTable(sysTree.children[i], curPid);
                }
            }
            else {
                //该节点是一个数据类型，叶子节点
                $('#treeTable-sum-datastat')[0].children[1].innerHTML += '<tr type="1" id="' + curId + '" pid="'
                    + curPid + '" dataTypeId="' + sysTree.typeId + '" centerCode="' + sysTree.centerCode + '"> <td><span controller="true">'
                    + sysTree.title
                    + '</span></td> <td>2334665479780</td> <td>2334665479780</td> <td>2334665479780</td> <td>2334665479780</td> <td>2334665479780</td> <td>2334665479780</td> <td>2334665479780</td> <td>2334665479780</td> <td>2334665479780</td> <td>2334665479780</td> <td>2334665479780</td> <td>2334665479780</td> <td>2334665479780</td> <td>2334665479780</td> <td>2015-01-01</td> <td>2016-03-01</td> </tr>';

                if (sysStructureInfo.dataTypeInfoDic[sysTree.typeId] == undefined) {
                    sysStructureInfo.dataTypeInfoDic[sysTree.typeId] = new Array();
                    sysStructureInfo.dataTypeInfoDic[sysTree.typeId].push(new Object({
                        "name": sysTree.title,
                        "Id": sysTree.typeId,
                        "Pid": curPid,
                        "centerCode": sysTree.centerCode,
                    }));
                } else {
                    sysStructureInfo.dataTypeInfoDic[sysTree.typeId].push(new Object({
                        "name": sysTree.title,
                        "Id": sysTree.typeId,
                        "Pid": curPid,
                        "centerCode": sysTree.centerCode,
                    }));
                }

                var dataTypeDirId = curPid;
                while (dataTypeDirId > 0) {
                    sysStructureInfo.dirInfoDic[dataTypeDirId].dataTypeList.push(new Object({
                        "typeId": sysTree.typeId,
                        "centerCode": sysTree.centerCode,
                    }));
                    dataTypeDirId = sysStructureInfo.dirInfoDic[dataTypeDirId].Pid;
                }
            }
        }

        function setTreeTableForBusinessStat(sysTree, curPid, sysInfo) {
            curId++;
            var rootDirId;
            //console.log("curId: ", curId);
            if (sysTree.extraClasses == "nv-dir" && sysTree.taskType != 107) {
                //该节点是一个目录节点
                if (curPid <= 0) {
                    treeTableHtml += '<tr type="1" id="' + curId + '" dirId="'
                        + sysInfo.dirInfoDic[sysTree.dirId].dirId + '"> <td><span controller="true" style="color: dodgerblue; font-weight: bold">'
                        + sysTree.title
                        + '</span></td> <td>'
                        + util.getStorageSize(sysInfo.dirInfoDic[sysTree.dirId].statInfo.sumStorageSize) + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.sumCounts + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.todaydayCounts + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.yesterdayCounts + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.beforeYesterdayCounts + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.weekCounts + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.monthCounts + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.yearCounts + '</td> <td></td> <td></td>';

                    rootDirId = sysInfo.dirInfoDic[sysTree.dirId].dirId;
                }
                else {
                    if (sysInfo.dirInfoDic[sysTree.dirId].dataTypeList.length <= 0)
                        return;
                    for (var z = 0; z < sysInfo.dirInfoDic[sysTree.dirId].dataTypeList.length; ++z) {
                        var dataTypeInfo = sysInfo.dirInfoDic[sysTree.dirId].dataTypeList[z];
                        if (sysInfo.dataTypeInfoDic[dataTypeInfo].isVisible) {
                            break;
                        }
                        else {
                            if (z >= sysInfo.dirInfoDic[sysTree.dirId].dataTypeList.length - 1)
                                return;
                        }
                    }

                    treeTableHtml += '<tr type="1" id="' + curId + '" dirId="'
                        + sysInfo.dirInfoDic[sysTree.dirId].dirId + '" pid="' + curPid + '"> <td><span controller="true" style="color: dodgerblue; font-weight: bold">'
                        + sysTree.title
                        + '</span></td> <td>'
                        + util.getStorageSize(sysInfo.dirInfoDic[sysTree.dirId].statInfo.sumStorageSize) + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.sumCounts + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.todaydayCounts + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.yesterdayCounts + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.beforeYesterdayCounts + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.weekCounts + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.monthCounts + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.yearCounts + '</td> <td></td> <td></td>';
                }

                var curPid = curId;
                for (var i = 0; i < sysTree.children.length; ++i) {
                    setTreeTableForBusinessStat(sysTree.children[i], curPid, sysInfo);
                }
            }
            else if(sysTree.extraClasses == "nv-data"){
                //该节点是一个数据类型，叶子节点
                if (sysInfo.dataTypeInfoDic[(sysTree.typeId + '_' + sysTree.centerCode).toString()].isVisible) {
                    treeTableHtml += '<tr type="1" id="' + curId + '" pid="'
                        + curPid + '" dataTypeId="' + sysTree.typeId + '" centerCode="' + sysTree.centerCode + '"> <td><span controller="true" style="font-weight: bold">'
                        + sysTree.title
                        + '</span></td> <td>'
                        + util.getStorageSize(sysStructureInfo.dataTypeInfoDic[(sysTree.typeId + '_' + sysTree.centerCode).toString()].statInfo.sumStorageSize) + '</td> <td>'
                        + sysStructureInfo.dataTypeInfoDic[(sysTree.typeId + '_' + sysTree.centerCode).toString()].statInfo.sumCounts + '</td> <td>'
                        + sysStructureInfo.dataTypeInfoDic[(sysTree.typeId + '_' + sysTree.centerCode).toString()].statInfo.todaydayCounts + '</td> <td>'
                        + sysStructureInfo.dataTypeInfoDic[(sysTree.typeId + '_' + sysTree.centerCode).toString()].statInfo.yesterdayCounts + '</td> <td>'
                        + sysStructureInfo.dataTypeInfoDic[(sysTree.typeId + '_' + sysTree.centerCode).toString()].statInfo.beforeYesterdayCounts + '</td> <td>'
                        + sysStructureInfo.dataTypeInfoDic[(sysTree.typeId + '_' + sysTree.centerCode).toString()].statInfo.weekCounts + '</td> <td>'
                        + sysStructureInfo.dataTypeInfoDic[(sysTree.typeId + '_' + sysTree.centerCode).toString()].statInfo.monthCounts + '</td> <td>'
                        + sysStructureInfo.dataTypeInfoDic[(sysTree.typeId + '_' + sysTree.centerCode).toString()].statInfo.yearCounts + '</td> <td>'
                        + sysStructureInfo.dataTypeInfoDic[(sysTree.typeId + '_' + sysTree.centerCode).toString()].statInfo.beginDateStr + '</td> <td>'
                        + sysStructureInfo.dataTypeInfoDic[(sysTree.typeId + '_' + sysTree.centerCode).toString()].statInfo.endDateStr + '</td>';
                }
            }

            return rootDirId;
        }

        function setTreeTableFoLoadStat(sysTree, curPid, sysInfo) {
            curId++;
            var rootDirId;
            //console.log("curId: ", curId);
            if (sysTree.extraClasses == "nv-dir" && sysTree.taskType != 107) {
                if (sysInfo.dirInfoDic[sysTree.dirId].dataTypeList.length <= 0)
                    return;
                for (var z = 0; z < sysInfo.dirInfoDic[sysTree.dirId].dataTypeList.length; ++z) {
                    var dataTypeInfo = sysInfo.dirInfoDic[sysTree.dirId].dataTypeList[z];
                    if (sysInfo.dataTypeInfoDic[dataTypeInfo].isVisible) {
                        break;
                    }
                    else {
                        if (z >= sysInfo.dirInfoDic[sysTree.dirId].dataTypeList.length - 1)
                            return;
                    }
                }

                //该节点是一个目录节点
                if (curPid <= 0) {
                    treeTableHtml += '<tr type="1" id="' + curId + '" dirId="'
                        + sysInfo.dirInfoDic[sysTree.dirId].dirId + '"> <td>'
                        + '<span controller="true" style="color: dodgerblue; font-weight: bold">'
                        + sysTree.title
                        + '</span></td> <td>'
                        + util.getStorageSize(sysInfo.dirInfoDic[sysTree.dirId].statInfo.sumStorageSize) + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.sumCountsRec + '</td><td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.sumCounts + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.todaydayCountsRec + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.todaydayCounts + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.yesterdayCountsRec + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.yesterdayCounts + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.beforeYesterdayCountsRec + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.beforeYesterdayCounts + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.weekCountsRec + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.weekCounts + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.monthCountsRec + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.monthCounts + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.yearCountsRec + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.yearCounts + '</td> <td></td> <td></td>';

                    rootDirId = sysInfo.dirInfoDic[sysTree.dirId].dirId;
                }
                else {
                    treeTableHtml += '<tr type="1" id="' + curId + '" dirId="'
                        + sysInfo.dirInfoDic[sysTree.dirId].dirId + '" pid="' + curPid + '"> <td>'
                        + '<span controller="true" style="color: dodgerblue; font-weight: bold">'
                        + sysTree.title
                        + '</span></td> <td>'
                        + util.getStorageSize(sysInfo.dirInfoDic[sysTree.dirId].statInfo.sumStorageSize) + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.sumCountsRec + '</td><td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.sumCounts + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.todaydayCountsRec + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.todaydayCounts + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.yesterdayCountsRec + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.yesterdayCounts + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.beforeYesterdayCountsRec + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.beforeYesterdayCounts + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.weekCountsRec + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.weekCounts + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.monthCountsRec + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.monthCounts + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.yearCountsRec + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.yearCounts + '</td> <td></td> <td></td>';

                    //+sysInfo.dirInfoDic[sysTree.dirId].statInfo.sumCountsRec+'</td><td>'
                    //+sysInfo.dirInfoDic[sysTree.dirId].statInfo.sumCounts+'</td> <td>'
                    //+sysInfo.dirInfoDic[sysTree.dirId].statInfo.todaydayCounts+'</td> <td>'
                    //+sysInfo.dirInfoDic[sysTree.dirId].statInfo.yesterdayCounts+'</td> <td>'
                    //+sysInfo.dirInfoDic[sysTree.dirId].statInfo.beforeYesterdayCounts+'</td> <td>'
                    //+sysInfo.dirInfoDic[sysTree.dirId].statInfo.weekCounts+'</td> <td>'
                    //+sysInfo.dirInfoDic[sysTree.dirId].statInfo.monthCounts+'</td> <td>'
                    //+sysInfo.dirInfoDic[sysTree.dirId].statInfo.yearCounts+'</td> <td></td> <td></td>';
                }

                var curPid = curId;
                for (var i = 0; i < sysTree.children.length; ++i) {
                    setTreeTableFoLoadStat(sysTree.children[i], curPid, sysInfo);
                }
            }
            else if(sysTree.extraClasses == "nv-data"){
                //该节点是一个数据类型，叶子节点
                if (sysInfo.dataTypeInfoDic[(sysTree.typeId + '_' + sysTree.centerCode).toString()].isVisible) {
                    treeTableHtml += '<tr type="1" id="' + curId + '" pid="'
                        + curPid + '" dataTypeId="' + sysTree.typeId + '" centerCode="' + sysTree.centerCode + '"> <td><span controller="true" style="font-weight: bold">'
                        + sysTree.title
                        + '</span></td> <td>'
                        + util.getStorageSize(sysStructureInfo.dataTypeInfoDic[(sysTree.typeId + '_' + sysTree.centerCode).toString()].statInfo.sumStorageSize) + '</td> <td>'
                        + sysStructureInfo.dataTypeInfoDic[(sysTree.typeId + '_' + sysTree.centerCode).toString()].statInfo.sumCountsRec + '</td> <td>'
                        + sysStructureInfo.dataTypeInfoDic[(sysTree.typeId + '_' + sysTree.centerCode).toString()].statInfo.sumCounts + '</td> <td>'
                        + sysStructureInfo.dataTypeInfoDic[(sysTree.typeId + '_' + sysTree.centerCode).toString()].statInfo.todaydayCountsRec + '</td> <td>'
                        + sysStructureInfo.dataTypeInfoDic[(sysTree.typeId + '_' + sysTree.centerCode).toString()].statInfo.todaydayCounts + '</td> <td>'
                        + sysStructureInfo.dataTypeInfoDic[(sysTree.typeId + '_' + sysTree.centerCode).toString()].statInfo.yesterdayCountsRec + '</td> <td>'
                        + sysStructureInfo.dataTypeInfoDic[(sysTree.typeId + '_' + sysTree.centerCode).toString()].statInfo.yesterdayCounts + '</td> <td>'
                        + sysStructureInfo.dataTypeInfoDic[(sysTree.typeId + '_' + sysTree.centerCode).toString()].statInfo.beforeYesterdayCountsRec + '</td> <td>'
                        + sysStructureInfo.dataTypeInfoDic[(sysTree.typeId + '_' + sysTree.centerCode).toString()].statInfo.beforeYesterdayCounts + '</td> <td>'
                        + sysStructureInfo.dataTypeInfoDic[(sysTree.typeId + '_' + sysTree.centerCode).toString()].statInfo.weekCountsRec + '</td> <td>'
                        + sysStructureInfo.dataTypeInfoDic[(sysTree.typeId + '_' + sysTree.centerCode).toString()].statInfo.weekCounts + '</td> <td>'
                        + sysStructureInfo.dataTypeInfoDic[(sysTree.typeId + '_' + sysTree.centerCode).toString()].statInfo.monthCountsRec + '</td> <td>'
                        + sysStructureInfo.dataTypeInfoDic[(sysTree.typeId + '_' + sysTree.centerCode).toString()].statInfo.monthCounts + '</td> <td>'
                        + sysStructureInfo.dataTypeInfoDic[(sysTree.typeId + '_' + sysTree.centerCode).toString()].statInfo.yearCountsRec + '</td> <td>'
                        + sysStructureInfo.dataTypeInfoDic[(sysTree.typeId + '_' + sysTree.centerCode).toString()].statInfo.yearCounts + '</td> <td>'
                        + sysStructureInfo.dataTypeInfoDic[(sysTree.typeId + '_' + sysTree.centerCode).toString()].statInfo.beginDateStr + '</td> <td>'
                        + sysStructureInfo.dataTypeInfoDic[(sysTree.typeId + '_' + sysTree.centerCode).toString()].statInfo.endDateStr + '</td>';
                }
            }

            return rootDirId;
        }

        function setTreeTableFoLoadStatForUser(sysTree, curPid, sysInfo) {
            curId++;
            var rootDirId;
            //console.log("curId: ", curId);
            if (sysTree.extraClasses == "nv-dir") {
                if (sysInfo.dirInfoDic[sysTree.dirId].dataTypeList.length <= 0)
                    return;
                for (var z = 0; z < sysInfo.dirInfoDic[sysTree.dirId].dataTypeList.length; ++z) {
                    var dataTypeInfo = sysInfo.dirInfoDic[sysTree.dirId].dataTypeList[z];
                    if (sysInfo.dataTypeInfoDic[dataTypeInfo].isVisible) {
                        break;
                    }
                    else {
                        if (z >= sysInfo.dirInfoDic[sysTree.dirId].dataTypeList.length - 1)
                            return;
                    }
                }

                //该节点是一个目录节点
                if (curPid <= 0) {
                    $('#treeTable-sum-datastat')[0].children[1].innerHTML += '<tr type="1" id="' + curId + '" dirId="'
                        + sysInfo.dirInfoDic[sysTree.dirId].dirId + '"> <td>'
                        + '<span controller="true" style="color: dodgerblue; font-weight: bold">'
                        + sysTree.title
                        + '</span></td> <td>'
                        + util.getStorageSize(sysInfo.dirInfoDic[sysTree.dirId].statInfo.sumStorageSize) + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.sumCountsRec + '</td><td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.sumCounts + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.todaydayCountsRec + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.todaydayCounts + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.yesterdayCountsRec + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.yesterdayCounts + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.beforeYesterdayCountsRec + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.beforeYesterdayCounts + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.weekCountsRec + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.weekCounts + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.monthCountsRec + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.monthCounts + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.yearCountsRec + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.yearCounts + '</td> <td></td> <td></td>';

                    rootDirId = sysInfo.dirInfoDic[sysTree.dirId].dirId;
                }
                else {
                    $('#treeTable-sum-datastat')[0].children[1].innerHTML += '<tr type="1" id="' + curId + '" dirId="'
                        + sysInfo.dirInfoDic[sysTree.dirId].dirId + '" pid="' + curPid + '"> <td>'
                        + '<span controller="true" style="color: dodgerblue; font-weight: bold">'
                        + sysTree.title
                        + '</span></td> <td>'
                        + util.getStorageSize(sysInfo.dirInfoDic[sysTree.dirId].statInfo.sumStorageSize) + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.sumCountsRec + '</td><td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.sumCounts + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.todaydayCountsRec + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.todaydayCounts + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.yesterdayCountsRec + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.yesterdayCounts + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.beforeYesterdayCountsRec + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.beforeYesterdayCounts + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.weekCountsRec + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.weekCounts + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.monthCountsRec + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.monthCounts + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.yearCountsRec + '</td> <td>'
                        + sysInfo.dirInfoDic[sysTree.dirId].statInfo.yearCounts + '</td> <td></td> <td></td>';

                    //+sysInfo.dirInfoDic[sysTree.dirId].statInfo.sumCountsRec+'</td><td>'
                    //+sysInfo.dirInfoDic[sysTree.dirId].statInfo.sumCounts+'</td> <td>'
                    //+sysInfo.dirInfoDic[sysTree.dirId].statInfo.todaydayCounts+'</td> <td>'
                    //+sysInfo.dirInfoDic[sysTree.dirId].statInfo.yesterdayCounts+'</td> <td>'
                    //+sysInfo.dirInfoDic[sysTree.dirId].statInfo.beforeYesterdayCounts+'</td> <td>'
                    //+sysInfo.dirInfoDic[sysTree.dirId].statInfo.weekCounts+'</td> <td>'
                    //+sysInfo.dirInfoDic[sysTree.dirId].statInfo.monthCounts+'</td> <td>'
                    //+sysInfo.dirInfoDic[sysTree.dirId].statInfo.yearCounts+'</td> <td></td> <td></td>';
                }

                var curPid = curId;
                for (var i = 0; i < sysTree.children.length; ++i) {
                    setTreeTableFoLoadStat(sysTree.children[i], curPid, sysInfo);
                }
            }
            else {
                //该节点是一个数据类型，叶子节点
                if (sysInfo.dataTypeInfoDic[(sysTree.typeId + '_' + sysTree.centerCode).toString()].isVisible) {
                    $('#treeTable-sum-datastat')[0].children[1].innerHTML += '<tr type="1" id="' + curId + '" pid="'
                        + curPid + '" dataTypeId="' + sysTree.typeId + '" centerCode="' + sysTree.centerCode + '"> <td><span controller="true" style="font-weight: bold">'
                        + sysTree.title
                        + '</span></td> <td>'
                        + util.getStorageSize(userStructureInfo.dataTypeInfoDic[(sysTree.typeId + '_' + sysTree.centerCode).toString()].statInfo.sumStorageSize) + '</td> <td>'
                        + userStructureInfo.dataTypeInfoDic[(sysTree.typeId + '_' + sysTree.centerCode).toString()].statInfo.sumCountsRec + '</td> <td>'
                        + userStructureInfo.dataTypeInfoDic[(sysTree.typeId + '_' + sysTree.centerCode).toString()].statInfo.sumCounts + '</td> <td>'
                        + userStructureInfo.dataTypeInfoDic[(sysTree.typeId + '_' + sysTree.centerCode).toString()].statInfo.todaydayCountsRec + '</td> <td>'
                        + userStructureInfo.dataTypeInfoDic[(sysTree.typeId + '_' + sysTree.centerCode).toString()].statInfo.todaydayCounts + '</td> <td>'
                        + userStructureInfo.dataTypeInfoDic[(sysTree.typeId + '_' + sysTree.centerCode).toString()].statInfo.yesterdayCountsRec + '</td> <td>'
                        + userStructureInfo.dataTypeInfoDic[(sysTree.typeId + '_' + sysTree.centerCode).toString()].statInfo.yesterdayCounts + '</td> <td>'
                        + userStructureInfo.dataTypeInfoDic[(sysTree.typeId + '_' + sysTree.centerCode).toString()].statInfo.beforeYesterdayCountsRec + '</td> <td>'
                        + userStructureInfo.dataTypeInfoDic[(sysTree.typeId + '_' + sysTree.centerCode).toString()].statInfo.beforeYesterdayCounts + '</td> <td>'
                        + userStructureInfo.dataTypeInfoDic[(sysTree.typeId + '_' + sysTree.centerCode).toString()].statInfo.weekCountsRec + '</td> <td>'
                        + userStructureInfo.dataTypeInfoDic[(sysTree.typeId + '_' + sysTree.centerCode).toString()].statInfo.weekCounts + '</td> <td>'
                        + userStructureInfo.dataTypeInfoDic[(sysTree.typeId + '_' + sysTree.centerCode).toString()].statInfo.monthCountsRec + '</td> <td>'
                        + userStructureInfo.dataTypeInfoDic[(sysTree.typeId + '_' + sysTree.centerCode).toString()].statInfo.monthCounts + '</td> <td>'
                        + userStructureInfo.dataTypeInfoDic[(sysTree.typeId + '_' + sysTree.centerCode).toString()].statInfo.yearCountsRec + '</td> <td>'
                        + userStructureInfo.dataTypeInfoDic[(sysTree.typeId + '_' + sysTree.centerCode).toString()].statInfo.yearCounts + '</td> <td>'
                        + userStructureInfo.dataTypeInfoDic[(sysTree.typeId + '_' + sysTree.centerCode).toString()].statInfo.beginDateStr + '</td> <td>'
                        + userStructureInfo.dataTypeInfoDic[(sysTree.typeId + '_' + sysTree.centerCode).toString()].statInfo.endDateStr + '</td>';
                }
            }

            return rootDirId;
        }

        return {
            //initTreeTable: initTreeTable,
            initId: initId,
            sysStructureInfo: sysStructureInfo,
            userStructureInfo: userStructureInfo,
            getTreeStructure: getTreeStructure,
            getTreeStructureForUser: getTreeStructureForUser,
            setTreeTableForBusinessStat: setTreeTableForBusinessStat,
            setTreeTableFoLoadStat: setTreeTableFoLoadStat,
            getTreeTableHtml: function () {
                return treeTableHtml;
            }
            // setTreeTableFoLoadStatForUser: setTreeTableFoLoadStatForUser,
        }

    }
);
