define('widget/filter-table', [], function() {

    function build(opts) {
        var source = {
            localdata: opts.rows,
            datafields: opts.fields,
            datatype: "array"
        };

        var dataAdapter = new $.jqx.dataAdapter(source);
        opts.container.jqxGrid({
            width: 700,
            source: dataAdapter,
            showfilterrow: true,
            filterable: true,
            selectionmode: 'multiplecellsextended',
            columns: opts.columnsCfg
        });
    }

    function filter() {

    }

    return {
        build: build,
        load: filter
    };
});
