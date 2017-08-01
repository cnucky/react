define([
], function() {
    var config;
    function init(callback){
        $.getJSON("/workflow/getcustomcfg", function(data){
            if(data.code != 0) 
                config = [];
            config = data.data;
            callback();
        });
    }

    function isMatch(item, task) {
        var ret = true;
        ret &= item.taskTag == undefined || item.taskTag == '' || (task.tTaskTags != undefined && task.tTaskTags.includes(item.taskTag));
        ret &= item.processType == undefined || item.processType == '' || item.processType == task.strProcessType;
        ret &= item.nodeType == undefined || item.nodeType == '' || item.nodeType == task.strTaskType;
        return ret;
    }

    function getCustomUrl(task){
        var node = config.find(function(item){
            return item.detailPage != undefined && item.detailPage != '' && isMatch(item, task);
        });
        return !!node ? node.detailPage : 'processinfo.html'; 
    }

    function getCustomListUrl(task) {
        var node = config.find(function(item){
            return item.listPage != undefined && item.listPage != '' && isMatch(item, task);
        });
        return !!node ? node.listPage : 'workprocesslist.html'; 
    }

    function getOnSave(task){
        var node = config.find(function(item){
            return item.onSaveUri != undefined && item.onSaveUri != '' && isMatch(item, task);
        });
        return !!node ? node.onSaveUri: undefined; 
    }

    function getSubmitActions(task){
        var node = config.find(function(item){
            return item.submitActions != undefined && isMatch(item, task);
        });
        return !!node ? node.submitActions : undefined; 
    }

    return {
        init: init,
        getCustomUrl: getCustomUrl,
        getCustomListUrl: getCustomListUrl,
        getSubmitActions: getSubmitActions,
        getOnSave:getOnSave, 
    };
});