import React from 'react';
import Notify from 'nova-notify';
import Loaders from "utility/loaders";
import DataProcess from './charts-data-process';
import Themes from "./charts-themes";
/** echarts for react */
import Chart from 'widget/rc-echarts';
import 'echarts/map/js/china';
/** echarts extension wordcloud */
import echarts from 'echarts';
require('echarts-wordcloud');
/** tables */
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import ReactDataGrid from 'react-data-grid';
import { Table } from 'antd';
const FileSaver = require('utility/FileSaver/FileSaver');
import uuid from 'node-uuid';



/** 说明 */
/** 
 *  柱状图、折线图：1个维度、1个度量(legend)|| 1个维度、2个度量(legend) || 2个维度(legend)、1个度量
 *  饼图：1个维度、1个度量
 *  雷达图：1个维度、n个度量 || 2个维度、1个度量
 *  气泡图：1个维度、1个度量(legend)|| 1个维度、2个度量(legend) || 2个维度(legend)、1个度量 || 2+2
 *  词云图：1个维度、1个度量
 *  热力地图：1个维度、1个度量
 *  散点地图：2个维度、1个度量
 */

/** Line Chart */
var Line = React.createClass({
    
    propTypes: {
        /** 数据显示 */
        title: React.PropTypes.string,
        dimension: React.PropTypes.array,
        measure: React.PropTypes.array,
        data: React.PropTypes.array,
        /** 图表外观 */
        height: React.PropTypes.number.isRequired,        
        showTitle: React.PropTypes.bool,
        titlePosition: React.PropTypes.string,
        showLegend: React.PropTypes.bool,
        legendPosition: React.PropTypes.string,
        showTooltip: React.PropTypes.bool,
        transverse: React.PropTypes.bool,
        area: React.PropTypes.bool,
        smooth: React.PropTypes.bool,
        showX: React.PropTypes.bool,
        showY: React.PropTypes.bool,
        showAxisName: React.PropTypes.bool,
        theme: React.PropTypes.string,
        /** render 控制 */
        width: React.PropTypes.number.isRequired
    },

    getInitialState() {  
        var { legendData, xAxis, series } = this.getDataConfig(this.props);
        var options = this.getOptions(legendData, xAxis, series, this.props);

        return {
            legendData: legendData,
            xAxis: xAxis,
            series: series,
            options: options,
            shouldRender: false
        };
    },

    componentDidMount() {
        let width = $('#chart-container-' + this.props.id).innerWidth();
        if(width != this.props.width) {
            this.props.width = width;
            var options = this.getOptions(this.state.legendData, this.state.xAxis, this.state.series, this.props);
            this.setState({ options: options, shouldRender: true });
        }
    },

    componentWillReceiveProps(nextProps) {
        if(_.isEqual(this.props, nextProps)) {
            this.setState({ shouldRender: false });            
        }
        else {
            var { legendData, xAxis, series } = this.state;

            /** DataProcess需要的数据变化，则重新进行sql搜索整合 */
            if(this.props.dimension !== nextProps.dimension || this.props.measure !== nextProps.measure ||
                this.props.data !== nextProps.data || this.props.transverse !== nextProps.transverse) {
                let dataConfig = this.getDataConfig(nextProps);
                legendData = dataConfig.legendData;
                xAxis = dataConfig.xAxis;
                series = dataConfig.series;
            }

            /** 获取新的options */
            var options = this.getOptions(legendData, xAxis, series, nextProps);

            this.setState({ 
                legendData: legendData,
                xAxis: xAxis,
                series: series,
                options: options,
                shouldRender: true   
            })
        }
    },

    shouldComponentUpdate(nextProps, nextState) {
        return nextState.shouldRender;
    },

    getDataConfig(props) {
        /** x轴 */
        var xAxis = DataProcess.getAxisName(props.dimension, props.data);
        /** 数据 */
        var res = DataProcess.getGridSeries('line', props.data, props.dimension, props.measure, xAxis, props.transverse);
        var legendData = res.legendData;
        var series =  res.series;

        return {
            legendData: legendData,
            xAxis: xAxis,
            series: series
        };
    },

    getOptions(legendData, xAxis, series, props) {
        /** 图例 */
        let legend;
        let gridLeft = props.transverse ? (10 + 160) : 80, gridRight = 80, gridTop = 60, gridBottom = 60;
        let scrollBottom = 10, scrollLeft = 10;
        if(legendData.length > 20) {
            /** 限制图例展示个数 */
            legendData = legendData.slice(0, 20);
            legendData.push("······");
            series.push({ name: '······', type:'line' });
        }
        switch(props.legendPosition) {
            case 'top': {
                legend = {
                    top: 30,
                    left: "center",
                    orient: "horizontal",
                    show: props.showLegend,
                    data: legendData                    
                };
                if(props.showLegend && legendData.length > 0) {
                    let memberNumber = Math.floor(props.width / 160);
                    let lineNumber = Math.ceil(legendData.length / memberNumber);
                    gridTop = 30 + (lineNumber * 25) + 20;
                }
                break;
            }
            case 'bottom': {
                legend = {
                    bottom: 10,
                    left: 'center',
                    orient: 'horizontal',
                    show: props.showLegend,
                    data: legendData                    
                }
                if(props.showLegend && legendData.length > 0) {
                    let memberNumber = Math.floor(props.width / 160);
                    let lineNumber = Math.ceil(legendData.length / memberNumber);
                    let scrollHeight = props.transverse ? 0 : 40;
                    gridBottom = 20 + scrollHeight + (lineNumber * 25) + 10;
                    scrollBottom = (lineNumber * 25) + 10;
                }
                break;
            }
            case 'left':
                legend = {
                    top: "center",
                    orient: "vertical",
                    left: "left",
                    show: props.showLegend,
                    data: legendData                    
                }
                if(props.showLegend && legendData.length > 0) {
                    let memberNumber = Math.floor((props.height - 100) / 25);
                    let columnNumber = Math.ceil(legendData.length / memberNumber);
                    let scrollHeight = props.transverse ? 40 + 120 : 120;
                    gridLeft = (columnNumber * 160) + scrollHeight;
                    scrollLeft = (columnNumber * 160);
                }
                break;
            case 'right':
                legend = {
                    top: "center",
                    orient: "vertical",
                    left: "right",
                    show: props.showLegend,
                    data: legendData                    
                }
                if(props.showLegend && legendData.length > 0) {
                    let memberNumber = Math.floor((props.height - 100) / 25);                    
                    let columnNumber = Math.ceil(legendData.length / memberNumber);
                    gridRight = (columnNumber * 160) + 120;
                }
                break;
            default: {
                legend = {
                    data: legendData,
                    show: props.showLegend
                };
                break;
            }
        }

        
        /** y轴 */
        var yAxis = _.map(props.measure, function(li_measure) {
            return {
                type: 'value',
                boundaryGap: false,
                name: props.showAxisName ? li_measure.displayName : '',
                axisLabel: { show: props.showY },
                splitLine: { lineStyle: { type: 'dashed' } }
            };
        });
        if(yAxis.length === 0) {
            yAxis = [{
                type: 'value',
                boundaryGap: false,            
                name: props.showAxisName ? '轴标题' : '',
                axisLabel: { show: props.showY },
                splitLine: { lineStyle: { type: 'dashed' } }
            }];
        }
        
        /** options */
        var options = {
            color:['#333','#919e8b','#b7a4a4', '#d7ab82',  '#6e7074','#61a0a8','#efa18d', '#787464', '#cc7e63', '#724e58', '#4b565b','#d87c7c'],
            title: {
                text: props.title === "" ? "未命名图表" : props.title,
                right: props.titlePosition === 'right' ? '15' : 'auto',
                left: props.titlePosition === 'right' ? 'auto' : props.titlePosition,
                show: props.showTitle
            },
            tooltip: {
                axisPointer: { type: "line" },
                show: props.showTooltip
            },
            legend: legend,
            grid: {
                top: gridTop,
                right: gridRight,
                bottom: gridBottom,
                left: gridLeft
            },
            dataZoom: [{
                handleSize: 8,
                type: 'slider',
                xAxisIndex: [0],
                filterMode: 'empty',
                bottom: scrollBottom
            }],
            xAxis: [{  
                type: 'category',
                boundaryGap: false,
                name: props.showAxisName ? (props.dimension.length === 0 ? '轴标题' : props.dimension[0].displayName) : '',
                data: xAxis,
                axisLabel: { show: props.showX },
                splitLine: { lineStyle: { type: 'dashed' } }
            }],
            yAxis: yAxis,
            series: series,
            animation: false
        };

        /** 翻转 */
        if(props.transverse) {
            var tmp = options.xAxis;
            options.xAxis = options.yAxis;
            options.yAxis = tmp;

            options.dataZoom = [{
                type: 'slider',
                yAxisIndex: [0],
                filterMode: 'filter',
                left: scrollLeft
            }];
        }

        /** 面积 && 平滑曲线*/
        _.each(options.series, function(item) {
            if(props.area)
                item.areaStyle = { normal: {} };
            else
                delete item.areaStyle;                    
            item.smooth = props.smooth;              
        });

        /** 主题风格 */
        // if(props.theme !== "none") {
            let themeStyle = Themes.importTheme(props.theme);
            options = this.applyTheme(options, themeStyle);
        // }
        return options;
    },

    applyTheme(options, themeStyle) {
        options.color = themeStyle.color;
        options.backgroundColor = themeStyle.backgroundColor;
        options.textStyle = themeStyle.textStyle;
        options.legend = _.assign({}, options.legend, themeStyle.legend);
        options.title = _.assign({}, options.title, themeStyle.title);
        options.tooltip = _.assign({}, options.tooltip, themeStyle.tooltip);
        options.dataZoom = _.map(options.dataZoom, function(item) {
            return _.assign({}, item, themeStyle.dataZoom); 
        }); 
        options.xAxis = _.map(options.xAxis, function(item) {
            return _.assign({}, item, themeStyle.axis);
        });
        options.yAxis = _.map(options.yAxis, function(item) {
            return _.assign({}, item, themeStyle.axis);
        });
        return options;
    },

    render() {
        return (
            <Chart options={ this.state.options } style={{ height:this.props.height }} />
        );
    }
});

