define("./rlf-relation", [
    "../../tpl/rlf/rlf-profile-qqgroup-detail",
    "../../tpl/rlf/rlf-profile-social-relations",
    "./rlf-icon-set",
    "./rlf-auto-link",
    "./rlf-assist-menu",
    "nova-notify",
    "moment",
    "nova-utils",
    "jquery",
    "underscore",
    "fancytree-all",
    "bootstrap-multiselect",
    "jquery.datatables",
    "datatables.bootstrap",
    "utility/jquery/jqmaskedinput",
    "utility/fancytree/extensions/jquery.fancytree.filter",
    "utility/contextmenu/jquery.ui-contextmenu",
], function(tplQQGroupDetail, tplSocialTable, IconSet, AutoLink, AssistMenu, Notify, moment, Util) {
    tplQQGroupDetail = _.template(tplQQGroupDetail);
    tplSocialTable = _.template(tplSocialTable);
    var tplQQTitle = _.template("<span class='fancytree-title'><%- nick + '  ' %>(<a class='rlf-auto-link' href='javascript:void()'><%- qq %></a>)</span>");
    var tplQQTitleForSearch = _.template("<span><%- nick + '  ' %>(<a><%- qq %></a>)</span>");

    var _opts;

    var phoneInfoTableData = [];
    var summary = [];
    var callList = [];
    var relationKeyValue = "";
    var yjsPermission = false;
    var dateFormat = 'YYYY-MM';

    function init(opts) {
        _opts = opts;
        $.get("../../renlifang/profile-relations.html", function(result) {
            $(opts.container).append(result);
        });

    }

    function render(isPermission) {
        yjsPermission = isPermission;
        // render QQ
        _renderQQ();

        // render Social Relations
        _renderSocialRelations();

        //render phone
        _renderPhoneLink();

        // 点击没有隐藏的那个 tab
        _.find($("#relations ul li a"), function(item) {
            if (!$(item).hasClass('hidden')) {
                $(item).click();
                return true;
            }
        });

        if (yjsPermission) {
            $("#relations").on('contextmenu', function(e) {
                e.preventDefault();
                return false;
            })
        }
    }

    function _renderPhoneLink() {
        if ($.isFunction(_opts.loadPhoneLink) && !_opts.loadPhoneLink()) {
            disablePhoenLink();
        } else {
            var phoneData = [];
            _.each(_opts.loadPhoneLink(), function(item, index) {
                phoneData.push({
                    label: item,
                    value: item,
                })
            })
            var phoneNumber = [];
            $("#phone-multiselect").multiselect({
                buttonClass: 'multiselect dropdown-toggle btn btn-primary fw600 fs14',
                buttonWidth: '100%',
                nonSelectedText: '请选择',
                nSelectedText: 'selected',
                allSelectedText: '全选',
                numberDisplayed: 1,
                onChange: function(option, checked, select) {
                    if (checked) {
                        phoneNumber.push($(option).val());
                    } else {
                        _.map(phoneNumber, function(itemNumber, indexNum) {
                            if (itemNumber == $(option).val()) {
                                phoneNumber.splice(indexNum, 1);
                            }
                        })
                    }

                }
            });
            phoneNumber.push(phoneData[0].value);
            $("#phone-multiselect").multiselect('dataprovider', phoneData);
            $("#phone-multiselect").multiselect('select', phoneData[0].value);

            var start = moment().subtract(1, 'year').format("YYYY-MM");
            var end = moment().format("YYYY-MM");
            $('#date-range-begin').datetimepicker({
                format: dateFormat,
                defaultDate: start,
                locale:'zh-cn',
                viewMode: 'months',
                widgetPositioning: {
                    horizontal: 'auto',
                    vertical: 'bottom'
                },
                minDate:'1970-01'
            });
            $('#date-range-begin').mask("9999-99");

            $('#date-range-end').datetimepicker({
                format: dateFormat,
                defaultDate: end,
                locale:'zh-cn',
                viewMode: 'months',
                widgetPositioning: {
                    horizontal: 'auto',
                    vertical: 'bottom'
                },
                minDate:'1970-01'
            });
            $('#date-range-end').mask("9999-99");
            
            if (phoneInfoTableData.length <= 0) {
                initTable();
            }
            buttonClickEvent(start, end, phoneNumber);

            $("#phone-btn-go").on('click', function() {
                var reg = new RegExp("/", "g");
                var companyStartDate = $('#date-range-begin').val().trim();
                var companyEndDate = $('#date-range-end').val().trim();
                if (companyStartDate == "") {
                    Notify.show({title: "起始时间不能为空",type: "danger"});
                } else if (companyEndDate == "") {
                    Notify.show({title: "结束时间不能为空",type: "danger"});
                } else if (new Date(companyStartDate) >= new Date(companyEndDate)) {
                    Notify.show({title: "起始时间不能大于等于结束时间",type: "danger"});
                } else {
                    buttonClickEvent(companyStartDate, companyEndDate, phoneNumber);
                }
            });

            $("#tabs-info").on('click', 'li', function(e) {
                var titleName = $(e.currentTarget).attr('title');
                var tableDataChanges = [];
                if (titleName == "全部") {
                    if (phoneInfoTableData.length > 0) {
                        $("#loadPhoneInfoTable").dataTable().fnClearTable();
                        $("#loadPhoneInfoTable").dataTable().fnAddData(phoneInfoTableData);
                    }
                } else {
                    if (phoneInfoTableData.length > 0) {
                        _.map(phoneInfoTableData, function(phoneDataItem, index) {
                            if (_.contains(phoneDataItem, titleName)) {
                                tableDataChanges.push(phoneDataItem);
                            }
                        })
                        $("#loadPhoneInfoTable").dataTable().fnClearTable();
                        $("#loadPhoneInfoTable").dataTable().fnAddData(tableDataChanges);
                    } else {
                        $("#loadPhoneInfoTable").dataTable().fnClearTable();
                    }
                }

            })

        }
    }

    function buttonClickEvent(companyStartDate, companyEndDate, phoneNumber) {
        var startTime = companyStartDate;
        var endTime = companyEndDate;
        if (phoneNumber.length <= 0) {
            Notify.show({
                title: "电信号码不能为空！",
                type: "warning"
            });
        } else {
            showLoader();
            $.getJSON("/renlifang/personcore/getphonerelation", {
                phoneNumber: phoneNumber,
                startTime: startTime,
                endTime: endTime
            }, function(rsp) {
                hideLoader();
                if (rsp.code == 0) {
                    phoneInfoTableData = [];
                    summary = [];
                    callList = [];
                    summary = rsp.data.summary;
                    callList = rsp.data.callList;
                    var contentPart = $("#tabs-info");
                    contentPart.empty();
                    _.map(summary, function(item, index) {
                        if (index == 0) {
                            contentPart.append('<li class="active" title="' + item.regionName + '"><a href="" data-toggle="tab">' + item.regionName + '(' + item.count + ')' + '</a></li>');
                        } else {
                            contentPart.append('<li title="' + item.regionName + '"><a href="" data-toggle="tab">' + item.regionName + '(' + item.count + ')' + '</a></li>');
                        }
                    })

                    _.map(callList, function(callListItem, indexNum) {
                        var tableData = [];
                        tableData.push(callListItem.phoneNumber);
                        tableData.push(callListItem.weight);
                        tableData.push(callListItem.regionName);
                        tableData.push(callListItem.type);
                        phoneInfoTableData.push(tableData);
                    })
                    if (phoneInfoTableData.length > 0) {
                        $("#loadPhoneInfoTable").dataTable().fnClearTable();
                        $("#loadPhoneInfoTable").dataTable().fnAddData(phoneInfoTableData);
                    } else {
                        $("#loadPhoneInfoTable").dataTable().fnClearTable();
                    }

                    var a = $("#loadPhoneInfoTable").find('a');
                    if (a.length > 0) {
                        _.each(a, function(item) {
                            var hrefLink = $(this).attr("href");
                            var currentHrefName = IconSet.getcurrentHrefName();
                            AutoLink.initLink(item, currentHrefName, hrefLink);
                        })
                    }
                    AssistMenu.initContextmenu("#phone-link", "a.rlf-auto-link", yjsPermission, true);
                } else {
                    Notify.show({
                        title: "获取手机号码关系失败!",
                        type: "warning"
                    });
                }
            });
        }
    }

    function initTable() {
        $('#loadPhoneInfoTable').dataTable({
            'destroy': true,
            'columnDefs': [{
                'targets': 0,
                'render': function(data, type, full, meta) {
                    return '<a class="rlf-auto-link" href=' + UrlUtil.getProfileUrl(data, 5) + '>' + data + '</a>';
                }
            }],
            'data': [],
            "bAutoWidth": false,
            'searching': true,
            'aaSorting': [
                [1, 'desc']
            ],
            "oLanguage": {
                "sProcessing": "正在加载任务信息...",
                "sLengthMenu": "每页显示_MENU_条记录",
                "sInfo": "当前显示_START_到_END_条，共_TOTAL_条任务",
                "sInfoEmpty": "",
                "sZeroRecords": "对不起，查询不到相关电话通联信息",
                "sInfoFiltered": "",
                "sSearch": "搜索",
                "oPaginate": {
                    "sPrevious": "前一页",
                    "sNext": "后一页"
                }
            },
            "bPaginate": true,
            "iDisplayLength": 10,
            "aLengthMenu": [
                [5, 10, 25, 50, -1],
                [5, 10, 25, 50, "All"]
            ],
            "sDom": '<"clearfix"fr>t<"dt-panelfooter"ip>',
        });
    }

    function afterSearchClickQQ(data) {
        var currentHrefName = IconSet.getcurrentHrefName();
        var stash = Util.stash.getPageStash(window.location.pathname);
        var index = _.findIndex(stash, function(item) {
            return item.key === window.location.href;
        });
        if (index >= 0) {
            stash.splice(index, 1);
        }
        stash.push({
            key: window.location.href,
            title: currentHrefName,
            link: window.location.href
        });
        Util.stash.setPageStash(window.location.pathname, stash);
        UrlUtil.openRlfProfile(data.qq, data.valueType);
    }

    function _renderQQ() {
        if ($.isFunction(_opts.qqSource) && !_opts.qqSource()) {
            disableQQ();
        } else {
            var treeContainer = $('#relation-qq-container');
            if (!treeContainer.hasClass('qq-tree-container')) {
                treeContainer.addClass('qq-tree-container');
                treeContainer.fancytree({
                    extensions: ["filter"],
                    quicksearch: true,
                    filter: {
                        mode: "dimn",
                        autoApply: true,
                        highlight: true
                    },
                    selectmode: 1,
                    clickFolderMode: 1,
                    checkbox: false,
                    source: _opts.qqSource,
                    autoScroll: true,
                    iconClass: function(event, data) {
                        if (data.node.extraClasses) {
                            if (data.node.extraClasses.indexOf('nv-qq') != -1) {
                                return "fa fa-qq text-info";
                            } else if (data.node.extraClasses.indexOf('nv-group') != -1) {
                                return "fa fa-group text-info";
                            }
                        }
                        return "none";
                    },
                    renderNode: function(event, data) {
                        var a = $(data.node.li).find('.rlf-auto-link');
                        var currentHrefName = IconSet.getcurrentHrefName();
                        AutoLink.initLink(a, currentHrefName, UrlUtil.getProfileUrl(data.node.data.qq, data.node.data.valueType));
                    },
                    renderTitle: function(event, data) {
                        if (data.node.extraClasses === 'nv-qq-people' && data.node.data.valueType && "loading" != data.node.statusNodeType) {
                            // data.node.title = tplQQTitleForSearch(data.node.data);
                            return tplQQTitle(data.node.data);
                        }
                    },
                    postProcess: function(event, data) {
                        if (data.response.data) {
                            data.result = data.response.data;
                        }
                    },
                    init: function(event, data) {
                        data.tree.visit(function(node) {
                            if (node.extraClasses == 'nv-qq') {
                                node.setExpanded(true);
                            }
                            if (node.folder) {
                                if (node.extraClasses != 'nv-qq') {
                                    $('.fancytree-title:contains(' + node.title + ')').siblings('.fancytree-expander').attr('id', 'testId-' + node.title);
                                } else {
                                    $('.fancytree-title:contains(' + node.title + ')').siblings('.fancytree-expander').attr('id', 'testId-QQ号码');
                                }

                            }
                        })

                    },
                    activate: function(event, data) {
                        if (data.node.extraClasses && data.node.extraClasses.indexOf('nv-group-item') != -1) {
                            _renderQQGroupDetail(data.node.data.number);
                        }
                        if (data.node.extraClasses.indexOf('nv-qq-people') != -1) {
                            var className = data.node.span.className;
                            if (className.indexOf('fancytree-hide') != -1) {
                                afterSearchClickQQ(data.node.data);
                            } else if (className.indexOf('fancytree-match') != -1) {
                                afterSearchClickQQ(data.node.data);
                            }
                        }
                    },
                    expand: function(event, data) {
                            if (data.node.extraClasses == 'nv-qq-contact') {
                                data.node.visit(function(node) {
                                    if (node.folder) {
                                        $('.fancytree-title:contains(' + node.title + ')').siblings('.fancytree-expander').attr('id', 'testId-' + node.title);
                                    }

                                })
                            }
                        }
                })

                // fancytree 过滤
                var tree = treeContainer.fancytree("getTree");

                $("input[name=search]").keyup(function(e) {
                    e.preventDefault();
                    var n;
                    var opts = {
                        autoExpand: true
                    };
                    var match = $(this).val();

                    if (e && e.which === $.ui.keyCode.ESCAPE || $.trim(match) === "") {
                        $("button#btnResetSearch").click();
                        return;
                    }
                    n = tree.filterNodes(match, opts);

                    $("button#btnResetSearch").attr("disabled", false);
                    $("span#matches").text("(" + n + ")");
                    if(match != ""){
                        AssistMenu.initContextmenu("#relation-qq-container .nv-qq-people", "span.fancytree-title", yjsPermission, true);
                    }

                });

                $("button#btnResetSearch").click(function(e) {
                    $("input[name=search]").val("");
                    $("span#matches").text("");
                    tree.clearFilter();
                    tree.reload();
                    $(this).attr("disabled", true);
                });

                AssistMenu.initContextmenu("#relation-qq", "a", yjsPermission, true);
            }
        }
    }

    function _renderSocialRelations() {
        if (!_opts.getqqtomobilelist && $.isFunction(_opts.getqqtomobilelist)) {
            disableSocial();
        } else {
            _opts.getqqtomobilelist(function(list) {
                var qq = list.qq;
                var mobile = list.mobile;

                $.getJSON("/renlifang/personcore/getqqtomobilelist", {
                    qqlist: qq,
                    mobilelist: mobile
                }, function(rsp) {
                    if (rsp.code != 0 || !rsp.data || _.isEmpty(rsp.data)) {
                        $("#social-table").empty();
                        $("#social-table").append("<thead><tr><th>暂无通讯录数据</th></tr></thead>");
                    } else {
                        var socialData = rsp.data;

                        var tbody = $("#social-tbody");
                        var column;
                        tbody.empty();

                        _.each(socialData, function(item) {
                            var socialItem = _.extend({
                                valueType: item.valueType
                            }, item);
                            column = $(tplSocialTable(socialItem));
                            tbody.append(column);

                            var a = column.find('.rlf-auto-link');
                            if (socialItem.valueType) {
                                var currentHrefName = IconSet.getcurrentHrefName();
                                AutoLink.initLink(a, currentHrefName, UrlUtil.getProfileUrl(socialItem.tel, socialItem.valueType));
                            }
                        });

                        AssistMenu.initContextmenu("#relation-social", "a.rlf-auto-link", yjsPermission, true);
                    }
                })
            });
        }
    }

    function _renderQQGroupDetail(groupNumber) {
        if (_opts.loadQQGroupDetail && $.isFunction(_opts.loadQQGroupDetail)) {
            var detailContainer = $('#relation-qqgroup-detail');
            detailContainer.empty();
            detailContainer.show();
            _opts.loadQQGroupDetail(groupNumber, function(groupDetail) {
                groupDetail = _.pick(groupDetail, function(value, key) {
                    return (_.isNumber(value) && value != 0) || !_.isEmpty(value);
                })
                groupDetail = _.extend({
                    number: '-',
                    owners: ['-'],
                    description: '-',
                    createTime: '-'
                }, groupDetail);
                detailContainer.append(tplQQGroupDetail(groupDetail));
                detailContainer.find('#relation-qqgroup-tree').fancytree({
                    selectmode: 1,
                    clickFolderMode: 1,
                    checkbox: false,
                    autoScroll: true,
                    source: function() {
                        _.each(groupDetail.members, function(item) {
                            item.title = item.nick + " (" + item.qq + ")";
                        });
                        return [{
                            title: "群成员 (" + groupDetail.count + ")",
                            children: groupDetail.members
                        }];
                    },
                    iconClass: function(event, data) {
                        return "fa fa-qq text-info";
                    },
                    renderNode: function(event, data) {
                        var a = $(data.node.li).find('.rlf-auto-link');
                        var currentHrefName = IconSet.getcurrentHrefName();
                        AutoLink.initLink(a, currentHrefName, UrlUtil.getProfileUrl(data&&data.node&&data.node.data&&data.node.data.qq? data.node.data.qq : '', data&&data.node&&data.node.data&&(data.node.data.valueType!=undefined)? data.node.data.valueType : ''));
                    },
                    renderTitle: function(event, data) {
                        if (data.node.data.valueType && "loading" != data.node.statusNodeType) {
                            return tplQQTitle(data.node.data);
                        }
                    }
                });
            });
        }
    }

    function disableQQ() {
        $('.relation-qq').addClass('hidden');
    }

    function disableSocial() {
        $('.relation-social').addClass('hidden');
    }

    function disablePhoenLink() {
        $('.phone-link').addClass('hidden');
    }

    return {
        init: init,
        render: render,
        disableQQ: disableQQ,
        disableSocial: disableSocial
    };
});