// import TaskadminContent from '../module/taskadmin-content';
import React from 'react';
import ReactDOM from 'react-dom';
import {store} from '../module/store';
import PageContent from '../module/page-content';
require ('../module/regularexecution.less');

class RegularexecutionWrapper  extends React.Component {
    
  constructor(props) {
        super(props);

    }

    componentDidMount() {
        this.unsubscribe = store.subscribe(() => {
            this.forceUpdate();
        }); 

        var listData = []
        $.getJSON("/regularexecution/regularexecution/schemesummarylist", function(rsp) {
            if (rsp.code == 0) {
                listData = rsp.data;
            }
            store.dispatch({type: 'GET_SCHEMESUMMARYLIST', schemesummaryList: listData})
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
        const { height, schemesummaryList, showDetailTable, tasksummarylist } = state
        return (
            <div className="url_wrap" style={{height: `${height}px`, width: '100%'}}> 
                <PageContent
                    schemesummaryList={schemesummaryList}
                    height={height}
                    showDetailTable={showDetailTable}
                    tasksummarylist={tasksummarylist}
                />
            </div>
        )
  	}

}

ReactDOM.render(<RegularexecutionWrapper />, document.getElementById('regularexecution-content'));
hideLoader();