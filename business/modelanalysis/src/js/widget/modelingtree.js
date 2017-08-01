define('./modelingtree', [
    'underscore',
    'config',
    'jquery',
    'fancytree-all',
    "utility/fancytree/extensions/jquery.fancytree.filter",
    'utility/fancytree/extensions/jquery.fancytree.childcounter'
], function(Config, _, $) {
    var _instance;
    var _opts;
    function buildTree(opts) {
        _opts = opts;
        $(opts.container).fancytree({
            selectMode: 2,
            clickFolderMode: 1,
            autoScroll: true,
            source: {
                url: "/modelanalysis/modeling/listmodelingtree"
            },
            iconClass: function(event, data) {
                if (data.node.extraClasses.indexOf("nv-dir") != -1) {
                    return "fa fa-folder fa-fw";
                } else {
                    return "fa fa-gear fa-fw";
                }
            },
            postProcess: function(event, data) {
                if (data.response) {
                    data.result = data.response.data;
                }
            },
        });
        return _instance
    }

    function config(name, value) {
        $(_opts.container).fancytree("option", name, value);
        return _instance;
    }

    return _instance = {
        opts: _opts,
        buildTree: buildTree,
        config: config
    };
});