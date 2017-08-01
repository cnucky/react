var React = require('react');
var ReactDOM = require('react-dom');
var _ = require('underscore');
var $ = require('jquery');
var MultiSelect = require('widget/multiselect');
var ScrollArea = require('react-scrollbar');
require('module/appstore/appstore.less');


var SingleAppComp = React.createClass({
    getInitialState: function(){
        return {
            hasAdded : this.props.appInfo.hasAdded
        }
    },
    componentWillReceiveProps: function(nextProps){
        this.setState({
            hasAdded: nextProps.appInfo.hasAdded
        });
    },
    onAppIconClick: function() {
        this.props.onAppIconClickCall(this.props.appInfo);
    },
    render: function() {
        var appInfo = this.props.appInfo;
        return (
            <div style={{width: '115px',height: '140px',marginRight: '15px',marginLeft: '15px'}}>
                <div className="app-icon">
                    {
                        this.state.hasAdded == 1 ?
                            <div>
                                <div className='triangle-topleft'></div>
                                <i className='fa fa-check check-span'></i>
                            </div> : null
                    }

                    <a style={{position: 'relative',top: '7.5px'}}>
                        <img className="img-single" src={appInfo.img} onClick={this.onAppIconClick}/>
                    </a>
                </div>

                <div>
                    <label style={{width: '115px',textAlign:"center"}}>{appInfo.title}</label>
                </div>
            </div>
        )
    }
});

var AppGroupComp = React.createClass({
    render: function() {
        return (
            <div className='flex-layout flex-vertical'>
                <h2 style={{padding: '1px 30px 10px 30px'}}>{this.props.category}</h2>

                <div className='flex-item'>
                    <ul style={{listStyle:"none"}}>
                        {
                            _.map(this.props.appInfoList, _.bind(function (item) {
                                return (
                                    <li style={{float:"left"}}>
                                        <SingleAppComp appInfo={item}
                                                       onAppIconClickCall={this.props.onAppIconClickCall}/>
                                    </li>
                                )
                            }, this))
                        }
                    </ul>
                </div>
                <hr style={{margin: '20px 0px 10px 0px'}}/>
            </div>
        )
    }
});

function _constructGroupData(categories,appInfoList){
    var data = [];
    _.forEach(categories,function(item){
        var apps = _.filter(appInfoList, function (app) {
            return app.category == item.id;
        });
        if (apps != undefined && apps.length > 0){
            data.push({
                category: item,
                appInfoList: apps
            })
        }
    });
    return data;
}

var AppListComp = React.createClass({
    getInitialState: function(){
        return{
            selectedCategory: this.props.selectedCategory,
            userInput: '',
            filterApps: this.props.appInfoList
        };
    },
    componentWillReceiveProps: function (nextProps) {
        if (nextProps.appInfoList != this.props.appInfoList){
            this.setState({
                selectedCategory: nextProps.selectedCategory,
                userInput: '',
                filterApps: nextProps.appInfoList
            });
        }
    },
    onInputChange: function (e) {
        this.setState({
            userInput: e.target.value
        });
        var text = $.trim(e.target.value);
        if (_.isEmpty(text)){
            this.state.filterApps = this.props.appInfoList;
        }else{
            this.state.filterApps = _.filter(this.props.appInfoList,function(item){
                return item.title.indexOf(text) > -1
            })
        }
        this.setState({
            filterApps: this.state.filterApps
        });
    },
    onClearClick: function () {
        this.setState({
            userInput: '',
            filterApps: this.props.appInfoList
        });
    },
    render: function() {
        var orderingRules = ['发布时间', '下载量', '综合评分'];
        var data = _constructGroupData(this.props.categories, this.state.filterApps);
        return (
            <div style={{height: '100%'}}>
                <div
                    style={{width: '100%', height: '42px', padding: '5px 10px', background: '#fafafa', position: 'relative', top: 0}} ref='headerDiv'>
                    {
                        this.state.selectedCategory > 0 ?
                            <div className='flex-layout col-md-4 hide' style={{float: 'left',height: '100%'}}>
                                <div style={{width: '80px'}}>
                                    <label style={{padding: '5px 10px'}}>排序方式: </label>
                                </div>
                                <div className='flex-item'>
                                    <MultiSelect config={{
                                                 nonSelectedText: '未选择类别',
                                                 nSelectedText: '个类别已选择',
                                                 buttonClass: 'multiselect dropdown-toggle btn btn-sm btn-primary',
                                                 includeSelectAllOption: true}}
                                                 updateData={true} onChange={this.handleSelectField}
                                                 data={
								_.map(orderingRules,_.bind(function(item){
								return{
										label: item,
										value: item
									  }
								},this))}/>
                                </div>
                            </div> : null
                    }

                    <div className='flex-layout col-md-4' style={{float: 'right', height: '100%'}}>
                        <div className="flex-item editable-input" style={{position: 'relative'}}>
                            <input ref='searchInput' type="text" className="form-control input-sm"
                                   onChange={this.onInputChange}
                                   value={this.state.userInput} placeholder='搜索应用'>
                            </input>
                            <span className="editable-clear-x" style={{display: 'block'}}></span>
                        </div>
                        <div style={{width: '60px',paddingLeft: '5px'}}>
                            <button className='btn btn-primary btn-sm' onClick={this.onClearClick}>
                                清除
                                <span id="matches"></span>
                            </button>
                        </div>
                    </div>
                </div>
                <div style={{width: '100%', position: 'relative', overflow: 'auto'}} ref='listDiv'>

                        {
                            _.map(data, _.bind(function (item) {
                                return (
                                    <AppGroupComp category={item.category.name}
                                                  appInfoList={item.appInfoList}
                                                  onAppIconClickCall={this.props.onAppIconClickCall}/>
                                )
                            }, this))
                        }
                    </div>

            </div>
        )
    },
    componentDidMount:function(){
        var windowHeight = document.documentElement.clientHeight;
        var offsetTop = $(this.refs.listDiv).offset().top;
        var listHeight = windowHeight-offsetTop;
        $(this.refs.listDiv).height(listHeight);      
     }
});
/* <div style={{height: '660px', position: 'relative'}}>*/
/* </div>*/
module.exports.AppListComp = AppListComp;