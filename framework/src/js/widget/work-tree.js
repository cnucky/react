define('widget/work-tree', [
    'underscore',
    'jquery',
    'fancytree-all',
    "utility/fancytree/extensions/jquery.fancytree.filter",
    'utility/fancytree/extensions/jquery.fancytree.childcounter'
], function(_, $) {
    var _instance = {};

    function build(opts) {
        _instance.opts = opts;
        $(_instance.opts.container).fancytree({
            extensions: ["filter"],
            autoScroll: _instance.opts.autoScroll || true,
            clickFolderMode: _instance.opts.clickFolderMode || 1,
            selectMode: _instance.opts.selectMode || 3,
            quicksearch: true,
            source: {
                url: "/workspacedir/list"
            },
            filter: {
                mode: "hide",
                autoApply: true
            },
            postProcess: function(event, data) {
                if (data.response) {
                    data.result = data.response.data;
                }
            },
            activate: function(event, data) {
                //        alert("activate " + data.node);
            },
            lazyLoad: function(event, data) {
                data.result = {
                    url: "/workspacedir/sublist",
                    data: {
                        dirId: data.node.key,
                        dirType: data.node.data.dirType
                    }
                };
            },
            iconClass: function(event, data) {
                if (data.node.data.dirType == 2 || data.node.data.dirType == 5 || data.node.data.dirType == 6 || data.node.data.dirType == 7) {
                    return "fa fa-folder fancytree-icon-color-blue";
                } else if (data.node.data.dirType == 22 || data.node.data.dirType == 23 || data.node.data.dirType == 24) {
                    return "fa fa-folder fancytree-icon-color-green";
                } else {
                    return "fa fa-folder fancytree-icon-color";
                }
            }
        });
        return _instance;
    }

    function config(name, value) {
        $(_instance.opts.container).fancytree("option", name, value);
        return _instance;
    }

    return _instance = {
        build: build,
        config: config
    };
});