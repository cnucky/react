import React from 'react';
import {render} from 'react-dom';
import {store} from '../store';
import { Button, Tag, Input, Checkbox } from 'antd';
var Notify = require('nova-notify');
const Search = Input.Search;
const InputGroup = Input.Group;
import classNames from 'classnames';
import { RootDialog } from './root-dialog';
import FixedDataTable from 'fixed-data-table';
import TableContent from './table-content.jsx';

initLocales(require.context('../../../locales/rootmanagement', false, /\.js/), 'zh');
var Provider = require('widget/i18n-provider');
require('fixed-data-table/dist/fixed-data-table.min.css');

const {Table, Column, Cell} = FixedDataTable;

var Dialog = require('nova-dialog')

var dialogRender = require('./dialog-wrap.jsx').render;
// import { dialogRender } from './dialog-wrap.jsx';


class DetailTable extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            selectedRowKeys: [],  // Check here to configure the default column
            value: '',
            focus: false,
            tableWidth: 1000
        };

    }

    componentWillReceiveProps(nextProps) {
        const { rootTableListData } = this.props
        if (this.props !== nextProps &&
            typeof nextProps.rootTableListData !== 'undefined') {
            this.setState({
                rootTableListData: nextProps.rootTableListData
            })
        }
    }

    componentDidMount () {
        var tableDiv = document.getElementById('table-wrap');
        var tableWidth = tableDiv.clientWidth
        const { rootTableListData } = this.props

        this.setState({
            tableWidth: tableWidth,
            rootTableListData: rootTableListData
        })
    }

    componentWillUnmount() {
        store.dispatch({type: 'GETROOTTABLEDATA', rootTableListData: this.props.rootTableListData})
    }
    
    _callback (data) {
        if (typeof data !== 'undefined') {
            store.dispatch({type: 'GETROOTTABLEDATA', rootTableListData: data.rootTableListData, rootCheckedKeys: data.rootCheckedKeys})
        }
    }

    _onCellChange (record) {
        const { roleTreeData, rootTableListData, rootCheckedKeys } = this.props
        let roleRootEditItem = []
        roleRootEditItem.push(record)
        dialogRender({dialogData: {roleRootEditItem: roleRootEditItem, rootEditType: 3, roleTreeData: roleTreeData}, rootTableListData: rootTableListData, rootCheckedKeys: rootCheckedKeys}, this._callback)
        // store.dispatch({type: 'CHANGE_ROOTDIALOG_OPEN', rootDialogOpen: true, editItem: {isEdit: true, data: record, editType: 3}})
    }

    _onRolesNameCellChange (text, record, i) {
        let userId = record.userId
        let roleDetail = {}
        if (typeof text !== 'undefined' && typeof text[i] !== 'undefined') {
            roleDetail = {
                roleName: text[i].name,
                roleType: text[i].roleType,
                roleID: text[i].roleID,
                desc: text[i].desc,
                isReserved: text[i].isReserved
            }
            let listRoleDetail = roleDetail
            listRoleDetail.isOpen = true
            if (this.props.updataRoleDetail) {
                this.props.updataRoleDetail(listRoleDetail)
            }
        }
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

    _getColumText (text, record, index) {
        let value = this.state.value;
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

    _getColums () {
        let column = [{
            title: '姓名',
            dataIndex: 'userName',
            key: 'name',
            fixed: 'left',
            width: 100,
            filtered: true,
            filteredValue: this.state.value,
            render: (text, record, index) => (
                this._getColumText(text, record, index)
            )
        }, {
            title: '性别',
            dataIndex: 'gender',
            fixed: 'left',
            key: 'gender',
            width: 60,
            filtered: true,
            filteredValue: this.state.value,
            render: (text, record, index) => (
                this._getColumText(text, record, index)
            )
        }, {

            title: '拥有角色',
            dataIndex: 'roleName',
            key: '1',
            className: 'td-word',
            width: 'auto',
            render: (text, record, index) => (
                <span
                    className="rolesname-title-wrap"
                >
                    {_.map(text, function(textItem, i) {
                        // let maxwidth = `${100 / text.length}%`
                        let colors = this._getTagColor(textItem.roleType)
                        let value = this.state.value
                        const index = textItem.name.search(value);
                        const beforeStr = textItem.name.substr(0, index);
                        const afterStr = textItem.name.substr(index + value.length);

                        return (
                            <span
                                className="rolesname-title"
                            >
                                <Tag
                                    onClick={() => this._onRolesNameCellChange(text, record, i)}
                                    color={colors.color}
                                 >
                                    {
                                        index > -1 ? 
                                            <span style={{color: colors.fontColor}}>
                                                {beforeStr}
                                                <span style={{ color: '#ff009c', fontWeight: '900', backgroundColor: '#fafafa'}}>{value}</span>
                                                {afterStr}
                                            </span> :
                                            <span style={{color: colors.fontColor}}>{textItem.name}</span>
                                    }
                                 </Tag>
                            </span>
                        )
                    }, this)}
                </span>
            ),
            filtered: true,
            filteredValue: this.state.value
        }, {
            title: '部门',
            dataIndex: 'departmentName',
            fixed: 'right',
            key: 'departmentName',
            width: 180,
            filtered: true,
            filteredValue: this.state.value,
            render: (text, record, index) => (
                // this._getColumText(text, record, index)
                <span>
                    {_.map(text, function (textItem, i) {
                        let value = this.state.value
                        let indexValue = textItem.search(value);
                        let beforeStr = textItem.substr(0, indexValue);
                        let afterStr = textItem.substr(indexValue + value.length);
                        let line = i < (text.length -1) ?
                                    <span style={{padding: '0 8px'}}>/</span> : ''
                        return (
                            
                                indexValue > -1 ?
                                <span>
                                    {beforeStr}
                                    <span  style={{ color: '#ff009c', fontWeight: '900', backgroundColor: '#fafafa'}}>{value}</span>
                                    {afterStr}
                                    {line}
                                </span> :
                                <span>
                                    {textItem}
                                    {line}
                                </span>
                            
                        )
                    }, this)}
                </span>
            )
        }, {
            title: '修改',
            dataIndex: 'operateType',
            fixed: 'right',
            key: 'edit',
            width: 60,
            render: (text, record, index) => (
                <span
                    onClick={() => this._onCellChange(record)}
                >
                    <span className="fa fa-edit table-edit-icon"></span>
                </span>
            ),
            filtered: true,
            filteredValue: this.state.value
        }];
        return column
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

    _handleRootDialogOpen () {
        let selectedData = this._getSelectedTableData(this.props.rootTableListData, 'isSelected', 'isChecked')
        // let checkedData = this._getSelectedTableData(this.props.rootTableListData, 'isChecked')

        if (selectedData.length > 0) {
            /*let rootDialogOpen = true
            store.dispatch({type: 'CHANGE_ROOTDIALOG_OPEN', rootDialogOpen: rootDialogOpen, editItem: {isEdit: true, data: selectedData, editType: type}})*/
            const { roleTreeData, rootTableListData, rootCheckedKeys } = this.props
            let rootEditType = selectedData.length === 1 ? 3 : 1
            dialogRender({dialogData: {roleRootEditItem: selectedData, rootEditType: rootEditType, roleTreeData: roleTreeData}, rootTableListData: rootTableListData, rootCheckedKeys: rootCheckedKeys}, this._callback)
        } else {
            Notify.show({
                title: i18n.t('info.notify-choose-role'),
                type: "info"
            });
        }
    }

    _onSelectChange (selectedRowKeys) {
        let rootTableListData = this._getSelectedTableDataFalse(this.state.rootTableListData, 'isSelected', false)

        if (selectedRowKeys.length > 0) {
            for (let i = 0; i < selectedRowKeys.length; i++) {
                for (let k = 0; k < rootTableListData.length; k++) {
                    if (rootTableListData[k].key === selectedRowKeys[i]) {
                        rootTableListData[k].isSelected = true
                    }
                }

            }
            /*store.dispatch({type: 'GETROOTTABLEDATA', rootTableListData: rootTableListData})*/
            this.setState({
                rootTableListData: rootTableListData
            })
        }

        this.setState({
            selectedRowKeys
        });
    }

    _handleFocusBlur(e) {
        this.setState({
            focus: e.target === document.activeElement,
        });
    }

    _getFilterRoleName (rolesName, value) {
        let isFilter = false
        for (let j = 0; j < rolesName.length; j++) {
            if (rolesName[j].name.indexOf(value) > -1) {
               isFilter = true 
            }
            
        }
        return isFilter
    }

    _getSelectedTableDataFalse (data, type, isFalse, type2) {
        if (typeof data !== 'undefined' &&
         typeof type !== 'undefined' &&
         typeof isFalse !== 'undefined' &&
         data.length > 0) {
            for (let i = 0; i < data.length; i++) {
                if (typeof type2 !== 'undefined' && data[i][type2]) {
                    data[i][type] = isFalse
                } else {
                    data[i][type] = isFalse                    
                }
            }
        }
        return data
    }

    _handleSearch(e) {
        // let rootTableListData = this._getSelectedTableDataFalse(this.state.rootTableListData, 'isSelected', false)
        let rootTableListData = this.props.rootTableListData
        let value = e.target.value
        let selectedRowKeys = []
        let saveRootTableListData = []
        if (value !== '' && this._getSelectedTableData(rootTableListData, 'isChecked').length > 0) {
            for (let i = 0; i < rootTableListData.length; i++) {
                if ((typeof rootTableListData[i].userName !== 'undefined'  && rootTableListData[i].userName !== '' && rootTableListData[i].userName.indexOf(value) > -1) ||
                    (typeof rootTableListData[i].gender !== 'undefined' && rootTableListData[i].gender !== '' && rootTableListData[i].gender.indexOf(value) > -1) ||
                    (typeof rootTableListData[i].departmentName !== 'undefined' && rootTableListData[i].departmentName !== '' && rootTableListData[i].departmentName.indexOf(value) > -1) ||
                    (typeof rootTableListData[i].roleName !== 'undefined' &&  rootTableListData[i].roleName.length > 0 && this._getFilterRoleName(rootTableListData[i].roleName, value))) {
                    selectedRowKeys.push(rootTableListData[i].key)
                    // rootTableListData[i].isSelected = true
                    saveRootTableListData.push(rootTableListData[i])
                }
            }
            // store.dispatch({type: 'GETROOTTABLEDATA', rootTableListData: saveRootTableListData})
            this.setState({
                rootTableListData: saveRootTableListData
            })
            
        } else {
            this.setState({
                rootTableListData: this.props.rootTableListData
            })
        }
        this.setState({
            value: value,
        });

    }

    _getRoleName (roledetail) {
        let roleName = ''
        if (typeof roledetail !== 'undefined' &&
            typeof roledetail.roleName !== 'undefined' &&
            roledetail.roleName.length > 0) {
            roleName = (
                <span
                    className="rolesname-title-wrap"
                >
                    {_.map(roledetail.roleName, function(textItem, i) {
                        // let maxwidth = `${100 / text.length}%`
                        let colors = this._getTagColor(textItem.roleType)
                        let value = this.state.value
                        const index = textItem.name.search(value);
                        const beforeStr = textItem.name.substr(0, index);
                        const afterStr = textItem.name.substr(index + value.length);

                        return (
                            <span
                                className="rolesname-title"
                            >
                                <Tag
                                    onClick={() => this._onRolesNameCellChange(roledetail.roleName, roledetail, i)}
                                    color={colors.color}
                                 >
                                    {
                                        index > -1 ? 
                                            <span style={{color: colors.fontColor}} className="tag-role-title">
                                                {beforeStr}
                                                <span style={{ color: '#ff009c', fontWeight: '900', backgroundColor: '#fafafa'}}>{value}</span>
                                                {afterStr}
                                            </span> :
                                            <span style={{color: colors.fontColor}}>{textItem.name}</span>
                                    }
                                 </Tag>
                            </span>
                        )
                    }, this)}
                </span>
            )
        }
        return roleName
    }

    _handleCellChange (item, index, e) {
        let rootTableListData = this.state.rootTableListData
        let isSelected = e.target.checked
        for (let i = 0; i < rootTableListData.length; i++) {
            if (item.key === rootTableListData[i].key) {
                rootTableListData[i].isSelected = isSelected
            }
        }
        this.setState({
            rootTableListData: rootTableListData
        })
    }

    _handleCellChangeAll (e) {
        let isSelected = e.target.checked
        let rootTableListData = this._getSelectedTableDataFalse(this.state.rootTableListData, 'isSelected', isSelected, 'isChecked')
        this.setState({
            rootTableListData: rootTableListData
        })
    }

    _getcheckedAll () {
        let checked = true
        let rootTableListData = this.state.rootTableListData
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

	render() {
        const { height } = this.props
        const { rootTableListData, tableWidth } = this.state
        var selectedData = this._getSelectedTableData(rootTableListData, 'isChecked')

        const { selectedRowKeys } = this.state;
        const btnCls = classNames({
            'ant-search-btn': true,
            'ant-search-btn-noempty': !!this.state.value.trim(),
        });
        const searchCls = classNames({
            'ant-search-input': true,
            'ant-search-input-focus': this.state.focus,
        });

        const rowSelection = {
            selectedRowKeys,
            onChange: this._onSelectChange.bind(this),
            selections: [{
                key: 'odd',
                text: 'Select Odd Row',
                onSelect: (changableRowKeys) => {
                    let newSelectedRowKeys = [];
                    newSelectedRowKeys = changableRowKeys.filter((key, index) => {
                        if (index % 2 !== 0) {
                            return false;
                        }
                        return true;
                    });
                    this.setState({
                        selectedRowKeys: newSelectedRowKeys
                    });
                },
            }, {
                key: 'even',
                text: 'Select Even Row',
                onSelect: (changableRowKeys) => {
                    let newSelectedRowKeys = [];
                    newSelectedRowKeys = changableRowKeys.filter((key, index) => {
                        if (index % 2 !== 0) {
                            return true;
                        }
                        return false;
                    });
                    // this.state.selectedRowKeys = newSelectedRowKeys
                    this.setState({newSelectedRowKeys: newSelectedRowKeys})
                },
            }],
            onSelection: this.onSelection,
        };

		return (
			<div className="toor-table-wrap">
            	<div className="table-top-wrap">
                    <Button
                        onClick={this._handleRootDialogOpen.bind(this)}
                        type="primary"
                        size="large"
                        disabled={selectedData.length === 0}
                    >
                        批量修改
                    </Button>
                    <div className="ant-search-input-wrapper" style={{float: 'right', width: '200px'}}>
                        <InputGroup
                            className={searchCls}>
                            <Input
                                placeholder="搜索..."
                                value={this.state.value}
                                onChange={this._handleSearch.bind(this)}
                                onFocus={this._handleFocusBlur.bind(this)}
                                onBlur={this._handleFocusBlur.bind(this)}
                                onPressEnter={this._handleSearch.bind(this)}
                                size="small"
                            />
                            {/*<div className="ant-input-group-wrap">
                                <Button
                                    style={{height: '38px'}}
                                    icon="search"
                                    className={btnCls}
                                    size={'large'}
                                    onClick={this._handleSearch.bind(this)}
                                />
                            </div>*/}
                        </InputGroup>
                    </div>
                </div>
                <div
                    id="table-wrap"
                    className="root-table-content"
                    style={{height: `${height - 52}px`, overflow: 'hidden'}}
                >
                    <TableContent
                        data={selectedData}
                        value={this.state.value}
                        onRolesNameCellChange={this._onRolesNameCellChange.bind(this)}
                        handleCellChangeAll={this._handleCellChangeAll.bind(this)}
                        handleCellChange={this._handleCellChange.bind(this)}
                        onCellChange={this._onCellChange.bind(this)}
                    />
                    {/*<Table
                        rowSelection={rowSelection}
                        columns={this._getColums()}
                        size="small"
                        dataSource={selectedData}
                        rowKeyv={'userId'}
                        scroll={{x: 3000, y: (height - 200)}}
                        pagination={false}
                        selectedRowKeys={selectedRowKeys}
                    />*/}
                    {/*<Table
                        rowHeight={40}
                        headerHeight={40}
                        rowsCount={selectedData.length}
                        width={tableWidth}
                        overflowX="auto"
                        height={height - 52}>
                        <Column
                            header={<Cell>
                                        <Checkbox
                                            onChange={this._handleCellChangeAll.bind(this)}
                                            checked={this._getcheckedAll()}
                                        />
                                    </Cell>}
                            cell={props => (
                                <Cell {...props}>
                                    <Checkbox 
                                        checked={selectedData[props.rowIndex].isSelected}
                                        onChange={this._handleCellChange.bind(this, selectedData[props.rowIndex], props.rowIndex)}
                                    />
                                </Cell>
                            )}
                            fixed={true}
                            width={50}
                        />
                        <Column
                            header={<Cell>姓名</Cell>}
                            cell={props => (
                                <Cell {...props}>
                                    {this._getColumText(selectedData[props.rowIndex].userName)}
                                </Cell>
                            )}
                            fixed={true}
                            width={100}
                        />
                        <Column
                            header={<Cell>角色</Cell>}
                            cell={props => (
                                <Cell {...props}>
                                    {this._getRoleName(selectedData[props.rowIndex])}
                                </Cell>
                            )}
                            width={(tableWidth - 610)}
                        />
                        <Column
                            header={<Cell>部门</Cell>}
                            cell={props => (
                                <Cell {...props}>
                                    {selectedData[props.rowIndex].departmentName}
                                </Cell>
                            )}
                            width={400}
                        />
                        <Column
                            header={<Cell>修改</Cell>}
                            cell={props => (
                                <Cell {...props}>
                                    <span
                                        onClick={() => this._onCellChange(selectedData[props.rowIndex])}
                                    >
                                        <span className="fa fa-edit table-edit-icon"></span>
                                    </span>
                                </Cell>
                            )}
                            width={60}
                        />
                    </Table>*/}
                </div>
			</div>
		)
	}
}

export default DetailTable


