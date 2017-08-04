import React from 'react';
import {render} from 'react-dom';
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Tooltip from 'widget/tooltip';
import {store} from '../../module/bi-report/store';
import uuid from 'node-uuid';
var utils = require('nova-utils');
var App = require('../../module/bi-report/bi-view-app').App;
var SampleCharts = require('../../module/bi-report/bi-sample-charts').ComponentCharts;
var SampleLayout = require('../../module/bi-report/bi-sample-layout').Layout;
var SettingPanel = require('../../module/bi-report/bi-setting-panel');
var manager = require('../../module/bi-report/bi-manager');
require('../../module/bi-report/bi-report.css');
require('react-bootstrap-table/css/react-bootstrap-table.css');
require('react-data-grid/dist/react-data-grid.css');

//事件操作队列
var oprQueue = {
	opr: undefined,

	updateOpr: function(newOpr) {
		this.opr = newOpr;
		setTimeout(
			function(){ this.excuteOpr(newOpr) }.bind(this)
		,500);
	},

	excuteOpr: function(newOpr) {
		if(this.opr === newOpr) {
			store.dispatch(newOpr);
			this.opr = undefined;
		}
	},

	stopOpr: function() {
		this.opr = undefined;
	}
};

//工具栏
class ToolBar extends React.Component {
    constructor(props) {
        super(props);
        this.displayName = '';
    }

	handleSave() {
		manager.saveReport();
	}

	handlePreview() {
		localStorage.clear();

		let previewid = uuid.v1();
		let state = $.extend(true, {}, store.getState());
		state.card.isSelected = false;
		_.each(state.charts, (chart) => { chart.isSelected = false });
		_.each(state.layouts, (layout) => { layout.isSelected = false });
		
		localStorage.setItem(previewid, JSON.stringify(state));
		window.open("/bireport/report-preview.html?" + "previewid=" + previewid);
	}

    render() {
        return (
			<div id="top-toolbar" className="p5">
				<Tooltip title="新建报表" placement="bottom">
					<button type="button" className="btn btn-default btn-sm">
	                    <i className="fa fa-plus fa-fw"></i>
	                </button>
                </Tooltip>
                <Tooltip title="保存" placement="bottom">
					<button type="button" className="btn btn-default btn-sm" id="save-btn" onClick={this.handleSave}>
	                    <i className="fa fa-save fa-fw"></i>
	                </button>
                </Tooltip>
                <Tooltip title="预览" placement="bottom">
					<button type="button" className="btn btn-default btn-sm" onClick={this.handlePreview}>
	                    <i className="fa fa-eye fa-fw"></i>
	                </button>
                </Tooltip>
                <Tooltip title="下载" placement="bottom">
					<button type="button" className="btn btn-default btn-sm">
	                    <i className="fa fa-download fa-fw"></i>
	                </button>
                </Tooltip>
            </div>
			)
    }
}


class BIReport extends React.Component {
	constructor(props) {
        super(props);
        this.state = {
        	isLeftShow: true,
        	isRightShow: true
        };
    }

	handleLeft() {
		this.setState({isLeftShow: !this.state.isLeftShow});
	}

	handleRight() {
		this.setState({isRightShow: !this.state.isRightShow});
	}

	render(){
		return (
			<div className="flex-layout flex-horizontal pn" style={{width: '100%', height: '100%' , position: 'relative'}}>
				<aside className={this.state.isLeftShow?"left-panel pn":"left-panel pn hide"} style={{background: 'white', height: '100%', width: '200px'}}>
			        <div className="panel mbn flex-layout flex-vertical" style={{height: '100%'}}>
						<div className="panel-heading text-center" style={{height: '42px', lineHeight: '42px'}}>
							<span className="fs15 fw600">布局</span>
						</div>
						<div className="panel-body " style={{overflowY: 'auto'}}>
							<div className="pn br-n">
								<SampleLayout oprQueue={oprQueue}></SampleLayout>
							</div>
						</div>
			            <div className="panel-heading text-center" style={{height: '42px', lineHeight: '42px'}}>
			            <span className="fs15 fw600">图表</span>
			            </div>
			            <div className="panel-body flex-item" style={{overflowY: 'auto'}}>
			                <div className="pn br-n">
								<SampleCharts oprQueue={oprQueue}></SampleCharts>
			                </div>
			            </div>
			        </div>
			    </aside>
			    <div className="main-panel flex-item pn" style={{width: '100%', height: '100%'}}>
			    	<div style={{width: '100%', position: 'absolute', top: 0, zIndex: 99}}>
			    		<ToolBar />
			    	</div>
			    	<div style={{width: '100%', height: '100%', position: 'relative', overflow: 'auto'}}>
			    	<div className="ph20 pv30">
                    	<span id="left-panel-toggle" className={this.state.isLeftShow?"text-primary p5":"p5"} style={{position: 'absolute', top: '50%', left: 0, zIndex: 10, pointerEvents: 'auto'}} onClick={this.handleLeft.bind(this)}>
							<i className="fa fa-caret-right fs28"></i>
						</span>
						<span id="right-panel-toggle" className={this.state.isRightShow?"text-primary p5":"p5"} style={{position: 'absolute',top: '50%', right: 0, zIndex: 10, pointerEvents:'auto'}} onClick={this.handleRight.bind(this)}>
							<i className="fa fa-caret-left fs28"></i>
						</span>
						<App oprQueue={oprQueue} editable={true}></App>
                    </div>
                    </div>
			    </div>

			    <div className={this.state.isRightShow?"right-panel pn":"right-panel pn hide"} style={{background: 'white', height: '100%', width: '300px', minWidth: '300px'}}>
					<SettingPanel />
			    </div>
		    </div>
			)
	}
}

var BIReportWrapper = DragDropContext(HTML5Backend)(BIReport);
render(<BIReportWrapper />, document.getElementById('content-container'));

//数据获取
if(utils.getURLParameter('modelid')) {
	/** 从建模跳转 */
	manager.loadModel().then(function(data){
		store.dispatch({
			type: 'ADD_MODELDINGINFO',
			modelId: data.modelId,
			modelName: data.modelName,
			modelDetail: JSON.parse(data.modelDetail)
		});

		hideLoader();
	});
}
else {
	/** 从其他模块跳转（预留接口） */
	hideLoader();
}