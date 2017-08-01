import React from 'react';
import {render} from 'react-dom';
import {store} from './store';
import Notify  from  'nova-notify';
import TableWrap from './taskadmin/table-wrap';
import Graph from './taskadmingraph/graph-content';



class PageContent extends React.Component {

    constructor(props) {
        super(props);
    }


    componentWillReceiveProps(nextProps) {

    }

    _formatDate(date) {
        let y = date.getFullYear();
        let m = date.getMonth() + 1;
        m = m < 10 ? '0' + m : m;
        let d = date.getDate();
        d = d < 10 ? ('0' + d) : d;
        return y + '-' + m + '-' + d;
    }

    _getTasks(){
        let now = new Date();
        let nowDate =  new Date(Date.parse(now) - 1*24*60*60*1000);
        let dataIndex = this._formatDate(nowDate );
        $.getJSON('/taskadmin/taskadmingraph/getgraphpieclass',{
            "date":dataIndex,
            "statisticsType":"taskType"
        } ,res=>{
            if (res.code == 0) {
                let pieClassNames = [];
                _.each(res.data, (value,index) => {
                    pieClassNames = [
                        ...pieClassNames,
                        index
                    ]
                });
                store.dispatch({type: 'TASKTYPENAME_GET', taskTypeName: pieClassNames})
            } else {
                Notify.simpleNotify('错误', res.message, 'error');
            }
        });

    }

    componentDidMount() {
        this._getTaskType();
        this._getTasks();
        this. _getPerson();
    }

    _getTaskType(){
        $.getJSON('/taskadmin/taskadmingraph/gettasktype',{
            "configName":"config_tasktype.xml",
            "configLanguage":"zh"
        } ,res=>{
            if (res.code == 0) {
                store.dispatch({type: 'TASKTYPELIST_GET', taskTypeList: res.data})

            } else {
                Notify.simpleNotify('错误', res.message, 'error');
                hideLoader();
            }
        });

    }

    _getPerson(){
        $.getJSON("/department/listallnoauth", function(res) {
            if (res.code == 0) {
                let expandedKeys = [];
                const getExpandedKeys = data => data.forEach((item) => {
                    expandedKeys.push(item.key)
                });
                getExpandedKeys(res.data);
                store.dispatch({type: 'ALLPEOPLE_FETCH', allPeople: res.data});
                store.dispatch({type: 'EXPANDKEYS_GET', expandedKeys: expandedKeys});
            }
        });

    }


    _handleTabsIcon (icon, index) {
        var tabsIcon = this.props.tabsIcon
        for (let i = 0; i < this.props.tabsIcon.length; i++) {
            if (index === i) {
                tabsIcon[index].isActive = true
            } else {
                tabsIcon[i].isActive = false
            }
        }
        store.dispatch({type: 'CHANGE_TABSICON', tabsIcon: tabsIcon, showFilterTitle: index === 0})
    }


    render() {

        const { tabsIcon, showFilterPanel, showFilterTitle, height, filterDropDownStatus, showGraph, dataList, tableSelectedAll, operateStart, dataIndex, userId, userName} = this.props;
        const {allPeople, expandedKeys, checkedUserKeys, showPeoplePanel, selectedRowKeys , barData, taskTypeList, taskTypeName, isLoodGraph, isLoodTable, isLoodFilterTable, filterQuery} = this.props;
        const taskStatusList = {
            finished: '完成',
            cancelling: '等待停止',
            running: '运行',
            error: '出错',
            parterror: '部分出错',
            cancelled: '停止',
            examing: '审批中',
            toexam: '待审批',
            examfailed:'审批拒绝'
        }

        return (
            <div className="page-content">
                <div className="page-tabs-wrap" >
                    <ul>
                        {_.map(tabsIcon, function(iconItem, index) {
                            return (
                                <li onClick={this._handleTabsIcon.bind(this, iconItem, index)}>
                                    <a style={{color: iconItem.isActive ? '#fff' : '#444', backgroundColor: iconItem.isActive ? '#2db7f5' : '#eee'}}>{iconItem.name}</a>
                                </li>
                            )
                        }, this)}
                    </ul>
                </div>
                <div  style={{height: `${height - 60}px`}}>
                    {showFilterTitle ?
                        <TableWrap
                        tabsIcon={tabsIcon}
                        height={height - 60}
                        taskTypeList={taskTypeList}
                        taskStatusList={taskStatusList}
                        taskTypeName={taskTypeName}
                        isLoodTable={isLoodTable}
                        isLoodFilterTable={isLoodFilterTable}
                        filterQuery={filterQuery}
                        showFilterPanel={showFilterPanel}
                        allPeople={allPeople}
                        expandedKeys={expandedKeys}
                        checkedUserKeys={checkedUserKeys}
                        showPeoplePanel={showPeoplePanel}
                        showFilterTitle={showFilterTitle}
                        filterDropDownStatus={filterDropDownStatus}
                        dataList={dataList}
                        userId={userId}
                        userName={userName}
                        tableSelectedAll={tableSelectedAll}
                        operateStart={operateStart}
                        selectedRowKeys={selectedRowKeys}
                        /> :
                        <Graph
                        height={height - 60}
                        showGraph={showGraph}
                        dataIndex={dataIndex}
                        taskTypeList={taskTypeList}
                        barData={barData}
                        isLoodGraph={isLoodGraph}
                        />
                    }
                </div>
            </div>
        )
    }
}

export default PageContent;
