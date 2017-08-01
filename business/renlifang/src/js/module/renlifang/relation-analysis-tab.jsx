import React from 'react';
import RelationQQ from '../../module/renlifang/analysis-tab/relation-qq';
import RelationSocial from '../../module/renlifang/analysis-tab/relation-social';
import PhoneLink from '../../module/renlifang/analysis-tab/phone-link';
import RelationCompany from '../../module/renlifang/analysis-tab/relation-company';
import RelationTickets from '../../module/renlifang/analysis-tab/relation-tickets';
import RelationAddress from '../../module/renlifang/analysis-tab/relation-address';
import RelationOrganize from '../../module/renlifang/analysis-tab/relation-organize';
import RelationEvent from '../../module/renlifang/analysis-tab/relation-event';
import RelationFamily from '../../module/renlifang/analysis-tab/relation-family';
import AnalysisPanel from '../../../../../relationanalysis/src/js/pages/groupanalysis/analysis';

export default class RelationAnalysisTab extends React.Component {
    constructor(props) {
        super(props);

    }
    componentWillMount() {

    }
    componentDidMount() {
        $("#relationSummary #cohesion .flex-item .p5>button:first").hide();
    }


    render() {
        let tabId = this.props.tab || 1;
        let valueState = this.props.state;

        // if (!_.isEmpty(myQQ)) {
        //         return {
        //             url: "/renlifang/personcore/getqq",
        //             data: {
        //                 qq: myQQ
        //             }
        //         }
        // }
        // if (!_.isEmpty(myQQ.values)) {
        //         qqtomobilelist.qq = myQQ.values;
        // } else {
        //     qqtomobilelist.qq = [];
        // }
        // if (!_.isEmpty(myPhone.values)) {
        //     qqtomobilelist.mobile = myPhone.values;
        //     myPhone = myPhone.values;
        // } else {
        //     qqtomobilelist.mobile = [];
        // }
        let infoData = [{
            key: 'relationSummary',
            groupName: '关系总览',
            class:'fa fa-line-chart'
        },
        {
            key: 'phoneLink',
            groupName: '电话通联',
            class:'fa fa-phone'
        },
        {
            key: 'socialRelation',
            groupName: '通讯录',
            class:'fa fa-link'
        },
        {
            key: 'relationQQ',
            groupName: 'QQ',
            class:'fa fa-qq'
        },
        {
            key: 'relationCompany',
            groupName: '同行人',
            class:'fa fa-train'
        },
        {
            key: 'relationTickets',
            groupName: '同订票',
            class:'fa fa-ticket'
        },
        {
            key: 'relationAddress',
            groupName: '同地址',
            class:'fa fa-flag'
        },
        {
            key: 'relationFamily',
            groupName: '家庭成员',
            class:'fa fa-child'
        },
        {
            key: 'relationOrganize',
            groupName: '同组织',
            class:'fa fa-user-plus'
        },
        {
            key: 'relationEvent',
            groupName: '同事件',
            class:'fa fa-server'
        }];

        if (!window.__CONF__.business.renlifang.requireNewDataSource) {
            infoData.splice(8,2);
        }

        let height = this.props.height;

        let tabs = [] , tabContents = [];

        _.each(infoData, (cfg, index)=>{
            let isActive = index == 0;
            tabs.push(
                <li className={isActive  ? 'active' : ''}>
                    <a href={'#'+cfg.key}  data-toggle="tab" aria-expanded={isActive}>
                        <i className={cfg.class+" text-purple pr5"}></i>
                        {cfg.groupName}
                    </a>
                </li>
            );
            tabContents.push(
                <div id={cfg.key} className={"tab-pane"+(isActive ? ' active' : '')} style={{height:"100%"}}>
                    {this.getRelationComponent(cfg.key,valueState.qqtomobilelist ,valueState.myCert,valueState.myPassport,valueState.myQQ,valueState.organizeData )}
                </div>
            );
        });

        return (
            <div className="tab-block p20 pln" style={{overflow:'auto' }}>
                <ul className="nav tabs-left tabs-border relationUl">
                    {tabs}
                </ul>
                <div className="tab-content relationTab" style={{height:height - 40}}>
                    {tabContents}
                </div>
            </div>
        )
    }

    getRelationComponent(key , qqtomobilelist ,myCert,myPassport,myQQ, organizeData) {
        switch (key) {
            case 'relationSummary':
                return <AnalysisPanel />;
            case 'relationQQ':
                return <RelationQQ myQQ={myQQ}/>;
            case 'socialRelation':
                return  <RelationSocial  qqtomobilelist={qqtomobilelist}/>;
            case 'phoneLink':
                return <PhoneLink qqtomobilelist={qqtomobilelist}/>;
            case 'relationCompany':
                return <RelationCompany myCert={myCert} myPassport={myPassport}/>;
            case 'relationTickets':
                return <RelationTickets myCert={myCert} myPassport={myPassport}/>;
            case 'relationAddress':
                return <RelationAddress myCert={myCert}/>;
            case 'relationFamily':
                return <RelationFamily myCert={myCert}/>;
            case 'relationOrganize':
                return <RelationOrganize organizeData={organizeData} myCert={myCert}/>;
            case 'relationEvent':
                return <RelationEvent myCert={myCert}/>;
        }
    }

}
