define('widget/group-tree', [
    'jquery',
    'fancytree-all',
    'utility/fancytree/extensions/jquery.fancytree.childcounter',
    'utility/contextmenu/jquery.ui-contextmenu'
], function(jQuery) {
    var _instance;
    var _opts;
    var _menuAlias = "";

    function _processData(result) {
        _.each(result, function(g) {
            if (g.extraClasses.indexOf('nv-department') != -1) {
                g.folder = true;
                g.lazy = true;
            };
            if (!_.isEmpty(g.children)) {
                processData(g.children);
            };
        });
    }

    function build(opts) {
        _opts = opts;
        $(_opts.container).fancytree({
            selectMode: _opts.selectMode || 3,
            checkbox: _opts.checkbox || true,
            clickFolderMode: _opts.clickFolderMode || 2,
            source: {
                url: "/usergroup/list"
            },
            postProcess: function(event, data) {
                data.result = data.response.data;
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
                if (data.node.isFolder()) {
                    return "fa fa-group";
                } else {
                    return "fa fa-user";
                };
            },
            lazyLoad: function(event, data) {
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

    function config(name, value) {
        $(_opts.container).fancytree("option", name, value);
        return _instance;
    }

    function url(dataUrl) {
        $(_opts.container).fancytree("option", "source", {
            url: dataUrl
        });
        return _instance;
    }

    function data(data) {
        $(_opts.container).fancytree("option", "source", data);
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

    return _instance = {
        opts: _opts,
        build: build,
        config: config,
        url: url,
        data: data,
        registerMenu: registerMenu
    };
});
