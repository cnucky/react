define(['module/workprocess/utility',
], function(utility) {
    var _opt;
    var html = '<div id = "processTraceTip"></div>'
    var style = '<style>.process-tip, .bottomtip{width: 204px;position:fixed;z-index:1043;display:none;background: black;color: white;border-radius: 8px;padding: 5px;}'+
                    '.process-tip :before{content: "";position: absolute;left: 95px;bottom: -10px;width: 0;height: 0;border-width: 5px 6px;border-style: solid;border-color: #000 transparent transparent transparent;}'+
                    '.bottomtip :before{content: "";position: absolute;left: 95px;top: -10px;width: 0;height: 0;border-width: 5px 6px;border-style: solid;border-color: transparent transparent #000 transparent;}</style>';
    /*
    * opt: {
    *     $container: $, //图片加载节点jquery对象
    *     processType: '', //流程的类型
    *     processID: '', //processID与businessID选填一个
    *     businessID: '', //rocessID与businessID选填一个
    * }
    */
    
    function render(opt){
        _opt = opt;
        var html = '<div class="panel mbn">' +
                         '<div class="panel-heading mbn">' +
                            '<ul id="process-tabs" class="nav panel-tabs-border panel-tabs panel-tabs-left" >' +
                                '<li class="type-tab active" id="tab-trace">'+
                                    '<a href="#process-content" data-toggle="tab">'+ i18n.t("workprocess.operations.traceflow") +'</a>'+
                                '</li>'+
                                '<li class="type-tab" id="tab-timeline">'+
                                    '<a href="#timeline-content" data-toggle="tab" data-i18n="">'+ i18n.t("workprocess.operations.timeline") +'</a>'+
                                '</li>'+
                            '</ul>'+
                            '<div id="sort-checkbox" style="position: absolute; right: 50px; height: 50px; display: none;">' +
                                '<div class="checkbox-custom checkbox-primary mb5" style="line-height: 20px; font-weight: normal; transform: translateY(50%);">' +
                                    '<input type="checkbox" id="sort-by-time">' +
                                    '<label for="sort-by-time">' + i18n.t('workprocess.workprocesslist.reverseSort') + '</label>' +
                                '</div>' +
                            '</div>' +
                         '</div>'+
                         '<div class="panel-body panel-scroller scroller-lg pn" style="overflow-y:auto">' +
                            '<div class="tab-content ptn br-n" id="detail-content">'+
                                '<div id="process-content" class="tab-pane fade  in active"></div>' +
                                '<div id="timeline-content" class="tab-pane fade"></div>' +
                            '</div>'+
                         '</div>' +
                     '</div>';
        opt.$container.empty().append(html);
        opt.$container.find('#process-tabs').find("li#tab-timeline").on("click", function() {
            opt.$container.find("#sort-checkbox").show();
        })
        opt.$container.find('#process-tabs').find("li:not(#tab-timeline)").on("click", function() {
            opt.$container.find("#sort-checkbox").hide();
        })
        utility.showLoader();
        $.getJSON("/workflow/GetRuntimeDiagram", {
            strBusinessID:opt.businessID,
            strProcessInsID:opt.processID,
            strBusinessType:opt.processType
        }, function(rsp) {
            var tracedata = rsp;
            if (tracedata.code != 0)
                return utility.hideLoader();
            $.getJSON("/workflow/GetActInfo", {
                strBusinessID:opt.businessID,
                strProcessInsID:opt.processID,
                strBusinessType:opt.processType
            }, function(rsp) {
                var actdata = rsp;
                utility.hideLoader();
                if (actdata.code != 0)
                    return;
                processTrace(window.top.$('#process-content'), tracedata, actdata);
                timeLine(window.top.$('#timeline-content'), actdata);
            });
        });
    }

    function processTrace($container, tracedata, actdata){
        window.top.$('head').append(style);
        window.top.$("#processTraceTip").remove()
        window.top.$("body").append(html);
        var img = new Image();
        img.src = tracedata.data.png;
        $container.empty().append('<canvas id="processTrace"></canvas>')
        $container.find('#processTrace')[0].width = img.width;
        $container.find('#processTrace')[0].height = img.height;
        $container.css({
            width:img.width + "px",
            height: img.height + "px",
            margin:'0 auto',
        });
        if ($container.find('#processTrace')[0] == null)
            return false;
        var csx = $container.find('#processTrace')[0].getContext('2d');
        
        img.onload = function() {
            csx.drawImage(img, 0, 0);
            var actionData = {};
            _.each(actdata.data, function(item){
                if(actionData[item.strActId] == undefined)
                    actionData[item.strActId] = [];
                actionData[item.strActId].push(item)
            })
            for(var item in actionData){
                var flowStatus = _.find(actionData[item], function(item){
                    return item.bStatus == true
                }) || false;
                if (flowStatus != false)
                    drawRect(csx, actionData[item], 3, "rgba(0,255,0,1)", "rgba(0,255,0,0.2)",1);
                else if(actionData[item][0].strActType == "startEvent")
                    drawRect(csx, actionData[item], actionData[item][0].vCoordingInfo.nWidth/2, "rgba(255,0,0,1)", "rgba(255,0,0,0.2)",1);
                else if(actionData[item][0].strActType == "endEvent")
                    drawRect(csx, actionData[item], actionData[item][0].vCoordingInfo.nWidth/2, "rgba(255,0,0,1)", "rgba(255,0,0,0.2)",4);
                else
                    drawRect(csx, actionData[item], 3, "rgba(255,0,0,1)", "rgba(255,0,0,0.2)",1);
            }
            for (var i in tracedata.data.flowCoordingInfoMap) {
                drawLine(csx, tracedata.data.flowCoordingInfoMap[i], "red", 2);
            }
        }
        $container.on('mousemove', $container.find('#processTrace'), function(e) {
            var location = $(this).offset();
            _.each(actdata.data, function(item) {
                var strActId = item.strActId;
                item = item.vCoordingInfo;
                if (e.offsetX >= item.nX && e.offsetX <= item.nX + item.nWidth && e.offsetY >= item.nY && e.offsetY <= item.nY + item.nHeight) {
                    toolTip(strActId, item.nX, item.nY, item.nWidth, item.nHeight, location);
                } else {
                    window.top.$("#" + strActId).hide();
                }
            });
        });
        $container.on('mouseleave', $container.find('#processTrace'), function(e) {
            _.each(actdata.data, function(item) {
                window.top.$("#" + item.strActId).hide();
            })
        });
    }

    function timeLine($container, actdata){
        var timeLineContent = '<div>' +
                                    '<div id=timeline class="timeline-single" style="margin-top:10px; margin-left: 95px">'+
                                        '<div class="row"><div id="timeline-container" class="col-sm-6 left-column"></div></div>'+
                                    '</div>' +
                                '</div>';
        $container.empty().append(timeLineContent); 
        $container.find("#timeline-container").empty().append(getTimelineHtml());
        
        _opt.$container.find("#sort-by-time").on('change', function(){
            var reverseSortByTime = $(this).is(":checked");
            $container.find("#timeline-container").empty().append(getTimelineHtml(reverseSortByTime));
        })
        
        function getTimelineHtml(reverseSort) {
            var timeLineData = !!reverseSort ? JSON.parse(JSON.stringify(actdata.data)).reverse() : actdata.data;
            var line='';
            _.each(timeLineData, function(item){
                var icon='';
                var colon = ':';
                var strComment = '';
                item.strComment == ''? (strComment = i18n.t('workprocess.workprocesslist.nocomment')):(strComment=item.strComment);
                if(item.strEndTime==''){
                    colon = '';
                    strComment = '';
                    item.strResultDesc = i18n.t('workprocess.workprocesslist.todo');
                    icon = 'class="glyphicon glyphicon-envelope" style="color:orange"';   
                }else if(item.strActName == 'Start'){
                    icon = 'class="glyphicon glyphicon-record" style="color:rgb(241,201,6)"';
                }else{
                    item.strResult == 1 ? (icon = 'class="glyphicon glyphicon-ok" style="color:rgb(86,168,86)"') : (icon = 'class="glyphicon glyphicon-remove" style="color:rgba(255,0,0,0.49)"');
                }
                var tpl = '<div class="timeline-item mb10">'+
                                '<div class="timeline-icon"><span '+ icon +'></span></div>'+
                                '<div class="panel panel-body mbn">'+
                                    '<div><span>'+ item.strActName +'&nbsp;&nbsp;-&nbsp;&nbsp;'+ item.strAssignee +'</span><span style="float:right">'+ item.strEndTime +'</span></div>'+
                                    '<div><span>'+ item.strResultDesc + '&nbsp;'+ colon + '&nbsp;'+'</span><span>'+ strComment +'</span></div>'+
                                '</div>'+
                          '</div>';   
                line = line + tpl;    
            })
            return line;
        }
    }

    function toolTip(strActId, x, y, width, height, location) {
        var tipWidth = window.top.$("#" + strActId).outerWidth();
        var tipHeight = window.top.$("#" + strActId).outerHeight();
        if (y >= tipHeight) {
            window.top.$("#" + strActId).css({
                top: y + location.top - tipHeight - 5 + "px",
                left: x + location.left - tipWidth / 2 + width/2 + "px",
            });
            window.top.$("#" + strActId).show();
        } else  {
            window.top.$("#" + strActId).css({
                top: y + location.top + height + 5 + "px",
                left: x + location.left - tipWidth / 2 + width/2 + "px",
            });
            window.top.$("#" + strActId).attr("class", "bottomtip");
            window.top.$("#" + strActId).show();
        }
    }
    /*
    画圆角矩形  
    csx canvas对象 
    opt 矩形框对应的信息（坐标信息。提示信息） 
    r 圆角弧度 
    strolecolor 边框颜色 
    fillcolor 填充色
    */
    function drawRect(csx, opt, r, strolecolor, fillcolor, width) {
        var coordingInfo = opt[0].vCoordingInfo;
        csx.beginPath();
        csx.strokeStyle = strolecolor;
        csx.fillStyle = fillcolor;
        csx.lineWidth = width;
        csx.moveTo(coordingInfo.nX + r, coordingInfo.nY);
        csx.lineTo(coordingInfo.nX + coordingInfo.nWidth - r, coordingInfo.nY);
        csx.arcTo(coordingInfo.nX + coordingInfo.nWidth, coordingInfo.nY, coordingInfo.nX + coordingInfo.nWidth, coordingInfo.nY + r, r);
        csx.lineTo(coordingInfo.nX + coordingInfo.nWidth, coordingInfo.nY + coordingInfo.nHeight - r);
        csx.arcTo(coordingInfo.nX + coordingInfo.nWidth, coordingInfo.nY + coordingInfo.nHeight, coordingInfo.nX + coordingInfo.nWidth - r, coordingInfo.nY + coordingInfo.nHeight, r);
        csx.lineTo(coordingInfo.nX + r, coordingInfo.nY + coordingInfo.nHeight);
        csx.arcTo(coordingInfo.nX, coordingInfo.nY + coordingInfo.nHeight, coordingInfo.nX, coordingInfo.nY + coordingInfo.nHeight - r, r);
        csx.lineTo(coordingInfo.nX, coordingInfo.nY + r);
        csx.arcTo(coordingInfo.nX, coordingInfo.nY, coordingInfo.nX + r, coordingInfo.nY, r);
        csx.closePath();
        csx.fill();
        csx.stroke();
        var data = opt;
        var maxBatch = _.max(data, function(item) {
            return item.nBatch;
        }).nBatch;
        var opts = _.filter(data, function(item) {
            return item.nBatch == maxBatch;
        });
        var cond = {
            strActName: opts[0].strActName,
            strActId: opts[0].strActId,
            strAssignee: _.map(opts, function(item){
                return item.strAssignee
            }).join(","),
            strDuration: timeFormat(_.max(_.map(opts, function(item){
                return item.strDuration
            }))),
            strEndTime: _.max(_.map(opts, function(item){
                return item.strEndTime
            }), function(item){
                if(item == "") return 0
                return new Date(item)
            }),
            strComment: function(){
                var comment = '';
                if(opts.length == 1)
                    return opts[0].strComment;
                _.each(opts, function(item){
                    if(item.strComment == '')
                        return ;
                    return comment = comment + item.strAssignee + ": " + item.strComment + ';'
                });
                return comment;
            }()
        };
        var html = '<div class="process-tip"  id="'+ cond.strActId + '">' +
                       '<div><label>' + i18n.t('workprocess.workprocesslist.actName') + ':&nbsp;</label><span>'+ cond.strActName + '</span></div>' +
                       '<div><label>' + i18n.t('workprocess.workprocesslist.assignee') + ':&nbsp;</label><span>' + cond.strAssignee + '</span></div>' +
                       '<div><label>' + i18n.t('workprocess.workprocesslist.duration') + ':&nbsp;</label><span>'+ cond.strDuration + '</span></div>' +
                       '<div><label>' + i18n.t('workprocess.workprocesslist.endTime') + ':&nbsp;</label><span>' + cond.strEndTime + '</span></div>' +
                       '<div><label>' + i18n.t('workprocess.workprocesslist.comments') + ':&nbsp;</label><span>'+ cond.strComment +'</span></div>'+
                    '</div>';
        window.top.$('#processTraceTip').append(html);

        function timeFormat(duration){
            var time;
            if (duration != ""){
                time = duration / 1000.0;
                if (time > 60 && time < 60 * 60) {
                    time = parseInt(time / 60.0) + i18n.t("workprocess.commontip.minute") + (time - parseInt(time / 60.0) * 60 ).toFixed(1) + i18n.t("workprocess.commontip.second");
                }else if (time >= 60 * 60) {
                    time = parseInt(time / 3600.0) + i18n.t("workprocess.commontip.hour") + parseInt((time - parseInt(time / 3600.0) * 3600 ) / 60.0) + i18n.t("workprocess.commontip.minute") + ((time - parseInt(time / 3600.0) * 3600 ) % 60.0).toFixed(1) + i18n.t("workprocess.commontip.second");
                }else{
                    time = time.toFixed(1) + i18n.t("workprocess.commontip.second");
                }
            }else
                time = "";
            return time;
        }
    }
    /*
     csx canvas对象
     opt 直线坐标 
     color 线的颜色 
     width 宽度
     */

    function drawLine(csx, opt, color, width) {
        var length = opt.length;
        csx.beginPath();
        csx.translate(0, 0);
        csx.lineWidth = width;
        csx.strokeStyle = color;
        csx.moveTo(opt[0].nX, opt[0].nY);
        _.each(opt.slice(1), function(item) {
                csx.lineTo(item.nX, item.nY);
            })
        csx.stroke();
        csx.save();

        //画箭头
        csx.translate(opt[length - 1].nX, opt[length - 1].nY);
        var ang = parseInt(opt[length - 1].nX - opt[length - 2].nX) / parseInt(opt[length - 1].nY - opt[length - 2].nY);
        ang = Math.atan(ang);
        if (opt[length - 1].nY - opt[length - 2].nY >= 0) {
            csx.rotate(-ang);
        } else {
            csx.rotate(Math.PI - ang);
        }
        csx.beginPath();
        csx.fillStyle = color;
        csx.lineTo(-5, -10);
        csx.lineTo(0, -10);
        csx.lineTo(5, -10);
        csx.lineTo(0, 0);
        csx.closePath();
        csx.fill();
        csx.restore();
    }

    return {
        render: render,
    };
});