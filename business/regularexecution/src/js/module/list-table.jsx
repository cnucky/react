import React from 'react';
import {render} from 'react-dom';
import {store} from './store';
// import FixedDataTable from 'fixed-data-table';
import { Checkbox, Table, Button } from 'antd';
initLocales(require.context('../../locales/regular', false, /\.js/), 'zh');
var Notify = require('nova-notify');
var bootbox = require('nova-bootbox-dialog')
// const { Column, Cell } = FixedDataTable;
// require('fixed-data-table/dist/fixed-data-table.min.css');

var dialogRender = require('./dialog-wrap.jsx').render;

class ListTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedRowKeys: ''
        }
        
    }


    componentWillReceiveProps(nextProps) {

    }

    componentDidMount() {
        var tableDiv = document.getElementById('table-wrap');
        var tableWidth = tableDiv.clientWidth
    }

    _callback () {
        var listData = []
        $.getJSON("/regularexecution/regularexecution/schemesummarylist", function(rsp) {
            if (rsp.code == 0) {
                listData = rsp.data;
            }
            store.dispatch({type: 'GET_SCHEMESUMMARYLIST', schemesummaryList: listData})
        });
    }

    _handleItemEdit (record, index, e) {
        dialogRender({editType: 'edit', editItem: record}, this._callback)
        e.stopPropagation();
    }

    _getColumns () {
        let columns = [{
            title: '策略',
            dataIndex: 'schemeName',
            className: 'schemeName'
        }, {
            title: '模型',
            dataIndex: 'modelFullName',
            className: 'modelName'
        }, {
            title: '状态',
            dataIndex: 'enable',
            render: (text, record, index) => (
                text === 1 ? <span>运行中</span> :
                            <span>停止</span>
            ),
            className: 'enable'
        }, {
            title: '任务名称',
            dataIndex: 'taskNamePre',
            className: 'taskNamePre'
        }, {
            title: '起止日期',
            dataIndex: 'startDate',
            render: (text, record, index) => (
                <span>
                    <span>{record['startDate']}</span>
                    <span className="spance10">至</span>
                    <span>{record['endDate']}</span>
                </span>
            ),
            className: 'startDate'
        }, {
            title: '运行时间',
            dataIndex: 'executeTime',
            className: 'executeTime'
        }, {
            title: '任务路径',
            dataIndex: 'taskPath',
            className: 'taskPath'
        }, {
            title: '创建时间',
            dataIndex: 'createTime',
            className: 'createTime'
        },{
            title: '操作',
            dataIndex: 'operate',
            render: (text, record, index) => (
                <span>
                    {record.enable === 0 ? <span
                        onClick={this._startClick.bind(this, record, 'start')}
                        className="cursorP operate-title glyphicon glyphicon-play"
                        title="运行"
                    >
                    </span> :
                    <span
                        onClick={this._startClick.bind(this, record, 'stop')}
                        className="cursorP operate-title glyphicon glyphicon-pause"
                        title="停止"
                    >
                    </span>}
                    <span
                        className="cursorP operate-title paddingLeft10 glyphicon glyphicon-edit"
                        onClick={this._handleItemEdit.bind(this, record, index)}
                        title="编辑"
                    >
                    </span>
                    <span
                        onClick={this._startClick.bind(this, record, 'delete')}
                        className="cursorP operate-title paddingLeft10 glyphicon glyphicon-trash"
                        title="删除"
                    >
                    </span>
                </span>
            ),
            className: 'operate'
        }]
        return columns
    }

    _onSelectChange (selectedRowKeys) {
        this.setState({
            selectedRowKeys: selectedRowKeys
        })
    }

    _handleRowClick (record, index) {
        let schemeId = record.schemeId
        var tasksummarylist = []
        $.getJSON("/regularexecution/regularexecution/getTaskListBySchemeId", {schemeId: schemeId}, function(rsp) {
            if (rsp.code == 0) {
                tasksummarylist = rsp.data;
                store.dispatch({type: 'GET_TASKSUMMARYLIST', tasksummarylist: tasksummarylist, showDetailTable: true})
            } else {
                store.dispatch({type: 'GET_TASKSUMMARYLIST', tasksummarylist: [], showDetailTable: true})
            }
        })
        .error(function (err) {
            // console.log(err, 'err')
        });
    }

    _handleAddClick () {
        dialogRender({editType: 'add'}, this._callback)
    }

    _startClick (record, type, e) {
        const { schemesummaryList } = this.props
        const { selectedRowKeys } = this.state

        let schemeIds = []
        let enable
        switch (type) {
            case 'start':
                enable = 1
                break
            case 'stop':
                enable = 0
                break
            case 'delete':
                enable = 2
        }
        
        if (record === 'all') {
            for (let i = 0; i < schemesummaryList.length; i++) {
                if (selectedRowKeys.indexOf(schemesummaryList[i].key) > -1) {
                    schemeIds.push(schemesummaryList[i].schemeId)
                }
            }
        } else {
            schemeIds[0] = record.schemeId
        }
        var msg = enable === 1 ?
            (record === 'all' ? 'info.startAllMsg' : 'info.startMsg') :
            (enable === 0 ? (record === 'all' ? 'info.stopAllMsg' : 'info.stopMsg') :
            (record === 'all' ? 'info.deleteAllMsg' : 'info.deleteMsg'))
        var submitData = {}
        var url = ''
        if (type === 'delete') {
            submitData = {
                schemeIds: schemeIds
            }
            url = 'deleteExecuteScheme'
        } else {
            submitData = {
                schemeIds: schemeIds,
                enable: enable
            }
            url = 'enableScheme'
        }

        var backmsgSuccess = enable === 1 ?
            (record === 'all' ? 'info.startAllMsgSuccess' : 'info.startMsgSuccess') :
            (enable === 0 ? (record === 'all' ? 'info.stopAllMsgSuccess' : 'info.stopMsgSuccess') :
            (record === 'all' ? 'info.deleteAllMsgSuccess' : 'info.deleteMsgSuccess'))
        var backmsgFail = enable === 1 ?
            (record === 'all' ? 'info.startAllMsgFail' : 'info.startMsgFail') :
            (enable === 0 ? (record === 'all' ? 'info.stopAllMsgFail' : 'info.stopMsgFail') :
            (record === 'all' ? 'info.deleteAllMsgFail' : 'info.deleteMsgFail'))
        bootbox.confirm(i18n.t(msg), function(rlt) {
            if (rlt) {
                $.post('/regularexecution/regularexecution/' + url, submitData, function (rsp) {
                    let rspData = JSON.parse(rsp)
                    // console.log(rsp, 'rsp')
                    if (rspData.code === 0 || rsp.code === 0) {
                        Notify.show({
                            title: i18n.t(backmsgSuccess),
                            type: "success"
                        })
                    } else {
                        Notify.show({
                            title: i18n.t(backmsgFail),
                            type: "error"
                        })
                    }
                })
                .done(function (rsp) {
                    var listData = []
                    $.getJSON("/regularexecution/regularexecution/schemesummarylist", function(rsp) {
                        if (rsp.code == 0) {
                            listData = rsp.data;
                        }
                        store.dispatch({type: 'GET_SCHEMESUMMARYLIST', schemesummaryList: listData})
                    });
                })
            }
        })
        e.stopPropagation();
    }

    _getRowClassName (record, index) {
        return 'list-table-row'
    }

    render() {
        const { schemesummaryList, height } = this.props
        const { selectedRowKeys } = this.state
        const rowSelection = {
            selectedRowKeys,
            onChange: this._onSelectChange.bind(this)
        }

        return (
            <div className="list-table-content" id="table-wrap" style={{height: '100%'}}>
                <div className="list-btn-wrap">
                    <Button
                        onClick={this._handleAddClick.bind(this)}
                        type="primary"
                        style={{marginRight: '10px'}}
                    >
                        新建
                    </Button>
                    <Button
                        onClick={this._startClick.bind(this, 'all', 'start')}
                        type="primary"
                        style={{marginRight: '10px'}}
                        disabled={selectedRowKeys.length === 0}
                    >
                        运行
                    </Button>
                    <Button
                        onClick={this._startClick.bind(this, 'all', 'stop')}
                        type="primary"
                        style={{marginRight: '10px'}}
                        disabled={selectedRowKeys.length === 0}
                    >
                        停止
                    </Button>
                    <Button
                        onClick={this._startClick.bind(this, 'all', 'delete')}
                        type="primary"
                        disabled={selectedRowKeys.length === 0}
                    >
                        删除
                    </ Button>
                </div>
                <div className="list-table-contaner">
                    <Table
                        onRowClick={this._handleRowClick.bind(this)}
                        rowSelection={rowSelection}
                        columns={this._getColumns()}
                        dataSource={schemesummaryList}
                        pagination={{pageSize: 10}}
                        size="small"
                        scroll={{y: (height - 140)}}
                        rowClassName={this._getRowClassName}
                        bordered={true}
                    />
                </div>
            </div>
        )
    }
}

export default ListTable