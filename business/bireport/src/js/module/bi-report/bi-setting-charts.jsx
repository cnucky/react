import React from 'react';
import DesignSetting from './bi-setting-design';
var MultiSelect = require('widget/multiselect');
import {store} from './store';

/** 交叉表专有设置 */
class CrossTableSetting extends React.Component {
    constructor(props) {
        super(props);
        this.displayName = 'CrossTableSetting';
    }

    paginationSelect(event){
        store.dispatch({
            type: 'UPDATE_CHART',
            id : this.props.id,
            pagination : event.target.checked
        });
    }

    render() {
        var pagination = this.props.com.pagination;
        return (
            <div>
                <div className="row checkbox">
                    <label className="col-md-4 control-label" style={{marginLeft:'13px'}}>
                        <input type="checkbox" checked = {pagination} onChange = {this.paginationSelect.bind(this)}/>数据分页
                    </label>
                </div>

            </div>
        );
    }
}

/** 表格专有设置 */
class CommonTableSetting extends React.Component {
    constructor(props) {
        super(props);
        this.displayName = 'CommonTableSetting';
    }

    paginationSelect(event){
        store.dispatch({
            type: 'UPDATE_CHART',
            id : this.props.id,
            pagination : event.target.checked
        });
    }

    showSequenceNumberChange(event){
        store.dispatch({
            type: 'UPDATE_CHART',
            id : this.props.id,
            showSequenceNumber : event.target.checked
        });
    }

    showCheckboxSelect(event){
        store.dispatch({
            type: 'UPDATE_CHART',
            id : this.props.id,
            showCheckbox : event.target.checked
        });
    }

    showFilterSelect(event){
        store.dispatch({
            type: 'UPDATE_CHART',
            id : this.props.id,
            showFilter : event.target.checked
        });
    }

    render() {
        var pagination = this.props.com.pagination;
        var showSequenceNumber = this.props.com.showSequenceNumber;
        var showCheckbox = this.props.com.showCheckbox;
        var showFilter = this.props.com.showFilter;

        return (
            <div>
                <div className="row checkbox">
                    <label className="col-md-4 control-label" style={{marginLeft:'13px'}}>
                        <input type="checkbox" checked = {pagination} onChange = {this.paginationSelect.bind(this)}/>数据分页
                    </label>
                    <div className="col-md-1"></div>
                    <label className="col-md-4 control-label" style={{marginLeft:'40px'}}>
                        <input type="checkbox" checked = {showSequenceNumber} onChange = {this.showSequenceNumberChange.bind(this)}/>显示序号
                    </label>
                </div>

                <div className="row checkbox">
                    <label className="col-md-4 control-label" style={{marginLeft:'13px'}}>
                        <input type="checkbox" checked = {showCheckbox} onChange = {this.showCheckboxSelect.bind(this)}/>显示多选
                    </label>
                    <div className="col-md-1"></div>
                    <label className="col-md-4 control-label" style={{marginLeft:'40px'}}>
                        <input type="checkbox" checked = {showFilter} onChange = {this.showFilterSelect.bind(this)}/>显示过滤
                    </label>
                </div>
            </div>
        );
    }
}

/** 柱状图设置 */
class BarSetting extends React.Component {
    constructor(props) {
        super(props);
        this.displayName = 'BarSetting';
    }

    showXSelect(event){
        store.dispatch({
            type: 'UPDATE_CHART',
            id : this.props.id,
            showX : event.target.checked
        });
    }

    showYSelect(event){
        store.dispatch({
            type: 'UPDATE_CHART',
            id : this.props.id,
            showY: event.target.checked
        });
    }

    transverseChange(event){
        store.dispatch({
            type: 'UPDATE_CHART',
            id : this.props.id,
            transverse: event.target.checked
        });
    }

    showAxisNameChange(event){
        store.dispatch({
            type: 'UPDATE_CHART',
            id : this.props.id,
            showAxisName: event.target.checked
        });
    }

