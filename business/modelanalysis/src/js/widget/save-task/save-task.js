var $ = require('jquery');
var _ = require('underscore');
var Dialog = require('nova-dialog');
var Notify = require('nova-notify');
var saveResult = require('./save-query-result');
var PersonalWorkTree = require('../../../../../../public/widget/personalworktree');
var NovaUtils = require('nova-utils');

function buildSaveDialog(callback) {
    var task = {};

    Dialog.build({
        title: "保存任务",
        content: saveResult,
        rightBtnCallback: function() {
            task.title = $("#title-input").val();
            task.title = $.trim(task.title);
            task.desc = $("#desc-input").val();

            var selectedDirectory = $('#save-position-picker').fancytree("getTree").getActiveNode();
            if (!_.isNull(selectedDirectory)) {
                task.dirid = selectedDirectory.key;
            } else {
                task.dirid = "";
            }

            if (_.isEmpty(task.title)) {
                Notify.simpleNotify("请输入任务名称")
            } else if(!NovaUtils.checkValidName(task.title)) {
                Notify.simpleNotify("名称中包含非法字符")
            } else if (_.isEmpty(task.dirid)) {
                Notify.simpleNotify("请选择保存位置");
            } else {
                // 回调到前面
                callback(task);
                Dialog.dismiss();
            }
        }
    }).show(function() {
        PersonalWorkTree.buildTree({
                container: $("#save-position-picker"),
                treeAreaFlag: 'saveTask'
            });
        /*$("#save-position-picker").fancytree({
    selectMode: 1,
    clickFolderMode: 1,
    checkbox: false,
    autoScroll: true,
    source: {
        url: "/taskcommon/listworkspacedir"
    },
    iconClass: function(event, data) {
        return "fa fa-folder";
    },
    postProcess: function(event, data) {
        if (data.response) {
            data.result = data.response.data;
        }
    }
})*/
    });
}

module.exports.buildSaveDialog = buildSaveDialog;