/** Bar Chart */
var Bar = React.createClass({

    propTypes: {
        /** 数据显示 */
        title: React.PropTypes.string,
        data: React.PropTypes.array,
        dimension: React.PropTypes.array,
        measure: React.PropTypes.array,
        /** 图表外观 */
        height: React.PropTypes.number.isRequired,
        showTitle: React.PropTypes.bool,
        titlePosition: React.PropTypes.string,
        showLegend: React.PropTypes.bool,
        legendPosition: React.PropTypes.string,
        showTooltip: React.PropTypes.bool,
        transverse: React.PropTypes.bool,
        showX: React.PropTypes.bool,
        showY: React.PropTypes.bool,
        showAxisName: React.PropTypes.bool,
        theme: React.PropTypes.string,
        /** render 控制 */
        width: React.PropTypes.number.isRequired
    },

    getInitialState() {
        var { legendData, xAxis, series } = this.getDataConfig(this.props);
        var options = this.getOptions(legendData, xAxis, series, this.props);

        return {
            legendData: legendData,
            xAxis: xAxis,
            series: series,
            options: options,
            shouldRender: false
        };
    },

    componentDidMount() {        
        let width = $('#chart-container-' + this.props.id).innerWidth();
        if(width != this.props.width) {
            this.props.width = width;
            var options = this.getOptions(this.state.legendData, this.state.xAxis, this.state.series, this.props);
            this.setState({ options: options, shouldRender: true });
        }
    },

    componentWillReceiveProps(nextProps) {
        if(_.isEqual(this.props, nextProps)) {
            this.setState({ shouldRender: false });            
        }
        else {
            var { legendData, xAxis, series } = this.state;
            
            /** DataProcess需要的数据变化，则重新进行sql搜索整合 */
            if(this.props.dimension !== nextProps.dimension || this.props.measure !== nextProps.measure ||
                this.props.data !== nextProps.data || this.props.transverse !== nextProps.transverse) {
                let dataConfig = this.getDataConfig(nextProps);
                legendData = dataConfig.legendData;
                xAxis = dataConfig.xAxis;
                series = dataConfig.series;
            }

            /** 获取新的options */
            var options = this.getOptions(legendData, xAxis, series, nextProps);
            this.setState({ 
                legendData: legendData,
                xAxis: xAxis,
                series: series,
                options: options,
                shouldRender: true    
            });
        }
    },

    shouldComponentUpdate(nextProps, nextState) {
        return nextState.shouldRender;
    },

    getDataConfig(props) {
        var xAxis = DataProcess.getAxisName(props.dimension, props.data);

        var res = DataProcess.getGridSeries('bar', props.data, props.dimension, props.measure, xAxis, props.transverse);
        var series = res.series;
        var legendData = res.legendData;

        return { legendData: legendData, xAxis: xAxis, series: series };
    },

    getOptions(legendData, xAxis, series, props) {
        /** 图例 */
        let legend;
        let gridLeft = props.transverse ? (10 + 160) : 80, gridRight = 80, gridTop = 60, gridBottom = 60;
        let scrollBottom = 10, scrollLeft = 90;
        if(legendData.length > 20) {
            /** 限制图例展示个数 */
            legendData = legendData.slice(0, 20);
            legendData.push("······");
            series.push({ name: '······', type:'line' });
        }
        switch(props.legendPosition) {
            case 'top': {
                legend = {
                    top: 25,
                    left: "center",
                    orient: "horizontal",
                    show: props.showLegend,
                    data: legendData                    
                };
                if(props.showLegend && legendData.length > 0) {
                    let memberNumber = Math.floor(props.width / 160);
                    let lineNumber = Math.ceil(legendData.length / memberNumber);
                    gridTop = 30 + (lineNumber * 25) + 20;
                    scrollLeft = 90;
                }
                break;
            }
            case 'bottom': {
                legend = {
                    bottom: 10,
                    left: 'center',
                    orient: 'horizontal',
                    show: props.showLegend,
                    data: legendData                    
                }
                if(props.showLegend && legendData.length > 0) {
                    let memberNumber = Math.floor(props.width / 160);
                    let lineNumber = Math.ceil(legendData.length / memberNumber);
                    let scrollHeight = props.transverse ? 0 : 40;
                    gridBottom = 20 + scrollHeight + (lineNumber * 25) + 10;
                    scrollBottom = (lineNumber * 25) + 10;
                    scrollLeft = 90;
                }
                break;
            }
            case 'left':
                legend = {
                    top: "center",
                    orient: "vertical",
                    left: 5,
                    show: props.showLegend,
                    data: legendData                    
                }
                if(props.showLegend && legendData.length > 0) {
                    let memberNumber = Math.floor((props.height - 100) / 25);
                    let columnNumber = Math.ceil(legendData.length / memberNumber);
                    let scrollHeight = props.transverse ? 40 + 120 : 120;
                    gridLeft = (columnNumber * 160) + scrollHeight;
                    scrollLeft = 150;
                }
                break;
            case 'right':
                legend = {
                    top: "center",
                    orient: "vertical",
                    left: "right",
                    show: props.showLegend,
                    data: legendData                    
                }
                if(props.showLegend && legendData.length > 0) {
                    let memberNumber = Math.floor((props.height - 100) / 25);                    
                    let columnNumber = Math.ceil(legendData.length / memberNumber);
                    gridRight = (columnNumber * 160) + 120;
                    scrollLeft = '20%';
                }
                break;
            default: {
                legend = {
                    data: legendData,
                    show: props.showLegend
                };
                break;
            }
        }

        /** y轴 */
        var yAxis = _.map(props.measure, function(li_measure) {
            return {
                type: 'value',
                name: props.showAxisName ? li_measure.displayName : '',
                axisLabel: { show: props.showY },
                splitLine: { lineStyle: { type: 'dashed' } }
            };
        });
        if(yAxis.length === 0) {
            yAxis = [{
                type: 'value',
                name: props.showAxisName ? '轴标题' : '',
                axisLabel: { show: props.showY },
                splitLine: { lineStyle: { type: 'dashed' } }
            }];
        }

        /** options */ 
        var options = {
            color:['#333','#b7a4a4','#d87c7c','#919e8b', '#d7ab82',  '#6e7074','#61a0a8','#efa18d', '#787464', '#cc7e63', '#724e58', '#4b565b'],
            title: {
                text: props.title === "" ? "未命名图表" : props.title,
                right: props.titlePosition === 'right' ? '15' : 'auto',
                left: props.titlePosition === 'right' ? 'auto' : props.titlePosition,
                show: props.showTitle
            },
            tooltip: {
                axisPointer : { type: 'shadow' },
                show: props.showTooltip
            },
            legend: legend,
            grid: {
                top: gridTop,
                right: gridRight,
                bottom: gridBottom,
                left: gridLeft
            },
            dataZoom: [{
                type: 'slider',
                xAxisIndex: [0],
                filterMode: 'filter',
                bottom: scrollBottom
            }],
            xAxis: [{
                type: 'category',
                name: props.showAxisName ? (props.dimension.length === 0 ? '轴标题' : props.dimension[0].displayName) : '',
                data: xAxis,
                axisLabel: { show: props.showX },
                splitLine: { lineStyle: { type: 'dashed' } }
            }],
            yAxis: yAxis,
            series: series,
            animation: false
        };

        /** 翻转 */
        if(props.transverse) {
            var tmp = options.xAxis;
            options.xAxis = options.yAxis;
            options.yAxis = tmp;

            options.dataZoom = [{
                type: 'slider',
                yAxisIndex: [0],
                filterMode: 'filter',
                left: scrollLeft
            }];
        }

        /** 主题风格 */
        // if(props.theme !== "none") {
            let themeStyle = Themes.importTheme(props.theme);
            options = this.applyTheme(options, themeStyle);
        // }

        return options;
    },

    applyTheme(options, themeStyle) {
        options.color = themeStyle.color;
        options.backgroundColor = themeStyle.backgroundColor;
        options.textStyle = themeStyle.textStyle;
        options.legend = _.assign({}, options.legend, themeStyle.legend);
        options.title = _.assign({}, options.title, themeStyle.title);
        options.tooltip = _.assign({}, options.tooltip, themeStyle.tooltip);
        options.dataZoom = _.map(options.dataZoom, function(item) {
            return _.assign({}, item, themeStyle.dataZoom); 
        }); 
        options.xAxis = _.map(options.xAxis, function(item) {
            return _.assign({}, item, themeStyle.axis);
        });
        options.yAxis = _.map(options.yAxis, function(item) {
            return _.assign({}, item, themeStyle.axis);
        });
        return options;
    },

    render() {      
        return (
            <Chart options={ this.state.options } style={{ height:this.props.height }} />
        );
    }
});

