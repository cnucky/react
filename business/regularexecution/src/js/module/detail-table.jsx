import React from 'react';
import {render} from 'react-dom';
import {store} from './store';
import {Table} from 'antd';
require('fixed-data-table/dist/fixed-data-table.min.css');

class DetailTable extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
        }
        
    }


    componentWillReceiveProps(nextProps) {

    }

    componentDidMount() {
        
    }

    _getColumns () {
        let columns = [{
            title: '任务名称',
            dataIndex: 'taskName',
            className: 'taskName'
        },  {
            title: '状态',
            dataIndex: 'taskStatus',
            render: (text, record, index) => (
                text === "finished" ? <span>完成</span> :
                            <span>运行中</span>
            ),
            className: 'taskStatus'
        }, {
            title: '进度',
            dataIndex: 'taskRatio',
            render: (text, record, index) => (
                <span>{text}%</span> 
                        
            ),
            className: 'taskRatio'
        }, {
            title: '结果数',
            dataIndex: 'resultCount',
            className: 'resultCount'
        }, {
            title: '创建时间',
            dataIndex: 'createTime',
            render: (text, record, index) => (
                // console.log(record, 'record')
                <span>
                    <span>{record['submitTime']}</span>
                </span>
            ),
            className: 'detailCreateTime'
        }]
        return columns
    }

	render() {
        const { tasksummarylist, showDetailTable, height } = this.props

		return (
			<div
                style={{display: showDetailTable ? 'block' : 'none'}}
                className="detail-table-content"
            >
                <div className="detail-table-title-wrap">
                    <span className="padding">建模任务概要信息</span>
                    <span className="glyphicon glyphicon-tag paddingLeft10"></span>
                </div>
                <div
                    className="detail-table-contaner"
                >
                    <Table 
                        columns={this._getColumns()}
                        dataSource={tasksummarylist}
                        size="small"
                        pagination={{pageSize: 9}}
                        scroll={{y: (height - 130)}}
                        bordered={true}
                    />
                </div>
			</div>
		)
	}
}

export default DetailTable


