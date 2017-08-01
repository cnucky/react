import React from 'react';
import ReactDOM from 'react-dom';
import echarts from 'echarts';
import {store} from '../store';
const Notify = require('nova-notify');


class Bar  extends React.Component {
    constructor(props) {
        super(props);

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



    componentDidMount() {
        const { barData,dateValue } = this.props;

        let myChart = echarts.init(document.querySelector('#graph-bar'));
        let dateArr = this.getDate(dateValue);

        myChart.setOption({

            title : {
                text: '任务总数统计',
                textStyle:{'fontWeight':'bolder','fontSize':'24'},
                x:'center'
            },
            tooltip : {
                trigger: 'axis',
                axisPointer : {
                    type : 'shadow',
                    shadowStyle:{
                        opacity:'0.4'
                    }
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis : [
                {
                    type : 'category',
                    data : dateArr
                }
            ],
            yAxis : [
                {
                    type : 'value',
                    name:'数量'
                }
            ],
            series : [

                {
                    name:'任务数量',
                    type:'bar',
                    barWidth : 100,
                    data:barData,
                    itemStyle:{
                        normal:{color:'#17ca6c'}
                    }
                }

            ]

        });

        myChart.on('click', function (params) {

         if (params.componentType === 'series') {
             store.dispatch({type: 'SHOW_GRAPH_ANALY', dataIndex:params.name});
            }
        });
    }

    render() {
        return(
            <div id="graph-bar" style={{width:'100%',height:'35%',position:'absolute',marginLeft:'-1%'}}>

            </div>
        );
    }
}

export default Bar