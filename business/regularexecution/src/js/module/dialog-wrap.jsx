var React = require('react');
var ReactDOM = require('react-dom');
var Dialog = require('nova-dialog');
var Notify = require('nova-notify');
var redux = require('redux');
var bootbox = require('nova-bootbox-dialog')
import {render} from 'react-dom';
var PersonalWorkTree = require('widget/personalworktree');
var ModelingTree = require('../../../../modelanalysis/src/js/widget/modelingtree');
var Provider = require('widget/i18n-provider');
import { Button, Tree, Tabs, Icon, Radio, Checkbox, Select, Input, TimePicker, DatePicker } from 'antd';
import moment from 'moment';
const dateFormat = 'YYYY/MM/DD';
const monthFormat = 'YYYY/MM';
const TreeNode = Tree.TreeNode;
const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const { MonthPicker, RangePicker } = DatePicker;
var DateTimeRangePicker = require('widget/dateTimeWidget/datetimeRangePicker');
const defaultStartTime = moment().add(-7,'days').format('YYYY-MM-DD HH:mm:ss')
const defaultEndTime = moment().format('YYYY-MM-DD HH:mm:ss')
const defaultTimeRange = [defaultStartTime,defaultEndTime]
let timeValue = defaultTimeRange;

let submitConds = {
    timeType:"time",     //time为日期,datatime为时间
    value:[],
    selectedValue:[],
    trackData:{}
};
let submitCondsTime = {
    timeType:"time",     //time为日期,datatime为时间
    value:[],
    selectedValue:[],
    trackData:{}
};

submitConds.value.push(moment().format("YYYY-MM-DD"));
submitConds.value.push(moment().subtract(-3, 'month').format("YYYY-MM-DD"));
submitCondsTime.value.push((moment().format("HH:mm")));

var state = {
	dialogData: {}
}
var reducer = function(state, action) {
	var newState = {}
    switch (action.type) {
        case 'GETDIALOGMDATA':
        	newState.dialogData = action.dialogData
            newState.editType = action.dialogData.editType
            newState.isEffect = false
            newState.executeInterval = 24
            if (action.dialogData.editType === 'edit') {
                let editItem = action.dialogData.editItem
                newState.editItem = editItem
                let rangePickerValue = []
                rangePickerValue[0] = editItem.startDate
                rangePickerValue[1] = editItem.endDate
                newState.moduleName = editItem.modelName
                newState.executeInterval = editItem.executeInterval
                newState.executeTime = editItem.executeTime
                newState.taskNamePre = editItem.taskNamePre
                newState.schemeName = editItem.schemeName
                newState.taskPath = editItem.taskPath
                newState.rangePickerValue = rangePickerValue
            } else {
                newState.executeTime = ''
                newState.taskNamePre = ''
                newState.rangePickerValue = submitConds.value
                newState.schemeName = ''
            }
            return _.assign({}, state, newState);
        case 'GET_ISEFFECT':
            newState.isEffect = action.isEffect
            return _.assign({}, state, newState)
        case 'GET_MODULENAME':
            newState.moduleName = action.moduleName
            return _.assign({}, state, newState)
        case 'GET_EXECUTEINTERVAL':
            newState.executeInterval = action.executeInterval
            return _.assign({}, state, newState)
        case 'GET_TASKPATH':
            newState.taskPath = action.taskPath
            return _.assign({}, state, newState)
        case 'GET_EXECUTETIME':
            newState.executeTime = action.executeTime
            return _.assign({}, state, newState)
        case 'GET_RANGEPICKER':
            newState.rangePickerValue = action.rangePickerValue
            return _.assign({}, state, newState)
        case 'GET_SCHEMENAME':
            newState.schemeName = action.schemeName
            return _.assign({}, state, newState)
        case 'GET_TASKNAMEPRE':
            newState.taskNamePre = action.taskNamePre
            return _.assign({}, state, newState)

        default:
            return state;
    }
}
var store = redux.createStore(reducer);
/*var dispatch = function(action, data, callback) {
    store.dispatch({
        type: action,
        data: data
    });
    if (callback) {
        callback();
    }
}*/

/******************************   DialogContent  ************************************/

