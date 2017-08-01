import React from 'react';
import ReactDOM from 'react-dom';
import Notify  from  'nova-notify';


class PieClass  extends React.Component {

    constructor(props){
        super(props)
    }

    getTaskType(){
        $.getJSON('/taskadmin/taskadmingraph/gettasktype',{
            "configName":"config_tasktype.xml",
            "configLanguage":"zh"
        } ,res=>{
            if (res.code == 0) {
                console.log(res.data,'aaaaaaaaaaaaaaa')

            } else {
                Notify.simpleNotify('错误', res.message, 'error');
                hideLoader();
            }
        });

    }

    getPieClassData(){
        let dataIndex = this.props.dataIndex;
        let taskType = this.props.taskTypeList;
        let pieClassColors = ['#70ca63','#3498db','#f58782','#f5150c','#f5e107','#ca8a3b','#6a5acd','#3408db', '#e30ff5',
                              '#aaa','#ca8a3b','#f6bb02','#3408db',
                              '#6a5acd','#8b4513','#9370db','#b0e0e6','#deb887','#d8bfd8','#d2b48c'
                          ]

        let myChart = echarts.init(document.querySelector('#graph-pie-class'));
        showLoader();

        $.getJSON('/taskadmin/taskadmingraph/getgraphpieclass',{
            "date":dataIndex,
            "statisticsType":"taskType"
        } ,res=>{
            if (res.code == 0) {

                let pieClassData = [];
                let pieClassNames = [];
                _.each(res.data, (value,index) => {
                    let pieClassObj = {};
                    pieClassObj.value = value;
                    pieClassObj.name = taskType[index];
                    pieClassData = [
                        ...pieClassData,
                        pieClassObj
                    ]
                    pieClassNames = [
                        ...pieClassNames,
                        pieClassObj.name
                    ]
                })

                let lth = pieClassNames.length;

                myChart.setOption({
                    color: pieClassColors.slice(0,lth),
                    legend: {
                        data: pieClassNames
                    },
                    series:[{
                        name: '类型任务占比',
                        data: pieClassData
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
                text: '各类型任务占比',
                x:'20%'
            },
            color : [],
            tooltip : {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            legend: {
                orient: 'vertical',
                left:'60%',
                top:'20%',
                data: []
            },
            series : [
                {
                    name: '类型任务占比',
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
        this.getPieClassData();
    }


    componentDidUpdate() {
        this.getPieClassData();
    }

    render() {
        return(
            <div id="graph-pie-class" style={{width:'45%',height:'32%',position:'absolute',left:'60%',top:'70%',marginLeft:'-3%'}}>

            </div>
        );
    }

}

export default PieClass

