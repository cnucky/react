var React = require('react');
var DragSource = require('react-dnd').DragSource;
var DropTarget = require('react-dnd').DropTarget;
var flow = require('lodash/flow');
var _ = require('underscore');
var $ = require('jquery');
var store = require('./model-apply-store');
var MultiSelect = require('widget/multiselect');
import BsDateTimePicker from 'widget/dateTimeWidget/datetimeRangePicker';
var Dialog = require('nova-dialog');
var FancyTree = require('widget/fancytree');
var subApply = require('./modelapply-manager').subApply;
var DSReplacement = require('../modeling/modeling-data-source-replacement');
require('./model-apply.less');
var utils = require('nova-utils');
var getAllData = require('./modelapply-manager').getAllData;
const Notify = require('nova-notify');
import { Tooltip, Row, Col} from 'antd';
import ValueInput from 'widget/value-input';
import Select from 'react-select';
import 'react-select/dist/react-select.css';

var dateTimeOpr = [{ key: 'equal', name: '等于', expert: true },
    { key: 'notEqual', name: '不等于', expert: true },
    { key: 'notLessThan', name: '起始于', expert: true },
    { key: 'notGreaterThan', name: '终止于', expert: true },
    { key: 'between', name: '在...之间' },
    { key: 'notBetween', name: '不在...之间' },
    { key: 'isNull', name: '为空', expert: true },
    { key: 'isNotNull', name: '不为空', expert: true }
]

/** styles */


const SPLIT_WORD = ',';
/** 标题头 */
var Header = React.createClass({
    render:function(){
        return(
            <h1 className="text-center" style={this.props.style}>{this.props.title || '模型名称'}</h1>

        )
    }
})
module.exports.Header = Header;







var Footer = React.createClass({
    propTypes: {
        index: React.PropTypes.number.isRequired
    },
    confirmColumnMapping() {
        let data = store.getState().data;
        let selectedSource = _.filter(data.nodes, (item) => item.selected);
        if (_.isEmpty(selectedSource)) {
            Notify.simpleNotify('提示', '请点击选择需要替换的数据源后再单击替换');
        } else {
            let type = selectedSource[0].detail.centerCode + selectedSource[0].detail.zoneId + selectedSource[0].detail.typeId;
            let typeErr = _.find(selectedSource, (item) => {
                let itemType = item.detail.centerCode + item.detail.zoneId + item.detail.typeId;
                return itemType != type;
            });
            if (typeErr) {
                Notify.show({
                    type: 'warning',
                    title: '错误',
                    text: '只有相同的数据源才能被同时替换'
                })
            } else {
                let outputList = [];
                _.each(selectedSource, (item) => {
                    Array.prototype.push.apply(outputList, item.detail.outputColumnDescList);
                });
                outputList = _.uniq(outputList, (item) => item.aliasName);
                //console.log(outputList);
                DSReplacement.render(outputList, (data) => {
                    //console.log(data);
                    store.dispatch({
                        type: 'ADD_MAPPING',
                        data: {
                            nodeData: data,
                            selectedSource: selectedSource
                        }
                    });
                })
            }
        }
    },
    submitValues() {
        subApply();

    },
    tagClick(e) {
        var key = $(e.currentTarget).attr('data-id');
        store.dispatch({
            type: 'CHANGE_KEY',
            key: key
        });
    },
    removeColumnMapping(nodeId, e) {
        e.stopPropagation();
        store.dispatch({
            type: 'REMOVE_MAPPING',
            key: nodeId
        });
    },
    render: function() {
        var data = store.getState().data;
        var solidId = data.solidId || utils.getURLParameter('solidid');
        var nodes = data.nodes;
        return (
            <div className='app-component ph30 pv20'>
                <Row type="flex" gutter="10px" justify="start" align="top" title={this.props.hint}>
                    <Col span={10}>
                        <label className="control-label text-ellipsis mn "  style={{width: '100%',fontSize:this.props.fontSize,fontWeight:'400'}}>
                            {this.props.title || '数据源'}
                        </label>
                    </Col>
                    <Col span={12}>
                        <div>
                            {
                                _.map(nodes, (item) =>
                                    <span className={item.selected ? "tm-tag tm-tag-info" : "tm-tag"} 
                                        key={item.nodeId} onClick={this.tagClick} data-id={item.nodeId}
                                        style={{cursor: 'pointer'}}>
                                    <span>{item.title}</span>
                                    {item.mapTarget && <span><i className="fa fa-long-arrow-right" style={{padding: '0 3px 0 3px'}}></i>{item.mapTarget.caption}
                                    <a href="#" className="tm-tag-remove" onClick={(e) => this.removeColumnMapping(item.nodeId, e)}>x</a></span>}
                                    </span> 
                                )
                            }
                        </div>
                    </Col>
                    <Col span={2} style={{textAlign: 'right'}}>

                    </Col>
                </Row>
                <Row type="flex" gutter="10px" justify="start" align="middle" className='mt40'>
                    <span style={{fontSize:'13px',width:'100%',background:'#eee',padding:'20px',borderRadius:'5px'}}>模型描述:{this.props.describe}</span>
                </Row>
                    {
                        solidId &&(
                            <div style={{marginTop:'30px'}}>
                                <form action='' >
                                    <button onClick={this.submitValues} type='button' className="btn btn-primary" style={{minWidth:'100px',marginLeft:'42%',fontSize:'15px'}}>提交</button>
                                </form>
                            </div>
                        )
                    }
            </div>

        )
    }
})
module.exports.Footer = Footer;
/** 字符类型 */

