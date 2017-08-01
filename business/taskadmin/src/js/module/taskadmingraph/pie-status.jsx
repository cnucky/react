import React from 'react';
import ReactDOM from 'react-dom';
import Notify  from  'nova-notify';

class PieStatus  extends React.Component {

    constructor(props){
        super(props);
    }

    getPieStatusData(){
        let dataIndex=this.props.dataIndex;

        let myChart = echarts.init(document.querySelector('#graph-pie-status'));
        showLoader();
        $.getJSON('/taskadmin/taskadmingraph/getgraphpiestatus',{
            "date":dataIndex,
            "statisticsType":"taskStatus"
        }, res=>{
            if (res.code == 0) {

                console.log('dateindex:'+dataIndex);

                myChart.setOption({
                    series:[{
                        name: '状态任务占比',
                        data:[
                            {value: res.data.finished, name: '完成'},
                            {value: res.data.running, name: '运行'},
                            {value: res.data.parterror, name: '部分出错'},
                            {value: res.data.error, name: '出错'},
                            {value: res.data.cancelling, name: '等待停止'},
                            {value: res.data.cancelled, name: '停止'},
                            {value: res.data.toexam, name: '待审批'},
                            {value: res.data.examing, name: '审批中'},
                            {value: res.data.examfailed, name: '审批拒绝'}
                        ],
                    }]
                });
                hideLoader();

            } else {
                Notify.simpleNotify('错误', res.message, 'error');
                hideLoader();
            }
        });




        myChart.setOption({

            title : {
                text: '各状态任务占比',
                x:'20%'
            },
            color : ['#70ca63','#3498db','#f58782','#f5150c','#f5e107','#ca8a3b','#6a5acd','#3408db', '#e30ff5'],
            tooltip : {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            legend: {
                orient: 'vertical',
                left:'60%',
                top:'15%',
                data: ['完成','运行','部分出错','出错','等待停止','停止','待审批','审批中','审批拒绝']
            },
            series : [
                {
                    name: '状态任务占比',
                    type: 'pie',
                    radius : '45%',
                    center: ['30%', '60%'],
                    data:[],
                    itemStyle: {
                        emphasis: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]

        });
    }


    componentDidMount() {
        this.getPieStatusData();
    }



    componentDidUpdate() {
        this.getPieStatusData();
    }

    render() {
        return(
            <div id="graph-pie-status" style={{width:'45%',height:'32%',position:'absolute',left:'60%',top:'38%',marginLeft:'-3%'}}>

            </div>
        );
    }

}

export default PieStatus