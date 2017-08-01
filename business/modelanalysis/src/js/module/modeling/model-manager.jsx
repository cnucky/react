/**
 * Created by yaco on 15-12-18.
 * manage model task nodes
 */
const NovaUtils = require('nova-utils');
const Notify = require('nova-notify');
const TaskSaver = require('../../widget/save-task');
const ModelSaver = require('./model-saver');
const moment = require('moment');
const FileHelper = require('utility/FileSaver/FileSaver');

const Q = require('q');
const NodeManager = require('./modeling-toolbar-handler');
const OPERATIONS = require('./operations');

const STATE = {
    none: 0,
    submitting: 1,
    saving: 2,
    polling: 3,
    finished: 4,
    preparing: 5
};

let curState = STATE.none;

function switchToState(newState) {
    curState = newState;
}

function isState(state) {
    return !_.isUndefined(curState) && curState == state;
}

/**
 * 保存当前的节点信息，以nodeId: node形式保存
 */
let taskNodesHolder = {};

let nodesOutputColumns = {}, detailInvalidNodes = {};
let loadingNodes = {};
let curNode, globalTaskId, runToNode;
let runningInfo, pollingStartTime;
let savedTaskConfigs = {}, savedModelConfigs = {};
let pausedNodes = [], runToTaskNodes = [];
let infoRequestTime = 0;

/**
 * 模型保存信息
 */
let modelId, modelSaveCfg, solidId;

// listen to task update of node
let taskUpdateListeners = [],
    onNodeChangeListener;
let taskInfoDefer;

/**
 * operatorsCfg包含各项的minInputNum，maxInputNum，outputNum
 */
let visNetwork, nodeSet, edgeSet, operatorTypes;

function init(network, nodes, edges, cfg) {
    visNetwork = network;
    nodeSet = nodes;
    edgeSet = edges;
    operatorTypes = cfg;

    nodeSet.on('add', function (event, properties) {
        _.each(properties.items, function (item) {
            let origNode = nodeSet.get(item).origNode;
            if (origNode) {
                taskNodesHolder[item] = origNode;
            }

            if (origNode.taskType == OPERATIONS.DATA_SOURCE && !nodesOutputColumns[item]) {
                origNode.detail.registeredTableName = '';
                getDataColDef(origNode, true, loadNodeOutput);
            }
        });
    });

    edgeSet.on('add', function (event, properties) {
        _.each(properties.items, function (item) {
            let edge = edgeSet.get(item);
            _nodeChangeNotify(edge.to, false).post();
        });
    });
}

function removeNode(id) {
    if (isNodeEditable(id, true)) {
        let post = _nodeChangeNotify(id).post;
        delete taskNodesHolder[id];
        delete nodesOutputColumns[id];

        onInputChanged(id);

        nodeSet.remove(id);
        post();
    }
}

function removeEdge(id) {
    let edge = edgeSet.get(id);
    if (isNodeEditable(edge.from, true) && isNodeEditable(edge.to, true)) {
        let post = _nodeChangeNotify(edge.to, false).post;

        onInputDisconnected(edge.to, edge.from);
        edgeSet.remove(id);
        post();
    }
}

function pauseOrNot(nodeId) {
    let index = pausedNodes.indexOf(nodeId);
    if (index > -1) {
        pausedNodes.splice(index, 1);
    } else {
        pausedNodes.push(nodeId);
    }
}

function mountTaskNode(inputId, operatorId) {
    let operatorNode = taskNodesHolder[operatorId];

    let cfg = operatorOfType(operatorNode.taskType);
    if (!cfg) {
        Notify.simpleNotify(window.i18n.t("warning.unable-to-connect"), operatorNode.title + window.i18n.t("warning.preset-message-is-incorrect"));
        return false;
    }
    if (operatorNode.mustSave && !nodeSet.get(inputId).origNode.isSave) {
        Notify.simpleNotify(window.i18n.t("warning.unable-to-connect"), window.i18n.t("warning.the-nodes-connect-to-must-save-middle-database", {nodeName: operatorNode.title}));
        return false;
    }
    if (operatorNode.taskType == OPERATIONS.FULL_TEXT_INDEX) {
        var inputNode = taskNodesHolder[inputId];
        if (inputNode.taskType != OPERATIONS.DATA_SOURCE) {
            //全文检索连接非数据源节点
            Notify.simpleNotify(window.i18n.t("warning.unable-to-connect"), window.i18n.t("warning.full-text-index-can-only-connect-to-data-source"));
            return false;
        } else if (inputNode.detail.category != 2) {
            //全文检索连接结构化数据源
            Notify.simpleNotify(window.i18n.t("warning.unable-to-connect"), window.i18n.t("warning.full-text-index-can-only-connect-to-structured-data-source"));
            return false;
        }
    }

    let maxNum = cfg.maxInputNum;
    let inputData = getInputs(operatorId);
    let paramsCount = _.size(inputData.inputIds);
    if (paramsCount >= maxNum) {
        Notify.simpleNotify(window.i18n.t("warning.unable-to-connect"), operatorNode.title + window.i18n.t("warning.supports-at-most-input-nodes", {maxNum: maxNum}));
        return false;
    }

    return true;
}

function getDataColDef(origNode, isFavor, onSuccess) {
    let dsDetail = origNode.detail;

    $.getJSON('/modelanalysis/modeling/getdatatypecoldef', {
        centercode: dsDetail.centerCode,
        zoneid: dsDetail.zoneId,
        typeid: dsDetail.typeId,
        iswithfavor: isFavor ? 1 : 0
    }, function (res) {
        if (res.code == 0) {
            _.extend(origNode.detail, res.data);

            _.isFunction(onSuccess) && onSuccess(origNode);
        }
    });
}

/**
 * 获取节点输出。上游任一节点的输出变化都会导致所有后序的输入失效
 * @param origNode
 * @param refresh
 * @param spread 是否向下继续调用
 * @returns {*}
 */