/** Pie Chart */
var Pie = React.createClass({

    propTypes: {
        /** 数据显示 */
        title: React.PropTypes.string,
        data: React.PropTypes.array,
        dimension: React.PropTypes.array,
        measure: React.PropTypes.array,
        /** 图表外观 */
        height: React.PropTypes.number.isRequired,        
        showTitle: React.PropTypes.bool,
        titlePosition: React.PropTypes.string,
        showLegend: React.PropTypes.bool,
        legendPosition: React.PropTypes.string,
        showTooltip: React.PropTypes.bool,
        showAxisName: React.PropTypes.bool,
        mode: React.PropTypes.string,
        tooltipStyle: React.PropTypes.number,
        theme: React.PropTypes.string,
        /** render 控制 */
        width: React.PropTypes.number.isRequired
    },

    getInitialState() {
        var { legendData, series } = this.getDataConfig(this.props);
        var options = this.getOptions(legendData, series, this.props);

        return {
            legendData: legendData,
            series: series,
            options: options,
            shouldRender: false 
        };
    },

    componentDidMount() {
        let width = $('#chart-container-' + this.props.id).innerWidth();
        if(width != this.props.width) {
            this.props.width = width;
            var options = this.getOptions(this.state.legendData, this.state.series, this.props);
            this.setState({ options: options, shouldRender: true });
        }
    },

    componentWillReceiveProps(nextProps) {
        if(_.isEqual(this.props, nextProps)) {
            this.setState({ shouldRender: false });            
        }
        else {
            var { legendData, series } = this.state;
            
            /** DataProcess需要的数据变化，则重新进行sql搜索整合 */
            if(this.props.dimension !== nextProps.dimension || this.props.measure !== nextProps.measure ||
                this.props.data !== nextProps.data) {
                let dataConfig = this.getDataConfig(nextProps);
                legendData = dataConfig.legendData;
                series = dataConfig.series;
            }

            /** 获取新的options */
            var options = this.getOptions(legendData, series, nextProps);
            this.setState({ 
                legendData: legendData,
                series: series,
                options: options,
                shouldRender: true
            })
        }
    },

    shouldComponentUpdate(nextProps, nextState) {
        return nextState.shouldRender;
    },

    getDataConfig(props) {
        var res = DataProcess.getPieSeries(props.data, props.dimension, props.measure);
        
        var series = res.series;
        (series.data.length === 0) && (series.data = [{ name:'示例1', value:'50' }, { name:'示例2', value:'50' }, { name:'示例3', value:'50' }]);
        var legendData = res.legendData;
        (legendData.length === 0) && (legendData = ["示例1", "示例2", "示例3"]);

        return { legendData: legendData, series: series };
    },

    getOptions(legendData, series, props) {

        /** 图例 */
        let legend;
        let radius = Math.min(props.width, props.height) / 2 * 0.55;
        let center = ["50%", "50%"];

        legendData = _.map(series.data, function(item) { return item.name });
        if(legendData.length > 20) {
            /** 限制图例展示个数 */
            legendData = legendData.slice(0, 20);
            legendData.push("······");
            series.data.push({ name: '······' });
        }
        switch(props.legendPosition) {
            case 'top': {
                legend = {
                    top: 30,
                    left: "center",
                    orient: "horizontal",
                    show: props.showLegend,
                    data: legendData                    
                };
                if(props.showLegend && legendData.length > 0) {
                    let memberNumber = Math.floor(props.width / 160);
                    let lineNumber = Math.ceil(legendData.length / memberNumber);
                    let marginTop = 30 + (lineNumber * 25);

                    radius = Math.min((props.height - marginTop - 200), props.width - 200) / 2;
                    center = ["50%", props.height / 2 + marginTop / 2];
                }
                break;
            }
            case 'bottom': {
                legend = {
                    bottom: 10,
                    left: 'center',
                    orient: 'horizontal',
                    show: props.showLegend,
                    data: legendData                    
                }
                if(props.showLegend && legendData.length > 0) {
                    let memberNumber = Math.floor(props.width / 160);
                    let lineNumber = Math.ceil(legendData.length / memberNumber);
                    let marginBottom = 30 + (lineNumber * 25);

                    radius = Math.min((props.height - marginBottom - 200), props.width - 200) / 2;
                    center = ["50%", props.height / 2 - marginBottom / 2];
                }
                break;
            }
            case 'left':
                legend = {
                    top: "center",
                    orient: "vertical",
                    left: "left",
                    show: props.showLegend,
                    data: legendData                    
                }
                if(props.showLegend && legendData.length > 0) {
                    let memberNumber = Math.floor((props.height - 100) / 25);
                    let columnNumber = Math.ceil(legendData.length / memberNumber);
                    let marginLeft = columnNumber * 160;

                    radius = Math.min((props.width - marginLeft - 200), props.height - 200) / 2;
                    center = [props.width / 2 + marginLeft / 2, "50%"];
                }
                break;
            case 'right':
                legend = {
                    top: "center",
                    orient: "vertical",
                    left: "right",
                    show: props.showLegend,
                    data: legendData                    
                }
                if(props.showLegend && legendData.length > 0) {
                    let memberNumber = Math.floor((props.height - 100) / 25);
                    let columnNumber = Math.ceil(legendData.length / memberNumber);
                    let marginRight = columnNumber * 160;

                    radius = Math.min((props.width - marginRight - 200), props.height - 200) / 2;
                    center = [props.width / 2 - marginRight / 2, "50%"];
                }
                break;
            default: {
                legend = {
                    data: legendData,
                    show: props.showLegend
                };
                break;
            }
        }

        /** options */
        var options = {
            color:['#333','#b7a4a4','#d87c7c','#919e8b', '#d7ab82',  '#6e7074','#61a0a8','#efa18d', '#787464', '#cc7e63', '#724e58', '#4b565b'],
            title: {
                text: props.title === "" ? "未命名图表" : props.title,
                right: props.titlePosition === 'right' ? '15' : 'auto',
                left: props.titlePosition === 'right' ? 'auto' : props.titlePosition,
                show: props.showTitle
            },
            tooltip: {
                trigger: 'item',
                show: props.showTooltip
            },
            legend: legend,
            series: series,
            animation: false
        };

        /** 提示样式 */
        switch(props.tooltipStyle) {
            case 1:
                options.tooltip.formatter = "{b}";
                break;
            case 2:
                options.tooltip.formatter = "{b}, {c}";
                break;
            case 3:
                options.tooltip.formatter = "{b}, {d}%";
                break;
            case 4:
                options.tooltip.formatter = "{b}, {c} ({d}%)";
                break;
        }
    
        /** 模式 */
        switch(props.mode) {
            case 'default':
                options.series.radius = radius;
                options.series.center = center;
                break;
            case 'hollow':
                options.series.radius = [radius * 0.75, radius];
                options.series.center = center;
                break;                    
        }

        /** 主题风格 */
        // if(props.theme !== "none") {
            let themeStyle = Themes.importTheme(props.theme);
            options = this.applyTheme(options, themeStyle);
        // }

        return options;
    },

    applyTheme(options, themeStyle) {
        options.color = themeStyle.color;
        options.tableHeadColor = themeStyle.tableHeadColor;
        options.backgroundColor = themeStyle.backgroundColor;
        options.textStyle = themeStyle.textStyle;
        options.tooltip.backgroundColor = themeStyle.tooltip.backgroundColor;        
        options.legend = _.assign({}, options.legend, themeStyle.legend);
        options.title = _.assign({}, options.title, themeStyle.title);
        return options;
    },

    render() {
        return (
            <Chart options={ this.state.options } style={{ height:this.props.height }} />
        );
    }
});

/** Radar(雷达) Chart */
var Radar = React.createClass({

    propTypes: {
        /** 数据显示 */
        title: React.PropTypes.string,
        data: React.PropTypes.array,
        dimension: React.PropTypes.array,
        measure: React.PropTypes.array,
        /** 样式 */
        height: React.PropTypes.number.isRequired,        
        showTitle: React.PropTypes.bool,
        showLegend: React.PropTypes.bool,
        showTooltip: React.PropTypes.bool,
        titlePosition: React.PropTypes.string,
        legendPosition: React.PropTypes.string,
        area: React.PropTypes.bool,
        showAxisName: React.PropTypes.bool,
        theme: React.PropTypes.string,
        /** render控制 */
        width: React.PropTypes.number.isRequired
    },

    getInitialState() {
        var { legendData, indicator, data_series } = this.getDataConfig(this.props);
        var options = this.getOptions(legendData, indicator, data_series, this.props);

        return {
            legendData: legendData,
            indicator: indicator,
            data_series: data_series,
            options: options,
            shouldRender: false
        };
    },

    componentDidMount() {
        let width = $('#chart-container-' + this.props.id).innerWidth();
        if(width != this.props.width) {
            this.props.width = width;
            var options = this.getOptions(this.state.legendData, this.state.indicator, this.state.data_series, this.props);
            this.setState({ options: options, shouldRender: true });
        }
    },

    componentWillReceiveProps(nextProps) {
        if(_.isEqual(this.props, nextProps)) {
            this.setState({ shouldRender: false });            
        }
        else {
            var { legendData, indicator, data_series } = this.state;
            
            /** DataProcess需要的数据变化，则重新进行sql搜索整合 */
            if(this.props.dimension !== nextProps.dimension || this.props.measure !== nextProps.measure ||
                this.props.data !== nextProps.data) {
                let dataConfig = this.getDataConfig(nextProps);
                legendData = dataConfig.legendData;
                indicator = dataConfig.indicator;
                data_series = dataConfig.data_series;
            }

            /** 获取新的options */
            var options = this.getOptions(legendData, indicator, data_series, nextProps);
            this.setState({ 
                legendData: legendData,
                indicator: indicator,
                data_series: data_series,
                options: options,
                shouldRender: true    
            })
        }
    },

    shouldComponentUpdate(nextProps, nextState) {
        return nextState.shouldRender;
    },

    getDataConfig(props) {
        var axis = DataProcess.getAxisName(props.dimension, props.data);

        var res = DataProcess.getGridSeries('radar', props.data, props.dimension, props.measure, axis);
        var series = res.series;
        var legendData = res.legendData;

        var data_series = _.map(series, function(item) { return { name:item.name, value:item.data }; })
        var indicator = DataProcess.getRadarIndicator(axis, data_series);

        return { legendData: legendData, indicator: indicator, data_series: data_series };
    },

    getOptions(legendData, indicator, data_series, props) {
        /** 图例 */
        let legend;
        let radius = "55%";
        let center = ["50%", "50%"];

        if(legendData.length > 20) {
            /** 限制图例展示个数 */
            legendData = legendData.slice(0, 20);
            legendData.push("······");
            data_series.push({ name: '······' });
        }
        switch(props.legendPosition) {
            case 'top': {
                legend = {
                    top: 30,
                    left: "center",
                    orient: "horizontal",
                    show: props.showLegend,
                    data: legendData                    
                };
                if(props.showLegend && legendData.length > 0) {
                    let memberNumber = Math.floor(props.width / 160);
                    let lineNumber = Math.ceil(legendData.length / memberNumber);
                    let marginTop = 30 + (lineNumber * 25);

                    radius = Math.min((props.height - marginTop - 200), props.width - 200) / 2;
                    center = ["50%", props.height / 2 + marginTop / 2];
                }
                break;
            }
            case 'bottom': {
                legend = {
                    bottom: 10,
                    left: 'center',
                    orient: 'horizontal',
                    show: props.showLegend,
                    data: legendData                    
                }
                if(props.showLegend && legendData.length > 0) {
                    let memberNumber = Math.floor(props.width / 160);
                    let lineNumber = Math.ceil(legendData.length / memberNumber);
                    let marginBottom = 30 + (lineNumber * 25);

                    radius = Math.min((props.height - marginBottom - 200), props.width - 200) / 2;
                    center = ["50%", props.height / 2 - marginBottom / 2];
                }
                break;
            }
            case 'left':
                legend = {
                    top: "center",
                    orient: "vertical",
                    left: "left",
                    show: props.showLegend,
                    data: legendData                    
                }
                if(props.showLegend && legendData.length > 0) {
                    let memberNumber = Math.floor((props.height - 100) / 25);
                    let columnNumber = Math.ceil(legendData.length / memberNumber);
                    let marginLeft = columnNumber * 160;

                    radius = Math.min((props.width - marginLeft - 200), props.height - 200) / 2;
                    center = [props.width / 2 + marginLeft / 2, "50%"];
                }
                break;
            case 'right':
                legend = {
                    top: "center",
                    orient: "vertical",
                    left: "right",
                    show: props.showLegend,
                    data: legendData                    
                }
                if(props.showLegend && legendData.length > 0) {
                    let memberNumber = Math.floor((props.height - 100) / 25);
                    let columnNumber = Math.ceil(legendData.length / memberNumber);
                    let marginRight = columnNumber * 160;

                    radius = Math.min((props.width - marginRight - 200), props.height - 200) / 2;
                    center = [props.width / 2 - marginRight / 2, "50%"];
                }
                break;
            default: {
                legend = {
                    data: legendData,
                    show: props.showLegend
                };
                break;
            }
        }

        var options = {
            color:['#333','#b7a4a4','#d87c7c','#919e8b', '#d7ab82',  '#6e7074','#61a0a8','#efa18d', '#787464', '#cc7e63', '#724e58', '#4b565b'],
            title: {
                text: props.title === "" ? "未命名图表" : props.title,
                right: props.titlePosition === 'right' ? '15' : 'auto',
                left: props.titlePosition === 'right' ? 'auto' : props.titlePosition,
                show: props.showTitle
            },
            tooltip: {
                show: props.showTooltip
            },
            legend: legend,
            radar: {
                radius: radius,
                center: center,
                name: {
                    show: props.showAxisName
                },
                indicator: indicator.length === 0 
                    ? [{ name:'指标1' }, { name:'指标2' }, { name:'指标3' }, { name:'指标4' }]
                    : indicator
            },
            series:  {
                type: 'radar',
                data: data_series
            },
            animation: false
        };

        /** 面积 */
        if(props.area)
            options.series.areaStyle = {normal: {}};
        else
            delete options.series.areaStyle;

        /** 主题风格 */
        // if(props.theme !== "none") {
            let themeStyle = Themes.importTheme(props.theme);
            options = this.applyTheme(options, themeStyle);
        // }

        return options;
    },

    applyTheme(options, themeStyle) {
        options.color = themeStyle.color;
        options.backgroundColor = themeStyle.backgroundColor;
        options.textStyle = themeStyle.textStyle;
        options.tooltip.backgroundColor = themeStyle.tooltip.backgroundColor;        
        options.legend = _.assign({}, options.legend, themeStyle.legend);
        options.title = _.assign({}, options.title, themeStyle.title);
        return options;
    },

    render() {
        return (
            <Chart options={ this.state.options } style={{ height:this.props.height }} />
        );
    }
});

