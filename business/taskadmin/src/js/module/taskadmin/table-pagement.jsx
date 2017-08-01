import React from 'react';
import { Button, Checkbox } from 'antd';
// import {store} from '../store';


const columns = [{
        title: '任务类型',
        dataIndex: 'taskType',
        className: 'task-type'
      }, {
        title: '名称',
        dataIndex: 'taskName',
        className: 'task-name'
      }, {
        title: '优先级',
        dataIndex: 'taskPriority',
        className: 'task-priority'
      }, {
        title: '状态',
        dataIndex: 'taskStatus',
        className: 'task-status'
      }, {
        title: '创建者',
        dataIndex: 'submitUserName',
        className: 'submit-user-name'
      }, {
        title: '创建时间',
        dataIndex: 'submitTime',
        className: 'submit-time'
      }, {
        title: 'operate',
        dataIndex: 'operateType',
        className: 'operate-type'
      }];

class TablePagement extends React.Component {
	constructor(props) {
        super(props);
        this.state = {
        	selectedRowKeys: []
        }
        
  	}

	componentWillReceiveProps(nextProps) {
	
	}

	componentDidMount() {

	}

  	componentWillUnmount () {
  	}

  	_getcheckedAll () {
      /*  let checked = true
        let rootTableListData = this.props.data
        let checkedData = this._getSelectedTableData(rootTableListData, 'isChecked')
        if (typeof rootTableListData !== 'undefined' && rootTableListData.length > 0) {
            for (let i = 0; i < rootTableListData.length; i++) {
                if (rootTableListData[i].isSelected === false || checkedData.length === 0) {
                    checked = false
                }
            }
        } else {
            checked = false
        }
        return checked*/
    }

  	_handleCellChangeAll (e) {
    	if (this.props.handleCellChangeAll) {
    		this.props.handleCellChangeAll(e)
    	}
    }

    _handleAllOperate () {

    }

    _handleCellChange (dataItem, index, e) {
    	if (this.props.handleCellChange) {
    		this.props.handleCellChange(dataItem, index, e)
    	}
    }

    _onCellChange (tbodyItem) {
    	if (this.props.onCellChange) {
    		this.props.onCellChange(tbodyItem)
    	}
    }

    _getIconStyle(runningStatus) {
      switch (runningStatus) {
        case 'stop':
          return {iconStyle: 'imoon imoon-play2', label: '停止'}
        case 'waiting':
          return {iconStyle: 'imoon imoon-stop2', label: '排队中'}
        case 'start':
          return {iconStyle: 'imoon imoon-spinner', label: '运行中'}
        case 'finished':
          return {iconStyle: 'imoon imoon-checkmark-circle', label: '已完成'}
        case 'pause':
          return {iconStyle: 'imoon imoon-pause2', label: '暂停'}
        default:
          return "imoon imoon-stop2"
      }
  	}

  	_getColumText (text) {
      let value = this.props.value;
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

    _getTd (tbodyItem, label) {
    	let td = ''
    	var _this = this
    	if (label === 'operateType') {
    		td = (
    			<span
    				onClick={_this._onCellChange.bind(_this, tbodyItem)}
    				className={`${_this._getIconStyle(tbodyItem.taskStatus).iconStyle} running-status-style`}
    			>
    				<span style={{paddingLeft: '10px'}}>{_this._getColumText(this._getIconStyle(tbodyItem.taskStatus).label)}</span>
    			</span>
    		)
    	} else {
    		/*let value = _this.props.value;
        	let indexValue = tbodyItem[label].search(value);
        	let beforeStr = tbodyItem[label].substr(0, indexValue);
        	let afterStr = tbodyItem[label].substr(indexValue + value.length);
            
    		td = (
    				indexValue > -1 ?
    				<span>
                		{beforeStr}
                		<span style={{ color: '#ff009c', fontWeight: '900', backgroundColor: '#fafafa'}}>{value}</span>
                		{afterStr}
            		</span> :
            		<span>{tbodyItem[label]}</span>
    			)*/
    		td = _this._getColumText(tbodyItem[label])
    	}
    	return td
    }


    _getTableBody (data) {
    	let tbody = <span style={{fontSize: '14px', fontWeight: '500'}}>暂时没有数据</span>
    	if (data.length > 0) {
    		let _this = this
    		tbody = _.map(data, function (dataItem, index) {
    			let bgColor = index % 2 === 0 ? 'even-row' : 'odd-row'
    			return (
    				<div className={`table-row ${bgColor}`}>
    					<div className="table-cell cell-check">
            				<Checkbox
            					checked={dataItem.isSelected}
            					onChange={_this._handleCellChange.bind(_this, dataItem, index)}
            				/>
            			</div>
    					{_.map(columns, function (cItem) {
    						let cWidth = `${cItem.className}`
    						return (
    							<div className={`table-cell ${cWidth}`}>{_this._getTd(dataItem, cItem.dataIndex)}</div>
    						)
    					})}
    				</div>
    			)
    		})
    	}
    	return tbody
    }

    _getTableHeader (columns) {
    	let header = _.map(columns, function (columnsItem, index) {
    		let cWidth = `${columnsItem.className}`
    		if (columnsItem.title === 'operate') {
    			return (
    				<div className={`table-cell ${cWidth}`}>
    					<span
				            onClick={this._handleAllOperate.bind(this)}
				            className={`glyphicons ${this.props.operateStart ? 'glyphicons-pause' : 'glyphicons-play'} running-status-style`}
				            style={{color: this.state.selectedRowKeys.length > 0 ? '#666' : '#ccc'}}
				        >
				        </span>
    				</div>
    			)
    		} else {
    			return (
    				<div className={`table-cell ${cWidth}`}>
    					{columnsItem.title}
    				</div>
    			)
    		}
    	}, this)
    	return header
    }

	render() {
		const { data } = this.props

		return (
      		<div className="table-pagement-wrap">
			 	<div className="table-header">
				  	<div className="table-cell cell-check">
            			<Checkbox
            				onChange={this._handleCellChangeAll.bind(this)}
                            checked={this._getcheckedAll()}
            			/>
            		</div>
            		{this._getTableHeader(columns)}
			  	</div>
			  	<div className="table-body">
			  		{this._getTableBody(data)}
			  	</div>
      		</div>
		)
	}	
}

export default TablePagement