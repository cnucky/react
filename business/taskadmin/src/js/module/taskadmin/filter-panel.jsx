import React from 'react';
import {render} from 'react-dom';
import {store} from '../store';
import { Checkbox, Select } from 'antd';
const CheckboxGroup = Checkbox.Group;
import { Input, Tooltip, Tag } from 'antd';
import { Menu, Dropdown, Button, Icon, DatePicker } from 'antd';
const { Option, OptGroup } = Select;
const { MonthPicker, RangePicker } = DatePicker;
const Notify = require('nova-notify');
var moment = require('moment');

var DateTimeRangePicker = require('widget/dateTimeWidget/datetimeRangePicker');
const defaultStartTime = moment().add(-7,'days').format('YYYY-MM-DD HH:mm:ss')
const defaultEndTime = moment().format('YYYY-MM-DD HH:mm:ss')
const defaultTimeRange = [defaultStartTime,defaultEndTime]
let timeValue = defaultTimeRange;
// var DateTimeRangePicker = require('widget/dateTimeWidget/datetimeRangePicker');


let submitConds = {
    timeType:"time",     //time为日期,datatime为时间
    value:[],
    selectedValue:[],
    trackData:{}
};
submitConds.value.push(moment().subtract(1, 'month').format("YYYY-MM-DD HH:mm:ss"));
submitConds.value.push(moment().format("YYYY-MM-DD HH:mm:ss"));

const stateOptions = [
    {value: 'finished', label: '完成'},
    {value: 'cancelling', label: '等待停止'},
    {value: 'running', label: '运行'},
    {value: 'error', label: '出错'},
    {value: 'parterror', label: '部分出错'},
    {value: 'cancelled', label: '停止'},
    {value: 'examing', label: '审批中'},
    {value: 'toexam', label: '待审批'},
    {value: 'examfailed', label: '审批拒绝'}
];


const levelOptions = [
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' }
];

/*const submitConds = {
    timeType: "datatime",     //time为日期,datatime为时间
    value:[],
    selectedValue:[],
    trackData:{}
};

submitConds.value.push(moment().subtract(1, 'year').format("YYYY-MM-DD"));
submitConds.value.push(moment().format("YYYY-MM-DD"));*/

