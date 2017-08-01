import React from 'react';
import {render} from 'react-dom';
import {store} from '../store';
import PeoplePanel from './people-panel';
import FilterPanel from './filter-panel';
import TableContent from './table-content';
import { Select, Input } from 'antd';
const Search = Input.Search;
const Option = Select.Option;


class TableWrap extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            value: '',
            numValue: 20,
            showFilterPanel: false,
            pagination: {pageSize: 20},
            loading: false
        };
        
    }


    _refreshData() {
        const { pagination , numValue} =this.state;
        const {isLoodFilterTable, filterQuery} = this.props;
        filterQuery.index = (pagination.current-1)*numValue;
        filterQuery.pageSize = numValue;
        this.setState({
            loading: true
        });
        if(isLoodFilterTable){
            this._getFilterTableData(filterQuery,numValue);
        }else{
            this._getTableData(pagination.current,numValue);
        }
    }



    _handleTableChange(pagination, filters, sorter){
        const {isLoodFilterTable, filterQuery} = this.props;
        const { numValue } = this.state;
        const pager ={...this.state.pagination};
        pager.current = pagination.current;
        this.setState({
            pagination: pager,
            loading: true
        });
        filterQuery.index = (pagination.current-1)*numValue;
        filterQuery.pageSize = numValue;
        if(isLoodFilterTable){
            this._getFilterTableData(filterQuery,numValue);
        }else{
            this._getTableData(pagination.current,numValue);
        }

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

    _getInitFilterData(current,totalNum){
        const pager ={...this.state.pagination};
        pager.current = current;
        pager.total = totalNum;
        this.setState({
            pagination: pager
        });
    }


    _getFilterTableData(submitData,numValue){
        let that = this;
        $.getJSON( "/taskadmin/taskadmin/searchdata", submitData)
        .done(function( data ) {
            var dataList = []
            _.each(data.data.taskInfos, item => {
                item.key = item.taskId
                dataList.push(item)
            })
            const pagination = {...that.state.pagination }
            pagination.total = data.data.totalNum;
            pagination.pageSize = numValue;
            store.dispatch({type: 'METADATA_FETCHED', dataList: dataList});
            that.setState({
                loading: false,
                pagination
            });
        })
        .fail(function( jqxhr, textStatus, error ) {
            var err = textStatus + ", " + error;
            console.log( "Request Failed: " + err );
        });
    }

    _getTableData(pageIndex=1,numValue){
        let that= this;
        let t1 = new Date();
        t1.setDate(t1.getDate() - 7)
        let startTime = this._formatDate(t1)
        let t2 = new Date();
        t2.setDate(t2.getDate())
        let endTime = this._formatDate(t2)

        $.getJSON( "/taskadmin/taskadmin/searchdata", {
            submitTime:[
                startTime,
                endTime
            ],
            index: (pageIndex-1)*numValue,
            pageSize: numValue,
            orderBy: 'submitTime',
            orderType: 'desc'
        })
        .done(function( data ) {
            var dataList = []
            _.each(data.data.taskInfos, item => {
                item.key = item.taskId
                dataList.push(item)
            })
            const pagination = {...that.state.pagination }
            pagination.total = data.data.totalNum;
            pagination.pageSize = numValue;
            store.dispatch({type: 'METADATA_FETCHED', dataList: dataList});
            store.dispatch({type: 'LOODTABLEDATA_GET', isLoodTable: true});
            that.setState({
                loading: false,
                pagination
            });
        })
        .fail(function( jqxhr, textStatus, error ) {
            var err = textStatus + ", " + error;
            console.log( "Request Failed: " + err );
        });
    }

    componentDidMount() {
        const { numValue } = this.state;
        this._getTableData(undefined,numValue);
    }

    _handleFilterClick() {
        store.dispatch({type: 'CHANGE_PEOPLEPANEL', showPeoplePanel: false})
        store.dispatch({type: 'CHANGE_FILTEEPANEL', showFilterPanel: !this.props.showFilterPanel})
    }
   
    _handleSeachChange(e) {
        const { value } = e.target
        const { dataList , taskTypeList, taskStatusList} = this.props
        let dataListCopy = []
        if (value !== '') {
            for (let i = 0; i < dataList.length; i++) {
                if ((typeof dataList[i].taskType !== 'undefined'  && taskTypeList[dataList[i].taskType].indexOf(value) > -1) ||
                    (typeof dataList[i].taskName !== 'undefined' && dataList[i].taskName.indexOf(value) > -1) ||
                    (typeof dataList[i].submitTime !== 'undefined' && dataList[i].submitTime.indexOf(value) > -1) ||
                    (typeof dataList[i].taskPriority !== 'undefined' && (dataList[i].taskPriority + '').indexOf(value) > -1) ||
                    (typeof dataList[i].taskStatus !== 'undefined' && taskStatusList[dataList[i].taskStatus].indexOf(value) > -1) ||
                    (typeof dataList[i].submitUserName !== 'undefined' && dataList[i].submitUserName.indexOf(value) > -1)) {
                    dataListCopy.push(dataList[i])
                }
            }
        } else {
            dataListCopy = dataList
        }
        this.setState({
            value: value,
            dataList: dataListCopy
        })
       
    }

    _handleChange (value) {
        this.setState({
            numValue: value
        });
        const { pagination } =this.state;
        const {isLoodFilterTable, filterQuery} = this.props;
        filterQuery.index = (pagination.current-1)*value;
        filterQuery.pageSize = value;
        if(isLoodFilterTable){
            this._getFilterTableData(filterQuery,value);
        }else{
           this._getTableData(pagination.current,value);
        }
    }

    _getOptions(){
        const numList = [20,30,45,60,75,100];
        let options = '';
        options = _.map(numList, value => {
            return <Option value={value}>{value}</Option>
        });
        return options;
    }

    _handlePressEnter() {
        // console.log(this.state.value, 'value')
    }

	render() {
        const { showFilterTitle, showFilterPanel, filterDropDownStatus, dataList, height, taskTypeName, tableSelectedAll, operateStart, selectedRowKeys } = this.props
        const { allPeople, expandedKeys, checkedUserKeys, showPeoplePanel, taskTypeList, taskStatusList, userId, userName} = this.props;
        const { value, loading, pagination, numValue } = this.state;
		return (
			<div className="taskadmin-wrap">
            	<div className="taskadmin-header-wrap">
            	    <span style={{visibility: showFilterTitle ? 'visible' : 'hidden'}} onClick={this._handleFilterClick.bind(this)} className="lf filter-set noselect">筛选设置</span>
                    <span onClick={this._refreshData.bind(this)} className={loading? "page-loading glyphicon glyphicon-refresh fs16": "page-refresh glyphicon glyphicon-refresh fs16"}></span>

                    <div className="search-wrap rt" style={{visibility: showFilterTitle ? 'visible': 'hidden'}}>
                        <Input
                            ref="input"
                            placeholder="请输入关键字"
                            value={this.state.value}
                            style={{paddingRight: '24px'}}
                            onPressEnter={this._handlePressEnter.bind(this)}
                            onChange={this._handleSeachChange.bind(this)}
                        />
                        {/*<span onClick={this._handlePressEnter.bind(this)} className="glyphicon glyphicon-search search-icon"></span>*/}
                    </div>
            	</div>

                <div className="admintask-table-wrap" style={{height: `${height - 40}px`}}>
                    <TableContent
                        taskTypeList={taskTypeList}
                        taskStatusList={taskStatusList}
                        selectedRowKeys={selectedRowKeys}
                        tableSelectedAll={tableSelectedAll}
                        operateStart={operateStart}
                        height={height}
                        value={value}
                        load={loading}
                        pagination={pagination}
                        dataListCopy={dataList}
                        dataList={typeof this.state.dataList !== 'undefined' ? this.state.dataList : dataList}
                        refreshChange={this._refreshData.bind(this)}
                        handleTableChange={this._handleTableChange.bind(this)}
                    />
                </div>
                <div
                    style={{display: showFilterPanel ? 'block' : 'none'}}
                    className="taskadmin-panel-wrap"
                >
                    <FilterPanel
                        showFilterTitle={showFilterTitle}
                        taskTypeList={taskTypeList}
                        taskTypeName={taskTypeName}
                        dataList={dataList}
                        userId={userId}
                        userName={userName}
                        showPeoplePanel={showPeoplePanel}
                        filterDropDownStatus={filterDropDownStatus}
                        showFilterPanel={showFilterPanel}
                        numValue={numValue}
                        getInitFilterData={this._getInitFilterData.bind(this)}
                    />
                </div>
                <div
                    style={{display: showPeoplePanel ? 'block' : 'none'}}
                    className="taskadmin-people-wrap"
                >
                    {showPeoplePanel ?<PeoplePanel
                        allPeople={allPeople}
                        expandedKeys={expandedKeys}
                        checkedUserKeys={checkedUserKeys}
                    />:''}
                </div>
                <div className="page-size-wrap">
                    <span style={{color:'#3498db'}}>每页显示{' '}</span>
                    <Select
                        value={this.state.numValue}
                        style={{ width: 50}}
                        onChange={this._handleChange.bind(this)}
                    >
                        {this._getOptions()}
                    </Select>
                    <span style={{color:'#3498db'}}>{' '}条</span>
                </div>
			</div>
		)
	}
}

export default TableWrap


