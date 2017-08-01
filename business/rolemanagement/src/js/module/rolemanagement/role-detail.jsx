import React from 'react';
import {render} from 'react-dom';
import {store} from '../store';
import Notify from 'nova-notify';
import AllroleManagement from './role';
import ManagementAuthority from './managementauthority';
import RoleallUser from './user'

class RolemanagementDetail extends React.Component {

    constructor(props) {
        super(props);

    }


    getAuthorityTypes(roleType) {

        let Config = window.__CONF__.config;
        let spyIntegrationAuthable = Config['spyIntegrationAuthable'];

        let sysConfig = window.__CONF__.config_system;

        switch (roleType) {
            case 0:
                if (sysConfig.is_oversea) {
                    return [0];
                } else {
                    if (spyIntegrationAuthable == 2) {
                        return [0, 8];
                    } else if (spyIntegrationAuthable == 1) {
                        return [0, 1, 5, 8];
                    } else {
                        return [0, 1, 5];
                    }
                }
                break;
            case 2:
                if (sysConfig.is_oversea) {
                    return [0, 2];
                } else {
                    if (spyIntegrationAuthable == 2) {
                        return [0, 8];
                    } else if (spyIntegrationAuthable == 1) {
                        return [0, 1, 2, 5, 8];
                    } else {
                        return [0, 1, 2, 5];
                    }
                }
                break;
            case 1:
            case 3:
                return [2];
                break;
        }
    }


