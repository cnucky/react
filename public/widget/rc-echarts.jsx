import React from 'react';
import echarts from 'echarts';

var Chart = React.createClass({
	propTypes: {
        options: React.PropTypes.object.isRequired,
        style: React.PropTypes.object,
        onReady: React.PropTypes.func
    },

    componentDidMount() {
        const { onReady } = this.props;
        this.drawChart();
        if (onReady) {
            onReady(this.chart);
        }
    },

    componentDidUpdate(prevProps) {
        const { onReady } = this.props;
        
        if (prevProps.options !== this.props.options) {
            this.drawChart();
            if (onReady) {
                onReady(this.chart);
            }
        }
    },

    componentWillUnmount() {
        this.chart.dispose();
    },

    // getChartData(options) {
    //     options.series = [];
    //     React.Children.map(this.props.children, (child) => {
    //         options.series.push({ ...child.props });
    //     });
    // }

    drawChart() {
        const node = this.refs.chart;
        let options = this.props.options;
        this.chart = echarts.init(node);
        this.chart.setOption(options);
    },

    // renderChildren() {
    //     return React.Children.map(this.props.children, (child) => {
    //         return cloneElement(child, {
    //             hasChart: true
    //         });
    //     });
    // }

    render() {
        const style = this.props.style || {};

        return (
            <div ref="chart" style={ style }></div>
        );
    }
});

export default Chart;