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
            value:''
        }
        
    }

    componentWillReceiveProps(nextProps) {
    }

    componentDidMount() {
    }

    _handleCollect(markId, item, e) {
        e.preventDefault();
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


    _handleItemClick (item) {
        this.setState({
            isShowDetail: true,
            itemDetail: item
        })
    }

    _searchClick(){
        let value= $('.search-input').val();
        this.setState({
            value: value
        })
    }

    _clearClick(){
        $('.search-input').val('');
        this.setState({
            value: ''
        })
    }

    _getModelDataFilter() {
        let modelData = this.props.modelData
        let modelType = this.props.modelType
        let modelDataFilter = []
        let modelDataSearch = []
        let value = this.state.value;
        if (modelType === 'commonData') {
            _.each(modelData, function(item, index) {
                if (item.isCollect) {
                    modelDataFilter.push(item)
                }
            })
        } else {
            modelDataFilter = modelData
        }

        if(value){
            _.each(modelDataFilter, function(item, index) {
                if (item.name.indexOf(value) >= 0) {
                    modelDataSearch.push(item)
                }
            })

            modelDataFilter = modelDataSearch;

        }
        return modelDataFilter
    }

    _getFlag(){
        let flag;
        let el = $('.panel-content');
        if(el.length > 0){
            let clientHeight = el[0].clientHeight;
            let scrollHeight = el[0].scrollHeight;
            console.log(scrollHeight);
            if(clientHeight < scrollHeight){
                flag = true;
            }else{
                flag = false;
            }
        }

        return flag;
    }

    render() {
        const { height, modelData, modelType } = this.props
        const { isShowDetail, itemDetail } = this.state
        let modelDataFilter = this._getModelDataFilter()
        let flag = this._getFlag()
        let panelStyle = isShowDetail ? 'panel-content-reduce' : 'pannel-content-normal'
        let detailStyle = isShowDetail ? 'detail-content-normal' : 'detail-content-reduce'

        return (
            <div
                className="content-detail"
                style={{height:height}}
            >
                <div className="content-header" style={{width: isShowDetail ? 'calc(100% - 540px)' : '100%'}}>
                    <span className="model-title">战法集市</span>
                </div>
                <div className="content-panel" style={{width: isShowDetail ? 'calc(100% - 540px)' : '100%'}}>
                    <div className="content-search-wrap">
                        <div className="content-search">
                            <input className="search-input" placeholder="搜索模型" />
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
                                                <a className="item-wrap" onClick={this._handleItemClick.bind(this, item)}>
                                                    <i className="list-icon-left lf"></i>
                                                    <span className="list-icon-center lf">
                                                        <span className="list-title-wrap" style={item.name.length > 8 ? titleItemSpecialStyle : titleItemUsedStyle}>
                                                            <span className="list-item-title">{item.name}</span>
                                                        </span>
                                                    </span>
                                                    <i className="list-icon-right lf">
                                                        <i className="star-icon-wrap"></i>
                                                        {
                                                            item.isCollect ?
                                                                <i onClick={this._handleCollect.bind(this, item.markId, item)} className="star-icon glyphicons glyphicons-star" style={{color: '#fff'}}></i> :
                                                                <i onClick={this._handleCollect.bind(this, item.markId, item)} className="star-icon glyphicons glyphicons-star"></i>
                                                        }
                                                    </i>
                                                    
                                                </a>
                                        </li>
                                    }, this)
                                }
                            </ul>
                            <div className="scroll-line" style={{display: flag ? 'block': 'none'}}></div>
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
                                <div className="card-content">
                                    <h1 className="card-header">
                                        模型固化分析人物
                                    </h1>
                                    <ul className="card-list">
                                        <li>
                                            <div className="list-label">人员编号<span>*</span></div>
                                            <div className="list-message"></div>
                                        </li>
                                        <li>
                                            <div className="list-label">人员编号<span>*</span></div>
                                            <div className="list-message"></div>
                                        </li>
                                        <li>
                                            <div className="list-label">人员编号<span>*</span></div>
                                            <div className="list-message"></div>
                                        </li>
                                        <li>
                                            <div className="list-label">人员编号<span>*</span></div>
                                            <div className="list-message"></div>
                                        </li>
                                        <li>
                                            <div className="list-label">人员编号<span>*</span></div>
                                            <div className="list-message"></div>
                                        </li>
                                        <li>
                                            <div className="list-label">数据源</div>
                                            <div className="list-datasource"><span>全球签证数据</span></div>
                                        </li>
                                        <li>
                                            <div className="list-label">模型描述</div>
                                            <div className="list-message"><span className="describe">12786707</span></div>
                                        </li>
                                    </ul>
                                    <button className="card-submit">
                                        <span>提交</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="card-bottom"></div>

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
        height: React.PropTypes.number,
        modelData: React.PropTypes.array,
        modelType: React.PropTypes.string
};


export default ContentDetail



