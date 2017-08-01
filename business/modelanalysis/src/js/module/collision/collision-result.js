var $ = require('jquery');
var _ = require('underscore');
var Pagination = require('widget/rlf-pagination');
var tpl = require('../../tpl/rlf/rlf-profile-company-detail');
tpl = _.template(tpl);
var _task, retryCount;
var PAGE_SIZE = 20, RETRY_LIMIT = 5;

function showResult() {
    $("#collision-condition").hide();
    if (_task.result) {
        $("#collision-result").show();
        $("#result-toggle").html("收起结果").show();
        $("#collision-result .result-table").empty();
        $("#collision-result .progress").remove();
        if (_task.result.resultCount == 0) {
            $("#collision-result .result-table").append('<p>没有查询结果</p>');
        } else {
            var rlt = $(tpl(_task.result));
            $("#collision-result .result-table").append('<label style="padding-left:10px">集合分析任务结果上限为100万条,当前共有'+_task.result.resultCount+'条记录</label>').append(rlt);
            var page = Math.ceil(_task.result.resultCount / PAGE_SIZE);
            if (page > 1) {
                if ($("#collision-result .pagination").length == 0) {
                    Pagination.init({
                        container: $("#collision-result .result-pagination"),
                        max: 3,
                        pageCallback: function(currentPage) {
                            queryResult(_task, (currentPage - 1) * PAGE_SIZE);
                        }
                    });
                }
                Pagination.renderPagination(page);
            }
        }
    }
}

function showProgress(progress) {
    $("#collision-condition").hide();
    $("#collision-result").show();
    $("#collision-result .result-table").empty();
    $("#collision-result .result-pagination").empty();
    if ($("#collision-result .progress").length > 0) {
        //$("#collision-result .progress-bar").attr('aria-valuenow', progress).css('width', progress + "%").html(progress + "%");
    } else {
        var progressTpl = _.template('<div class="progress" style="top:45%;position:relative;"><div class="progress-bar progress-bar-info progress-bar-striped active" role="progressbar" aria-valuenow="100%" aria-valuemin="0" aria-valuemax="100" style="width:100%;"></div></div>');
        $("#collision-result").append(progressTpl({
            percent: progress
        }));
    }

}

function queryResult(task, index, onLoad, onError) {
    _task = task;
    task.loading = true;
    $.getJSON("/modelanalysis/collision/getresult", {
        taskid: task.id,
        needmeta: 1,
        startindex: index || 0,
        length: 20
    }, function(rsp) {
        if (rsp.code == 0) {
            retryCount = 0;

            if (rsp.data.taskRatio == 100) {
                task.result = rsp.data;
                task.loading = false;
                showResult();

                _.isFunction(onLoad) && onLoad(task.result);
            }  else {
                setTimeout(function() {
                    queryResult(task, index, onLoad, onError);
                }, 1000);
                showProgress(rsp.data.taskRatio == undefined ? 0 : rsp.data.taskRatio);
            }
        } else if (retryCount < RETRY_LIMIT) {
            retryCount++;
            setTimeout(function() {
                queryResult(task, index, onLoad, onError);
            }, 1000);
        } else {
            _.isFunction(onError) && onError(rsp.message);
        }
    });
}

function loadResult(task, onLoad, onError) {
    retryCount = 0;

    queryResult(task, 0, onLoad, onError);
}

module.exports.loadResult = loadResult;
module.exports.showProgress = showProgress;