function loadNodeOutput(origNode, refresh = true, spread = false) {
    loadingNodes[origNode.nodeId] = 'loading';

    let isDsNode = origNode.taskType == OPERATIONS.DATA_SOURCE;
    let input, detail;
    detail = _.extend({}, origNode.detail);

    let defer = Q.defer();
    if (isDsNode) {
        _.isUndefined(detail.isWithFavor) && (detail.isWithFavor = 0);
    } else {
        // 输入中还有未更新detail的
        let hasDetailInvalid = false;
        input = _.map(getInputs(origNode.nodeId).inputIds, function (id) {
            hasDetailInvalid = hasDetailInvalid || !nodesOutputColumns[id] || detailInvalidNodes[id];
            return {
                srcNodeId: id,
                inputColumnDescList: nodesOutputColumns[id]
            };
        });

        if (hasDetailInvalid) {
            defer.reject(window.i18n.t("warning.input-nodes-have-some-undone-ones"));
        }
    }

    if (_.isUndefined(origNode.detail)) {
        defer.reject(window.i18n.t("warning.node-have-not-completed-settings", {title: origNode.title}));
        return defer.promise;
    }
    NodeManager.updateNodeBorder('default', origNode);
    // _resetNodeState(origNode);

    $.post('/modelanalysis/modeling/getnodeoutput', {
        srcDataTypes: input,
        nodeInfo: {
            nodeId: origNode.nodeId,
            isSave: origNode.isSave,
            maxIndex: origNode.maxIndex,
            staticInfo: origNode.staticInfo,
            taskType: origNode.taskType,
            detail: JSON.stringify(detail)
        }
    }, function (rsp) {
        delete loadingNodes[origNode.nodeId];

        if (rsp.code == 0) {
            if (isDsNode && _.isUndefined(origNode.detail.isWithFavor)) {
                rsp.data.detail.isWithFavor = 1;
                origNode.detail.isWithFavor = 1;
            }
            // 保证’自动保存‘前比较的都是前端constructDetail构造出的detail
            origNode.detailHash = NovaUtils.hash(origNode.detail);
            origNode.detail = rsp.data.detail;
            origNode.maxIndex = rsp.data.maxIndex;
            origNode.staticInfo = rsp.data.staticInfo;

            let oldOutputs = nodesOutputColumns[origNode.nodeId];
            nodesOutputColumns[origNode.nodeId] = rsp.data.outputColumnDescList;

            delete detailInvalidNodes[origNode.nodeId];

            NodeManager.updateNodeBorder('ready', origNode);

            if (refresh) {
                // 每一次loadNodeOutput结束时检查是否还有后序的无效节点
                if (!includeOldOutputs(nodesOutputColumns[origNode.nodeId], oldOutputs)) {
                    onInputChanged(origNode.nodeId, spread);
                } else if (spread) {
                    let nextNode = _firstInvalidFrom(origNode.nodeId);
                    if (!_.isArray(nextNode) || nextNode.length > 0) {
                        !_.isArray(nextNode) && (nextNode = [nextNode]);
                        _.each(nextNode, nid => {
                            detailInvalidNodes[nid] = true;
                            updateDetailAndOutput(nid, true);
                        });
                    }
                }

                _nodeChangeNotify(origNode.nodeId).post();
            }

            defer.resolve(rsp.data);
        } else {
            defer.reject(origNode + '：' + rsp.message);
        }
    }, 'json');
    return defer.promise;
}

function pollingRunningInfo() {
    if (!globalTaskId) {
        return;
    }

    switchToState(STATE.polling);

    taskInfoDefer = loadTaskInfo(globalTaskId);
    let promise = taskInfoDefer.promise;
    promise.then(function (data) {
        let changes = getTaskChanges(runningInfo ? runningInfo.nodes : null, data.nodes);
        runningInfo = data;

        notifyTaskListener(runningInfo, changes);

        let stillRunning = _isRunningTask(runningInfo.mainTask);

        let tooLong = Date.now() - pollingStartTime >= 30000;
        if (stillRunning) {
            // TODO yaco 联调阶段暂不处理
            tooLong = false;
            if (tooLong) {
                switchToState(STATE.none);
                Notify.simpleNotify(window.i18n.t("warning.prompt"), window.i18n.t("warning.running-more-than-30-seconds"));
            } else {
                setTimeout(pollingRunningInfo, 1000);
            }
            return;
        }

        switchToState(STATE.none);

        notifyTaskResult(runningInfo.mainTask);

        infoRequestTime = 0;
    }).catch(function (err) {
        if (err === 'aborted') {
            switchToState(STATE.none);
            infoRequestTime = 0;
            return;
        }
        infoRequestTime++;
        if (infoRequestTime < 10) {
            setTimeout(pollingRunningInfo, 1000);
        } else {
            switchToState(STATE.none);

            Notify.simpleNotify(window.i18n.t("warning.error"), window.i18n.t("warning. task-information-acquisition-failed") + ':' + err, 'error');
            infoRequestTime = 0;
        }
    });
}

function notifyTaskResult(mainTask) {
    let content = window.i18n.t("warning.the-task-end-run"),
        notifyType = 'success';
    switch (mainTask.taskState) {
        case 'cancelled':
            return;
        case 'error':
            content = window.i18n.t("warning.the-task-running-error");
            notifyType = 'error';
            break;
        case 'finished':
            content = window.i18n.t("warning.the-task-has-been-run-over");
            notifyType = 'success';
            break;
    }
    Notify.simpleNotify(window.i18n.t("warning.prompt"), content, notifyType);
}

function getTaskChanges(oldTasks, newTasks) {
    let changes = {};
    _.each(newTasks, function (newInfo) {
        if (oldTasks) {
            let oldInfo = _.find(oldTasks, function (taskInfo) {
                return newInfo.nodeId == taskInfo.nodeId;
            });

            if (!oldInfo || oldInfo.taskId != newInfo.taskId || oldInfo.taskState != newInfo.taskState
                || oldInfo.finishRatio != newInfo.finishRatio) {
                changes[newInfo.nodeId] = newInfo;
            }
        } else {
            changes[newInfo.nodeId] = newInfo;
        }
    });
    return changes;
}