    render() {
        var showX = this.props.com.showX;
        var showY = this.props.com.showY;
        var transverse = this.props.com.transverse;
        var showAxisName = this.props.com.showAxisName;

        return (
            <div>
                <div className="row checkbox">
                    <label className="col-md-4 control-label" style={{textAlign:'left', marginLeft:'31px'}}>
                        <input type="checkbox" checked={transverse} onChange={this.transverseChange.bind(this)}/>横向
                    </label>
                    <div className="col-md-2"></div>
                    <label className="col-md-4 control-label" style={{textAlign:'left', marginLeft:'16px'}}>
                        <input type="checkbox" checked={showAxisName} onChange={this.showAxisNameChange.bind(this)}/>轴标题
                    </label>
                </div>

                <div className="row checkbox">
                    <label className="col-md-4 control-label" style={{textAlign:'left', marginLeft:'31px'}}>
                        <input type="checkbox" checked={showX} onChange={this.showXSelect.bind(this)}/>显示X轴
                    </label>
                    <div className="col-md-2"></div>
                    <label className="col-md-4 control-label" style={{textAlign:'left', marginLeft:'16px'}}>
                        <input type="checkbox" checked={showY} onChange={this.showYSelect.bind(this)}/>显示Y轴
                    </label>
                </div>
                <hr className="alt short"/>
                <DesignSetting com = {this.props.com} id = {this.props.id}/>
            </div>
        );
    }
}

/** 折线图专有设置 */
class LineSetting extends React.Component {
    constructor(props) {
        super(props);
        this.displayName = 'LineSetting';
    }

    showXSelect(event){
        store.dispatch({
            type: 'UPDATE_CHART',
            id : this.props.id,
            showX : event.target.checked
        });
    }

    showYSelect(event){
        store.dispatch({
            type: 'UPDATE_CHART',
            id : this.props.id,
            showY: event.target.checked
        });
    }

    transverseChange(event){
        store.dispatch({
            type: 'UPDATE_CHART',
            id : this.props.id,
            transverse: event.target.checked
        });
    }

    areaChange(event){
        store.dispatch({
            type: 'UPDATE_CHART',
            id : this.props.id,
            area: event.target.checked
        });
    }

    smoothChange(event){
        store.dispatch({
            type: 'UPDATE_CHART',
            id : this.props.id,
            smooth: event.target.checked
        });
    }

    showAxisNameChange(event){
        store.dispatch({
            type: 'UPDATE_CHART',
            id : this.props.id,
            showAxisName: event.target.checked
        });
    }

    render() {
        var transverse = this.props.com.transverse;
        var area = this.props.com.area;
        var smooth = this.props.com.smooth;
        var showX = this.props.com.showX;
        var showY = this.props.com.showY;
        var showAxisName = this.props.com.showAxisName;

        return (
            <div>
                <div className="row checkbox">
                    <label className="col-md-4 control-label" style={{textAlign:'left', marginLeft:'31px'}}>
                        <input type="checkbox" checked = {transverse} onChange = {this.transverseChange.bind(this)}/>横向
                    </label>
                    <div className="col-md-2"></div>
                      <label className="col-md-4 control-label" style={{textAlign:'left', marginLeft:'16px'}}>
                        <input type="checkbox" checked = {area} onChange = {this.areaChange.bind(this)}/>面积
                    </label>
                </div>

                <div className="row checkbox">
                    <label className="col-md-4 control-label" style={{textAlign:'left', marginLeft:'31px'}}>
                        <input type="checkbox" checked = {smooth} onChange = {this.smoothChange.bind(this)}/>曲线
                    </label>
                    <div className="col-md-2"></div>
                    <label className="col-md-4 control-label" style={{textAlign:'left', marginLeft:'16px'}}>
                        <input type="checkbox" checked = {showAxisName} onChange = {this.showAxisNameChange.bind(this)}/>轴标题
                    </label>
                </div>

                <div className="row checkbox">
                    <label className="col-md-4 control-label" style={{textAlign:'left', marginLeft:'31px'}}>
                        <input type="checkbox" checked = {showX} onChange = {this.showXSelect.bind(this)}/>显示X轴
                    </label>
                    <div className="col-md-2"></div>
                    <label className="col-md-4 control-label" style={{textAlign:'left', marginLeft:'16px'}}>
                        <input type="checkbox" checked = {showY} onChange = {this.showYSelect.bind(this)}/>显示Y轴
                    </label>
                </div>
                <hr className="alt short"/>
                <DesignSetting com = {this.props.com} id = {this.props.id}/>
            </div>
        );
    }
}

/** 饼图专有设置 */
class PieSetting extends React.Component {
    constructor(props) {
        super(props);
        this.displayName = 'PieSetting';
    }

