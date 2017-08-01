initLocales();
var React = require('react');
var ReactDOM = require('react-dom');
var _ = require('underscore');
var $ = require('jquery');
var Dialog = require('nova-home-dialog');
var MultiSelect = require('widget/multiselect');
var ScrollArea = require('react-scrollbar');
var AppListComp = require('module/appstore/applist.jsx').AppListComp;
var AppService = require('module/appstore/appservice.js');
var AppPublishComp = require('module/appstore/apppublish.jsx').AppPublishComp;
require('module/appstore/appstore.less');

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
        var abcPromise = AppService.getAppsByCategory(category);
        abcPromise.then(function (apps){
            this.setState({
                selectedCategory: this.state.selectedCategory,
                appInfoList: apps,
                selectedApp: apps[0]
            });
        }.bind(this)).catch(function (ex) {
            Notify.show({
                title: '加载异常',
                text: ex ? ex.message : '服务器数据加载失败，请稍后刷新',
                type: 'danger'
            });
        });
    },

    render: function () {
        var tabContent;
        if (this.state.showMode == 'appList') {
            tabContent = <AppListComp appInfoList={this.state.appInfoList}
                                      Categories={this.props.categories}
                                      onAppIconClickCall={this.onAppIconClickCall}/>
        } else if (this.state.showMode == 'appDetail') {
            tabContent = <AppPublishComp appInfo={this.state.selectedApp}
                                         categories={this.props.categories}
                                         mode="edit"/>
        }

        return (
            <div className='table-layout' style={{width: '100%', height: '100%'}}>
                <aside className="left-panel pn" style={{background: 'white', height: '100%', width: '160px'}}>
                    <div className="panel mbn flex-layout flex-vertical" style={{height: '100%'}}>
                        <div className="panel-heading text-center" style={{height: '42px', lineHeight: '42px'}}>
                            <span className="fs15 fw600">应用分类</span>
                        </div>
                        <div ref='manageDiv' className="flex-item" style={{overflowY: 'auto'}}>
                            <ul className="nav nav-pills nav-stacked" style={{width: '160px', float: 'left',padding: '2px 10px'}}>
                                <li className="active" onClick={this.handleCategoryChanged} id='-1'>
                                    <a href='' style={{fontWeight: 'bold'}} data-toggle="tab" aria-expanded="true">
                                        <i className='fa fa-th-large' style={{marginRight: '5px'}} />
                                        全部应用
                                        <span style={{marginLeft: '5px'}}>({this.props.appInfoList.length})</span></a>
                                </li>
                                <li onClick={this.handleCategoryChanged} id='-3'>
                                    <a href='' style={{fontWeight: 'bold'}} data-toggle="tab" aria-expanded="true">
                                        <i className='fa fa-circle' style={{marginRight: '5px'}} />
                                        待审核
                                        <span style={{marginLeft: '5px'}}>({_.filter(this.props.appInfoList, function (app) {
                                            return app.category != -3;
                                        }).length})</span></a>
                                </li>
                                {
                                    _.map(this.props.categories,_.bind(function(item){
                                        return(
                                            <li onClick={this.handleCategoryChanged} id={item.index}>
                                                <a href='' style={{fontWeight: 'bold'}} data-toggle="tab" aria-expanded="true">
                                                    <i className={item.icon} style={{marginRight: '5px'}} />
                                                    {item.name}
                                                    <span style={{marginLeft: '5px'}}>({_.filter(this.props.appInfoList, function (app) {
                                                        return app.category == item.index;
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
                    <div className='flex-layout flex-vertical' style={{height: '100%'}}>
                        <div className="panel-heading text-center" style={{height: '42px', lineHeight: '42px'}}>
                            <span className="fs15 fw600">应用审核</span>
                        </div>
                        <div className='panel mn flex-item' style={{height: '660px', position: 'relative', overflow: 'auto'}}>
                            <AppPublishComp appInfo={this.state.selectedApp}
                                            categories={this.props.categories}
                                            mode="edit"/>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    componentDidMount:function(){
        var windowHeight = document.documentElement.clientHeight;
        var offsetTop = $(this.refs.manageDiv).offset().top;
        var listHeight = windowHeight-offsetTop;
        $(this.refs.manageDiv).height(listHeight);
     }

});

var AppNanageComponent = React.createClass({
    render: function () {
        return (
            <div>
                <CategoryNavigationComp appInfoList={AppInfoList}
                                        categories={Categories}/>
            </div>
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

            ReactDOM.render(<AppNanageComponent />, document.getElementById('content-container'));
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
