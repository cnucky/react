const OPERATIONS = require('./operations');
const ReactDom = require('react-dom');
const Notify = require('nova-notify');
const BootBox = require('nova-bootbox-dialog');
const NovaUtils = require('nova-utils');
const loaders = require('utility/loaders');

const NodeManager = require('./modeling-toolbar-handler');

const DataSourceCond = require('./modeling-data-source');
const JoinCond = require('./modeling-join-condition');
const DataFilter = require('./modeling-filter-react');
const KMeansCond = require('./modeling-k-means');
const SVMCond = require('./modeling-svm');
const NaiveBayesCond = require('./modeling-naive-bayes');
const LogisticRegressionCond = require('./modeling-logistic-regression');
const LinearRegressionCond = require('./modeling-linear-regression');
const CollisionCond = require('./modeling-collision-condition-sup');
const ColExtraction = require('./modeling-column-extraction');
const FullTextIndex = require('./modeling-full-text-index');
const RecordExtraction = require('./modeling-record-extraction');
const ColumnTransform = require('./modeling-column-transform');
const GroupStatistics = require('./modeling-group-statistics');
const Merge = require('./modeling-merge');
const ProfessionAnalysis = require('./modeling-profession-analysis');
const Dereplication = require('./modeling-dereplication');

let tmpl = require('../../tpl/modeling/tpl-node-condition');
tmpl = _.template(tmpl);

const MAX_DEDUPLICATE = 5;

let $condContainer, nameViewer, nameEditor, conditionComponent, streamSaveContainer;
// origNode
let curNode, nodeSet, semanticDef, taskManager, operatorInfo;

function init(opts) {
    let container;
    ({ container, taskManager, semanticDef, nodeSet, operatorInfo } = opts);

    container.append(tmpl());

    $condContainer = $('#dynamic-cond-panel');
    streamSaveContainer = $('#stream-save-container');

    nameViewer = $('#node-name');
    nameEditor = $('#node-name-editor');
    $('#goto-name-edit').click(function() {
        if (curNode) {
            toggleEditView();
        }
    });
     $('#node-name').click(function() {
        if (curNode) {
            toggleEditView();
        }
    });
    $('#cancel-name-edit').click(function() {
        toggleEditView();

        nameEditor.val(curNode.title);
    });
    $('#save-name').click(function() {
        if (taskManager.checkTaskRunning(true)) {
            return;
        }
        toggleEditView();

        var newTitle = nameEditor.val().trim();

        var isRepeat = NodeManager.isRepeatName({
            name: newTitle,
            nodes: nodeSet,
            nodeId: curNode.nodeId
        });
        if (isRepeat) {
            Notify.show({
                title: window.i18n.t("toolbar-handler.duplicate-name"),
                type: "error"
            })
        } else if (!NovaUtils.checkValidName(newTitle)) {
            Notify.show({
                title: window.i18n.t("warning.model-name-contains-illegal-characters"),
                type: "error"
            })
        } else if (_.isEmpty(newTitle)) {
            Notify.show({
                title: window.i18n.t("warning.name-can-not-be-null"),
                type: "error"
            })
        } else {
            toggleEditView();

            curNode.name = curNode.title = newTitle;
            nameViewer.text(newTitle);

            NodeManager.updateNode(curNode);
        }
    });
    $('#node-name-editor').mouseout(function() {
        toggleEditView();
        if (!taskManager.isNodeEditable(curNode.nodeId,true)) {
            nameEditor.val(curNode.title);
            return;
        }

        var newTitle = nameEditor.val().trim();

        var isRepeat = NodeManager.isRepeatName({
            name: newTitle,
            nodes: nodeSet,
            nodeId: curNode.nodeId
        });
        if (isRepeat) {
            Notify.show({
                title: window.i18n.t("toolbar-handler.duplicate-name"),
                type: "error"
            })
        } else if (!NovaUtils.checkValidName(newTitle)) {
            Notify.show({
                title: window.i18n.t("warning.model-name-contains-illegal-characters"),
                type: "error"
            })
        } else if (_.isEmpty(newTitle)) {
            Notify.show({
                title: window.i18n.t("warning.name-can-not-be-null"),
                type: "error"
            })
        } else {
            curNode.name = curNode.title = newTitle;
            nameViewer.text(newTitle);

            NodeManager.updateNode(curNode);
        }
    });
    $('#btn-node-save').click(() => saveCondition());
    streamSaveContainer.find('#save-switch').change(event => {
        if (curNode) {
            if (taskManager.isNodeEditable(curNode, true)) {
                curNode.isSave = event.target.checked ? 1 : 0;
            } else {
                event.target.checked = !event.target.checked;
            }
        }
    });
    $(document).localize();
}

