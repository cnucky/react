import React from 'react';
import {store, storeAPI} from './store';
import Notify from 'nova-notify';

var ColumnSetting = React.createClass({
	
	propTypes: {
		id: React.PropTypes.string.isRequired,
		num: React.PropTypes.number.isRequired
    },

	getInitialState() {
		return { num: this.props.num };
	},

	componentWillReceiveProps(nextProps) {
		this.setState({ num:nextProps.num });
	},

	columnNumChange(e) {
		var newNum = e.target.value;
		if(newNum >= 1 && newNum <= 4 || newNum === "") {
			this.setState({ num:newNum });
		}
		else
			Notify.simpleNotify("列数超过值域", "请将列数控制在1~4列之内", 'error');
	},

	handleSubmit() {
		var newNum = this.state.num; 
		var currentNum = storeAPI.layoutChildrenNums(this.props.id);
		if(newNum === "")
			this.setState({ num: this.props.num });
		else if(newNum > currentNum)
			store.dispatch({ type:'EXPAND_LAYOUT', id:this.props.id, expandNum:newNum - currentNum });
		else if(newNum < currentNum)
			store.dispatch({ type:'Multi_SHRINK_LAYOUT', id:this.props.id, shrinkNum:currentNum - newNum });
	},

	render() {
		return (
			<form className="form-horizontal" role="form">
				<div className="row mn lh30 pl10">
					<span className="col-md-4 pn" style={{textAlign:'left'}}>
						列数量
					</span>
					<span className="input-group input-group-sm col-md-7">
						<input className="form-control" type="number" min="1" max="4" value={this.state.num} onChange={this.columnNumChange} />
					</span>
				</div>

				<div className="admin-form pull-right" style={{marginTop: '10px'}}>
					<div className="col-md-12">
						<button
							className="button" type="button"
							style={{width: '60px', height: '35px', fontSize: '10px', lineHeight: '35px',marginRight: '10px',padding: 0, backgroundColor: '#43b4ff'}}
							onClick={this.handleSubmit}
							>
							更新
						</button>
					</div>
				</div>
			</form>
		);
	}
});

var TabSetting = React.createClass({
	
	propTypes: {
		id: React.PropTypes.string.isRequired,
		num: React.PropTypes.number.isRequired,
		activePage: React.PropTypes.number.isRequired,
		titles: React.PropTypes.array.isRequired 
    },

	getInitialState() {
		return { num:this.props.num, titles:this.props.titles };
	},

	componentWillReceiveProps(nextProps) {
		this.setState({ num:nextProps.num, titles:nextProps.titles });
	},

	tabNumChange(e) {
		var newNum = e.target.value;
		if(newNum >= 1 && newNum <= 20 || newNum === "") {
			this.setState({ num:newNum });
		}
		else
			Notify.simpleNotify("页数超过值域", "请将页数控制在1~20页之内", 'error');
	},

	titleChange(e) {
		var newTitles = JSON.parse(JSON.stringify(this.props.titles));
		var newTitle = e.target.value.trim();
		newTitles[this.props.activePage] = newTitle;
		this.setState({ titles:newTitles });
	},

	handleSubmit(e) {
		/** 更新页数 */
		var newNum = this.state.num
		var title = this.state.titles[this.props.activePage]
		let titles = this.state.titles
		var currentNum = storeAPI.layoutChildrenNums(this.props.id);
		let preTitle = this.props.titles[this.props.activePage]
		e.stopPropagation()
		if (title === '') {
			Notify.show({
				title: '更新失败，当前页标题未填写',
				type: "warning"
			})
			titles[this.props.activePage] = title === '' ? preTitle : title
			this.setState({ titles:titles });
			return
		} else {
			Notify.show({
				title: "更新成功",
				type: "success"
			})
			if (preTitle === titles[this.props.activePage]) {
				return
			}
		}
		if(newNum === "")
			this.setState({ num: this.props.num });
		else if(newNum > currentNum)
			store.dispatch({ type:'EXPAND_LAYOUT', id:this.props.id, expandNum:newNum - currentNum });
		else if(newNum < currentNum)
			store.dispatch({ type:'Multi_SHRINK_LAYOUT', id:this.props.id, shrinkNum:currentNum - newNum });
		/** 更新标题 */
		store.dispatch({ type:'UPDATE_LAYOUT', id:this.props.id, titles:titles });
	},

	render() {

		var title = this.state.titles[this.props.activePage];

		return (
			<form className="form-horizontal" role="form">
				<div className="row mn lh30 pl10">
					<span className="col-md-4 pn" style={{textAlign:'left'}}>
						Tab页数量
					</span>
					<span className="input-group input-group-sm col-md-7">
						<input className="form-control" type="number" min="1" max="20" value={this.state.num} onChange={this.tabNumChange} />
					</span>
				</div>

				<div className="row mn lh30 pt10 pl10">
					<span className="col-md-4 pn" style={{textAlign:'left'}}>
						当前页标题
					</span>
					<span className="input-group input-group-sm col-md-7">
						<input className="form-control" type="text" value={title} onChange={this.titleChange}  onBlur={this.handleNumChange} />
					</span>
				</div>

				<div className="admin-form pull-right" style={{marginTop: '10px'}}>
					<div className="col-md-12">
						<button
							className="button" type="button"
							style={{width: '60px', height: '35px', fontSize: '10px', lineHeight: '35px',marginRight: '10px',padding: 0, backgroundColor: '#43b4ff'}}
							onClick={this.handleSubmit}
						>
							更新
						</button>
					</div>
				</div>
			</form>
		);
	}
});

