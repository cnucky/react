import React from 'react';
var _ = require('underscore');
import getKeyValueMap from './getKeyValueMap';

function getProfileValueByKey(keyValueMap,key) {
        return _.find(keyValueMap, function(item) {
            return item.name == key;
        });
    }

var actionTypes = {
        1: {
            name: '火车',
            class: 'fa fa-train',
            color: '#EC952E'
        },
        2: {
            name: '飞机',
            class: 'fa fa-plane',
            color: '#4BC87F'
        }
    }

export default class BehaviorTrackTab extends React.Component {
    constructor(props) {
        super(props);
        this.state= {
            actionInfos:{}
        };
    }

    componentWillMount(){
        let actionType,actionValue;

        let key = ['SFZ','PASSPORT'];
        getKeyValueMap.getKeyValueMap(key,this.props.personDetail.keyValueMap).then(function(newMap){

            let cert = getProfileValueByKey(newMap,"SFZ");
            cert = cert ? cert.values : cert;
            let passport = getProfileValueByKey(newMap,"PASSPORT");
            if (!_.isEmpty(cert)) {
                actionType = 1;
                actionValue = cert[0];
            } else {
                actionType = 1;
                actionValue = "";
            }

            console.log(newMap);
            $.getJSON("/renlifang/personcore/actioninfo",{
                type: actionType,
                value: actionValue,
                passport:passport.value
            },function(rsp){
                this.setState({
                    actionInfos:rsp.data
                })
            }.bind(this))
        }.bind(this))
    }

    render() {

        let info = this.state.actionInfos;
        let height = this.props.height-45;
        if(_.isEmpty(info)){
            return null;
        }
        // let info;
        // if(behaviorProps.length > 0){
        //     behaviorProps[0].children.length > 0 ? info=behaviorProps[0].children[0]:null;
        // }
        return <div id="actioninfo" className="tiny-scroller tab-pane fade active in ml40 mt30 mb15" style={{height:height,  overflow:'auto'}}>
            <div id="timeline" className="timeline-single">
                <div className="timeline-divider mtn row">
                    <div className={"col-md-3 divider-label" + ( info.topCityList.length > 0 ? ' mt20' : " ") } id="actioninfo-start">
                        <span className="glyphicon glyphicon-map-marker"></span>
                    </div>

                    <div className="col-md-11">
                        <label id="times-statistic" className="mn" style={{display: info.topCityList.length  > 0 ? 'block' : 'none'}}>最后一次出行记录的一年内到达城市次数统计</label>
                        <div id="actioninfo-tag" style={{paddingTop:2}}>
                            {
                                _.map(info.topCityList, (list, key)=> {
                                    return (
                                        <span className={"tm-tag" + (list.freq < 5 ? ' tm-tag-primary' : ' tm-tag-danger')}>
                                                {list.cityName + "(" + list.freq + ")"}
                                            </span>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-6 left-column" id="actioninfo-timeline-items">
                        {
                                    info.group ? (
                                        <div>
                                            {
                                                _.map(info.actions, (action, key)=> {
                                                    return (
                                                        <div key={key} className="timeline-item">
                                                            <div className="timeline-date">
                                                                <span> {action.date} </span>
                                                            </div>
                                                            <div className="panel">
                                                                <div className="panel-body" style={{padding:"15px"}}>
                                                                    <table
                                                                        className="table table-hover">
                                                                        <tbody>
                                                                        {
                                                                            _.map(action.action, (item, key)=> {
                                                                                return (
                                                                                    <tr>
                                                                                        <td>{item.action}</td>
                                                                                    </tr>
                                                                                )
                                                                            })
                                                                        }
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                })
                                            }
                                        </div>
                                    ) : (
                                        <div>
                                            {
                                                _.map(info.actions, (action, key)=> {
                                                    action.viewProps = actionTypes[action.type] || {
                                                            name: '--',
                                                            class: 'fa fa-user',
                                                            color: 'gray'
                                                        }
                                                    return (
                                                        <div className="timeline-item">
                                                            <div className="timeline-icon" style={{backgroundColor:(action.viewProps.color), color: "white"}}>
                                                                <span className={action.viewProps.class }></span>
                                                            </div>
                                                            <div className="panel">
                                                                <div className="panel-heading">
                                                                            <span className="panel-title">
                                                                                <span className=""></span> {action.address} </span>
                                                                    <div className="panel-header-menu pull-right mr10 text-muted fs12">{action.time}</div>
                                                                </div>
                                                                <div className="panel-body">
                                                                    {action.action}
                                                                </div>
                                                            </div>
                                                        </div>

                                                    )
                                                })
                                            }
                                        </div>
                                    )
                        }
                    </div>
                </div>
            </div>
        </div>
    }
}


module.exports = BehaviorTrackTab;