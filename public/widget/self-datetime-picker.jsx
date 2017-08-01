var $ = require('jquery');
var _ = require('underscore');
var React = require('react');
var moment = require('moment');
moment.locale('zh-cn');
require("utility/datepicker/bootstrap-datetimepicker");
require("utility/jquery/jqmaskedinput");

var SelfDateTimePicker = React.createClass({
    propTypes: {
        type: React.PropTypes.string,
        value: React.PropTypes.array,
        needDefault: React.PropTypes.bool,
        needMask: React.PropTypes.bool,
        onChange: React.PropTypes.func,
        disable: React.PropTypes.bool,
        timeType:React.PropTypes.string,
        minDate:React.PropTypes.string,
        maxDate:React.PropTypes.string,
        key:React.PropTypes.string
    },
    componentWillReceiveProps: function (nextProps) {
        if (this.props.value[0] != nextProps.value[0]) {
            this.updateDatePicker(nextProps);
        }
        if (this.props.blur == false) {
            this.updateDate(nextProps);
        }
        this.pop(nextProps);
    },
    componentDidMount: function() {
        this.initDatePicker(this.props);

    },
    onChange: function(e) {
        if (this.props.onChange) {
            this.props.onChange($(e.target).val());
        }
    },
    render: function() {
        return (
            <div className="input-group date" ref="datetimePicker">
                    <span style={{height: '40px',display:'none'}} className="datepickerbutton input-group-addon btn-system input-sm">
                        <i className="fa fa-calendar"></i>
                    </span>
                    <input type="text" style={{height: '40px'}} disabled={this.props.disable} className="form-control input-sm"
                        ref="datetimeInput" placeholder="时间点" onChange={this.onChange}></input>
                    {this.props.children}
            </div>
        )
    },
    initDatePicker: function(props) {
        var dateFormat = props.type == 'date' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss';
        var pickTime = props.type == 'date' ? false : true;
        var defaultDate = props.value? moment(props.value[0].trim()).format(dateFormat): '';

        var opt = {
            format: dateFormat,
            useCurrent: false
        };
        $(this.refs.datetimePicker)
        .datetimepicker(opt)
        .on('dp.change', function(e) {
            if (props.onChange && e.date) {
                props.onChange(e.date.format(dateFormat));
            }
        });
        if (props.value) {
            $(this.refs.datetimePicker).data("DateTimePicker").date(props.value[0]);
        }
        if (!props.value && props.onChange) {
            props.onChange(defaultDate);
            $(this.refs.datetimePicker).data("DateTimePicker").date(defaultDate);
        }
        if (props.needMask) {
            $(this.refs.datetimeInput).mask(props.type == 'datetime' ? '9999-99-99 99:99:99' : '9999-99-99', {
                completed: function() {
                    if (props.onChange) {
                        props.onChange($(this.refs.datetimeInput).val());
                    }
                }.bind(this)
            });
        }
    },
    pop:function (newProps) {
        var dateFormat = newProps.type == 'date' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss';
        var opt = {
            format: dateFormat,
            useCurrent: false
        };
        $(this.refs.datetimeInput).datetimepicker(opt);
        // $(this.refs.datetimePicker).data("DateTimePicker").date(newProps.value[0]);
    },
    updateDate:function (newProps) {
        $(this.refs.datetimePicker).data("DateTimePicker").date(newProps.value[0]);
    },
    updateDatePicker: function(newProps) {
        $(this.refs.datetimePicker).data("DateTimePicker").date(newProps.value[0]);
    }
})

module.exports = SelfDateTimePicker;