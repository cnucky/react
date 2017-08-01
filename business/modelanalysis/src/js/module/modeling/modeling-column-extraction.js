define([
    './modeling-column-extraction-post',
    'nova-notify',
    'jquery',
    'underscore'
], function(ColumnExtraction, Notify) {
    function columnExtraction(opts) {
        var columnData = [];
        if(opts.dataList.length > 0) {
            columnData = opts.dataList;
        } else {
            for(var i = 0;i < 3; i++) {
                var temp = {id: i, content: i.toString()};
                columnData.push(temp);
            }
        }
        ColumnExtraction.ColumnExtraction(opts.container, columnData);
    }

    return {
        columnExtraction: columnExtraction
    }
});