/** 词云图 */
var WordCloud = React.createClass({
    propTypes: {
        /** 数据 */
        title: React.PropTypes.string,
        data: React.PropTypes.array,
        dimension: React.PropTypes.array,
        measure: React.PropTypes.array,
        /** 图表外观 */
        id: React.PropTypes.string.isRequired,
        height: React.PropTypes.number.isRequired,
        showTitle: React.PropTypes.bool,
        titlePosition: React.PropTypes.string,
        showLegend: React.PropTypes.bool,
        legendPosition: React.PropTypes.string,
        showTooltip: React.PropTypes.bool,
        theme: React.PropTypes.string,
        /** render控制 */
        width: React.PropTypes.number.isRequired
    },

    componentDidMount() {
        var { legendData, series } = this.getDataConfig(this.props);
        var options = this.getOptions(legendData, series, this.props);

        var chart = echarts.init(document.getElementById("word-cloud-" + this.props.id));
        chart.setOption(options);
    },

    shouldComponentUpdate(nextProps) {
        return !_.isEqual(this.props, nextProps);
    },

    componentDidUpdate() {
        var { legendData, series } = this.getDataConfig(this.props);
        var options = this.getOptions(legendData, series, this.props);

        /** 更新echartDom高度 */
        $('#word-cloud-' + this.props.id).height(this.props.height);
        /** 更新Dom内echarts */           
        var chart = echarts.init(document.getElementById("word-cloud-" + this.props.id));
        chart.setOption(options);
    },

    getDataConfig(props) {
        /** 图例 */
        var legendData = _.isUndefined(props.dimension[0]) ? ["示例"] : [props.dimension[0].displayName];

        /** 数据 */
        var axis = DataProcess.getAxisName(props.dimension, props.data);
        var series = DataProcess.getWordCloudSeries(props.data, props.dimension, props.measure, axis);
        if(series[0].data.length === 0) {
            series[0].data = [
                {
                    name: 'BI',
                    value: 6000,
                    textStyle: {
                        normal: { 
                            color: 'rgb(' + [Math.round(Math.random() * 160), Math.round(Math.random() * 160), Math.round(Math.random() * 160)].join(',') + ')'
                        }
                    }
                }, {
                    name: 'Report',
                    value: 6000,
                    textStyle: {
                        normal: { 
                            color: 'rgb(' + [Math.round(Math.random() * 160), Math.round(Math.random() * 160), Math.round(Math.random() * 160)].join(',') + ')'
                        }
                    }
                }, {
                    name: 'Word',
                    value: 4000,
                    textStyle: {
                        normal: { 
                            color: 'rgb(' + [Math.round(Math.random() * 160), Math.round(Math.random() * 160), Math.round(Math.random() * 160)].join(',') + ')'
                        }
                    }
                }, {
                    name: 'Cloud',
                    value: 5000,
                    textStyle: {
                        normal: { 
                            color: 'rgb(' + [Math.round(Math.random() * 160), Math.round(Math.random() * 160), Math.round(Math.random() * 160)].join(',') + ')'
                        }
                    }
                }, {
                    name: 'Chart',
                    value: 2555,
                    textStyle: {
                        normal: { 
                            color: 'rgb(' + [Math.round(Math.random() * 160), Math.round(Math.random() * 160), Math.round(Math.random() * 160)].join(',') + ')'
                        }
                    }
                }, {
                    name: 'Phone',
                    value: 3333,
                    textStyle: {
                        normal: { 
                            color: 'rgb(' + [Math.round(Math.random() * 160), Math.round(Math.random() * 160), Math.round(Math.random() * 160)].join(',') + ')'
                        }
                    }
                }, {
                    name: 'Samsung',
                    value: 1000,
                    textStyle: {
                        normal: { 
                            color: 'rgb(' + [Math.round(Math.random() * 160), Math.round(Math.random() * 160), Math.round(Math.random() * 160)].join(',') + ')'
                        }
                    }
                }, {
                    name: 'Las Vigas',
                    value: 1250,
                    textStyle: {
                        normal: { 
                            color: 'rgb(' + [Math.round(Math.random() * 160), Math.round(Math.random() * 160), Math.round(Math.random() * 160)].join(',') + ')'
                        }
                    }
                }
            ];
        }

        return {
            legendData: legendData,
            series: series
        };
    },

    getOptions(legendData, series, props) {
        var options = {
            color:['#333','#b7a4a4','#d87c7c','#919e8b', '#d7ab82',  '#6e7074','#61a0a8','#efa18d', '#787464', '#cc7e63', '#724e58', '#4b565b'],
            title: {
                text: props.title === "" ? "未命名图表" : props.title,
                right: props.titlePosition === 'right' ? '15' : 'auto',
                left: props.titlePosition === 'right' ? 'auto' : props.titlePosition,
                show: props.showTitle
            },
            tooltip: {
                show: props.showTooltip
            },
            legend: {
                data: legendData,
                show: props.showLegend
            },
            series: series
        };

        /** 图例位置 */
        switch(props.legendPosition) {
            case 'top':
                options.legend.top = '30';
                options.legend.orient = 'horizontal';
                options.legend.left = 'center';
                break;
            case 'bottom':
                options.legend.bottom = '10';
                options.legend.orient = 'horizontal';
                options.legend.left = 'center';
                break;
            case 'left':
                options.legend.top = 'center';
                options.legend.orient = 'vertical';
                options.legend.left = 'left';
                break;
            case 'right':
                options.legend.top = 'center';
                options.legend.orient = 'vertical';
                options.legend.left = 'right';
                break;
        }

        /** 主题风格 */
        // if(props.theme !== "none") {
            let themeStyle = Themes.importTheme(props.theme);
            options = this.applyTheme(options, themeStyle);
        // }

        return options;
    },

    applyTheme(options, themeStyle) {
        options.color = themeStyle.color;
        options.backgroundColor = themeStyle.backgroundColor;
        options.textStyle = themeStyle.textStyle;
        options.tooltip.backgroundColor = themeStyle.tooltip.backgroundColor;        
        options.legend = _.assign({}, options.legend, themeStyle.legend);
        options.title = _.assign({}, options.title, themeStyle.title);
        return options;
    },

    render: function() {
        return (
            <div id={ "word-cloud-" + this.props.id } style={{ height:this.props.height }} />
        )
    }
});

