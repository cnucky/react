import React from 'react';

import { Table ,Affix, Button } from 'antd';
import {store} from '../store';


require('../../../module/renlifang/styles.less');
//let socialData = require('./getqqtomobilelist.json').data;

export default class RelationSocial extends React.Component {
    constructor(props) {
        super(props);
        this.state= {
           columns: [{
                title: '姓名',
                dataIndex: 'name',
                width:"30%"
                }, {
                title: '电话',
                dataIndex: 'phone',
                render:(text,record) =><span className="link"><a style={{color:"#3498db"}} target="_blank" href={UrlUtil.getProfileUrl(text, record.valueType)} >{text}</a></span>,
                width:"30%"
                }, {
                title: '城市',
                dataIndex: 'city'
            }]
        }
    }
    //test(text,record){
    //    console.log(text,record)
    //}
    componentDidMount() {
        var qqtomobilelist = this.props.qqtomobilelist;
         $.getJSON("/renlifang/personcore/getqqtomobilelist", {
                     qqlist: qqtomobilelist.qq,
                     mobilelist: qqtomobilelist.mobile
                 }, function(rsp) {
                     if (rsp.code != 0 || !rsp.data || _.isEmpty(rsp.data)) {
                         //$("#social-table").empty();
                         //$("#social-table").append("<thead><tr><th>无通讯录数据</th></tr></thead>");
                         return false
                     } else {
                         store.dispatch({
                             type: 'GET_SOCIALDATA',
                             socialData:rsp.data
                         });
                     }
                 })



    }
    componentWillUpdate(){

    }

    render() {
        const data = [];
        var socialData = store.getState().socialData;
        _.map(socialData, (item,key) => {
            data.push({
                key: key,
                name: item.name,
                phone: item.tel,
                city: item.city,
                valueType:item.valueType
            });
        });
        return (
           <Table bordered style={{padding:"1%"}} columns={this.state.columns} dataSource={data} pagination={{ pageSize: 13 }} />

        )
    }
}

module.exports = RelationSocial;

