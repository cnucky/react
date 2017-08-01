import React from 'react';

import {store, MODE} from './store';
import DataProvider from './data-provider';
import NodeTable from './node-table';
import DetailPanel from './detail-panel';
import GrapZone from './graph-zone';
import TargetGrapZone from './target-graph-zone';
import TreeGrapZone from './tree-graph-zone';
import FilterPanel from './filter-panel';
import NovaUtils from 'nova-utils';
import Animate from 'rc-animate';
import Notify from 'nova-notify';
import {Tooltip} from 'antd';

export default class AnalysisPanel extends React.Component {
    constructor(props) {
        super(props);

        this.dataProvider = new DataProvider(this.props.mode);

        this.nodeClickListener = this.onNodeClicked.bind(this);
        this.linkClickListener = this.onLinkClicked.bind(this);
        this.detailCloseListener = this.onDetailClose.bind(this);
        this.filterChangeListener = this.onFilterChanged.bind(this);
        this.onItemClick = this.selectNode.bind(this);
    }

    componentWillReceiveProps(props) {
        if (!this.props.metadata && props.metadata && !this.props.analysisData) {
            this.dataProvider.setMetadata(props.metadata);
            this.dataProvider.loadAnalysisData();
        }
    }

    componentDidMount() {

    }

    createTopButtons() {
        var buttons = [];

        function addLi(title, iconCls, clickFn, active) {
            buttons.push(
                <Tooltip title={title} placement="bottom">
                    <button type="button" className={"mr5 btn btn-sm " + (active ? 'btn-primary' : 'btn-default')}
                            style={{pointerEvents: 'auto'}} onClick={clickFn}>
                        <i className={iconCls + ' fa-fw'}></i>
                    </button>
                </Tooltip>
            );
        }
        addLi("最大化", 'glyphicon glyphicon-fullscreen', (event) => {
            store.dispatch({type: 'TOGGLE_FULL_SCREEN', source: this.props.mode, isEntityDetail: this.props.showingEntityRelation});
        });

        if (!this.props.fullscreenOn) {
            addLi("显示节点列表", 'glyphicon glyphicon-list', (event) => {
                store.dispatch({type: 'TOGGLE_NODE_TABLE', source: this.props.mode});
            }, this.shouldComponentShow('node-table'));

            if (this.props.mode == MODE.COHESION ) {
                addLi("模式切换", 'glyphicon glyphicon-refresh', (event) => {
                    store.dispatch({type: 'TOGGLE_PEOPLE_ENTITY', source: this.props.mode});
                });
                
                if (this.props.showingEntityRelation) {
                    addLi("筛选", 'glyphicon glyphicon-filter', (event) => {
                        if (!this.props.filterEnabled) {
                            this.onDetailClose();
                        }
                        store.dispatch({type: 'TOGGLE_ENTITY_FILTER', source: this.props.mode});
                    }, this.shouldComponentShow('filter-panel'));
                }
            }

            if (this.props.mode == MODE.MULTI_TARGET ) {
                if(!this.props.isEditState && !this.props.showTree){
                    addLi("模式切换", 'glyphicon glyphicon-refresh', (event) => {
                        store.dispatch({type: 'TOGGLE_PEOPLE_ENTITY', source: this.props.mode});

                    });
                }
                if(!this.props.showTree){
                    addLi("筛选", 'glyphicon glyphicon-filter', (event) => {
                        if (!this.props.filterEnabled) {
                            this.onDetailClose();
                        }
                        store.dispatch({type: 'TOGGLE_ENTITY_FILTER', source: this.props.mode});
                    }, this.shouldComponentShow('filter-panel'));
                }

                
                if(!this.props.showTree)
                {
                    addLi("编辑模式", 'fa fa-pencil-square-o', (event) => {

                        store.dispatch({type: 'CHANGE_EDIT_STATE', source: this.props.mode});
                        this.onDetailClose();
                    },this.props.isEditState);
                }

                if(this.props.isEditState)
                {
                    addLi("框选", 'fa fa-object-group fa-fw', (event) => {
                        store.dispatch({type: 'CIRCLE_CHOOSE', source: this.props.mode});
                    },this.props.isCircleChoose);

                    addLi("应用", 'glyphicon glyphicon-ok', (event) => {
                        store.dispatch({type: 'GET_SELECT_DATA', source: this.props.mode, isInit: false});
                    });

                    addLi("删除", 'glyphicon glyphicon-trash', (event) => {
                        store.dispatch({type: 'DELETED_SELECT_DATA', source: this.props.mode});
                    });

                    addLi("保存", 'fa fa-save fa-fw', (event) => {
                        store.dispatch({type: 'CHANGE_EDIT_STATE', source: this.props.mode});
                    });
                    if(!this.props.showingEntityRelation)
                    {
                        if(!_.isEmpty(this.props.beforeLinkArray) || !_.isEmpty(this.props.beforeNodeArray))
                        {
                            addLi("撤销", 'fa fa-reply fa-fw', (event) =>{
                                store.dispatch({type:'UNDO_SELECT_DATA',source:this.props.mode});
                            });
                        }
                    }
                    else
                    {
                        if(!_.isEmpty(this.props.entityNodeArray) || !_.isEmpty(this.props.entityLinkArray))
                        {
                            addLi("撤销", 'fa fa-reply fa-fw', (event) =>{
                                store.dispatch({type:'UNDO_SELECT_DATA',source:this.props.mode});
                            });
                        }
                    }
                    
                }
            }
            if(this.props.mode == MODE.MULTI_TARGET)
            {
                if(!this.props.isEditState)
                {
                    if(!this.props.showTree){

                        addLi("多选", 'fa fa-check-square-o', (event) => {
                            store.dispatch({type: 'CHECK', source: this.props.mode});


                        } , this.props.isCheck);
                    } else {
                        this.props.isCheck = false;
                    }
                    addLi("树图切换", 'fa fa-sitemap fa-fw', (event) => {
                        let selectData = this.props.isEntityRelation ? this.props.selectData.entity : this.props.selectData.people;
                        if(_.isEmpty(selectData)){
                            store.dispatch({type: 'GET_SELECT_DATA', source: this.props.mode, isInit: true});
                            return false;
                        }
                        var node = [],link = [] ,linkId = [];
                        _.each(selectData[0] , (item)=>{
                            node.push(item.key);
                        })
                        _.each(selectData[1] , (item)=>{
                            link.push(item.from,item.to);

                        })

                        if(_.difference(_.uniq(node), _.uniq(link)) != ''){
                            Notify.simpleNotify('错误', '请先框对应关系所需节点', 'error');
                            return false;
                        }
                        store.dispatch({type: 'TOGGLE_TREE', source: this.props.mode});
                    } , this.props.showTree);
                }
            }
        }

        return (
            <div className="p5">
                <span className="anticon"></span>
                {buttons}
            </div>
        );
    }
    createTreeGraphZone(){
        return <TreeGrapZone ref="graphZone" mode={this.props.mode} data={this.props.analysisData} types={this.props.filterTypes} selectKey={this.props.selectKey} selectData={this.props.selectData}
                             overviewEnabled={this.shouldComponentShow('overview')} isTree={this.props.showTree} isEntityRelation={this.props.showingEntityRelation}
                             selectedObject={this.props.selectedObject}
                             onNodeClicked={this.nodeClickListener} onLinkClicked={this.linkClickListener} onCreated={this.onGraphCreated}/>
    }

