var React = require('react');
var ReactDOM = require('react-dom');
var $ = require('jquery');
var Dialog = require('nova-dialog');
var _ = require('underscore');

var selectedFields = [];
var FieldMapping = React.createClass({
    getInitialState: function() {
        if(_.isEmpty(this.props.selectedFields)) {
            _.each(this.props.fields1, _.bind(function(field) {
                var info = [];
                info.push(field.fieldName);
                info.push(this.props.fields2);
                selectedFields.push(info);
            }, this));
            this.props.selectedFields = selectedFields;
        } else {
            selectedFields = this.props.selectedFields;
        }
        return {
            info:  selectedFields
        };
    },
    handleSelectField: function(identity, option, checked, select) {
        selectedFields[identity.index][identity.leftOrRight] = option.val();
        this.props.selectedFields[identity.index][identity.leftOrRight] = option.val();
    },
    render: function() {
        var handleSelectField = this.handleSelectField;
        var name = this.props.name;
        var fields1 = this.props.fields1;
        var fields2 = this.props.fields2;
        return (
            <table className='table'>
                <thead>
                    <tr>
                        <th style={{textAlign: 'center'}} className="text-nowrap"><a id="datasourse1" className="p5">{name[0]}</a></th>
                        <th> </th>
                        <th style={{textAlign: 'center'}} className="text-nowrap"><a id="datasourse2" className="p5">{name[1]}</a></th>
                        <th> </th>
                    </tr>
                </thead>
                <tbody>
                    {
                        _.map(this.state.info, function(info, index) {
                            return (
                                <tr key={index}>
                                    <td>
                                        <MultiSelect identity={{index: index, leftOrRight: 0}} updateData={true} onChange={handleSelectField} data={
                                                    _.map(fields1, function(item) {
                                                        return {
                                                            label: item.caption,
                                                            title: item.caption,
                                                            value: item.fieldName,
                                                            selected: info[0] === item.fieldName
                                                        }
                                                    })
                                        }/>
                                    </td>
                                    <td><span className='fa fa-arrows-h fs18 fw600'></span></td>
                                    <td>
                                        <MultiSelect identity={{index: index, leftOrRight: 1}} updateData={true} onChange={handleSelectField} data={
                                                    _.map(fields2, function(item) {
                                                        return {
                                                            label: item.caption,
                                                            title: item.caption,
                                                            value: item.fieldName,
                                                            selected: info[1] === item.fieldName
                                                        }
                                                    })
                                        }/>
                                    </td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            </table>
        )
    }
})

module.exports.showMappingDialog = function(selectedFields) {
	Dialog.build({
		title: '编辑表达式',
		content: '<div id="field-mapping-content"></div>',
		style: 'lg'
	}).show(function(){
                            var name = ['caption1','caption2'];
		var fields1 = [
				{"caption":"用户号码","fieldName":"USER_MSISDN"},
				{"caption":"用户手机卡号","fieldName":"USER_IMSI"},
				{"caption":"用户手机机身号","fieldName":"USER_IMEI"},
				{"caption":"对端号码","fieldName":"OPPO_MSISDN"},
				{"caption":"事件发生日期时间","fieldName":"EVENT_BEGIN_DATE"},
				{"caption":"通话时长(秒)","fieldName":"CALL_DURATION"}
			]
                            var fields2 = [
                                                        {"caption":"用户号码","fieldName":"USER_MSISDN"},
                                                        {"caption":"用户手机卡号","fieldName":"USER_IMSI"},
                                                        {"caption":"用户手机机身号","fieldName":"USER_IMEI"},
                                                        {"caption":"事件发生日期时间","fieldName":"EVENT_BEGIN_DATE"},
                                                        {"caption":"通话时长(秒)","fieldName":"CALL_DURATION"}
                                                    ]
		ReactDOM.render(<FieldMapping name={name} fields1={fields1} fields2={fields2} selectedFields={selectedFields}/>, $('#field-mapping-content')[0]);
	})
}