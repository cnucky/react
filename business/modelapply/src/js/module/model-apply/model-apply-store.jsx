var Redux = require('redux');
var _ = require('underscore');
var Theme = require('./Theme');
var utils = require('nova-utils');
var modelId = utils.getURLParameter('modelid');
const Notify = require('nova-notify');

/** store */

var reducer = function(state = {},action) {
    switch(action.type) {
        case 'REPLACE': {
            return _.assign({}, state, { data: action.data });
        }
        case 'REPLACE_COMPINENTS': {
            let data = state.data;
            data.viewDetail.components = action.components;
            return _.assign({}, state, { data: data });
        }
        case 'COMPONENT_DROP':{
            let data = state.data;
            let components = data.viewDetail.components;
            let position = _.findIndex(components, function(component) {
                return component.identity == -1;
            });
            if(position != -1) {
                //分配最新且唯一的index
                let newIndex = components.length;
                    for(let i = newIndex; ;i++) {
                        let position_newIndex = _.findIndex(components, function(component) {
                            return component.identity == i;
                        });
                        if(position_newIndex == -1) {
                            newIndex = i;
                            break;

                        }
                    }
                    //修改components
                    components[position].identity = newIndex;
                    components[position].opacity = action.opacity;
                }
                data.viewDetail.components = components;
                return _.assign({}, state, { data: data });
            }

        case 'COMPONENT_IN':{
            let data = state.data;
            let components = data.viewDetail.components;
            let component = {
                identity: -1,
                type: action.name,
                opacity: "0.5",
                isSelected: false,
                display: 'none',
                border: '1px solid transparent',
                size: "100%",
                condition: {
                    selectData: [], /**选中的数据**/
                    title: "",
                    field: [],
                    value: [],
                    opr: "等于",
                    hint: "",
                    isRequired: true,
                    hideOpr: true,
                    isMultiple: false
                }
            }
            if(component.type =='datetime'){
                component.condition.timeType='day';
            }
            if(component.type =='date'){
                component.condition.opr="等于";
            }
            components.push(component);
            data.viewDetail.components = components;
            return _.assign({}, state, { data: data });
        }
        case 'COMPONENT_OUT':
            {
                let data = state.data;
                let components = data.viewDetail.components;
                let position = _.findIndex(components, function(component) {
                    return component.identity == -1;
                });
                components.splice(position, 1);
                data.viewDetail.components = components;
                return _.assign({}, state, { data: data });
            }
        case 'BUBBLE':
            {
                let data = state.data;
                let components = data.viewDetail.components;
                let draggedIndex = 0;
                let droppedIndex = 0;
                for (let i = 0; i < components.length; i++) {
                    (components[i].identity == action.draggedID) && (draggedIndex = i);
                    (components[i].identity == action.droppedID) && (droppedIndex = i);
                }
                /** 冒泡 */
                let temp = components[draggedIndex];
                components.splice(draggedIndex, 1);
                components.splice(droppedIndex, 0, temp);
                data.viewDetail.components = components;
                return _.assign({}, state, { data: data });
            }
        case 'CHANGE_OPACITY':
            {
                let data = state.data;
                let components = data.viewDetail.components;
                for (let i = 0; i < components.length; i++) {
                    if (components[i].identity == action.index) {
                        components[i].opacity = action.opacity;
                        break;
                    }
                }
                data.viewDetail.components = components;
                return _.assign({}, state, { data: data });
            }
        case 'CHANGE_TIMETYPE':
            {

                let data = state.data;
                let components = data.viewDetail.components;
                for (let i = 0; i < components.length; i++) {
                    if (components[i].identity == action.index) {
                        components[i].condition.timeType = action.timeType ||'day';
                        break;
                    }

                    }
                data.viewDetail.components = components;
                return _.assign({}, state, { data: data });
            }
        case 'DELETE_COMPONENT':
            {
                let data = state.data;
                let components = data.viewDetail.components;
                for (let i = 0; i < components.length; i++) {
                    if (components[i].identity == action.index) {
                        components.splice(i, 1);
                        break;
                    }
                }
                data.viewDetail.components = components;
                return _.assign({}, state, { data: data });
            }
        case 'CHANGE_COMPONENT_SELECT_MODE':
            {
                let data = state.data;
                let components = data.viewDetail.components;
                components = _.map(components, function(component) {
                    if (component.identity == action.index)
                        component.isSelected = true;
                    else
                        component.isSelected = false;
                    return component;
                });
                let style = data.viewDetail.style;
                style.isSelected = false;
                data.viewDetail.components = components;
                data.viewDetail.style = style;
                return _.assign({}, state, { data: data });
            }
        case 'CHANGE_COMPONENT_HOVER':
            {
                let data = state.data;
                let components = data.viewDetail.components;
                for (let i = 0; i < components.length; i++) {
                    if (components[i].identity == action.index) {
                        components[i].display = action.display;
                        components[i].border = action.border;
                        break;
                    }
                }
                return _.assign({}, state, { data: data });
            }
        case 'CHANGE_SIZE':
            {
                let data = state.data;
                let components = data.viewDetail.components;
                let position = _.findIndex(components, function(component) {
                    return component.identity == action.index;
                });
                components[position].size = action.size;
                data.viewDetail.components = components;
                return _.assign({}, state, { data: data });
            }
        case 'CHANGE_MODELDETAIL':
            {
                let data = state.data;
                if (action.modelDetail || action.modelDetail == '') {
                    data.modelDetail = action.modelDetail;
                }
                return _.assign({}, state, { data: data });
            }
        case 'CHANGE_SOLIDID':
            {
                let data = state.data;
                if (action.solidId || action.solidId == '') {
                    data.solidId = action.solidId;
                }
                return _.assign({}, state, { data: data });
            }
        case 'CHANGE_TITLE':
            {
                let data = state.data;
                let components = data.viewDetail.components;
                let position = _.findIndex(components, function(component) {
                    return component.identity == action.index;
                });
                components[position].condition.title = action.title;
                data.viewDetail.components = components;
                return _.assign({}, state, { data: data });
            }
        case 'CHANGE_ISMULTIPLE':
            {
                let data = state.data;
                let components = data.viewDetail.components;
                let position = _.findIndex(components, function(component) {
                    return component.identity == action.index;
                });
                components[position].condition.isMultiple = action.isMultiple;
                console.log(components[position].condition.isMultiple);
                data.viewDetail.components = components;
                return _.assign({}, state, { data: data });
            }
        case 'CHANGE_SELECTDATA':
            {
                let data = state.data;
                let components = data.viewDetail.components;
                let position = _.findIndex(components, function(component) {
                    return component.identity == action.index;
                });
                let seledata = [];
                $.extend(true, seledata, components[position].condition.selectData);
                let i = _.findIndex(seledata, function(item) {
                    return item.condId === action.seledata.condId ;
                });
                if (i != -1) {
                    seledata.splice(i, 1);
                } else {
                    seledata.push(action.seledata);
                }

                let field = [];
                $.extend(true, field, components[position].condition.field);
                var index = _.indexOf(field, action.field);
                if (_.contains(field, action.field)) {
                    field.splice(index, 1);
                } else {
                    field.push(action.field);
                }
                components[position].condition.field = field;
                components[position].condition.selectData = seledata;
                // console.log(seledata);
                data.viewDetail.components = components;
                return _.assign({}, state, { data: data });
            }
        case 'REMOVE_SELECTED':
        {
            let data = state.data;
            let components = data.viewDetail.components;
            let position = _.findIndex(components, function(component) {
                return component.identity == action.index;
            });
            let seleData=components[position].condition.selectData;
            let i = _.find(seleData, function(item) {
                return item.condId === action.condId ;
            });
            if (i) {
                seleData.splice(i, 1);
            }
            let filed =components[position].condition.field;
            let index =_.indexOf(filed,action.condId);
            if(_.contains(filed,action.condId)){
                filed.splice(index,1)
            }
            components[position].condition.remove = action.condId;
            console.log(components[position].condition.remove);
            return _.assign({}, state, { data: data });
        }
        case 'ADD_LIST':
            {
                let data = state.data;
                let outputList = [];
                $.extend(true, outputList, data.outputList);
                outputList.push(action.outputList);
                data.outputList = _.union(outputList);
                return _.assign({}, state, { data: data });
            }
        case 'CHANGE_KEY':
            {
                let data = state.data;
                let matched = _.find(data.nodes, (item) => {
                    return item.nodeId == action.key;
                });
                if (matched) {
                    matched.selected = !matched.selected;
                }
                return _.assign({}, state, { data: data });
            }
        case 'CHANGE_VALUE':
            {
                let data = state.data;
                let components = data.viewDetail.components;
                let position = _.findIndex(components, function(component) {
                    return component.identity == action.index;
                });
                components[position].condition.value = action.value;
                data.viewDetail.components = components;
                return _.assign({}, state, { data: data });
            }
        case 'CHANGE_SOURCE':
            {
                let data = state.data;
                if (action.source || action.source == '') {
                    data.viewDetail.source = action.source;
                }
                return _.assign({}, state, { data: data });
            }
        case 'CHANGE_NODES':
            {
                let data = state.data;
                if (action.nodes || action.nodes == '') {
                    data.nodes = action.nodes;
                }
                return _.assign({}, state, { data: data });
            }
        case 'ADD_MAPPING':
            {
                let data = state.data;
                let nodeData = action.data.nodeData;
                let selectedSource = action.data.selectedSource;
                _.each(selectedSource, (item) => {
                    let mapList = _.filter(nodeData.columnMapping, (mapItem) => {
                        return _.find(item.detail.outputColumnDescList, (outputItem) => outputItem.aliasName == mapItem.oldColumn);
                    })
                    item.mapList = mapList;
                    item.mapTarget = nodeData.nodeData;
                })
                return _.assign({}, state, { data: data });
            }
        case 'REMOVE_MAPPING':{
            {
                let data = state.data;
                let matched = _.find(data.nodes, (item) => item.nodeId == action.key);
                if (matched) {
                    delete matched['mapTarget'];
                }
                return _.assign({}, state, { data: data });
            }
        }
        case 'CHANGE_VIEWDETAIL':
            {
                let data = state.data;
                if (action.viewDetail || action.viewDetail == '') {
                    data.viewDetail = action.viewDetail;
                }
                if (action.modelId || action.modelId == '') {
                    data.viewDetail.modelId = action.modelId;
                }
                if (action.solidId || action.solidId == '') {
                    data.solidId = action.solidId
                }
                let components = data.viewDetail.components;
                components = _.map(components, function(component) {
                    component.isSelected = false;
                    return component;

                });
                return _.assign({}, state, { data: data });
            }
        case 'CHANGE_OPERATIONCHAR':
            {
                let data = state.data;
                let components = data.viewDetail.components;
                let position = _.findIndex(components, function(component) {
                    return component.identity == action.index;
                });
                components[position].condition.opr = action.operationChar;
                data.viewDetail.components = components;
                return _.assign({}, state, { data: data });
            }
        case 'CHANGE_HINT':
            {
                let data = state.data;
                let components = data.viewDetail.components;
                let position = _.findIndex(components, function(component) {
                    return component.identity == action.index;
                });
                components[position].condition.hint = action.hint;
                data.viewDetail.components = components;
                return _.assign({}, state, { data: data });
            }
        case 'CHANGE_ISREQUIRED':
            {
                let data = state.data;
                let components = data.viewDetail.components;
                let position = _.findIndex(components, function(component) {
                    return component.identity == action.index;
                });
                components[position].condition.isRequired = action.isRequired;
                data.viewDetail.components = components;
                return _.assign({}, state, { data: data });
            }
        case 'CHANGE_ISHIDE':
            {
                let data = state.data;
                let components = data.viewDetail.components;
                let position = _.findIndex(components, function(component) {
                    return component.identity == action.index;
                });
                components[position].condition.hideOpr = action.isHide;
                data.viewDetail.components = components;
                return _.assign({}, state, { data: data });
            }
        case 'SELECT_CARD_SAMPLE':
            {
                let data = state.data;
                let style = data.viewDetail.style;
                style.titleBackgroundColor = action.titleBackgroundColor;
                style.titleContentColor = action.titleContentColor;
                style.bodyBackgroundColor = action.bodyBackgroundColor;
                style.bodyContentColor = action.bodyContentColor;
                for (let i = 0; i < style.sampleCards.length; i++) {
                    if (i == action.index)
                        style.sampleCards[i].isSelected = true;
                    else
                        style.sampleCards[i].isSelected = false;
                }
                data.viewDetail.style = style;
                return _.assign({}, state, { data: data });
            }
        case 'CHANGE_CARD_SELECT_MODE':
            {
                let data = state.data;
                let components = data.viewDetail.components;
                components = _.map(components, function(component) {
                    component.isSelected = false;
                    return component;
                });
                let style = data.viewDetail.style;
                style.isSelected = true;
                data.viewDetail.components = components;
                data.viewDetail.style = style;
                return _.assign({}, state, { data: data });
            }
        case 'CHANGE_CARD_STYLE':
            {
                let data = state.data;
                let style = data.viewDetail.style;
                if(action.title || action.title == "")
                    data.viewDetail.appName = action.title;
                if(action.describe || action.describe == "")
                    data.viewDetail.appDescribe = action.describe;
                if(action.titleFontSize)
                    style.titleFontSize = action.titleFontSize;
                if(action.bodyFontSize)
                    style.bodyFontSize = action.bodyFontSize;
                if(action.titleBackgroundColor) {
                    style.titleBackgroundColor = action.titleBackgroundColor;
                    _.each(style.sampleCards, function(sample) {
                        sample.isSelected = false;
                    });
                }
                if (action.titleContentColor) {
                    style.titleContentColor = action.titleContentColor;
                    _.each(style.sampleCards, function(sample) {
                        sample.isSelected = false;
                    });
                }
                if (action.bodyBackgroundColor) {
                    style.bodyBackgroundColor = action.bodyBackgroundColor;
                    _.each(style.sampleCards, function(sample) {
                        sample.isSelected = false;
                    });
                }
                if (action.bodyContentColor) {
                    style.bodyContentColor = action.bodyContentColor;
                    _.each(style.sampleCards, function(sample) {
                        sample.isSelected = false;
                    });
                }
                if (action.cardWidth) {
                    style.cardWidth = action.cardWidth;
                }
                data.viewDetail.style = style;
                return _.assign({}, state, { data: data });
            }
        default:
            return state;
    }
};
var store = Redux.createStore(reducer);
store.dispatch({
    type: 'REPLACE',
    data: {
        solidId: '',
        solidName: '',
        solidComments: '',
        dirId: '',
        nodes: [],
        /**获取的所有数据源**/
        outputList: [],
        /**数据源中的outputList**/
        modelDetail: {},
        /**接口传过来的detail**/
        viewDetail: {
            source: [],
            /**fancyTree的数据**/
            modelId: modelId,
            appName: '',
            appDescribe:'',
            components: [],
            style: {
                isSelected: true,
                sampleCards: [{isSelected: true}, {isSelected: false}, {isSelected: false}],
                titleBackgroundColor: Theme.Theme1.titleBackgroundColor,
                titleContentColor: Theme.Theme1.titleContentColor,
                bodyBackgroundColor: Theme.Theme1.bodyBackgroundColor,
                bodyContentColor: Theme.Theme1.bodyContentColor,
                titleFontSize: Theme.SmallTitleSize,
                bodyFontSize: Theme.SmallContentSize,
                cardWidth: Theme.MediumCardWidth
            }
        }
    }
});

//exports
module.exports = store;

