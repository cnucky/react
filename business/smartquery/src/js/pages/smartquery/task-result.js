initLocales();
require(['widget/jqx-binding', '../../module/smartquery/toolbar', ], function(jqxResult, toolbar) {

    hideLoader();

    function getURLParameter(name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || null;
    }

    /*EDIT BY huangjingwei BEGIN */
    //add breadcrumb for result
    var taskId = getURLParameter("taskId");
    $.getJSON('/smartquery/smartquery/taskinfo', {
        taskid: taskId
    }).done(function(rsp) {
        var nodeName = '';
        if (rsp.code != 0) {} else {
            if (rsp.data.mainTask) {
                if (rsp.data.mainTask.taskName) {
                    nodeName = rsp.data.mainTask.taskName;
                }
            }
        }
        $('#topbar .breadcrumb .crumb-trail').remove();
        $('.breadcrumb').append('<li class="crumb-trail">' + nodeName + '</li>');

    });

    /*EDIT BY huangjingwei END */



    toolbar.init({
        container: $('#panel-menu'),
        submit: false,
        saveTask: false,
        saveModel: false,
        saveAsModel: false,
        exportData: true,
        download: false,
        statistic: false,
        filter: true,
        group: true,
        locate: false,
        taskId:taskId
    });
    toolbar.renderToolbar();
    jqxResult.TryBindResult('#gridContainer', {
        taskId:taskId,
        queryType:1
    });
});