function stopPollingInfo() {
    if (taskInfoDefer) {
        taskInfoDefer.reject('aborted');
    }
}

function startRunningInfo() {
    runningInfo = null;
    pollingStartTime = Date.now();

    pollingRunningInfo();
}

/**
 * 输入节点inputNodeId输出变化时，后序节点的输入及条件设置均需要重置
 * @param {String} inputNodeId
 */
function onInputChanged(inputNodeId, spread = false) {
    let effectedNodes = getDirectlyEffected(inputNodeId);

    _.each(effectedNodes, nodeId => {
        if (taskNodesHolder[nodeId] && nodesOutputColumns[nodeId]) {
            if (!detailInvalidNodes[nodeId]) {
                detailInvalidNodes[nodeId] = true;

                NodeManager.updateNodeBorder('error', taskNodesHolder[nodeId]);
            }

            // '执行到此处'的preparing的过程中,对于不在执行范围内的节点不做更新处理
            if (spread && !(isState(STATE.preparing) && runToNode && runToTaskNodes.indexOf(nodeId) == -1)) {
                updateDetailAndOutput(nodeId, spread);
            }
        }
    });
}

function onInputDisconnected(operatorId, inputId) {
    if (taskNodesHolder[operatorId] && nodesOutputColumns[operatorId] && !detailInvalidNodes[operatorId]) {
        detailInvalidNodes[operatorId] = true;

        NodeManager.updateNodeBorder('error', taskNodesHolder[operatorId]);
    }
}

/**
 * 获得因为inputNode的输出改变，会受到影响的后序节点
 * @param {String} inputNodeId 输入节点的id
 * @param {Array} result 已经保存的节点列表
 * @return {Array} 影响的后序节点
 */
function getDownstreamNodes(inputNodeId, result) {
    result = result || [];
    // 防止有环的存在
    let index = _.indexOf(result, inputNodeId);
    if (index > -1 && index != result.length - 1) {
        return result;
    }

    visNetwork.getConnectedEdges(inputNodeId).forEach(function (edgeId) {
        let edge = edgeSet.get(edgeId);
        if (edge.from == inputNodeId && result.indexOf(edge.to) == -1) {
            result.push(edge.to);
            getDownstreamNodes(edge.to, result);
        }
    });

    return result;
}

function getDirectlyEffected(nodeId) {
    let effectedNodes = [];
    _.each(visNetwork.getConnectedEdges(nodeId), edgeId => {
        let edge = edgeSet.get(edgeId);
        if (edge.from == nodeId && nodeSet.get(edge.to).origNode.detail) {
            effectedNodes.push(edge.to);
        }
    });
    return effectedNodes;
}

/**
 * 判断someArray是否包含items所有的项
 */
function includeOldOutputs(newOutput, oldOutput) {
    if (!oldOutput || oldOutput.length == 0) {
        return true;
    }
    if (newOutput.length < oldOutput.length) {
        return false;
    }
    return !_.find(oldOutput, oldColumn => !_.find(newOutput, newColumn => {
        return _.isEqual(newColumn, oldColumn);
    }));
}

function notifyTaskListener(fullTaskInfo, changedTasks) {
    _.each(taskUpdateListeners, function (listener) {
        listener(fullTaskInfo, changedTasks);
    });
}

function checkTaskRunning(notifyIfRunning) {
    let result;
    if (!runningInfo || _.isEmpty(runningInfo)) {
        result = false;
    } else {
        result = _isRunningTask(runningInfo.mainTask);
    }
    if (notifyIfRunning && result) {
        Notify.simpleNotify(window.i18n.t("warning.unable-operate"), window.i18n.t("warning.the-task-is-running"));
    }
    return result;
}

function makeStreamDetails(endNode) {
   /* if (endNode) {
        return _.map(runToTaskNodes, function (nodeId) {
            return makeNodeDetail(taskNodesHolder[nodeId]);
        });
    }*/
    return _.map(_.values(taskNodesHolder), function (node) {
        return makeNodeDetail(node);
    });
}

function makeNodeDetail(node) {
    return {
        nodeId: node.nodeId,
        title: node.title,
        taskType: node.taskType,
        isSave: node.isSave,
        detail: node.detail
    };
}

function operatorOfType(type) {
    return _.find(operatorTypes, function (cfg) {
        return cfg.nodeType == type;
    });
}

function checkNodeCondition(origNode) {
    if (origNode.taskType === OPERATIONS.DATA_SOURCE) {
        return nodesOutputColumns[origNode.nodeId] ? null : window.i18n.t("warning.input-nodes-have-not-completed-loading");
    }

    let cfg = operatorOfType(origNode.taskType);
    if (!cfg) {
        return window.i18n.t("warning.operation-preset-information-is-wrong");
    }

    let maxNum = cfg.maxInputNum;
    let minNum = cfg.minInputNum;
    let inputNodes = getInputs(origNode.nodeId).inputIds;
    if (!inputNodes || inputNodes.length < minNum) {
        return cfg.typeName + window.i18n.t("warning.supports-at-least-input-nodes", {minNum: minNum});
    } else if (inputNodes.length > maxNum) {
        return cfg.typeName + window.i18n.t("warning.supports-at-most-input-nodes", {maxNum: maxNum});
    } else {
        let loadingNode = _.find(inputNodes, function (id) {
            return loadingNodes[id];
        });
        if (loadingNode) {
            return window.i18n.t("warning.input-node-is-getting-output", {name: nodeSet.get(loadingNode).name});
        }
        let noOutputNode = _.find(inputNodes, function (id) {
            return !nodesOutputColumns[id];
        });
        if (noOutputNode) {
            return window.i18n.t("warning.input-node") + nodeSet.get(noOutputNode).name + window.i18n.t("warning.have-not-completed-initialization");
        }
    }
}