/** 气泡图 */
var Bubble = React.createClass({

    propTypes: {
        /** 数据显示 */
        title: React.PropTypes.string,
        dimension: React.PropTypes.array,
        measure: React.PropTypes.array,
        data: React.PropTypes.array,
        /** 图表外观 */
        height: React.PropTypes.number.isRequired,        
        showTitle: React.PropTypes.bool,
        titlePosition: React.PropTypes.string,
        showLegend: React.PropTypes.bool,
        legendPosition: React.PropTypes.string,
        showTooltip: React.PropTypes.bool,
        theme: React.PropTypes.string,
        /** render 控制 */
        width: React.PropTypes.number.isRequired
    },

    getInitialState() {        
        var { legendData, xAxis, series } = this.getDataConfig(this.props);
        var options = this.getOptions(legendData, xAxis, series, this.props);

        return {
            legendData: legendData,
            xAxis: xAxis,
            series: series,
            options: options,
            shouldRender: false
        };
    },

    componentDidMount() {
        let width = $('#chart-container-' + this.props.id).innerWidth();
        if(width != this.props.width) {
            this.props.width = width;
            var options = this.getOptions(this.state.legendData, this.state.xAxis, this.state.series, this.props);
            this.setState({ options: options, shouldRender: true });
        }
    },

    componentWillReceiveProps(nextProps) {
        if(_.isEqual(this.props, nextProps)) {
            this.setState({ shouldRender: false });            
        }
        else {
            var { legendData, xAxis, series } = this.state;
            
            /** DataProcess需要的数据变化，则重新进行sql搜索整合 */
            if(this.props.dimension !== nextProps.dimension || this.props.measure !== nextProps.measure || this.props.data !== nextProps.data) {
                let dataConfig = this.getDataConfig(nextProps);
                legendData = dataConfig.legendData;
                xAxis = dataConfig.xAxis;
                series = dataConfig.series;
            }

            /** 获取新的options */
            var options = this.getOptions(legendData, xAxis, series, nextProps);
            this.setState({ 
                legendData: legendData,
                xAxis: xAxis,
                series: series,
                options: options,
                shouldRender: true   
            })
        }
    },

    shouldComponentUpdate(nextProps, nextState) {
        return nextState.shouldRender;
    },

    getDataConfig(props) {
        /** x轴 */
        var xAxis = DataProcess.getAxisName(props.dimension, props.data);
        /** 数据 */
        var res = DataProcess.getBubbleSeries(props.data, props.dimension, props.measure, xAxis);
        var legendData = res.legendData;
        var series =  res.series;

        return {
            legendData: legendData,
            xAxis: xAxis,
            series: series
        };
    },

    getOptions(legendData, xAxis, series, props) {
        /** 图例 */
        let legend;
        let gridLeft = 80, gridRight = 80, gridTop = 60, gridBottom = 60;
        let scrollBottom = 10;
        if(legendData.length > 20) {
            /** 限制图例展示个数 */
            legendData = legendData.slice(0, 20);
            legendData.push("······");
            series.push({ name: '······', type:'scatter' });
        }
        switch(props.legendPosition) {
            case 'top': {
                legend = {
                    top: 30,
                    left: "center",
                    orient: "horizontal",
                    show: props.showLegend,
                    data: legendData                    
                };
                if(props.showLegend && legendData.length > 0) {
                    let memberNumber = Math.floor(props.width / 160);
                    let lineNumber = Math.ceil(legendData.length / memberNumber);
                    gridTop = 30 + (lineNumber * 25) + 20;
                }
                break;
            }
            case 'bottom': {
                legend = {
                    bottom: 10,
                    left: 'center',
                    orient: 'horizontal',
                    show: props.showLegend,
                    data: legendData                    
                }
                if(props.showLegend && legendData.length > 0) {
                    let memberNumber = Math.floor(props.width / 160);
                    let lineNumber = Math.ceil(legendData.length / memberNumber);
                    let scrollHeight = 40;
                    gridBottom = 20 + scrollHeight + (lineNumber * 25) + 10;
                    scrollBottom = (lineNumber * 25) + 10;
                }
                break;
            }
            case 'left':
                legend = {
                    top: "center",
                    orient: "vertical",
                    left: "left",
                    show: props.showLegend,
                    data: legendData                    
                }
                if(props.showLegend && legendData.length > 0) {
                    let memberNumber = Math.floor((props.height - 100) / 25);
                    let columnNumber = Math.ceil(legendData.length / memberNumber);
                    gridLeft = (columnNumber * 160);
                }
                break;
            case 'right':
                legend = {
                    top: "center",
                    orient: "vertical",
                    left: "right",
                    show: props.showLegend,
                    data: legendData                    
                }
                if(props.showLegend && legendData.length > 0) {
                    let memberNumber = Math.floor((props.height - 100) / 25);                    
                    let columnNumber = Math.ceil(legendData.length / memberNumber);
                    gridRight = (columnNumber * 160) + 120;
                }
                break;
            default: {
                legend = {
                    data: legendData,
                    show: props.showLegend
                };
                break;
            }
        }
        
        /** options */
        var options = {
            color:['#333','#b7a4a4','#d87c7c','#919e8b', '#d7ab82',  '#6e7074','#61a0a8','#efa18d', '#787464', '#cc7e63', '#724e58', '#4b565b'],
            title: {
                text: props.title === "" ? "未命名图表" : props.title,
                right: props.titlePosition === 'right' ? '15' : 'auto',
                left: props.titlePosition === 'right' ? 'auto' : props.titlePosition,
                show: props.showTitle
            },
            tooltip: {
                axisPointer: { type: "line" },
                show: props.showTooltip,
                formatter: function(params) {
                    var title = params.seriesName + "<br />";
                    var contentName, contentData;
                    if(params.data instanceof Array) {
                        contentName = params.data[0];
                        var temp = params.data.slice(1);
                        contentData = temp.join(" , ");
                    }
                    else {
                        contentName = params.name;
                        contentData = params.data.toString();
                    }
                    return title + contentName + " : " + contentData;
                }
            },
            legend: legend,
            grid: {
                top: gridTop,
                right: gridRight,
                bottom: gridBottom,
                left: gridLeft
            },
            dataZoom: [{
                type: 'slider',
                xAxisIndex: [0],
                filterMode: 'filter',
                bottom: scrollBottom
            }],
            xAxis: [{  
                type: 'category',
                boundaryGap: false,
                name: props.dimension.length === 0 ? '轴标题' : props.dimension[0].displayName,
                data: xAxis,
                splitLine: { lineStyle: { type: 'dashed' } }
            }],
            yAxis: [{  
                type: 'value',
                boundaryGap: false,
                name: props.measure.length === 0 ? '轴标题' : props.measure[0].displayName,
                splitLine: { lineStyle: { type: 'dashed' } }
            }],
            series: series,
            animation: false
        };

        /** 主题风格 */
        // if(props.theme !== "none") {
            let themeStyle = Themes.importTheme(props.theme);
            options = this.applyTheme(options, themeStyle);
        // }

        return options;
    },

    applyTheme(options, themeStyle) {
        options.color = themeStyle.color;
        options.backgroundColor = themeStyle.backgroundColor;
        options.textStyle = themeStyle.textStyle;
        options.legend = _.assign({}, options.legend, themeStyle.legend);
        options.title = _.assign({}, options.title, themeStyle.title);
        options.tooltip = _.assign({}, options.tooltip, themeStyle.tooltip);
        options.dataZoom = _.map(options.dataZoom, function(item) {
            return _.assign({}, item, themeStyle.dataZoom); 
        }); 
        options.xAxis = _.map(options.xAxis, function(item) {
            return _.assign({}, item, themeStyle.axis);
        });
        options.yAxis = _.map(options.yAxis, function(item) {
            return _.assign({}, item, themeStyle.axis);
        });
        return options;
    },

    render() {
        return (
            <Chart options={ this.state.options } style={{ height:this.props.height }} />
        );
    }
});

/** 热力地图 */
var Map = React.createClass({
    
    propTypes: {
        /** 数据 */
        title: React.PropTypes.string,
        data: React.PropTypes.array,
        dimension: React.PropTypes.array,
        measure: React.PropTypes.array,
        /** 外观 */
        height: React.PropTypes.number.isRequired,        
        showTitle: React.PropTypes.bool,
        showLegend: React.PropTypes.bool,
        showTooltip: React.PropTypes.bool,
        titlePosition: React.PropTypes.string,
        legendPosition: React.PropTypes.string,
        theme: React.PropTypes.string,
        /** render控制 */
        width: React.PropTypes.number.isRequired
    },

    getInitialState() {
        var { legendData, min, max, series } = this.getDataConfig(this.props);
        var options = this.getOptions(legendData, min, max, series, this.props);

        return {
            legendData: legendData,
            min: min,
            max: max,
            series: series,
            options: options 
        };
    },

    componentWillReceiveProps(nextProps) {
        var { legendData, min, max, series } = this.state;
        
        /** DataProcess需要的数据变化，则重新进行sql搜索整合 */
        if(this.props.dimension !== nextProps.dimension || this.props.measure !== nextProps.measure ||
             this.props.data !== nextProps.data) {
            let dataConfig = this.getDataConfig(nextProps);
            legendData = dataConfig.legendData;
            min = dataConfig.min;
            max = dataConfig.max;
            series = dataConfig.series;
        }

        /** 获取新的options */
        var options = this.getOptions(legendData, min, max, series, nextProps);
        this.setState({ 
            legendData: legendData,
            min: min,
            max: max,
            series: series,
            options: options   
        });
    },

    shouldComponentUpdate(nextProps) {
        return !_.isEqual(this.props, nextProps);
    },

    getDataConfig(props) {
        var axis = DataProcess.getAxisName(props.dimension, props.data);
        var res = DataProcess.getGridSeries('map', props.data, props.dimension, props.measure, axis);
        var series = res.series, legendData = res.legendData;
        var min, max;

        if(axis.length === 0 || series.length === 0) {
            legendData = ['示例'];
            series = [{
                name: '示例',
                type: 'map',
                mapType: 'china',
                data:[ {name: '北京',value: 100 }, {name: '天津',value: 200 }, {name: '上海',value: 300 }, {name: '重庆',value: 400 }, {name: '河北',value: 500 }, {name: '河南',value: 600 }, {name: '云南',value: 700 }, {name: '辽宁',value: 800 }, {name: '黑龙江',value: 900 }, {name: '湖南',value:    1000 }, {name: '安徽',value: 100 }, {name: '江苏',value: 400 }, {name: '山东',value: 200 }, {name: '新疆',value: 300 }, {name: '浙江',value: 500 }, {name: '江西',value: 600 }, {name: '湖北',value: 700 }, {name: '广西',value: 800 }, {name: '甘肃',value: 900 }, {name: '山西',value:    1000 }, {name: '内蒙古',value: 100 }, {name: '陕西',value: 200 }, {name: '吉林',value: 300 }, {name: '福建',value: 400 }, {name: '贵州',value: 500 }, {name: '广东',value: 600 }, {name: '青海',value: 700 }, {name: '西藏',value: 800 }, {name: '四川',value: 900 }, {name: '宁夏',                 value: 1000 }, {name: '海南',value: 100 }, {name: '台湾',value: 200 }, {name: '香港',value: 300 }, {name: '澳门',value: 400 }]
            }]
            min= 0;
            max = 1000;
        }
        else {
            let data_series = series[0].data;
            let data = _.map(data_series, function(item, index) { return { name:axis[index], value:item } });
            series = [{ name:legendData[0], type:'map', mapType:'china', data:data }];
            min = Math.min.apply(null, data_series);
            max = Math.max.apply(null, data_series);
        }

        return { legendData: legendData, series: series, min: min, max: max };
    },

    getOptions(legendData, min, max, series, props) {

        var options = {
            color:['#333','#b7a4a4','#d87c7c','#919e8b', '#d7ab82',  '#6e7074','#61a0a8','#efa18d', '#787464', '#cc7e63', '#724e58', '#4b565b'],
            title: {
                text: props.title === "" ? "未命名图表" : props.title,
                right: props.titlePosition === 'right' ? '15' : 'auto',
                left: props.titlePosition === 'right' ? 'auto' : props.titlePosition,
                show: props.showTitle
            },
            tooltip: {
                trigger: 'item',
                show: props.showTooltip
            },
            legend: {
                data: legendData,
                show: props.showLegend
            },
            visualMap: {
                min: min,
                max: max,
                left: 'left',
                top: 'bottom',
                text: ['Max', 'Min'],
                calculable: true
            },
            series: series
        };
        
        /** 图例 */
        switch(props.legendPosition) {
            case 'top':
                options.legend.top = '30';
                options.legend.orient = 'horizontal';
                options.legend.left = 'center';
                break;
            case 'bottom':
                options.legend.bottom = '10';
                options.legend.orient = 'horizontal';
                options.legend.left = 'center';
                break;
            case 'left':
                options.legend.top = 'center';
                options.legend.orient = 'vertical';
                options.legend.left = 'left';
                break;
            case 'right':
                options.legend.top = 'center';
                options.legend.orient = 'vertical';
                options.legend.left = 'right';
                break;
        }

        /** 主题风格 */
        // if(props.theme !== "none") {
            let themeStyle = Themes.importTheme(props.theme);
            options = this.applyTheme(options, themeStyle);
        // }

        return options;
    },

    applyTheme(options, themeStyle) {
        options.color = themeStyle.color;
        options.backgroundColor = themeStyle.backgroundColor;
        options.textStyle = themeStyle.textStyle;
        options.tooltip.backgroundColor = themeStyle.tooltip.backgroundColor;
        options.legend = _.assign({}, options.legend, themeStyle.legend);
        options.title = _.assign({}, options.title, themeStyle.title);
        options.visualMap = _.assign({}, options.visualMap, themeStyle.visualMap);        
        return options;
    },

    render() {
        return (
            <Chart options={ this.state.options } style={{ height:this.props.height }} />
        );
    }
});

