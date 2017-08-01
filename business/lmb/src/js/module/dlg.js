/**
 * Created by maxiaodan on 2016/12/6.
 */
define(['../../../config'], function (config) {
    var dlg = {
        getLi: function (data) {
            var lis = "";
            data.forEach(function (item, i) {
                var type = "";
                var text = "其他异常活动";
                switch (item.detail_info.sub_rule_id) {
                    case "1001": // rule id 1001 与特定国家通联 detail info 描述
                        type = "Phone";
                        text = item.detail_info.user_number + "与" + item.detail_info.oppo_country + item.detail_info.oppo_number + "通联";
                        break;
                    case "2001": // rule id 2001 接听IP电话 detail info 描述
                        type = "Phone";
                        text = item.detail_info.user_number + "接听" + item.detail_info.ip_number + "IP电话";
                        break;
                    case "3001": // rule id 3001 使用vpn detail info 描述
                        type = "Globe";
                        text = item.detail_info.aaa_username + "使用vpn";
                        break;
                    case "4001":
                        type = "Dialogue"; // rule id 4001 使用特定即时通讯工具聊天 detail info 描述
                        text = "使用特定即时通讯工具" + item.detail_info.app_name + "聊天";
                        break;
                    case "5001": // 5001 使用网盘 detail info 描述
                        type = "Globe";
                        text = "使用" + item.detail_info.service_name + "，域名：" + item.detail_info.domain;
                        break;
                    case "6001": // 6001 异常开关机 detail info 描述
                        type = "Mail";
                        text = item.detail_info.user_number + "今日异常开关机次数：" + item.detail_info.close_count;
                        break;
                    case "7001":
                        type = "Globe";
                        text = "出境次数:" + item.detail_info.out_count;
                        break;
                    case "7002":
                        type = "Globe";
                        text = "出境国家:" + item.detail_info.out_country;
                        break;
                    case "7003":
                        type = "Globe";
                        text = "出境口岸名称:" + item.detail_info.out_port;
                        break;
                    case "7004":
                        type = "Globe";
                        text = "与新疆案件库人员乘坐同一航班/车次的次数:" + item.detail_info.xj_base_company_count;
                        break;
                    case "7005":
                        type = "Globe";
                        text = "出境逗留天数超过30天的次数:" + item.detail_info.out_30_day_count;
                        break;
                    case "7006":
                        type = "Globe";
                        text = "到云南两广离境前地点:" + item.detail_info.ynlg_before_out_space;
                        break;
                    case "7007":
                        type = "Globe";
                        if (item.detail_info.is_19 === "1") {
                            text = "是IS_19目标";
                        }
                        text = "非IS_19目标";
                        break;
                    case "7008":
                        type = "Globe";
                        if (item.detail_info.dyy_19 === "1") {
                            text = "是东伊运_19目标";
                        }
                        text = "非东伊运_19目标";
                        break;
                    case "7009":
                        type = "Globe";
                        if (item.detail_info.illegal_out_19 === "1") {
                            text = "是非法出境_19";
                        }
                        text = "正常出境_19";
                        break;
                    case "7010":
                        type = "Globe";
                        if (item.detail_info.miss_19 === "1") {
                            text = "是失踪和去向不明人员_19";
                        }
                        text = "非失踪和去向不明人员_19";
                        break;
                    default:
                        type = "Mail";
                        text = "其他异常活动";
                }

                var li = '<li>' +
                    '<div class="icon"><img src="./img/' + type + '.png"></div>' +
                    '<div class="content-text"><div>' + text + '</div></div>' +
                    '<div class="time">' + item.detail_info.cap_time + '</div>' +
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
                type = 1;
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