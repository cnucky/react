const Notify = require('nova-notify');
const Q = require('q');
var utils = require('nova-utils');
var Dialog = require('nova-dialog');
var PersonalWorkTree = require('../../../../../../public/widget/personalworktree');
var saveResult = require('../../tpl/tpl-report-saver');
var changeTak = require('../../widget/change-task/change-task');
import {store} from './store';

/** 加载模型节点信息 */
function loadModel () {
    let defer = Q.defer();
    var modelId = utils.getURLParameter('modelid');

    $.get('/bireport/bireport/loadmodel',{
        modelid: modelId
    },function (rsp) {
        if(rsp.code == 0){
            defer.resolve(rsp.data);
        }else {
            Notify.simpleNotify('错误', rsp.message ||'模型数据加载失败', 'error');
        }
    },'json');
    return defer.promise;
}

function loadTaskModel () {
    let defer = Q.defer();
    let _data = $.extend(true, {}, store.getState());
    let taskId = utils.getURLParameter('taskid') || _data.taskId;

    $.get('/bireport/bireport/getsnapshot',{
        taskid: taskId
    },function (rsp) {
        if(rsp.code == 0){
            defer.resolve(rsp.data);
        }else {
            Notify.simpleNotify('错误', '该任务没有运行完成无法操作', 'error');
        }
    },'json');
    return defer.promise;
}



/** 查询绑定数据源 */
function quertReportData(mainTaskId, queryFields, defineData, dataSource) {
    let defer = Q.defer();

    /** 不存在taskId：即模型未运行 或者 用户自定义了数据 */
    if(mainTaskId === -1) {
        if (defineData.length > 0) {
            let res = _.map(defineData, function(item) {
                let obj = new Object();
                _.each(queryFields, function(field) {
                    obj[field] = item[field];
                });
                return obj;
            });

            defer.resolve(res);
        }
        else
        {
            defer.resolve(new Array());
        }
    } else {
        let params = {
            mainTaskId: mainTaskId,
            dataSource: dataSource,
            queryFields: queryFields
        };
        let callback = function(rsp) {
            if(rsp.code === 0) {
                defer.resolve(rsp.data);
            }
            else {
                Notify.simpleNotify('错误', rsp.message ||'查询绑定数据源失败', 'error');
                defer.resolve(new Array());
            }
        };

        $.get('/bireport/bireport/queryreportdata', params, callback, 'json');
    }

    return defer.promise;
}

/** 保存报表 */
function check() {
    let data = store.getState();
    let card = data.card;

    if (card.name == "") {
        Notify.simpleNotify('错误', '报表名称没有设置，无法保存', 'error');
        return false;
    } else {
        return true;
    }
}


function showDialog(callback) {
    var saveCfg = {};

    Dialog.build({
        title: 'BI报表保存',
        content: saveResult,
        rightBtnCallback: function() {
            saveCfg.reportName = $('#name-input').val();
            saveCfg.reportComments = $('#desc-input').val();

            var selectedDirectory = $('#save-position-picker').fancytree('getTree').getActiveNode();
            if (!_.isNull(selectedDirectory)) {
                saveCfg.dirId = selectedDirectory.key;
            } else {
                saveCfg.dirId = '';
            }

            if (_.isEmpty(saveCfg.reportName)) {
                Notify.simpleNotify('请输入报表名称');
            }else if (_.isEmpty(saveCfg.dirId)) {
                Notify.simpleNotify('请选择报表保存位置');
            } else {
                callback(saveCfg);
                Dialog.dismiss();
            }
        }
    }).show(function() {
        var data = store.getState();
        var reportName= data.card.name;
        var reportComments = data.card.comments;
        $('#name-input').val(reportName);
        $('#desc-input').val(reportComments);

        PersonalWorkTree.buildTree({
            container: $("#save-position-picker"),
            treeAreaFlag: "default"
        });
    });
}

function saveToModeling() {
    let taskIds = utils.getURLParameter('taskid');
    let modelIds = utils.getURLParameter('modelid');
    let _data = $.extend(true, {}, store.getState());
    _data.card.isSelected = false;
    _.each(_data.charts, (chart) => { chart.isSelected = false });
    _.each(_data.layouts, (layout) => { layout.isSelected = false });

    var { modelId, modelName, modelDetail, ...reportDetail } = _data;
    _.each(reportDetail.charts, function(item) {
        item.data = [];
        // item.defineData = [];
        if(item.defineData.length > 100) {
            item.defineData = item.defineData.splice(0, 100);
        }
    })
    modelDetail.reportDetail = reportDetail;

    ///** 查看权限并保存 */
    //$.getJSON('/modeling/checkmodelpermission', {
    //    id: modelId
    //}, function (rsp) {
    //    if (rsp.code == 0) {
    //        if (rsp.data == 1) {
                $.post('/bireport/bireport/updatemodel', {
                    id: modelId,
                    detail: JSON.stringify(modelDetail),
                    name: modelName
                }, function (rsp) {
                    if (rsp.code == 0)
                        if(taskIds && modelIds){
                            showDialog(saveToOtherModule);

                            $('#btn-download').removeClass('hide');

                        } else{
                            Notify.show({ title: '提示', text: '保存成功', type: 'success' });
                        }
                    else
                        Notify.simpleNotify('错误', rsp.message || '保存失败', 'error');
                }, 'json');
        //    } else {
        //        Notify.simpleNotify('失败', '您没有修改该模型的权限', 'error');
        //    }
        //} else {
        //    Notify.simpleNotify('错误', '模型修改权限核对失败', 'error');
        //}
    //});
}

