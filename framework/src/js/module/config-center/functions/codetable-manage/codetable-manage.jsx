/**
 * Created by root on 2/8/17.
 */

import React from 'react';
// import ReactDOM from 'react-dom';

var $ = require('jquery');
var FancyTree = require('widget/fancytree.jsx');

const codeTableManageComponent = React.createClass({
    render() {
        var source;
        $.ajaxSettings.async = false;
        $.ajax({
            type: 'GET',
            url: '/dataimport/datatypetree',
            data: {
                // hostname: appConfig['gisServer'],
                // path: '/GisService/enclosure/GetAllEnclosure',
                // dirId: rootID
            },
            dataType: 'text',
            success: function(result) {
                // var data = '[{"title":"' + i18n.t('gismodule.enclosureManage.dirName') + '","folder":true,"lazy":false,"icon":"branch_16_p.png","key":"' + rootID + '","children":' + result + '}]';
                source = eval(result);
            },
            error: function(result) {
                // alert(i18n.t('gismodule.enclosureManage.alert11'));
            }
        });

        return (
            <div>
                <section id="content" className="table-layout admin-panels">
                    <aside className="tray tray-left tray270 pn" style={{background: 'white'}}>
                        <div className="panel mbn flex-layout flex-vertical" style={{height: '100%'}}>
                            <div className="row mt10 mln mrn">
                                <div className="col-xs-8">
                                    <input className="form-control input-sm" name="search-input-left" placeholder="过滤111..." />
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
                                        <FancyTree  config={{
                                            checkbox: true,
                                            selectMode: 3,
                                            source : source,
                                            imagePath: "../js/components/gisWidget/enclosureManageModule/fancyTree/image/",
                                            select:function(event, data2){
                                                event.preventDefault();
                                                console.log(data2.node.folder);
                                                console.log($(event.target).parent().parent().attr("data-index"));
                                                var thisIndex = $(event.target).parent().parent().attr("data-index");

                                                var nodes = $(event.target).parent().parent().find(".react-fancytree").fancytree("getTree").getSelectedNodes();
                                                console.log(nodes);
                                                var Path=[];
                                                var fenceId = [];

                                                for(var i=0;i<nodes.length;i++){
                                                    console.log(nodes[i]);
                                                    if(!nodes[i].folder){
                                                        Path.push(datafenceHelper.generateMainPath(nodes[i]));
                                                        fenceId.push(nodes[i].key);
                                                    }
                                                }
                                                console.log(Path);
                                                console.log(fenceId);
                                                var inputId = "#" + thisIndex + '-input';
                                                console.log(thisIndex)
                                                $(inputId).empty().val(Path);
                                                $(inputId).attr('fenceId', fenceId);
                                                $(inputId).attr('title', Path);
                                                console.log(data[thisIndex]);
                                                data[thisIndex].fence = Path;
                                                data[thisIndex].fenceId = fenceId;
                                            }
                                        }}/>
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
        // smartqueryConfigInit();
    }

})

const codeTableManageFunction = {
    component:codeTableManageComponent,
    componentDisplayName: '代码表管理',
    key:'codeTableManageFunction'
};

export {codeTableManageFunction};