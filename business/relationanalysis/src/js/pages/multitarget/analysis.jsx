import React from 'react';
import {render} from 'react-dom';

import AnalysisPanel from '../../module/group-analysis/analysis-panel';
import {store, MODE, MODE_CONFIG} from '../../module/group-analysis/store';
const Notify = require('nova-notify');

require('../../module/group-analysis/analysis-app.less');

class AnalysisWrapper extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.unsubscribe = store.subscribe(() => {
            this.forceUpdate();
        });

        window.onresize = this.resizeHandler;
        this.resizeHandler();


        $.get('/relationanalysis/personrelationexplore/getRelationMetaData', rsp=>{
             if (rsp.code == 0) {
                var metadataMaps = {entityMeta: {}, relationMeta: {}};
                _.each(rsp.data.entityMeta, item=> {
                    metadataMaps.entityMeta[item.entityType] = item.entityName;
                });
                _.each(rsp.data.relationMeta, item=> {
                    metadataMaps.relationMeta[item.relationType] = item.relationName;
                });
                store.dispatch({type: 'METADATA_FETCHED', data: metadataMaps});
            } else {
                Notify.simpleNotify('错误', rsp.message, 'error');
                hideLoader();
            }
        }, 'json');
    }

    resizeHandler() {
        var container = $('#content-container');
        container.height(window.innerHeight - container.offset().top);
    }

    componentWillUnmount() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }

    render() {
        // let startTime = localStorage.getItem("startTime");
        // let endTime = localStorage.getItem("endTime");
        // let contactLevel= localStorage.getItem("contactLevel");
        // let entityList= localStorage.getItem("entityList");
        // var nodes = JSON.parse(entityList);
        // var searchParam = {startTime:startTime,endTime:endTime,contactLevel:contactLevel,nodes:nodes};
        var state = store.getState();
        var {metadata} = state;
        // var selectData = state.selectData;
        return (
            <div ref="analysisPanel" className="tab-block p10" style={{height: '100%'}}>
                {/*<ul className="nav tabs-left tabs-border">{
                 _.map(MODE, (value, key) => {
                 var tabId = value,
                 tabName = MODE_CONFIG[key].name,
                 iconCls = MODE_CONFIG[key].icon;
                 return (
                 <li key={'tab#' + value} className={value == curMode ? "active" : ""} onClick={() => {
                 store.dispatch({
                 type: 'CHANGE_MODE',
                 mode: value
                 });
                 }}>
                 <a href={"#" + tabId} data-toggle="tab" aria-expanded="true"><i className={"text-purple pr5 fs16 " + iconCls}></i>{tabName}</a>
                 </li>
                 );
                 })
                 }
                 </ul>*/}
                <div className="tab-content pn" style={{height: '100%'}}>

                    <div id={MODE.MULTI_TARGET} key={MODE.MULTI_TARGET} className="tab-pane panel-container fade active in ">
                        <AnalysisPanel key={MODE.MULTI_TARGET + '_analysis'} mode={MODE.MULTI_TARGET} actived={true}
                                       metadata={metadata} {...state[MODE.MULTI_TARGET]}/>
                    </div>

                </div>
            </div>
        )
    }
}

render(<AnalysisWrapper />, document.getElementById('content-container'));