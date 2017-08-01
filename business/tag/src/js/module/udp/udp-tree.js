define('udp/udp-tree', [
    'underscore',
    'jquery',
    'fancytree-all',
    'utility/fancytree/extensions/jquery.fancytree.childcounter',
    'utility/contextmenu/jquery.ui-contextmenu'
], function(_, jQuery) {
    var _instance;
    var _opts;
    var _menuAlias = "";

    function _processData(result) {
        _.each(result, function(g) {
            if (g.extraClasses.indexOf('nv-folder') != -1) {
                g.folder = true;
                g.lazy = true;
            };
            if (!_.isEmpty(g.children)) {
                _processData(g.children);
            };
        });
    }

    function build(opts) {
        _opts = opts;
        $(_opts.container).fancytree({
            selectMode: _opts.selectMode || 3,
            checkbox: _.isUndefined(_opts.checkbox) ? true : _opts.checkbox,
            clickFolderMode: _opts.clickFolderMode || 1,
            source: opts.source || {
                url: "/udp/queryDir",
                data: {
                    id: 12,
                    queryType: 2
                }
            },
            init: function(event, data) {
                if (_opts.expandAll) {
                    data.tree.visit(function(node) {
                        node.setExpanded(true);
                    })
                } else if (_opts.forceExpandAll) {

                }
                if (_opts.init) {
                    _opts.init(event, data);
                }
            },
            postProcess: function(event, data) {
                if (data.response) {
                    data.result = data.response.data;
                    if (_opts.processData) {
                        _opts.processData(data);
                    }
                }
                // _processData(data.result);
            },
            autoScroll: true,
            extensions: ["childcounter"],
            childcounter: {
                deep: true,
                hideZeros: true,
                hideExpanded: true
            },
            iconClass: function(event, data) {
                if (!isData(data.node)) {
                    return "fa fa-folder";
                } else if (data.node.extraClasses.indexOf('nv-structure') != -1) {
                    return "fa fa-table";
                } else if (data.node.extraClasses.indexOf('nv-unstructure') != -1) {
                    return "fa fa-book";
                } else {
                    return "fa fa-database";
                }
            },
            lazyLoad: function(event, data) {
                if (data.node.isFolder()) {
                    data.result = {
                        url: "/udp/queryDir",
                        data: {
                            id: data.node.data.id
                        }
                    };
                }
            },
            loadChildren: function(event, data) {
                // Apply parent's state to new child nodes
                if (this.selectMode == 3) {
                    data.node.fixSelection3AfterClick();
                }
            }
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
        getFTree: getFTree
    };
});