function saveToOtherModule(saveCfg) {

    let _data = $.extend(true, {}, store.getState());
    let taskId = utils.getURLParameter('taskid') || _data.taskId;
    let modelId = utils.getURLParameter('modelid');

    _data.card.isSelected = true;
    _.each(_data.charts, (chart) => { chart.isSelected = false });
    _.each(_data.layouts, (layout) => { layout.isSelected = false });

    $.post('/bireport/bireport/saveReport', {
        taskId: taskId,
        dirId: saveCfg.dirId,
        reportName: saveCfg.reportName,
        reportDesc: saveCfg.reportComments,
        reportDetail :JSON.stringify(_data)
    }, function (rsp) {
        rsp = JSON.parse(rsp);
        if (rsp.code == 0) {
            $('#btn-download').removeClass('hide');
            if(taskId && modelId){
                $('#btn-save').removeClass('hide');
            }

            store.dispatch({
                type: 'ADD_REPORTID',
                reportId : rsp.data.reportId
            });

            Notify.show({ title: '提示', text: '保存成功', type: 'success' });
        } else {
            Notify.simpleNotify('错误', rsp.message || '保存失败', 'error');
        }
    });
}

function upDateTask() {
    let taskId = utils.getURLParameter('taskid');
    let modelId = utils.getURLParameter('modelid');
    let _data = $.extend(true, {}, store.getState());
    _data.card.isSelected = true;
    _.each(_data.charts, (chart) => { chart.isSelected = false });
    _.each(_data.layouts, (layout) => { layout.isSelected = false });

    let reportId = _data.reportId;

    console.log(reportId)
    $.post('/bireport/bireport/upDateReport', {
        reportId:reportId,
        reportDetail :JSON.stringify(_data)
    }, function (rsp) {
        rsp = JSON.parse(rsp);
        if (rsp.code == 0) {
            $('#btn-download').removeClass('hide');

            Notify.show({ title: '提示', text: '保存成功', type: 'success' });
        } else {
            Notify.simpleNotify('错误', rsp.message || '保存失败', 'error');
        }
    });
}

// function checkTask() {
//     let _data = $.extend(true, {}, store.getState());
//     let taskId = utils.getURLParameter('taskid') || _data.taskId;
//     $.getJSON('/bireport/bireport/checkTask', {
//         taskId: taskId
//     }, function (rsp) {
//         if (rsp.code == 0) {
//             if (rsp.data.reportId === -1){
//                 showDialog(saveToOtherModule);
//             } else {
//                 upDateTask();
//             }
//         } else {
//             Notify.simpleNotify('错误', '报表任务核对失败', 'error');
//         }
//     });
// }

function saveReport() {
    let _data = $.extend(true, {}, store.getState());
    let taskId = utils.getURLParameter('taskid') || _data.taskId;
    let modelId = utils.getURLParameter('modelid');
    let reportId = utils.getURLParameter('reportid');
    if(modelId && !taskId) {
        /** 保存至建模 */
        check() && saveToModeling();
    }
    else if (taskId && modelId) {
        /** 保存至其他模块 */
        check() && upDateTask();
    }else if(reportId){
        check() && upDateTask()
    }
}

function otherSaveReport() {
    let _data = $.extend(true, {}, store.getState());
    let taskId = utils.getURLParameter('taskid') || _data.taskId;
    let modelId = utils.getURLParameter('modelid');
    let reportId = utils.getURLParameter('reportid');
    if (taskId){
        check() && showDialog(saveToOtherModule);
    } else if(reportId){
        check() && showDialog(saveToOtherModule);
    } else if(taskId && modelId){
        check() && saveToModeling() && showDialog(saveToOtherModule);
    }
}

function openReport(reportId) {
    let defer = Q.defer();

    $.getJSON('/bireport/bireport/getReport', {
        reportId:reportId,
    }, function (rsp) {
        if (rsp.code == 0) {

            defer.resolve(rsp.data);

        } else {

            Notify.simpleNotify('错误', rsp.message || '保存失败', 'error');

        }
    });

    return defer.promise;
}







/** 对外接口 */
module.exports = {
    loadModel: loadModel,
    quertReportData: quertReportData,
    saveReport: saveReport,
    loadTaskModel:loadTaskModel,
    openReport:openReport,
    otherSaveReport:otherSaveReport
};