    modeChange(item, option, checked, select){
        store.dispatch({
            type : 'UPDATE_CHART',
            id : this.props.id,
            mode : option.val()
        });
    }

    tooltipStyleChange(item, option, checked, select){
        store.dispatch({
            type : 'UPDATE_CHART',
            id : this.props.id,
            tooltipStyle : parseInt(option.val())
          });
    }

    showAxisNameChange(event){
        store.dispatch({
            type: 'UPDATE_CHART',
            id : this.props.id,
            showAxisName: event.target.checked
        });
    }

    render() {
        var mode = this.props.com.mode;
        var tooltipStyle = this.props.com.tooltipStyle;
        var showAxisName = this.props.com.showAxisName;
        var title = [{
            label: "标题",
            value: 1,
            selected: tooltipStyle == 1
        }, {
            label: "标题，值",
            value: 2,
            selected: tooltipStyle == 2
        }, {
            label: "标题，百分比",
            value: 3,
            selected: tooltipStyle == 3
        }, {
            label: "标题，值(百分比)",
            value: 4,
            selected: tooltipStyle == 4
        }];

        var showsy = [{
            label: "默认",
            value: 'default',
            selected: mode == 'default'
        }, {
            label: "空心",
            value: 'hollow',
            selected: mode == 'hollow'
        }];

        var configType = {
            disableIfEmpty: false,
            enableFiltering: false,
            buttonClass: 'multiselect dropdown-toggle btn btn-info fw600 fs13 mnw50',
            buttonWidth: '100%'
        };

        return (
            <div>
                <div className="row checkbox">
                      <label className="col-md-4 control-label" style={{'paddingTop':'0px', marginLeft:'13px', lineHeight:'39px'}}>
                          显示样式
                      </label>
                      <div className="col-md-7" style={{'paddingLeft':'26px', 'paddingRight':'20px'}}>
                      {
                        <MultiSelect config={configType} updateData={true} data={showsy} onChange = {this.modeChange.bind(this)}/>
                      }
                      </div>
                </div>

                <div className="row checkbox">
                      <label className="col-md-4 control-label" style={{'paddingTop':'0px', marginLeft:'13px', lineHeight:'39px'}}>
                          提示样式
                      </label>
                      <div className="col-md-7" style={{'paddingLeft':'26px', 'paddingRight':'20px'}}>
                      {
                          <MultiSelect config={configType} updateData={true} data={title} onChange = {this.tooltipStyleChange.bind(this)}/>
                      }
                      </div>
                </div>

                <div className="row checkbox">
                    <label className="col-md-4 control-label" style={{'paddingTop':'0px', marginLeft:'2px', lineHeight:'39px'}}>
                        <input type="checkbox" checked={showAxisName} onChange={this.showAxisNameChange.bind(this)} style={{marginTop:'12px'}}/>轴标题
                    </label>
                </div>

                <hr className="alt short"/>
                <DesignSetting com={this.props.com} id={this.props.id}/>
            </div>
        );
    }
}

/** 雷达图专有设置 */
class RadarSetting extends React.Component {
    constructor(props) {
        super(props);
        this.displayName = 'RadarSetting';
    }

    areaChange(event){
        store.dispatch({
            type: 'UPDATE_CHART',
            id : this.props.id,
            area: event.target.checked
        });
    }

    showAxisNameChange(event){
        store.dispatch({
            type: 'UPDATE_CHART',
            id : this.props.id,
            showAxisName: event.target.checked
        });
    }

    render() {
        var area = this.props.com.area;
        var showAxisName = this.props.com.showAxisName;

        return (
        	  <div>
                <div className="row checkbox">
                    <label className="col-md-4 control-label" style={{textAlign:'left', marginLeft:'32px'}}>
                        <input type="checkbox" checked = {area} onChange = {this.areaChange.bind(this)}/>显示面积
                    </label>
                    <div className="col-md-2"></div>
                    <label className="col-md-4 control-label" style={{textAlign:'left', marginLeft:'16px'}}>
                        <input type="checkbox" checked = {showAxisName} onChange = {this.showAxisNameChange.bind(this)}/>轴标题
                    </label>
                </div>
                <hr className="alt short"/>
                <DesignSetting com = {this.props.com} id = {this.props.id}/>
            </div>
        );
    }
}

/** 气泡图 */
class BubbleSetting extends React.Component {
    constructor(props) {
        super(props);
        this.displayName = 'BubbleSetting';
    }

