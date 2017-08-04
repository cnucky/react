import React from "react";
import ReactDOM from "react-dom";
import {EditableTable} from "./charts-for-react";
import Notify from "nova-notify";
import {store} from "./store";
var manager = require('./bi-manager');
var MultiSelect = require('widget/multiselect');
var Dialog = require('nova-dialog');
var FancyTree = require('widget/fancytree');
var utils = require('nova-utils');

/** 数据源 */
var DataField = React.createClass({

    propTypes: {
        id: React.PropTypes.string.isRequired,
        chartType: React.PropTypes.string.isRequired,
        dataSourceInfo: React.PropTypes.object.isRequired
    },

    selectDataSource(identity, option) {
        let dataSourceId = option.val();
        let dataSource = _.find(store.getState().modelDetail.nodes, function(node) { return node.id === dataSourceId }.bind(this));
        /** 数据源节点或算子节点 */
        let dataSourceInfo = _.isUndefined(dataSource) ? undefined : (
            (dataSource.nodeType === 0) ? {
                id: dataSource.id,
                nodeType: dataSource.nodeType,
                centerCode: dataSource.origNode.detail.centerCode,
                typeId: dataSource.origNode.detail.typeId,
                zoneId: dataSource.origNode.detail.zoneId
            } : {
                id: dataSource.id,
                nodeType: dataSource.type
            }
        );

        store.dispatch({
            type: 'UPDATE_CHART',
            id: this.props.id,
            dataSourceInfo: dataSourceInfo,
            dimension: [],
            measure: this.props.chartType === 'COMMONTABLE' ? 200 : [],
            data: [],
            defineData: []
        });
    },

    render() {
        var configType = {
            disableIfEmpty: false,
            enableFiltering: true,
            buttonClass: 'multiselect dropdown-toggle btn btn-info fw600 fs13 mnw50 multiselect-search text-ellipsis',
            buttonWidth: '100%'
        };

        var data = [{ label:'无', value:-1, selected:_.isUndefined(this.props.dataSourceInfo) }];
        var modelDetail = store.getState().modelDetail;
        if(modelDetail.nodes) {
            modelDetail.nodes.forEach(function(node) {
                data.push({
                    label: node.name,
                    value: node.id,
                    selected: _.isUndefined(this.props.dataSourceInfo) ? false : (node.id === this.props.dataSourceInfo.id)
                })
            }.bind(this))
        }

        return (
            <div className="form-group">
                <label className="col-md-4 control-label" style={{textAlign:'left', marginLeft:'20px', fontWeight:'normal'}}>数据源</label>
                <div className="col-md-6 ml10 ">
                    <MultiSelect config={configType} updateData={true} data={data} onChange={this.selectDataSource} />
                </div>
            </div>
        );
    }
})


/** 定义数据 */
function cancel() {
    Dialog.dismiss();
}

function confirm(id, rows, queryFields, dataSourceInfo) {
    var _rows = [];
    rows.forEach(function(row) {
        let existFilledCell = false;
        for(var key in row) {
            if(row[key] != "") {
                existFilledCell = true;
                break;
            }
        }

        if(existFilledCell) {
            delete row.id;
            _rows.push(row);
        }
    })

    let taskId = utils.getURLParameter('taskid') === null ? -1 : Number(utils.getURLParameter('taskid'));    
    manager.quertReportData(taskId, queryFields, _rows, dataSourceInfo).then(function(data) {
        store.dispatch({ type:'UPDATE_CHART', id:id, defineData: _rows, data:data });                        
    }.bind(this));
    Dialog.dismiss();
}

function updateRows(rows) {
    this.rows = rows;
}

function showDialog(id, columns, rows, queryFields, dataSourceInfo) {

    Dialog.build({
        title: "自定义数据",
        content: '<div id=\'editable-table-container\' style=\'overflow:auto;\' />',
        width: 800,
        minHeight: 400,
        hideFooter: false,
        leftBtnCallback: cancel,
        rightBtnCallback: (function(id, rows) { 
            return function() {
                confirm(id, rows, queryFields, dataSourceInfo);
            }
        })(id, rows, queryFields, dataSourceInfo)
    }).show(function() {
        ReactDOM.render(<EditableTable minWidth={765} columns={columns} rows={rows} callback={updateRows.bind(this)} />, document.getElementById('editable-table-container'));
    });
}


class DataContent extends React.Component {
    constructor(props) {
        super(props);
    }

