var React = require('react');
import {Card} from 'antd';
import {store, storeAPI} from './store';

/** 组件 */
var DragSource = require('react-dnd').DragSource;

var graphicSpec = {
    beginDrag: function(props) {
        return { name: props.componentName, type:'LAYOUT' };
    },

    endDrag(props, monitor) {
        if(!monitor.didDrop() && storeAPI.storeExistLayoutIdEq(0)) {
            props.oprQueue.stopOpr();
            store.dispatch({ type:'DROP_LAYOUT' });
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
        store.dispatch({ type:'ADD_LAYOUT', layoutType:'COLUMN' });
    },

    mouseLeaveHandle: function() {},

    render: function() {
        var connectDragSource = this.props.connectDragSource;

        return connectDragSource(
            <li className="mb20" style={{width:'33.3%', padding:'0px'}}>
                <Card className="border-hover" bodyStyle={{ paddingTop: '5px', cursor: 'move'}}>
                    <div className='text-center' style={{width: '100%'}}>
                        <div><img src={this.props.url} style={{width: '40px',height:'40px',marginBottom:'5px'}}/></div>
                        <span>{this.props.name}</span>
                    </div>
                </Card>
            </li>
        );
    }
});

Component = DragSource("BI_REPORT", graphicSpec, graphicCollect)(Component);

/** 主版面 */
var Layout = React.createClass({
    componentFactory: function(i) {
        var labelName = ['列布局', 'Tab','iFrame'];
        var componentName = ['COLUMN', 'TAB','IFRAME'];
        var url = [
            '/bireport/img/column.png',
            '/bireport/img/tab.png',
            '/bireport/img/iFrame.png'
        ]
        return (<Component name={labelName[i]} componentName={componentName[i]} url={url[i]} oprQueue={this.props.oprQueue} />);
    },

    render: function() {
        var components = [];
        for (var i = 0; i < 3; i++)
            components.push(this.componentFactory(i));

        return (
            <ul className='list-inline'>
                {components}
            </ul>
        );
    }
});



module.exports.Layout = Layout;
