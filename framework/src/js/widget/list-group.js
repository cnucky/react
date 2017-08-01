var React = require('react');
var ReactDOM = require('react-dom');
var _ = require('underscore');

var ListItem = React.createClass({
	render: function() {
		return <li className="list-group-item">{this.props.content}</li>;
	}
});

var ListGroup = React.createClass({
	render: function() {
		var list = _.map(this.props.items, function(item) {
			return (<ListItem content={item} />);
		}
		return (<ul className="list-group">{list}</ul>);
	}
});

module.exports = ListGroup;
// .build = function(parentid, items) {
// 	ReactDOM.render(<ListGroup items={items} />, document.getElementById(parentid));
// }