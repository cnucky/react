const NovaUtils = require('nova-utils');
const Notify = require('nova-notify');
const ModelapplySaver = require('./modelapply-saver');
const ModelapplySub = require('./modelapply-submit');
const moment = require('moment');
const FileHelper = require('utility/FileSaver/FileSaver');
var store = require('./model-apply-store');
const Q = require('q');
var utils = require('nova-utils');
const NodeManager = require('../modeling/modeling-toolbar-handler');

let solidId, modelSaveCfg, viewDetail, modelDetail, field, modelSubCfg;

function isNumber(data) {
    return _.find(['int', 'bigint', 'double', 'decimal'], function (type) {
        return type == data;
    });
}

function loadTree(modelId) {
    let defer = Q.defer();
    var modelId = utils.getURLParameter('modelid') || modelId;
    $.get('/modelapply/modelapply/getmodelcond', {
        modelId: modelId
    }, function (rsp) {
        if (rsp.code == 0) {
            $('#btn-save-model').addClass('hide');
            $('#btn-subApp').addClass('disabled');
            var source = rsp.data.conds;
            var modelDetail = rsp.data.modelDetail;

            var type = [];
            _.each(source, function (item) {
                _.each(item.children, function (dir) {
                    dir.type=[];
                    if (dir.codeTag == 0) {
                        if (dir.columnType == 'string') {
                            dir.type.push('string')
                        } else if (isNumber(dir.columnType)) {
                            dir.type.push('decimal')
                            dir.type.push('datetime')
                        } else if (dir.columnType == "date" || dir.columnType == "datetime" || dir.columnType == "timestamp") {
                            dir.type.push('date')
                        }
                    } else {
                            dir.type.push('code');
                    }
                    type=type.concat(dir.type)
                })
            })
            var types=_.uniq(type);
            // console.log(types);
            var component;
            var components = [];
            _.each(types, function (item) {
                component = {
                    identity: _.indexOf(type, item) + 1,
                    type: item,
                    opacity: '1',
                    isSelected: false,
                    display: 'none',
                    border: '1px solid transparent',
                    size: "100%",
                    condition: {
                        selectData: [], /**选中的数据**/
                        title: "",
                        field: [],
                        value: [],
                        opr: "等于",
                        hint: "",
                        isRequired: true,
                        hideOpr: true,
                        isMultiple: false,
                    }
                }
                if (component.type == 'datetime') {
                    component.condition.timeType = 'day';
                }
                if(component.type =='date'){
                    component.condition.opr="等于";
                }
                components.push(component);
            })
            // console.log(components);
            store.dispatch({
                type: 'REPLACE_COMPINENTS',
                components: components
            });

            store.dispatch({
                type: 'CHANGE_SOURCE',
                source: source
            });
            store.dispatch({
                type: 'CHANGE_MODELDETAIL',
                modelDetail: modelDetail
            });
            if (rsp.data.modelName) {
                store.dispatch({
                    type: 'CHANGE_CARD_STYLE',
                    title: rsp.data.modelName,
                    describe: rsp.data.modelDesc
                });
            }

            defer.resolve();
        } else {
            Notify.simpleNotify('错误', rsp.message ||'数据加载失败', 'error');
        }

    }, 'json');
    return defer.promise;

}
module.exports.loadTree = loadTree;

function check() {
    let data = store.getState().data;
    let components = data.viewDetail.components;
    let title = [];
    let condId = [];
    _.each(components, function (item) {
        title = title.concat(item.condition.title);
        var field = item.condition.field;
        condId.push(field)
    });
    let position = _.findIndex(condId, function (item) {
        return _.isEmpty(item);
    });
    let tip = title[position]+'组件没有设置映射字段，无法保存';



    var nary=title.sort();

    let isRepeat = false;
    for(var i=0;i<title.length;i++){

        if (nary[i]==nary[i+1]){
            isRepeat = true
        }
    }

    let titlePosition = _.findIndex(title, function (item) {
        return _.isEmpty(item.trim());
    });

    if (_.contains(title, '')) {
        Notify.show({
            title: '组件名称没有设置，无法保存',
            type: "warning"
        });
        return false;
    }else if(titlePosition > -1){
        Notify.show({
            title: '组件名称为空，无法保存',
            type: "warning"
        });
        return false;
    }else if(isRepeat === true){
        Notify.show({
            title: '组件名称重复，无法保存',
            type: "warning"
        });
        return false;
    } else if (data.viewDetail.appName == '') {
        Notify.show({
            title: '应用名称没有设置，无法保存',
            type: "warning"
        });
        return false;
    } else if (condId[position] == '') {
        Notify.show({
            title: tip,
            type: "warning"
        });
        return false;
    } else if(components.length <=0){
        Notify.show({
            title: '没有设置组件，无法保存',
            type: "warning"
        });
        return false;
    } {
        return true;
    }
}

