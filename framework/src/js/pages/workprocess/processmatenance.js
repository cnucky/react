require('i18n');
initLocales(require.context('../../../locales/workprocess', false, /\.js/));
require([
    'module/workprocess/utility',
    'module/workprocess/constants.js',
    'widget/dialog/nova-dialog',
    'widget/dialog/nova-notify',
    'widget/department-tree',
    'utility/select2/select2',
], function(utility, constants, dialog, notify, usertree) {
    var processdata, activationdata;
    render();
    function render() {
        hideLoader();
        $('[data-i18n]').localize();
        getProcessData(function(data) {
            initMenu(processdata);
        });
    }

    function getProcessData(callback) {
        $.getJSON("/workflow/FindProcessDefinitions", function(res, status) {
            if (!res || res.code != 0)
                return;
            var processInfos = {};
            res.data.forEach(function(item, idx) {
                if(!processInfos[item.strBusinessType])
                    processInfos[item.strBusinessType] = {
                        strBusinessType: item.strBusinessType,
                        strTypeName: item.strTypeName,
                        strVersionName: item.strVersionName,
                        data: []
                    };
                processInfos[item.strBusinessType].data.push({
                    strBusinessType: item.strBusinessType,
                    strTypeName: item.strTypeName,
                    strVersionName: item.strVersionName,
                    nVersion: item.nVersion,
                    strDeploymentId: item.strDeploymentId,
                    strProcessId: item.strProcessId,
                    bProcessStatus: item.bProcessStatus,
                    strDescription: item.strDescription,
                    strDeployTime: item.strDeployTime,
                    versionDesc: item.strVersionName + " " + item.nVersion + '(' + 
                        i18n.t('workprocess.processmatenance.' + (item.bProcessStatus ? 'activated' : 'suspended')) + ')',
                });
            });
            processdata = processInfos;
            callback(processInfos);
        });
    }

    function initMenu(data) {
        $('#spy-nav >.nav').empty();
        Object.keys(data).forEach(function(key) {
            $('#spy-nav .nav').append("<li><a data-toggle='tab' data-strBusinessType='" + data[key].strBusinessType + "'>" +
                "<span class='title'>" + data[key].strVersionName + "</span>" +
                "</a></li>");
        });
        $("#spy-nav .nav").on("click", "li", function() {
            $(this).siblings().removeClass('active');
            $(this).addClass('active');
            var type = $(this).children('a').data("strbusinesstype");
            initRightContent(type);
        });
        $('#spy-nav >.nav >li:eq(0)').trigger('click');
    }

    function initRightContent(type) {
        var versions = processdata[type].data.map(function(item) {
            return {
                id: item.strProcessId,
                text: item.versionDesc,
                value: item.strProcessId,
            };
        });
        $("#process-version-select").empty();
        versions.forEach(function(data){
            $("#process-version-select").append('<option value="' + data.id +'"> ' + data.text + '</option>');
        });
        $("#process-version-select").select2();
        var activated = processdata[type].data.find(function(i) {
            return i.bProcessStatus === true;
        });
        if (activated)
            $("#process-version-select").val(activated.strProcessId).trigger("change");
        $("#process-version-select").off('select2:select').on('select2:select', function() {
            var item = processdata[type].data.find(function(data){
                return data.strProcessId == $("#process-version-select").val();
            });
            initTable(item.strProcessId);
        });
        $("#process-version-select").trigger("select2:select");
        $("#process-activate").off('click').on("click", function(event, data){
            versionChanged(type);
        });
        $('#task-set').off('click').on("click", taskset);
    }
    function versionChanged(type) {
        var id = $("#process-version-select").val();
        utility.showLoader();
        $.post("/workflow/ActivateProcess", {
            processDefinitionId: id
        }, function(res) {
            utility.hideLoader();
            res = JSON.parse(res);
            if (res.code != 0)
                return notify.show({
                    title: i18n.t("workprocess.processmatenance.activeFail"),
                    text: res.message,
                    type: 'error',
                });
            notify.show({
                title: i18n.t("workprocess.processmatenance.activeSuccess"),
                type: 'success',
            });
            getProcessData(function(data) {
                initRightContent(type);
            });
        });
    }
    function taskset(event, data) {
        var data = getSelectedTask(), tree;
        if (data.length == 0)
            return notify.show({
                title: i18n.t("workprocess.processmatenance.noselectTaskTip"),
                type: 'error',
            });
        dialog.build({
            title: i18n.t("workprocess.processmatenance.tAssigneeSetting"),
            content: '<div id="tAssignee-form" style="height:400px;overflow-y:auto;margin:-15px;padding:15px;"></div>',
            style: "min-height:200px;",
            width: 500,
            leftBtnCallback: function() {
                $.magnificPopup.close();
            },
            rightBtnCallback: function() {
                var tAssignee = [];
                if(tree.getSelectedNodes().length == 0)
                    return notify.show({
                        title: i18n.t("workprocess.processmatenance.noselectAssigneeTip"),
                        type: 'error',
                    });
                _.each(tree.getSelectedNodes(), function(treeNode) {
                    tree.isUser(treeNode) && tAssignee.push({
                        strUserID: treeNode.data.userId,
                        strUserName: treeNode.data.userName,
                        nUserType: 0,
                    });
                });
                data.forEach(function(data) {
                    data.tAssignee = tAssignee;
                });
                utility.showLoader();
                $.post("/workflow/UpdateRelationInfo", {
                    item: data,
                }, function(res) {
                    utility.hideLoader();
                    res = JSON.parse(res);
                    if (res.code != 0)
                        return notify.show({
                            title: i18n.t("workprocess.processmatenance.setFail"),
                            text: res.message,
                            type: 'error',
                        });
                    notify.show({
                        title: i18n.t("workprocess.processmatenance.setSuccess"),
                        type: 'success',
                    });
                    $.magnificPopup.close();
                    $("#taskinfo-dt").dataTable().api().ajax.reload();
                });
            }
        }).show(function() {
            tree = usertree.build({
                container: $("#tAssignee-form"),
                expandAll: true,
                checkbox: true,
                source: { url: "/department/listallnoauth" },
                init: function(){
                    _.each(data, function(task) {
                        task.tAssignee.forEach(function(user) {
                            if(user.strUserID != "")
                            $("#tAssignee-form").fancytree("getTree").getNodeByKey(user.strUserID).setSelected(true);
                        });
                    });
                }
            });           
        });
    }

    function initTable(id) {
        var table = '<table class="table table-striped" id="taskinfo-dt" width="100%"></table>'
        $("#init-table").empty().append(table);
        $("#taskinfo-dt").DataTable({
            ordering: false,
            searching: false,
            processing: true,
            serverSide: true,
            paging: false,
            autoWidth: false,
            language: constants.dataTable,
            columns: [{
                title: '<input type="checkbox" id="task-table-checkall"/>',
                width: '50px',
                render: function(data, type, row, meta) {
                    return "<input type='checkbox' class='table-check'/>";
                },
            }, {
                width: '0px',
                data: null,
                render: function(data, type, row, meta) {
                    var cond = {};
                    cond.processId = id;
                    cond.strActId = row.strActId;
                    cond.bSetNextTask = row.bSetNextTask;
                    cond.tAssignee = row.tAssignee;
                    return "<a class='clue-title' data-information='" + JSON.stringify(cond) + "'></a>";
                }
            }, {
                title: i18n.t("workprocess.processmatenance.strActName"),
                data: 'strActName',
                width: '200px',
            }, {
                title: i18n.t("workprocess.processmatenance.tAssignee"),
                data: null,
                render: function(data, type, row, meta) {
                    var tAssignee = '';
                    if (row.tAssignee.length != 0)
                        _.each(row.tAssignee, function(data) {
                            tAssignee = tAssignee + ", " + data.strUserName;
                        });
                    return tAssignee.slice(1);
                }
            }],
            ajax: function(data, callback, setting) {
                var url = "/workflow/FindProcessDefinitionInfo?" + "processId=" + id;
                $.getJSON(url, function(res, status) {
                    if (!res || res.code != 0) {
                        callback({
                            draw: data.draw,
                            recordsTotal: 0,
                            recordsFiltered: 0,
                            data: [],
                        });
                        return;
                    }
                    callback({
                        draw: data.draw,
                        recordsTotal: res.data.length,
                        recordsFiltered: res.data.length,
                        data: res.data,
                    });
                });
            },
            drawCallback: function(setting) {
                utility.nowrap($("#taskinfo-dt"));
            },
        });
        $("#taskinfo-dt").on("change", "#task-table-checkall", function(event, data) {
            $("#taskinfo-dt .table-check").prop("checked", $(this).is(":checked"));
        });
    }

    function getSelectedTask() {
        var items = [];
        $(".table-check:checked").parent().next().children().each(function() {
            var data = $(this).data('information');
            items.push({
                strProcessId: data.processId,
                strActId: data.strActId,
                bSetNextTask: data.bSetNextTask,
                tAssignee: data.tAssignee,
            });
        })
        return items;
    }
});