var Str=React.createClass({
    valueChange:function(value){
        store.dispatch({
            type: 'CHANGE_VALUE',
            index: this.props.index,
            value: value
        });
    },
    render:function(){
        return (
            <Row type="flex" gutter="10px" justify="start" align="middle">
                    <Col span={10}>
                    <label className="control-label text-ellipsis mn "  style={{width: '60%',fontSize:this.props.fontSize,fontWeight:'400'}}>
                         {this.props.title || '字符类型'}
                         {this.props.isRequired&&(
                                <span style={{color:'red',marginLeft:'5px'}}>*</span>
                            )
                         }

                    </label>
                     {!this.props.isHide &&(
                            <label className="control-label text-ellipsis mn" style={{width: '40%',fontSize:this.props.fontSize,fontWeight:'400'}}>
                                {this.props.operationChar}
                            </label>
                     )}

                    </Col>
                    <Col span={14} >
                        <ValueInput type='text' className="ph5 form-control"  title={this.props.hint} multiple={this.props.isMultiple} placeholder={this.props.hint}
                         onBlur={(value)=> this.valueChange(value)} splitWord={SPLIT_WORD}  style={{cursor: 'auto',width:this.props.size}} disabled={!this.props.editable}/>
                    </Col>
                </Row>

        )
    }
})