function loadTaskInfo(taskId) {
    let defer = Q.defer();
    $.getJSON('/modelanalysis/modeling/taskinfo', {
        taskid: taskId,
        runtonode: runToNode
    }, function (rsp) {
        if (rsp.code == 0) {
            defer.resolve(rsp.data);
        } else {
            defer.reject(rsp.data);
        }
    }, 'json');
    return defer;
}

function startTask(onSubmit, endNode) {
    submitTask(globalTaskId, onSubmit, endNode);
}

function resumeTask(onSubmit) {
    submitTask(globalTaskId, onSubmit, runToNode);
}

function restartTask(onSubmit, endNode) {
    submitTask(undefined, onSubmit, endNode);
}

function findInvalidNode(endNode) {
    if (endNode) {
        return _getInvalidUpstreamNode(endNode);
    }
    return _.findKey(taskNodesHolder, function (node) {
        return !nodesOutputColumns[node.nodeId] || detailInvalidNodes[node.nodeId];
    });
}

function _getInvalidUpstreamNode(leafNode) {
    if (!nodesOutputColumns[leafNode] || detailInvalidNodes[leafNode]) {
        return leafNode;
    } else {
        let inputIds = getInputs(leafNode).inputIds;
        return _.find(inputIds, function (nodeId) {
            return _getInvalidUpstreamNode(nodeId);
        });
    }
}

function _findTaskNodes(endNode) {
    runToTaskNodes = [endNode];

    _addInputNodes(endNode, runToTaskNodes);
}

function _addInputNodes(endNode, nodeList) {
    let origNode = nodeSet.get(endNode).origNode;
    if (origNode.taskType != OPERATIONS.DATA_SOURCE) {
        _.each(getInputs(endNode).inputIds, function (id) {
            nodeList.push(id);
            _addInputNodes(id, nodeList);
        });
    }
}

function hasNotSavedLeafNode(endNode) {
    if (endNode) {
        return !nodeSet.get(endNode).origNode.isSave;
    }
    let leafNodes = [];
    let notSavedLeafNodes = [];
    _.each(taskNodesHolder, function (node) {
        if (node.taskType == 0) {
            return;
        }
        // 找到所有叶节点
        let isLeaf = true;
        visNetwork.getConnectedEdges(node.nodeId).forEach(function (edgeId) {
            let edge = edgeSet.get(edgeId);
            if (edge.from == node.nodeId) {
                isLeaf = false;
            }
        });
        if (isLeaf) {
            leafNodes.push(node);
            node.isSave == 0 && notSavedLeafNodes.push(node);
        }
    });
    return notSavedLeafNodes.length > 0;
}

function submitTask(taskId, onSubmit, endNode) {
    if (!isSubmittable(endNode)) {
        return;
    }

    stopPollingInfo();
    runningInfo = null;

    runToNode = endNode;
    if (runToNode) {
        _findTaskNodes(runToNode);
    }

    let invalidTopNodes = _getInvalidTopNodes();
    if (invalidTopNodes.length > 0) {
        Notify.simpleNotify(window.i18n.t("warning.there-are-undone-nodes"));
        _prepareTaskNodes(invalidTopNodes).then(() => {
            Notify.simpleNotify(window.i18n.t("warning.the-node-preparation-is-complete"), window.i18n.t("warning.please-click-again-to-run"), 'success');
        }, (msg) => {
            Notify.simpleNotify(window.i18n.t("warning.the-node-preparation-is-failed"), msg, 'error');
        });
    } else {
        doSubmit(taskId, onSubmit, endNode);
    }
}

function doSubmit(taskId, onSubmit, endNode) {
    if (!taskId || !savedTaskConfigs[taskId]) {
        TaskSaver.buildSaveDialog(function (saveCfg) {

            submitTaskPost(taskId, saveCfg, endNode, function (data) {
                saveSnapshot();

                startRunningInfo();

                _.isFunction(onSubmit) && onSubmit(data, saveCfg);
            });
        });
    } else {
        submitTaskPost(taskId, savedTaskConfigs[taskId], endNode, function (data) {
            saveSnapshot();

            Notify.show({
                title: window.i18n.t("warning.prompt"),
                text: window.i18n.t("warning.submit-successfully"),
                type: 'success'
            });
            startRunningInfo();

            _.isFunction(onSubmit) && onSubmit(data, savedTaskConfigs[taskId]);
        });
    }
}

function submitTaskPost(taskId, taskConfig, endNode, onSubmit) {
    switchToState(STATE.submitting);

    $.post('/modelanalysis/modeling/submittask', {
        taskid: taskId,
        name: taskConfig.title,
        dirid: taskConfig.dirid,
        description: taskConfig.desc,
        taskdetail: {
            pauseNodes: pausedNodes,
            runToNode: endNode,
            streamTaskDetail: JSON.stringify(makeStreamDetails(endNode))
        }
    }, function (rsp) {
        switchToState(STATE.none);

        if (rsp.code == 0) {
            globalTaskId = rsp.data;

            savedTaskConfigs[globalTaskId] = taskConfig;

            _.isFunction(onSubmit) && onSubmit(rsp.data);
        } else {
            Notify.simpleNotify(window.i18n.t("warning.prompt"), window.i18n.t("warning.task-submit-failed") + (rsp.message ? ':' + rsp.message : ''), 'error');
        }
    }, 'json');
}

function stopTask(onPaused) {
    stopPollingInfo();

    $.post('/modelanalysis/modeling/pausetask', {
        taskid: globalTaskId
    }, function (rsp) {
        if (rsp.code == 0) {
            let changes = {};
            if (runningInfo) {
                runningInfo.mainTask.taskState = 'cancelled';
                _.each(runningInfo.nodes, function (taskInfo) {
                    if (_isRunningTask(taskInfo)) {
                        taskInfo.taskState = 'cancelled';
                    }
                    changes[taskInfo.nodeId] = taskInfo;
                });
                notifyTaskListener(runningInfo, changes);
            }

            Notify.show({
                title: window.i18n.t("warning.prompt"),
                text: window.i18n.t("warning.task-has-been-paused"),
                type: 'success'
            });

            _.isFunction(onPaused) && onPaused(rsp.data);
        }
    }, 'json');
}

