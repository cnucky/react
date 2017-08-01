import React from 'react';
import {Tabs} from 'antd';
const TabPane = Tabs.TabPane;
import {store, MODE} from './store';

const ENTITY_ICONS = {
    "1": {class:'fa fa-user',color:'#F6B132',text:"身份证"},
    "5": {class:'fa fa-phone-square',color:'#6EAFF7',text:"手机"},
    "11": {class:'fa fa-qq',color:'#E95D35',text:"QQ"},
    "12": {class:'fa fa-envelope',color:'#6B4897',text:"电子邮箱"},
    "2": {class:'fa fa-ticket',color:'#F64662',text:"护照"},
    "3": {class:'fa fa-cc-visa',color:'#5457A6',text:"签证"},
    "7": {class:'fa fa-credit-card',color:'#0066CC',text:"银行账户"},
    "14": {class:'fa fa-wifi',color:'#A2453D',text:"IP"},
    "16": {class:'alibaba alitao fs14',color:'#FF5500',text:"淘宝"},
    "17": {class:'alibaba alipay fs14',color:'#01AAEF',text:"支付宝"}
};

export default class NodeFilter extends React.Component {
    constructor(props) {
        super(props);
        this.RELATION_TYPES = this.props.metadata.relationMeta;
        this.ENTITY_TYPES = this.props.metadata.entityMeta;
        this.state = {...this.getStateFromProps(props)};
    }
    /*componentDidUpdate(){
        switch (this.props.mode)

        {
            case MODE.COHESION:
                console.log("filter change");
                this.setState({entityTypes: this.props.types.entity});
                this.setState({relationTypes: this.props.types.relation});
                this.props.onChange;
                break;
        }
    }*/

    componentWillReceiveProps(props) {
        this.setState({...this.getStateFromProps(props)});
    }

    selectEntity(value, e){
        var newSelected = [], isSelected;
        _.each(this.state.entityTypes, item=> {
            if (item != value) {
                newSelected.push(item);
            } else {
                isSelected = true;
            }
        });
        if (!isSelected ) {
            newSelected.push(value);
        }

        this.setState({entityTypes: newSelected});
        this.props.onChange && this.props.onChange(newSelected, this.state.relationTypes);
    }

    selectRelation(value, e) {
        var newSelected = [], isSelected;
        _.each(this.state.relationTypes, item=> {
            if (item != value) {
                newSelected.push(item);
            } else {
                isSelected = true;
            }
        });
        if (!isSelected) {
            newSelected.push(value);
        }

        this.setState({relationTypes: newSelected});

        this.props.onChange && this.props.onChange(this.state.entityTypes, newSelected);
    }

    allSelect(){
        var newSelected = [];
        var selectedTypes = this.state.entityTypes;
        if(selectedTypes.length === this.state.allEntities.length){
            newSelected = [];

        } else {
            _.each(this.state.allEntities, item=> {
                newSelected.push(item);
            });
        }

        this.setState({entityTypes: newSelected});
        this.props.onChange && this.props.onChange(newSelected, this.state.relationTypes);
    }

    oneSelect(){
        var newSelected = [];
        var selectedTypes = this.state.entityTypes;
        newSelected = _.difference(this.state.allEntities,selectedTypes);
        this.setState({entityTypes: newSelected});
        this.props.onChange && this.props.onChange(newSelected, this.state.relationTypes);
    }

    relationAllselect(){
        var newSelected = [];
        var selectedRelations = this.state.relationTypes;
        if(selectedRelations.length === this.state.allRelations.length){
            newSelected = [];
        } else {
            _.each(this.state.allRelations, item=> {
                newSelected.push(item);
            });
        }

        this.setState({relationTypes: newSelected});
        this.props.onChange && this.props.onChange(this.state.entityTypes, newSelected);
    }
    relationOneselect(){
        var newSelected = [];
        var selectedRelations = this.state.relationTypes;
        newSelected = _.difference(this.state.allRelations,selectedRelations);

        this.setState({relationTypes: newSelected});
        this.props.onChange && this.props.onChange(this.state.entityTypes, newSelected);

    }
    close(){
        store.dispatch({type: 'TOGGLE_ENTITY_FILTER', source: this.props.mode});
    }


