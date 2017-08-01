define('widget/datetimePicker', [
    'underscore',
    'jquery',
    'nova-dialog',
    'nova-notify',
    // 'utility/jqwidgets/globalization/globalize',
    './datetimepicker.css',
    'utility/jqwidgets/jqxcore.js',
    "utility/jqwidgets/jqxdatetimeinput.js",
    'utility/jqwidgets/jqxcalendar.js',
], function(_, $, Dialog, Notify) {
    var _instance = {};
    var _autoInc = 0;

    function build(opts) {
        _instance.opts = opts;
        var containerId = $(opts.container).selector;

        switch (opts.type) {
            case 'single':
                buildSingle(opts);
                break;
            case 'range':
                buildRange(opts);
                break;
            case 'calenderRange':
                buildCalenderRange(opts);
                break;
            default:
                buildRange(opts);
                break;
        }
    }

    function buildCalenderRange(opts){
        var intHeight;
        typeof opts.inputHeight == "string"? intHeight = parseInt(opts.height.substr(0,opts.inputHeight.length-2)) :intHeight = opts.height;
        var spanStyle = 'width:40px;height:'+ opts.height +';padding-top:' + (intHeight-14)/2 + 'px;padding-bottom:' + (intHeight-14)/2 +'px;';
        var calenderbeginId = 'beginCalender';
        var calenderendId = 'endCalender';
        if(!opts.containerId){
            opts.containerId = getRanderId();
            _instance.opts = opts;
        }
        var selectorContainer = "#"+opts.containerId+" ";
        $(opts.container).html('<div class="calenderRangeGroup" id="'+opts.containerId+'"><div class="" style="min-width:100px;display:table-cell;" id='
         + calenderbeginId + '></div>'+'<span class="input-group-addon" style="'+ spanStyle +'">到</span><div class="" style="min-width:100px;display:table-cell;" id='
         + calenderendId + '></div></div>');

        $(selectorContainer+"#"+calenderbeginId).jqxDateTimeInput({
            width: opts.width ||'180px',
            height: opts.height || '25px',
            formatString: opts.formatString,
            showCalendarButton: opts.showCalendarButton || false,
        });
        if(opts.startTime)
            $(selectorContainer+"#"+calenderbeginId).jqxDateTimeInput('setDate', opts.startTime);
        $(selectorContainer+"#"+calenderbeginId).on('valueChanged',function(event){
            var beginDate = event.args.date;
            var endDate = $(selectorContainer+'#' + calenderendId).jqxDateTimeInput('getDate');
            if(endDate <= beginDate){
                $(selectorContainer+"#"+calenderbeginId).addClass("borderColor");
            }else{
                $(selectorContainer+"#"+calenderbeginId).removeClass("borderColor");
                $(selectorContainer+'#' + calenderendId).removeClass("borderColor");
                if(!_.isUndefined(opts.callback) && _.isFunction(opts.callback)){
                    opts.callback(formatDate(beginDate,opts.formatString),formatDate(endDate,opts.formatString));
                }
            }
        })

        $(selectorContainer+'#' + calenderendId).jqxDateTimeInput({
            width: opts.width ||'180px',
            height: opts.height || '25px',
            formatString: opts.formatString,
            showCalendarButton: opts.showCalendarButton || false,
        });
        if(opts.endTime)
            $(selectorContainer+'#' + calenderendId).jqxDateTimeInput('setDate', opts.endTime);
        $(selectorContainer+'#' + calenderendId).on('valueChanged',function(event){
            var endDate = event.args.date;
            var beginDate = $(selectorContainer+"#"+calenderbeginId).jqxDateTimeInput('getDate');
            if(endDate <= beginDate){
                $(selectorContainer+'#' + calenderendId).addClass("borderColor");
            }else{
                $(selectorContainer+"#"+calenderbeginId).removeClass("borderColor");
                $(selectorContainer+'#' + calenderendId).removeClass("borderColor");
                if(!_.isUndefined(opts.callback) && _.isFunction(opts.callback)){
                    opts.callback(formatDate(beginDate,opts.formatString),formatDate(endDate,opts.formatString));
                }
            }        
        })
    }

    function getRanderId(){
        var randerId = "time_date_"+_autoInc;
        _autoInc ++;
        return randerId;
    }

    function formatDate(date,format){
        var yy = date.getFullYear();
        var mm = date.getMonth() + 1;
        mm = mm < 10? '0'+mm :mm;
        var dd = date.getDate();
        dd = dd < 10? '0' +dd :dd;
        var hh = date.getHours();
        hh = hh < 10? '0' +hh :hh;
        var m = date.getMinutes();
        m = m < 10? '0' +m :m;
        var ss = date.getSeconds();
        ss = ss < 10? '0' +ss :ss;
        if(format.toUpperCase() == "YYYY-MM-DD HH:MM:SS"){
            return yy +"-" + mm +"-" +dd + " "+hh+":"+m+":"+ss;
        }
        else if(format.toUpperCase() == "YYYY-MM-DD"){
            return yy +"-" + mm +"-" +dd;
        }else if(format.toUpperCase() == "YYYY-MM"){
            return yy +"-" + mm;
        }else if(format.toUpperCase() == "YYYY"){
            return yy;
        }
    }

    function buildRange(opts) {
        if(!opts.containerId){
            opts.containerId = getRanderId();
            // opts.container = $(opts.container).selector +" #"+opts.containerId;
            _instance.opts = opts;
        }
        var containerId = $(opts.container).selector;
        var inputWidth = opts.width || '250px';
        var inputHeight = opts.height || '30px';
        var inputstyle = 'width:' + inputWidth + ';height:' + inputHeight + ';line-height:' + inputHeight;
        var buttonstyle = 'height:' + inputHeight;
        var needDelStyle = opts.needDel==true ||_.isUndefined(opts.needDel)? '<span class="dataTimeDel">&times;</span>':'';
        console.log(inputstyle);

        console.log($(_instance.opts.container));
        $(_instance.opts.container).html('<div class="dateTimeRangeGroup" id="'+opts.containerId+'"><input class="datetimePickerComponent datetimePickerInput"' +
            'style=' + inputstyle + ' readonly />' + needDelStyle+'</div>');
        $(_instance.opts.container).on("click", "#"+opts.containerId+" .datetimePickerInput", function(e) {
            e.preventDefault();
            buildDialog(opts)
        });
        $(_instance.opts.container).on("click", "#"+opts.containerId+" .dataTimeDel", function(e) {
            e.preventDefault();
            delRange(opts);
        });

        if(opts.startTime && opts.endTime){
            var thisContainer = opts.container.selector;
            $(thisContainer +" #"+opts.containerId +" .datetimePickerInput").attr("beginTime", opts.startTime);
            $(thisContainer +" #"+opts.containerId +" .datetimePickerInput").attr("endTime", opts.endTime);
            $(thisContainer +" #"+opts.containerId +" .datetimePickerInput").val(opts.startTime + "~" + opts.endTime);
            if(!_.isUndefined(opts.callback) && _.isFunction(opts.callback)){
                opts.callback( $(thisContainer +" #"+opts.containerId + " .datetimePickerInput").val());
            }
        };
        return _instance;
    }

    function buildSingle(opts) {
        if(!opts.containerId){
            opts.containerId = getRanderId();
            _instance.opts = opts;
        }
        var containerId = $(opts.container).selector;
        var singleId = containerId +" #"+opts.containerId+" .dataTimeSingle";
        var inputWidth = opts.width || '250px';
        var inputHeight = opts.height || '30px';
        var buttonstyle = 'height:' + inputHeight;
        var formatString = _instance.opts.formatString || 'yyyy/MM/dd HH:mm:ss';
        var value = opts.value || '';
        var needDelStyle = opts.needDel==true ||_.isUndefined(opts.needDel)? '<span class="dataTimeDel">&times;</span>':'';
        // $(opts.container).empty();
        $(_instance.opts.container).html('<div class="datetimeSingleGroup" id="'+opts.containerId+'"><div class="dataTimeSingle"></div>'+needDelStyle+'</div>');

        $(singleId).jqxDateTimeInput({
            width: inputWidth,
            height: inputHeight,
            formatString: formatString,
            showCalendarButton: false,
        });

        $(singleId).on('valueChanged',function(event){
            var value = event.args.date;
            if(!_.isUndefined(opts.callback) && _.isFunction(opts.callback))
                opts.callback(formatDate(value,opts.formatString));
                    
        })
        $(singleId).jqxDateTimeInput('setDate',value);

        $(_instance.opts.container).on("click", ".dataTimeDel", function(e) {
            e.preventDefault();
            delSingle(opts);
        });
    }

    function delRange(opts) {
        var containerId = opts.container.selector;
        var inputId = containerId + " .datetimePickerInput";
        $(inputId).attr("beginTime", "");
        $(inputId).attr("endTime", "");
        $(inputId).val("");
    }

    function delSingle(opts) {
        var containerId = $(opts.container).selector;
        var singleId = containerId + " .dataTimeSingle";
        $(singleId).jqxDateTimeInput('setDate','');
    }

    function getDateTimeRange(opts) {
        _instance.opts = opts;

        var containerId = opts.container.selector;
        var inputId = containerId + " .datetimePickerInput";
        var singleId = containerId + " .dataTimeSingle";
        var beginTime = $(inputId).attr("beginTime") || "";
        var endTime = $(inputId).attr("endTime") || "";
        var singleTime = $(singleId).val();
        var range;
        var valReturn;
        if (beginTime == "" || endTime == "") {
            range = "";
        } else {
            range = beginTime + "~" + endTime;
        }
        switch (opts.type) {
            case 'single':
                valReturn = singleTime;
                break;
            case 'begin':
                valReturn = beginTime;
                break;
            case 'end':
                valReturn = endTime;
                break;
            case 'range':
                valReturn = range;
                break;
            default:
                valReturn = range;
                break;
        }
        return valReturn;
    }

    function setDateTimeRange(opts) {
        _instance.opts = opts;
        var containerId = opts.container.selector;
        switch (opts.type) {
            case 'single':
                var singleId = containerId + " .dataTimeSingle";
                var singleTime = opts.singleTime;
                console.log($(singleId));
                $(singleId).jqxDateTimeInput('setDate', singleTime);
                break;
            case 'range':
                var inputId = containerId + " .datetimePickerInput";

                var beginTime = opts.beginTime; //$(inputId).attr("beginTime") || "";
                var endTime = opts.endTime; //$(inputId).attr("endTime") || "";
                $(inputId).attr("beginTime", beginTime);
                $(inputId).attr("endTime", endTime);
                $(inputId).val(beginTime + '~' + endTime)
                break;
            default:
                var inputId = containerId + " .datetimePickerInput";

                var beginTime = opts.beginTime; //$(inputId).attr("beginTime") || "";
                var endTime = opts.endTime; //$(inputId).attr("endTime") || "";
                $(inputId).attr("beginTime", beginTime);
                $(inputId).attr("endTime", endTime);
                $(inputId).val(beginTime + '~' + endTime)
                break;
        }
    }

    function buildTime(opt, rangeInput) {
        // console.log(_instance)
        var formatString = rangeInput.formatString || 'yyyy/MM/dd HH:mm:ss'
        var timebeginId = opt + '_beginTime';
        var timeendId = opt + '_endTime';
        $('#' + opt).append('<div style="margin-bottom:10px;"><div style="float:left;line-height:27px;margin:0 20px 0 20px;">开始时间</div><div id=' + timebeginId + '></div></div>');
        $('#' + opt).append('<div><div style="float:left;line-height:27px;margin:0 20px 0 20px;">结束时间</div><div id=' + timeendId + '></div></div>')
        $('#' + timebeginId).jqxDateTimeInput({
            width: '200px',
            height: '25px',
            formatString: formatString,
            showCalendarButton: false,
        });
        $('#' + timeendId).jqxDateTimeInput({
            width: '200px',
            height: '25px',
            formatString: formatString,
            showCalendarButton: false,
        });
        
        getDialogDate(rangeInput, timebeginId, timeendId)
    }

    function getDialogDate(rangeInput, timebeginId, timeendId) {
        var _rangeInput = rangeInput.container.selector +" #"+rangeInput.containerId+ ' .datetimePickerInput'
        console.log(rangeInput);

        var thisdate = new Date();
        var year = thisdate.getFullYear() - 1;
        var month = thisdate.getMonth() + 1;
        var date = thisdate.getDate();
        // var hours = thisdate.getHours();
        // var minutes = thisdate.getMinutes();
        // var seconds = thisdate.getSeconds();
        var thisdatestr = year + ',' + month + ',' + date;

        var _beginTime = $(_rangeInput).attr('beginTime');
        var _endTime = $(_rangeInput).attr('endTime');
        console.log(!_beginTime && !_endTime)
        if (!_beginTime && !_endTime) {
            $('#' + timebeginId).jqxDateTimeInput('setDate', thisdatestr);
        } else {
            $('#' + timebeginId).jqxDateTimeInput('setDate', _beginTime);
            $('#' + timeendId).jqxDateTimeInput('setDate', _endTime)
        }
        // if(_beginTime && _endTime)
    }

    function buildDialog(opts) {
        Dialog.build({
            title: "选择时间",
            content: "<div id='datetimeRangeInput'></div>",
            rightBtnCallback: function() {
                var beginTime = $("#datetimeRangeInput_beginTime").val() //$("#datetimeRangeInput_beginTime").jqxDateTimeInput('val', 'date');
                var endTime = $("#datetimeRangeInput_endTime").val();
                var betweenTime = Date.parse(endTime) - Date.parse(beginTime);
                console.log(!betweenTime)
                if (!betweenTime == true) {
                    Notify.show({
                        type: 'warning',
                        title: '请输入完整的日期时间'
                    })
                } else if (betweenTime <= 0) {
                    Notify.show({
                        type: 'warning',
                        title: '结束时间需要大于开始时间'
                    })
                } else {
                    // var inputId = "_instance.opts.container" + $(_instance.opts.container)[0].id;
                    //$("#" + inputId).attr("beginTime", beginTime);
                    console.log(opts.container.selector)
                    var thisContainer = opts.container.selector;
                    $(thisContainer +" #"+opts.containerId+" .datetimePickerInput").attr("beginTime", beginTime);
                    $(thisContainer +" #"+opts.containerId+ " .datetimePickerInput").attr("endTime", endTime);
                    if (beginTime == "" || endTime == "") {} else {
                        $(thisContainer +" #"+opts.containerId+ " .datetimePickerInput").val(beginTime + "~" + endTime);
                        if(!_.isUndefined(opts.callback) && _.isFunction(opts.callback)){
                            opts.callback(beginTime + "~" + endTime);
                        }
                    }
                    Dialog.dismiss();
                }
            }
        }).show(function() {
            buildTime("datetimeRangeInput", opts);
        });
    }

    return _instance = {
        build: build,
        getDateTimeRange: getDateTimeRange,
        setDateTimeRange: setDateTimeRange
    };
});