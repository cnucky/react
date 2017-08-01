var Redux = require('redux');

const height = ($(window).height() - 72)


const defaultState = {
    height: height,
    schemesummaryList: [],
    tasksummarylist: [],
    showDetailTable: false
}

function _addKey (data) {
    let dataList = []
    if (typeof data !== 'undefined' &&
        data.length > 0) {
        dataList = (data).map(function (dataItem, index) {
            dataItem.key = index
            return dataItem
        })
    }
    return dataList
}

var reducer = function(state = defaultState, action) {
    var newState = {};

    switch(action.type) {
    	case "GET_SCHEMESUMMARYLIST":
    		newState.schemesummaryList = _addKey(action.schemesummaryList);
            return _.assign({}, state, newState)
    	case "GET_TASKSUMMARYLIST":
            newState.tasksummarylist = action.tasksummarylist;
            if (typeof action.showDetailTable !== 'undefined') {
                newState.showDetailTable = action.showDetailTable
            }
            return _.assign({}, state, newState)
        case "GET_SHOWDETAILTABLE":
            newState.showDetailTable = action.showDetailTable
            return _.assign({}, state, newState)
        default:
            return state;
    }
};


var store = Redux.createStore(reducer);

export {store};