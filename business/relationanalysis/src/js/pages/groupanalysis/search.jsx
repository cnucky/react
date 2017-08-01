import React from 'react';
import {render} from 'react-dom';
var Alert  = require('nova-alert');
import SelfDateTimePicker from 'widget/self-datetime-picker';
var _ = require('underscore');

var moment = require('moment');

const Notify = require('nova-notify');
require('../../module/group-analysis/searchinfo.less');

var typeDetail = {
	"1": {class:'fa fa-user',color:'#F6B132',text:"身份证"},
	"5": {class:'fa fa-phone-square',color:'#6EAFF7',text:"手机"},
	"11": {class:'fa fa-qq',color:'#E95D35',text:"QQ"},
	"12": {class:'fa fa-envelope',color:'#6B4897',text:"电子邮箱"},
	"2": {class:'fa fa-ticket',color:'#F64662',text:"护照"},
	"3": {class:'fa fa-cc-visa',color:'#5457A6',text:"签证"},
	"7": {class:'fa fa-credit-card',color:'#0066CC',text:"银行账户"},
	"14": {class:'fa fa-wifi',color:'#A2453D',text:"IP"},
	"16": {class:'alibaba alitao fs14',color:'#FF5500',text:"淘宝"},
	"17": {class:'alibaba alipay fs14',color:'#01AAEF',text:"支付宝"}
}

var hiddenDetail = {
	"4": {class:'fa fa-phone-square',color:'#F39C9C',text:"电话"},
	"6": {class:'fa fa-bus',color:'#29CDB5',text:"汽车"},
	"8": {class:'fa fa-bed',color:'#80EF91',text:"宾馆"},
	"9": {class:'fa fa-train',color:'#EC952E',text:"火车"},
	"10": {class:'fa fa-plane',color:'#4BC87F',text:"飞机"},
	"13": {class:'fa fa-weibo',color:'#F06161',text:"微博"},
	"15": {class:'fa fa-users',color:'#00ADB5',text:"QQ群组"}
}


var timeDetail = {
	'oneMonth':{text:'近一月'},
	'treeMonths':{text:'近三月'},
	'halfYear':{text:'近半年'},
	'year':{text:'近一年'},
	'treeYears':{text:'近三年'},
	'custom':{text:'自定义'}
}


 //pattern
