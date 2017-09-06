import React from 'react';
import ReactDOM from 'react-dom';
import {store} from '../module/tactics/store';
import PageContent from '../module/tactics/page-content';
require ('../module/tactics/tactics.less');
var Notify = require('nova-notify');

class ModelcuringWrapper  extends React.Component {
    
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.unsubscribe = store.subscribe(() => {
            this.forceUpdate();
        });

        var modelData = []
        $.getJSON("/modelapply/modelapply/getTactics", function(rsp) {
            if (rsp.code == 0) {
                modelData = rsp.data.tacticsInfos;
            } else {
                Notify.simpleNotify('错误', '没有获取类型', 'error');
            }
            modelData = _.map(modelData, function(item, index) {
                item.isCollect = false
                item.markId = index
                return item
            })

            store.dispatch({type: 'GET_MODELDATA', modelData: modelData, isFirst: true})
        });

        var tacticsTypes = []
        $.post('/modelapply/modelapply/getCuringType',{

        },function (rsp) {
            if(rsp.code == 0){
                tacticsTypes = rsp.data.tacticsTypes;
                store.dispatch({type: 'GET_TACTICSTYPES', tacticsTypes: tacticsTypes, isFirst: true})
            } else {
                Notify.simpleNotify('错误', '没有获取类型', 'error');
            }
        },'json');

        var tacticsFavor = []
        let favorModify = {
            type: 3
        }
        $.getJSON("/modelapply/modelapply/getTacticsFavorByUser", favorModify, function(rsp) {
            if (rsp.code == 0) {
                tacticsFavor = rsp.data;
            } else {
                Notify.simpleNotify('错误', '没有获取类型', 'error');
            }
            
            store.dispatch({type: 'GET_TACTICSFAVOR', tacticsFavor: tacticsFavor, isFirst: true})
        });
    }

    shouldComponentUpdate (nextProps, nextState) {
    }

    componentWillUpdate (nextProps, nextState) {
    }

    componentWillReceiveProps (nextProps) {
    }

    componentWillUnmount() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }

    render () {
        var state = store.getState();
        const { modelData, modelType, tacticsTypes, tacticsFavor, modelAllData, favorIds, tacticsTypesRender } = state

        return (
            <div className="url_wrap" style={{position: 'absolute', width: '100%', left: '0px', right: '0px', top: '40px', bottom: '0px'}}> 
                <PageContent
                    tacticsTypes={tacticsTypes}
                    modelData={modelData}
                    modelType={modelType}
                    tacticsFavor={tacticsFavor}
                    modelAllData={modelAllData}
                    favorIds={favorIds}
                    tacticsTypesRender={tacticsTypesRender}
                />
            </div>
        )
    }

}

ReactDOM.render(<ModelcuringWrapper />, document.getElementById('tactics-content'));
