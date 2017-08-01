
registerLocales(require.context('../../locales/dataprocess/', false, /\.js/));
define([
    'jquery',
    '../tpl/tpl-audioplayer.html',
], function($, tpl) {
    var options = {};
    var style = tpl.split("<!--splitter-->")[0],
        html = tpl.split("<!--splitter-->")[1];

    var shortcutKey ={
        backward: 118,  //F7's keyCode
        playorpause: 119,  //F8
        forward: 120,  //F9
    };

    /*
      opts{
        container: jQuery object,
        channel: [url],
        wave: [url],
        height: number,
        zoomlevel: number, 
        autoplay: bool, true(default)
      }
    */
    function init(opts) {
        this.options = opts;
        $("head").append(style);
        var autoplay = opts.autoplay === false ? false : true;
        if(opts.height <= $(".aplayer-controls").outerHeight())
            return ;
        this.options.container.empty().append(html);
        player.init(opts.channel, autoplay);
        controlsInit(opts.height, autoplay);
        wavepeak.init(opts.wave, opts.height, opts.zoomlevel);
        document.addEventListener("keyup", handleKeyEvent);
        return this;
    }

    function handleKeyEvent(event){
        if (_.values(shortcutKey).indexOf(event.keyCode) > -1) {
            event.preventDefault();
        }
        switch (event.keyCode) {
            case shortcutKey.backward:
                $('.backward').trigger("click");
                break;
            case shortcutKey.forward:
                $('.forward').trigger("click");
                break;
            case shortcutKey.playorpause:
                if(player.isplay) $('.pause').trigger("click");
                else $('.play').trigger("click");
              break;
        }
    }

    function controlsInit(height, autoplay) {
        $('.volume-off').hide();
        $('.change-right').hide();
        $('.change-left').hide();
        $('.wave-show').hide();
        $('.step-backward').hide();
        $('.step-forward').hide();
        $('#volume-controls').hide();
        if(autoplay) {
            $('.play').hide();
        } else {
            $('.pause').hide();
        }
        if(!player.twoChannel){
            $('.change-vol').hide();
            $('.aplayer-controls').css("padding-right", "280px");
            $('.control-right').css({"width": "150px", "right": "3px"});
            $('#playrange').css("margin-right", "150px");
             $('#volume-controls').css("left", "111px");
        } else {
            $('.aplayer-controls').css("padding-right", "320px");
            $('.control-right').css("width", "200px");
            $('#playrange').css("margin-right", "200px");
        }
        var volumeOperate = false;
        $("body").on("click", function(e){
            if(!volumeOperate) $('#volume-controls').hide();
            volumeOperate = false;
        });
        tooltip($('.change-vol'), i18n.t("dataprocess.spyprocess.audioplayer.bothvoice"));
        tooltip($('.change-right'),i18n.t("dataprocess.spyprocess.audioplayer.secondvoice"));
        tooltip($('.change-left'), i18n.t("dataprocess.spyprocess.audioplayer.firstvoice"));
        tooltip($('.volume-off'), i18n.t("dataprocess.spyprocess.audioplayer.mute"));
        tooltip($('.volume-up'), i18n.t("dataprocess.spyprocess.audioplayer.unmute"));
        tooltip($('.play'), i18n.t("dataprocess.spyprocess.audioplayer.play"));
        tooltip($('.pause'), i18n.t("dataprocess.spyprocess.audioplayer.pause"));
        tooltip($('.backward'), i18n.t("dataprocess.spyprocess.audioplayer.backward"));
        tooltip($('.forward'), i18n.t("dataprocess.spyprocess.audioplayer.forward"));
        tooltip($('.step-backward'), i18n.t("dataprocess.spyprocess.audioplayer.nextitem"));
        tooltip($('.step-forward'), i18n.t("dataprocess.spyprocess.audioplayer.lastitem"));
        tooltip($('.wave-hide'), i18n.t("dataprocess.spyprocess.audioplayer.hidewave"));
        tooltip($('.wave-show'), i18n.t("dataprocess.spyprocess.audioplayer.showwave"));
        player.ended = function(){
            if(player.isplay) {
                player.seek(0);
                $('.pause').trigger("click");
            }
        };
        player.process = function(){
            var processwidth = player.getCurrentTime()/player.getDuration() * ($("#playrange")[0].offsetWidth - $(".thum")[0].offsetWidth / 2);
            $(".thum")[0].style.left = processwidth + 'px';
            $(".isprocess")[0].style.width = (Math.max(0, processwidth) + $(".thum")[0].offsetWidth / 2) + 'px';
            $('.displaytime').text(formatSecond(player.getCurrentTime()) + '/' + formatSecond(player.getDuration()));
        };
        player.starttime = function(){
            $('.displaytime').text(formatSecond(0) + '/' + formatSecond(player.getDuration()));
        };
        player.addloading = function(){
            $("#loadericon").show();
        };
        player.removeloading = function(){
            $("#loadericon").hide();
        };
        $('.backward').on("click", function(event) {
            player.backward();
        });
        $('.forward').on("click", function(event) {
            player.forward();
        });
        $('.step-backward').on("click", function(event) {
            player.stepBackward();
        });
        $('.step-forward').on("click", function(event) {
            player.stepForward();
        });
        $('.play').on("click", function(event) {
            player.play();
            player.isplay = true;
            $('.play').hide();
            $('.pause').show();
        });
        $('.pause').on("click", function(event) {
            player.pause();
            player.isplay = false;
            $('.play').show();
            $('.pause').hide();
        });
        $('.volume-up').on("click", function(event) {
            event.stopPropagation();
            $('#volume-controls').toggle();
        });
        $('.volume-off').on("click", function(event) {
            event.stopPropagation();
            $('#volume-controls').toggle();
        });
        $(".volumethum")[0].addEventListener("mousedown", function(e) {
            e.stopPropagation();
            volumeOperate = true;
            var y = e.clientY;
            var l = this.offsetLeft;
            var max = $("#volumerange")[0].offsetWidth - this.offsetWidth / 2;
            document.onmousemove = function(e){
                var thisY = e.clientY;
                var to = Math.min(max, Math.max(-2, l - (thisY - y)));
                $(".volumethum")[0].style.left = to + 'px';
                $(".volumeprocess")[0].style.width = (Math.max(0, to) + $(".volumethum")[0].offsetWidth / 2) + 'px';
                var volumevalue = (Math.round(Math.max(0, (to * 100) / max)) / 100);
                if (volumevalue == 0) {
                    $('.volume-off').show();
                    $('.volume-up').hide();
                } else {
                    $('.volume-up').show();
                    $('.volume-off').hide();
                }
                player.setVolume(volumevalue);
                document.getSelection ? document.getSelection().removeAllRanges() : document.selection.empty();
            };
            document.onmouseup = function(){
                this.onmousemove = null;
            };
        });
        $("#volumerange")[0].addEventListener("mousedown", function(e){
            e.stopPropagation();
            volumeOperate = true;
            var max = this.offsetWidth - $(".volumethum")[0].offsetWidth / 2;
            var to = (e.offsetX - $(".volumethum")[0].offsetWidth / 2);
            $(".volumethum")[0].style.left = to + 'px';
            $(".volumeprocess")[0].style.width = Math.max($(".volumethum")[0].offsetWidth / 2, e.offsetX) + 'px';
            var volumevalue = (Math.round(Math.max(0, (to * 100) / max)) / 100);
            if (volumevalue == 0) {
                $('.volume-off').show();
                $('.volume-up').hide();
            } else {
                $('.volume-up').show();
                $('.volume-off').hide();
            }
            player.setVolume(volumevalue);
        });
        $(".thum")[0].addEventListener("mousedown", function(e) {
            e.stopPropagation();
            var x = e.clientX;
            var l = this.offsetLeft;
            var max = $("#playrange")[0].offsetWidth - this.offsetWidth / 2;
            document.onmousemove = function(e){
                var thisX = e.clientX;
                var to = Math.min(max, Math.max(-2, l + (thisX - x)));
                $(".thum")[0].style.left = to + 'px';
                $(".isprocess")[0].style.width = (Math.max(0, to) + $(".thum")[0].offsetWidth / 2) + 'px';
                player.seek((Math.round(Math.max(0, (to * 100) / max)) / 100) * player.getDuration());
                document.getSelection ? document.getSelection().removeAllRanges() : document.selection.empty();
            };
            document.onmouseup = new Function("this.onmousemove=null");
        });
        $("#playrange")[0].addEventListener("mousedown", function(e){
            e.stopPropagation();
            var max = this.offsetWidth - $(".thum")[0].offsetWidth / 2;
            var to = (e.offsetX - $(".thum")[0].offsetWidth / 2);
            $(".thum")[0].style.left = to + 'px';
            $(".isprocess")[0].style.width = Math.max($(".thum")[0].offsetWidth / 2, e.offsetX) + 'px';
            player.seek((Math.round(Math.max(0, (to * 100) / max)) / 100) * player.getDuration());
        });
        $('.change-left').on("click", function(event) {
            $('.change-right').show();
            $('.change-left').hide();
            $('.change-vol').hide();
            player.unmute(2);
            player.mute(1);
        }); 
        $('.change-right').on("click", function(event) {
            $('.change-right').hide();
            $('.change-left').hide();
            $('.change-vol').show();
            player.unmute(1);
        }); 
        $('.change-vol').on("click", function(event) {
            $('.change-right').hide();
            $('.change-left').show();
            $('.change-vol').hide();
            player.mute(2);
        }); 
        $('.wave-hide').on("click", function(event){
            wavepeak.hide();
            $('.wave-hide').hide();
            $('.wave-show').show();
            $('.wave-show').css("color", "grey");
            $(".aplayer-controls").css("top", '0px');
        });
        $('.wave-show').on("click", function(event){
            wavepeak.show();
            $('.wave-hide').show();
            $('.wave-show').hide();
            $(".aplayer-controls").css("top", (height - $(".aplayer-controls").outerHeight()) + 'px');
        });
        function tooltip(container, message, show){
            container.attr({
                "data-toggle": "tooltip",
                "data-original-title": message,
                "data-html": 'true'
            });
            var options = {
                container: container
            };
            $('.aplayer-controls a[data-toggle=tooltip]').tooltip(options);
        }
        function formatSecond(value){
            var seconds = Math.floor(value);
            var minutes = 0;
            if(seconds >= 60){
                minutes = parseInt(seconds / 60);
                seconds = parseInt(seconds % 60);
            }
            if(seconds < 10) seconds = '0' + seconds;
            if(minutes < 10) minutes = '0' + minutes;
            var result = minutes + ":" + seconds;
            return result;
        }
    }

    var player = {
        ended: undefined,
        twoChannel: false,
        mute0: false,
        mute1: false,
        isplay: undefined,
        init: function(channel, autoplay, ended, process, starttime){
            player.twoChannel = (channel.length == 2);
            var aCanplay, bCanplay;
            player.isplay = autoplay;
            $(".channel0 .aplayer-player").attr("src", channel[0]);
            if(player.twoChannel){
                $(".channel1 .aplayer-player").attr("src", channel[1]);
            }
            $('.channel0 .aplayer-player')[0].addEventListener("ended", function() {
                if(player.ended) player.ended();
            }, false);
            $('.channel0 .aplayer-player')[0].addEventListener("timeupdate", function(){
                player.process();
            })
            $('.channel0 .aplayer-player')[0].addEventListener("loadedmetadata", function(){
                if(player.starttime) player.starttime();
            })
            $('.channel0 .aplayer-player')[0].addEventListener("waiting", function(){
                player.pause();
                aCanplay = false;
                setTimeout(addloadIcon, 50);
            });
            $('.channel1 .aplayer-player')[0].addEventListener("waiting", function(){
                player.pause();
                bCanplay = false;
                setTimeout(addloadIcon, 50);
            });
            function addloadIcon(){
                if(!aCanplay || !bCanplay) player.addloading();
            }
            $('.channel0 .aplayer-player')[0].addEventListener("canplay", function(){
                if(player.isplay) {
                    aCanplay = true;
                    if(!player.twoChannel || bCanplay){
                        player.play();
                        setTimeout(player.removeloading, 50);
                    }
                } else setTimeout(player.removeloading, 50);
            });
            $('.channel1 .aplayer-player')[0].addEventListener("canplay", function(){
                if(player.isplay) {
                    bCanplay = true;
                    if(!player.twoChannel || aCanplay){
                        player.play();
                        setTimeout(player.removeloading, 50);
                    }
                } else setTimeout(player.removeloading, 50);
            });
        },
        play: function(){
            if(player.twoChannel){
                $('.channel1 .aplayer-player')[0].play();
            }
            $('.channel0 .aplayer-player')[0].play();
        },
        pause: function(){
            if(player.twoChannel){
                $('.channel1 .aplayer-player')[0].pause();
            }
            $('.channel0 .aplayer-player')[0].pause();
        },
        seek: function(time){
            if(player.twoChannel){
                $('.channel1 .aplayer-player')[0].currentTime = time;
            }
            $('.channel0 .aplayer-player')[0].currentTime = time;
        },
        stepForward: function(){
            //
        },
        stepBackward: function(){
            //
        },
        mute: function(idx){
            if(idx != 2){
                $('.channel0 .aplayer-player')[0].volume = 0;
                this.mute1 = true;
            }
            if(idx != 1) {
                $('.channel1 .aplayer-player')[0].volume = 0;
                this.mute2 = true;
            }
        },
        unmute: function(idx){
            if(idx != 2){
                $('.channel0 .aplayer-player')[0].volume = $('.channel1 .aplayer-player')[0].volume;
                this.mute1 = false;
            }
            if(idx != 1) {
                $('.channel1 .aplayer-player')[0].volume = $('.channel0 .aplayer-player')[0].volume;
                this.mute2 = false;
            }
        },
        setVolume: function(value){
            if(!this.mute1) $('.channel0 .aplayer-player')[0].volume = value;
            if(!this.mute2) $('.channel1 .aplayer-player')[0].volume = value;
        },
        forward: function(){
            if(player.twoChannel){
                $('.channel1 .aplayer-player')[0].currentTime += 5.0;
            }
            $('.channel0 .aplayer-player')[0].currentTime += 5.0;
        },
        backward: function(){
            if(player.twoChannel){
                $('.channel1 .aplayer-player')[0].currentTime -= 5.0;
            }
            $('.channel0 .aplayer-player')[0].currentTime -= 5.0;
        },
        getDuration: function () {
            return $('.channel0 .aplayer-player')[0].duration;
      },
        getCurrentTime: function(){
            return $('.channel0 .aplayer-player')[0].currentTime;
        }
    };
    var wavepeak = {
        peaks0: undefined,
        peaks1: undefined,
        range: undefined,
        height: undefined,
        init: function(wave, height, zoomlevel){
            if(wave.length == 1)
                wavepeak.height = height - $(".aplayer-controls").outerHeight();
            else if(wave.length == 2)
                wavepeak.height = (height - $(".aplayer-controls").outerHeight())/2;
            else 
                return "The length of opts.wave is not appropriate!";
            var initZoomlevel = zoomlevel || 0;
            wavepeak.peaks0 = initwave($('.aplayer .channel0 .waveform-container')[0], wave[0], $('.aplayer .channel0 audio')[0], wavepeak.height, initZoomlevel);
            if(wave.length == 2){
                $(".channel1").removeClass("hidden");
                wavepeak.peaks1 = initwave($('.aplayer .channel1 .waveform-container')[0], wave[1], $('.aplayer .channel0 audio')[0], wavepeak.height, initZoomlevel);
            }
            $('.channel0 .aplayer-player')[0].addEventListener("timeupdate", onTimeUpdate);
            $('.wave-area')[0].addEventListener("mousedown", drawSegment);
            $(".overview-container").hide();

            function onTimeUpdate(){
                if(wavepeak.peaks1){
                    wavepeak.peaks1.waveform.waveformZoomView.frameOffset = wavepeak.peaks0.waveform.waveformZoomView.frameOffset;
                }
                if(!wavepeak.range)
                    return;
                if ($('.channel0 .aplayer-player')[0].currentTime >= (wavepeak.range.endTime - 0.1) || $('.channel0 .aplayer-player')[0].currentTime < wavepeak.range.startTime) {
                    if (wavepeak.peaks1)
                        $('.channel1 .aplayer-player')[0].currentTime = wavepeak.range.startTime + 0.01;
                    $('.channel0 .aplayer-player')[0].currentTime = wavepeak.range.startTime +0.01;
                }
            }
            function initwave(container, datauri, player, height){
                var str = datauri.substr(datauri.lastIndexOf(".") + 1).toLowerCase();
                if(str == "json"){
                    var instance = peaks.init({
                        container: container,
                        mediaElement: player,
                        dataUri: {
                            json: datauri,
                        },
                        height: wavepeak.height,
                        zoomAdapter: 'static',
                    });
                } else if(str == "dat"){
                    var instance = peaks.init({
                        container: container,
                        mediaElement: player,
                        dataUri: {
                            arraybuffer: datauri,
                        },
                        height: wavepeak.height,
                        zoomAdapter: 'static',
                    });
                }
                instance.on("waveformZoomReady",function(){
                    var zoomview = instance.waveform.waveformZoomView;
                    zoomview.stage.off("mousedown");
                    zoomview.stage.on("mousedown", mouseDownEvent);
                    zoomview.stage.on("mousewheel", mouseWheelEvent);
                });
                instance.on("segments.dragged", draggedSegment);
                instance.zoom.setZoom(initZoomlevel);
                return instance;
            }
            function draggedSegment(){
                this.waveform.segments.updateSegments(wavepeak.range);
                wavepeak.range = this.waveform.segments.segments[0];
                if(wavepeak.peaks1){
                    var anotherpeak = this == wavepeak.peaks0 ? wavepeak.peaks1 : wavepeak.peaks0;
                    anotherpeak.segments.removeAll();
                    anotherpeak.segments.addSegment([wavepeak.range]);
                }
            }
            function drawSegment(e) {
                if (e.target && e.type === "mousedown" && e.which == 3) {
                    var starttime = wavepeak.peaks0.waveform.waveformZoomView.data.time(wavepeak.peaks0.waveform.waveformZoomView.frameOffset + e.offsetX);
                    $('.wave-area')[0].addEventListener("mouseup", endtimePoint);
                }
                function endtimePoint(e) {
                    var endtime = wavepeak.peaks0.waveform.waveformZoomView.data.time(wavepeak.peaks0.waveform.waveformZoomView.frameOffset + e.offsetX);
                    if (starttime != endtime) {
                        var segment = {
                            startTime: endtime > starttime ? starttime : endtime,
                            endTime: endtime > starttime ? endtime : starttime,
                            color: 'rgba(255, 0, 0, 1)',
                            editable: true
                        };
                        setSegment(segment);
                    }
                    $('.wave-area')[0].removeEventListener("mouseup", endtimePoint);
                }
            }
            function mouseDownEvent(e) {
                if (e.target && "mousedown" === e.type && e.evt.which == 1) {
                    var seeking = true;
                    var a, i, r = e.evt.layerX;
                    this.on("mousemove", function(e) {
                        seeking = false;
                        a = e.evt.layerX > r ? r - e.evt.layerX : 1 * (r - e.evt.layerX);
                        r = e.evt.layerX;
                        i = wavepeak.peaks0.waveform.waveformZoomView.frameOffset + a;
                        i = i < 0 ? 0 : i > wavepeak.peaks0.waveform.waveformZoomView.pixelLength - wavepeak.peaks0.waveform.waveformZoomView.width ? wavepeak.peaks0.waveform.waveformZoomView.pixelLength - wavepeak.peaks0.waveform.waveformZoomView.width : i;
                        updateZoomWave(i);
                    });
                    this.on("mouseup", function() {
                        if (seeking) {
                            var time = wavepeak.peaks0.waveform.waveformZoomView.data.time(wavepeak.peaks0.waveform.waveformZoomView.frameOffset + r);
                            player.seek(time);
                        }
                        this.off("mousemove mouseup");
                        seeking = false;
                    });
                }
            }
            function mouseWheelEvent(e) {
                if (e.evt.wheelDelta > 0) {
                    zoomIn();
                } else if (e.evt.wheelDelta < 0) {
                    zoomOut();
                }
                e.evt.preventDefault();
            }
            function zoomIn() {
                var zoomlevel = wavepeak.peaks0.currentZoomLevel;
                if ($('.channel0 .aplayer-player')[0].paused) {
                    if(wavepeak.peaks1) wavepeak.peaks1.zoom.zoomIn();
                    wavepeak.peaks0.zoom.zoomIn();
                } else {
                    $('.channel0 .aplayer-player')[0].addEventListener("pause", function() {
                        $('.channel0 .aplayer-player')[0].removeEventListener("pause", arguments.callee);
                        if(wavepeak.peaks1) {
                            wavepeak.peaks1.zoom.zoomIn();
                            $('.channel1 .aplayer-player')[0].play();
                        }
                        wavepeak.peaks0.zoom.zoomIn();
                        $('.channel0 .aplayer-player')[0].play();
                    });
                    if(wavepeak.peaks1) $('.channel1 .aplayer-player')[0].pause();
                    $('.channel0 .aplayer-player')[0].pause();
                }
            }
            function zoomOut() {
                var zoomlevel = wavepeak.peaks0.currentZoomLevel;
                if ($('.channel0 .aplayer-player')[0].paused) {
                    if (wavepeak.peaks1) wavepeak.peaks1.zoom.zoomOut();
                    wavepeak.peaks0.zoom.zoomOut();
                } else {
                    $('.channel0 .aplayer-player')[0].addEventListener("pause", function(){
                        $('.channel0 .aplayer-player')[0].removeEventListener("pause", arguments.callee);
                        if (wavepeak.peaks1) {
                            wavepeak.peaks1.zoom.zoomOut();
                            $('.channel1 .aplayer-player')[0].play();
                        }
                        wavepeak.peaks0.zoom.zoomOut();
                        $('.channel0 .aplayer-player')[0].play();
                    });
                    if (wavepeak.peaks1) $('.channel1 .aplayer-player')[0].pause();
                    $('.channel0 .aplayer-player')[0].pause();
                }
            }
            function updateZoomWave(i) {
                if (wavepeak.peaks1) {
                    wavepeak.peaks1.waveform.waveformZoomView.updateZoomWaveform(i);
                }
                wavepeak.peaks0.waveform.waveformZoomView.updateZoomWaveform(i);
            }
            function setSegment(segment) {
                wavepeak.range = segment;
                if (wavepeak.peaks1) {
                    wavepeak.peaks1.segments.removeAll();
                    wavepeak.peaks1.segments.addSegment([segment]);
                }
                wavepeak.peaks0.segments.removeAll();
                wavepeak.peaks0.segments.addSegment([segment]);
                if (wavepeak.peaks1) {
                    $('.channel1 .aplayer-player')[0].currentTime = segment.startTime + 0.01;
                }
                $('.channel0 .aplayer-player')[0].currentTime = segment.startTime +0.01;
            }
        },
        hide: function(){
            $(".zoom-container").hide();
        },
        show: function(){
            $(".zoom-container").show();
        }
    }
    return {
        init: init,
    }
});