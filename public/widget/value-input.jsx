import React from 'react';

const MAGIC_WORD = ';'

export default class ValueInput extends React.Component {
	constructor() {
		super();
	}

	render() {
		let {onBlur, onChange, splitWord, value, title, multiple, ...others} = this.props;
		splitWord = splitWord || ',';
		return (<input {...others}  
			value={!_.isArray(value) ? value : 
				_.find(value, valueItem => valueItem.indexOf(splitWord) != -1) ? value.join(MAGIC_WORD) : value.join(splitWord)} 
			title={title || (_.isArray(value) ? value.join('\n') : (value && multiple && value.replace(splitWord, '\n')))}
			onChange={(e) => {
				let value = e.target.value;
				if(_.isEmpty(value)) {
					value = [];
				} else if(!multiple) {
					value = [value];
				} else if(value.indexOf(MAGIC_WORD) != -1) {
					value = value.split(MAGIC_WORD);
				} else {
					value = value.split(splitWord);
				}
				if(onChange) {
					onChange(value, e);
				}
			}} 
			onPaste={(e) => {
				let data = e.clipboardData.getData('text/plain');
				data = data.replace(/，/g, ',');
				let arr = data.split('\n');
				if(arr.length > 1) {
					data = arr.join(splitWord);
					e.preventDefault();
					e.target.value = data;
					if(onChange) {
						onChange(arr, e);
					}
					return false;
				}
			}}
			onBlur={(e) => {
				let value = e.target.value;
				if(_.isEmpty(value)) {
					value = [];
				} else if(!multiple) {
					value = [value];
				} else if(value.indexOf(MAGIC_WORD) != -1) {
					value = value.split(MAGIC_WORD);
				} else {
					value = value.split(splitWord);
				}
				if(onBlur) {
					onBlur(value, e);
				}
			}} />)
	}
}

ValueInput.propTypes = {
	onChange: React.PropTypes.func,
	onBlur: React.PropTypes.func
}