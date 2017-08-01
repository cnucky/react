import React from 'react';
require('../../module/renlifang/styles.less');
var moment = require('moment');
var DateTimeRangePicker = require('widget/dateTimeWidget/datetimeRangePicker');
var condHelper = require('../datasearch/condHelper')
var submitService = require('../datasearch/searchService')
import Util from 'nova-utils';

// let initialized = false;
const defaultStartTime = moment().add(-365,'days').format('YYYY-MM-DD HH:mm:ss')
const defaultEndTime = moment().format('YYYY-MM-DD HH:mm:ss')
const defaultTimeRange = [defaultStartTime,defaultEndTime]
let timeValue = defaultTimeRange;

let submitConds = {
    startTime:defaultStartTime,
    endTime:defaultEndTime
};

let searchContent = BASE64.decoder(Util.getURLParameter('entityid') || '');

let curTaskId = '';



export default class BehaviorDataTab extends React.Component {
    constructor(props) {
        super(props);
        
        this.btnClick = this.btnClick.bind(this)
        this.getSearchKeyWord = this.getSearchKeyWord.bind(this)

        this.state = {
            iframeUrl:'',
        };

        let self = this;
        condHelper.getConds('#keyword',submitConds.startTime,submitConds.endTime).done(function(submit_params) {
            submitService.onekey_submit_task(submit_params, function(task_id){
                curTaskId = task_id;
                var url = '/dataprocess/data-list.html?taskId=' + BASE64.encoder(task_id + "") + '&taskName=' + BASE64.encoder(submit_params.task_name) + '&taskSource=' + BASE64.encoder('renlifang')+'&width='+BASE64.encoder(''+self.props.width)+'&height='+BASE64.encoder(''+(self.props.height-62));
                self.setState({
                    iframeUrl:url
                })
            });
        });
    }

    btnClick(e){
        let self = this;
    	e.preventDefault()
        condHelper.getConds('#keyword',submitConds.startTime,submitConds.endTime).done(function(submit_params) {
            submitService.onekey_submit_task(submit_params, function(task_id){
                curTaskId = task_id;
                var url = '/dataprocess/data-list.html?taskId=' + BASE64.encoder(task_id + "") + '&taskName=' + BASE64.encoder(submit_params.task_name) + '&taskSource=' + BASE64.encoder('renlifang')+'&width='+BASE64.encoder(''+self.props.width)+'&height='+BASE64.encoder(''+(self.props.height-62));
                self.setState({
                    iframeUrl:url
                })

            });
        });
    }
    getSearchKeyWord(e){

    }

    getDateRangeValue(start,end){
        submitConds.startTime = start;
        submitConds.endTime = end;
        timeValue = [start,end]
    }
    // componentDidMount(){

    // }

    componentWillReceiveProps(nextProps){
        let self = this;
        condHelper.getConds('#keyword',submitConds.startTime,submitConds.endTime).done(function(submit_params) {
            //此处不调提交接口
            var url = '/dataprocess/data-list.html?taskId=' + BASE64.encoder(curTaskId + "") + '&taskName=' + BASE64.encoder(submit_params.task_name) + '&taskSource=' + BASE64.encoder('renlifang')+'&width='+BASE64.encoder(''+nextProps.width)+'&height='+BASE64.encoder(''+(nextProps.height-62));
            self.setState({
                iframeUrl:url
            })
                
            
        });
    }

    render() {
    	// let personDetail = this.props.personDetail;
        // let searchContent = this.getSearchContent(personDetail.keyValueMap);

        console.log('width height', this.props.width, this.props.height);


    	return <div className="behavior-tab-detail" id="behavior">
        <div className="admin-form" >

			        <form className="" id="search-form" style={{padding:"10px 0 10px 10px",background:"aliceblue"}}>

			        	<div className="row">
			        	<div className="col-md-4">
			            <div className="smart-widget sm-right smr-80 ">
			                <label className="field prepend-icon">
			                    <input type="text" name="keyword" id="keyword" defaultValue={searchContent} 
			                    className="gui-input" autocomplete="OFF" placeholder="关键词"
			                     onChange={this.getSearchKeyWord} ></input>
			                    <label for="keyword" className="field-icon">
			                        <i id="search-icon" className="fa fa-search" style={{color: "#4ea5e0"}}></i>
			                    </label>
			                </label>
			                <button id="search-button" type="submit" className="button btn-primary" onClick={this.btnClick}>搜索</button>
			            </div>
			            </div>
			            <div className="col-md-6">
			            	<DateTimeRangePicker callback={this.getDateRangeValue} module="renlifang" type="calenderRange" containerId="beha-data" formatString = {"yyyy-MM-dd HH:mm:ss"} value = {timeValue}/>
			            </div>
			            		</div>

			        </form>

		    
    	</div>
    	<div className="" id="behavior-data-div">
    		<WrappedIframe  height={this.props.height - 62} width={this.props.width}  iframeUrl ={this.state.iframeUrl}  />
		</div>
    	</div>
    }

    getSearchContent(keyValueMap){
        // let SFZ = _.find(keyValueMap,function(pd){
        //     return pd.name == 'SFZ';
        // })
        // let USER_MSISDN = _.find(keyValueMap,function(pd){
        //     return pd.name == 'USER_MSISDN';
        // })
        // let PASSPORT = _.find(keyValueMap,function(pd){
        //     return pd.name == 'PASSPORT';
        // })

        // if(SFZ && SFZ.values.length>0 && SFZ.values[0]!=''){
        //     return SFZ.values[0];
        // }else if(USER_MSISDN && USER_MSISDN.values.length>0 && USER_MSISDN.values[0]!=''){
        //     return USER_MSISDN.values[0];
        // }else if(PASSPORT && PASSPORT.values.length>0 && PASSPORT.values[0]!=''){
        //     return PASSPORT.values[0];
        // }else{
        //     for(var i=0;i<keyValueMap.length;i++){
        //         if(keyValueMap[i].values.length>0 && keyValueMap[i].values[0]!= ''){
        //             return keyValueMap[i].values[0];
        //         }
        //     }
        //     return '';
        // }
    }
}
var WrappedIframe = React.createClass({

    render(){
    	// const width = $(window).width()-$('#behavior').offset().left-10;//10 is right padding of react root
    	return (<iframe ref={(f) =>  this.ifr = f } height={this.props.height} width={this.props.width}  src={this.props.iframeUrl} style={{'border-bottom':'none','border-right':'none'}}></iframe>)
    },
    // componentDidMount(){
    // 	this.ifr.onload = () => {
    // 		console.log('iframe ready')
    // 	}
    // },

});