var React = require('react');
import {Card} from 'antd';
import {store, storeAPI} from './store';

/** 组件 */
var DragSource = require('react-dnd').DragSource;

var graphicSpec = {
    beginDrag: function(props) {
        return { name: props.componentName, type: 'CHART', state:'SAMPLE' };
    },

    endDrag(props, monitor) {
        if(!monitor.didDrop() && storeAPI.storeExistChartIdEq(-1)) {
            props.oprQueue.stopOpr();
            store.dispatch({ type:'DROP_CHART' });
        }
    }
}

function graphicCollect(connect) {
    return {
        connectDragSource: connect.dragSource(),
        connectDragPreview: connect.dragPreview()
    }
}

var Component = React.createClass({
    propTypes: {
        name: React.PropTypes.string.isRequired,
        componentName: React.PropTypes.string.isRequired,
        url: React.PropTypes.string.isRequired,
        oprQueue: React.PropTypes.object.isRequired
    },

    componentDidMount: function () {
        var connectDragPreview = this.props.connectDragPreview;
        var img = new Image();
        img.src = this.props.url;
        img.onload = function () {
            connectDragPreview(img);
        };
    },

    mouseEnterHandle: function() {},

    clickHandle: function() {
        store.dispatch({ type:'ADD_CHART', chartType:this.props.componentName, dropTarget:'CARD' });
    },

    mouseLeaveHandle: function() {},

    render: function() {
        var connectDragSource = this.props.connectDragSource;

        return connectDragSource(
            <li className="mb20" style={{ width:'33.3%', padding:'0px' }} >
                <Card className="border-hover" bodyStyle={{ cursor: 'move', paddingTop: '5px' }}>
                <div className='text-center' style={{ width: '100%' }} >
                    <div><img src={this.props.url} style={{width: '40px',height:'40px',marginBottom:'5px'}}/></div>
                    <div>{this.props.name}</div>
                </div>
                </Card>
            </li>
        );
    }
});

Component = DragSource("BI_REPORT", graphicSpec, graphicCollect)(Component);

/** 主版面 */
var ComponentCharts = React.createClass({
    componentFactory: function(i) {
        var labelName = ['表格', '交叉表', '线图', '面积线图', '柱图', '横向柱图', '饼图', '雷达图','气泡图','词云图','热力地图','散点地图'];
        var componentName = ['COMMONTABLE', 'CROSSTABLE', 'LINE', 'AREALINE', 'BAR', 'HORIZONTALBAR', 'PIE', 'RADAR', 'BUBBLE', 'WORDCLOUD', 'MAP', 'SCATTER'];
        var url = [
            '/bireport/img/commontable.png',
            '/bireport/img/crosstable.png',
            '/bireport/img/line.png',
            '/bireport/img/areaLine.png',
            '/bireport/img/histogram.png',
            '/bireport/img/horizontalBar.png',
            '/bireport/img/pie.png',
            '/bireport/img/radar.png',
            '/bireport/img/bubble.jpg',
            '/bireport/img/wordcloud.png',
            '/bireport/img/map.png',
            '/bireport/img/scatter.png'
        ]
        return (<Component name={labelName[i]} componentName={componentName[i]} url={url[i]} oprQueue={this.props.oprQueue} />);
    },

    render: function() {
        var components = [];
        for (var i = 0; i < 12; i++)
            components.push(this.componentFactory(i));

        return (
            <ul className='list-inline'>
                {components}
            </ul>
        );
    }
});



module.exports.ComponentCharts = ComponentCharts;

