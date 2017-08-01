var $ = require('jquery');
var _ = require('underscore');
var Alert = require('nova-alert');
var Dialog = require('nova-dialog');
var Notify = require('nova-notify');
var saveResult = require('../../tpl/modelapply/tpl-model-saver');
var PersonalWorkTree = require('../../../../../../public/widget/personalworktree');
var store = require('./model-apply-store');

function showDialog(callback, preset) {
    var saveCfg = $.extend({}, preset);

    Dialog.build({
                title: '模型固化保存',
                content: saveResult,
                rightBtnCallback: function() {
                    saveCfg.modelName = $('#name-input').val();
                    saveCfg.modelDesc = $('#desc-input').val();

                    var selectedDirectory = $('#save-position-picker').fancytree('getTree').getActiveNode();
                    if (!_.isNull(selectedDirectory)) {
                        saveCfg.dirId = selectedDirectory.key;
                    } else {
                        saveCfg.dirId = '';
                    }

                    if (_.isEmpty(saveCfg.modelName)) {
                        Notify.simpleNotify('请输入模型名称');
                    }  else if (_.isEmpty(saveCfg.dirId)) {
                        Notify.simpleNotify('请选择模型保存位置');
                    } else {
                        callback(saveCfg);
                        Dialog.dismiss();
                    }
                }
    }).show(function() {
        var data=store.getState().data;
        var appName= data.viewDetail.appName;
        var appDescribe= data.viewDetail.appDescribe;
        $('#name-input').val(saveCfg.modelName ? saveCfg.modelName : appName);
        $('#desc-input').val(saveCfg.modelDesc ? saveCfg.modelDesc : appDescribe);

        PersonalWorkTree.buildTree({
            container: $("#save-position-picker"),
            treeAreaFlag: "saveModel"
        });
    });

}


module.exports.showDialog = showDialog;
