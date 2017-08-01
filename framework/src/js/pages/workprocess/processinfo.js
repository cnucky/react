require('i18n');
initLocales(require.context('../../../locales/workprocess', false, /\.js/));
define([
        'module/tabledesign/api/table-runtime',
        'module/workprocess/process-operate.js',
        'module/workprocess/customcfg.js',
        'module/workprocess/utility',
        'module/workprocess/constants.js',
        'jquery',
        'widget/dialog/nova-alert',
        'widget/dialog/nova-dialog',
        'widget/dialog/nova-bootbox-dialog',
        'widget/dialog/nova-notify',
    ],
    function(processinfo, approval, customcfg, utility, constants, $, alert,  dialog, bootbox, notify) {
        var dialog = window.top.workprocessdialog || dialog;
        var bootbox = window.top.workprocessbootbox || bootbox;
        var notify = window.top.workprocessnotify || notify;
        var strTaskId = utility.parseQuery().strTaskId;
        var taskInfo;
        var processForm; 
        $.get("/workflow/getIssuesListById", {
            Ids: [strTaskId],
            start: 0,
            length: 1,
            queryType: 1,
        }, function(res){
            res = JSON.parse(res);
            if (!res || res.code != 0)
            return notify.show({
                title: i18n.t("workprocess.commontip.getTaskInfoFail"),
                type: 'danger',
            });
            taskInfo = res.data.taskList[0];
            taskInfo.moduleID = taskInfo.tProcessVariables[constants.processVariables.moduleID];
            taskInfo.recID = taskInfo.tProcessVariables[constants.processVariables.recID];
            taskInfo.tableID = taskInfo.tProcessVariables[constants.processVariables.tableID];
            taskInfo.businessVersion = taskInfo.tTaskVariables[constants.processVariables.dataVersion];
            Init();
        })
        

        function Init() {
            if (taskInfo.tableID && taskInfo.recID) {
                if(taskInfo.iFinishFlag == 2){
                    processForm = processinfo.buildTable({
                        container: $('#process-content'),
                        moduleId: 201,
                        tableId: parseInt(taskInfo.tableID),
                        recId: taskInfo.recID,
                        dialog: window.parent.workprocessdialog,
                        notify: window.parent.workprocessnotify,
                        dollar: window.parent.$,
                        versionId: taskInfo.businessVersion,
                        isTrans: true,
                        mode: {
                            editSubTable: false,
                            readOnly: true
                        }
                    });
                } else
                    processForm = processinfo.buildTable({
                        container: $('#process-content'),
                        moduleId: 201,
                        tableId: parseInt(taskInfo.tableID),
                        recId: taskInfo.recID,
                        dialog: window.parent.workprocessdialog,
                        notify: window.parent.workprocessnotify,
                        dollar: window.parent.$,
                        isTrans: true,
                        mode: {
                            editSubTable: false,
                            readOnly: false
                        }
                    });
            } else {
                $("#btn-flow-save").hide();
                $('#process-content').append(taskInfo.strBusinessInfo)
            }
            if (taskInfo.iFinishFlag == 1) {
                $("#btn-flow-delete").hide();
                $("#btn-flow-reset").hide();
                getTaskExtraInfo();
            } else {
                $("#btn-flow-save").hide();
                $("#btn-flow-comment").hide();
            }

            $(".panel-heading").on('click', '.btn-flow-outgoing', function(){
                var value = $(this).data('value');
                var name = $(this).text();
                    var opt = {
                        data: [{
                            recID:taskInfo.recID,
                            tableID:taskInfo.tableID,
                            taskID: taskInfo.strTaskID,
                            processID: taskInfo.strProcessInsID,
                            processType: taskInfo.strProcessType,
                        }],
                        result: value,
                        strResultDesc: name,
                        callback: function(fail, data) {
                            if (fail === false){
                                location.reload();
                                if(_.isFunction(window.top.workprocessnavrefresh))
                                    window.top.workprocessnavrefresh();
                            }
                        }
                    }
                    utility.showLoader();
                    approval.init(
                        window.top.$,
                        dialog,
                        notify,
                        bootbox
                    ).completeTask(opt);
            });
            
            $("#btn-flow-back").on('click', function() {
                history.go(-1);
            });

            $('#btn-flow-process').on('click', function() {
                dialog.build({
                    title: i18n.t("workprocess.operations.traceflow"),
                    content: '<div id="process" style="margin:-15px;"></div>',
                    style: "min-height:200px;",
                    width: 950,
                    hideHeader: true,
                    hideFooter: true,
                    leftBtnCallback: function() {
                        window.top.$.magnificPopup.close();
                    },
                    rightBtnCallback: function() {
                        window.top.$.magnificPopup.close();
                    }
                }).show(function() {
                    var cond ={
                        $container: window.top.$('#process'),
                        processType: taskInfo.strProcessType,
                        processID: taskInfo.strProcessInsID,
                    };
                    approval.rendTrace(cond);
                });
            });
            
            $("#btn-flow-save").on('click', function() {
                utility.showLoader();
                approval.save({
                    data: processForm.getData(), //表单数据
                    callback: function(code, data) {
                        if (code != 0)
                            return function() {
                                notify.show({
                                    title: i18n.t("workprocess.commontip.saveFail"),
                                    type: 'danger',
                                });
                            }
                        customcfg.init(function(){
                            var uri = customcfg.getOnSave(taskInfo);
                            if (uri)
                                $.post(uri, {
                                    formId:taskInfo.recID,
                                    tableType:parseInt(taskInfo.tableID),
                                    spyData:processForm.getData(),
                                }, function(response){
                                    response = JSON.parse(response);
                                    if(response.code != 0){
                                        utility.hideLoader();
                                        notify.show({
                                            title: i18n.t("workprocess.commontip.saveFail"),
                                            type: 'danger',
                                        });
                                    }
                                    else{
                                        utility.hideLoader();
                                        notify.show({
                                            title: i18n.t("workprocess.commontip.saveSuccess"),
                                            type: 'success',
                                        });
                                    }
                                });
                            else {
                                utility.hideLoader();
                                notify.show({
                                    title: i18n.t("workprocess.commontip.saveSuccess"),
                                    type: 'success',
                                });
                            }
                        });
                    }
                });
            });

            $("#btn-flow-delete").on('click', function() {
                bootbox.confirm(i18n.t("workprocess.commontip.tipdeleteconfirm"), function(result) {
                    if(result == false) return
                    $.post("/workflow/deleteHisTask", {
                        strTaskIDs: [taskInfo.strTaskID]
                    }, function(rsp) {
                        if (rsp.code == 0) {
                            notify.show({
                                title: i18n.t("workprocess.commontip.delsuccess"),
                                type: 'success',
                            });
                            history.go(-1);
                        } else {
                            notify.show({
                                title: i18n.t("workprocess.commontip.delfail"),
                                type: 'danger',
                            });
                        }
                    }, 'json');
                });
            });

            $("#btn-flow-reset").on('click', function() {
                approval.init(
                    window.top.$,
                    dialog,
                    notify,
                    bootbox
                ).recallTask(taskInfo.strProcessInsID, taskInfo.strTaskID, taskInfo.strActID, function(code){
                    if(_.isFunction(window.top.workprocessnavrefresh))
                        window.top.workprocessnavrefresh();
                });
            })
        }

        function getTaskExtraInfo() {
            var tpl = '<a class="btn btn-success btn-sm ml10 btn-flow-outgoing" data-value="<%= value %>">' +
                '<span class="glyphicons <%= iconClass %> pr5"></span>' +
                '<span"><%= labelName %></span>' +
                '</a>';
            tpl = _.template(tpl);
            var spanClassConfig = {
                "-1": "glyphicons-remove_2", //审批不通过的class图标
                "1": "glyphicons-ok_2", //审批通过的class图标
                "2": "glyphicons-refresh" //回退的class图标
            }
            $.get("/workflow/getTaskExtraInfo", {
                strActId: taskInfo.strActID,
                strTaskId: taskInfo.strTaskID,
                strProcessInsId: taskInfo.strProcessInsID
            }).done(function(res) {
                res = JSON.parse(res)
                if (res.code != 0)
                    return
                _.each(res.data[0].outgoing, function(item) {
                    $("#btn-flow-group").append(tpl({
                        labelName: item.key,
                        iconClass: spanClassConfig[item.value],
                        value: item.value
                    }));
                });
                if(!res.data[0].preComment.length)
                    return;
                $("#btn-flow-comment").removeClass("hidden");
                $("#btn-flow-comment").on("click", function() {
                    var suggest = _.map(res.data[0].preComment, function(comment) {
                        return comment.strUserName + ": " + comment.strComment + ";"
                    }).join("</br>") || "";
                    if($("#alertInfo").length == 0 ){
                        alert.show({
                            container: $("#alert-content"),
                            alertid: "alertInfo",
                            alertclass: "alert-suggest",
                            content: suggest,
                        })
                    }else{
                        $("#alert-content").empty();
                    }
                });
                $("#btn-flow-comment").trigger('click');
                
            })
        }
    });
