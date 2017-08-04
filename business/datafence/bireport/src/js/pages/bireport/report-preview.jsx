const Notify = require('nova-notify');
const utils = require('nova-utils');
const Q = require('q');
import React from 'react';
import ReactDOM from 'react-dom';
/** self-defined components */
import {App} from '../../module/bi-report/bi-view-app';
import {store} from '../../module/bi-report/store';
var Manager = require('../../module/bi-report/bi-manager');
/** dnd */
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
/** css */
import '../../module/bi-report/bi-report.less';
import 'react-bootstrap-table/css/react-bootstrap-table.css';


/** component */
class Wrapper extends React.Component {
    render() {
        return (
            <div style={{height:'100%'}} className='main-panel'>
            <App editable={false} />
            </div>
    );
    }
}

/** 加载数据 */
function initChart(taskId, chart) {
    let defer = Q.defer();

    let dimension = chart.dimension || [];
    let measure = chart.measure || [];
    let fieldNodes = dimension.concat(measure);
    let queryFields = _.map(fieldNodes, function(item) { return item.aliasName });

    let defineData = [];
    let dataSourceInfo = chart.dataSourceInfo;

    if(dataSourceInfo) {
        Manager.quertReportData(taskId, queryFields, defineData, dataSourceInfo).then(function(data) {
            chart.dataSourceInfo = dataSourceInfo;
            chart.dimension = dimension;
            chart.measure = measure
            chart.defineData = defineData;
            chart.data = data;
            defer.resolve();
        });
    }
    else {
        chart.dataSourceInfo = undefined;
        chart.dimension = dimension;
        chart.measure = chart.chartType === 'COMMONTABLE' ? 0 : [];
        chart.defineData = defineData;
        chart.data = [];
        defer.resolve();
    }

    return defer.promise;
}

function loadData() {
    let defer = Q.defer();

    var previewId = utils.getURLParameter('previewid');
    var modelId = utils.getURLParameter('modelid');
    var taskId = utils.getURLParameter('taskid');
    var solidId = utils.getURLParameter('solidid');
    var reportId = utils.getURLParameter('reportid');
    if(previewId) {
        let state = JSON.parse(localStorage.getItem(previewId));

        if(JSON.parse(localStorage.getItem(previewId)) === null) {
            defer.reject({ message: '预览页面已过期l' });
        }
        else {
            store.dispatch({ 'type':'REPLACE', 'state':state });
            defer.resolve();
        }
    }
    else if(reportId) {
        Manager.openReport(reportId).then(function(data){

            let reportDetail = data.reportDetail;
            if(!reportDetail) {
                defer.reject({ message: '尚未制作报表原型' });
                return;
            }

            /** 加载图表字段数据(引用传递) */
            let promises = [];

            _.each(reportDetail.charts, function(chart) {
                promises.push(initChart(data.taskId, chart));
            });

            /** 全部加载完之后resolve */
            Q.all(promises).then(function() {
                store.dispatch({ 'type':'REPLACE', 'state':reportDetail });
                defer.resolve();
            });
        });
    }else if(solidId && taskId){

        var getSolidPromise = utils.makeRetryGet('/modelanalysis/modeling/loadsolid', {
            solidId: solidId
        });

        getSolidPromise.then(function(model) {
            if (model) {
                console.log(JSON.parse(model.modelDetail));
                let reportDetail = JSON.parse(model.modelDetail).reportDetail;
                if(!reportDetail) {
                    defer.reject({ message: '尚未制作报表原型' });
                    return;
                }

                /** 加载图表字段数据(引用传递) */
                let promises = [];

                _.each(reportDetail.charts, function(chart) {
                    promises.push(initChart(taskId, chart));
                });

                /** 全部加载完之后resolve */
                Q.all(promises).then(function() {
                    store.dispatch({ 'type':'REPLACE', 'state':reportDetail });
                    defer.resolve();
                });

            }


        });

    }

    return defer.promise;
}


///** 轮询进度100% */
//function loadTaskInfo(taskId) {
//    let defer = Q.defer();
//    $.getJSON('/modeling/taskinfo', {
//        taskid: taskId
//    }, function (rsp) {
//        if (rsp.code == 0) {
//            defer.resolve(rsp.data);
//        } else {
//            defer.reject(rsp.message);
//        }
//    });
//    return defer.promise;
//}
//
//function _isRunningTask(taskInfo) {
//    return taskInfo.taskState == 'running' || taskInfo.taskState == 'queue';
//}
//
//var pollingRetryCount;
//var runningInfo;
//const RETRY_LIMIT = 5;
//function pollingRunningInfo(taskId) {
//    loadTaskInfo(taskId).then(function (data) {
//        runningInfo = data;
//
//        let stillRunning = _isRunningTask(runningInfo.mainTask);
//
//        if (stillRunning) {
//            setTimeout(() => pollingRunningInfo(taskId), 1000);
//            return;
//        }
//
//        pollingRetryCount = 0;
//    }).catch(function (err) {
//       if (pollingRetryCount <= RETRY_LIMIT) {
//            pollingRetryCount++;
//            setTimeout(() => pollingRunningInfo(taskId), 1000);
//        } else {
//            pollingRetryCount = 0;
//            if (err) {
//                Notify.simpleNotify(window.i18n.t("warning.error"), window.i18n.t("warning. task-information-acquisition-failed") + ':' + err, 'error');
//            }
//       }
//    });
//}

function checkState() {
    let defer = Q.defer();

    var previewId = utils.getURLParameter('previewid');
    var reportId = utils.getURLParameter('reportid');
    var taskId = utils.getURLParameter('taskid');
    var solidId = utils.getURLParameter('solidid');
    if(previewId) {
        defer.resolve();
    }
    else if(reportId) {
        //pollingRunningInfo(taskId);
        defer.resolve();
    } else if(solidId && taskId){
        defer.resolve();
    }

    return defer.promise;
}

var PreviewWrapper = DragDropContext(HTML5Backend)(Wrapper);

/** render */
checkState().then(function() {
    loadData().then(function() {
        ReactDOM.render(<PreviewWrapper />, document.getElementById('content-container'));
        hideLoader();
    }).catch(function(e) {
        Notify.simpleNotify("加载出错", e.message || e, 'error');
    })
}).catch(function(e) {
    Notify.simpleNotify("加载出错", e.message || e, 'error');
});