import React from 'react';
import {store} from './store';
var MultiSelect = require('widget/multiselect');


/** 样式设置 */
var StyleSetting = React.createClass({
    getInitialState() {
        return { height:this.props.height };
    },

    componentWillReceiveProps(nextProps) {
        this.setState({ height:nextProps.com.height });
    },

    titleShowSelect(event){
        store.dispatch({
            type: 'UPDATE_CHART',
            id : this.props.id,
            showTitle : event.target.checked
        });
    },

    titleChange(event){
        store.dispatch({
            type : 'UPDATE_CHART',
            id : this.props.id,
            title : event.target.value
        });
    },

    titlePositionChange(item, option){
        store.dispatch({
            type : 'UPDATE_CHART',
            id : this.props.id,
            titlePosition : option.val()
        });
    },

    heightChange(e) {
        let height = e.target.value;
        if(height === '')
            height = undefined;
        else
            height = Number(height); 
        this.setState({ height:height })
    },

    onBlur() {
        store.dispatch({
            type: 'UPDATE_CHART',
            id: this.props.id,
            height: this.state.height
        });
    },

    render() {
        var showTitle = this.props.com.showTitle;
        var title = this.props.com.title;
        var titlePosition = this.props.com.titlePosition;
      
        var configType = {
            disableIfEmpty: false,
            enableFiltering: false,
            buttonClass: 'multiselect dropdown-toggle btn btn-info fw600 fs13 mnw50',
            buttonWidth: '100%'
        };
        var style = [{
            label: "左对齐",
            value: 'left',
            selected: titlePosition == 'left'
        }, {
            label: "居中",
            value: 'center',
            selected: titlePosition == 'center'
        }, {
            label: "右对齐",
            value: 'right',
            selected: titlePosition == 'right'
        }];

        return (
            <div className="form-group">
                <div className="row checkbox lh30 mn">
                    <label className="col-md-4 control-label lh30" style={{'paddingTop':'0px', marginLeft:'13px'}}>
                        <input type="checkbox" checked={showTitle} onChange={this.titleShowSelect} style={{'marginTop':'9px'}} />显示标题
                    </label>
                    <span className="input-group input-group-sm col-md-7" style={{'paddingLeft':'26px', 'paddingRight':'20px'}}>
                        <input className="form-control input-sm" type="text" value = {title} onChange = {this.titleChange}/>
                    </span>
                </div>

                <div className="row checkbox mn">
                    <label className="col-md-4 control-label" style={{'paddingTop':'0px', marginLeft:'13px', lineHeight:'39px'}}>
                        标题位置
                    </label>
                    <div className="col-md-6 ml10" style={{'paddingLeft':'16px', 'paddingRight':'6px'}}>
                        <MultiSelect config={configType} updateData={true} data={style} onChange={this.titlePositionChange}/>
                    </div>
                </div>

                <div className="row checkbox mn">
                    <label className="col-md-4 control-label lh30" style={{'paddingTop':'0px', marginLeft:'13px'}}>
                        图表高度
                    </label>
                    <span className="input-group input-group-sm col-md-7" style={{'paddingLeft':'26px', 'paddingRight':'20px'}}>
                        <input className="form-control" type="number" min="0" value={this.state.height} onChange={this.heightChange} onBlur={this.onBlur} />
                        <span className="input-group-addon">像素</span>
                    </span>
                </div>
            </div>
        );
    }
});

export default StyleSetting;


