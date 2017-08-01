import {Component, PropTypes, Children} from 'react';

export default class Provider extends Component {
	getChildContext() {
		return {i18n: window.i18n}
	}

	constructor(props, context) {
		super(props, context);
		window.i18n.on('languageChanged', () => this.forceUpdate());
	}

	render() {
		return Children.only(this.props.children);
	}
}

Provider.childContextTypes = {
	i18n: PropTypes.object
}