function initByNode() {
    reset();
    if (!curNode) {
        return;
    }

    nameViewer.text(curNode.name);
    nameEditor.val(curNode.name);
    if (curNode.taskType == OPERATIONS.DATA_SOURCE || curNode.mustSave) {
        streamSaveContainer.addClass('hide');
    } else {
        streamSaveContainer.removeClass('hide');
        streamSaveContainer.find('#save-switch').prop('checked', curNode.isSave);

        taskManager.setCurOperation(curNode);
    }

    let errMsg = taskManager.checkNodeCondition(curNode);
    if (errMsg) {
        $condContainer.append('<p class="text-muted text-center" style="margin-top: 50%; height: 100%;">' + errMsg + '</p>');
        return;
    }

    checkDetailUpdate();

    switch (curNode.taskType) {
        case OPERATIONS.DATA_SOURCE:
            conditionComponent = DataSourceCond;
            break;
        case OPERATIONS.INTERSECTION:
        case OPERATIONS.UNION:
        case OPERATIONS.DIFFERENCE:
            conditionComponent = CollisionCond;
            collisionSetup();
            return;
        case OPERATIONS.COL_EXTRACTION:
            conditionComponent = ColExtraction;
            columnExtractionSetup();
            return;
        case OPERATIONS.RECORD_EXTRACTION:
            conditionComponent = RecordExtraction;
            break;
        case OPERATIONS.FULL_TEXT_INDEX:
            conditionComponent = FullTextIndex;
            break;
        case OPERATIONS.FILTER:
            conditionComponent = DataFilter;
            break;
        case OPERATIONS.COLUMN_CONVERT:
            conditionComponent = ColumnTransform;
            break;
        case OPERATIONS.GROUP_STATISTICS:
            conditionComponent = GroupStatistics;
            break;
        case OPERATIONS.COMBINATION:
            conditionComponent = Merge;
            break;
        case OPERATIONS.JOINT:
            conditionComponent = JoinCond;
            break;
        case OPERATIONS.Dereplication:
            conditionComponent = Dereplication;
            break;
        case OPERATIONS.KMEANS_CLUSTER:
            conditionComponent = KMeansCond;
            break;
        case OPERATIONS.SVM:
            conditionComponent = SVMCond;
            break;
        case OPERATIONS.NAIVE_BAYES:
            conditionComponent = NaiveBayesCond;
            break;
        case OPERATIONS.LOGISTIC_REGRESSION:
            conditionComponent = LogisticRegressionCond;
            break;
        case OPERATIONS.LINEAR_REGRESSION:
            conditionComponent = LinearRegressionCond;
            break;
        case OPERATIONS.PROFESSION:
            conditionComponent = ProfessionAnalysis;
            break;
    }
    // default setup\
    if (conditionComponent) {
        conditionComponent.render($condContainer[0], getInputsAndOutput());
    }
}

function reset() {
    nameViewer.text('未指定');
    nameEditor.val('');
    if(conditionComponent){
        ReactDOM.unmountComponentAtNode($condContainer[0]);
        conditionComponent = null;
    }
    else{
        $condContainer.empty();
    }

    //$condContainer.empty();
}

function refresh() {
    if (curNode && !nodeSet.get(curNode.nodeId)) {
        curNode = null;
    }

    initByNode();
}

function setNode(node) {
    if (curNode && (node && node.nodeId != curNode.nodeId)) {
        // 后端返回的detail会进行补全,导致自动判断频繁调用
        saveCondition(true);
    }
    curNode = node;
    initByNode();
}

// 检查构建出的detail,如果有错误通过message字段返回
function createCondition() {
    if (!curNode || !conditionComponent) {
        return;
    }
    let result;
    try {
        result = conditionComponent.constructTaskDetail();
    } catch (ex) {
    }
    if (!result) {
        return {
            message: window.i18n.t("warning.an-error-has-occurred-inside-the-component")
        };
    } else if (result.detail) {
        let detailError = checkDetailError(result.detail);
        if (detailError) {
            result.message = detailError;
        }
    }
    return result;
}

