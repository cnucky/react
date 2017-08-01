import React from 'react';
import {render} from 'react-dom';
import Animate from 'rc-animate';

import '../../module/renlifang/styles.less';
import {store} from '../../module/renlifang/store';
import ProfileSummary from '../../module/renlifang/profile-summary';
import ProfileTabs from '../../module/renlifang/profile-tabs';
import FullImageView from '../../module/renlifang/full-image-view';
const Notify = require('nova-notify');
const loader = require('utility/loaders');
import Util from 'nova-utils';
import getKeyValueMap from '../../module/renlifang/getKeyValueMap';

require('../../../../../relationanalysis/src/js/pages/groupanalysis/analysis.jsx')


const TAB_PADDINGS = 10;

var personSummary, personProperty, keyValueMap, tagsData;

// var isPermission = false; //permission for yijiansou
// var showItemsCount = 4; //fold items count

class ProfileMain extends React.Component {

    componentDidUpdate(prevProps, prevState) {
        if (!prevState || !prevState.profileTabHeight) {
            this.resizeHandler();
        }
    }

    componentDidMount() {

        this.unsubscribe = store.subscribe(() => {
            this.forceUpdate();
        });
        this.loadTrails();
        this.loadPersonProfile();


        window.onresize = _.debounce(this.resizeHandler, 100);


    }



    setEntityIdAndType(id, type) {
        localStorage.setItem('renlifang-entityId', id);
        localStorage.setItem('renlifang-entityType', type);
    }

    loadPersonProfile() {
        var dsLoader = loader($('#content-container'));
        let entityId, entityType;
        entityId = UrlUtil.getEntityId();
        entityType = UrlUtil.getEntityType();

        this.setEntityIdAndType(entityId, entityType);

        if (window.__CONF__.business.renlifang.requireNewDataSource) {
            $.getJSON('/renlifang/personcore/getpersonprofile', {
                entityid: entityId,
                entitytype: entityType ? entityType : 0
            }, function(rsp) {


                let allKeys = ["SFZ","PASSPORT","USER_MSISDN","QQ"];


                getKeyValueMap.getKeyValueMap(allKeys,rsp.data.keyValueMap).then(function(newMap){

                    rsp.data.keyValueMap = newMap;


                    if (rsp.code != 0) {
                        Notify.show({
                            title: "获取详情失败",
                            text: rsp.message,
                            type: "error"
                        });
                        return;
                    }

                    rsp.data.summary.push({
                        groupName: "附件信息",
                        children : rsp.data.attachment
                    });

                    store.dispatch({
                        type: 'GET_PEROSONDETAIL',
                        personDetail: _.extend(rsp.data, {
                            personProperty : rsp.data.summary,
                            entityProperty : rsp.data.information,
                        })
                    });
                    dsLoader.hide();




                }).catch(function(e) {
                    Notify.simpleNotify("加载出错", e.message || e, 'error');
                });



            })
        } else {
            $.getJSON('/renlifang/personcore/getpersondetail', {
                entityid: entityId,
                entitytype: entityType ? entityType : 0
            }, function(rsp) {
                hideLoader();
                if (rsp.code != 0) {
                    Notify.show({
                        title: "获取详情失败",
                        text: rsp.message,
                        type: "error"
                    });
                    return;
                }

                store.dispatch({
                    type: 'GET_PEROSONDETAIL',
                    personDetail: _.extend(rsp.data, {
                        personProperty : [
                            {
                                groupName: "概要信息",
                                children : rsp.data.summary
                            },
                            {
                                groupName: "附件信息",
                                children : rsp.data.attachment
                            }
                        ],
                        entityProperty : rsp.data.information
                    })
                });
                dsLoader.hide();
            })
        }
    }
    loadTrails(){
        let entityId, entityType;
        entityId = UrlUtil.getEntityId();
        entityType = UrlUtil.getEntityType();

        $.getJSON('/renlifang/personcore/getSpyObjUrlByNumber', {
            entityid: entityId,
            entitytype: entityType
        }, function(rsp) {
            // hideLoader();
            if (rsp.code != 0) {
                Notify.show({
                    title: "获取侦控对象信息失败",
                    type: "error"
                });

                store.dispatch({
                    type: 'GET_SERVICECODE',
                    serviceCode: -1
                });
            }
            if(!_.isEmpty(rsp.data) &&rsp.data.objectId.length >0){
                store.dispatch({
                    type: 'GET_SERVICECODE',
                    serviceCode: 1
                });
            }else{
                store.dispatch({
                    type: 'GET_SERVICECODE',
                    serviceCode: 0
                });
            }


        })

    }


    resizeHandler() {
        // height为右侧面板整体高度。计算方法为页面高度减去其他间距及元素高度的总和。
        // TODO yaco 缩小时通过profileTabContainer无法获得需要的大小
        let profileTabContainer = document.getElementById("profile-tab-container");
        //window高度减去框架层的高度
        let innerHeight = window.innerHeight - 50;
        if (!profileTabContainer) {
            return;
        }
        // console.log('resize handler',profileTabContainer.offsetWidth - TAB_PADDINGS, profileTabContainer.offsetHeight - TAB_PADDINGS);

        store.dispatch({
            type: 'SIZE_UPDATE',
            profileTabWidth: profileTabContainer.offsetWidth - TAB_PADDINGS,
            profileTabHeight: innerHeight - TAB_PADDINGS
        });
    }

    componentWillUnmount() {
        if (this.unsubscribe) {  
            this.unsubscribe();
        }
    }

    render() {
        var state = store.getState();
        this.state = state;
        let content;
        if (state.summaryOpen) {
            content = (
                <div className="row p5 mn " style={{width: '100%', height: '100%'}}>
                    <div ref={node=>{this.summaryContainer = node}} className="col-md-3 pn tiny-scroller" style={{height: '100%'}}>
                        {_.isEmpty(state.personDetail) ? '' :
                            <ProfileSummary  data={state.personDetail} open={state.summaryOpen} />}
                    </div>
                    <div id="profile-tab-container" className="col-md-9 p5" style={{height: '100%', overflowY: 'auto'}}>
                        {_.isEmpty(state.personDetail) ? '' :
                            <ProfileTabs height={state.profileTabHeight ? state.profileTabHeight : null}
                                         width={state.profileTabWidth} personDetail={state.personDetail} serviceCode={state.serviceCode} />}
                    </div>
                </div>
            )
        } else {
            content = <div className="flex-layout p5 mn " style={{width: '100%', height: '100%'}}>

                <ProfileSummary  data={state.personDetail} open={state.summaryOpen}/>

                <div id="profile-tab-container" className="flex-item p5" style={{height: '100%'}}>
                    {_.isEmpty(state.personDetail) ? '' :
                        <ProfileTabs height={state.profileTabHeight ? state.profileTabHeight : null}
                                     width={state.profileTabWidth} personDetail={state.personDetail} serviceCode={state.serviceCode} />}
                </div>
            </div>
        }

        return <div style={{width: '100%', height: '100%'}}>
            {
                state.fullImageOpt ? <div style={{position: 'absolute', width: '100%', height: '100%', zIndex:100}}>
                    <FullImageView height={state.profileTabHeight ? state.profileTabHeight : null} images={state.fullImageOpt.images} currentImage={state.fullImageOpt.currentImage}/>
                </div> : ''
            }
            {content}
        </div>
    }
}

render(<ProfileMain />, document.getElementById('content-container'));