import React from 'react';

import { Table ,Affix, Button } from 'antd';
import {store} from '../store';


require('../../../module/renlifang/styles.less');
//let addressData = require('./getrelation-address.json').data;

export default class RelationAddress extends React.Component {
    constructor(props) {
        super(props);
        this.state= {
           columns: [{
                title: '姓名',
                dataIndex: 'name',
                width: "30%",
                }, {
                title: '身份证号',
                dataIndex: 'cert',
                render:(text,record) =><span className="link"><a style={{color:"#3498db"}} target="_blank" href={UrlUtil.getProfileUrl(text, record.valueType)} >{text}</a></span>,
                width: "30%",
                }, {
                title: '出生日期',
                dataIndex: 'birthdate',
            }]
        }
    }

    componentDidMount() {
        var cert;
        if(this.props.myCert){
            cert = this.props.myCert.values[0];
        }
        var ids = [];
        ids.push(cert);
        $.getJSON("/renlifang/personcore/gethujiaddressrelation", {
            ids: ids
        }, function(rsp) {
            if (rsp.code == 0) {
                store.dispatch({
                    type: 'GET_ADDRESSDATA',
                    addressData:rsp.data.sfzList
                });
            }
        });

    }
    componentWillUpdate(){

    }
    render() {
        const addressData =store.getState().addressData;
        const data = [];
        if(!_.isEmpty(addressData)){
            var findList = addressData[0].findList;
            if(!_.isEmpty(findList)){
                $('#no_addressdata').hide();
                _.map(addressData, (item,key) => {
                    data.push({
                        key: key,
                        name: item.name,
                        cert: item.sfz,
                        birthdate: item.birthdate,
                        valueType:item.valueType
                    });
                });
            }else{
                $('#same_address').hide();
            }
        }else{
            $('#same_address').hide();
        }
        return (
            <div>
                <div id='same_address'>
                    <Table bordered style={{padding:"1%"}} columns={this.state.columns} dataSource={data} pagination={{ pageSize: 13 }} />
                </div>
                <div id='no_addressdata' className="col-md-12 eventNodata"  style={{height:560 ,overflowY:'hidden' , overflowX:'hidden'}}>
                  <label className="col-md-12 mbn" style={{width:'30%' , fontSize:12 , textAlign: 'left' , fontWeight: 'bold' , marginTop:10}}>暂无同地址数据</label>
                  <hr className="mt10 col-md-12" style={{color:'#C71313' , size:10}} />
               </div>
            </div>
        )
    }
}

module.exports = RelationAddress;

