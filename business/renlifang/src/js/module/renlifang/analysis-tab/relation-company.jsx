import React from 'react';

import { DatePicker,Table ,Affix, Button } from 'antd';
import {store} from '../store';
import TimeLine from './component/timeline';

var moment = require('moment');
require('../../../module/renlifang/styles.less');
var DateTimeRangePicker = require('widget/dateTimeWidget/datetimeRangePicker');
var MultiSelect = require('widget/multiselect');

const defaultStartTime = moment().add(-7,'days').format('YYYY-MM')
const defaultEndTime = moment().format('YYYY-MM')
let submitConds = {
    timeType:"time",     //time为日期,datatime为时间
    value:[],
    selectedValue:[],
    trackData:{}
};
submitConds.value.push(moment().subtract(1, 'year').format("YYYY-MM-DD"));
submitConds.value.push(moment().format("YYYY-MM-DD"));

var Notify = require('nova-notify');
var companyType = 0;
var ticketPassport =[];
var cert;
export default class RelationCompany extends React.Component {
    constructor(props) {
        super(props);
        this.state= {
            companyStartDate:"2015-11-01",
            companyEndDate:"2015-12-01",
            companyFrequency:2,
        }
    }

    getDateRangeValue(start,end){
        submitConds.value[0] =start;
        submitConds.value[1] = end;
    }

    componentDidMount() {
        var myCert=[];
        var myPassport=[];
        if(this.props.myCert){
            myCert = this.props.myCert.values;
        }
        if(this.props.myPassport){
            myPassport = this.props.myPassport.values;
        }
        if(!this.props.myCert&&!this.props.myPassport){
            $(".companyData").hide();
            $(".companyNodata").show();
        }

        var certList = [{
            label: "为空",
            value: "",
            title: "为空"
        }]

        if (myCert.length >= 1 ) {
            _.each(myCert, function(item, index) {
                if (index == 0) {
                    cert = item;
                }
                certList.push({
                    label: item,
                    value: item,
                    title: item,
                    selected: index == 0
                })
            })
            if (myCert.length == 1) {
                cert = certList[1].value;
            }
            this.setState({cert:myCert,certList:certList});
        }

        var passportList = [];
        if (myPassport.length >=1 ) {
            _.each(myPassport, function(item, index) {
                passportList.push({
                    label: item,
                    value: item,
                    title: item,
                })
            })
            if (myPassport.length == 1) {
                ticketPassport.push(passportList[0].value);
            }
            this.setState({passport:myPassport,passportList:passportList});
        }

        $('#relation-frequency-input').val(2);
    }
    componentWillUpdate(){

    }
    loadCompanyList(){
        var companyFrequency = $('#relation-frequency-input').val();
        this.setState({
            companyFrequency: companyFrequency,
        });
        var companyStartDate =submitConds.value[0];
        var companyEndDate = submitConds.value[1];
        if(companyStartDate == "" ){
            Notify.show({
                title: "起始时间不能为空",
                type: "danger"
            });
        }
        else{
            if(companyEndDate == "" ){
                Notify.show({
                    title: "结束时间不能为空",
                    type: "danger"
                });
            }
            else{
                var startTime = new Date(companyStartDate);
                var endTime = new Date(companyEndDate);
                if(startTime >= endTime){
                    Notify.show({
                        title: "起始时间不能大于等于结束时间",
                        type: "danger"
                    });
                }
                else{
                    if(companyFrequency >= 2){
                        if (_.isEmpty(cert)) {
                            Notify.show({
                                title: "请选择身份证",
                                type: "warning"
                            });
                            return;
                        }

                        showLoader();

                         $.getJSON("/renlifang/personcore/getpartner", {
                                 passport: ticketPassport,
                                 cert: cert,
                                 start: companyStartDate,
                                 end: companyEndDate,
                                 frequency: companyFrequency,
                                 type: companyType
                             }, function(rsp) {
                                 hideLoader();
                                 var rsp_temp = rsp;
                                 if (rsp_temp.code == 0) {
                                     if(_.isEmpty(rsp_temp.data)){
                                         $("#relation-parter .timeline").hide();
                                         $("#relation-parter #relation-company-empty").show();
                                     }
                                     else{
                                         store.dispatch({
                                             type: 'GET_COMPANYDATA',
                                             companyData: rsp_temp.data
                                         })
                                         $("#relation-parter #relation-company-empty").hide();
                                         $("#relation-parter .timeline").show();
                                         var logo = $('#relation-parter #relation-company-logo');
                                         logo.removeClass();
                                         if (companyType == 2) {
                                             logo.text("");
                                             logo.addClass('fa fa-lg fa-plane');
                                         } else if (companyType == 1) {
                                             logo.text("");
                                             logo.addClass('fa fa-lg fa-train');
                                         } else {
                                             logo.removeClass('fa fa-lg fa-train fa-plane');
                                             logo.text('全部');
                                         }
                                     }
                                 }
                                 else{
                                     Notify.show({
                                         title: "请求失败",
                                         text: rsp.message,
                                         type: "danger"
                                     });
                                 }
                         })
                    }else{
                        $('#relation-frequency-input').val(2)
                        Notify.show({
                            title: "次数至少为兩次",
                            type: "warning"
                        });
                    }
                }
            }
        }
    }

