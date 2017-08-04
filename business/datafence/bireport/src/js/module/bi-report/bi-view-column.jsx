import Notify from 'nova-notify';
import uuid from 'node-uuid';
import React from 'react';
import {DropTarget} from 'react-dnd';
import {store, storeAPI} from './store';
import {Card} from 'antd';
import {Tab} from './bi-view-tab';
import {IFrame} from './bi-view-iframe';
import {DraggableComponent} from './bi-view-components';
import Themes from "./charts-themes";

/****************************************************************************
 * unit
 ****************************************************************************/
function collect(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        didDrop: monitor.didDrop(),
        item: monitor.getItem()
    }
}

var Unit = React.createClass({

    propTypes: {
        oprQueue: React.PropTypes.object,
        editable: React.PropTypes.bool.isRequired,
        width: React.PropTypes.string.isRequired,
        height: React.PropTypes.string.isRequired,
        position: React.PropTypes.number.isRequired,
        id: React.PropTypes.string.isRequired,
        isSelected: React.PropTypes.bool.isRequired
    },

    insertPosition(dom, pointX, position) {
        if(!storeAPI.layoutExistChild(this.props.id, position))
            return { oprType:'REPLACE', dropTargetPosition:position };
        else {
            var domWidthRange = [dom.offset().left, dom.offset().left + dom.width()];
            if(pointX - domWidthRange[0] <= domWidthRange[1] - pointX)
                return { oprType:'INSERT', dropTargetPosition:position };
            else 
                return { oprType:'INSERT', dropTargetPosition:position + 1 };                
        }
    },

    onChange() {
        store.dispatch({ type:'UPDATE_LAYOUT', id:this.props.id, activePage:this.props.position });
    },

    dragEnterHandle(e) {
        e.stopPropagation();
        if(this.props.item.type === 'LAYOUT') {
            if(this.props.id != 0 && !storeAPI.layoutExistChild(this.props.id, this.props.position)) {
                let action = { type:'MOVE_LAYOUT', layoutId:0, layoutType:this.props.item.name, dropTarget:'COLUMN', dropTargetID:this.props.id, dropTargetPosition:this.props.position };
                this.props.oprQueue.updateOpr(action);
            }
            else {
                this.props.oprQueue.stopOpr();
            }
        }
        else if(this.props.item.type === 'CHART') {
            if(!storeAPI.layoutExistChild(this.props.id, this.props.position) || 
                (storeAPI.layoutExistChildIsChart(this.props.id, this.props.position) && !storeAPI.layoutExistChildIdEq(this.props.id, -1))) {

                let positionInfo = this.insertPosition($(e.currentTarget), e.clientX, this.props.position);
                if(positionInfo.oprType === 'INSERT' && storeAPI.layoutChildrenNums(this.props.id) >= 4) {
                    this.props.oprQueue.stopOpr();
                }
                else {
                    let action = { type:'MOVE_CHART', purpose:'PREVIEW', oprType:positionInfo.oprType, chartType:this.props.item.name, dropTarget:'COLUMN', dropTargetID:this.props.id, dropTargetPosition:positionInfo.dropTargetPosition };
                    this.props.oprQueue.updateOpr(action);
                }
            }
        }
    },

    dropHandle(e) {
        e.stopPropagation();	
        if(this.props.item.type === 'LAYOUT') {
            if(this.props.id === 0 || storeAPI.layoutExistChildIdEq(this.props.id, 0)) {
                store.dispatch({ type:'DROP_LAYOUT' });
            }
            else if(!storeAPI.layoutExistChild(this.props.id, this.props.position)) {
                this.props.oprQueue.stopOpr();
                store.dispatch({ type:'MOVE_LAYOUT', layoutId:uuid.v1(), layoutType:this.props.item.name, dropTarget:'COLUMN', dropTargetID:this.props.id, dropTargetPosition:this.props.position });
            }
        }
        else if(this.props.item.type === 'CHART') {
            if(storeAPI.layoutExistChildIdEq(this.props.id, -1) && storeAPI.layoutExistChildIsChart(this.props.id, this.props.position)) {
                store.dispatch({ type:'DROP_CHART' });
            }
            else {
                let positionInfo = this.insertPosition($(e.currentTarget), e.clientX, this.props.position);
                if(positionInfo.oprType === 'INSERT' && storeAPI.layoutChildrenNums(this.props.id) >= 4) {
                    this.props.oprQueue.stopOpr();
                }
                else if(!storeAPI.layoutExistChild(this.props.id, this.props.position) || 
                    (storeAPI.layoutExistChildIsChart(this.props.id, this.props.position) && !storeAPI.layoutExistChildIdEq(this.props.id, -1))) {
                    
                    this.props.oprQueue.stopOpr();            
                    store.dispatch({ type:'MOVE_CHART', purpose:'DROP', oprType:positionInfo.oprType, chartType:this.props.item.name, dropTarget:'COLUMN', dropTargetID:this.props.id, dropTargetPosition:positionInfo.dropTargetPosition });
                }
            }
        }
    },

    render() {
        var width = this.props.width;
        var height = this.props.height - 15;
        var theme = store.getState().card.theme;
        var liStyle = {
            width: width,
            height: height, 
            padding: '10px 10px 0px 10px',
            border: "1px solid transparent",
            display: 'block',
            float: 'left',
            // background: theme != 'none' ? Themes.importTheme(theme).backgroundColor : null
            background:Themes.importTheme(theme).backgroundColor
        }

        if(this.props.editable) {
            var connectDropTarget = this.props.connectDropTarget;
            return connectDropTarget(
                <li style={liStyle} onDragEnter={this.dragEnterHandle} onDrop={this.dropHandle} onClick={this.onChange}>
                    {this.props.children}
                </li>
            )
        }
        else {
            return (
                <li style={liStyle} >
                    {this.props.children}
                </li>
            )
        }
    }
});
Unit = DropTarget("BI_REPORT", {}, collect)(Unit);


