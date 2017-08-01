import React from 'react';
require('../../module/renlifang/styles.less');
import {store} from '../../module/renlifang/store';

export default class Experience extends React.Component {
    constructor(props) {
        super(props);
    }
    showDetail(eventId,key){
        store.dispatch({
            type: 'GET_EVENTID',
            eventID:eventId
        });
        $(".timeline-item .timeline-date").removeClass("selected");
        $(".timeline-item "+"  ."+key).addClass("selected");
    }


    render() {

        let info = this.props.info;
        let infoGroup = this.props.infoGroup;





        return<div id="row-component" className="row " style={{margin:0}}>

                    <div className={"col-md-12"} style={{height:'100%',padding:0}}>
                        <div id="actioninfo" className="tab-pane fade active in ml20">
                            <div id="timeline" className="mt30 timeline-single">
                                <div className="timeline-divider mtn row">
                                    <div className="col-md-3 divider-label " id="actioninfo-start">
                                        <span> 全部 </span>
                                    </div>
                                    <div className="col-md-11">
                                        <div id="actioninfo-tag" style={{paddingTop:2}}>

                                            {
                                                _.map(infoGroup.children , (info , key)=>{
                                                    info.otherProperties?(
                                                        _.map(info.otherProperties, (list, key)=> {
                                                            return(
                                                                <span className="tm-tag tm-tag-primary " key={key}>
                                                            {list.caption}
                                                        </span>
                                                            )
                                                        })
                                                    ):(
                                                        _.map(info.properties, (list, key)=> {
                                                            return(
                                                                <span className="tm-tag tm-tag-primary " key={key}>
                                                            {list.caption}
                                                        </span>
                                                            )
                                                        })

                                                    )
                                                })



                                            }
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-6 left-column" id="actioninfo-timeline-items">
                                        {
                                            _.map(infoGroup.children , (child , key)=>{
                                                var occurTime= _.find(child.properties, p=>{
                                                    return p.name == 'OCCUR_TIME';
                                                });
                                                return(
                                                    <div  className="timeline-item">
                                                        {
                                                            child.flag?<div  className={key==0 ? "timeline-date cursor_pointer selected "+key:"timeline-date cursor_pointer "+key}  onClick={this.showDetail.bind(this,child.eventId,key)} >
                                                                <span > {occurTime.valueList[0]} </span>
                                                            </div>:<div className="timeline-icon bg-info" >
                                                                <span> {key + 1} </span>
                                                            </div>
                                                        }
                                                        <div className="panel">
                                                            <div className="panel-body" style={{paddingBottom:0}}>
                                                                <div style={{ padding:15}}>
                                                                    <table className="table table-bordered">
                                                                        <tbody  className="group-item">
                                                                        {
                                                                            child.otherProperties?(
                                                                                _.map(child.otherProperties , (other , key)=>{
                                                                                    return (
                                                                                        <tr key={key}>
                                                                                            <td className="col-md-2 col-sm-2 mn fs14 fw400 text-center" style={{backgroundColor: "#f5f5f5" }}>
                                                                                                {other.caption}
                                                                                            </td>
                                                                                            <td className="col-md-4 col-sm-10">
                                                                                                <div key={key} className="mr10 " style={{display:"inline-block" }}>
                                                                                                    {other.valueList}
                                                                                                </div>
                                                                                            </td>
                                                                                        </tr>
                                                                                    )
                                                                                })
                                                                            ):(
                                                                                _.map(child.properties , (other , key)=>{
                                                                                    return (
                                                                                        <tr key={key}>
                                                                                            <td className="col-md-2 col-sm-2 mn fs14 fw400 text-center" style={{backgroundColor: "#f5f5f5" }}>
                                                                                                {other.caption}
                                                                                            </td>
                                                                                            <td className="col-md-4 col-sm-10">
                                                                                                <div key={key} className="mr10 " style={{display:"inline-block" }}>
                                                                                                    {other.valueList}
                                                                                                </div>
                                                                                            </td>
                                                                                        </tr>
                                                                                    )
                                                                                })

                                                                            )


                                                                        }
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                </div>





    }
}


module.exports = Experience;