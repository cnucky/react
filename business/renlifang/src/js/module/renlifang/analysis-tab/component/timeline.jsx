import React from 'react';

import {store} from '../../store';

require('jquery');
var Notify = require('nova-notify');
require('../../../../module/renlifang/styles.less');

export default class TimeLine extends React.Component {
    constructor(props) {
        super(props);
        this.state={
            company:  this.props.company
        }
    }

    componentDidMount() {

    }
    componentWillUpdate(){
        // var companyData = store.getState().companyData;
        // _.each(companyData, function(item, index) {
        //     renderItem(item, index);
        // });
        // const {companyStartDate,companyEndDate,companyFrequency} = this.state.company;
        // function renderItem(item, index){
        //     item = _.extend({
        //         frequency: 2,
        //         valueType: undefined,
        //         name: '',
        //         cert: '',
        //         iconId: 'iconId-' + index,
        //         panelId: 'panelId-' + index
        //     }, item);
        //      item.desc = "从" + companyStartDate + "到" + companyEndDate + "共同行" + item.frequency + "次";

            // var tplItem = $(tplCompany(item));
            // var itemBg = item.frequency < 5 ? 'bg-success' : item.frequency < 10 ? 'bg-warning' : 'bg-danger';
            // tplItem.find('.timeline-icon').addclassName(itemBg);
            // list.append(tplItem);

            // var a = tplItem.find('.rlf-auto-link');
            // var currentHrefName = IconSet.getcurrentHrefName();
            // AutoLink.initLink(a, currentHrefName, '/renlifang/profile.html?entityid=' + BASE64.encoder(item.cert) + "&entitytype=" + BASE64.encoder('' + item.valueType));

            // var panel = tplItem.find('.panel');
            // tplItem.find('.panel-control-collapse,.company-collapse').click(function() {
            //     panel.toggleclassName('panel-collapsed');
            //     panel.children('.panel-body, .panel-menu, .panel-footer').slideToggle('fast');
            //     var detailContainer = panel.find('#relation-company-detail');
            //     if (_.isUndefined(detailContainer.attr('data-company-id'))) {
            //         detailContainer.attr('data-company-id', item.id);
            //         // panel.addclassName('panel-loader-active');
            //         panel.find('#relation-detail-loader').show();
            //         if (_opts.loadDetail && $.isFunction(_opts.loadDetail)) {
            //             _opts.loadDetail(item.id, function(detail) {
            //                 panel.find('#relation-detail-loader').hide();
            //                 // panel.removeclassName('panel-loader-active');
            //                 _renderDetail(detailContainer, detail);
            //             });
            //         }
            //     }
            // });
        //}
    }
    companyCollapse(id){
        $('.'+id+'.pn').closest('.panel').toggleClass('panel-collapsed');
        $('.'+id+'.pn').slideToggle('fast');
        if($('.'+id+'.pn').is(":hidden")){
            $('.'+id+'.pn'+'>.table-bordered').hide();
            $('.'+id+'.panel-control-loader').hide();
        }else{
            $('.'+id+'.panel-control-loader').show();
            $.getJSON("/renlifang/personcore/getpartnerdetail", {
                    id: id
                }, function(rsp) {
                    if (rsp.code == 0) {
                        $('.'+id+'.panel-control-loader').hide();
                        if(rsp.data){
                            store.dispatch({
                                type: 'GET_TIMELINE',
                                timeLine: rsp.data
                            })
                            $('.'+id+'.pn'+'>.table-bordered').show();
                        }
                    }
                    else{
                        Notify.show({
                                    title: "网络出错了",
                                    type: "danger"
                                });
                        $('.'+id+'.panel-control-loader').hide();
                        $('.'+id+'.pn').closest('.panel').addClass('panel-collapsed');
                    }
            });
        }
    }
    render() {
        var Data = this.props.data
        var meta,records;
        meta = store.getState().timeLine.meta;
        records = store.getState().timeLine.records;
        const {companyStartDate,companyEndDate,companyFrequency} = this.state.company;
        return (
             <div  className="mw1000 mauto ph20 timeline link" style={{display:"none"}} >
                <div id={"timeline"} className="timeline-single mt30">
                    <div className="timeline-divider mtn">
                        <div className="divider-label">
                            <span id={"relation-company-logo"}>全部</span>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-6 left-column" id={"relation-company-list"}>
                            {
                                _.map(Data, function(item, index) {
                                    item = _.extend({
                                        iconId: 'iconId-' + index,
                                        panelId: 'panelId-' + index
                                    }, item);
                                    let _this = this
                                     item.desc = "从" + companyStartDate + "到" + companyEndDate + "共同行" + item.frequency + "次";
                                     var itemBg = item.frequency < 5 ? 'bg-success' : item.frequency < 10 ? 'bg-warning' : 'bg-danger';
                                     return(
                                             <div className="timeline-item" key={index}>
                                                <div className={`${itemBg} timeline-icon`} id={item.iconId}>
                                                    <span className="">{item.frequency}</span>
                                                </div>
                                                <div className="panel panel-collapsed " id={item.panelId}>
                                                    <div className="panel-heading" id={"relation-company-title"}>
                                                        {
                                                                item.valueType ?
                                                                    (
                                                                    <a className="rlf-auto-link panel-title" target="_blank" href={ UrlUtil.getProfileUrl(item.cert, item.valueType)}>
                                                                        <b>{item.name}</b>
                                                                        <small className="ml5">
                                                                            <span className="fa fa-credit-card fw"></span>
                                                                            {item.cert}
                                                                        </small>
                                                                    </a>
                                                                    ) :
                                                                (
                                                                    <a className="panel-title company-collapse" href="javascript:void(0);" >
                                                                        <b>{item.name}</b>
                                                                        <small className="ml5">
                                                                            <span className="fa fa-credit-card fw"></span>
                                                                            {item.cert}
                                                                        </small>
                                                                    </a>
                                                                    )
                                                        }
                                                        <span className="ml5">{item.desc}</span>
                                                        <span className="panel-controls" onClick={this.companyCollapse.bind(this,item.id)}>
                                                        <a href="javascript:void(0)" className={`${item.id} panel-control-loader`} ></a>
                                                        <a href="javascript:void(0)" className="panel-control-collapse"></a></span>
                                                    </div>
                                                    <div className= {`${item.id} panel-body pn`}  style={{display:'none'}}>
                                                        <table className="table table-hover table-bordered">
                                                            <thead>
                                                            {
                                                                _.map(meta, function(metaItem,index) {
                                                                    return(
                                                                        <th key={index} style={{padding:"9px",border:"1px solid #eeeeee"}}>
                                                                        {metaItem.caption}
                                                                        </th>
                                                                        )
                                                                })
                                                            }
                                                            </thead>
                                                            <tbody>
                                                            {
                                                                _.map(records, function(recordItem,index) {
                                                                    return(
                                                                        <tr key={index}>
                                                                        {
                                                                            _.map(recordItem, function(item,index) {
                                                                                return(
                                                                                    <td key={index}> {item} </td>
                                                                                    )
                                                                            })
                                                                        }
                                                                        </tr>
                                                                        )
                                                                })
                                                            }
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                },this)
                            }
                           <div style={{fontWeight:600,height:50,marginTop:"-10px"}}>当前最多展示50条记录</div>
                        </div>
                    </div>
                </div>
            </div>

        )
    }
}

module.exports = TimeLine;

