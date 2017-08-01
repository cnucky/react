var $ = require('jquery');
var _ = require('underscore');
var Dialog = require('nova-dialog');
var Notify = require('nova-notify');
var saveResult = require('./save-query-result');
var PersonalWorkTree = require('../../../../../../public/widget/personalworktree');
var NovaUtils = require('nova-utils');
var loader = require('utility/loaders');

function buildSaveDialog(callback) {
    var task = {};

    Dialog.build({
        title: "选择任务",
        maxHeight: '500px',
        minHeight: '300px',
        content: saveResult,
        rightBtnCallback: function() {

            var selectedDirectory = $('#save-position-picker').fancytree("getTree").getActiveNode();
            if (!_.isNull(selectedDirectory)) {
                task.taskid = selectedDirectory.data.typeId;
            } else {
                task.taskid = "";
            }

            if (!task.taskid) {
                Notify.simpleNotify("请选择任务");
            } else {
                // 回调到前面
                callback(task.taskid);
                Dialog.dismiss();

            }
        }
    }).show(function() {
        $('#save-position-picker').fancytree({
            selectMode: 2,
            clickFolderMode: 1,
            autoScroll: true,
            source: {
                url: '/bireport/bireport/getdatasource'
            },
            iconClass: function(event, data) {
                if (data.node.folder) {
                    return "fa fa-folder fa-fw";
                } else {
                    return "fa fa-gear fa-fw";
                }
            },
            postProcess: function(event, data) {
                if (data.response) {
                    data.result = data.response.data;
                }
            },

        });

    })
}

module.exports.buildSaveDialog = buildSaveDialog;