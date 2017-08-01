var $ = require('jquery');
var _ = require('underscore');
var React = require('react');
var moment = require('moment');
moment.locale('zh-cn');
require("utility/datepicker/bootstrap-datetimepicker");
require("utility/jquery/jqmaskedinput");

var SingleDateTimePicker = React.createClass({
    propTypes: {
        type: React.PropTypes.string,
        value: React.PropTypes.string,
        needDefault: React.PropTypes.bool,
        needMask: React.PropTypes.bool,
        onChange: React.PropTypes.func
    },
    componentWillReceiveProps: function (nextProps) {
        if (!this.props) {
            return;
        } else if (this.props.type === nextProps.type) {
            let oldDate = this.props.value && this.props.value[0];
            let newDate = nextProps.value && nextProps.value[0];
            if (oldDate && newDate && oldDate == newDate) {
                return;
            }
        }
        this.setupDatePicker(nextProps);
    },
    componentDidMount: function() {
        this.setupDatePicker(this.props);
    },
    onChange: function(e) {
        if (this.props.onChange) {
            this.props.onChange($(e.target).val());
        }
    },
    render: function() {
        return (
            <div className="input-group date" ref="datetimePicker">
                    <span style={{height: '40px'}} className="datepickerbutton input-group-addon btn-system input-sm">
                        <i className="fa fa-calendar"></i>
                    </span>
                    <input type="text" style={{height: '40px'}} className="form-control input-sm" 
                        ref="datetimeInput" placeholder="时间点" onChange={this.onChange}></input>
                    {this.props.children}
            </div>
        )
    },
    setupDatePicker: function(props) {
        let dateFormat = props.type == 'date' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss';
        this.defaultDate = props.value? moment(props.value[0].trim(), dateFormat).format(dateFormat): (props.needDefault? moment().format(dateFormat): '');

        let opt = {
            format: dateFormat,
            useCurrent: false,
            maxDate: '2999-12-31',
            minDate: '1900-1-1'
        };

        $(this.refs.datetimePicker).datetimepicker(opt).on('dp.change', function(e) {
            if (props.onChange && e.date) {
                let newDate = e.date.format(dateFormat);
                this.defaultDate = newDate;
                props.onChange(newDate);
            }
        }.bind(this));
        if (props.value) {
            $(this.refs.datetimeInput).val(props.value[0]);
            $(this.refs.datetimePicker).data("DateTimePicker").date(props.value[0]);
        } else {
            $(this.refs.datetimeInput).val(this.defaultDate.format(dateFormat));
            $(this.refs.datetimePicker).data("DateTimePicker").date(this.defaultDate);
        }
        if (props.onChange) {
            props.onChange(this.defaultDate);
        }
        if (props.needMask) {
            $(this.refs.datetimeInput).mask(props.type == 'datetime' ? '9999-99-99 99:99:99' : '9999-99-99', {
                completed: function () {
                    this.onDateChanged(props.onChange, dateFormat);
                }.bind(this), disableSelectAll: true
            });
            $(this.refs.datetimeInput).blur(function (e) {
                this.onDateChanged(props.onChange, dateFormat);
            }.bind(this));
        }
    },
    onDateChanged: function (callback, dateFormat) {
        if (!_.isFunction(callback)) {
            return;
        }

        let dateStr = $(this.refs.datetimeInput).val();
        let inputDate = moment(dateStr, dateFormat);
        if (inputDate.isValid()) {
            let currentDate = $(this.refs.datetimePicker).data("DateTimePicker").date();
            if (currentDate && (inputDate.format(dateFormat) == currentDate.format(dateFormat))) {
                return;
            }
            $(this.refs.datetimePicker).data("DateTimePicker").date(inputDate);
        } else {
            $(this.refs.datetimeInput).val(this.defaultDate.format(dateFormat));
            // callback($(this.refs.datetimeInput).val());
        }
    }
})

module.exports = SingleDateTimePicker;