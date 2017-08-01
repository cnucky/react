import React from 'react';
import ReactDOM from 'react-dom';
import echarts from 'echarts';
const Notify = require('nova-notify');

class Line  extends React.Component {

    constructor(props){
        super(props)
    }

    formatDate(date) {
        let y = date.getFullYear();
        let m = date.getMonth() + 1;
        m = m < 10 ? '0' + m : m;
        let d = date.getDate();
        d = d < 10 ? ('0' + d) : d;
        return y + '-' + m + '-' + d;
    }


    getLineData(){
        let dataIndex=this.props.dataIndex;

        let totalData=[null,null,null,null,null,null,null,null,null,null,null];
        let timeArr = [8,9,10,11,12,13,14,15,16,17,18];

        let myChart = echarts.init(document.querySelector('#graph-line'));
        showLoader();

        $.getJSON('/taskadmin/taskadmingraph/getgraphline',{
            "date":dataIndex,
            "statisticsType":"timeDistribute"
        }, res=>{
            if (res.code == 0){

                _.each(res.data,(item,index) => {
                    for(let i=0;i<11;i++){
                        if(index == timeArr[i]){
                            totalData[i]=item;
                        };
                    };
                });

                myChart.setOption({
                    series:[{
                        name: '数量',
                        data: totalData,
                    }]
                });

                hideLoader();


            } else {
                Notify.simpleNotify('错误', res.message, 'error');
                hideLoader();
            }
        });


        // 绘制图表
        myChart.setOption({
            title : {
                text: '各时段任务变化图',
                textStyle:{'fontWeight':'bolder'},
                x:'center'
            },
            tooltip : {
                trigger: 'axis',
                axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                    type : 'line'        // 默认为直线，可选为：'line' | 'shadow'
                }
            },
            legend: {
                data:['邮件营销']
            },
            grid: {
                left: '6%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                axisLabel:{ interval: 0 },
                //nameTextStyle:{'fontSize':'10'},
                type: 'category',
                name:'时间',
                boundaryGap: true,
                data: ['8:00','9:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00']
            },
            yAxis: {
                type: 'value',
                name:'数量'
            },
            series: [
                {
                    name:'数量',
                    type:'line',
                    stack: '数量',
                    symbol: 'circle',
                    symbolSize:10,
                    itemStyle : {
                        normal : {
                            color:'#e09d6d',
                            fontSize:'200',
                            lineStyle:{
                                color:'#e09d6d'
                            }
                        }
                    },
                    hoverAnimation:false,
                    data:[]
                }
            ]

        });
    }



    componentDidMount() {
        this.getLineData();
    }


    componentDidUpdate() {
        this.getLineData();
    }

    render() {
        return(
            <div id="graph-line" style={{width:'62%',height:'64%',top:'38%',position:'absolute',marginLeft:'-1.5%'}}  >

            </div>
        );
    }

}

export default Line