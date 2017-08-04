import React from 'react';

import { Affix, Button } from 'antd';
import {store} from '../store';
import AutoLink from '.././rlf-auto-link';
import IconSet from '.././rlf-icon-set';
import AssistMenu from '.././rlf-assist-menu';

require('../../../module/renlifang/styles.less');
//let QQdata = require('./getqq.json').data;

export default class RelationQQ extends React.Component {
    constructor(props) {
        super(props);
        this.state= {

        }
    }

    componentDidMount() {
        const myQQ = this.props.myQQ;
        console.log(myQQ)
        if(!myQQ||_.isEmpty(myQQ)){
            $('.QQdata').hide();
            $('.qqNodata').show();
        }
         $.getJSON("/renlifang/personcore/getqq", {
                 qq:myQQ,
                //_:1495095904188
            }, function(rsp) {
                if (rsp.code == 0) {
                   //store.dispatch({
                   //     type: 'GET_QQDATA',
                   //     qqData: rsp.data
                   //})
                   // var QQdata = store.getState().qqData;
                    var QQdata = rsp.data;
                    console.log(QQdata)
                    if(_.isEmpty(QQdata)){
                        $('.QQdata').hide();
                        $('.qqNodata').show();

                    }
                    var tplQQTitle = _.template("<span class='fancytree-title'><%- nick + '  ' %>(<a class='rlf-auto-link link' href='javascript:void()'><%- qq %></a>)</span>");
                    var treeContainer = $('#relation-qq-container');
                    treeContainer.fancytree({
                        extensions: ["filter"],
                        quicksearch: true,
                        filter: {
                            mode: "dimn",
                            autoApply: true,
                            highlight: true
                        },
                        selectmode: 1,
                        clickFolderMode: 1,
                        checkbox: false,
                        source:QQdata,
                        autoScroll: true,
                        iconClass: function(event, data) {
                            if (data.node.extraClasses) {
                                if (data.node.extraClasses.indexOf('nv-qq') != -1) {
                                    return "fa fa-qq text-info";
                                } else if (data.node.extraClasses.indexOf('nv-group') != -1) {
                                    return "fa fa-group text-info";
                                }
                            }
                            return "none";
                        },
                        renderNode: function(event, data) {
                            var a = $(data.node.li).find('.rlf-auto-link');
                            a.attr("target","_blank");
                            a.attr("href",UrlUtil.getProfileUrl(data.node.data.qq == undefined ? '' : data.node.data.qq, data.node.data.valueType == undefined ? '' : data.node.data.valueType));
                        },
                        renderTitle: function(event, data) {
                            if (data.node.extraClasses === 'nv-qq-people' && data.node.data.valueType && "loading" != data.node.statusNodeType) {
                                return tplQQTitle(data.node.data);
                            }
                        },
                        postProcess: function(event, data) {
                            if (data.response.data) {
                                data.result = data.response.data;
                            }
                        },
                        init: function(event, data) {
                            data.tree.visit(function(node) {
                                if (node.extraClasses == 'nv-qq') {
                                    node.setExpanded(true);
                                }
                                if (node.folder) {
                                    if (node.extraClasses != 'nv-qq') {
                                        $('.fancytree-title:contains(' + node.title + ')').siblings('.fancytree-expander').attr('id', 'testId-' + node.title);
                                    } else {
                                        $('.fancytree-title:contains(' + node.title + ')').siblings('.fancytree-expander').attr('id', 'testId-QQ号码');
                                    }

                                }
                            })
                        },
                        activate: function(event, data) {
                            if (data.node.extraClasses && data.node.extraClasses=='nv-group-item') {
                                renderQQGroupDetail(data.node.data.number);
                            }
                            let result=$("input[name=search]").val();

                            if (data.node.extraClasses && data.node.extraClasses=='nv-qq-people' && result !== '') {
                                window.open(UrlUtil.getProfileUrl(data.node.data.qq == undefined ? '' : data.node.data.qq, data.node.data.valueType == undefined ? '' : data.node.data.valueType));
                            }
                        },
                        expand: function(event, data) {
                            if (data.node.extraClasses == 'nv-qq-contact') {
                                data.node.visit(function(node) {
                                    if (node.folder) {
                                        $('.fancytree-title:contains(' + node.title + ')').siblings('.fancytree-expander').attr('id', 'testId-' + node.title);
                                    }

                                })
                            }
                        }
                    })
                    // fancytree 过滤
                    var tree = treeContainer.fancytree("getTree");

                    $("input[name=search]").keyup(function(e) {
                        e.preventDefault();
                        var n;
                        var opts = {
                            autoExpand: true
                        };
                        var match = $(this).val();

                        if (e && e.which === $.ui.keyCode.ESCAPE || $.trim(match) === "") {
                            $("button#btnResetSearch").click();
                            return;
                        }
                        n = tree.filterNodes(match, opts);

                        $("button#btnResetSearch").attr("disabled", false);
                        $("span#matches").text("(" + n + ")");
                    });

                    $("button#btnResetSearch").click(function(e) {
                        $("input[name=search]").val("");
                        $("span#matches").text("");
                        tree.clearFilter();
                        tree.reload();
                        $(this).attr("disabled", true);
                    });
                    function renderQQGroupDetail(groupNumber){
                        var detailContainer = $('#relation-qqgroup-detail');
                        detailContainer.empty();
                        detailContainer.append(" <div class='qq-group mt10' id='relation-qqgroup-tree'></div>");
                        $("#relation-qq .new_container").show();
                        showLoader();
                        $.getJSON("/renlifang/personcore/getqqgroup", {
                            number: groupNumber
                        }, function(rsp) {
                            hideLoader();
                            if (rsp.code == 0) {
                                var groupDetail=rsp.data;
                                groupDetail = _.pick(groupDetail, function(value, key) {
                                    return (_.isNumber(value) && value != 0) || !_.isEmpty(value);
                                })
                                groupDetail = _.extend({
                                    number: '-',
                                    owners: ['-'],
                                    description: '-',
                                    createTime: '-'
                                }, groupDetail);
                                store.dispatch({
                                    type: 'GET_QQGROUPDETAIL',
                                    qqgroupDetail: groupDetail
                                });
                                if(rsp.data==""){
                                    $(".qqgroupnodata").show();
                                }
                                else{
                                    $(".qqgroup").show();
                                }
                                $('#relation-qqgroup-tree').fancytree({
                                    selectmode: 1,
                                    clickFolderMode: 1,
                                    checkbox: false,
                                    autoScroll: true,
                                    source: function() {
                                        _.each(groupDetail.members, function(item) {
                                            item.title = item.nick + " (" + item.qq + ")";
                                        });
                                        var datagroup =[{
                                            title: "群成员 (" + groupDetail.count + ")",
                                            children: groupDetail.members
                                        }];
                                        return datagroup;
                                    },
                                    iconClass: function(event, data) {
                                        return "fa fa-qq text-info";
                                    },
                                    renderNode: function(event, data) {
                                        var a = $(data.node.li).find('.rlf-auto-link');
                                        a.attr("target","_blank");
                                        a.attr("href",UrlUtil.getProfileUrl(data&&data.node&&data.node.data? data.node.data.qq : '', data&&data.node&&data.node.data? data.node.data.valueType : ''));
                                    },
                                    renderTitle: function(event, data) {
                                        if (data.node.data.valueType && "loading" != data.node.statusNodeType) {
                                            return tplQQTitle(data.node.data);
                                        }
                                    }
                                });
                            }
                        });


                    }

                }
        });

    }

