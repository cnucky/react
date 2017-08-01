import React from 'react';

import { Table ,Affix, Button } from 'antd';
var MultiSelect = require('widget/multiselect');

require('jquery.datatables');
require('datatables.bootstrap');
require('bootstrap-multiselect');
import {store} from '../store';
import AutoLink from '.././rlf-auto-link';
import IconSet from '.././rlf-icon-set';
import AssistMenu from '.././rlf-assist-menu';
var yjsPermission = false;


require('../../../module/renlifang/styles.less');

var dataBySelectedCerts = [];



export default class RelationFamily extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectKey:0,
            familyData : []
        };


    }

    componentDidMount() {

        let params =[
            {
                certNo : this.props.myCert.values ,
                type: 20
            }
        ]

        let that = this;
        that.initFamilyTable();

        $.getJSON('/renlifang/personcore/getfamilyInfo', {
            cert:params
        }, function(rsp) {
            hideLoader();
            if (rsp.code == 0) {
                that.setState({
                    familyData : rsp.data
                })


                if( _.isEmpty(that.state.familyData) ){

                    $("#isFamilyDataExist").css('display','');
                    $("#hasFamilyData").css('display','none');

                } else {
                    that.first(1,that.state.familyData[0].householdCert , 0);

                }
            }
        })



    }
    renderTable(data){

        var tabsData = [];
        var totalCount = 0;
        if(data.length > 0){
            _.map(data,function(item){
                tabsData.push({
                    householdId:item.householdId,
                    householdCount:item.householdCount
                })
                totalCount = totalCount + item.householdCount;
            })
        }


        this.renderTabsLink(tabsData);
        this.setFamilyTableData("-1",data);

        var a = $("#loadFamilyInfoTable").find('a');
        if (a.length > 0) {
            _.each(a, function(item) {
                var hrefLink = $(this).attr("href");
                var currentHrefName = IconSet.getcurrentHrefName();

            })
        }
        AssistMenu.initContextmenu("#family-relation", "a.rlf-auto-link", yjsPermission, true);

    }
    initFamilyTable() {
        $('#loadFamilyInfoTable').dataTable({
            'destroy': true,
            'columnDefs': [{
                'targets': 0,
                'render': function(data, type, full, meta) {

                    return '<a class=" " target="_blank"  href="' + UrlUtil.getProfileUrl(data, 1) + '">' + data + '</a>';

                }
            }],
            'data': [],
            "bAutoWidth": false,
            'searching': false,
            // 'aaSorting': [
            //     [1, 'desc']
            // ],
            "ordering":false,
            "oLanguage": {
                "sProcessing": "正在加载家庭关系信息...",
                "sLengthMenu": "每页显示_MENU_条记录",
                "sInfo": "当前显示_START_到_END_条，共_TOTAL_条记录",
                "sInfoEmpty": "",
                "sZeroRecords": "对不起，查询不到相关家庭关系信息",
                "sInfoFiltered": "",
                "sSearch": "搜索",
                "oPaginate": {
                    "sPrevious": "前一页",
                    "sNext": "后一页"
                }
            },
            "bPaginate": true,
            "iDisplayLength": 10,
            "aLengthMenu": [
                [5, 10, 25, 50, -1],
                [5, 10, 25, 50, "All"]
            ],
            "sDom": '<"clearfix"fr>t<"dt-panelfooter"ip>',
            // "sDom": '<"clearfix"r>ft<"dt-panelfooter clearfix"ip>',
        });

        $('#loadFamilyInfoTable').attr("margin-top","0px")
    }
    renderTabsLink(data){
        var contentTabsContainer = $("#family-tabs-info");
        contentTabsContainer.empty();
        if(data.length > 0){
            _.map(data,function(item,index){

                contentTabsContainer.append('<li class="active" title="' + item.householdId + '"><a href="" data-toggle="tab">' + '户号:' + item.householdId + '(' + item.householdCount + ')' + '</a></li>');

            })
        }
    }
    setFamilyTableData(id,data){
        var tempData = [];
        if(id != "-1"){
            data = _.filter(data,function(dataItem){
                return dataItem.householdId == id;
            })
        }

        _.map(data,function(item,index){
            if(item.houseMember && item.houseMember.length > 0){
                _.map(item.houseMember,function(memberInfo){
                    var info = [];
                    info.push(memberInfo.cert);
                    info.push(memberInfo.name);
                    info.push(memberInfo.relation);
                    info.push(memberInfo.sex);
                    info.push(memberInfo.address);
                    info.push(memberInfo.birthday);
                    info.push(memberInfo.nation);
                    info.push(memberInfo.education);
                    info.push(memberInfo.marriage);
                    tempData.push(info);
                })
            }
        })

        $("#loadFamilyInfoTable").dataTable().fnClearTable();

        if(tempData.length > 0){
            $("#loadFamilyInfoTable").dataTable().fnAddData(tempData);
        }

    }

    first(i, option , key){
        this.setState({
            selectKey:key
        });

        let dataBySelectedCerts = [];

        var familyItem = _.find(this.state.familyData,function(item){
            return item.householdCert == option
        })

        dataBySelectedCerts.push(familyItem);


        this.renderTable(dataBySelectedCerts);
    }

    cert(item, option , key){
        console.log(option.val())
        this.setState({
            selectKey:key
        });

        let dataBySelectedCerts = [];

        var familyItem = _.find(this.state.familyData,function(item){
            return item.householdCert == option.val()
        })

        dataBySelectedCerts.push(familyItem);


        this.renderTable(dataBySelectedCerts);
    }

    componentWillUpdate(){

    }
    render() {
        let familyData = this.state.familyData;

        return (

           <div id="family-relation" className="tab-pane row" style={{paddingLeft:11,paddingRight:11}}>
               <div className="col-md-12" id="isFamilyDataExist" style={{height:560 , display:'none' ,overflowY:'hidden' , overflowX:'hidden'}}>
                   <label className="col-md-12 mbn" style={{width:'30%' , fontSize:12 , textAlign: 'left' , fontWeight: 'bold' , marginTop:10}}>暂无户籍关系数据</label>
                   <hr className="mt10 col-md-12" style={{color:'#C71313' , size:10}} />
               </div>
               <div className="col-md-12" id="hasFamilyData" style={{paddingLeft:0}}>
                   <div className="col-md-12 mb20" >
                       <div className="col-md-1" style={{width:'12%'}}>
                       </div>
                       <div className="col-md-10">
                           <div className="col-md-12">
                               <label className="col-md-4" style={{ fontSize:18 , textAlign: 'right'  , color: '#3498db' , fontWeight: 'bold' , marginTop:6}}>当前选中的身份证号</label>

                                    <div className='col-md-4'>
                                        <MultiSelect
                                            id="operationChar"
                                            onChange={this.cert.bind(this)}
                                            updateData={true}
                                            config={{
                                            buttonClass: 'multiselect dropdown-toggle btn btn-primary fs13 mnw50',
                                            buttonWidth: '100%',
                                            nonSelectedText: "没有身份证",
                                            nSelectedText: "个已选择"
                                            }}
                                            data={
                                            _.map(familyData, function (item) {
                                                return {
                                                    label: item.householdCert,
                                                    title: item.householdCert,
                                                    value: item.householdCert,
                                                    type: 'string'


                                                }
                                            })
                                        }/>
                                    </div>

                           </div>
                       </div>
                   </div>
                   <div className="col-md-12" style={{height:560}}>

                       <div className="col-md-12 panel-body of-x-a" style={{paddingBottom:0}}>
                           <div>
                               <ul id="family-tabs-info" className="nav nav-tabs " style={{ paddingRight:1}}>

                               </ul>
                           </div>

                           <table  className="table stripe footable mbn admin-form" id={"loadFamilyInfoTable"} cellspacing="0" width="100%">
                               <thead>
                               <tr>
                                   <th  style={{width:'15%'}}>身份证</th>
                                   <th  style={{width:'10%'}}>姓名</th>
                                   <th  style={{width:'6%'}}>关系</th>
                                   <th  style={{width:'6%'}}>性别</th>
                                   <th  style={{width:'20%'}}>地址</th>
                                   <th  style={{width:'10%'}}>生日</th>
                                   <th  style={{width:'6%'}}>民族</th>
                                   <th  style={{width:'9%'}}>学历</th>
                                   <th  style={{width:'20%'}}>婚姻状况</th>
                               </tr>
                               </thead>
                               <tbody className='link'>
                                <tr>
                                </tr>
                               </tbody>
                           </table>
                       </div>
                   </div>
               </div>

           </div>
        )
    }
}

module.exports = RelationFamily;