function updateApply() {
    if (check() == true) {
        updateApplyPost();
    }
}
function updateApplyPost() {
    var data = store.getState().data;
    var solidId = data.solidId || utils.getURLParameter('solidid');
    let viewDetail = {};
    $.extend(true, viewDetail, data.viewDetail);

    _.each(viewDetail.components , (item , key)=>{
        item.condition.hint = item.condition.hint.replace(/\n/g,'');
    });
    viewDetail.appDescribe = viewDetail.appDescribe.replace(/\n/g,'');

    $.post('/modelapply/modelapply/savemodelapply', {
        solidId: solidId,
        viewDetail: JSON.stringify(viewDetail),
        solidName: data.viewDetail.appName,
        solidComments: viewDetail.appDescribe
    }, function (rsp) {
        if (rsp.code == 0) {
            Notify.show({
                title: '提示',
                text: '模型固化保存成功',
                type: 'success'
            });
        } else {
            Notify.simpleNotify('错误', rsp.message ||'模型固化：保存失败 请先另存为', 'error');
        }
    }, 'json');

}
module.exports.updateApply = updateApply;


function saveApply(onSaved) {
    if (check() == true) {
        ModelapplySaver.showDialog(function (saveOpts) {
            modelSaveCfg = saveOpts;
            //console.log(modelSaveCfg);
            saveModelPost(modelSaveCfg, onSaved);
        });
    }
}

function saveModelPost(saveOpts, onSaved) {
    var data = store.getState().data;
    var solidId = data.solidId;
    let viewDetail = {};
    $.extend(true, viewDetail, data.viewDetail);

    _.each(viewDetail.components , (item , key)=>{
        item.condition.hint = item.condition.hint.replace(/\n/g,'');
    });
    viewDetail.appDescribe = viewDetail.appDescribe.replace(/\n/g,'');
    console.log(viewDetail)
    $.post('/modelapply/modelapply/savemodelapply', {
        solidId: _.isEmpty(solidId) ? undefined : solidId,
        solidName: saveOpts.modelName,
        solidComments: viewDetail.appDescribe,
        dirId: saveOpts.dirId,
        viewDetail: JSON.stringify(viewDetail),
        modelId: parseInt(data.viewDetail.modelId),
        modelDetail: JSON.stringify(data.modelDetail),
        conds: data.viewDetail.source
    }, function (rsp) {
        if (rsp.code == 0) {
            $('#btn-save-model').removeClass('hide');
            $('#btn-subApp').removeClass('disabled');
            solidId = rsp.data.solidId;
            console.log(solidId);
            store.dispatch({
                type: 'CHANGE_SOLIDID',
                solidId: solidId
            });
            if (_.isFunction(onSaved)) {
                onSaved(saveOpts);
            }
            Notify.show({
                title: '提示',
                text: '模型：' + saveOpts.modelName + '保存成功',
                type: 'success'
            });
        } else {
            Notify.simpleNotify('错误', rsp.message ||'模型固化：' + saveOpts.modelName + '保存失败', 'error');
        }
    }, 'json');
}

module.exports.saveApply = saveApply;


function openApply() {
    let defer = Q.defer();
    $.post('/modelapply/modelapply/openmodelapply', {
        solidId: utils.getURLParameter('solidid')
    }, function (rsp) {
        if (rsp.code == 0) {
            //console.log(rsp.data,Date.now());
            viewDetail = rsp.data.viewDetail;
            solidId = rsp.data.solidId;
            modelDetail = rsp.data.modelDetail;
            store.dispatch({
                type: 'CHANGE_VIEWDETAIL',
                viewDetail: viewDetail
            });
            store.dispatch({
                type: 'CHANGE_SOLIDID',
                solidId: solidId
            });
            store.dispatch({
                type: 'CHANGE_MODELDETAIL',
                modelDetail: modelDetail
            });
            defer.resolve();
        } else {
            Notify.simpleNotify('错误', rsp.message ||'模型固化：加载失败', 'error');
        }
    }, 'json');
    return defer.promise;

}
module.exports.openApply = openApply;


function subApply(onSub) {
    let data = store.getState().data;
    let components = data.viewDetail.components;
    let value = [];
    let title = [];
    _.each(components, function (item) {
        if (item.condition.isRequired == true) {
            value.push(item.condition.value);
            title = title.concat(item.condition.title);
        }
    })
    // console.log(value,title)
    let position = _.findIndex(value, function (item) {
        return item == '';
    });
    if (value[position] == '') {
        Notify.simpleNotify('错误', title[position] + '的必填项必须填写', 'error');
        return false;
    } else {
        ModelapplySub.subDialog(function (subOpts) {
            modelSubCfg = subOpts;
            submitValue(modelSubCfg, onSub);
        });
    }

}
module.exports.subApply = subApply;

function loadTaskInfo(taskId) {
    let defer = Q.defer();
    $.getJSON('/modelapply/modeling/taskinfo', {
        taskid: taskId
    }, function (rsp) {
        if (rsp.code == 0) {
            defer.resolve(rsp.data);
        } else {
            defer.reject(rsp.message);
        }
    });
    return defer.promise;
}

function _isRunningTask(taskInfo) {
    return taskInfo.taskState == 'running' || taskInfo.taskState == 'queue';
}

