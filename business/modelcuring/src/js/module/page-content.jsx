import React from 'react';
import {render} from 'react-dom';
import ListDetail from '../module/list-detail';
// import {store} from './store';
import ContentDetail from './content-detail';

var _ = require('underscore');

class PageContent extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
        }
        
    }

    componentWillReceiveProps(nextProps) {
    }

    componentDidMount() {
        const { modelData } = this.props
        if (typeof modelData !== 'undefined' &&
            _.isEmpty(modelData)) {
            hideLoader();
        }
    }

    render() {
        const { height, listData, modelData, modelType } = this.props
        return (
            <div className="page-content">
                <div className="list-wrap">
                    <ListDetail
                        listData={listData}
                        modelData={modelData}
                        height={height}
                        modelType={modelType}
                    />
                </div>
                <div className="content-wrap">
                     <ContentDetail
                        modelData={modelData}
                        height={height}
                        modelType={modelType}
                     />
                </div>
            </div>
        )
    }
}

export default PageContent

PageContent.propTypes = {
        height: React.PropTypes.number,
        listData: React.PropTypes.object,
        modelData: React.PropTypes.array
};
