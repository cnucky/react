import React, { PropTypes } from 'react';
import {store} from './store';
import PreView from '../model-apply/app';

import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

class PreviewPanel extends React.Component {
    constructor(props) {
        super(props)
        this.zoomHandler = this.onZoom.bind(this)
    }

    onZoom() {
        store.dispatch({
            type: 'ZOOM_SWITCH'
        })
    }

    render() {
        const {solidId, onClose, maximum} = this.props

        return <div className="card-wrap">
            <div className="card-top">
                <i className="bg-parts card-top-lf"></i>
                <i className="bg-parts card-top-center"></i>
                <i className="bg-parts card-top-rt"></i>

                <span className="top-icon"></span>
                <span className="top-header">战法预览</span>
                <div className="card-top-buttons">
                    <span
                        className="top-button"
                        onClick={this.zoomHandler} >
                            <i className={"fa " + (maximum ? "fa-search-minus" : "fa-search-plus")}></i>
                        </span>
                    {maximum ? '' : <span
                            className="top-button"
                            onClick={onClose} >
                            <i className="glyphicons glyphicons-remove_2"></i>
                        </span>}
                </div>
            </div>
            <div className="card-center">
                <i className="bg-parts line-center-lf"></i>
                <i className="bg-parts bg-card-center"></i>
                <i className="bg-parts line-center-rt"></i>
                <div className="card-content-wrap">
                    <PreView editable={true} asWidget solidId={solidId} />
                </div>
            </div>
            <div className="card-bottom">
                <i className="bg-parts card-bottom-lf"></i>
                <i className="bg-parts card-bottom-rt"></i>
                <i className="bg-parts card-bottom-center"></i>
            </div>

        </div>
    }
}


var PreviewPanelWrapper = DragDropContext(HTML5Backend)(PreviewPanel);

export default PreviewPanelWrapper