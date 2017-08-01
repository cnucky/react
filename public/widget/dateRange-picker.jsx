var $ = require('jquery');
var _ = require('underscore');
var React = require('react');
var moment = require('moment');
moment.locale('zh-cn');
require("utility/daterange/daterangepicker");
require("utility/jquery/jqmaskedinput");
require("utility/bootstrap/bootstrap-maxlength");
var Notify = require('nova-notify');

var rangeOption = {
    showDropdowns: true,
    autoApply: true,
    timePicker: true,
    timePicker24Hour: true,
    timePickerSeconds:true,
    linkedCalendars: false,
    autoUpdateInput: false,
    showCustomRangeLabel: false,
    alwaysShowCalendars: true,
    opens:'left',
    ranges: {
        '今天': [moment(), moment()],
        '昨天': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        '过去一周': [moment().subtract(6, 'days'), moment()],
        '过去一个月': [moment().subtract(29, 'days'), moment()],
        '当月': [moment().startOf('month'), moment().endOf('month')],
        '上个月': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
    },
    locale: {
        applyLabel: '确定',
        cancelLabel: '取消',
        fromLabel: '从',
        toLabel: '到',
        customRangeLabel: '自定义'
    },
    format: 'YYYY-MM-DD'
};


var DateTimePicker = React.createClass({
    propTypes: {
        type: React.PropTypes.string,
        startDate: React.PropTypes.string,
        endDate: React.PropTypes.string,
        value: React.PropTypes.string,
        needDefault: React.PropTypes.bool,
        needMask: React.PropTypes.bool,
        hideCustom: React.PropTypes.bool,
        hideRange: React.PropTypes.bool,
        onChange: React.PropTypes.func
    },
    componentWillReceiveProps: function (nextProps) {
        if (!this.props || this.props.type === nextProps.type && this.props.value === nextProps.value) {
            return;
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
            <div className="input-group pull-right date">
                    <span ref="dateRange" style={{height: '40px'}} className="input-group-addon btn-system input-sm cursor">
                        <i className="fa fa-calendar"></i>
                    </span>
                    <input type="text" style={{height: '40px'}} className="form-control input-sm" 
                        ref="dateRangeInput" placeholder="时间段" onChange={this.onChange}></input>
                    {this.props.children}
            </div>
        )
    },
    setupDatePicker: function(props) {
        var dateFormat = props.type == 'datetime' ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD';
        var needDefault = _.isUndefined(props.needDefault) ? true : props.needDefault;
        var showCustomRangeLabel = _.isUndefined(props.hideCustom) ? !props.needMask : !props.hideCustom;

        var startDate = props.startDate ? moment(props.startDate, dateFormat) : (needDefault ? moment().startOf('month') : null);
        var endDate = props.endDate ? moment(props.endDate, dateFormat) : (needDefault ? moment().endOf('month') : null);
        if (props.value && typeof props.value === 'string') {
            var tmp = props.value.split('~');
            if (tmp.length == 2) {
                startDate = moment(tmp[0].trim(), dateFormat);
                endDate = moment(tmp[1].trim(), dateFormat);
            }
        }
        var opt = _.extend({}, rangeOption, {
            showCustomRangeLabel: showCustomRangeLabel,
            format: dateFormat,
            startDate: startDate || moment().startOf('month'),
            endDate: endDate || moment().startOf('month')
        });
        $(this.refs.dateRange).daterangepicker(
            opt,
            _.bind(function(start, end, input) {
                $(this.refs.dateRangeInput).val(start.format(dateFormat) + '~' + end.format(dateFormat));
                if (props.onChange) {
                    props.onChange($(this.refs.dateRangeInput).val());
                }
            }, this)
        );
        if (startDate && endDate) {
            $(this.refs.dateRangeInput).val(startDate.format(dateFormat) + '~' + endDate.format(dateFormat));
            if (props.onChange) {
                props.onChange($(this.refs.dateRangeInput).val());
            }
        }
        if (props.needMask) {
            $(this.refs.dateRangeInput).mask(props.type == 'datetime' ? '9999-99-99 99:99:99~9999-99-99 99:99:99' : '9999-99-99~9999-99-99', {
                completed: function() {
                    if (props.onChange) {
                        let startTime = $(this.refs.dateRangeInput).val().split('~')[0];
                        let endTime = $(this.refs.dateRangeInput).val().split('~')[1];
                        if (startTime <= endTime) {
                            props.onChange($(this.refs.dateRangeInput).val());
                        } else {
                            Notify.show({
                                type: 'warning',
                                title: '日期填写区间不规范'
                            });
                            $(this.refs.dateRangeInput).val(startDate.format(dateFormat) + '~' + endDate.format(dateFormat));
                            props.onChange($(this.refs.dateRangeInput).val());
                        }
                    }
                }.bind(this),disableSelectAll:true
            });
            $(this.refs.dateRangeInput).on('change', function(e) {
                if (props.onChange) {
                    let startTime = $(this.refs.dateRangeInput).val().split('~')[0];
                    let endTime = $(this.refs.dateRangeInput).val().split('~')[1];
                    if (startTime <= endTime) {
                        props.onChange($(this.refs.dateRangeInput).val());
                    } else {
                        $(this.refs.dateRangeInput).val(startDate.format(dateFormat) + '~' + endDate.format(dateFormat));
                        props.onChange($(this.refs.dateRangeInput).val());
                    }
                }
            }.bind(this));
        }
    }
})

module.exports = DateTimePicker;