    handleselectType(option, checked, select){
        companyType = checked[0].value;
    }

    handleselectCert (option, checked, select){
        cert = checked[0].value;
    }

    handleselectPassport(option, checked, select){
        if (checked) {
                        ticketPassport.push(checked[0].value);
                    } else {
                        _.map(ticketPassport, function(passportItem, indexNum) {
                            if (passportItem == checked[0].value) {
                                ticketPassport.splice(indexNum, 1);
                            }
                        })
                    }
    }

    render() {
        var companyData = store.getState().companyData;
        var companytypeSource=["全部","火车","飞机"];
        var certList = this.state.certList;
        var myCert = this.state.cert;
        var myPassport = this.state.passport;
        var passportList = this.state.passportList;

        return (
            <div>
                <div className="col-md-12 companyNodata"  style={{height:560 , display:'none' ,overflowY:'hidden' , overflowX:'hidden'}}>
                    <label className="col-md-12 mbn" style={{width:'30%' , fontSize:12 , textAlign: 'left' , fontWeight: 'bold' , marginTop:10}}>暂无同行人数据</label>
                    <hr className="mt10 col-md-12" style={{color:'#C71313' , size:10}} />
                </div>
           <div id={"relation-parter"} className="tab-pane fade active in relation-company" style={{minHeight:"560px"}} >
            <div className="companyData" >
                <div className="text-center">
                        <div style={{width: 75, display: 'inline-block'}}>
                            <MultiSelect
                                config={{
                                  buttonClass: 'multiselect dropdown-toggle btn btn-default fw600 fs14',
                                  buttonWidth: '100%',
                                }}
                                onChange={this.handleselectType}
                                data={
                                    _.map(companytypeSource, function(selectedItem,index) {
                                        return {
                                            label: selectedItem,
                                            title: selectedItem,
                                            value: index,
                                            type: 'string'
                                        }
                                    })
                            }/>
                        </div>
                        
                        {myCert&&certList? <div id={"relation-parter-cert"} className="mw280" data-toggle="tooltip" data-placement="bottom"  style={{paddingLeft:"10px",paddingRight:"10px", display: "inline-block"}}>
                            <MultiSelect id="relation-parter-cert-multiselect"
                                config={{
                                 buttonClass: 'multiselect dropdown-toggle btn btn-primary fw600 fs14',
                                 buttonWidth: '100%',
                                }}
                                onChange={this.handleselectCert}
                                data={
                                    _.map(certList, function(selectedItem,index) {
                                        return {
                                            label: selectedItem.label,
                                            title: selectedItem.title,
                                            value: selectedItem.value,
                                            selected: index == 1
                                        }
                                    })
                            }/>
                        </div> : ''}
                        
                        {myPassport&&passportList?<div id={"relation-parter-passport"}   data-toggle="tooltip" data-placement="bottom"  style={{paddingRight:"10px",display: 'inline-block'}}>
                             <MultiSelect id="relation-parter-passport-multiselect" multiple="multiple"
                                config={{
                                    buttonClass: 'multiselect dropdown-toggle btn btn-primary fw600 fs14',
                                    buttonWidth: '100%',
                                    nonSelectedText: '请选择',
                                    nSelectedText: 'selected',
                                    allSelectedText: '全选',
                                    numberDisplayed: 1,
                                }}
                                onChange={this.handleselectPassport}
                                data={
                                    _.map(passportList, function(selectedItem,index) {
                                        return {
                                            label: selectedItem.label,
                                            title: selectedItem.title,
                                            value: selectedItem.value,
                                            selected: index == 1
                                        }
                                    })
                            }/>
                        </div>:''
                        }

                        <div id={"relation-parter-rangetime"} className="mw320" style={{display: 'inline-block', height: 24}}>

                            <DateTimeRangePicker callback={this.getDateRangeValue} module="renlifang" type="calenderRange" value={submitConds.value} formatString = {submitConds.timeType == "time" ? "yyyy-MM-dd" :"yyyy-MM"}/>

                        </div>
                        <div id={"relation-parter-frequency"} className="mw140 ml10" style={{display: 'inline-block', height: 24}}>
                            <div className="input-group pull-right" id={"relation-frequency"}>
                                <input type="number" className="form-control"  id={"relation-frequency-input"} ></input>
                            <span className="input-group-addon cursor">
                          次
                        </span>
                            </div>
                        </div>
                        <button type="button" id={"relation-btn-go"} className="ml10 btn btn-primary" onClick={this.loadCompanyList.bind(this)}>
                            <i className="fa fa-arrow-right"></i>
                        </button>
                </div>
            </div>
            <hr className="alt short mh10"></hr>
            <div id={"relation-company-empty"} style={{display:"none"}}>
                <p className="text-muted text-center ph20">没有符合条件的同行记录</p>
            </div>
            <TimeLine  company={this.state} data={companyData}></TimeLine>
        </div>
</div>
        )
    }
}

module.exports = RelationCompany;