    editData() {
        let id = this.props.id;

        if(this.props.dataSourceInfo) {
            let nodesOutput = store.getState().modelDetail.nodesOutput[this.props.dataSourceInfo.id];
            let columns = _.map(nodesOutput, function(item) {
                return { key:item.aliasName, name:item.displayName, editable:true };
            })
            let rows = _.map(this.props.defineData, function(item) { return $.extend(true, {}, item); });
            let fieldNodes = this.props.dimension.concat(this.props.measure);
            let queryFields = _.map(fieldNodes, function(item) { return item.aliasName });

            showDialog(id, columns, rows, queryFields, this.props.dataSourceInfo);
        }
        else {
            let taskId = utils.getURLParameter('taskid');

            if (!taskId){
                Notify.simpleNotify("未知数据源", "请先选择你需要操作的任务", 'error');
            } else {
                Notify.simpleNotify("未知数据源", "请先选择数据源节点", 'error');
            }


        }
    }

    render() {
        let defineLength = this.props.defineData.length;
        let btn_hint = defineLength > 0 ? "已添加" + defineLength + "条" : "添加";
        let taskId = utils.getURLParameter('taskid') ? utils.getURLParameter('taskid') : store.getState().taskId;
        let modelId = utils.getURLParameter('modelid')

        return (
            <div className={"form-group " + (taskId || !modelId? 'hidden': '')}>
                <label className="col-md-4 control-label" style={{textAlign:'left', marginLeft:'20px', fontWeight:'normal'}}>自定义数据</label>
                <div className="col-md-6 ml10">
                    <button type="button" className="btn btn-info fw600 fs13 mnw50" style={{width:'100%'}} onClick={()=>this.editData()}>{btn_hint}</button>
                </div>
            </div>
        );
    }
}


