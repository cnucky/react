var React = require('react');
var ReactDOM = require('react-dom');
var _ = require('underscore');
var $ = require('jquery');
var Dialog = require('nova-home-dialog');
var MultiSelect = require('widget/multiselect');
var ScrollArea = require('react-scrollbar');
require('module/appstore/appstore.less');

var AppDetailComp = React.createClass({
    getInitialState: function () {
        return {
            hasAdded: this.props.appInfo.hasAdded
        };
    },
    componentWillReceiveProps: function (nextProps) {
      this.setState({
          hasAdded: nextProps.appInfo.hasAdded
      });
    },
    onAddAppClick: function(){
        this.props.onChangeFavorCall(this.props.appInfo.id,'add');
    },
    onDeleteAppClick: function () {
        this.props.onChangeFavorCall(this.props.appInfo.id,'delete');
    },
    render: function () {
        var appInfo = this.props.appInfo;
        return (
            <div className='flex-layout flex-vertical' style={{height: '100%'}}>
                <div className="panel-heading text-center" style={{height: '42px', lineHeight: '42px'}}>
                    <span className="fs15 fw600">应用详情</span>
                </div>
                <div ref='detailDiv' className='panel mn flex-item' style={{height: '100%', position: 'relative', overflow: 'auto'}}>
                    <div className="tab-content pn br-n">
                        <div className="flex-layout" style={{height: '80px', margin: '20px'}}>
                            <div style={{float:'left', width: '80px',height: '80px',position: 'relative'}}>
                                {
                                    this.state.hasAdded == 1 ?
                                        <div>
                                            <div className='triangle-topleft2'></div>
                                            <i className='fa fa-check check-span2'></i>
                                        </div> : null
                                }
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
                                this.state.hasAdded ?
                                    <div style={{width: '110px',float:'right',paddingTop: '20px',position: 'relative'}}>
                                        <button className="btn btn-info btn-block" style={{width: '110px'}}
                                            onClick={this.onDeleteAppClick}>
                                            <i className="fa fa-trash" style={{paddingRight: '5px'}}></i>
                                            从桌面移除
                                        </button>
                                    </div> :
                                    <div style={{width: '110px',float:'right',paddingTop: '20px',position: 'relative'}}>

                                        <button className="btn btn-system btn-block" style={{width: '110px'}}
                                            onClick={this.onAddAppClick}>
                                            <i className="fa fa-plus" style={{paddingRight: '5px'}}></i>
                                            添加至桌面
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
                                    <label>所属分类: {_.find(this.props.categories, function (item) {
                                        return item.id == appInfo.category
                                    }).name }</label>
                                </div>
                                <div style={{float: 'left',margin: '5px 10px'}}>
                                    <label>发布时间: {appInfo.pubdate}</label>
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
    },
    componentDidMount:function(){
        var windowHeight = document.documentElement.clientHeight;  
        var offsetTop = $(this.refs.detailDiv).offset().top;
        var listHeight = windowHeight-offsetTop;
        $(this.refs.detailDiv).height(listHeight);       
     }
});

module.exports.AppDetailComp = AppDetailComp;