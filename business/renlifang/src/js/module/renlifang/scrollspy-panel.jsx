import React from 'react';
import {getIconCls} from '../../module/renlifang/profile-icons';
import appConfig from '../../../../config'
import {store} from '../../module/renlifang/store';
import {Spin} from 'antd';


import AttachmentView from './attachment-view';
import ActionDataTab from './tpl-action';
import EntitlyInfo from './tpl-entitly-info';
import Experience from './tpl-experience';
import BasicInfo from './tpl-basic-info';
import EntityGraphic from './tpl-entity-graphic';


var actionTypes = {
    1: {
        name: '火车',
        class: 'fa fa-train',
        color: '#EC952E'
    },
    2: {
        name: '飞机',
        class: 'fa fa-plane',
        color: '#4BC87F'
    }
}

const ROW_HEIGHT = 38;



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

export default class ScrollspyPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            personDetail : this.props.personDetail,
            spin:false,
            spinKey:'',
            scrolkey:0

        }
    }

    componentDidUpdate() {

    }

    componentDidMount() {

        //滚动监听

        let {infoData, id, renderPanel , height} = this.props;


        let panelHeight=$('#' + this.panelId).offset().top + $('#' + this.panelId).height();
        let that = this;

        _.each(infoData , (item , key)=>{

            let scrollId = '#'+id+ '-spy-' + (key+1);
            let lastId = '#'+id+ '-spy-' + (infoData.length)

            $('#' + this.panelId).on('scroll', function() {

                let lastHieght = parseInt(panelHeight- $(lastId).offset().top);

                let bottom = $(scrollId).offset().top + $(scrollId).height();
                if($(scrollId).offset().top <=116 && (bottom >= $(scrollId).height())&& Math.abs(bottom) == bottom ){

                    that.setState({
                        scrolkey : key
                    })
                }
                else if($(lastId).height()+21 === lastHieght){
                    //21=paddingBottom+border
                    that.setState({
                        scrolkey : infoData.length-1
                    })
                }

            });

        })

    }

    renderAll(property, keyValueMap, showItemsCount , item ){


        let queryType = item.groupName === '车辆信息' ? 2 : 3


        this.setState({
            spin:true,
            spinKey:item.groupName
        })

        if (property) {
            //如果需要从第三方系统中获取数据，查看当前结果的keyValueMap中是否包含sfz、passport进行分类
            if (appConfig['pcRequireExternalInfo']) {
                let that = this;

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
                    children: []
                }

                let port = {
                    groupName: '护照信息',
                    children: []
                }
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
                                    var d = rsp.data[i];
                                    var oldItem = _.find(data.children, function(odc) {
                                        return odc.itemKey == d.itemKey;
                                    })

                                    if (oldItem) {
                                        data.children = _.reject(data.children, function(odc) {
                                            return odc.itemKey == d.itemKey;
                                        })
                                        data.children.push(d);
                                        rsp.data.splice(i, 1);
                                        i--;
                                    } else {
                                        data.children.push(d)
                                    }
                                }

                            } else {
                                data = data
                            }

                            store.dispatch({
                                type: 'REFRESH_CARDETAIL',
                                newData:data
                            });


                            that.setState({
                                spin:false,
                                spinKey:item.groupName
                            })


                        } else {
                            data.message = '请求失败:'+rsp.message;

                            store.dispatch({
                                type: 'REFRESH_CARDETAIL',
                                newData:data
                            });

                            that.setState({
                                spin:false,
                                spinKey:item.groupName
                            })
                        }

                    })
                })

            }

        }


    }

    render() {
        let {infoData, id, renderPanel , height} = this.props;
        let panelId = id + '-scroll-panel';
        this.panelId = panelId;
        let groupId = id + '-infogroup';
        this.groupId = groupId;


        return (
            <div className="p20 pln">
                <div id={panelId} className="tiny-scroller content" style={{height:height - 40,  overflow:'auto', position:'relative'}} >
                    <div id={groupId} className={"row tab-block mn flex-layout " + groupId}>
                        <div className="scroll-ul pn" style={{width:118}}>
                            <ul className="ul-scrollspy nav tabs-left tabs-border" style={{ position: 'fixed',zIndex:10, marginLeft: 12}}>
                                {this.getNaviPills(id, infoData)}
                            </ul>
                        </div>

                        <div className="tab-content flex-item profile-tab-panels" style={{padding: 20, zIndex:0 ,paddingTop:0}}>
                            {this.getScrollPanels(id, infoData, renderPanel)}
                        </div>

                    </div>
                </div>
            </div>
        )
    }

    createTableBody( infoGroup) {
        if (infoGroup.groupName === '附件信息') {
            return( <AttachmentView info={infoGroup.children} /> )
        }

        if (infoGroup.groupName === '实体拓扑') {
            return(  <EntityGraphic infoGroup={infoGroup} /> )
        }

        if (infoGroup.groupName === '概要信息') {
            return(  <BasicInfo infoGroup={infoGroup} /> )
        }
        if (infoGroup.type === 'entity') {
            return(  <EntitlyInfo infoGroup={infoGroup} personDetail={this.props.personDetail}/> )
        }
        if (infoGroup.groupName === '个人履历' ) {
            return(<Experience  infoGroup={infoGroup} />)
        }
        if(infoGroup.groupName === '参与事件'){
            return(<Experience  infoGroup={infoGroup} />)
        }
        if (infoGroup.groupName === '社会组织') {
            return(<ActionDataTab  infoGroup={infoGroup} />)
        }


    }

    getNaviPills(id, infoData) {
        return _.map(infoData , (item , key) => {
            return (
                <li key={key} style={{minWidth:100}} className={"scroll-li" + (key == this.state.scrolkey ? ' active ':'')}>
                    <a href={'#' + this.makeSpyId(key, id)}>
                        <i className={'pr5 ' + getIconCls(item.groupName)}></i>
                        {item.groupName}
                    </a>
                </li>
            )
        })
    }

    getScrollPanels(id, infoData, renderPanel) {

        return _.map(infoData , (item , key) => {
            return (

                <div style={{paddingTop:key == 0 ? 20 : 0 , height:'auto'}} key={key} id={this.makeSpyId(key, id)} >

                    <div className="panel panelStyle">
                        <div className="panel-heading info-group-table-header" style={{position:'relative'}}>
                        <span className="panel-title" style={{color: '#777'}}>
                            <span className={getIconCls(item.groupName)} ></span>
                            {item.groupName}
                        </span>
                            {
                                (item.groupName === '车辆信息' || item.groupName === '护照信息')&&(
                                    <span onClick={this.renderAll.bind(this , this.state.personDetail.entityProperty , this.state.personDetail.keyValueMap , showItemsCount , item)} className=" btn btn-xs btn-success" style={{position:'absolute',top:15,right:20}}>
                                    <i className= 'fa fa-refresh '></i>
                                </span>
                                )

                            }

                        </div>

                        <div className="panel-body pn" >
                            <div className="bs-component" style={{border:'1px solid #ddd'}}>
                                <Spin spinning={this.state.spinKey === item.groupName ? this.state.spin : false }>
                                        {
                                            !_.isEmpty(item.children) ? (
                                                this.createTableBody(item)
                                            ):(
                                                <div className='text-center col-md-12 p20' >
                                                    {item.message ? item.message : '暂无数据'}
                                                </div>
                                            )
                                        }
                                </Spin>

                            </div>
                        </div>




                    </div>



                </div>


            )
        })
    }

    makeSpyId(index, group) {
        return group + '-spy-' + (index + 1);
    }
}