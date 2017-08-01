var React = require('react')
var ReactDOM = require('react-dom');
var redux = require('redux');
var _ = require('underscore');
var $ = require('jquery');
var Q = require('q');

var DatetimePicker = require("widget/datetime-picker");
var MultiSelect = require('widget/multiselect');
var OutputFields = require('./modeling-output-fields');
var Notify = require('nova-notify');
var moment = require('moment');    
var Provider = require('widget/i18n-provider');
/*========store=======*/
var advancedCondition;

var reducer = function(state = {}, action){
    switch(action.type) {
        case 'REPLACE':
            return action.data;
        case 'REPLACE_KEYWORD':
            return _.assign({}, state, {keyword: action.keyword});
        case 'REPLACE_SELECTEDFIELDS':
            return _.assign({}, state, {selectedFields: action.selectedFields});
        case 'ADD_SELECTEDFIELD':{
            let selectedFields = state.selectedFields;
            selectedFields.push(action.selectedField);
            return _.assign({}, state, {selectedFields: selectedFields});
        }
        case 'DELETE_SELECTEDFIELD':{
            let selectedFields = state.selectedFields;
            selectedFields.splice(action.index, 1);
            return _.assign({}, state, {selectedFields: selectedFields});   
        }
        case 'CHANGE_MULTI':{
            let selectedFields = state.selectedFields;
            selectedFields[action.index].semanticName = action.semanticName;
            return _.assign({}, state, {selectedFields: selectedFields});
        }
        case 'CHANGE_CONTENT': {
            let selectedFields = state.selectedFields;
            selectedFields[action.index].content = action.content;
            return _.assign({}, state, {selectedFields: selectedFields});
        }
        case 'REPLACE_FILE_TIME':
            return _.assign({}, state, {file_time: action.file_time});
        case 'REPLACE_LOAD_TIME':
            return _.assign({}, state, {load_time: action.load_time});
        case 'REPLACE_OUTPUTSELECTEDFIELDS':
            return _.assign({}, state, {outputSelectedFields: action.outputSelectedFields});
        default:
            return state;
    }  
}
var store = redux.createStore(reducer);

/*========component===*/
var RestrictCondition = React.createClass({
    contextTypes: {
        i18n: React.PropTypes.object
    },

    bussinessTimeChange: function(val){
        if(val == ""){
            store.dispatch({
                type: 'REPLACE_FILE_TIME',
                file_time: { startDate: "", endDate: "", needDefault: false }
            });
        }
        else{
            var dates = val.split(" ~ ");
            if(dates.length == 2)
                store.dispatch({
                    type: 'REPLACE_FILE_TIME',
                    file_time: { startDate: dates[0], endDate: dates[1], needDefault: false }
                });
        }
    },
    
    introductionTimeChange: function(val){
        if(val == ""){
            store.dispatch({
                type: 'REPLACE_LOAD_TIME',
                load_time: { startDate: "", endDate: "", needDefault: false }
            });
        }
        else{
            var dates = val.split(" ~ ");
            if(dates.length == 2)
                store.dispatch({
                    type: 'REPLACE_LOAD_TIME',
                    load_time: { startDate: dates[0], endDate: dates[1], needDefault: false }
                });
        }
    },
    
    render: function(){
        var {i18n} = this.context;
        var bussinessInput = (
            <DatetimePicker type="date" startDate={this.props.bussinessTime.startDate} endDate={this.props.bussinessTime.endDate} needMask={true} onChange={this.bussinessTimeChange} />
        );
        var IntroductionInput = (
            <DatetimePicker type="date" startDate={this.props.introductionTime.startDate} endDate={this.props.introductionTime.endDate} needMask={true} onChange={this.introductionTimeChange} />
        );
        if(this.props.bussinessTime.startDate == "")
            bussinessInput = <DatetimePicker type="date" needDefault={this.props.bussinessTime.needDefault} needMask={true} onChange={this.bussinessTimeChange} />           
        if(this.props.introductionTime.startDate == "")
            IntroductionInput = <DatetimePicker type="date" needDefault={this.props.introductionTime.needDefault} needMask={true} onChange={this.introductionTimeChange} />
        
        return(
            <div style={{paddingLeft: "10px", paddingRight: '10px'}}>
                <label className="row mt20" style={{fontSize: "18px", fontWeight: 'lighter'}}>{i18n.t("full-text.restrictions")}</label>
                <div className="row mt20">
                    <div className="col-md-3 fw400 pn pt10">{i18n.t("full-text.bussiness-time")}</div>
                    <div className=" col-md-9 pn">
                        {bussinessInput}
                    </div>
                </div>
                <div className="row mt20">
                    <div className="col-md-3 fw400 pn pt10">{i18n.t("full-text.import-time")}</div>
                    <div className=" col-md-9 pn">
                        {IntroductionInput}
                    </div>
                </div>
            </div>
        )
    }
});

