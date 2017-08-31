var Redux = require('redux');
var Pinyin = require('widget/jQuery.Hz2Py-min');

const defaultState = {
    modelData: [],
    modelType: 'myApps'
}

var reducer = function(state = defaultState, action) {
    var newState = {};

    switch(action.type) {
        case 'GET_MODELDATA':
            let modelData = action.modelData
            if (action.isFirst) {
                _addPinyinGroup(modelData)
            }
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

function _addPinyinGroup(data) {
    _.each(data, function(item, index) {
        let supperword = "";
        let pinYinText = Pinyin.ConvertPinyin(item.name);
        let first = Pinyin.makePy(item.name);
        pinYinText.replace(/[A-Z]/g, function(word) { supperword += word });
        let pinYinLower = [];
        _.each(first , (item , key)=>{
            pinYinLower.push(item.replace(" ","").toLowerCase());
        })
        let pinyin = pinYinText.toLowerCase();
        let pinyinGroup = []
        let zhReg = /[\u4e00-\u9fa5]/
        let text = []
        _.each(item.name, function(nameItem, nameIndex) {
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