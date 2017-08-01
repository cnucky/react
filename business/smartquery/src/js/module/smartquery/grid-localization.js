define('./grid-localization', [], function() {
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
                    todaystring: "Today"
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

    function calcBestColumnWidth(jqxGrid) {
        var time1 = Date.now();
        $(jqxGrid).jqxGrid('beginupdate');
        var columns = $(jqxGrid).jqxGrid('columns');

        var oldWidthArray = [];
        _.each(columns.records, function (column) {
            var oldWidth = $(jqxGrid).jqxGrid('getcolumnproperty', column.displayfield, 'width');
            oldWidthArray.push({
                datafield:  column.displayfield,
                width:oldWidth,
            });
        });

        $(jqxGrid).jqxGrid('autoresizecolumns');
        $(jqxGrid).jqxGrid({ columnsautoresize: false});

        _.each(columns.records, function (column) {
            var oldWidth = _.find(oldWidthArray, function(width){
                return width.datafield == column.displayfield;
            }).width;

            var newWidth = $(jqxGrid).jqxGrid('getcolumnproperty', column.displayfield, 'width');
            newWidth = newWidth > 350 ? 350 : newWidth;
            //$(jqxGrid).jqxGrid('setcolumnproperty', column.displayfield, 'minwidth', 0);
            $(jqxGrid).jqxGrid('setcolumnproperty', column.displayfield, 'width', newWidth > oldWidth ? newWidth : oldWidth);
        });

        $(jqxGrid).jqxGrid('endupdate');
        console.log('calcBestColumnWidth'+(Date.now() - time1)+ 'ms');
    }

    return {
        getLocalization: getLocalization,
        calcBestColumnWidth: calcBestColumnWidth,
    }

})