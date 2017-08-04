import React from 'react';
import { render } from 'react-dom';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import _ from 'underscore';
import DisplayPanel from '../module/model-apply/app';
import SamplePanel from '../module/model-apply/SamplePanel';
import SettingPanel from '../module/model-apply/SettingPanel';
import Tooltip from 'widget/tooltip';
import uuid from 'node-uuid';
const Notify = require('nova-notify');
var store = require('../module/model-apply/model-apply-store');
require('../module/model-apply/model-apply.less');
var utils = require('nova-utils');
var manager = require('../module/model-apply/modelapply-manager');
var modelId = utils.getURLParameter('modelid');
var solidId = utils.getURLParameter('solidid');
var replaceStore=require('../module/model-apply/SelectTemplete').replace_store;
var changeModel = require('../../../../modelanalysis/src/js/module/modeling/model-chooser');


initLocales(require.context('../locales/modelapply', false, /\.js/), 'zh');
registerLocales(require.context('../locales/ds-replace', false, /\.js/), 'module');


class ToolBar extends React.Component {

	componentDidMount () {
		//window.onbeforeunload = function(event) {
		//	return window.i18n.t("model-apply.some-data-may-not-be-saved");
		//}
	}

	reset(){
		let data = store.getState().data;
		let solidId=utils.getURLParameter('solidid')||data.solidId;
		let modelId=utils.getURLParameter('modelid')||data.viewDetail.modelId;
		if(solidId){
			window.open('/modelanalysis/modeling.html?' + "solidid=" + solidId);
		}else if(modelId){
			window.open('/modelanalysis/modeling.html?' + "modelid=" + modelId);
		} else {
			Notify.show({
				title: '请先选择模型',
				type: "warning"
			});
		}
	}
	update(){
		manager.updateApply();
	}

	saveDialog(){
		manager.saveApply();
	}

	selectTempleteHandle() {

	}

	preview() {
		let data = store.getState().data;
		let solidId=data.solidId || utils.getURLParameter('solidid');
		if(!solidId){
			let id = uuid.v1();
			localStorage.setItem(id, JSON.stringify(data));
			window.open('/modelapply/model-apply-preview.html?' + "id=" + id + "&useLocalStorage=true");
		}else{
			window.open('/modelapply/model-apply-preview.html?' + "solidid=" + solidId + "&useLocalStorage=false");
		}
	}

	doPost() {
		let data = store.getState().data;
		let solidId=data.solidId || utils.getURLParameter('solidid');
		window.open('/appstore/app-publish.html?'+'id='+solidId+'&type=mode-apply');
	}
	changeModel(){
		changeModel.open(function (modelid) {
			document.getElementById("changeTask").className='hide';
			window.location = '/modelapply/model-apply.html?modelid=' + modelid;
		});
	}
	changeReport(){
		changeModel.open_report(function (solidid) {
			//document.getElementById("changeTask").className='hide';
			window.location = '/modelapply/model-apply.html?solidid=' + solidid;
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
					<button id='btn-save-model' type="button" className="btn btn-default btn-sm" onClick={this.update}>
	                    <i className="fa fa-save fa-fw"></i>
	                </button>
                </Tooltip>
                <Tooltip title="另存为" placement="bottom">
					<button id='btn-save-as' type="button" className="btn btn-default btn-sm" onClick={this.saveDialog}>
	                    <i className="fa fa-copy fa-fw"></i>
	                </button>
                </Tooltip>
                <Tooltip title="查看原始模型" placement="bottom">
					<button type="button" className="btn btn-default btn-sm" onClick={this.reset}>
	                    <i className="fa fa-sitemap fa-fw"></i>
	                </button>
                </Tooltip>
                <Tooltip title="预览" placement="bottom">
					<button id='btn-model-preview' type="button" className="btn btn-default btn-sm" onClick={this.preview}>
	                    <i className="fa fa-eye fa-fw"></i>
	                </button>
                </Tooltip>

				{
					!modelId && !solidId ? (
						<div id="changeTask" style={{ position: 'absolute' ,right:10,top:3}}>
							<Tooltip title="选择模型" placement="bottom">
								<a className="large red button"  onClick={this.changeModel}>请先选择模型</a>
							</Tooltip>
						</div>
					):''
				}

                <button id='btn-subApp' style={{display:'none'}} type="button" className="btn btn-primary btn-sm pull-right disabled " onClick={this.doPost}>
	                 上传应用
	            </button>

            </div>
        )
    }
}

class ModelApply extends React.Component {
    render() {
        return (
            <div className="flex-layout flex-horizontal pn" style={{width: '100%', height: '100%'}}>
				<aside className="left-panel pn" style={{background: 'white', height: '100%', width: '250px'}}>
			        <div className="panel mbn flex-layout flex-vertical" style={{height: '100%'}}>
			            <div className="panel-heading text-center" style={{height: '42px', lineHeight: '42px'}}>
			            <span className="fs15 fw600">组件</span>
			            </div>
			            <div className="panel-body flex-item" style={{overflowY: 'auto'}}>
			                <div className="pn br-n">
								<SamplePanel />
			                </div>
			            </div>
			        </div>
			    </aside>
			    <div className="main-panel flex-item pn" style={{width: '100%', height: '100%', position: 'relative'}}>
			    	<div style={{width: '100%', position: 'absolute', top: 0, zIndex: 99}}>
			    		<ToolBar />
			    	</div>
			    	<div style={{width: '100%', height: '100%', position: 'relative', overflow: 'auto'}}>
			    	<div className="ph10 pv30" style={{height: '100%'}}>
                    	<DisplayPanel editable={false} />
                    </div>
                    </div>
			    </div>
			    <div className="right-panel pn" style={{background: 'white', height: '100%', width: '300px'}}>
			    	<div className="panel mbn flex-layout flex-vertical" style={{height: '100%'}}>
			            <div className="panel-heading text-center" style={{height: '42px', lineHeight: '42px'}}>
			            <span className="fs15 fw600">设置</span>
			            </div>
			            <div className="panel-body flex-item" style={{overflowY: 'auto'}}>
			                <div id='tab-setting' className="pn br-n">
								<SettingPanel />
			                </div>
			            </div>
			        </div>
			    </div>
		    </div>
        )
    }
}
var ModelApplyWrapper = DragDropContext(HTML5Backend)(ModelApply);

render(<ModelApplyWrapper />, document.getElementById('content-container'));


if(modelId || solidId){
	if (modelId) {
		manager.loadTree().then(function(){
			hideLoader();
		});
	} else if (solidId) {
		manager.openApply().then(function(){
			hideLoader();
		});

	}
} else {
	$('#btn-model-preview').addClass('hide');
	hideLoader();
}



