import React from 'react';
import {DatePicker, Affix, Button } from 'antd';
import {store} from '../store';

var moment = require('moment');
require('../../../module/renlifang/styles.less');
var DateTimeRangePicker = require('widget/dateTimeWidget/datetimeRangePicker');
var MultiSelect = require('widget/multiselect');

require('jquery');
require('jquery.datatables');
require('datatables.bootstrap');
require('bootstrap-multiselect');


//value.push(defaultStartTime);
//value.push(defaultEndTime);
let submitConds = {
    timeType:" ",     //time为日期,datatime为时间
    value:[ ],
    selectedValue:[],
    trackData:{}
};
submitConds.value.push(moment().subtract(1, 'year').format("YYYY-MM"));
submitConds.value.push(moment().format("YYYY-MM"));
var Notify = require('nova-notify');

const MonthPicker = DatePicker.MonthPicker;


export default class PhoneLink extends React.Component {
    constructor(props) {
        super(props);
        this.state= {
            phoneInfoTableData:[],
            companyStartDate:"2017-3",
            companyEndDate:"2017-4",
            //phoneNumber:[]
        }
        this.getDateRangeValue = this.getDateRangeValue.bind(this);
    }
    getDateRangeValue(start,end){
        submitConds.value[0] =start;
        submitConds.value[1] = end;
    }
    componentDidMount() {
        var phoneData = [];
        var phoneNumber = [];
        function initTable() {
            $('#loadPhoneInfoTable').dataTable({
                'destroy': true,
                'columnDefs': [{
                    'targets': 0,
                    'render': function(data, type, full, meta) {
                        return '<a class="rlf-auto-link" target="_blank" href=' + UrlUtil.getProfileUrl(data, 5) + '>' + data + '</a>';
                    }
                }],
                'data': [],
                "bAutoWidth": false,
                'searching': true,
                'aaSorting': [
                    [3, 'desc']
                ],
                "oLanguage": {
                    "sProcessing": "正在加载任务信息...",
                    "sLengthMenu": "每页显示_MENU_条记录",
                    "sInfo": "当前显示_START_到_END_条，共_TOTAL_条记录",
                    "sInfoEmpty": "",
                    "sZeroRecords": "对不起，查询不到相关电话通联信息",
                    "sInfoFiltered": "",
                    "sSearch": "搜索",
                    "oPaginate": {
                        "sPrevious": "前一页",
                        "sNext": "后一页"
                    }
                },
                "bPaginate": true,
                "iDisplayLength": 15,
                "aLengthMenu": [
                    [5, 10, 25, 50, -1],
                    [5, 10, 25, 50, "All"]
                ],
                "sDom": '<"clearfix"fr>t<"dt-panelfooter"ip>',
            });
        }

        var qqtomobilelist = this.props.qqtomobilelist;
        if(!_.isEmpty(qqtomobilelist.mobile)){
            _.each(qqtomobilelist.mobile, function(item, index) {
                phoneData.push({
                    label: item,
                    value: item,
                })
            })
            this.setState({
                phoneData: phoneData
            })
            
            
            if (this.state.phoneInfoTableData.length <= 0) {
                initTable();
            }

        }else{
            $(".phonelinkData").hide();
            $(".phonelinkNodata").show();

        }
        phoneNumber.push(phoneData[0].value);
        this.setState({
            phoneNumber:phoneNumber
        });

    }



    handleSelectField(option, checked, select) {
        let phoneNumber=this.state.phoneNumber;
        if (select) {
            phoneNumber.push(checked[0].value);
        } else {
            _.map(phoneNumber, function(itemNumber, indexNum) {
                if (itemNumber == checked[0].value) {
                    phoneNumber.splice(indexNum, 1);
                }
            })

        }

        //this.setState({
        //    phoneNumber: phoneNumber
        //})

    }

