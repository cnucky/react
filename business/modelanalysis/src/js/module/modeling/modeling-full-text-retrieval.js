define([
    'nova-notify',
    'jquery',
    'underscore'
], function(Notify) {

    function fullTextRetrieval(container) {
        var form = $('<form class="form-retrieval" role="form"></form>');
        var div = $('<div class="form-group mn"></div>');
        var label = $('<label class="col-md-3 control-label text-left">全文搜索</label>');
        var childdiv = $('<div id="retrieval-condition" class="col-md-9"></div>');
        var input = $('<input type="text" id="condition-editor" class="form-control"></input>');
        childdiv.append(input);
        div.append(label);
        div.append(childdiv);
        form.append(div);
        container.append(form);
    }


    function constructTaskDetail() {
        var taskDetail = '';
        return taskDetail;
    }

    return {
        fullTextRetrieval: fullTextRetrieval,
        constructTaskDetail: constructTaskDetail
    }
});