/** 散点地图 */
var Scatter = React.createClass({
    propTypes: {
        /** 数据显示 */
        title: React.PropTypes.string,
        data: React.PropTypes.array,
        dimension: React.PropTypes.array,
        measure: React.PropTypes.array,
        /** 图表外观 */
        height: React.PropTypes.number.isRequired,
        showTitle: React.PropTypes.bool,
        showLegend: React.PropTypes.bool,
        showTooltip: React.PropTypes.bool,
        titlePosition: React.PropTypes.string,
        legendPosition: React.PropTypes.string,
        theme: React.PropTypes.string,
        /** render控制 */
        width: React.PropTypes.number.isRequired
    },

    getInitialState() {
        var { legendData, series } = this.getDataConfig(this.props);
        var options = this.getOptions(legendData, series, this.props);

        return {
            legendData: legendData,
            series: series,
            options: options,
            shouldRender: false
        };
    },

    componentDidMount() {
        let width = $('#chart-container-' + this.props.id).innerWidth();
        if(width != this.props.width) {
            this.props.width = width;
            var options = this.getOptions(this.state.legendData, this.state.series, this.props);
            this.setState({ options: options, shouldRender: true });
        }
    },

    componentWillReceiveProps(nextProps) {
        if(_.isEqual(this.props, nextProps)) {
            this.setState({ shouldRender: false });            
        }
        else {
            var { legendData, series } = this.state;
            
            /** DataProcess需要的数据变化，则重新进行sql搜索整合 */
            if(this.props.dimension !== nextProps.dimension || this.props.measure !== nextProps.measure || this.props.data !== nextProps.data) {
                let dataConfig = this.getDataConfig(nextProps);
                legendData = dataConfig.legendData;
                series = dataConfig.series;
            }

            /** 获取新的options */
            var options = this.getOptions(legendData, series, nextProps);
            this.setState({ 
                legendData: legendData,
                series: series,
                options: options    
            });
        }
    },

    shouldComponentUpdate(nextProps) {
        return !_.isEqual(this.props, nextProps);        
    },

    getDataConfig(props) {
        var axis = DataProcess.getAxisName(props.dimension, props.data);
        var res = DataProcess.getScatterMapSeries(props.data, props.dimension, props.measure, axis);

        return { legendData: res.legendData, series: res.series };
    },

    getOptions(legendData, series, props) {
        /** 图例 */
        let legend;
        if(legendData.length > 20) {
            /** 限制图例展示个数 */
            legendData = legendData.slice(0, 20);
            legendData.push("······");
            series.push({ name: '······', type:'scatter' });
        }
        switch(props.legendPosition) {
            case 'top': {
                legend = {
                    top: 30,
                    left: "center",
                    orient: "horizontal",
                    show: props.showLegend,
                    data: legendData                    
                };
                break;
            }
            case 'bottom': {
                legend = {
                    bottom: 10,
                    left: 'center',
                    orient: 'horizontal',
                    show: props.showLegend,
                    data: legendData                    
                }
                break;
            }
            case 'left':
                legend = {
                    top: "center",
                    orient: "vertical",
                    left: "left",
                    show: props.showLegend,
                    data: legendData                    
                }
                break;
            case 'right':
                legend = {
                    top: "center",
                    orient: "vertical",
                    left: "right",
                    show: props.showLegend,
                    data: legendData                    
                }
                break;
            default: {
                legend = {
                    data: legendData,
                    show: props.showLegend
                };
                break;
            }
        }

        var options = {
            color:['#333','#b7a4a4','#d87c7c','#919e8b', '#d7ab82',  '#6e7074','#61a0a8','#efa18d', '#787464', '#cc7e63', '#724e58', '#4b565b'],
            title: {
                text: props.title === "" ? "未命名图表" : props.title,
                right: props.titlePosition === 'right' ? '15' : 'auto',
                left: props.titlePosition === 'right' ? 'auto' : props.titlePosition,
                show: props.showTitle
            },
            tooltip: {
                trigger: 'item',
                show: props.showTooltip
            },
            legend: legend,
            geo: {
                map: 'china',
                roam: true,
                label: {
                    emphasis: {
                        show: false
                    }
                },
                itemStyle: {
                    normal: {
                        areaColor: '#323c48',
                        borderColor: '#111'
                    },
                    emphasis: {
                        areaColor: '#2a333d'
                    }
                }
            },
            series: series,
            animation: false
        }
            
        /** 样式 */
        switch(props.legendPosition) {
            case 'top':
                options.legend.top = '30';
                options.legend.orient = 'horizontal';
                options.legend.left = 'center';
                break;
            case 'bottom':
                options.legend.bottom = '10';
                options.legend.orient = 'horizontal';
                options.legend.left = 'center';
                break;
            case 'left':
                options.legend.top = 'center';
                options.legend.orient = 'vertical';
                options.legend.left = 'left';
                break;
            case 'right':
                options.legend.top = 'center';
                options.legend.orient = 'vertical';
                options.legend.left = 'right';
                break;
        }

        /** 主题风格 */
        // if(props.theme !== "none") {
            let themeStyle = Themes.importTheme(props.theme);
            options = this.applyTheme(options, themeStyle);
        // }

        return options;
    },

    applyTheme(options, themeStyle) {
        options.color = themeStyle.color;
        options.backgroundColor = themeStyle.backgroundColor;
        options.textStyle = themeStyle.textStyle;
        options.tooltip.backgroundColor = themeStyle.tooltip.backgroundColor;
        options.legend = _.assign({}, options.legend, themeStyle.legend);
        options.title = _.assign({}, options.title, themeStyle.title);
        options.geo = _.assign({}, options.geo, themeStyle.geo);
        return options;
    },

    render() {
        return (
            <Chart options={ this.state.options } style={{ height:this.props.height }} />
        );
    }
});