/****************************************************************************
 * Column
 ****************************************************************************/
var Column = React.createClass({

    propTypes: {
        oprQueue: React.PropTypes.object,
        editable: React.PropTypes.bool.isRequired,
        childNodes: React.PropTypes.array.isRequired,           //当前Column的children
        id: React.PropTypes.string.isRequired,                  //当前Column的ID
        isSelected: React.PropTypes.bool.isRequired,
        height: React.PropTypes.number.isRequired,
        activePage: React.PropTypes.number.isRequired
    },

    getNodes(height) {
        var id = this.props.id;
        var childNodes = this.props.childNodes;
        var columnNum = childNodes.length;
        var columnWidth = Math.floor((100 / columnNum) * 100) / 100 + '%';

        var nodes = [];
        for(var i = 0; i < columnNum; i++) {
            if(childNodes[i].type === 'CHART') {
                let chart = storeAPI.getChartByID(childNodes[i].id);
                let component;
                if(!_.isUndefined(chart.height))
                    component = (<DraggableComponent {...chart} dropTargetID={id} dropTargetPosition={i} oprQueue={this.props.oprQueue} editable={this.props.editable} />);
                else
                    component = (<DraggableComponent {...chart} dropTargetID={id} dropTargetPosition={i} height={height - 42} oprQueue={this.props.oprQueue} editable={this.props.editable} />);                    
                
                nodes[i] = (
                    <Unit width={columnWidth} height={height} position={i} id={id} oprQueue={this.props.oprQueue} editable={this.props.editable}>
                        {component}
                    </Unit>
                )
            }
            else if(childNodes[i].type === 'COLUMN') {
                let layout = storeAPI.getLayoutByID(childNodes[i].id);
                nodes[i] = (
                    <Unit width={columnWidth} height={height} position={i} id={id} oprQueue={this.props.oprQueue} editable={this.props.editable}>
                        <Column {...layout} childNodes={childNodes[i].children} height={height - 42} oprQueue={this.props.oprQueue} editable={this.props.editable} />
                    </Unit>
                )
            }
            else if(childNodes[i].type === 'TAB') {
                let layout = storeAPI.getLayoutByID(childNodes[i].id);
                nodes[i] = (
                    <Unit width={columnWidth} height={height} position={i} id={id} oprQueue={this.props.oprQueue} editable={this.props.editable}>
                        <Tab {...layout} childNodes={childNodes[i].children} height={height - 42} oprQueue={this.props.oprQueue} editable={this.props.editable} />
                    </Unit>
                )
            }
            else if(childNodes[i].type === 'IFRAME') {
                let layout = storeAPI.getLayoutByID(childNodes[i].id);
                nodes[i] = (
                    <Unit width={columnWidth} height={height} position={i} id={id} oprQueue={this.props.oprQueue} editable={this.props.editable}>
                        <IFrame {...layout} oprQueue={this.props.oprQueue} editable={this.props.editable} />
                    </Unit>
                )
            }
            else {
                nodes[i] = (
                    <Unit width={columnWidth} height={height} position={i} id={id} oprQueue={this.props.oprQueue} editable={this.props.editable}>
                        {
                            this.props.editable && 
                            <div style={{ height:height - 42, position:'relative', border:(this.props.isSelected&&this.props.activePage===i)?'1px dashed #d9d9d9':'none' }}>                                
                                <i className="antd-icon antd-icon-cross" data-index={i} onClick={this.onEdit} style={{cursor:'pointer', position:'absolute', right:'4px', top:'5px', display:(this.props.isSelected&&this.props.activePage===i)?'inline-block':'none'}} />
                            </div> 
                        }
                    </Unit>
                );
            }
        }
        return nodes;
    },

    onEdit(e) {
        e.stopPropagation();
        store.dispatch({ type:'SHRINK_LAYOUT', id:this.props.id, position:$(e.currentTarget).attr('data-index') });
    },

    columnClickHandle(e) {
        e.stopPropagation();
        store.dispatch({
            type: 'SELECT_LAYOUT',
            id: this.props.id
        });
    },

    addBtnClickHandle(e) {
        e.stopPropagation();
        if(storeAPI.layoutChildrenNums(this.props.id) <= 3)
            store.dispatch({ type: 'EXPAND_LAYOUT', id: this.props.id, expandNum:1 });
        else
			Notify.simpleNotify("列数超过值域", "请将列数控制在1~4列之内", 'error');
    },

    delBtnClickHandle(e) {
        e.stopPropagation();
        store.dispatch({
            type: 'DELETE_LAYOUT',
            id: this.props.id
        });
    },

    render() {
        var height = this.props.height - 15;
        var containerStyle = {marginBottom:'5px', opacity:this.props.id === 0 ? '0.5' : '1'};


        if(this.props.editable) 
            return (
                <div style={containerStyle} onClick={this.columnClickHandle}>
                    <Card className={this.props.isSelected ? 'border-none active' : 'border-none'}>
                        <ul>
                            {
                                this.getNodes(height)
                            }
                        </ul>

                        <i className="antd-icon antd-icon-plus" style={{ display:this.props.isSelected?'inline-block':'none', cursor:'pointer', position:'absolute', right:'25px', top:'5px' }} onClick={this.addBtnClickHandle} />
                        <i className="antd-icon antd-icon-cross" style={{ display:this.props.isSelected?'inline-block':'none', cursor:'pointer', position:'absolute', right:'5px', top:'5px' }} onClick={this.delBtnClickHandle} />
                    </Card>     
                </div>
            )
        else 
            return (
                <div style={containerStyle}>
                    <Card className={this.props.isSelected ? 'border-none active' : 'border-none'}>
                        <ul>
                            {
                                this.getNodes(height)
                            }
                        </ul>
                    </Card>     
                </div>
            )
    }
});

module.exports.Column = Column;