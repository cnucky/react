import React from 'react';
require('../../module/renlifang/styles.less');

// var behaviors = require('./rlf-behaviors');
var MultiSelect = require('widget/multiselect');
var DateTimeRangePicker = require('widget/dateTimeWidget/datetimeRangePicker');
var ReactGisModule = require('../../widget/react-gisModule');
var moment = require('moment');
var behaviors = require('./rlf-behaviors');

let _globalDataTypeId = {
    train:[],
    fly:[],
    phone:[]
}

let _globalPersonDetail,_globalHeight;

let _globalTraType = {
    phone:[{
        name:"手机",
        value:1
    }],
    flight:[{
        name:"火车",
        value:2
    },{
        name:"飞机",
        value:3
    }]
}

let _globalKeyInfo={
    certNu:[],
    phoneNu:[]
};

let submitConds = {
    timeType:"time",     //time为日期,datatime为时间
    value:[],
    selectedValue:[],
    trackData:{}
};

let traType;
let nu;
let toggleFlag = true;
// let trackDataInfo = {} || gisTrackTestData;

function getProfileValueByKey(keyValueMap,key) {
        return _.find(keyValueMap, function(item) {
            return item.name == key;
        });
    }


export default class ActivitiesTrackTab extends React.Component {
    constructor(props) {
        super(props);

        _globalPersonDetail = this.props.personDetail;
        _globalHeight = this.props.height;

        // var activitiesDirBoxsHeight = ($(window).height() -60 -52-65-10-10-20-45) + "px";
        // $('#activities #pathBox #pathDisplayBox #dirBox').css("max-height",activitiesDirBoxsHeight);
        // this.setState({flag:toggleFlag});
        var mySFZ = getProfileValueByKey(_globalPersonDetail.keyValueMap,"SFZ");
        var myPASSPORT = getProfileValueByKey(_globalPersonDetail.keyValueMap,"PASSPORT");
        var myPHONE = getProfileValueByKey(_globalPersonDetail.keyValueMap,"PHONE");
        _globalKeyInfo.certNu.push({
            name:"身份证",
            value:mySFZ ? mySFZ.values : mySFZ
        })
        _globalKeyInfo.certNu.push({
            name:"护照",
            value:myPASSPORT ? myPASSPORT.values : myPASSPORT
        })
        _globalKeyInfo.phoneNu.push({
            name:"手机号",
            value:myPHONE ? myPHONE.values : myPHONE
        })

        nu = _globalKeyInfo.certNu;
        traType = _globalTraType.flight;
        submitConds.value=[];
        submitConds.value.push(moment().subtract(1, 'year').format("YYYY-MM-DD"));
        submitConds.value.push(moment().format("YYYY-MM-DD"));
        submitConds.selectedValue.push(nu[0].value[0]);
        // submitConds.trackData = trackDataInfo;
        this.state = {
            conds:submitConds
        };

        this.toggleBox = this.toggleBox.bind(this);
        this.getCertNo = this.getCertNo.bind(this);
        this.submitTaskConds = this.submitTaskConds.bind(this);
        this.getDateRangeValue = this.getDateRangeValue.bind(this);
    }

    toggleBox(e){
        if(this.state.conds.timeType == "time"){
            traType = _globalTraType.phone;
            nu = _globalKeyInfo.phoneNu;

            submitConds.timeType = "datatime";
            submitConds.value=[];
            submitConds.value.push(moment().subtract(7, 'days').format("YYYY-MM-DD HH:mm:ss"));
            submitConds.value.push(moment().format("YYYY-MM-DD HH:mm:ss"));
            submitConds.selectedValue = [];
            submitConds.selectedValue.push(nu[0].value[0]);
            this.setState({conds:submitConds});
        }else{
            traType = _globalTraType.flight;
            nu = _globalKeyInfo.certNu;

            submitConds.timeType = "time";
            submitConds.value=[];
            submitConds.value.push(moment().subtract(1, 'year').format("YYYY-MM-DD"));
            submitConds.value.push(moment().format("YYYY-MM-DD"));
            submitConds.selectedValue = [];
            submitConds.selectedValue.push(nu[0].value[0]);
            this.setState({conds:submitConds});
        }
    }

    getTraType(item, option, checked, select){
        if(checked){

        }else{

        }

    }

    getCertNo(item, option, checked, select){
        submitConds.selectedValue = [];
        submitConds.selectedValue.push(option.val());
        this.setState({conds:submitConds});
    }

    submitTaskConds(e){
        $.getJSON("/renlifang/personcore/trackDataJson",{},function(rsp){
            if(this.state.conds.timeType == "time"){
                submitConds.trackData = rsp.data.ligang;
            }else{
                submitConds.trackData = rsp.data.dianwei;
            }
            this.setState({conds:submitConds});
        }.bind(this))
    }

    getDateRangeValue(start,end){
        submitConds.value[0] =start;
        submitConds.value[1] = end;
        // this.setState({conds:submitConds});
    }

    render() {
        var conds = this.state.conds;
        var height = this.props.height;
        var width = this.props.width;
        return <div id="activities" style={{height:height}} style={{marginTop:"-20px"}}>
        	<div className="col-md-12" id="activities-conds">
        		<div className="col-md-3 pn ml10" style={{width:"20%",minWidth:"150px",maxWidth:"160px"}}>
		        	<div className="col-md-12 pn">
		        		<div className="col-md-12 admin-form pn">
                            <div className="col-md-2"></div>
                            <div className="col-md-10 pln prn mt15"><label className="block switch switch-primary" >
                                    <input type="checkbox" id="timeness" value="admin" checked={conds.timeType == "time" ? "true":null} onChange={this.toggleBox}></input>
                                    <label htmlFor="timeness" data-on="日期" data-off="时间" style={{width:"118px",height:"40px"}}></label>
                                </label> </div>
		                </div>
		        	</div>
        		</div>
        		<div className="col-md-9 pln">
        			<div className="col-md-12 mt15 pln">
        				
                        <div className="col-md-2 pn" >
                                <MultiSelect onChange={this.getCertNo}
                                updateData={true}
                                config={{
                                    maxHeight: 250,
                                    buttonWidth: '99%',
                                    enableFiltering: true,
                                    buttonClass: 'multiselect dropdown-toggle btn btn-primary fw600 fs14 mnw60 text-ellipsis',
                                }}
                                data={
                                        _.map(nu,function(item,indexNum)
                                        {
                                            return {
                                                label: item.value,
                                                title: item.name,
                                                value: item.value,
                                                selected: _.contains(conds.selectedValue,item.value)
                                            }
                                        })
                                }/>
                        </div>
                        <div className="col-md-6 pn" style={{minWidth:"380px",maxWidth:"420px"}}>
                            <DateTimeRangePicker callback={this.getDateRangeValue} module="renlifang" type="calenderRange" containerId="acti-track"
                            value={conds.value} formatString = {conds.timeType == "time" ? "yyyy-MM-dd" :"yyyy-MM-dd HH:mm:ss"}/>
                        </div>
                        <button type="button" className="btn btn-primary col-md-2" style={{width:"9%"}} onClick = {this.submitTaskConds}>
                        	<i className="fa fa-search"></i>
                    	</button>
        			</div>
        		</div>
        	</div>
        	<div className="col-md-12 mt10" id="activities-result" >
                <ReactGisModule data={conds.trackData} height={height} width={width}/>
        	</div>
        </div>
    }
}

module.exports = ActivitiesTrackTab;