    render() {
        const {name,number,createTime,description,owners}=store.getState().qqgroupDetail;
        var ownergroup;
        if(!_.isEmpty(owners)){
           (owners.length==1)?ownergroup=owners.join():ownergroup=owners.join(",");
        }
        return (
           <div id={"relation-qq"}  className="tab-pane  active in relation-qq link" >
               <div className="col-md-12 qqNodata"  style={{height:560 , display:'none' ,overflowY:'hidden' , overflowX:'hidden'}}>
                   <label className="col-md-12 mbn" style={{width:'30%' , fontSize:12 , textAlign: 'left' , fontWeight: 'bold' , marginTop:10}}>暂无QQ号信息</label>
                   <hr className="mt10 col-md-12" style={{color:'#C71313' , size:10}} />
               </div>
                <div style={{height: 560}} className="QQdata">
                    <div className="col-xs-6">
                        <div className="row">
                            <div className="col-xs-8">
                                <input className="form-control" name="search" placeholder="过滤..."/>
                            </div>
                            <div className="col-xs-4">
                                <button type="button" className="btn btn-primary" id={"btnResetSearch"}>清除
                                    <span id={"matches"}></span>
                                </button>
                            </div>
                        </div>
                        <div className="p10 col-xs-12 " id={"relation-qq-container"} style={{height: '100%'}}></div>
                    </div>
                    <div className="col-xs-6 new_container"   style={{paddingLeft:'20px',borderLeft:'1px solid #DDD',height:'100%', display:'none'}} >
                        <div className="p5 qqgroup">
                          <h4> {name}</h4>
                          <br/>
                          <div>
                              <label className="field-label">群信息</label>
                              <p className="default-text">
                                  <span>群号:</span><span className="text-info ml10">{number}</span>
                                  <br/>
                                  <span>创建时间:</span><span className="text-info ml10">{createTime}</span>
                                  <br/>
                                  <span>群主:</span><span className="text-info ml10">{ownergroup}</span>
                                  <br/>
                                  <span>描述:</span><span className="text-info ml10">{description}</span>
                              </p>
                          </div>
                      </div>
                      <div className="p5 qqgroupnodata">
                          <label class="field-label">群成员</label>
                          <div id="relation-qqgroup-detail">
                          <div className="qq-group mt10" id="relation-qqgroup-tree"></div>
                              </div>
                      </div>
                   </div>
                </div>
            </div>

        )
    }
}

module.exports = RelationQQ;