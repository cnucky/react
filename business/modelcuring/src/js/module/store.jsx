var Redux = require('redux');

const height = ($(window).height() - 40)

const defaultState = {
    height: height,
    modelData: [],
    modelType: 'myApps'
}

var reducer = function(state = defaultState, action) {
    var newState = {};

    switch(action.type) {
        case 'GET_MODELDATA':
            let modelData = action.modelData
            newState.modelData = modelData
            return _.assign({}, state, newState)
         case 'GET_LISTDATA':
            let listData = action.listData
            newState.listData = listData
            return _.assign({}, state, newState)
        case 'GET_MODELTYPE':
            newState.modelType = action.modelType
            return _.assign({}, state, newState)
        default:
            return state;
    }
};


var store = Redux.createStore(reducer);

export {store};