import Notify from 'nova-notify';
import uuid from 'node-uuid';
import React from 'react';
import {DropTarget} from 'react-dnd';
import {Tabs} from 'antd';
const TabPane = Tabs.TabPane;
import {store, storeAPI} from './store';
import {Column} from './bi-view-column';
import {IFrame} from './bi-view-iframe';
import {DraggableComponent} from './bi-view-components';
import Themes from "./charts-themes";

/****************************************************************************
 * Tab
 ****************************************************************************/
function collect(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        item: monitor.getItem()
    }
}

var Tab = React.createClass({

    propsType:{
        oprQueue: React.PropTypes.object,
        editable: React.PropTypes.bool.isRequired,
        height: React.PropTypes.number.isRequired,
        id: React.PropTypes.string.isRequired,
        childNodes: React.PropTypes.array.isRequired,
        isSelected: React.PropTypes.bool.isRequired,
        tabNum: React.PropTypes.number.isRequired,
		activePage: React.PropTypes.number.isRequired,
		titles: React.PropTypes.array.isRequired 
    },

    componentDidMount () {
        let theme = store.getState().card.theme;
        let tabHead = '.ant-tabs-tab';
        let tabContent = '.ant-tabs-content';
        
        // if(theme != 'none') {
            $(tabHead).css({
                background: Themes.importTheme(theme).backgroundColor
            });   
            $(tabContent).css({
                'border-bottom': '1px solid #D9D9D9',
                'border-left': '1px solid #D9D9D9',
                'border-right': '1px solid #D9D9D9',
                'border-radius': '0 0 6px 6px',
                'padding': '10px 10px 0px 10px',
                'background': Themes.importTheme(theme).backgroundColor
            });
        // }
        // else {
        //     $(tabContent).css({
        //         'border-bottom': '1px solid #D9D9D9',
        //         'border-left': '1px solid #D9D9D9',
        //         'border-right': '1px solid #D9D9D9',
        //         'border-radius': '0 0 6px 6px',
        //         'padding': '10px 10px 0px 10px',
        //         'background': '#fff'
        //     });
        // }
    },

    /** 新属性 */
    componentWillReceiveProps(nextProps) {
        let theme = store.getState().card.theme;
        let tabHead = '.ant-tabs-tab';
        let tabContent = '.ant-tabs-content';
        // if(theme != 'none') {
            $(tabHead).css({
                background: Themes.importTheme(theme).backgroundColor
            });   
            $(tabContent).css({
                'border-bottom': '1px solid #D9D9D9',
                'border-left': '1px solid #D9D9D9',
                'border-right': '1px solid #D9D9D9',
                'border-radius': '0 0 6px 6px',
                'padding': '10px 10px 0px 10px',
                'background': Themes.importTheme(theme).backgroundColor
            });
        // }
        // else {
        //     $(tabHead).css({
        //         background: '#fff'
        //     });
        //     $(tabContent).css({
        //         'border-bottom': '1px solid #D9D9D9',
        //         'border-left': '1px solid #D9D9D9',
        //         'border-right': '1px solid #D9D9D9',
        //         'border-radius': '0 0 6px 6px',
        //         'padding': '10px 10px 0px 10px',
        //         'background': '#fff'                
        //     });
        // }

        let tabBar = '#tab-container-' + nextProps.id + ' .ant-tabs-bar';
        if(nextProps.isSelected) {
            $(tabBar).css({
                'border-top': '1px solid #D9D9D9',
                'border-right': '1px solid #D9D9D9',
                'border-radius': '6px 6px 0px 0px'
            });
        }
        else {
            $(tabBar).css({
                'border-top': 'none',
                'border-right': 'none',
                'border-radius': 'none'
            });
        }
    },

    /** 初始化 panels */
    getPanels(childNodes) {
        var panes = _.map(childNodes, function(node, index) {
            let content = '';
            let height = this.props.height;
            let tabTitleHeight = 36;
            let tabPaddingBorderHeight = 22;

            let contentHeight = height - (tabTitleHeight + tabPaddingBorderHeight);
            if(node.type === 'CHART') {
                let chart = storeAPI.getChartByID(node.id);
                if(!_.isUndefined(chart.height))
                    content = (<DraggableComponent {...chart} dropTargetID={this.props.id} dropTargetPosition={index} oprQueue={this.props.oprQueue} editable={this.props.editable} />);
                else
                    content = (<DraggableComponent {...chart} dropTargetID={this.props.id} dropTargetPosition={index} height={contentHeight} oprQueue={this.props.oprQueue} editable={this.props.editable} />);                    
            }
            else if(node.type === 'COLUMN') {
                let layout = storeAPI.getLayoutByID(node.id);
                content = (<Column {...layout} childNodes={node.children} height={contentHeight} oprQueue={this.props.oprQueue} editable={this.props.editable} />);
            }
            else if(node.type === 'TAB') {
                let layout = storeAPI.getLayoutByID(node.id);                
                content= (<DroppableTab {...layout} childNodes={node.children} height={contentHeight} oprQueue={this.props.oprQueue} editable={this.props.editable} />);
            }
            else if(node.type === 'IFRAME') {
                let layout = storeAPI.getLayoutByID(node.id);                
                content= (<IFrame {...layout} oprQueue={this.props.oprQueue} editable={this.props.editable} />);
            }
            else {
                content= (<div style={{'height':contentHeight, 'marginBottom':10}} />);
            }

            return {
                title: this.props.titles[index] === "" ? "选项卡" : this.props.titles[index],
                content: content,
                key: index.toString()
            };
        }.bind(this));
        return panes;
    },

    /** 切换面板时回调 */
    onChange(activeKey) {
        store.dispatch({ type:'UPDATE_LAYOUT', id:this.props.id, activePage:parseInt(activeKey) });
    },

    /** 删除时回调 */
    onEdit(targetKey, action) {
        if(action === 'remove')
            store.dispatch({ type:'SHRINK_LAYOUT', id:this.props.id, position:parseInt(targetKey) });
    },

    /** 新增页 */
    addBtnClickHandle(e) {
        e.stopPropagation();
        if(storeAPI.layoutChildrenNums(this.props.id) <= 19)
            store.dispatch({ type: 'EXPAND_LAYOUT', id: this.props.id, expandNum:1 });
        else
			Notify.simpleNotify("页数超过值域", "请将页数控制在1~20页之内", 'warning');
    },

    /** 删除tab组件 */
    delBtnClickHandle(e) {
        e.stopPropagation();
        store.dispatch({
            type: 'DELETE_LAYOUT',
            id: this.props.id
        });
    },

    /** tab点击状态改为选中 */
    tabClickHandle(e) {
        e.stopPropagation();
        store.dispatch({
            type: 'SELECT_LAYOUT',
            id: this.props.id
        });
    },

    dragEnterHandle(e) {
        e.stopPropagation();
        if(this.props.item.type === 'LAYOUT') {
            if(this.props.id != 0 && !storeAPI.layoutExistChild(this.props.id, this.props.activePage)) {
                let action = { type:'MOVE_LAYOUT', layoutId:0, layoutType:this.props.item.name, dropTarget:'TAB', dropTargetID:this.props.id, dropTargetPosition:this.props.activePage };
                this.props.oprQueue.updateOpr(action);            
            }
            else {
                this.props.oprQueue.stopOpr();
            }
        }
        else if(this.props.item.type === 'CHART') {
            if(!storeAPI.layoutExistChild(this.props.id, this.props.activePage) || 
                (storeAPI.layoutExistChildIsChart(this.props.id, this.props.activePage) && !storeAPI.layoutExistChildIdEq(this.props.id, -1))) {
                    
                let dropTargetPosition = storeAPI.nextTabPagePosition(this.props.id, this.props.activePage);
                if(dropTargetPosition > 20) {
                    this.props.oprQueue.stopOpr();
                }
                else {
                    let action = { type:'MOVE_CHART', purpose:'PREVIEW', chartType:this.props.item.name, dropTarget:'TAB', dropTargetID:this.props.id, dropTargetPosition:dropTargetPosition };
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
            else if(!storeAPI.layoutExistChild(this.props.id, this.props.activePage)) {
                this.props.oprQueue.stopOpr();
                store.dispatch({ type:'MOVE_LAYOUT', layoutId:uuid.v1(), layoutType:this.props.item.name, dropTarget:'TAB', dropTargetID:this.props.id, dropTargetPosition:this.props.activePage });
            }
        }
        else if(this.props.item.type === 'CHART') {
            if(storeAPI.layoutExistChildIdEq(this.props.id, -1)) {
                store.dispatch({ type:'DROP_CHART' });
            }
            else {
                let dropTargetPosition = storeAPI.nextTabPagePosition(this.props.id, this.props.activePage);
                if(dropTargetPosition > 20) {
                    this.props.oprQueue.stopOpr();
                }
                else {
                    this.props.oprQueue.stopOpr();  
                    store.dispatch({ type:'MOVE_CHART', purpose:'DROP', chartType:this.props.item.name, dropTarget:'TAB', dropTargetID:this.props.id, dropTargetPosition:dropTargetPosition });
                }
            }
        }
    },

    render() {
        var activeKey = this.props.activePage + '';
        var panes = this.getPanels(this.props.childNodes);
        var tabStyle = {
            boxShadow: this.props.isSelected ? '0px 1px 6px #7DCFE9' : '0 0 0 transparent', 
            opacity: this.props.id === 0 ? '0.5' : '1', 
            borderRadius: '6px', 
            marginBottom: '10px'
        };
        var btns= (
            <div>
                <i className="antd-icon antd-icon-plus" style={{ display:this.props.isSelected?'inline-block':'none', cursor:'pointer', marginRight:'10px' }} onClick={this.addBtnClickHandle} />
                <i className="antd-icon antd-icon-cross" style={{ display:this.props.isSelected?'inline-block':'none', cursor:'pointer', marginRight:'5px' }} onClick={this.delBtnClickHandle} />
            </div>
        );

        if(this.props.editable) {
            var connectDropTarget = this.props.connectDropTarget;
            return connectDropTarget(
                <div id={"tab-container-" + this.props.id} className='tabContainer' style={tabStyle} onClick={this.tabClickHandle} onDrop={this.dropHandle} onDragEnter={this.dragEnterHandle}>
                    <Tabs activeKey={activeKey} size='default' type='editable-card' hideAdd={true} tabBarExtraContent={btns} onChange={this.onChange} onEdit={this.onEdit}>
                        {
                            panes.map(
                                pane => <TabPane tab={pane.title} key={pane.key}>{pane.content}</TabPane>
                            )
                        }
                    </Tabs>
                </div>
            );
        }
        else {
            return (
                <div id={"tab-container-" + this.props.id} className='tabContainer' style={tabStyle}>
                    <Tabs activeKey={activeKey} size='default' type='card' onChange={this.onChange}>
                        {
                            panes.map(
                                pane => <TabPane tab={pane.title} key={pane.key}>{pane.content}</TabPane>
                            )
                        }
                    </Tabs>
                </div>
            );
        }
    }
});
var DroppableTab = DropTarget("BI_REPORT", {}, collect)(Tab);
module.exports.Tab = DroppableTab;