    createGraphZone() {
        switch (this.props.mode){
            case MODE.COHESION:
                return(<GrapZone ref="graphZone" mode={this.props.mode} data={this.props.analysisData} types={this.props.filterTypes}
                                 overviewEnabled={this.shouldComponentShow('overview')} isTree={this.props.showTree} isEntityRelation={this.props.showingEntityRelation}
                                 selectedObject={this.props.selectedObject}
                                 onNodeClicked={this.nodeClickListener} onLinkClicked={this.linkClickListener} onCreated={this.onGraphCreated}/>);
            case MODE.MULTI_TARGET:

                return(<TargetGrapZone ref="graphZone" outEditState={this.props.outEditState} deletedData={this.props.deletedData} mode={this.props.mode} filterEntityData={this.props.filterEntityData} entityData={this.dataProvider.entityData(this.props.analysisData)} filterPeopleData={this.props.filterPeopleData} peopleData={this.dataProvider.peopleData(this.props.analysisData)} data={this.props.analysisData} types={this.props.filterTypes} selectData={this.props.selectData} selectKey={this.props.selectKey}
                                       overviewEnabled={this.shouldComponentShow('overview')}   isFilter={this.props.isFilter}  isCheck = {this.props.isCheck} isTree={this.props.showTree} isTreeButton={this.props.isTreeButton} isEntityRelation={this.props.showingEntityRelation}
                                       selectedObject={this.props.selectedObject} undo = {this.props.undo} refreshGragh={this.props.refreshGragh} shouldGetData={this.props.shouldGetData} isEditState={this.props.isEditState}
                                       onNodeClicked={this.nodeClickListener} onLinkClicked={this.linkClickListener} onCreated={this.onGraphCreated} isInit={this.props.isInit} isCircleChoose={this.props.isCircleChoose}/>);
        }

    }



