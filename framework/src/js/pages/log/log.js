initLocales(require.context('../../../locales/system-manage', false, /\.js/));
require([
    '../../widget/department-tree',
    '../../tpl/log/tpl-department-log-table',
    '../../widget/jc-datetimepicker',
    'nova-dialog',
    'nova-notify',
    'jquery',
    'underscore',
    'moment',
    '../../../../utils/util',
    'utility/color-util/color-util',
    'utility/loaders',
    'utility/jquery/jqmaskedinput',
    'utility/bootstrap/bootstrap-maxlength',
    'utility/multiselect/bootstrap-multiselect'
], function(Tree, tplDepartmentTable, Datetimepicker, Dialog, Notify, $, _, moment, Util, ColorUtil, Loader) {
    hideLoader();

    tplDepartmentTable = _.template(tplDepartmentTable);

    var _moduleTypesTree;
    var _moduleArray;
    var _departmentListData;
    var jqxhr;

    var queryParams = {};
    queryParams.selectedModuleTypesID = [];
    queryParams.selectedDepartment = [];
    queryParams.chartsSelectedModulesTypesID = [];

    // 初始化操作
    initModuleTypes();
    initDepartment();
    _daterangeInput('lastyear');

    $('#modueltypes-multiselect-for-charts').multiselect({
            maxHeight: 300,
            enableFiltering: true,
            enableCollapsibleOptGroups: true,
            enableClickableOptGroups: true,
            nonSelectedText: '未选择模块',
            nSelectedText: '个模块已选择',
            allSelectedText: '全选',
            selectAllText: '全选',
            buttonWidth: '190px',
            buttonClass: 'multiselect dropdown-toggle btn btn-sm btn-primary',
            includeSelectAllOption: true,
            onChange: function(option, checked, select) {
                if (option) {
                    if (checked) {
                        queryParams.chartsSelectedModulesTypesID.push(parseInt(option.val()));
                    } else {
                        queryParams.chartsSelectedModulesTypesID.splice(_.indexOf(queryParams.chartsSelectedModulesTypesID, parseInt(option.val())), 1);
                    }
                    if(!_.isEmpty(queryParams.chartsSelectedModulesTypesID)) {
                        getChartData('lineonly', queryParams.chartsSelectedModulesTypesID, queryParams.unit, queryParams.startTime, queryParams.endTime);
                    }
                } else {
                    if (checked) {
                        queryParams.chartsSelectedModulesTypesID = getALLModuleTypesID();
                        getChartData('lineonly', [0], queryParams.unit, queryParams.startTime, queryParams.endTime);
                    } else {
                        queryParams.chartsSelectedModulesTypesID = [];
                        notifyEmptyModuleTypes();
                    }
                }
            }
        });

    function initModuleTypes() {
        $('#modueltypes-multiselect').multiselect({
            maxHeight: 300,
            enableFiltering: true,
            enableCollapsibleOptGroups: true,
            enableClickableOptGroups: true,
            nonSelectedText: '未选择模块',
            nSelectedText: '个模块已选择',
            allSelectedText: '全选',
            selectAllText: '全选',
            buttonWidth: '190px',
            buttonClass: 'multiselect dropdown-toggle btn btn-sm btn-primary',
            includeSelectAllOption: true,
            onChange: function(option, checked, select) {
                if (option) {
                    if (checked) {
                        queryParams.selectedModuleTypesID.push(parseInt(option.val()));
                    } else {
                        queryParams.selectedModuleTypesID.splice(_.indexOf(queryParams.selectedModuleTypesID, parseInt(option.val())), 1);
                    }
                    return;
                }
                if (checked) {
                    queryParams.selectedModuleTypesID = getALLModuleTypesID();
                } else {
                    queryParams.selectedModuleTypesID = [];
                }

            }
        });

        $.getJSON('/log/getmoduletypes', function(rsp) {
            if (rsp.code !== 0) {
                Notify.show({
                    title: "获取模块数据失败",
                    message: rsp.message,
                    type: "error"
                });
            } else {
                _moduleTypesTree = rsp.data;
                _moduleArray = [];
                _.each(_moduleTypesTree,function(item){
                    if (item.children) {
                        _.each(item.children,function(type){
                            _moduleArray.push(type);
                        });
                    } else {
                        _moduleArray.push(item);
                    }
                })
                // 初始化使用量统计的选项
                $('#modueltypes-multiselect').multiselect('dataprovider', _moduleTypesTree).multiselect('selectAll', false).multiselect('updateButtonText');
                queryParams.selectedModuleTypesID = getALLModuleTypesID();

                // 初始化统计图的选项
                initChartsOptions(_moduleTypesTree);
            }
        });
    }

    function initDepartment() {
        $.getJSON('/department/list',{roleType:3}, function(rsp) {
            if (rsp.code !== 0) {
                Notify.show({
                    title: "获取部门数据失败",
                    message: rsp.message,
                    type: "error"
                });
            } else {
                _departmentListData = rsp.data;
            }
        });
    }

    function getALLModuleTypesID() {
        return _.map(_moduleArray, function (module) {
            return module.value;
        });
    }

    $('#department').on('click', function(e) {
        e.preventDefault();

        Dialog.build({
            title: '选择部门',
            content: "<div id='department-picker'> 加载中... </div>",
            rightBtnCallback: function(e) {
                e.preventDefault();

                var selectedNode = $('#department-picker').fancytree('getTree').getSelectedNodes();
                if (selectedNode) {
                    $('#department-input').val('已选 ' + _.size(selectedNode) + ' 个部门');
                    queryParams.selectedDepartment = getSelectedNodeID(selectedNode);
                }
                $.magnificPopup.close();
            }
        }).show(function() {
            $('#department-picker').empty();
            Tree.build({
                container: $('#department-picker'),
                selectMode: 2,
                checkbox: true,
                expandAll: true,
                source: _departmentListData,
                select: function(event, data) {
                    var isSelected = data.node.isSelected();
                    data.node.setSelected(isSelected);
                    _.each(data.node.children, function(child) {
                        child.setSelected(isSelected);
                    });
                }
            });
            if (!_.isEmpty(queryParams.selectedDepartment)) {
                var tree = $('#department-picker').fancytree('getTree');
                _.each(queryParams.selectedDepartment, function(item) {
                    var node = tree.getNodeByKey('dep-' + item.departmentId.toString());
                    node.setSelected(true);
                });
            }
        });
    })

    function getSelectedNodeID(node) {
        var selectedNodes = [];
        _.each(node, function(item) {
            selectedNodes.push(item.data);
        })
        return selectedNodes;
    }

    function _daterangeInput(startday) {
        Datetimepicker.init(startday);
        $('.custom').mask('9999/99/99-9999/99/99');
        $('input[maxlength]').maxlength({
            threshold: 21,
            placement: 'right'
        });
    }

    $('#search-log').on('click', function(e) {
        var time = $('#date-range-input').val().split('-');
        queryParams.startTime = time[0].replace(/\//g, '-') + ' 00:00:00';
        queryParams.endTime = time[1].replace(/\//g, '-') + ' 23:59:59';

        if (_.isEmpty(queryParams.selectedModuleTypesID)) {
            Notify.show({
                title: '至少选择一个模块',
                type: 'error'
            });
            return;
        }
        if (_.isEmpty(queryParams.selectedDepartment)) {
            Notify.show({
                title: '至少选择一个部门',
                type: 'error'
            });
            return;
        }
        var selectedDepIds = _.map(queryParams.selectedDepartment, function (dep) {
            return dep.departmentId;
        });

        var loader = Loader('#log-div');
        $.getJSON('/log/getdeptlogcount', {
            departmentlist: selectedDepIds,
            moduletypelist: queryParams.selectedModuleTypesID,
            starttime: queryParams.startTime,
            endtime: queryParams.endTime
        }, function(rsp) {
            loader.hide();
            if (rsp.code !== 0) {
                $('#log-div').html('<label class="control-label pln col-md-3">查询日志失败' + (rsp.message ? '：' + rsp.message : '') + '</label>');
                return;
            }

            var formatDeptLogData = rsp.data;

            var uniqmoduleTypesIDlist = {};
            _.each(formatDeptLogData, function(item) {
                var list = Util.toInt(Object.keys(item.module));
                _.each(list, function(moduleItem) {
                    uniqmoduleTypesIDlist[moduleItem] = true;
                });
                var origData = _.find(queryParams.selectedDepartment, function (dep) {
                    return dep.departmentId == item.id;
                });
                if (origData) {
                    item.parentId = origData.parentDepartmentId;
                }
            });

            var moduleTypeNames = getmoduleTypesName(_.keys(uniqmoduleTypesIDlist));
            var deptLogTable = tplDepartmentTable({
                moduleTypesName: moduleTypeNames,
                logData: formatDeptLogData
            });
            $('#log-div').html(deptLogTable);

            $('#log-table').DataTable({
                'autoWidth': true,
                'paging': false,
                'ordering': false,
                'info': false,
                'searching': true,
                'lengthMenu': [
                    [10, 25, 50, 100, -1],
                    [10, 25, 50, 100, '全部']
                ],
                'scrollX': 400,
                'scrollCollapse': true,
                'language': {
                    'lengthMenu': '每页 _MENU_ 条记录',
                    'zeroRecords': '没有找到',
                    'info': '第 _PAGE_ 页，总 _PAGES_ 页',
                    'infoEmpty': '没有记录',
                    'infoFiltered': '(从 _MAX_ 条记录中过滤)',
                    'search': '搜索：',
                    'emptyTable': '这张表中没有数据',
                    'loadingRecords': '加载中...',
                    'processing': '处理中...',
                    'paginate': {
                        'first': '第一页',
                        'last': '末页',
                        'next': '下一页',
                        'previous': '上一页'
                    },
                    'aria': {
                        'sortAscending': '：升序排序',
                        'sortDescending': '：降序排序'
                    }
                },
                'order': ["2", "asc"],
                'dom': 'Bfrtip',
                'buttons': [{
                    extend: 'csv',
                    text: '导出'
                }]
            });

            $('#log-div .dt-buttons .buttons-csv').attr('id', 'query-export').on('click', function() {
                $.post('/log/recordlog', {
                    moduletype: 420,
                    operationtype: 9,
                    content: '导出日志统计的文件',
                    detailtype: 0
                });
            })

            $('.fixwidth').css('width', '8px');

            $('#log-table tbody').on('click', 'td.collapse-indecator', function() {
                var departmentid = $(this).attr('data-departmentid');
                if ($(this).attr('data-collapse') === 'false') {
                    $(this).parent().siblings('.' + departmentid).show();
                    $(this).attr('data-collapse', 'true');
                    $(this).children('.fa').removeClass('fa-plus').addClass('fa-minus');
                } else {
                    $(this).parent().siblings('.' + departmentid).hide();
                    $(this).attr('data-collapse', 'false');
                    $(this).children('.fa').removeClass('fa-minus').addClass('fa-plus');
                }
            });
        });
    });

    function getmoduleTypesName(list) {
        var moduleTypesName = [];
        _.each(_moduleArray, function(item) {
            _.each(list, function(item0) {
                if (item0 == item.value) {
                    moduleTypesName.push({
                        name: item.label,
                        moduleType: item.value
                    });
                }
            });
        });
        return moduleTypesName;
    }

    function generateHighContrastColors(count) {
        var H;
        var S = 0.75;
        var L = 0.8;
        var out = [];
        var colorRGB, colorHEX;
        var start = 0;
        for (var i = start; i < count; i++) {
            var k = i % 6;
            H = _.random(k * 600 + 80, (k + 1) * 600 - 80) / 3600;
            S = _.random(600, 800) / 1000;
            L = _.random(600, 700) / 1000;
            colorRGB = ColorUtil.hslToRgb(H, S, L);
            colorHEX = ColorUtil.rgbToHex(colorRGB[0], colorRGB[1], colorRGB[2]);
            out.push(colorHEX);
        }
        return out;
    }

    var highColors = generateHighContrastColors(40);

    function initChartsOptions(optGroups) {
        $('#time-period-select').multiselect({
            maxHeight: 300,
            enableFiltering: false,
            buttonWidth: '140px',
            buttonClass: 'multiselect dropdown-toggle btn btn-sm btn-primary',
            onChange: function(option, checked, select) {
                if (checked) {
                    queryParams.selectedTimePeriod = option.val();
                    timePeriodCharts(option.val());
                }
            }
        });
        $('#time-period-select').multiselect('select', 1);
        queryParams.selectedTimePeriod = '1';
        timePeriodCharts('init');


        
        $('#modueltypes-multiselect-for-charts').multiselect('dataprovider', optGroups).multiselect('selectAll', true);
    }

    function notifyEmptyModuleTypes() {
        Notify.show({
            title: '请至少选择一个模块',
            type: 'error'
        });

    }

    function createLineChart(data) {
        var title = data.title || null;
        var series = [];
        if (data.series.length) {
            series = data.series;
        } else {
            Notify.show({
                title: '缺少折线图信息',
                type: 'warning'
            });
        }

        var line = $('#myLineChart');
        if (line.length) {
            $('#myLineChart').highcharts({
                credits: false,
                colors: highColors,
                chart: {
                    backgroundColor: '#f9f9f9',
                    className: 'br-r',
                    type: 'line',
                    zoomType: 'x',
                    panning: true,
                    panKey: 'shift',
                    marginTop: 25,
                    marginRight: 1,
                    height: 260
                },
                title: {
                    text: title
                },
                xAxis: {
                    gridLineColor: '#EEE',
                    lineColor: '#EEE',
                    tickColor: '#EEE',
                    title: {
                        text: "时间"
                    },
                    categories: data.categories
                },
                yAxis: {
                    min: 0,
                    gridLineColor: '#EEE',
                    title: {
                        text: "数量"
                    }
                },
                plotOptions: {
                    spline: {
                        lineWidth: 3
                    },
                    area: {
                        fillOpacity: 0.2
                    }
                },
                legend: {
                    enabled: false
                },
                series: series
            });
        }
    }

    function dealLineChartData(data) {
        var series = [];
        _.each(data, function(module) {
            var name = "数量";
            _.each(_moduleArray, function(amap) {
                if (amap.value == module.moduleType) {
                    name = amap.label;
                }
            });
            var info = {
                name: name,
                data: module.count
            };
            series.push(info);
        });

        var categories;
        if (queryParams.selectedTimePeriod === '1') {
            categories = [moment().subtract(7, 'day').format('YYYY/MM/DD'), moment().subtract(6, 'day').format('YYYY/MM/DD'),
                moment().subtract(5, 'day').format('YYYY/MM/DD'), moment().subtract(4, 'day').format('YYYY/MM/DD'),
                moment().subtract(3, 'day').format('YYYY/MM/DD'), moment().subtract(2, 'day').format('YYYY/MM/DD'),
                moment().subtract(1, 'day').format('YYYY/MM/DD'), moment().subtract(0, 'day').format('YYYY/MM/DD')
            ];
        } else if (queryParams.selectedTimePeriod === '3') {
            categories = [moment().subtract(30, 'day').format('YYYY/MM/DD') + '-' + moment().subtract(21, 'day').format('YYYY/MM/DD'),
                moment().subtract(21, 'day').format('YYYY/MM/DD') + '-' + moment().subtract(14, 'day').format('YYYY/MM/DD'),
                moment().subtract(14, 'day').format('YYYY/MM/DD') + '-' + moment().subtract(7, 'day').format('YYYY/MM/DD'),
                moment().subtract(7, 'day').format('YYYY/MM/DD') + '-' + moment().subtract(0, 'day').format('YYYY/MM/DD'),
                moment().subtract(0, 'day').format('YYYY/MM/DD') + '-' + moment().subtract(-7, 'day').format('YYYY/MM/DD')
            ];
        } else if (queryParams.selectedTimePeriod === '5') {
            categories = [moment().subtract(12, 'month').format('YYYY/MM'), moment().subtract(11, 'month').format('YYYY/MM'),
                moment().subtract(10, 'month').format('YYYY/MM'), moment().subtract(9, 'month').format('YYYY/MM'),
                moment().subtract(8, 'month').format('YYYY/MM'), moment().subtract(7, 'month').format('YYYY/MM'),
                moment().subtract(6, 'month').format('YYYY/MM'), moment().subtract(5, 'month').format('YYYY/MM'),
                moment().subtract(4, 'month').format('YYYY/MM'), moment().subtract(3, 'month').format('YYYY/MM'),
                moment().subtract(2, 'month').format('YYYY/MM'), moment().subtract(1, 'month').format('YYYY/MM'),
                moment().subtract(0, 'month').format('YYYY/MM')
            ]
        }
        var opts = {
            title: "各模块日志统计变化",
            series: series,
            categories: categories
        };
        createLineChart(opts);
    }

    function createPieChart(data) {
        var title = data.title || null;
        var series = [];
        if (data.series.length) {
            series = data.series;
        } else {
            Notify.show({
                title: '缺少饼图信息',
                type: 'warning'
            });
        }

        var pie = $('#myPieChart');
        if (pie.length) {
            if (data.series[0].data.length <= 6) {
                var showInLegend = true;
            } else {
                showInLegend = false;
            }
            $('#myPieChart').highcharts({
                credits: false,
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    height: 260
                },
                title: {
                    text: title
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                },
                plotOptions: {
                    pie: {
                        size: '90%',
                        center: ['50%', '50%'],
                        allowPointSelect: false,
                        cursor: 'pointer',
                        dataLabels: {
                            distance: 15,
                            enabled: true
                        },
                        showInLegend: showInLegend
                    }
                },
                colors: highColors,
                series: series
            });
        }
    }

    function dealPieChartData(data) {
        // var piePercent = [];
        var sum = 0;
        var series = [];
        var temp = {
            type: 'pie',
            name: '占比',
            data: []
        };
        _.each(data, function(info) {
            sum = sum + info.count;
        });
        var index = 1;
        _.each(data, function(info) {
            var module = [];
            var label;
            _.each(_moduleArray, function(amap) {
                if (info.moduleType == amap.value) {
                    label = amap.label;
                }
            });
            if (!label) {
                label = "未知模块" + index++;
            }
            module.push(label);
            module.push(info.count);
            temp.data.push(module);
        });
        series.push(temp);
        var opts = {
            title: '各模块日志统计所占比例',
            series: series
        };
        createPieChart(opts);
    }

    function getChartData(chartsMark, moduleTypesID, unit, startTime, endTime, init) {
        moduleTypesID = moduleTypesID.length == _moduleArray.length ? [0] : moduleTypesID;
        var currentDate = moment(endTime).format('YYYY-MM-DD');
        if (jqxhr) {
            jqxhr.abort();
            jqxhr = null;
        }
        jqxhr = $.getJSON('/log/getchartsdata', {
            moduleType: moduleTypesID,
            unit: unit,
            startTime: startTime,
            endTime: endTime
        }, function(res) {
            if (res.code === 0) {
                if (init === true) {
                    $('#modueltypes-multiselect-for-charts').multiselect('selectAll', false).multiselect('updateButtonText');
                }

                if (chartsMark === 'lineandpie') {
                    dealPieChartData(res.piedata);
                    dealLineChartData(res.linedata, currentDate);
                } else if (chartsMark === 'lineonly') {
                    dealLineChartData(res.linedata, currentDate);
                }
            } else {
                Notify.show({
                    title: '获取统计图数据失败',
                    type: 'error'
                });
            }
        });
    }

    function timePeriodCharts(value) {
        switch (value) {
            case "1":
                // recentWeekData
                queryParams.selectedTimePeriod = '1';
                var unit = 1;
                queryParams.unit = unit;
                var startTime = moment().subtract(7, 'day').format('YYYY-MM-DD HH:mm:ss');
                var endTime = moment().format('YYYY-MM-DD HH:mm:ss');
                queryParams.startTime = startTime;
                queryParams.endTime = endTime;
                if (_.isEmpty(queryParams.chartsSelectedModulesTypesID)) {
                    notifyEmptyModuleTypes();
                } else {
                    getChartData('lineandpie', queryParams.chartsSelectedModulesTypesID, unit, startTime, endTime, false);
                }
                break;
            case "3":
                // recentMonthData
                queryParams.selectedTimePeriod = '3';
                unit = 2;
                queryParams.unit = unit;
                startTime = moment().subtract(1, 'month').format('YYYY-MM-DD HH:mm:ss');
                endTime = moment().format('YYYY-MM-DD HH:mm:ss');
                queryParams.startTime = startTime;
                queryParams.endTime = endTime;
                if (_.isEmpty(queryParams.chartsSelectedModulesTypesID)) {
                    notifyEmptyModuleTypes();
                } else {
                    getChartData('lineandpie', queryParams.chartsSelectedModulesTypesID, unit, startTime, endTime, false);
                }
                break;
            case "5":
                // recentYearData
                queryParams.selectedTimePeriod = '5';
                unit = 3;
                queryParams.unit = unit;
                startTime = moment().subtract(1, 'year').format('YYYY-MM-DD HH:mm:ss');
                endTime = moment().format('YYYY-MM-DD HH:mm:ss');
                queryParams.startTime = startTime;
                queryParams.endTime = endTime;
                if (_.isEmpty(queryParams.chartsSelectedModulesTypesID)) {
                    notifyEmptyModuleTypes();
                } else {
                    getChartData('lineandpie', queryParams.chartsSelectedModulesTypesID, unit, startTime, endTime, false);
                }
                break;
            case 'init':
                // recentWeekData
                queryParams.selectedTimePeriod = '1';
                unit = 1;
                queryParams.unit = unit;
                startTime = moment().subtract(7, 'day').format('YYYY-MM-DD HH:mm:ss');
                endTime = moment().format('YYYY-MM-DD HH:mm:ss');
                queryParams.startTime = startTime;
                queryParams.endTime = endTime;
                queryParams.chartsSelectedModulesTypesID = getALLModuleTypesID();
                if (_.isEmpty(queryParams.chartsSelectedModulesTypesID)) {
                    notifyEmptyModuleTypes();

                } else {
                    getChartData('lineandpie', [0], unit, startTime, endTime, true);
                }
                break;
            default:
                break;
        }
    }
})
