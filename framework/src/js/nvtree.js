define('nvtree', [
    'jquery',
    'fancytree-all',
    'utility/fancytree/extensions/jquery.fancytree.childcounter',
    'utility/contextmenu/jquery.ui-contextmenu'
], function(jQuery) {
    var _instance;
    var _container;
    var _menuAlias = "";

    function config(configuration) {
        _container = configuration.container;
        $(configuration.container).fancytree({
            selectMode: configuration.selectMode,
            clickFolderMode: configuration.clickFolderMode,
            checkbox: configuration.checkbox,
            autoScroll: configuration.autoScroll,
            extensions: configuration.extensions,
            iconClass: function(event, data) {
                if (data.node.isFolder()) {
                    return configuration.folderIcon;
                } else {
                    return configuration.fileIcon;
                };
            },
            select: configuration.select
        });
        return _instance;
    }

    function url(dataUrl) {
        $(_container).fancytree("option", "source", {
            url: dataUrl
        });
        return _instance;
    }

    function data(data) {
        $(_container).fancytree("option", "source", data);
        return _instance;
    }

    function registerMenu(delegate, menu) {
        if (_menuAlias == "") {
            $(_container).contextmenu({
                delegate: delegate,
                menu: menu
            });
            _menuAlias = "contextmenu1";
        } else {
            $.widget(_menuAlias, $.moogle.contextmenu, {});
            $(_container).eval(_menuAlias + "(" + delegate + "," + menu + ")");
            _menuAlias = _menuAlias + 1;
        }
    }

    return _instance = {
        config: config,
        url: url,
        data: data,
        registerMenu: registerMenu
    };
});
