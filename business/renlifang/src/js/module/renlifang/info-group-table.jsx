import React from 'react';

import AttachmentView from './attachment-view';
import ActionDataTab from './tpl-action';
import EntitlyInfo from './tpl-entitly-info';
import Experience from './tpl-experience';
import BasicInfo from './tpl-basic-info';
import EntityGraphic from './tpl-entity-graphic';
import {getIconCls} from '../../module/renlifang/profile-icons';

import appConfig from '../../../../config'
import {store} from '../../module/renlifang/store';
import {Spin} from 'antd';

const actionTypes = {
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
};

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

let car = {
    groupName: '车辆信息',
    children: []
}

let port = {
    groupName: '护照信息',
    children: []
}

export default class InfoGroupTable extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            personDetail : this.props.personDetail,
            infoGroup : this.props.infoGroup,
            spin:false,
            spinKey:''

        }
    }

    componentDidMount() {

    }

    render() {
        let infoGroup = this.state.infoGroup;
        let totalIndex = 1;

        return (
            <div>
                {
                    !_.isEmpty(infoGroup.children) ? (
                        this.createTableBody( infoGroup )
                    ):(
                        <div className='text-center col-md-12 p20' >
                            {infoGroup.message ? infoGroup.message : '暂无数据'}
                        </div>
                    )
                }
            </div>
        )
    }

    createTableBody( infoGroup) {
        if (infoGroup.groupName === '附件信息') {
            return(  <AttachmentView info={infoGroup.children} /> )
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
        if (infoGroup.groupName === '个人履历' || infoGroup.groupName === '参与事件') {
            return(<Experience  infoGroup={infoGroup} />)
        }
        if (infoGroup.groupName === '社会组织') {
            return(<ActionDataTab  infoGroup={infoGroup} />)
        }


    }
}