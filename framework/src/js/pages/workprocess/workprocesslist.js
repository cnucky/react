require('i18n');
initLocales(require.context('../../../locales/workprocess', false, /\.js/));
require([
    'module/workprocess/process-operate.js',
    'module/workprocess/customcfg.js',
    'module/workprocess/utility',
    'module/workprocess/constants.js',
    'widget/dialog/nova-dialog',
    'widget/dialog/nova-bootbox-dialog',
    'widget/dialog/nova-notify',
    'widget/dialog/nova-alert'
], function(approval, customcfg, utility, constants, dialog, bootbox, notify, alert) {
    
    dialog = window.top.workprocessdialog || dialog;
    bootbox = window.top.workprocessbootbox || bootbox;
    notify = window.top.workprocessnotify || notify;
    
    var _opts = {
        "param": utility.parseQuery()
    }
    initBtn();
    initTable();

    function initBtn() {

        if (_opts.param.queryType == 1) {
            $("#showHistory").prop("checked", false);
        }
        // 查询功能  查询全部  查询未审批事项  查询已审批事项
        $("#showHistory").on("change", function() {
            location.search = "?" + query();
        });
        $("#btn-refresh").on("click", function() {
            location.reload();
        });
        $("#flow-delete").on("click", function() {
            var items = []
            var deleteItem = getSelectedItems().history;
            if (deleteItem.length == 0) {
                notify.show({
                    text: i18n.t("workprocess.workprocesslist.selectApprovalTip"),
                    type: "error",
                });
                $("#spyflow-table input[type=checkbox]").prop("checked", false);
                $("#spyflow-table tr").removeClass("tr-selected");
                return
            }
            _.each(deleteItem, function(item) {
                items.push(item.strTaskID);
            });
            $.post('/workflow/deleteHisTask', {
                strTaskIDs: items
            }).done(function(res) {
                var res = JSON.parse(res)
                if (res.code == 0) {
                    notify.show({
                        text: i18n.t("workprocess.commontip.delsuccess"),
                        type: "success",
                    });
                    var page = getHashPage();
                    $("#spyflow-table").DataTable().page(page).draw(false);
                    $("#spyflow-table input[type=checkbox]").prop("checked", false);
                    $("#spyflow-table tr").removeClass("tr-selected");
                } else {
                    notify.show({
                        text: i18n.t("workprocess.commontip.delfail"),
                        type: "error",
                    });
                    $("#spyflow-table input[type=checkbox]").prop("checked", false)
                }
            })
        })
        $('.topbar-left').on('click', '.btn-flow-outgoing', function(e){
            approveOperate($(this).data('value'), $(this).text());
        });
    }

    function initTable() {
        var tableInited = false,
            needAdjust = false;
        $(window).bind('hashchange', function() {
            if (!tableInited)
                return;
            var page = getHashPage();
            if ($("#spyflow-table").dataTable().api().page.info().page != page)
                $("#spyflow-table").dataTable().api().page(page).draw(false);
        });
        $("#spyflow-table").dataTable({
            ordering: false,
            searching: false,
            processing: true,
            serverSide: true,
            pageLength: 15,
            lengthChange: false,
            autoWidth: false,
            language: {
                "sProcessing": i18n.t("workprocess.datatable.sProcessing"),
                "sLengthMenu": i18n.t("workprocess.datatable.sLengthMenu"),
                "sZeroRecords": i18n.t("workprocess.datatable.sZeroRecords"),
                "sInfo": i18n.t("workprocess.datatable.sInfo"),
                "sInfoEmpty": i18n.t("workprocess.datatable.sInfoEmpty"),
                "sInfoFiltered": i18n.t("workprocess.datatable.sInfoFiltered"),
                "sInfoPostFix": i18n.t("workprocess.datatable.sInfoPostFix"),
                "sSearch": i18n.t("workprocess.datatable.sSearch"),
                "sUrl": i18n.t("workprocess.datatable.sUrl"),
                "sEmptyTable": i18n.t("workprocess.datatable.sEmptyTable"),
                "sLoadingRecords": i18n.t("workprocess.datatable.sLoadingRecords"),
                "sInfoThousands": i18n.t("workprocess.datatable.sInfoThousands"),
                "oPaginate": {
                    "sFirst": i18n.t("workprocess.datatable.oPaginate.sFirst"),
                    "sPrevious": i18n.t("workprocess.datatable.oPaginate.sPrevious"),
                    "sNext": i18n.t("workprocess.datatable.oPaginate.sNext"),
                    "sLast": i18n.t("workprocess.datatable.oPaginate.sLast"),
                },
                "oAria": {
                    "sSortAscending": i18n.t("workprocess.datatable.oAria.sSortAscending"),
                    "sSortDescending": i18n.t("workprocess.datatable.oAria.sSortDescending"),
                }
            },
            columns: [{
                title: '<input type="checkbox" id="spyflow-table-checkall"/>',
                width: "2%",
                render: function(data, type, row, meta) {
                    return "<input type='checkbox' class='table-check' style=\"cursor:pointer;\" data-type='" + row.strProcessType + "' data-status='" + row.strProcessStatus + "' data-businessid='" + row.strBusinessID + "' data-processid='" + row.strProcessInsID + "' data-taskid='" + row.strTaskID + "'/>";
                },
            }, {
                title: '',
                width: "5%",
                render: function(data, type, row, meta) {
                    return row.iFinishFlag == 1 ? '<span class="font-spymgr icon-mail unread">' : (row.iStreamFinishFlag == 2 ? '<span class="octicon octicon-checklist" style="color:lightgray;font-size:21px;">' : '<span class="font-spymgr icon-mailopen readed">');
                },
            }, {
                title: i18n.t("workprocess.workprocesslist.submiter"),
                width: "8%",
                render: function(data, type, row, meta) {
                    return row.tPreviousUser.map(function(i){ return i.strUserName ;}).join(', ');
                }
            }, {
                title: i18n.t("workprocess.workprocesslist.abstract"),
                width: "40%",
                render: function(data, type, row, meta) {
                    return "<a style='cursor:pointer;' class='workflow-detail' data-taskid='" + row.strTaskID + "'>" + row.strBusinessInfo + "</a>";
                }
            }, {
                title: i18n.t("workprocess.workprocesslist.submittime"),
                width: "15%",
                render: function(data, type, row, meta) {
                    return row.strCreateTime;
                }
            }, {
                title: i18n.t("workprocess.workprocesslist.actName"),
                width: "10%",
                render: function(data, type, row, meta) {
                    return "<span><a style='cursor:pointer;' class='processState' data-strProcessInsID='" + row.strProcessInsID + "' data-strProcessType='" + row.strProcessType + "'>" + row.strTaskName + "</a></span>"
                },
            }, {
                title: i18n.t("workprocess.workprocesslist.sponsor"),
                width: "10%",
                render: function(data, type, row, meta) {
                    return row.tStartUser.strUserName //"<span>" + "qizc" + "</span>"; //.strUserName
                }

            }, {
                title: i18n.t("workprocess.workprocesslist.associatedData"),
                width: "10%",
                render: function(data, type, row, meta) {
                    return row.tProcessVariables.associatedDataURL ? "<a style='cursor:pointer;' href='" + row.tProcessVariables.associatedDataURL + "' target='_blank'>" + row.tProcessVariables.associatedDataTitle + "</a>" : '';
                }
            }],
            ajax: function(data, callback, setting) {
                var cond = location.search.slice(1);
                var url, postData = {
                    start: data.start,
                    length: data.length
                };
                if(!!_opts.param.Ids){
                    url = "/workflow/getIssuesListById?";
                    postData.Ids = _opts.param.Ids.split(',');
                    postData.queryType = _opts.param.queryType || ($("#showHistory").is(":checked") ? 3 : 1);
                } else {
                    url = "/workflow/getIssuesListByType?" + query();
                }
                $.ajax({
                    url: url,
                    type: "GET",
                    cache: false,
                    dataType: "json",
                    data: postData,
                    success: function(res, status){
                        if (!res || res.code != 0){
                            callback({
                                draw: data.draw,
                                recordsTotal: 0,
                                recordsFiltered: 0,
                                data: {}
                            });
                            return notify.show({
                                title: i18n.t("workprocess.commontip.gettypelistFail"),
                                type: "error"
                            })
                        }
                         if (!tableInited) {
                             var page = getHashPage();
                             if ($("#spyflow-table").dataTable().api().page.info().page != page)
                                 res.data.forms = [];
                        }
                        if((data.start >= res.data.totalCount)&&(res.data.totalCount!=0)){
                                $("#spyflow-table").DataTable().page(0).draw(false);
                            }
                         _opts.flowlist = res.data.taskList;
                        callback({
                             draw: data.draw,
                             recordsTotal:res.data.totalCount,
                             recordsFiltered:res.data.totalCount,
                             data: _opts.flowlist
                        });

                    }
                })
            },
            initComplete: function(setting, json) {
                setTimeout(function() {
                    var page = getHashPage();
                    var table = $("#spyflow-table").dataTable();
                    if (table.api().page.info().page != page) {
                        table.api().page(page).draw(false);
                        needAdjust = true;
                    }
                    tableInited = true;
                }, 0);
            },
            drawCallback: function(setting) {
                $("#spyflow-table_paginate > .pagination > li").on("click", function() {
                    code = location.hash = parseInt($("#spyflow-table").dataTable().api().page.info().page);
                });
                $("#spyflow-table").find("td").css({
                    "overflow": "hidden",
                    "white-space": "nowrap",
                    "text-overflow": "ellipsis"
                });
                $('.btn-flow-outgoing').remove();
                utility.nowrap($("#spyflow-table"));
                if(_.isFunction(window.parent.workprocessnavrefresh))
                    window.parent.workprocessnavrefresh();
            }
        });
        $("#spyflow-table").on("click", "#spyflow-table-checkall", function() {
            var isChecked = $(this).is(":checked");
            $(".table-check").prop("checked", isChecked);
            refreshButtons();
        });
        $("#spyflow-table").on("click", ".table-check", function(event) {
            refreshButtons();
        });
        $("#spyflow-table").on("click", ".workflow-detail", function() {
            var taskId = $(this).data("taskid");
            var processData = _.find(_opts.flowlist, function(item) { return taskId == item.strTaskID; });
            customcfg.init(function(){
                location.href = customcfg.getCustomUrl(processData) + '?strTaskId=' +  processData.strTaskID;
            })
        })
        $("#spyflow-table").on("click", ".processState", function(event) {
            event.stopPropagation();
            var strProcessInsID = $(this).data('strprocessinsid');
            var strProcessType = $(this).data('strprocesstype');
            dialog.build({
                content: '<div id="process" style="margin:-15px;"></div>',
                style: "min-height:200px;",
                width: 950,
                hideHeader: true,
                hideFooter: true
            }).show(function() {
                var cond = {
                    $container: window.top.$('#process'),
                    processType: strProcessType,
                    processID: strProcessInsID,
                };
                approval.rendTrace(cond);
            });
        });
    }

    function query() {
        var query = "";
        if (_opts.param.type) {
            query = query + "&type=" + _opts.param.type;
        }
        if (_opts.param.Ids) {
            query = query + "&Ids=" + _opts.param.Ids;
        }
        if ($("#showHistory").is(":checked")) {
            query = query + "&queryType=3"
        } else {
            query = query + "&queryType=1"
        }
        return query.slice(1);
    }

    function refreshButtons(){
        var tasks = getSelectedItems();
        var firstToProcess = tasks.checkedItem.find(function(i){ return i.iFinishFlag === 1; });
        if(!firstToProcess)
            return $('.btn-flow-outgoing').remove();
        if($('.btn-flow-outgoing').length !== 0)
            return;
        customcfg.init(function(){
            var submitAction = customcfg.getSubmitActions(firstToProcess);
            if(!!submitAction)
                addOutgoingButtons(submitAction);
            else
                $.get("/workflow/getTaskExtraInfo", {
                    strActId: firstToProcess.strActID,
                    strTaskId: firstToProcess.strTaskID,
                    strProcessInsId: firstToProcess.strProcessInsID
                }).done(function(res) {
                    res = JSON.parse(res)
                    if (res.code == 0)
                        addOutgoingButtons(res.data[0].outgoing);
                });
        });
        function addOutgoingButtons(items){
            var tpl = '<a class="btn btn-success btn-sm ml10 btn-flow-outgoing" data-value="<%= value %>">' +
                    '<span class="glyphicons <%= iconClass %> pr5"></span>' +
                    '<span"><%= labelName %></span>' +
                '</a>';
            tpl = _.template(tpl);
            var icons = {
                "-1": "glyphicons-remove_2", //审批不通过的class图标
                "1": "glyphicons-ok_2", //审批通过的class图标
                "2": "glyphicons-refresh" //回退的class图标
            };
            items.forEach(function(item) {
                $("#btn-refresh").before(tpl({
                    labelName: item.key,
                    iconClass: icons[item.value],
                    value: item.value
                }));
            });
        }
    }

    function getSelectedItems() {
        var items = {
            checkedItem: [],
            history: [],
            unfinish: {},
        };
        $("#spyflow-table .table-check:checked").each(function(index) {
            var taskId = $(this).data("taskid");
            var processData =_opts.flowlist.find(function(item) { return taskId == item.strTaskID; });
            items.checkedItem.push(processData);
            if (processData.iFinishFlag == 2)
                items.history.push(processData);
            if (processData.iFinishFlag == 1) {
                var key = processData.strActID + processData.strProcessName;
                if (items.unfinish[key] == undefined)
                    items.unfinish[key] = [];
                items.unfinish[key].push(processData);
            }
        });
        return items;
    }

    function approveOperate(operate, name) {
        var checkedApprove = getSelectedItems();
        var historyItems = checkedApprove.history;
        var unfinishItems = checkedApprove.unfinish;
        var keys = _.keys(unfinishItems);
        if (keys.length == 1) {
            var approvaldata = [];
            _.each(unfinishItems[keys[0]], function(item) {
                approvaldata.push({
                    recID:item.tProcessVariables[constants.processVariables.recID],
                    tableID:item.tProcessVariables[constants.processVariables.tableID],
                    taskID: item.strTaskID,
                    processID: item.strProcessInsID,
                    processType: item.strProcessType,
                });
            })
            var opt = {
                data: approvaldata,
                result: operate,
                strResultDesc: name,
                callback: function(fail, data){
                    if(fail === false){
                        var page = getHashPage();
                        $("#spyflow-table").DataTable().page(page).draw(false);
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
        } else {
            // notify 选择相同事项
            notify.show({
                text: i18n.t("workprocess.workprocesslist.selectSameClassFlowTip"),
                type: "error",
            });
            $("#spyflow-table input[type=checkbox]").prop("checked", false);
            $("#spyflow-table tr").removeClass("tr-selected");
            refreshButtons();
        }

    }

    function getHashPage() {
        var val = location.hash.slice(1);
        return val ? parseInt(val) : 0;
    }
});