/** 普通表格 */
var Commontable = React.createClass({
    propTypes: {
        /** 数据 */
        height: React.PropTypes.number.isRequired,
        dimension: React.PropTypes.array.isRequired,
        measure: React.PropTypes.number.isRequired,
        data: React.PropTypes.array,
        /** 设置 */
        showSequenceNumber: React.PropTypes.bool,
        pagination: React.PropTypes.bool,
        showFilter: React.PropTypes.bool,
        showCheckbox: React.PropTypes.bool,
        theme: React.PropTypes.string,
        /** render控制 */
        width: React.PropTypes.number.isRequired,
        

    },
    onSortChange(name, order) {
        const sortName = [];
        const sortOrder = [];

        // for (let i = 0; i < this.state.sortName.length; i++) {
        //   if (this.state.sortName[i] !== name) {
        //     sortName.push(this.state.sortName[i]);
        //     sortOrder.push(this.state.sortOrder[i]);
        //   }
        // }

        sortName.push(name);
        sortOrder.push(order);
        this.setState({
          sortName,
          sortOrder
        });
    },

    // cleanSort() {
    //     this.setState({
    //       sortName: [],
    //       sortOrder: []
    //     });
    // },

    getInitialState() {
        let tableData = this.getTableData(this.props);
        let tableConfig = this.getTableCopnfig(this.props);
        return {
            header: tableData.header,
            data: tableData.data,
            tableConfig: tableConfig,
            sortName:[],
            sortOrder:[],
            exportRows: new Array()
        };
    },

    componentDidMount() {
        // Export To CVS ----> 导出表格
        var i_element = $("<i class='glyphicon glyphicon-export'></i>"); 
        $(".react-bs-table-tool-bar .btn-success").html("导出表格");
        i_element.prependTo($(".react-bs-table-tool-bar .btn-success"));
        // search ----> 搜索
        $(".react-bs-table-tool-bar .react-bs-table-search-form .form-control").attr("placeholder", "搜索");
    },

    componentWillReceiveProps(nextProps) {
        var { header, data, tableConfig } = this.state;
        tableConfig = this.getTableCopnfig(nextProps);
        
        /** 表格数据变化 */
        if(this.props.header !== nextProps.header || this.props.data !== nextProps.data || this.props.measure !== nextProps.measure) {
            let tableData = this.getTableData(nextProps);
            header = tableData.header;
            data = tableData.data;
            let headerData = [];
            _.each(nextProps.dimension, (head)=>{
                headerData.push(head.aliasName);
            });
            let changeOrder = false;
            if(!_.isEmpty(this.state.sortName)){
                let commonHead = _.intersection(headerData,this.state.sortName);
                if(_.isEmpty(commonHead))
                {
                   changeOrder = true;           
                }
            }
            if(changeOrder)
            {
                this.setState({
                        sortName:[],
                        sortOrder:[],
                        header: header,
                        data: data,
                        tableConfig: tableConfig,
                        exportRows:new Array()
                        })   
            }
            else
            {
                this.setState({
                    header: header,
                    data: data,
                    tableConfig: tableConfig,
                    exportRows:new Array()
                })
            }           
        }
        else {
            /** 表格样式变化 */
            this.setState({ 
                tableConfig: tableConfig
            })
        }
    },

    onExportClick(){
        var tableContent = [], maxRecordCount = 0;
        let data = this.state.exportRows.length === 0 ? this.state.data : this.state.exportRows ;


        if(!this.props.showSequenceNumber){
            _.each(data, (item)=>{
                delete item['id'];
            })

        }

        _.each(data , (temp)=>{
            let colum = [];
            _.each(this.state.header, (item , key) => {


                var newstr=" ";

                if (temp[item.key] === undefined){
                    return ;
                } else  {
                    newstr = temp[item.key];
                }

                colum.push(newstr);
            })
            tableContent.push(colum);
        });

        var tableHeader = [];
        let headers = [];
        $.extend(true, headers, this.state.header);

        if(!this.props.showSequenceNumber){
            delete headers[0].title;

        }else{
            headers[0].title = '序号'
        }

        _.each(headers,(item, key)=>{
            if (!_.isEmpty(item) && item.title != undefined) {

                tableHeader.push(item.title);
                // var index = tableHeader.search(/,/);

            }
        });

        var fileName = this.props.title; //文件名

         $.get('/bireport/bireport/getExport',{
             fileName:uuid.v1(),
             header: tableHeader,
             data: tableContent
         },function (rsp) {
             if(rsp.code == 0){

                 var a = document.getElementById("down");
                 a.href=rsp.data.filePath;
                 a.download=fileName;
                 a.click();


             }else {
                 Notify.simpleNotify('错误','数据导出失败', 'error');
             }
         },'json');

        //var a = document.getElementById("down");
        //a.href='/store.jsx';
        //a.download=fileName;
        //a.click();
        //console.log(a.href)



    },

    shouldComponentUpdate(nextProps, nextState) {  
        let shouldUpdate = (!_.isEqual(this.props, nextProps) || this.state.exportRows !== nextState.exportRows);
        return shouldUpdate;
    },

    getTableData(props) {
        /** 数据 */
        var data = props.data.slice(0);
        var header = _.map(props.dimension, function(item) {
            return { dataField: item.aliasName, title: item.displayName , key : item.aliasName };
        })
        
        /** 添加主键列 */
        header.splice(0, 0, { isKey: true, dataField: 'id', title: '序号' ,key : 'id'});
        _.each(data, function(item, index) {
            item.id = index + 1;
        });

        if(data.length > props.measure)
            data = data.slice(0, props.measure);

        return { header: header, data: data };
    },

    getTableCopnfig(props) {

        /** 分页 默认配置 */
        var pagination = props.pagination;
        var height = props.height;
        var titleHeight = props.showTitle ? 27 : 0;
        var toolBarHeight = 79;
        var paginationBarHeight = props.pagination ? 68 : 0;

        let tableData = this.getTableData(props);
        let header = tableData.header;
        let data = tableData.data;
        var tableConfig = {
            titleColor: "rgb(51, 51, 51)",
            pagination: pagination,
            containerStyle: { 'padding':10, 'background':'#fff' },
            maxHeight:height - 190,
            hover: true,
            remote: false,
            exportDataType: "basic",
            exportCSV: false,
            csvFileName : this.props.title+'.csv',
            csvUseBOM: true,
            search: true,
            options: {
                onExportToCSV: () => {
                   this.refs.table.props.remote = true;
                   return (this.state.exportRows.length === 0 ? this.state.data : this.state.exportRows);

                },
                onFilterChange: () => {
                    this.refs.table.props.remote = false;
                },
                onPageChange : () => {
                    this.refs.table.props.remote = false;
                },
                onSearchChange: () => {
                    this.refs.table.props.remote = false;
                },
                onSortChange: () => {
                    this.refs.table.props.remote = false;
                }
            }
        };

        /** 多选 */
        if(props.showCheckbox) {
            tableConfig.selectRow = { 
                mode: "checkbox",
                onSelect: (row, isSelected) => {
                    let exportRows = this.state.exportRows;
                    if(isSelected)
                        exportRows.push(row);
                    else
                        exportRows = _.without(exportRows, row);
                    this.setState({ exportRows: exportRows });
                },
                onSelectAll: (isSelected, currentSelectedAndDisplayData) => {
                    if(isSelected)
                        this.setState({ exportRows: currentSelectedAndDisplayData });
                    else
                        this.setState({ exportRows: [] });
                }
            };
        }
        else
            delete tableConfig.selectRow;


        /** 主题风格 */
        // if(props.theme !== "none") {
            let themeStyle = Themes.importTheme(props.theme);
            tableConfig = this.applyTheme(tableConfig, themeStyle);
        // }
        // else
        // {
        //     tableConfig.tableHeadColor = "#333";
        // }

        return tableConfig;
    },

    applyTheme(tableConfig, themeStyle) {
        tableConfig.titleColor = themeStyle.textStyle.color;
        tableConfig.containerStyle.background = themeStyle.backgroundColor;
        tableConfig.tableHeadColor = themeStyle.tableHeadColor;
        tableConfig.headTitleColor = themeStyle.headTitleColor;
        tableConfig.tableTextColor = themeStyle.tableTextColor;
        return tableConfig;
    },

    render() {
        var titleStyle;
        const options = {
          // reassign the multi sort list by an Array
          // if you dont want to control al the sort list, you can only assign the String to sortName and sort Order
          sortName: this.state.sortName,
          sortOrder: this.state.sortOrder,
          onSortChange: this.onSortChange
        };
        switch(this.props.titlePosition) {
            case "left":
                titleStyle = { float: 'left', marginLeft: '5px', color: this.state.tableConfig.titleColor, fontSize: "18px", fontWeight: "bold" };
                break;
            case 'center':
                titleStyle = { textAlign: "center", color: this.state.tableConfig.titleColor, fontSize: "18px", fontWeight: "bold" };
                break;
            case "right":
                titleStyle = { float: 'right', marginRight: '20px', color: this.state.tableConfig.titleColor, fontSize: "18px", fontWeight: "bold" };
                break;
        }

        return (
            <div style={{position:'relative'}} className={this.props.theme}>
                <div style={{ overflow: "hidden", display: this.props.showTitle ? "block" : "none", background: this.state.tableConfig.containerStyle.background }}>
                    <p style={ titleStyle }>{ this.props.title === "" ? "未命名图表" : this.props.title }</p>
                </div>
                <div style={{position:'absolute' , top:'50' , left:'25' ,zIndex:'20'}}>
                    <a download="" href="" target="blank" id="down"></a>
                    <button href="" type="button" className="btn btn-xs exportButton" style={{width:'80px',height:'30px' }} onClick={this.onExportClick.bind(this)}>导出</button>
                </div>
                <BootstrapTable data={this.state.data} {...this.state.tableConfig} ref='table' headerStyle={{backgroundColor:this.state.tableConfig.tableHeadColor,color:this.state.tableConfig.headTitleColor}} options={options}>
                    {
                        _.map(this.state.header, function(cell) {
                            // console.log("www");
                            return (
                                <TableHeaderColumn isKey={cell.isKey} width={150} hidden={!this.props.showSequenceNumber && cell.dataField==='id'} dataField={cell.dataField} dataSort={true} filter={this.props.showFilter?{type: "TextFilter", placeholder: "Please enter a value"}:{}}>
                                    {cell.title}
                                </TableHeaderColumn>
                            );
                        }.bind(this))
                    }
                </BootstrapTable>
            </div>
        );
    }
});

/** 可编辑表格 */
function getSplitChar() {
    let platform = navigator.platform;
    if (platform.indexOf("Mac") > -1)
        return '\r';
    else if (platform.indexOf("Win") > -1)
        return '\r\n';
    else
        return '\n';
}

var Toolbar = React.createClass({
    propTypes: {
        onAdd: React.PropTypes.func.isRequired,
        onImport: React.PropTypes.func.isRequired,
        onDelete: React.PropTypes.func.isRequired,
        onEmpty: React.PropTypes.func.isRequired
    },

    render: function() {
        return (
            <div className="btns-anchor mb5" style={{ height: "39px" }}>
                <div className="btns-group" style={{ position: "fixed", left: "17px" }}>
                    <button type="button" className="btn btn-info fw600 fs13 mnw50 mr5" style={{ width: "80px", position: 'relative' }}>导入
                        <input type="file" id="upload-file-btn" name="file" accept=".xlsx, .xls"
                            style={{ position: "absolute", left: 0, top: 0, height:"100%", width: "100%", opacity: 0 }} onChange={ this.props.onImport } />
                    </button>
                    <button type="button" className="btn btn-info fw600 fs13 mnw50 mr5" style={{ width: "80px" }} onClick={ this.props.onAdd }>添加</button>
                    <button type="button" className="btn btn-info fw600 fs13 mnw50 mr5" style={{ width: "80px" }} onClick={ this.props.onDelete }>删除</button>
                    <button type="button" className="btn btn-info fw600 fs13 mnw50" style={{ width: "80px" }} onClick={ this.props.onEmpty }>清空</button>
                </div>
            </div>
        );
    } 
});