var certPattern = /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{4}$/;
var mobilePattern = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
var mailPattern = /^([\w\!\#$\%\&\'\*\+\-\/\=\?\^\`{\|\}\~]+\.)*[\w\!\#$\%\&\'\*\+\-\/\=\?\^\`{\|\}\~]+@((((([a-z0-9]{1}[a-z0-9\-]{0,62}[a-z0-9]{1})|[a-z])\.)+[a-z]{2,6})|(\d{1,3}\.){3}\d{1,3}(\:\d{1,5})?)$/i;
var ipPattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
var nameAndBirthdayPattern = /^.+\+(\d{6}|\d{8})$/;

var dateValue=[];


class OptionSet extends React.Component {
	constructor(props) {
		super(props);
	}

	optionSet(){
		this.props.optionChange();
	}

	render(){
		return(
			<div id="show-picture">
				<div id="alert-container" style={{margin:'10px'}}>
				</div>
				<div id="set-container" >
					<a href="javascript:void(0)" style={{float:"right",marginRight:'5%'}} onClick={this.optionSet.bind(this)}>高级设置</a>
				</div>
				<div className="row mb30" id="search-header">
					<div className="col-md-8 center-block">
						<div className="row table-layout table-clear-xs">
							<div className="col-xs-12 col-sm-8">
								<div id="dock-content" className="ph10">
									<div id="dock-image" className="active-content">
										<div className="dock-item" data-title="Logo">
											<img className="img-responsive center-block" src="/relationanalysis/img/groupanalysis/group-analysis.jpg" alt="logo" />
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

		)
	}
}


class SearchBox extends React.Component {

	handleInput(e) {
		// console.log(e.target.value);
		this.props.onChange(e.target.value);
	}
	render() {
		var category = this.props.selected;
		var icon;
		if(category<=0){
		    icon=(<i id="search-icon" className="fa fa-search" style={{color: "#4ea5e0"}}></i>)
		}else{
		    icon = (<i id="search-icon" className={typeDetail[category].class} style={{color: typeDetail[category].color}}></i>)
		}
		return (
			<div className="admin-form mw1000 mauto" id="search">
		            <div className="smart-widget sm-right smr-80" style={{position:'relative'}}>
		                <label className="field prepend-icon">
		                    <input type="text" name="keyword" id="keyword" className="gui-input" placeholder="关键词" onInput={this.handleInput.bind(this)}/>
		                    <label forHtml="keyword" className="field-icon">
		                    {icon}
		                    </label>
		                </label>
		                <button id="search-button" style={{padding:'0 10 0 10'}} className="button btn-primary" onClick={this.props.handleSearch}>搜索</button>


					</div>
		    </div>
			)
	}
}

class TypeBar extends React.Component {
    handleSelect(value,e){
    	if(value==this.props.selected){
    		this.props.onChange(0);
    	}else{
    		this.props.onChange(value);
    	}
    }
	render() {
		var category = this.props.selected;
		return (
			<div style={{marginTop:'15px'}} id="search-category" className=" section mw1000 mauto" >
		        <div className="col-md-12 mb10 ml15" >
					<div style={{ width:'40px'}} onClick={this.props.typeChange}>
						<label style={{cursor:'pointer'}}  className="">
							类别
						</label>
					</div>
		        </div>
				<div>
					{
						_.map(typeDetail, function(item,key){
							return(
								<div style={{}} className={category==key ? "category mb10 checked":"category mb10"} onClick={this.handleSelect.bind(this,key)}>
									<div className="category-icon" style={{background: item.color}}><span className={item.class}></span></div>
									<div className="category-text">
										<p>{item.text}</p>
									</div>
								</div>
							)
						},this)
					}
					{
						_.map(hiddenDetail,function(item,key){
							return(
								<div className="category mb10 hidden" value={key}>
									<div className="category-icon" style={{background: item.color}}><span className={item.class}></span></div>
									<div className="category-text">
										<p>{item.text}</p>
									</div>
								</div>
							)
						},this)
					}
				</div>

		    </div>
			)
	}
}




var date=new Date();
var now =moment().format('L');
var oneMonth = moment().subtract(1,'month').format('L');
var treeMonths = moment().subtract(3,'month').format('L');
var halfYear = moment().subtract(6,'month').format('L');
var year =  moment().subtract(1,'year').format('L');
var treeYears =  moment().subtract(3,'year').format('L');



class SearchWrapper extends React.Component {
	constructor(props) {
        super(props);
        this.state = {
        	display:'none',
			start: '',
			end: '',
        	selectKey:'',
			blur:true,
        	isSelected:true,
        	categoryStabled: false,
        	categoryValue: 0,
        	inputValue: ''
        };
    }
	componentDidMount() {


	}
    handleAutoMatch(inputValue) {
    	if (!this.state.categoryStabled && inputValue) {
            if (certPattern.test(inputValue)) {
                this.setState({
		    		categoryValue: 1
		    	});
            } else if (mobilePattern.test(inputValue)) {
                this.setState({
		    		categoryValue: 5
		    	});
            } else if (mailPattern.test(inputValue)) {
                this.setState({
		    		categoryValue: 12
		    	});
            } else if (ipPattern.test(inputValue)) {
                this.setState({
		    		categoryValue: 14
		    	});
            } else {
                this.setState({
		    		categoryValue: 0
		    	});
            }
        }
        if(inputValue != null){
    		this.setState({
    			inputValue: inputValue
			});
		}
    }
    handletypeSelect(value) {
    	if(value==0){
    		this.setState({
	    		categoryValue: value,
	    		categoryStabled:false
	    	});
    	}else{
    		this.setState({
	    		categoryValue: value,
	    		categoryStabled:true
	    	});
    	}
    }

	selected (key) {
		if (key == 'custom'){
			this.setState({
				selectKey:key,
				isSelected:true,
			});
		} else {
			this.setState({
				selectKey:key,
				isSelected:true,
			});
		}
		switch (key) {
			case 'custom':
				this.setState({
					start:'',
					end:'',
				});
				break;
			case 'oneMonth':
				this.setState({
					start:oneMonth,
					end:now,
				});
				break;
			case 'treeMonths':
				this.setState({
					start:treeMonths,
					end:now,
				});
				break;
			case 'halfYear':
				this.setState({
					start:halfYear,
					end:now,
				});
				break;
			case 'year':
				this.setState({
					start:year,
					end:now,
				});
				break;
			case 'treeYears':
				this.setState({
					start:treeYears,
					end:now,
				});
				break;
		}
	}
	clickSearch() {
		// widgendow.location = '/groupanalysis/analysis.html';
        if (_.isEmpty(this.state.inputValue)) {
			Notify.simpleNotify('错误', '请输入码址', 'error');
            return;
        }
        if(this.state.categoryValue == 0){
			Notify.simpleNotify('错误', '请选择类型', 'error');
			return;
		}
        var input = this.state.inputValue;
        var type = this.state.categoryValue;
		let start = this.state.start;
		let end = this.state.end;
		let display = this.state.display;
            $.getJSON('/relationanalysis/personcore/checkentityexist', {
                entityId: input,
                entityType: type
            }).done(function(rsp) {
                if (rsp.code != 0) {
					Notify.simpleNotify('错误', rsp.message ||'网络请求失败', 'error');
                    return;
                }
                if (rsp.data == 0) {
					Notify.simpleNotify('错误', rsp.message ||'没有符合条件的结果', 'error');
                } else if (rsp.data == 2) {
					Notify.simpleNotify('错误', rsp.message, 'error');
                } else if (rsp.data == 1) {
					window.location.href = "/relationanalysis/groupanalysis/analysis.html?entityid=" + input + "&entitytype=" + type + ((display === 'block' && start ) ? "&starttime="+start : '')+((display === 'block' && end ) ? "&endtime="+end : '' );
                }
            });
	}
	clickChange(){
		this.setState({
			selectKey:'custom',
			isSelected:true,
		});
	}
	changeStart(value) {
		let compareEnd = new Date(this.state.end.replace(/-/g,'/'));
		let compareStart = new Date(value.replace(/-/g,'/'));
		if (compareStart > compareEnd) {
			this.setState({
				start:this.state.end,
				blur:false
			});
		} else {
			this.setState({
				start:value,
				blur:true
			});
		}

	}
	changeEnd(value) {
		let compareStart = new Date(this.state.start.replace(/-/g,'/'));
		let compareEnd = new Date(value.replace(/-/g,'/'));
		if (compareEnd < compareStart) {
			this.setState({
				end:this.state.start,
				blur:false
			});
		} else {
			this.setState({
				end:value,
				blur:true
			});
		}
	}
	changeDisplay(){
		'block' === this.state.display ?
			this.setState({ display : 'none'}) :
			this.setState({ display : 'block'}) ;
	}
	timeChange(){
		this.setState({ display : 'none'})
	}

	render() {
		this.handleAutoMatch();
			return (
				<div style={{position:'relative' , height:'100%'}}>
					{/*<a style={{position:'absolute',right:'30',top:'-300px',cursor:'pointer' ,fontSize:'15px'}} onClick={this.changeDisplay.bind(this)}> 高级设置 </a>*/}
					<OptionSet optionChange={this.changeDisplay.bind(this)}/>
					<SearchBox value={this.state.inputValue}  selected={this.state.categoryValue} onChange={this.handleAutoMatch.bind(this)} handleSearch={this.clickSearch.bind(this)}/>
					<div>
						<TypeBar selected={this.state.categoryValue} onChange={this.handletypeSelect.bind(this) } />
						<div style={{marginTop:'10px' , display:this.state.display}}>
							<div className="timeDiv">
								<div className="col-md-12 ml15" >
									<div style={{width:'85px'}} onClick={this.timeChange.bind(this)}>
										<label style={{cursor:'pointer'}} >
											时间区间
											<span  style={{marginBottom:'3px'}} className={this.state.timeDisplay == 'block' ? 'caret' : 'carets'}></span>
										</label>
									</div>
								</div>
							</div>
							<div className="timeDetail">
								<div  className="ml15">
									{
										_.map(timeDetail, function(item,key){
											return(
												<div className={( this.state.isSelected == true && this.state.selectKey == key )? "col-md-1 btn btn-primary seleBtn" : "col-md-1 diyBtn btn  "} onClick={this.selected.bind(this,key)}>
													{item.text}
												</div>
											)
										},this)
									}
									<div className="col-md-3" style={{marginTop:'4px'}}>
										<div className="input-group" onClick={this.clickChange.bind(this)}>
											<SelfDateTimePicker  type='date' selectKey={this.state.selectKey} blur={this.state.blur} value={[this.state.start]} onChange={this.changeStart.bind(this)}  needMask={true}/>
											<span  className="input-group-addon">
											到
                    					</span>
											<SelfDateTimePicker  type='date' selectKey={this.state.selectKey} blur={this.state.blur} value={[this.state.end]} onChange={this.changeEnd.bind(this)}   needMask={true}/>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

				</div>
			)
	}
}

render(<SearchWrapper />, document.getElementById('content-container'));
hideLoader();
