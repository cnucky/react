
import PageContent from '../module/page-content';
import React from 'react';
import ReactDOM from 'react-dom';
import {store} from '../module/store';

require ('./taskadmin-index.less');




class TaskadminWrapper  extends React.Component {
    
	constructor(props) {
        super(props);

    }

    componentDidMount() {
        this.unsubscribe = store.subscribe(() => {
            this.forceUpdate();
        });
        
    }

    shouldComponentUpdate(nextProps, nextState) {
    }

    componentWillUpdate(nextProps, nextState) {
    }

    componentWillUnmount() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }
	render () {
    
		var state = store.getState();
		const { tabsIcon, showFilterPanel, showFilterTitle, height, filterDropDownStatus, showGraph, dataList, tableSelectedAll, operateStart, dataIndex, userId, userName} = state
    const { allPeople, expandedKeys, checkedUserKeys, showPeoplePanel, selectedRowKeys, barData, taskTypeList, taskTypeName, isLoodGraph, isLoodTable, isLoodFilterTable, filterQuery} = state

        return (
          <div className="url_wrap" style={{height: `${height}px`}}> 
              	<PageContent
                  tabsIcon={tabsIcon}
                  height={height}
                  taskTypeList={taskTypeList}
                  taskTypeName={taskTypeName}
                  isLoodTable={isLoodTable}
                  filterQuery={filterQuery}
                  isLoodFilterTable={isLoodFilterTable}
                  showFilterPanel={showFilterPanel}
                  allPeople={allPeople}
                  expandedKeys={expandedKeys}
                  checkedUserKeys={checkedUserKeys}
                  showPeoplePanel={showPeoplePanel}
                  showFilterTitle={showFilterTitle}
                  filterDropDownStatus={filterDropDownStatus}
                  dataList={dataList}
                  tableSelectedAll={tableSelectedAll}
                  operateStart={operateStart}
                  selectedRowKeys={selectedRowKeys}
                  dataIndex={dataIndex}
                  userId={userId}
                  userName={userName}
                  showGraph={showGraph}
                  barData={barData}
                  isLoodGraph={isLoodGraph}
              	/>
          </div>
        )
	}

}

ReactDOM.render(<TaskadminWrapper />, document.getElementById('taskadmin-content'));
hideLoader();