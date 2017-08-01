import React from 'react';
import {render} from 'react-dom';
var Alert  = require('nova-alert');
const Notify = require('nova-notify');
import DateTimePicker from 'widget/datetime-picker';
import SelfDateTimePicker from 'widget/self-datetime-picker';
var moment = require('moment');
var MultiSelect = require('widget/multiselect');
import {TagManager} from '../../module/group-analysis/multi-tag-manager';
require('../../module/group-analysis/searchinfo.less');

//pattern
var certPattern = /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{4}$/;
var mobilePattern = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
var mailPattern = /^([\w\!\#$\%\&\'\*\+\-\/\=\?\^\`{\|\}\~]+\.)*[\w\!\#$\%\&\'\*\+\-\/\=\?\^\`{\|\}\~]+@((((([a-z0-9]{1}[a-z0-9\-]{0,62}[a-z0-9]{1})|[a-z])\.)+[a-z]{2,6})|(\d{1,3}\.){3}\d{1,3}(\:\d{1,5})?)$/i;
var ipPattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
var nameAndBirthdayPattern = /^.+\+(\d{6}|\d{8})$/;
var inputPattern = /^([A-Za-z0-9,@])+$/;



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

var timeDetail = {
	'oneMonth':{text:'近一月'},
	'treeMonths':{text:'近三月'},
	'halfYear':{text:'近半年'},
	'year':{text:'近一年'},
	'treeYears':{text:'近三年'},
	'custom':{text:'自定义'}
}

var date=new Date();
var now =moment().format('L');
var oneMonth = moment().subtract(1,'month').format('L');
var treeMonths = moment().subtract(3,'month').format('L');
var halfYear = moment().subtract(6,'month').format('L');
var year =  moment().subtract(1,'year').format('L');
var treeYears =  moment().subtract(3,'year').format('L');

var addressItemList = {};
var addressId = 1;
var chooseCategory = -1;
var currentTagId = -1;
var isInputEdited = false;
var isTypeChanged = false;


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
	constructor(props) {
		super(props);
	}
	changeDisplay(){
		this.props.clickChange();
	}
	handleInput(e) {
		var category = getCategory();
		if(category&&category!=-1)
		{
			this.props.editChange(true);
		}
		this.props.onChange(e.target.value);
	}
	componentDidMount(){
		var that = this;
		$('.dropdown-menu a').on('click', function() {
			var value  = parseInt($(this).attr('data-type'));
    		var category = getCategory();
			if(category&&category!=-1)
			{
				that.props.typeChange(true);
			}
    		that.props.categoryChange(value);
		});
	}

	render() {	
			var configType = {
		        disableIfEmpty: false,
		        enableFiltering: false,
		        buttonClass: 'multiselect dropdown-toggle btn btn-info fw600 fs14'
    		}
			var category = this.props.selected;
			var icon;
			if(category<=0){
			    // icon=(<div id="search-icon" className="fa fa-search" style={{color: '#3498db'}}></div>)
			    icon = (<div style={{display:'inline-block'}}>请选择</div>);
			}else{
			    // icon = (<i id="search-icon" className={typeDetail[category].class} style={{color: typeDetail[category].color,width:'20px'}}></i>)
			    icon = (<div style={{display:'inline-block'}}><div id="search-icon" className="category-icon-search" style={{background: typeDetail[category].color}}><span className={typeDetail[category].class}></span></div>
			    	<div className="category-text fs5" ><p>{typeDetail[category].text}</p></div></div>)
			}
			return (
				<div className="admin-form mw1200" id="search" style={{marginLeft:'21%'}} >
					<div className="row"> 
				        <div className="col-xs-6 col-md-9">
				            <div>
					            <div className="smart-widget sm-right ">
					                <label className="field prepend-picker-icon" style={{paddingLeft:'130px'}} id="inputField">
					                    <input type="text" name="keyword" id="keyword" className="gui-input" placeholder="请输入码址" onInput={this.handleInput.bind(this)} value={this.props.inputValue}/>					                   				
						                    <button forHtml="keyword" className="field-icon dropdown-toggle" onClick={this.changeDisplay.bind(this)} style={{width:'130px'}} data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" >					                    
						                    	{icon}						                    	
						                    	<span className={this.props.typeDisplay == 'block' ? 'caret' : 'carets'} style={{marginLeft:'5px',marginTop:'-3px'}}> </span>				                   
											</button>	
											<ul className="dropdown-menu" style={{minWidth:'130px'}}>
											        {
											        	_.map(typeDetail, function(item,id){
											        		return(
											        			<li key={id} >
											        				<a data-type={id}>
															            <div className="category-icon" style={{background: item.color}} ><span className={item.class}></span></div>
															            <div className="category-text" >
															                <p>{item.text}</p>
															            </div>
														            </a>
														        </li>
											        			)
											        	},this)
											        }			    
									    	</ul>					
								
					                </label>
					            </div>
					        </div>
				     	</div>
				     	<div className="col-xs-3 col-md-1">
			                <div>
					       		<button id="add-button" className="btn btn-primary btn-block" onClick={this.props.handleSearch} title={(this.props.editState == 'add') ? '添加' : '修改'}>
					       			<i id="plus-icon" className={(this.props.editState == 'add') ? 'fa fa-plus' : 'fa fa-edit'}></i>
					       		</button>
					        </div>
		             	</div>  
		               	<div className="col-xs-3 col-md-1">
			                <div>
			                   	<button id="complete-button"  className={"btn btn-system light btn-block " + ( _.isEmpty(addressItemList) ? "disabled" : "")} onClick={this.props.handleComplete} title="完成">
			                   		<i className="fa fa-search"></i>
			                   	</button>			                 
			                </div>			                
		              	</div> 

			        </div> 
		    	</div>	  	
			)	
	}
}

class ItemTypeList extends React.Component {
	constructor(props) {
		super(props);
	}
	handleClick(){
		var category = getCategory();
		if(category&&category!=-1)
		{
			this.props.onChange(category);
		}
		isTypeChanged=false;
    	isInputEdited=false;
	}
	render() {
		return(
				<div className={"tag-panel " + ( _.isEmpty(addressItemList) ? "hidden" : "")} id="address-list">
	            	<div style={{marginTop:'10px'}}  className="mw1000">
	             	 	<div className="col-md-12 mb10">
		            		<label className="">已添加码址</label>
		 	        	</div>
		 	        	<TagManager typeDetail={typeDetail} addressItemList={addressItemList} editEvent={this.props.tagEditEvent.bind(this)} 
		 	        	removeEvent={this.props.tagRemoveEvent.bind(this)}/>
		 	        </div>
		 	    </div>
			)
	}
}

class FilterSet extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			start:'',
			end:'',
        	selectKey:'',
			blur:true,
        	isSelected:true,
        	categoryStabled: false,
        	categoryValue: 0,
        	timeDisplay:'block',
        	typeDisplay:'block',
			selectedTypes : []
        };
        this.metadataMaps = [];
		this.relationTypeLength = 0;
		this.selectedTypes = [];
	}

	componentWillMount() {
		 $.getJSON('/relationanalysis/personrelationexplore/getRelationMetaData', rsp=>{
            if (rsp.code == 0) {
                this.metadataMaps = {entityMeta: {}, relationMeta: {}};
                _.each(rsp.data.entityMeta, item=> {
                    this.metadataMaps.entityMeta[item.entityType] = item.entityName;
                });
                _.each(rsp.data.relationMeta, item=> {
                    this.metadataMaps.relationMeta[item.relationType] = item.relationName;
					this.selectedTypes.push(item.relationType);
                });
				this.relationTypeLength = rsp.data.relationMeta.length;
				this.props.filterTypeListChanged(this.selectedTypes);
				this.setState({selectedTypes: this.selectedTypes});
            } else {
                Notify.simpleNotify('错误', rsp.message, 'error');
                hideLoader();
            }
        });
	}
	changeContactLevel(){
		this.props.changeContactLevel();
	}
	changeTimeDisplay(){
		'block' === this.state.timeDisplay ?
			this.setState({ timeDisplay : 'none'}) :
			this.setState({ timeDisplay : 'block'}) ;
	}
	changeTypeDisplay(){
		'block' === this.state.typeDisplay ?
			this.setState({ typeDisplay : 'none'}) :
			this.setState({ typeDisplay : 'block'}) ;
	}
	clickChange(){
		this.setState({
			selectKey:'custom',
			isSelected:true,
		});
	}
	allSelect(){

		this.props.filterTypeListChanged(this.selectedTypes);
		this.setState({selectedTypes:this.selectedTypes});

	}

	selectEntity(value, e){
		var newSelected = [], isSelected;

		value = parseInt(value);

		_.each(this.state.selectedTypes, item=> {
			if (item != value) {
			newSelected.push(item);
		} else {
			isSelected = true;
		}
		});
		if (!isSelected ) {
			newSelected.push(value);
		}
		this.props.filterTypeListChanged(newSelected);
		this.setState({selectedTypes: newSelected});
	}


	reverseSelect(){
		var newSelected = [];
        var selectedTypes = this.state.selectedTypes;
        newSelected = _.difference(this.selectedTypes,selectedTypes);
        this.props.filterTypeListChanged(newSelected);
        this.setState({selectedTypes: newSelected});
	}

	changeStart(value) {
		let compareEnd = new Date(this.state.end.replace(/-/g,'/'));
		let compareStart = new Date(value.replace(/-/g,'/'));
		if (compareStart > compareEnd) {
			this.setState({
				start:this.state.end,
				blur:false
			});
			this.props.changeStart(this.state.end);
		} else {
			this.setState({
				start:value,
				blur:true
			});
			this.props.changeEnd(value);
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
			this.props.changeStart(this.state.start);
		} else {
			this.setState({
				end:value,
				blur:true
			});
			this.props.changeEnd(value);
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
				this.props.changeStart('');
				this.props.changeEnd('');
				break;
			case 'oneMonth':
				this.setState({
					start:oneMonth,
					end:now,
				});
				this.props.changeStart(oneMonth);
				this.props.changeEnd(now);
				break;
			case 'treeMonths':
				this.setState({
					start:treeMonths,
					end:now,
				});
				this.props.changeStart(treeMonths);
				this.props.changeEnd(now);
				break;
			case 'halfYear':
				this.setState({
					start:halfYear,
					end:now,
				});
				this.props.changeStart(halfYear);
				this.props.changeEnd(now);
				break;
			case 'year':
				this.setState({
					start:year,
					end:now,
				});
				this.props.changeStart(year);
				this.props.changeEnd(now);
				break;
			case 'treeYears':
				this.setState({
					start:treeYears,
					end:now,
				});
				this.props.changeStart(treeYears);
				this.props.changeEnd(now);
				break;
		}
	}
	render(){
		return (
			<div className = "right-container" id="set-option">
			   <div id="setDiv">

					<div className="mt5 ml5 row mw1200">
						<div className="col-md-8 col-xs-6">
						<label style={{cursor:'pointer', marginLeft:'13px',float:'left'}}  onClick={this.props.onClose.bind(this)}>
							过滤设置
							<span className='carets' style={{marginLeft:'5px',marginTop:'-3px'}}> </span>
						</label>
						</div>
						<div className="admin-form col-md-4 col-xs-4" >
							<div className ="type">
	                        	<label className="option option-primary fw600">
	                          		<input type="checkbox" name="contactLevel" value="train" onClick={this.changeContactLevel.bind(this)}/>
	                          		<span className="checkbox"></span>
	                          		是否扩展联系人
	                          	</label>
	                    	</div>
                    	</div>
					</div>

				</div>
				<div id="chooseDiv">
					<div id="relationDiv" className="section ml5 mw1200">
						<div className=" ml5 row">
							<div className="col-md-8 col-xs-6">
							<button type="button" className="mt5 btn btn-xs btn-rounded btn-primary" onClick={this.changeTypeDisplay.bind(this)}>关系类型</button>
							</div>
							<div className="col-md-4 col-xs-4" style={{display: 'inline-block',marginTop:'5px'}}>
								<div className="ml20 text-center" style={{display: 'inline-block'}} >
									<button type="button" className={  this.state.selectedTypes.length === this.relationTypeLength ? 'btn btn-xs btn-primary' : "btn btn-xs btn-default "} onClick={this.allSelect.bind(this)}>
										全选
									</button>
								</div>
								<div className="ml20 text-center" style={{display: 'inline-block'}} >
									<button type="button" className='btn btn-xs btn-default' onClick={this.reverseSelect.bind(this)}>
									反选
									</button>
								</div>
							</div>
						</div>
						<div className="pl20 prn admin-form theme-primary mw1000" style={{display:this.state.typeDisplay}}>
							<div className="section mv5">
		                        <div className="option-group field">
		                            <div className="row ml10 mb10 mt10">
		                            	{
		                            		_.map(this.metadataMaps.relationMeta,function(item,id)
		                            		{	
		                            			var isSelect = _.contains(this.state.selectedTypes,parseInt(id)) ? true : false;
		                            			return(
		                            				<div className ="type" >
						                            	<label className="option option-primary">
						                              		<input type="checkbox" name="relationType" value={id} onClick={this.selectEntity.bind(this, id)} checked={isSelect}/>
						                              		<span className="checkbox"></span>
						                              		{item}
						                              	</label>
			                            			</div>
		                            			)
		                            		},this)
		                            	}
		                            </div>
		                        </div>                         
		                    </div>
	                    </div>
					</div>
					<div id="timeDiv" className="section ml5 mw1000">
						<div className="mv5 ml5 row">
							<div className="col-md-7 col-xs-4">
							<button type="button" className="mt10 btn btn-xs btn-rounded btn-primary" onClick={this.changeTimeDisplay.bind(this)}>时间区间</button>
							</div>
							</div>
						<div className="timeDetail">
							<div style={{display:this.state.timeDisplay}} className="ml15">
								{
									_.map(timeDetail, function(item,id){
										return(
											<div key={id} className={( this.state.isSelected == true && this.state.selectKey == id )? "col-md-1  btn btn-primary seleBtn" : " col-md-1 diyBtn btn  "} onClick={this.selected.bind(this,id)}>
												{item.text}
											</div>
										)
									},this)
								}
								<div className="col-md-3 " style={{marginTop:'4px'}}>
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

class MultiTargetWrapper extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
        	inputValue:'',
        	categoryValue: 0,
        	categoryStabled: false,
        	typeDisplay:'none',
        	optionSetDisplay:'none',
      		isFresh : true ,
      		editState : 'add',
      		start :'',
      		end :'',
      		contactLevel:false,
      		filterTypeList:[]
        };
	}
	changeContactLevel(){
		this.setState({contactLevel:!this.state.contactLevel});
	}
	changeStart(start){
		this.setState({start:start});
	}
	changeEnd(end){
		this.setState({end:end});
	}
	clickSearch(){
		if (_.isEmpty(this.state.inputValue)) {
			Notify.simpleNotify('错误', '请输入码址', 'error');
            return;
        }
        var input = this.state.inputValue;
        if(this.state.categoryValue == 0){
			Notify.simpleNotify('错误', '请选择类型', 'error');
			return;
		}
		var condition = this.state.editState;
		
		if("add" == condition)
		{
			let new_id = addressId++;//新语义的随机id，因为tagmanager的id只支持纯数字
	        var isContain = false;
	        var category = this.state.categoryValue;
	        //自定义标签区域的初始化在renderMixed方法中
	        _.each(addressItemList, function(item, key) {
	            if (item && item.value == input && item.type == category) {
	                isContain = true;
	            }
	        });
	        if(!isContain){ //只有新语义会被添加	        
				 let address = new Object();
				 address.value = input;
				 address.type = this.state.categoryValue;
				 address.id = new_id;
				 addressItemList[new_id] = address;
			}
	        else
	        {
	        	Notify.simpleNotify('错误', '该码址已存在', 'error');
	        }
   		}
   		else if("edit" == condition)	
   		{
   			let cur_id = currentTagId;
   			addressItemList[cur_id].value = input;
   			addressItemList[cur_id].type = this.state.categoryValue;
    		isTypeChanged=false;
    		isInputEdited=false;
	    	this.setState({
	    		editState : 'add'
	    	});

   		}
        this.setState({
        	inputValue : '',
        	categoryValue: 0,
			categoryStabled:false
            });       
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
		this.typeShowChange();
	}

	typeShowChange(){
		'block' == this.state.typeDisplay ?
			this.setState({ typeDisplay : 'none'}) :
			this.setState({ typeDisplay : 'block'}) ;
	}

	optionShowChange(){
		'block' == this.state.optionSetDisplay ?
			this.setState({ optionSetDisplay : 'none'}) :
			this.setState({ optionSetDisplay : 'block'}) ;
	}

	categoryChange(value){
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
        if(inputValue!=null)
        {
			this.setState({
				inputValue: inputValue
			});
		}
    }
	clickComplete(){
		let nodes = [];
		_.each(addressItemList,function(address,key){
			let node = new Object();
			node.nodeType = address.type;
			node.nodeId = address.value;
			nodes.push(node);
		})
		if (nodes.length < 2) {
			Notify.simpleNotify('错误', '请至少输入两个搜索码址', 'error');
			return;
		}
		let start = this.state.start;
		let end = this.state.end;
		let contactLevel = this.state.contactLevel ? 1 : 0;

    	localStorage.setItem("entityList", JSON.stringify(nodes));	
    	localStorage.setItem("startTime",start);
    	localStorage.setItem("endTime",end);
    	localStorage.setItem("contactLevel",contactLevel);
    	localStorage.setItem("filterTypeList",JSON.stringify(this.state.filterTypeList));
    	window.location.href = "/relationanalysis/multitarget/analysis.html";
	}

	filterTypeListChanged(selectedTypes){
		this.setState({filterTypeList:selectedTypes});
	}
	
	setInputChanged(isInputChange){
		isInputEdited = isInputChange;
		if(isInputChange)
		{
			this.setState({
				editState : 'add'
			})
		}
	}
	setTypeChanged(isTypeChange){
		isTypeChanged = isTypeChange;
		if(!isInputEdited && isTypeChange)
		{
			this.setState({
				editState : 'edit'
			})
		}
	}

    tagRemoveEvent(tagId){
		_.each(addressItemList, function(item, key) {
	            if (item && key == tagId) { //删除属性
	                delete addressItemList[key];
	            }
	        });
		this.setState({
				inputValue : '',
	    		editState : 'add'
	    	});
   		
        this.setState({categoryValue: 0,
        	categoryStabled:false,
        	editState : 'add',
        	isFresh : !this.state.isFresh
            });  
		
	}

	tagEditEvent(tagId){
		isTypeChanged=false;
    	isInputEdited=false;
		currentTagId = tagId;
		chooseCategory = -1;
		let address = addressItemList[tagId];
		let type = address.type;
		let value = address.value;
		
		this.setState({
			inputValue : value,
			categoryValue : type,
			categoryStabled  : true
		});
		setCategory(type);
	}
	render(){
		this.handleAutoMatch();
		var configType = {
        disableIfEmpty: false,
        enableFiltering: false,
        buttonClass: 'multiselect dropdown-toggle btn btn-info fw600 fs14'
    	}
		return(			
				<div>
					<OptionSet optionChange={this.optionShowChange.bind(this)}/>
					<SearchBox value={this.state.inputValue} selected={this.state.categoryValue} clickChange={this.typeShowChange.bind(this)} typeDisplay={this.state.typeDisplay}
					onChange={this.handleAutoMatch.bind(this)} handleSearch={this.clickSearch.bind(this)} handleComplete={this.clickComplete.bind(this)} 
					editChange={this.setInputChanged.bind(this)} editState={this.state.editState} inputValue={this.state.inputValue} selected={this.state.categoryValue} 
					categoryChange={this.handletypeSelect.bind(this)} typeChange={this.setTypeChanged.bind(this)}/>

					<ItemTypeList onChange={this.categoryChange.bind(this)} tagRemoveEvent={this.tagRemoveEvent.bind(this)} tagEditEvent={this.tagEditEvent.bind(this)}/>	
					<div style={{display:this.state.optionSetDisplay}}>		
						<FilterSet onClose={this.optionShowChange.bind(this)} changeEnd={this.changeEnd.bind(this)}  changeStart={this.changeStart.bind(this)} changeContactLevel={this.changeContactLevel.bind(this)} 
						filterTypeListChanged={this.filterTypeListChanged.bind(this)}/>
					</div>									           
				</div>						
			)
	}
}

render(<MultiTargetWrapper />, document.getElementById('content-container1'));
function setCategory(value){
	chooseCategory = value;
}

function getCategory(){
	return chooseCategory;
}
hideLoader();
