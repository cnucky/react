import React from 'react';

require('../../module/renlifang/styles.less');
const Notify = require('nova-notify');
import {store} from '../../module/renlifang/store';
import BasicInfoTab from '../../module/renlifang/basic-info-tab';
import EntityAttrTab from '../../module/renlifang/entity-attributes-tab';
import RelationAnalysisTab from '../../module/renlifang/relation-analysis-tab';
import BehaviorDataTab from '../../module/renlifang/behavior-data-tab';
import BehaviorTrackTab from '../../module/renlifang/behavior-track-tab';
// import ActivitesTrackTab from '../../module/renlifang/activities-track-tab';
import TrailsMonitorTab from '../../module/renlifang/trails-monitor-tab';
import appConfig from '../../../../config'
import getKeyValueMap from './getKeyValueMap';


var RTDEF = {
    'DEFAULT': 0, //两者都没有
    'PASSPORTANDCAR': 1, //有SFZ
    'PASSPORT_ONLY': 2 //无SFZ有PASSPORT
}
var processType = RTDEF.DEFAULT;
var showItemsCount = 3;
var propertyItemIndex = 0;
var entityIds = []; //用来存储本次查询的所有entityId。从keyValueMap中取到，一次页面加载只可能是sfz或passport中的一种
var entityType = 1; //默认sfz
var queryExternalCount = {
    CAR: 0,
    PASSPORT: 0
};

const TAB_HEAD_HEIGHT = 45;

let tabConfigs = [{
    tab: 'basic',
    label: '基本信息'
}, {
    tab: 'entity',
    label: '关联属性'
}, {
    tab: 'relation',
    label: '关系分析'
}, {
    tab: 'activities',
    label: '活动轨迹'
}, {
    tab: 'behavior',
    label: '行为数据'
}
];

export default class ProfileTabs extends React.Component {
    constructor(props) {
        super(props);

        let firstTab = tabConfigs[0].tab;
        this.state = {
            currentTab: firstTab,
            activedTabs: [firstTab],
            qqtomobilelist: {},
            myCert:{},
            myPassport:{},
            myQQ:[],
            organizeData:{}

        };

        this.renderPerson(this.props.personDetail);
    }

    componentWillReceiveProps(newProps) {
        this.renderPerson(newProps.personDetail);
    }

    componentDidMount() {
        if(this.props.serviceCode >= 1){
            tabConfigs.push({
                tab: 'trails',
                label: '行踪侦控'
            })
        }

        var qqtomobilelist = {
            mobile:[],
            qq:[]
        };
        let personDetail = this.props.personDetail;
        var keyValueMap = personDetail.keyValueMap;


        function getProfileValueByKey(key) {
            return _.find(keyValueMap, function(item) {
                return item.name == key;
            });
        }

        var myPhone = getProfileValueByKey('USER_MSISDN');
        var myQQ = getProfileValueByKey('QQ');
        var myCert = getProfileValueByKey('SFZ');
        var myPassport = getProfileValueByKey('PASSPORT');



        myQQ = myQQ ? myQQ.values : myQQ;
        myPhone = myPhone ? myPhone.values : myPhone;
        qqtomobilelist.mobile = myPhone;
        qqtomobilelist.qq = myQQ;


        this.setState({
            myCert : myCert,
            myPassport : myPassport,
            myQQ : myQQ,
            qqtomobilelist:qqtomobilelist,
            organizeData:personDetail.personProperty[2]
        })

        this.renderAll(personDetail.entityProperty,personDetail.keyValueMap,showItemsCount);


    }

    onTabChanged(tab) {
        let activedTabs = this.state.activedTabs;
        if (!_.contains(activedTabs, tab)) {
            activedTabs.push(tab);
        }
        this.setState({
            currentTab: tab,
            activedTabs:activedTabs
        });
        if(tab=='behavior'){
            $('#profile-tab-container').css({
                'overflow-y':'hidden',
                'overflow-x':'hidden',
            })
        }
    }

