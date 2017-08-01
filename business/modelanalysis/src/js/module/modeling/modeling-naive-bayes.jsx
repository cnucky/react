var React = require('react');
var ReactDOM = require('react-dom');
var _ = require('underscore');
var MultiSelect = require('widget/multiselect');
require('select2');
var $ = require('jquery');
require('utility/select2/css/core.css');
var Provider = require('widget/i18n-provider');

var taskDetail;
/**
 state = {
	input: [
		{
			inputNode: 'xxx',
			outputColumnDescList: []
		}
	],
	inputIds:[],
	output: {
	    inputNode:'hoishg',
	    labelField:'',
	    positiveValue:1,
		outputColumnDescList: []
	}
}*/

var NBConditionComponent=React.createClass({
    contextTypes:{i18n:React.PropTypes.object},
        getInitalState: function () {
            return {
                selectedField: this.props.selectedField
            };
        },
        componentDidMount: function () {
            $(this.refs.labelFieldSelect).select2();
        },
        handleSelectField: function (item, option) {
            this.setState({
                selectedField: option.val()
            });
        },
        render: function () {
            var {i18n} = this.context;
            return (
                <div>
                    <div>
                        <label>{i18n.t('bayes.label-column')}</label>
                        <div>
                            <select ref="labelFieldSelect" className="select2-single form-control"
                                    style={{display:'none',width: '100%'}}
                                    value={this.props.selectedField}>
                                {
                                    _.map(this.props.inputFields, _.bind(function (field, index) {
                                        return (
                                            <option defaultValue={field.aliasName} key={index}>
                                                {field.displayName}
                                            </option>
                                        )
                                    }, this))
                                }
                            </select>
                        </div>
                    </div>
                    <br></br>
                    <div>
                        <label>{i18n.t('bayes.positive-sample-label-value')}</label>
                        <div>
                            <input className="form-control" type="number"
                                   style={{background:"#eeeeee",width: '100%'}}
                                   defaultValue={this.props.positiveValue}
                                ></input>
                        </div>
                    </div>
                </div>
            )
        }
    }
);

module.exports.render=function(container,data) {
    var inputFields = data.input[0].outputColumnDescList;
    if (data.output && data.output.collisionList) {
        taskDetail = data.output;
    } else {
        taskDetail = {
            inputNode: data.inputIds[0],
            labelField: '',
            positiveValue:1,
            outputColumnDescList: []
        }
    }
    ReactDOM.render(
        <Provider.default><NBConditionComponent inputFields={inputFields}
                              positiveValue={taskDetail.positiveValue}
                               selectedField={taskDetail.labelField}>
        </NBConditionComponent></Provider.default>, container)
};

module.exports.constructTaskDetail=function(){
    return {
        detail: taskDetail
    };
};