function saveTask(params) {
    switchToState(STATE.saving);

    let defer = Q.defer();
    $.post('/modelanalysis/modeling/savetask', {
        taskid: globalTaskId,
        name: params.title,
        dirid: params.dirid,
        description: params.desc
    }, function (rsp) {
        switchToState(STATE.none);

        if (rsp.code == 0) {
            defer.resolve(rsp.data);
        } else {
            defer.reject(rsp.message);
        }
    }, 'json');
    return defer.promise;
}

/**
 *
 * 递归的检查所有节点的detail，‘执行到此处’时只检查子任务相关节点
 */
function _prepareTaskNodes(invalidTopNodes) {
    switchToState(STATE.preparing);

    var promises = [];
    let defer = Q.defer();
    _.each(invalidTopNodes, nodeId => {
        let pms;
        if (!nodesOutputColumns[nodeId]) {
            pms = loadNodeOutput(nodeSet.get(nodeId).origNode, true, true);
        } else if (detailInvalidNodes[nodeId]) {
            pms = updateDetailAndOutput(nodeId, true);
        }
        if (pms) {
            promises.push(pms);
        }
    });
    Q.all(promises).spread(function () {
        defer.resolve();
    }).catch(function (msg) {
        defer.reject(msg);
    }).finally(function () {
        switchToState(STATE.none);
    });
    return defer.promise;
}

/**
 * 找到outputInvalidNodes中位于最上层的
 */
function _getInvalidTopNodes() {
    let invalidTopNodes = [];
    let topNodes = nodeSet.getIds({
        filter: (node) => {
            return getInputs(node.id).inputIds.length == 0;
        }
    });
    // 找到以这些顶层节点后序的第一个无效节点，并且彼此不处于一条路径上
    _.each(topNodes, nodeId => {
        let anotherFirst = _firstInvalidFrom(nodeId);
        invalidTopNodes = _updateInvalidTopList(invalidTopNodes, anotherFirst);
    });
    if (runToNode) {
        let topNodes = [];
        // runToTaskNodes已按照树的层级排序,数组尾部为树的顶部
        _.each(invalidTopNodes, nid => {
            if (_whichOnTop(nid, runToNode) == nid) {
                topNodes.push(nid);
            }
        });
        invalidTopNodes = topNodes;
    }
    return invalidTopNodes;
}

/**
 * 如果是已记录的节点的后序节点，则抛弃，如果是已记录的节点的前序节点，则替换，否则，则直接添加
 */
function _updateInvalidTopList(list, invalidNodes) {
    if (!_.isArray(invalidNodes)) {
        invalidNodes = [invalidNodes];
    }
    let needAdd = true;
    _.each(invalidNodes, newNode => {
            let toRemoved = [];
            needAdd =  _.isUndefined(_.find(list, savedNode => {
                if (savedNode == newNode) {
                    return true;
                }
                let topNode = _whichOnTop(newNode, savedNode);
                if (topNode == savedNode) {
                    return true;
                } else if (topNode == newNode) {
                    toRemoved.push(savedNode);
                }
            }));
            if (needAdd) {
                if (toRemoved.length > 0) {
                    list = _.difference(list, toRemoved);
                }
                list.push(newNode);
            }
        }
    )
    return list;
}

/**
 * 如果两个点在同一路径上，返回路径上的处于较上层的那个节点，否则undefined
 */
function _whichOnTop(node1, node2) {
    let downstreamNodes = getDownstreamNodes(node1);
    if (downstreamNodes.indexOf(node2) > -1) {
        return node1;
    }
    downstreamNodes = getDownstreamNodes(node2);
    if (downstreamNodes.indexOf(node1) > -1) {
        return node2;
    }
}

/**
 * 从nodeId开始查找的第一个detail无效节点
 */
function _firstInvalidFrom(nodeId) {
    if (!nodesOutputColumns[nodeId] || detailInvalidNodes[nodeId]) {
        return nodeId;
    }
    let postNodes = _getConnectedNodes(nodeId, 2);

    let firstInvalid = [];
    _.each(postNodes, nid => {
        firstInvalid = _updateInvalidTopList(firstInvalid, _firstInvalidFrom(nid));
    });
    return firstInvalid;
}

function deleteTaskInfo(origNode) {
    let index = _.findIndex(runningInfo.nodes, function(taskInfo) {
        return taskInfo.nodeId == origNode.nodeId;
    });
    runningInfo.nodes.splice(index, 1);
    NodeManager.updateNode(origNode);

    let outputIds = _getConnectedNodes(origNode.nodeId, 2);
    _.each(outputIds, function(outputId) {
        let outputNode = nodeSet.get(outputId).origNode;
        deleteTaskInfo(outputNode);
    })
}

function getTaskInfo(nodeId) {
    if (!runningInfo) {
        return null;
    }
    if (nodeId) {
        return _.find(runningInfo.nodes, function (taskInfo) {
            return nodeId == taskInfo.nodeId;
        });
    } else {
        return runningInfo.mainTask;
    }
}

function isSubmittable(endNode) {
    if (!isState(STATE.none) && !isState(STATE.finished) || checkTaskRunning(false)) {
        Notify.simpleNotify(window.i18n.t("warning.unable-submit"), window.i18n.t("warning.existing-task-is-running"));
        return false;
    }
    // 至少有一个算子节点
    let operatorNode = _.find(taskNodesHolder, function (node) {
        return node.taskType != OPERATIONS.DATA_SOURCE;
    });
    if (!operatorNode) {
        Notify.simpleNotify(window.i18n.t("warning.unable-submit"), window.i18n.t("warning.is-not-a-valid-task"),'error');
        return false;
    }

    if (hasNotSavedLeafNode(endNode)) {
        Notify.simpleNotify(window.i18n.t("warning.unable-submit"), window.i18n.t("warning.please-set-final-node-to-save-middle-database"),'error');
        return false;
    }
    return true;
}

