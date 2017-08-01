var $ = require('jquery');
var _ = require('underscore');
var React = require('react');
var moment = require('moment');
var gismodule = require('../../../../datafence/src/js/module/datafence/gis-module');
var gisModuleCSS = require("./gis-module.css");
var Notify = require('nova-notify');
var gisData;

let gisModuleHeight;
var ReactGisModule = React.createClass({
    propTypes: {
        
    },

    componentDidMount: function() {
      this.builtComponent(this.props);
    },

    componentWillReceiveProps: function(nextProps) {
      if(!_.isEqual(this.props, nextProps))
        this.builtComponent(nextProps);
    },

    builtComponent:function(props){
      var height = props.height;
      var left = (props.width-385-20) + "px";
      gisModuleHeight = height+35-55-10-15;
      $(this.refs.gisModuleDisplay).css("height",gisModuleHeight);
      // $('.gisModule #pathBox').css('position','relative');
      // $('.gisModule #pathBox').css('left',left);
      // $('.gisModule #pathBox').css('top',"40px");
      var cfg={
        container:$(this.refs.gisMapContainer),
        pageSource: 'smartquery'
      }

      gismodule.Init(cfg);
      
      if(!_.isEmpty(props.data)){
          gismodule.addTargetDatas(props.data);
          gismodule.setData();
      }
    },

    render: function() {
        return (
            <div className="col-md-12 pn gisModule" ref="gisModuleDisplay">
              <div ref="gisMapContainer" ></div>
            </div>
        )
    }

})

module.exports = ReactGisModule;