class FilterPanel extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            userTitle:'',
            isShowPathTree: false,
            taskNameContain: '',
            taskStatus: [],
            taskType: [],
            submitTime: [],
            startTime: '',
            endTime: '',
            leval: [],
            startTimeDefault: '',
            endTimeDefault: '',
            filterDropDownStatus: {
                showStatus: true,
                showTime: true,
                showLevel: true,
                showTaskType: true
            },
            defaultUserName: '',
            timeValue: []
        }

    }

    componentWillReceiveProps(nextProps) {

    }

    _formatDate(date) {
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
        return y + '-' + m + '-' + d + ' ' + h + ':' + minutes + ':' + s;
    }

    componentDidMount() {
        let t1 = new Date();
        t1.setDate(t1.getDate() - 6)
        let startTime = this._formatDate(t1)
        let t2 = new Date();
        t2.setDate(t2.getDate())
        let endTime = this._formatDate(t2)
        const { dataList } = this.props
        let submitUserId = ''
        let defaultUserName = ''
        if (typeof dataList !== 'undefined' && dataList.length > 0) {
            submitUserId = this.props.dataList[0].submitUserId
            defaultUserName = this.props.dataList[0].submitUserName
        }

        this.setState({
            startTimeDefault: startTime,
            endTimeDefault: endTime,
            submitUserId: submitUserId,
            defaultUserName: defaultUserName
        })
        /*if (typeof this.props.dataList !== 'undefined' &&
            this.props.dataList.length > 0) {
            let defaultUserName = this.props.dataList[0].submitUserName
            this.setState({
                defaultUserName: defaultUserName
            })
        }*/
    }

    _handleKeyClick(data, e) {
        
    }
    _handleVisibleChange(flag) {
        // console.log(flag, 'flag')
    }

    _getHeaderContent(title, isDroupDown, handleClick) {
        var headerContent = (
                <div className="state-header">
                    <span className="state-title lf">{title}</span>
                    <span onClick={handleClick} className="state-title state-icon rt">
                        <Icon type={isDroupDown ? 'up' : 'down'} />
                    </span>
                </div>
            )
        return headerContent

    }

    _handleShowStatusChange(type) {
        let filterDropDownStatus = this.state.filterDropDownStatus
        filterDropDownStatus[type] = !this.state.filterDropDownStatus[type]
        this.setState({
            filterDropDownStatus: filterDropDownStatus
        })
        // store.dispatch({type: 'CHANGE_FILTEEPANEL_DROUPDOWNSTATUS', filterDropDownStatus: filterDropDownStatus})
    }
    _handleSubmitClick() {
        const { numValue, getInitFilterData, userId } = this.props;
        const { taskNameContain, taskStatus, taskType, startTime, endTime } = this.state
        let submitData = {
            index: 0,
            pageSize: numValue,
            orderBy: 'submitTime',
            orderType: 'desc'
        }
        submitData.submitUserIds = userId
        submitData.taskNameContain = taskNameContain
        submitData.taskStatus = taskStatus
        submitData.taskType = taskType
        // if (submitUserId === '') {
        //     Notify.show({
        //         title: "创建者未选择",
        //         type: "info"
        //     });
        //     return
        // } else {
        //     submitData.submitUserId = submitUserId
        // }
        // if (taskNameContain === '') {
        //     Notify.show({
        //         title: "标题包含未填写",
        //         type: "info"
        //     });
        //     return
        // } else {
        //     submitData.taskNameContain = taskNameContain
        // }
        // if (taskStatus.length === 0) {
        //     Notify.show({
        //         title: "状态未勾选",
        //         type: "info"
        //     });
        //     return
        // } else {
        //     submitData.taskStatus = taskStatus
        // }
        // if (taskType.length === 0) {
        //     Notify.show({
        //         title: "任务类型未选择",
        //         type: "info"
        //     });
        //     return
        // } else {
        //     submitData.taskType = taskType
        // }
        let submitTime = submitConds.value
        submitData.submitTime = submitTime
        // if (submitTime.length === 0) {
        //     Notify.show({
        //         title: "时间未填写",
        //         type: "info"
        //     });
        //     return
        // } else {
        //     submitData.submitTime = submitTime
        // }
        store.dispatch({type: 'FILTEQUERY_GET', filterQuery: submitData});
        $.getJSON( "/taskadmin/taskadmin/searchdata", submitData)
            .done(function( data ) {
                var dataList = []
                _.each(data.data.taskInfos, item => {
                    item.key = item.taskId
                    dataList.push(item)
                })
                store.dispatch({type: 'METADATA_FETCHED', dataList: dataList});
                getInitFilterData(1,data.data.totalNum);
                store.dispatch({type: 'LOODFILTERTABLE_GET', isLoodFilterTable: true});
                store.dispatch({type: 'CHANGE_FILTEEPANEL', showFilterPanel: false});
                store.dispatch({type: 'CHANGE_PEOPLEPANEL', showPeoplePanel: false})
            })
            .fail(function( jqxhr, textStatus, error ) {
                var err = textStatus + ", " + error;
                console.log( "Request Failed: " + err );
            });
        // store.dispatch({type: 'CHANGE_FILTEEPANEL', showFilterPanel: !this.props.showFilterPanel})



        // store.dispatch({type: 'CHANGE_FILTEEPANEL', showFilterPanel: !this.props.showFilterPanel})
    }

    _handleChange (value) {
        let submitUserId = value
        this.setState({
            submitUserId: submitUserId
        })
    }

    _handleTypeChange (value) {
        this.setState({
            taskType: value
        })
    }

    _getOptions (type) {
        const { dataList } = this.props
        let options = ''
        options = _.map(dataList, function (listItem, index) {
            let value = ''
            let title = ''
            switch (type) {
                case 'submitUserName':
                    title = listItem.submitUserName
                    value = listItem.submitUserId
                    break
                case 'taskType':
                    title = listItem.taskType
                    value = title
            }
            return (
                <Option value={value}>{title}</Option>
            )
        })
        return options
    }

    _onChangetitle (e) {
        let value = e.target.value
        this.setState({
            taskNameContain: value
        })
    }

    _handleStatusChange (checkedValues) {
        this.setState({
            taskStatus: checkedValues
        })
    }

    _handleTaskTypeChange (checkedValues) {
        this.setState({
            taskType: checkedValues
        })
    }

    _handleLevelChange (checkedValues) {
        this.setState({
            level: checkedValues
        })
    }
    /*_handleTimeChange (type, e) {
        let value = e.target.value
        console.log(value, 'timeValue')
        if (type === 'start') {
            this.setState({
                startTime: value
            })
        } else {
            this.setState({
                endTime: value
            })
        }
        
    }*/

    _handleCancelClick () {
        store.dispatch({type: 'CHANGE_FILTEEPANEL', showFilterPanel: false})
        store.dispatch({type: 'CHANGE_PEOPLEPANEL', showPeoplePanel: false})
    }

    _handleTimeChange (value, dateString) {
        this.setState({
            submitTime: dateString,
            timeValue: value
        })
    }

    _getDateRangeValue(start,end){
       /* submitConds.value[0] =start;
        submitConds.value[1] = end;*/
    }

    _getDateRangeValue (start,end){
        submitConds.value[0] =start;
        submitConds.value[1] = end;
    }

    getCreator(){
        store.dispatch({type: 'CHANGE_PEOPLEPANEL', showPeoplePanel: !this.props.showPeoplePanel})
    }

	render() {
        const { showFilterPanel, dataList, taskTypeList, taskTypeName, userName } = this.props
        const { startTime, endTime, filterDropDownStatus, endTimeDefault, startTimeDefault, defaultUserName, submitTime, timeValue ,userTitle} = this.state

        let typeOptions = [];
        _.each(taskTypeName, value => {
            let typeObj = {};
            typeObj.value = value;
            typeObj.label = taskTypeList[value];
            typeOptions = [
                ...typeOptions,
                typeObj
            ]
        });

        let userNameTitle = [];
        _.each(userName, item => {
            userNameTitle.push(<Tag color="#87d068">{item}</Tag>);
        })

		return (
			<div className="filter-panel-content">
                <div className="filter-content">
                    <span>筛选</span>
                </div>
                <div className="title-wrap">
                    <span className="title-style">标题包含：</span>
                    <div className="input-wrap">
                        <Tooltip
                            trigger={['focus']}
                            placement="topLeft"
                            overlayClassName="numeric-input"
                        >
                            <Input
                                {...this.props}
                                onChange={this._onChangetitle.bind(this)}
                                onBlur={this.onBlur}
                                placeholder=""
                                maxLength="25"
                            />
                        </Tooltip>
                    </div>
                </div>
                <div className="auther-wrap">
                    <span className="auther-title">创建者：</span>
                    <div className="auther-menu-wrap">
                        <Tooltip placement="bottom"  title={userNameTitle.length>0? userNameTitle : <span style={{color:'rgba(120,0,0,0.8)',fontSize:'14px'}}>点击选择创建者</span> }>
                           <span
                               className="auther-menu-content"
                               onClick={this.getCreator.bind(this)}
                           >
                              {userNameTitle}
                           </span>
                        </Tooltip>
                    </div>
                </div>
                <div className="auther-wrap">
                    {this._getHeaderContent('任务类型：', filterDropDownStatus.showTaskType, this._handleShowStatusChange.bind(this, 'showTaskType'))}
                    <div className="state-choose-wrap" style={{display: filterDropDownStatus.showTaskType ? 'block' : 'none'}}>
                        <CheckboxGroup
                            onChange={this._handleTaskTypeChange.bind(this)}
                            options={typeOptions}
                        />
                    </div>
                </div>
                <div className="state-wrap">
                    {this._getHeaderContent('状态：', filterDropDownStatus.showStatus, this._handleShowStatusChange.bind(this, 'showStatus'))}
                     <div className="state-choose-wrap" style={{display: filterDropDownStatus.showStatus ? 'block' : 'none'}}>
                        <CheckboxGroup
                            onChange={this._handleStatusChange.bind(this)}
                            options={stateOptions}
                        />
                     </div>
                </div>
                <div className="time-wrap">
                    {this._getHeaderContent('时间：',  filterDropDownStatus.showTime, this._handleShowStatusChange.bind(this, 'showTime'))}
                     <div className="time-choose-wrap" style={{display: filterDropDownStatus.showTime ? 'block' : 'none'}}>
                        {/*<RangePicker
                            showTime
                            format="yyyy-MM-dd HH:mm:ss"
                            placeholder={['Start Time', 'End Time']}
                            onChange={this._handleTimeChange.bind(this)}
                        />*/}
                        <DateTimeRangePicker
                                callback={this._getDateRangeValue}
                                type="calenderRange"
                                value={submitConds.value}
                                inputWidth='200'
                                formatString = "yyyy-MM-dd HH:mm:ss"/>
                     </div>
                </div>
                <div className="level-wrap">
                    {this._getHeaderContent('优先级：',  filterDropDownStatus.showLevel, this._handleShowStatusChange.bind(this, 'showLevel'))}
                     <div className="level-choose-wrap" style={{display: filterDropDownStatus.showLevel ? 'block' : 'none'}}>
                        <CheckboxGroup
                            options={levelOptions}
                            defaultValue={''}
                            onChange={this._handleLevelChange.bind(this)}
                        />
                     </div>
                </div>
                {/*<DateTimeRangePicker
                    callback={this._getDateRangeValue}
                    type="calenderRange"
                    value={submitConds.value}
                    formatString={"yyyy-MM-dd HH:mm:ss"}
                />*/}
                <div className="submit-btn-wrap">
                    <Button onClick={this._handleSubmitClick.bind(this)} type="primary" className="submit-btn">提交</Button>
                    <Button onClick={this._handleCancelClick.bind(this)} type="primary" className="submit-btn margin-left20">取消</Button>
                </div>
			</div>
		)
	}
}

export default FilterPanel