    render() {
        return (
            <DesignSetting com = {this.props.com} id = {this.props.id}/>
        );
    }
}

/** 词云图 */
class WordCloudSetting extends React.Component {
    constructor(props) {
        super(props);
        this.displayName = 'WordCloudSetting';
    }

    render() {
        return (
            <DesignSetting com = {this.props.com} id = {this.props.id}/>
        );
    }
}

/** 热力地图 */
class MapSetting extends React.Component {
    constructor(props) {
        super(props);
        this.displayName = 'MapSetting';
    }
    
    render() {
        return <DesignSetting com = {this.props.com} id = {this.props.id}/>
    }
}

/** 散点地图 */
class ScatterSetting extends React.Component {
    constructor(props) {
        super(props);
        this.displayName = 'ScatterSetting';
    }

    render() {
        return  <DesignSetting com = {this.props.com} id = {this.props.id}/>
    }
}

/** 关系图(树状图)专有设置 */
// class TreeSetting extends React.Component {
//     constructor(props) {
//         super(props);
//         this.displayName = 'TreeSetting';
//     }

//     render() {
//         var configType = {
//             disableIfEmpty: false,
//             enableFiltering: false,
//             buttonClass: 'multiselect dropdown-toggle btn btn-info fw600 fs13 mnw50',
//             buttonWidth: '100%'
//         };

//         var linesy = [{
//             label: "默认",
//             value: 1,
//             selected: this.props.linesy == 1
//         }, {
//             label: "空心",
//             value: 2,
//             selected: this.props.linesy == 2
//         }];
//         var sortsy = [{
//             label: "升序",
//             value: 'asc',
//             selected: this.props.sortsy == 'asc'
//         }, {
//             label: "降序",
//             value: 'desc',
//             selected: this.props.sortsy == 'desc'
//         }];

//         return (
//             <div>
//                 <div className="row checkbox">
//                     <label className="col-md-4 control-label">
//                         <input type="checkbox"/>横向&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
//                     </label>
//                     <div className="col-md-2"></div>
//                     <label className="col-md-4 control-label">
//                         <input type="checkbox"/>合并根节点
//                     </label>
//                 </div>

//                 <div className="row checkbox">
//                     <label className="col-md-4 control-label">
//                         <input type="checkbox"/>动画&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
//                     </label>
//                     <div className="col-md-2"></div>
//                     <label className="col-md-4 control-label">
//                         <input type="checkbox"/>自动汇总&nbsp;&nbsp;&nbsp;&nbsp;
//                     </label>
//                 </div>

//                 <div className="row checkbox">
//                     <label className="col-md-4 control-label">
//                         <input type="checkbox"/>显示模式
//                     </label>
//                     <div className="col-md-6">
//                     {
//                         <MultiSelect config={configType} updateData={true} data={linesy}/>
//                     }
//                     </div>
//                 </div>

//                 <hr className="alt short"/>

//                 <div className="row checkbox">
//                     <label className="col-md-3 control-label">层级</label>
//                     <label className="col-md-3 control-label">
//                     <input type="checkbox"/>全部
//                     </label>
//                     <span className="input-group input-group-sm col-md-4">
//                         <input className="form-control" type="number" min="1"/>
//                     </span>
//                 </div>

//                 <div className="row checkbox">
//                     <label className="col-md-4 control-label">
//                         <input type="checkbox"/>主路径&nbsp;&nbsp;&nbsp;&nbsp;
//                     </label>
//                     <div className="col-md-6"></div>
//                 </div>

//                 <div className="row checkbox">
//                     <label className="col-md-5 control-label">
//                         <input type="checkbox"/>高亮主路径&nbsp;&nbsp;&nbsp;&nbsp;
//                     </label>
//                     <label className="col-md-5 control-label">
//                         <input type="checkbox"/>高亮跳出点
//                     </label>
//                 </div>

//                 <div className="row checkbox">
//                     <label className="col-md-4 control-label">
//                         <input type="checkbox"/>结点排序
//                     </label>
//                     <div className="col-md-6">
//                     {
//                         <MultiSelect config={configType} updateData={true} data={sortsy}/>
//                     }
//                     </div>
//                 </div>
//             </div>
//         );
//     }
// }

export {CrossTableSetting,CommonTableSetting,BarSetting,LineSetting,PieSetting,RadarSetting,BubbleSetting,WordCloudSetting,MapSetting,ScatterSetting};