    renderPerson(personDetail){
        if (!personDetail) {
            return;
        }

        _.each(personDetail.personProperty , (item)=>{
            _.each(item.children, function(item1) {
                if(item1.valueList){

                    item1['base64jumpType'] = BASE64.encoder('' + item1.jumpType);
                    _.each(item1.valueList, function(item3) {

                        if (!_.isEmpty(item3.source)) {
                            item3.tooltip = _.reduce(item3.source, function(memo, source) {
                                return memo + source.name + "，";
                            }, "数据来源：");
                            item3.tooltip = item3.tooltip.substring(0, item3.tooltip.length - 1);

                            var sourceArray = _.map(item3.source, function(item4) {
                                return item4.typeId;
                            });
                            item3.sourcearray = sourceArray;
                        } else {
                            item3.tooltip = "数据来源：无";
                        }
                        item3.base64value = BASE64.encoder(item3.value);
                    });

                    item1.propertyToggleId = "pro-id-" + propertyItemIndex;
                    propertyItemIndex++;
                    item1.showItemsCount = showItemsCount;

                } else{
                    item1.showItemsCount = showItemsCount;
                }

            });
        })
    }

    renderAll(property, keyValueMap, showItemsCount){

        if (property) {
            //如果需要从第三方系统中获取数据，查看当前结果的keyValueMap中是否包含sfz、passport进行分类
            if (appConfig['pcRequireExternalInfo']) {
                let key =['SFZ','PASSPORT'];

                var sfzMap = _.find(keyValueMap, function(v) {
                    return v.name == 'SFZ';
                });
                var passportMap = _.find(keyValueMap, function(v) {
                    return v.name == 'PASSPORT';
                });

                //keyValueMap中含有sfz，则需查询护照与车辆实体，只含有passport则只需查询护照实体
                if (sfzMap && sfzMap.values.length > 0 && sfzMap.values[0] != '') {
                    processType = RTDEF.PASSPORTANDCAR;
                    entityType = 1;
                    entityIds = sfzMap.values;
                    queryExternalCount.CAR = entityIds.length;
                    queryExternalCount.PASSPORT = entityIds.length;
                } else if (passportMap && passportMap.values.length > 0 && passportMap.values[0] != '') {
                    processType = RTDEF.PASSPORT_ONLY;
                    entityType = 2;
                    entityIds = passportMap.values;
                    queryExternalCount.PASSPORT = entityIds.length;
                }



                let car = {
                    groupName: '车辆信息',
                    type:'entity',
                    children: []
                }

                let port = {
                    groupName: '护照信息',
                    type:'entity',
                    children: []
                }

                property.push(car,port)

                store.dispatch({
                    type: 'GET_CARDETAIL',
                    entityProperty:property
                });

                //根据流程的类型，将原来获取到的护照和车辆信息剥离出来存储在全局对象中
                switch (processType) {
                    case RTDEF.PASSPORTANDCAR:
                        this.queryExternalData(3 , showItemsCount , entityType ,car ,port , property)
                        this.queryExternalData(2 , showItemsCount , entityType ,car ,port , property)
                        break;
                    case RTDEF.PASSPORT_ONLY:
                        this.queryExternalData(3 , showItemsCount , entityType ,car ,port , property)
                    default:
                        break;
                }

            }



        }

    }

    queryExternalData(queryType , showItemsCount , entityType ,car ,port , property){
        _.each(entityIds, function(entityId) {
            $.getJSON('/renlifang/personcore/getExternalInfo', {
                entityId: entityId,
                entityType: entityType,
                queryType: queryType
            }, function(rsp) {
                var data;
                switch (queryType) {
                    case 2:
                        data = car;
                        break;
                    case 3:
                    case 4:
                        data = port;
                        break;
                }

                if (rsp.code == 0) {
                    if (rsp.data.length > 0) {

                        for (var i = 0; i < rsp.data.length; i++) {
                            var d = rsp.data[i]
                            var oldItem = _.find(data.children, function(odc) {
                                return odc.itemKey == d.itemKey;
                            })

                            if (oldItem) {
                                data.children = _.reject(data.children, function(odc) {
                                    return odc.itemKey == d.itemKey;
                                })
                                data.children.push(d)
                                rsp.data.splice(i, 1);
                                i--;
                            } else {
                                data.children.push(d)
                            }
                        }

                    }

                    _.each(property , (item , key)=>{
                        if(item.groupName === data.groupName){
                            item.children = data.children
                        }
                    })

                    store.dispatch({
                        type: 'GET_CARDETAIL',
                        entityProperty:property
                    });

                } else {
                    data.message = '请求失败:'+rsp.message;
                    _.each(property , (item , key)=>{
                        if(item.groupName === data.groupName){
                            item.children = data.children
                        }
                    })

                    store.dispatch({
                        type: 'GET_CARDETAIL',
                        entityProperty:property
                    });

                }


            })
        })


    }