var DialogContent = React.createClass({
    contextTypes: {
        i18n: React.PropTypes.object
    },

	getInitialState: function () {
		return {
            moduleName: '',
            executeInterval: 24,
            executeTime: '',
            taskNamePre: '',
            schemeName: '',
            taskPath: '',
            rangePickerValue: [],
            editType: 'add',
            isShowModelTree: false,
            isShowPathTree: false
		}
	},
    componentWillReceiveProps: function (nextProps) {
        
    },

    componentDidMount: function () {
    	var data = store.getState();
        let editType = data.editType
        if (editType === 'edit') {
            let editItem = data.editItem
            let rangePickerValue = []
            rangePickerValue[0] = editItem.startDate
            rangePickerValue[1] = editItem.endDate
            submitCondsTime.value = [editItem.executeTime]
            this.setState({
                moduleName: editItem.modelName,
                executeInterval: editItem.executeInterval,
                executeTime: editItem.executeTime,
                taskNamePre: editItem.taskNamePre,
                taskPath: editItem.taskPath,
                rangePickerValue: rangePickerValue,
                editType: editType,
                schemeName: editItem.schemeName
            })
        }

        var showModel = false
        $("#model").click(function(e) {
            showModel = !showModel
            showPath = false
            showModel ? $('#selectModel').show(300) : $('#selectModel').hide(300)
            showModel ? $('#save-path').hide(300) : ''
            $('#path').hasClass('focus-border-color') ? _isShowFocusBorder('#path', 'hide') : ''
            if (showModel) {
                _isShowFocusBorder('#model', 'show')
                // $('#model').removeClass('unfocus-border-color')
                // $('#model').addClass('focus-border-color')
            } else {
                // $('#model').removeClass('focus-border-color')
                // $('#model').addClass('unfocus-border-color')
                _isShowFocusBorder('#model', 'hide')
            }
            e.stopPropagation();
        })
        var showPath = false
        $("#path").click(function(e) {
            e.stopPropagation();
            showPath = !showPath
            showModel = false
            showPath ? $('#save-path').show(300) : $('#save-path').hide(300)
            showPath ? $('#selectModel').hide(300) : ''
            $('#model').hasClass('focus-border-color') ? _isShowFocusBorder('#model', 'hide') : ''
            if (showPath) {
                // $('#path').removeClass('unfocus-border-color')
                // $('#path').addClass('focus-border-color')
                _isShowFocusBorder('#path', 'show')
            } else {
                // $('#path').removeClass('focus-border-color')
                // $('#path').addClass('unfocus-border-color')
                _isShowFocusBorder('#path', 'hide')
            }
        })
        $('.table-content').click(function() {
            // console.log('trigger')
            /*if (showModel) {
                $('#selectModel').hide(300)
                showModel = false
            }
            if (showPath) {
                $('#save-path').hide(300)
                showPath = false
            }*/
        })

        if (editType === 'edit') {
           $('#path').text(data.editItem.taskPath) 
        }

        var pwt,model;
        pwt = PersonalWorkTree.buildTree({
            container: $("#save-path"),
            treeAreaFlag: "saveModel"
        });

        model = ModelingTree.buildTree({
            container: $("#selectModel"),
            treeAreaFlag: 'saveModel',
            type: -1 //建模分析模型subtype,-1为所有
        });

        model.config("dblclick", function (event, data) {
            event.stopPropagation();
            if (typeof data !== 'undefined' &&
                typeof data.node !== 'undefined' &&
                typeof data.node.data !== 'undefined' &&
                typeof data.node.data.modelName !== 'undefined') {
                $('#model').text(data.node.data.modelName)
                $('#selectModel').css({"display": "none"})
                _isShowFocusBorder('#model', 'hide')
                // $('#model').removeClass('focus-border-color')
                // $('#model').addClass('unfocus-border-color')
            }
        });
        pwt.config("dblclick", function(event, data) {
            event.stopPropagation();
            var title = ''
            if (typeof data !== 'undefined' &&
                typeof data.node !== 'undefined' &&
                typeof data.node.data !== 'undefined' &&
                typeof data.node.data.path !== 'undefined') {
                title = data.node.data.path
                $('#path').text(title)
                $('#save-path').css({"display": "none"})
                _isShowFocusBorder('#path', 'hide')
                // $('#path').removeClass('focus-border-color')
                // $('#path').addClass('unfocus-border-color')
            }
        });

        function _isShowFocusBorder (element, type) {
            if (type === 'hide') {
                $(element).removeClass('focus-border-color')
                $(element).addClass('unfocus-border-color')
            } else if (type === 'show') {
                $(element).removeClass('unfocus-border-color')
                $(element).addClass('focus-border-color')
            }
        }
    },

    _onChange: function (e) {
        let isEffect = e.target.checked
        store.dispatch({
            type: 'GET_ISEFFECT',
            isEffect: isEffect
        })
    },

    _handleModelChange: function (value) {
        this.setState({
            moduleName: value
        })
        store.dispatch({
            type: 'GET_MODULENAME',
            moduleName: value
        })
    },

    _handleExecutionChange: function (value) {
        this.setState({
            executeInterval: value
        })
        store.dispatch({
            type: 'GET_EXECUTEINTERVAL',
            executeInterval: value
        })
    },

    _handleRouteChange: function (value) {
        this.setState({
            taskPath: value
        })
        store.dispatch({
            type: 'GET_TASKPATH',
            taskPath: value
        })
    },

    _handleStartTimeChange: function (time, timeString) {
        this.setState({
            executeTime: timeString
        })
        store.dispatch({
            type: 'GET_EXECUTETIME',
            executeTime: timeString
        })
    },

    _handleRangePicker: function (dates, dateStrings) {
        this.setState({
            rangePickerValue: dateStrings
        })
        store.dispatch({
            type: 'GET_RANGEPICKER',
            rangePickerValue: dateStrings
        })
    },

    _handleSchemeName: function (e) {
        let schemeName = e.target.value
        this.setState({
            schemeName: schemeName
        })
        store.dispatch({
            type: 'GET_SCHEMENAME',
            schemeName: schemeName
        })
    },

    _handleTaskNamePre: function (e) {
        let value = e.target.value
        this.setState({
            taskNamePre: value
        })
        store.dispatch({
            type: 'GET_TASKNAMEPRE',
            taskNamePre: value
        })
    },

    _getTimeTitle: function (value) {
        let title = ''
        switch (value) {
            case '24':
                title = '每天'
                break
            case '168':
                title = '每周'
                break
            default :
                title = '每天'
        }
        return title
    },

    _handleShowModelTree: function () {
        this.setState({
            isShowModelTree: !this.state.isShowModelTree,
            isShowPathTree: !this.state.isShowModelTree ? false : this.state.isShowPathTree
        })
    },

    _handleShowPathTree: function () {
        this.setState({
            isShowPathTree: !this.state.isShowPathTree,
            isShowModelTree: !this.state.isShowPathTree ? false : this.state.isShowModelTree
        })
    },

    _getDateRangeValue: function (start,end){
        submitConds.value[0] =start;
        submitConds.value[1] = end;
        store.dispatch({
            type: 'GET_RANGEPICKER',
            rangePickerValue: submitConds.value
        })
    },

    _getDateRangeTimeValue: function (value){
        if (typeof value !== 'undefined' && typeof value == 'object') {
            let splitValue = value.toString().split(' ')[4]
            submitCondsTime.value = [splitValue.slice(0, 5)];
            let executeTime = submitCondsTime.value[0]
            store.dispatch({
                type: 'GET_EXECUTETIME',
                executeTime: executeTime
             })
        }
    },

    render() {
    	var data = store.getState();
        const { taskPath, moduleName, executeInterval, executeTime, rangePickerValue, editType, taskNamePre } = this.state
        const { isShowModelTree, isShowPathTree, schemeName } = this.state

		return (
            <div className="dialog-wrap">
                <div className="table-content">
                    <div className="dialog-item-wrap">
                        <div className="dialog-title-wrap"><span htmlFor="mission-name">策略名称：</span></div>
                        <div style={{display: 'inline-block', width: '244px'}}>
                            <Input
                                value={schemeName}
                                type="text"
                                style={{color: '#111'}}
                                onChange={this._handleSchemeName.bind(this)}
                                placeholder="策略名称"
                            />
                        </div>
                    </div>
                    <div className="dialog-item-wrap" style={{display: editType === 'add' ? 'block' : 'none'}}>
                        <div className="dialog-title-wrap"><span htmlFor="model">选择模型：</span></div>
                        <div className="model-wrap">
                            <div
                                id="model"
                                className="model-inner"
                                >
                            </div>
                        </div>
                        <div
                            id="selectModel"
                            style={{display: isShowModelTree ? 'block' : 'none'}}
                            className="model-content">
                        </div>
                    </div>
                    <div  className="dialog-item-wrap">
                        <div className="dialog-title-wrap"><span>执行策略：</span></div>
                        <Select
                            showSearch
                            style={{ width: 244, color: '#111' }}
                            placeholder="执行策略"
                            optionFilterProp="children"
                            value={executeInterval === 24 ? '24小时' : ' 每周'}
                            onChange={this._handleExecutionChange.bind(this)}
                            filterOption={(input, option) => option.props.value.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                        >
                            <Option value={24}>24小时</Option>
                            <Option value={168}>每周</Option>
                        </Select>
                    </div>
                    <div className="dialog-item-wrap" style={{height: '50px'}}>
                        <div className="dialog-title-wrap"><span htmlFor="start-date">执行时间：</span></div>
                        {/*<input className="input-style" type="text" id={"start-date"} value="2017-05-19"/>*/}
                        <div style={{width: '244px', display: 'inline-block'}}>
                            {/*<RangePicker
                                size={"default"}
                                value={rangePickerValue}
                                onChange={this._handleRangePicker.bind(this)}
                            />*/}
                            <DateTimeRangePicker
                                callback={this._getDateRangeValue}
                                type="calenderRange"
                                value={submitConds.value}
                                inputWidth='50'
                                inputHeight='28'
                                needDel={false}
                                formatString = {submitConds.timeType == "time" ? "yyyy-MM-dd" :"yyyy-MM"}/>
                        </div>
                    </div>
                    <div className="dialog-item-wrap">
                        <div className="dialog-title-wrap"><span htmlFor="daily-time">{this._getTimeTitle(executeInterval)}执行时间：</span></div>
                        {/*<TimePicker
                            format="HH:mm" 
                            value={executeTime}
                            style={{width: '200px'}}
                            onChange={this._handleStartTimeChange.bind(this)}
                        />*/}
                        <div style={{width: '244px', display: 'inline-block', borderRadius: '6px'}}>
                            <DateTimeRangePicker
                                    callback={this._getDateRangeTimeValue}
                                    type="single"
                                    value={submitCondsTime.value}
                                    inputWidth='244'
                                    inputHeight='28'
                                    needDel={false}
                                    formatString = {submitCondsTime.timeType == "time" ? "HH:mm" :"yyyy-MM"}/>
                        </div>
                    </div>
                    <div className="dialog-item-wrap">
                        <div className="dialog-title-wrap"><span htmlFor="mission-name">任务名称：</span></div>
                        <div style={{display: 'inline-block', width: '244px'}}>
                            <Input
                                value={taskNamePre}
                                type="text"
                                onChange={this._handleTaskNamePre.bind(this)}
                                placeholder="任务名称"
                                style={{color: '#111'}}
                            />
                        </div>
                    </div>
                    <div className="dialog-item-wrap">
                        <div className="dialog-title-wrap"><span htmlFor="path">任务保存路径：</span></div>
                        <div className="model-wrap">
                            <div
                                className="model-inner"
                                id="path">
                            </div>
                        </div>
                        <div
                            id="save-path"
                            style={{display: isShowPathTree ? 'block' : 'none'}}
                            className="model-content">
                        </div>
                    </div>
                    {/*<div className="dialog-checkbox-wrap">
                        <Checkbox onChange={this._onChange.bind(this)}>立即生效</Checkbox>
                    </div>*/}
                </div>
            </div>
		)
	}
});

function _formatDate(date, type) {
    let y = date.getFullYear();
    let m = date.getMonth() + 1;
    m = m < 10 ? '0' + m : m;
    let d = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    let h = date.getHours();//小时 
    h = h < 10 ? ('0' + h) : h
    let minutes = date.getMinutes(); //分 
    minutes = minutes < 10 ? ('0' + minutes) : minutes
    let s = date.getSeconds(); //秒 
    s = s < 10 ? ('0' + s) : s
    if (type === 'time') {
        return h + ':' + minutes + ':' + s;
    } else if (type === 'day') {
        return y + '-' + m + '-' + d;
    } else {
        return y + '-' + m + '-' + d + ' ' + h + ':' + minutes + ':' + s;
    }  
};

function dialogRender(dialogData, callback) {
    store.dispatch({type: 'GETDIALOGMDATA', dialogData: dialogData});
    /*let title = dialogData.dialogData.rootEditType === 3 ? 
                    "module.role-edit-reset" :
                    "module.role-edit"*/
    var preState = store.getState();
    var editType = preState.editType
    Dialog.build({
        title: editType === 'add' ? window.i18n.t('module.task-build') : preState.editItem.schemeName,
        content: '<div id="root-dialog-wrap"></div>',
        width: 650,
        minHeight: 400,
        rightBtn: window.i18n.t("module.finish-btn"),
        leftBtn: window.i18n.t("module.cancel-btn"),
        rightBtnCallback: function() {
            var state = store.getState();
            var selectedPath = $('#save-path').fancytree('getTree').getActiveNode();
            var selectedModel = $('#selectModel').fancytree('getTree').getActiveNode();

            let executeTime = state.executeTime

            if (state.schemeName === '') {
                Notify.show({
                    title: i18n.t('info.notify-schemeName-not-filled'),
                    type: "info"
                });
                return
            }
            if (executeTime !== '') {
                let eHour = parseInt(executeTime.slice(0, 2), 10)
                let eMinute = parseInt(executeTime.slice(3, 5), 10)
                let t2 = new Date();
                let t1 = new Date();
                t1.setDate(t1.getDate() + 1)
                t2.getDate(t2.getDate());
                let nowTime = _formatDate(t2, 'time');

                let nHour = parseInt(nowTime.slice(0, 2), 10)
                let nMinute = parseInt(nowTime.slice(3, 5), 10)
                let isNextDay = false
                if (eHour > nHour) {
                    isNextDay = false
                }
                if (eHour < nHour) {
                    isNextDay = true
                }
                if (eHour === nHour) {
                    if (eMinute > nMinute) {
                        isNextDay = false
                    }
                    if (eMinute < nMinute ||　eMinute === nMinute) {
                        isNextDay = true
                    }
                }
                var nextTime2 = _formatDate(t2, 'day') + ' ' + executeTime.slice(0, 5);
                if (isNextDay) {
                    nextTime2 = _formatDate(t1, 'day') + ' ' + executeTime.slice(0, 5);
                }
            }
            if (selectedModel === null && state.editType === 'add') {
                Notify.show({
                    title: i18n.t('info.notify-model-not-filled'),
                    type: "info"
                });
                return
            }
            
            if (state.rangePickerValue.length === 0) {
                Notify.show({
                    title: i18n.t('info.notify-rangetime-not-filled'),
                    type: "info"
                });
                return
            }
            if (state.executeTime === '') {
                Notify.show({
                    title: i18n.t('info.notify-executetime-not-filled'),
                    type: "info"
                });
                return
            }
            if (state.executeInterval === '') {
                Notify.show({
                    title: i18n.t('info.notify-executeInterval-not-filled'),
                    type: "info"
                });
                return
            }
            if (state.taskNamePre === '') {
                Notify.show({
                    title: i18n.t('info.notify-taskNamePre-not-filled'),
                    type: "info"
                });
                return
            }
            if (selectedPath === null && editType === 'add') {
                Notify.show({
                    title: i18n.t('info.notify-path-not-filled'),
                    type: "info"
                });
                return
            }
            var executeTime2 = executeTime.slice(0, 5)
            var executeInterval = parseInt(state.executeInterval, 10)  //单位：小时
            var taskDirId
            if (selectedPath === null && editType === 'edit') {
                taskDirId = state.editItem.taskDirId
            } else {
                taskDirId = selectedPath.data.id
            }

            var postData = {
                modelId: state.editType === 'add' ? selectedModel.data.modelId : state.editItem.modelId,
                startDate: state.rangePickerValue[0],
                endDate: state.rangePickerValue[1],
                nextExecuteTime: nextTime2,
                executeTime: state.executeTime.slice(0, 5),
                executeInterval: executeInterval,
                taskNamePre: state.taskNamePre,
                taskDirId: taskDirId,
                enable: 0,
                schemeName: state.schemeName
            }
            if (editType === 'edit') {
                postData.schemeId = state.editItem.schemeId
                $.post("/regularexecution/regularexecution/editExecuteScheme", postData, function(rsp) {
                    if (rsp.code === 0) {
                        callback(rsp.data.schemeId)
                        Notify.show({
                            title: i18n.t('info.notify-edit-success'),
                            type: 'success'
                        })
                    } else {
                        Notify.show({
                            title: i18n.t('info.notify-edit-fail'),
                            type: 'error'
                        })
                        callback()
                    }
                }, 'json');
            } else {
                $.post("/regularexecution/regularexecution/addExecuteScheme", postData, function(rsp) {
                    if (rsp.code === 0) {
                        callback(rsp.data.schemeId)
                        Notify.show({
                            title: i18n.t('info.notify-add-success'),
                            type: 'success'
                        })
                    } else {
                        Notify.show({
                            title: i18n.t('info.notify-add-fail'),
                            type: 'error'
                        })
                    }
                }, 'json');
            }

            $.magnificPopup.close();
        }
    }).show(function() {
        $('#root-dialog-wrap').addClass('pn');

        ReactDOM.render(<Provider.default><DialogContent /></Provider.default>, document.getElementById('root-dialog-wrap'));
        
    })
}


module.exports.render = dialogRender