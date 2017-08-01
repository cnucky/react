var $ = require('jquery');
var React = require('react');
var moment = require('moment');
var datetimepicker = require('./tpl-sq-datetimepicker');

var DateTimer = React.createClass({
    componentDidMount: function() {
        var dateinput = document.getElementById('date-range-input');
        dateinput.id = this.props.data.field.fieldName;

        var daterange = document.getElementById('date-range');
        daterange.id = this.props.data.field.fieldName + "_picker";

        datetimepicker.initDate(dateinput.id);

        if(this.props.data.field.fieldType == 'date') {
            if (!_.isEmpty(this.props.data.children)) {
                var dateFormat = 'YYYY/MM/DD';
                var startdate = moment(this.props.data.children[0], dateFormat);
                var enddate = moment(this.props.data.children[1], dateFormat)
                datetimepicker.initDate(dateinput.id, startdate, enddate);
                $('#' + dateinput.id).val(startdate.format(dateFormat) + ' - ' + enddate.format(dateFormat));
            }
        } else {
            if (!_.isEmpty(this.props.data.children)) {
                var datetimeFormat = 'YYYY/MM/DD HH:mm:ss';
                var startdatetime = moment(this.props.data.children[0], dateFormat);
                var enddatetime = moment(this.props.data.children[1], dateFormat)
                datetimepicker.initDate(dateinput.id, startdatetime, enddatetime);
                $('#' + dateinput.id).val(startdatetime.format(datetimeFormat) + ' - ' + enddatetime.format(datetimeFormat));
            }
        }
    },
    render: function() {
        return (
            <div className="input-group pull-right date" id="date-range">
                    <span style={{height: '40px'}} className="input-group-addon btn-system input-sm cursor">
                        <i className="fa fa-calendar"></i>
                    </span>
                    <input type="text" style={{height: '40px'}} className="form-control input-sm" id="date-range-input" placeholder="时间段"></input>
            </div>
        )
    }
});

module.exports = DateTimer;