    onNodeClicked(event, graphObj) {
        this.closeNodeTable();
        this.showNodeDetail(graphObj.data.data);
    }

    showNodeDetail(detail) {
        var action = {type: 'NODE_SELECTED', source: this.props.mode};
        if (this.props.showingEntityRelation) {
            action.data = {
                type: 'entity_node',
                detail: detail
            }
        } else {
            action.data = {
                type: 'people_node',
                detail: detail
            }
        }
        store.dispatch(action);

    }

    onLinkClicked(event, graphObj) {
        this.closeNodeTable();

        if (this.shouldComponentShow('filter-panel')) {
            store.dispatch({type: 'TOGGLE_ENTITY_FILTER', source: this.props.mode});

        }
        var action = {type: 'LINK_SELECTED', source: this.props.mode};
        action.data = {
                type: 'entity_relation',
                detail: graphObj.data.data            
        }

        store.dispatch(action);
    }

    closeNodeTable() {
        store.dispatch({
            type: 'CLOSE_NODE_TABLE',
            source: this.props.mode
        });
    }

    onFilterChanged(entityTypes, relationTypes) {

        switch (this.props.mode){
            case MODE.COHESION:
                store.dispatch({
                    type: 'DATA_FILTER',
                    source: this.props.mode,
                    filterTypes:{entity:entityTypes,relation:relationTypes}
                });
                break;
            case MODE.MULTI_TARGET:
                let types = {entity:entityTypes,relation:relationTypes};
                let peopleFliter , entityFliter;

                if (types){
                    if(this.props.showingEntityRelation){
                        let data = [];
                        if(_.isEmpty(this.props.selectData.entity )){
                            data = this.props.analysisData
                        } else {
                            let entity = [];
                            _.each(this.props.selectData.entity[0] , (item) =>{
                                entity.push(item.data)
                            })
                            let edges = [];
                            _.each(this.props.selectData.entity[1] , (item) =>{
                                edges.push(item.data)
                            })

                            data = {
                                nodes:{
                                    nodes:entity,
                                    edges:edges
                                }
                            }
                        }

                        entityFliter = this.dataProvider.changeEntityNodesLinks(data, types);
                    } else {
                        let data = [];
                        if(_.isEmpty(this.props.selectData.people )){
                            data = this.props.analysisData
                        } else {
                            let persons = [];
                            _.each(this.props.selectData.people[0] , (item) =>{
                                persons.push(item.data)
                            })
                            let edges = [];
                            _.each(this.props.selectData.people[1] , (item) =>{
                                edges.push(item.data)
                            })
                            data = {
                                persons:{
                                    persons:persons,
                                    edges:edges
                                }
                            }

                        }
                        peopleFliter = this.dataProvider.changePeopleNodesLinks(data, types);
                    }

                    store.dispatch({
                        type: 'DATA_FILTER',
                        source: this.props.mode,
                        filterPeopleData:peopleFliter,
                        filterEntityData:entityFliter,
                        filterTypes:types
                    });
                }
                break

        }
    }


    onDetailClose() {
        store.dispatch({
            type: 'CLOSE_DETAIL_PANEL',
            source: this.props.mode,
            isEntityDetail: this.props.showingEntityRelation
        });
    }

    // select from node-table
    selectNode(node) {
        this.refs.graphZone.selectNodeByKey(node.key);

        this.showNodeDetail(node);
    }