function setCurOperation(node) {
    curNode = node;
}

function watchTaskUpdate(listener) {
    taskUpdateListeners.push(listener);
}

function createSnapshot(taskId) {
    // without image
    visNetwork.storePositions();
    let nodes = nodeSet.get({
        fields: ['id', 'shape', 'name', 'borderWidth', 'borderWidthSelected',
            'color', 'shapeProperties', 'nodeType', 'origNode', 'isSave',
            'x', 'y', 'size', 'title'
        ]
    });
    // 将title的dom对象换为name
    _.each(nodes, node => {
        if (node.nodeType != OPERATIONS.DATA_SOURCE && _.isObject(node.title)) {
            node.title = node.name;
        }
    });
    let edges = edgeSet.get();

    let snapshot = {
        nodes: nodes,
        edges: edges,
        scale: visNetwork.getScale(),
        position: visNetwork.getViewPosition(),
        nodesOutput: nodesOutputColumns,
        detailInvalidNodes: detailInvalidNodes
    };
    if (taskId && savedTaskConfigs[taskId]) {
        snapshot.taskConfig = savedTaskConfigs[taskId];
    }

    return JSON.stringify(snapshot);
}

function loadFromSnapshot(snapshot) {
    _modelReset();

    globalTaskId = snapshot.analysisId;

    let network = JSON.parse(snapshot.graph);

    savedTaskConfigs[globalTaskId] = network.taskConfig;

    _addNetwork(network);

    pollingRunningInfo();
}

function loadFromSolid(id, model) {
    _modelReset();

    solidId = id;
    modelSaveCfg = {
        modelName: model.modelName,
        modelDesc: model.modelDesc,
        dirId: model.dirId
    };

    if (_.isEmpty(model.modelDetail)) {
        return;
    }
    let network = JSON.parse(model.modelDetail);
    _addNetwork(network);
}

function loadFromModel(id, model) {
    _modelReset();

    modelId = id;
    modelSaveCfg = {
        modelName: model.modelName,
        modelDesc: model.modelDesc,
        dirId: model.dirId
    };

    if (_.isEmpty(model.modelDetail)) {
        return;
    }

    let network = JSON.parse(model.modelDetail);
    _addNetwork(network);
}

function _addNetwork(network) {
    let nodeArray = network.nodes;
    nodesOutputColumns = network.nodesOutput || {};
    detailInvalidNodes = network.detailInvalidNodes || {};

    // 生成节点图片
    _.each(nodeArray, function (node) {
        NodeManager.createNodeImage({
            type: node.origNode.taskType,
            name: node.origNode.name
        }, function (img) {
            node.image = img.src;
            nodeSet.add(node);
        });
    });

    edgeSet.add(network.edges);

    if (network.position && network.scale) {
        // 强制刷新，避免chrome 54以下的版本出现位置漂移
        visNetwork.redraw();
        visNetwork.moveTo({scale: network.scale, position: network.position});
    }

}

function _modelReset() {
    switchToState(STATE.none);

    taskNodesHolder = {};
    loadingNodes = {};
    curNode = null;
    globalTaskId = undefined;
    runToNode = undefined;
    runToTaskNodes = [];
    pausedNodes = [];
    runningInfo = null;
    pollingStartTime = null;
    savedTaskConfigs = {};

    modelId = undefined;
    modelSaveCfg = null;

    nodeSet.clear();
    edgeSet.clear();
}

function saveSnapshot() {
    if (!globalTaskId) {
        Notify.simpleNotify(window.i18n.t("warning.prompt"), window.i18n.t("warning.unable-save-the-snapshot-before-submittion"), 'error');
        return;
    }
    $.post('/modelanalysis/modeling/savesnapshot', {
        taskid: globalTaskId,
        title: savedTaskConfigs[globalTaskId].title,
        remark: savedTaskConfigs[globalTaskId].desc,
        graph: createSnapshot(globalTaskId)
    }, function (rsp) {
        if (rsp.code != 0) {
            Notify.simpleNotify(window.i18n.t("warning.prompt"), window.i18n.t("warning.failed-to-save-the-snapshot"), 'error');
        }
    }, 'json');
}

function updateSolid() {
    if (_.isEmpty(taskNodesHolder)) {
        return;
    }

    updateSolidPost(solidId, modelSaveCfg)
}

function updateSolidPost(solidId, saveOpts) {
    $.post('/modelanalysis/modeling/updatesolid', {
        solidId: solidId,
        modelDetail: JSON.parse(createSnapshot())
    }, function (rsp) {
        if (rsp.code == 0) {
            Notify.show({
                title: window.i18n.t("warning.prompt"),
                text: window.i18n.t("warning.model") + '"' + saveOpts.modelName + '"' + window.i18n.t("warning.is-saved-successfully"),
                type: 'success'
            });
        } else {
            Notify.simpleNotify(window.i18n.t("warning.error"), rsp.message || window.i18n.t("warning.model") + '"' + saveOpts.modelName + '"' + window.i18n.t("warning.fail-to-save"), 'error');
        }
    }, 'json')
}

function updateModel() {
    if (_.isEmpty(taskNodesHolder)) {
        return;
    }
    updateModelPost(modelId, modelSaveCfg);
}


function updateModelPost(modelId, saveOpts) {
    $.getJSON('/modelanalysis/modeling/checkmodelpermission', {
        id: modelId
    }, function (rsp) {
        if (rsp.code == 0) {
            if (rsp.data == 1) {
                $.post('/modelanalysis/modeling/updatemodel', {
                    id: modelId,
                    detail: createSnapshot(),
                    name: saveOpts.modelName
                }, function (rsp) {
                    if (rsp.code == 0) {
                        modelId = rsp.data;
                        Notify.show({
                            title: window.i18n.t("warning.prompt"),
                            text: window.i18n.t("warning.model") + '"' + saveOpts.modelName + '"' + window.i18n.t("warning.is-saved-successfully"),
                            type: 'success'
                        });
                    } else {
                        Notify.simpleNotify(window.i18n.t("warning.error"), rsp.message || window.i18n.t("warning.model") + '"' + saveOpts.modelName + '"' + window.i18n.t("warning.fail-to-save"), 'error');
                    }
                }, 'json');
            } else {
                Notify.simpleNotify(window.i18n.t("warning.failure"), window.i18n.t("warning.you-have-not-modified-permission"));
            }
        } else {
            Notify.simpleNotify(window.i18n.t("warning.error"), window.i18n.t("warning.fail-to-check-permission-of-model"), 'error');
        }
    });
}

