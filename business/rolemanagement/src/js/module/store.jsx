var Redux = require('redux');

const height = ($(window).height() - 40)


const defaultState = {
    height: height,
    tabsIcon: [{
        name: '权限管理',
        isActive: true
    }, {
        name: '角色管理',
        isActive: false
    }],
    isShowRootTabs: true,
    listallData: [],
    listRoleDetail: {
        isOpen: false
    },
    roleDetailShow:false,
    userRoleData: [],
    activeKeys: [],
    tabActiveKey: null,
    handleAuthorityData: [],
    handleCheckData: [],
    handleNotData: [],
    dataAuthorityData: [],
    dataCheckData: [],
    dataNotData: [],
    departmentAuthorityData: [],
    departmentCheckData: [],
    departmentNotData: [],
    systemAuthorityData: [],
    systemCheckData: [],
    systemNotData: [],
    commandAuthorityData: [],
    commandCheckData: [],
    commandNotData: [],
    commandTableCheckData: [],
    commandTableNotData: [],
    roleUserData: [],
    userExpandedKeys:[],
    userRoleType: null,
    userRoleName: null,
    userRoleDesc: null,
    userRoleIndex: null,
    userRoleMember: null,
    roleEditShow: false,
    roleAddShow: false,
    roleNull: false,
    isLoodData: false,
    isLoodAuth: false,
    isLoodUser: false,
    rootTableListData: [],
    rootDialogOpen: false,
    roleTreeData: [],
    roleRootEditItem: {},
    rootEditType: 1,
    rootCheckedKeys: [],
    rootExpandedKeys: ['dep--1'],
    isUpdata: false
}

function _getRoleTreeDataOrign (data) {
    for (let k = 0; k < data.length; k++) {
        if (data[k].children) {
            data[k].isChecked = false
            for (let n = 0; n < data[k].children.length; n++) {
                data[k].children[n].isChecked = false
            }
        }
    }
    return data
}

function _getListDataRecursion (data, rootTableListData) {
    var rootTableListData = []
    var copyData = JSON.parse(JSON.stringify(data))

    if (data.length > 0) {
        getListDataRecursion(data)
    }
    function getListDataRecursion (data) {
        if (data.length > 0) {
            for (let i = 0, flag = true; i < data.length; flag ? i++ : i) {
                if (data[i].children) {
                    // flag = true
                    getListDataRecursion(data[i].children)
                } else {
                    if (data[i].extraClasses === 'nv-department-people') {
                        // flag = true
                        let userName = data[i].userName
                        let gender = data[i].gender === 0 ? '男' : '女'
                        let departmentName = data[i].departmentPath !== '' ? data[i].departmentPath : ''
                        let departmentId = data[i].departmentId
                        let userId = data[i].userId
                        let roleName = []
                        let key = data[i].key
                        if (typeof data[i].roles !== 'undefined') {
                            let rootRolelist = data[i].roles
                            for (let listIndex = 0; listIndex < rootRolelist.length; listIndex++) {
                                roleName.push({
                                    name: rootRolelist[listIndex].name,
                                    roleType: rootRolelist[listIndex].roleType
                                })
                            }
                        }

                        rootTableListData.push({
                            userName: userName,
                            gender: gender,
                            departmentName: departmentName,
                            departmentId: departmentId,
                            userId: userId,
                            roleName: data[i].roles,
                            isChecked: false,
                            isSelected: false,
                            key: key
                        })
                    }
                    /*if (data[i].extraClasses === 'nv-department') {
                        data.splice(i, 1)
                        flag = false
                    }*/
                }
            }
        }
    }
    return rootTableListData
}