/** 维度 */
var Dimension = React.createClass({

    propTypes: {
        chartType: React.PropTypes.string.isRequired,
        id: React.PropTypes.string.isRequired,
        dimension: React.PropTypes.array.isRequired,        /** the dimensions which are selected */
        measure: React.PropTypes.array.isReasonable,
        data: React.PropTypes.array.isReasonable,
        defineData: React.PropTypes.array.isReasonable,
        dataSourceInfo: React.PropTypes.object.isRequired
    },

    getInitialState: function() {
        return { hide: false };
    },



    toggleTree: function() {
        this.setState({ hide: !this.state.hide });
    },

    isSelected: function(aliasName) {
        for(var item of this.props.dimension) {
            if(item.aliasName === aliasName)
                return true;
        }
        return false;
    },
    removeSelected: function (aliasName) {
        /** store内容副本 */
        let _dimension = this.props.dimension.slice(0);
        let _data = _.map(this.props.data, function(item) { return $.extend(true, {}, item); });

        _dimension.splice(_.findIndex(_dimension, function(item) { return item.aliasName === aliasName }), 1)
        _.each(_data, function(item) { delete item[aliasName]; })
        store.dispatch({ type:'UPDATE_CHART', id:this.props.id, data:_data, dimension:_dimension });
    },

    /** 判断维度数量是否越过上限 */
    isReasonable(dimensionLength, measureLength) {
        switch(this.props.chartType) {
            case 'LINE':
            case 'AREALINE':
                if ((dimensionLength === 1 && measureLength === 1) || (dimensionLength === 1 && measureLength === 2) || (dimensionLength === 2 && measureLength === 1))
                    return { result: true };
                else if(dimensionLength === 3)
                    return { result: false, message: "线图最多支持2个维度，1个度量" };
                else if(measureLength + dimensionLength > 3)
                    return { result: false, message: "线图最多支持1个维度，2个度量" };
                else
                    return { result: false };
            case 'BAR':
            case 'HORIZONTALBAR':
                if ((dimensionLength === 1 && measureLength === 1) || (dimensionLength === 1 && measureLength === 2) || (dimensionLength === 2 && measureLength === 1))
                    return { result: true };
                else if(dimensionLength === 3)
                    return { result: false, message: "柱图最多支持2个维度，1个度量" }; 
                else if(measureLength + dimensionLength > 3)
                    return { result: false, message: "柱图最多支持1个维度，2个度量" };
                else
                    return { result: false };
            case 'PIE':
                if (dimensionLength === 1 && measureLength === 1)
                    return { result: true };
                else if(dimensionLength >= 2)
                    return { result: false, message: "饼图仅支持1个维度，1个度量" };
                else
                    return { result: false };
            case 'RADAR':
                if ((dimensionLength === 1 && measureLength >= 1) || (dimensionLength === 2 && measureLength === 1))
                    return { result: true };
                else if(dimensionLength === 2 && measureLength >= 2)
                    return { result: false, message: "雷达图最多支持1个维度，多个度量" };                     
                else if(dimensionLength > 2)
                    return { result: false, message: "雷达图最多支持2个维度，1个度量" };
                else
                    return { result: false };
            case 'BUBBLE':
                if((dimensionLength >= 1 && dimensionLength <= 2) && (measureLength >= 1 && measureLength <= 2))
                    return { result: true };
                else if(dimensionLength + measureLength >= 3)
                    return { result: false, message: "气泡图最多支持2个维度，2个度量" };
                else
                    return { result: false };
            case 'WORDCLOUD':
                if (dimensionLength === 1 && measureLength === 1)
                    return { result: true };
                else if(dimensionLength >= 2)
                    return { result: false, message: "词云图仅支持1个维度，1个度量" };
                else
                    return { result: false };
            case 'MAP':
                if (dimensionLength === 1 && measureLength === 1)
                    return { result: true };
                else if(dimensionLength >= 2)
                    return { result: false, message: "热力地图仅支持1个(地理)维度，1个度量" };
                else
                    return { result: false };
            case 'SCATTER':
                if (dimensionLength === 2 && measureLength === 1)
                    return { result: true };
                else if(dimensionLength > 2)
                    return { result: false, message: "散点地图仅支持2个(地理)维度，1个度量" };
                else
                    return { result: false };
            case 'CROSSTABLE':
               if (dimensionLength === 2 && measureLength === 1)
                    return { result: true };
                else if(dimensionLength > 2)
                    return { result: false, message: "交叉表仅支持2个维度，1个度量" };
                else
                    return { result: false };
            default:
                return { result: true };
        }
    },

    render: function() {
        var fancytreeConfig = {
            filter: true,
            quicksearch: true,
            autoScroll: true,
            selectMode: 2,
            clickFolderMode: 1,
            activeVisible: true,

            source: function () {
                if(_.isUndefined(this.props.dataSourceInfo))
                    return [];
                else {
                    let nodesOutput = store.getState().modelDetail.nodesOutput[this.props.dataSourceInfo.id];
                    
                    let treeNodes = new Array();
                    !_.isUndefined(nodesOutput) && nodesOutput.forEach(function(nodeOutput, index) {
                        if (!_.contains(['int', 'bigint', 'double', 'decimal'], nodeOutput.columnType)) {
                            treeNodes.push({
                                title: nodeOutput.displayName,
                                tooltip: nodeOutput.displayName,
                                displayName: nodeOutput.displayName,
                                aliasName: nodeOutput.aliasName,
                                key: index,
                                selected: this.isSelected(nodeOutput.aliasName)
                            });
                        }
                    }.bind(this));
                    return treeNodes;
                }
            }.bind(this),
            iconClass: function (event, data) {
                if (data.node.folder) {
                    return "fa fa-folder fa-fw";
                } else {
                    return "fa fa-database fa-fw";
                }
            },

            select: function (event, data) {
                if(data.node.selected) {
                    /** 选取的tree节点的信息 */
                    let nodeInfo = data.node.data;
                    /** store内容的副本 */
                    let _dimension = this.props.dimension.slice(0);
                    let _data;
                    let check = true;

                    /** 判断维度度量是否合要求 */
                    let isReasonable = this.isReasonable(_dimension.length + 1, this.props.measure.length);
                    if(isReasonable.result) {
                        _dimension.push(nodeInfo);

                        /** 添加数据 */
                        let taskId = utils.getURLParameter('taskid') || store.getState().taskId  ?  Number(utils.getURLParameter('taskid')) || store.getState().taskId : -1;
                        console.log(taskId)
                        let fieldNodes = _dimension.concat(this.props.measure);
                        let fields = _.map(fieldNodes, function(item) { return item.aliasName });
                        manager.quertReportData(taskId, fields, this.props.defineData, this.props.dataSourceInfo).then(function(data) {
                            _data = data;


                            store.dispatch({ type:'UPDATE_CHART', id:this.props.id, data:_data, dimension:_dimension ,pagination:true });



                        }.bind(this));
                    }
                    else {
                        if(isReasonable.message) {
                            Notify.simpleNotify("维度数量不符合", isReasonable.message, 'error');
                            store.dispatch({ type:'UPDATE_CHART', id:this.props.id, dimension:_dimension });
                        }
                        else {
                            _dimension.push(nodeInfo);
                            store.dispatch({ type:'UPDATE_CHART', id:this.props.id, dimension:_dimension });
                        }
                    }
                }
                else {
                    /** 选取的树节点的信息 */
                    let nodeInfo = data.node.data;
                    /** store内容副本 */
                    let _dimension = this.props.dimension.slice(0);
                    let _data = _.map(this.props.data, function(item) { return $.extend(true, {}, item); });

                    _dimension.splice(_.findIndex(_dimension, function(item) { return item.aliasName === nodeInfo.aliasName }), 1)
                    _.each(_data, function(item) { delete item[nodeInfo.aliasName]; })
                    store.dispatch({ type:'UPDATE_CHART', id:this.props.id, data:_data, dimension:_dimension ,pagination:false});
                }
            }.bind(this)
        };
        return (
            <div className="form-group">
                <div className='row mn'>
                    <label className="col-md-4 control-label" style={{ textAlign: 'left', marginLeft: '20px', fontWeight:'normal' }}>维度</label>
                    <a href='javascript:void(0);' onClick={ this.toggleTree } style={{ float:'right', marginRight:'30px', lineHeight:'39px' }}>{ this.state.hide ? '展开' : '收起' }</a>
                </div>

                <div className='row mn' style={{ display:this.state.hide ? 'none' : 'inline' }}>
                    <div className="pb10" style={{border: '1px solid #DDDDDD', margin:'0 30px 0 30px', maxHeight:'200px', overflow:'auto'}}>
                        <FancyTree config={fancytreeConfig} forceReload={true}/>
                    </div>
                </div>

                <div className='row mn'>
                    <div style={{ marginLeft:30,marginTop:20 }}>
                        {
                            _.map(this.props.dimension, (item) =>
                                    <span className={"tm-tag tm-tag-info"} style={{ cursor:'pointer', display:this.state.hide ? 'none' : '' }}>
                                    <span>{item.displayName}</span>
                                    <a href="#" className='tm-tag-remove' onClick={(e) => this.removeSelected(item.aliasName, e)}>x</a>
                                </span>
                            )
                        }
                    </div>
                </div>

            </div>
        );
    }
});


