var Redux = require('redux');
import getKeyValueMap from './getKeyValueMap';
const Notify = require('nova-notify');

const defaultState = {
    summaryOpen: true,
    personDetail:{

    },
    socialData:{

    },
    phoneRelation:{

    },
    companyData:[
    ],
    ticketData:[
    ],
    qqData:[
    ],
    qqgroupDetail:[
    ],
    timeLine:[
    ],
    summary:[

    ],
    phoneInfoTableData:[

    ],
    addressData:[

    ],

    eventData:[

    ],
    organizeData:[

    ],
    familyData:[

    ],
    eventID:" ",
    serviceCode:"",

};

var reducer = function(state = defaultState, action) {
    switch(action.type) {
        case 'OPEN_SUMMARY': {
            $(window).trigger('resize')
            return _.assign({}, state, { summaryOpen: action.summaryOpen});
        }
        case 'GET_PEROSONDETAIL': {
            let personDetail = state.personDetail;
            personDetail = action.personDetail;
            _.each(personDetail.personProperty , (item , key)=>{
                if(item.groupName === '个人履历' || item.groupName === '参与事件' ){

                    _.each(item.children , (child , key)=>{
                        child.otherProperties = child.properties;
                        delete child.properties;
                    })

                }

                if(item.groupName === '社会组织'){
                    _.each(item.children , (child , key)=>{
                        child.group = child.properties;
                        delete child.properties;
                    })

                }
            } );


            return _.assign({}, state, { personDetail: personDetail });
        }
        case 'GET_SERVICECODE': {

            return _.assign({}, state, { serviceCode: action.serviceCode });
        }


        case 'GET_INFODETAIL': {
            let personDetail = state.personDetail;

            return _.assign({}, state, { personDetail: personDetail });
        }

        case 'GET_CARDETAIL': {
            let personDetail = state.personDetail;

            personDetail.entityProperty = action.entityProperty;



            return _.assign({}, state, { personDetail: personDetail });
        }
        case 'REFRESH_CARDETAIL': {
            let personDetail = state.personDetail;

            _.each(personDetail.entityProperty , (item , key)=>{
                if(item.groupName === action.newData.groupName){
                    item.children = action.newData.children
                }
            })

            return _.assign({}, state, { personDetail: personDetail });
        }
        case 'SIZE_UPDATE': {
            let height = action.profileTabHeight;
            let width = action.profileTabWidth;
            return _.assign({}, state, { profileTabHeight: height, profileTabWidth: width});
        }
        case 'GET_SOCIALDATA': {
            let socialData = state.socialData;
            socialData = action.socialData;
            return _.assign({}, state, { socialData: socialData });
        }
        case 'GET_PHONERELATION': {
            let phoneRelation = state.phoneRelation;
            phoneRelation = action.phoneRelation;
            return _.assign({}, state, { phoneRelation: phoneRelation });
        }
        case 'GET_COMPANYDATA': {
            let companyData = state.companyData;
            companyData = action.companyData;
            return _.assign({}, state, { companyData: companyData });
        }
        case 'GET_TICKETDATA': {
            let ticketData = state.getJSON;
            ticketData = action.ticketData;
            return _.assign({}, state, { ticketData: ticketData });
        }
        case 'GET_QQDATA': {
            let qqData = state.qqData;
            qqData = action.qqData;
            return _.assign({}, state, { qqData: qqData });
        }
        case 'GET_QQGROUPDETAIL': {
            let qqgroupDetail = state.qqgroupDetail;
            qqgroupDetail = action.qqgroupDetail;
            return _.assign({}, state, { qqgroupDetail: qqgroupDetail });
        }
        case 'GET_TIMELINE': {
            let timeLine = state.timeLine;
            timeLine = action.timeLine;
            return _.assign({}, state, { timeLine: timeLine });
        }
        case 'GET_SUMMARY': {
            let summary = state.summary;
            summary = action.summary;
            return _.assign({}, state, { summary: summary });
        }
        case 'GET_PHONEINFOTABLEDATA': {
            let phoneInfoTableData = state.phoneInfoTableData;
            phoneInfoTableData = action.phoneInfoTableData;
            return _.assign({}, state, { phoneInfoTableData: phoneInfoTableData });
        }
        case 'GET_ADDRESSDATA': {
            let addressData = state.addressData;
            addressData = action.addressData;
            return _.assign({}, state, { addressData: addressData });
        }
        case 'GET_EVENTDATA': {
            let eventData = state.eventData;
            eventData = action.eventData;
            return _.assign({}, state, { eventData: eventData });
        }
        case 'GET_ORGANIZEDATA': {
            let organizeData = state.organizeData;
            organizeData = action.organizeData;
            return _.assign({}, state, { organizeData: organizeData });
        }
        case 'GET_EVENTID': {
            let eventID = state.eventID;
            eventID = action.eventID;
            return _.assign({}, state, { eventID: eventID });
        }
        case 'SHOW_FULL_IMAGE': {
            return _.assign({}, state, {
                fullImageOpt: {
                    images: action.images,
                    currentImage: action.currentImage
                }
            });
        }
        case 'CLOSE_FULL_IMAGE': {
            return _.assign({}, state, {
                fullImageOpt: undefined
            });
        }
        default:
            return state;
    }
};


var store = Redux.createStore(reducer);

export {store};