var reducer = function(state = defaultState, action) {
    var newState = {};

    switch(action.type) {
        case 'CHANGE_TABSICON':
            newState.tabsIcon = action.tabsIcon;
            newState.isShowRootTabs = action.isShowRootTabs
            return _.assign({}, state, newState);
        case 'GETLISTALLDATA':
            if (typeof action.allListData !== 'undefined' && action.allListData.isFirstData && action.allListData.listallData.length > 0) {
                var listallData = action.allListData.listallData
                var rootTableListData = []
                rootTableListData = _getListDataRecursion(listallData)

                newState.listallData = listallData
                newState.rootTableListData = rootTableListData
                newState.rootExpandedKeys = listallData.length > 0 ? listallData[0].key : []
            } else {
              newState.listallData = action.listallData  
            }
            return _.assign({}, state, newState)
        case 'USEREOLE_LIST':
            newState.userRoleData = [...action.data];
            return _.assign({}, state, newState);
        case 'USEREXPANDKEY_GET':
            newState.userExpandedKeys = [...action.userExpandedKeys];
            return _.assign({}, state, newState);
        case 'ACTIVEKEYS_GET':
            newState.activeKeys = [...action.activeKeys];
            return _.assign({}, state, newState);
        case 'TABACTIVEKEY_GET':
            newState.tabActiveKey = action.tabActiveKey;
            return _.assign({}, state, newState);
        case 'HANDLEDATA_GET':
            newState.handleAuthorityData = [...action.handleAuthorityData];
            return _.assign({}, state, newState);
        case 'HANDLECHECKDATA_GET':
            newState.handleCheckData = [...action.handleCheckData];
            return _.assign({}, state, newState);
        case 'HANDLENOTDATA_GET':
            newState.handleNotData = [...action.handleNotData];
            return _.assign({}, state, newState);
        case 'DATADATA_GET':
            newState.dataAuthorityData = [...action.dataAuthorityData];
            return _.assign({}, state, newState);
        case 'DATACHECKDATA_GET':
            newState.dataCheckData = [...action.dataCheckData];
            return _.assign({}, state, newState);
        case 'DATANOTDATA_GET':
            newState.dataNotData = [...action.dataNotData];
            return _.assign({}, state, newState);
        case 'DEPARTMENTDATA_GET':
            newState.departmentAuthorityData = [...action.departmentAuthorityData];
            return _.assign({}, state, newState);
        case 'DEPARTMENTCHECKDATA_GET':
            newState.departmentCheckData = [...action.departmentCheckData];
            return _.assign({}, state, newState);
        case 'DEPARTMENTNOTDATA_GET':
            newState.departmentNotData = [...action.departmentNotData];
            return _.assign({}, state, newState);
        case 'SYSTEMDATA_GET':
            newState.systemAuthorityData = [...action.systemAuthorityData];
            return _.assign({}, state, newState);
        case 'SYSTEMCHECKDATA_GET':
            newState.systemCheckData = [...action.systemCheckData];
            return _.assign({}, state, newState);
        case 'SYSTEMNOTDATA_GET':
            newState.systemNotData = [...action.systemNotData];
            return _.assign({}, state, newState);
        case 'COMMONDDATA_GET':
            newState.commandAuthorityData = [...action.commandAuthorityData];
            return _.assign({}, state, newState);
        case 'COMMONDCHECKDATA_GET':
            if(action.commandCheckData.length>0){

            } else{
                newState.commandCheckData = [];
                return _.assign({}, state, newState);
            }
            let dropCheckData = [];
            for(let j=0; j<action.commandCheckData.length; j++){
                for(let i=0; i<state.commandNotData.length; i++){
                    if(state.commandNotData[i].privateId == action.commandCheckData[j].privateId){
                        newState.commandNotData = [
                            ...state.commandNotData.slice(0,i),
                            ...state.commandNotData.slice(i+1)
                        ];

                        dropCheckData = [
                            ...dropCheckData,
                            action.commandCheckData[j]
                        ]
                    }
                }
            }
            if(dropCheckData.length>0){
                for(let i=0; i<dropCheckData.length; i++){
                    for(let j=0; j<action.commandCheckData.length; j++){
                        if(action.commandCheckData[j].privateId == dropCheckData[i].privateId){
                            newState.commandCheckData = [
                                ...state.commandCheckData,
                                ...action.commandCheckData.slice(0,j),
                                ...action.commandCheckData.slice(j+1)
                            ];
                        }
                    }
                }
            } else{
                newState.commandCheckData = [
                    ...state.commandCheckData,
                    ...action.commandCheckData
                ];
            }
            return _.assign({}, state, newState);
        case 'COMMONDNOTDATA_GET':
            if(action.commandNotData.length>0){

            } else{
                newState.commandNotData = [];
                return _.assign({}, state, newState);
            }
            let dropNotData = [];
            for(let j=0; j<action.commandNotData.length; j++){
                for(let i=0; i<state.commandCheckData.length; i++){
                    if(state.commandCheckData[i].privateId == action.commandNotData[j].privateId){
                        newState.commandCheckData = [
                            ...state.commandCheckData.slice(0,i),
                            ...state.commandCheckData.slice(i+1)
                        ];

                        dropNotData = [
                            ...dropNotData,
                            action.commandNotData[j]
                        ]
                    }
                }
            }
            if(dropNotData.length>0){
                for(let i=0; i<dropNotData.length; i++){
                    for(let j=0; j<action.commandNotData.length; j++){
                        if(action.commandNotData[j].privateId == dropNotData[i].privateId){
                            newState.commandNotData = [
                                ...state.commandNotData,
                                ...action.commandNotData.slice(0,j),
                                ...action.commandNotData.slice(j+1)
                            ];
                        }
                    }
                }
            } else{
                newState.commandNotData = [
                    ...state.commandNotData,
                    ...action.commandNotData
                ];
            }
            return _.assign({}, state, newState);
        case 'COMMONDTABLECHECKDATA_GET':
            if(action.commandTableCheckData.length>0){

            } else{
                newState.commandTableCheckData = [];
                return _.assign({}, state, newState);
            }
            let dropTableCheckData = [];
            for(let j=0; j<action.commandTableCheckData.length; j++){
                for(let i=0; i<state.commandTableNotData.length; i++){
                    if(state.commandTableNotData[i].privateId == action.commandTableCheckData[j].privateId
                       && state.commandTableNotData[i].selectedSubPermission[0] == action.commandTableCheckData[j].selectedSubPermission[0]){

                        newState.commandTableNotData = [
                            ...state.commandTableNotData.slice(0,i),
                            ...state.commandTableNotData.slice(i+1)
                        ];

                        dropTableCheckData = [
                            ...dropTableCheckData,
                            action.commandTableCheckData[j]
                        ]
                    }
                }
            }
            if(dropTableCheckData.length>0){
                for(let i=0; i<dropTableCheckData.length; i++){
                    for(let j=0; j<action.commandTableCheckData.length; j++){
                        if(action.commandTableCheckData[j].privateId == dropTableCheckData[i].privateId
                            && action.commandTableCheckData[j].selectedSubPermission[0] == dropTableCheckData[i].selectedSubPermission[0]){

                            newState.commandTableCheckData = [
                                ...state.commandTableCheckData,
                                ...action.commandTableCheckData.slice(0,j),
                                ...action.commandTableCheckData.slice(j+1)
                            ];
                        }
                    }
                }

            } else{
                newState.commandTableCheckData = [
                    ...state.commandTableCheckData,
                    ...action.commandTableCheckData
                ];

            }
            return _.assign({}, state, newState);
        case 'COMMONDTABLENOTDATA_GET':
            if(action.commandTableNotData.length>0){

            } else{
                newState.commandTableNotData = [];
                return _.assign({}, state, newState);
            }
            let dropTableNotData = [];
            for(let j=0; j<action.commandTableNotData.length; j++){
                for(let i=0; i<state.commandTableCheckData.length; i++){
                    if(state.commandTableCheckData[i].privateId == action.commandTableNotData[j].privateId
                       && state.commandTableCheckData[i].selectedSubPermission[0] == action.commandTableNotData[j].selectedSubPermission[0]){

                        newState.commandTableCheckData = [
                            ...state.commandTableCheckData.slice(0,i),
                            ...state.commandTableCheckData.slice(i+1)
                        ];

                        dropTableNotData = [
                            ...dropTableNotData,
                            action.commandTableNotData[j]
                        ];
                    }
                }
            }
            if(dropTableNotData.length>0){
                for(let i=0; i<dropTableNotData.length; i++){
                    for(let j=0; j<action.commandTableNotData.length; j++){
                        if(action.commandTableNotData[j].privateId == dropTableNotData[i].privateId
                            && action.commandTableNotData[j].selectedSubPermission[0] == dropTableNotData[i].selectedSubPermission[0]){
                            newState.commandNotData = [
                                ...state.commandTableNotData,
                                ...action.commandTableNotData.slice(0,j),
                                ...action.commandTableNotData.slice(j+1)
                            ];
                        }
                    }
                }

            } else{

                newState.commandTableNotData = [
                    ...state.commandTableNotData,
                    ...action.commandTableNotData
                ];
            }
            return _.assign({}, state, newState);
        case 'ROLEUSER_LIST':
            newState.roleUserData = [...action.roleUserData];
            return _.assign({}, state, newState);
        case 'USEREOLE_TYPE':
            newState.userRoleType = action.userRoleType;
            return _.assign({}, state, newState);
        case 'USEREOLE_NAME':
            newState.userRoleName = action.userRoleName;
            return _.assign({}, state, newState);
        case 'USEREOLE_DESC':
            newState.userRoleDesc = action.userRoleDesc;
            return _.assign({}, state, newState);
        case 'USEREOLE_INDEX':
            newState.userRoleIndex = action.userRoleIndex;
            return _.assign({}, state, newState);
        case 'USEREOLE_MEMBER':
            newState.userRoleMember = action.userRoleMember;
            return _.assign({}, state, newState);
        case 'USEREOLE_EDIT':
            newState.roleEditShow = action.roleEditShow;
            return _.assign({}, state, newState);
        case 'USEREOLE_ADD':
            newState.roleAddShow = action.roleAddShow;
            return _.assign({}, state, newState);
        case 'USEREOLE_INIT':
            newState.roleNull = action.roleNull;
            return _.assign({}, state, newState);
        case 'LOODDATA_GET':
            newState.isLoodData = action.isLoodData;
            return _.assign({}, state, newState);
        case 'LOODAUTH_GET':
            newState.isLoodAuth = action.isLoodAuth;
            return _.assign({}, state, newState);
        case 'LOODUSER_GET':
            newState.isLoodUser = action.isLoodUser;
            return _.assign({}, state, newState);
        case 'GETLISTROLEDETAIL':
            newState.listRoleDetail = action.listRoleDetail;
            return _.assign({}, state, newState);
        case 'ROLEDETAIL_GET':
            newState.roleDetailShow = action.roleDetailShow;
            return _.assign({}, state, newState);
        case 'GETROOTTABLEDATA':
            newState.rootTableListData = action.rootTableListData;
            if (typeof action.rootCheckedKeys !== 'undefined') {
                newState.rootCheckedKeys = action.rootCheckedKeys
            }
            return _.assign({}, state, newState);
        case 'CHANGE_ROOTDIALOG_OPEN':
            newState.rootDialogOpen = action.rootDialogOpen;
            if (typeof action.editItem !== undefined && action.editItem.isEdit) {
                newState.roleRootEditItem = action.editItem.data
                newState.rootEditType = action.editItem.editType
            }
            if (typeof action.restoreRoleTreeData !== 'undefined') {
                newState.roleTreeData = _getRoleTreeDataOrign(action.restoreRoleTreeData)
            }
            
            return _.assign({}, state, newState);
        case 'GETROLETREEDATA':
            newState.roleTreeData = action.roleTreeData;
            return _.assign({}, state, newState);
        case 'ROOTEDITITEMLIST':
            newState.roleRootEditItem = action.roleRootEditItem;
            return _.assign({}, state, newState);
        case 'CHANGE_ROOTEDITTYPE':
            newState.rootEditType = action.rootEditType;
            return _.assign({}, state, newState);
        case 'GETROOTEXPENDKEYS':
            newState.rootExpandedKeys = action.rootExpandedKeys;
            if (typeof action.rootCheckedKeys !== 'undefined') {
                newState.rootCheckedKeys = action.rootCheckedKeys
            }
            return _.assign({}, state, newState);
        case 'ISUPDATA':
            newState.isUpdata = action.isUpdata
            return _.assign({}, state, newState)
        default:
            return state;
    }
};


var store = Redux.createStore(reducer);

export {store};