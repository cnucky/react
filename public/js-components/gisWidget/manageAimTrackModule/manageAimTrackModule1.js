/**
 * Created by zhangxinyue on 2016/3/14.
 */

(function(window, document, undefined) {
    /* 设置和轨迹相关的元素
     panelParentID：承载轨迹面板的父节点ID
     * */
    function _setAimTrackInfo(options) {
        this.options = options;
    }

    //添加颜色更改事件，参数为待展示轨迹目标个数
    function _addColorChangeEvent(colorNum) {
        var colorBox = document.getElementsByClassName("color-box");
        //对于每一个颜色选择器定义change事件
        for (var i = 0; i < colorNum; i++) {
            L.DomEvent.on(colorBox[i], "change", function(e) {
                var afterColor = e.currentTarget.value; //记录变更后的颜色
                var aim = e.currentTarget.id; //获取目标ID（号码）

                var checkItem = this.parentElement.nextSibling.children[0]; //定位与该颜色相关的复选框
                $(checkItem).attr("trackColor", afterColor); //设置复选框中trackColor值（以备后用）

                //若当前目标在地图上有轨迹，则更改轨迹颜色
                if (checkItem.checked) {
                    thisObject._setTargetTraceColor(aim, afterColor);
                }
            })
        }
    }

    //添加点击待展现轨迹目标列表check变更事件
    function _addAimListTwoCheckChangeEvent() {
        var currentAimNum = 0; //标记当前一共选择的目标数量
        $('[name=selectedAim]:checkbox').click(function() {
            var aimName = i18n.t('gismodule.manageAimTrack.aimName') + $(this).attr("aimNum"); //目标展现名称（目标1、目标2……）
            var aimId = $(this).attr("aimId"); //目标ID（号码）
            var trackColor = $(this).attr("trackColor"); //轨迹颜色
            var tabsItem = $("#aimTabHeader").children(); //tab页对象（初始化为隐藏状态）
            var tabName = "";

            //当选中选项时
            if (this.checked == true) {
                currentAimNum++; //选中的目标数量加1
                var tabHeader = $(this).attr("tabHeader");
                $("." + tabHeader).show(); //显示tab页头
                tabName = $("." + tabHeader).attr("tabName");

                //添加轨迹列表(若该目标轨迹未被添加过，则对数据进行加载)
                if ($("." + tabName).length == 0) {
                    _createAimPhoneBillList(aimList[aimId], tabName); //加载数据
                    _setPhoneBillSelectedEvent(); //添加话单点击事件
                }

                //若当前为第一个展现的tab页，则将tab页集合下的横线展现出来
                if (currentAimNum == 1) {
                    $(".hr-sepratorTab").show();
                    _tabClickChange($("." + tabHeader), null,aimId); //调用tab切换方法
                } else {
                    _tabClickChange($("." + tabHeader), $(".activeTab"),aimId); //调用tab切换方法
                }

                // $(".phoneBillList").height($(".track-group-body").height() - $("#selectAimList").height() - 215);//设置话单列表高度
                thisObject._showTargerTrace(aimId, trackColor); //地图上添加轨迹
            } else //若取消对目标的选中
            {
                currentAimNum--; //当前已选中目标数量减1
                var tabHeader = $(this).attr("tabHeader");
                $("." + tabHeader).hide(); //隐藏tab页头

                tabName = $("." + tabHeader).attr("tabName");
                _setPhoneBillRange(0, $("." + tabName)[0].children.length, 0, 0, tabName); //设置话单列表中的话单显示
                thisObject._hideTargerTrace(aimId);

                //若被取消选中的目标为活动状态
                if ($("." + tabHeader).hasClass("activeTab")) {
                    var currentActiveTab = null;
                    var preActiveTab = $("." + tabHeader);

                    //若已经无选中的目标
                    if (currentAimNum == 0) {
                        $(".hr-sepratorTab").hide(); //将tab页想的横线隐藏
                        $(".trackPlay").hide(); //隐藏播放器
                    } else //若还有被选中的目标，则找出第一个被选中的目标
                    {
                        var tabs = $("#aimTabHeader")[0].children;
                        for (var i = 0; i < tabs.length; i++) {
                            if ($(tabs[i]).is(':visible')) {
                                currentActiveTab = $(tabs[i]);
                            }
                        }
                    }
            var targetName=null;
                    if(currentActiveTab!=null){
                        targetName=currentActiveTab.attr("aimId");
                    }
                    _tabClickChange(currentActiveTab, preActiveTab,targetName); //调用tab转换方法
                    thisObject._hideTargerTrace(aimId); //删除轨迹
                }
            }
        });
    }

    //
    function _showAllTab() {
        var allCheckbox = $('[name=selectedAim]:checkbox');
        fitMapFlag=false;//20160826
        for (var i = allCheckbox.length - 1; i >= 0; i--) {
            var oneCheckbox = $(allCheckbox[i]);
            if(i==0){//20160826
                fitMapFlag=true;
            }
            oneCheckbox.trigger("click");
        }
    }

    //添加目标Tab页头点击事件
    function _addAimTabClickEvent() {
        $(".tabTitle").click(function() {
            var currentActiveTab = $(this); //点击的tab
            var preActiveTab = $(".activeTab"); //原处于活动状态的tab

            if (currentActiveTab[0] == preActiveTab[0]) return; //若点击的tab本就为活动状态，则直接返回
            _tabClickChange(currentActiveTab, preActiveTab,$(this).attr("aimId")); //点击Tab页头执行方法

            // if(currentActiveTab!=null)
            // {
            //     thisObject._fitTargetTrace($(this).attr("aimId"));
            // }
        });
    }

    //点击Tab页头执行方法
    function _tabClickChange(currentActiveTab, preActiveTab,tagertName) 
    {
        if (preActiveTab != null) //若之前有活动的tab，则直接修改与之前活动相关的内容
        {
            _endingPlay(preActiveTab.attr("aimId"), false); //结束播放
            preActiveTab.removeClass("activeTab").addClass("unActiveTab"); //修改tab页的活动状态
            _setPhoneBillListVisible(false, preActiveTab.attr("tabName")); //修改列表的显示状态
        } 
        else //若之前无活动的tab，则需考虑是否已生成播放器
        {
            if ($(".trackPlay").length == 0) //若无播放器，则生成播放器
            {
                var beginTime = $("." + currentActiveTab.attr("tabName")).attr("beginTime").split(" ");
                var endTime = $("." + currentActiveTab.attr("tabName")).attr("endTime").split(" ");
                var endIndex = $("." + currentActiveTab.attr("tabName")).attr("endIndex");
                $("#dynamicAimTab").after(_createTrackPlayPanel(beginTime, endTime, endIndex)); //添加播放器HTML
                _addTrackPlayerEvent(); //添加播放器关于“播放”、“暂停”、“快进”、“慢进”、“重放”按钮的点击事件
                _addTrackSliderOprationEvent(); //添加播放器中范围选择滑块的操作事件
            } else //若已生成播放器，则显示
            {
                $(".trackPlay").show();
            }
        }

        if (currentActiveTab != null) {
            currentActiveTab.removeClass("unActiveTab").addClass("activeTab"); //修改tab页的活动状态
            _setPhoneBillListVisible(true, currentActiveTab.attr("tabName")); //修改列表的显示状态

            //设置播放器状态
            var phoneBillListObj = $("." + currentActiveTab.attr("tabName"));
            var beginTime = phoneBillListObj.attr("beginTime").split(" ");
            var endTime = phoneBillListObj.attr("endTime").split(" ");
            var leftPercent = phoneBillListObj.attr("leftPercent");
            var rightPercent = phoneBillListObj.attr("rightPercent");
            _setPlayerStatus(false, false, true, beginTime, endTime, leftPercent, rightPercent, phoneBillListObj[0].children.length);

            thisObject._fitTargetTrace(tagertName);
        } 
        else 
        {
            $(".trackPlay").hide();
            $(".hr-sepratorTab").hide();
        }
    }

    //添加话单列表
    function _createAimPhoneBillList(aimJson, tabName) {
        var longitude = -1; //经度
        var latitude = -1; //纬度
        var billTime = ""; //时间
        var otherInfo = {};

        //定位需要展现的列
        for (item in aimJson) {
            if (item == "columns" || item == "data" || item == "name") {
                continue;
            }

            var colName = aimJson[item];
            var colPosi = -1;

            var columns = aimJson["columns"];
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

        var data = aimJson["data"];
        var beginTime = data[0][billTime];
        var endTime = data[data.length - 1][billTime];
        $("#dynamicAimTab").append('<div class="phoneBillList ' + tabName + '" beginTime="' + beginTime + '" endTime="' + endTime + '" startIndex="0" endIndex="' + (data.length - 1) + '" leftPercent="0" rightPercent="0"></div>');
        var billHtml = "";

        //解析数据
        for (num in data) {
            var eachData = data[num];
            var posiInfo = '(' + eachData[longitude] + ',' + eachData[latitude] + ')';
            var contentHtml = "";
            for (info in otherInfo) {
                contentHtml += '<div style="height:22px;">' + eachData[otherInfo[info]] + '</div>';
            }
            contentHtml += '<div style="height:22px;">' + posiInfo + '</div>';

            billHtml +=
                '<div class="one-target-phoneBill" time="' + eachData[billTime] + '" index="' + num + '">' +
                '<div class="one-phoneBill-left">' +
                '<img src="../js/components/gisWidget/manageAimTrackModule/image/user1_telephone.png"/>' +
                '<hr class="one-phoneBill-left-hr"/>' +
                '</div>' +
                '<div class="one-phoneBill-right">' +
                '<div class="talkBubble"></div>' +
                '<div class="one-phoneBill-right-content">' +
                contentHtml +
                '</div>' +
                '</div>' +
                '</div>';

        }
        $("." + tabName)[0].innerHTML = billHtml;
        var talkBubble = 8 + $(".one-phoneBill-right-content").children.length * 22;
        $(".talkBubble").height(talkBubble);
        $(".one-target-phoneBill").height(talkBubble + 10);
        $(".one-phoneBill-left").height(talkBubble + 10);
        $(".one-phoneBill-right").height(talkBubble + 10);
        $(".one-phoneBill-right-content").css("top", -(talkBubble - 5) + "px");
        $(".one-phoneBill-left-hr").height(talkBubble - 12);
        $(".phoneBillList").height($("#map").height()-32-$("#selectAimList").height()-212);
    }
    //隐藏列表/显示列表
    function _setPhoneBillListVisible(isVisible, tabName) {
        if (isVisible) {
            $("." + tabName).show();
        } else {
            $("." + tabName).hide();
        }
    }
    //隐藏话单/显示话单
    function _setPhoneBillRange(startIndex, endIndex, leftPercent, rightPercent, tabName) {
        var phoneBills = $("." + tabName)[0].children;
        //隐藏起始范围之前的话单
        if (startIndex > 0) {
            for (var i = 0; i < startIndex; i++) {
                $(phoneBills[i]).css("display", "none");
            }
        }
        //隐藏结束范围之后的话单
        if (endIndex < phoneBills.length) {
            for (var i = endIndex + 1; i < phoneBills.length; i++) {
                $(phoneBills[i]).css("display", "none");
            }
        }
        for (var i = startIndex; i <= endIndex; i++) {
            $(phoneBills[i]).css("display", "block");
        }

        $("." + tabName).attr("startIndex", startIndex);
        $("." + tabName).attr("endIndex", endIndex);
        $("." + tabName).attr("leftPercent", leftPercent);
        $("." + tabName).attr("rightPercent", rightPercent);
    }
    //定位话单
    function _setPhoneBillSelectedStyle(index, objectArgs) {
        $(".talkBubble-select").removeClass("talkBubble-select")
            .addClass("talkBubble");

        var talkBubble;
        if (index != -1) {
            if ($(".activeTab").length == 0) return;
            var tabName = $(".activeTab").attr("tabName");
            $("." + tabName)[0].scrollTop = index * 62;
            index = index + parseInt($("#rang-slider-begin").attr("startIndex"));
            talkBubble = $("." + tabName)[0].children[index].children[1].children[0];
        }
        if (objectArgs != null) {
            talkBubble = objectArgs[0].children[1].children[0];
            var aimID = $(".activeTab").attr("aimId");
            var clickIndex = parseInt(objectArgs.attr("index")) - parseInt($("." + $(".activeTab").attr("tabName")).attr("startIndex"));
            thisObject._infoPopup(clickIndex, aimID);
        }

        $(talkBubble).removeClass("talkBubble")
            .addClass("talkBubble-select");
    }

    //生成轨迹播放器
    function _createTrackPlayPanel(beginTime, endTime, endIndex) {
        var innerHtml =
            '<div class="trackPlay">' +
            '<table style="width: 100%;"> ' +
            '<tr><td id="track-player-status" class="track-player-status-style" colspan="6">'+i18n.t('gismodule.manageAimTrack.playPanel.stateFilter')+'</td></tr>' +
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
            '<td id="rang-beginTime-tip" class="rang-time-tip">' + beginTime[0] + '<br/>' + beginTime[1] + '</td>' +
            '<td id="rang-selectedBeginTime-tip" class="rang-selectedTime-tip"></td>' +
            '<td id="rang-selectedEndTime-tip" class="rang-selectedTime-tip"></td>' +
            '<td id="rang-endTime-tip" class="rang-time-tip" style="text-align: right;">' + endTime[0] + '<br/>' + endTime[1] + '</td>' +
            '</tr>' +
            '</table>' +
            '</td>' +
            '</tr>' +
            '<tr style="height: 30px;">' +
            '<td style="width: 20%;"></td>' +
            '<td style="width: 15%;text-align: center;"><img id="trackPlayerSlow" title="'+i18n.t('gismodule.manageAimTrack.playPanel.speeddown')+'" src="../js/components/gisWidget/manageAimTrackModule/image/media_rewind_24_p.png" height="20px" width="20px"/></td>' +
            '<td style="width: 15%;text-align: center;">' +
            '<img id="trackPlayerPlay" title="'+i18n.t('gismodule.manageAimTrack.playPanel.play')+'" src="../js/components/gisWidget/manageAimTrackModule/image/media_play_24_p.png" height="20px" width="20px"/>' +
            '<img id="trackPlayerPause" title="'+i18n.t('gismodule.manageAimTrack.playPanel.pause')+'" src="../js/components/gisWidget/manageAimTrackModule/image/media_pause_24_p.png" height="20px" width="20px" style="display: none;"/>' +
            '</td>' +
            '<td style="width: 15%;text-align: center;"><img id="trackPlayerFast" title="'+i18n.t('gismodule.manageAimTrack.playPanel.speedup')+'" src="../js/components/gisWidget/manageAimTrackModule/image/media_fast_forward_24_p.png" height="20px" width="20px"/></td>' +
            '<td style="width: 15%;text-align: center;"><img id="trackPlayerReplay" title="'+i18n.t('gismodule.manageAimTrack.playPanel.replay')+'" src="../js/components/gisWidget/manageAimTrackModule/image/media_stop_24_p.png" height="20px" width="20px"/></td>' +
            '<td style="width: 20%;"></td>' +
            '</tr>' +
            '<tr><td id="track-player-progressTip" class="track-player-progressTip-style" colspan="6" progress="1">'+i18n.t('gismodule.manageAimTrack.playPanel.currentSpeed')+'1x</td></tr>' +
            '</table>' +
            '</div>';
        return innerHtml;
    }

    //添加播放器事件
    function _addTrackPlayerEvent() {
        //播放
        $("#trackPlayerPlay").click(function() {
            //更改图标状态
            $(this).hide();
            $("#trackPlayerPause").show();

            //设置轨迹状态显示
            $("#track-player-status")[0].innerHTML = i18n.t('gismodule.manageAimTrack.playPanel.statePlay');

            //设置播放速度提示（不为0时保持原速度）
            var progressTip = $("#track-player-progressTip");
            if (progressTip.attr("progress") == "0") {
                progressTip.attr("progress", "1");
                progressTip[0].innerHTML = i18n.t('gismodule.manageAimTrack.playPanel.currentSpeed')+"1x";
            }

            var aimID = $(".activeTab").attr("aimId");
            //设置当前播放的轨迹颜色不可更改
            var colors = $('.color-box');
            for (var i = 0; i < colors.length; i++) {
                if ($(colors[i]).attr("Id") == aimID) {
                    $(colors[i]).attr("disabled", "true");
                    $(colors[i]).css("cursor", "default");
                    $(colors[i]).attr("title", i18n.t('gismodule.manageAimTrack.info1'));
                    break;
                }
            }

            //调用轨迹播放接口
            totalTime = thisObject.playTargetTrace(aimID);
            //播放器执行播放
            _playerProcessBarExcutePlay();
        });

        //暂停
        $("#trackPlayerPause").click(function() {
            //更改图标状态
            $(this).hide();
            $("#trackPlayerPlay").show();

            //设置轨迹状态显示
            $("#track-player-status")[0].innerHTML = i18n.t('gismodule.manageAimTrack.playPanel.statePause');

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
            if(thisObject.current==undefined){
                return;
            }
            var progress = parseInt(progressTip.attr("progress"));
            progress--;
            progressTip.attr("progress", progress.toString());
            progressTip[0].innerHTML = i18n.t('gismodule.manageAimTrack.playPanel.currentSpeed') + progress + "x";

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
            if(thisObject.current==undefined){
                return;
            }

            var progress = parseInt(progressTip.attr("progress"));
            progress++;
            progressTip.attr("progress", progress.toString());
            progressTip[0].innerHTML = i18n.t('gismodule.manageAimTrack.playPanel.currentSpeed') + progress + "x";

            //调用轨迹播加速停接口
            thisObject.speedUp();
            speed = speed * 2;
        });

        //重放
        $("#trackPlayerReplay").click(function() {
            _setPlayerStatus(true, false, false, null, null, -1, -1, -1); //设置播放器状态
            thisObject.replayTargetTrace(); //调用轨迹重放接口
            _playerProcessBarExcutePlay(); //开始播放
        });
    }

    //播放器状态(标记是否为重放操作,标记是否播放完毕,标记是否为播放器初始化，话单开始时间，话单结束时间，话单选择范围起始索引百分比，话单选择范围末尾索引百分比，话单总量)
    function _setPlayerStatus(isReplay, isEnding, isInit, beginTime, endTime, leftPercent, rightPercent, totalNum) {
        if (isReplay) //若是“重放”
        {
            $("#track-player-status")[0].innerHTML = i18n.t('gismodule.manageAimTrack.playPanel.statePlay'); //修改状态提示
            $("#trackPlayerPlay").hide(); //隐藏“播放”键
            $("#trackPlayerPause").show(); //显示“暂停”键
            $("#track-player-progressTip")[0].innerHTML = i18n.t('gismodule.manageAimTrack.playPanel.currentSpeed')+"1x"; //设置重放速度
            var progress = parseInt($("#track-player-progressTip").attr("progress"));
            speed=speed / Math.pow(2,progress-1);//reset the player speed
            $("#track-player-progressTip").attr("progress", "1");
        } else {
            $("#track-player-status")[0].innerHTML = i18n.t('gismodule.manageAimTrack.playPanel.stateFilter');
            $("#trackPlayerPlay").show();
            $("#trackPlayerPause").hide();
            //$("#track-player-progressTip")[0].innerHTML = "当前播放速度0x";
            //$(".track-player-progressTip").attr("progress", "0");
        }

        if (isEnding) //若是播放结束
        {
            $("#track-player-status")[0].innerHTML = i18n.t('gismodule.manageAimTrack.playPanel.stateFinish'); //修改状态提示
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
            $("#track-player-progressTip")[0].innerHTML = i18n.t('gismodule.manageAimTrack.playPanel.currentSpeed')+"1x"; //设置重放速度
            var progress = parseInt($("#track-player-progressTip").attr("progress"));
            speed=speed / Math.pow(2,progress-1);//reset the player speed
            $("#track-player-progressTip").attr("progress", "1");
        if(!beginTime[1]){
                beginTime[1]='';
            }
            if(!endTime[1]){
                endTime[1]='';
            }
            $("#rang-beginTime-tip")[0].innerHTML = beginTime[0] + '<br/>' + beginTime[1]; //设置话单开始时间
            $("#rang-endTime-tip")[0].innerHTML = endTime[0] + '<br/>' + endTime[1]; //设置话单结束时间
            var phoneBillDataObj = $("." + $(".activeTab").attr("tabName")); //获取当前活动的话单列表对象

            //当没有选择话单范围（默认为最大范围）时，不必显示选中范围起止时间
            var startIndex = parseInt(totalNum * leftPercent);
            var endIndex = totalNum - parseInt(totalNum * rightPercent) - 1;
            if (startIndex != 0 || endIndex < (totalNum - 1)) {
                var selectStartTime = $(phoneBillDataObj[0].children[startIndex]).attr("time").split(" ");
                var selectEndTime = $(phoneBillDataObj[0].children[endIndex]).attr("time").split(" ");
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
    }

    //结束播放（播放完毕、正在播放时目标切换时调用）
    //参数：aimID（目标ID），isFinish（标记是否播放完毕）
    function _endingPlay(aimID, isFinish) {
        if (timeControl != null) {
            clearTimeout(timeControl); //终止播放轨迹播放器
            excuteProcess = 0; //计数设为0
            timeControl = null;
        }

        //设置播放完毕的轨迹颜色可更改
        var colors = $('.color-box');
        for (var i = 0; i < colors.length; i++) {
            if ($(colors[i]).attr("Id") == aimID) {
                $(colors[i]).removeAttr("disabled");
                $(colors[i]).css("cursor", "pointer");
                $(colors[i]).removeAttr("title");
                break;
            }
        }

        if (isFinish) {
            _setPlayerStatus(false, true, false, null, null, -1, -1, -1); //修改播放器状态，标记播放完毕
        } else {
            thisObject.terminate(); //终止播放轨迹
        }

        //若当前有话单列表中的话单处于选中状态，则取消对话单的选中
        var selectBill = $(".talkBubble-select");
        if (selectBill.length > 0) {
            selectBill.removeClass("talkBubble-select")
                .addClass("talkBubble");
        }
    }

    //添加轨迹筛选进度条的操作事件
    function _addTrackSliderOprationEvent() {
        var move_begin = false;
        var move_end = false;
        var begin_x, end_x;

        $("#rang-slider-begin").mousedown(function(e) {
            _endingPlay($(".activeTab").attr("aimId"), false); //结束播放
            move_begin = true; //设置开始移动标识
            begin_x = parseInt($("#rang-slider-begin").css("width")) - (e.pageX - parseInt($("#rang-slider-begin").css("left"))); //计算点击的位置距离“开始”滑块右侧的距离
        });
        $("#rang-slider-end").mousedown(function(e) {
            _endingPlay($(".activeTab").attr("aimId"), false); //结束播放
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
            var dataCount = aimList[$(".activeTab").attr("aimId")].data.length;
            var phoneBills = $("." + $(".activeTab").attr("tabName"))[0].children;
            var startIndex = parseInt(dataCount * leftPercent);
            var endIndex = dataCount - parseInt(dataCount * rightPercent) - 1;
            var beginTime = $(phoneBills[0]).attr("time").split(" ");
            var endTime = $(phoneBills[dataCount - 1]).attr("time").split(" ");

            _setPlayerStatus(false, false, true, beginTime, endTime, leftPercent, rightPercent, dataCount); //设置播放器
            thisObject.filterTargetTrace($(".activeTab").attr("aimId"), startIndex, endIndex); //筛选轨迹范围
            _setPhoneBillRange(startIndex, endIndex, leftPercent, rightPercent, $(".activeTab").attr("tabName")); //过滤话单列表
        });
    }

    //播放器进度条执行播放
    var totalTime = 0; //总时间
    var excuteProcess = 0; //计数器
    var timeControl = null; //计时器
    var perInterval = 0; //时间间隔
    var excuteLength = 0; //经度条执行长度
    var speed = 1; //当前速度
    //计时方法
    function startTimeout() {
        if (excuteProcess < 100) {
            //设置播放进度条的宽度
            document.getElementById("rang-progressBar-excute").style.width = excuteProcess + 1 + "%";
            timeControl = setTimeout(startTimeout, perInterval);

            excuteProcess = excuteProcess + speed;
        } else {
            //更新状态(播放完毕)
            _endingPlay($(".activeTab").attr("aimId"), true);
        }
    }

    function _playerProcessBarExcutePlay() {
        //设置播放进度条的起始位置
        $("#rang-progressBar-excute_parent").css("left", parseFloat($("#rang-slider-begin").css("left")) + 8);
        //计算时间间隔
        perInterval = totalTime / 100;
        //设置进度条执行长度
        excuteLength = parseFloat($("#rang-slider-end").css("left")) - (parseFloat($("#rang-slider-begin").css("left")) + parseFloat($("#rang-slider-begin").css("width"))) + 1;
        $("#rang-progressBar-excute_parent").css("width", excuteLength);
        //开始执行
        startTimeout();
    }

    //设置待播放目标列表中未选中任何一个目标，参数：当需要更换待展现目标列表时，设置为true
    function _noneSelectAim(aimNeedChange) {
        _endingPlay($(".activeTab").attr("aimId"), false);; //停止播放
        $(".activeTab").addClass("unActiveTab ").removeClass("activeTab"); //隐藏tab页头（以及分割线）
        $(".hr-sepratorTab").hide();
        $(".phoneBillList").hide(); //隐藏所有话单列表
        $(".trackPlay").hide(); //隐藏播放器

        if($("#aimDistribute")[0].checked){
            console.log($("#aimDistribute")[0].checked);
            thisObject._markGroup.showAimDistribute(aimList, thisObject._map);
        }else{
             thisObject._markGroup.hideAimDistribute(thisObject._map);
        }

        //若需要更换待播放目标列表
        if (aimNeedChange) {
            //将轨迹隐藏
            var selectAims = $('[name=selectedAim]:checkbox');
            for (var i = 0; i < selectAims.length; i++) {
                if (selectAims[i].checked == true) {
                    thisObject._hideTargerTrace($(selectAims[i]).attr("aimId"));
                }
            }

            $("#selectAimList").empty(); //清空待播放目标列表
            $("#aimTabHeader").empty(); //删除tab页头（以及分割线）
            $(".hr-sepratorTab").remove();
            $("#backToAimListPage").hide(); //隐藏“返回”按钮

            $("#targetTrack").hide(); //隐藏轨迹管理第二个页面（轨迹播放页面）
            $("#targetList").show(); //展现轨迹管理第一个页面（轨迹列表页面）
        }
    }

    //定义点击话单事件
    function _setPhoneBillSelectedEvent() {
        $(".one-target-phoneBill").unbind("click");

        $(".one-target-phoneBill").click(function() {
            if (timeControl != null) return; //轨迹正在播放过程中，禁止点击话单列表中的话单
            _setPhoneBillSelectedStyle(-1, $(this)); //设置话单选中样式
        });
    }

    var thisObject = null; //全局变量，表示setAimTrackInfo对象，用于调用prototype内部方法
    var fitMapFlag = true;//20160826
    _setAimTrackInfo.prototype = {
        //初始化方法，参数为（L.control.toolbar对象，setAimTrackInfo对象）

initialize: function(toolbar, thisObjectArgs) {
            this.targetList = {};
            this.selectedTargerList = {};
            this.targetMovingTimes = {};
            this._container = toolbar._container;
            var map = this._map = toolbar._map;
            this.relativeBtn = this._addBtn(); //\u6dfb\u52a0\u5de5\u5177\u680f\u6309\u94ae
            this._addPanel();
            this.setTargetData(); //\u6dfb\u52a0\u56fe\u5c42\u9762\u677f\u4e0a\u7684\u5143\u7d20
            //this._addAimList(); //\u6dfb\u52a0\u76ee\u6807\u5217\u8868
            thisObject = thisObjectArgs; //\u8d4b\u503c\u5168\u5c40\u53d8\u91cf
            // $(".track-group-body").height($(window).height() - 32); //\u8bbe\u7f6e\u8f68\u8ff9\u9875\u9762\u9ad8\u5ea6
            $(".track-group-body").height($("#map").height() - 32); //\u8bbe\u7f6e\u8f68\u8ff9\u9875\u9762\u9ad8\u5ea6

            //\u5b9a\u4e49\u63d0\u4ea4\u9009\u4e2d\u7684\u76ee\u6807\u4e8b\u4ef6
            /*$("#submitSelectAim").click(function() {
                var colors = ["#FF0000", "#00FFFF", "#90EE90", "#00BFFF", "#FFFF00"]; //\u5b9a\u4e49\u521d\u59cb\u5316\u7684\u4e94\u7c7b\u989c\u8272

                var selectAimList = $("input[name='reviewAim']:checked"); //\u83b7\u53d6\u88ab\u9009\u4e2d\u7684\u76ee\u6807
                if (selectAimList.length == 0) //\u82e5\u65e0\u76ee\u6807\u88ab\u9009\u4e2d\uff0c\u5219\u663e\u793a\u63d0\u793a\u4fe1\u606f
                {
                    $("#aimSelectTipLabel")[0].innerHTML = "\u8bf7\u81f3\u5c11\u9009\u62e9\u4e00\u4e2a\u76ee\u6807";
                    $("#aimSelectTip").show();
                    return;
                }

                //\u5bf9\u9009\u4e2d\u7684\u76ee\u6807\u8fdb\u884c\u904d\u5386\uff0c\u751f\u6210\u5f85\u5c55\u73b0\u8f68\u8ff9\u76ee\u6807\u5217\u8868HTML\u548ctab\u9875\u5934HTML
                var aimListInnerHtml = ""; //\u5f85\u5c55\u73b0\u8f68\u8ff9\u76ee\u6807\u5217\u8868HTML
                var tabInnerHtml = ""; //tab\u9875\u5934HTML
                for (var i = 0; i < selectAimList.length; i++) {
                    var aimId = $(selectAimList[i]).attr("aimId"); //\u76ee\u6807ID\uff08\u53f7\u7801\uff09
                    var aimName = $(selectAimList[i]).attr("aimName"); //\u76ee\u6807\u540d\u79f0\uff1a\u76ee\u68071\u3001\u76ee\u68072\u2026\u2026
                    var aimNum = aimName.substring(2); //\u76ee\u6807\u5bf9\u5e94\u7684\u6807\u53f7\uff08\u6570\u5b57\uff09
                    var tabHeader = "tab_header" + (i + 1);

                    aimListInnerHtml += '<tr>';
                    aimListInnerHtml += '<td style="width: 30px;"><input id="' + aimId + '" class="color-box" type="color" value="' + colors[i] + '"/></td>';
                    aimListInnerHtml += '<td><input name="selectedAim" aimNum="' + aimNum + '" aimId="' + aimId + '" type="checkbox" trackColor="' + colors[i] + '" tabHeader="' + tabHeader + '"/></td>';
                    aimListInnerHtml += '<td>' + aimName + '(' + aimId + ')</td></tr>';

                    tabInnerHtml += '<div class="unActiveTab tabTitle ' + tabHeader + '" aimId="' + aimId + '" style="display: none;" tabName="tab_aim' + aimNum + '">\u76ee\u6807' + aimNum + '</div>'
                }

                $("#selectAimList")[0].innerHTML = aimListInnerHtml; //\u6dfb\u52a0\u5f85\u5c55\u73b0\u8f68\u8ff9\u76ee\u6807\u5217\u8868HTML
                $("#aimTabHeader")[0].innerHTML = tabInnerHtml; //\u6dfb\u52a0tab\u9875\u5934HTML
                $("#aimTabHeader").after('<hr class="hr-sepratorTab" style="display: none;"/>'); //\u6dfb\u52a0tab\u5206\u5272\u7ebf

                $("#targetList").hide(); //\u9690\u85cf\u8f68\u8ff9\u7ba1\u7406\u7b2c\u4e00\u4e2a\u9875\u9762\uff08\u5f85\u9009\u62e9\u76ee\u6807\u5217\u8868\u9875\u9762\uff09
                $("#targetTrack").show(); //\u663e\u793a\u8f68\u8ff9\u7ba1\u7406\u7b2c\u4e8c\u4e2a\u9875\u9762\uff08\u8f68\u8ff9\u64ad\u653e\u9875\u9762\uff09
                $("#backToAimListPage").show(); //\u8f68\u8ff9\u7ba1\u7406\u9875\u5934\u4e0a\u663e\u793a\u201c\u56de\u9000\u201d\u6309\u94ae

                //markGroup.hideAimDistribute(map); //\u82e5\u5730\u56fe\u4e0a\u5c55\u793a\u7740\u76ee\u6807\u70b9\u7684\u5206\u5e03\u60c5\u51b5\uff0c\u5219\u5c06\u5176\u9690\u85cf
                $("#aimDistribute")[0].checked = false; //\u8bbe\u7f6e\u201c\u67e5\u770b\u76ee\u6807\u70b9\u5206\u5e03\u201d\u590d\u9009\u6846\u4e3a\u975e\u9009\u4e2d\u72b6\u6001

                _addColorChangeEvent(selectAimList.length); //\u6dfb\u52a0\u989c\u8272\u6846\u9009\u62e9\u4e8b\u4ef6
                _addAimListTwoCheckChangeEvent(); //\u6dfb\u52a0\u5f85\u64ad\u653e\u76ee\u6807\u5217\u8868\u9009\u62e9\u4e8b\u4ef6
                _addAimTabClickEvent(); //\u6dfb\u52a0tab\u9875\u5934\u70b9\u51fb\u4e8b\u4ef6\uff08\u5728\u7b2c\u4e8c\u4e2a\u9875\u9762\u521d\u59cb\u5316\u65f6\uff0c\u5df2\u6839\u636e\u9009\u4e2d\u7684\u76ee\u6807\u5c06tab\u9875\u5934\u5168\u90e8\u521d\u59cb\u5316\uff0c\u53ea\u662f\u5f53\u524d\u4e3a\u9690\u853d\u72b6\u6001\uff09

                _showAllTab();
                $(".track-group-body").height($("#selectAimList").height() + $("#dynamicAimTab").height() + $(".trackPlay").height() + 50); //\u8bbe\u7f6e\u8f68\u8ff9\u9875\u9762\u9ad8\u5ea6
            });

            //\u5b9a\u4e49\u70b9\u51fb\u8fd4\u56de\u76ee\u6807\u5217\u8868\u6309\u94ae\u4e8b\u4ef6
            $("#backToAimListPage").click(function() {
                _noneSelectAim(true);
            });*/

            //\u201c\u67e5\u770b\u76ee\u6807\u70b9\u5206\u5e03\u201d\u53d8\u66f4
            /*var markGroup=this._markGroup = new L.MarkerClusterGroup({
                spiderfyOnMaxZoom: false,
                showCoverageOnHover: false,
                zoomToBoundsOnClick: false,
                iconCreateFunction: this._myiconCreateFunction
            });
            $("#aimDistribute").change(function() {
                if (this.checked) {
                    markGroup.showAimDistribute(aimList, map);
                } else {
                    markGroup.hideAimDistribute(map);
                }
            });

            $("#aimDistribute")[0].checked = true; //\u8bbe\u7f6e\u201c\u67e5\u770b\u76ee\u6807\u70b9\u5206\u5e03\u201d\u590d\u9009\u6846\u4e3a\u9009\u4e2d\u72b6\u6001
            markGroup.showAimDistribute(aimList, map);*/


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
            //this.cp = {};
            //this.pc = {};
            //this.pointsID = {};
        },

        setTargetData: function(){
            for(var id in this.targetList){
                this._hideTargerTrace(id);
            }
            delete this.targetList;
            delete this.selectedTargerList;
            delete this.targetMovingTimes;
            delete this.current;
            delete this.cp;
            delete this.pc;
            delete this.pointsID;
            this.targetList = {};
            this.selectedTargerList = {};
            this.targetMovingTimes = {};
            this.current=undefined;
            this.cp = {};
            this.pc = {};
            this.pointsID = {};
            //this._addPanel();
            this._addAimList(); //\u6dfb\u52a0\u76ee\u6807\u5217\u8868
            // $(".track-group-body").height($(window).height() - 32); //\u8bbe\u7f6e\u8f68\u8ff9\u9875\u9762\u9ad8\u5ea6
            if(this._markGroup!=undefined&&this._map.hasLayer(this._markGroup)){
                this._map.removeLayer(this._markGroup);
                delete this._markGroup;
            }
            //\u201c\u67e5\u770b\u76ee\u6807\u70b9\u5206\u5e03\u201d\u53d8\u66f4
            var markGroup=this._markGroup = new L.MarkerClusterGroup({
                spiderfyOnMaxZoom: false,
                showCoverageOnHover: false,
                zoomToBoundsOnClick: false,
                iconCreateFunction: this._myiconCreateFunction
            });
            $("#aimDistribute").change(function() {
                if (this.checked) {
                    thisObject._markGroup.showAimDistribute(aimList, thisObject._map);
                } else {
                    thisObject._markGroup.hideAimDistribute(thisObject._map);
                }
            });
        if($("#aimDistribute")[0]!=undefined){
                $("#aimDistribute")[0].checked = true; //\u8bbe\u7f6e\u201c\u67e5\u770b\u76ee\u6807\u70b9\u5206\u5e03\u201d\u590d\u9009\u6846\u4e3a\u9009\u4e2d\u72b6\u6001
                this._markGroup.showAimDistribute(aimList, this._map);
        }
            $(".track-group-body").height($("#map").height() - 32); //\u8bbe\u7f6e\u8f68\u8ff9\u9875\u9762\u9ad8\u5ea6

            //\u5b9a\u4e49\u63d0\u4ea4\u9009\u4e2d\u7684\u76ee\u6807\u4e8b\u4ef6
            $("#submitSelectAim").click(function() {
                var colors = ["#FF0000", "#0000FF", "#FF00FF", "#000000", "#8800FF"]; //\u5b9a\u4e49\u521d\u59cb\u5316\u7684\u4e94\u7c7b\u989c\u8272

                var selectAimList = $("input[name='reviewAim']:checked"); //\u83b7\u53d6\u88ab\u9009\u4e2d\u7684\u76ee\u6807
                if (selectAimList.length == 0) //\u82e5\u65e0\u76ee\u6807\u88ab\u9009\u4e2d\uff0c\u5219\u663e\u793a\u63d0\u793a\u4fe1\u606f
                {
                    $("#aimSelectTipLabel")[0].innerHTML = "\u8bf7\u81f3\u5c11\u9009\u62e9\u4e00\u4e2a\u76ee\u6807";
                    $("#aimSelectTip").show();
                    return;
                }

                //\u5bf9\u9009\u4e2d\u7684\u76ee\u6807\u8fdb\u884c\u904d\u5386\uff0c\u751f\u6210\u5f85\u5c55\u73b0\u8f68\u8ff9\u76ee\u6807\u5217\u8868HTML\u548ctab\u9875\u5934HTML
                var aimListInnerHtml = ""; //\u5f85\u5c55\u73b0\u8f68\u8ff9\u76ee\u6807\u5217\u8868HTML
                var tabInnerHtml = ""; //tab\u9875\u5934HTML
                for (var i = 0; i < selectAimList.length; i++) {
                    var aimId = $(selectAimList[i]).attr("aimId"); //\u76ee\u6807ID\uff08\u53f7\u7801\uff09
                    var aimName = $(selectAimList[i]).attr("aimName"); //\u76ee\u6807\u540d\u79f0\uff1a\u76ee\u68071\u3001\u76ee\u68072\u2026\u2026
                    var aimNum = aimName.substring(2); //\u76ee\u6807\u5bf9\u5e94\u7684\u6807\u53f7\uff08\u6570\u5b57\uff09
                    var tabHeader = "tab_header" + (i + 1);

                    aimListInnerHtml += '<tr>';
                    aimListInnerHtml += '<td style="width: 30px;"><input id="' + aimId + '" class="color-box" type="color" value="' + colors[i] + '"/></td>';
                    aimListInnerHtml += '<td><input name="selectedAim" aimNum="' + aimNum + '" aimId="' + aimId + '" type="checkbox" trackColor="' + colors[i] + '" tabHeader="' + tabHeader + '"/></td>';
                    aimListInnerHtml += '<td>' + aimName + '(' + aimId + ')</td></tr>';

                    tabInnerHtml += '<div class="unActiveTab tabTitle ' + tabHeader + '" aimId="' + aimId + '" style="display: none;" tabName="tab_aim' + aimNum + '">\u76ee\u6807' + aimNum + '</div>'
                }

                $("#selectAimList")[0].innerHTML = aimListInnerHtml; //\u6dfb\u52a0\u5f85\u5c55\u73b0\u8f68\u8ff9\u76ee\u6807\u5217\u8868HTML
                $("#aimTabHeader")[0].innerHTML = tabInnerHtml; //\u6dfb\u52a0tab\u9875\u5934HTML
                $("#aimTabHeader").after('<hr class="hr-sepratorTab" style="display: none;"/>'); //\u6dfb\u52a0tab\u5206\u5272\u7ebf

                $("#targetList").hide(); //\u9690\u85cf\u8f68\u8ff9\u7ba1\u7406\u7b2c\u4e00\u4e2a\u9875\u9762\uff08\u5f85\u9009\u62e9\u76ee\u6807\u5217\u8868\u9875\u9762\uff09
                $("#targetTrack").show(); //\u663e\u793a\u8f68\u8ff9\u7ba1\u7406\u7b2c\u4e8c\u4e2a\u9875\u9762\uff08\u8f68\u8ff9\u64ad\u653e\u9875\u9762\uff09
                $("#backToAimListPage").show(); //\u8f68\u8ff9\u7ba1\u7406\u9875\u5934\u4e0a\u663e\u793a\u201c\u56de\u9000\u201d\u6309\u94ae

                thisObject._markGroup.hideAimDistribute(thisObject._map); //\u82e5\u5730\u56fe\u4e0a\u5c55\u793a\u7740\u76ee\u6807\u70b9\u7684\u5206\u5e03\u60c5\u51b5\uff0c\u5219\u5c06\u5176\u9690\u85cf
                // $("#aimDistribute")[0].checked = false; //\u8bbe\u7f6e\u201c\u67e5\u770b\u76ee\u6807\u70b9\u5206\u5e03\u201d\u590d\u9009\u6846\u4e3a\u975e\u9009\u4e2d\u72b6\u6001

                _addColorChangeEvent(selectAimList.length); //\u6dfb\u52a0\u989c\u8272\u6846\u9009\u62e9\u4e8b\u4ef6
                _addAimListTwoCheckChangeEvent(); //\u6dfb\u52a0\u5f85\u64ad\u653e\u76ee\u6807\u5217\u8868\u9009\u62e9\u4e8b\u4ef6
                _addAimTabClickEvent(); //\u6dfb\u52a0tab\u9875\u5934\u70b9\u51fb\u4e8b\u4ef6\uff08\u5728\u7b2c\u4e8c\u4e2a\u9875\u9762\u521d\u59cb\u5316\u65f6\uff0c\u5df2\u6839\u636e\u9009\u4e2d\u7684\u76ee\u6807\u5c06tab\u9875\u5934\u5168\u90e8\u521d\u59cb\u5316\uff0c\u53ea\u662f\u5f53\u524d\u4e3a\u9690\u853d\u72b6\u6001\uff09

                _showAllTab();
                $(".phoneBillList").height($("#map").height()-32-$("#selectAimList").height()-212);
                $(".track-group-body").height($("#selectAimList").height() + $("#dynamicAimTab").height() + $(".trackPlay").height() + 50); //\u8bbe\u7f6e\u8f68\u8ff9\u9875\u9762\u9ad8\u5ea6
            });

            //\u5b9a\u4e49\u70b9\u51fb\u8fd4\u56de\u76ee\u6807\u5217\u8868\u6309\u94ae\u4e8b\u4ef6
            $("#backToAimListPage").click(function() {
                _noneSelectAim(true);
            });
        },       //比例尺变化时的轨迹更新
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
                    _endingPlay($(".activeTab").attr("aimId"), false);
                    _setPlayerStatus(false, false, false, null, null, -1, -1, -1);
                    $("#track-player-progressTip")[0].innerHTML = i18n.t('gismodule.manageAimTrack.playPanel.currentSpeed')+"1x"; //设置重放速度
                    var progress = parseInt($("#track-player-progressTip").attr("progress"));
                    speed=speed / Math.pow(2,progress-1);//reset the player speed
                    $("#track-player-progressTip").attr("progress", "1");
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
            if (this.targetList[tagertName] == undefined) {
                var target = aimList[tagertName]
                    //将目标的点信息聚合并生成轨迹信息
                var markers_layer = new L.MarkerClusterGroup({
                    spiderfyOnMaxZoom: false,
                    showCoverageOnHover: false,
                    zoomToBoundsOnClick: false,
                    iconCreateFunction: this._myiconCreateFunction
                });
                markers_layer.addPoints(target);
                this.targetList[target.name] = {};
                //将目标点分布添加到目标列表中
                this.targetList[target.name].markers = markers_layer;
            }
            //展示单个目标的聚合轨迹点
            this._map.addLayer(this.targetList[tagertName].markers);
            if(fitMapFlag) {//20160826
                this._map.fitBounds(this.targetList[tagertName].markers.getBounds());
            }
            if (this.targetList[tagertName].smoothlines == undefined) {
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
                    this.targetList[tagertName].smoothlines[z] = L.polyline(points, {
                        weight: 2,
                        color: color
                    });
                    //生成轨迹动画对象
                    this.targetList[tagertName].movingmarker[z] = new L.Marker.movingMarker(points, 1000 * inputPoints.length, {
                        color: color
                    });
                    //添加轨迹播放与话单数据联动事件
                    {
                        // this.targetList[tagertName].movingmarker[z].on('start', function(e) {
                        //     _setPhoneBillSelectedStyle(this.pc[tagertName][this.selectedTargerList[tagertName]][0], null);
                        // }, this);
                        // this.targetList[tagertName].movingmarker[z].on('station', function(e) {
                        //     _setPhoneBillSelectedStyle(this.pc[tagertName][this.selectedTargerList[tagertName]][e.index], null);
                        // }, this);
                        // this.targetList[tagertName].movingmarker[z].on('end', function(e) {
                        //     _setPhoneBillSelectedStyle(this.pc[tagertName][this.selectedTargerList[tagertName]][this.pc[tagertName][this.selectedTargerList[tagertName]].length - 1], null);
                        // }, this);
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
        //设置目标轨迹线的颜色
        _setTargetTraceColor: function(tagertName, color) {
            if (this.targetList[tagertName].smoothlines != undefined) {
                var linesLayer = this.targetList[tagertName].smoothlines[this._map.getZoom()];
                for (var z = 0; z <= this._map.getMaxZoom(); z++) {
                    this.targetList[tagertName].smoothlines[z] = L.polyline(this.targetList[tagertName].smoothpoints[z], {
                        weight: 2,
                        color: color
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
                        console.log(i18n.t('gismodule.manageAimTrack.alert2'));
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
                        //                        this.targetList[targetName].vector= grid.gridvector;
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
                        this.targetList[targetName].smoothlines[z] = L.polyline(points, {
                            weight: 2,
                            color: color
                        });
                        //生成轨迹动画对象
                        this.targetList[targetName].movingmarker[z] = new L.Marker.movingMarker(points, 1000 * inputPoints.length, {
                            color: color
                        });
                        //添加轨迹播放与话单数据联动事件
                        {
                            // this.targetList[targetName].movingmarker[z].on('start', function(e) {
                            //     _setPhoneBillSelectedStyle(this.pc[targetName][this.selectedTargerList[targetName]][0], null);
                            // }, this);
                            // this.targetList[targetName].movingmarker[z].on('station', function(e) {
                            //     _setPhoneBillSelectedStyle(this.pc[targetName][this.selectedTargerList[targetName]][e.index], null);
                            // }, this);
                            // this.targetList[targetName].movingmarker[z].on('end', function(e) {
                            //     _setPhoneBillSelectedStyle(this.pc[targetName][this.selectedTargerList[targetName]][this.pc[targetName][this.selectedTargerList[targetName]].length - 1], null);
                            // }, this);
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
        //列表点击与地图联动事件
        _infoPopup: function(index, target) {
            if (target != undefined) {
                var markers = this.targetList[target].markers;
                var marker = markers.markers_layer._layers[this.pointsID[target][index]];
                var z = this._map.getZoom();
                if (marker != undefined) {
                    var pos = this.cp[target][z][marker._leaflet_id];
                    //查找其聚合的父亲
                    if (pos == undefined) {
                        pos = marker._latlng;
                    }
                    this._map.setView(pos);
                    this._map.openPopup(marker._popup._content, pos);
                }
            }
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
                        pre_cluster_id = null;//20160825
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

        //获取和轨迹面板相关联的按钮（在工具栏上）
        getRelativeBtn: function() {
            return this.relativeBtn;
        },

        //获取轨迹面板上的关闭按钮
        getCloseElement: function() {
            return document.getElementById("hideTrackPanel");
        },

        //（私有）添加工具栏上的按钮
        _addBtn: function() {
          /*  var toolButton = document.createElement('img');
            toolButton.src = "../js/components/gisWidget/manageAimTrackModule/image/step.png"; //设置图标*/
             var toolButton = document.createElement('span');
            toolButton.height = 24; //设置图标大小
            toolButton.width = 24;
            toolButton.title = i18n.t('gismodule.manageAimTrack.title'); //设置注释
            toolButton.className = "buttonInToolbar-style fa fa-retweet"; //设置类样式
            this._container.appendChild(toolButton);

            return toolButton;
        },

        //（私有）添加图层面板上的元素
        _addPanel: function() {
            var parentId = document.getElementById(this.options.panelParentID);
            parentId.innerHTML = this._createPanelInnerHtml(); //在指定的元素内添加html
        },

        //生成图层面板的内部HTML
        _createPanelInnerHtml: function() {
            var innerHtml =
                //轨迹面板页头设置
                '<div class="track-group-title">' +
                '<label style="position: absolute;top:8px;left: 5px;">'+i18n.t('gismodule.manageAimTrack.trackPanel.name')+'</label>' +
                '<img id="backToAimListPage" title="'+i18n.t('gismodule.manageAimTrack.trackPanel.gobackBtn')+'" src="../js/components/gisWidget/manageAimTrackModule/image/undo.png" style="position: absolute;top:8px;right: 30px;cursor: pointer;display: none;"/>' +
                '<img id="hideTrackPanel" src="../js/components/gisWidget/manageAimTrackModule/image/remove-icon-small.png" style="position: absolute;top:10px;right: 8px;cursor: pointer;"/>' +
                '</div>' +
                //轨迹面板主要内容设置
                '<div class="track-group-body">' +
                //轨迹选择页
                '<div id = "targetList" style="padding: 10px;display:block;">' +
                //查看目标点分布
                '<div><label class="aim-distribute-style"><input id="aimDistribute" type="checkbox"/>&nbsp;'+i18n.t('gismodule.manageAimTrack.trackPanel.distributeBtn')+'</label></div>' +
                '<hr style="height:2px;background: linear-gradient(to right,darkseagreen,yellow);border: 0px;"/>' +
                //提示信息
                '<table style="width: 100%;">' +
                '<tr>' +
                '<td style="width: 16px;"><img style="margin-top: 5px;" src="../js/components/gisWidget/manageAimTrackModule/image/information.png"/></td>' +
                '<td><label style="font-size: 12px;color: blue;">'+i18n.t('gismodule.manageAimTrack.trackPanel.info1')+'</label></td>' +
                '</tr>' +
                '</table>' +
                //待选择目标列表
                '<div class="target-aimList-style"></div>' +
                //确定按钮
                '<button id="submitSelectAim" type="button" style="margin-left: 100px;margin-top: 10px;width: 70px;">'+i18n.t('gismodule.manageAimTrack.trackPanel.okBtn')+'</button>' +
                //提示信息
                '<table id="aimSelectTip" style="margin-left: 70px;display: none;">' +
                '<tr>' +
                '<td style="width: 16px;"><img style="margin-top: 5px;" src="../js/components/gisWidget/manageAimTrackModule/image/warning.png"/></td>' +
                '<td><label id="aimSelectTipLabel" style="font-size: 12px;color: red;">'+i18n.t('gismodule.manageAimTrack.trackPanel.info2')+'</label></td>' +
                '</tr>' +
                '</table>' +
                '</div>' +
                //轨迹播放页
                '<div id="targetTrack" style="padding: 10px;display:none;">' +
                //待播放轨迹目标列表
                '<table id="selectAimList"></table>' +
                '<hr style="height: 2px;border: 0px;background:linear-gradient(to right,darkseagreen,yellow);"/>' +
                //目标话单列表tab页
                '<div id="dynamicAimTab">' +
                '<div id="aimTabHeader" style="height: 20px;">' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';

            return innerHtml;
        },

        //添加目标列表
        _addAimList: function() {
            var targetAimListInnerHtml = "";
            var num = 1;
            //遍历目标列表，生成目标选择列表html
            for (aim in aimList) {
                var aimID = aim; //目标ID（目标号码）
                var aimName = i18n.t('gismodule.manageAimTrack.aimName') + num; //目标名

                targetAimListInnerHtml += '<div class="target-aim-style"><input aimId="';
                targetAimListInnerHtml += aimID;
                targetAimListInnerHtml += '" aimName="';
                targetAimListInnerHtml += aimName;
                targetAimListInnerHtml += '" name = "reviewAim" type="checkbox" checked="true"/><sapn class="aimDisplay">&nbsp;';
                targetAimListInnerHtml += aimName;
                targetAimListInnerHtml += '(';
                targetAimListInnerHtml += aimID;
                targetAimListInnerHtml += ')';
                targetAimListInnerHtml += '</sapn></div>';

                num++;
            }
            if (targetAimListInnerHtml == "") //无目标数据时，给出提示
            {
                $(".track-group-body")[0].innerHTML =
                    '<table style="margin-left: 70px;">' +
                    '<tr>' +
                    '<td style="width: 16px;"><img style="margin-top: 5px;" src="../js/components/gisWidget/manageAimTrackModule/image/warning.png"/></td>' +
                    '<td><label style="font-size: 12px;color: red;">'+i18n.t('gismodule.manageAimTrack.trackPanel.tip3')+'</label></td>' +
                    '</tr>' +
                    '</table>';
            } else //有目标数据时，添加html，以及对应的事件
            {
                $(".track-group-body")[0].innerHTML=//轨迹选择页
                '<div id = "targetList" style="padding: 10px;display:block;">' +
                //查看目标点分布
                '<div><label class="aim-distribute-style"><input id="aimDistribute" type="checkbox"/>&nbsp;'+i18n.t('gismodule.manageAimTrack.trackPanel.distributeBtn')+'</label></div>' +
                '<hr style="height:2px;background: linear-gradient(to right,darkseagreen,yellow);border: 0px;"/>' +
                //提示信息
                '<table style="width: 100%;">' +
                '<tr>' +
                '<td style="width: 16px;"><img style="margin-top: 5px;" src="../js/components/gisWidget/manageAimTrackModule/image/information.png"/></td>' +
                '<td><label style="font-size: 12px;color: blue;">'+i18n.t('gismodule.manageAimTrack.trackPanel.tip1')+'</label></td>' +
                '</tr>' +
                '</table>' +
                //待选择目标列表
                '<div class="target-aimList-style"></div>' +
                //确定按钮
                '<button id="submitSelectAim" type="button" style="margin-left: 100px;margin-top: 10px;width: 70px;">'+i18n.t('gismodule.manageAimTrack.trackPanel.okBtn')+'</button>' +
                //提示信息
                '<table id="aimSelectTip" style="margin-left: 70px;display: none;">' +
                '<tr>' +
                '<td style="width: 16px;"><img style="margin-top: 5px;" src="../js/components/gisWidget/manageAimTrackModule/image/warning.png"/></td>' +
                '<td><label id="aimSelectTipLabel" style="font-size: 12px;color: red;">'+i18n.t('gismodule.manageAimTrack.trackPanel.tip2')+'</label></td>' +
                '</tr>' +
                '</table>' +
                '</div>' +
                //轨迹播放页
                '<div id="targetTrack" style="padding: 10px;display:none;">' +
                //待播放轨迹目标列表
                '<table id="selectAimList"></table>' +
                '<hr style="height: 2px;border: 0px;background:linear-gradient(to right,darkseagreen,yellow);"/>' +
                //目标话单列表tab页
                '<div id="dynamicAimTab">' +
                '<div id="aimTabHeader" style="height: 20px;">' +
                '</div>' +
                '</div>';
                $(".target-aimList-style")[0].innerHTML = targetAimListInnerHtml;
                this._addAimListEvent(); //添加目标选择列表点击事件
                //设置目标选择列表高度
            }
        },

        //添加事件
        _addAimListEvent: function() {
            //点击目标选择列表中目标操作（checkbox）
            $('[name=reviewAim]:checkbox').click(function() {
                if (this.checked == true) {
                    //控制最多选5个
                    if ($("input[name='reviewAim']:checked").length > 5) {
                        //超过5个，给予提示，并将选中的置为非选中状态
                        $("#aimSelectTipLabel")[0].innerHTML = i18n.t('gismodule.manageAimTrack.trackPanel.info2');
                        $("#aimSelectTip").show();
                        this.checked = false;
                    } else //不超过5个时，将提示信息隐藏
                    {
                        $("#aimSelectTip").hide();
                    }
                }
                if (this.checked == false) {
                    //选中的个数小于5时，隐藏提示
                    if ($("input[name='reviewAim']:checked").length < 5) {
                        $("#aimSelectTip").hide();
                    }
                }
            });

            //点击目标选择列表中目标操作（checkbox后的文字）
            $(".aimDisplay").click(function() {
                var check = $(this).parent()[0].children[0]; //获取当前点击的目标前的复选框的选中状态
                //若当前为选中状态
                if (check.checked == true) {
                    check.checked = false; //将复选框改为非选中状态
                    //若当前选中个数小于5，则隐藏提示
                    if ($("input[name='reviewAim']:checked").length < 5) {
                        $("#aimSelectTip").hide();
                    }
                } else //若当前为非选中状态
                {
                    //若当前选中的个数大于5时，显示提示
                    if ($("input[name='reviewAim']:checked").length >= 5) {
                        $("#aimSelectTipLabel")[0].innerHTML = i18n.t('gismodule.manageAimTrack.trackPanel.info2');
                        $("#aimSelectTip").show();
                    } else //若当前选中的个数小于5时，将复选框标记为选中状态，并隐藏提示
                    {
                        check.checked = true;
                        $("#aimSelectTip").hide();
                    }
                }
            });
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
        }
    };

    //构造函数
    setAimTrackInfo = function(options) {
        return new _setAimTrackInfo(options);
    };

    //接收目标数据
    var aimList = {};
    AddTargetData = function(json) {
        if(json.data.length>0){
            aimList[json.name] = json;
        }
    };
    ClearTargetData = function() {
        aimList = {};
    };

    //查看目标点分布
    L.MarkerClusterGroup.prototype.showAimDistribute = function(aimListArgs, map) {
        if (this.markers_layer != undefined) {
            this.addTo(map);
            map.fitBounds(this.markers_layer.getBounds());
            return;
        }
        //定义点要素类图层
        this.markers_layer = L.featureGroup();

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
                            pointCol = i18n.t('gismodule.manageAimTrack.tooltipCol.lat');
                            lat_value = parseFloat(pointVal);
                            break;
                        case lon_index:
                            pointCol = i18n.t('gismodule.manageAimTrack.tooltipCol.lng');
                            lon_value = parseFloat(pointVal);
                            break;
                        case time_index:
                            pointCol = i18n.t('gismodule.manageAimTrack.tooltipCol.time');
                            time_value = pointVal;
                            break;
                        default:
                            pointCol = aimList[aim].columns[j];
                    }

                    pointInfo[pointCol] = pointVal;
                }

                //定义点
                //                var toolTipStr = '<div class="portlet-extend"><div class="portlet-body-extend-popup"><table><tr><th>地址</th><td>' + address + '</td></tr><tr  style="background-color: white;"><th>类别</th><td>' + kindName + '</td></tr><tr><th >地图坐标</th><td>(经度:' + longitudeVal + ',纬度:' + latitudeVal + ')</td></tr></table></div></div>';
                //设置点的tooltip信息
                var toolTipStr = '<div class="portlet-extend"><div class="aim-distribute-toolTip"><table>';
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
                    fillColor: '#ff0000',
                    fillOpacity: 1,
                    radius: 8
                }).bindPopup(toolTipStr).addTo(this.markers_layer);
            }
        }

        //添加到地图
        this.addLayer(this.markers_layer);
        this.addTo(map);
    if(this.markers_layer.getLayers().length>0){
            map.fitBounds(this.markers_layer.getBounds());
        }
    };

    //隐藏目标点分布
    L.MarkerClusterGroup.prototype.hideAimDistribute = function(map) {
        if (map.hasLayer(this)) {
            map.removeLayer(this);
        }
    };

    //扩展聚类添加点接口
    L.MarkerClusterGroup.prototype.addPoints = function(points) {
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
                console.log("[" + lon + "," + lat + "]"+i18n.t('gismodule.manageAimTrack.alert1'));
                continue;
            }
            //配置点ToolTip信息
            var toolTipStr = '<div class="prtlet-extend"><div class="portlet-title-extend-popup">'+i18n.t('gismodule.manageAimTrack.tooltipTitle')+'</div><div class="portlet-body-extend-popup"><table>';
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
                fillColor: '#ff0000',
                fillOpacity: 1,
                radius: 8
            }).bindPopup(toolTipStr).addTo(this.markers_layer);
        }
        this.addLayer(this.markers_layer);
    };


}(window, document));