import React from 'react';
import {render} from 'react-dom';
import ListDetail from './list-detail';
import {store} from './store';
import ContentDetail from './content-detail';
import PreviewPanel from './preview-panel';

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

    componentWillUnmount() {
    }

    render() {
        const { tacticsTypes, modelData, modelType, tacticsFavor, modelAllData, favorIds, tacticsTypesRender } = this.props
        const {zoomOut, solidId} = store.getState()

        return (
            <div className="page-content">
                <div className="list-wrap" style={zoomOut ? {filter: 'blur(3px)'}: null}>
                    <ListDetail
                        tacticsTypes={tacticsTypes}
                        modelData={modelData}
                        modelType={modelType}
                        tacticsFavor={tacticsFavor}
                        modelAllData={modelAllData}
                        favorIds={favorIds}
                        tacticsTypesRender={tacticsTypesRender}
                    />
                </div>
                <div className="content-wrap" style={zoomOut ? {filter: 'blur(3px)'}: null}>
                     <ContentDetail
                        modelData={modelData}
                        modelType={modelType}
                        tacticsFavor={tacticsFavor}
                        tacticsTypes={tacticsTypes}
                        modelAllData={modelAllData}
                        favorIds={favorIds}
                     />
                </div>
                {zoomOut ? <div className="preview-fullscreen">
                        <PreviewPanel solidId={solidId} maximum />
                    </div> : null
                }
            </div>
        )
    }
}

export default PageContent

PageContent.propTypes = {
        listData: React.PropTypes.object,
        modelData: React.PropTypes.array
};
