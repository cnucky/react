define("./rdp-relation", [
    "../../tpl/rlf/rlf-profile-qqgroup-detail",
    "../../tpl/rlf/rlf-profile-social-relations",
    "../../tpl/rdp/rdp-relations",
    "../renlifang/rlf-icon-set",
    "../renlifang/rlf-auto-link",
    'moment',
    "jquery",
    "underscore",
    "fancytree-all",
    "utility/fancytree/extensions/jquery.fancytree.filter"
], function(tplQQGroupDetail, tplSocialTable, tplRelations, IconSet, AutoLink) {
    tplQQGroupDetail = _.template(tplQQGroupDetail);
    tplSocialTable = _.template(tplSocialTable);
    tplRelations = _.template(tplRelations);
    var tplQQTitle = _.template("<span class='fancytree-title'><%- nick + '  ' %>(<a class='rlf-auto-link' href='javascript:void()'><%- qq %></a>)</span>");



    function init(opts) {
        var _opts;
        var position, idInfo;
        _opts = opts;
        idInfo = opts.idInfo;
        position = opts.position;
        var result = $(tplRelations({
            qid: "relation-qq" + opts.idInfo,
            qhid: "#relation-qq" + opts.idInfo,
            sid: "relation-social" + opts.idInfo,
            shid: "#relation-social" + opts.idInfo
        }));
        $(opts.container).append(result);

        function render() {
            // render QQ
            _renderQQ();

            // render Social Relations
            _renderSocialRelations();

            // 点击没有隐藏的那个 tab
            _.find($(position + " " + "#relations" + idInfo + " ul li a"), function(item) {
                if (!$(item).hasClass('hidden')) {
                    $(item).click();
                    return true;
                }
            });
        }

        function _renderQQ() {
            if ($.isFunction(_opts.qqSource) && !_opts.qqSource()) {
                disableQQ();
            } else {
                var treeContainer = $(position + " " + '#relation-qq-container'); //
                if (!treeContainer.hasClass('qq-tree-container')) {
                    treeContainer.addClass('qq-tree-container');
                    treeContainer.fancytree({
                        extensions: ["filter"],
                        quicksearch: true,
                        filter: {
                            mode: "dimm",
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
                            AutoLink.initLink(a, currentHrefName, '/renlifang/profile.html?entityid=' + (data.node.data.qq == undefined ? '' : BASE64.encoder(data.node.data.qq)) + "&entitytype=" + (data.node.data.valueType == undefined ? '' : BASE64.encoder('' + data.node.data.valueType)));
                        },
                        renderTitle: function(event, data) {
                            if (data.node.extraClasses === 'nv-qq-people' && data.node.data.valueType && "loading" != data.node.statusNodeType) {
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
                            })
                        },
                        activate: function(event, data) {
                            if (data.node.extraClasses && data.node.extraClasses.indexOf('nv-group-item') != -1) {
                                _renderQQGroupDetail(data.node.data.number);
                            }
                        }
                    });

                    // fancytree 过滤
                    var tree = treeContainer.fancytree("getTree");
                    $(position + " " + "input[name=search]").keyup(function(e) { //
                        var n;
                        var opts = {
                            autoExpand: true
                        };
                        var match = $(this).val();

                        if (e && e.which === $.ui.keyCode.ESCAPE || $.trim(match) === "") {
                            $(position + " " + "button#btnResetSearch").click(); //
                            return;
                        }
                        n = tree.filterNodes(match, opts);

                        $(position + " " + "button#btnResetSearch").attr("disabled", false); //
                        $(position + " " + "span#matches").text("(" + n + ")"); //
                    });

                    $(position + " " + "button#btnResetSearch").click(function(e) { //
                        $(position + " " + "input[name=search]").val(""); //
                        $(position + " " + "span#matches").text(""); //
                        tree.clearFilter();
                    }).attr("disabled", true);
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

                    $.getJSON("/relationanalysis/personcore/getqqtomobilelist", {
                        qqlist: qq,
                        mobilelist: mobile
                    }, function(rsp) {
                        if (rsp.code != 0 || !rsp.data || _.isEmpty(rsp.data)) {
                            $(position + " " + "#social-table").empty(); //
                            $(position + " " + "#social-table").append("<thead><tr><th>无社会关系数据</th></tr></thead>"); //
                        } else {
                            var socialData = rsp.data;

                            var tbody = $(position + " " + "#social-tbody"); //
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
                                    AutoLink.initLink(a, currentHrefName, '/renlifang/profile.html?entityid=' + BASE64.encoder(socialItem.tel) + "&entitytype=" + BASE64.encoder(socialItem.valueType.toString()));
                                }
                            });
                        }
                    })
                });
            }
        }

        function _renderQQGroupDetail(groupNumber) {
            if (_opts.loadQQGroupDetail && $.isFunction(_opts.loadQQGroupDetail)) {
                var detailContainer = $(position + " " + '#relation-qqgroup-detail'); //??????
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
                            AutoLink.initLink(a, currentHrefName, '/renlifang/profile.html?entityid=' + BASE64.encoder(data.node.data.qq) + "&entitytype=" + BASE64.encoder('' + data.node.data.valueType));
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
            $(position + " " + '.relation-qq').addClass('hidden'); //
        }

        function disableSocial() {
            $(position + " " + '.relation-social').addClass('hidden'); //
        }

        return {
            render: render,
            disableQQ: disableQQ,
            disableSocial: disableSocial
        };
    }




    return {
        init: init
    };
});
