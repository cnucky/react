initLocales();
require(['jquery', 'underscore',
        'nova-dialog',
        'nova-notify',
        'moment',
        'bootstrap-multiselect',
        'jquery-ui',
        'jquery.datatables',
        'datatables.bootstrap',
        'utility/tagmanager/tagmanager',
    ],
    function($, _, Dialog, Notify, moment) {
        hideLoader();

        var _selectedMsgIds = [];
        var _selecteAllFlag = true;
        var _appTypeMsgColor = ["badge-warning", "badge-primary", "badge-info", "badge-system", "badge-success", "badge-danger"];
        var _labelList = [];

        var _searchKeyWord = "";
        var lastInputTime = '';
        var _lastSearchKeyword = "";
        var _isReadFlag = -1;
        var _typeData = [];
        var _moduleData = [];
        var _labelData = [];
        var _selectedCons = "";
        var _msgsInfo = [];

        var _startIndex = 0;

        var _startTime = moment().subtract(7, 'days');
        var _endTime = moment();
        _startTime = _startTime.format("YYYY-MM-DD HH:mm:ss");
        _endTime = _endTime.format("YYYY-MM-DD HH:mm:ss");
        var oTable;

        (function() {
            $(window).on('nv-resize resize', _.debounce(resizeCanvas, 100));
        })(); // end resize events

        $(window).trigger("resize");
        function resizeCanvas() {
            var leftTray = $('.tray.tray-left');

            var leftHeight = window.innerHeight - leftTray.offset().top;
            $('.tray.tray-center').height(leftHeight);

            $('#left-body').height(leftHeight-$("#left-body-par").position().top);
            $('#msgTableDiv').height(leftHeight);
            leftTray.height(leftHeight);
        }

        var _msgId = getURLParameter("msgId") || "0";

        function getURLParameter(name) {
            return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || null;
        }

        getInitLabelMenu();
        initDataTable();
        getMessageState();
        

        if (_msgId != "0") {
            getMsgInfo(_msgId);
        }

        $(".collapse").collapse();

        function initDataTable(){
            oTable = $('#loadMsgTable').DataTable({
            'bAutoWidth': false,
            'ordering': false,

            'bPaginate': true,
            'iDisplayLength': 15,
            'bLengthChange': false,
            'columns': [{
                "data": "selectCheckout"
            }, {
                "data": "msgId",
                "sClass": "hideCol",
                "render": function(data, type, full) {
                    return '<input style="display:none" value="' + data + '"/>'
                }
            }, {
                "data": "msgSubject"
            }, {
                "data": "type"
            }, {
                "data": "module"
            }, {
                "data": "msgSender"
            }, {
                "data": "lable"
            }, {
                "data": "msgSendTime"
            }],

            'serverSide': true,
            'ajax': {
                'url': 'getMessage',
                'type': 'POST',
                'dataSrc': function(json) {
                    _msgsInfo = [];
                    _msgsInfo = json.data;
                    var tableContents = initMsgTableContent(json.data);
                    return tableContents;
                },
                'data': function(d) {
                    d.startTime = _startTime;
                    d.endTime = _endTime;
                    d.keyword = _lastSearchKeyword;
                    d.isRead = _isReadFlag;
                    d.type = _typeData;
                    d.label = _labelData;
                    d.module = _moduleData;
                },
            },

            "oLanguage": {
                "sProcessing": "正在加载消息信息...",
                "sLengthMenu": "每页显示_MENU_条记录",
                "sInfo": "当前显示_START_到_END_条，共_TOTAL_条消息",
                "sInfoEmpty": "",
                "sZeroRecords": "对不起，查询不到相关消息信息",
                "sInfoFiltered": "",
                "sSearch": "搜索",
                "oPaginate": {
                    "sPrevious": "前一页",
                    "sNext": "后一页"
                }
            },

            "sDom": '<"clearfix"r>t<"dt-panelfooter clearfix"ip>',
            });
        }

        $("#loadMsgTable").on('click', '> tbody > tr > td', function(e) {
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

        $("#loadMsgTable").on('dblclick', '> tbody > tr > td', function(e) {
            $file = $(this);
            if (this.cellIndex != 0) {
                $parentTr = $file.parent();
                if (!$($file, $parentTr).hasClass('dataTables_empty')) {
                    event.preventDefault();

                    var selectedMsgId = $parentTr.find('>:nth-child(2) > input').val();
                    var ids = [];
                    ids.push(selectedMsgId);

                    getMsgInfo(selectedMsgId);
                    $.get('/messagecenter/setMsgIsRead', {
                        ids: ids,
                        isRead: 1
                    }, function(rsp) {
                        var rspData = JSON.parse(rsp);
                        showLoader();
                        getMessageState();
                        oTable.ajax.reload(null, false);
                        hideLoader();
                        if (rspData.code != 0) {
                            Notify.show({
                                title: rspData.message,
                                type: "danger"
                            });
                        }
                    });
                }
            }
        });

        $("#loadMsgTable").on('click', '> tbody > tr > td > .checkbox-in-table', function(e) {
            $parentTr = $(this).parent().parent();
            var selectedMsgId = $parentTr.find('>:nth-child(2) > input').val();
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

        $("#input-searchkeyword").keyup(function(event) {
            lastInputTime = event.timeStamp;
            setTimeout(function() {
                if (lastInputTime - event.timeStamp == 0) {
                    var keyword = $("#input-searchkeyword").val();
                    if (_lastSearchKeyword != keyword) {
                        _lastSearchKeyword = keyword;
                        showLoader();
                        showMsgList();
                        getMessageState();
                        oTable.ajax.reload();
                        // oTable.draw();
                        hideLoader();
                    }
                }
            }, 300)
        });

        function getMessageState() {
            $.post('/messagecenter/getMessageStat', {
                startTime: _startTime,
                endTime: _endTime,
                keyWord: _lastSearchKeyword
            }, function(rsp) {
                var rspData = JSON.parse(rsp);
                if (rspData.code == 0) {
                    _labelList = [];
                    _.each(rspData.data.labelStat,function(label){
                        _labelList.push(label.name);
                    })
                    initPageMenu(rspData.data);
                } else {
                    Notify.show({
                        title: '获取消息统计信息失败!',
                        type: "danger"
                    });
                }

            })
        }

        function initPageMenu(data) {
            initIsreadMenu(data.isReadStat);
            initTypeState(data.typeStat);
            initMsgTypeMenu(data.moduleStat);
            initLabelMenu(data.labelStat);
            setSelBtnState();
        }

        function initIsreadMenu(data) {
            var unreadMsg = 0;
            var hasreadMsg = 0;
            _.each(data, function(dataItem, index) {
                if (dataItem.name == "已读消息") {
                    hasreadMsg = dataItem.count;
                } else if (dataItem.name == "未读消息") {
                    unreadMsg = dataItem.count;
                }
            })
            $("#message-unread").text(unreadMsg);
            $("#message-readed").text(hasreadMsg);
        }

        function initTypeState(data) {
            $("#msgType").empty();
            $("#msgType").append('<div class="list-group-header"> 消息类型 </div>');
            var typeDataItemList = [];
            _.each(data, function(typeDataItem, index) {
                typeDataItemList.push(typeDataItem.name);
                var typeItemClass = "";
                var styleBgColor = "";
                if (_.contains(_typeData, typeDataItem.name)) {
                    typeItemClass = ' selectedMsgType"';
                    styleBgColor = ' style="background:#3B484F;"';
                }
                $("#msgType").append('<a href="#" class="list-group-item' + typeItemClass + styleBgColor + '" data-index="' + typeDataItem.name + '">' + typeDataItem.name + '<span class="label ' + _appTypeMsgColor[index % 6] + '">' + typeDataItem.count + '</span>');
            })

            for(var i=0;i<_typeData.length;i++){
                if (!_.contains(typeDataItemList, _typeData[i])) {
                    _typeData.splice(i,1);
                    i = i -1;
                }
            }

            $("#msgType .list-group-item").bind("click", function(e) {
                var value = $(e.currentTarget).attr("data-index");
                if ($(this).hasClass("selectedMsgType")) {
                    $(this).removeClass("selectedMsgType");
                    $(this).css('background', '');
                    _.each(_typeData, function(typeDataInfo, index) {
                        if (typeDataInfo == value) {
                            _typeData.splice(index, 1);
                        }
                    })
                    showLoader();
                    showMsgList();
                    initSelBtnState();
                    oTable.ajax.reload();
                    // oTable.draw();
                    hideLoader();
                } else {
                    $(this).addClass("selectedMsgType");
                    $(this).css('background', '#3B484F');
                    $(this).siblings().removeClass("selectedMsgType");
                    $(this).siblings().css('background', '');
                    _typeData = [];
                    _typeData.push(value);
                    showLoader();
                    showMsgList();
                    initSelBtnState();
                    oTable.ajax.reload();
                    // oTable.draw();
                    hideLoader();
                }
            })
        }

        function initMsgTypeMenu(data) {
            $("#taskType").empty();
            $("#taskType").append('<div class="list-group-header"> 消息模块 </div>');
            var appTypeItemLIst = [];
            _.each(data, function(appTypeItem, index) {
                appTypeItemLIst.push(appTypeItem.name);
                var appItemClass = "";
                var styleBgColor = "";
                if (_.contains(_moduleData, appTypeItem.name)) {
                    appItemClass = ' selectedMsgType"';
                    styleBgColor = ' style="background:#3B484F;"';
                }
                $("#taskType").append('<a href="#" class="list-group-item' + appItemClass + styleBgColor + '" data-index="' + appTypeItem.name + '">' + appTypeItem.name + '<span class="label ' + _appTypeMsgColor[index % 6] + '">' + appTypeItem.count + '</span>');
            })

            for(var i=0;i<_moduleData.length;i++){
                if (!_.contains(appTypeItemLIst, _moduleData[i])) {
                    _moduleData.splice(i,1);
                    i = i -1;
                }
            }

            $("#taskType .list-group-item").bind("click", function(e) {
                var value = $(e.currentTarget).attr("data-index");
                if ($(this).hasClass("selectedMsgType")) {
                    $(this).removeClass("selectedMsgType");
                    $(this).css('background', '');
                    _.each(_moduleData, function(moduleDataInfo, index) {
                        if (moduleDataInfo == value) {
                            _moduleData.splice(index, 1);
                        }
                    })
                    showLoader();
                    showMsgList();
                    initSelBtnState();
                    oTable.ajax.reload();
                    // oTable.draw();
                    hideLoader();
                } else {
                    $(this).addClass("selectedMsgType");
                    $(this).css('background', '#3B484F');
                    $(this).siblings().removeClass("selectedMsgType");
                    $(this).siblings().css('background', '');
                    _moduleData = [];
                    _moduleData.push(value);
                    showLoader();
                    showMsgList();
                    initSelBtnState();
                    oTable.ajax.reload();
                    // oTable.draw();
                    hideLoader();
                }
            })
        }

        function initLabelMenu(data) {
            $("#label-classify").empty();
            $("#label-classify").append('<div class="list-group-header">标签</div>');
            var labelDataItemList = [];
            _.each(data, function(dataItem, index) {
                labelDataItemList.push(dataItem.name);
                var dex = jQuery.inArray(dataItem.name, _labelList);
                if(dex<0){
                    dev = _labelList.length +1;
                    _labelList.push(dataItem.label);
                }
                var labelItemClass = "";
                var styleBgColor = "";
                if (_.contains(_labelData, dataItem.name)) {
                    labelItemClass = ' selectedMsgType"';
                    styleBgColor = ' style="background:#3B484F;"';
                }
                $("#label-classify").append('<a href="#" class="list-group-item' + labelItemClass + styleBgColor + '" data-index="' + dataItem.name + '">' + dataItem.name + '<span class="badge ' + _appTypeMsgColor[dex % 6] + ' ">' + dataItem.count + '</span></a>');
            })
            oTable.ajax.reload();

            for(var i=0;i<_labelData.length;i++){
                if (!_.contains(labelDataItemList, _labelData[i])) {
                    _labelData.splice(i,1);
                    i = i -1;
                }
            }

            $("#label-classify .list-group-item").bind("click", function(e) {
                var value = $(e.currentTarget).attr("data-index");
                if ($(this).hasClass("selectedMsgType")) {
                    $(this).removeClass("selectedMsgType");
                    $(this).css('background', '');
                    _.each(_labelData, function(labelDataInfo, index) {
                        if (labelDataInfo == value) {
                            _labelData.splice(index, 1);
                        }
                    })
                    showLoader();
                    showMsgList();
                    initSelBtnState();
                    oTable.ajax.reload();
                    hideLoader();
                } else {
                    $(this).addClass("selectedMsgType");
                    $(this).css('background', '#3B484F');
                    $(this).siblings().removeClass("selectedMsgType");
                    $(this).siblings().css('background', '');
                    _labelData = [];
                    _labelData.push(value);
                    showLoader();
                    showMsgList();
                    initSelBtnState();
                    oTable.ajax.reload();
                    hideLoader();
                }
            })
        }

        function initMsgTableContent(data) {
            var loadMsgInfo = [];
            _.each(data, function(dataItem, index) {
                var firstTd = '<div style="height:25px;margin-top:-6px;" class ="checkbox-in-table"></div>';
                var rowData = {};
                rowData.selectCheckout = firstTd;
                rowData.msgId = dataItem.id;
                rowData.msgSender = dataItem.sender;
                rowData.type = dataItem.type;
                rowData.module = dataItem.module;
                var labelTd = "";
                if (dataItem.label != "") {
                    var index = jQuery.inArray(dataItem.label, _labelList);
                    if (index >= 0) {
                        labelTd = '<span class="badge ' + _appTypeMsgColor[index % 6] + ' mr10 fs11" style="font-size:15px">' + dataItem.label + '</span>';
                    } else {
                        labelTd = '<span class="badge ' + _appTypeMsgColor[(_labelList.length) % 6] + ' mr10 fs11" style="font-size:15px">' + dataItem.label + '</span>';
                        _labelList.push(dataItem.label);
                    }
                } else {
                    labelTd = '<span class="badge badge-system mr10 fs11" style="font-size:15px">' + dataItem.label + '</span>';
                }

                rowData.lable = labelTd;
                var msgProject = "";
                if (dataItem.isRead == 0) {
                    msgProject = '<span style="font-weight: bold;font-size:15px">' + dataItem.subject + '<span>';
                } else {
                    msgProject = '<span style="font-size:15px">' + dataItem.subject + '<span>';
                }
                rowData.msgSubject = msgProject;
                rowData.msgSendTime = dataItem.sendTime;
                loadMsgInfo.push(rowData);
            })

            return loadMsgInfo;
        }

        function getInitLabelMenu() {
            $.getJSON('/workspacedir/queryPreference', {
                name: 'messageCenterLabels'
            }).done(function(rsp) {
                var labelList = rsp.data;
                $("#btn-label").empty();
                if (labelList.length > 0) {
                    if (labelList.length != 1 || labelList[0] != "") {
                        _.each(labelList, function(labelListInfo, index) {
                            if (labelListInfo != "") {
                                $("#btn-label").append('<li><a href="#">' + labelListInfo + '</a></li>');
                            }
                        })
                    }
                }
                $("#btn-label").append('<li><a href="#">删除标签</a></li>');
                $("#btn-label").append('<li class="divider"></li>');
                $("#btn-label").append('<li><a href="#"><span class="fa fa-plus pr5"></span>标签管理</a></li>');
            })
        }

        $('#btn-multiselect').multiselect({
            dropRight:true,
            buttonClass: 'multiselect dropdown-toggle btn btn-sm btn-default btn-primary',
        });

        $('#btn-multiselect').on('change', function(e) {
            var selectTimeOption = $(e.currentTarget).val();
            switch (selectTimeOption) {
                case "week":
                    _startTime = moment().subtract(7, 'days');
                    _endTime = moment();
                    break;
                case "halfmouth":
                    _startTime = moment().subtract(15, 'days');
                    _endTime = moment();
                    break;
                case "mouth":
                    _startTime = moment().subtract(1, 'months');
                    _endTime = moment();
                    break;
                case "threemouth":
                    _startTime = moment().subtract(3, 'months');
                    _endTime = moment();
                    break;
                case "halfyear":
                    _startTime = moment().subtract(6, 'months');
                    _endTime = moment();
                    break;
            }
            _startTime = _startTime.format("YYYY-MM-DD HH:mm:ss");
            _endTime = _endTime.format("YYYY-MM-DD HH:mm:ss");
            showLoader();
            showMsgList();
            getMessageState();
            oTable.ajax.reload();
            // oTable.draw();
            hideLoader();
        });

        function getMsgInfo(msgId) {
            var msgDetails = {};
            var ids = [];
            ids.push(msgId);
            $.post('/messagecenter/getMessageContent', {
                ids: ids
            }, function(rsp) {
                var rspData = JSON.parse(rsp);
                if (rspData.code == 0) {
                    if (rspData.data.length > 0) {
                        _.map(rspData.data, function(msgInfoItem) {
                            if (msgInfoItem.id == msgId) {
                                if (msgInfoItem.isLink) {
                                    window.open(msgInfoItem.linkUrl);
                                    // window.location.href = msgItem.linkUrl;
                                } else {
                                    msgDetails.msgSendTime = msgInfoItem.sendTime;
                                    msgDetails.msgSubject = msgInfoItem.subject;
                                    msgDetails.msgSender = msgInfoItem.sender;
                                    msgDetails.msgContent = msgInfoItem.content;
                                }
                            }
                        })
                        showMsgDetail(msgDetails);
                    }
                } else {
                    Notify.show({
                        title: rspData.message,
                        type: "danger"
                    });
                }
            });
        }

        function showMsgDetail(msgInfo) {
            $("#msgTableShow").hide();
            $("#msgDetailShow").show();
            $("#msg-send-time").text(msgInfo.msgSendTime);
            $("#msg-subject").text("主题:" + msgInfo.msgSubject);
            $("#msg-sender").text("来自:" + msgInfo.msgSender);
            $("#msg-content").html(msgInfo.msgContent);

            var leftTray = $('.tray.tray-left');
            var leftHeight = window.innerHeight - leftTray.offset().top;
            $('#message-body').height(leftHeight-$("#message-body-div").position().top);
        }

        function showMsgList() {
            $("#msgTableShow").show();
            $("#msgDetailShow").hide();
        }

        $("#btn-return").on('click', function() {
            showMsgList();
        })

        function setSelBtnState() {
            if (!_selecteAllFlag) {
                $("#selectAllOrNot").click();
            }
            _selecteAllFlag = true;
        }

        function initSelBtnState(){
            _selecteAllFlag = true;
            $("#selectAllOrNot").text("全选");
        }

        $("#selectAllOrNot").on('click', function(e) {
            var msgListing = $('#loadMsgTable > tbody > tr > td > .checkbox-in-table');
            if (_selecteAllFlag) {
                _selectedMsgIds = [];
                _.each(msgListing, function(msgListItem) {
                    var msgId = $(msgListItem).parent().parent().find('>:nth-child(2)> input').val();
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

        $("#btn-refresh").on('click', function(e) {
            showLoader();
            getMessageState();
            initSelBtnState();
            oTable.ajax.reload();
            hideLoader();
        })

        $("#btn-trash").on('click', function(e) {
            if (_selectedMsgIds.length > 0) {
                $.post('/messagecenter/deleteMsgs', {
                    ids: _selectedMsgIds
                }, function(rsp) {
                    var rspData = JSON.parse(rsp);
                    if(rspData.code == 0){
                        window.externalSetMessageReaded(_selectedMsgIds);
                    }
                    _selectedMsgIds = [];
                    showLoader();
                    getMessageState();
                    oTable.ajax.reload(null, false);
                    hideLoader();
                    if (rspData.code != 0) {
                        Notify.show({
                            title: rspData.message,
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

        $("#btn-isread").on('click', 'li > a', function(e) {
            if (_selectedMsgIds.length > 0) {
                var textValue = e.currentTarget.text;
                var isReadFlag = 0;
                if (textValue == "标为已读") {
                    isReadFlag = 1;
                    window.externalSetMessageReaded(_selectedMsgIds);
                }
                var msgInfoCol = "isRead";

                $.get('/messagecenter/setMsgIsRead', {
                    ids: _selectedMsgIds,
                    isRead: isReadFlag
                }, function(rsp) {
                    var rspData = JSON.parse(rsp);
                    _selectedMsgIds = [];
                    showLoader();
                    getMessageState();
                    oTable.ajax.reload(null, false);
                    hideLoader();
                    if (rspData.code != 0) {
                        Notify.show({
                            title: rspData.message,
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

        $("#btn-label").on('click', 'li > a', function(e) {
            var labelValue = e.currentTarget.innerText.trim();
            if (labelValue == "标签管理") {
                e.preventDefault();
                $.get("label-add-delete.html", function(result) {
                    Dialog.build({
                        title: '标签设置',
                        content: result,
                        rightBtn: '确定',
                        rightBtnCallback: function() {
                            // 提交
                            var labels = [];
                            labels = $("#user-labels").tagsManager('tags');
                            $.post('/workspacedir/recordPreference', {
                                name: 'messageCenterLabels',
                                detail: labels
                            }).done(function(data) {
                                Dialog.dismiss();
                                data = JSON.parse(data);
                                if (data.code == 0) {
                                    Notify.show({
                                        title: "标签设置成功 ",
                                        type: "success",
                                    });
                                    getInitLabelMenu();
                                } else {
                                    Notify.show({
                                        title: "标签设置失败",
                                        type: "danger",
                                    });
                                }
                            });
                        }
                    }).show(function() {
                        $('.tm-input').tagsManager({
                            tagsContainer: '#labels-manager',
                            prefilled: [],
                            tagClass: 'tm-tag-info'
                        });

                        $("#addlabel-button").on('click', function(e) {
                            e.preventDefault();
                            var value = $("#user-labels").val();
                            if (value != "") {
                                $('#user-labels').tagsManager('pushTag', value, false);
                            }
                            $("#user-labels").val("");
                        })

                        $.getJSON('/workspacedir/queryPreference', {
                            name: 'messageCenterLabels'
                        }).done(function(rsp) {
                            var labelList = rsp.data;
                            $('#user-labels').tagsManager('empty');
                            if (labelList.length != 1 || labelList[0] != "") {
                                _.each(labelList, function(labelItem) {
                                    $('#user-labels').tagsManager('pushTag', labelItem, false);
                                })
                            }
                        })
                    });
                });
            } else {
                if (_selectedMsgIds.length > 0) {
                    var msgInfoCol = "msgLabel";
                    var value = "";
                    if (labelValue != "删除标签") {
                        value = labelValue;
                    }
                    $.post('/messagecenter/setMsgLabel', {
                        ids: _selectedMsgIds,
                        labelValue: value
                    }, function(rsp) {
                        var rspData = JSON.parse(rsp);
                        _selectedMsgIds = [];
                        showLoader();
                        getMessageState();
                        oTable.ajax.reload(null, false);
                        hideLoader();
                        if (rspData.code != 0) {
                            Notify.show({
                                title: rspData.message,
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
            }
        })

        $("#isReadDiv .list-group-item").on('click', function(e) {
            var value = $(this).attr("data-index");
            if ($(this).hasClass("selectedMsgType")) {
                $(this).removeClass("selectedMsgType");
                $(this).css('background', '');
                _isReadFlag = -1;
                showLoader();
                showMsgList();
                initSelBtnState();
                oTable.ajax.reload();
                hideLoader();
            } else {
                $(this).addClass("selectedMsgType");
                $(this).css('background', '#3B484F');
                $(this).siblings().removeClass("selectedMsgType");
                $(this).siblings().css('background', '');
                _isReadFlag = value;
                showLoader();
                showMsgList();
                initSelBtnState();
                oTable.ajax.reload();
                hideLoader();
            }
        })

    });