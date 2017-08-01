import React from 'react';
import {render} from 'react-dom';

import AnalysisPanel from '../../module/group-analysis/analysis-panel';
import {store, MODE, MODE_CONFIG} from '../../module/group-analysis/store';
const Notify = require('nova-notify');

require('../../module/group-analysis/analysis-app.less');

class AnalysisWrapper extends React.Component {
    constructor(props) {
        super(props);
        console.log(props)
    }

    componentDidMount() {
        this.unsubscribe = store.subscribe(() => {
            this.forceUpdate();
        });

        window.onresize = this.resizeHandler;



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


    componentWillUnmount() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }

    render() {
        var state = store.getState();
        var {metadata} = state;

        return (

            <div ref="analysisPanel" className="tab-block p10" style={{height: '100%'}}>
                <div className="tab-content pn" style={{height: '100%'}}>
                    <div id={MODE.COHESION} key={MODE.COHESION} className="tab-pane panel-container fade active in ">
                        <AnalysisPanel key={MODE.COHESION + '_analysis'} mode={MODE.COHESION} actived={true}
                                       metadata={metadata} {...state[MODE.COHESION]}/>
                    </div>
                </div>
            </div>
        )
    }
}

module.exports = AnalysisWrapper;
