import React, { PropTypes } from 'react';
import Animate from 'rc-animate';
import {store} from './store';
import { Popover } from 'antd';
import ModelTip from './model-tip';
// import 'antd/dist/antd.css';

const titleItemUsedStyle = {
    lineHeight: '70px'
}
const titleItemSpecialStyle = {
    paddingTop: '13px'
}

class ContentDetail extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
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
        }
        this.isDbClick = false
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.modelType != nextProps.modelType) {
            this.setState({
                serchValue: '',
                modelData: this.props.modelData
            })
        }
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
                }
            }
        }
    }

    _handleItemDoubleClick (itemId) {
        this.isDbClick = true
        if (this.timer) {
            clearTimeout(this.timer)
        }
        let url = window.location.href
        let urlReg = 'modelcuring/index.html'
        let urlPre = url.slice(0, url.indexOf(urlReg)) + 'modelanalysis/modeling.html?taskid='
        window.open(urlPre + itemId)
    }

    _searchClick(){
        // let value= $('.search-input').val();
        // this.setState({
        //     serchValue: value
        // })
    }

    _clearClick(){
        this.setState({
            serchValue: '',
            modelData: this.props.modelData
        })
    }

    _getModelDataFilter() {
        let modelData = typeof this.state.modelData !== 'undefined' ? this.state.modelData : this.props.modelData
        let modelType = this.props.modelType
        let modelDataFilter = []
        let modelDataSearch = []
        if (modelType === 'commonData') {
            _.each(modelData, function(item, index) {
                if (item.isCollect) {
                    modelDataFilter.push(item)
                }
            })
        } else {
            modelDataFilter = modelData
        }
        return modelDataFilter
    }

    _handleValueChange (e) {
        let modelData = this.props.modelData
        let returnData = []
        let serchValue = e.target.value.trim()
        if (serchValue !== this.state.serchValue && serchValue !== '') {
            for (let i = 0; i < modelData.length; i++) {
                if (modelData[i].name.indexOf(serchValue) > -1) {
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
        let itemName = item.name
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

    render() {
        const { modelData, modelType } = this.props
        const { isShowDetail, itemDetail, serchValue } = this.state
        let modelDataFilter = this._getModelDataFilter()
        let panelStyle = isShowDetail ? 'panel-content-reduce' : 'pannel-content-normal'
        let detailStyle = isShowDetail ? 'detail-content-normal' : 'detail-content-reduce'

        return (
            <div
                className="content-detail"
            >
                <div className="content-header" style={{width: isShowDetail ? 'calc(70%)' : '100%'}}>
                    <span className="model-title">战法集市</span>
                </div>
                <div className="content-panel" style={{width: isShowDetail ? 'calc(70%)' : '100%'}}>
                    <div className="content-search-wrap">
                        <div className="content-search">
                            <input
                                className="search-input"
                                placeholder="搜索模型"
                                value={serchValue}
                                onChange={this._handleValueChange.bind(this)}
                            />
                            <i className="search-icon glyphicons glyphicons-search"></i>
                            <i className="search-remove glyphicons glyphicons-remove_2" onClick={this._clearClick.bind(this)}></i>
                            <div className="search-button" onClick={this._searchClick.bind(this)}><span>搜索</span></div>
            
                        </div>
                    </div>
                    <div className="content-title-wrap">
                        <i className="bg-top-lf"></i>
                        <i className="bg-top-center"></i>
                        <i className="bg-top-rt"></i>
                        <p className="panel-header">
                            <i className="title-flower"></i>
                            <span>
                                {modelType === 'commonData' ? '常用模型' : '所有模型'}
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
                                    modelDataFilter.map((item, i)=>{
                                        let contentItemWrapStyle = 'content-item-wrap'
                                        if (!_.isEmpty(itemDetail) && itemDetail.markId == item.markId && isShowDetail) {
                                            contentItemWrapStyle = 'content-item-wrap-hover'
                                        }
                                        return <li key={i}  className={contentItemWrapStyle}>
                                                <p 
                                                    className="item-wrap"
                                                    onClick={this._handleItemClick.bind(this, item.markId, item)}
                                                    onDoubleClick={this._handleItemDoubleClick.bind(this, item.id)}
                                                >
                                                    <span className="list-icon-left lf"></span>
                                                    <span className="list-icon-center lf">
                                                        <span className="list-title-wrap" style={item.name.length > 8 ? titleItemSpecialStyle : titleItemUsedStyle}>
                                                            <span className="list-item-title">{this._getValueMark(item)}</span>
                                                        </span>
                                                    </span>
                                                    <span className="list-icon-right lf">
                                                        <i className="star-icon-wrap"></i>
                                                        {
                                                            item.isCollect ?
                                                                <i
                                                                    onClick={this._handleCollect.bind(this, item.markId, item)}
                                                                    className="star-icon glyphicons glyphicons-star" style={{color: '#fff'}}
                                                                >
                                                                </i> :
                                                                <i
                                                                    onClick={this._handleCollect.bind(this, item.markId, item)}
                                                                    className="star-icon glyphicons glyphicons-star"
                                                                >
                                                                </i>
                                                        }
                                                    </span>
                                                    
                                                </p>
                                        </li>
                                    }, this)
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
                <div className={`detail-content ${detailStyle}`}>
                    <div className="card-wrap">
                        <div className="card-top">
                            <span className="top-header">模型预览</span>
                        </div>
                        <div className="card-center">
                            <div className="card-content-wrap">
                                <ul className="card-list">
                                    <li>1</li>
                                    <li>1</li>
                                    <li>1</li>
                                    <li>1</li>
                                    <li>1</li>
                                    <li>1</li>
                                    <li>1</li>
                                    <li>1</li>
                                     <li>1</li>
                                    <li>1</li>
                                    <li>1</li>
                                    <li>1</li>
                                    <li>1</li>
                                    <li>1</li>
                                    <li>1</li>
                                    <li>1</li>
                                     <li>1</li>
                                    <li>1</li>
                                    <li>1</li>
                                    <li>1</li>
                                    <li>1</li>
                                    <li>1</li>
                                    <li>1</li>
                                    <li>1</li>
                                     <li>1</li>
                                    <li>1</li>
                                    <li>1</li>
                                    <li>1</li>
                                    <li>1</li>
                                    <li>1</li>
                                    <li>1</li>
                                    <li>1</li>
                                     <li>1</li>
                                    <li>1</li>
                                    <li>1</li>
                                    <li>1</li>
                                    <li>1</li>
                                    <li>1</li>
                                    <li>1</li>
                                    <li>1</li>
                                     <li>1</li>
                                    <li>1</li>
                                    <li>1</li>
                                    <li>1</li>
                                    <li>1</li>
                                    <li>1</li>
                                    <li>1</li>
                                    <li>1</li>
                                </ul>
                            </div>
                        </div>
                        <div className="card-bottom">
                            
                        </div>

                    </div>
                </div>  
                    
                {/*<ModelTip
                    modelItem={this.state.modelItem}
                    isShowTip={this.state.isShowTip}
                    location={this.state.location}
                    height={height + 70}
                />*/}
            </div>
        )
    }
}

ContentDetail.propTypes = {
        modelData: React.PropTypes.array,
        modelType: React.PropTypes.string
};


export default ContentDetail