function saveCondition(autoSave, onSaved) {
    // avoid curnode changed
    var origNode = curNode;

    if (!conditionComponent || !origNode || !taskManager.isNodeEditable(origNode.nodeId, !autoSave)) {
        _.isFunction(onSaved) && onSaved();
        return;
    }

    let result = createCondition();
    if (!result) {
        return;
    }
    if (result.message) {
        if (!autoSave) {
            Notify.simpleNotify(window.i18n.t("warning.setting-error"), result.message, 'warning');
        }
    } else if (result.detail) {
        // 对比之前设置的detailhash
        if (autoSave && origNode.detailHash && origNode.detailHash == NovaUtils.hash(result.detail) && taskManager.getOutputColumns(origNode.nodeId)) {
            _.isFunction(onSaved) && onSaved();
            return;
        }

        origNode.detail = _.extend({}, result.detail);
        let promise = taskManager.loadNodeOutput(origNode);
        if (promise) {
            promise.then(function() {
                _.isFunction(onSaved) && onSaved();
                Notify.simpleNotify(autoSave ? window.i18n.t("warning.save-automatically") : window.i18n.t("warning.save-settings"), window.i18n.t("warning.Node") + '"' + curNode.title + '"' + window.i18n.t("warning.is-saved-successfully"), 'success');
            }).catch(function(msg) {
                Notify.simpleNotify(autoSave ? window.i18n.t("warning.save-automatically") : window.i18n.t("warning.fail-to-save"), msg, 'error');
            });
        }
    }
}

function checkDetailUpdate() {
    if (taskManager.detailNeedUpdate(curNode.nodeId)) {
        var loader = loaders($('#dynamic-cond-panel'));
        var updatePromise = taskManager.updateDetailAndOutput(curNode.nodeId);
        if(updatePromise) {
            updatePromise.then(() => {
                refresh();
                Notify.simpleNotify(window.i18n.t("warning.node-update-successfully"), '', 'success');
            }).finally(loader.hide);
        } else {
            loader.hide();
        }
    }
}

function checkDetailError(detail) {
    let detailError, emptyColumn, invalidName, duplicateName, delduplicateNum;
    emptyColumn = getEmptyOutputName(detail);
    if (emptyColumn) {
        detailError = window.i18n.t("warning.output-field-name-can-not-be-null");
    } else {
        invalidName = getInvalidOutputName(detail)
    }
    if(invalidName) {
        detailError = window.i18n.t("warning.output-field-name") + '"' + invalidName + '"' + window.i18n.t("warning.contains-illegal-characters");
    } else {
        duplicateName = getDuplicateOutputName(detail);
    }

    if (duplicateName) {
        detailError = window.i18n.t("warning.there-is-a-duplicate-output-name") + '"' + duplicateName + '"';
    } else {
        delduplicateNum = detail.isDelDuplicate && _.size(detail.outputColumnDescList) > MAX_DEDUPLICATE;
    }
    if (delduplicateNum) {
        detailError = window.i18n.t("warning.output-field-can-not-exceed-when-duplicating", {maxNum: MAX_DEDUPLICATE});
    } else {
        //duplicateHint = getDuplicateHint(detail);
    }

    return detailError;
}

function curNodeId() {
    return curNode ? curNode.nodeId : null;
}

function getInputsAndOutput() {
    let output = null;
    if (curNode.detail) {
        output = $.extend(true, {}, curNode.detail);
    }
    return _.extend(taskManager.getInputs(curNode.nodeId), { output: output });
}

function columnExtractionSetup() {
    let data = {
        container: $condContainer[0],
        dataList: []
    };
    ColExtraction.columnExtraction(data);
}

function collisionSetup() {
    let inputData = getInputsAndOutput();
    CollisionCond.render($condContainer[0], semanticDef, curNode.taskType, inputData);
}

function onNodeChanged(nodeId) {
    if (curNode && nodeId == curNode.nodeId) {
        refresh();
    }
}

function onNameChanged(newName) {
    if (!curNode) {
        return;
    }
    curNode.name = newName;
    nameViewer.text(newName);
    $('#node-name-editor').val(newName);
}

function getDuplicateOutputName(detail) {
    let columnList = detail.outputColumnDescList;
    let column = _.find(columnList, prevColumn => {
        return _.find(columnList, postColumn => {
            return prevColumn != postColumn && prevColumn.displayName === postColumn.displayName
        })
    })
    return column && column.displayName
}

function getEmptyOutputName(detail) {
    let columnList = detail.outputColumnDescList
    let column = _.find(columnList, prevColumn => {
        return _.isEmpty(prevColumn.displayName);
    })
    return column;
}

function getInvalidOutputName(detail) {
    let columnList = detail.outputColumnDescList
    let column = _.find(columnList, prevColumn => {
        // 原字段名中可能存在斜线,如铁路客票数据的"购票/退票/改签车站"
        return !NovaUtils.checkValidName(prevColumn.displayName);
    })
    return column && column.displayName;
}

function toggleEditView() {
    $('#node-name-view').toggleClass('hide');
    $('#node-name-edit').toggleClass('hide');
}



module.exports = {
    init: init,
    refresh: refresh,
    onNameChanged: onNameChanged,
    curNodeId: curNodeId,
    setNode: setNode,
    createCondition: createCondition,
    saveCondition: saveCondition,
    onNodeChanged: onNodeChanged
};
