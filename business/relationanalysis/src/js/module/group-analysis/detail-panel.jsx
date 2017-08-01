import React from 'react';
import { Collapse, Tabs, Spin} from 'antd';
import Notify from 'nova-notify';
import {MODE, store} from './store';
const TabPane = Tabs.TabPane;
const Panel = Collapse.Panel;

export default class DetailPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            personDetail:{},
            entityDetail:{},
            personLoder: false,
            entityLoder: false
        }
    }
    componentDidMount() {
        switch (this.props.data.type) {
            case 'entity_node':
                this.loadEntityDetail(this.props.data.detail);
                break;
            case 'people_node':
                this.loadPersonDetail(this.props.data.detail);
                break;
        }
    }

    // TODO yaco 如果外层直接被Animate标签包裹，关闭时由于退出动画的存在会再次进入componentWillReceiveProps
    componentWillReceiveProps (nextProps) {
        switch (nextProps.data.type) {
            case 'entity_node':
                this.loadEntityDetail(nextProps.data.detail);
                break;
            case 'people_node':
                this.loadPersonDetail(nextProps.data.detail);
                break;
        }
    }

    loadPersonDetail(personData) {

        var that = this;
        this.setState({personLoder:true});

        var personDefer = Q.defer(), entitiesDefer = Q.defer();
        var entityInfo = personData.nodes[0];
        $.getJSON('/relationanalysis/personcore/getpersondetail', {
            entityid: entityInfo.nodeId,
            entitytype: entityInfo.nodeType
        }, function (rsp) {
            if (rsp.code == 0) {
                personDefer.resolve(rsp.data.summary);
            } else {
                personDefer.reject(rsp.message);
            }
        });

        var nodesInfo = [];
        _.each(personData.nodes,node=>{
            nodesInfo.push({
                nodeId: node.nodeId,
                nodeType: node.nodeType,
                keyword: node.nodeId
            });
        });
        $.getJSON('/relationanalysis/relationgraph/getNodeDetail', { nodes: JSON.stringify(nodesInfo) }, function(rsp) {
            if (rsp.code == 0) {
                entitiesDefer.resolve(rsp.data);
            } else {
                entitiesDefer.reject(rsp.message);
            }
        });

        var that = this;
        Q.all([personDefer.promise, entitiesDefer.promise]).spread((personSummary, entitiesData)=>{
            var hasSummary = false;
            if(personSummary){
                _.each(personSummary,value=>{
                    if(!_.isEmpty(value.valueList)){
                        hasSummary = true;
                    }
                });
            }

            that.setState({
                personDetail: personSummary,
                entityDetail: entitiesData,
                personLoder: false
            });
        }).catch((msg)=>{
            Notify.simpleNotify('详情加载失败', msg, 'error');
            this.setState({personLoder: false});
        });
    }

    loadEntityDetail(entityData) {
        this.setState({entityLoder:true});
        var that = this;
        $.getJSON('/relationanalysis/relationgraph/getnodedetail', { nodes: JSON.stringify([{
            nodeId: entityData.nodeId,
            nodeType: entityData.nodeType,
            keyword: entityData.nodeId
        }]) }, function(rsp) {
            if (rsp.code == 0 && !_.isEmpty(rsp.data)) {

                that.setState({
                    entityDetail:rsp.data,
                    entityLoder: false
                });
            }
        });
    }

    buildEntityDetailInPerson(){
        var data = this.state.entityDetail;
        if (_.isEmpty(data)) {
            return;
        }
        //var entityNodes = this.props.data.detail.nodes;
        return (<Collapse bordered={false} defaultActiveKey={['0']}>
                    {_.map(data, (node, index) => {
                        //var title = node ? this.props.metadata.entityMeta[node.nodeType] + '：' + node.nodeId : '';
                        var title = '实体' + (index + 1);
                        var properties = data[index] ? data[index].properties : [];
                        return <Panel className="p6 text-ellipsis" header={title} key={index}>
                            <table className="table detail-table-striped">
                                <tbody>
                                {_.map(properties, (prop)=> {
                                    return (<tr>
                                            <td style={{width: '40%'}}>
                                                <span className="fs14 text-nowrap fw600">{prop.key}</span>
                                            </td>
                                            <td className="property-value" style={{width:'60%'}}>
                                                <span>{prop.value}</span>
                                            </td>
                                        </tr>
                                    )
                                })}
                                </tbody>
                            </table>
                        </Panel>
                    })}
                </Collapse>)
    }

    buildEntityDetail() {
        var data = this.state.entityDetail;
        if (_.isEmpty(data)) {
            return;
        }
        return (<table className="table detail-table-striped">
            <tbody>
            {_.map(data[0].properties, (prop)=> {
                return (<tr>
                        <td style={{width: '40%'}}>
                            <span className="fs14 text-nowrap fw600">{prop.key}</span>
                        </td>
                        <td className="property-value" style={{width:'60%'}}>
                            <span>{prop.value}</span>
                        </td>
                    </tr>
                )
            })}
            </tbody>
        </table>)
    }

    buildEntityRelation(data) {
        var data = this.props.data.detail;
        var linkedFrequency='';
        _.each(data.linkDetail , (item , key) =>{
            linkedFrequency +=(key > 0 ? '，' : '')+item.linkedTitle+item.linkedFrequency+'次';
        })
        return (
            <div>
                <table className="table mb10" >
                    <tbody>
                    <tr style={{width: '100%'}}>
                        <td style={{width: '40%'}}>
                            <span className="fs14 text-nowrap fw600">总分</span>
                        </td>
                        <td className="property-value" style={{width:'60%'}}>
                            <span>{data.linkScore}</span>
                        </td>
                    </tr>
                    <tr style={{width: '100%'}}>
                        <td style={{width: '40%'}}>
                            <span className="fs14 text-nowrap fw600">通联概要</span>
                        </td>
                        <td className="property-value" style={{width:'60%'}}>
                            <span>{linkedFrequency}</span>
                        </td>
                    </tr>
                    </tbody>
                </table>
                <Collapse bordered={false} defaultActiveKey={['0']}>
                    {_.map(data.linkDetail, (link, index) => {
                        return <Panel header={link.linkedTitle} key={index}>
                            <table className="table detail-table-striped">
                                <tbody>
                                <tr style={{width: '100%'}}>
                                    <td style={{width: '40%'}}>
                                        <span className="fs14 text-nowrap fw600">亲密度</span>
                                    </td>
                                    <td className="property-value" style={{width: '60%'}}>
                                        <span>{link.score}</span>
                                    </td>
                                </tr>
                                <tr style={{width: '100%'}}>
                                    <td style={{width: '40%'}}>
                                        <span className="fs14 text-nowrap fw600">频次</span>
                                    </td>
                                    <td className="property-value" style={{width: '60%'}}>
                                        <span>{link.linkedFrequency}</span>
                                    </td>
                                </tr>
                                <tr style={{width: '100%'}}>
                                    <td style={{width: '40%'}}>
                                        <span className="fs14 text-nowrap fw600">详情</span>
                                    </td>
                                    <td className="property-value" style={{width: '60%'}}>
                                        {
                                            _.map(link.detail, record=>{
                                                return <div>{'自' + record.startTime + '到' + record.endTime + '/' + record.frequency + '次'}</div>
                                            })
                                        }
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </Panel>
                    })}
                </Collapse>
            </div>



        )

    }

    buildPersonDetail(data){
        var data = this.state.personDetail;
        if (_.isEmpty(data)) {
            return;
        }
        return(
            <table className="table detail-table-striped">
                <tbody>
                {_.map(data, (item)=> {
                    if (!item.valueList[0]) {
                        item.valueList[0] = '—';
                    }
                    return (
                        <tr style={{width: '100%'}}>
                            <td style={{width: '40%'}}>
                                <span className="fs14 text-nowrap fw600">{item.caption}</span>
                            </td>
                            <td className="property-value" style={{width:'60%'}}>
                                <span>{item.valueList[0].value}</span>
                            </td>
                        </tr>
                    )
                })}
                </tbody>
            </table>
        )
    }
    buildTargetRelationDetail(data){
        var data = this.props.data.detail;
        if(!_.isEmpty(data.linkDetail))
        {
            data = data.linkDetail;
        }
        _.map(data, (item, index) => {
               if(!_.isArray(item.detail)){
                    item.detail =  [item.detail];
               } 
            })
        // var showDetail = _.isEmpty(item.detail) ?  '' : '<span className="fs14 text-nowrap fw600">详情</span>';
        return (
            <div>
                <Collapse bordered={false} defaultActiveKey={['0']}>
                    {_.map(data, (item, index) => {
                        return <Panel header={item.linkedTitle} key={index}>
                            <table className="table detail-table-striped">
                                <tbody>                                
                                <tr style={{width: '100%'}}>
                                    <td style={{width: '40%'}}>
                                                                                                          
                                       <span className="fs14 text-nowrap fw600">详情</span>                                                                                                                    
                                    </td>
                                    <td className="property-value" style={{width: '60%'}}>
                                        {                                             
                                            _.map(item.detail, record=>{
                                                if(record.startTime && record.endTime)
                                                {
                                                    return (<div className="mb10">{'自' + record.startTime + '到' + record.endTime + '/' + record.frequency + '次'}</div>)
                                                }
                                            })                                                                                   
                                        }
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </Panel>
                    })}
                </Collapse>
            </div>



        )
    }
    buildRelationDetail(data) {
        var data = this.props.data.detail;
        var linkedFrequency='';
        _.each(data.scoreDetail , (item , key) =>{
            linkedFrequency +=(key > 0 ? '，' : '')+item.linkedTitle+item.linkedFrequency+'次';
        })
        return (
            <div>
                <table className="table mb10" >
                    <tbody>
                        <tr style={{width: '100%'}}>
                            <td style={{width: '40%'}}>
                                <span className="fs14 text-nowrap fw600">总分</span>
                            </td>
                            <td className="property-value" style={{width:'60%'}}>
                                <span>{data.totalScore}</span>
                            </td>
                        </tr>
                        <tr style={{width: '100%'}}>
                            <td style={{width: '40%'}}>
                                <span className="fs14 text-nowrap fw600">通联概要</span>
                            </td>
                            <td className="property-value" style={{width:'60%'}}>
                                <span>{linkedFrequency}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <Collapse bordered={false} defaultActiveKey={['0']}>
                    {_.map(data.scoreDetail, (item, index) => {
                        return <Panel header={item.linkedTitle} key={index}>
                            <table className="table detail-table-striped">
                                <tbody>
                                <tr style={{width: '100%'}}>
                                    <td style={{width: '40%'}}>
                                        <span className="fs14 text-nowrap fw600">亲密度</span>
                                    </td>
                                    <td className="property-value" style={{width: '60%'}}>
                                        <span>{item.score}</span>
                                    </td>
                                </tr>
                                <tr style={{width: '100%'}}>
                                    <td style={{width: '40%'}}>
                                        <span className="fs14 text-nowrap fw600">频次</span>
                                    </td>
                                    <td className="property-value" style={{width: '60%'}}>
                                        <span>{item.linkedFrequency}</span>
                                    </td>
                                </tr>
                                <tr style={{width: '100%'}}>
                                    <td style={{width: '40%'}}>
                                        <span className="fs14 text-nowrap fw600">详情</span>
                                    </td>
                                    <td className="property-value" style={{width: '60%'}}>
                                        {
                                            _.map(item.detail, record=>{
                                                return <div className="mb10">{'自' + record.startTime + '到' + record.endTime + '/' + record.frequency + '次'}</div>
                                            })
                                        }
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </Panel>
                    })}
                </Collapse>
            </div>



        )
    }

    /**
     * 内容+关闭按钮，内容应设置最大高度
     * @returns {XML}
     */
    render() {
        if (!this.props.data.detail) {
            return null;
        }
        var panelStyle = {minHeight: 50,maxHeight: 450, overflowY: 'auto'};
        var tabs = [];
        switch (this.props.data.type) {
            case 'entity_node':
                switch(this.props.mode){
                    case MODE.COHESION:
                        tabs.push(<TabPane tab="实体详情" key="1"><Spin spinning={this.state.entityLoder}><div style={panelStyle}>{this.buildEntityDetail()}</div></Spin></TabPane>);
                        if (!this.props.data.detail.isCenter) {
                            tabs.push(<TabPane tab="关系详情" key="2"><Spin spinning={this.state.entityLoder}><div style={panelStyle}>{this.buildEntityRelation()}</div></Spin></TabPane>);
                        }
                        break;
                case MODE.MULTI_TARGET:
                        tabs.push(<TabPane tab="实体详情" key="1"><Spin spinning={this.state.entityLoder}><div style={panelStyle}>{this.buildEntityDetail()}</div></Spin></TabPane>);
                        break;
                }
                break;
            case 'people_node':
                switch(this.props.mode){
                    case MODE.COHESION:
                        tabs.push(<TabPane tab="人物详情" key="1"><Spin spinning={this.state.personLoder}><div style={panelStyle}>{this.buildPersonDetail()}</div></Spin></TabPane>);
                        tabs.push(<TabPane tab="实体详情" key="2"><Spin spinning={this.state.personLoder}><div style={panelStyle}>{this.buildEntityDetailInPerson()}</div></Spin></TabPane>);
                        if (!this.props.data.detail.isCenter) {
                            tabs.push(<TabPane tab="关系详情" key="3"><Spin spinning={this.state.personLoder}><div style={panelStyle}>{this.buildRelationDetail()}</div></Spin></TabPane>);
                        }
                        break;
                    case MODE.MULTI_TARGET:
                        tabs.push(<TabPane tab="人物详情" key="1"><Spin spinning={this.state.personLoder}><div style={panelStyle}>{this.buildPersonDetail()}</div></Spin></TabPane>);
                        tabs.push(<TabPane tab="实体详情" key="2"><Spin spinning={this.state.personLoder}><div style={panelStyle}>{this.buildEntityDetailInPerson()}</div></Spin></TabPane>);
                        break;
                }
                break;
            case 'entity_relation':
                switch(this.props.mode){
                    case MODE.MULTI_TARGET:
                        tabs.push(<TabPane tab="关系详情" key="1"><Spin spinning={this.state.personLoder}><div style={panelStyle}>{this.buildTargetRelationDetail()}</div></Spin></TabPane>);
                        break;
                }
                break;

        }
        return (
            <div className="flex-layout flex-vertical br-a" style={{background: 'white'}}>
                <div className="panel-body flex-item flex-layout flex-vertical br-n p10">
                    <Tabs defaultActiveKey="1" type="line" size={(tabs.length < 3)?"default":"small"}>
                        {tabs}
                    </Tabs>
                </div>
                <div className="text-center pb10">
                    <span className="btn-round-circle btn-close-detail fa fa-times" onClick={this.props.onClose}></span>
                </div>
            </div>
        )
    }
}