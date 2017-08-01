initLocales();
require(['jquery', 'underscore',
        'nova-dialog',
        'nova-notify',
        'widget/department-tree',
        'jquery.datatables',
        'datatables.bootstrap',
    ],
    function($, _, Dialog, Notify, Tree) {
        hideLoader();
        var selectedPeopleNames = [];
        var selectedPeopleIds = [];
        var _selectedMsgIds = [];
        var _selecteAllFlag = true;

        initNoticeTable();

        //======================================查看公告===================================

        function initNoticeTable() {
            initNoticeLIstTable();
            getNoticeDetail();
        }

        function initNoticeLIstTable() {
            $('#notice-table').dataTable({
                'data': [],
                "bAutoWidth": false,
                'columns': [{
                    "data": "selectCheckout"
                }, {
                    "data": "noticeSubject"
                }, {
                    "data": "noticeId",
                    "sClass": "hideCol",
                    "render": function(data, type, full) {
                        return '<input style="display:none" value="' + data + '"/>'
                    }
                }, {
                    "data": "noticeSender"
                }, {
                    "data": "noticeSendTime"
                }],
                "oLanguage": {
                    "sProcessing": "正在加载通知公告信息...",
                    "sLengthMenu": "每页显示_MENU_条记录",
                    "sInfo": "当前显示_START_到_END_条，共_TOTAL_条任务",
                    "sInfoEmpty": "",
                    "sZeroRecords": "对不起，查询不到相关通知公告信息",
                    "sInfoFiltered": "",
                    "sSearch": "搜索",
                    "oPaginate": {
                        "sPrevious": "前一页",
                        "sNext": "后一页"
                    }
                },
                "bPaginate": true,
                "iDisplayLength": 12,
                "aLengthMenu": [
                    [5, 10, 25, 50, -1],
                    [5, 10, 25, 50, "All"]
                ],
                "sDom": '<"clearfix"r>ft<"dt-panelfooter clearfix"ip>',
            });

            $("#notice-table").on('click', '> tbody > tr > td', function(e) {
                $file = $(this);
                if (this.cellIndex != 0) {
                    $parentTr = $file.parent();
                    if (!$($file, $parentTr).hasClass('dataTables_empty')) {
                        event.preventDefault();
                        if ($parentTr.hasClass("selected")) {
                            $parentTr.removeClass("selected");
                        } else {
                            $parentTr.siblings().removeClass("selected");
                            $parentTr.addClass("selected");
                        }
                    }
                }
            });

            $("#notice-table").on('dblclick', '> tbody > tr > td', function(e) {
                $file = $(this);
                $parentTr = $file.parent();
                if (!$($file, $parentTr).hasClass('dataTables_empty')) {
                    event.preventDefault();

                    var noticeId = $parentTr.find('>:nth-child(3) > input').val();
                    var ids = [];
                    ids.push(noticeId);
                    $.getJSON('/messagecenter/getUserSendedNoticeDetail', {
                        ids: ids
                    }, function(rsp) {
                        if (rsp.code == 0) {
                            if (rsp.data.length > 0) {
                                _.each(rsp.data, function(dataItem, index) {
                                    if (index == 0) {
                                        var temp = {};
                                        temp.subject = dataItem.subject;
                                        temp.sender = dataItem.sender;
                                        temp.sendTime = dataItem.sendTime;
                                        temp.content = dataItem.content;
                                        temp.receivers = dataItem.receivers;
                                        temp.consultData = "查阅:" + dataItem.readCount + "/" + dataItem.receivers.length + "人";
                                        showNoticeDetail(temp);
                                    }
                                })
                            }
                        }
                    })

                }
            });

            $("#notice-table").on('click', '> tbody > tr > td > .checkbox-in-table', function(e) {
                $parentTr = $(this).parent().parent();
                var selectedMsgId = $parentTr.find('>:nth-child(3) > input').val();
                var flag = e.currentTarget.checked;
                if (!$parentTr.hasClass("checkbox-checked")) {
                    _selectedMsgIds.push(selectedMsgId);
                    $parentTr.addClass("checkbox-checked");
                } else {
                    _.each(_selectedMsgIds, function(idItem, index) {
                        if (idItem == selectedMsgId) {
                            _selectedMsgIds.splice(index, 1);
                        }
                    })
                    $parentTr.removeClass("checkbox-checked");
                }
            });
        }

        function getNoticeDetail() {
            var noticeDetails = [];
            $.getJSON('/messagecenter/getUserSendedNotice', {

            }, function(rsp) {
                if (rsp.code == 0) {
                    if (rsp.data.length > 0) {
                        _.each(rsp.data, function(dataItem, index) {
                            var rowData = {};
                            rowData.selectCheckout = '<div style="height:25px;margin-top:-6px;" class ="checkbox-in-table"></div>';
                            rowData.noticeSubject = dataItem.subject;
                            rowData.noticeId = dataItem.id;
                            rowData.noticeSender = dataItem.sender;
                            rowData.noticeSendTime = dataItem.sendTime;
                            noticeDetails.push(rowData);
                        })

                        $("#notice-table").dataTable().fnClearTable();
                        $("#notice-table").dataTable().fnAddData(noticeDetails);
                    } else {
                        $("#notice-table").dataTable().fnClearTable();
                    }
                    _selecteAllFlag = true;
                    $("#selectAllOrNot").text("全选");
                } else {
                    Notify.show({
                        title: "获取用户公告信息失败!",
                        type: "danger"
                    });
                }
            })
        }

        function showNoticeDetail(data) {
            $("#notice-show").hide();
            $("#notice-detail").show();
            var reces = "";
            for (var index = 0; index < data.receivers.length; index++) {
                if (index == 0) {
                    reces = reces + data.receivers[index];
                } else if (index <= 10) {
                    reces = reces + "," + data.receivers[index];
                } else {
                    reces = reces + "...";
                    break;
                }
            }
            $("#notice-send-time").text("发布时间:" + data.sendTime);
            $("#notice-consult").text(data.consultData);
            $("#notice-subject").text("主题:" + data.subject);
            $("#notice-receiver").text(reces);
            $("#notice-receiver").attr("data-original-title", data.receivers);
            $("#notice-content").html(data.content);
        }

        $("#selectAllOrNot").on('click', function(e) {
            var msgListing = $('#notice-table > tbody > tr > td > .checkbox-in-table');
            if (_selecteAllFlag) {
                _selectedMsgIds = [];
                _.each(msgListing, function(msgListItem) {
                    var msgId = $(msgListItem).parent().parent().find('>:nth-child(3)> input').val();
                    _selectedMsgIds.push(msgId);
                    $(msgListItem).parent().parent().addClass("checkbox-checked");
                })
                _selecteAllFlag = false;
                $("#selectAllOrNot").text("取消全选");
            } else {
                _selectedMsgIds = [];
                _.each(msgListing, function(msgListItem) {
                    $(msgListItem).parent().parent().removeClass("checkbox-checked")
                })
                _selecteAllFlag = true;
                $("#selectAllOrNot").text("全选");
            }
        })

        $("#btn-trash").on('click', function(e) {
            if (_selectedMsgIds.length > 0) {
                $.get('/messagecenter/deleteNotice', {
                    ids: _selectedMsgIds
                }, function(rsp) {
                    var rspData = JSON.parse(rsp);
                    if (rspData.code == 0) {
                        _selectedMsgIds = [];
                        showLoader();
                        getNoticeDetail();
                        hideLoader();
                    } else {
                        Notify.show({
                            title: '删除失败!',
                            type: "danger"
                        });
                    }
                });
            } else {
                Notify.show({
                    title: '请先选中将要操作的消息!',
                    type: "danger"
                });
            }
        })

        $("#btn-return").on('click', function() {
            $("#notice-show").show();
            $("#notice-detail").hide();
        })

        $("#btn-refresh").on('click', function() {
            showLoader();
            getNoticeDetail();
            hideLoader();
        })

        $("ul li a").on('click', function() {
                if ($(this).attr("href") == "#tab_1") {
                    $("#notice-show").show();
                    $("#notice-detail").hide();
                    $("#btn-refresh").trigger("click");
                }
            })
            //======================================发送公告===================================
        $("#choose-people-button").on('click', function(e) {
            Dialog.build({
                title: "选择接收人",
                maxHeight: 400,
                minHeight: 240,
                content: "<div id='share-user-filter' class='row mt10 pt10 mln mrn pb5' style='background-color: white'><div class='col-md-9 pn'><input class='form-control' name='searchUser' placeholder='过滤' AUTOCOMPLETE='OFF'></div><div class='col-md-3 prn'><button type='button' class='btn btn-primary btn-block' id='btnResetSearchUser'>清除</button></div></div><div id='receiverChoose'> Loading... </div>",
                rightBtnCallback: function() {
                    $("#getPeople").val(selectedPeopleNames.join(","))
                    $("#getPeople").attr("data-original-title", $("#getPeople").val());
                    $.magnificPopup.close();
                }
            }).show(function() {
                $("#receiverChoose").empty();
                Tree.build({
                    container: $("#receiverChoose"),
                    expandAll: false,
                    selectMode: 3,
                    filter: {
                        mode: "hide",
                        autoAppaly: true,
                        hightlight: true,
                        nodata:true,
                    },
                    source: {
                        url: "/department/listallnoauth"
                    },
                    init: function(event, data) {
                        data.tree.visit(function(node) {
                            if (node.data.departmentId == -1) {
                                node.setExpanded(true);
                            }
                        })
                    },
                }).config('select', function(event, data) {
                    getProcessData();
                });

                var userTree = $("#receiverChoose").fancytree("getTree");
                $("input[name=searchUser]").keyup(function(e) {
                    $(".fancytree-node").parent().removeClass("hide");
                    var rootNode = userTree.getRootNode();
                    if(rootNode._isLoading){
                        Notify.show({
                            title: "数据正在加载,请稍等!",
                            type: "danger"
                        });
                        return;
                    }
                    var n;
                    var opts = {
                        autoExpand: true
                    };
                    var match = $(this).val();

                    if (e && e.which === $.ui.keyCode.ESCAPE || $.trim(match) === "") {
                        $("button#btnResetSearchUser").click();
                        return;
                    }
                    n = userTree.filterNodes(match, opts);
                    $("li .fancytree-hide").parent().addClass("hide");

                    $("button#btnResetSearchUser").attr("disabled", false);
                    $("button#btnResetSearchUser").text( "清除"+ "(" + n + ")");
                });
                $("button#btnResetSearchUser").click(function() {
                    $("input[name=searchUser]").val("");
                    $("button#btnResetSearchUser").text("清除");
                    userTree.clearFilter();
                    $(".fancytree-node").parent().removeClass("hide");
                }).attr('disabled', 'true');
            })
        })

        function getProcessData() {
            selectedPeopleNames = [];
            selectedPeopleIds = [];
            var departmentTree = $("#receiverChoose").fancytree("getTree");
            var selectedNodes = departmentTree.getSelectedNodes();
            if (selectedNodes.length > 0) {
                _.each(selectedNodes, function(node) {
                    if (!node.isFolder()) {
                        selectedPeopleIds.push(parseInt(node.data.userId));
                        selectedPeopleNames.push(node.title);
                    }
                })
            }
        }


        $("#noticeContent").summernote({
            toolbar: [
                ['style', ['style']],
                ['style', ['bold', 'italic', 'underline', 'clear']],
                ['para', ['ul', 'ol', 'paragraph']],
                ['fontsize', ['fontsize']],
                ['color', ['color']],
                ['table', ['table']],
                ['misc', ['fullscreen', 'codeview', 'undo', 'redo']],

                // ['height', ['height']],
            ],
            lang: 'zh-CN',
            codemirror: {
                mode: 'text/html',
                htmlMode: true,
                lineNumbers: true,
                theme: 'monokai'
            },
            height: 275,
            focus: false,
        });

        $("#submit-btn").on('click', function(e) {
            e.preventDefault();
            var hTitle = $("#inputTopTitle").val();
            if ($("#getPeople").val() == "") {
                Notify.show({
                    title: "接收人不能为空!",
                    type: "danger"
                });
            } else if ($("#inputProject").val() == "") {
                Notify.show({
                    title: "主题不能为空!",
                    type: "danger"
                });
            } else if (hTitle.length > 20) {
                Notify.show({
                    title: "红头限18字!",
                    type: "danger"
                });
            } else {
                var TopTitle = $("#inputTopTitle").val();
                var ProjectTitle = $("#inputProject").val();
                var html = $("#noticeContent").summernote('code');
                var sendContent = "";
                if (TopTitle != "") {
                    TopTitle = '<label class="col-md-12" style="font-size:48px;font-weight:bold;text-align:center;color:red;margin:25px 0px 5px 0px;">' + TopTitle + '</label><div class="col-md-12 pn"><div class="col-md-12 pn"><hr class="hrStyle"></div></div>';
                }

                ProjectTitle = '<div class="col-md-12 pn"><div class="col-md-12 pn"><label class="mt30 col-md-12 pn"><h1 style="text-align:center;">' + ProjectTitle + '</h1></label></div></div>';
                sendContent = TopTitle + ProjectTitle + '<div class="col-md-12 pn"><div class="col-md-12 pn">' + html + '</div></div>';
                $.post('/messagecenter/sendMessage', {
                    subject: $("#inputProject").val(),
                    content: sendContent,
                    typeId: 1,
                    moduleId: 1,
                    receiverIds: selectedPeopleIds,
                    receiveNames: selectedPeopleNames,
                    isMerge: 0,
                    mergeId: "",
                    mergeValue: 0
                }, function(rsp) {
                    var rspData = JSON.parse(rsp);
                    if (rspData.code == 0) {
                        Notify.show({
                            title: '通知公告发送成功！',
                            type: "success"
                        });
                    } else {
                        Notify.show({
                            title: '通知公告发送失败！',
                            type: "danger"
                        });
                    }
                });
            }
        })

    });