    createDetailPanel() {
        if (!this.shouldComponentShow('detail-panel')) {
            return null;
        }
        if (this.props.detailData && !this.props.isCheck) {
            if (this.props.showingEntityRelation) {
                return <DetailPanel visible key="detailPanel" mode={this.props.mode} metadata={this.props.metadata} onClose={this.detailCloseListener}
                                    data={this.props.detailData} selectItem={this.props.selectItem}/>
            } else {
                return <DetailPanel visible key="detailPanel" mode={this.props.mode} metadata={this.props.metadata} onClose={this.detailCloseListener}
                                    data={this.props.detailData} selectItem={this.props.selectItem}/>
            }
        }
    }

    /**
     * 根据面板之间的显示优先级及状态，判断是否应该显示
     */
    shouldComponentShow(name) {
        switch (name) {
            case 'filter-panel':
                return this.props.mode == MODE.MULTI_TARGET ? this.props.metadata && this.props.filterEnabled : this.props.metadata && this.props.showingEntityRelation && this.props.filterEnabled;
            case 'overview':
                return this.props.overviewEnabled && !this.props.nodeTableEnabled;
            case 'node-table':
                return this.props.nodeTableEnabled;
            case 'detail-panel':
                // return !this.shouldComponentShow('filter-panel');
                return this.props.detailData != null ;
        }
    }

    /**
     * 四部分，topbuttons，nodetable, detailpanel, graphzone
     * @returns {XML}
     */
    render() {
        var nodeTableProps;
        var buttons = this.createTopButtons();
        var detailPanel = this.createDetailPanel();

        switch (this.props.mode){
            case MODE.COHESION:
                nodeTableProps = this.props.analysisData ? this.dataProvider.getTableData(this.props.analysisData, this.props.showingEntityRelation)
                    : {nodes: []};
                    break;
            case MODE.MULTI_TARGET:
                // var analysisData = !this.props.isTreeButton ? this.props.analysisData : this.props.selectData;
                nodeTableProps = this.props.analysisData ? this.dataProvider.getTargetTableData(this.props.analysisData, this.props.showingEntityRelation, this.props.selectData)
                    : {nodes: []};
                    break;
        }
        return (
            <div style={{height: '100%', width: '100%'}}>
                <div className="p5 flex-layout"
                     style={{position: 'absolute', height: '100%', width: '100%', zIndex: 10, pointerEvents: 'none', overflow: 'hidden'}}>
                    <div className="flex-item flex-layout flex-vertical">
                        {buttons}
                        <div className="flex-item">
                            <div style={{position:'absolute', width: '100%'}}>
                                <Animate showProp="visible" transitionName="slideLR">
                                    {this.shouldComponentShow('filter-panel')
                                        ? <FilterPanel visible key="filterPanel" mode={this.props.mode} onChange={this.filterChangeListener} showingEntityRelation={this.props.showingEntityRelation}  nodes={this.props.showingEntityRelation ? this.props.analysisData.nodes : this.props.analysisData.persons}
                                                       metadata={this.props.metadata} types={this.props.filterTypes} isTreeButton={this.props.isTreeButton} selectDate={this.props.selectData}/> : null}
                                </Animate>
                            </div>
                            <Animate showProp="visible" transitionName="fade">
                                <div ref="detailPanel" className="panel-shadow m5"
                                     style={{position:'absolute', pointerEvents: 'auto', width: '350px', right: 0}}>
                                        {detailPanel}
                                </div>
                            </Animate>
                        </div>
                        <Animate showProp='visible' transitionName='slideUD'>
                            {this.shouldComponentShow('node-table')
                                ? <div ref="nodeTable" visible key="nodeTable"
                                       style={{pointerEvents: 'auto', maxHeight: '400px'}}>
                                <NodeTable {...nodeTableProps} mode={this.props.mode} onItemClick={this.onItemClick} metadata={this.props.metadata}
                                           isEntity={this.props.showingEntityRelation} selectData={this.props.selectData} analysisData={this.props.analysisData} />
                            </div> : null}
                        </Animate>
                    </div>
                </div>
                {this.props.metadata && this.props.analysisData && !this.props.showTree ? this.createGraphZone() : this.createTreeGraphZone()}
            </div>
        );
    }
}
