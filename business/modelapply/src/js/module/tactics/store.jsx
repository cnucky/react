var Redux = require('redux');
var Pinyin = require('widget/jQuery.Hz2Py-min');

const defaultState = {
    modelData: [],
    modelType: 'all',
    modelAllData: [],
    favorIds: []
}

var reducer = function(state = defaultState, action) {
    var newState = {};

    switch(action.type) {
        case 'GET_MODELDATA':
            let modelData = action.modelData
            if (action.isFirst) {
                _addPinyinGroup(modelData)
            }
            if (action.isFirst && state.tacticsTypes) {
                let modelAllData = _getTypeCount(modelData, state.tacticsTypes)
                newState.modelAllData = modelAllData
            }
            newState.modelData = modelData
            return _.assign({}, state, newState)
         case 'GET_TACTICSTYPES':
            let tacticsTypes = action.tacticsTypes
            if (action.isFirst && state.modelData.length > 0) {
                let modelAllData = _getTypeCount(state.modelData, tacticsTypes)
                newState.modelAllData = modelAllData
             }
             let tacticsTypesRender = []
             _.each(tacticsTypes, function(typeItem, typeIndex) {
                tacticsTypesRender.push({
                    label: typeItem.typeName,
                    isEdit: false,
                    typeId: typeItem.typeId
                })
             })
            if (action.modelType) {
                newState.modelType = action.modelType
            }
            newState.tacticsTypes = tacticsTypes
            newState.tacticsTypesRender = tacticsTypesRender
            return _.assign({}, state, newState)
        case 'GET_MODELTYPE':
            newState.modelType = action.modelType
            return _.assign({}, state, newState)
        case 'GET_TACTICSFAVOR':
            newState.tacticsFavor = action.tacticsFavor
            let favorIds = []
            _.each(action.tacticsFavor, function(item, index) {
                favorIds.push(item.favorId)
            });
            newState.favorIds = favorIds
            if (action.isFirst && favorIds.length > 0) {
                newState.modelType = 'used'
            }
            return _.assign({}, state, newState)
        case 'GET_SOLIDID':
            newState.solidId = action.solidId
            return _.assign({}, state, newState)
        case 'ZOOM_SWITCH':
            newState.zoomOut = !state.zoomOut
            return _.assign({}, state, newState)
        default:
            return state;
    }
};


var store = Redux.createStore(reducer);

export {store};

function _addPinyinGroup(data) {
    _.each(data, function(item, index) {
        let supperword = "";
        let pinYinText = Pinyin.ConvertPinyin(item.solidName);
        let first = Pinyin.makePy(item.solidName);
        pinYinText.replace(/[A-Z]/g, function(word) { supperword += word });
        let pinYinLower = [];
        _.each(first , (item , key)=>{
            pinYinLower.push(item.replace(" ","").toLowerCase());
        })
        let pinyin = pinYinText.toLowerCase();
        let pinyinGroup = []
        let zhReg = /[\u4e00-\u9fa5]/
        let text = []
        _.each(item.solidName, function(nameItem, nameIndex) {
            text.push(nameItem)
        })
        for (let i = 0; i < text.length; i++) {
            if (zhReg.exec(text[i])) {
                let itemPinyin = Pinyin.ConvertPinyin(text[i])
                let itemArray = []
                _.each(itemPinyin, function(arrayItem, arrayIndex) {
                    itemArray.push(arrayItem)
                })
                pinyinGroup.push(i + itemArray.length)
                text = text.slice(0, i).concat(itemArray, text.slice(i + 1))
                i = i + itemArray.length - 1
            } else {
                pinyinGroup.push(i + 1)
            }
        }
        data[index].pinyinData = {
            pinyinGroup: pinyinGroup,
            pinyin: pinyin,
            firstLetter: pinYinLower
        }
    })
    return data
}

function _getTypeCount(modelData, tacticsTypes) {
    let modelAll = []
    if (modelData.length > 0 && tacticsTypes.length > 0) {
        for (let i = 0; i < tacticsTypes.length; i++) {
            let itemData = {}
            itemData.label = tacticsTypes[i].typeName
            itemData.data = []
            _.each(modelData, function(modelItem, index) {
                if (modelItem.tacticsTypeId == tacticsTypes[i].typeId) {
                    itemData.data.push(modelItem)
                }
            });
            modelAll.push(itemData)
        }
    }
    return modelAll
}