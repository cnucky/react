define("./rlf-behaviors", [
    "../../tpl/rlf/rlf-behavior-panel",
    "./filter-table",
    "jquery",
    "underscore",
    "fancytree-all"
], function (tplBehavior, Table) {
    tplBehavior = _.template(tplBehavior);
    var _opts;

    function init(opts) {
        _opts = opts;
        $(opts.container).append(tplBehavior());
    }

    var behaviorDirs;
    var selectedDir;

    function render() {
        if (!behaviorDirs) {
            loadBehaviorDir();
            $('#button-remove-filter').hide()
        }
    }

    function loadBehaviorDir() {
        behaviorDirs = null;
        showLoader();
        $("#behaviors-dir-tree").fancytree({
            checkbox: false,
            source: {
                url: "/personcore/getbehaviordir"
            },
            renderTitle: function (event, data) {
                var itemTpl = _.template("<span class='fancytree-title'><%- name %></span>");
                return itemTpl(data.node.data);
            },
            postProcess: function (event, data) {
                hideLoader();
                if (data.response) {
                    data.result = data.response.data;
                    behaviorDirs = data.result;
                }
            },
            iconClass: function (event, data) {
                return "fa fa-folder";
            },
            activate: function (event, el) {
                var dir = el.node.data;
                if (dir != selectedDir) {
                    selectedDir = dir;
                    loadBehaviorTable();
                }
            }
        });
    }

    function loadBehaviorTable() {
        tableSwitch(false);
        $.getJSON('/renlifang/personcore/getbehaviordatameta?typeId=' + selectedDir.id, function (rsp) {
            if (rsp.code != 0) {
                alert(rsp.message);
                return;
            }
            var tableMeta = rsp.data[0];
            if (!tableMeta) {
                return;
            }
            $.getJSON('/renlifang/personcore/querybehaviordata?typeId=' + tableMeta.typeId, function (rsp) {
                if (rsp.code != 0) {
                    alert(rsp.message);
                    return;
                }
                var behaviorData = rsp.data;
                if (!behaviorData) {
                    return;
                }
                parseSource(tableMeta, behaviorData);
            });
        });
    }

    function parseSource(meta, behaviorData) {

        var fields = _.map(behaviorData.meta, function (item) {
            item.type = item.type == 1 ? "number" : item.type == 2 ? "string" : "date";
            return item.name;
        });

        var rows = [];
        _.each(behaviorData.records, function (item, index) {
            rows[index] = {};
            _.each(fields, function (f, idx) {
                rows[index][f] = item[idx];
            });
        });

        var columnsCfg = [];
        _.each(behaviorData.meta, function (item, index) {
            var col = {
                text: item.caption,
                datafield: item.name,
            };
            var supportFilter = _.contains(meta.filters, item.name);
            if (item.type == 'string') {
                col.columntype = 'textbox';
                if (supportFilter) {
                    col.filtercondition = 'contains';
                } else {
                    col.filterable = false;
                }
            } else if (item.type == 'number') {
                col.columntype = 'textbox';
                if (supportFilter) {
                    col.filtercondition = 'EQUAL';
                } else {
                    col.filterable = false;
                }
            } else if (item.type == 'date') {
                col.cellsformat = 'd';
                if (supportFilter) {
                    col.filtertype = meta.hasDate == 1 ? 'range' : 'date';
                } else {
                    col.filterable = false;
                }
            }
            columnsCfg[index] = col;
        });

        Table.build({
            container: $('#behaviors-table-container'),
            rows: rows,
            fields: behaviorData.meta,
            columnsCfg: columnsCfg
        });

        tableSwitch(true);
        $('#button-remove-filter').click(function () {
            $('#behaviors-table-container').jqxGrid('clearfilters');
        });
    }

    function tableSwitch(on) {
        if (on) {
            $('#button-remove-filter').show();
            $('#behaviors-table-container').show();
        } else {
            $('#button-remove-filter').hide();
            $('#behaviors-table-container').hide();
        }
    }

    return {
        init: init,
        render: render
    }
});