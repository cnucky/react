var React = require('react');
var ReactDOM = require('react-dom');
var _ = require('underscore');
var MultiSelect = require('widget/multiselect');
var Provider = require('widget/i18n-provider');

var taskDetail;

/*state = {
    input: [
        {
            inputNode: 'xxx',
            outputColumnDescList: []
        }
    ],
    inputIds: [],
    output: {
        inputNode: 'xxx1',
        outputColumnDescList: []
    }
}*/

var DereplicationComponent = React.createClass({
    contextTypes: {
        i18n: React.PropTypes.object
    },
    getInitialState: function () {
        return {
            selectedFields: this.props.outputColumnDescList
        }
    },
    handleSelectField: function (item, option, checked, select) {
        var value = option.val();
        if (_.findWhere(this.state.selectedFields, {columnName: value}) != undefined) {
            this.state.selectedFields.splice(_.findIndex(this.state.selectedFields, {columnName: value}), 1)
        } else {
            var selectField = {};
            var inputField = _.findWhere(this.props.inputFields, {aliasName: value});
            $.extend(selectField, inputField);
            selectField.columnName = inputField.aliasName;
            selectField.aliasName = "";
            this.state.selectedFields.push(selectField);
        }
        this.setState({
            selectedFields: this.state.selectedFields
        });
        taskDetail.outputColumnDescList = this.state.selectedFields
    },
    render: function () {
        var {i18n} = this.context;
        return (
            <div className='form-horizontal'>
                <div className='form-group'>
                    <label className='col-md-3 control-label'
                        style={{fontSize: '15px'}}>{i18n.t("dereplication.dereplication-field")}</label>

                    <div className='col-md-9'>
                        <MultiSelect 
                            multiple='multiple'
                            updateData={true}
                            includeSelectAllOption={true}
                            data={
                                _.map(this.props.inputFields,_.bind(function(item) {
                                    return{
                                        label:item.displayName,
                                        type:item.columnType,
                                        value:item.aliasName,
                                        selected:_.findWhere(this.state.selectedFields, {columnName:item.aliasName}) != undefined
                                    }
                                },this))}
                            config={{
                                maxHeight: 250,
                                disableIfEmpty: true,
                                enableFiltering: true,
                                enableClickableOptGroups: false,
                                includeSelectAllOption: true,
                                selectAllText: i18n.t("all-selected"),
                                nonSelectedText: i18n.t("none-selected-text"),
                                nSelectedText: i18n.t("n-selected-text"),
                                allSelectedText: i18n.t("all-selected")
                            }}>
                        </MultiSelect>
                    </div>
                </div>
            </div>
        )
    }
});

module.exports.render = function (container,data)  {
    if (data.output && data.output.outputColumnDescList) {
        taskDetail = data.output;
    }else{
        var outputField = {};
        $.extend(outputField,data.input[0].outputColumnDescList[0]);
        outputField.columnName = data.input[0].outputColumnDescList[0].aliasName;
        outputField.aliasName = "";
        taskDetail = {
            inputNode : data.input[0].nodeId,
            outputColumnDescList : new Array(outputField)
        }
    }
    ReactDOM.render (<Provider.default><DereplicationComponent inputFields={data.input[0].outputColumnDescList}
                                             outputColumnDescList={taskDetail.outputColumnDescList}/></Provider.default>,container);
};

module.exports.constructTaskDetail = function () {
    return {
        detail: taskDetail
    }
};