var ModeOption = React.createClass({
    contextTypes: {
        i18n: React.PropTypes.object
    },

    getInitialState: function() {
        var advancedMode = this.isAdvancedMode();
        return { deleteMode: false, advancedMode: advancedMode, forseUpdate: false };  
    },
    
    isAdvancedMode: function(){
        //判断是否已经有内容
        var selectedFields = this.props.selectedFields;
        var isAdvMode = false;
        selectedFields.forEach(function(selectedField){
            if(selectedField.content != '')
                isAdvMode = true;
        })
        //若按钮无法显示，则拒绝高级模式
        if(!this.props.showModeBtn)
            isAdvMode = false;
        
        return isAdvMode;
    },
    
    addBtnClick: function() {
        for(var i = 0; i < advancedCondition.length; i++){
            if(!this.existInSelectedFields(advancedCondition[i].semanticName)){
                store.dispatch({ 
                    type: 'ADD_SELECTEDFIELD', 
                    selectedField: { semanticName: advancedCondition[i].semanticName, content: '' } 
                });
                break;
            }
        }
    },
    
    existInSelectedFields(advCond){
        for(var i = 0; i < this.props.selectedFields.length; i++){
            if(advCond == this.props.selectedFields[i].semanticName)
                return true;
            }
        return false;       
    },
    
    toggleBtn: function() {        
        this.state.deleteMode = !this.state.deleteMode;
        this.setState(this.state);
    },  
    
    deleteBtnClick: function(event) {
        var index = $(event.currentTarget).attr('data-index');
        if(this.props.selectedFields.length > 1){
            store.dispatch({
                type: 'DELETE_SELECTEDFIELD',
                index: index
            });
        }
    },
    
    keywordChange: function(event){
        store.dispatch({
            type: 'REPLACE_KEYWORD',
            keyword: event.target.value 
        });
    },
    
    modeChange: function(){
        this.state.advancedMode = !this.state.advancedMode;
        this.setState(this.state);        
    },
    
    multiSelectChange: function(identity, option){
        if(!this.existInSelectedFields(option.val())){
            store.dispatch({
                type: 'CHANGE_MULTI',
                index: identity,
                semanticName: option.val()
            });
            this.setState({forseUpdate: false});
        }
        else{
            this.setState({forseUpdate: true});
        }
    },
    
    contentChange: function(event){
        var index = $(event.currentTarget).attr('data-index');
        store.dispatch({
            type: 'CHANGE_CONTENT',
            index: index,
            content: event.target.value
        });
    },
    
    render: function() {
        var {i18n} = this.context;
        var advancedMode = this.state.advancedMode;
        var title1 = advancedMode ? i18n.t("advanced-mode") : i18n.t("simple-mode");
        var title2 = advancedMode ? i18n.t("simple-mode") : i18n.t("advanced-mode");
        var forseUpdate = this.state.forseUpdate;
        var btns = (
            <div className="text-right mt15">
                <button type="button" onClick={this.addBtnClick} className="addBtn btn btn-rounded btn-primary btn-xs mr5">{i18n.t("add-btn")}</button>
                <button type="button" onClick={this.toggleBtn} className="deleteBtn btn btn-rounded btn-danger btn-xs">i18n.t("delete-btn")</button>
            </div>
        );         
        if(this.state.deleteMode){
            btns = (
                <div className="text-right mt15">
                    <button type="button" onClick={this.toggleBtn} className="btn btn-rounded btn-default btn-xs">{i18n.t("complete-btn")}</button>
                </div>
            );
        }
        
        return (
            <div>
                <div>
                    <label style={{fontSize: "18px", fontWeight: 'lighter'}}>{title1}</label>
                    <button style={this.props.showModeBtn ? {} : {display:'none'}} type='button' className='btn btn-default btn-sm pull-right' onClick={this.modeChange}>{title2}</button>
                </div>
                {/*简单*/}        
                <div className="mt20" style={this.state.advancedMode ? {display:'none'} : {}}>
                    <table className='table'>
                        <tr>
                            <td>
                                <input className='form-control' placeholder={i18n.t("keyword")} value={this.props.keyword} onChange={this.keywordChange}></input>
                            </td>
                        </tr>
                    </table>
                </div> 
                {/*高级*/}
                <div style={this.state.advancedMode ? {} : {display:'none'}}>
                    <table className="table">
                        {_.map(this.props.selectedFields, _.bind(function(selectedField, index){
                            return (
                                <tr>
                                    <td className='deleteStyle pl10 pr10' style={this.state.deleteMode ? {} : {display:'none'}}>
                                        <div className="mt15">
                                            <button type="button" className="btn-delete-record btn btn-rounded btn-danger btn-xs" data-index={index} onClick={this.deleteBtnClick}>
                                                <i className="fa fa-minus"></i>
                                            </button>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="mt15">
                                            <MultiSelect data={_.map(advancedCondition, function(item) {                                                            
                                                            return {label: item.semanticDisplayName,
                                                                    value: item.semanticName, 
                                                                    selected: item.semanticName == selectedField.semanticName}
                                                        })}
                                                        identity={index} 
                                                        updateData={true}
                                                        forceUpdate={forseUpdate}
                                                        onChange={this.multiSelectChange}
                                                        config={{buttonClass: 'multiselect dropdown-toggle btn btn-info fw600 fs14 mnw50',buttonWidth: '100%'}}>
                                            </MultiSelect>
                                        </div> 
                                    </td>
                                    <td>
                                        <div className="mt15">
                                            <input className='form-control' id='conditionText' data-index={index} value={selectedField.content} onChange={this.contentChange}></input>
                                        </div>
                                    </td>
                                </tr>
                            )
                        }, this))}
                    </table>
                    <div>
                        {btns}
                    </div>
                </div>
            </div>
        );
    }
});

