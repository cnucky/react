var Redux = require('redux');

const height = ($(window).height() - 72)


const defaultState = {
	tabsIcon: [{
     	name: '表格',
     	isActive: true
	}, {
		name: '图表',
     	isActive: false
	}],
	showFilterPanel: false,
    showPeoplePanel: false,
	showFilterTitle: true,
	height: height,
	filterDropDownStatus: {
		showStatus: true,
		showTime: true,
		showLevel: true
	},
    dataIndex:null,
    showGraph:false,
	height: height,
    barData: [],
    taskTypeList: {},
    filterQuery: {},
    isLoodGraph: false,
    isLoodTable: false,
    isLoodFilterTable: false,
    allPeople: [],
    expandedKeys: [],
    checkedUserKeys: [],
    userId: [],
    userName: [],
    dataList: [],
    tableSelectedAll: false,
    operateStart: false,
    selectedRowKeys: ''
}

var reducer = function(state = defaultState, action) {
    var newState = {};

    switch(action.type) {
        case 'TASKTYPELIST_GET':
            newState.taskTypeList = {...action.taskTypeList};
            return _.assign({}, state, newState);
        case 'TASKTYPENAME_GET':
            newState.taskTypeName = [...action.taskTypeName];
            return _.assign({}, state, newState);
        case 'CHANGE_TABSICON':
        	newState.tabsIcon = action.tabsIcon;
        	newState.showFilterTitle = action.showFilterTitle;
        	if(action.showFilterTitle){
                newState.showGraph = false;
            }
            return _.assign({}, state, newState);
        case 'CHANGE_FILTEEPANEL':
            newState.showFilterPanel = action.showFilterPanel;
            return _.assign({}, state, newState);
        case 'CHANGE_PEOPLEPANEL':
            newState.showPeoplePanel = action.showPeoplePanel;
            return _.assign({}, state, newState);
        case 'CHANGE_FILTEEPANEL_DROUPDOWNSTATUS':
        	newState.filterDropDownStatus = action.filterDropDownStatus;
        case 'SHOW_GRAPH_ANALY':
            if(state.dataIndex === action.dataIndex){
                newState.showGraph = !state.showGraph;
            } else {
                newState.showGraph = true;
            }
            newState.dataIndex = action.dataIndex;
            return _.assign({}, state, newState);
        case 'GRAPHBARDATA_GET':
            newState.barData = [...action.barData];
            return _.assign({}, state, newState);
        case 'LOODGRAPHDATA_GET':
            newState.isLoodGraph = action.isLoodGraph;
            return _.assign({}, state, newState);
        case 'LOODTABLEDATA_GET':
            newState.isLoodTable = action.isLoodTable;
            return _.assign({}, state, newState);
        case 'LOODFILTERTABLE_GET':
            newState.isLoodFilterTable = action.isLoodFilterTable;
            return _.assign({}, state, newState);
        case 'FILTEQUERY_GET':
            newState.filterQuery = {...action.filterQuery};
            return _.assign({}, state, newState);
        case 'METADATA_FETCHED':
            newState.dataList = action.dataList;
            if (typeof action.operateStart !== 'undefined') {
                newState.operateStart = action.operateStart
            }
            return _.assign({}, state, newState);
        case 'ALLPEOPLE_FETCH':
            newState.allPeople = action.allPeople;
            return _.assign({}, state, newState);
        case 'EXPANDKEYS_GET':
            newState.expandedKeys = action.expandedKeys;
            return _.assign({}, state, newState);
        case 'CHECKKEYS_GET':
            newState.checkedUserKeys = action.checkedUserKeys;
            return _.assign({}, state, newState);
        case 'USERID_GET':
            newState.userId = action.userId;
            return _.assign({}, state, newState);
        case 'USERNAME_GET':
            newState.userName = action.userName;
            newState.dataIndex = action.data
            return _.assign({}, state, newState);
        case 'SHOW_GRAPH':
            newState.showGraph = action.showGraph;
            return _.assign({}, state, newState);
        case 'METADATA_FETCHED':
            newState.dataList = action.dataList;
            return _.assign({}, state, newState);
        case 'CHANGETABLESELECTEDALL':
            newState.tableSelectedAll = action.tableSelectedAll
            return _.assign({}, state, newState)
        case 'STARTALLOPERATE':
            newState.dataList = action.dataList
            newState.operateStart = action.operateStart
            return _.assign({}, state, newState)
        case 'GET_SELECTEDROWKEYS':
            newState.selectedRowKeys = action.selectedRowKeys
            return _.assign({}, state, newState)
        default:
            return state;
    }
};


var store = Redux.createStore(reducer);

export {store};