    render() {
        // console.log("render");

        if(this.props.types != undefined)
        {

            var selectedTypes = this.props.types.entity;
            var selectedRelations = this.props.types.relation;
            this.state.entityTypes = this.props.types.entity;
            this.state.relationTypes = this.props.types.relation;
        }
        else
        {
            var selectedTypes = this.state.entityTypes;
            var selectedRelations = this.state.relationTypes;
        }
        return (
            <div className="br-a panel-shadow p10" style={{background: '#fff', pointerEvents: 'auto', maxWidth: 455, marginTop: 3}}>
                <Tabs defaultActiveKey="1" type="line">
                    <TabPane tab={this.props.showingEntityRelation ? "实体筛选" : "人物筛选"} key="1">
                        {
                            this.props.showingEntityRelation ? (
                                <div className="mauto mt20">
                                    <div className="col-md-12 mb10" style={{posotion:'relative'}}>
                                        <label className="">实体类型</label>

                                        <div className="pull-right" style={{display: 'inline-block'}}>
                                            <div className="ml20 text-center" style={{display: 'inline-block'}} >
                                                <button type="button" className={  selectedTypes.length === this.state.allEntities.length ? 'btn btn-xs btn-primary' : "btn btn-xs btn-default "} onClick={this.allSelect.bind(this)}>
                                                    全选
                                                </button>
                                            </div>
                                            <div className="ml20 text-center" style={{display: 'inline-block'}} >
                                                <button type="button" className='btn btn-xs btn-default' onClick={this.oneSelect.bind(this)}>
                                                    反选
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    {
                                        _.map(this.state.entities, function(nodes, type){
                                            var entityName = this.getEntityNameByType(type);
                                            var name = entityName + '(' + nodes.length + ')';
                                            var iconCfg = this.getEntityIcon(type);
                                            return(
                                                <div className={"category m5 text-center " + (_.contains(selectedTypes, type) ||  selectedTypes.length === this.state.allEntities.length? "checked":"")} onClick={this.selectEntity.bind(this, type)}>
                                                    <div className="category-icon" style={{background: iconCfg.color}}><span className={iconCfg.class}></span></div>
                                                    <div className="category-text">
                                                        <p>{name}</p>
                                                    </div>
                                                </div>
                                            )
                                        },this)
                                    }
                                </div>
                            )  : ''
                        }

                        <div className="mauto mt20">
                            <div className="col-md-12 mb20">
                                <label className="">关系类型</label>

                                <div className="pull-right" style={{display: 'inline-block'}}>
                                    <div className="ml20 text-center" style={{display: 'inline-block'}} >
                                        <button type="button" className={  selectedRelations.length === this.state.allRelations.length ? 'btn btn-xs btn-primary' : "btn btn-xs btn-default "} onClick={this.relationAllselect.bind(this)}>
                                            全选
                                        </button>
                                    </div>
                                    <div className="ml20 text-center" style={{display: 'inline-block'}} >
                                        <button type="button" className={ this.state.oneSelected ? 'btn btn-xs btn-primary' : "btn btn-xs  btn-default"} onClick={this.relationOneselect.bind(this)}>
                                            反选
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {
                                _.map(this.state.relations, function(linkKeys, type) {
                                    var name = this.getRelationNameByType(type) + '(' + linkKeys.length + ')';
                                    var checkboxId = 'check-' + type;
                                    return(
                                        <div key={'relation'+type} className="ml20 mb10" style={{display: 'inline-block'}}>
                                            <div className="checkbox-custom mb5" onClick={this.selectRelation.bind(this, type)}>
                                                <input id={checkboxId} type="checkbox" checked={_.contains(selectedRelations, type)}/>
                                                <label for={checkboxId}>{name}</label>
                                            </div>
                                        </div>
                                    )
                                },this)
                            }
                        </div>
                        <div className="text-center pb10">
                            <span className="btn-round-circle btn-close-detail fa fa-times" style={{width: 28, height: 28, fontSize: 14, border: '1px solid #ccc'}} onClick={this.close.bind(this)}></span>
                        </div>
                    </TabPane>
                </Tabs>
            </div>
        )
    }

