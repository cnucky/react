var React = require('react');
var DragSource = require('react-dnd').DragSource;
import {store, storeAPI} from './store';
import {Line, Bar, Pie, Radar, Bubble, WordCloud, Map, Scatter, Commontable, Crosstable} from './charts-for-react';

var dragSpec = {
    beginDrag: function(props) {
        store.dispatch({ type:'UPDATE_CHART', id:props.id, newId:-1 });
        return {
            type:'CHART',
            state: 'INSTANCE',
            name:props.chartType
        };
    },

    endDrag(props, monitor) {
        if(!monitor.didDrop() && storeAPI.storeExistChartIdEq(-1)) {
            props.oprQueue.stopOpr();
            store.dispatch({ type:'DROP_CHART' });
        }
    }
}

function dragCollect(connect) {
    return {
        connectDragSource: connect.dragSource(),
        connectDragPreview: connect.dragPreview()
    }
}

var DraggableComponent = React.createClass({
    
    propsType: {
        /** some props from store */
        /** some props from react dnd */
        dropTargetID: React.PropTypes.string.isRequired,
        dropTargetPosition: React.PropTypes.number.isRequired,
        height: React.PropTypes.number.isRequired,
        oprQueue: React.PropTypes.object,
        editable: React.PropTypes.bool.isRequired
    },

    componentDidUpdate: function() {
        /** 加载drag时的图片 */
        var connectDragPreview = this.props.connectDragPreview;
        var img = new Image();
        var url = [
            '/bireport/img/commontable.png',
            '/bireport/img/crosstable.png',
            '/bireport/img/line.png',
            '/bireport/img/areaLine.png',
            '/bireport/img/histogram.png',
            '/bireport/img/horizontalBar.png',
            '/bireport/img/line.png',
            '/bireport/img/pie.png',
            '/bireport/img/radar.png',
            '/bireport/img/bubble.jpg',
            '/bireport/img/wordcloud.png',
            '/bireport/img/map.png',
            '/bireport/img/scatter.png'
        ]

        switch(this.props.chartType) {
            case 'COMMONTABLE':
                img.src = url[0];
                break;
            case 'CROSSTABLE':
                img.src = url[1];
                break;
            case 'LINE':
                img.src = url[2];
                break;
            case 'AREALINE':
                img.src = url[3];
                break;
            case 'BAR':
                img.src = url[4];
                break;
            case 'HORIZONTALBAR':
                img.src = url[5];
                break;
            case 'PIE':
                img.src = url[6];
                break;
            case 'RADAR':
                img.src = url[7];
                break;
            case 'BUBBLE':
                img.src = url[8];
                break;
            case 'WORDCLOUD':
                img.src = url[9];
                break;
            case 'MAP':
                img.src = url[10];
                break;
            case 'SCATTER':
                img.src = url[11];
                break;
        }

        img.onload = function () {
            connectDragPreview(img);
        };
    },

    createChart: function(chartType, chartProps) {
        var chartWidth = $('#chart-container-' + this.props.id).innerWidth();
        var theme = store.getState().card.theme;
        var component = undefined;
        switch(chartType) {
            case 'COMMONTABLE':
                component = <Commontable {...chartProps} width={chartWidth} theme={theme} />;
                break;
            case 'CROSSTABLE':
                component = <Crosstable {...chartProps} width={chartWidth} theme={theme}/>;
                break;
            case 'LINE':
            case 'AREALINE':
                component = <Line {...chartProps} width={chartWidth} theme={theme} />;
                break;
            case 'BAR':
            case 'HORIZONTALBAR':
                component = <Bar {...chartProps} width={chartWidth} theme={theme} />;
                break;
            case 'PIE':
                component = <Pie {...chartProps} width={chartWidth} theme={theme} />;
                break;
            case 'RADAR':
                component = <Radar {...chartProps} width={chartWidth} theme={theme} />;
                break;
            case 'BUBBLE':
                component = <Bubble {...chartProps} width={chartWidth} theme={theme} />;
                break;
            case 'WORDCLOUD':
                component = <WordCloud {...chartProps} width={chartWidth} theme={theme} />;
                break;
            case 'MAP':
                component = <Map {...chartProps} width={chartWidth} theme={theme} />;
                break;
            case 'SCATTER':
                component = <Scatter {...chartProps} width={chartWidth} theme={theme} />;
                break;
        }
        return component;
    },

    clickHandle: function(e) {
        e.stopPropagation();
        store.dispatch({
            type: 'SELECT_CHART',
            id: this.props.id
        });
    },

    delClick:function(e){
        e.stopPropagation();
        store.dispatch({
            type: 'DELETE_CHART',
            id: this.props.id,
            dropTargetID: this.props.dropTargetID,
            dropTargetPosition: this.props.dropTargetPosition
        });
    },

    render: function() {
        var {connectDragSource, connectDragPreview, dropTargetID, dropTargetPosition, chartType, isSelected, oprQueue, editable, ...other} = this.props;
        var component = this.createChart(chartType, other);

        var containerId = 'chart-container-' + this.props.id;
        var containerStyle = {
            boxShadow: isSelected ? '0 1px 6px #7DCFE9 ' : '0 0 0 transparent',
            position: 'relative',
            marginBottom: '10px',
            opacity: this.props.id === -1 ? '0.5' : '1',
            height:this.props.height
        }
        
        if(editable) {
            return(
                    <div style={{position:'relative'}}>
                        {
                            connectDragSource(
                                <div>
                                    <div style={{position:'absolute' , top:'-10px',right:'20px',width:'100%',height:'35px',background:'transparent',zIndex:'1000',cursor:'move'}}>

                                    </div>
                                </div>
                            )

                        }
                        <div id={containerId} style={containerStyle} onClick={this.clickHandle}>
                            {component}

                            <i className="antd-icon antd-icon-cross" style={{ display:this.props.isSelected?'inline-block':'none', cursor:'pointer', position:'absolute', right:'5px', top:'5px' }} onClick={this.delClick} />
                        </div>
                    </div>
                )
        }
        else {
            return (
                <div id={containerId} style={containerStyle}>
                    {component}
                </div>
            );
        }
    }
});

module.exports.DraggableComponent = DragSource("BI_REPORT", dragSpec, dragCollect)(DraggableComponent);