/** 时间类型 */
var Time=React.createClass({
    valueChange:function(val){
        console.log(val);
        this.value = val;
        store.dispatch({
            type: 'CHANGE_VALUE',
            index: this.props.index,
            value: val
        });
    },
    shouldComponentUpdate(nextProps){

        if(this.props.editable && nextProps.value == this.value){
            return false;
        }
        if(!this.props.editable){
            return true;
        }

    },
    getTimePicker:function(){
        let opr = 'equal';
        _.each(this.props.selectData , (item , key)=>{
            opr = item.opr
        })

        var datetimePicker;

        if (_.contains(["notGreaterThan", "notLessThan", "equal", "notEqual"], opr)){
            datetimePicker = (<BsDateTimePicker type="single" needDel={false} formatString="yyyy-MM-dd" value={this.props.value && _.isEmpty(this.props.value)?null:this.props.value}
                                                inputWidth="100%" callback={(value) => this.valueChange(_.isEmpty(value)?[]:[value])} />);
        } else if (_.contains(["isNull", "isNotNull"], opr)){
            datetimePicker = (<ValueInput className="form-control ph5" style={{height: '40px'}} disabled={true} onChange={this.valueChange}/>);
        } else {
            datetimePicker = (<BsDateTimePicker type="range" needDel={false} formatString="yyyy-MM-dd" value={this.props.value && _.isEmpty(this.props.value)&&this.props.value.length!=2?null:this.props.value}
                                                inputWidth="100%" callback={(value) => this.valueChange(_.isEmpty(value)?[]:value.split('~'))} />);
        }

        return(
            <div>
                {datetimePicker}
            </div>
        )


    },

    render: function() {
        //let opr = 'equal';
        //_.each(this.props.selectData , (item , key)=>{
        //    opr = item.opr
        //})

        return (
            <Row type="flex" gutter="10px" justify="start" align="middle">
                    <Col span={10}>
                    <label className="control-label text-ellipsis mn " style={{width: '60%',fontSize:this.props.fontSize,fontWeight:'400'}}>
                        {this.props.title || '时间类型'}
                        {this.props.isRequired&&(
                            <span style={{color:'red',marginLeft:'5px'}}>*</span>
                        )
                        }
                    </label>
                    {!this.props.isHide && (
                        <label className="control-label text-ellipsis mn" style={{width: '40%',fontSize:this.props.fontSize,fontWeight:'400'}}>
                            {this.props.operationChar}
                        </label>
                    )}
                    </Col>
                    <Col span={14} >
                        <div style={{width:this.props.size}}>
                            {
                                this.props.editable ? (
                                    this.getTimePicker()
                                ) : (
                                    <div className="input-group" style={{width:'100%'}}>
                                        <input type="text" style={{height: '40px', cursor: 'auto'}} className="form-control input-sm"
                                               placeholder={this.props.hint} disabled></input>
                                    </div>
                                )
                            }
                        </div>
                    </Col>
                </Row>
        )
    }
});

/** 数字类型 */
var Count = React.createClass({
    valueChange:function(value){
        store.dispatch({
            type: 'CHANGE_VALUE',
            index: this.props.index,
            value: value
        });
    },
    render: function() {
        return (
            <Row type="flex" gutter="10px" justify="start" align="middle">
                    <Col span={10}>
                    <label className="control-label text-ellipsis mn " style={{width: '60%',fontSize:this.props.fontSize,fontWeight:'400'}}>
                        {this.props.title || '数值类型'}
                        {this.props.isRequired&&(
                            <span style={{color:'red',marginLeft:'5px'}}>*</span>
                        )
                        }
                    </label>
                    {!this.props.isHide && (
                        <label className="control-label text-ellipsis mn" style={{width: '40%',fontSize:this.props.fontSize,fontWeight:'400'}}>
                            {this.props.operationChar}
                        </label>
                    )}
                    </Col>
                    <Col span={14}>
                        <ValueInput type='text'  className="ph5 form-control" title={this.props.hint} multiple={this.props.isMultiple} placeholder={this.props.hint}
                                    onBlur={(value)=> this.valueChange(value)} splitWord={SPLIT_WORD}  style={{cursor: 'auto',width:this.props.size}} disabled={!this.props.editable}/>
                    </Col>
                </Row>
        )
    }
})

/** 时间间隔 */
var Timein = React.createClass({
    timeType(item,option,select,checked){
        var type = option.val();
        console.log(type)
        store.dispatch({
            type: 'CHANGE_TIMETYPE',
            index: this.props.index,
            timeType: type
        });
    },
    valueChange:function(){
        let value = event.target.value;
        store.dispatch({
            type: 'CHANGE_VALUE',
            index: this.props.index,
            value: [value]
        });
    },
    render: function() {
        return (
            <Row type="flex" gutter="10px" justify="start" align="middle">
                    <Col span={10}>
                        <label className="control-label text-ellipsis mn " style={{width: '60%',fontSize:this.props.fontSize,fontWeight:'400'}}>
                            {this.props.title || '时间间隔'}
                            {this.props.isRequired&&(
                                <span style={{color:'red',marginLeft:'5px'}}>*</span>
                            )
                            }
                        </label>
                    </Col>
                    <Col span={14} >
                        <div className='input-group' style={{width:this.props.size}}>
                            <input placeholder={this.props.hint}  onBlur={this.valueChange} type="text" className='form-control' style={{cursor: 'auto'}} disabled={!this.props.editable}/>
                            <div className='input-group-btn'>
                                {this.props.editable?(
                                        <MultiSelect
                                            updateData={true}
                                            config={{buttonClass: 'multiselect dropdown-toggle btn btn-default fw100 fs13 mnw50 ',buttonWidth: '100%'}}
                                            onChange={this.timeType}
                                            data={
                                                _.map([{key: 'day', name: '日'}, {key: 'hour', name: '小时'}, {key: 'minute', name: '分钟'}, {key: 'second', name: '秒'}], function(item) {
                                                    return {
                                                        label: item.name,
                                                        title: item.key,
                                                        value: item.key,
                                                        type: 'string',
                                                        selected: false
                                                    }
                                                })
                                        } />
                                    ):(
                                        <button className='btn btn-default mnw50' disabled>
                                            日&nbsp;&nbsp;
                                            <span className='caret'></span>
                                        </button>
                                    )
                                }
                            </div>
                        </div>

                    </Col>
                </Row>
        )
    }
})

