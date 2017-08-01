define('module/smartquery/statistic', [
    '../../tpl/smartquery/tpl_result_statistic_frame',
    '../../tpl/smartquery/tpl_result_statistic_item',
    '../../tpl/smartquery/tpl_result_statistic_type1',
    '../../tpl/smartquery/tpl_result_statistic_type2',
    'nova-notify',
    'nova-dialog',
    'nova-bootbox-dialog',
    'widget/jqx-binding',
    'underscore'
], function(tpl_rs_frame, tpl_rs_item, tpl_rs1, tpl_rs2, Notify, Dialog, bootbox, jqxBinding) {

    tpl_rs_frame = _.template(tpl_rs_frame);
    tpl_rs_item = _.template(tpl_rs_item);
    tpl_rs1 = _.template(tpl_rs1);
    tpl_rs2 = _.template(tpl_rs2);

    var _opt;
    var barArray = new Array();
    var pieArray = new Array();

    function init(opt) {
        _opt = opt;
    }

    function generateStatisticFrame() {
        var frameHTML = $(tpl_rs_frame());
        $('#statistic-div').empty().append(frameHTML);
    }

    function generateTabRow(item, rows) {
        var group = _.groupBy(rows, function(i) {
            var retArray = [];


            _.each(item.meta, function(field) {
                var fieldName =  field.name;
                var str = ("" + i[fieldName]).replace(',', ';');
                retArray.push(str);

            })
            return retArray;
        });




        item.count = _.size(group);
        item.group = group;
        item.records = [];
        console.log(group)
        var aggregateName = '';
        if (item.aggregateInfos.length != 0) {
            aggregateName = item.aggregateInfos[0].name.toUpperCase();
            switch (item.aggregateInfos[0].aggregateType) {
                case 0:
                    break;
                case 1:
                    _.each(group, function(value, key, list) {
                        var record = key.split(',');
                        record.push(value.length);
                        item.records.push(record);

                    });
                    break;
                case 2:
                    _.each(group, function(value, key, list) {
                        var record = key.split(',');

                        //add by zhangu对去重字段值去重
                        if (!_.isEmpty(aggregateName)) {
                            var sinrecord = _.unique(value, false, function(i) {
                                return parseInt(i[aggregateName]);
                            });
                            record.push(sinrecord.length);
                        } else {
                            record.push(value.length);
                        }
                        //the end


                        item.records.push(record);
                    });
                    break;
                case 3:
                    _.each(group, function(value, key, list) {
                        var record = key.split(',');
                        var sum = 0;
                        var allInvalid = true;

                        _.each(value, function(i) {
                            if (!isNaN(parseInt(i[aggregateName]))) {
                                sum += parseInt(i[aggregateName]);
                                allInvalid = false;
                            }

                        });
                        if (allInvalid) {
                            record.push('');
                        } else {
                            record.push(sum);
                        }

                        item.records.push(record);

                    });
                    break;
                case 4:
                    _.each(group, function(value, key, list) {
                        var record = key.split(',');
                        var sum = 0;
                        var allInvalid = true;

                        var unique_array = _.unique(value, false, function(i) {
                            return parseInt(i[aggregateName]);
                        });
                        _.each(unique_array, function(i) {
                            if (!isNaN(parseInt(i[aggregateName]))) {
                                sum += parseInt(i[aggregateName]);
                                allInvalid = false;
                            }

                        });
                        if (allInvalid) {
                            record.push('');
                        } else {
                            record.push(sum);
                        }
                        item.records.push(record);

                    });

                    break;
                case 5:
                    _.each(group, function(value, key, list) {
                        var record = key.split(',');
                        var sum = 0;
                        //edit by hjw, add empty value process logic,ignore empty value,decrease total count of this group
                        var validCountOffset = 0;

                        _.each(value, function(i) {
                            if (!isNaN(parseInt(i[aggregateName]))) {
                                sum += parseInt(i[aggregateName]);
                            } else {
                                validCountOffset++;
                            }

                        });

                        if (value.length - validCountOffset == 0) {
                            record.push('');
                        } else {
                            record.push(sum / (value.length - validCountOffset));
                        }

                        item.records.push(record);

                    });
                    break;
                case 6:
                    _.each(group, function(value, key, list) {
                        var record = key.split(',');
                        var sum = 0;
                        //edit by hjw, add empty value process logic,ignore empty value,decrease total count of this group
                        var validCountOffset = 0;

                        var unique_array = _.unique(value, false, function(i) {
                            return parseInt(i[aggregateName]);
                        });
                        _.each(unique_array, function(i) {
                            if (!isNaN(parseInt(i[aggregateName]))) {
                                sum += parseInt(i[aggregateName]);
                            } else {
                                validCountOffset++;
                            }

                        });
                        if (unique_array.length - validCountOffset == 0) {
                            record.push('');
                        } else {
                            record.push(sum / (unique_array.length - validCountOffset));
                        }

                        item.records.push(record);

                    });
                    break;
                case 7:
                    _.each(group, function(value, key, list) {
                        var record = key.split(',');
                        //edit by hjw, add empty value process logic,return exsisted value to ensure max/min logic is correct
                        var exsistedValue;
                        //find the first valid value
                        for (var j = 0; j < value.length; j++) {
                            if (!isNaN(parseInt(value[j][aggregateName]))) {
                                exsistedValue = parseInt(value[j][aggregateName]);
                                break;
                            }
                            if ((j == value.length - 1) && (isNaN(parseInt(value[j][aggregateName])))) {
                                record.push('');
                                item.records.push(record);
                                return;
                            }
                        }

                        var max = _.max(value, function(i) {
                            if (!isNaN(parseInt(i[aggregateName]))) {
                                return parseInt(i[aggregateName]);
                            } else {
                                return exsistedValue;
                            }

                        });
                        record.push(max[aggregateName]);
                        item.records.push(record);

                    });
                    break;
                case 8:
                    _.each(group, function(value, key, list) {
                        var record = key.split(',');
                        //edit by hjw, add empty value process logic,return exsisted value to ensure max/min logic is correct
                        var exsistedValue;
                        //find the first valid value
                        for (var j = 0; j < value.length; j++) {
                            if (!isNaN(parseInt(value[j][aggregateName]))) {
                                exsistedValue = parseInt(value[j][aggregateName]);
                                break;
                            }
                            if ((j == value.length - 1) && (isNaN(parseInt(value[j][aggregateName])))) {
                                record.push('');
                                item.records.push(record);
                                return;
                            }
                        }

                        var min = _.min(value, function(i) {
                            if (!isNaN(parseInt(i[aggregateName]))) {
                                return parseInt(i[aggregateName]);
                            } else {
                                return exsistedValue;
                            }
                        });
                        record.push(min[aggregateName]);
                        item.records.push(record);

                    });
                    break;
                case -1:
                    _.each(group, function(value, key, list) {
                        var record = key.split(',');
                        item.records.push(record);
                    });
                    break;
                default:
                    break;

            }
        } else {
            _.each(group, function(value, key, list) {
                var record = key.split(',');
                item.records.push(record);
            });
        }

        var tabRowHtml = $(tpl_rs_item(item));

        $('#statisticList').append(tabRowHtml);
        $('.tabrow-item').hover(function(event) {
                // $('#'+event.currentTarget.id+' span').css('z-index','1002');
                // $('#'+event.currentTarget.id+' button').css('z-index','1003');
                $('#' + event.currentTarget.id + '  span').hide();
                $('#' + event.currentTarget.id + '  button').css('display', 'inline-block');

            },
            function() {
                // $('#'+event.currentTarget.id+' button').css('z-index','1002');
                // $('#'+event.currentTarget.id+' span').css('z-index','1003');
                $('#' + event.currentTarget.id + ' button').hide();
                $('#' + event.currentTarget.id + ' span').css('display', 'inline-block');
            });
        $('.tabrow-item').on('click', function(event) {

            $('#statisticList .selected-line').removeClass('selected-line');
            $('#' + event.currentTarget.id).addClass('selected-line');
        });
    }


    function generateContent(item) {
        var contentHtml = '';
        var resultStatistic;

        switch (item.patternType) {
            case 1:
                generateBarAndPie(item);

                generateTable(item);

                break;
            case 2:
                generateTable(item);

                break;
            case 3:
                break;
            default:
                break;
        }
    }

    function makeStaMeta(item) {
        var staMeta = {};
        var sta_type = '';
        var sta_text = '';
        var sta_fieldtype = '';
        if (item.aggregateInfos.length != 0) {
            switch (item.aggregateInfos[0].aggregateType) {
                case 0:
                    break;
                case 1:
                    sta_type = 'count';
                    sta_text = '计数';
                    sta_fieldtype = 'decimal';
                    break;
                case 2:
                    sta_type = 'count_unique';
                    sta_text = '去重计数';
                    sta_fieldtype = 'text';
                    break;
                case 3:
                    sta_type = 'sum';
                    sta_text = '对' + item.aggregateInfos[0].caption + '求和';
                    sta_fieldtype = 'text';
                    break;
                case 4:
                    sta_type = 'sum_unique';
                    sta_text = '对' + item.aggregateInfos[0].caption + '去重求和';
                    sta_fieldtype = 'text';
                    break;
                case 5:
                    sta_type = 'average';
                    sta_text = '对' + item.aggregateInfos[0].caption + '求平均值';
                    sta_fieldtype = 'text';
                    break;
                case 6:
                    sta_type = 'average_unique';
                    sta_text = '对' + item.aggregateInfos[0].caption + '去重求平均值';
                    sta_fieldtype = 'text';
                    break;
                case 7:
                    sta_type = 'sum_unique';
                    sta_text = '对' + item.aggregateInfos[0].caption + '求最大值';
                    sta_fieldtype = 'text';
                    break;
                case 8:
                    sta_type = 'sum_unique';
                    sta_text = '对' + item.aggregateInfos[0].caption + '求最小值';
                    sta_fieldtype = 'text';
                    break;
                default:
                    break;

            };
        }
        var staMeta = {
            caption: sta_text,
            name: sta_type,
            type: sta_fieldtype,
        };
        return staMeta;
    }

    function generateTable(item) {
        var staMeta = makeStaMeta(item);

        // if ($('#statisticGrid' + item.patternId).jqxGrid('getcolumn', 'datafield') != null) {
        $('#statisticGrid' + item.patternId).jqxGrid('clear');
        // }

        //  if () {
        jqxBinding.init({
            refreshStatitic: refreshTab
        });
        //  }


        var columns = {};
        columns = jqxBinding.constructColumns(item);
        var countColumn = {};
        var dataAdapter;
        if (staMeta.caption != "" || staMeta.name != "") {
            countColumn = {
                headertext: staMeta.caption,
                text: staMeta.caption,
                datafield: staMeta.name,
                datatype: staMeta.type,
                width: 200,
                minwidth: 50
            };

            if (_.find(item.meta, staMeta) == undefined) {
                item.meta.push(staMeta)
            }

            dataAdapter = new $.jqx.dataAdapter(jqxBinding.constructSource(item));
            item.meta.pop(staMeta);
        } else {
            dataAdapter = new $.jqx.dataAdapter(jqxBinding.constructSource(item));
        }

        if (_.find(columns, countColumn) == undefined) {
            columns.push(countColumn);
        }
        var gridHeight = $("#statistic-div").height();

        $('#statisticGrid' + item.patternId).jqxGrid({
            source: dataAdapter,
            columns: columns,
            theme: 'bootstrap',
            height: gridHeight,
            columnsresize: true,
            columnsautoresize: true,
            rendered: function() {
                $('#statisticGrid' + item.patternId).jqxGrid('autoresizecolumns', 'all');
            },

        });
    }

    function generateBarAndPie(item) {

        var staMeta = makeStaMeta(item);

        var carouselHeight = $('#myCarousel' + item.patternId + ' .carousel-inner').css('height');
        var carouselWidth = $('#myCarousel' + item.patternId + ' .carousel-inner').css('width');

        var ecBar = document.getElementById('ec-bar' + item.patternId);

        ecBar.style.height = carouselHeight;
        ecBar.style.width = carouselWidth;


        bar = echarts.init(ecBar, 'vintage');

        var name = item.meta[0].caption + "统计";
        var legend = [];
        legend.push(name);
        var xDataArray = [];
        var yDataArray = [];
        for (var i = 0; i < item.records.length; i++) {
            xDataArray.push(item.records[i][0]);
            yDataArray.push(item.records[i][1]);
        }

        var barOption = {
            title: {
                show: true,
                left: 'center'
            },
            tooltip: {
                show: true
            },
            legend: {
                data: legend
            },
            xAxis: [{
                type: 'category',
                data: xDataArray,
                name: item.meta[0].caption,
                axisLabel:{
                    // interval:0, //x轴信息全部显示
                    rotate:-30, //倾斜30度显示
                }
            }],
            yAxis: [{
                type: 'value',
                name: staMeta.caption
            }],
            series: [{
                name: name,
                type: "bar",
                data: yDataArray
            }],
            grid: {
                //x2表示x轴底端到右侧边界的距离，太小显示不下图表名称，太长图表宽度不够用
                x2: 150
            }



        };

        bar.setOption(barOption);

        barArray[item.id] = bar;

        var ecPie = document.getElementById('ec-pie' + item.patternId);


        if (item.records.length > 500) {
            var warningInfo = '<h2 style="text-align:center;margin-top:130px;">分组过多，饼状图无法展示，请进一步筛选</h2>';
            ecPie.innerHTML = warningInfo;
            return;

        }


        ecPie.style.height = carouselHeight;
        ecPie.style.width = carouselWidth;
        var pie = echarts.init(ecPie);

        //preprocess data
        var name = item.meta[0].caption + "统计";
        var legend = [];
        var dataArray = [];
        for (var i = 0; i < item.records.length; i++) {
            legend.push(item.records[i][0]);
            var valueNameObject = {
                value: item.records[i][1],
                name: item.records[i][0]
            };
            dataArray.push(valueNameObject);

        }

        var pieOption = {
            title: {
                text: name,
                show: true,
                left: 'center'
            },
            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },

            calculable: true,

            series: [{
                name: name,
                type: 'pie',
                radius: '55%',
                center: ['50%', '60%'],
                data: dataArray,
                itemStyle: {
                    normal: {
                        label: {
                            show: false
                        },
                        labelLine: {
                            show: false
                        }
                    }
                }
            }]
        };
        if (item.records.length < 20) {
            pieOption.legend = {
                orient: 'vertical',
                x: 'left',
                y: 'center',
                data: legend
            }
        }

        pie.setOption(pieOption);

        pieArray[item.id] = pie;
    }

    function btnListener(buttonID, mode, patternId) {

        var temp;
        var curDatatypeName;

        curDatatypeName = _opt.dataType.name;

        $(buttonID).on('click', function(event) {
            if (mode == 3) {
                //delete mode
                bootbox.confirm('确认删除?', function(rlt) {
                    if (rlt) {
                        $.getJSON('/smartquery/delStatisticPattern', {
                            patternId: patternId
                        }).done(function(rsp, status) {
                            if (rsp.code != 0) {
                                Notify.show({
                                    title: rsp.message,
                                    type: "failed"
                                });
                            } else {
                                Notify.show({
                                    title: "删除成功！",
                                    type: "success"
                                });
                                refreshTab();
                                $.magnificPopup.close();
                            }
                        });
                    }

                });
            } else {
                var datatypeColList = fetchMetaFromSession();
                if (datatypeColList != undefined && datatypeColList != null && datatypeColList.length > 0) {
                    var colListHTML1 = '';
                    var colListHTML2 = '';

                    for (var i = 0; i < datatypeColList.length; i++) {
                        colListHTML1 +=
                            '<option value="' + datatypeColList[i].name + '" type="' + datatypeColList[i].type + '">' +
                            datatypeColList[i].caption +
                            '</option>';
                    }
                    for (var i = 0; i < datatypeColList.length; i++) {
                        if (datatypeColList[i].codeTag == 1 || datatypeColList[i].type != 'decimal') {
                            continue;
                        }
                        colListHTML2 +=
                            '<option value="' + datatypeColList[i].name + '" type="' + datatypeColList[i].type + '"';

                        colListHTML2 +=
                            '>' +
                            datatypeColList[i].caption +
                            '</option>';
                    }
                    $.getJSON('/smartquery/getAggregateFunc', {
                        type: ''
                    }).done(function(rsp, status) {

                        var condHTML = '<option value="-1">' +
                            '请选择条件' +
                            '</option>';
                        for (var i = 0; i < rsp.data.length; i++) {
                            condHTML +=
                                '<option  value="' + rsp.data[i].id + '">' +
                                rsp.data[i].text +
                                '</option>';
                        }
                        var temp =
                            '<div class="admin-form theme-info">' +
                            '<form role="form" id="popup-form">' +
                            '<div class="section mt10">' +
                            '<p>当前统计数据类型:' +
                            '<span class="font-datatype">' +
                            curDatatypeName +
                            '</span>' +
                            '</p>' +

                            '</div>' +
                            '<div class="form-group">' +
                            '<div class="section mt10 input-group">' +
                            '<span class="input-group-addon">统计模式名称</span>' +
                            '<label for="pattern_name" class="field">' +
                            '<input type="text" class="gui-input" name="pattern_name" id="pattern_name">' + '</input>' +
                            '</label>' +
                            '</div>' +

                            '<div class="section mt10 input-group">' +
                            '<span class="input-group-addon">分组字段</span>' +
                            '<select id="col_multiselect" name="col_multiselect" multiple="multiple">' +
                            colListHTML1 +
                            '</select>' +
                            '</div>' +
                            '<label>聚集函数</label>' +
                            '<div class="section mt10 input-group">' +
                            '<span class="input-group-addon">条件</span>' +
                            '<select id="cond_select" name="cond_select">' +
                            condHTML +
                            '</select>' +
                            '<span class="input-group-addon">字段</span>' +

                            '<select id="col_singleselect" name="col_singleselect">' +
                            '<option value="" type="2">请选择字段</option>' +
                            colListHTML1 +
                            '</select>' +

                            '</div>' +
                            '</div>' +
                            '</form>' +
                            '</div>';


                        var buildOptions = {
                            title: mode == 1 ? "新建统计模式" : "修改统计模式",
                            content: temp,
                            rightBtnCallback: function() {
                                //prepare params

                                var selectedGroupField = $('#col_multiselect').find("option:selected");
                                var metaList = [];
                                $(selectedGroupField).each(function() {
                                    var metaObject = {};
                                    metaObject.name = $(this).attr("value").toLowerCase();
                                    metaObject.caption = $(this).html();
                                    metaObject.type = $(this).attr("type");
                                    // metaObject.codeTag = $(this).attr("data-code-tag");
                                    metaList.push(metaObject);
                                });

                                var aggregateField = $('#col_singleselect').find("option:selected");
                                var aggregateType = $('#cond_select').find("option:selected").val();
                                var aggregateInfo;


                                aggregateInfo = {
                                    name: $(aggregateField).attr("value"),
                                    caption: $(aggregateField).html(),
                                    type: $(aggregateField).attr("type"),
                                    aggregateType: aggregateType
                                };


                                var aggregateInfos = [];
                                aggregateInfos.push(aggregateInfo);

                                //validation
                                if ($('#pattern_name').val() == null || $('#pattern_name').val() == '') {

                                    Notify.show({
                                        title: "统计模式名称不能为空！",
                                        type: "failed"
                                    });
                                    return;
                                }
                                if ($('#col_multiselect').val() == null) {

                                    Notify.show({
                                        title: "必须选择分组字段！",
                                        type: "failed"
                                    });

                                    return;
                                }
                                if ($('#cond_select').val() == -1 && $('#col_singleselect').val() != '') {

                                    Notify.show({
                                        title: "若有聚集函数，则条件与字段均需要填写",
                                        type: "failed"
                                    });

                                    return;
                                }
                                if ($('#cond_select').val() != -1 && $('#col_singleselect').val() == '') {
                                    Notify.show({
                                        title: "若有聚集函数，则条件与字段均需要填写",
                                        type: "failed"
                                    });
                                    return;
                                }


                                if (mode == 1) {
                                    var params = {
                                        typeId: _opt.dataType.typeId,
                                        patternName: $('#pattern_name').val(),
                                        aggregateInfos: aggregateInfos,
                                        meta: metaList,
                                    };
                                    $.post('/smartquery/saveStatisticPattern', params, function(jsonRsp) {
                                        var rsp = $.parseJSON(jsonRsp);
                                        if (rsp.code != 0) {
                                            Notify.show({
                                                title: rsp.message,
                                                type: "failed"
                                            });
                                            $.magnificPopup.close();
                                        } else {

                                            $.magnificPopup.close();
                                            Notify.show({
                                                title: "创建成功!",
                                                type: "success"
                                            });

                                            refreshTab();
                                        }
                                    });
                                } else {
                                    var params = {
                                        patternId: patternId,
                                        typeId: _opt.dataType.typeId,
                                        patternName: $('#pattern_name').val(),
                                        aggregateInfos: aggregateInfos,
                                        meta: metaList,
                                    };
                                    $.post('/smartquery/updateStatisticPattern', params, function(jsonRsp) {
                                        var rsp = $.parseJSON(jsonRsp);
                                        if (rsp.code != 0) {
                                            Notify.show({
                                                title: rsp.message,
                                                type: "failed"
                                            });
                                            $.magnificPopup.close();
                                        } else {

                                            $.magnificPopup.close();
                                            Notify.show({
                                                title: "修改成功!",
                                                type: "success"
                                            });

                                            refreshTab();
                                        }
                                    });
                                }
                            },
                            leftBtnCallback: function() {

                                $.magnificPopup.close();
                            },
                        };
                        //update data mode
                        if (mode == 2) {
                            $.getJSON('/smartquery/getStatisticPatternById', {
                                typeId: _opt.dataType.typeId,
                                patternId: patternId
                            }).done(function(rsp, status) {
                                Dialog.build(buildOptions).show();
                                $('#nv-dialog-rightbtn').attr('type', 'submit');
                                bindSelectorJS(colListHTML1, colListHTML2);

                                var queryPattern = rsp.data;

                                //add by zhangu修改条件时，部分字段设为不可选
                                //edit by hjw 第一行加个短路逻辑避免aggregateInfos为空
                                var type = queryPattern.aggregateInfos.length > 0 && queryPattern.aggregateInfos[0].aggregateType;
                                var appendHTML;
                                if (type != 1 && type != 2) {
                                    appendHTML = '<option value="" type="">请选择字段</option>' + colListHTML2;

                                } else {
                                    appendHTML = '<option value="" type="">请选择字段</option>' + colListHTML1;

                                }
                                $('#col_singleselect').empty();
                                $('#col_singleselect').append(appendHTML);
                                var options = {
                                    buttonClass: 'multiselect dropdown-toggle btn btn-default btn-success',
                                    width: "100%",

                                };

                                $('#col_singleselect').multiselect('setOptions', options);
                                $('#col_singleselect').multiselect('rebuild');
                                //the end

                                $('#pattern_name').val(queryPattern.patternName);
                                _.each(queryPattern.meta, function(field) {
                                    $('#col_multiselect').multiselect('select', field.name);

                                });
                                if (queryPattern.aggregateInfos.length != 0) {
                                    $('#col_singleselect').multiselect('select', queryPattern.aggregateInfos[0].name);
                                    $('#cond_select').multiselect('select', type);
                                }
                            });
                        } else {
                            Dialog.build(buildOptions).show();

                            $('#nv-dialog-rightbtn').attr('type', 'submit');
                            bindSelectorJS(colListHTML1, colListHTML2);
                        }
                    });
                }


            }
        });
    }

    function validation() {

        $('#pattern_name').rules({

            rules: {
                required: true,
            },
            messages: {
                required: "统计模式名称不能为空！"
            },
            errorClass: "state-error",
            validClass: "state-success",
            errorElement: "em",
            highlight: function(element, errorClass, validClass) {
                $(element).closest('.field').addClass(errorClass).removeClass(validClass);
            },
            unhighlight: function(element, errorClass, validClass) {
                $(element).closest('.field').removeClass(errorClass).addClass(validClass);
            },
            errorPlacement: function(error, element) {
                if (element.is(":radio") || element.is(":checkbox")) {
                    element.closest('.form-group').after(error);
                } else {
                    error.insertAfter(element.parent());
                }
            },
            submitHandler: function() {
                var selectedGroupField = $('#col_multiselect').find("option:selected");
                var metaList = [];
                $(selectedGroupField).each(function() {
                    var metaObject = {};
                    metaObject.name = $(this).attr("value");
                    metaObject.caption = $(this).html();
                    metaObject.type = $(this).attr("type");
                    metaList.push(metaObject);
                });

                var aggregateField = $('#col_singleselect').find("option:selected");
                var aggregateType = $('#cond_select').find("option:selected").val();
                var aggregateInfo;
                aggregateInfo = {
                    name: $(aggregateField).attr("value"),
                    caption: $(aggregateField).html(),
                    type: $(aggregateField).attr("type"),
                    aggregateType: aggregateType
                };

                var aggregateInfos = [];
                aggregateInfos.push(aggregateInfo);

                if (mode == 1) {
                    var params = {
                        typeId: _opt.dataType.typeId,
                        patternName: $('#pattern_name').val(),
                        aggregateInfos: aggregateInfos,
                        meta: metaList,
                    };
                    $.post('/smartquery/saveStatisticPattern', params, function(jsonRsp) {
                        var rsp = $.parseJSON(jsonRsp);
                        if (rsp.code != 0) {
                            Notify.show({
                                title: rsp.message,
                                type: "failed"
                            });
                            $.magnificPopup.close();
                        } else {

                            $.magnificPopup.close();
                            Notify.show({
                                title: "创建成功!",
                                type: "success"
                            });

                            refreshTab();
                        }
                    });
                } else {
                    var params = {
                        patternId: patternId,
                        typeId: _opt.dataType.typeId,
                        patternName: $('#pattern_name').val(),
                        aggregateInfos: aggregateInfos,
                        meta: metaList,
                    };
                    $.post('/smartquery/updateStatisticPattern', params, function(jsonRsp) {
                        var rsp = $.parseJSON(jsonRsp);
                        if (rsp.code != 0) {
                            Notify.show({
                                title: rsp.message,
                                type: "failed"
                            });
                            $.magnificPopup.close();
                        } else {

                            $.magnificPopup.close();
                            Notify.show({
                                title: "修改成功!",
                                type: "success"
                            });

                            refreshTab();
                        }
                    });
                }

            },
        });
    }

    function bindSelectorJS(colListHTML1, colListHTML2) {
        $('#col_multiselect').multiselect({
            buttonClass: 'multiselect dropdown-toggle btn btn-default btn-success',
            includeSelectAllOption: true,
            nonSelectedText: '请选择字段',
            selectAllText: '全选',
        });
        $('#col_singleselect').multiselect({
            buttonClass: 'multiselect dropdown-toggle btn btn-default btn-success',
        });
        $('#cond_select').multiselect({
            buttonClass: 'multiselect dropdown-toggle btn btn-default btn-success',
            onChange: function(event, select) {

                var type = $(event).val();
                if (type != 1 && type != 2) {

                    var appendHTML = '<option value="" type="">请选择字段</option>' + colListHTML2;
                    $('#col_singleselect').empty();
                    $('#col_singleselect').append(appendHTML);
                    var options = {
                        buttonClass: 'multiselect dropdown-toggle btn btn-default btn-success',
                        width: "100%",
                    };
                    $('#col_singleselect').multiselect('setOptions', options);
                    $('#col_singleselect').multiselect('rebuild');

                } else {


                    var appendHTML = '<option value="" type="">请选择字段</option>' + colListHTML1;
                    $('#col_singleselect').empty();
                    $('#col_singleselect').append(appendHTML);
                    var options = {
                        buttonClass: 'multiselect dropdown-toggle btn btn-default btn-success',
                        width: "100%",

                    };

                    $('#col_singleselect').multiselect('setOptions', options);
                    $('#col_singleselect').multiselect('rebuild');

                }
            },
        });
        applyMultiselectCSS();
    }

    function applyMultiselectCSS() {
        $('.btn-group').css({
            'width': '100%',
        });
        $('button.multiselect').css({
            'width': '100%',
        });

        $('.multiselect-container').css({
            'overflow-y': 'auto',
            'height': '200px',
            'width': '300px',
        });
        $('#nv-dialog-body').css({
            'overflow-y': 'hidden',
            'height': '500px',
        });
    }

    function refreshTab() {
        var rows = $('#dataGrid').jqxGrid('getboundrows');

        //仅选中数据行进行统计，目前功能设计是统计当前页所有结果，此功能隐去
        // var selectedRowIndexs = $('#dataGrid').jqxGrid('getselectedrowindexes');
        // if (selectedRowIndexs && selectedRowIndexs.length != 0) {
        //     var selectedRows = [];
        //     for (var i = 0; i < selectedRowIndexs.length; i++) {
        //         selectedRows.push(rows[selectedRowIndexs[i]])
        //     }
        //     rows = selectedRows;
        // }

        $.getJSON('/smartquery/getStatisticResult', {
            typeId: _opt.dataType.typeId
        }).done(function(rsp, status) {
            if (rsp.code != 0) {
                Notify.show({
                    title: rsp.message,
                    type: "failed"
                });
            } else {

                generateStatisticFrame();
                if (rsp.data.length == 0) {
                    $('#sta-list-hint').show();

                } else {
                    $('#sta-list-hint').hide();
                }
                var resultArray = [];
                _.each(rsp.data, function(item) {

                    generateTabRow(item, rows);
                    resultArray[item.patternId] = item;
                    if (item.patternType == 1) {
                        var resultStatistic = $(tpl_rs1(item));

                        $('#statistic-div .tab-content').append(resultStatistic);
                        $('.carousel').carousel('pause');

                        $('.carousel-control').css({
                            'background-image': 'none',
                            'color': '#000000'
                        });
                    } else {
                        var resultStatistic = $(tpl_rs2(item));
                        $('#statistic-div .tab-content').append(resultStatistic);
                    }

                });


                $('#statisticList>li').on('click', function(event) {
                    var tabrowId = event.currentTarget.id;
                    var id = tabrowId.slice(6, tabrowId.length);
                    var selectedItem = resultArray[id];


                    $('#statisticList .active').removeClass('active');

                    $('#tabrow' + id).addClass('active');

                    $('#tabContent>.active').removeClass('active');
                    var fcid = $('#tabrow' + id + ' a').attr('href');
                    $(fcid).addClass("active");

                    generateContent(selectedItem);
                });


                var sqWidth = document.getElementById('sq-panel').offsetWidth;
                $('#statistic-div').width(sqWidth);

                $('#statistic-button').css('background-color', '#2e9e83');
                $("#statistic-div").slideDown(function(event) {

                    var panelHeight = document.getElementById('sq-panel').offsetHeight;
                    var panelHeadHeight = document.getElementById('sq-head').offsetHeight;
                    var tabHead = document.getElementById('panel-menu').offsetHeight;
                    var gridHeight = panelHeight - panelHeadHeight - tabHead;
                    $("#dataGrid").jqxGrid('height', gridHeight - document.getElementById('statistic-div').offsetHeight);
                    $('#dataGrid').jqxGrid('refresh');
                    $('#statisticList>:first-child').trigger("click");
                });

                btnListener('#btn-create-statistic', 1, '-1');
                $('.btn-edit').each(function(item) {

                    var curBtnID = $(this).attr('id');
                    var patternId = curBtnID.slice(18, curBtnID.length);
                    btnListener('#' + curBtnID, 2, patternId);

                });
                $('.btn-delete').each(function(item) {

                    var curBtnID = $(this).attr('id');
                    var patternId = curBtnID.slice(20, curBtnID.length);
                    btnListener('#' + curBtnID, 3, patternId);

                });



            }
        });


    }

    function fetchMetaFromSession() {
        var meta = window.sessionStorage.getItem('smartqueryMeta');
        if (meta) {
            meta = JSON.parse(meta);
        }
        return meta;
    }

    return {
        init: init,
        refreshTab: refreshTab
    }

})