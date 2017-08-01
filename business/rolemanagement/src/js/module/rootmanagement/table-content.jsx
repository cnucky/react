import React from 'react';
import {render} from 'react-dom';
import {store} from '../store';
import { Tag, Checkbox } from 'antd';

const columns = [{
	title: '姓名',
	label: 'userName',
	className: 'cell-userName'
}, {
	title: '拥有角色',
	label: 'roleName',
	className: 'cell-roleName'
}, {
	title: '部门',
	label: 'departmentName',
	className: 'cell-departmentName'
}, {
	title: '修改',
	label: 'edit',
	className: 'cell-edit'
}]
class TableContent extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
        } 
    }

    componentWillReceiveProps(nextProps, nextState) {

    }

    componentDidMount() {

    }

    componentWillUnmount() {
    }

    _getTagColor (roleType) {
        let color = '#eae8fe'
        let fontColor = '#7265e6'
        
        switch (roleType) {
            case 2:
                color = '#ffffff'
                fontColor = '#e80202'
                break
            case 0:
                color = '#fdfffc'
                fontColor = '#009806'
                break
            case 1:
                color = '#fafcff'
                fontColor = '#007eff'
                break
            case 3:
                color = '#fffff9'
                fontColor = '#d0911b'
                break
            default:
                color = '#fcfcff'
                fontColor = '#7b52ff'
                break
        }
        return {color: color, fontColor: fontColor}
    }

    _onRolesNameCellChange (text, record, i) {
    	if (this.props.onRolesNameCellChange) {
    		this.props.onRolesNameCellChange(text, record, i)
    	}
    }

    _getTableHeader (columns) {
    	let header = _.map(columns, function (columnsItem, index) {
    		let cWidth = `${columnsItem.className}`
    		return (
    			<div className={`table-cell ${cWidth}`} key={`columns-${columnsItem.className}`}>
    				{columnsItem.title}
    			</div>
    		)
    	})
    	return header
    }

    _onCellChange (tbodyItem) {
    	if (this.props.onCellChange) {
    		this.props.onCellChange(tbodyItem)
    	}
    }

    _getTd (tbodyItem, label) {
    	let td = ''
    	var _this = this
    	if (label === 'edit') {
    		td = (
    			<span
    				onClick={_this._onCellChange.bind(_this, tbodyItem)}
    				className="fa fa-edit table-edit-icon">
    			</span>
    		)
    	} else if (label === 'roleName') {
    		td = _.map(tbodyItem[label], function (roleNameItem, rIndex) {
    			let colors = _this._getTagColor(roleNameItem.roleType)
                let value = _this.props.value
                let index = roleNameItem.name.search(value);
                let beforeStr = roleNameItem.name.substr(0, index);
                let afterStr = roleNameItem.name.substr(index + value.length);
    			return (
    				<span key={rIndex}>
    					<Tag
                            onClick={() => _this._onRolesNameCellChange(tbodyItem[label], tbodyItem, rIndex)}
                            color={colors.color}
                        >
                           	{index > -1 ? 
                                <span style={{color: colors.fontColor}} className="tag-role-title">
                                    {beforeStr}
                                <span style={{ color: '#ff009c', fontWeight: '900', backgroundColor: '#fafafa'}}>{value}</span>
                                    {afterStr}
                                </span> :
                                <span style={{color: colors.fontColor}}>{roleNameItem.name}</span>
                            }
                        </Tag>
    				</span>
    			)
    		})
    	} else {
    		let value = this.props.value;
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
    			)
    	}
    	return td
    }

    _getTableBody (data) {
    	if (data.length > 0) {
    		let _this = this
    		let tbody = _.map(data, function (dataItem, index) {
    			let bgColor = index % 2 === 0 ? 'even-row' : 'odd-row'
    			return (
    				<div className={`table-row ${bgColor}`} key={`row-${index}`}>
    					<div className="table-cell cell-check">
            				<Checkbox
            					checked={dataItem.isSelected}
            					onChange={_this._handleCellChange.bind(_this, dataItem, index)}
            				/>
            			</div>
    					{_.map(columns, function (cItem, cIndex) {
    						let cWidth = `cell-${cItem.label}`
    						return (
    							<div className={`table-cell ${cWidth}`} key={`row-${index}-cell-${cIndex}`}>{_this._getTd(dataItem, cItem.label)}</div>
    						)
    					})}
    				</div>
    			)
    		})
    		return tbody
    	}
    }

    _handleCellChange (dataItem, index, e) {
    	if (this.props.handleCellChange) {
    		this.props.handleCellChange(dataItem, index, e)
    	}
    }

    _getSelectedTableData (data, type, type2) {
        let selectedData = []
        if (typeof data !== 'undefined' && data.length > 0) {
            for (let i = 0; i < data.length; i++) {
                let isselect = typeof type2 !== 'undefined' ? (data[i][type] && data[i][type2]) : data[i][type]
                if (isselect) {
                    selectedData.push(data[i])
                }
            }
        }
        return selectedData
    }
    _getcheckedAll () {
        let checked = true
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
        return checked
    }

    _handleCellChangeAll (e) {
    	if (this.props.handleCellChangeAll) {
    		this.props.handleCellChangeAll(e)
    	}
    }

	render() {
		const { data } = this.props

		return (
            <div className="table-content">
            	<div className="table-contaner">
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
            </div>
        )
	}
}

export default TableContent