    getAuthorityData(roleId,roleType,roleName){
        const authArr = this.getAuthorityTypes(roleType);
        store.dispatch({type:'TABACTIVEKEY_GET',tabActiveKey:authArr[0]});

        for(let i=0; i<authArr.length;i++){
            if(authArr[i]==0){
                $.getJSON("/userrole/roledetail", {
                    roleId: roleId,
                    resourceType: 0,
                    roleType:roleType
                }, function(res) {
                    if(res.code==0){
                        store.dispatch({type:'HANDLEDATA_GET',handleAuthorityData:res.data});
                        let checkedData = [];
                        let notData = [];
                        const getCheckedKeys = data => data.forEach((item) => {
                            if(item.selected){
                                let node = {
                                    roleId: parseInt(roleId),
                                    roleName: roleName,
                                    privateId: item.key,
                                    privateName: item.name,
                                    isDir: parseInt(item.isDir),
                                    type: parseInt(item.resourceType),
                                    selectedSubPermission: item.selectedSubPermission
                                }
                                checkedData.push(node)
                            }
                            if(item.children && item.children.length>0){
                                getCheckedKeys(item.children);
                            }
                        });

                        const getNotKeys = data => data.forEach((item) => {
                            if(!(item.selected)){
                                let node = {
                                    roleId: parseInt(roleId),
                                    roleName: roleName,
                                    privateId: item.key,
                                    privateName: item.name,
                                    isDir: parseInt(item.isDir),
                                    type: parseInt(item.resourceType),
                                    selectedSubPermission: item.selectedSubPermission
                                }
                                notData.push(node)
                            }
                            if(item.children && item.children.length>0){
                                getNotKeys(item.children);
                            }
                        });

                        getCheckedKeys(res.data);
                        getNotKeys(res.data);
                        store.dispatch({type:'HANDLECHECKDATA_GET',handleCheckData:checkedData});
                        store.dispatch({type:'HANDLENOTDATA_GET',handleNotData:notData});
                        store.dispatch({type:'LOODAUTH_GET',isLoodAuth:true});
                    }
                })
            }
            if(authArr[i]==1){
                $.getJSON("/userrole/roledetail", {
                    roleId: roleId,
                    resourceType: 1,
                    roleType:roleType
                }, function(res) {
                    if(res.code==0){
                        store.dispatch({type:'DATADATA_GET',dataAuthorityData:res.data});
                        let checkedData = [];
                        let notData = [];
                        const getCheckedKeys = data => data.forEach((item) => {
                            if(item.selected){
                                let node = {
                                    roleId: parseInt(roleId),
                                    roleName: roleName,
                                    privateId: item.key,
                                    privateName: item.name,
                                    isDir: parseInt(item.isDir),
                                    type: parseInt(item.resourceType),
                                    selectedSubPermission: item.selectedSubPermission
                                }
                                checkedData.push(node)
                            }
                            if(item.children && item.children.length>0){
                                getCheckedKeys(item.children);
                            }
                        });

                        const getNotKeys = data => data.forEach((item) => {
                            if(!(item.selected)){
                                let node = {
                                    roleId: parseInt(roleId),
                                    roleName: roleName,
                                    privateId: item.key,
                                    privateName: item.name,
                                    isDir: parseInt(item.isDir),
                                    type: parseInt(item.resourceType),
                                    selectedSubPermission: item.selectedSubPermission
                                }
                                notData.push(node)
                            }
                            if(item.children && item.children.length>0){
                                getNotKeys(item.children);
                            }
                        });

                        getCheckedKeys(res.data);
                        getNotKeys(res.data);
                        store.dispatch({type:'DATACHECKDATA_GET',dataCheckData:checkedData});
                        store.dispatch({type:'DATANOTDATA_GET',dataNotData:notData});
                    }
                })
            }
            if(authArr[i]==2){
                $.getJSON("/userrole/roledetail", {
                    roleId: roleId,
                    resourceType: 2,
                    roleType:roleType
                }, function(res) {
                    if(res.code==0){
                        store.dispatch({type:'DEPARTMENTDATA_GET',departmentAuthorityData:res.data});
                        let checkedData = [];
                        let notData = [];
                        const getCheckedKeys = data => data.forEach((item) => {
                            if(item.selected){
                                let node = {
                                    roleId: parseInt(roleId),
                                    roleName: roleName,
                                    privateId: item.key,
                                    privateName: item.name,
                                    isDir: parseInt(item.isDir),
                                    type: parseInt(item.resourceType),
                                    selectedSubPermission: item.selectedSubPermission
                                }
                                checkedData.push(node)
                            }
                            if(item.children && item.children.length>0){
                                getCheckedKeys(item.children);
                            }
                        });

                        const getNotKeys = data => data.forEach((item) => {
                            if(!(item.selected)){
                                let node = {
                                    roleId: parseInt(roleId),
                                    roleName: roleName,
                                    privateId: item.key,
                                    privateName: item.name,
                                    isDir: parseInt(item.isDir),
                                    type: parseInt(item.resourceType),
                                    selectedSubPermission: item.selectedSubPermission
                                }
                                notData.push(node)
                            }
                            if(item.children && item.children.length>0){
                                getNotKeys(item.children);
                            }
                        });

                        getCheckedKeys(res.data);
                        getNotKeys(res.data);
                        store.dispatch({type:'DEPARTMENTCHECKDATA_GET',departmentCheckData:checkedData});
                        store.dispatch({type:'DEPARTMENTNOTDATA_GET',departmentNotData:notData});
                        store.dispatch({type:'LOODAUTH_GET',isLoodAuth:true});
                    }
                })
            }
            if(authArr[i]==5){
                $.getJSON("/userrole/roledetail", {
                    roleId: roleId,
                    resourceType: 5,
                    roleType:roleType
                }, function(res) {
                    if(res.code==0){
                        store.dispatch({type:'SYSTEMDATA_GET',systemAuthorityData:res.data});
                        let checkedData = [];
                        let notData = [];
                        const getCheckedKeys = data => data.forEach((item) => {
                            if(item.selected){
                                let node = {
                                    roleId: parseInt(roleId),
                                    roleName: roleName,
                                    privateId: item.key,
                                    privateName: item.name,
                                    isDir: parseInt(item.isDir),
                                    type: parseInt(item.resourceType),
                                    selectedSubPermission: item.selectedSubPermission
                                }
                                checkedData.push(node)
                            }
                            if(item.children && item.children.length>0){
                                getCheckedKeys(item.children);
                            }
                        });

                        const getNotKeys = data => data.forEach((item) => {
                            if(!(item.selected)){
                                let node = {
                                    roleId: parseInt(roleId),
                                    roleName: roleName,
                                    privateId: item.key,
                                    privateName: item.name,
                                    isDir: parseInt(item.isDir),
                                    type: parseInt(item.resourceType),
                                    selectedSubPermission: item.selectedSubPermission
                                }
                                notData.push(node)
                            }
                            if(item.children && item.children.length>0){
                                getNotKeys(item.children);
                            }
                        });

                        getCheckedKeys(res.data);
                        getNotKeys(res.data);
                        store.dispatch({type:'SYSTEMCHECKDATA_GET',systemCheckData:checkedData});
                        store.dispatch({type:'SYSTEMNOTDATA_GET',systemNotData:notData});

                    }

                })
            }
            if(authArr[i]==8){
                $.getJSON("/spycommon/getDataAuthResource", {
                    roleId: roleId,
                }, function(res) {
                    if(res.code==0){
                        store.dispatch({type:'COMMONDDATA_GET',commandAuthorityData:res.data});
                    }
                })
            }
        }
    }