    exportReport() {
        let entityId, entityType;
        entityId = UrlUtil.getEntityId();
        entityType = UrlUtil.getEntityType();
        $.getJSON('/renlifang/personcore/generatedoc', {
            entityid: entityId,
            entitytype: entityType ? entityType : 0
        }, function(rsp) {
            if (rsp.code != 0) {
                Notify.show({
                    title: "生成文档失败",
                    message: rsp.message,
                    type: "error"
                });
                return;
            }
            var docURL = rsp.data;
            window.open(docURL);
        });
    }

    render() {
        let {currentTab, activedTabs} = this.state;
        let {personDetail} = this.props;


        // 减去tab-head，及上下内边距。
        let contentHeight = this.props.height ? this.props.height - TAB_HEAD_HEIGHT: null;

        let tabs = [], tabContents = [];
        _.each(tabConfigs, (cfg, index)=>{
            let tabId = "tab—" + cfg.tab;
            let isActive = currentTab == cfg.tab;

            tabs.push(
                <li key={index} className={'' + (isActive ? 'active' : '')}>
                        <a  className='br-n fw600'  onClick={(() => this.onTabChanged(cfg.tab))} href={'#' + tabId}
                            data-toggle="tab" aria-expanded={isActive}>{cfg.label}</a>
                   {/* <div className="profile-tab-shadow" style={{position: 'absolute', top: 0, left: -6, width: 6, height: 7, borderBottom: '7px solid #333',
                        borderLeft: '6px solid transparent'}}></div>*/}
                        <div className="profile-tab-shadow" style={{position: 'absolute', top: 0, right: -6, width: 6, height: 7, borderRight: '6px solid transparent'}}></div>
                </li>
            );

            tabContents.push(
                <div key={index} id={tabId} className={"tab-pane " + (isActive ? 'active' : '')} >
                    {_.contains(activedTabs, cfg.tab) ? this.getTabComponent(cfg.tab, personDetail, contentHeight) : ''}
                </div>
            );
        });

        return <div className="panel mbn" style={{background: 'transparent', height: '100%', boxShadow: '0 3px 6px 0 rgba(0, 0, 0, 0.5)'}}>
            <button type="button" className="btn-export-report btn btn-primary fs12 p5"
                    style={{marginRight: 7}} onClick={()=>this.exportReport()}>导出报告</button>
                <div className="profile-tab-head panel-heading" style={{height: TAB_HEAD_HEIGHT, lineHeight: TAB_HEAD_HEIGHT + 'px'}}>
                    <ul className="nav panel-tabs panel-tabs-left" style={{backgroundColor: 'white'}}>
                        {tabs}
                    </ul>
                </div>
            <div className={"panel-body prn profile-tab-body br-n pn"} style={{height: contentHeight}}>
                <div className="tab-content pn br-n ">
                    {contentHeight ? tabContents : ''}
                </div>
            </div>
        </div>
    }

    getTabComponent(tab, personDetail, height) {
        switch (tab) {
            case 'basic':
                return <BasicInfoTab height={height} personDetail={personDetail} />;
            case 'entity':
                return <EntityAttrTab height={height} personDetail={personDetail} />;
            case 'relation':
                return <RelationAnalysisTab height={height} state={this.state} personDetail={personDetail} />;

             case 'behavior':
                 return <BehaviorDataTab height={height} width={this.props.width}  personDetail={personDetail} />;
            // case 'behavior':
            //     return <BehaviorDataTab height={height} width={this.props.width}  personDetail={personDetail} />;
            case 'activities':
                // return <ActivitesTrackTab  height={height} width={this.props.width} personDetail={personDetail}/>;
                return <BehaviorTrackTab  height={height} width={this.props.width} personDetail={personDetail}/>;
            case 'trails':
                return <TrailsMonitorTab height={height}/>
        }
    }
}