import React from 'react';
import {render} from 'react-dom';
import {store} from './store';
import { Provider } from 'react-redux';

let tabConfigs = [{
    tab: 'commonData',
    label: '常用模型'
}, {
    tab: 'myApps',
    label: '所有模型'
}];

class ListDetail extends React.Component {
    constructor(props) {
        super(props);

        let firstTab = tabConfigs[1].tab;
        this.state = {
            currentTab: firstTab
        }
    }

    componentWillReceiveProps(nextProps) {
    }

    componentDidMount() {
    }

    onTabChanged(tab) {
        this.setState({
            currentTab: tab
        });
        store.dispatch({
            type: 'GET_MODELTYPE',
            modelType: tab
        })
    }

    _getCount(tab) {
        let modelData = this.props.modelData
        let count = modelData.length
        if (tab === 'commonData') {
            count = 0
            _.each(modelData, function(item, index) {
                count += item.isCollect ? 1 : 0
            })
        }
        return count
    }

    render() {
        const { height, listData, modelData } = this.props;
        let {currentTab} = this.state;
        let tabs = [];
        _.each(tabConfigs, (cfg, index)=>{
            let isActive = currentTab == cfg.tab;
           
            tabs.push(
                <li key={index} className={'' + (isActive ? 'li-active' : '')} >
                    <a className={isActive ? 'tab-wrap' : ''} onClick={(() => this.onTabChanged(cfg.tab))}>{cfg.label}
                        <span style={{marginLeft:'10px'}}>({this._getCount(cfg.tab)})</span>
                    </a>
                </li>
            );
        }, this);
        return (
            <div className="list-detail" style={{height: `${height}px`}}>
                {/*<div className="list-title">
                    <h1 className="list-title-text">模型分类</h1>
                </div>*/}
                <div className="list-content">
                    <ul className="tab-ul">
                        {tabs}
                    </ul>
                </div>
            </div>
        )
    }
}

ListDetail.propTypes = {
        height: React.PropTypes.number,
        listData: React.PropTypes.object,
        modelData: React.PropTypes.array
};

export default ListDetail