/** 码表类型 */

var Code=React.createClass({
    valueChange:function(value){
        store.dispatch({
            type: 'CHANGE_VALUE',
            index: this.props.index,
            value: value
        });
    },
    render:function(){
        return (
            <Row type="flex" gutter="10px" justify="start" align="middle" >
                    <Col span={10}>
                        <label className="control-label text-ellipsis mn " style={{width: '60%',fontSize:this.props.fontSize,fontWeight:'400'}}>
                            {this.props.title || '代码表字段'}
                            {this.props.isRequired&&(
                                <span style={{color:'red',marginLeft:'5px'}}>*</span>
                            )
                            }
                        </label>
                        {!this.props.isHide && (
                            <label className="control-label text-ellipsis mn" style={{width: '40%',fontSize:this.props.fontSize,fontWeight:'400'}}>
                                {this.props.operationChar}
                            </label>
                        )}
                    </Col>
                    <Col span={14}>
                        {this.props.editable && this.props.selectData[0]?(
                            <div className="codeTag1" style={{width: this.props.size, height: '40px'}}>
                                <Select name="codeTag" className="valueInput" multi={true} value={this.props.value} clearable={false}
                                        placeholder={this.props.hint} cacheAsyncResults={false} noResultsText="没有匹配的结果" searchPromptText="输入进行搜索"
                                        asyncOptions={(input, callback) => {
                                            if(typeof input === 'string' && !(input == "" && !_.isEmpty(this.props.value))) {
                                                $.getJSON('/modelanalysis/modeling/getcodetable', {
                                                    codetable: this.props.selectData[0].codeTable,
                                                    codefield: this.props.selectData[0].codeField,
                                                    codedisnamefield: this.props.selectData[0].codeDisNameField,
                                                    queryword: input
                                                }, (rsp) => {
                                                    if(rsp.code == 0) {
                                                        var rlt = _.map(rsp.data, (dataItem) => {
                                                            return {
                                                                value: dataItem.id,
                                                                label: dataItem.text
                                                            }
                                                        })
                                                        callback(null, {options: rlt});
                                                    } else {
                                                        callback(null, {options: []});
                                                    }
                                                })
                                            } else {
                                                var code = _.isArray(input) && !_.isEmpty(input) ? input : this.props.value;
                                                $.getJSON('/modelanalysis/modeling/getcodetablebycode', {
                                                    codetable: this.props.selectData[0].codeTable,
                                                    codefield: this.props.selectData[0].codeField,
                                                    codedisnamefield: this.props.selectData[0].codeDisNameField,
                                                    code: JSON.stringify(code)
                                                }, (rsp) => {
                                                    if(rsp.code == 0) {
                                                        var rlt = _.map(rsp.data, (dataItem) => {
                                                            return {
                                                                value: dataItem.id,
                                                                label: dataItem.text
                                                            }
                                                        })
                                                        callback(null, {options: rlt});
                                                    } else {
                                                        callback(null, {options: []});
                                                    }
                                                })
                                            }
                                        }}
                                        onChange={(newValue) => this.valueChange(_.isEmpty(newValue) ? [] : newValue.split(','))}

                                />
                            </div>

                        ):(
                            <ValueInput type='text' className="ph5 form-control" value={this.props.value} title={this.props.hint} placeholder={this.props.hint}
                                        style={{cursor: 'auto',width:this.props.size}} disabled={!this.props.editable} onChange={this.valueChange}/>
                        )
                        }

                    </Col>
                </Row>
        )
    }
})

