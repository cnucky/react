/**
 * Created by root on 6/28/16.
 */

define([], function () {
    function setInitStat() {
        $("#oprlabel")[0].innerHTML = "无";
        $("#datapanel").hide();
        $("#btn-save-as").hide();
        $("#btn-edit-submit").hide();
        $("#btn-edit").hide();
        $("#btn-edit-new").hide();
        $("#btn-delete-row").hide();
        $("#btn-add-row").hide();
        $("#add-multiple-row").hide();
        //$("#btn-manual-create").removeAttr("disabled");
        $("#btn-fromfile-create").removeAttr("disabled");
    }

    function setReadOnlyStat() {
        $("#oprlabel")[0].innerHTML = "查看数据结构";
        $("#btn-save-as").hide();
        $("#btn-edit-submit").hide();
        $("#btn-edit").hide();
        $("#btn-edit").removeClass("btn-danger");
        $("#btn-edit").addClass("btn-primary");
        //$("#btn-edit").html("编辑");
        $("#btn-edit-new").hide();
        $("#btn-edit-new").html("编辑为新数据");
        $("#btn-delete-row").hide();
        $("#btn-add-row").hide();
        $("#add-multiple-row").hide();
        //$("#btn-manual-create").removeAttr("disabled");
        $("#btn-fromfile-create").removeAttr("disabled");
        $("#btn-add-folder").removeAttr("disabled");
        $("#btn-move").removeAttr("disabled");
        $("#btn-delete").removeAttr("disabled");
        $("#btn-reload-tree").removeAttr("disabled");
        $("#datapanel").show();
        $('#table-panel-footer').hide();
    }

    function removeSelectedStyle() {
        $(".trSelected .select2-selection,.trSelected .select2-selection__rendered").css({
            "background-color": "white",
            "border-color": "white"
        });
        $('#createDataTable tbody').find(".trSelected").removeClass("primary");
    }

    function addSelectedStyle() {
        $(".trSelected .select2-selection,.trSelected .select2-selection__rendered").css({
            "background-color": "#b6daf2",
            "border-color": "#b6daf2"
        });
        $('#createDataTable tbody').find(".trSelected").addClass("primary");
    }

    function removeErrorStyle() {
        //$(".trError .select2-selection,.trError .select2-selection__rendered").css({
        //    "background-color": "white",
        //    "border-color": "white"
        //});
        $('#createDataTable tbody').find(".trError").removeClass("danger");
    }

    function addErrorStyle() {
        //$(".trError .select2-selection,.trError .select2-selection__rendered").css({
        //    "background-color": "#b6daf2",
        //    "border-color": "#b6daf2"
        //});
        $('#createDataTable tbody').find(".trError").addClass("danger");
    }

    function removeSelectedStyleForPolicy() {
        $(".trSelected .select2-selection,.trSelected .select2-selection__rendered").css({
            "background-color": "white",
            "border-color": "white"
        });
        $('#partition-policy-table tbody').find(".trSelected").removeClass("primary");
    }

    function addSelectedStyleForPolicy() {
        $(".trSelected .select2-selection,.trSelected .select2-selection__rendered").css({
            "background-color": "#b6daf2",
            "border-color": "#b6daf2"
        });
        $('#partition-policy-table tbody').find(".trSelected").addClass("primary");
    }

    return {
        setInitStat: setInitStat,
        setReadOnlyStat: setReadOnlyStat,
        removeSelectedStyle: removeSelectedStyle,
        addSelectedStyle: addSelectedStyle,
        removeErrorStyle: removeErrorStyle,
        addErrorStyle: addErrorStyle,
        removeSelectedStyleForPolicy: removeSelectedStyleForPolicy,
        addSelectedStyleForPolicy: addSelectedStyleForPolicy
    }
});