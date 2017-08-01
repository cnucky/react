var React = require('react');
import $ from 'jquery';
import { Card } from 'antd';
import store from './model-apply-store';

/** 组件 */
var DragSource = require('react-dnd').DragSource;

var graphicSpec = {
    beginDrag: function(props) {
        return { name: props.componentName };
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
        url: React.PropTypes.string.isRequired
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
        store.dispatch({ type: 'COMPONENT_IN', name: this.props.componentName });
        store.dispatch({ type: 'COMPONENT_DROP', opacity: 1 });
    },

    mouseLeaveHandle: function() {},

    render: function() {
        var connectDragSource = this.props.connectDragSource;

        return connectDragSource(
            <li className="mb20" onClick={this.clickHandle} onMouseEnter={this.mouseEnterHandle} onMouseLeave={this.mouseLeaveHandle}>
                <Card bodyStyle={{padding: '10px', cursor: 'pointer'}}>
                <div style={{width: '100%'}}>
                    <img src={this.props.url} style={{width: '100%'}}/>
                </div> 
                <div className="mt10 fw600 text-center">
                    {this.props.name}
                </div>
                </Card>
            </li>
        );
    }
});

Component = DragSource("SAMPLE", graphicSpec, graphicCollect)(Component);

/** 主版面 */
var ComponentContainer = React.createClass({
    componentFactory: function(i) {
        var labelName = ['字符类型', '时间类型', '数值类型', '时间间隔', '代码表类型'];
        var componentName = ['string', 'date', 'decimal', 'datetime', 'code'];
        var url = [
            '/modelapply/img/widget-string.png',
            '/modelapply/img/widget-date.png',
            '/modelapply/img/widget-number.png',
            '/modelapply/img/widget-time.png',
            '/modelapply/img/widget-codetag.png'
        ]
        return (<Component name={labelName[i]} componentName={componentName[i]} url={url[i]}/>);
    },

    render: function() {
        var components = [];
        for (var i = 0; i < 5; i++)
            components.push(this.componentFactory(i));

        return (
            <ul>
                {components}
            </ul>
        );
    }
});

module.exports = ComponentContainer;