var FullTextIndex = React.createClass({
    contextTypes: {
        i18n: React.PropTypes.object
    },
    
    componentDidMount() {
        this.unsubscribe = store.subscribe(() => {
            this.forceUpdate();
        })
    },

    componentWillUnmount() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    },
    
    selectChangedHandle: function (outputSelectedFields) {
        store.dispatch({
            type: 'REPLACE_OUTPUTSELECTEDFIELDS',
            outputSelectedFields: outputSelectedFields
        });
    },
    
    render: function() {
        var {i18n} = this.context;

        var data = store.getState();
        
        return (
            <div>
                {/*高级/简单*/}
                <ModeOption showModeBtn={this.props.showModeBtn} selectedFields={data.selectedFields} keyword={data.keyword} />
                {/*约束条件*/}
                <RestrictCondition bussinessTime={data.file_time} introductionTime={data.load_time} />
                {/*输出字段*/}
                <div className="mt20" id="outputFields" >
                    <div className="row mt10 mb10">
                        <label className="col-md-4" style={{fontSize: "18px", fontWeight: 'lighter'}}>{i18n.t("output-field")}</label>            
                    </div>
                    
                    <OutputFields inputFields={data.input[0].outputColumnDescList} selectedFields={data.outputSelectedFields} 
                        onChange={this.selectChangedHandle} />
                </div>
            </div>
        );
    }
});
/*====export render===*/
function date_S_To_B(startDate, endDate, dateFormat){
    if(startDate == "" || endDate == "")
        return {
            startDate: "",
            endDate: "",
            needDefault: false
        };
    else{
        startDate = moment(startDate, dateFormat);
        endDate = moment(endDate, dateFormat);
        return {
            startDate: startDate.format(dateFormat),
            endDate: endDate.format(dateFormat),
            needDefault: false   
        }
    }
}

function getDateRange(){
    var dateFormat = 'YYYY/MM/DD';
    var startDate = moment().startOf('month');
    var endDate = moment().endOf('month');
    return {
        startDate: startDate.format(dateFormat),
        endDate: endDate.format(dateFormat),
        needDefault: false
    };                     
}

function _getAdvCond() {
    var defer = Q.defer();
    if(advancedCondition) {
        defer.resolve(advancedCondition);
    } else {
        $.getJSON('/modelanalysis/modeling/getsearchitem', {}, function(res) {
            if(res.code == 0) {
                advancedCondition = res.data;
                defer.resolve(advancedCondition);
            } else {
                defer.resolve("");
            }
        });
    }
    return defer.promise;
}