    getRoleUser(roleId){
        $.getJSON("/userrole/getUsersOfRole", {
            roleId: roleId,
        }, function(res) {
            if(res.code==0){
                store.dispatch({type:'ROLEUSER_LIST',roleUserData:res.data});
                let expandedKeys = [];
                const getExpandedKeys = data => data.forEach((item) => {
                    expandedKeys = [...expandedKeys, item.key];
                    if(item.children && item.children.length>0){
                        getExpandedKeys(item.children)
                    }
                });
                getExpandedKeys(res.data);
                store.dispatch({type:'USEREXPANDKEY_GET', userExpandedKeys:expandedKeys});
                store.dispatch({type:'LOODUSER_GET',isLoodUser:true});
            }
        })
    }


    getUserroleList(){
        $.get('/userrole/list', res=>{
            if (res.code == 0) {
                store.dispatch({type:'USEREOLE_LIST',data:res.data});
            } else {
                Notify.simpleNotify('错误', res.message, 'error');
            }
        }, 'json');
    }

    getInitData(){
        let that = this;
        let isLood = this.props.isLoodData;
        let detailShow = this.props.roleDetailShow;
        let showData = this.props.listRoleDetail;
        if(detailShow){
            let getRoleType = data => {
                switch (data) {
                    case 0:
                        return "普通角色";
                        break;
                    case 1:
                        return "用户管理员";
                        break;
                    case 2:
                        return "授权管理员";
                        break;
                    case 3:
                        return "日志管理员";
                        break;
                }
            }
            this.getAuthorityData(showData.roleID,showData.roleType,showData.roleName);
            this.getRoleUser(showData.roleID);
            store.dispatch({type:'ACTIVEKEYS_GET',activeKeys:[showData.roleType]});
            store.dispatch({type:'USEREOLE_INDEX',userRoleIndex:showData.roleType});
            store.dispatch({type:'USEREOLE_MEMBER',userRoleMember:showData.roleID});
            store.dispatch({type:'USEREOLE_TYPE',userRoleType:getRoleType(showData.roleType)});
            store.dispatch({type:'USEREOLE_NAME',userRoleName:showData.roleName});
            store.dispatch({type:'USEREOLE_DESC',userRoleDesc:showData.desc});
            store.dispatch({type:'LOODDATA_GET',isLoodData:true});
            return;
        }
        if(!isLood && !detailShow){
            let initData=[];
            $.get('/userrole/list', res=>{
                if (res.code == 0) {
                    initData = _.find(res.data,user => {
                        return   user.children && user.children.length > 0
                    })
                    if(initData != undefined && initData.children && initData.children.length > 0){
                        that.getAuthorityData(initData.children[0].roleID,initData.key,initData.children[0].name);
                        that.getRoleUser(initData.children[0].roleID);
                        store.dispatch({type:'ACTIVEKEYS_GET',activeKeys:[initData.key]});
                        store.dispatch({type:'USEREOLE_INDEX',userRoleIndex:initData.key});
                        store.dispatch({type:'USEREOLE_MEMBER',userRoleMember:initData.children[0].roleID});
                        store.dispatch({type:'USEREOLE_TYPE',userRoleType:initData.title});
                        store.dispatch({type:'USEREOLE_NAME',userRoleName:initData.children[0].name});
                        store.dispatch({type:'USEREOLE_DESC',userRoleDesc:initData.children[0].desc});
                        store.dispatch({type:'LOODDATA_GET',isLoodData:true});
                    } else {
                        store.dispatch({type:'USEREOLE_INIT',roleNull:true});
                    }

                } else {
                    Notify.simpleNotify('错误', res.message, 'error');
                    hideLoader();
                }
            }, 'json');
        }
    }