var pollingRetryCount;
var runningInfo;
const RETRY_LIMIT = 5;
function pollingRunningInfo(taskId) {
    // if (!taskId) {
    //     return;
    // }

    // switchToState(STATE.polling);

    loadTaskInfo(taskId).then(function (data) {
        // let changes = getTaskChanges(runningInfo ? runningInfo.nodes : null, data.nodes);
        runningInfo = data;

        // notifyTaskListener(runningInfo, changes);

        let stillRunning = _isRunningTask(runningInfo.mainTask);

        // let tooLong = Date.now() - pollingStartTime >= 30000;
        if (stillRunning) {
            // TODO yaco 联调阶段暂不处理
            // tooLong = false;
            // if (tooLong) {
            //     // switchToState(STATE.none);
            //     Notify.simpleNotify(window.i18n.t("warning.prompt"), window.i18n.t("warning.running-more-than-30-seconds"));
            // } else {
            setTimeout(() => pollingRunningInfo(taskId), 1000);
            // }
            return;
        }

        // switchToState(STATE.none);

        // notifyTaskResult(runningInfo.mainTask);

        pollingRetryCount = 0;
    }).catch(function (err) {
       if (pollingRetryCount <= RETRY_LIMIT) {
            pollingRetryCount++;
            setTimeout(() => pollingRunningInfo(taskId), 1000);
        } else {
            // switchToState(STATE.none);
            pollingRetryCount = 0;
            if (err) {
                Notify.simpleNotify(window.i18n.t("warning.error"), window.i18n.t("warning. task-information-acquisition-failed") + ':' + err, 'error');
            }
       }
    });
}

function submitValue(subOpts, onSub) {
    //var newWindow = window.open();
    var data = store.getState().data;
    var components = data.viewDetail.components;
    // console.log(data);
    /**valuesMap**/
    let value = [];
    let condId = [];
    let valueMap = _.map(components, (component) => {
        let semanticId, condIds, values;
        if (component.condition.value != '') {
            semanticId = component.identity;
            condIds = component.condition.field;
            switch (component.condition.timeType) {
                case 'day':
                    values = [JSON.stringify(component.condition.value[0] * 86400)];
                    break;
                case 'hour':
                    values = [JSON.stringify(component.condition.value[0] * 3600)];
                    break;
                case 'minute':
                    values = [JSON.stringify(component.condition.value[0] * 60)];
                    break;
                case 'second':
                    values = component.condition.value;
                    break;
                default:
                    values = component.condition.value;
            }
        }
        return {
            semanticId: semanticId,
            condIds: condIds,
            values: values
        }
    });

    /**outputColumnNameMapList**/
    let outputColumnNameMapList = [];
    _.each(data.nodes, function (item) {
        if (item.mapList) {
            outputColumnNameMapList.push({
                srcReplacedNodeId: item.nodeId,
                mapList: item.mapList,
                target: _.omit(item.mapTarget, 'outputColumnDescList')
            })
        }
    });
    console.log(outputColumnNameMapList);



    $.ajax({
        url:'/modelapply/modelapply/submitValues',
        type:'post',
        dataType:'json',
        async:true,
        data:{
            solidId: data.solidId,
            valuesMap: valueMap,
            name: subOpts.modelName,
            dirID: subOpts.dirId,
            description: subOpts.modelDesc,
            outputColumnNameMapList: outputColumnNameMapList
        },
        success: function(rsp){
            if (rsp.code == 0) {
                if (_.isFunction(onSub)) {
                    onSub(subOpts);
                }

                Notify.show({
                    title: '提示',
                    text: '提交成功',
                    type: 'success'
                });

                location.href ="/modelanalysis/modeling.html?taskid="+rsp.data;
                //window.location.href = "/analysis/modeling.html?taskid="+rsp.data;
                //setTimeout(function() {
                //    window.open("/analysis/modeling.html?taskid="+rsp.data);
                //},500);

                ///** 轮询进度100% */
                //showLoader();
                //let taskId = rsp.data;
                //let modelId = store.getState().data.viewDetail.modelId;
                //pollingRunningInfo(taskId);
                //window.open('/bireport/report-preview.html?modelid=' + modelId + '&taskid=' + taskId);
                //hideLoader();
            } else {
                Notify.simpleNotify('错误', rsp.message ||'任务提交失败', 'error');
            }
        }
    });


}
module.exports.submitValue = submitValue;

function getAllData() {
    let defer = Q.defer();
    let data = store.getState().data;
    let solidId = data.solidId;
    //console.log(solidId,data.modelDetail);
    $.post('/modelapply/modelapply/getAllData',
        !_.isEmpty(solidId) ? {solidId: solidId} : {modelDetail: JSON.stringify(data.modelDetail)}
        , function (rsp) {
            if (rsp.code == 0) {
                var nodes = rsp.data.nodes;
                _.each(nodes, function (item) {
                    item.isSelected = false;
                });
                //console.log(nodes);
                store.dispatch({
                    type: 'CHANGE_NODES',
                    nodes: nodes
                });
                defer.resolve();
            } else {
                Notify.simpleNotify('错误', rsp.message ||'数据源加载失败', 'error');
            }
        }, 'json');
    return defer.promise;
}
module.exports.getAllData = getAllData;

