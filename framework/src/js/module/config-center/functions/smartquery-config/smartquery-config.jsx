const React = require('react');
const ReactDOM = require('react-dom');

import {smartqueryConfigInit} from './page.jsx';
// import {smartqueryConfig as smartqueryConfigInit} from './page.jsx';

require('module/config-center/functions/smartquery-config/style.css');
// require('../../../../../less/skin/fancytree/ui.fancytree.custom.css')
// require('../../../../../less/jquery-contextmenu/jquery.contextMenu.css')
// require('../../../../../less/skin/jquery-ui-bts.css')
// require('../../../../../less/skin/magnific-popup.css')
// require('../../../../../fonts/font-awesome/font-awesome.css')




const smartqueryConfigComponent = React.createClass  ({
  render() {
    return (
      <div>
        <section id="content" className="table-layout admin-panels">
      	<aside className="tray tray-left tray270 pn" style={{background: 'white'}}>
        <div className="panel mbn flex-layout flex-vertical" style={{height: '100%'}}>
            <div className="row mt10 mln mrn">
                <div className="col-xs-8">
                    <input className="form-control input-sm" name="search-input-left" placeholder="过滤..." />
                </div>
                <div className="col-xs-4">
                    <button type="button" className="btn btn-primary btn-sm" id="btn-reset-left">清除
                        <span id="matches-left"></span>
                    </button>
                </div>
            </div>
            <div id="dir-tree-panel" className="panel-body flex-item" style={{border:'none'}}>
                <div className="pn br-n">
                    <div id="dir-tree" className="dir-tree">
                    </div>
                </div>
            </div>
        </div>
    </aside>
    <div className="tray tray-center">
        <div id='top-container'>
        	<div id='caption'></div>
            <div id='button-container' >
                <div className='top-panel-button-form'>
                    <input className='gui-input'></input>
                    <div className='top-panel-button form-button' id='btn-create-new-group'>新增分组<i className='fa fa-plus'></i></div>
                </div>
                <div className='top-panel-button single-button' id='btn-clear-all-fields'>清空所有分组<i className='fa fa-eraser'></i></div>
                <div className='top-panel-button single-button' id='btn-remove-all-groups'>清空并删除所有分组<i className='fa fa-times'></i></div>
                <div className='top-panel-button single-button save-button' id='btn-save-changes'>保存改动<i className='fa fa-save'></i></div>
                <div className='top-panel-button single-button' id='btn-cancel'>撤销本次更改<i className='fa fa-undo'></i></div>
                <div className='top-panel-button single-button' id='btn-sync' >同步字段<i className='fa fa-cloud-download'></i></div>
            </div>
        </div>
        <div id='preview-container'>
            <h2 id='init-reminder'>请在左侧选择数据类型进行配置</h2>
        </div>
    </div>
    <div className="tray tray-right">
        <div className="panel mbn flex-layout flex-vertical" style={{height: '100%'}}>
            <div className="row mt10 mln mrn">
                <div className="col-xs-8">
                    <input className="form-control input-sm" name="search-input-right" placeholder="过滤..." />
                </div>
                <div className="col-xs-4">
                    <button type="button" className="btn btn-primary btn-sm" id="btn-reset-right">清除
                        <span id="matches-right"></span>
                    </button>
                </div>
            </div>
            <div id="datafields-tree-panel" className="panel-body flex-item" style={{border: 'none'}}>
                <div className="pn br-n">
                    <div id="datafields-tree" className="dir-tree">
                    </div>
                </div>
            </div>
        </div>
    </div>
    </section>
      </div>
    );
  },
  componentDidMount() {
    const containerHeight =  window.innerHeight - $('#st-container').offset().top;
    $('#content').css({'min-height':containerHeight+'px'});   
    smartqueryConfigInit();
  }

})

const smartqueryConfigFunction = {
    component:smartqueryConfigComponent,
    componentDisplayName: '专项查询配置',
    key:'smartqueryConfigComponent'
};

export {smartqueryConfigFunction};