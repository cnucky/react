/** 获得数据(交叉表) */
function getColumn(Srcdata, dimension0) {
    let columns = Enumerable.From(Srcdata)
                .Select(function (item , key) {
                    return {
                        width:150,
                        title: item[dimension0.aliasName],
                        dataIndex: item[dimension0.aliasName]
                    }
                })
                .Distinct(function (item) {
                    return item.dataIndex
                })
                .ToArray();
    if (columns[0] && columns[0].title != '交叉表') {
        columns.unshift(
            {
                key : 'corosstable',
                width:150,
                title: '交叉表',
                dataIndex: 'corosstable',
                fixed: 'left',
                sorter: (a , b) => a.corosstable.length - b.corosstable.length || a.corosstable - b.corosstable
            }
        )
    }

    return columns;
}

function getTableData(Srcdata, dimension0, dimension1, measure) {
    let data = Enumerable.From(Srcdata)
        .Select(function (item) {
            return {
                [item[dimension0.aliasName]]: item[measure.aliasName],
                corosstable: item[dimension1.aliasName],
            }
        })
        .GroupBy("$.corosstable" , null , function (key , g) {
            let eachData = {};
            _.each(g.source, function (index) {
                eachData = _.assign(eachData, index);
            })
            return eachData;
        })
        .ToArray();
    return data;

}


/** 检索出选择的维度的所有字段值(通用) */
function getFieldsFrom(dimension, data) {
    var fields = Enumerable.From(data)
        .Where(function(item) { return (item[dimension.aliasName] !== "") && (item[dimension.aliasName] !== "NULL"); })
        .Select(function(item) { return item[dimension.aliasName]; })
        .Distinct(function(item) { return item; })
        .ToArray();

    return fields.sort();
}

/** 获取图例(通用) */
function getLegend(dimension, measure, data) {
    if (dimension.length === 1 && measure.length === 1)
        return new Array(measure[0].displayName)
    else if (dimension.length === 1 && measure.length > 1)
        return _.map(measure, (item) => { return item.displayName });
    else if (dimension.length > 1 && measure.length === 1)
        return getFieldsFrom(dimension[dimension.length - 1], data);
    return [];
}

/** 获取轴标题(通用) */
function getAxisName(dimension, data) {
    switch (dimension.length) {
        case 1:
        case 2:
            return getFieldsFrom(dimension[0], data);
        default:
            return [];
    }
}

