import React from 'react';

import { Table ,Affix, Button } from 'antd';
import {store} from '../store';
//import Experience from './../tpl-experience';
import Util from 'nova-utils';
require('../../../module/renlifang/styles.less');

export default class RelationOrganize extends React.Component {
    constructor(props) {
        super(props);
        this.state= {
            columns: [{
                title: '组织名称',
                dataIndex: 'organizeName',
                render:(text,record,index) =><span className={record.key+" "+"active_organize_link"}>{index==0?<a style={{color:"#3498db",fontWeight:"bold"}} onClick={()=>{this.detailShow(record.key,record.type);
                this.showDetail(record.key,record.type)}}>{text}</a>:<a style={{color:"#666",fontWeight:"bold"}} onClick={()=>{this.detailShow(record.key,record.type);
                this.showDetail(record.key,record.type)}}>{text}</a>}</span>,
                width: 150
            }, {
                title: '国家地区',
                dataIndex: 'country',
                width: 150
            }, {
                    title: '城市',
                    dataIndex: 'city',
                    width: 150
            }, {
                    title: '成员人数',
                    dataIndex: 'memberNum',
                    width: 150
                }
            ]
        }
    }

    componentDidMount() {
        let entityId, entityType;
        entityId = BASE64.decoder(Util.getURLParameter('entityid') || '');
        entityType = BASE64.decoder(Util.getURLParameter('entitytype') || '');
        $.getJSON("/renlifang/holographic/getOrganize", {
            entityid: entityId,
            entitytype:entityType
        }, function(rsp) {
            if (rsp.code == 0) {
                store.dispatch({
                    type: 'GET_ORGANIZEDATA',
                    organizeData:rsp.data.result
                });
            }
        });
        //this.setState({
        //    organizeData: store.getState().organizeData
        //})
        //$(".active_organize_link a").eq[0].css("color","red");
        //$("."+key+" "+"a").css("color","red");
        //650102198709261626

    }
    componentWillUpdate(){

    }
    showDetail(key,type){
        $(".active_organize_link  a").css("color","#666");
        $("."+key+" "+"a").css("color","#3498db");
        const organizedataDetail = store.getState().organizeData;
        if(!_.isEmpty(organizedataDetail)&&organizedataDetail) {
            _.map(organizedataDetail, (item) => {
                if (item.orgId == key) {
                    this.setState({
                        organizeDetaildata: item.properties
                    })
                }

            })
        }
    }
    detailShow(key,type,load){
        if(!load){
            showLoader();
        };
        this.setState({
            flag:true
        });
        $.getJSON("/renlifang/holographic/getorganizeMember", {
            orgId: key,
            type: type
        }, function(rsp) {
            if (rsp.code == 0) {
                hideLoader();
                var data_temp=rsp.data.result;
                var ogranizeMember =[];
                _.map(data_temp, (list,key) => {
                    var memberItem ={
                        key:key,
                        title:""
                    }
                    var name="";
                    //var duty="";
                    _.map(list.properties, (item) => {
                        if(item.name=="NAME"){
                            name=item.valueList[0];
                        }
                        //if(item.name=="DUTY"){
                        //    duty=item.valueList[0];
                        //}
                    })
                   // memberItem.title=name+"("+duty+")";
                    memberItem.title=name;
                    ogranizeMember.push(memberItem);
                })
                //$('#relation-organize-tree').empty();
                var datagroup =[{
                    title: "同组织成员 (" + ogranizeMember.length + ")",
                    children: ogranizeMember
                }];
                var detailContainer = $('#relation-organize-detail');
                detailContainer.empty();
                detailContainer.append(" <div class='qq-group mt10' id='relation-organize-tree'></div>");
                $("#relation-organize-container  .new_container").show();
                $('#relation-organize-tree').fancytree({
                    selectmode: 1,
                    clickFolderMode: 1,
                    checkbox: false,
                    autoScroll: true,
                    source: datagroup,
                    iconClass: function(event, data) {
                        return "fa fa-child text-info";
                    },
                    renderNode: function(event, data) {

                    },
                    renderTitle: function(event, data) {

                    }
                });
            }
        });
    }
    render() {
        var data =[];
        const organizeData = store.getState().organizeData;
        var init_detailData=[];
        if(!_.isEmpty(organizeData)&&organizeData) {
            init_detailData=organizeData[0].properties;
            var load=true;
            if(!this.state.flag){
                this.detailShow(organizeData[0].orgId,organizeData[0].type,load);
            }
            _.map(organizeData, (list,key) => {
                const dataItem={
                    key:list.orgId,
                    type:list.type
                };
                const value = list.properties;
                _.map(value, (item) => {
                    const result = item.valueList[0];
                    switch (item.name){
                        case "ENEMY_ORGANIZE_NAME":
                            dataItem.organizeName=result;
                            break;
                        case "COUNTYR":
                            dataItem.country=result;
                            break;
                        case "CITY":
                            dataItem.city=result;
                            break;
                        case "PEROPLE_NUMBER":
                            dataItem.memberNum=result;
                            break;
                        default :
                            return ;
                    }
                });
                data.push(dataItem);
            })
            $(".organizeData").show();
            $(".organizeNodata").hide();
            if(this.state.organizeDetaildata){
                init_detailData=this.state.organizeDetaildata;
            }
        }
        return (
            <div   className="tab-pane  active in relation-qq" id="relation-organize-container" >
                <div className="col-md-12 organizeNodata"  style={{height:560 , overflowY:'hidden' , overflowX:'hidden'}}>
                    <label className="col-md-12 mbn" style={{width:'30%' , fontSize:12 , textAlign: 'left' , fontWeight: 'bold' , marginTop:10}}>暂无同组织数据</label>
                    <hr className="mt10 col-md-12" style={{color:'#C71313' , size:10}} />
                </div>
                <div style={{height: 560,display:"none"}} className="organizeData" >
                    <div className="col-xs-6">
                        <Table bordered style={{padding:"1%"}} columns={this.state.columns} dataSource={data} pagination={{ pageSize: 13 }} />
                    </div>
                    <div className="col-xs-6 new_container"   id={"organize_detail"} style={{paddingLeft:'20px',borderLeft:'1px solid #DDD',height:'100%'}} >
                        <div className="p5 qqgroup">
                            <h4> </h4>
                            <br/>
                            <div>
                                <label className="field-label">同组织详细信息</label>
                                <p className="default-text">
                                    {

                                            _.map(init_detailData, (item)=> {
                                                return(
                                                    <div>
                                                        <span>{item.caption}:</span><span className="text-info ml10">{item.valueList[0]}</span>
                                                        <br/>
                                                    </div>
                                                )
                                            })

                                    }
                                </p>
                            </div>
                        </div>
                        <div className="p5 qqgroupnodata" >
                            <label class="field-label">组织成员</label>
                            <div id="relation-organize-detail">

                                </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

module.exports = RelationOrganize;