/** 度量 */
var Measure = React.createClass({

    propTypes: {
        chartType: React.PropTypes.string.isRequired,
        id: React.PropTypes.string.isRequired,
        dimension: React.PropTypes.array.isRequired,        /** the dimensions which are selected */
        measure: React.PropTypes.array.isReasonable,
        data: React.PropTypes.array.isReasonable,
        defineData: React.PropTypes.array.isReasonable,
        dataSourceInfo: React.PropTypes.object.isRequired
    },

    getInitialState: function() {
        return { hide: false };
    },

    toggle: function() {
        this.setState({ hide: !this.state.hide });
    },

    isSelected: function(aliasName) {
        for(var item of this.props.measure) {
            if(item.aliasName === aliasName)
                return true;
        }
        return false;
    },

    numberInputChange: function(e) {
        var reg = /^(\d|[1-9]\d|1\d{2}|200)$/;
        var value = Number(e.target.value);
        if(reg.test(value))
            store.dispatch({ type:'UPDATE_CHART', id:this.props.id, measure:value });
        else
            Notify.simpleNotify("度量值越界", "请填写0~200间的整数", 'error');
    },
    removeSelected: function (aliasName) {
        /** store内容副本 */
        let _measure = this.props.measure.slice(0);
        let _data = _.map(this.props.data, function(item) { return $.extend(true, {}, item); });

        _measure.splice(_.findIndex(_measure, function(item) { return item.aliasName === aliasName }), 1);
        _.each(_data, function(item) { delete item[aliasName]; })
        store.dispatch({ type:'UPDATE_CHART', id:this.props.id, data:_data, measure:_measure });
    },

    /** 判断度量数量是否越过上限 */
    isReasonable(dimensionLength, measureLength) {
        switch(this.props.chartType) {
            case 'LINE':
            case 'AREALINE':
                if ((dimensionLength === 1 && measureLength === 1) || (dimensionLength === 1 && measureLength === 2) || (dimensionLength === 2 && measureLength === 1))
                    return { result: true };
                else if(measureLength === 3)
                    return { result: false, message: "线图最多支持1个维度，2个度量" };
                else if(measureLength + dimensionLength > 3)
                    return { result: false, message: "线图最多支持2个维度，1个度量" };
                else
                    return { result: false };
            case 'BAR':
            case 'HORIZONTALBAR':
                if ((dimensionLength === 1 && measureLength === 1) || (dimensionLength === 1 && measureLength === 2) || (dimensionLength === 2 && measureLength === 1))
                    return { result: true };
                else if(measureLength === 3)
                    return { result: false, message: "柱图最多支持1个维度，2个度量" }; 
                else if(measureLength + dimensionLength > 3)
                    return { result: false, message: "柱图最多支持2个维度，1个度量" };
                else
                    return { result: false };
            case 'PIE':
                if (dimensionLength === 1 && measureLength === 1)
                    return { result: true };
                else if(measureLength >= 2)
                    return { result: false, message: "饼图仅支持1个维度，1个度量" };
                else
                    return { result: false };
            case 'RADAR':
                if ((dimensionLength === 1 && measureLength >= 1) || (dimensionLength === 2 && measureLength === 1))
                    return { result: true };
                else if(dimensionLength === 2 && measureLength > 1)
                    return { result: false, message: "雷达图最多支持2个维度，1个度量" };
                else
                    return { result: false };
            case 'BUBBLE':
                if((dimensionLength >= 1 && dimensionLength <= 2) && (measureLength >= 1 && measureLength <= 2))
                    return { result: true };
                else if(dimensionLength + measureLength >= 3)
                    return { result: false, message: "气泡图最多支持2个维度，2个度量" };
                else
                    return { result: false };
            case 'WORDCLOUD':
                if (dimensionLength === 1 && measureLength === 1)
                    return { result: true };
                else if(measureLength >= 2)
                    return { result: false, message: "词云图仅支持1个维度，1个度量" };
                else
                    return { result: false };
            case 'MAP':
                if (dimensionLength === 1 && measureLength === 1)
                    return { result: true };
                else if(measureLength >= 2)
                    return { result: false, message: "热力地图仅支持1个(地理)维度，1个度量" };
                else
                    return { result: false };
            case 'SCATTER':
                if (dimensionLength === 2 && measureLength === 1)
                    return { result: true };
                else if(measureLength > 1)
                    return { result: false, message: "散点地图仅支持2个(地理)维度，1个度量" };
                else
                    return { result: false };
            case 'CROSSTABLE':
               if (dimensionLength === 2 && measureLength === 1)
                    return { result: true };
                else if(measureLength > 1)
                    return { result: false, message: "交叉表仅支持2个维度，1个度量" };
                else
                    return { result: false };
            default:
                return { result: true };
        }
    },

    render: function() {
        var fancytreeConfig = {
            filter: true,
            quicksearch: true,
            autoScroll: true,
            selectMode: 2,
            clickFolderMode: 1,
            activeVisible: true,

            source: function () {
                if(_.isUndefined(this.props.dataSourceInfo))
                    return [];
                else {
                    let nodesOutput = store.getState().modelDetail.nodesOutput[this.props.dataSourceInfo.id];

                    let treeNodes = new Array();
                    !_.isUndefined(nodesOutput) && nodesOutput.forEach(function(nodeOutput, index) {
                        if(_.contains(['int', 'bigint', 'double', 'decimal'], nodeOutput.columnType) && nodeOutput.codeTag == 0)
                            treeNodes.push({
                                title: nodeOutput.displayName,
                                tooltip: nodeOutput.displayName,
                                displayName: nodeOutput.displayName,
                                aliasName: nodeOutput.aliasName,
                                key: index,
                                selected: this.isSelected(nodeOutput.aliasName)
                            });
                    }.bind(this));
                    return treeNodes;
                }
            }.bind(this),
            iconClass: function (event, data) {
                if (data.node.folder) {
                    return "fa fa-folder fa-fw";
                } else {
                    return "fa fa-database fa-fw";
                }
            },
            select: function (event, data) {
                if(data.node.selected) {
                    /** 选取的tree节点的信息 */
                    let nodeInfo = data.node.data;
                    /** store内容的副本 */
                    let _measure = this.props.measure.slice(0);
                    let _data;

                    /** 判断度量选择数量是否合法 */
                    let isReasonable = this.isReasonable(this.props.dimension.length, _measure.length + 1);
                    if(isReasonable.result) {
                        _measure.push(nodeInfo);     
                        
                        let taskId = utils.getURLParameter('taskid') || store.getState().taskId  ?  Number(utils.getURLParameter('taskid')) || store.getState().taskId : -1;
                        let fieldNodes = _measure.concat(this.props.dimension);
                        let fields = _.map(fieldNodes, function(item) { return item.aliasName });
                        manager.quertReportData(taskId, fields, this.props.defineData, this.props.dataSourceInfo).then(function(data) { 
                            _data = data;
                            store.dispatch({ type:'UPDATE_CHART', id:this.props.id, data:_data, measure:_measure });
                        }.bind(this));
                    }
                    else {
                        if(isReasonable.message) {
                            Notify.simpleNotify("度量数量不符合", isReasonable.message, 'error');
                            store.dispatch({ type:'UPDATE_CHART', id:this.props.id, measure:_measure });                                                                                
                        }
                        else {
                            _measure.push(nodeInfo);     
                            store.dispatch({ type:'UPDATE_CHART', id:this.props.id, measure:_measure });                                                    
                        }                         
                    }
                }
                else {
                    /** 选取的树节点的信息 */
                    let nodeInfo = data.node.data;
                    /** store内容副本 */ 
                    let _measure = this.props.measure.slice(0);
                    let _data = _.map(this.props.data, function(item) { return $.extend(true, {}, item); });

                    _measure.splice(_.findIndex(_measure, function(item) { return item.aliasName === nodeInfo.aliasName }), 1);
                    _.each(_data, function(item) { delete item[nodeInfo.aliasName]; })
                    store.dispatch({ type:'UPDATE_CHART', id:this.props.id, data:_data, measure:_measure });
                }
            }.bind(this)
        };
        
        /** component */
        var tree = (
            <div className="pb10" style={{border: '1px solid #DDDDDD', margin:'0 30px 0 30px', maxHeight:'200px', overflow:'auto'}}>
                <FancyTree config={fancytreeConfig} forceReload={true}/>
            </div>
        );

        var numberInput = (
            <div style={{margin:'0 30px 0 30px'}}>
                <input className="form-control" type="number" min="0" max="200" value={this.props.measure} onChange={this.numberInputChange} />        
            </div>
        );

        return (
            <div className="form-group">
                <div className='row mn'>
                    <label className="col-md-4 control-label" style={{ textAlign: 'left', paddingTop:'0px', marginLeft: '20px', fontWeight:'normal', lineHeight:'39px' }}>度量</label>
                    { this.props.chartType !== 'COMMONTABLE' && <a href='javascript:void(0);' onClick={ this.toggle } style={{ float:'right', marginRight:'30px', lineHeight:'39px' }}>{ this.state.hide ? '展开' : '收起' }</a> }
                </div>

                <div className='row mn' style={{ display:this.state.hide ? 'none' : 'inline' }}>
                    { this.props.chartType === 'COMMONTABLE' ? numberInput : tree }
                </div>
                {
                    this.props.chartType !== 'COMMONTABLE' &&
                    (
                        <div className='row mn'>
                            <div style={{ marginLeft:30,marginTop:20 }}>
                                {
                                    _.map(this.props.measure, (item) =>
                                            <span className={"tm-tag tm-tag-info"} style={{ cursor:'pointer', display:this.state.hide ? 'none' : '' }}>
                                            <span>{item.displayName}</span>
                                             <a href="#" className='tm-tag-remove' onClick={(e) => this.removeSelected(item.aliasName, e)}>x</a>
                                        </span>
                                    )
                                }
                            </div>
                        </div>
                    )
                }

            </div>
        );
    }
});


/** export */
class DataSetting extends React.Component {

    constructor(props) {
        super(props);
        this.displayName = 'ComponentSetting';
    }

    render() {
        /** data @store */
        let id = this.props.id;
        let data = this.props.com.data;
        let defineData = this.props.com.defineData;

        let dataSourceInfo = this.props.com.dataSourceInfo;
        let chartType = this.props.com.chartType;
        let dimension = this.props.com.dimension;
        let measure = this.props.com.measure;

        return (
            <div>
                <DataField id={id} chartType={chartType} dataSourceInfo={dataSourceInfo} />
                <DataContent id={id} defineData={defineData} dimension={dimension} measure={measure} dataSourceInfo={dataSourceInfo} />
                <Dimension chartType={chartType} id={id} data={data} defineData={defineData} dimension={dimension} measure={measure} dataSourceInfo={dataSourceInfo} />
                <Measure chartType={chartType} id={id} data={data} defineData={defineData} dimension={dimension} measure={measure} dataSourceInfo={dataSourceInfo} />
            </div>
        );
    }
}

export default DataSetting;