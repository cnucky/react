define('widget/department-treewidget/department-tree', [
    'underscore',
    'jquery',
    'fancytree-all',
    "utility/fancytree/extensions/jquery.fancytree.filter",
    'utility/fancytree/extensions/jquery.fancytree.childcounter',
    'utility/contextmenu/jquery.ui-contextmenu'
], function (_, $) {
    var tplUserTitle = _.template("<span class='fancytree-title'><%- loginName %><i class='fa fa-lock text-warning ml5'></i></span>");

    function _processData(result) {
        _.each(result, function (g) {
            if (g.extraClasses.indexOf('nv-department') != -1) {
                g.folder = true;
                g.lazy = true;
            }
            if (!_.isEmpty(g.children)) {
                _processData(g.children);
            }
        });
    }

    /*
     opts = {
     selectMode: int,
     checkbox: boolean,
     clickFolderMode: int,
     source: object,
     init: function,
     processData: function
     }
     */
    function build(opts) {

        var _instance = {
            opts: opts,
            config: config,
            menuAlias: '',
            config: config,
            isUser: isUser,
            registerMenu: registerMenu,
            getSelectedNodes: getSelectedNodes,
            getActiveNode: getActiveNode,
            getNodeByKey: getNodeByKey,
        };
        if (_.isString(_instance.opts.container))
            _instance.opts.container = $(_instance.opts.container);
        _instance.opts.container.fancytree({
            autoScroll: true,
            extensions: _instance.opts.extensions || ["filter", "childcounter"],
            quicksearch: true,
            filter: _instance.opts.filter || {
                // mode: "hide",
                autoAppaly: true,
                hightlight: true
            },
            selectMode: _instance.opts.selectMode || 3,
            checkbox: _.isUndefined(_instance.opts.checkbox) ? true : _instance.opts.checkbox,
            clickFolderMode: _instance.opts.clickFolderMode || 1,
            source: _instance.opts.source || {
                url: "/department/listall",
                data:{roleType:1}
            },
            init: function (event, data) {
                if (_instance.opts.expandAll) {
                    data.tree.visit(function (node) {
                        node.setExpanded(true);

                        /*-- TEST CODE BEGIN --*/
                        if (node.folder == undefined || !node.folder) {
                            $('.fancytree-title:contains(' + node.title + ')').siblings('.fancytree-checkbox').attr('id', 'checkboxId-' + node.title);
                        }
                        /*-- TEST CODE END --*/

                    })
                } else if (_instance.opts.forceExpandAll) {

                }
                if (_instance.opts.init) {
                    _instance.opts.init(event, data);
                }
            },
            postProcess: function (event, data) {
                if (data.response) {
                    data.result = data.response.data;
                    if (_instance.opts.processData) {
                        _instance.opts.processData(data);
                    }
                }
                // _processData(data.result);
            },
            autoScroll: true,
            childcounter: {
                deep: true,
                hideZeros: true,
                hideExpanded: true
            },
            iconClass: function (event, data) {
                if (isUser(data.node)) {
                    return "fa fa-user";
                } else {
                    return "fa fa-building";
                }
            },
            loadChildren: function (event, data) {
                // Apply parent's state to new child nodes
                if (this.selectMode == 3) {
                    data.node.fixSelection3AfterClick();
                }
            },
            renderTitle: function (event, data) {
                if (data.node.extraClasses === 'nv-department-people' && data.node.data.accountLockState == 1) {
                    return tplUserTitle(data.node.data);
                }
            },
            select:function(event,data){
                if(_instance.opts.select){
                    _instance.opts.select(event,data);
                }
            },
            table: _instance.opts.table,
            renderColumns: _instance.opts.renderColumns,

        });
        return _instance;
    }

    function config(name, value) {
        this.opts.container.fancytree("option", name, value);
        return this;
    }

    function isUser(node) {
        return node.extraClasses.indexOf('nv-department-people') != -1;
    }

    function getActiveNode() {
        return this.opts.container.fancytree("getTree").getActiveNode();
    }

    function getSelectedNodes() {
        return this.opts.container.fancytree("getTree").getSelectedNodes();
    }

    function getNodeByKey(id) {
        return this.opts.container.fancytree("getTree").getNodeByKey(id);
    }

    function registerMenu(menu) {
        if (this.menuAlias == "") {
            this.opts.container.contextmenu(menu);
            this.menuAlias = "contextmenu1";
        } else {
            $.widget("moogle." + this.menuAlias, $.moogle.contextmenu, {});
            var mm = this.opts.container;

            mm[this.menuAlias](menu);
            _menuAlias = this.menuAlias + 1;
        }
        return this;
    }

    return {
        build: build,
        isUser: isUser,
    };
});