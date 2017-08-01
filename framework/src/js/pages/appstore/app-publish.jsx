initLocales();
var React = require('react');
var ReactDOM = require('react-dom');
var _ = require('underscore');
var $ = require('jquery');
var Q = require('q');
var Notify = require('nova-notify');
var AppPublishComp = require('module/appstore/apppublish.jsx').AppPublishComp;
var AppService = require('module/appstore/appservice.js');

var AppInfoList = [];
var Categories = [];

var AppPublishComponent = React.createClass({
    render: function () {
        return (
            <div style={{position: 'absolute',margin: '25px auto',left: '0',right: '0',width: "800px",height: window.innerHeight - $('#content-container').offset().top}}>
                <AppPublishComp categories={Categories} mode="publish"/>
            </div>
        )
    }
});

function initialView() {
    var cgPromise = AppService.getCategories();
    cgPromise.then(function(categories){
        Categories = _.sortBy(categories, function (item) {
            return item.index;
        });
        ReactDOM.render(<AppPublishComponent />, document.getElementById('content-container'));
    }).catch(function (ex) {
        Notify.show({
            title: '加载异常',
            text: ex ? ex.message : '服务器数据加载失败，请稍后刷新',
            type: 'danger'
        });
    });
    hideLoader();
}

initialView();