/** 获取series(线图、柱图) */
function getGridSeries(type, data, dimension, measure, axis, transverse) {
    var series = new Array();
    var legendData = []; 

    /** 1个维度、1个度量 */
    if (dimension.length === 1 && measure.length === 1) {
        /** 按维度1分组 */
        let axisGroup = Enumerable.From(data).Where(
            function(item) { 
                return item[dimension[0].aliasName] != "NULL" && item[dimension[0].aliasName] != "" && 
                        item[measure[0].aliasName] != "NULL" && item[measure[0].aliasName] != ""; 
            }
        ).GroupBy(
            function(item) { 
                return item[dimension[0].aliasName];
            }
        ).Select(
            function(item) {
                return item.source;
            }
        ).ToArray();

        /** 按measure求和 */
        let obj_data = {};
        for(let axisItem of axisGroup) {
            let axisName = axisItem[0][dimension[0].aliasName];

            let value = Enumerable.From(axisItem).Sum(
                function(item) {
                    return Number(item[measure[0].aliasName]);
                }
            );
            obj_data[axisName] = value;
        }
        console.log(obj_data)
        /** 遍历全字段的axis数组 */
        let array_data = [];
        for(let axisName of axis) {
            let value = _.isUndefined(obj_data[axisName]) ? 0 : obj_data[axisName];
            array_data.push(value);
        }

        /** 添加到series && legend */
        legendData.push(measure[0].displayName);
        series.push({
            name: measure[0].displayName,
            type: type,
            data: array_data
        });
    }

    /** 2个维度、1个度量 */
    else if(dimension.length === 2 && measure.length === 1) {
        /** 按图例(维度2)分组 */

        let legendGroup = Enumerable.From(data).Where(
            function(item) { 
                return item[dimension[0].aliasName] != "NULL" && item[dimension[0].aliasName] != "" && 
                        item[dimension[1].aliasName] != "NULL" && item[dimension[1].aliasName] != "" &&
                        item[measure[0].aliasName] != "NULL" && item[measure[0].aliasName] != ""; 
            }
        ).GroupBy(
            function(item) { 
                return item[dimension[1].aliasName];
            }
        ).Select(
            function(item) {
                return item.source;
            }
        ).ToArray();

        /** 按axis(维度1)分组 */
        for(let legendItem of legendGroup) {
            let legendName = legendItem[0][dimension[1].aliasName];
            let axisGroup = Enumerable.From(legendItem).Select(
                function(item) {
                    return { [dimension[0].aliasName]: item[dimension[0].aliasName], [measure[0].aliasName]: item[measure[0].aliasName] };
                }
            ).GroupBy(
                function(item) {
                    return item[dimension[0].aliasName];
                }
            ).Select(
                function(item) {
                    return item.source;
                }
            ).ToArray();

            /** 按measure求和 */
            let obj_data = {};
            for(let axisItem of axisGroup) {
                let axisName = axisItem[0][dimension[0].aliasName];

                let value = Enumerable.From(axisItem).Sum(
                    function(item) {
                        return Number(item[measure[0].aliasName]);
                    }
                );
                obj_data[axisName] = value;
            }
            /** 遍历全字段的axis数组 */
            let array_data = [];
            for(let axisName of axis) {
                let value = _.isUndefined(obj_data[axisName]) ? 0 : obj_data[axisName];
                array_data.push(value);
            }
            /** 添加到series && legend */
            legendData.push(legendName);
            series.push({
                stack: '总量',
                name: legendName,
                type: type,
                data: array_data,
                label: {
                    normal: {
                        show: true
                    }
                }
            });
        }
    }

    /** 1个维度、n个度量 */
    else if (dimension.length === 1 && measure.length >= 2) {
        /** 过滤无用字段 */
        let filterData = Enumerable.From(data).Where(
            function(item) {
                return item[dimension[0].aliasName] != "NULL" && item[dimension[0].aliasName] != ""; 
            }
        );

        /** 每一个度量都采用1维1度量操作 */
        _.each(measure, function (measureItem, index) {            
            /** 按维度分组 */
            let axisGroup = filterData.GroupBy(
                function(item) { 
                    return item[dimension[0].aliasName];
                }
            ).Select(
                function(item) {
                    return item.source;
                }
            ).ToArray();

            /** 按measure求和 */
            let obj_data = {};
            for(let axisItem of axisGroup) {
                let axisName = axisItem[0][dimension[0].aliasName];

                let value = Enumerable.From(axisItem).Sum(
                    function(item) {
                        let value = Number(item[measureItem.aliasName]);
                        return isNaN(value) ? 0 : value;
                    }
                );
                obj_data[axisName] = value;
            }

            /** 遍历全字段的axis数组 */
            let array_data = [];
            for(let axisName of axis) {
                let value = _.isUndefined(obj_data[axisName]) ? 0 : obj_data[axisName];
                array_data.push(value);
            }

            /** 添加到series && legend */
            legendData.push(measureItem.displayName);
            if(transverse)
                series.push({
                    name: measureItem.displayName,
                    type: type,
                    xAxisIndex: index,
                    data: array_data
                });
            else
                series.push({
                    name: measureItem.displayName,
                    type: type,
                    yAxisIndex: index,
                    data: array_data
                });
        });
    }

    return {
        legendData: legendData, 
        series: series
    };
}

/** 获取series(词云图) */
function getWordCloudSeries(data, dimension, measure, axis) {
    var series = new Array();
    series.push({
        name: "示例",
        type: "wordCloud",
        left: 'center',
        top: 'center',
        width: '70%',
        height: '80%',
        shuffle: false,
        data: []
    });

    /** 1个维度、1个度量 */
    if (dimension.length === 1 && measure.length === 1) {
        /** 按维度分组 */
        let axisGroup = Enumerable.From(data).Where(
            function(item) { 
                return item[dimension[0].aliasName] != "NULL" && item[dimension[0].aliasName] != "" && 
                        item[measure[0].aliasName] != "NULL" && item[measure[0].aliasName] != ""; 
            }
        ).GroupBy(
            function(item) { 
                return item[dimension[0].aliasName];
            }
        ).Select(
            function(item) {
                return item.source;
            }
        ).ToArray();

        /** 按measure求和 */
        let obj_data = {};
        for(let axisItem of axisGroup) {
            let axisName = axisItem[0][dimension[0].aliasName];

            let value = Enumerable.From(axisItem).Sum(
                function(item) {
                    return Number(item[measure[0].aliasName]);
                }
            );
            obj_data[axisName] = value;
        }

        /** 遍历全字段的axis数组 */
        let array_data = [];
        for(let axisName of axis) {
            let value = _.isUndefined(obj_data[axisName]) ? 0 : obj_data[axisName];
            array_data.push({ 
                name: axisName, 
                value: value,
                textStyle: {
                    normal: {
                        color: 'rgb(' + [
                            Math.round(Math.random() * 160),
                            Math.round(Math.random() * 160),
                            Math.round(Math.random() * 160)
                        ].join(',') + ')'
                    }
                }
            });
        }

        /** 添加到series */
        series[0].data = array_data;
        series[0].name = dimension[0].displayName;
    }

    return series;
}