/* dragSource and dropTarget */
var dragSpec = {
    beginDrag: function(props) {
        store.dispatch({
            type: 'CHANGE_OPACITY',
            index: props.index,
            opacity: 0.5
        });
        return { index: props.index };
    },
    endDrag: function(props, monitor) {
        store.dispatch({
            type: 'CHANGE_OPACITY',
            index: monitor.getItem().index,
            opacity: 1
        });
    }
}

var dropSpec = {
    hover: function(props, monitor) {
        var draggedID = monitor.getItem().index || -1; //-1表示是一个正在拖动的未放置的组件
        var droppedID = props.index;
        store.dispatch({
            type: 'BUBBLE',
            draggedID: draggedID,
            droppedID: droppedID
        });
    }
};

function dragCollect(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        connectDragPreview: connect.dragPreview(),
        isDragging: monitor.isDragging()
    }
}

function dropCollect(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver()
    }
}

var closeStyle = {
    width: '20px',
    height: '20px',
    position: 'absolute',
    right: '1px',
    top: '25px'
}

var SubTarget = React.createClass({

    propTypes: {
        editable: React.PropTypes.bool.isRequired
    },

    clickHandle: function(e) {
        e.stopPropagation();
        store.dispatch({
            type: 'CHANGE_COMPONENT_SELECT_MODE',
            index: this.props.index
        });
    },

    handleClick: function(e) {
        e.stopPropagation();
        store.dispatch({
            type: 'DELETE_COMPONENT',
            index: this.props.index
        });
    },
    mouseover: function(e) {
        e.stopPropagation();
        store.dispatch({
            type: 'CHANGE_COMPONENT_HOVER',
            index: this.props.index,
            display: 'block',
            border: '1px dashed #ccc '
        });
    },
    mouseleave: function(e) {
        e.stopPropagation();
        store.dispatch({
            type: 'CHANGE_COMPONENT_HOVER',
            index: this.props.index,
            display: 'none',
            border: '1px solid transparent'
        });
    },


    render: function() {
        var { connectDragSource, connectDropTarget, isSelected, ...other } = this.props;
        var component = <Str/>;
        switch (this.props.name) {
            case 'string':
                component = <Str {...other} />;
                break;
            case 'date':
                component = <Time {...other} />;
                break;
            case 'decimal':
                component = <Count {...other} />;
                break;
            case 'datetime':
                component = <Timein {...other} />;
                break;
            case 'code':
                component = <Code {...other} />;
                break;
        }
        var classStr = this.props.editable ? "ph30 pv20 " : "app-component ph30 pv20 ";
        var backgroundColor = (isSelected && !this.props.editable) ? "rgba(200,200,200,0.3)": 'transparent';

        if (!this.props.editable) {

            return connectDropTarget(connectDragSource(
                <div  title={this.props.hint}  className={classStr} onMouseLeave={this.mouseleave} onMouseOver={this.mouseover} onClick={this.clickHandle} style={{border:this.props.border,opacity:this.props.opacity, background: backgroundColor,position:'relative'}} >
                    {component}
                    <div id='close'  style={closeStyle}>
                        <i onClick={this.handleClick} className="fa fa-remove pull-right fa-2x" style={{color:'red',display:this.props.display,cursor:'pointer'}}></i>
                    </div>
                </div>));
        } else
            return (
                <div className={classStr} style={{opacity:this.props.opacity, background: backgroundColor,position:'relative'}} >
                    {component}
                </div>);
    }
});
module.exports.SubTarget = flow(DragSource("SAMPLE", dragSpec, dragCollect),
    DropTarget("SAMPLE", dropSpec, dropCollect))(SubTarget);
