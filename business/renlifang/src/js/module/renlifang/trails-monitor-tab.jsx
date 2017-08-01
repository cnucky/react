import React from 'react';
require('../../module/renlifang/styles.less');
const Notify = require('nova-notify');
import Util from 'nova-utils';

export default class TrailsMonitorTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            url:'',
            serviceCode:-2   //-2为起始值,-1服务出错,0没有权限或者不在监控,1正常
        };
    }

    componentWillMount(){
        // showLoader();
    	let entityId, entityType;
        entityId = BASE64.decoder(Util.getURLParameter('entityid') || '');
        entityType = BASE64.decoder(Util.getURLParameter('entitytype') || '');

        $.getJSON('/renlifang/personcore/getSpyObjUrlByNumber', {
            entityid: entityId,
            entitytype: entityType
        }, function(rsp) {
            // hideLoader();
        	if (rsp.code != 0) {
                Notify.show({
                    title: "获取侦控对象信息失败",
                    type: "error"
                });
                console.log(rsp.message);
                this.setState({
                    // serviceCode:1,
                    // url:'/caseprocess/recentdata-iframe.html?objectid=MTAzMTI5'
                	serviceCode:-1
                })
            }
            if(!_.isEmpty(rsp.data) &&rsp.data.objectId.length >0){
            	this.setState({
            		serviceCode:1,
                    // url:'/caseprocess/recentdata-iframe.html?objectid=MTAzMTI5'
            		url:'/caseprocess/recentdata-iframe.html?objectid='+ BASE64.encoder(rsp.data.objectId)
            	})
            }else{
            	this.setState({
                    // serviceCode:1,
                    // url:'/caseprocess/recentdata-iframe.html?objectid=MTAzMTI5'
                	serviceCode:0
                })
            }

        }.bind(this))
    }

    render() {
    	var url = this.state.url;

    	var state = this.state;
    	if(state.serviceCode == -2 ||state.serviceCode == -1){
    		return null;
    	}

        return <div className="trailsMonitor" style={{}}>
            {state.serviceCode<1 ? <div height={this.props.height-20} width="100%" className="ml30 mt20 mr10"><span className="col-md-12 fs18 p10" 
            style={{fontWeight:"600",borderBottom: "1px solid #eeeeee"}}>没有查询权限或者此人不在侦控中</span></div> : <iframe height={this.props.height-20} width="100%" src={url}></iframe>}
        </div>
    }
}