/**
 * Created by zhangxinyue on 2016/3/14.
 */

(function(window, document, undefined) {
    /* 设置和轨迹相关的元素
     panelParentID：承载轨迹面板的父节点ID
     * */

    var Notify;//提示
    function _setAimTrackInfo_4g(options) {
        this.options = options;
        Notify = options.notify;
    }

    //播放器进度条执行播放
    var totalTime = 0; //总时间
    var excuteProcess = 0; //计数器
    var timeControl = null; //计时器
    var perInterval = 0; //时间间隔
    var excuteLength = 0; //经度条执行长度
    var speed = 1; //当前速度

    var thisObject = null; //全局变量，表示setAimTrackInfo对象，用于调用prototype内部方法
    var markGroup;//聚类图层对象
    var markersCluster;//轨迹点聚类
    var map;//地图全局对象
    var Dialog;//轨迹播放面板
    var heatmapLayer;//热点图图层
    var heatmapPoints = {};//热点
    _setAimTrackInfo_4g.prototype = {
        //初始化方法，参数为（L.control.toolbar对象，setAimTrackInfo对象）
        initialize: function(toolbar, thisObjectArgs) {
            this.targetList = {};
            this.selectedTargerList = {};
            this.targetMovingTimes = {};
            this._container = toolbar._container;
            map = this._map = toolbar._map;
            thisObject = thisObjectArgs; //赋值全局变量
            //初始化聚类图层
            markGroup = new L.MarkerClusterGroup({
                spiderfyOnMaxZoom: false,
                showCoverageOnHover: false,
                zoomToBoundsOnClick: false,
                iconCreateFunction: this._myiconCreateFunction,
                popupContentCreateFunction:this._myClusterPopupContentCreateFunction
            });
            //初始化轨迹点聚类
            markersCluster = new L.MarkerClusterGroup({
                spiderfyOnMaxZoom: false,
                showCoverageOnHover: false,
                zoomToBoundsOnClick: false,
                iconCreateFunction: this._myiconCreateFunction,
                popupContentCreateFunction:this._myClusterPopupContentCreateFunction
            });
            //定义dialog
            Dialog = new _defineDialog();
            Dialog.initialize();
            //添加图层面板上的元素
            this._addPanel();
            //添加目标列表
            this._addAimList();

            $(".track-group-body").height($("#map").height() - 87); //设置轨迹页面高度
            $(".target-aimList-style").height($(".track-group-body").height() - 76);//设置list面板的高度

            //定义目标轨迹按钮事件
            $("#AimTrack").click(function() {
                //如果上一个页面是点位分布
                if($("#AimDistribute").hasClass("item-active"))
                {
                    $("#AimDistribute").removeClass("item-active");
                    //隐藏点位分布
                    markGroup.hideAimDistribute(map);
                }
                //如果上一个页面是热点图
                else if($("#AimHeatmap").hasClass("item-active"))
                {
                    $("#AimHeatmap").removeClass("item-active");
                    thisObject._hideHeatmap();
                }
                else if($("#AimTrack").hasClass("item-active"))
                {
                    return;
                }
                //更改轨迹按钮样式
                $("#AimTrack").addClass("item-active");
                //展示轨迹播放面版
                $(".trackControl").show();
                if($("input[name='reviewAim']:checked").length != 0)//当前有选中的目标
                {
                    //显示选中目标的轨迹
                    var allCheckbox = $('[name=reviewAim]:checkbox');
                    for (var i = 0; i < allCheckbox.length; i++) {
                        var oneCheckbox = allCheckbox[i];
                        if(oneCheckbox.checked == true)
                        {
                            var aimId = $(oneCheckbox).attr("aimId"); //目标ID（号码）
                            var trackColor = $(oneCheckbox).attr("trackColor"); //轨迹颜色
                            thisObject._showTargerTrace(aimId,trackColor);
                        }
                    }
                }
            });

            //定义目标分布按钮事件
            $("#AimDistribute").click(function() {
                //如果上一个页面是轨迹
                if($("#AimTrack").hasClass("item-active"))
                {
                    $("#AimTrack").removeClass("item-active");
                    thisObject._hideTrackPlayerPanel();
                    //所有按钮恢复”播放“
                    $(".aimPlayerBtn").each(function(){
                        var tempCheck = $(this).parent().parent()[0].children[0];
                        var tempAim = $(tempCheck).attr("aimId");
                        this.innerHTML = '<span class="glyphicon glyphicon-play-circle" style="color: #0090ff"></span>'+i18n.t('gismodule.manageAimTrackModule.btn.playBtn');
                        $(this).attr("state",i18n.t('gismodule.manageAimTrackModule.btn.playBtn'));
                        //如果当前播放的轨迹是取消选择的轨迹，停止播放
                        if(thisObject.current != null && thisObject.current.name == tempAim)
                        {
                            thisObject._endingPlay(tempAim,false);
                            thisObject._reloadTargetTrace(tempAim);
                        }
                    });
                    //隐藏播放器面板
                    $(".trackControl").hide();

                    //轨迹展示取消
                    var allCheckbox = $('[name=reviewAim]:checkbox');
                    for (var i = 0; i < allCheckbox.length; i++) {
                        var oneCheckbox = allCheckbox[i];
                        if(oneCheckbox.checked == true)
                        {
                            var aimId = $(oneCheckbox).attr("aimId"); //目标ID（号码）
                            thisObject._hideTargerTrace(aimId);
                        }
                    }
                }
                //如果上一个页面是热点图
                else if($("#AimHeatmap").hasClass("item-active"))
                {
                    $("#AimHeatmap").removeClass("item-active");
                    thisObject._hideHeatmap();
                }
                else if($("#AimDistribute").hasClass("item-active"))
                {
                    return;
                }
                //更改点位分布按钮样式
                $("#AimDistribute").addClass("item-active");
                if($("input[name='reviewAim']:checked").length != 0)//当前有选中的目标
                {
                    //展示分布
                    var tempAimList = {};//当前选中的目标
                    $("input[name='reviewAim']:checked").each(function(){
                        var aimId = $(this).attr("aimId");
                        tempAimList[aimId] = aimList[aimId];
                    });
                    markGroup.hideAimDistribute(map);
                    markGroup.showAimDistribute(tempAimList, map);//显示当前选中的目标聚类展示
                }

            });

            //点击热点图按钮事件
            $("#AimHeatmap").click(function(){
                //如果之前是轨迹播放页面
                if($("#AimTrack").hasClass("item-active"))
                {
                    $("#AimTrack").removeClass("item-active");
                    thisObject._hideTrackPlayerPanel();
                    //所有按钮恢复”播放“
                    $(".aimPlayerBtn").each(function(){
                        var tempCheck = $(this).parent().parent()[0].children[0];
                        var tempAim = $(tempCheck).attr("aimId");
                        this.innerHTML = '<span class="glyphicon glyphicon-play-circle" style="color: #0090ff"></span>'+i18n.t('gismodule.manageAimTrackModule.btn.playBtn');
                        $(this).attr("state",i18n.t('gismodule.manageAimTrackModule.btn.playBtn'));
                        //如果当前播放的轨迹是取消选择的轨迹，停止播放
                        if(thisObject.current != null && thisObject.current.name == tempAim)
                        {
                            thisObject._endingPlay(tempAim,false);
                            thisObject._reloadTargetTrace(tempAim);
                        }
                    });
                    //隐藏播放器面板
                    $(".trackControl").hide();

                    //轨迹展示取消
                    var allCheckbox = $('[name=reviewAim]:checkbox');
                    for (var i = 0; i < allCheckbox.length; i++) {
                        var oneCheckbox = allCheckbox[i];
                        if(oneCheckbox.checked == true)
                        {
                            var aimId = $(oneCheckbox).attr("aimId"); //目标ID（号码）
                            thisObject._hideTargerTrace(aimId);
                        }
                    }
                }
                //如果之前是点位分布页面
                else if($("#AimDistribute").hasClass("item-active"))
                {
                    $("#AimDistribute").removeClass("item-active");
                    //隐藏点位分布
                    markGroup.hideAimDistribute(map);
                }
                else if($("#AimHeatmap").hasClass("item-active"))
                {
                    return;
                }
                //热点按钮选择状态
                $("#AimHeatmap").addClass("item-active");
                thisObject._showHeatmap();
                if($("input[name='reviewAim']:checked").length != 0)//当前有选中的目标
                {
                    //展示热点
                    heatmapPoints = {};
                    var tempAimList = {};//当前选中的目标
                    $("input[name='reviewAim']:checked").each(function(){
                        var aimId = $(this).attr("aimId");
                        tempAimList[aimId] = aimList[aimId];
                    });

                    thisObject._addPointToHeatmap(tempAimList);
                }
            });

            //触发点选事件，默认开始见面选择点位分布
            $("#AimDistribute").trigger('click');

            this._mapZoomShow();
            this.starticon = L.divIcon({
                className: 'img-start',
                iconSize: [26, 40],
                iconAnchor: [13, 40]
            });
            this.endicon = L.divIcon({
                className: 'img-end',
                iconSize: [26, 40],
                iconAnchor: [13, 40]
            });
            this.cp = {};
            this.pc = {};
            this.pointsID = {};
            this.phoneBills=[];
        },

        //生成轨迹播放器
        _createTrackPlayPanel:function (aimId,beginTime, endTime, endIndex) {
            var beginT = beginTime.split(" ");
            var endT = endTime.split(" ");
            var innerHtml =
                '<div class="trackPlay" aimId = "' + aimId + '" beginTime="' + beginTime + '"  endTime="' + endTime + '">' +
                '<table style="width: 100%;"> ' +
                '<tr><td id="track-player-status" class="track-player-status-style" colspan="6">'+i18n.t('gismodule.manageAimTrackModule.playPanel.stateFilter')+'</td></tr>' +
                '<tr style="height: 20px;">' +
                '<td colspan="6" style="padding: 0px 10px;">' +
                '<div style="position: relative;">' +
                '<div id="rang-progressBar-full" class="rang-progressBar-full-style"></div>' +
                '<div class="pre-rang-progressBar-full-style"></div>' +
                '<div class="after-rang-progressBar-full-style"></div>' +
                '<div id="rang-progressBar-left" class="rang-progressBar-left-style"></div>' +
                '<div id="rang-progressBar-right" class="rang-progressBar-right-style"></div>' +
                '<div id="rang-progressBar-excute_parent" style="position: relative;height: 5px; width: 250px;left: 8px;">' +
                '<div id="rang-progressBar-excute" class="rang-progressBar-excute-style"></div>' +
                '</div>' +
                '<div id="rang-slider-begin" class="rang-slider-begin-style" startIndex="0"></div>' +
                '<div id="rang-slider-end" class="rang-slider-end-style" endIndex="' + endIndex + '"></div>' +
                '<div id="rang-slider-excute" class="rang-slider-excute-style"></div>' +
                '</div>' +
                '</td>' +
                '</tr>' +
                '<tr style="height: 30px;">' +
                '<td colspan="6">' +
                '<table style="width: 100%;">' +
                '<tr>' +
                '<td id="rang-beginTime-tip" class="rang-time-tip" >' + beginT[0] + '<br/>' + beginT[1] + '</td>' +
                '<td id="rang-selectedBeginTime-tip" class="rang-selectedTime-tip"></td>' +
                '<td id="rang-selectedEndTime-tip" class="rang-selectedTime-tip"></td>' +
                '<td id="rang-endTime-tip" class="rang-time-tip" style="text-align: right;" >' + endT[0] + '<br/>' + endT[1] + '</td>' +
                '</tr>' +
                '</table>' +
                '</td>' +
                '</tr>' +
                '<tr style="height: 30px;">' +
                '<td style="width: 20%;"></td>' +
                '<td style="width: 15%;text-align: center;"><img id="trackPlayerSlow" title="'+i18n.t('gismodule.manageAimTrackModule.playPanel.speeddown')+'" src="../js/components/gisWidget/manageAimTrackModule/image/media_rewind_24_p.png" height="20px" width="20px"/></td>' +
                '<td style="width: 15%;text-align: center;">' +
                '<img id="trackPlayerPlay" title="'+i18n.t('gismodule.manageAimTrackModule.playPanel.play')+'" src="../js/components/gisWidget/manageAimTrackModule/image/media_play_24_p.png" height="20px" width="20px"/>' +
                '<img id="trackPlayerPause" title="'+i18n.t('gismodule.manageAimTrackModule.playPanel.pause')+'" src="../js/components/gisWidget/manageAimTrackModule/image/media_pause_24_p.png" height="20px" width="20px" style="display: none;"/>' +
                '</td>' +
                '<td style="width: 15%;text-align: center;"><img id="trackPlayerFast" title="'+i18n.t('gismodule.manageAimTrackModule.playPanel.speedup')+'" src="../js/components/gisWidget/manageAimTrackModule/image/media_fast_forward_24_p.png" height="20px" width="20px"/></td>' +
                '<td style="width: 15%;text-align: center;"><img id="trackPlayerReplay" title="'+i18n.t('gismodule.manageAimTrackModule.playPanel.replay')+'" src="../js/components/gisWidget/manageAimTrackModule/image/media_stop_24_p.png" height="20px" width="20px"/></td>' +
                '<td style="width: 20%;"></td>' +
                '</tr>' +
                '<tr>'+
                '<td id="track-player-progressTip" class="track-player-progressTip-style" colspan="6" progress="0">'+i18n.t('gismodule.manageAimTrackModule.playPanel.currentSpeed')+'0x</td>'+
                '</tr>' +
                '</table>' +
                '</div>';
            return innerHtml;
        },

        //添加播放器事件
        _addTrackPlayerEvent:function() {
            //播放
            $("#trackPlayerPlay").click(function() {
                //更改图标状态
                $(this).hide();
                $("#trackPlayerPause").show();

                //设置轨迹状态显示
                $("#track-player-status")[0].innerHTML = i18n.t('gismodule.manageAimTrackModule.playPanel.statePlay');

                //设置播放速度提示（不为0时保持原速度）
                var progressTip = $("#track-player-progressTip");
                if (progressTip.attr("progress") == "0") {
                    progressTip.attr("progress", "1");
                    progressTip[0].innerHTML = i18n.t('gismodule.manageAimTrackModule.playPanel.currentSpeed')+"1x";
                }

                var aimID = $(".trackPlay").attr("aimId");
                //设置当前播放的轨迹颜色不可更改
                $(".color-btn").each(function(){
                    var check = $(this).closest(".checkbox-custom")[0].children[0];
                    var aim = $(check).attr("aimId");
                    if(aim == aimID)
                    {
                        $(this).attr("disabled", "disabled");
                        $(this).css("cursor", "default");
                        $(this).attr("title", i18n.t('gismodule.manageAimTrackModule.btn.colorBtnTip'));
                    }
                });

                //调用轨迹播放接口
                totalTime = thisObject.playTargetTrace(aimID);
                //播放器执行播放
                thisObject._playerProcessBarExcutePlay();
            });

            //暂停
            $("#trackPlayerPause").click(function() {
                //更改图标状态
                $(this).hide();
                $("#trackPlayerPlay").show();

                //设置轨迹状态显示
                $("#track-player-status")[0].innerHTML = i18n.t('gismodule.manageAimTrackModule.playPanel.statePause');

                //调用轨迹播放暂停接口
                thisObject.pauseTargetTrace();
                clearTimeout(timeControl);
            });

            //减速
            $("#trackPlayerSlow").click(function() {
                //设置播放速度提示
                var progressTip = $("#track-player-progressTip");
                if (progressTip.attr("progress") == "1") {
                    return;
                }

                var progress = parseInt(progressTip.attr("progress"));
                progress--;
                progressTip.attr("progress", progress.toString());
                progressTip[0].innerHTML = i18n.t('gismodule.manageAimTrackModule.playPanel.currentSpeed') + progress + "x";

                //调用轨迹播减速停接口
                thisObject.speedDown();
                speed = speed / 2;
            });

            //加速
            $("#trackPlayerFast").click(function() {
                //设置播放速度提示
                var progressTip = $("#track-player-progressTip");
                if (progressTip.attr("progress") == "4") {
                    return;
                }

                var progress = parseInt(progressTip.attr("progress"));
                progress++;
                progressTip.attr("progress", progress.toString());
                progressTip[0].innerHTML = i18n.t('gismodule.manageAimTrackModule.playPanel.currentSpeed') + progress + "x";

                //调用轨迹播加速停接口
                thisObject.speedUp();
                speed = speed * 2;
            });

            //重放
            $("#trackPlayerReplay").click(function() {
                //如果之前有播放的轨迹，计时器重新清零
                if (timeControl != null) {
                    clearTimeout(timeControl); //终止播放轨迹播放器
                    excuteProcess = 0; //计数设为0
                    timeControl = null;
                }
                thisObject._setPlayerStatus(true, false, false, null, null, -1, -1, -1); //设置播放器状态
                var aimID = $(".trackPlay").attr("aimId");
                //设置当前播放的轨迹颜色不可更改
                $(".color-btn").each(function(){
                    var check = $(this).closest(".checkbox-custom")[0].children[0];
                    var aim = $(check).attr("aimId");
                    if(aim == aimID)
                    {
                        $(this).attr("disabled", "disabled");
                        $(this).css("cursor", "default");
                        $(this).attr("title", i18n.t('gismodule.manageAimTrackModule.btn.colorBtnTip'));
                    }
                });
                thisObject.replayTargetTrace(); //调用轨迹重放接口
                thisObject._playerProcessBarExcutePlay(); //开始播放
            });
        },

        //添加轨迹筛选进度条的操作事件
        _addTrackSliderOprationEvent:function () {
            var move_begin = false;
            var move_end = false;
            var begin_x, end_x;

            $("#rang-slider-begin").mousedown(function(e) {
                thisObject._endingPlay($(".trackPlay").attr("aimId"), false); //结束播放
                move_begin = true; //设置开始移动标识
                begin_x = parseInt($("#rang-slider-begin").css("width")) - (e.pageX - parseInt($("#rang-slider-begin").css("left"))); //计算点击的位置距离“开始”滑块右侧的距离
            });
            $("#rang-slider-end").mousedown(function(e) {
                thisObject._endingPlay($(".trackPlay").attr("aimId"), false); //结束播放
                move_end = true; //设置开始移动标识
                end_x = e.pageX - parseInt($("#rang-slider-end").css("left")); //计算点击的位置距离“结束”滑块左侧的距离
            });
            $(document).mousemove(function(e) {
                if (move_begin) {
                    var sliderWidth = parseInt($("#rang-slider-begin").css("width")); //“开始”滑块的宽度
                    var sliderRight = e.pageX + begin_x; //计算若滑块移动后，滑块右侧的位置

                    var barLeft = parseInt($("#rang-progressBar-full")[0].offsetLeft); //进度条左侧偏移量
                    var sliderEndLeft = parseInt($("#rang-slider-end").css("left")); //“结束”滑块左侧位置

                    //移动后，“开始”滑块右侧的位置应该介于进度条左侧和“结束”滑块左侧位置
                    if ((sliderRight >= barLeft) && (sliderRight <= sliderEndLeft)) {
                        //设置“开始”滑块的位置
                        $("#rang-slider-begin").css("left", sliderRight - sliderWidth);
                        //设置左侧灰色进度条的宽度
                        $("#rang-progressBar-left").css("width", sliderRight - barLeft);
                    }
                }
                if (move_end) {
                    var sliderLeft = e.pageX - end_x; //计算若滑块移动后，滑块左侧的位置
                    //进度条右侧位置
                    var barRight = parseInt($("#rang-progressBar-full")[0].offsetLeft) + parseInt($("#rang-progressBar-full")[0].offsetWidth);
                    //“开始”滑块右侧位置
                    var sliderStartRight = parseInt($("#rang-slider-begin")[0].offsetLeft) + parseInt($("#rang-slider-begin")[0].offsetWidth);
                    //移动后，“结束”滑块左侧的位置应该介于“开始”滑块右侧位置和进度条右侧之间
                    if ((sliderLeft >= sliderStartRight) && (sliderLeft <= barRight)) {
                        //设置“结束”滑块的位置
                        $("#rang-slider-end").css("left", sliderLeft);
                        //设置右侧灰色进度条的位置及宽度
                        $("#rang-progressBar-right").css("left", sliderLeft).css("width", barRight - sliderLeft);
                    }
                }
            }).mouseup(function() {
                if (!move_begin && !move_end) {
                    return;
                }

                move_begin = false;
                move_end = false;

                var barWidth = parseInt($("#rang-progressBar-full")[0].offsetWidth);
                var leftPercent = parseInt($("#rang-progressBar-left").css("width")) / barWidth;
                var rightPercent = parseInt($("#rang-progressBar-right").css("width")) / barWidth;
                var dataCount = aimList[$(".trackPlay").attr("aimId")].data.length;
                var startIndex = parseInt(dataCount * leftPercent);
                var endIndex = dataCount - parseInt(dataCount * rightPercent) - 1;
                var beginTime = $(".trackPlay").attr("beginTime").split(" ");
                var endTime = $(".trackPlay").attr("endTime").split(" ");

                thisObject._setPlayerStatus(false, false, true, beginTime, endTime, leftPercent, rightPercent, dataCount); //设置播放器
                thisObject.filterTargetTrace($(".trackPlay").attr("aimId"), startIndex, endIndex); //筛选轨迹范围
            });
        },

        //播放器状态(标记是否为重放操作,标记是否播放完毕,标记是否为播放器初始化，话单开始时间，话单结束时间，话单选择范围起始索引百分比，话单选择范围末尾索引百分比，话单总量)
        _setPlayerStatus:function(isReplay, isEnding, isInit, beginTime, endTime, leftPercent, rightPercent, totalNum) {
            if (isReplay) //若是“重放”
            {
                $("#track-player-status")[0].innerHTML = i18n.t('gismodule.manageAimTrackModule.playPanel.statePlay'); //修改状态提示
                $("#trackPlayerPlay").hide(); //隐藏“播放”键
                $("#trackPlayerPause").show(); //显示“暂停”键
                $("#track-player-progressTip")[0].innerHTML =i18n.t('gismodule.manageAimTrackModule.playPanel.currentSpeed') +"1x"; //设置重放速度
                $("#track-player-progressTip").attr("progress", "1");
                speed = 1;//进度条速度恢复默认
            } else {
                $("#track-player-status")[0].innerHTML = i18n.t('gismodule.manageAimTrackModule.playPanel.stateFilter');
                $("#trackPlayerPlay").show();
                $("#trackPlayerPause").hide();
                $("#track-player-progressTip")[0].innerHTML = i18n.t('gismodule.manageAimTrackModule.playPanel.currentSpeed')+"0x";
                $("#track-player-progressTip").attr("progress", "0");
                speed = 1;//进度条速度恢复默认
            }

            if (isEnding) //若是播放结束
            {
                $("#track-player-status")[0].innerHTML = i18n.t('gismodule.manageAimTrackModule.playPanel.stateFinish'); //修改状态提示
                $("#rang-progressBar-excute").css({
                    "left": 0,
                    "width": "100%"
                });
            } else {
                //设置执行进度为0
                $("#rang-progressBar-excute").css({
                    "left": 0,
                    "width": 0
                });
            }

            if (isInit) {
                $("#rang-beginTime-tip")[0].innerHTML = beginTime[0] + '<br/>' + beginTime[1]; //设置话单开始时间
                $("#rang-endTime-tip")[0].innerHTML = endTime[0] + '<br/>' + endTime[1]; //设置话单结束时间

                //当没有选择话单范围（默认为最大范围）时，不必显示选中范围起止时间
                var startIndex = parseInt(totalNum * leftPercent);
                var endIndex = totalNum - parseInt(totalNum * rightPercent) - 1;
                if (startIndex != 0 || endIndex < (totalNum - 1)) {
                    var selectStartTime = this.phoneBills[startIndex].time.split(" ");
                    var selectEndTime = this.phoneBills[endIndex].time.split(" ");
                    $("#rang-selectedBeginTime-tip")[0].innerHTML = selectStartTime[0] + "<br/>" + selectStartTime[1]; //设置话单范围起始时间
                    $("#rang-selectedEndTime-tip")[0].innerHTML = selectEndTime[0] + "<br/>" + selectEndTime[1]; //设置话单范围结束时间
                    $("#rang-selectedBeginTime-tip").show();
                    $("#rang-selectedEndTime-tip").show();
                } else {
                    $("#rang-selectedBeginTime-tip").innerHTML = ""; //设置话单范围起始时间
                    $("#rang-selectedEndTime-tip").innerHTML = ""; //设置话单范围结束时间
                    $("#rang-selectedBeginTime-tip").hide();
                    $("#rang-selectedEndTime-tip").hide();
                }
                $("#rang-slider-begin").attr("startindex", startIndex);
                $("#rang-slider-end").attr("endindex", endIndex);

                //设置话单选择范围
                var barWidth = parseInt($("#rang-progressBar-full")[0].offsetWidth); //获取进度条宽度
                $("#rang-progressBar-left").css("width", parseInt(barWidth * leftPercent)); //左侧范围
                $("#rang-progressBar-right").css({
                    "left": barWidth - parseInt(barWidth * rightPercent - 8),
                    "width": parseInt(barWidth * rightPercent)
                }); //右侧范围
                var left = parseInt($("#rang-progressBar-left").css("left")) + parseInt($("#rang-progressBar-left").css("width"));
                var right = parseInt($("#rang-progressBar-right").css("left"));
                $("#rang-slider-begin").css("left", left - 8); //“开始”滑块
                $("#rang-slider-end").css("left", right); //“结束”滑块
                $("#rang-progressBar-excute_parent").css({
                    "left": left,
                    "width": barWidth - parseInt(barWidth * leftPercent) - parseInt(barWidth * rightPercent)
                });
            }
        },

        //计时方法
        startTimeout:function () {
            if (excuteProcess < 100) {
                //设置播放进度条的宽度
                document.getElementById("rang-progressBar-excute").style.width = excuteProcess + 1 + "%";
                timeControl = setTimeout(thisObject.startTimeout, perInterval);

                excuteProcess = excuteProcess + speed;
            } else {
                //更新状态(播放完毕)
                thisObject._endingPlay($("#trackPlay").attr("aimId"), true);
            }
        },

        //进度条播放
        _playerProcessBarExcutePlay:function () {
            //设置播放进度条的起始位置
            $("#rang-progressBar-excute_parent").css("left", parseFloat($("#rang-slider-begin").css("left")) + 8);
            //计算时间间隔
            perInterval = totalTime / 100;
            //设置进度条执行长度
            excuteLength = parseFloat($("#rang-slider-end").css("left")) - (parseFloat($("#rang-slider-begin").css("left")) + parseFloat($("#rang-slider-begin").css("width"))) + 1;
            $("#rang-progressBar-excute_parent").css("width", excuteLength);
            //开始执行
            thisObject.startTimeout();
        },

        //结束播放（播放完毕、正在播放时目标切换时调用）
        //参数：aimID（目标ID），isFinish（标记是否播放完毕）
        _endingPlay:function (aimID, isFinish) {
            if (timeControl != null) {
                clearTimeout(timeControl); //终止播放轨迹播放器
                excuteProcess = 0; //计数设为0
                timeControl = null;
            }

            //设置播放完毕的轨迹颜色可更改
            $(".color-btn").each(function(){
                var check = $(this).closest(".checkbox-custom")[0].children[0];
                var aim = $(check).attr("aimId");
                if(aim == aimID)
                {
                    $(this).removeAttr("disabled");
                    $(this).css("cursor", "pointer");
                    $(this).removeAttr("title");
                }
            });

            if (isFinish) {
                thisObject._setPlayerStatus(false, true, false, null, null, -1, -1, -1); //修改播放器状态，标记播放完毕
            } else {
                thisObject.terminate(); //终止播放轨迹
            }

            //若当前有话单列表中的话单处于选中状态，则取消对话单的选中
            var selectBill = $(".talkBubble-select");
            if (selectBill.length > 0) {
                selectBill.removeClass("talkBubble-select")
                    .addClass("talkBubble");
            }
        },

        //轨迹播放面板展示
        _showTracePlayerPanel:function(targetName){
            var longitude = -1; //经度
            var latitude = -1; //纬度
            var billTime = ""; //时间
            var otherInfo = {};

            //定位需要展现的列
            for (item in aimList[targetName]) {
                if (item == "columns" || item == "data" || item == "name") {
                    continue;
                }

                var colName = aimList[targetName][item];
                var colPosi = -1;

                var columns = aimList[targetName]["columns"];
                for (var i = 0; i < columns.length; i++) {
                    if (columns[i] == colName) {
                        colPosi = i;
                        break;
                    }
                }

                if (item == "longitude") {
                    longitude = colPosi;
                    continue;
                }
                if (item == "latitude") {
                    latitude = colPosi;
                    continue;
                }
                if (item == "time") {
                    billTime = colPosi;
                }

                otherInfo[colName] = colPosi;
            }

            var data = aimList[targetName]["data"];
            var beginTime = data[0][billTime];
            var endTime = data[data.length - 1][billTime];
            var endIndex = data.length - 1;
            var leftPercent = 0;
            var rightPercent = 0;

            this.phoneBills = [];
            for (num in data) {
                var eachData = data[num];
                this.phoneBills.push({"index":num,"time":eachData[billTime],"lng":eachData[longitude],"lat":eachData[latitude]});
            }
            //所有点聚类图层移除，单个轨迹聚类图层上图
            if(map.hasLayer(markersCluster) && this.targetList[targetName] != undefined)
            {
                map.removeLayer(markersCluster);
                map.addLayer(this.targetList[targetName].markers);
            }
            else
            {
                return;
            }

            var panel = Dialog.build({
                title: i18n.t('gismodule.manageAimTrackModule.playPanel.title'),
                content: thisObject._createTrackPlayPanel(targetName,beginTime,endTime,endIndex),
                hideLeftBtn:true,
                hideRightBtn:true,
                hideFooter:true
            });
            document.getElementById("trackPlayer").innerHTML = panel;
            thisObject._addTrackPlayerEvent();
            thisObject._addTrackSliderOprationEvent();
            Dialog.show(function(){
                //设置list面板的高度
                $(".target-aimList-style").height($(".track-group-body").height() - 248);
                //显示播放器面板
                $("#trackPlayer").show();
                //设置播放器初始状态状态
                thisObject._setPlayerStatus(false, false, true, beginTime.split(" "), endTime.split(" "), leftPercent, rightPercent, data.length);

                //当前播放轨迹图层放在最上面
//                thisObject._bringLayerToFront(targetName);
                //轨迹定位到地图中间
                thisObject._fitTargetTrace(targetName);
            });
        },

        //隐藏播放面板
        _hideTrackPlayerPanel:function(targetName){
            if(this.targetList[targetName] == undefined)
                return;
            $("#trackPlayer").hide();
            $(".target-aimList-style").height($(".track-group-body").height() - 76);
            //所有点聚类图层上图，单个轨迹聚类图层移除
            for(var aim in this.targetList)
            {
                if(map.hasLayer(this.targetList[aim].markers))
                {
                    map.removeLayer(this.targetList[aim].markers);
                }
            }
            map.addLayer(markersCluster);
        },

        //图层放在地图最上面
        _bringLayerToFront:function(targetName){
            var z = this._map.getZoom();
            for(var aim in this.targetList)
            {
                var len = this.targetList[aim].markers._featureGroup.getLayers().length;
                if(aim == targetName)
                {
                    for(var i = 0; i< len;i++)
                    {
                        this.targetList[aim].markers._featureGroup.getLayers()[i].setZIndexOffset(10000);
                    }
                    this.targetList[aim].smoothlines[z].bringToFront();
                }
                else
                {
                    for(var i = 0; i< len;i++)
                    {
                        this.targetList[aim].markers._featureGroup.getLayers()[i].setZIndexOffset(100);
                    }
                    this.targetList[aim].smoothlines[z].bringToBack();
                }

            }

        },

        //比例尺变化时的轨迹更新
        _mapZoomShow: function() {
            this._map.on('zoomend', function(e) {
                //移除播放的动态轨迹
                if (this.current != undefined) {
                    if (this._map.hasLayer(this.current.marker)) {
                        this.current.marker.stop();
                        this._map.removeLayer(this.current.marker);
                        this._resetTargetTrace(this.current.name, this.selectedTargerList[this.current.name]);
                    }
                    this.current = undefined;
                }
                for (var targetName in this.selectedTargerList) {
                    //移除上一个比例尺下的目标轨迹
                    if (this._map.hasLayer(this.targetList[targetName].smoothlines[this.selectedTargerList[targetName]])) {
                        this._map.removeLayer(this.targetList[targetName].smoothlines[this.selectedTargerList[targetName]]);
                    }
                    //移除上一个比例尺下的目标起点终点图标
                    this._map.removeLayer(this.targetList[targetName].icons[this.selectedTargerList[targetName]][0]);
                    this._map.removeLayer(this.targetList[targetName].icons[this.selectedTargerList[targetName]][1]);
                    //记录下当前地图的比例尺
                    this.selectedTargerList[targetName] = this._map.getZoom();
                    //显示新比例尺下的目标轨迹
                    this._map.addLayer(this.targetList[targetName].smoothlines[this.selectedTargerList[targetName]]);
                    //显示新比例尺下的目标起点终点图标
                    this._map.addLayer(this.targetList[targetName].icons[this.selectedTargerList[targetName]][0]);
                    this._map.addLayer(this.targetList[targetName].icons[this.selectedTargerList[targetName]][1]);
                }

                if ($(".trackPlay").length > 0 && $(".trackPlay").is(':visible')) {
                    thisObject._endingPlay($("#trackPlay").attr("aimId"), false);
                    thisObject._setPlayerStatus(false, false, false, null, null, -1, -1, -1)
                }
            }, this);

        },

        _fitTargetTrace: function(tagertName) {
            if (this.targetList[tagertName] != undefined) {
                this._map.fitBounds(this.targetList[tagertName].markers.getBounds());
            }
        },

        //展示选中目标的轨迹
        _showTargerTrace: function(tagertName, color) {
            if(aimList[tagertName] == undefined || aimList[tagertName].data.length <= 1)
            {
                return;
            }
            if(tagertName == 'default')
                return;
            if (this.targetList[tagertName] == undefined) {
                var target = aimList[tagertName];
                var markers_layer = new L.MarkerClusterGroup({
                    spiderfyOnMaxZoom: false,
                    showCoverageOnHover: false,
                    zoomToBoundsOnClick: false,
                    iconCreateFunction: this._myiconCreateFunction,
                    popupContentCreateFunction:this._myClusterPopupContentCreateFunction
                });
                markers_layer.addPointsForOne(target);
                //将目标点分布添加到目标列表中
                this.targetList[target.name] = {};
                this.targetList[target.name].markers = markers_layer;
            }
            //bymxd
            markersCluster.addPoints(aimList[tagertName]);
            if(!this._map.hasLayer(markersCluster))
                this._map.addLayer(markersCluster);
            this._map.fitBounds(markersCluster.getBounds());
            //展示单个目标的聚合轨迹点
            if (this.targetList[tagertName].smoothlines == undefined) {
                this._map.addLayer(this.targetList[tagertName].markers);//轨迹点必须加载到图层上计算轨迹才能准确
                this._map.fitBounds(this.targetList[tagertName].markers.getBounds());
                this.targetList[tagertName].smoothlines = {};
                this.targetList[tagertName].smoothpoints = {};
                this.targetList[tagertName].movingmarker = {};
                this.targetList[tagertName].icons = {};
                if (this.targetList[tagertName].lines == undefined) {
                    this.cp[tagertName] = {};
                    //在各比例尺下分析获取聚类的森林结构
                    this._getClusterGrid(this.targetList[tagertName].markers, tagertName);
                    //生成目标轨迹，并将目标轨迹添加到目标列表中
                    var grid = this._gridLine(tagertName);
                    this.targetList[tagertName].lines = grid.gridlines;
                    this.targetList[tagertName].points = grid.gridpoints;
                }
                //目标轨迹运行时间对象
                this.targetMovingTimes[tagertName] = {};
                //对地图各比例尺下的轨迹进行平滑
                for (var z = 0; z <= this._map.getMaxZoom(); z++) {
                    //对目标轨迹进行平滑
                    var points = [];
                    var pointIndex = [];
                    var m = 0;
                    var inputPoints = this.targetList[tagertName].lines[z];
                    var vector_line_points = {};
                    for (var i = 0; i < this.targetList[tagertName].lines[z].length - 1; i++) {
                        var vector_name = this.targetList[tagertName].points[z][i].toString() + '-' + this.targetList[tagertName].points[z][i + 1].toString();
                        points.push([this.targetList[tagertName].lines[z][i].lat, this.targetList[tagertName].lines[z][i].lng]);
                        pointIndex.push(m);
                        if (!(vector_name in vector_line_points)) {
                            var pts = [];
                            pts.push([this.targetList[tagertName].lines[z][i].lng, this.targetList[tagertName].lines[z][i].lat]);
                            pts.push([this.targetList[tagertName].lines[z][i + 1].lng, this.targetList[tagertName].lines[z][i + 1].lat]);
                            var line_seg = bezier(pts);
                            vector_line_points[vector_name] = line_seg;
                        }
                        for (var j = 1; j < vector_line_points[vector_name].length - 1; j++) {
                            points.push([vector_line_points[vector_name][j][1], vector_line_points[vector_name][j][0]]);
                        }
                        m += vector_line_points[vector_name].length-1;
                    }
                    pointIndex.push(m);
                    points.push([this.targetList[tagertName].lines[z][inputPoints.length - 1].lat, this.targetList[tagertName].lines[z][inputPoints.length - 1].lng]);

                    this.targetList[tagertName].smoothpoints[z] = points;
                    //生成平滑后的轨迹
                    this.targetList[tagertName].smoothlines[z] = new L.Polyline.AntPath(points, {
                        stroke: true,
                        color: color,
                        dashArray: [2, 15],
                        lineCap: null,
                        lineJoin: null,
                        weight: 2,
                        opacity: 0.7,
                        fill: false,
                        fillColor: null, //same as color by default
                        fillOpacity: 0.2,
                        clickable: false,
                        delay:1000
                    });
                    //生成轨迹动画对象
                    this.targetList[tagertName].movingmarker[z] = new L.Marker.movingMarker(points, 1000 * inputPoints.length, {
                        color: color
                    });
                    {
                        //为业务数据点添加特殊处理,起点与终点不处理
                        var pcIndex = {};
                        for (var i = 1; i < pointIndex.length - 1; i++) {
                            this.targetList[tagertName].movingmarker[z].addStation(pointIndex[i], 0);
                            pcIndex[pointIndex[i]] = this.pc[tagertName][z][i];
                        }
                        var pcs = this.pc[tagertName][z][0];
                        var pce = this.pc[tagertName][z][pointIndex.length - 1];
                        var len = this.pc[tagertName][z].length;
                        this.pc[tagertName][z] = pcIndex;
                        this.pc[tagertName][z][0] = pcs;
                        this.pc[tagertName][z][len - 1] = pce;
                        this.pc[tagertName][z].length = len;
                    }
                    //生成起点终点对象
                    this.targetList[tagertName].icons[z] = [new L.marker(points[0], {
                        icon: this.starticon
                    }), new L.marker(points[points.length - 1], {
                        icon: this.endicon
                    })];
                    //不同比例尺下设置目标运行时间
                    this.targetMovingTimes[tagertName][z] = 1000 * inputPoints.length;
                }
                //bymxd
                //this.targetList[tagertName].markers.clearLayers();
                this._map.removeLayer(this.targetList[tagertName].markers);//轨迹计算结束后移除单条轨迹聚类
            }
            //在地图当前比例尺上添加目标平滑后的轨迹
            this._map.addLayer(this.targetList[tagertName].smoothlines[this._map.getZoom()]);
            //在地图当前比例尺上添加起点终点图标
            this._map.addLayer(this.targetList[tagertName].icons[this._map.getZoom()][0]);
            this._map.addLayer(this.targetList[tagertName].icons[this._map.getZoom()][1]);
            //记录所选目标及当前比例尺信息
            this.selectedTargerList[tagertName] = this._map.getZoom();
        },

        //移除选中目标的轨迹
        _hideTargerTrace: function(tagertName) {
            if(aimList[tagertName] == undefined || aimList[tagertName].data.length <= 1)
            {
                return;
            }
            if(tagertName == 'default')
                return;
            //如果不存在就返回
            if(this.targetList[tagertName] == undefined)
                return;
            if (this.targetList[tagertName].pLayers != undefined) {
                this.filterTargetTrace(tagertName, 0, this.targetList[tagertName].pLayers.length - 1);
            }
            var z = this._map.getZoom();
            if (this.selectedTargerList[tagertName] != undefined) {
                delete this.selectedTargerList[tagertName];
            }
            //移除静态轨迹线
            if (this._map.hasLayer(this.targetList[tagertName].smoothlines[z])) {
                this._map.removeLayer(this.targetList[tagertName].smoothlines[z]);
            }
            //移除轨迹点
            if (this._map.hasLayer(this.targetList[tagertName].markers)) {
                this._map.removeLayer(this.targetList[tagertName].markers);
            }
            markersCluster.removePoints(aimList[tagertName]);
            //移除起点终点图标
            if (this._map.hasLayer(this.targetList[tagertName].icons[z][0])) {
                this._map.removeLayer(this.targetList[tagertName].icons[z][0]);
            }
            if (this._map.hasLayer(this.targetList[tagertName].icons[z][1])) {
                this._map.removeLayer(this.targetList[tagertName].icons[z][1]);
            }
            //移除播放后的动态轨迹线
            if (this.current != undefined && this.current.name == tagertName) {
                if (this._map.hasLayer(this.current.marker)) {
                    this.current.marker.stop();
                    this._map.removeLayer(this.current.marker);
                    this._resetTargetTrace(this.current.name, z);
                }
                this.current = undefined;
            }
        },

        //重新加载轨迹
        _reloadTargetTrace:function(targetName){
            var color;
            $("input[name='reviewAim']").each(function(){
                if($(this).attr("aimId") == targetName)
                {
                    color = $(this).attr("trackColor");
                    thisObject._hideTargerTrace(targetName);
                    delete thisObject.targetList[targetName];
                    thisObject._showTargerTrace(targetName,color);
                }
            });
        },

        //设置目标轨迹线的颜色
        _setTargetTraceColor: function(tagertName, color) {
            if (this.targetList[tagertName] != undefined &&this.targetList[tagertName].smoothlines != undefined) {
                var linesLayer = this.targetList[tagertName].smoothlines[this._map.getZoom()];
                for (var z = 0; z <= this._map.getMaxZoom(); z++) {
                    this.targetList[tagertName].smoothlines[z] =new L.Polyline.AntPath(this.targetList[tagertName].smoothpoints[z], {
                        stroke: true,
                        color: color,
                        dashArray: [2, 15],
                        lineCap: null,
                        lineJoin: null,
                        weight: 2,
                        opacity: 0.7,
                        fill: false,
                        fillColor: null, //same as color by default
                        fillOpacity: 0.2,
                        clickable: false,
                        delay:1000
                    });
                    this.targetList[tagertName].movingmarker[z].options.color = color;
                }
                if (this._map.hasLayer(linesLayer)) {
                    this._map.removeLayer(linesLayer);
                    this._map.addLayer(this.targetList[tagertName].smoothlines[this._map.getZoom()]);
                }
            }
        },

        //播放目标轨迹，每次只播放一个目标，播放互斥
        playTargetTrace: function(targetName) {
            var z = this._map.getZoom();
            //判断当前是否没有目标在播放
            if (this.current == undefined) {
                //第一次播放，设置当前目标信息
                if (targetName in this.selectedTargerList) {
                    this.current = {};
                    this.targetList[targetName].movingmarker[z].addTo(this._map);
                    this.current.name = targetName;
                    this.current.marker = this.targetList[targetName].movingmarker[z];
                    //移除当前目标轨迹信息
                    if (this._map.hasLayer(this.targetList[targetName].smoothlines[z])) {
                        this._map.removeLayer(this.targetList[targetName].smoothlines[z]);
                    }
                }
            }
            //播放其他目标
            else if (this.current.name != targetName) {
                //移除之前目标播放的动态轨迹
                if (this._map.hasLayer(this.current.marker)) {
                    this.current.marker.stop();
                    this._map.removeLayer(this.current.marker);
                    this._resetTargetTrace(this.current.name, z);
                }
                //添加之前目标的静态轨迹
                if (!this._map.hasLayer(this.targetList[this.current.name].smoothlines[z])) {
                    this._map.addLayer(this.targetList[this.current.name].smoothlines[z]);
                }
                //设置当前目标信息
                this.targetList[targetName].movingmarker[z].addTo(this._map);
                this.current.name = targetName;
                this.current.marker = this.targetList[targetName].movingmarker[z];
                //移除当前目标轨迹信息
                if (this._map.hasLayer(this.targetList[targetName].smoothlines[z])) {
                    this._map.removeLayer(this.targetList[targetName].smoothlines[z]);
                }
            }
            //播放当前目标
            this.current.marker.start();
            //返回当前比例尺下目标的轨迹运行时间
            return this.targetMovingTimes[this.current.name][z];
        },

        //轨迹时间区间设置
        filterTargetTrace: function(targetName, startIndex, endIndex) {
            if (targetName in this.selectedTargerList) {
                if (this.targetName == targetName && this.startIndex == startIndex && this.endIndex == endIndex) {
                    return;
                }
                if (this.targetList[targetName].pLayers == undefined) {
                    this.targetList[targetName].pLayers = [];
                    for (var id in this.targetList[targetName].markers.markers_layer._layers) {
                        this.targetList[targetName].pLayers.push(this.targetList[targetName].markers.markers_layer._layers[id]);
                    }
                }
                if (this.targetList[targetName].pLayers != undefined) {
                    var len = this.targetList[targetName].pLayers.length;
                    if (startIndex < 0 || endIndex > len - 1 || startIndex >= endIndex) {
                        console.log(i18n.t('gismodule.manageAimTrackModule.log.text1'));
                        return;
                    }
                    if (len == (endIndex - startIndex + 1) && (endIndex - startIndex + 1) == this.targetList[targetName].markers.getLayers().length) {
                        return;
                    }
                    var i = 0;
                    //从头开始删点
                    for (; i < startIndex; i++) {
                        if (this.targetList[targetName].markers.hasLayer(this.targetList[targetName].pLayers[i])) {
                            this.targetList[targetName].markers.removeLayer(this.targetList[targetName].pLayers[i]);
                        }
                    }
                    //中间添加点
                    for (; i <= endIndex; i++) {
                        if (!this.targetList[targetName].markers.hasLayer(this.targetList[targetName].pLayers[i])) {
                            this.targetList[targetName].markers.addLayer(this.targetList[targetName].pLayers[i]);
                        }
                    }
                    //删到尾部的点
                    for (; i < len; i++) {
                        if (this.targetList[targetName].markers.hasLayer(this.targetList[targetName].pLayers[i])) {
                            this.targetList[targetName].markers.removeLayer(this.targetList[targetName].pLayers[i]);
                        }
                    }
                }
                var z = this.selectedTargerList[targetName];
                //移除当前目标轨迹信息
                if (this._map.hasLayer(this.targetList[targetName].smoothlines[z])) {
                    this._map.removeLayer(this.targetList[targetName].smoothlines[z]);
                }
                //移除起点终点图标
                if (this._map.hasLayer(this.targetList[targetName].icons[z][0])) {
                    this._map.removeLayer(this.targetList[targetName].icons[z][0]);
                }
                if (this._map.hasLayer(this.targetList[targetName].icons[z][1])) {
                    this._map.removeLayer(this.targetList[targetName].icons[z][1]);
                }
                //移除播放后的动态轨迹线
                if (this.current != undefined && this.current.name == targetName) {
                    if (this._map.hasLayer(this.current.marker)) {
                        this.current.marker.stop();
                        this._map.removeLayer(this.current.marker);
                    }
                    this.current = undefined;
                }
                this.targetName = targetName;
                this.startIndex = startIndex;
                this.endIndex = endIndex;
                var color = this.targetList[targetName].movingmarker[0].options.color;
                //重新计算并展示新的轨迹
                {
                    this.targetList[targetName].smoothlines = {};
                    this.targetList[targetName].smoothpoints = {};
                    this.targetList[targetName].movingmarker = {};
                    this.targetList[targetName].icons = {}; {
                    this.cp[targetName] = {};
                    //在各比例尺下分析获取聚类的森林结构
                    this._getClusterGrid(this.targetList[targetName].markers, targetName);
                    var grid = this._gridLine(targetName);
                    //生成目标轨迹，并将目标轨迹添加到目标列表中
                    this.targetList[targetName].lines = grid.gridlines;
                    this.targetList[targetName].points = grid.gridpoints;
                    //this.targetList[targetName].vector= grid.gridvector;
                }
                    this.targetMovingTimes[targetName] = {};
                    //对地图各比例尺下的轨迹进行平滑
                    for (var z = 0; z <= this._map.getMaxZoom(); z++) {
                        //对目标轨迹进行平滑
                        var points = [];
                        var pointIndex = [];
                        var m = 0;
                        var inputPoints = this.targetList[targetName].lines[z];
                        var vector_line_points = {};
                        for (var i = 0; i < this.targetList[targetName].lines[z].length - 1; i++) {
                            var vector_name = this.targetList[targetName].points[z][i].toString() + '-' + this.targetList[targetName].points[z][i + 1].toString();
                            points.push([this.targetList[targetName].lines[z][i].lat, this.targetList[targetName].lines[z][i].lng]);
                            pointIndex.push(m);
                            if (!(vector_name in vector_line_points)) {
                                var pts = [];
                                pts.push([this.targetList[targetName].lines[z][i].lng, this.targetList[targetName].lines[z][i].lat]);
                                pts.push([this.targetList[targetName].lines[z][i + 1].lng, this.targetList[targetName].lines[z][i + 1].lat]);
                                var line_seg = bezier(pts);
                                vector_line_points[vector_name] = line_seg;
                            }
                            for (var j = 1; j < vector_line_points[vector_name].length - 1; j++) {
                                points.push([vector_line_points[vector_name][j][1], vector_line_points[vector_name][j][0]]);
                            }
                            m += vector_line_points[vector_name].length-1;
                        }
                        pointIndex.push(m);
                        points.push([this.targetList[targetName].lines[z][inputPoints.length - 1].lat, this.targetList[targetName].lines[z][inputPoints.length - 1].lng]);

                        this.targetList[targetName].smoothpoints[z] = points;
                        //生成平滑后的轨迹
                        this.targetList[targetName].smoothlines[z] =new L.Polyline.AntPath(points, {
                            stroke: true,
                            color: color,
                            dashArray: [2, 15],
                            lineCap: null,
                            lineJoin: null,
                            weight: 2,
                            opacity: 0.7,
                            fill: false,
                            fillColor: null, //same as color by default
                            fillOpacity: 0.2,
                            clickable: false,
                            delay:1000
                        });
                        //生成轨迹动画对象
                        this.targetList[targetName].movingmarker[z] = new L.Marker.movingMarker(points, 1000 * inputPoints.length, {
                            color: color
                        });
                        {
                            //为业务数据点添加特殊处理,起点与终点不处理
                            var pcIndex = {};
                            for (var i = 1; i < pointIndex.length - 1; i++) {
                                this.targetList[targetName].movingmarker[z].addStation(pointIndex[i], 0);
                                pcIndex[pointIndex[i]] = this.pc[targetName][z][i];
                            }
                            var pcs = this.pc[targetName][z][0];
                            var pce = this.pc[targetName][z][pointIndex.length - 1];
                            var len = this.pc[targetName][z].length;
                            this.pc[targetName][z] = pcIndex;
                            this.pc[targetName][z][0] = pcs;
                            this.pc[targetName][z][len - 1] = pce;
                            this.pc[targetName][z].length = len;
                        }
                        //生成起点终点对象
                        this.targetList[targetName].icons[z] = [new L.marker(points[0], {
                            icon: this.starticon
                        }), new L.marker(points[points.length - 1], {
                            icon: this.endicon
                        })];
                        //不同比例尺目标轨迹的运行时间
                        this.targetMovingTimes[targetName][z] = 1000 * inputPoints.length;
                    }
                    //在地图当前比例尺上添加目标平滑后的轨迹
                    this._map.addLayer(this.targetList[targetName].smoothlines[this._map.getZoom()]);
                    //在地图当前比例尺上添加起点终点图标
                    this._map.addLayer(this.targetList[targetName].icons[this._map.getZoom()][0]);
                    this._map.addLayer(this.targetList[targetName].icons[this._map.getZoom()][1]);
                }
            }
        },

        //终止播放
        terminate: function() {
            if (this.current != undefined) {
                var z = this._map.getZoom();
                this.current.marker.stop();
                this._map.removeLayer(this.current.marker);
                this._resetTargetTrace(this.current.name, z);
                //添加目标的静态轨迹
                if (!this._map.hasLayer(this.targetList[this.current.name].smoothlines[z])) {
                    this._map.addLayer(this.targetList[this.current.name].smoothlines[z]);
                }
                this.current = undefined;
            }
        },

        //暂停播放
        pauseTargetTrace: function() {
            if (this.current != undefined) {
                this.current.marker.pause();
            }
        },

        //快进播放
        speedUp: function() {
            if (this.current != undefined) {
                var len = this.current.marker._durations.length;
                for (var i = 0; i < len; i++) {
                    this.current.marker._durations[i] /= 2;
                }
            }
        },

        //慢进播放
        speedDown: function() {
            if (this.current != undefined) {
                var len = this.current.marker._durations.length;
                for (var i = 0; i < len; i++) {
                    this.current.marker._durations[i] *= 2;
                }
            }
        },

        //重新播放
        replayTargetTrace: function() {
            if (this.current != undefined) {
                var z = this._map.getZoom();
                this.current.marker.stop();
                this._map.removeLayer(this.current.marker);
                this.current.marker = this._resetTargetTrace(this.current.name, z);
                this.current.marker.addTo(this._map);
                this.current.marker.start();
            }
        },

        //恢复特定比例尺下目标轨迹播放设置
        _resetTargetTrace: function(targetName, z) {
            var latlngs = this.targetList[targetName].smoothpoints[z];
            var len = this.targetList[targetName].lines[z].length;
            var color = this.targetList[targetName].movingmarker[z].options.color;
            var station = this.targetList[targetName].movingmarker[z]._stations;
            this.targetList[targetName].movingmarker[z] = new L.Marker.movingMarker(latlngs, 1000 * len, {
                color: color
            });
            this.targetList[targetName].movingmarker[z]._stations = station;
            return this.targetList[targetName].movingmarker[z];
        },

        //目标生成轨迹变量初始化
        _init_cluster: function(target) {
            this.clusterPoints = {};
            this.clusterChildPoints = {};
            this.child_cluster = {};
            this.pointsID[target] = [];
            this.pointsArray = {};
            for (var i = 0; i <= this._map.getMaxZoom(); i++) {
                this.clusterPoints[i] = {};
                this.child_cluster[i] = {};
                this.cp[target][i] = {};
            }
        },

        //在地图各比例尺下生成轨迹
        _getClusterGrid: function(markers, target) {
            this._init_cluster(target);
            if (markers.getLayers().length === 0) {
                return;
            }
            var points = markers.getLayers();
            for (var i = 0; i < points.length; i++) {
                this.pointsID[target].push(points[i]._leaflet_id);
                this.pointsArray[points[i]._leaflet_id] = points[i]._latlng;
            }
            //根据id从小到大排序（即时间先后顺序）
            this.pointsID[target].sort(function(a, b) {
                return a - b;
            });
            //2016-3-29修改
            var gridClusters = markers._gridClusters;
            for (var z in gridClusters) {
                var grid = gridClusters[z]._grid;
                for (var key1 in grid) {
                    for (var key2 in grid[key1]) {
                        var leafletid = grid[key1][key2][0]._leaflet_id;
                        this.clusterPoints[z][leafletid] = grid[key1][key2][0]._latlng;
                        this.clusterChildPoints[leafletid] = grid[key1][key2][0].getAllChildMarkers();
                        for (var j = 0; j < this.clusterChildPoints[leafletid].length; j++) {
                            this.child_cluster[z][this.clusterChildPoints[leafletid][j]._leaflet_id] = leafletid;
                            this.cp[target][z][this.clusterChildPoints[leafletid][j]._leaflet_id] = this.clusterPoints[z][leafletid];
                        }
                    }
                }
            }
        },

        //递归的获取各比例尺下聚类的数据信息，（聚类为数据结构为森林）
        _getClusterData: function(zoom, childCluster, target) {
            if (zoom > this._map.getMaxZoom()) {
                return;
            }
            var leafletid = childCluster._leaflet_id;
            this.clusterPoints[zoom][leafletid] = childCluster._latlng;
            this.clusterChildPoints[leafletid] = childCluster.getAllChildMarkers();
            for (var j = 0; j < this.clusterChildPoints[leafletid].length; j++) {
                this.child_cluster[zoom][this.clusterChildPoints[leafletid][j]._leaflet_id] = leafletid;
                this.cp[target][zoom][this.clusterChildPoints[leafletid][j]._leaflet_id] = this.clusterPoints[zoom][leafletid];
            }
            for (var i = 0; i < childCluster._childClusters.length; i++) {
                this._getClusterData(zoom + 1, childCluster._childClusters[i], target);
            }
        },

        //根据各比例尺聚类生成对应比例尺下的轨迹
        _gridLine: function(target) {
            var grid = {};
            var gridpoints = {};
            var gridlines = {};
            this.pc[target] = {};
            for (var i = 0; i <= this._map.getMaxZoom(); i++) {
                this.pc[target][i] = {};
                var index = 0;
                //points array
                var p_array = [];
                var pre_cluster_id = null;
                //轨迹线段向量
                var pointsSeq = []; //记录点的ID序列
                var line_vector = {};
                //遍历点集合，进行连线
                for (var j = 0; j < this.pointsID[target].length; j++) {
                    //检测是否属于聚合点
                    if (this.pointsID[target][j] in this.child_cluster[i]) {
                        if (pre_cluster_id === this.child_cluster[i][this.pointsID[target][j]]) {
                            continue;
                        } else {
                            p_array.push(this.clusterPoints[i][this.child_cluster[i][this.pointsID[target][j]]]);
                            pre_cluster_id = this.child_cluster[i][this.pointsID[target][j]];
                            this.pc[target][i][index++] = j;
                            pointsSeq.push(pre_cluster_id);
                        }
                    } else {
                        p_array.push(this.pointsArray[this.pointsID[target][j]]);
                        this.pc[target][i][index++] = j;
                        pointsSeq.push(this.pointsID[target][j]);
                    }
                }
                this.pc[target][i].length = index;
                gridlines[i] = p_array;
                gridpoints[i] = pointsSeq;
            }
            grid.gridlines = gridlines;
            grid.gridpoints = gridpoints;
            return grid;
        },

        //（私有）添加图层面板上的元素
        _addPanel: function() {
            var parentId = document.getElementById(this.options.panelParentID);
            parentId.innerHTML = this._createPanelInnerHtml(); //在指定的元素内添加html
            $(".track-group-title").click(function(){
                if($("#out-panel").hasClass("out-panel-open"))
                {
                    $("#out-panel").removeClass("out-panel-open");
                }
                else
                {
                    $("#out-panel").addClass("out-panel-open");
                }
            });
        },

        //生成图层面板的内部HTML
        _createPanelInnerHtml: function() {
            var innerHtml =
                //轨迹面板页头设置
                '<div class="panel" style="opacity: 0.9">'+
                '<div class="track-group-title" unselectable="on" style="-webkit-user-select: none;">' +
                    '<span class="fa fa-exchange text-primary" style="font-size: 23px;padding-left: 12px;padding-right: 12px;"></span>'+
                    '<span class="panel-title">'+i18n.t('gismodule.manageAimTrackModule.topMenu.title')+'</span>'+
                '</div>' +
                //轨迹面板主要内容设置
                '<div class="track-group-body">' +
                    //切换展示方式
                    '<div style="padding: 10px;height: 59px">'+
//                        '<button id="AimDistribute" type="button" class="btn btn-primary btn-gradient btn-alt btn-block item-active" style="float: left;margin-left: 15px;width: 78">目标分布</button>' +
//                        '<button id="AimTrack" type="button" class="btn btn-primary btn-gradient btn-alt btn-block" style="float: left;margin-left: 15px;width: 78">目标轨迹</button>' +
//                        '<button id="AimHeatmap" type="button" class="btn btn-primary btn-gradient btn-alt btn-block" style="float: left;margin-left: 15px;width: 78">目标热点</button>'+
                            '<img id="AimDistribute" title="'+i18n.t('gismodule.manageAimTrackModule.topMenu.destribute')+'" src="../js/components/gisWidget/manageAimTrackModule/image/0003.png" style="float: left;margin-left: 35px;width: 48px;height: 48px"/>'+
                            '<img id="AimTrack" title="'+i18n.t('gismodule.manageAimTrackModule.topMenu.track')+'" src="../js/components/gisWidget/manageAimTrackModule/image/0004.png" style="float: left;margin-left: 35px;width: 48px;height: 48px"/>'+
                            '<img id="AimHeatmap" title="'+i18n.t('gismodule.manageAimTrackModule.topMenu.heatmap')+'" src="../js/components/gisWidget/manageAimTrackModule/image/0005.png" style="float: left;margin-left: 35px;width: 48px;height: 48px"/>'+
                    '</div>'+
                    '<hr style="height:1px;background: #e2e2e2;border: 0px;"/>' +
                    '<div class="target-aimList-style"></div>' +
                    '<div id="trackPlayer" style="display: none">'+
                    '</div>'+
                '</div>'+
                '</div>';
            return innerHtml;
        },

        //添加目标列表
        _addAimList: function() {
            var targetAimListInnerHtml = "";
            var num = 1;
            var sourceOrResult = {};

            //遍历目标列表，生成目标选择列表html
            if('default' in aimList)
            {
                var aimID = 'default';
                var aimName = i18n.t('gismodule.manageAimTrackModule.trackList.defaultTrack');
                var aimColor = '#FF0000';
                targetAimListInnerHtml += '<div id="list-without-num"><lable  style="font-size: 15px;font-family:microsoft yahei;color: #888888;padding-left: 2px">'+i18n.t('gismodule.manageAimTrackModule.trackList.trackWithoutNum')+'</lable><div>';
                targetAimListInnerHtml += thisObject._createAimNode(aimID,aimName,aimColor);
                targetAimListInnerHtml += '</div></div>';

                var count = 0;
                for(var ainid in aimList)//查看list里面有多少个目标
                {
                    count++;
                }
                //如果除了default目标之外
                if(count - 1 > 0)
                {
                    targetAimListInnerHtml += '<div id="list-with-num"><lable  style="font-size: 15px;font-family:microsoft yahei;color: #888888;padding-left: 2px">'+i18n.t('gismodule.manageAimTrackModule.trackList.trackWithNum')+'</lable><div>';
                    for (aim in aimList) {
                        if(aim == 'default')
                            continue;
                        var aimID = aim; //目标ID（目标号码）
                        var aimName = i18n.t('gismodule.manageAimTrackModule.trackList.target') + num; //目标名
                        var aimColor = aimListColor[aim];
                        targetAimListInnerHtml += thisObject._createAimNode(aimID,aimName,aimColor);
                        num++;
                    }
                    targetAimListInnerHtml += '</div></div>';
                }
            }
            else
            {
                for (aim in aimList) {
                    var aimID = aim; //目标ID（目标号码）
                    var aimName = i18n.t('gismodule.manageAimTrackModule.trackList.target') + num; //目标名
                    var aimColor = aimListColor[aim];
                    targetAimListInnerHtml += thisObject._createAimNode(aimID,aimName,aimColor);
                    num++;
                }
            }

            if (targetAimListInnerHtml == "") //无目标数据时，给出提示
            {
                $(".track-group-body")[0].innerHTML =
                    '<div id="aimSelectTip" class="alert alert-info" style="display: block">'+
                        '<span class="glyphicon glyphicon-warning-sign"></span>'+
                        '<strong id="aimSelectTipLabel">'+i18n.t('gismodule.manageAimTrackModule.trackList.loading')+'</strong>'+
                    '</div>';
            } else //有目标数据时，添加html，以及对应的事件
            {
                $(".target-aimList-style")[0].innerHTML = targetAimListInnerHtml;
                this._addAimListEvent(); //添加目标选择列表点击事件
            }
        },

        //生成目标节点
        _createAimNode:function(aimID,aimName,aimColor){
            var innerHtml = '';
            if(aimID == 'default')
            {
                innerHtml +='<div style="padding:3px 10px;">'+
                                '<div class="checkbox-custom checkbox-primary mb5" style="color:#1e2028">'+
                                    '<input aimId="'+aimID+'" aimName="'+aimName+'" trackColor="'+aimColor+'" checked="" name="reviewAim" type="checkbox" id="'+aimID+'">'+
                                    '<label for="'+aimID+'" class="target-aim-style">&nbsp' + aimName + '('+aimID+')'+'</label>'+
                                '</div>'+
                            '</div>';
            }
            else
            {
                innerHtml +='<div style="padding:3px 10px;">'+
                                '<div class="checkbox-custom checkbox-primary mb5" style="color:#1e2028">'+
                                    '<input aimId="'+aimID+'" aimName="'+aimName+'" trackColor="'+aimColor+'" checked="" name="reviewAim" type="checkbox" id="'+aimID+'">'+
                                    '<label for="'+aimID+'" class="target-aim-style">&nbsp' + aimName + '('+aimID+')'+'</label>'+
                                    '<div class="trackControl" style="float:right;display: none">'+
                                        '<div class="btn-group open">'+
                                            '<button aimId="'+aimID+'" type="button" class="btn btn-default btn-xs note-recent-color dropdown-toggle color-btn" style="color: '+aimColor+'" data-toggle="dropdown" tabindex="-1" data-original-title="'+i18n.t('gismodule.manageAimTrackModule.btn.currentColor')+'" aria-expanded="false">'+
                                                '<span class="glyphicon glyphicon-tint"></span>'+i18n.t('gismodule.manageAimTrackModule.btn.colorBtn')+
                                            '</button>'+
                                            '<ul class="dropdown-menu pull-right" style="min-width: 172px">'+
                                                '<div class="btn-group" style="margin: 0 5px;">'+
                                                    '<div class="note-palette-title" style="color: #666666;font-weight: normal">'+i18n.t('gismodule.manageAimTrackModule.btn.colorSelect')+'</div>'+
                                                        '<div class="note-color-palette" data-target-event="foreColor"></div>' +
                                                        //thisObject._createColorBox()+
                                                '</div>'+
                                            '</ul>'+
                                        '</div>'+
                                        '<button class="aimPlayerBtn btn btn-default btn-xs" style="color:#0090ff;padding-left: 5px" state="'+i18n.t('gismodule.manageAimTrackModule.btn.playBtn')+'">'+
                                            '<span class="glyphicon glyphicon-play-circle" ></span>'+i18n.t('gismodule.manageAimTrackModule.btn.playBtn')+
                                        '</button>'+
                                    '</div>'+
                                '</div>'+
                            '</div>';
            }
            return innerHtml;
        },

        //生成颜色板
        _createColorBox:function(){
            var innerHtml = '<div class="note-color-palette" data-target-event="foreColor">' +
                                '<div class="note-color-row">' +
                                    '<button type="button" class="note-color-btn" style="background-color:#000000;" data-event="foreColor" data-value="#000000" title="" data-toggle="button" tabindex="-1" data-original-title="#000000"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#424242;" data-event="foreColor" data-value="#424242" title="" data-toggle="button" tabindex="-1" data-original-title="#424242"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#636363;" data-event="foreColor" data-value="#636363" title="" data-toggle="button" tabindex="-1" data-original-title="#636363"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#9C9C94;" data-event="foreColor" data-value="#9C9C94" title="" data-toggle="button" tabindex="-1" data-original-title="#9C9C94"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#CEC6CE;" data-event="foreColor" data-value="#CEC6CE" title="" data-toggle="button" tabindex="-1" data-original-title="#CEC6CE"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#EFEFEF;" data-event="foreColor" data-value="#EFEFEF" title="" data-toggle="button" tabindex="-1" data-original-title="#EFEFEF"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#F7F7F7;" data-event="foreColor" data-value="#F7F7F7" title="" data-toggle="button" tabindex="-1" data-original-title="#F7F7F7"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#FFFFFF;" data-event="foreColor" data-value="#FFFFFF" title="" data-toggle="button" tabindex="-1" data-original-title="#FFFFFF"></button>' +
                                '</div>' +
                                '<div class="note-color-row">' +
                                    '<button type="button" class="note-color-btn" style="background-color:#FF0000;" data-event="foreColor" data-value="#FF0000" title="" data-toggle="button" tabindex="-1" data-original-title="#FF0000"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#FF9C00;" data-event="foreColor" data-value="#FF9C00" title="" data-toggle="button" tabindex="-1" data-original-title="#FF9C00"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#FFFF00;" data-event="foreColor" data-value="#FFFF00" title="" data-toggle="button" tabindex="-1" data-original-title="#FFFF00"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#00FF00;" data-event="foreColor" data-value="#00FF00" title="" data-toggle="button" tabindex="-1" data-original-title="#00FF00"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#00FFFF;" data-event="foreColor" data-value="#00FFFF" title="" data-toggle="button" tabindex="-1" data-original-title="#00FFFF"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#0000FF;" data-event="foreColor" data-value="#0000FF" title="" data-toggle="button" tabindex="-1" data-original-title="#0000FF"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#9C00FF;" data-event="foreColor" data-value="#9C00FF" title="" data-toggle="button" tabindex="-1" data-original-title="#9C00FF"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#FF00FF;" data-event="foreColor" data-value="#FF00FF" title="" data-toggle="button" tabindex="-1" data-original-title="#FF00FF"></button>' +
                                '</div>' +
                                '<div class="note-color-row">' +
                                    '<button type="button" class="note-color-btn" style="background-color:#F7C6CE;" data-event="foreColor" data-value="#F7C6CE" title="" data-toggle="button" tabindex="-1" data-original-title="#F7C6CE"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#FFE7CE;" data-event="foreColor" data-value="#FFE7CE" title="" data-toggle="button" tabindex="-1" data-original-title="#FFE7CE"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#FFEFC6;" data-event="foreColor" data-value="#FFEFC6" title="" data-toggle="button" tabindex="-1" data-original-title="#FFEFC6"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#D6EFD6;" data-event="foreColor" data-value="#D6EFD6" title="" data-toggle="button" tabindex="-1" data-original-title="#D6EFD6"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#CEDEE7;" data-event="foreColor" data-value="#CEDEE7" title="" data-toggle="button" tabindex="-1" data-original-title="#CEDEE7"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#CEE7F7;" data-event="foreColor" data-value="#CEE7F7" title="" data-toggle="button" tabindex="-1" data-original-title="#CEE7F7"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#D6D6E7;" data-event="foreColor" data-value="#D6D6E7" title="" data-toggle="button" tabindex="-1" data-original-title="#D6D6E7"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#E7D6DE;" data-event="foreColor" data-value="#E7D6DE" title="" data-toggle="button" tabindex="-1" data-original-title="#E7D6DE"></button>' +
                                '</div>' +
                                '<div class="note-color-row">' +
                                    '<button type="button" class="note-color-btn" style="background-color:#E79C9C;" data-event="foreColor" data-value="#E79C9C" title="" data-toggle="button" tabindex="-1" data-original-title="#E79C9C"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#FFC69C;" data-event="foreColor" data-value="#FFC69C" title="" data-toggle="button" tabindex="-1" data-original-title="#FFC69C"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#FFE79C;" data-event="foreColor" data-value="#FFE79C" title="" data-toggle="button" tabindex="-1" data-original-title="#FFE79C"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#B5D6A5;" data-event="foreColor" data-value="#B5D6A5" title="" data-toggle="button" tabindex="-1" data-original-title="#B5D6A5"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#A5C6CE;" data-event="foreColor" data-value="#A5C6CE" title="" data-toggle="button" tabindex="-1" data-original-title="#A5C6CE"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#9CC6EF;" data-event="foreColor" data-value="#9CC6EF" title="" data-toggle="button" tabindex="-1" data-original-title="#9CC6EF"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#B5A5D6;" data-event="foreColor" data-value="#B5A5D6" title="" data-toggle="button" tabindex="-1" data-original-title="#B5A5D6"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#D6A5BD;" data-event="foreColor" data-value="#D6A5BD" title="" data-toggle="button" tabindex="-1" data-original-title="#D6A5BD"></button>' +
                                '</div>' +
                                '<div class="note-color-row">' +
                                    '<button type="button" class="note-color-btn" style="background-color:#E76363;" data-event="foreColor" data-value="#E76363" title="" data-toggle="button" tabindex="-1" data-original-title="#E76363"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#F7AD6B;" data-event="foreColor" data-value="#F7AD6B" title="" data-toggle="button" tabindex="-1" data-original-title="#F7AD6B"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#FFD663;" data-event="foreColor" data-value="#FFD663" title="" data-toggle="button" tabindex="-1" data-original-title="#FFD663"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#94BD7B;" data-event="foreColor" data-value="#94BD7B" title="" data-toggle="button" tabindex="-1" data-original-title="#94BD7B"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#73A5AD;" data-event="foreColor" data-value="#73A5AD" title="" data-toggle="button" tabindex="-1" data-original-title="#73A5AD"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#6BADDE;" data-event="foreColor" data-value="#6BADDE" title="" data-toggle="button" tabindex="-1" data-original-title="#6BADDE"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#8C7BC6;" data-event="foreColor" data-value="#8C7BC6" title="" data-toggle="button" tabindex="-1" data-original-title="#8C7BC6"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#C67BA5;" data-event="foreColor" data-value="#C67BA5" title="" data-toggle="button" tabindex="-1" data-original-title="#C67BA5"></button>' +
                                '</div>' +
                                '<div class="note-color-row">' +
                                    '<button type="button" class="note-color-btn" style="background-color:#CE0000;" data-event="foreColor" data-value="#CE0000" title="" data-toggle="button" tabindex="-1" data-original-title="#CE0000"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#E79439;" data-event="foreColor" data-value="#E79439" title="" data-toggle="button" tabindex="-1" data-original-title="#E79439"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#EFC631;" data-event="foreColor" data-value="#EFC631" title="" data-toggle="button" tabindex="-1" data-original-title="#EFC631"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#6BA54A;" data-event="foreColor" data-value="#6BA54A" title="" data-toggle="button" tabindex="-1" data-original-title="#6BA54A"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#4A7B8C;" data-event="foreColor" data-value="#4A7B8C" title="" data-toggle="button" tabindex="-1" data-original-title="#4A7B8C"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#3984C6;" data-event="foreColor" data-value="#3984C6" title="" data-toggle="button" tabindex="-1" data-original-title="#3984C6"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#634AA5;" data-event="foreColor" data-value="#634AA5" title="" data-toggle="button" tabindex="-1" data-original-title="#634AA5"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#A54A7B;" data-event="foreColor" data-value="#A54A7B" title="" data-toggle="button" tabindex="-1" data-original-title="#A54A7B"></button>' +
                                '</div>' +
                                '<div class="note-color-row">' +
                                    '<button type="button" class="note-color-btn" style="background-color:#9C0000;" data-event="foreColor" data-value="#9C0000" title="" data-toggle="button" tabindex="-1" data-original-title="#9C0000"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#B56308;" data-event="foreColor" data-value="#B56308" title="" data-toggle="button" tabindex="-1" data-original-title="#B56308"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#BD9400;" data-event="foreColor" data-value="#BD9400" title="" data-toggle="button" tabindex="-1" data-original-title="#BD9400"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#397B21;" data-event="foreColor" data-value="#397B21" title="" data-toggle="button" tabindex="-1" data-original-title="#397B21"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#104A5A;" data-event="foreColor" data-value="#104A5A" title="" data-toggle="button" tabindex="-1" data-original-title="#104A5A"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#085294;" data-event="foreColor" data-value="#085294" title="" data-toggle="button" tabindex="-1" data-original-title="#085294"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#311873;" data-event="foreColor" data-value="#311873" title="" data-toggle="button" tabindex="-1" data-original-title="#311873"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#731842;" data-event="foreColor" data-value="#731842" title="" data-toggle="button" tabindex="-1" data-original-title="#731842"></button>' +
                                '</div>' +
                                '<div class="note-color-row">' +
                                    '<button type="button" class="note-color-btn" style="background-color:#630000;" data-event="foreColor" data-value="#630000" title="" data-toggle="button" tabindex="-1" data-original-title="#630000"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#7B3900;" data-event="foreColor" data-value="#7B3900" title="" data-toggle="button" tabindex="-1" data-original-title="#7B3900"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#846300;" data-event="foreColor" data-value="#846300" title="" data-toggle="button" tabindex="-1" data-original-title="#846300"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#295218;" data-event="foreColor" data-value="#295218" title="" data-toggle="button" tabindex="-1" data-original-title="#295218"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#083139;" data-event="foreColor" data-value="#083139" title="" data-toggle="button" tabindex="-1" data-original-title="#083139"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#003163;" data-event="foreColor" data-value="#003163" title="" data-toggle="button" tabindex="-1" data-original-title="#003163"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#21104A;" data-event="foreColor" data-value="#21104A" title="" data-toggle="button" tabindex="-1" data-original-title="#21104A"></button>' +
                                    '<button type="button" class="note-color-btn" style="background-color:#4A1031;" data-event="foreColor" data-value="#4A1031" title="" data-toggle="button" tabindex="-1" data-original-title="#4A1031"></button>' +
                                '</div>' +
                                '</div>';
            return innerHtml;
        },

        //添加事件
        _addAimListEvent: function() {
            //点击目标选择列表中目标操作（checkbox）
            $('[name=reviewAim]:checkbox').click(function() {
                //当前是目标分布展示
                if($("#AimDistribute").hasClass("item-active"))
                {
                    var tempAimList = {};//当前选中的目标
                    var hasValue = false;
                    $("input[name='reviewAim']:checked").each(function(){
                        var aimId = $(this).attr("aimId");
                        tempAimList[aimId] = aimList[aimId];
                        hasValue = true;
                    });
                    //清除聚类图层
                    markGroup.hideAimDistribute(map);
                    if(hasValue == true)
                        markGroup.showAimDistribute(tempAimList, map);//显示当前选中的目标聚类展示
                }
                //当前是目标轨迹展示
                if($("#AimTrack").hasClass("item-active"))
                {
                    var aimName = $(this).attr("aimName"); //目标展现名称
                    var aimId = $(this).attr("aimId"); //目标ID（号码）
                    var trackColor = $(this).attr("trackColor"); //轨迹颜色

                    //当选中选项时
                    if (this.checked == true)
                    {
                        thisObject._showTargerTrace(aimId, trackColor); //地图上添加轨迹
                    }
                    else //若取消对目标的选中
                    {
                        //如果当前播放的轨迹是取消选择的轨迹，停止播放
                        if(thisObject.current != null && thisObject.current.name == aimId)
                        {
                            thisObject._endingPlay(aimId,false);
                        }
                        thisObject._hideTargerTrace(aimId);
                    }
                    if($("input[name='reviewAim']:checked").length > 1)
                    {
                        thisObject._hideTrackPlayerPanel();
                        //所有按钮恢复”播放“
                        $(".aimPlayerBtn").each(function(){
                            var tempCheck = $(this).parent().parent()[0].children[0];
                            var tempAim = $(tempCheck).attr("aimId");
                            this.innerHTML = '<span class="glyphicon glyphicon-play-circle" style="color: #0090ff"></span>'+i18n.t('gismodule.manageAimTrackModule.btn.playBtn');
                            $(this).attr("state",i18n.t('gismodule.manageAimTrackModule.btn.playBtn'));
                            if(thisObject.current != null && thisObject.current.name == tempAim)
                            {
                                thisObject._endingPlay(tempAim,false);
                                thisObject._reloadTargetTrace(tempAim);
                            }
                        });
                    }
                }
                //当前热点图展示
                if($("#AimHeatmap").hasClass("item-active"))
                {
                    var aimId = $(this).attr("aimId"); //目标ID（号码）
                    var tempAim = {};
                    tempAim[aimId] = aimList[aimId];
                    //当选中选项时
                    if (this.checked == true)
                    {
                        thisObject._addPointToHeatmap(tempAim); //添加热点
                    }
                    else //若取消对目标的选中
                    {
                        thisObject._removePointFromHeatmap(tempAim);//移除热点
                    }
                }

            });

            //点击目标选择列表中目标操作（checkbox后的文字）
            $(".aimDisplay").click(function() {
                //当前是目标分布展示
                if($("#AimDistribute").hasClass("item-active"))
                {
                    var check = $(this).parent()[0].children[0]; //获取当前点击的目标前的复选框的选中状态
                    //若当前为选中状态
                    if(check.checked == true)
                    {
                        check.checked = false; //将复选框改为非选中状态
                    }
                    else
                    {
                        check.checked = true; //将复选框改为选中状态
                    }
                    //展示选中的目标
                    var tempAimList = {};//当前选中的目标
                    var hasValue = false;
                    $("input[name='reviewAim']:checked").each(function(){
                        var aimId = $(this).attr("aimId");
                        tempAimList[aimId] = aimList[aimId];
                        hasValue = true;
                    });
                    //清除聚类图层
                    markGroup.hideAimDistribute(map);
                    if(hasValue == true)
                        markGroup.showAimDistribute(tempAimList, map);//显示当前选中的目标聚类展示
                }
                //当前是目标轨迹展示
                if($("#AimTrack").hasClass("item-active"))
                {
                    var check = $(this).parent()[0].children[0]; //获取当前点击的目标前的复选框的选中状态
                    var aimName = $(check).attr("aimName"); //目标展现名称
                    var aimId = $(check).attr("aimId"); //目标ID（号码）
                    var trackColor = $(check).attr("trackColor"); //轨迹颜色

                    //若当前为选中状态
                    if(check.checked == true)
                    {
                        check.checked = false; //将复选框改为非选中状态
                    }
                    else
                    {
                        check.checked = true; //将复选框改为选中状态
                    }

                    //当选中选项时
                    if (check.checked == true) {
                        thisObject._showTargerTrace(aimId, trackColor); //地图上添加轨迹
                    } else //若取消对目标的选中
                    {
                        //如果当前播放的轨迹是取消选择的轨迹，停止播放
                        if(thisObject.current != null && thisObject.current.name == aimId)
                        {
                            thisObject._endingPlay(aimId,false);
                        }
                        thisObject._hideTargerTrace(aimId);
                    }

                    if($("input[name='reviewAim']:checked").length > 1)
                    {
                        thisObject._hideTrackPlayerPanel();
                        //所有按钮恢复”播放“
                        $(".aimPlayerBtn").each(function(){
                            var tempCheck = $(this).parent().parent()[0].children[0];
                            var tempAim = $(tempCheck).attr("aimId");
                            this.innerHTML = '<span class="glyphicon glyphicon-play-circle" style="color: #0090ff"></span>'+i18n.t('gismodule.manageAimTrackModule.btn.playBtn');
                            $(this).attr("state",i18n.t('gismodule.manageAimTrackModule.btn.playBtn'));
                            if(thisObject.current != null && thisObject.current.name == tempAim)
                            {
                                thisObject._endingPlay(tempAim,false);
                                thisObject._reloadTargetTrace(tempAim);
                            }
                        });
                    }
                }
                //当前热点图展示
                if($("#AimHeatmap").hasClass("item-active"))
                {
                    var check = $(this).parent()[0].children[0]; //获取当前点击的目标前的复选框的选中状态
                    var aimId = $(check).attr("aimId"); //目标ID（号码）
                    var tempAim = {};
                    tempAim[aimId] = aimList[aimId];
                    //当选中选项时
                    if (check.checked == true)
                    {
                        check.checked = false; //将复选框改为非选中状态
                        thisObject._removePointFromHeatmap(tempAim);//移除热点
                    }
                    else //若取消对目标的选中
                    {
                        check.checked = true; //将复选框改为选中状态
                        thisObject._addPointToHeatmap(tempAim); //添加热点
                    }
                }
            });

            //点击目标选择列表中的颜色拾取按钮
            $('.color-btn').on('click',function(){
                if($(this).next().find('.note-color-palette')[0].innerHTML != '')
                {
                    $(this).next().find('.note-color-palette')[0].innerHTML = '';
                }

                $(this).next().find('.note-color-palette')[0].innerHTML = thisObject._createColorBox();
                //点击目标选择列表中的颜色拾取按钮
                $(".note-color-btn").click(function(){
                    var afterColor = $(this).attr("data-value");
                    var check = $(this).closest('.checkbox-custom')[0].children[0]; //获取当前点击的目标前的复选框的选中状态
                    $(check).attr("trackColor",afterColor);
                    var aim = $(check).attr("aimId");
                    $(".color-btn").each(function(){
                        if($(this).attr("aimId") == aim)
                        {
                            $(this).css("color",afterColor);
                        }
                    });
                    thisObject._setTargetTraceColor(aim, afterColor);

                    //移除调色板
                    $(this).closest('.note-color-palette')[0].innerHTML = '';
                });
            });

            //点击目标选择列表中的播放按钮
            $(".aimPlayerBtn").click(function(){
                var check = $(this).closest('.checkbox-custom')[0].children[0]; //获取当前点击的目标前的复选框的选中状态
                var color = $(check).attr("trackColor");
                var aim = $(check).attr("aimId");

                if($(this).attr("state") == i18n.t('gismodule.manageAimTrackModule.btn.playBtn'))
                {
                    //所有按钮恢复”播放“
                    $(".aimPlayerBtn").each(function(){
                        var tempCheck = $(this).parent().parent()[0].children[0];
                        var tempAim = $(tempCheck).attr("aimId");
                        this.innerHTML = '<span class="glyphicon glyphicon-play-circle" style="color: #0090ff"></span>'+i18n.t('gismodule.manageAimTrackModule.btn.playBtn');
                        $(this).attr("state",i18n.t('gismodule.manageAimTrackModule.btn.playBtn'));
                        //如果当前播放的轨迹是取消选择的轨迹，停止播放
                        if(thisObject.current != null && thisObject.current.name == tempAim)
                        {
                            thisObject._endingPlay(tempAim,false);
                        }
                        thisObject._hideTargerTrace(tempAim);
                    });

                    this.innerHTML = '<span class="glyphicon glyphicon-play-circle" style="color: #0090ff"></span>'+i18n.t('gismodule.manageAimTrackModule.btn.cancleBtn');
                    $(this).attr("state",i18n.t('gismodule.manageAimTrackModule.btn.cancleBtn'));
                    thisObject._showTargerTrace(aim, color); //地图上添加轨迹

                    $("input[name='reviewAim']").each(function(){
                        var aimId = $(this).attr("aimId");
                        if(aimId == aim)
                        {
                            this.checked = true;//将复选框改为选中状态
                            thisObject._showTracePlayerPanel(aimId);
                        }
                        else
                        {
                            this.checked = false; //将复选框改为非选中状态
                        }
                    });
                }
                else if($(this).attr("state") == "取消")
                {
                    thisObject._hideTrackPlayerPanel();
                    this.innerHTML = '<span class="glyphicon glyphicon-play-circle" style="color: #0090ff"></span>'+i18n.t('gismodule.manageAimTrackModule.btn.playBtn');
                    $(this).attr("state",i18n.t('gismodule.manageAimTrackModule.btn.playBtn'));
                    if(thisObject.current != null && thisObject.current.name == aim)
                    {
                        thisObject._endingPlay(aim,false);
                        thisObject._reloadTargetTrace(aim);
                    }

                }

            });
        },

        //点聚类popup内容控制
        _myClusterPopupContentCreateFunction:function(markers,index){
            var aimPoints = {};
            var markersLen = markers.length;
            var count = 1;
            for(var j = 0; j< markersLen;j++)
            {
                var el = $('<div></div>');
                el.html(markers[j]._popup._content);
                var aim = el.children().attr("aimId");
                if(aimPoints[aim] == undefined)
                {
                    aimPoints[aim] = [];
                }
                aimPoints[aim].push(markers[j]);
            }

            var innerHtml =     '<div>'+
                                    '<select id="aimSelect" class="form-control" style="box-sizing: border-box">';
            var len = aimPoints.length;
            for(var target in aimPoints)
            {
                if(count == index)
                    innerHtml += '<option value="targetAim'+count+'" selected="true">'+i18n.t('gismodule.manageAimTrackModule.popup.target')+count+'('+target+')'+'</option>';
                else
                    innerHtml += '<option value="targetAim'+count+'">'+i18n.t('gismodule.manageAimTrackModule.popup.target')+count+'('+target+')'+'</option>';
                count++;
            }
            innerHtml += '</select></div><div style="margin-top: 5px">';
            count = 1;
            for(var target in aimPoints)
            {
                if(count == index)
                {
                    innerHtml += '<div id="targetAim'+count+'" class="popupTargetAim" style="display:block;overflow-y: visible;overflow-x:hidden;max-height:356px">';
                    innerHtml += thisObject._createInnerTable(aimPoints[target]);
                    innerHtml += '</div>';
                }
                else
                {
                    innerHtml += '<div id="targetAim'+count+'" class="popupTargetAim" style="display:none;overflow-y: visible;overflow-x:hidden;max-height:356px">';
                    innerHtml += thisObject._createInnerTable(aimPoints[target]);
                    innerHtml += '</div>';
                }
                count++;
            }
            innerHtml += '</div>';
            return innerHtml;
        },

        //生成表格
        _createInnerTable:function(markers){
            var innerHtml = '<table class="table table-striped table-bordered table-hover dataTable no-footer" cellspacing="0" style="table-layout: fixed;margin-left: 0px" role="grid"><thead>';
            {
                innerHtml += '<tr role="row">';
                var el = $('<div></div>');
                el.html(markers[0]._popup._content);
                $('th',el).each(function(i,n){
                    innerHtml += '<th class="sorting_disabled" rowspan="1" colspan="1" style="width: 100px">' + n.innerText + '</th>';
                });
                innerHtml += '</tr>';
            }
            innerHtml += '</thead><tbody>';
            var len = markers.length;
            for(var i=0;i<len;i++)
            {
                innerHtml += '<tr role="row">';
                var el = $('<div></div>');
                el.html(markers[i]._popup._content);
                $('td',el).each(function(i,n){
                    innerHtml += '<td style="width: 100px">' + n.innerText + '</td>';
                });
                innerHtml += '</tr>';
            }
            innerHtml += '</tbody></table>';
            return innerHtml;
        },

        //点聚类图标样式控制
        _myiconCreateFunction: function(cluster) {
            var childCount = cluster.getChildCount();
            var c = ' my-marker-cluster-';
            if (childCount < 100) {
                c += 'small';
                return new L.DivIcon({
                    html: '<div><span>' + childCount + '</span></div>',
                    className: 'my-marker-cluster-s' + c,
                    iconSize: new L.Point(20, 20)
                });
            } else if (childCount < 1000) {
                c += 'medium';
                return new L.DivIcon({
                    html: '<div><span>' + childCount + '</span></div>',
                    className: 'my-marker-cluster-m' + c,
                    iconSize: new L.Point(30, 30)
                });
            } else {
                c += 'large';
                return new L.DivIcon({
                    html: '<div><span>' + childCount + '</span></div>',
                    className: 'my-marker-cluster-l' + c,
                    iconSize: new L.Point(40, 40)
                });
            }
        },

        //展示聚类图层
        _showHeatmap:function(){
            //热点图属性配置
            var cfg = {
                "radius": 0.005,
                "maxOpacity": .8,
                "scaleRadius": true,
                "useLocalExtrema": false,
                latField: 'lat',
                lngField: 'lng',
                valueField: 'count'
            };
            heatmapLayer = new HeatmapOverlay(cfg);
            heatmapLayer.addTo(map);
        },

        //隐藏聚类图层
        _hideHeatmap:function(){
            if(map.hasLayer(heatmapLayer))
                map.removeLayer(heatmapLayer);
        },

        //增加点到热点图
        _addPointToHeatmap:function(aimListArgs){
            for (aim in aimListArgs) {
                var lat_index = -1; //纬度索引位置
                var lon_index = -1; //经度索引位置
                var lat_name = aimList[aim].latitude; //纬度信息名称
                var lon_name = aimList[aim].longitude; //经度信息名称

                //找出纬度、经度、时间对应的索引位置
                for (var i = 0; i < aimList[aim].columns.length; i++) {
                    if (aimList[aim].columns[i] == lat_name) {
                        lat_index = i;
                        continue;
                    }
                    if (aimList[aim].columns[i] == lon_name) {
                        lon_index = i;
                        continue;
                    }
                }

                //遍历数据
                var len = aimList[aim].data.length;
                for (var i = 0; i < len; i++) {
                    var lat_value = aimList[aim].data[i][lat_index]; //纬度值
                    var lon_value = aimList[aim].data[i][lon_index]; //经度值

                    if(heatmapPoints[lat_value+','+lon_value] == undefined)
                    {
                        heatmapPoints[lat_value+','+lon_value] = [lat_value,lon_value,1];
                    }
                    else
                    {
                        heatmapPoints[lat_value+','+lon_value][2]++;
                    }
                }
            }

            var points = new L.featureGroup();
            var data = [];
            var max=0;
            for (var i in heatmapPoints) {
                data.push({lat: heatmapPoints[i][0], lng: heatmapPoints[i][1], count: heatmapPoints[i][2]});
                L.marker(new L.latLng(heatmapPoints[i][0], heatmapPoints[i][1])).addTo(points);
                if(max<heatmapPoints[i][2]){
                    max=heatmapPoints[i][2];
                }
            }
            var testData={data:data,max:max};
            heatmapLayer.setData(testData);
            //this._map.fitBounds(points.getBounds());
        },

        //从热点图中移除点
        _removePointFromHeatmap:function(aimListArgs){
            if(heatmapPoints.length == 0)
                return;
            for (aim in aimListArgs) {
                var lat_index = -1; //纬度索引位置
                var lon_index = -1; //经度索引位置
                var lat_name = aimList[aim].latitude; //纬度信息名称
                var lon_name = aimList[aim].longitude; //经度信息名称

                //找出纬度、经度、时间对应的索引位置
                for (var i = 0; i < aimList[aim].columns.length; i++) {
                    if (aimList[aim].columns[i] == lat_name) {
                        lat_index = i;
                        continue;
                    }
                    if (aimList[aim].columns[i] == lon_name) {
                        lon_index = i;
                        continue;
                    }
                }

                //遍历数据
                var len = aimList[aim].data.length;
                for (var i = 0; i < len; i++) {
                    var lat_value = aimList[aim].data[i][lat_index]; //纬度值
                    var lon_value = aimList[aim].data[i][lon_index]; //经度值

                    if(heatmapPoints[lat_value+','+lon_value] == undefined)
                    {
                        continue;
                    }
                    else
                    {
                        if(heatmapPoints[lat_value+','+lon_value][2] == 0)
                        {
                            delete heatmapPoints[lat_value+','+lon_value];
                            continue;
                        }
                        else
                        {
                            heatmapPoints[lat_value+','+lon_value][2]--;
                        }
                    }
                }
            }
            var points = new L.featureGroup();
            var data = [];
            var max=0;
            for (var i in heatmapPoints) {
                data.push({lat: heatmapPoints[i][0], lng: heatmapPoints[i][1], count: heatmapPoints[i][2]});
                L.marker(new L.latLng(heatmapPoints[i][0], heatmapPoints[i][1])).addTo(points);
                if(max<heatmapPoints[i][2]){
                    max=heatmapPoints[i][2];
                }
            }
            var testData={data:data,max:max};
            if(max == 0)
                heatmapLayer.setData({data:[],max:0});
            else
            {
                heatmapLayer.setData(testData);
                //this._map.fitBounds(points.getBounds());
            }
        }

    };

    //构造函数
    setAimTrackInfo_4g = function(options) {
        return new _setAimTrackInfo_4g(options);
    };

    //接收目标数据
    var aimList = {};
    var aimListColor = {};
    var aimDic = {};
    AddTargetData = function(json,color) {
        if(isNaN(json.name)||json.name.trim()=='')
        {
            aimList['default'] = json;
        }
        else
            aimList[json.name] = json;
        if(color != undefined)
            aimListColor[json.name] =color;
        else
            aimListColor[json.name] = '#FF0000';
    };
    ClearTargetData = function() {
        aimList = {};
        aimListColor = {};
        aimDic = {};
    };

    //轨迹聚类数据
    var aimClusterLayer={};
    //查看目标点分布
    L.MarkerClusterGroup.prototype.showAimDistribute = function(aimListArgs, map) {
        if (this.markers_layer != undefined) {

            this.markers_layer.clearLayers();
        }
        else
        {
            this.markers_layer = L.featureGroup();
        }

        for (aim in aimListArgs) {
            var lat_index = -1; //纬度索引位置
            var lon_index = -1; //经度索引位置
            var time_index = -1; //时间索引位置
            var aimName = aimList[aim].name; //目标名称信息
            var lat_name = aimList[aim].latitude; //纬度信息名称
            var lon_name = aimList[aim].longitude; //经度信息名称
            var time_name = aimList[aim].time; //时间信息名称

            //找出纬度、经度、时间对应的索引位置
            for (var i = 0; i < aimList[aim].columns.length; i++) {
                if (aimList[aim].columns[i] == lat_name) {
                    lat_index = i;
                    continue;
                }
                if (aimList[aim].columns[i] == lon_name) {
                    lon_index = i;
                    continue;
                }
                if (aimList[aim].columns[i] == time_name) {
                    time_index = i;
                }
            }

            //遍历数据
            for (var i = 0; i < aimList[aim].data.length; i++) {
                var pointInfo = {};
                var lat_value = -1; //纬度值
                var lon_value = -1; //经度值
                var time_value = ""; //时间值
                var thisData = aimList[aim].data[i];

                for (var j = 0; j < thisData.length; j++) {
                    var pointCol = ""; //列名
                    var pointVal = thisData[j]; //列值
                    switch (j) {
                        case lat_index:
                            pointCol = i18n.t('gismodule.manageAimTrackModule.pointInfo.lat');
                            lat_value = parseFloat(pointVal);
                            break;
                        case lon_index:
                            pointCol = i18n.t('gismodule.manageAimTrackModule.pointInfo.lng');
                            lon_value = parseFloat(pointVal);
                            break;
                        case time_index:
                            pointCol = i18n.t('gismodule.manageAimTrackModule.pointInfo.time');
                            time_value = pointVal;
                            break;
                        default:
                            pointCol = aimList[aim].columns[j];
                    }

                    pointInfo[pointCol] = pointVal;
                }

                //验证经纬度的正确性
                if (isNaN(lat_value) || isNaN(lon_value) || (lon_value < -180) || (lon_value > 180) || (lat_value < -90) || (lat_value > 90)) {
                    console.log("[" + lon_value + "," + lat_value + "]"+i18n.t('gismodule.manageAimTrackModule.log.text2'));
                    continue;
                }

                //定义点
                //                var toolTipStr = '<div class="portlet-extend"><div class="portlet-body-extend-popup"><table><tr><th>地址</th><td>' + address + '</td></tr><tr  style="background-color: white;"><th>类别</th><td>' + kindName + '</td></tr><tr><th >地图坐标</th><td>(经度:' + longitudeVal + ',纬度:' + latitudeVal + ')</td></tr></table></div></div>';
                //设置点的tooltip信息
                var toolTipStr = '<div class="portlet-extend" aimId="'+aim+'"><div class="aim-distribute-toolTip"><table>';
                for (eachInfo in pointInfo) {
                    var th = eachInfo;
                    var td = pointInfo[eachInfo];

                    toolTipStr += '<tr><th>' +
                        th +
                        '</th><td>' +
                        td +
                        '</td></tr>';
                }
                toolTipStr += '</table></div></div>';

                L.circleMarker(new L.latLng(lat_value, lon_value), {
                    stroke: false,
                    fill: true,
                    fillColor: '#e96464',
                    fillOpacity: 1,
                    radius: 8
                }).bindPopup(toolTipStr).addTo(this.markers_layer);
            }
        }

        //添加到地图
        if(!this.hasLayer(this.markers_layer))
            this.addLayer(this.markers_layer);
        if(!map.hasLayer(this))
            this.addTo(map);
        if(this.markers_layer.getBounds().isValid())
            map.fitBounds(this.markers_layer.getBounds());
    };

    //隐藏目标点分布
    L.MarkerClusterGroup.prototype.hideAimDistribute = function(map) {
        if (map.hasLayer(this)) {
            this.clearLayers();//移除所有图层
            map.removeLayer(this);
        }
    };

    //扩展聚类添加点接口 用于单条轨迹聚类
    L.MarkerClusterGroup.prototype.addPointsForOne = function(points) {
        //定义点要素类图层
        this.markers_layer = L.featureGroup();
        //纬度索引位置
        var lat_index = -1;
        //经度索引位置
        var lon_index = -1;
        //在数据列名中搜索经纬度对应的索引号
        for (var i = 0; i < points.columns.length; i++) {
            if (points.columns[i] == points.latitude) {
                lat_index = i;
                continue;
            }
            if (points.columns[i] == points.longitude) {
                lon_index = i;
                continue;
            }
        }
        //获取数据列的长度
        var columnLen = points.columns.length;
        //遍历点集合，将点添加到点要素图层
        for (var i = 0; i < points.data.length; i++) {
            //获取点的经纬度值
            var lat = parseFloat(points.data[i][lat_index]);
            var lon = parseFloat(points.data[i][lon_index]);
            //验证经纬度的正确性
            if (isNaN(lat) || isNaN(lon) || (lon < -180) || (lon > 180) || (lat < -90) || (lat > 90)) {
                console.log("[" + lon + "," + lat + "]"+i18n.t('gismodule.manageAimTrackModule.log.text2'));
                continue;
            }
            //配置点ToolTip信息
            var toolTipStr = '<div class="prtlet-extend" aimId="'+points.name+'"><div class="portlet-title-extend-popup">'+i18n.t('gismodule.manageAimTrackModule.pointInfo.info')+'</div><div class="portlet-body-extend-popup"><table>';
            for (var t = 0; t < columnLen; t++) {
                if (t % 2 === 0) {
                    toolTipStr += ("<tr><th>" + points.columns[t] + "</th><td>" + points.data[i][t]) + "</td></tr>";
                } else {
                    toolTipStr += ("<tr class='odd'><th>" + points.columns[t] + "</th><td>" + points.data[i][t]) + "</td></tr>";
                }
            }
            toolTipStr += "</table></div></div>";
            L.circleMarker(new L.latLng(lat, lon), {
                stroke: false,
                fill: true,
                fillColor: '#e96464',
                fillOpacity: 1,
                radius: 8
            }).bindPopup(toolTipStr).addTo(this.markers_layer);
        }
        this.addLayer(this.markers_layer);
    };

    //扩展聚类添加点接口 用于所有轨迹聚类
    L.MarkerClusterGroup.prototype.addPoints = function(points) {
        if(aimClusterLayer[points.name] == undefined)
        {
            //定义点要素类图层
            this.markers_layer = L.featureGroup();
            //纬度索引位置
            var lat_index = -1;
            //经度索引位置
            var lon_index = -1;
            //在数据列名中搜索经纬度对应的索引号
            for (var i = 0; i < points.columns.length; i++) {
                if (points.columns[i] == points.latitude) {
                    lat_index = i;
                    continue;
                }
                if (points.columns[i] == points.longitude) {
                    lon_index = i;
                    continue;
                }
            }
            //获取数据列的长度
            var columnLen = points.columns.length;
            //遍历点集合，将点添加到点要素图层
            for (var i = 0; i < points.data.length; i++) {
                //获取点的经纬度值
                var lat = parseFloat(points.data[i][lat_index]);
                var lon = parseFloat(points.data[i][lon_index]);
                //验证经纬度的正确性
                if (isNaN(lat) || isNaN(lon) || (lon < -180) || (lon > 180) || (lat < -90) || (lat > 90)) {
                    console.log("[" + lon + "," + lat + "]"+i18n.t('gismodule.manageAimTrackModule.log.text2'));
                    continue;
                }
                //配置点ToolTip信息
                var toolTipStr = '<div class="prtlet-extend" aimId="'+points.name+'"><div class="portlet-title-extend-popup">'+i18n.t('gismodule.manageAimTrackModule.pointInfo.info')+'</div><div class="portlet-body-extend-popup"><table>';
                for (var t = 0; t < columnLen; t++) {
                    if (t % 2 === 0) {
                        toolTipStr += ("<tr><th>" + points.columns[t] + "</th><td>" + points.data[i][t]) + "</td></tr>";
                    } else {
                        toolTipStr += ("<tr class='odd'><th>" + points.columns[t] + "</th><td>" + points.data[i][t]) + "</td></tr>";
                    }
                }
                toolTipStr += "</table></div></div>";
                L.circleMarker(new L.latLng(lat, lon), {
                    stroke: false,
                    fill: true,
                    fillColor: '#e96464',
                    fillOpacity: 1,
                    radius: 8
                }).bindPopup(toolTipStr).addTo(this.markers_layer);
            }
            aimClusterLayer[points.name] = this.markers_layer;
        }

        this.addLayer(aimClusterLayer[points.name]);
    };

    //扩展聚类删除点接口
    L.MarkerClusterGroup.prototype.removePoints = function(points) {
        if(aimClusterLayer[points.name] == undefined)
            return;
        else
            this.removeLayer(aimClusterLayer[points.name]);
    };

    _defineDialog = function(){
        var attrs;
        var source;
        var tpl;

        this.initialize = function()
        {
            tpl = _.template(this._createPanel());
        }

        this._createPanel = function(){
            var innerHtml =
                '<div class="panel">'+
                '<div class="panel-heading">'+
                '<span id="nv-dialog-title" class="panel-title"> <%= title %> </span>'+
                '</div>'+
                '<div id="nv-dialog-body" class="panel-body " style="height:120px; overflow:hidden;padding: 0px">'+
                '<%= content %>'+
                '</div>'+
                '<div class="panel-footer text-center" id="nv-dialog-footer" style="background-color: #FFFFFF;border: 0px">'+
                '<button id="nv-dialog-leftbtn" class="btn btn-default btn-sm" type="button" style="margin-right:15px;min-width:60px">'+
                '<%= leftBtn %>'+
                '</button>'+
                '<button id="nv-dialog-rightbtn" class="btn btn-primary btn-sm" type="button" style="min-width:60px">'+
                '<%= rightBtn %>'+
                '</button>'+
                '</div>'+
                '</div>';
            return innerHtml;
        }


        this.build = function(opts) {
            attrs = {
                title: opts.title || "",
                content: opts.content || "",
                leftBtn: opts.leftBtn || i18n.t('gismodule.manageAimTrackModule.panel.cancle'),
                rightBtn: opts.rightBtn || i18n.t('gismodule.manageAimTrackModule.panel.OK'),
                hideLeftBtn: opts.hideLeftBtn,
                hideRightBtn: opts.hideRightBtn,
                hideFooter: opts.hideFooter,
                minHeight: opts.minHeight,
                leftBtnCallback: opts.leftBtnCallback || function() {
                    document.getElementById("trackPlayer").innerHTML = "";
                },
                rightBtnCallback: opts.rightBtnCallback || function() {
                    document.getElementById("trackPlayer").innerHTML = "";
                },
                extraBtn: opts.extraBtn || [],
                extraListener: opts.extraListener || [],
                style: opts.style || 'basic',  // ENUM(basic: 450px, sm: 300px, lg: 700px, xl: 1000px, full: 90%)
                width: opts.width || 0,
                minHeight: opts.minHeight,
                closeOnBgClick: opts.closeOnBgClick || true
            };
            source = tpl(attrs);
            return source;
        }

        this.show = function(callback) {
            callback();
            if (attrs.minHeight) {
                $('#nv-dialog-body').css('min-height', attrs.minHeight);
            }
            if (attrs.hideLeftBtn == true) {
                $('#nv-dialog-leftbtn').hide();
            };
            if (attrs.hideRightBtn == true) {
                $('#nv-dialog-rightbtn').hide();
            };
            if (attrs.hideFooter) {
                $('#nv-dialog-footer').hide();
            }
            $('#nv-dialog-leftbtn').on('click', attrs.leftBtnCallback);
            $('#nv-dialog-rightbtn').on('click', attrs.rightBtnCallback);

        }
    }


}(window, document));