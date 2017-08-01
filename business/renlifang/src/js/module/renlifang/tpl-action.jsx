import React from 'react';
import { Table ,Affix, Button } from 'antd';

export default class ActionDataTab extends React.Component {
    constructor(props) {
        super(props);
    }


    render() {

        let info = this.props.info;
        let infoGroup = this.props.infoGroup;






        let columns =_.map(infoGroup.children[0].group , (pro , key)=>{

            return{
                key:key,
                title : pro.caption,
                dataIndex : pro.name
            }
        })



         let allData = _.map(infoGroup.children , (item , key) =>{
            let data = {};
            _.each(item.group , (pro , key)=>{

                data[pro.name] = pro.valueList[0]

            })
             return data;

         })








        return<div  id="row-component" className="row " style={{margin:0}}>

                    <div className={ "col-md-12"} style={{height:'100%',padding:0}}>

                        <Table bordered style={{padding:"1%"}} columns={columns} dataSource={allData} pagination={{ pageSize: 13 }} />
                    </div>


                </div>




    }
}


module.exports = ActionDataTab;