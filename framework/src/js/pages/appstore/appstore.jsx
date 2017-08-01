initLocales();
var React = require('react');
var ReactDOM = require('react-dom');
var _ = require('underscore');
var $ = require('jquery');
var Q = require('q');
var Dialog = require('nova-home-dialog');
var MultiSelect = require('widget/multiselect');
var ScrollArea = require('react-scrollbar');
var AppDetailComp = require('module/appstore/appdetail.jsx').AppDetailComp;
var AppListComp = require('module/appstore/applist.jsx').AppListComp;
var AppService = require('module/appstore/appservice.js');
require('module/appstore/appstore.less');
require('utility/contextmenu/jquery.ui-contextmenu.js');

var AppInfoList = [];
var Categories = [];

var CategoryNavigationComp = React.createClass({
    getInitialState: function(){
        return{
            selectedCategory: -1,
            appInfoList: this.props.appInfoList,
            selectedApp: this.props.appInfoList[0]
        };
    },

    onAppIconClickCall: function(appInfo) {
        this.setState({
            selectedApp: appInfo
        })
    },

    handleCategoryChanged: function (e) {
        var category = e.currentTarget.id;
        this.state.selectedCategory = category;
        var apps;
        if (category == -1){
            apps = this.props.appInfoList;
        }else if (category == -2){
            apps = _.filter(this.props.appInfoList, function (item) {
                return item.hasAdded == 1;
            });
        }else {
            apps = _.filter(this.props.appInfoList, function (item) {
                return item.category == category;
            });
        }
        this.setState({
            selectedCategory: this.state.selectedCategory,
            appInfoList: apps,
            selectedApp: apps[0]
        });
    },

    onChangeFavorCall: function(appId,type){
        var app = _.find(this.state.appInfoList, function(item){
            return item.id == appId;
        });
        if (type == "add"){
            var aadPromise = AppService.addAppToDesktop(appId);
            aadPromise.then(function (){
                app.hasAdded = 1;
                this.setState({
                    appInfoList: this.state.appInfoList,
                    selectedApp: app
                })
            }.bind(this)).catch(function (ex) {
                Notify.show({
                    title: '服务异常',
                    text: ex ? ex.message : '调用添加应用服务失败',
                    type: 'danger'
                })
            });
        }else if (type == "delete"){
            var dadPromise = AppService.delAppFromDesktop(appId);
            dadPromise.then(function (){
                app.hasAdded = 0;
                this.setState({
                    appInfoList: this.state.appInfoList,
                    selectedApp: app
                })
            }.bind(this)).catch(function (ex) {
                Notify.show({
                    title: '服务异常',
                    text: ex ? ex.message : '调用移除应用服务失败',
                    type: 'danger'
                })
            });
        }
       
    },
    render: function () {
        return (
            <div className='table-layout' style={{width: '100%', height: '100%'}}>
                <aside className="left-panel pn" style={{background: 'white', height: '100%', width: '160px'}}>
                    <div className="panel mbn flex-layout flex-vertical" style={{height: '100%'}}>
                        <div className="panel-heading text-center" style={{height: '42px', lineHeight: '42px'}}>
                            <span className="fs15 fw600">应用分类</span>
                        </div>
                        <div className="flex-item" style={{overflowY: 'auto'}}>
                            <ul className="nav nav-pills nav-stacked" style={{width: '160px', float: 'left',padding: '2px 10px'}}>
                                <li className="active" onClick={this.handleCategoryChanged} id='-1'>
                                    <a href='' style={{fontWeight: 'bold'}} data-toggle="tab" aria-expanded="true">
                                        <i className='fa fa-th-large' style={{marginRight: '5px'}} />
                                        全部应用
                                        <span style={{marginLeft: '5px'}}>({this.props.appInfoList.length})</span></a>
                                </li>
                                <li onClick={this.handleCategoryChanged} id='-2'>
                                    <a href='' style={{fontWeight: 'bold'}} data-toggle="tab" aria-expanded="true">
                                        <i className='fa fa-user' style={{marginRight: '5px'}} />
                                        我的应用
                                        <span style={{marginLeft: '5px'}}>({_.filter(this.props.appInfoList, function (app) {
                                            return app.hasAdded == 1;
                                        }).length})</span></a>
                                </li>
                                {
                                    _.map(this.props.categories,_.bind(function(item){
                                        return(
                                            <li onClick={this.handleCategoryChanged} id={item.id}>
                                                <a href='' style={{fontWeight: 'bold'}} data-toggle="tab" aria-expanded="true">
                                                    <i className={item.icon} style={{marginRight: '5px'}} />
                                                    {item.name}
                                                    <span style={{marginLeft: '5px'}}>({_.filter(this.props.appInfoList, function (app) {
                                                        return app.category == item.id;
                                                    }).length})</span>
                                                </a>
                                            </li>
                                        )
                                    },this))
                                }
                            </ul>
                        </div>
                    </div>
                </aside>

                <div className="main-panel mn" style={{height: '100%',width: '100%', position: 'relative'}}>
                    <AppListComp appInfoList={this.state.appInfoList}
                                 categories={this.props.categories}
                                 selectedCategory={this.state.selectedCategory}
                                 onAppIconClickCall={this.onAppIconClickCall}/>
                </div>
                <div className='mn' style={{width: '360px', height: '100%', borderLeft: '1px solid #DDD'}}>

                    <AppDetailComp appInfo={this.state.selectedApp}
                                   categories={this.props.categories}
                                   onChangeFavorCall={this.onChangeFavorCall}/>
                </div>
            </div>
        )
    }
});

var AppstoreComponent = React.createClass({
    render: function () {
        return (
            <CategoryNavigationComp appInfoList={AppInfoList}
                                    categories={Categories}/>  
        )
    }
});

function initialView() {
    var promiseArray = [];
    var cgPromise = AppService.getCategories();
    var abcPromise = AppService.getAppsByCategory(-1);
    promiseArray.push(cgPromise, abcPromise);

    Q.all(promiseArray)
        .spread(function (categories, appInfoList) {
            Categories = _.sortBy(categories, function (item) {
                return item.index;
            });
            AppInfoList = appInfoList;

            ReactDOM.render(<AppstoreComponent />, document.getElementById('content-container'));
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
