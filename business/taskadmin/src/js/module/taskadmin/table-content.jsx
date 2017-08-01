import React from 'react';
import { Table, Button, Popconfirm } from 'antd';
import {store} from '../store';
import Notify  from  'nova-notify';
import TablePagement from './table-pagement';


class TableContent extends React.Component {
	constructor(props) {
        super(props);
        
  }

  _onSelectAll () {
  }

  _getIconStyle(runningStatus) {
      switch (runningStatus) {
        case 'cancelling':
          return {iconStyle: 'imoon imoon-pause2', label: '等待停止'}
        case 'examing':
          return {iconStyle: 'imoon imoon-checkmark2', label: '审批中'}
        case 'running':
          return {iconStyle: 'imoon imoon-spinner', label: '运行'}
        case 'toexam':
          return {iconStyle: 'imoon imoon-clock', label: '待审批'}
        case 'examfailed':
          return {iconStyle: 'imoon imoon-close', label: '审批拒绝'}
        case 'cancelled':
          return {iconStyle: 'fa fa-minus-circle', label: '停止'}
        case 'error':
          return {iconStyle: 'imoon imoon-cancel-circle', label: '出错'}
        case 'parterror':
          return {iconStyle: 'imoon imoon-notification', label: '部分出错'}
        case 'finished':
          return {iconStyle: 'imoon imoon-checkmark-circle', label: '完成'}
        default:
          return "imoon imoon-stop2"
      }
  }

  componentWillReceiveProps(nextProps) {
  }


  componentDidMount() {


  }

  componentWillUnmount () {

  }

	_onCellChange(index, text, record) {
    let taskId = record.taskId
    let taskStatus = record.taskStatus
    let dataListCopy = this.props.dataListCopy
    let operateType = null;
    if (taskStatus === 'cancelled') {
      operateType = 'start'
    }
    if (taskStatus === 'running') {
      operateType = 'stop'
    }
    let operateData = {
      taskId: taskId,
      operateType: operateType
    }
    if (operateType !== null) {
      $.getJSON( "/taskadmin/taskadmin/operate", operateData)
      .done(function( data ) {
          var dataList = dataListCopy
          if (data.code === 0) {
            /*for (let i = 0; i < dataList.length; i++) {
              if (dataList[i].taskId === taskId) {
                dataList[i].taskStatus = operateType === 'stop' ? 'cancelled' : 'running'
              }
            }*/
            // store.dispatch({type: 'METADATA_FETCHED', dataList: dataList});
          }
      })
      .fail(function( jqxhr, textStatus, error ) {
          var err = textStatus + ", " + error;
          console.log( "Request Failed: " + err );
      });
    }
    // let dataList = this.state.dataList
    // dataList[index].taskStatus = operateType
	}

	_startCellChange(index, text, record){
	    const { refreshChange } = this.props;
        let taskId = record.taskId;
        let operateData = {
            taskId: taskId,
            operateType: 'start'
        }
        $.getJSON( "/taskadmin/taskadmin/operate", operateData)
            .done(function( data ) {
                if (data.code === 0) {
                    refreshChange();
                    Notify.show({
                        title: '开始任务成功',
                        type: "success"
                    });
                }
            })
            .fail(function( jqxhr, textStatus, error ) {
                var err = textStatus + ", " + error;
                console.log( "Request Failed: " + err );
            });
    }

    _stopCellChange(index, text, record){
        const { refreshChange } = this.props;
        let taskId = record.taskId;
        let operateData = {
            taskId: taskId,
            operateType: 'stop'
        }
        $.getJSON( "/taskadmin/taskadmin/operate", operateData)
            .done(function( data ) {
                if (data.code === 0) {
                    refreshChange();
                    Notify.show({
                        title: '停止任务成功',
                        type: "success"
                    });
                }
            })
            .fail(function( jqxhr, textStatus, error ) {
                var err = textStatus + ", " + error;
                console.log( "Request Failed: " + err );
            });
    }

  _handleAllOperate () {
    const { selectedRowKeys } = this.state
    const { operateStart } = this.props
    let dataListCopy = this.props.dataListCopy
    if (selectedRowKeys.length > 0) {
      let taskId = selectedRowKeys
      let operateType = !operateStart ? 'start' : 'stop'
      $.getJSON( "/taskadmin/taskadmin/operate", {taskId: taskId, operateType: operateType})
      .done(function( data ) {
          var dataList = dataListCopy
          if (data.code === 0) {
            if (dataListCopy.length > 0) {
              for (let i = 0; i < dataListCopy.length; i++) {
                if (taskId.indexOf(dataListCopy[i].taskId) > -1 && (dataList[i].taskStatus === 'start' || dataList[i].taskStatus === 'stop')) {
                  dataList[i].taskStatus = operateType
                }
              }
            }
          }
          store.dispatch({type: 'METADATA_FETCHED', dataList: dataList, operateStart: !operateStart});
      })
      .fail(function( jqxhr, textStatus, error ) {
          var err = textStatus + ", " + error;
          console.log( "Request Failed: " + err );
      });

    } else {
      return
    }
  }


