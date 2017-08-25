import React from 'react';
import ReactDOM from 'react-dom';
import {store} from '../module/store';
import PageContent from '../module/page-content';
require ('../module/modelcuring.less');

class ModelcuringWrapper  extends React.Component {
    
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.unsubscribe = store.subscribe(() => {
            this.forceUpdate();
        });

        var modelData = []
        $.getJSON("/workspacedir/getAllResource?type=6", function(rsp) {
            if (rsp.code == 0) {
                modelData = rsp.data;
            }
            modelData = _.map(modelData, function(item, index) {
                item.isCollect = false
                item.markId = index
                return item
            })
            store.dispatch({type: 'GET_MODELDATA', modelData: modelData})
        });
     
        // $.getJSON("/modelcuring/modelcuring/detailList", function(rsp) {
        //     if (rsp.code == 0) {
        //         detailList = rsp.data;
        //     }
        //     // store.dispatch({type: 'GET_MODELDATA', modelData: modelData})
        // });

        var listData = []
        $.getJSON("/modelanalysis/modeling/getdatasource", function(rsp) {
            if (rsp.code == 0) {
                listData = rsp.data;
            }
            store.dispatch({type: 'GET_LISTDATA', listData: listData})
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
        const { height, modelData, listData, modelType } = state

        return (
            <div className="url_wrap" style={{height: `${height}px`, width: '100%'}}> 
                <PageContent
                    height={height}
                    listData={listData}
                    modelData={modelData}
                    modelType={modelType}
                />
            </div>
        )
  	}

}

ReactDOM.render(<ModelcuringWrapper />, document.getElementById('modelcuring-content'));
