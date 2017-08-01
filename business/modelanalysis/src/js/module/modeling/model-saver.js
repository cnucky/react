var $ = require('jquery');
var _ = require('underscore');
var Alert = require('nova-alert');
var Dialog = require('nova-dialog');
var Notify = require('nova-notify');
var saveResult = require('../../tpl/modeling/tpl-model-saver');
var PersonalWorkTree = require('../../../../../../public/widget/personalworktree');
var NovaUtils = require('nova-utils');

var dialogInstance;

function showDialog(callback, preset) {
    var saveCfg = $.extend({}, preset);
    var numberRegExp = /^\d+$/;

    dialogInstance = dialogInstance || Dialog.build({
        title: window.i18n.t("save-model"),
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
                Notify.simpleNotify(window.i18n.t("warning.please-enter-model-name"));
            } else if(!NovaUtils.checkValidName(saveCfg.modelName)){
                Notify.simpleNotify(window.i18n.t("warning.model-name-contains-illegal-characters"));
            } else if (_.isEmpty(saveCfg.dirId)) {
                Notify.simpleNotify(window.i18n.t("warning.please-select-location-to-save-model"));
            } else {
                callback(saveCfg);
                Dialog.dismiss();
            }
        }
    });
    dialogInstance.show(function() {
        $('#name-input').val(saveCfg.modelName ? saveCfg.modelName : '');
        $('#desc-input').val(saveCfg.modelDesc ? saveCfg.modelDesc : '');

        PersonalWorkTree.buildTree({
            container: $("#save-position-picker"),
            treeAreaFlag: "saveModel"
        });

      /*  $('#save-position-picker').fancytree({
            selectMode: 1,
            clickFolderMode: 1,
            checkbox: false,
            autoScroll: true,
            source: {
                url: '/taskcommon/listworkspacedir'
            },
            iconClass: function(event, data) {
                return 'fa fa-folder';
            },
            postProcess: function(event, data) {
                if (data.response) {
                    data.result = data.response.data;
                }
            },
            init: function() {
                if (!_.isEmpty(saveCfg.dirid)) {
                    var node = $('#save-position-picker').fancytree('getNodeByKey', saveCfg.dirid);
                    node && node.setActive();
                }
            }
        });*/
    })
    $(document).localize();
}


module.exports.showDialog = showDialog;
