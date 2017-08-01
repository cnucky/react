/**
 * Created by root on 12/1/15.
 */

define([], function () {
    //var fileCountAll, batchid, dbtype;
    var curClickIndex;
    var curScrollTop;

    //获取任务表格的信息
    function getinfoTable() {
        var inTable = document.getElementById("infoTableBody");
        var cookies = document.cookie.split('; ');
        var userId = -1;
        var map = {};
        cookies.forEach(function (cookie) {
            //console.log("cookies", cookies);
            var kv = cookie.split('=');
            map[kv[0]] = kv[1];
        });

        //在cookies中获取userid
        $.post('/datamanage/dataimport/loginVerify', {
            tgt: map['tgt'],
        }).done(function (data1) {
            var data = JSON.parse(data1);
            userId = data.data.userId;
            getBatchInfos(userId);
            //alert(userId);
        });

        //通过userid来获取任务信息
        function getBatchInfos(userId) {
            $.post('/datamanage/importbatch/GetBatchInfoByUserId', {
                userID: userId
            }).done(function (data) {
                data = JSON.parse(data);
                console.log(data);
                if (data.code == 0) {
                    var arrayTask = new Array();
                    arrayTask = data.data.batchInfoTable;
                    console.log(arrayTask.length);
                    var cell;
                    for (var i = 0; i < arrayTask.length; i++) {
//                          console.log(i);
                        row = inTable.insertRow();
                        for (var j = 0; j < 10; j++) {
                            cell = row.insertCell();
                            if (j == 0) {
                                cell.innerHTML = getloadIcon(arrayTask[i].LOAD_STATE) + '&nbsp' + arrayTask[i].batchID;
                            }
                            if (j == 1) cell.innerHTML = '<span data-toggle="tooltip" data-placement="bottom" title=' + arrayTask[i].batchName + '>' + arrayTask[i].batchName + '</span>';
                            if (j == 2) {
                                var batchTypeStr = "";
                                var batchType = 0;
                                batchType = arrayTask[i].taskType;
                                switch (batchType) {
                                    case 1:
                                        batchTypeStr = "导入任务";
                                        break;
                                    case 2:
                                        batchTypeStr = "对接任务";
                                        break;
                                    case 6:
                                        batchTypeStr = "数据库抽取任务";
                                        break;
                                    default :
                                        batchTypeStr = "";
                                        break;
                                }
                                cell.innerHTML = batchTypeStr;
                            }
                            if (j == 3) cell.innerHTML = '<span data-toggle="tooltip" data-placement="bottom" title=' + arrayTask[i].watchDir + '>' + arrayTask[i].watchDir + '</span>';
                            if (j == 4) cell.innerHTML = getShowTime(arrayTask[i].LOAD_START_TIME);
                            if (j == 5) cell.innerHTML = getShowTime(arrayTask[i].LOAD_FINISH_TIME);
                            if (j == 6) {
                                var loadState = 3;
                                loadState = arrayTask[i].LOAD_STATE;
                                console.log(arrayTask[i].LOAD_STATE.toString());
                                cell.innerHTML = getloadState(loadState);
                            }
                            if (j == 7) cell.innerHTML = '<progress value=' + arrayTask[i].LOAD_RATIO + ' max=100></progress>' + '<span class="barNumber">' + arrayTask[i].LOAD_RATIO + '%</span>';
                            //'<div class="progress"><div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow='+ arrayTask[i].LOAD_RATIO +' aria-valuemin="0" aria-valuemax="100" style="width:60%">'+ arrayTask[i].LOAD_RATIO + '%</div></div>'
                            '<progress value=' + arrayTask[i].LOAD_RATIO + ' max=100></progress>' + '<span class="barNumber">' + arrayTask[i].LOAD_RATIO + '%</span>';
                            ;
                            if (j == 8) cell.innerHTML = arrayTask[i].LOAD_RECORD_COUNT;
                            if (j == 9) cell.innerHTML = arrayTask[i].ERROR_COUNT;
                        }
                    }
                    if (curClickIndex != undefined) {
                        getCurBatchIndex(curClickIndex, curScrollTop);
                    }
                }
                else {

                }
            });
        }

    }

    //获取之前点击的信息并加上点击样式
    function getCurBatchIndex(curClick, curScroll) {
        curClickIndex = curClick;
        curScrollTop = curScroll;
        //var infoTableBody = document.getElementById("infoTableBody");
        $("#infoTableBody")[0].rows[curClickIndex].classList.add("clicked");//" tr:nth-child(n)").addClass("clicked");
        $("#infoTableDiv").scrollTop(curScroll);
    }

    //刷新整个表格函数
    function refreshInfoTable() {
        $("#deleteBtn").addClass("disabled");
        $("#copyBtn").addClass("disabled");
        $("#fileCount").html(0);
        $("#infoTableBody").html("");
        $("#detailTableBody").html("");
    }

    //通过batchid，任务状态和任务类型来更改文件的状态
    function setBatchStatus(batchID, status, dbType) {
        $.post('/datamanage/importbatch/SetBatchStatus', {
            batchID: batchID,// "1",
            status: status, // "1",
            dbType: dbType// "1",
        }).done(function () {
            getinfoTable();
        })
    }

    //获取显示时间，将传过来的时间对象解析成时间
    function getShowTime(time) {
        var showTimeString = '';
        if (time) {
            var year = time.year + 1900;
            var month = time.month + 1;
            var date = time.date;
            var hours = time.hours;
            var minutes = time.minutes;
            var seconds = time.seconds;
            showTimeString = year + '-' + month + '-' + date + '  ' + hours + ':' + minutes + ':' + seconds;
            return showTimeString;
        }
        else return showTimeString;
    }

    //更改按钮状态函数
    function changeBtnclass(start, pause, stop) {
        $("#deleteBtn").removeClass("disabled");
        $("#copyBtn").removeClass("disabled");
        if (start)  $("#startBtn").removeClass("disabled");
        else $("#startBtn").addClass("disabled");
        if (pause)  $("#pauseBtn").removeClass("disabled");
        else $("#pauseBtn").addClass("disabled");
        if (stop)  $("#stopBtn").removeClass("disabled");
        else $("#stopBtn").addClass("disabled");
    }

    //通过传来的loadstate数值判断任务状态
    function getloadState(loadState) {
        var batchState = "";
        switch (loadState) {
            case 1:
                batchState = "导入成功";
                break;
            case 2:
                batchState = "部分成功";
                break;
            case 3:
                batchState = "待导入";
                break;
            case 4:
                batchState = "失败";
                break;
            case 5:
                batchState = "导入中";
                break;
            case 6:
                batchState = "暂停";
                break;
            case 7:
                batchState = "停止";
                break;
            default :
                batchState = "";
                break;
        }
        return batchState;
    }

    //通过传来的loadstate数值来生成状态的图标
    function getloadIcon(loadState) {
        var stateIcon = "";
        switch (loadState) {
            case 1://导入成功
                stateIcon = '<span class="glyphicon glyphicon-star"></span>';
                break;
            case 2://部分成功
                stateIcon = '<span class="glyphicon glyphicon-star-empty"></span>';
                break;
            case 3://待导入
                stateIcon = '<span class="glyphicon glyphicon-time"></span>';
                break;
            case 4://失败
                stateIcon = '<span class="glyphicon glyphicon-exclamation-sign"></span>';
                break;
            case 5://导入中
                stateIcon = '<span class="glyphicon glyphicon-play"></span>';
                break;
            case 6://暂停
                stateIcon = '<span class="glyphicon glyphicon-pause"></span>';
                break;
            case 7://停止
                stateIcon = '<span class="glyphicon glyphicon-stop"></span>';
                break;
            default :
                break;
        }
        return stateIcon;
    }

    //通过传入的参数获取任务类型
    function getDbType(dbtypestr) {
        var dbType;
        switch (dbtypestr) {
            case "导入任务":
                dbType = 1;
                break;
            case "对接任务":
                dbType = 2;
                break;
            case "数据库抽取任务":
                dbType = 6;
                break;
            default :
                dbType = 0;
                break;
        }
        return dbType;
    }

//  获取余下所有
//    function GetAllLeftFilesInfo(batchID,currentMinFileID){
//        $.post('/datamanage/importbatch/GetAllLeftFilesInfoByBatchID', {
//            batchID : batchID,
//            currentMinFileID : currentMinFileID
//        }).done(function(data1) {
//            var data = JSON.parse(data1);
//            console.log(data);
//            drawFileTable(data);
//        });
//    };

    //删除任务信息
    function deleteBatchInfo(batchid, dbtype) {
        $.post('/datamanage/importbatch/DeleteDataImportBatchInfo', {
            batchID: batchid,
            dbType: dbtype
        }).done(function (data1) {
            var data = JSON.parse(data1);
            console.log(data);
            //if (data.code == 0) {
            //}
        });
    }

    //复制batchid
    function copyBatch(batchId, selectedNode) {
        //sessionStorage.setItem("batchId", batchId);
        //window.location.href = '/datamanage/dm-dataimport.html?batchId=' + batchId;

        window.location.href = '/datamanage/dm-datamanage.html?datatypeid=' + selectedNode.data.typeId
            + '&centercode=' + selectedNode.data.centerCode
            + '&zoneid=' + selectedNode.data.zoneId
            + '&oprtype=3'
            + '&batchId=' + batchId;
    }

    //通过batchid获取前50个文件信息
    function getFileInfo(batchID, fileCountAll) {
        $.post('/datamanage/importbatch/GetFileInfoByBatchIDFirst50', {
            batchID: batchID
        }).done(function (data1) {
            var data = JSON.parse(data1);
            console.log(data);
            drawFileTable(data, fileCountAll);
        });
    };

    //通过batchid和当前最小的fileid来获取下50个文件信息
    function getFileInfoNext50(batchID, currentMinFileID, fileCountAll) {
        $.post('/datamanage/importbatch/GetFileInfoByBatchIDNext50', {
            batchID: batchID,
            currentMinFileID: currentMinFileID
        }).done(function (data1) {
            var data = JSON.parse(data1);
//           console.log(data);
            drawFileTable(data, fileCountAll);
        });
    };

    //绘制文件信息的表格
    function drawFileTable(data, fileCountAll) {
        var deTable = document.getElementById("detailTableBody");
        var arrayDetail = new Array();
        arrayDetail = data.data.fileInfoTable;
        //console.log("length"+arrayDetail.length);
        // console.log("1:"+fileCountAll);
        fileCountAll = parseInt($("#fileCount").html()) + arrayDetail.length;
        //console.log("2:"+fileCountAll);
        $("#fileCount").html(fileCountAll);
        var i = 0;
        for (var i = 0; i < arrayDetail.length; ++i) {
            row = deTable.insertRow();
            for (var j = 0; j < 8; j++) {
                cell = row.insertCell();
                //文件id
                if (j == 0) cell.innerHTML = arrayDetail[i].FILE_ID;
                //文件名
                if (j == 1) cell.innerHTML = '<span data-toggle="tooltip" data-placement="bottom" title=' + arrayDetail[i].NEW_NAME + '>' + arrayDetail[i].NEW_NAME + '</span>';
                //开始时间
                if (j == 2) cell.innerHTML = getShowTime(arrayDetail[i].LOAD_START_TIME);
//                       console.log(getShowTime(arrayDetail[i].LOAD_START_TIME));
                //结束时间
                if (j == 3) cell.innerHTML = getShowTime(arrayDetail[i].LOAD_FINISH_TIME)
                //文件状态
                if (j == 4) {
                    var loadState = 3;
                    loadState = arrayDetail[i].LOAD_STATE;
//                        console.log(arrayDetail[i].LOAD_STATE.toString());
                    cell.innerHTML = getloadState(loadState);
                }
                //完成百分比
                if (j == 5) {
                    cell.innerHTML = '<progress value=' + arrayDetail[i].LOAD_RATIO + ' max=100></progress>' + '<span class="barNumber">' + arrayDetail[i].LOAD_RATIO + '%</span>';
                }
                //导入记录数
                if (j == 6) cell.innerHTML = arrayDetail[i].LOAD_RECORD_COUNT;
                //出错记录数
                if (j == 7) cell.innerHTML = arrayDetail[i].ERROR_COUNT;
            }
        }
    };

    //解除事件绑定
    function unbindAllbtn() {
        $("#startBtn").unbind();
        $("#pauseBtn").unbind();
        $("#stopBtn").unbind();
        $("#deleteBtn").unbind();
        $("#copyBtn").unbind();
    }

    return {
        getCurBatchIndex: function (curClickIndex, curScroll) {
            return getCurBatchIndex(curClickIndex, curScroll);
        },
        getinfoTable: function () {
            return getinfoTable();
        },
        refreshInfoTable: function () {
            return refreshInfoTable();
        },
        setBatchStatus: function (batchID, status, dbType) {
            return setBatchStatus(batchID, status, dbType);
        },
        getShowTime: function (time) {
            return getShowTime(time);
        },
        changeBtnclass: function (start, pause, stop) {
            return changeBtnclass(start, pause, stop);
        },
        getloadState: function (loadState) {
            return getloadState(loadState);
        },
        getloadIcon: function (loadState) {
            return getloadIcon(loadState);
        },
        getDbType: function (dbtypestr) {
            return getDbType(dbtypestr);
        },
        deleteBatchInfo: function (batchid, dbtype) {
            return deleteBatchInfo(batchid, dbtype);
        },
        copyBatch: function (batchId, selectedNode) {
            return copyBatch(batchId, selectedNode);
        },
        getFileInfo: function (batchID, fileCountAll) {
            return getFileInfo(batchID, fileCountAll);
        },
        getFileInfoNext50: function (batchID, currentMinFileID, fileCountAll) {
            return getFileInfoNext50(batchID, currentMinFileID, fileCountAll);
        },
        unbindAllbtn: function () {
            return unbindAllbtn();
        }
        //drawFileTable:function(){
        //    return drawFileTable();
        //},
    };

})
