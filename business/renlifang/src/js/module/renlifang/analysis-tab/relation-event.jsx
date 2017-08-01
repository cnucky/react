import React from 'react';

import { Table ,Affix, Button } from 'antd';
import {store} from '../store';
import Experience from '../tpl-experience';
import Util from 'nova-utils';


require('../../../module/renlifang/styles.less');
//let eventData = require('./getrelation-event.json').data;

export default class RelationEvent extends React.Component {
    constructor(props) {
        super(props);
        this.state= {

        }
    }

    componentDidMount() {
        let entityId, entityType;
        entityId = BASE64.decoder(Util.getURLParameter('entityid') || '');
        entityType = BASE64.decoder(Util.getURLParameter('entitytype') || '');
        $.getJSON("/renlifang/holographic/getEvent", {
            entityid: '320106198907159999',
            entitytype:'1'
        }, function(rsp) {
            if (rsp.code == 0) {
                store.dispatch({
                    type: 'GET_EVENTDATA',
                    eventData:rsp.data.result
                });
            }
        });

    }
    componentWillUpdate(){

    }

    detailShow(key,type,load){
        //if(!load){
        //    showLoader();
        //};
        //this.setState({
        //    flag:true
        //});
        $.getJSON("/renlifang/holographic/geteventMember", {
            eventId: key,
            type: type
        }, function(rsp) {
            if (rsp.code == 0) {
                //hideLoader();
                var data_temp=rsp.data.result;
                var eventMember =[];
                _.map(data_temp, (list,key) => {
                    var memberItem ={
                        key:key,
                        title:""
                    }
                    var name="";
                    _.map(list.properties, (item) => {
                        if(item.name=="NAME"){
                            name=item.valueList[0];
                        }
                    })
                    memberItem.title=name;
                    eventMember.push(memberItem);
                })
                var datagroup =[{
                    title: "同事件成员 (" + eventMember.length + ")",
                    children: eventMember
                }];
                var detailContainer = $('#relation-event-detail');
                detailContainer.empty();
                detailContainer.append(" <div class='qq-group mt10' id='relation-event-tree'></div>");
                $("#relation-event-container  .new_container").show();
                $('#relation-event-tree').fancytree({
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
        var eventData = store.getState().eventData;
        var info={};
        var infoGroup ={};
        var evetndetailData=[];
        if(eventData&&!_.isEmpty(eventData)){
             info = eventData[0];
             info.flag=true;
             infoGroup ={
                groupName:"同事件",
                children:eventData
            }
            $(".eventData").show();
            $(".eventNodata").hide();

            var eventId = store.getState().eventID;
            var load=true;
            if(eventId==" "){
                this.detailShow(info.eventId,info.type,load);
            }else{
                _.map(eventData, (list,key) => {
                    if(list.eventId==eventId){
                        evetndetailData=list.properties;
                        this.detailShow(list.eventId,list.type);
                    }
                })
            }

        }

        return (
            <div   className="tab-pane  active in relation-qq" id="relation-event-container" >
                <div className="col-md-12 eventNodata"  style={{height:560 ,overflowY:'hidden' , overflowX:'hidden'}}>
                    <label className="col-md-12 mbn" style={{width:'30%' , fontSize:12 , textAlign: 'left' , fontWeight: 'bold' , marginTop:10}}>暂无同事件数据</label>
                    <hr className="mt10 col-md-12" style={{color:'#C71313' , size:10}} />
                </div>
                <div style={{height: 560}} className="eventData" style={{display:"none"}}>
                    <div className="p10 col-xs-6">
                        {
                            info?<Experience infoGroup={infoGroup} info={info}/>:<div className="col-md-12 qqNodata"  style={{height:560 , display:'none' ,overflowY:'hidden' , overflowX:'hidden'}}>
                                <label className="col-md-12 mbn" style={{width:'30%' , fontSize:12 , textAlign: 'left' , fontWeight: 'bold' , marginTop:10}}>暂无同事件信息</label>
                                <hr className="mt10 col-md-12" style={{color:'#C71313' , size:10}} />
                            </div>
                        }
                    </div>
                    <div className="col-xs-6 new_container"   id={"event_detail"} style={{paddingLeft:'20px',borderLeft:'1px solid #DDD',height:'100%'}} >
                        <div className="p5 qqgroup">
                            <h4> </h4>
                            <br/>
                            <div>
                                <label className="field-label">事件详细信息</label>
                                <p className="default-text">
                                    {
                                        (_.isEmpty(evetndetailData))?(
                                            _.map(info.properties, (item)=> {
                                                return(
                                                    <div>
                                                        <span>{item.caption}:</span><span className="text-info ml10">{item.valueList[0]}</span>
                                                        <br/>
                                                    </div>
                                                )
                                            })
                                        ):(
                                            _.map(evetndetailData, (item)=> {
                                                return(
                                                    <div>
                                                        <span>{item.caption}:</span><span className="text-info ml10">{item.valueList[0]}</span>
                                                        <br/>
                                                    </div>
                                                )
                                            })
                                        )
                                    }
                                </p>
                            </div>
                        </div>
                        <div className="p5 qqgroupnodata" >
                            <label class="field-label">事件成员</label>
                            <div id="relation-event-detail">

                            </div>
                        </div>
                    </div>
                </div>
            </div>

        )
    }
}

module.exports = RelationEvent;