function saveModel(onSaved) {
    if (_.isEmpty(taskNodesHolder)) {
        return;
    }
    ModelSaver.showDialog(function (saveOpts) {
        modelSaveCfg = saveOpts;

        saveModelPost(modelSaveCfg, onSaved);
    });
}

function saveModelPost(saveOpts, onSaved) {
    $.post('/modelanalysis/modeling/savemodel', {
        id: 0,
        detail: createSnapshot(),
        name: saveOpts.modelName,
        desc: saveOpts.modelDesc,
        dirid: saveOpts.dirId
    }, function (rsp) {
        if (rsp.code == 0) {
            modelId = rsp.data;
            if (onSaved && _.isFunction(onSaved)) {
                onSaved(saveOpts);
            }
            Notify.show({
                title: window.i18n.t("warning.prompt"),
                text: window.i18n.t("warning.model") + saveOpts.modelName + window.i18n.t("warning.is-saved-successfully"),
                type: 'success'
            });
        } else {
            Notify.simpleNotify(window.i18n.t("warning.error"),  rsp.message || window.i18n.t("warning.model") + saveOpts.modelName + window.i18n.t("warning.fail-to-save"), 'error');
        }
    }, 'json');
}

function getOutputColumns(nodeId) {
    return nodesOutputColumns[nodeId] || [];
}

function getInputs(nodeId) {
    let inputIds = _getConnectedNodes(nodeId, 1);
    let input = _.map(inputIds, function (id) {
        let node = nodeSet.get(id).origNode;
        let outputColumnDescList = _.map(nodesOutputColumns[id], function (outputItem) {
            return _.extend({}, outputItem, {srcInput: id});
        });
        return _.extend({nodeId: id, title: node.name}, {
            detail: node.detail,
            outputColumnDescList: outputColumnDescList
        });
    });
    return {
        input: input,
        inputIds: inputIds
    };
}

function setNodeChangeListener(listener) {
    if (listener && _.isFunction(listener)) {
        onNodeChangeListener = listener;
    }
}

/**
 * 当node(nodeid)发生改变时
 * @param nodeId
 * @param action
 */
function _nodeChangeNotify(nodeId, notifyChildren = true) {
    let affectedIds = [nodeId];
    if (notifyChildren) {
        visNetwork.getConnectedEdges(nodeId).forEach((edgeId) => {
            let edge = edgeSet.get(edgeId);
            if (edge.from === nodeId) {
                affectedIds.push(edge.to);
            }
        });
    }
    return {
        post: () => {
            if (onNodeChangeListener) {
                affectedIds.forEach((id) => onNodeChangeListener(id));
            }
        }
    }

}

function isNodeEditable(nodeId, alert) {
    if (!runningInfo || !_isRunningTask(runningInfo.mainTask)) {
        return true;
    }

    let found = _.find(runningInfo.nodes, node => {
        return node.nodeId == nodeId;
    });
    if (found && alert) {
        Notify.simpleNotify(window.i18n.t("warning.invaid-operation"), window.i18n.t("warning.unable-set-for-the-running-node"));
    }
    return !found;
}

function _isRunningTask(taskInfo) {
    return taskInfo.taskState == 'running' || taskInfo.taskState == 'queue';
}

function exportModel() {
    if (_.isEmpty(taskNodesHolder)) {
        return;
    }

    let modelName = modelSaveCfg && modelSaveCfg.modelName || (savedTaskConfigs[globalTaskId] && savedTaskConfigs[globalTaskId].title);
    modelName = modelName || moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

    let data = _.extend({modelDetail: createSnapshot()}, modelSaveCfg, {modelType: 107});
    data = new Blob([JSON.stringify(data)], {type: 'application/json'});
    FileHelper.saveAs(data, modelName + '.mdl');
}

function importModel(onLoad) {
    let fileChooser = $('<input type="file" id="model-file-chooser" accept=".mdl"/>');
    fileChooser.change(event => {
        if (event.target.files.length == 0) {
            return;
        }
        let file = event.target.files[0];
        if (!/.*\.mdl$/.test(file.name)) {
            Notify.simpleNotify(window.i18n.t("warning.unable-open"), window.i18n.t("warning.please-choose-the-model-file-the-format-of-which-is-mdl"));
            return;
        }
        let fileReader = new FileReader();
        fileReader.onload = event => {
            let data = event.target.result;
            data = JSON.parse(data);
            loadFromModel(null, data);

            _.isFunction(onLoad) && onLoad(data);
        };
        fileReader.onerror = () => {

        };
        fileReader.readAsText(file);
    }).click();
    if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
        return;
    }
}

