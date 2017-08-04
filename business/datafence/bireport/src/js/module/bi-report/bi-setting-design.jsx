import React from 'react';
var MultiSelect = require('widget/multiselect');
import {store} from './store';

/**
 * 包括设计模块
 */
class DesignSetting extends React.Component {
    constructor(props) {
        super(props);
        this.displayName = 'DesignSetting';
    }

    showLegendSelect(event){
      store.dispatch({
        type: 'UPDATE_CHART',
        id : this.props.id,
        showLegend : event.target.checked
      });
    }

    legendPositionChange(item, option){
      store.dispatch({
        type : 'UPDATE_CHART',
        id : this.props.id,
        legendPosition : option.val()
      });
    }

    showTooltipSelect(event){
      store.dispatch({
        type: 'UPDATE_CHART',
        id : this.props.id,
        showTooltip : event.target.checked
      });
    }

    render() {
        var showLegend = this.props.com.showLegend;
        var legendPosition = this.props.com.legendPosition;
        var showTooltip = this.props.com.showTooltip;

        var configType = {
            disableIfEmpty: false,
            enableFiltering: false,
            buttonClass: 'multiselect dropdown-toggle btn btn-info fw600 fs13 mnw50',
            buttonWidth: '100%'
        };
        
        var direction = [{
            label: "上",
            value: 'top',
            selected: legendPosition == 'top'
        }, {
            label: "下",
            value: 'bottom',
            selected: legendPosition == 'bottom'
        }, {
            label: "左",
            value: 'left',
            selected: legendPosition == 'left'
        }, {
            label: "右",
            value: 'right',
            selected: legendPosition == 'right'
        }];

        return (
            <div className="form-group">
                <div className="row mn checkbox">
                    <label className="col-md-4 control-label" style={{'paddingTop':'0px', marginLeft:'13px', lineHeight:'39px'}}>
                        <input type="checkbox" checked={showLegend} onChange={this.showLegendSelect.bind(this)} style={{marginTop:'12px'}} />显示图例
                    </label>
                    <div className="col-md-6" style={{marginLeft:'16px', paddingLeft:'10px', paddingRight:'10px'}}>
                        <MultiSelect config={configType} updateData={true} data={direction} onChange={this.legendPositionChange.bind(this)}/>
                    </div>
                </div>
                
                <div className="row mn checkbox">
                    <label className="col-md-4 control-label" style={{'paddingTop':'0px', marginLeft:'13px', lineHeight:'39px'}}>
                        <input type="checkbox" checked={showTooltip} onChange={this.showTooltipSelect.bind(this)} style={{marginTop:'12px'}} />显示提示
                    </label>
                </div>
            </div>
        );
    }
}

export default DesignSetting;