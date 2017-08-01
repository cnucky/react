require('i18n');
registerLocales(require.context('../../../locales/workprocess', false, /\.js/));
define([
    'tpl/workprocess/tpl-new-issues.html',
    'tpl/workprocess/tpl-issues-list.html',
    'widget/icon-flash',
    'module/workprocess/utility',
    'module/workprocess/customcfg'
], function(issuesTpl, issuesListTpl, iconFlash, utility, customcfg) {
    var cfgsystem = window.__CONF__.config_system;

    var taskList = [];
    var totalCount = 0;
    var showCount = 10;

    issuesTpl = _.template(issuesTpl);
    issuesListTpl = _.template(issuesListTpl);

    function processTooltip() {
        if(!!cfgsystem.is_oversea) return;

        $(".navbar-fixed-top .navbar-right").prepend(issuesTpl());
        $('#process-tooltip [data-i18n]').localize();
        addStyle();
        initButton();

        var messageHandler = getMessageHandler();
        registerMessageHandler(4, messageHandler);
        messageHandler();
    }

    function getMessageHandler(){
        // 收到消息之后，等待一秒钟，然后更新数据
        var requestID;
        return function(message){
            if(message)
                message.ack();
            if(requestID)
                window.clearTimeout(requestID);
            requestID = window.setTimeout(reloadData, 1000);
        };
        function reloadData(){
            requestID = undefined;
            $.get('/workflow/getToDoIssuesByUserId', {
                startPos: 0,
                count: showCount
            }).done(function(res) {
                res = JSON.parse(res);
                if(res.code != 0)
                    return ;
                totalCount = res.data.totalCount;
                taskList = res.data.taskList;
                $("#span-task-number").html(totalCount == 0 ? '' : totalCount);
                iconFlash.stopflash();
                if(totalCount != 0)
                    iconFlash.flash({
                        container: $("#span-task-number"),
                        interval: 350,
                        period: 5000
                    });
                if($("#btn-task-dropdown").attr("aria-expanded") === "true")
                    addIssues();
            });
        }
    }

    function initButton() {
        $("#btn-task-dropdown").on("click", function() {
            if($(this).attr("aria-expanded") != "true")
                addIssues();
        });
        $("#process-tooltip").on('click', "#task-dropdown-menu", function() {
            $("#process-tooltip .btn-group").addClass("open");
        })
        $("#issues-list").on("click", "a.task-link", function() {
            var taskId = $(this).data("taskid");
            var taskInfo = _.find(taskList, function(item) {
                return item.strTaskID == taskId;
            });
            customcfg.init(function(){
                var url = encodeURIComponent(customcfg.getCustomUrl(taskInfo) + '?strTaskId=' +  taskInfo.strTaskID);
                window.location.href = "/workprocess/workprocess.html?type=" + taskInfo.strTaskType + "&url=" + url;
            })
        })
    }

    function addIssues(){
        $("#issues-list").empty();
        var showCountTpl = _.template(i18n.t("workprocess.processtooltip.showcount"));
        $("#show-issues-count").html(showCountTpl({
            showCount: showCount > totalCount ? totalCount : showCount
        }));
        _.each(taskList, function(item) {
            var data = {
                userName: item.tStartUser.strUserName,
                taskId: item.strTaskID,
                taskType: item.strTaskType,
                time: formatTime(item.strCreateTime),
                taskContent: item.strBusinessInfo
            }
            $("#issues-list").append(issuesListTpl(data))
        })
        
        function formatTime(createTime) {
            var thisTime = Date.now();
            var createTime = new Date(createTime).getTime();
            var time = Math.floor((thisTime - createTime)/1000);
            var s = time%60;
            var m = Math.floor(time/60)%60;
            var h = Math.floor(time/60/60)%24;
            var day = Math.floor(time/60/60/24)%30;
            var month = Math.floor(time/60/60/24/30)%12;
            var year =  Math.floor(time/60/60/24/365);
            if(year > 0)
                return year + i18n.t("workprocess.processtooltip.yearsago");
            if(month > 6) 
                return i18n.t("workprocess.processtooltip.halfyearago");
            if(month > 0)
                return month + i18n.t("workprocess.processtooltip.monthsago");
            if(day > 15)
                return i18n.t("workprocess.processtooltip.halfmonthago");
            if(day > 0)
                return day + i18n.t("workprocess.processtooltip.daysago");
            if(h > 0)
                return h + i18n.t("workprocess.processtooltip.hoursago");
            if(m > 0)
                return m + i18n.t("workprocess.processtooltip.minutesago");
            return i18n.t("workprocess.processtooltip.justnow");
        }
    }

    function addStyle() {
        $('head').append(`<style>
            #issues-list .media {
                padding: 10px 10px 0px;
                margin-top: 0px;
            }
            #issues-list .media-heading {
                margin-bottom: 5px;
                font-weight: normal;
                color: #777;
                font-size: 12px;
            }
            #issues-list .media-body {
                display: block;
                padding: 0 10px;
                border-bottom: 1px solid #e1e1e1;
            }
            #issues-list .media:last-child .media-body {
                border-bottom: none;
            }
            #issues-list .issue-content {
                word-break: break-all;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }
            #issues-list .issue-tasktype {
                display: inline-block;
                max-width: 80px;
                color: #666;
            }
            #issues-list .issue-time {
                display: block;
                float: right;
                color: #900;
                font-weight: normal;
            }
            #process-tooltip .task-panel::-webkit-scrollbar {
                width: 5px;
            }
            #process-tooltip .task-panel::-webkit-scrollbar-track{
                background-color: #EEE;
            }
            #process-tooltip .task-panel::-webkit-scrollbar-thumb{
                background-color: rgba(0,0,0,0.2);
            }
            </style>`);
    }

    return processTooltip;
})