function replaceDataSource(nodeId, mapList, nodeData) {
    let defer = Q.defer();
    let children = visNetwork.getConnectedNodes(nodeId);
    let dsNode = nodeSet.get(nodeId);
    dsNode.origNode.detail = _.extend(dsNode.origNode.detail, nodeData);
    loadNodeOutput(dsNode.origNode, false).then(() => {
        if (!_.isEmpty(children)) {
            //TODO auto update children
            let childrenInfos = _.map(children, (id) => {
                let origNode = nodeSet.get(id).origNode;
                return {
                    nodeId: origNode.nodeId,
                    isSave: origNode.isSave,
                    taskType: origNode.taskType,
                    staticInfo: origNode.staticInfo,
                    detail: origNode.detail
                }
            })
            $.post('/modelanalysis/modeling/replacenodemapcolumns', {
                nodeid: nodeId,
                maplist: mapList,
                childrennodeinfo: JSON.stringify(childrenInfos)
            }, (rsp) => {
                if (rsp.code == 0) {
                    let newInfos = rsp.data.childrenNodeInfo;
                    _.each(newInfos, function (info) {
                        let node = nodeSet.get(info.nodeId);
                        node.origNode.detail = info.detail;
                        node.origNode.staticInfo = info.staticInfo;
                    })
                    defer.resolve(newInfos);
                } else {
                    defer.resolve();
                }
            }, 'json');
        } else {
            defer.resolve();
        }
    }).catch(() => {
        Notify.show({
            title: window.i18n.t("warning.replace-data-source-exception"),
            text: window.i18n.t("warning.please-try-to-save-data-source-manually"),
            type: 'error'
        });
        defer.resolve();
    })
    return defer.promise;
}

function detailNeedUpdate(nodeId) {
    return detailInvalidNodes[nodeId];
}

function updateDetailAndOutput(nodeId, spread = false) {
    let defer = Q.defer();
    let origNode = nodeSet.get(nodeId).origNode;
    let detailPromise = updateNodeDetail(origNode);
    if (detailPromise) {
        detailPromise.then(() => {
            if (!spread) {
                defer.resolve();
                return;
            }
            delete nodesOutputColumns[nodeId];
            let loadPromise = loadNodeOutput(origNode, true, spread);
            loadPromise && loadPromise.then(() => defer.resolve())
                .catch(() => defer.reject());
        }).catch((msg) => defer.reject(msg));
        return defer.promise;
    }
}

function updateNodeDetail(origNode) {
    if (nodesOutputColumns[origNode.nodeId] && !detailInvalidNodes[origNode.nodeId]) {
        return;
    }

    loadingNodes[origNode.nodeId] = 'loading';

    let isDsNode = origNode.taskType == OPERATIONS.DATA_SOURCE;
    let input, detail;
    detail = _.extend({}, origNode.detail);
    if (isDsNode) {
        _.isUndefined(detail.isWithFavor) && (detail.isWithFavor = 0);
    } else {
        input = _.map(getInputs(origNode.nodeId).input, function (item) {
            return {
                srcNodeId: item.nodeId,
                srcNodeName: item.title,
            inputColumnDescList: item.outputColumnDescList
        };
        });
    }

    let defer = Q.defer();
    $.post('/modelanalysis/modeling/updatenodedetail', {
        srcDataTypes: JSON.stringify(input),
        nodeInfo: {
            nodeId: origNode.nodeId,
            isSave: origNode.isSave,
            taskType: origNode.taskType,
            detail: JSON.stringify(detail)
        }
    }, function (rsp) {
        // 从loadingNodes删除
        delete loadingNodes[origNode.nodeId];

        if (rsp.code == 0) {
            delete detailInvalidNodes[origNode.nodeId];

            NodeManager.updateNodeBorder('default', taskNodesHolder[origNode.nodeId]);

            let newDetail = rsp.data.nodeInfo.detail;
            origNode.detailHash = NovaUtils.hash(newDetail);
            origNode.detail = newDetail;

            defer.resolve(rsp.data);
        } else {
            Notify.simpleNotify(window.i18n.t("warning.fail-to-update"), window.i18n.t("warning.Node") + '"' + origNode.name + '"' + window.i18n.t("warning.fail-when-updating") + rsp.message, 'warning');
            defer.reject(rsp.message);
        }
    }, 'json');
    return defer.promise;
}

/**
 * 获得相邻的上游或下游节点
 * @param {Integer} direction {1: '上游', 2: '下游'}
 */
function _getConnectedNodes(nodeId, direction) {
    var result = [];
    visNetwork.getConnectedEdges(nodeId).forEach(edgeId => {
        let edge = edgeSet.get(edgeId);
        let compare = direction == 1 ? edge.to : edge.from;
        let target = direction == 1 ? edge.from : edge.to;
        if (compare === nodeId) {
            result.push(target);
        }
    });
    return result;
}

function _resetNodeState(origNode) {
    if (!runningInfo) {
        return;
    }
    let index = _.findIndex(runningInfo.nodes, node => {
        return node.nodeId == origNode.nodeId;
    });
    if (index > -1) {
        runningInfo.nodes.splice(index, 1);
        NodeManager.updateNode(origNode);
    }
}

module.exports = {
    mountTaskNode: mountTaskNode,
    tasks: makeStreamDetails,
    pauseOrNot: pauseOrNot,
    init: init,
    removeNode: removeNode,
    removeEdge: removeEdge,
    loadNodeOutput: loadNodeOutput,
    checkNodeCondition: checkNodeCondition,
    getTaskInfo: getTaskInfo,
    startTask: startTask,
    stopTask: stopTask,
    resumeTask: resumeTask,
    restartTask: restartTask,
    setCurOperation: setCurOperation,
    watchTaskUpdate: watchTaskUpdate,
    checkTaskRunning: checkTaskRunning,
    saveSnapshot: saveSnapshot,
    loadFromSnapshot: loadFromSnapshot,
    loadFromModel: loadFromModel,
    loadFromSolid: loadFromSolid,
    getOutputColumns: getOutputColumns,
    saveModel: saveModel,
    updateModel: updateModel,
    updateSolid: updateSolid,
    getInputs: getInputs,
    operatorOfType: operatorOfType,
    setNodeChangeListener: setNodeChangeListener,
    isNodeEditable: isNodeEditable,
    exportModel: exportModel,
    importModel: importModel,
    replaceDataSource: replaceDataSource,
    updateDetailAndOutput: updateDetailAndOutput,
    detailNeedUpdate: detailNeedUpdate,
    nodeChangeNotify: function(nodeId) {
        _nodeChangeNotify(nodeId).post();
    },
    getModelId: function () {
        return modelId;
    },
    getTaskId: function () {
        return globalTaskId;
    }
};