var IFrameSetting = React.createClass({
	
	propTypes: {
		id: React.PropTypes.string.isRequired,
		url: React.PropTypes.string.isRequired,
		proportion: React.PropTypes.string.isRequired,
		height: React.PropTypes.string.isRequired
    },

    getInitialState: function() {
        return {
              url: this.props.url,
              proportion: this.props.proportion,
              height: this.props.height
        };
    },

	componentWillReceiveProps(nextProps) {
		this.setState({ 
			url: nextProps.url,
			proportion: nextProps.proportion,
			height: nextProps.height 
		});
	},

    handleUrlChange: function(e) {
    	this.setState({
    		url: e.target.value
    	});
    },

    handleWidthChange: function(e) {
    	this.setState({
    		proportion: e.target.value
    	});
    },

    handleHeightChange: function(e) {
    	this.setState({
    		height: e.target.value
    	});
    },

    handleSubmit: function(e) {
    	if(!$('#iFrameUrl').val()) {
    		Notify.simpleNotify("地址为空", "请输入地址", 'error');
    		return;
    	}
		var url = $('#iFrameUrl').val();
		if(url.substring(0,4) != "http") {
			url = "http://" + url;
		}
		if(this.isUrl(url) == false) {
			Notify.simpleNotify("地址不合法", "请输入正确地址", 'error');
			return;
		}

		if(!$('#iFrameWidth').val()) {
			var proportion = "100%";
		} else {
			if(this.isWidthValid($('#iFrameWidth').val())&&$('#iFrameWidth').val()!="0%") {
				proportion = $('#iFrameWidth').val();
			} else {
				Notify.simpleNotify("宽度输入不合法", "请输入1~100之间的整数百分比", 'error');
				return;
			}
		}

		if(!$('#iFrameHeight').val()) {
			var height = 150;
		} else {
			if(this.isHeightValid($('#iFrameHeight').val())) {
				height = $('#iFrameHeight').val();
			} else {
				Notify.simpleNotify("高度输入不合法", "请输入大于0的整数", 'error');
				return;
			}
		}

    	store.dispatch({
    		type: "UPDATE_LAYOUT",
    		id: this.props.id,
    		iFrameUrl: url,
    		iFrameProportion: proportion,
    		height: Number(height)
    	}); 	
    },

    isUrl: function(url) {
    	var strRegex = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
		var re = new RegExp(strRegex);
		return re.test(url);	
    },

    isWidthValid: function(input) {
    	var strRegexP = /^(100|[1-9]?\d)%$/;
		var isPercentage = new RegExp(strRegexP);
		return isPercentage.test(input);
    },

    isHeightValid: function(input) {
    	var strRegexN = /^\+?[1-9][0-9]*$/
		var isNumber = new RegExp(strRegexN);
		return isNumber.test(input);
    },

	render() {
		return (
			<form className="form-horizontal" role="form">
				<div className="row mn lh30 pl10">
					<span className="col-md-4 pn" style={{textAlign:'left'}}>
						地址
					</span>
					<span className="input-group input-group-sm col-md-7">
						<input id="iFrameUrl" className="form-control" placeholder="http(s)" value={this.state.url} onChange={this.handleUrlChange}/>
					</span>
				</div>

				<div className="row mn lh30 pt10 pl10">
					<span className="col-md-4 pn" style={{textAlign:'left'}}>
						宽度
					</span>
					<span className="input-group input-group-sm col-md-7">
						<input id="iFrameWidth" className="form-control" placeholder="百分比" value={this.state.proportion} onChange={this.handleWidthChange}/>
					</span>
				</div>

				<div className="row mn lh30 pt10 pl10">
					<span className="col-md-4 pn" style={{textAlign:'left'}}>
						高度
					</span>
					<span className="input-group input-group-sm col-md-7">
						<input id="iFrameHeight" type="number" className="form-control" placeholder="数值" value={this.state.height} onChange={this.handleHeightChange}/>
					</span>
				</div>

				<div className="admin-form pull-right" style={{marginTop: '10px'}}>
					<div className="col-md-12">
						<button
							className="button" type="button"
							style={{width: '60px', height: '35px', fontSize: '10px', lineHeight: '35px',marginRight: '10px',padding: 0, backgroundColor: '#43b4ff'}}
							onClick={this.handleSubmit}
							>
							更新
						</button>
					</div>
				</div>
			</form>
		);
	}
});

var LayoutSetting = React.createClass({
    
    propTypes: {
        layout: React.PropTypes.object.isRequired
    },

    render() {
		var title;
		var layoutSettingPanel;
		var layout = this.props.layout;

		switch(layout.layoutType) {
			case 'TAB': {
				title = "Tab";
				layoutSettingPanel = <TabSetting id={layout.id} num={layout.num} activePage={layout.activePage} titles={layout.titles} />;
				break;
			}
			case 'COLUMN': {
				title = "列布局";
				layoutSettingPanel = <ColumnSetting id={layout.id} num={layout.num} />;
				break;
			}
			case 'IFRAME': {
				title = "iFrame";
				layoutSettingPanel = <IFrameSetting id={layout.id} url={layout.iFrameUrl} proportion={layout.iFrameProportion} height={layout.height} />;
				break;
			}
		}

        return (
			<div className="panel mbn flex-layout flex-vertical" style={{height: '100%'}}>
				<div className="panel-heading text-center" style={{height: '42px', lineHeight: '42px'}}>
					<span className="fs15 fw600">{ title }</span>
				</div>

				<div className="panel-body flex-item" style={{overflowY: 'auto'}}>
					<div id='tab-setting' className="pn br-n">
						{ layoutSettingPanel }
					</div>
				</div>
			</div>
        );
    }
});

export default LayoutSetting;