    phoneBtn(){
        let companyStartDate = submitConds.value[0];
        let companyEndDate = submitConds.value[1];
      let phoneNumber = this.state.phoneNumber;
      if(companyStartDate==undefined||companyStartDate=="")
      {
          Notify.show({title: "起始时间不能为空",type: "danger"});
      }
      else{
          if(companyEndDate==undefined||companyEndDate==""){
              Notify.show({title: "结束时间不能为空",type: "danger"});
          }else{
              if(new Date(companyStartDate) >= new Date(companyEndDate)){
                  Notify.show({title: "起始时间不能大于等于结束时间",type: "danger"});
              }else{
                  this.buttonClickEvent(companyStartDate, companyEndDate, phoneNumber);
              }
          }
      }
    }

    buttonClickEvent(companyStartDate, companyEndDate, phoneNumber){
        var startTime = companyStartDate;
        var endTime = companyEndDate;
        if (phoneNumber.length <= 0) {
            Notify.show({
                title: "电信号码不能为空！",
                type: "warning"
            });
        } else {
            showLoader();
            var phoneInfoTableData = this.state.phoneInfoTableData;
            $.getJSON("/renlifang/personcore/getphonerelation", {
                phoneNumber: phoneNumber,
                startTime: startTime,
                endTime: endTime
            }, function(rsp) {
                if (rsp.code == 0) {
                    hideLoader();
                    var callList = rsp.data.callList;
                    store.dispatch({
                        type: 'GET_SUMMARY',
                        summary: rsp.data.summary
                    });
                    phoneInfoTableData = [];
                    _.map(callList, function(callListItem, indexNum) {
                        var tableData = [];
                        tableData.push(callListItem.phoneNumber);
                        tableData.push(callListItem.personName);
                        tableData.push(callListItem.regionName);
                        tableData.push(callListItem.weight);
                        tableData.push(callListItem.type);
                        phoneInfoTableData.push(tableData);
                    })
                    store.dispatch({
                        type: 'GET_PHONEINFOTABLEDATA',
                        phoneInfoTableData: phoneInfoTableData
                    });
                    if (phoneInfoTableData.length > 0) {
                        $("#loadPhoneInfoTable").dataTable().fnClearTable();
                        $("#loadPhoneInfoTable").dataTable().fnAddData(phoneInfoTableData);
                    } else {
                        $("#loadPhoneInfoTable").dataTable().fnClearTable();
                    }
                }else{
                    Notify.show({
                        title: "获取手机号码关系失败!",
                        type: "warning"
                    });
                }
            });

        }
    }
    compare(count){
        return function(a,b){
            var value1=a[count];
            var value2=b[count];
            return value2 - value1;

        }

    }

    regionnameTab(e){
        $("li>a").toggleClass("active");
        var titleName = $(e.currentTarget).attr('title');
        var tableDataChanges = [];
        var phoneInfoTableData = store.getState().phoneInfoTableData;
        if (titleName == "全部") {
            if (phoneInfoTableData.length > 0) {
                $("#loadPhoneInfoTable").dataTable().fnClearTable();
                $("#loadPhoneInfoTable").dataTable().fnAddData(phoneInfoTableData);
            }
        } else {
            if (phoneInfoTableData.length > 0) {
                _.map(phoneInfoTableData, function(phoneDataItem, index) {
                    if (_.contains(phoneDataItem, titleName)) {
                        tableDataChanges.push(phoneDataItem);
                    }
                })
                $("#loadPhoneInfoTable").dataTable().fnClearTable();
                $("#loadPhoneInfoTable").dataTable().fnAddData(tableDataChanges);
            } else {
                $("#loadPhoneInfoTable").dataTable().fnClearTable();
            }
        }
    }


