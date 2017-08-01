var $ = require('jquery');
var _ = require('underscore');
var React = require('react');

var DropDown = React.createClass({
	getInitialState: function() {
		return {
			searchInput: '',
			display: this.props.show? 'block': 'none'
		}
	},
	componentWillReceiveProps: function(nextProps) {
		this.setState({display: nextProps.show? 'block': 'none'});
	},
	handleSearchInput: function(e) {
		this.setState({searchInput: e.target.value});
	},
	handleClearClicked: function() {
		this.setState({searchInput: ''});
	},
	handleItemClicked: function(e) {
		if (this.props.onClick) {
			this.props.onClick(e.target.value);
		} else {
			console.log(e.target.value);
		}
	},
	handleClose: function() {
		this.props.onCloseClicked();
	},
	render: function() {
		var searchInput = this.state.searchInput;
		var resultData = _.map(this.props.data, _.bind(function(item, index) {
			if (item.title.indexOf(searchInput) >= 0) {
				return (
					<li style={{display: 'list-item'}} key={index + 2}>
						<a tabIndex="0">
							<label className="radio">
								<input type="radio" value={item.value} name="identity" onClick={this.handleItemClicked}/>
								{item.title}
							</label>
						</a>
					</li>
				)
			}
		},this))
		return (
			<div style={{display: this.state.display}}>
				<div style={{position: 'fixed',top: 0,right: 0,left: 0,bottom: 0,zIndex: 0}} onClick={this.handleClose}/>
				<ul className="multiselect-container dropdown-menu" style={{maxHeight: '300px', display: 'block', overflow: 'auto', zIndex: '100'}}>
					<li className="multiselect-item filter" value="0" key={1}>
						<div className="input-group">
							<span className="input-group-addon">
								<i className="glyphicon glyphicon-search"/>
							</span>
							<input className="form-control multiselect-search" type="text" placeholder="Search" value={this.state.searchInput} onChange={this.handleSearchInput}/>
							<span className="input-group-btn">
								<button className="btn btn-default multiselect-clear-filter" type="button" onClick={this.handleClearClicked}>
									<i className="glyphicon glyphicon-remove-circle"/>
								</button>
							</span>
						</div>
					</li>
					{resultData}
				</ul>
			</div>
		)
	}
})

module.exports = DropDown;