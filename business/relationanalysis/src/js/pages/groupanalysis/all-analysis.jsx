import React from 'react';
import {render} from 'react-dom';

import AnalysisPanel from './analysis';
import {store, MODE, MODE_CONFIG} from '../../module/group-analysis/store';
const Notify = require('nova-notify');

require('../../module/group-analysis/analysis-app.less');

class GroupAnalysisWrapper extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.unsubscribe = store.subscribe(() => {
            this.forceUpdate();
        });

        window.onresize = this.resizeHandler;
        this.resizeHandler();

    }

    resizeHandler() {
        var container = $('#content-groupanalysis');
        container.height(window.innerHeight - container.offset().top);
    }

    componentWillUnmount() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }

    render() {


        return (

            <AnalysisPanel />

        )
    }
}

render(<GroupAnalysisWrapper />, document.getElementById('content-groupanalysis'));