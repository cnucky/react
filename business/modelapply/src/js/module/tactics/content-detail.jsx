import React, { PropTypes } from 'react';
import Animate from 'rc-animate';
import {store} from './store';
import { Popover } from 'antd';
var Notify = require('nova-notify');
// import 'antd/dist/antd.css';
initLocales(require.context('../../../locales/tactics', false, /\.js/), 'zh');
import PreviewPanel from './preview-panel';


const titleItemUsedStyle = {
    lineHeight: '70px'
}
const titleItemSpecialStyle = {
    paddingTop: '13px'
}

export default class ContentDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            zoomOut: false,
            isCollect: false,
            isShowTip: false,
            isShowDetail: false,
            modelItem: {},
            location: {
                x: 0,
                y: 0
            },
            itemDetail: {},
            serchValue: '',
            solidId:''
        }
        this.isDbClick = false;
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.modelType != nextProps.modelType) {
            this.setState({
                serchValue: '',
                //modelData: this.props.modelData
            })
        }
    }

    componentWillUnmount() {

    }

    componentDidMount() {

    }

    componentWillUpdate(prevProps, prevState) {

    }

    componentDidUpdate(prevProps, prevState) {
    }


    _handleCollect(markId, item, e) {
        e.preventDefault();
        e.nativeEvent.stopImmediatePropagation();
        let modelData = this.props.modelData
        let modelType = this.props.modelType
        if (modelType === 'myApps') {
            modelData[markId].isCollect = !modelData[markId].isCollect
        } else {
            _.each(modelData, function(listItem, index) {
                if (item.markId === listItem.markId) {
                    modelData[index].isCollect = false
                }
            })
        }

        store.dispatch({type: 'GET_MODELDATA', modelData: modelData})
    }


    _handleItemClick(markId, item, e) {
        e.preventDefault();
        e.nativeEvent.stopImmediatePropagation();
        if (e.target.nodeName == 'SPAN') {
            this.timer = setTimeout(_handleClick.bind(this), 5);
            this.isDbClick = false
            function _handleClick() {
                if (!this.isDbClick) {
                    this.setState({
                        isShowDetail: true,
                        itemDetail: item
                    })
                    store.dispatch({type: 'GET_SOLIDID', solidId: item.solidId})
                }
            }
        }
    }

    _handleCardClose() {
        this.setState({
            isShowDetail: false
        })
    }

    _handleItemDoubleClick (itemId) {
        this.isDbClick = true
        if (this.timer) {
            clearTimeout(this.timer)
        }
        let url = window.location.href
        let urlReg = 'modelapply/tactics.html'
        let urlPre = url.slice(0, url.indexOf(urlReg)) + 'modelanalysis/modeling.html?taskid='
        window.open(urlPre + itemId)
    }

    _clearClick(){
        this.setState({
            serchValue: '',
            modelData: this.props.modelData
        })
    }

    _getModelDataFilter() {
        let modelData = typeof this.state.modelData !== 'undefined' ? this.state.modelData : this.props.modelData
        const { favorIds, modelType, modelAllData, tacticsTypes, tacticsFavor } = this.props
        let modelDataFilter = []
        let modelDataSearch = []

        if (modelType == 'used' && modelData.length > 0) {
            let favorData = []
            _.each(modelData, function(item, index) {
                if (favorIds.indexOf(item.solidId.toString()) > -1) {
                    favorData.push(item)
                }
            })
            modelDataFilter = favorData
        } else if (modelType == 'all') {
            modelDataFilter = modelData
        } else {
            let typeId;
            _.each(tacticsTypes, function(typeItem, typeIndex) {
                if (typeItem.typeName == modelType) {
                    typeId = typeItem.typeId
                }
            });
            _.each(modelData, function(modelItem, modelIndex) {
                if (modelItem.tacticsTypeId == typeId) {
                    modelDataFilter.push(modelItem)
                }
            });
        }

        return modelDataFilter
    }

    _handleValueChange (e) {
        let modelData = this.props.modelData
        let returnData = []
        let serchValue = e.target.value.trim()
        if (serchValue !== this.state.serchValue && serchValue !== '') {
            for (let i = 0; i < modelData.length; i++) {
                if (modelData[i].solidName.indexOf(serchValue) > -1) {
                    returnData.push(modelData[i])
                } else if (modelData[i].pinyinData.pinyin.indexOf(serchValue) > -1) {
                    returnData.push(modelData[i])
                } else {
                    let hasValue = false
                    _.each(modelData[i].pinyinData.firstLetter, function(letterItem, letterIndex) {
                        if (letterItem.indexOf(serchValue) > -1) {
                            hasValue = true
                        }
                    })
                    if (hasValue) {
                        returnData.push(modelData[i])
                    }
                }
            }
            this.setState({
                serchValue: serchValue,
                modelData: returnData
            })
        } else {
            this.setState({
                serchValue: '',
                modelData: this.props.modelData
            })
        }   
    }

    _getValueIndex(valueIndex, pinyinGroup, type) {
        let index;
        for (let i = 0; i < pinyinGroup.length; i++) {
            if (valueIndex < pinyinGroup[i]) {
                index = type === 'start' ? i : i + 1
                break
            }
        }
        return index
    }

    _getText(starIndex, endIndex, itemName) {
        let text = (
            <span>
                {itemName.slice(0, starIndex)}
                <mark style={{color: '#fff', backgroundColor: 'rgba(191, 170, 0, 0.8)'}}>{itemName.slice(starIndex, endIndex)}</mark>
                {itemName.slice(endIndex)}
            </span>
        )
        return text
    }

    _getValueMark(item) {
        let serchValue = this.state.serchValue
        let itemName = item.solidName
        let text = ''
        let _this = this
        if (serchValue !== '') {
            if (itemName.indexOf(serchValue) > -1) {
                let starIndex = itemName.indexOf(serchValue)
                let endIndex = starIndex + serchValue.length
                text = _this._getText(starIndex, endIndex, itemName)
            } else {
                if (item.pinyinData.pinyin.indexOf(serchValue) > -1) {
                    let starIndex, endIndex;
                    let pinyinGroup = item.pinyinData.pinyinGroup
                    let index = item.pinyinData.pinyin.indexOf(serchValue)
                    starIndex = _this._getValueIndex(index, pinyinGroup, 'start')
                    endIndex = _this._getValueIndex(index + serchValue.length - 1, pinyinGroup, 'end')
                    text = _this._getText(starIndex, endIndex, itemName)
                } else {
                    let firstLetter = item.pinyinData.firstLetter
                    _.each(firstLetter, function(firstItem, firstIndex) {

                    })
                    for (let firstIndex = 0; firstIndex < firstLetter.length; firstIndex++) {
                        let firstItem = firstLetter[firstIndex]
                        if (firstItem.indexOf(serchValue) > -1) {
                            let starIndex = firstItem.indexOf(serchValue)
                            let endIndex = starIndex + serchValue.length
                            text = _this._getText(starIndex, endIndex, itemName)
                            break
                        }
                    }
                }
            }
        } else {
            text = <span>{itemName}</span>
        }
        return text
    }

    _addTacticsFavor(solidId, solidName) {
        let modify = {
            id: solidId.toString(),
            caption: solidName,
            type: 3
        }
        let modelData = this.props.modelData
        let tacticsFavor = []
        let _this = this
        var favorModify = {
            type: 3
        }
        $.post("/modelapply/modelapply/addTacticsFavor", modify, function(rsp) {

            if (rsp.code == 0) {
                Notify.show({
                    title: i18n.t('info.notify-add-favor-success'),
                    type: 'success'
                })
                $.getJSON("/modelapply/modelapply/getTacticsFavorByUser", favorModify, function(rsp) {
                    if (rsp.code == 0) {
                        tacticsFavor = rsp.data;
                    }
                    
                    store.dispatch({type: 'GET_TACTICSFAVOR', tacticsFavor: tacticsFavor})
                });
               
                store.dispatch({type: 'GET_MODELDATA', modelData: modelData})
                
            } else {
                Notify.show({
                    title: i18n.t('info.notify-add-favor-fail'),
                    type: 'error'
                })
            }
        }, 'json')
    }

    _deleteTacticsFavor(solidId) {
        let modify = {
            id: solidId,
            type: 3
        }
        let modelData = this.props.modelData
        let tacticsFavor = []
        let favorModify = {
            type: 3
        }
        $.post("/modelapply/modelapply/deleteTacticsFavor", modify, function(rsp) {
            if (rsp.code == 0) {
                Notify.show({
                    title: i18n.t('info.notify-delete-favor-success'),
                    type: 'success'
                })
                $.getJSON("/modelapply/modelapply/getTacticsFavorByUser", favorModify, function(rsp) {
                    if (rsp.code == 0) {
                        tacticsFavor = rsp.data;
                    }
                    store.dispatch({type: 'GET_TACTICSFAVOR', tacticsFavor: tacticsFavor})
                });
                store.dispatch({type: 'GET_MODELDATA', modelData: modelData})
            } else {
                Notify.show({
                    title: i18n.t('info.notify-delete-favor-fail'),
                    type: 'error'
                })
            }
        }, 'json')
    }

    _getModelType(modelType, tacticsTypes) {
        let modeltype = ''
        if (modelType === 'all' || modelType === 'used') {
            modeltype = modelType == 'all' ? '所有模型' : '常用模型'
        } else if (tacticsTypes && tacticsTypes.length > 0) {
            modeltype = modelType
        }
        return modeltype
    }

    render() {
        const { modelData, modelType, tacticsTypes, favorIds } = this.props
        const { isShowDetail, itemDetail, serchValue, modelAllData } = this.state
        const {zoomOut, solidId} = store.getState()
        let modelDataFilter = this._getModelDataFilter()
        let panelStyle = isShowDetail ? 'panel-content-reduce' : 'pannel-content-normal'
        let detailStyle = isShowDetail ? 'detail-content-normal' : 'detail-content-reduce'

        return (
            <div className="content-detail flex-layout">
                <div className="content-panel flex-item" >
                    <div className="content-header" style={{marginTop: 15}}>
                        <span className="model-title">战法集市</span>
                    </div>
                    <div className="content-search-wrap">
                        <div className="content-search">
                            <input
                                className="search-input"
                                placeholder="关键字"
                                value={serchValue}
                                onChange={this._handleValueChange.bind(this)}
                            />
                            <i className="search-icon glyphicons glyphicons-search"></i>
                            <i className="search-remove glyphicons glyphicons-remove_2" onClick={this._clearClick.bind(this)}></i>
                        </div>
                    </div>
                    <div className="content-title-wrap">
                        <i className="bg-top-lf"></i>
                        <i className="bg-top-center"></i>
                        <i className="bg-top-rt"></i>
                        <p className="panel-header">
                            <i className="title-flower"></i>
                            <span>
                                {this._getModelType(modelType, tacticsTypes)}
                                <i className="title-dot"></i>
                            </span>
                        </p>
                    </div>
                    
                    <div className="detail-wrap">
                        <div className="detail-line">
                            <i className="bg-line-lf"></i>
                            <i className="bg-line-rt"></i>
                            <i className="bg-bottom-lf"></i>
                            <i className="bg-bottom-center"></i>
                            <i className="bg-bottom-rt"></i>
                            <i className="bg-center"></i>
                            <ul className={`panel-content`}>
                                {
                                    modelDataFilter.length > 0 ? modelDataFilter.map((item, i)=>{
                                        let contentItemWrapStyle = 'content-item-wrap'
                                        if (!_.isEmpty(itemDetail) && itemDetail.markId == item.markId && isShowDetail) {
                                            contentItemWrapStyle = 'content-item-wrap-hover'
                                        }
                                        let isFavor = favorIds.indexOf(item.solidId + '') > -1
                                        return <li key={i}  className={contentItemWrapStyle}>
                                                <p 
                                                    className="item-wrap"
                                                    onClick={this._handleItemClick.bind(this, item.markId, item)}

                                                >
                                                    <span className="list-icon-left lf"></span>
                                                    <span className="list-icon-center lf">
                                                        <span className="list-title-wrap" style={item.solidName.length > 8 ? titleItemSpecialStyle : titleItemUsedStyle}>
                                                            <span className="list-item-title">{this._getValueMark(item)}</span>
                                                        </span>
                                                    </span>
                                                    <span className="list-icon-right lf">
                                                        <i className="star-icon-wrap"></i>
                                                        {
                                                            isFavor ?
                                                                <i
                                                                    // onClick={this._handleCollect.bind(this, item.markId, item)}
                                                                    onClick={this._deleteTacticsFavor.bind(this, item.solidId)}
                                                                    className="star-icon glyphicons glyphicons-star" style={{color: '#fff'}}
                                                                >
                                                                </i> :
                                                                <i
                                                                    // onClick={this._handleCollect.bind(this, item.markId, item)}
                                                                    onClick={this._addTacticsFavor.bind(this, item.solidId, item.solidName)}
                                                                    className="star-icon glyphicons glyphicons-star"
                                                                >
                                                                </i>
                                                        }
                                                    </span>                                                    
                                                </p>
                                        </li>
                                    }, this) : null
                                }
                            </ul>
                        </div>
                    </div>
                    <div className="bg-bottom-wrap">
                        <i className="bg-bottom-lf"></i>
                        <i className="bg-bottom-rt"></i>
                        <i className="bg-bottom-center"></i>
                    </div>
                </div>
                { isShowDetail ? <div className='detail-content'>
                        <PreviewPanel solidId={store.getState().solidId}
                                      onClose={this._handleCardClose.bind(this)} />
                    </div> : null }
            </div>
        )
    }
}



