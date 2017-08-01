import React from 'react';
require('../../module/renlifang/styles.less');


import ScrollspyPanel from './scrollspy-panel';

const Notify = require('nova-notify');

var RTDEF = {
    'DEFAULT': 0, //两者都没有
    'PASSPORTANDCAR': 1, //有SFZ
    'PASSPORT_ONLY': 2 //无SFZ有PASSPORT
}
var processType = RTDEF.DEFAULT;
var showItemsCount = 3;
var propertyItemIndex = 0;




export default class EntityAttrTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            personDetail : this.props.personDetail,
            newMap:[]
        }
    }

    componentDidMount() {




    }

    renderEntity(property,showItemsCount){
       let propertys= _.each(property , (item)=>{
           item.type="entity";
            _.each(item.children, function(item1) {
                _.each(item1.properties, function(item2) {
                    item2['base64jumpType'] = BASE64.encoder('' + item2.jumpType);
                    _.each(item2.valueList, function(item3) {
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

                    item2.propertyToggleId = "pro-id-" + propertyItemIndex;
                    propertyItemIndex++;
                    item2.showItemsCount = showItemsCount;
                });
            });
        })

        return propertys;

    }



    render() {
        let personDetail = this.state.personDetail;

        this.renderEntity(this.state.personDetail.entityProperty,showItemsCount)

        return (
            <ScrollspyPanel id={'entity-attr'} personDetail={personDetail}  height={this.props.height} infoData={personDetail.entityProperty}
                             />
        )
    }
}