/**
 * Created by maxiaodan on 2016/12/6.
 */
define(['../../../config'], function (config) {
    var dlg = {
        getLi: function (data) {
            var lis = "";
            data.forEach(function (item, i) {

                var li = '<li>' +
                    '<div class="icon"><img src="./img/' + item.type + '.png"></div>' +
                    '<div class="content-text"><div>' + item.content + '</div></div>' +
                    '<div class="time">' + item.time + '</div>' +
                    '</li>';
                lis = lis + li;
            });
            return lis;
        },
        taskCallback: new Object(),
        Init: function () {
            var backgroud = '<div id="dlgBackgroud" class="dlg-backgroud"></div>';
            var content = '<div id="dlgContent" class="dlg-content">' +
                '<div id="left" class="leftPanel"><iframe id="left-iframe" src=""></iframe></div>' +
                '<div id="right" class="rightPanel"></div>' +
                '</div>';
            var button = '<div id="dlgClose" class="dlg-close" ></div>';

            $("body").append(content);
            $("body").append(backgroud);
            $("#dlgContent").append(button);
            $("#dlgClose").click(function () {
                dlg.Close();
            });
        },
        addtimeline: function (entityId, rightPanelData, type) {
            var timeline = '<div id="timeline-div">' +
                '<div id="timeline-title">异常情况</div>' +
                '<div id="gradient"></div>' +
                '<div id="timeline-content">' +
                '<ul id="timeline">' + this.getLi(rightPanelData) +
                '</ul>' +
                '</div>' +
                '</div>';

            if (type === undefined) {
                type = 3;
            }

            var leftPanelUrl = config.P3URL + "/renlifang/profile.html?entityid=" + window.btoa(entityId) + "&entitytype=" + window.btoa(type);
            $("#left-iframe")[0].src = leftPanelUrl;
            $("#right").empty();
            $("#right").append(timeline);
        },
        initTask: function (taskData) {
            // taskData = [
            //     {taskId: 1, taskName: "任务1"},
            //     {taskId: 2, taskName: "任务2"},
            //     {taskId: 3, taskName: "任务3"},
            //     {taskId: 4, taskName: "任务4"},
            //     {taskId: 5, taskName: "任务5"}
            // ];
            var $bar_control = $("#bar-control");
            taskData.forEach(function (item, index) {
                var check = '';
                if (index == 0) {
                    check = 'checked';
                }
                var label = '<label>' +
                    '<input type="radio" class="detail-select" name="detail-type" ' + check + ' id="detail-relation-' + item.taskId + '" />' +
                    '<span>NO:' + (index + 1) + '</span>' +
                    '<p>' + item.taskName + '</p>' +
                    '<span class="taskid">' + item.taskId + '</span>' +
                    '</label>';
                $bar_control.append(label);
            });
        },
        taskChange: function () {
            var taskId = $("#bar-control input:checked").siblings(".taskid").text();
            console.log(taskId);
            dlg.taskCallback(taskId);
        },
        Close: function () {
            $("#dlgBackgroud").hide();
            $("#dlgContent").hide();
        },

        Open: function () {
            var dlgWidth = parseInt($('#dlgContent').css("width").substring(0, $('#dlgContent').css("width").length - 2));
            var dlgHeight = parseInt($('#dlgContent').css("height").substring(0, $('#dlgContent').css("height").length - 2));
            $("#dlgBackgroud").css({
                width: $(document.body)[0].scrollWidth + 'px',
                height: $(document.body)[0].scrollHeight + 'px'
            });
            $("#dlgContent").css({
                left: ($(document.body)[0].clientWidth / 2 - dlgWidth / 2) + 'px',
                top: ($(document.body)[0].scrollTop + $(document.body)[0].clientHeight / 2 - dlgHeight / 2) + 'px'
            });
            $("#dlgBackgroud").show();
            $("#dlgContent").show();
        }
    };

    function getDlg() {
        return dlg;
    }
    return {
        getDlg: getDlg
    }
});