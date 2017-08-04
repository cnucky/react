initLocales();
import React from 'react';
import {render} from 'react-dom';
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Tooltip from 'widget/tooltip';
import {store} from '../../module/bi-report/store';
import uuid from 'node-uuid';
import Notify from 'nova-notify';
var Q = require('q');
var utils = require('nova-utils');
var FileSaver = require('utility/FileSaver/FileSaver');
var App = require('../../module/bi-report/bi-view-app').App;
var SampleCharts = require('../../module/bi-report/bi-sample-charts').ComponentCharts;
var SampleLayout = require('../../module/bi-report/bi-sample-layout').Layout;
var SettingPanel = require('../../module/bi-report/bi-setting-panel');
var changeTak = require('../../widget/change-task/change-task');
var manager = require('../../module/bi-report/bi-manager');
var changeModel = require('../../../../../modelanalysis/src/js/module/modeling/model-chooser');
require('../../module/bi-report/bi-report.less');
require('react-bootstrap-table/css/react-bootstrap-table.css');
require('react-data-grid/dist/react-data-grid.css');



let taskId = utils.getURLParameter('taskid');
let modelId = utils.getURLParameter('modelid');
let reportId = utils.getURLParameter('reportid');

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

	handleOtherSave() {
		manager.otherSaveReport();
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

	handleDownload() {
		let data = $.extend(true, {}, store.getState());
		// 给文件添加识别码用于上传时判断是否为符合规范的文件
		data.ID_CODE = "bireport-store " + new Date();
		var blob = new Blob([JSON.stringify(data)], {type: "text/plain;charset=utf-8"});
		let name = data.card.name ? data.card.name : '未命名图表';
		FileSaver.saveAs(blob, name+".json");
	}

	handleUpload(e) {
		var FileReader = window.FileReader;
        var reader = new FileReader();
        reader.onload = function(e) {
			try {
				let data = JSON.parse(e.target.result);
				if(data.ID_CODE && data.ID_CODE.indexOf("bireport-store") === 0) {
					delete data.ID_CODE;
					store.dispatch({
						type: "REPLACE",
						state: data
					});

					document.getElementById("changeTask").className='hide';
				}
				else 
					throw "INVALID_FILE";				
			} catch(err) {
				Notify.simpleNotify("解析失败", "文件格式不符合报表文件规范", 'error');
			}
        }.bind(this);

        var file = e.target.files[0];
        reader.readAsText(file);
	}

	changeTask(){
		changeTak.buildSaveDialog(function (taskid) {
			// store.dispatch({
			// 	type: 'ADD_TASKID',
			// 	taskId: taskid
			// });
			// loadData(taskid).then(function () {
			//
			// });
			$('#changeTask').addClass('hide');
			window.location = '/bireport/report.html?taskid=' + taskid;

		});

	}

	changeReport(){
		changeModel.open_bireport(function (reportid) {
			window.location = '/bireport/report.html?reportid=' + reportid;
		});
	}

    render() {
        return (
			<div id="top-toolbar" className="p5" style={{ position: 'relative' }}>
				<Tooltip title="载入模型固化" placement="bottom">
					<button type="button" className="btn btn-default btn-sm" style={{ position: 'relative' }} onClick={this.changeReport}>
						<i className="fa fa-folder-open fa-fw"></i>
					</button>
				</Tooltip>
                <Tooltip title="保存" placement="bottom">
					<button id='btn-save' type="button" className={("btn btn-default btn-sm ")+(taskId ? 'hide':'')} onClick={this.handleSave}>
	                    <i className="fa fa-save fa-fw"></i>
	                </button>
                </Tooltip>
				<Tooltip title="另存为" placement="bottom">
					<button type="button" className={("btn btn-default btn-sm ")+(modelId && !taskId ? 'hide':'')} onClick={this.handleOtherSave}>
						<i className="fa fa-copy fa-fw"></i>
					</button>
				</Tooltip>
                <Tooltip title="预览" placement="bottom">
					<button type="button" className="btn btn-default btn-sm" onClick={this.handlePreview}>
	                    <i className="fa fa-eye fa-fw"></i>
	                </button>
                </Tooltip>
                <Tooltip title="下载" placement="bottom">
					<button id='btn-download' type="button" className={("btn btn-default btn-sm ")+(reportId ? '':'hide')} onClick={this.handleDownload}>
	                    <i className="fa fa-download fa-fw"></i>
	                </button>
                </Tooltip>
				<Tooltip title="上传" placement="bottom">
					<button type="button" className="btn btn-default btn-sm" style={{ position: 'relative' }}>
	                    <i className="fa fa-upload fa-fw" style={{cursor:'pointer'}}></i>
                        <input style={{ position: "absolute", left: 0, top: 0, height:"100%", width: "100%", opacity: 0 }}
							type="file" name="file" accept=".json" onChange={this.handleUpload} />
                    </button>
                </Tooltip>
				{
					!taskId && !modelId ? <div id="changeTask">
						<Tooltip title="选择任务" placement="bottom">
							<a className={"large red button"+ (reportId || modelId || taskId ? ' hide' : '')} style={{ position: 'absolute' ,right:'5px',top:'3px'}} onClick={this.changeTask}>请先选择任务</a>
						</Tooltip>
					</div> : ''
				}


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
			<div className="flex-layout flex-horizontal pn" style={{width: '100%', height: '100%'}}>
				<div style={{position:'relative'}} id="left-panel">
					<span id="left-panel-toggle" className={this.state.isLeftShow?"text-primary p5":"p5"} style={{position: 'absolute', top: '50%', right: '-20px', zIndex: 10, pointerEvents: 'auto'}} onClick={this.handleLeft.bind(this)}>
							<i className="fa fa-caret-right fs28 button-icon"></i>
					</span>
					<aside  className={this.state.isLeftShow?"left-panel pn":"left-panel pn hide"} style={{background: 'white', height: '100%', width: '200px'}}>
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
				</div>

			    <div className="main-panel flex-item pn" style={{width: '100%', height: '100%', position: 'relative'}}>
			    	<div style={{width: '100%', position: 'absolute', top: 0, zIndex: 99}}>
			    		<ToolBar />
			    	</div>
			    	<div style={{width: '100%', height: '100%', position: 'relative', overflow: 'auto'}}>
			    	<div style={{height:'100%'}} className="ph20 pv30">
						<App oprQueue={oprQueue} editable={true} isRightShow={this.state.isRightShow}></App>
                    </div>
                    </div>
			    </div>
				<div style={{position:'relative'}} id="right-panel">
					<span id="right-panel-toggle" className={this.state.isRightShow?"text-primary p5":"p5"} style={{position: 'absolute',top: '50%', left:'-22px', zIndex: 10, pointerEvents:'auto'}} onClick={this.handleRight.bind(this)}>
							<i className="fa fa-caret-left fs28 button-icon"></i>
						</span>
					<aside className={this.state.isRightShow ? "right-panel pn":"right-panel pn hide"} style={{background: 'white', height: '100%', width: '300px'}}>
						<SettingPanel />
					</aside>
				</div>

		    </div>
			)
	}
}

