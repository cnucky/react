define(
    [
        'underscore',
        './library'

    ], function (_,lib) {
        //+++++++++++++定义的变量++++++++++
        var muted = "text-muted";
        var tempNum1 = 0, tempNum2 = 0, tempNum3 = 0;
        var imgAtt=''; //add
        var $host=i18n.t("dataprocess.common.host");
        var $time=i18n.t("dataprocess.common.time");
        var $server=i18n.t("dataprocess.common.server");
        var $teminal=i18n.t("dataprocess.common.teminal");
        var send_time=i18n.t("dataprocess.name.send_time");
        var user_CC=i18n.t("dataprocess.name.user_CC");
        var user_BCC=i18n.t("dataprocess.name.user_BCC");
        var view_more=i18n.t("dataprocess.action.view_more");

        //++++++++++++++++++业务方法++++++++++++++

        // 重组收件人信息
        function reList(sI, eI, div, obj, x) {
            var $iframe=$("#tplContBox").children("iframe");
            var recDiv =$iframe.contents().find("#receivers");
            for (i = sI; i < eI; i++) {
                $iframe.contents().find(div).append(obj[i]);
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
            if(lib.checkBlank(str)) return str.replace(/</ig, '').replace(/>/ig, '');
        }

        //替换< >
        function replaceBkts(str) {
            if(lib.checkBlank(str)) return str.replace(/</ig, '&lt;').replace(/>/ig, '&gt;');
        }

        //路由信息返回
        function returnRoad(type, e) {
            if (e) {
                if (e == "") {
                    return "";
                } else {
                    switch(type){
                        case "host":
                            return $host + e + '<br>';
                            break;
                        case "date":
                            return $time + e;
                            break;
                        case "protocol":
                            return e;
                            break;
                        case "type":
                            if (e == "C") {
                                return '<abbr title="'+$teminal+'"><i class="fa fa-desktop"></i></abbr>';
                            } else if (e == "S") {
                                return '<abbr title="'+$server+'"><i class="server"></i></abbr>';
                            }
                            break;
                    }
                }
            } else {
                return "";
            }
        }

        //加载编码信息
        function load_encode_info(){
            lib.loadCodes("#titleEnCode");
            lib.loadCodes("#contEnCode");
            lib.loadFonts("#fontFamily");
        }

        //加载邮件内容
        function load_email_cont(obj,markWord,flag) {
            if(!lib.checkBlank(obj)){
                return;
            }
            imgAtt = '';
            lib.set_wrap_width_height();
            var $iframe=$("#tplContBox").find("#emailIFM");
            //第一次请求
            if(flag){
                $iframe.load(function(){
                    //发件人信息
                    if (lib.checkBlank(obj.senders)) {
                        var senders = '';
                        for (var i = 0; i < obj.senders.length; i++) {
                            var $obj_i=obj.senders[i];
                            var mail=($obj_i.mail.indexOf("<")<0?'&lt;'+$obj_i.mail+'&gt;':replaceBkts($obj_i.mail));
                            senders += ($obj_i.name ? $obj_i.name : '') +
                                '<span class="text-muted">' + mail + ';</span>';
                        }
                        $iframe.contents().find("#senders").html(lib.mark(senders,markWord));
                    }
                    //发件时间
                    if (lib.checkBlank(obj.sendTime)) {
                        $iframe.contents().find("#sendTime").html(send_time+' ').next("span").html(lib.mark(obj.sendTime,markWord));
                    }
                    //收件人列表
                    if (lib.checkBlank(obj.receivers)) {
                        var recDivID = '#receivers';
                        var moreRecDivID = "#more_receivers";
                        //按收件人、抄送、密送重新排列
                        var receivers1 = [], receivers2 = [], receivers3 = [];
                        for (var i = 0; i < obj.receivers.length; i++) {
                            var $obj_i=obj.receivers[i];
                            var name=lib.checkBlank($obj_i.name)?$obj_i.name:"";
                            var mail=($obj_i.mail.indexOf("<")==-1?'&lt;'+$obj_i.mail+'&gt;':replaceBkts($obj_i.mail));
                            var tempSpan='<span>' + name + '<i class="' + muted + '">' + mail + ';</i></span>';
                            switch ($obj_i.type){
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
                            $iframe.contents().find(recDivID).html('<div></div>');
                            reList(0, l1, "#receivers div:eq(0)", receivers1, 1);
                        }
                        if (l2 > 0) {
                            $iframe.contents().find(recDivID).append(newD2);
                            reList(0, l2, "#receivers div:eq(1)", receivers2, 2);
                        }
                        if (l3 > 0) {
                            $iframe.contents().find(recDivID).append(newD3);
                            reList(0, l3, "#receivers div:eq(2)", receivers3, 3);
                        }
                        //处理超出的部分
                        if (tempNum1 > 0) {
                            var n = l1 + l2 + l3 - tempNum1;
                            $iframe.contents().find(recDivID).find("span:eq(" + n + ")").addClass("a");
                            if (tempNum1 >= l2 + l3) {
                                $iframe.contents().find(recDivID).find("div:eq(1)").remove();
                                $iframe.contents().find(recDivID).find("div:eq(2)").remove();
                                $iframe.contents().find(recDivID).find("span:gt(" + (n - 2) + ")").remove();
                                $iframe.contents().find(recDivID).find("div:eq(0)").append(link);
                                $iframe.contents().find(recDivID).append(newD1);
                                if (l2 > 0) $iframe.contents().find(moreRecDivID).append(newD2);
                                if (l3 > 0) $iframe.contents().find(moreRecDivID).append(newD3);
                                reList(n - 1, l1, moreRecDivID + " .part1", receivers1, 4);
                                reList(0, l2, moreRecDivID + " .part2", receivers2, 4);
                                reList(0, l3, moreRecDivID + " .part3", receivers3, 4);
                            } else if (tempNum1 < l2 + l3) {
                                if (tempNum2 > 0 || (tempNum3 > 0 && $iframe.contents().find(recDivID).find("span:eq(" + n + ")").prev().get(0).tagName == "I")) {
                                    $iframe.contents().find(recDivID).find("div:eq(2)").remove();
                                    $iframe.contents().find(recDivID).find("span:gt(" + (n - 2) + ")").remove();
                                    $iframe.contents().find(recDivID).find("div:eq(1)").append(link);
                                    $iframe.contents().find(recDivID).append(newD1);
                                    $iframe.contents().find(moreRecDivID).append('<div class="part2"></div>');
                                    if (l3 > 0) $iframe.contents().find(moreRecDiv).append(newD3);
                                    reList(n - 1 - l1, l2, "'+moreRecDivID+' .part2", receivers2, 4);
                                    reList(0, l3, "'+moreRecDivID+' .part3", receivers3, 4);
                                } else {
                                    $iframe.contents().find(recDivID).find("span:gt(" + (n - 2) + ")").remove();
                                    $iframe.contents().find(recDivID).find("div:eq(2)").append(link);
                                    $iframe.contents().find(recDivID).append(newD1);
                                    $iframe.contents().find(moreRecDivID).append('<div class="part3"></div>');
                                    reList(n - 1 - l1 - l2, l3, "'+moreRecDivID+' .part3", receivers3, 4);
                                }
                            }
                        }
                    }

                    //附件
                    if (lib.checkBlank(obj.attachments)) {
                        var attachments = '';
                        for (var i = 0; i < obj.attachments.length; i++) {
                            if (obj.attachments[i].ctype == "a") {
                                var $obj_att=obj.attachments[i];
                                attachments += '<li>' +
                                    '<i class="glyphicon glyphicon-paperclip"></i> ' +
                                    '<a href="' + $obj_att.path + '" download>' + lib.mark($obj_att.title,markWord) + '(' + $obj_att.size + ')</a>' +
                                    '</li>';
                                var tempArray=$obj_att.path.split(".");
                                if(["jpg","png","bmp","jpeg","gif"].indexOf(tempArray[tempArray.length-1].toLowerCase())>=0){
                                    imgAtt +='<p><img src="'+$obj_att.path+'"></p>'
                                }
                            }
                        }
                        $iframe.contents().find("#attachments").html('<ul class="list-unstyled ' + muted + '">' + attachments + '</ul>');
                    }

                    //路由信息
                    if (lib.checkBlank(obj.nodes)||lib.checkBlank(obj.headers)) {
                        var nodesDiv = $iframe.contents().find("#nodes");
                        if (lib.checkBlank(obj.nodes)) {
                            var nodes_code1='';
                            for (var i = 0; i < obj.nodes.length; i++) {
                                if(i!=0){
                                    var arrowClass=obj.nodes[i].isContinue?'glyphicon-arrow-down':'glyphicon-sort-by-attributes';
                                    nodes_code1+='<li class="arrow">' +
                                        '<i class="glyphicon '+arrowClass+' text-primary"></i>' +
                                        returnRoad("protocol", obj.nodes[i].protocol) +
                                        '</li>';
                                }
                                nodes_code1 += '<li class="alert alert-default alert-micro">' +
                                    lib.mark(returnRoad("type", obj.nodes[i].type),markWord) +
                                    lib.mark(returnRoad("host", obj.nodes[i].host),markWord) +
                                    lib.mark(returnRoad("date", obj.nodes[i].date),markWord) +
                                    '</li>';
                            }
                            if(nodes_code1!="") nodesDiv.find("#nodesBox").find("ul:first").html(nodes_code1);
                        }

                        if (lib.checkBlank(obj.headers)) {
                            //var nodes_code2='';
                            //for (var i = 0; i < obj.headers.length; i++) {
                            //    nodes_code2 += obj.headers[i].name + ":" + obj.headers[i].value + "<br>"
                            //}
                            //nodesDiv.find("#nodesBox").find("pre:first").html(lib.mark(nodes_code2,markWord));
                            nodesDiv.find("#nodesBox").find("pre:first").html(lib.mark(obj.headerStr,markWord));
                        }
                    }
                    encodeDo(obj,markWord,$iframe);
                });
            }else{
                encodeDo(obj,markWord,$iframe);
            }
        }

        //编码相关操作
        function encodeDo(obj,markWord,$iframe){
            //主题
            if (lib.checkBlank(obj.subject)) {
                $iframe.contents().find("#subject").html(lib.mark(obj.subject,markWord));
            }

            //正文
            if (lib.checkBlank(obj.segments))
            {
                var $segments='';
                for(var i=0; i<obj.segments.length;i++){
                    $segments+='<div class="break">'+lib.remove_js(obj.segments[i].content)+'</div>';
                }
                var segmentsBox = $iframe.contents().find("#segments").html($segments);
                /*if (imgAtt != '')
                    segmentsBox.append(imgAtt);*/
            }

            //附件中的图片
            if (imgAtt != '')
                $iframe.contents().find("#segments").append(imgAtt);
        }


        return {
            load_encode_info:load_encode_info,
            load_email_cont: load_email_cont
        }
    });
