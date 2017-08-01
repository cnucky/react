define([], function () {
    var _instance;
    var _opts;
    var _menuAlias = "";

    function _processData(result) {
        _.each(result, function (g) {
            if (g.extraClasses.indexOf('nv-folder') != -1) {
                g.folder = true;
                g.lazy = true;
            }
            ;
            if (!_.isEmpty(g.children)) {
                _processData(g.children);
            }
            ;
        });
    }

    function build(opts) {
        _opts = opts;
        var TplBatchTagAndDirErrorTag = _.template('<span class="fancytree-title unselectable"><%- title %></span>' +
            '<span id="favor-toggle" title="有运行的对接任务" class="text-primary fancytree-action-icon fs12 ml5 text-muted glyphicon glyphicon-tasks"></span>'+
            '<span id="favor-toggle" title="多个对接任务监视同一个目录" class="text-danger fancytree-action-icon fs12 ml5 text-muted fa fa-exclamation-triangle"></span>');

        var TplDirErrorTag = _.template('<span class="fancytree-title unselectable"><%- title %></span>' +
            '<span id="favor-toggle" title="多个对接任务监视同一个目录" class="text-danger fancytree-action-icon fs12 ml5 text-muted fa fa-exclamation-triangle"></span>');

        var TplBatchTag = _.template('<span class="fancytree-title unselectable"><%- title %></span>' +
            '<span id="favor-toggle" title="有运行的对接任务" class="text-primary fancytree-action-icon fs12 ml5 text-muted glyphicon glyphicon-tasks"></span>');

        $(_opts.container).fancytree({
            extensions: ["filter"],
            quicksearch: true,
            filter: {
                mode: "dimn",
                autoAppaly: true,
                hightlight: true
            },
            selectMode: _opts.selectMode || 2,
            clickFolderMode: _opts.clickFolderMode ||2, //1,
            autoScroll: true,
            checkbox: _.isUndefined(_opts.checkbox) ? true : _opts.checkbox,
            //clickFolderMode: _opts.clickFolderMode || 1,
            source: opts.source || {
                url: '/datamanage/dataimport/datatypetree',
            },
            init: function (event, data) {
                if (_opts.expandAll) {
                    data.tree.visit(function (node) {
                        //if(node.data.dirId == 12)
                        if (node.parent.title == "root")
                            node.setExpanded(true);
                    })
                }
                else if (_opts.forceExpandAll) {
                }

                if (_opts.init) {
                    _opts.init(event, data);
                }
            },

            postProcess: function (event, data) {
                if (data.response) {
                    data.result = data.response.data; //data.response.data.sysTree; //
                    if (_opts.processData) {
                        _opts.processData(data);
                    }
                }
                // _processData(data.result);
            },

            // 创建title自定义节点
            renderTitle: function (event, data) {
                //if (data.node.extraClasses == "nv-dir" || data.node.extraClasses == "nv-folder")
                if (data.node.extraClasses == "nv-data"){
                    var dataTypeKey = data.node.data.centerCode + '_' + data.node.data.typeId;
                    if(opts.dataTypeTagInfoArray[dataTypeKey] != undefined){
                        // console.log("data", data);
                        // console.log("data", opts.dataTypeTagInfoArray[dataTypeKey]);
                        if(opts.dataTypeTagInfoArray[dataTypeKey].batchTag == 1
                            && opts.dataTypeTagInfoArray[dataTypeKey].dirErrorTag){
                            return TplBatchTagAndDirErrorTag({
                                title: data.node.title
                            });
                        }
                        else if(opts.dataTypeTagInfoArray[dataTypeKey].batchTag == 1){
                            return TplBatchTag({
                                title: data.node.title
                            });
                        }
                        else if(opts.dataTypeTagInfoArray[dataTypeKey].dirErrorTag == 1){
                            return TplDirErrorTag({
                                title: data.node.title
                            });
                        }
                    }
                }
                else{
                    return;
                    //if (data.node.data.source == 3)
                    //    return ;
                }
            },

            iconClass: function (event, data) {
                if (data.node.extraClasses == "nv-dir" || data.node.extraClasses == "nv-folder") {
                    if (data.node.data.source == 3)
                        return "fa fa-share-square";
                    else
                        return "fa fa-folder";
                }
                else {
                    if (data.node.data.source == 3)
                        return "fa fa-share";
                    switch (data.node.data.category) {
                        case 1:
                            return "fa fa-database";
                        case 2:
                            return "fa fa-book";
                        case 3:
                            return "fa fa-table";
                        default:
                            return "fa fa-database";
                    }
                }
            },
        });

        //标签树搜索(过滤)逻辑
        $("input[name=search-input]").keyup(function (event) {
            var targetTree = _opts.container.fancytree('getTree');
            if (!targetTree) {
                return;
            }

            var count, opts = {
                autoExpand: true
            };
            var match = $(this).val();

            if (event && event.which === $.ui.keyCode.ESCAPE || $.trim(match) === "") {
                $("button#btn-reset").click();
                return;
            }
            count = targetTree.filterNodes(match, opts);

            $("button#btn-reset").attr("disabled", false);
            $("span#matches").text("(" + count + ")");
        });
        //搜索条件清除按钮
        $("button#btn-reset").click(function () {
            var targetTree = _opts.container.fancytree('getTree');
            if (!targetTree) {
                return;
            }

            $("input[name=search-input]").val("");
            $("span#matches").text("");
            targetTree.clearFilter();
            $(this).attr('disabled', 'disabled');
        });
        return _instance;
    }

    function buildDepartmentTree(opts) {
        console.log("buildDepartmentTree opts.source", opts.source);
        _opts = opts;
        $(_opts.container).fancytree({
            selectMode: 1,
            clickFolderMode: 1,
            checkbox: _.isUndefined(_opts.checkbox) ? true : _opts.checkbox,
            source: opts.source || {
                url: '/workspacedir/selectusers',
            },
            init: function (event, data) {
                if (_opts.expandAll) {
                    data.tree.visit(function (node) {
                        if (node.parent.title == "root" || node.parent.parent.title == "root")
                            node.setExpanded(true);
                    })
                }
                if (_opts.init) {
                    _opts.init(event, data);
                }
            },
            postProcess: function (event, data) {
                if (data.response) {
                    data.result = data.response.data;
                    if (_opts.processData) {
                        _opts.processData(data);
                    }
                }
            },
            autoScroll: true,
            extensions: ["childcounter"],
            iconClass: function (event, data) {
                if (data.node.extraClasses == "nv-department" || data.node.extraClasses == "nv-folder") {
                    return "fa fa-building";
                }
                else {
                    return "fa fa-user";
                }
            },
        });
        return _instance;
    }

    function isData(node) {
        return node.extraClasses.indexOf('nv-folder') == -1;
    }

    function config(name, value) {
        $(_opts.container).fancytree("option", name, value);
        return _instance;
    }

    function registerMenu(menu) {
        if (_menuAlias == "") {
            $(_opts.container).contextmenu(menu);
            _menuAlias = "contextmenu1";
        } else {
            $.widget("moogle." + _menuAlias, $.moogle.contextmenu, {});
            var mm = $(_opts.container);
            mm[_menuAlias](menu);
            _menuAlias = _menuAlias + 1;
        }
        return _instance;
    }

    function getFTree(container) {
        return $(container).fancytree("getTree");
    }

    return _instance = {
        opts: _opts,
        build: build,
        config: config,
        isData: isData,
        registerMenu: registerMenu,
        getFTree: getFTree,
        buildDepartmentTree: buildDepartmentTree,
    };
});