    render() {
        var summary =store.getState().summary;
        summary.sort(this.compare('count'))

        return (
            <div>
                <div className="col-md-12 phonelinkNodata"  style={{height:560 , display:'none' ,overflowY:'hidden' , overflowX:'hidden'}}>
                    <label className="col-md-12 mbn" style={{width:'30%' , fontSize:12 , textAlign: 'left' , fontWeight: 'bold' , marginTop:10}}>暂无手机号码信息</label>
                    <hr className="mt10 col-md-12" style={{color:'#C71313' , size:10}} />
                </div>
           <div className="tab-pane  phone-link phonelinkData">
                <div style={{height: 560}}>
                    <div className=" text-center">

                        <div className="mw140" style={{display: 'inline-block'}}>
                            
                            <MultiSelect id={"phone-multiselect"}
                                config={{
                                    buttonClass: 'multiselect dropdown-toggle btn btn-primary fw600 fs14',
                                    buttonWidth: '100%',
                                    nonSelectedText: '请选择',
                                    nSelectedText: '已选择',
                                    allSelectedText: '全选',
                                    numberDisplayed: 1,
                                }}
                                multiple="multiple"
                                updateData={true}
                                onChange={this.handleSelectField.bind(this)}
                                data={
                                    _.map(this.state.phoneData, function(selectedItem,index) {
                                        return {
                                            label: selectedItem.label,
                                            value: selectedItem.value,
                                            selected: index == 0
                                        }
                                    })
                            }/>
                        </div>
                        <div className="mw280 ml10" style={{display: 'inline-block', height: 23}}>
                            <DateTimeRangePicker callback={this.getDateRangeValue} module="renlifang" type="calenderRange" value={submitConds.value} formatString = {submitConds.timeType == "time" ? "yyyy-MM-dd" :"yyyy-MM"}/>
                        </div>
                        <button type="button"  onClick={this.phoneBtn.bind(this)} className="btn btn-primary ml10">
                            <span>确定</span>
                        </button>

                    </div>
                    <hr className="alt short mh10"/>
                    <div className="col-md-12">
                        <div className=" pn" >
                            <ul  id={"tabs-info"} className="nav show_area tabs-left" style={{width:"100%"}}>
                            {
                                (_.isEmpty(summary)) ? (<li title="全部(0)" onClick={this.regionnameTab.bind(this)} className="active"><a   data-toggle="tab"   >
                                                   全部(0)</a></li>) :( _.map(summary, function(item, index) {
                                        let title = `${item.regionName}(${item.count})`;
                                        if (index == 0)
                                        {
                                            return(
                                                <li key={index}   title={ item.regionName} className="active" onClick={this.regionnameTab.bind(this)}><a  data-toggle="tab" className="active"  >
                                                   {title}  </a></li>
                                                )
                                        } else {
                                            return(
                                                <li key={index}  title={ item.regionName} onClick={this.regionnameTab.bind(this)}><a  data-toggle="tab" >
                                                   {title}  </a></li>
                                                )
                                        }
                                    }, this))
                             }
                            </ul>
                        </div>
                        <div id={"table-info"}  className="col-md-10 " style={{padding:"1%",border:"1px solid #e2e2e2",borderRadius:"5px",width:"90%"}}>
                             <div className="col-md-12">
                                <div className="panel panel-visible fixTable" id={"spy2"} >
                                    <div className="panel-body pn of-x-a">
                                        <table className="table link" id={"loadPhoneInfoTable"} cellspacing="0" width="100%">
                                            <thead>
                                            <tr>
                                            <th style={{textAlign:'left',color:'#3498db',fontWeight:'bold'}}>手机号
                                            </th>
                                                <th style={{textAlign:'left',color:'#3498db',fontWeight:'bold'}}>姓名</th>
                                            <th style={{textAlign:'left',color:'#3498db',fontWeight:'bold'}}>归属地</th>
                                                <th style={{textAlign:'left',color:'#3498db',fontWeight:'bold'}}>关系强度（频次）</th>
                                            <th style={{textAlign:'left',color:'#3498db',fontWeight:'bold'}}>手机卡类型</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            <tr>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-1 pn">
                        </div>
                    </div>
                </div>
            </div>
</div>
        )
    }
}

module.exports = PhoneLink;

