define('widget/jqx-binding', ['udp-file-util', 'nova-notify', 'moment', 'utility/loaders', ], function(udpFileUtil, Notify, moment, loader) {

    var _datafields;
    var _resultCount;
    var _taskId;
    var _state;
    var _selectCount = 0;
    var _loadedCount = 0;
    var _recordsLabel;

    var data;
    var source;

    function constructSource(result, searchKeyword) {
        var datafields = constructDataFields(result);
        data = constructdata(result, datafields, searchKeyword)
        return {
            localdata: data,
            datafields: datafields,
            datatype: "array",
            sort:customsortfunc
        };
    }

    function constructVirtualSource(taskID, resultData) {
        var datafields = constructDataFields(resultData);
        var source = {
            //localdata: {},
            datatype: "json",
            type: "GET",
            url: "/smartquery/getintelligentqueryresult",
            data: {
                taskId: taskID,
                needMeta: 1,
                startIndex: 1,
                length: 1000
            },
            datafields: constructDataFields(resultData),
            totalrecords: 5000,
        };
    }

    function constructdata(result, datafields, searchKeyword) {
        var dataArr = new Array();

        var records = result.records;
        for (var i = 0; i < records.length; i++) {
            var row = {};
            var record = records[i];
            for (var j = 0; j < datafields.length; j++) {
                var field = datafields[j];
                //console.log("field.name.toLowerCase() == 'filename'", field);

                var dateformat = undefined;
                switch (field.type.toLowerCase()) {
                    // case 'date':
                    //     dateformat = "YYYY-MM-DD";
                    //     break;
                    // case 'datetime':
                    //     dateformat = "YYYY-MM-DD HH:mm:ss";
                    //     break;
                    default:
                        break;
                }
                var data = record[j];
                if (dateformat) {
                    if(data){
                        var formatDate = moment(data).format(dateformat);
                        //console.log("j", j);
                        //console.log("formatDate", formatDate);
                        row[field.name] = formatDate == 'Invalid date' ? '' : formatDate;
                        //console.log("row[field.name]", row[field.name]);
                    }
                    else
                        row[field.name] = '';
                }
                else {
                    //if(data == 'NULL')
                    //    row[field.name] = '';
                    //else{
                    //    //console.log("data", data);
                    //    //row[field.name] = data == 'NULL' ? '' : data;
                    //
                    //    data = String(data);
                    //    if(field.name.toLowerCase() == 'filename'){
                    //        row[field.name] = data;
                    //    }
                    //    else{
                    //        var keySplitArray = data.split(searchKeyword);
                    //        row[field.name] = '';
                    //        for(var z=0; z<keySplitArray.length; ++z){
                    //            if(z >= keySplitArray.length-1)
                    //            {
                    //                row[field.name] += keySplitArray[z];
                    //                //row[field.name] += '<lable style="color: orangered">' + searchKeyword + '</lable>';
                    //            }
                    //            else
                    //            {
                    //                row[field.name] += keySplitArray[z];
                    //                row[field.name] += '<lable style="color: orangered">' + searchKeyword + '</lable>';
                    //            }
                    //        }
                    //    }
                    //}

                    row[field.name] = data == 'NULL' ? '' : data;
                    //console.log("else row[field.name]", row[field.name]);
                }
            }
            dataArr.push(row);
        }
        //console.log("dataArr", dataArr);
        return dataArr;
    }

    function constructColumns(result) {
        var columns = new Array();

        var className;
        className = 'jqx-filename-cell';

        //if (
        //    _.findWhere(result.meta, {
        //        name: 'FILENAME'
        //    }) != undefined /*&& _.findWhere(result.meta, {
        //        name: 'INTERCEPT_TIME'
        //    }) != undefined*/) {
        //    className = 'jqx-filename-cell';
        //}

        for (var i = 0; i < result.meta.length; i++) {
            var column = {};
            var obj = result.meta[i];
            column.datafield = obj.name;
            column.text = obj.caption;
            column.width = 150;
            column.minwidth = 100;
            // column.maxwidth = 200;

            if (obj.name.toLowerCase() == 'filename' && className) {
                console.log(className);
                column.cellclassname = className;
                column.editable = false;
            }

            switch (obj.type.toLowerCase()) {
                // case 'date':
                //     column.cellsformat = 'yyyy-MM-dd';
                //     column.datatype = 'date';
                //     column.filtertype = 'range';
                //     break;
                // case 'datetime':
                //     column.cellsformat = 'yyyy-MM-dd HH:mm:ss';
                //     column.datatype = 'datetime';
                //     break;
                case 'decimal':
                    column.datatype = 'text';
                    break;
                case 'date':
                case 'datetime':
                case 'string':
                default:
                    column.datatype = 'string';
                    break;
            }
            column.headertext = obj.caption;

            columns.push(column);
        }
        return columns;
    }

    function constructDataFields(result) {
        var datafields = new Array();
        for (var i = 0; i < result.meta.length; i++) {
            var field = {};
            var obj = result.meta[i];

            field.name = obj.name;

            switch (obj.type.toLowerCase()) {
                // case 'date':
                //     field.type = 'date';
                //     break;
                // case 'datetime':
                //     field.type = 'datetime';
                //     break;
                // case 'decimal':
                // case 'string':
                //     field.type = 'string';
                //     break;
                default:
                    field.type = 'string';
                    break;
            }
            datafields.push(field);
        }
        _datafields = datafields;
        return datafields;
    }

    //对于带<em></em>的字符，在自定义比较函数中删除em
    var customsortfunc = function(column,direction){
        var sortdata = [];
        if(direction == 'ascending') direction = true;
        if(direction == 'descending') direction = false;
        if(direction!=null && data){
            for(var i=0;i<data.length;i++){
                sortdata.push(data[i]);
            }
        }else{
            sortdata = data;
        }
        var tmpToString = Object.prototype.toString; 
        Object.prototype.toString = (typeof column == 'function')?column:function(){return this[column]}

        if(direction!=null && sortdata && sortdata.length>0){
            sortdata.sort(comparer);
            if(!direction){
                sortdata.reverse();
            }
        }
        source.localdata = sortdata;
        $('#dataGrid').jqxGrid('updatebounddata','sort');
        Object.prototype.toString = tmpToString;
    }

    var comparer = function(v1,v2){
        var val1 = filterEM(v1);
        var val2 = filterEM(v2);
        if(val1>val2) return 1;
        if(val1<val2) return -1;
        return 0;
    }

    function filterEM(st){
        if(typeof st != 'string'){
            return st;
        }
        var s = st;
        s.replace(/<em>/gi,'');
        s.replace(/<\/em>/gi,'');
        return s;
    }



    function TryBindResult(container, taskID) {
        var load = loader(container);
        _taskId = taskID;
        var resultdata = {};
        resultdata.records = [];
        resultdata.meta = [];
        $.getJSON('/workspacedir/queryPreference', {
            name: 'maxrecord'
        }).done(function(rsp) {
            var length = 100;
            if (rsp.data != '') {
                length = rsp.data;
            }
            TryBindTotalResult(taskID, 0, length).then(function(rsp) {

                _resultCount = rsp.resultCount;

                jqxDataBinding(container, rsp);
            }).catch(function(err) {
                load.hide();
                $(container).empty().append('<p style="white-space: nowrap; float: left; margin-left: 50%; position: relative; left: -32.5px; top: 269px;">获取结果失败...</p>')
            });
        });

    }

    function TryBindTotalResult(taskID, startIndex, length) {
        var dfd = Q.defer();

        function request() {
            var jqxhr = $.getJSON("/smartquery/getintelligentqueryresult", {
                taskId: taskID,
                needMeta: 1,
                startIndex: startIndex,
                length: length
            }, function(rsp) {
                if (rsp.code == 0) {
                    if (rsp.data && rsp.data.taskRatio == 100) {
                        loaded = !_.isEmpty(rsp.data);
                        dfd.resolve(rsp.data);
                    }
                    else if (rsp.data.taskStatus == 'error') {
                        dfd.reject({
                            progress: undefined,
                            hints: '查询数据源失败' + (rsp.message ? '：' + rsp.message : '')
                        });
                    }
                    else {
                        rsp = {};
                        setTimeout(function() {
                            request()
                        }, 50);
                    }
                }
                else {
                    dfd.reject({
                        progress: undefined,
                        hints: '查询数据源失败' + (rsp.message ? '：' + rsp.message : '')
                    });
                }
            });
        }
        request();


        return dfd.promise;
    }

    function jqxDataBinding(container, resultdata, searchKeyword) {
        var containerId = '#dataGrid';
        $(containerId).remove();

        $(container).html('<div id="dataGrid" style="display:none;border:1px solid #DDD; margin-top: -20px; margin-left: -20px;"></div>');
        $(containerId).show();

        $(containerId).jqxGrid('clearfilters');
        $(containerId).jqxGrid('clearselection');
        $(containerId).jqxGrid('clear');

        columns = constructColumns(resultdata);
        source = constructSource(resultdata, searchKeyword);
        var dataAdapter = new $.jqx.dataAdapter(source, {
            formatData: function(data) {
                data.name_startsWith = $("#search-input").val();
                return data;
            }
        });

        gridEvent(containerId);

        $(containerId).jqxGrid({
            source: dataAdapter,
            columns: columns,
            sortable: true,
            //  pageable: true,
            columnsresize: true,
            // pagermode: 'simple',
            theme: 'bootstrap',
            autoshowfiltericon: true,
            width: '100%',
            height: '100%',
            clipboard: true,
            editable: true,
            editmode: 'selectedcell',
            //    pagesize: 1000,
            selectionmode: 'checkbox',
            keyboardnavigation: true,
            localization: getLocalization("ch"),
            rendered: function() {
                hideLoader();
                //$(containerId).jqxGrid('autoresizecolumn', 'from', 'all');


                /* edit by hjw  */
                // _.each(columns, function(column) {
                //     $(containerId).jqxGrid('autoresizecolumn', column.datafield, 'all');
                // });
                $(containerId).jqxGrid('autoresizecolumns', 'all');
            },

            //showstatusbar: false,
            //renderstatusbar: function(statusbar) {
            //    // appends buttons to the status bar.
            //    var container = $("<div style='overflow: hidden; position: relative; margin: 5px;'></div>");
            //    var searchButton = $("<button id ='searchButton' style='float: left; margin-left: 5px;'><span class='fa fa-angle-double-right' style='margin-left: 4px; position: relative; '>下一批</span></button>");
            //    var LoadingTip = $("<span id='loadingTip' style='display:none;margin-left: 4px; position: relative; top: 4px;'>正在获取数据，请稍等...</span>");
            //    _recordsLabel = $("<div id='recordsLabel' style='margin-right: 7px; float: right; margin-left: 0px;'></div>");
            //    _loadedCount = $(containerId).jqxGrid('getrows').length;
            //    //  var selectCount = $(containerId).jqxGrid('getselectedrowindex').length;
            //
            //    _recordsLabel.text('当前 ' + _loadedCount + ' 选中 ' + _selectCount + ' 共 ' + _resultCount)
            //    container.append(searchButton);
            //    container.append(LoadingTip);
            //    container.append(_recordsLabel);
            //    statusbar.append(container);
            //   // _state = $(containerId).jqxGrid('savestate');
            //    $('#searchButton').on('click', function(event) {
            //      //   $(containerId).jqxGrid('loadstate', _state);
            //        $('#searchButton').attr('disabled', 'disabled');
            //        $('#loadingTip').show();
            //        var startIndex = $(containerId).jqxGrid('getboundrows').length;
            //        TryBindTotalResult(_taskId, startIndex, 10000).then(function(rsp) {
            //            $('#searchButton').removeAttr('disabled');
            //            $(containerId).jqxGrid('addrow', null, constructdata(rsp, constructDataFields(rsp)));
            //            _loadedCount = $(containerId).jqxGrid('getrows').length;
            //            _recordsLabel.text('当前 ' + _loadedCount + ' 选中 ' + _selectCount + ' 共 ' + _resultCount);
            //            $('#loadingTip').hide();
            //        });
            //    });
            //}

        });
    }

    function getRecordCount(){

        return _resultCount;
    }

    function gridEvent(containerId) {
        $(containerId).on("pagechanged", function(event) {
            $(containerId).jqxGrid('autoresizecolumns');
        });
        $(containerId).on("groupschanged", function(event) {
            $(containerId).jqxGrid('autoresizecolumns');
        });
        $(containerId).on("groupcollapse", function(event) {
            $(containerId).jqxGrid('autoresizecolumns');
        });

        $(containerId).on("groupexpand", function(event) {
            $(containerId).jqxGrid('autoresizecolumns');

        });
        $(containerId).on("filter", function(event) {
            $(containerId).jqxGrid('autoresizecolumns');
             _selectCount = $("#dataGrid").jqxGrid('selectedrowindexes').length;
            _loadedCount = $("#dataGrid").jqxGrid('getrows').length;

            _recordsLabel.text('当前 ' + _loadedCount + ' 选中 ' + _selectCount + ' 共 ' + _resultCount);

        });

        $(containerId).on("rowselect", function(event) {
            //_selectCount = $(containerId).jqxGrid('selectedrowindexes').length;
            //_recordsLabel.text('当前 ' + _loadedCount + ' 选中 ' + _selectCount + ' 共 ' + _resultCount)
        });


        $(containerId).on('cellclick', function(event) {
            console.log("event.args.value", event.args.value);
            var value = event.args.value;
            //value.r
            if (event.args.datafield.toLowerCase() == 'filename') { //== 'FILENAME'
                event.preventDefault();

                var data = {
                    fileName: event.args.value,
                    //interceptTime: event.args.row.bounddata.INTERCEPT_TIME,
                }
                var opts = {};
                opts.fileName = data.fileName;
                opts.uuidName = data.fileName;
                udpFileUtil.downloadFile(opts);
            }
        })

        $(containerId).on('rowdoubleclick', function(event) {
            var bounddata = event.args.row.bounddata;
            var gridColumns = $(containerId).jqxGrid('columns');
            var displayNameMap = {};
            _.each(gridColumns.records, function(col) {

                if (col.displayfield != null) {
                    displayNameMap[col.displayfield] = col.text;
                }
            })
            var data = [];
            var i = 0;
            for (var item in bounddata) {
                var row = {};
                var text = displayNameMap[item]
                if (text != null) {
                    row['key'] = text;
                    row['value'] = bounddata[item];
                    data[i] = row;
                    i++;
                }
            }

            var source2 = {
                localdata: data,
                datafields: [{
                    name: 'key',
                    type: 'string'
                }, {
                    name: 'value',
                    type: 'string'
                }],
                datatype: "array"
            };
            var columns = [{
                text: '名称',
                columntype: 'textbox',
                datafield: 'key'
            }, {
                text: '值',
                columntype: 'textbox',
                datafield: 'value'
            }]

            var detailAdapter = new $.jqx.dataAdapter(source2);

            $("#detail").jqxGrid({
                source: detailAdapter,
                columns: columns,
                columnsresize: true,
                theme: 'arctic',
                width: '100%',
                clipboard: true,
                // editable: false,
                editable:true,
                // editmode: 'dblclick',
                editmode:'selectedcell',
                selectionmode: 'multiplecellsadvanced',
                localization: getLocalization("ch"),
                rendered: function() {
                    //$("#detail").jqxGrid('autoresizecolumns');
                    _.each(columns, function(column) {
                        $("#detail").jqxGrid('autoresizecolumn', column.datafield, 'all');
                    });
                }
            });

            $.magnificPopup.open({
                removalDelay: 500, //delay removal by X to allow out-animation,
                items: {
                    src: $('#modal-form')
                },
                callbacks: {
                    beforeOpen: function(e) {}
                },
                midClick: true
            });
        });

    }

    function getLocalization(culture) {
        var localization = null;
        switch (culture) {
            case "ch":
                localization = {
                    // separator of parts of a date (e.g. '/' in 11/05/1955)
                    '/': "/",
                    // separator of parts of a time (e.g. ':' in 05:44 PM)
                    ':': ":",
                    // the first day of the week (0 = Sunday, 1 = Monday, etc)
                    firstDay: 0,
                    days: {
                        // full day names
                        names: ["日", "一", "二", "三", "四", "五", "六"],
                        // abbreviated day names
                        namesAbbr: ["日", "一", "二", "三", "四", "五", "六"],
                        // shortest day names
                        namesShort: ["日", "一", "二", "三", "四", "五", "六"]
                    },
                    months: {
                        // full month names (13 months for lunar calendards -- 13th month should be "" if not lunar)
                        names: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月", ""],
                        // abbreviated month names
                        namesAbbr: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月", ""]
                    },
                    // AM and PM designators in one of these forms:
                    // The usual view, and the upper and lower case versions
                    //      [standard,lowercase,uppercase]
                    // The culture does not use AM or PM (likely all standard date formats use 24 hour time)
                    //      null
                    AM: ["AM", "am", "AM"],
                    PM: ["PM", "pm", "PM"],
                    eras: [
                        // eras in reverse chronological order.
                        // name: the name of the era in this culture (e.g. A.D., C.E.)
                        // start: when the era starts in ticks (gregorian, gmt), null if it is the earliest supported era.
                        // offset: offset in years from gregorian calendar
                        {
                            "name": "A.D.",
                            "start": null,
                            "offset": 0
                        }
                    ],
                    twoDigitYearMax: 2029,
                    patterns: {
                        // short date pattern
                        d: "M/d/yyyy",
                        // long date pattern
                        D: "dddd, MMMM dd, yyyy",
                        // short time pattern
                        t: "h:mm tt",
                        // long time pattern
                        T: "h:mm:ss tt",
                        // long date, short time pattern
                        f: "dddd, MMMM dd, yyyy h:mm tt",
                        // long date, long time pattern
                        F: "dddd, MMMM dd, yyyy h:mm:ss tt",
                        // month/day pattern
                        M: "MMMM dd",
                        // month/year pattern
                        Y: "yyyy MMMM",
                        // S is a sortable format that does not vary by culture
                        S: "yyyy\u0027-\u0027MM\u0027-\u0027dd\u0027T\u0027HH\u0027:\u0027mm\u0027:\u0027ss",
                        // formatting of dates in MySQL DataBases
                        ISO: "yyyy-MM-dd hh:mm:ss",
                        ISO2: "yyyy-MM-dd HH:mm:ss",
                        d1: "dd.MM.yyyy",
                        d2: "dd-MM-yyyy",
                        d3: "dd-MMMM-yyyy",
                        d4: "dd-MM-yy",
                        d5: "H:mm",
                        d6: "HH:mm",
                        d7: "HH:mm tt",
                        d8: "dd/MMMM/yyyy",
                        d9: "MMMM-dd",
                        d10: "MM-dd",
                        d11: "MM-dd-yyyy"
                    },
                    percentsymbol: "%",
                    currencysymbol: "$",
                    currencysymbolposition: "before",
                    decimalseparator: '.',
                    thousandsseparator: ',',
                    pagergotopagestring: "转到:",
                    pagershowrowsstring: "显示行数:",
                    pagerrangestring: " 共 ",
                    pagerpreviousbuttonstring: "上一页",
                    pagernextbuttonstring: "下一页",
                    pagerfirstbuttonstring: "首页",
                    pagerlastbuttonstring: "尾页",
                    groupsheaderstring: "拖拽列到此处进行分组",
                    sortascendingstring: "升序排列",
                    sortdescendingstring: "降序排列",
                    sortremovestring: "移除排序",
                    groupbystring: "根据此列分组",
                    groupremovestring: "Remove from groups",
                    filterclearstring: "清空",
                    filterstring: "过滤",
                    filtershowrowstring: "Show rows where:",
                    filterorconditionstring: "或",
                    filterandconditionstring: "与",
                    filterselectallstring: "(选择所有)",
                    filterchoosestring: "请选择:",
                    filterstringcomparisonoperators: ['为空', '不为空', 'enthalten', 'enthalten(match case)',
                        'does not contain', 'does not contain(match case)', '以..开始', 'starts with(match case)',
                        '以..结尾', 'ends with(match case)', '等于', 'equal(match case)', '为空', '不为空'
                    ],
                    filternumericcomparisonoperators: ['equal', 'not equal', '小于', '小于等于', '大于', '大于等于', '为空', '不为空'],
                    filterdatecomparisonoperators: ['等于', '不等于', '小于', '小于等于', '大于', '大于等于', '为空', '不为空'],
                    filterbooleancomparisonoperators: ['等于', '不等于'],
                    validationstring: "输入值无效",
                    emptydatastring: "无查询结果",
                    filterselectstring: "Select Filter",
                    loadtext: "Loading...",
                    clearstring: "清空",
                    todaystring: "今天"
                }
                break;
            case "en":
            default:
                localization = {
                    // separator of parts of a date (e.g. '/' in 11/05/1955)
                    '/': "/",
                    // separator of parts of a time (e.g. ':' in 05:44 PM)
                    ':': ":",
                    // the first day of the week (0 = Sunday, 1 = Monday, etc)
                    firstDay: 0,
                    days: {
                        // full day names
                        names: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                        // abbreviated day names
                        namesAbbr: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                        // shortest day names
                        namesShort: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
                    },
                    months: {
                        // full month names (13 months for lunar calendards -- 13th month should be "" if not lunar)
                        names: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December", ""],
                        // abbreviated month names
                        namesAbbr: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", ""]
                    },
                    // AM and PM designators in one of these forms:
                    // The usual view, and the upper and lower case versions
                    //      [standard,lowercase,uppercase]
                    // The culture does not use AM or PM (likely all standard date formats use 24 hour time)
                    //      null
                    AM: ["AM", "am", "AM"],
                    PM: ["PM", "pm", "PM"],
                    eras: [
                        // eras in reverse chronological order.
                        // name: the name of the era in this culture (e.g. A.D., C.E.)
                        // start: when the era starts in ticks (gregorian, gmt), null if it is the earliest supported era.
                        // offset: offset in years from gregorian calendar
                        {
                            "name": "A.D.",
                            "start": null,
                            "offset": 0
                        }
                    ],
                    twoDigitYearMax: 2029,
                    patterns: {
                        // short date pattern
                        d: "M/d/yyyy",
                        // long date pattern
                        D: "dddd, MMMM dd, yyyy",
                        // short time pattern
                        t: "h:mm tt",
                        // long time pattern
                        T: "h:mm:ss tt",
                        // long date, short time pattern
                        f: "dddd, MMMM dd, yyyy h:mm tt",
                        // long date, long time pattern
                        F: "dddd, MMMM dd, yyyy h:mm:ss tt",
                        // month/day pattern
                        M: "MMMM dd",
                        // month/year pattern
                        Y: "yyyy MMMM",
                        // S is a sortable format that does not vary by culture
                        S: "yyyy\u0027-\u0027MM\u0027-\u0027dd\u0027T\u0027HH\u0027:\u0027mm\u0027:\u0027ss",
                        // formatting of dates in MySQL DataBases
                        ISO: "yyyy-MM-dd hh:mm:ss",
                        ISO2: "yyyy-MM-dd HH:mm:ss",
                        d1: "dd.MM.yyyy",
                        d2: "dd-MM-yyyy",
                        d3: "dd-MMMM-yyyy",
                        d4: "dd-MM-yy",
                        d5: "H:mm",
                        d6: "HH:mm",
                        d7: "HH:mm tt",
                        d8: "dd/MMMM/yyyy",
                        d9: "MMMM-dd",
                        d10: "MM-dd",
                        d11: "MM-dd-yyyy"
                    },
                    percentsymbol: "%",
                    currencysymbol: "$",
                    currencysymbolposition: "before",
                    decimalseparator: '.',
                    thousandsseparator: ',',
                    pagergotopagestring: "Go to page:",
                    pagershowrowsstring: "Show rows:",
                    pagerrangestring: " of ",
                    pagerpreviousbuttonstring: "previous",
                    pagernextbuttonstring: "next",
                    pagerfirstbuttonstring: "first",
                    pagerlastbuttonstring: "last",
                    groupsheaderstring: "Drag a column and drop it here to group by that column",
                    sortascendingstring: "Sort Ascending",
                    sortdescendingstring: "Sort Descending",
                    sortremovestring: "Remove Sort",
                    groupbystring: "Group By this column",
                    groupremovestring: "Remove from groups",
                    filterclearstring: "Clear",
                    filterstring: "Filter",
                    filtershowrowstring: "Show rows where:",
                    filterorconditionstring: "Or",
                    filterandconditionstring: "And",
                    filterselectallstring: "(Select All)",
                    filterchoosestring: "Please Choose:",
                    filterstringcomparisonoperators: ['empty', 'not empty', 'enthalten', 'enthalten(match case)',
                        'does not contain', 'does not contain(match case)', 'starts with', 'starts with(match case)',
                        'ends with', 'ends with(match case)', 'equal', 'equal(match case)', 'null', 'not null'
                    ],
                    filternumericcomparisonoperators: ['equal', 'not equal', 'less than', 'less than or equal', 'greater than', 'greater than or equal', 'null', 'not null'],
                    filterdatecomparisonoperators: ['equal', 'not equal', 'less than', 'less than or equal', 'greater than', 'greater than or equal', 'null', 'not null'],
                    filterbooleancomparisonoperators: ['equal', 'not equal'],
                    validationstring: "Entered value is not valid",
                    emptydatastring: "No data to display",
                    filterselectstring: "Select Filter",
                    loadtext: "Loading...",
                    clearstring: "Clear",
                    todaystring: "Today"
                }
                break;
        }
        return localization;
    }

    return {
        jqxDataBinding: jqxDataBinding,
        TryBindResult: TryBindResult,
        constructSource: constructSource,
        constructColumns: constructColumns,
        getRecordCount:getRecordCount
    }

})