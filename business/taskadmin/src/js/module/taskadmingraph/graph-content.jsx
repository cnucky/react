import React from 'react';
import ReactDOM from 'react-dom';
import {store} from '../store';
import { Select } from 'antd';
import Notify  from  'nova-notify';
import Bar from './bar';
import Line from './line';
import PieStatus from './pie-status';
import PieClass from './pie-class';

const Option = Select.Option;


class Graph  extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            dateValue:7
        }
    }


    formatDate(date) {
        let y = date.getFullYear();
        let m = date.getMonth() + 1;
        m = m < 10 ? '0' + m : m;
        let d = date.getDate();
        d = d < 10 ? ('0' + d) : d;
        return y + '-' + m + '-' + d;
    }

    getDate(dateValue){
        let dateArr = [];
        let now = new Date();
        for(let i=0;i<dateValue;i++){
            let nowDate =  new Date(Date.parse(now) - (dateValue-i-1)*24*60*60*1000);
            let t=this.formatDate(nowDate )
            dateArr.push(t)
        }
        return dateArr;
    }

    getGraphData(dateValue){
        let totalData=[];
        for(i=0;i<dateValue;i++){
            totalData[i] = null;
        }
        let dateArr = this.getDate(dateValue);
        $.getJSON('/taskadmin/taskadmingraph/getgraphbar',{
            "timeInterval":"week",
            "sectionType":"day"
        }, res=> {

            if (res.code == 0) {

                _.each(res.data, (item, index) => {

                    let day = new Date(index);
                    let getDay = this.formatDate(day);

                    for (let i = 0; i < dateValue; i++) {
                        if (getDay == dateArr[i]) {
                            totalData[i] = item;
                        }
                    }
                })

                store.dispatch({type: 'GRAPHBARDATA_GET', barData:totalData});
                store.dispatch({type: 'LOODGRAPHDATA_GET', isLoodGraph:true});

            } else {
                Notify.simpleNotify('错误', res.message, 'error');
            }
        });
    }

    componentDidMount() {
        const { isLoodGraph } = this.props;
        const { dateValue } = this.state;
       if(!isLoodGraph){
           this.getGraphData(dateValue);
       }
    }

    componentWillUnmount(){

    }

    handleChange (value) {
        this.setState({
            dateValue: value
        });
        this.getGraphData(value);
    }

    getOptions(){
        const dateList = {
            7: 7,
            10: 10,
            15: 15,
            30: 30
        };
        let options = '';
        options = _.map(dateList, (value,index) => {
            return <Option value={value}>{index}</Option>
        });
        return options;
    }

    render() {

        const {  height, showGraph, dataIndex, taskTypeList, barData, isLoodGraph } = this.props;
        const { dateValue } = this.state;

        return(
            <div style={{width: '100%', height: '93%', position: 'relative', backgroundColor: "#fff"}}>
                {isLoodGraph?
                    <Bar
                    dateValue={dateValue}
                    barData={barData}
                    dataIndex={dataIndex}
                    showGraph={showGraph}
                    />
                :null}
                {isLoodGraph && showGraph?
                    <Line
                    dataIndex={dataIndex}
                    showGraph={showGraph}
                     />
                :null}
                {isLoodGraph && showGraph?
                    <PieStatus
                    dataIndex={dataIndex}
                    showGraph={showGraph}
                      />
                :null}
                {isLoodGraph && showGraph?
                    <PieClass
                    dataIndex={dataIndex}
                    showGraph={showGraph}
                    taskTypeList = {taskTypeList}
                      />
                :null}
            </div>
        );
    }

}

export default Graph

