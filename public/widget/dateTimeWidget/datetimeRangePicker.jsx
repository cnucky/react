var $ = require('jquery');
var _ = require('underscore');
var React = require('react');
var moment = require('moment');
var datatimePicker = require('./datatimePicker.js');
moment.locale('zh-cn');
require("./datatimePicker");
var Notify = require('nova-notify');

var DateTimeRangePicker = React.createClass({
    propTypes: {
        
    },

    componentDidMount: function() {
        this.builtComponent(this.props);
    },

    componentWillReceiveProps: function(nextProps) {
        if(this.needRender(this.props,nextProps))
            this.builtComponent(nextProps);
    },

    builtComponent:function(props){
        var cfg={
            container:$(this.refs.dateRangeInput),
            formatString:props.formatString,
            containerId:props.containerId ||null,
            height:props.inputHeight ||"38px",
        }

        switch(props.type){
            case 'single':
                cfg.type = "single";
                props.value? cfg.value = props.value[0]:cfg.value = moment().format(props.formatString.length >10?"YYYY-MM-DD HH:mm:ss":"YYYY-MM-DD");
                cfg.needDel = props.needDel;
                cfg.callback = _.bind(this.getDate);
                break;
            case 'range':
                cfg.type = "range";
                if(props.value.length ==2){
                    cfg.startTime =props.value[0];
                    cfg.endTime =props.value[1];
                }else{
                    cfg.startTime =moment().startOf('month').format(props.formatString.length >10?"YYYY-MM-DD HH:mm:ss":"YYYY-MM-DD");
                    cfg.endTime =moment().endOf('month').format(props.formatString.length >10?"YYYY-MM-DD HH:mm:ss":"YYYY-MM-DD");
                }
                cfg.needDel = props.needDel;
                cfg.callback = _.bind(this.getDate);
                cfg.defaultMonth = true;
                break;
            case 'calenderRange':
                cfg.type = "calenderRange";
                if(props.value.length ==2){
                    cfg.startTime =props.value[0];
                    cfg.endTime =props.value[1];
                }else{
                    cfg.startTime =null;
                    cfg.endTime =null;
                }
                cfg.callback = _.bind(this.pullDataUp);
                break;
            default:
                break;
        }

        if(_.isUndefined(props.inputWidth) && props.module == "renlifang"){
            var width = window.screen.width;
            var temp = (width-320-60-20 -22) * 0.375;
            var singleWidth = parseInt((temp-40-22-4)/2); 
            cfg.width = singleWidth;
        }else{
            cfg.width = props.inputWidth ||130;
        }

        datatimePicker.build(cfg);
    },

    needRender:function(thisProps,nextProps){
        if(thisProps.containerId != nextProps.containerId){
            return true;
        }else if(thisProps.type != nextProps.type){
            return true;
        }else if(thisProps.formatString != nextProps.formatString){
            return true;
        }else if((thisProps.value==null&&nextProps.value)||thisProps.value.toString() !=nextProps.value.toString()){
            return true;
        }else if(thisProps.needDel != nextProps.needDel){
            return true;
        }

        return false;
    },

    getDate:function(value){
        this.props.callback(value);
    },

    pullDataUp:function(startDate,endDate){
    	  this.props.callback(startDate,endDate);
    },

    render: function() {
        return (
            <div className="input-group date col-md-12" ref="dateRangeInput">
            </div>
        )
    }

})

module.exports = DateTimeRangePicker;