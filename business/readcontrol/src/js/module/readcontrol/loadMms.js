define(
    [
        'underscore',
        './library'

    ], function (_,lib) {
        //+++++++++++++定义的变量++++++++++

        var nodes_code1 = '', nodes_code2 = ''; //邮件图 、邮件头code
        var tempNum1 = 0, tempNum2 = 0, tempNum3 = 0;
        var imgAtt=''; //add
        var send_time=i18n.t("dataprocess.name.send_time");
        var user_CC=i18n.t("dataprocess.name.user_CC");
        var user_BCC=i18n.t("dataprocess.name.user_BCC");
        var view_more=i18n.t("dataprocess.action.view_more");

        //++++++++++++++++++业务方法++++++++++++++

        // 重组收件人信息
        function reList(sI, eI, div, obj, x) {
            var recDiv = $("#receivers");
            for (i = sI; i < eI; i++) {
                $(div).append(obj[i]);
                if (x == 1 && recDiv.height() > 38) {
                    tempNum1++;
                } else if (x == 2 && recDiv.height() > 38) {
                    tempNum1++;
                    tempNum2++;
                } else if (x == 3 && recDiv.height() > 38) {
                    tempNum1++;
                    tempNum3++;
                }
            }
        }

        //去掉< >
        function noBkts(str) {
            return str.replace(/</ig, '').replace(/>/ig, '');
        }

        //加载编码信息
        function load_encode_info(){
            lib.loadCodes("#titleEnCode");
            lib.loadCodes("#contEnCode");
            lib.loadFonts("#fontFamily");
        }
        //加载邮件内容
        function load_mms_cont(obj) {
            if(!lib.checkBlank(obj)){
                return;
            }
            imgAtt = '';
            lib.set_wrap_width_height();
            var muted = "text-muted";
            //发件人信息
            if (lib.checkBlank(obj.senders)) {
                var senders = '';
                for (var i = 0; i < obj.senders.length; i++) {
                    senders += noBkts(obj.senders[i].tel)+";";
                }
                $("#senders").html(senders);
            }
            //发件时间
            if (lib.checkBlank(obj.sendTime)) {
                $("#sendTime").html(send_time+' ').next("span").html(obj.sendTime);
            }
            //收件人列表
            if (lib.checkBlank(obj.receivers)) {
                var recDivID = '#receivers';
                var moreRecDivID = "#more_receivers";
                //按收件人、抄送、密送重新排列
                var receivers1 = [], receivers2 = [], receivers3 = [];
                for (var i = 0; i < obj.receivers.length; i++) {
                    var tempSpan='<span>' + noBkts(obj.receivers[i].tel) + '; </span>';
                    switch (obj.receivers[i].type){
                        case "To":
                            receivers1.push(tempSpan);
                            break;
                        case "Cc":
                            receivers2.push(tempSpan);
                            break;
                        case "Bcc":
                            receivers3.push(tempSpan);
                            break;
                    }
                }
                //假设全部显示，找出超出3行的i
                var l1 = receivers1.length;
                var l2 = receivers2.length;
                var l3 = receivers3.length;
                var newD1 = '<div id="more_receivers" class="collapse">' +
                            '<div class="part1"></div><div>';
                var newD2 = '<div class="part2"><i class="' + muted + '">'+user_CC+'</i></div>';
                var newD3 = '<div class="part3"><i class="' + muted + '">'+user_BCC+'</i></div>';
                var link = '<a data-toggle="collapse" href="' + moreRecDivID + '" class="view in">'+view_more+'</a>';
                tempNum1 = 0;
                tempNum2 = 0;
                tempNum3 = 0;
                if (l1 > 0) {
                    $(recDivID).html('<div></div>');
                    reList(0, l1, "#receivers div:eq(0)", receivers1, 1);
                }
                if (l2 > 0) {
                    $(recDivID).append(newD2);
                    reList(0, l2, "#receivers div:eq(1)", receivers2, 2);
                }
                if (l3 > 0) {
                    $(recDivID).append(newD3);
                    reList(0, l3, "#receivers div:eq(2)", receivers3, 3);
                }
                //处理超出的部分
                if (tempNum1 > 0) {
                    var n = l1 + l2 + l3 - tempNum1;
                    $(recDivID).find("span:eq(" + n + ")").addClass("a");
                    if (tempNum1 >= l2 + l3) {
                        $(recDivID).find("div:eq(1)").remove();
                        $(recDivID).find("div:eq(2)").remove();
                        $(recDivID).find("span:gt(" + (n - 2) + ")").remove();
                        $(recDivID).find("div:eq(0)").append(link);
                        $(recDivID).append(newD1);
                        if (l2 > 0) $(moreRecDivID).append(newD2);
                        if (l3 > 0) $(moreRecDivID).append(newD3);
                        reList(n - 1, l1, moreRecDivID + " .part1", receivers1, 4);
                        reList(0, l2, moreRecDivID + " .part2", receivers2, 4);
                        reList(0, l3, moreRecDivID + " .part3", receivers3, 4);
                    } else if (tempNum1 < l2 + l3) {
                        if (tempNum2 > 0 || (tempNum3 > 0 && $(recDivID).find("span:eq(" + n + ")").prev().get(0).tagName == "I")) {
                            $(recDivID).find("div:eq(2)").remove();
                            $(recDivID).find("span:gt(" + (n - 2) + ")").remove();
                            $(recDivID).find("div:eq(1)").append(link);
                            $(recDivID).append(newD1);
                            $(moreRecDivID).append('<div class="part2"></div>');
                            if (l3 > 0) $(moreRecDiv).append(newD3);
                            reList(n - 1 - l1, l2, "'+moreRecDivID+' .part2", receivers2, 4);
                            reList(0, l3, "'+moreRecDivID+' .part3", receivers3, 4);
                        } else {
                            $(recDivID).find("span:gt(" + (n - 2) + ")").remove();
                            $(recDivID).find("div:eq(2)").append(link);
                            $(recDivID).append(newD1);
                            $(moreRecDivID).append('<div class="part3"></div>');
                            reList(n - 1 - l1 - l2, l3, "'+moreRecDivID+' .part3", receivers3, 4);
                        }
                    }
                }
            }
            //主题
            if (lib.checkBlank(obj.subject)) {
                $("#subject").html(obj.subject);
            }
            //附件
            if (lib.checkBlank(obj.attachments)) {
                var attachments = '';
                for (var i = 0; i < obj.attachments.length; i++) {
                    if (obj.attachments[i].ctype == "a") {
                        var $obj_att=obj.attachments[i];
                        attachments += '<li>' +
                            '<i class="glyphicon glyphicon-paperclip"></i> ' +
                            '<a href="' + obj.attachments[i].path + '" download>' + obj.attachments[i].title + '(' + obj.attachments[i].size + ')</a>' +
                            '</li>';
                        var tempArray=$obj_att.path.split(".");
                        if(["jpg","png","bmp","jpeg","gif"].indexOf(tempArray[tempArray.length-1].toLowerCase())>=0){
                            imgAtt +='<p><img src="'+$obj_att.path+'"></p>'
                        }
                    }
                }
                $("#attachments").html('<ul class="list-unstyled ' + muted + '">' + attachments + '</ul>');
            }

            //正文
            if (lib.checkBlank(obj.segments)) {
                var segmentsDiv = $("#segments");
                var segments = '';
                segmentsDiv.html("<pre></pre>");
                for (var i = 0; i < obj.segments.length; i++) {
                    segments += '<div>' + lib.remove_js(obj.segments[i].content) + '</div>';
                }
                lib.append_txtCont_by_steps(segmentsDiv.children("pre"),segments,"string",51200,5) //4参数:容器,数据,逐步数据,延迟毫秒
            }

            //附件中的图片
            if (imgAtt != '')
                $("#segments").append(imgAtt);
        }

        //++++++++++++++++++事件响应++++++++++++++
        //查看、收起情/更多
        $(document).on('click', '#mms-page a.view ', function () {
            var tname = $(this).html().substr("2");
            if ($(this).hasClass("in")) {
                $(this).html(i18n.t("dataprocess.action.close_2") + tname).removeClass("in");
            } else {
                $(this).html(i18n.t("dataprocess.action.look") + tname).addClass("in");
            }
        });



        return {
            load_encode_info:load_encode_info,
            load_mms_cont: load_mms_cont
        }
    });