/** 获取series(饼图) */
function getPieSeries(data, dimension, measure) {
    var legendData = [];
    var series = {
        type: 'pie',
        data: [],
        itemStyle: {
            emphasis: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
        }
    }

    /** 1个维度、1个度量 */
    if (dimension.length === 1 && measure.length === 1) {
        /** 按维度分组 */
        let axisGroup = Enumerable.From(data).Where(
            function(item) { 
                return item[dimension[0].aliasName] != "NULL" && item[dimension[0].aliasName] != "" && 
                        item[measure[0].aliasName] != "NULL" && item[measure[0].aliasName] != "" && item[measure[0].aliasName] != 0; 
            }
        ).GroupBy(
            function(item) { 
                return item[dimension[0].aliasName];
            }
        ).Select(
            function(item) {
                return item.source;
            }
        ).ToArray();

        /** 按measure求和 */
        let array_data = [];
        for(let axisItem of axisGroup) {
            let axisName = axisItem[0][dimension[0].aliasName];

            let value = Enumerable.From(axisItem).Sum(
                function(item) {
                    return Number(item[measure[0].aliasName]);
                }
            );

            array_data.push({ name: axisName, value: value });
            legendData.push(axisName);
        }

        /** 添加到series */
        series.data = array_data;
    }

    return {
        legendData: legendData,
        series: series
    };
}

/** 获取series(散点地图) */
function getScatterMapSeries(data, dimension, measure, axis) {
    let series = new Array();
    let legendData = []; 

    /** 当维度、度量符合条件时 */
    if(dimension.length === 2 && measure.length === 1) {
        /** 按图例(维度2)分组 */
        let legendGroup = Enumerable.From(data).Where(
            function(item) { 
                return item[dimension[0].aliasName] != "NULL" && item[dimension[0].aliasName] != "" && 
                        item[dimension[1].aliasName] != "NULL" && item[dimension[1].aliasName] != "" &&
                        item[measure[0].aliasName] != "NULL" && item[measure[0].aliasName] != ""; 
            }
        ).GroupBy(
            function(item) { 
                return item[dimension[1].aliasName];
            }
        ).Select(
            function(item) {
                return item.source;
            }
        ).ToArray();

        /** 按axis(维度1)分组 */
        for(let legendItem of legendGroup) {
            let max = 0;
            let legendName = legendItem[0][dimension[1].aliasName];
            let axisGroup = Enumerable.From(legendItem).Select(
                function(item) {
                    return { [dimension[0].aliasName]: item[dimension[0].aliasName], [measure[0].aliasName]: item[measure[0].aliasName] };
                }
            ).GroupBy(
                function(item) {
                    return item[dimension[0].aliasName];
                }
            ).Select(
                function(item) {
                    return item.source;
                }
            ).ToArray();

            /** 按measure求和 */
            let obj_data = {};
            for(let axisItem of axisGroup) {
                let axisName = axisItem[0][dimension[0].aliasName];

                let value = Enumerable.From(axisItem).Sum(
                    function(item) {
                        return Number(item[measure[0].aliasName]);
                    }
                );
                max = Math.max(value, max);
                obj_data[axisName] = value;
            }

            /** 遍历全字段的axis数组 */
            let array_data = [];
            for(let axisName of axis) {
                let value = _.isUndefined(obj_data[axisName]) ? 0 : obj_data[axisName];
                array_data.push({
                    name: axisName.split(',')[0],
                    value: [axisName.split(',')[1], axisName.split(',')[2], value]    
                });
            }

            /** 添加到series && legend */
            const maxPointDiameter = 30.0;
            const proportion = maxPointDiameter / max;
            legendData.push(legendName);
            series.push({
                name: legendName,
                type: 'scatter',
                coordinateSystem: 'geo',
                data: array_data,
                symbolSize: function (val) {
                    return val[2] * proportion;
                }
            });
        }
    }
    return {
        series: series,
        legendData: legendData    
    };
}

