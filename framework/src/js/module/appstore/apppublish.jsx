var React = require('react');
var ReactDOM = require('react-dom');
var _ = require('underscore');
var $ = require('jquery');
var MultiSelect = require('widget/multiselect');
var Notify = require('nova-notify');
var IconPicker = require('module/appstore/iconpicker.jsx');
var ImgPicker = require('module/appstore/imgpicker.jsx');
var utils = require('nova-utils');
var config = require('config');

var id = utils.getURLParameter('id');
var type = utils.getURLParameter('type');

var data = {
	id: 0,
	category: 1,
	description: "",
	developer: "平台提供",
	icon: "",
	img: "",
	openmode: 0,
	tag: "",
	title: "",
	url: ""
}

const openMode = [{
	title: "当前页面打开",
	value: 0
}, {
	title: "新页面打开",
	value: 1
}, {
	title: "嵌入当前页面展示",
	value: 2
}]

var AppPublishComp = React.createClass({
	getInitialState: function() {
		/* isUsed
		 -2: 初次加载界面状态
		 -1: 正在调用服务
		 0: title为空
		 1: title可用
		 2: title不可用
		 */
		return {
			isUsed: -2,
			titleValue: this.props.appInfo? this.props.appInfo.title: data.title,
			developerValue: this.props.appInfo? this.props.appInfo.developer: data.developer,
			urlValue: this.props.appInfo? this.props.appInfo.url: data.url,
			descriptionValue: this.props.appInfo? this.props.appInfo.description: data.description
		};
	},

	componentWillMount: function() {
		/* 模型固化获取默认值 */
		var that = this;
		if(id) {
			$.ajaxSettings.async = false;
			$.getJSON(
				'/appstore/getDefaultAppInfo',
				{
					id: id,
					type: type
				},
				function(rsp) {
					if (rsp.code == 0) {
						data = rsp.data;
						data.developer = data.developer? data.developerInput: "平台提供";
						that.setState({
							titleValue: data.title,
							developerValue: data.developer,
							urlValue:data.url,
							descriptionValue: data.description
						});
					} else {
						Notify.simpleNotify("获取应用信息失败", rsp.message , 'error');
					}
				}
			);
			$.ajaxSettings.async = true;
		}
	},

	componentDidMount: function() {
		/* 模型固化url不可修改 */
		if(type == "mode-apply") {
			$('#urlInput').attr("readOnly", "readonly");
		}
		
		if(this.props.mode == "edit") {
			data.category = this.props.appInfo.category;
			data.openmode = this.props.appInfo.openmode;
		} else {
			data.category = this.props.categories[0].index;
			data.openmode = 0;
		}
	},

	componentWillReceiveProps: function(nextProps) {
		/* 编辑应用获取新的数据 */
		if(nextProps.appInfo) {
			this.setState({
				isUsed: -2,
				titleValue: nextProps.appInfo.title,
				developerValue: nextProps.appInfo.developer,
				urlValue: nextProps.appInfo.url,
				descriptionValue: nextProps.appInfo.description
			});
			data.category = nextProps.appInfo.category;
			data.openmode = nextProps.appInfo.openmode;
		}
	},

	addCategory: function(identity, option, checked, select) {
		data.category = option.val();
	},

	addOpenmode: function(identity, option, checked, select) {
		data.openmode = option.val();
	},

	handleTitleChange: function(e) {
		this.setState({
			titleValue: e.target.value
		})
	},

	handleDeveloperChange: function(e) {
		this.setState({
			developerValue: e.target.value
		})
	},

	handleUrlChange: function(e) {
		this.setState({
			urlValue: e.target.value
		})
	},

	handleDescriptionChange: function(e) {
		this.setState({
			descriptionValue: e.target.value
		})
	},

	judgeTitle: function() {
		if(this.props.mode == "edit") {
			if($("#titleInput").val() === this.props.appInfo.title) {
				this.setState({
					isUsed: 1
				});
				return;
			}
		}
		if($("#titleInput").val() === ""){
			this.setState({
				isUsed: 0
			});
			return;
		}
		var that = this;
		this.setState({
			isUsed: -1
		});
		$.getJSON(
			'/appstore/checkAppNameValid',
			{
				title: $("#titleInput").val()
			},
			function(rsp) {
				if (rsp.code == 0) {
					that.setState({isUsed: 1});
				} else {
					that.setState({isUsed: 2});
				}
			}
		);
	},

	onPublishClick: function(e) {
		if(this.state.isUsed != 1) {
			if(this.props.mode == "edit" && $("#titleInput").val() === this.props.appInfo.title) {
				data.title = $('#titleInput').val();
			} else {
				if(this.state.isUsed == 0 || $('#titleInput').val() === ""){
					Notify.simpleNotify("保存应用失败", "应用名称不能为空", 'error');
					return;
				} else if (this.state.isUsed == 2){
					Notify.simpleNotify("保存应用失败", "应用名称不可用", 'error');
					return;
				}
			}
		} else {
			data.title = $('#titleInput').val();
		}
		if(ImgPicker.getSelectedImg() == "/img/appstore/addImage.png") {
			Notify.simpleNotify("保存应用失败", "大图标不能为空", 'error');
			return;
		} else {
			data.img = ImgPicker.getSelectedImg();
		}
		if($('#developerInput').val() == "") {
			Notify.simpleNotify("保存应用失败", "开发者不能为空", 'error');
			return;
		} else {
			data.developer = $('#developerInput').val();
		}
		if($('#urlInput').val() == "") {
			Notify.simpleNotify("保存应用失败", "链接不能为空", 'error');
			return;
		} else {
			data.url = $('#urlInput').val();
		}
		if($('#descriptionInput').val() == "") {
			Notify.simpleNotify("保存应用失败", "应用描述不能为空", 'error');
			return;
		} else {
			data.description = $('#descriptionInput').val();
		}
		data.icon = IconPicker.getSelectedIcon();
		if(this.props.mode == "edit") {
			data.id = this.props.appInfo.id;
		}
		data.center_code = config['DataTypeCenterCode'];
		$.post(
			'/appstore/saveAppDetail',
			data,
			function(rsp) {
				if(rsp.code == 0) {
					Notify.simpleNotify("保存应用成功", data.title + "保存成功", 'success');
				} else {
					Notify.simpleNotify("保存应用失败", rsp.message , 'error');
				}
			},
			'json'
		)
	},

	render: function () {
		/* 发布应用和编辑应用的样式 */
		if(this.props.mode == "edit") {
			var labelClass = "col-md-4 control-label";
			var labelStyle = {textAlign: 'right',fontSize: '15px',fontWeight: '500',paddingTop: '8px',paddingRight: '20px'};
			var imgLabelStyle = {textAlign: 'right',fontSize: '15px',fontWeight: '500',paddingTop: '8px',marginTop: '18px',paddingRight: '20px'};
			var textStyle = {marginLeft: '-10px',marginRight: '-10px',marginTop: '-20px'};
			var numOfRow = 4;
			var configType = {
        		buttonWidth: '100%'
         	};
		} else {
			var labelClass = "col-md-2 control-label";
			var labelStyle = {textAlign: 'right',fontSize: '18px',fontWeight: '400',paddingTop: '8px',paddingRight: '25px'};
			var imgLabelStyle = {textAlign: 'right',fontSize: '18px',fontWeight: '400',paddingTop: '8px',marginTop: '18px',paddingRight: '25px'};
			var textStyle = {marginLeft: '1px',marginRight: '0px',marginTop: '-20px'};
			var numOfRow = 8;
			var configType = {
        		buttonWidth: '75%'
         	};
		}
		/* 应用名称合法性提示label */
		if(this.state.isUsed === 1) {
			var label = (<label style={{fontSize: '14px',color:'green'}}>名称可用</label>);
		} else if(this.state.isUsed === -2) {
			var label = null;
		} else if(this.state.isUsed === -1) {
			var label = (<i className="fa fa-spinner fa-spin fa-2x" style={{color:'grey',marginTop: '7px'}}/>);
		} else if(this.state.isUsed === 0){
			var label = (<label style={{fontSize: '14px',color:'red'}}>不能为空</label>);
		} else {
			var label = (<label style={{fontSize: '14px',color:'red'}}>名称不可用</label>);
		}

		return (
			<div className='flex-layout flex-vertical' style={{height: '100%'}}>
				<div className='panel mn flex-item'>
					<div className="tab-content pn br-n">
						<form className="form-horizontal" style={{margin: '10px 10px'}} id="publishForm">
							<div className="form-group" style={{marginLeft: '-10px',marginRight: '-10px'}}>
								<label className={labelClass} style={labelStyle}>应用名称<label style={{color:'red',fontSize:'17px'}}>*</label></label>
								<div className="col-md-5 control-group">
									<input type="text" id="titleInput" name="titleInput" className="form-control" placeholder="请输入应用名称" onBlur={this.judgeTitle} onChange={this.handleTitleChange} value={this.state.titleValue}/>
								</div>
								<div className="col-md-3" style={{height: '39px',paddingLeft: '0px',lineHeight: '39px'}}>
									{label}
								</div>
							</div>
							<div className="form-group" style={{marginLeft: '-10px',marginRight: '-10px'}}>
								<label className={labelClass} style={imgLabelStyle}>大图标<label style={{color:'red',fontSize:'17px'}}>*</label></label>
								<div className="col-md-2 control-group" style={{height: '80px'}}>
									<ImgPicker.ImgPicker img={this.props.mode == "edit"? this.props.appInfo.img: data.img}/>
								</div>
							</div>
							<div className="form-group" style={{marginLeft: '-10px',marginRight: '-10px'}}>
								<label className={labelClass} style={labelStyle}>图标<label style={{color:'red',fontSize:'17px'}}>*</label></label>
								<div className="col-md-6 control-group">
									<IconPicker.IconPicker icon={this.props.mode == "edit"? this.props.appInfo.icon: data.icon} numOfRow={numOfRow}/>
								</div>
							</div>
							<div className='form-group' style={{marginLeft: '-10px',marginRight: '-10px'}}>
								<label className={labelClass} style={labelStyle}>开发者<label style={{color:'red',fontSize:'17px'}}>*</label></label>
								<div className="col-md-5 control-group">
									<input className="form-control" id='developerInput' name="developerInput" type="text" onChange={this.handleDeveloperChange} value={this.state.developerValue}></input>
								</div>
							</div>
							<div className='form-group' style={{marginLeft: '-10px',marginRight: '-10px'}}>
								<label className={labelClass} style={labelStyle}>所属分类</label>
								<div className="col-md-5 control-group">
									<MultiSelect config={configType} data={_.map(this.props.categories, _.bind(function(item) {
										return {
											label: item.name,
											value: item.index,
											selected: item.index === (this.props.mode == "edit"? this.props.appInfo.category: data.category)
										}
									}, this))} onChange={this.addCategory}></MultiSelect>
								</div>
							</div>
							<div className='form-group' style={{marginLeft: '-10px',marginRight: '-10px'}}>
								<label className={labelClass} style={labelStyle}>打开模式</label>
								<div className="col-md-5 control-group">
									<MultiSelect config={configType} data={_.map(openMode, _.bind(function(item) {
										return {
											label: item.title,
											value: item.value,
											selected: item.value === (this.props.mode == "edit"? this.props.appInfo.openmode: data.openmode)
										}
									}, this))} onChange={this.addOpenmode}></MultiSelect>
								</div>
							</div>
							<div className='form-group' style={{marginLeft: '-10px',marginRight: '-10px'}}>
								<label className={labelClass} style={labelStyle}>链接<label style={{color:'red',fontSize:'17px'}}>*</label></label>
								<div className="col-md-8 control-group">
									<input id='urlInput' name="urlInput" type="text" className="form-control" placeholder="请输入链接" onChange={this.handleUrlChange} value={this.state.urlValue}></input>
								</div>
							</div>
							<div className='form-group' style={{marginLeft: '-10px',marginRight: '-10px'}}>
								<label className={labelClass} style={labelStyle}>应用介绍<label style={{color:'red',fontSize:'17px'}}>*</label></label>
							</div>
							<div className='form-group' style={textStyle}>
								<div className="col-md-12 control-group">
									<textarea id='descriptionInput' name="descriptionInput" className="form-control" style={{height: '300px'}} placeholder="请输入应用介绍" onChange={this.handleDescriptionChange} value={this.state.descriptionValue}></textarea>
								</div>
							</div>
							<div className="admin-form pull-right" style={{marginBottom: '10px'}}>
								<div className="col-md-12">
									<button className="button btn-primary" type="button" id="submit-btn" style={{minWidth: '100px',padding: '3px'}} onClick={this.onPublishClick}>
										<i className="fa fa-share"></i>
										保存应用
									</button>
								</div>
							</div>
						</form>
					</div>
				</div>
			</div>
		)
	}
});

module.exports.AppPublishComp = AppPublishComp;