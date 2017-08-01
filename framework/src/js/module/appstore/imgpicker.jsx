var React = require('react');
var ReactDOM = require('react-dom');
var _ = require('underscore');
var $ = require('jquery');
var AppService = require('module/appstore/appservice.js');
var Notify = require('nova-notify');

var imgArray = [];
var imgSelected = "";
var hasMore = true;

var ImgPicker = React.createClass({
	getInitialState: function() {
	    return {
	         selectedImg: this.props.img != ""? this.props.img: "/img/appstore/addImage.png",
	         currentPage: 1,
	         display: "none",
	         loaderDisplay: "table-row-group"
	    };
	},
	componentWillReceiveProps: function(nextProps) {
		if(nextProps.img){
			this.setState({
	      		selectedImg: nextProps.img
	      	})
		}
	},
	onLeftBtnClicked: function(e) {
		var info = {
			startIndex: this.state.currentPage - 1,
			pageSize: 16
		};
		imgArray = [];
		var that = this;
		this.setState({
			loaderDisplay: "table-row-group"
		});
		$.getJSON(
    		'/appstore/getAvailableAppImages', 
    		info, 
    		function(rsp) {
            	if (rsp.code == 0) {
                	imgArray = rsp.data;
                	that.setState({
                		loaderDisplay: "none",
						currentPage: that.state.currentPage - 1
					});
            	} else {
                	Notify.simpleNotify("图片加载失败", rsp.message, 'error');
            	}
          	}
        );
	},
	onRightBtnClicked: function(e) {
		var info = {
			startIndex: this.state.currentPage + 1,
			pageSize: 16
		};
		var lastImgPage = imgArray;
		imgArray = [];
		var that = this;
		this.setState({
			loaderDisplay: "table-row-group"
		});
		$.getJSON(
    		'/appstore/getAvailableAppImages', 
    		info, 
    		function(rsp) {
            	if (rsp.code == 0) {
            		if(rsp.data != null){
            			imgArray = rsp.data;
            			hasMore = true;
	                	that.setState({
	                		loaderDisplay: "none",
							currentPage: that.state.currentPage + 1
						});
            		} else {
            			imgArray = lastImgPage;
            			hasMore = false;
            			that.setState({
	                		loaderDisplay: "none"
						});
            		}
            	} else {
                	Notify.simpleNotify("图片加载失败", rsp.message, 'error');
            	}
          	}
        );
	},
	onImgClicked: function(e) {
		this.setState({
			selectedImg: e.target.value,
			display: "none"
		});
	},
	onSelectBtnClicked: function(e) {
		var info = {
			startIndex: this.state.currentPage,
			pageSize: 16
		};
		if(this.state.display == 'block'){
			this.setState({display: "none"});
		} else {
			imgArray = [];
			var that = this;
			this.setState({
				display: "block",
				loaderDisplay: "table-row-group"
			});
			$.getJSON(
	    		'/appstore/getAvailableAppImages', 
	    		info, 
	    		function(rsp) {
	    			console.log(rsp.data);
	            	if (rsp.code == 0) {
	                	imgArray = rsp.data;
	                	that.setState({
							loaderDisplay: "none",
						});
	            	} else {
	                	Notify.simpleNotify("图片加载失败", rsp.message, 'error');
	            	}
	          	}
	        );
		}
	},
	imgMouseOver: function(e) {
    	e.currentTarget.style.cursor = "pointer";
    },
    handleClose: function(e) {
		this.setState({display: 'none'});
    },
	render: function() {
		imgSelected = this.state.selectedImg;
		var imgSet = [];
		for(let i = 1; i <= 4; i++) {
			if(i * 4 < imgArray.length) {
				imgSet.push(imgArray.slice((i - 1) * 4, i * 4));
			} else if(imgArray.length != 0) {
				imgSet.push(imgArray.slice((i - 1) * 4, imgArray.length));
			}
		}
		if(this.state.currentPage == 1) {
			var leftBtn = (
				<button className="btn btn-arrow btn-previous btn-primary disabled" type="button" style={{minHeight: '30px',minWidth: '35px',padding: '0px', margin: '2px'}}>
					<span className="glyphicon glyphicon-arrow-left"/>
				</button>
			)
		} else {
			var leftBtn = (
				<button className="btn btn-arrow btn-previous btn-primary" onClick={this.onLeftBtnClicked} type="button" style={{minHeight: '30px',minWidth: '35px',padding: '0px', margin: '2px'}}>
					<span className="glyphicon glyphicon-arrow-left"/>
				</button>
			)
		}
		if(imgArray.length < 16 || !hasMore || this.state.loaderDisplay == "block") {
			var rightBtn = (
				<button className="btn btn-arrow btn-previous btn-primary disabled" onClick={this.onRightBtnClicked} type="button" style={{minHeight: '30px',minWidth: '35px',padding: '0px', margin: '2px'}}>
					<span className="glyphicon glyphicon-arrow-right"/>
				</button>
			)
		} else {
			var rightBtn = (
				<button className="btn btn-arrow btn-previous btn-primary" onClick={this.onRightBtnClicked} type="button" style={{minHeight: '30px',minWidth: '35px',padding: '0px', margin: '2px'}}>
					<span className="glyphicon glyphicon-arrow-right"/>
				</button>
			)
		}
		
		return (
			<div style={{position: 'absolute'}}>
				<div style={{width: '80px',height: '80px',borderStyle: 'dashed'}}>
                    <img style={{width: '74px',height: '74px'}} src={this.state.selectedImg} onClick={this.onSelectBtnClicked} onMouseOver={this.imgMouseOver}/>
                </div>

				<div className="popover bottom in" style={{maxWidth: '500px',position: 'relative',top: '0px',left: '-50%',marginLeft: '78px',display: this.state.display}}>
					<div style={{position: 'fixed',top: '0',right: '0',left: '0',bottom: '0',zIndex: '0'}} onClick={this.handleClose}/>
					<div className="arrow"></div>
					<div className="popover-content" style={{position: 'relative',zIndex: '1'}}>
						<table>
							<thead>
								<tr>
									<td className="text-center">
										{leftBtn}
									</td>
									<td className="text-center" colSpan="2">
										<span className="page-count">{this.state.currentPage}</span>
									</td>
									<td className="text-center">
										{rightBtn}
									</td>
								</tr>
							</thead>
							<tbody style={{display: this.state.loaderDisplay}}>
								<td colSpan="4" rowSpan="4">
									<i className="fa fa-spinner fa-pulse fa-4x" style={{margin: "20px 20px"}}></i>
								</td>
							</tbody>
							<tbody>
								{
									_.map(imgSet, _.bind(function (info) {
                                        return(
                                        	<tr>
                                                {
                                                    _.map(info, _.bind(function (img){
                                                        return(
                                                            <td>
																<button className="btn btn-default" type="button" value={img} style={{display: 'inlineBlock',padding: '6px 8px'}} onClick={this.onImgClicked}>
																	<img style={{width: '60px',height: '60px'}} src={img} value={img}/>
																</button>
															</td>
                                                        )
                                                    },this))
                                                }
                                            </tr>
                                        )  
                                  	},this))
								}
							</tbody>
						</table>
					</div>
				</div>
			</div>
			)
	}
});

module.exports.getSelectedImg = function() {
	return imgSelected;
};

module.exports.ImgPicker = ImgPicker;