/** 获取series(气泡图) */
function getBubbleSeries(data, dimension, measure, axis) {
    var series = new Array();
    var legendData = []; 
    var max = 0;

    /** 1个维度、1个度量 */
    if(dimension.length === 1 && measure.length === 1) {
        /** 按维度1分组 */
        let axisGroup = Enumerable.From(data).Where(
            function(item) { 
                return item[dimension[0].aliasName] != "NULL" && item[dimension[0].aliasName] != "" && 
                        item[measure[0].aliasName] != "NULL" && item[measure[0].aliasName] != ""; 
            }
        ).GroupBy(
            function(item) { 
                return item[dimension[0].aliasName];
            }
        ).Select(
            function(item) {
                return item.source;
            }
        ).ToArray();

        /** 按measure求和 */
        let obj_data = {};
        for(let axisItem of axisGroup) {
            let axisName = axisItem[0][dimension[0].aliasName];

            let value = Enumerable.From(axisItem).Sum(
                function(item) {
                    return Number(item[measure[0].aliasName]);
                }
            );
            max = Math.max(value, max);
            obj_data[axisName] = value;
        }

        /** 遍历全字段的axis数组 */
        let array_data = [];
        for(let axisName of axis) {
            let value = _.isUndefined(obj_data[axisName]) ? 0 : obj_data[axisName];
            array_data.push(value);
        }

        /** 添加到series && legend */
        legendData.push(measure[0].displayName);
        series.push({
            name: measure[0].displayName,
            type: 'scatter',
            data: array_data
        });
    }

    /** 2个维度、1个度量 */
    else if(dimension.length === 2 && measure.length === 1) {
        /** 按图例(维度2)分组 */
        let legendGroup = Enumerable.From(data).Where(
            function(item) { 
                return item[dimension[0].aliasName] != "NULL" && item[dimension[0].aliasName] != "" && 
                        item[dimension[1].aliasName] != "NULL" && item[dimension[1].aliasName] != "" &&
                        item[measure[0].aliasName] != "NULL" && item[measure[0].aliasName] != ""; 
            }
        ).GroupBy(
            function(item) { 
                return item[dimension[1].aliasName];
            }
        ).Select(
            function(item) {
                return item.source;
            }
        ).ToArray();

        for(let legendItem of legendGroup) {
            let legendName = legendItem[0][dimension[1].aliasName];
            let axisGroup = Enumerable.From(legendItem).Select(
                function(item) {
                    return { [dimension[0].aliasName]: item[dimension[0].aliasName], [measure[0].aliasName]: item[measure[0].aliasName] };
                }
            ).GroupBy(
                function(item) {
                    return item[dimension[0].aliasName];
                }
            ).Select(
                function(item) {
                    return item.source;
                }
            ).ToArray();

            /** 按measure求和 */
            let obj_data = {};
            for(let axisItem of axisGroup) {
                let axisName = axisItem[0][dimension[0].aliasName];

                let value = Enumerable.From(axisItem).Sum(
                    function(item) {
                        return Number(item[measure[0].aliasName]);
                    }
                );
                max = Math.max(value, max);
                obj_data[axisName] = value;
            }

            /** 遍历全字段的axis数组 */
            let array_data = [];
            for(let axisName of axis) {
                let value = _.isUndefined(obj_data[axisName]) ? 0 : obj_data[axisName];
                array_data.push(value);
            }

            /** 添加到series && legend */
            legendData.push(legendName);
            series.push({
                name: legendName,
                type: 'scatter',
                data: array_data
            });
        }
    }

    /** 1个维度、2个度量 */
    else if(dimension.length === 1 && measure.length === 2) {
        /** 按维度分组 */
        let axisGroup = Enumerable.From(data).Where(
            function(item) { 
                return item[dimension[0].aliasName] != "NULL" && item[dimension[0].aliasName] != "" && 
                        item[measure[0].aliasName] != "NULL" && item[measure[0].aliasName] != "" &&
                        item[measure[1].aliasName] != "NULL" && item[measure[1].aliasName] != ""; 

            }
        ).GroupBy(
            function(item) { 
                return item[dimension[0].aliasName];
            }
        ).Select(
            function(item) {
                return item.source;
            }
        ).ToArray();

        /** 按measure求和 */
        let obj_data = {};
        for(let axisItem of axisGroup) {
            let axisName = axisItem[0][dimension[0].aliasName];

            let value1 = Enumerable.From(axisItem).Sum(
                function(item) {
                    return Number(item[measure[0].aliasName]);
                }
            );
            let value2 = Enumerable.From(axisItem).Sum(
                function(item) {
                    return Number(item[measure[1].aliasName]);
                }
            );

            max = Math.max(value2, max);
            obj_data[axisName] = [value1, value2];
        }

        /** 遍历全字段的axis数组 */
        let array_data = [];
        for(let axisName of axis) {
            let value = _.isUndefined(obj_data[axisName]) ? [0, 0] : obj_data[axisName];
            value.unshift(axisName);
            array_data.push(value);
        }

        /** 添加到series && legend */
        legendData.push(dimension[0].displayName);
        series.push({
            name: dimension[0].displayName,
            type: 'scatter',
            data: array_data
        });
    }

    /** 2个维度、2个度量 */
    else if(dimension.length === 2 && measure.length === 2) {
        /** 按图例(维度2)分组 */
        let legendGroup = Enumerable.From(data).Where(
            function(item) { 
                return item[dimension[0].aliasName] != "NULL" && item[dimension[0].aliasName] != "" && 
                        item[dimension[1].aliasName] != "NULL" && item[dimension[1].aliasName] != "" &&
                        item[measure[0].aliasName] != "NULL" && item[measure[0].aliasName] != "" &&
                        item[measure[1].aliasName] != "NULL" && item[measure[1].aliasName] != "";
            }
        ).GroupBy(
            function(item) { 
                return item[dimension[1].aliasName];
            }
        ).Select(
            function(item) {
                return item.source;
            }
        ).ToArray();

        for(let legendItem of legendGroup) {
            let legendName = legendItem[0][dimension[1].aliasName];
            let axisGroup = Enumerable.From(legendItem).Select(
                function(item) {
                    return { [dimension[0].aliasName]: item[dimension[0].aliasName], [measure[0].aliasName]: item[measure[0].aliasName], [measure[1].aliasName]: item[measure[1].aliasName] };
                }
            ).GroupBy(
                function(item) {
                    return item[dimension[0].aliasName];
                }
            ).Select(
                function(item) {
                    return item.source;
                }
            ).ToArray();

            /** 按measure求和 */
            let obj_data = {};
            for(let axisItem of axisGroup) {
                let axisName = axisItem[0][dimension[0].aliasName];

                let value1 = Enumerable.From(axisItem).Sum(
                    function(item) {
                        return Number(item[measure[0].aliasName]);
                    }
                );

                let value2 = Enumerable.From(axisItem).Sum(
                    function(item) {
                        return Number(item[measure[1].aliasName]);
                    }
                );

                max = Math.max(value2, max);
                obj_data[axisName] = [value1, value2];
            }

            /** 遍历全字段的axis数组 */
            let array_data = [];
            for(let axisName of axis) {
                let value = _.isUndefined(obj_data[axisName]) ? [0, 0] : obj_data[axisName];
                value.unshift(axisName);
                array_data.push(value);
            }

            /** 添加到series && legend */
            legendData.push(legendName);
            series.push({
                name: legendName,
                type: 'scatter',
                data: array_data
            });
        }
    }

    /** return */
    const maxPointDiameter = 80.0;
    const proportion = maxPointDiameter / max;

    _.each(series, function(item) {
        item.symbolSize = function (data) {
            if(data instanceof Array)
                return data[2] * proportion;
            else
                return data * proportion;
        }
    });

    return {
        legendData: legendData, 
        series: series
    };
}

/** 获取indicator字段(雷达图) */
function getRadarIndicator(axis, data_series) {
    var max = 0;
    _.map(data_series, function (item) {
        let itemMax = Math.max.apply(null, item.value);
        max = (itemMax > max) ? itemMax : max;
    })

    return _.map(axis, function (item) {
        return {name: item, max: max};
    })
}

export default { getTableData, getColumn, getLegend, getAxisName, getGridSeries, getScatterMapSeries, getBubbleSeries, getWordCloudSeries, getPieSeries, getRadarIndicator };

