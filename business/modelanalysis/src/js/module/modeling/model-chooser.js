var $ = require('jquery');
var Fancytree = require('fancytree-all');
var Dialog = require('nova-dialog');
var Notify = require('nova-notify');
var ModelingTree = require('../../widget/modelingtree');
var tplDialog = require('../../tpl/modeling/tpl-model-chooser');

function open(onChoosen) {
    Dialog.build({
        title: window.i18n.t("open-model"),
        content: tplDialog,
        minHeight: '400px',
        rightBtn: window.i18n.t("finish-btn"),
        leftBtn: window.i18n.t("cancel-btn"),
        rightBtnCallback: function() {
            var selectedModel = $('#model-tree-container').fancytree("getTree").getActiveNode();
            if (selectedModel) {
                var modelId = selectedModel.key;
                _.isFunction(onChoosen) && onChoosen(modelId);

                Dialog.dismiss();
            } else {
                Notify.simpleNotify(window.i18n.t("warning.no-model-is-selected"));
                return;
            }
        }
    }).show(function() {
        ModelingTree.buildTree({
            container: $("#model-tree-container"),
            treeAreaFlag: 'model-chooser',
            type:107 //建模分析模型subtype,-1为所有
        });

        var targetTree = $('#model-tree-container').fancytree('getTree');
        $("input[name=search-modeling]").keyup(function(event) {
            if (!targetTree) {
                return;
            }

            var count, opts = {
                autoExpand: true
            };
            var match = $(this).val();

            if (event && event.which === $.ui.keyCode.ESCAPE || $.trim(match) === "") {
                $("button#btn-modeling-reset").click();
                return;
            }
            count = targetTree.filterNodes(match, opts);

            $("button#btn-modeling-reset").attr("disabled", false);
            $("span#matches").text("(" + count + ")");
        });
        $("button#btn-modeling-reset").click(function() {
            if (!targetTree) {
                return;
            }

            $("input[name=search-modeling]").val("");
            $("span#matches").text("");
            targetTree.clearFilter();
            $(this).attr('disabled', 'true');
        });
    });
    $(document).localize();
}

module.exports.open = open;