function initialStore(inputData) {
    var data = {};
    data.input = inputData.input;
    data.inputID = inputData.inputID;
        
    var output = inputData.output;
    if(output){
        data.keyword = output.queryCond.children[0].queryString;
        data.file_time = date_S_To_B(output.numericRangeConds[0].begin, output.numericRangeConds[0].end, 'YYYY/MM/DD');
        data.load_time = date_S_To_B(output.numericRangeConds[1].begin, output.numericRangeConds[1].end, 'YYYY/MM/DD');       
        
        var selectedFields = _.map(output.queryCond.children[1].children, function(child){
            return {
                semanticName: child.semanticName,
                content: child.queryString
            }
        });
        data.selectedFields = selectedFields;
        if(advancedCondition && data.selectedFields.length == 0){
            for(var i = 0; i < 3; i++){
                data.selectedFields.push({
                    semanticName: advancedCondition[i].semanticName,
                    content: ''
                });
            }   
        }
        
        data.outputSelectedFields = output.dataType.outputColumnDescList;
    } else{
        data.keyword = '';        
        data.file_time = getDateRange();   
        data.load_time = getDateRange();
        
        //default 3 advanced conditions
        data.selectedFields = [];
        if(advancedCondition){
            for(var i = 0; i < 3; i++){
                data.selectedFields.push({
                    semanticName: advancedCondition[i].semanticName,
                    content: ''
                });
            }   
        }

        var outputSelectedFields = _.map(inputData.input[0].outputColumnDescList,  function(item) {
            return _.extend({}, item, { columnName: item.aliasName, aliasName: '' })
        });
        data.outputSelectedFields = outputSelectedFields;
    }
    
    store.dispatch({
        type: 'REPLACE',
        data: data
    });
}

 module.exports.render = function (container, inputData) {
     _getAdvCond().then(function(advCond){
        var showModeBtn = !(advCond == "");
        
        initialStore(inputData);
        
        var outputSelectedFields = _.map(inputData.input[0].outputColumnDescList,  function(item) {
            return _.extend({}, item, {columnName: item.aliasName});
        });
        if(inputData.output){
            outputSelectedFields = inputData.output.dataType.outputColumnDescList;
        }

        ReactDOM.render(<Provider.default><FullTextIndex  showModeBtn={showModeBtn} /></Provider.default>, container);
    });
 }
 /*====constructTaskDetail===*/
function date_B_To_S(dates, dateFormat){
    if(dates.startDate == "" && dates.endDate == ""){
        return {
            startDate: "",
            endDate: ""   
        }
    }
    else{
        var startDate = moment(dates.startDate, dateFormat);
        var endDate = moment(dates.endDate, dateFormat);
        return {
            startDate: startDate.format(dateFormat),
            endDate: endDate.format(dateFormat)
        }
    }
}

function selectFields_To_API(selectedFields){
    //filter null
    var result = [];
    _.map(selectedFields, function(selectedField){ 
        if(selectedField.content != ""){
            result.push({
                composite: 'false',
                semanticName: selectedField.semanticName,
                queryString: selectedField.content
            });
        }       
    });
    return result;
}

module.exports.constructTaskDetail = function() {
    var data = store.getState();
    
    var selectedFields_API = selectFields_To_API(data.selectedFields);
    var FILE_TIME = date_B_To_S(data.file_time, 'YYYYMMDDHH');
    var LOAD_TIME = date_B_To_S(data.load_time, 'YYYYMMDDHH');
    
    var output = 
    {
        taskFrom: 2,
        numericRangeConds: 
        [
            {semanticName: "FILE_TIME", begin: FILE_TIME.startDate, end: FILE_TIME.endDate},
            {semanticName: "LOAD_TIME", begin: LOAD_TIME.startDate, end: LOAD_TIME.endDate}
        ],
        queryCond: 
        {
            Composite: "true",
            logicOperator: "and",
	        children: 
            [
                {
                    composite: 'false',
                    semanticName: "CONTENT",
                    queryString: data.keyword                    
                },
                {
                    composite: "true",
        		    logicOperator: "or",
        		    children: selectedFields_API
                }
            ]
        },
        dataType: {
            centerCode: "M1", 
            zoneId: 1,
            typeId: 51,
            outputColumnDescList: data.outputSelectedFields
        }
    };    

    if(output.queryCond.children[0].queryString == "" && output.queryCond.children[1].children.length == 0){
        return {
            message: window.i18n.t("warning.please-enter-retrieval-content")
        };
    }
    else{
        return {
            detail: output
        }
    }
};