  _getColumText (text, record, index) {
      let value = this.props.value || '';
      if (typeof text !== 'string') {
          text = text + ''
      }
      let indexValue = text.search(value);
      let beforeStr = text.substr(0, indexValue);
      let afterStr = text.substr(indexValue + value.length);
      let title = indexValue > -1 ?
          <span>
              {beforeStr}
              <span style={{ color: '#ff009c', fontWeight: '900', backgroundColor: '#fafafa'}}>{value}</span>
              {afterStr}
          </span> :
          <span>{text}</span>

        return title
  }


    _getColumTypeText (txt, record, index) {
        let value = this.props.value || '';
        let text = this.props.taskTypeList[txt];
        if (typeof text !== 'string') {
            text = text + ''
        }
        let indexValue = text.search(value);
        let beforeStr = text.substr(0, indexValue);
        let afterStr = text.substr(indexValue + value.length);
        let title = indexValue > -1 ?
            <span>
              {beforeStr}
                <span style={{ color: '#ff009c', fontWeight: '900', backgroundColor: '#fafafa'}}>{value}</span>
                {afterStr}
            </span> :
            <span>{text}</span>

        return title
    }

    _getColumStatusText (txt, record, index) {
        let value = this.props.value || '';
        let text = this.props.taskStatusList[txt];
        if (typeof text !== 'string') {
            text = text + ''
        }
        let indexValue = text.search(value);
        let beforeStr = text.substr(0, indexValue);
        let afterStr = text.substr(indexValue + value.length);
        let title = indexValue > -1 ?
            <span  className={`${this._getIconStyle(record.taskStatus).iconStyle} running-status-style`}>
                <span style={{paddingLeft: '10px'}}>
                    {beforeStr}
                    <span style={{ color: '#ff009c', fontWeight: '900', backgroundColor: '#fafafa'}}>{value}</span>
                    {afterStr}
                </span>
            </span> :
            <span  className={`${this._getIconStyle(record.taskStatus).iconStyle} running-status-style`}>
                <span style={{paddingLeft: '10px'}}>
                    {text}
                </span>
            </span>

        return title
    }



    _getColums() {
        let column = [{
            title: '名称',
            dataIndex: 'taskName',
            className:'namemodel',
            render: (text, record, index) => (
                this._getColumText(text, record, index)
            )
        },{
            title: '任务类型',
            dataIndex: 'taskType',
            className:'typemodel',
            render: (text, record, index) => (
                this._getColumTypeText(text, record, index)
            )
        },{
            title: '状态',
            dataIndex: 'taskStatus',
            className:'statusmodel',
            render: (text, record, index) => (
                this._getColumStatusText(text, record, index)
            )
        },{
            title: '优先级',
            dataIndex: 'taskPriority',
            className:'prioritymodel',
            render: (text, record, index) => (
                this._getColumText(text, record, index)
            )
        },{
            title: '创建时间',
            dataIndex: 'submitTime',
            className:'timemodel',
            render: (text, record, index) => (
                this._getColumText(text, record, index)
            )
        },{
            title: '创建者',
            dataIndex: 'submitUserName',
            className:'usermodel',
            render: (text, record, index) => (
                this._getColumText(text, record, index)
            )
        },{
            title: '操作',
            dataIndex: 'operateType',
            className:'operatemodel',
            render: (text, record, index) => (
                <span>
                    {record.taskStatus==='running'?
                          <span
                                onClick={() => this._stopCellChange(index, text, record)}
                                className={`imoon imoon-stop2 running-status-style fs20`}
                                style={{marginLeft:'5px',color: 'rgba(250,0,0,0.9)'}}
                            >
                         </span>:''
                    }
                    {record.taskStatus==='cancelled'?
                          <span
                                onClick={() => this._startCellChange(index, text, record)}
                                className={`imoon imoon-play2 running-status-style fs20`}
                                style={{marginLeft:'5px',color: 'rgba(0,142,0,0.9)'}}
                            >
                         </span>:''
                    }
            </span>
            ),
        }];
        return column
    }



  _onSelectChange (selectedRowKeys) {
      this.setState({ selectedRowKeys });
  }

	render() {
		const { dataList, operateStart, value, height, load, pagination, handleTableChange } = this.props
        let columns = this._getColums()
		return (
      <div className="table-wrap">
			  <div className="table-content">
				  <Table
                    size="middle"
                    bordered={true}
                    columns={columns}
                    dataSource={dataList}
                    pagination={pagination}
				  	  loading={load}
			   		  onChange={handleTableChange}
                    scroll={{y:height-110}}
          />
          {/*<TablePagement
            data={dataList}
            operateStart={operateStart}
            value={value}
          />*/}
        </div>
      </div>
		)
	}	
}

export default TableContent