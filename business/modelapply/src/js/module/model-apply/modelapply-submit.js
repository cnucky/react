var $ = require('jquery');
var _ = require('underscore');
var Alert = require('nova-alert');
var Dialog = require('nova-dialog');
var Notify = require('nova-notify');
var Result = require('../../tpl/modelapply/submit');
var PersonalWorkTree = require('../../../../../../public/widget/personalworktree');

function subDialog(callback, preset) {
    var subCfg = $.extend({}, preset);

    Dialog.build({
                title: '固化任务提交',
                content: Result,
                rightBtnCallback: function() {
                    subCfg.modelName = $('#name-input').val();
                    subCfg.modelDesc = $('#desc-input').val();

                    var selectedDirectory = $('#save-position-picker').fancytree('getTree').getActiveNode();
                    if (!_.isNull(selectedDirectory)) {
                        subCfg.dirId = selectedDirectory.key;
                    } else {
                        subCfg.dirId = '';
                    }

                    if (_.isEmpty(subCfg.modelName)) {
                        Notify.simpleNotify('请输入任务名称');
                    } else if (_.isEmpty(subCfg.dirId)) {
                        Notify.simpleNotify('请选择任务保存位置');
                    } else {
                        callback(subCfg);
                        Dialog.dismiss();
                    }
                }
    }).show(function() {
        $('#name-input').val(subCfg.modelName ? subCfg.modelName : '');
        $('#desc-input').val(subCfg.modelDesc ? subCfg.modelDesc : '');
    });
    PersonalWorkTree.buildTree({
        container: $("#save-position-picker"),
        treeAreaFlag: "saveTask"
    });
}


module.exports.subDialog = subDialog;