var EditableTable = React.createClass({

    propTypes: {
        minWidth: React.PropTypes.number.isRequired,
        columns: React.PropTypes.array.isRquired,
        rows: React.PropTypes.array.isRquired,
        callback: React.PropTypes.func.isRequired
    },

    getInitialState: function() {
        return { rows: this.props.rows, selectedIndexes: [] };
    },

    componentDidMount: function() {
        if(this.state.rows.length === 0)
            for(let i = 0; i < 10; i++)
                this.onAddRow();

        /** 监听粘贴事件 */
        document.addEventListener('paste', this.onPasteTable);
        $(".react-grid-Grid").on('paste', this.onStopPaste);
    },

    componentWillReceiveProps(nextProps) {
        this.props.callback(nextProps.rows);
        this.setState({ rows: nextProps.rows });
    },

    /** 添加、粘贴、删除、清空、 导入 */
    onAddRow: function() {
        var rows = this.state.rows;
        var newRow = new Object();

        _.each(this.props.columns, function(item) {
            newRow[item.key] = "";
        });
        rows.push(newRow);

        this.props.callback(rows);
        this.setState({ rows: rows });
    },

    onImportTable() {
        // loader绘制需等待50ms左右，不可以直接往下运行，否则loader会等待数据render一同展现
        var loader = Loaders($("#nv-dialog-body"));
        window.setTimeout(readFile.bind(this), 100);        

        function readFile() {
            var FileReader = window.FileReader;
            var reader = new FileReader();
            reader.onload = function(e) {
                let workbook;
                try {
                    let data = e.target.result;
                    workbook = XLSX.read(data, { type: "binary" });
                } catch (e) {
                    Notify.simpleNotify("导入失败", "不支持的文件类型(.xlsx, .xls)", 'error');            
                    return;
                }

                // 合并每张表
                let importRows = [];
                for (var sheet in workbook.Sheets) {
                    importRows = importRows.concat(XLSX.utils.sheet_to_json(workbook.Sheets[sheet]));
                }

                // 遍历表中每一行(所有单元格为空则删除， 否则赋值空字符串)
                let _importRows = [];
                for(let importRow of importRows) {
                    let _importRow = {};
                    let isValidate = false;
                    _.each(this.props.columns, function(item) { 
                        if(importRow[item.name]) {
                            _importRow[item.key] = importRow[item.name];
                            isValidate = true;
                        }
                        else {
                            _importRow[item.key] = "";
                        }
                    })
                    isValidate && (_importRows.push(_importRow));
                }

                // 与state合并
                let rows = this.state.rows;
                for(let i = _importRows.length - 1; i >= 0; i--) {
                    rows.unshift(_importRows[i]);
                }

                //导入 清空input:file 隐藏loader
                this.props.callback(rows);
                this.setState({ rows: rows });
                document.getElementById("upload-file-btn").value = "";
                loader.hide();
            }.bind(this);

            var file = document.getElementById("upload-file-btn").files[0];
            reader.readAsBinaryString(file);
        }
    },

    onPasteTable: function(e) {
        var data = e.clipboardData.getData('text/plain');
        let rows = this.state.rows;

        let lineSplit = getSplitChar();
        let newRows = data.split(lineSplit);

        /** 遍历每一行 */
        for(let i = newRows.length - 1; i >= 0; i--) {
            let newRow = newRows[i];
            if(newRow != "") {

                let cellSplit = '\t';
                let cells = newRow.split(cellSplit);
                
                /** 遍历每一个单元格并插入 */
                let row = new Object();
                _.each(this.props.columns, function(item, index) {
                    if(cells[index])
                        row[item.key] = cells[index];
                    else
                        row[item.key] = "";
                });

                rows.unshift(row);
            }
        }

        // 更新
        this.props.callback(rows);
        this.setState({ rows: rows });
    },

    onStopPaste: function(e) {
        e.stopPropagation()
    },

    onDeleteRows: function() {
        var rows = this.state.rows;
        var selectedIndexes = this.state.selectedIndexes.sort();

        for(let i = selectedIndexes.length - 1; i >= 0; i--) {
            rows.splice(selectedIndexes[i], 1);
        }

        this.props.callback(rows);
        this.setState({ rows: rows, selectedIndexes: [] });
    },

    onEmptyTable: function() {
        var rows = this.state.rows;
        var selectedIndexes = this.state.selectedIndexes;
        rows.splice(0, rows.length);
        selectedIndexes.splice(0, selectedIndexes.length);
        
        this.props.callback(rows);
        this.setState({ rows: rows, selectedIndexes: selectedIndexes });

        /** 添加10行空白 */
        for(let i = 0; i < 10; i++)
            this.onAddRow();
    },

    rowGetter: function(rowIdx) {
        return this.state.rows[rowIdx]
    },

    /** 行选中或反选时触发 */
    onRowsSelected: function(rows) {
        this.setState({selectedIndexes: this.state.selectedIndexes.concat(rows.map(r => r.rowIdx))});
    },
  
    onRowsDeselected: function(rows) {
        var rowIndexes = rows.map(r => r.rowIdx);
        this.setState({selectedIndexes: this.state.selectedIndexes.filter(i => rowIndexes.indexOf(i) === -1 )});
    },

    /** 单元格内容修改时触发 */
    handleRowUpdated: function(e) {
        var rows = this.state.rows;
        Object.assign(rows[e.rowIdx], e.updated);
        this.props.callback(rows);
        this.setState({ rows:rows });
    },

    /** 单元格拖动时触发 */
    handleCellDrag: function(e) {
        var rows = this.state.rows.slice(0);
        for (var i = e.fromRow; i <= e.toRow; i++){
            var rowToUpdate = rows[i];
            rowToUpdate[e.cellKey] = e.value;
        }
        this.props.callback(rows);
        this.setState({ rows: rows });
    },

    render:function() {

        return(
            <ReactDataGrid
                minWidth={ 150*this.props.columns.length >= this.props.minWidth ? 150*this.props.columns.length : this.props.minWidth }
                toolbar={ <Toolbar onImport={this.onImportTable} onAdd={ this.onAddRow } onEmpty={ this.onEmptyTable } onDelete={ this.onDeleteRows } /> }
                columns={ this.props.columns }
                rowsCount={ this.state.rows.length }
                rowGetter={ this.rowGetter }
                enableCellSelect={ true }
                onCellsDragged={ this.handleCellDrag }
                onRowUpdated={ this.handleRowUpdated }
                rowSelection={{
                    showCheckbox: true,
                    fixed: true,
                    enableShiftSelect: true,
                    onRowsSelected: this.onRowsSelected,
                    onRowsDeselected: this.onRowsDeselected,
                    selectBy: {
                        indexes: this.state.selectedIndexes
                    }
                }}>
            </ReactDataGrid>
        )
    }
});

/** 交叉表 */
var Crosstable = React.createClass({
    propTypes: {
        height: React.PropTypes.number.isRequired,
        header: React.PropTypes.array,
        data: React.PropTypes.array,
        pagination: React.PropTypes.bool,
        showCheckbox: React.PropTypes.bool
    },
    getInitialState () {
        let tableConfig = this.getTableCopnfig(this.props);
        return {
            columns: [],
            data:[],
            tableConfig:tableConfig
        };
    },
    getTableCopnfig(props) {
        /** 分页 默认配置 */
        var tableConfig = {
            titleColor: "rgb(51, 51, 51)",
            containerStyle: { 'padding':10, 'background':'#fff' },

        };
        /** 主题风格 */
        // if(props.theme !== "none") {
            let themeStyle = Themes.importTheme(props.theme);
            tableConfig = this.applyTheme(tableConfig, themeStyle);
        // }
        return tableConfig;
    },
    applyTheme(tableConfig, themeStyle) {
        tableConfig.titleColor = themeStyle.textStyle.color;
        tableConfig.containerStyle.background = themeStyle.backgroundColor;
        tableConfig.tableHeadColor = themeStyle.tableHeadColor;

        return tableConfig;
    },
    componentDidMount () {
        var tableConfig = this.getTableCopnfig(this.props)
        if (this.props.dimension.length != 2 || this.props.measure.length != 1) {
            this.setState({
                tableConfig:tableConfig
            });
        }
        else {
            var dimension0 = this.props.dimension[0];
            var Srcdata = this.props.data.slice(0);
            var dimension1 = this.props.dimension[1];
            var measure = this.props.measure[0];

            this.setState({
                columns: DataProcess.getColumn(Srcdata,dimension0),
                data: DataProcess.getTableData(Srcdata,dimension0,dimension1,measure),
                tableConfig:tableConfig
            });
        }
    },
    componentWillReceiveProps (nextProps) {
        var tableConfig = this.getTableCopnfig(nextProps);
        if (nextProps.dimension.length != 2 || nextProps.measure.length != 1) {
            this.setState({
                columns: [],
                data: [],
                tableConfig:tableConfig
            });
        }
        else {
            var dimension0 = nextProps.dimension[0];
            var Srcdata = nextProps.data.slice(0);
            var dimension1 = nextProps.dimension[1];
            var measure = nextProps.measure[0];

            this.setState({
                columns: DataProcess.getColumn(Srcdata,dimension0),
                data: DataProcess.getTableData(Srcdata,dimension0,dimension1,measure),
                tableConfig:tableConfig
            });
        }
    },
    render() {
        // const rowSelection = {};
        let columns = this.state.columns;
        let data = this.state.data;
        let tableConfig = this.state.tableConfig;
        const pagination = {
            total: data.length,
            showSizeChanger: true
        };
        var titleStyle;
        switch(this.props.titlePosition) {
            case "left":
                titleStyle = { float: 'left', marginLeft: '5px', color: tableConfig.titleColor, fontSize: "18px", fontWeight: "bold" };
                break;
            case 'center':
                titleStyle = { textAlign: "center", color: tableConfig.titleColor, fontSize: "18px", fontWeight: "bold" };
                break;
            case "right":
                titleStyle = { float: 'right', marginRight: '20px', color: tableConfig.titleColor, fontSize: "18px", fontWeight: "bold" };
                break;
        }

        var paginations = this.props.pagination ? pagination : false;

        return (
            <div>
                <div style={{ overflow: "hidden", display: this.props.showTitle ? "block" : "none", background: tableConfig.containerStyle.background }}>
                    <p style={ titleStyle }>{ this.props.title === "" ? "未命名图表" : this.props.title }</p>
                </div>
                <div style={{padding:'15px'}} className={this.props.theme}>
                    <Table  columns={columns} {...this.state.tableConfig}  dataSource={data} scroll={{ x: columns.length < this.props.width/150 ? this.props.width : ( columns.length + 1 )*150 , y: this.props.height - 180 }} pagination= { paginations } />
                </div>
            </div>
        );
    }
});

export {Line, Bar, Pie, Radar, Bubble, WordCloud, Map, Scatter, Commontable, EditableTable, Crosstable};