    getRelationNameByType(typeId){
        return this.RELATION_TYPES[typeId];
    }

    getEntityNameByType(typeId){
        return this.ENTITY_TYPES[typeId];
    }

    getEntityIcon(typeId) {
        var iconCfg = ENTITY_ICONS[typeId];
        return iconCfg || {
                class: 'fa fa-frown-o',
                color: '#F6B132'
            };
    }

    getStateFromProps(props) {
        var relations = {};
        var entities = {};
        switch(this.props.mode){
        // console.log("nodes");
        // console.log(props.nodes);
            case MODE.COHESION:
                _.each(props.nodes, (node) => {
                    _.each(node.nextLevelNodes, (nextNode) => {
                        entities[nextNode.nodeType] = entities[nextNode.nodeType] || [];
                        entities[nextNode.nodeType].push(nextNode.nodeId);
                        _.each(nextNode.linkDetail, (link) => {
                            relations[link.linkedType] = relations[link.linkedType] || [];
                            relations[link.linkedType].push(link.fromNodeId < link.toNodeId
                                ? link.fromNodeId + '-' + link.toNodeId : link.toNodeId + '-' +  link.fromNodeId);
                        });
                    });

                    entities[node.nodeType] = entities[node.nodeType] || [];
                    entities[node.nodeType].push(node.nodeId);
                });

                var selectedEntities = props.types ? props.types.entity : _.keys(entities),
                    selectedRelations = props.types ? props.types.relation : _.keys(relations),
                    allEntities = _.keys(entities),
                    allRelations = _.keys(relations);
                console.log(entities,relations);
                break;
            case MODE.MULTI_TARGET:
                // console.log(props)
                let selectnodes = [];
                let selectedges = [];
                let nodes = [];
                let edges = [];
                if(this.props.showingEntityRelation)
                {
                    _.each(props.selectDate.entity[0] , (item)=>{
                        selectnodes.push(item.data);
                    })
                    _.each(props.selectDate.entity[1] , (item)=>{
                        selectedges.push(item.data);
                    })
                    nodes = !_.isEmpty(props.selectDate.entity) ? selectnodes :  props.nodes.nodes;
                    edges = !_.isEmpty(props.selectDate.entity) ? selectedges : props.nodes.edges;
                }
                else
                {
                     _.each(props.selectDate.people[0] , (item)=>{
                        selectnodes.push(item.data);
                    })
                    _.each(props.selectDate.people[1] , (item)=>{
                        selectedges.push(item.data);
                    })
                    nodes = !_.isEmpty(props.selectDate.people) ? selectnodes : '';
                    edges = !_.isEmpty(props.selectDate.people) ? selectedges : props.nodes.edges;
                }


                if(this.props.showingEntityRelation){
                    _.each(nodes, (node) => {
                        entities[node.nodeType] = entities[node.nodeType] || [];
                        entities[node.nodeType].push(node.nodeId);
                    });
                }

                _.each(edges, (edge) =>{
                    _.each(edge.linkDetail, (link) =>{
                        relations[link.linkedType] = relations[link.linkedType] || [];
                        relations[link.linkedType].push(edge.key);
                    })
                });
                var selectedEntities = props.types ? props.types.entity : _.keys(entities),
                    selectedRelations = props.types ? props.types.relation : _.keys(relations),
                    allEntities = _.keys(entities),
                    allRelations = _.keys(relations);




                break;
        // console.log("result");

        }
        return {
            entities: entities,
            relations: relations,
            entityTypes: selectedEntities,
            relationTypes: selectedRelations,
            allEntities:allEntities,
            allRelations:allRelations
        }
    }
}