var React = require('react');
var ReactDOM = require('react-dom');
var _ = require('underscore');
var $ = require('jquery');
var Dialog = require('nova-home-dialog');
var MultiSelect = require('widget/multiselect');
require('module/appstore/appstore.less');

var openMode = [{
    title: "当前页面打开",
    value: 0
}, {
    title: "新页面打开",
    value: 1
}, {
    title: "嵌入当前页面展示",
    value: 2
}];

var AppEditComp = React.createClass({
    getInitialState: function(){
        return{
            state: this.props.appInfo.state
        }
    },
    componentWillReceiveProps: function (nextProps) {
        if (nextProps.appInfo != this.props.appInfo){
            this.setState({
                state: nextProps.appInfo.state
            });
        }
    },
    onReturnClick: function(){
        this.props.onReturnClickCall();
    },
    render: function () {
        var appInfo = this.props.appInfo;
        return (
            <div className='flex-layout flex-vertical' style={{height: '100%'}}>
                <div className="panel-heading text-center" style={{height: '42px', lineHeight: '42px'}}>
                    <span className="fs15 fw600">应用审核</span>
                    <span className="panel-controls" id="right-panel-controllers">
                        <a className="fa fa-edit"  data-toggle='tooltip' data-original-title="编辑" style={{color: '#3498db'}}></a>
                    </span>
                </div>

                <div className='panel mn flex-item' style={{position: 'relative', overflow: 'auto'}}>
                    <div className="tab-content pn br-n">
                        <div className="flex-layout" style={{height: '80px', margin: '20px'}}>
                            <div style={{float:'left', width: '80px',height: '80px'}}>
                                <img style={{width: '80px',height: '80px'}} src={appInfo.img}/>
                            </div>

                            <div className="flex-item" style={{margin:'10px 20px'}}>
                                <div>
                                    <label style={{fontSize: '18',fontWeight: 'bold'}}>{appInfo.title}</label>
                                </div>
                                <div>
                                    <label style={{fontWeight: 'normal'}}>下载： {appInfo.downloads}次</label>
                                </div>
                            </div>

                            {
                                this.state.state == 0 ?
                                    <div style={{width: '100px',float:'right',paddingTop: '20px',position: 'relative'}}>
                                        <button className="btn btn-system btn-block" style={{width: '100px'}}
                                                onClick={this.onAddAppClick}>
                                            <i className="fa fa-anchor" style={{paddingRight: '5px'}}></i>
                                            审核通过
                                        </button>
                                    </div> :
                                    <div style={{width: '100px',float:'right',paddingTop: '20px',position: 'relative'}}>

                                        <button className="btn btn-info btn-block" style={{width: '100px'}}
                                                onClick={this.onAddAppClick}>
                                            <i className="fa fa-trash" style={{paddingRight: '5px'}}></i>
                                            下架应用
                                        </button>
                                    </div>

                            }

                        </div>

                        <div style={{margin: '10px 20px'}}>
                            <div className='row'>
                                <div style={{float: 'left',margin: '5px 10px'}}>
                                    <label style={{fontWeight: 'bold'}}>开发者: </label>
                                    <label style={{fontWeight: 'bold',fontColor:'red'}}>{appInfo.developer}</label>
                                </div>

                                <div style={{float: 'left',margin: '5px 10px'}}>
                                    <label>发布时间: {appInfo.pubdate}</label>
                                </div>

                                <div style={{float: 'left',margin: '5px 10px'}}>
                                    <label>所属分类: {_.find(this.props.categories, function (item) {
                                        return item.id == appInfo.category
                                    }).name }</label>
                                </div>

                                <div style={{float: 'left',margin: '5px 10px'}}>
                                    <label>打开方式: {_.find(openMode, function (item) {
                                        return item.value == appInfo.openmode
                                    }).title }</label>
                                </div>

                                <div style={{float: 'left',margin: '5px 5px 5px 10px'}}>
                                    <label>链接地址: {appInfo.url}</label>
                                </div>
                            </div>
                            <div style={{margin: '10px 0px'}}>
                                <label style={{fontSize: '18',fontWeight: 'bold'}}>应用介绍</label>
                            </div>
                            <div>
                                <span >{appInfo.description}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
});

module.exports.AppEditComp = AppEditComp;