function initChart(taskId, chart) {
    let defer = Q.defer();

    let dimension = chart.dimension || [];
    let measure = chart.measure || [];
    let fieldNodes = dimension.concat(measure);
    let queryFields = _.map(fieldNodes, function(item) { return item.aliasName });

    let defineData = chart.defineData;
    let dataSourceInfo = chart.dataSourceInfo;

    if(dataSourceInfo) {
        manager.quertReportData(taskId, queryFields, defineData, dataSourceInfo).then(function(data) {
            chart.dataSourceInfo = dataSourceInfo;
            chart.dimension = dimension;
            chart.measure = measure
            chart.defineData = defineData;
            chart.data = data;
            defer.resolve();                    
        });
    }
    else {
        chart.dataSourceInfo = undefined;
        chart.dimension = dimension;
        chart.measure = chart.chartType === 'COMMONTABLE' ? 0 : [];
        chart.defineData = defineData;
        chart.data = [];
        defer.resolve();
    }

    return defer.promise;
}

function loadData(taskId,modelId , reportId) {
    let defer = Q.defer();

    if(modelId && !taskId) {
		taskId = (taskId == null) ? -1 : taskId;
        manager.loadModel().then(function(data){
			let modelDetail = JSON.parse(data.modelDetail); 
			let state = modelDetail.reportDetail;
			delete modelDetail.reportDetail;	

            if(!state) {
				store.dispatch({
					type: 'ADD_MODELDINGINFO',
					modelId: data.modelId,
					modelName: data.modelName,
					modelDetail: modelDetail
				});
				//store.dispatch({
				//	type: 'INIT',
				//	modelName: data.modelName
				//});
                defer.resolve();
            }
			else {
				/** 加载图表字段数据(引用传递) */
				let promises = [];
				_.each(state.charts, function(chart) {
					promises.push(initChart(taskId, chart));
				});

				/** 全部加载完之后resolve */
				Q.all(promises).then(function() {
					state.card.isSelected = true;
					state.modelId = data.modelId;
					state.modelName = data.modelName;
					state.modelDetail = modelDetail;
					store.dispatch({ 'type':'REPLACE', 'state':state });
					defer.resolve();
				});
			}
        });
    } else if (taskId && !modelId){

		manager.loadTaskModel().then(function(data){
			let datas = data.snapshotList[0];
			let modelDetail = JSON.parse(datas.graph);
			let state = modelDetail.reportDetail;
			delete modelDetail.reportDetail;

			if(!state) {
				store.dispatch({
					type: 'ADD_MODELDINGINFO',
					modelId: datas.id,
					modelName: datas.title,
					modelDetail: modelDetail
				});
				//store.dispatch({
				//	type: 'INIT',
				//	modelName: datas.title
				//});
				defer.resolve();
			}
			else {
				/** 加载图表字段数据(引用传递) */
				let promises = [];
				_.each(state.charts, function(chart) {
					promises.push(initChart(taskId, chart));
				});

				/** 全部加载完之后resolve */
				Q.all(promises).then(function() {
					state.card.isSelected = true;
					state.modelId = datas.id;
					state.modelName = datas.title;
					state.modelDetail = modelDetail;
					store.dispatch({ 'type':'REPLACE', 'state':state });
					defer.resolve();
				});
			}
		});

	} else if(taskId && modelId){
		manager.loadModel().then(function(data){
			let modelDetail = JSON.parse(data.modelDetail);
			let state = modelDetail.reportDetail;
			delete modelDetail.reportDetail;

			if(!state) {
				store.dispatch({
					type: 'ADD_MODELDINGINFO',
					modelId: data.modelId,
					modelName: data.modelName,
					modelDetail: modelDetail
				});
				//store.dispatch({
				//	type: 'INIT',
				//	modelName: data.modelName
				//});
				defer.resolve();
			}
			else {
				/** 加载图表字段数据(引用传递) */
				let promises = [];
				_.each(state.charts, function(chart) {
					promises.push(initChart(taskId, chart));
				});

				/** 全部加载完之后resolve */
				Q.all(promises).then(function() {
					state.card.isSelected = true;
					state.modelId = data.modelId;
					state.modelName = data.modelName;
					state.modelDetail = modelDetail;
					store.dispatch({ 'type':'REPLACE', 'state':state });
					defer.resolve();
				});
			}
		});
	}else if(reportId){
		manager.openReport(reportId).then(function(data){
			data.reportDetail.repotId = reportId;
			let reportDetail = data.reportDetail;

			if(!reportDetail) {
				defer.reject({ message: '尚未制作报表原型' });
				return;
			}

			/** 加载图表字段数据(引用传递) */
			let promises = [];
			_.each(reportDetail.charts, function(chart) {
				promises.push(initChart(data.taskId, chart));
			});

			/** 全部加载完之后resolve */
			Q.all(promises).then(function() {

				store.dispatch({ 'type':'REPLACE', 'state':reportDetail });
				store.dispatch({
					type: 'ADD_TASKID',
					taskId : data.taskId
				});
				store.dispatch({
					type: 'ADD_REPORTID',
					reportId : reportId
				});
				defer.resolve();
			});
		});
	}

    return defer.promise;
}




if (taskId || modelId || reportId){
	loadData(taskId,modelId,reportId).then(function() {
		var BIReportWrapper = DragDropContext(HTML5Backend)(BIReport);
		render(<BIReportWrapper />, document.getElementById('content-container'));
		hideLoader();
	}).catch(function(e) {
		Notify.simpleNotify("加载出错", e.message || e, 'error');
	})
} else {
	var BIReportWrapper = DragDropContext(HTML5Backend)(BIReport);
	render(<BIReportWrapper />, document.getElementById('content-container'));
	hideLoader();
}