    componentDidMount() {
        this.getUserroleList();
        this.getInitData();
    }

    componentWillUnmount() {

    }

    render() {
        const {roleUserData,activeKeys, tabActiveKey, userExpandedKeys, isLoodUser} = this.props;
        const {userRoleData, userRoleType, userRoleName, userRoleDesc, roleEditShow, userRoleIndex, userRoleMember, listRoleDetail} = this.props;
        const {handleAuthorityData, dataAuthorityData, departmentAuthorityData, systemAuthorityData, commandAuthorityData } = this.props;
        const {handleCheckData, handleNotData, dataCheckData, dataNotData, departmentCheckData, departmentNotData, systemCheckData, systemNotData, commandCheckData, commandNotData} = this.props;
        const { commandTableCheckData, commandTableNotData, height, isLoodData ,isLoodAuth} = this.props;



        return (
            <div className="role-wrap" style={{height: `${height+40}px`}}>
                {isLoodData?<AllroleManagement
                    height={height}
                    activeKeys={activeKeys}
                    userRoleData={userRoleData}
                    userRoleIndex={userRoleIndex}
                    userRoleMember={userRoleMember}
                />:''}
                {isLoodData?<ManagementAuthority
                    height={height}
                    isLoodAuth={isLoodAuth}
                    tabActiveKey={tabActiveKey}
                    userRoleIndex={userRoleIndex}
                    userRoleMember={userRoleMember}
                    userRoleName={userRoleName}
                    handleAuthorityData={handleAuthorityData}
                    handleCheckData={handleCheckData}
                    handleNotData={handleNotData}
                    dataAuthorityData={dataAuthorityData}
                    dataCheckData={dataCheckData}
                    dataNotData={dataNotData}
                    departmentAuthorityData={departmentAuthorityData}
                    departmentCheckData={departmentCheckData}
                    departmentNotData={departmentNotData}
                    systemAuthorityData={systemAuthorityData}
                    systemCheckData={systemCheckData}
                    systemNotData={systemNotData}
                    commandAuthorityData={commandAuthorityData}
                    commandCheckData={commandCheckData}
                    commandTableCheckData={commandTableCheckData}
                    commandNotData={commandNotData}
                    commandTableNotData={commandTableNotData}
                />:''}
                {isLoodData && isLoodUser?<RoleallUser
                    height={height}
                    isLoodUser={isLoodUser}
                    userRoleMember={userRoleMember}
                    listRoleDetail={listRoleDetail}
                    roleUserData={roleUserData}
                    userExpandedKeys={userExpandedKeys}
                />:''}
            </div>
        )
    }
}

export default RolemanagementDetail


