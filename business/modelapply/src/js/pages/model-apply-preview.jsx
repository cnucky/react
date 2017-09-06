import React from 'react';
import {render} from 'react-dom';
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import App from '../module/model-apply/app';
import store from '../module/model-apply/model-apply-store'
var utils = require('nova-utils');
var manager = require('../module/model-apply/modelapply-manager');
initLocales(require.context('../locales/modelapply', false, /\.js/), 'zh');
registerLocales(require.context('../locales/ds-replace', false, /\.js/), 'module');


function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null)
        return unescape(r[2]);
    return null;
}



class Wrapper extends React.Component {
    componentWillUnmount() {
        var id = getQueryString('id');
        localStorage.removeItem(id);
    }

    render() {
        return (
            <App  editable={true} />
        );
    }
}
var PreviewWrapper = DragDropContext(HTML5Backend)(Wrapper);

var id = getQueryString('id');
var solidId = parseInt(utils.getURLParameter('solidid'));
var data = {
    solidId: solidId,
    modelDetail: {},
    viewDetail: {
        style: {}
    }
};

if (solidId) {
    manager.openApply().then(function () {
        manager.getAllData().then(function () {
            render(<PreviewWrapper />, document.getElementById('content-container'));
            hideLoader();
        });
    });

} else {
    data = JSON.parse(localStorage.getItem(id));
    console.log(data)
    store.dispatch({
        type: 'REPLACE',
        data: data
    });
    manager.getAllData().then(function () {
        render(<PreviewWrapper />, document.getElementById('content-container'));
        hideLoader();
    });

}






