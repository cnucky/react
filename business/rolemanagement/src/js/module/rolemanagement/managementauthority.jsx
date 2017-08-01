import React from 'react';
import { render } from 'react-dom';
import { store } from '../store';
import Notify from 'nova-notify';
import HandleAuthority from './handle-authority';
import DataAuthority from './data-authority';
import DepartmentAuthority from './department-authority';
import SystemAuthority from './system-authority';
import CommandAuthority from './command-authority';
import AuthorityTabs from './authority-tabs'




class ManagementAuthority extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            roleId:this.props.userRoleMember,
            roleType:this.props.userRoleIndex,
            roleName:this.props.userRoleName
        }
    }


    componentDidMount() {

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
        if(roleType != this.state.roleType){
            store.dispatch({type:'TABACTIVEKEY_GET',tabActiveKey:authArr[0]});
        }

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


    changeAuthorityData(roleId,roleType,roleName){
        this.getAuthorityData(roleId,roleType,roleName);
        this.setState({
            roleId:roleId,
            roleType:roleType,
            roleName:roleName
        });
    }


    getAuthority(authority,roleId,roleName,data,getCheckData,getNotData){
        const {commandTableCheckData, commandTableNotData} = this.props;
        switch (authority) {
            case 0:
                return <HandleAuthority
                    tabKey={authority}
                    tabName="操作权限"
                    userRoleMember={roleId}
                    userRoleName={roleName}
                    authorityData={data}
                    checkData={getCheckData}
                    notData={getNotData}
                />;
                break;
            case 1:
                return <DataAuthority
                    tabKey={authority}
                    tabName="数据权限"
                    userRoleMember={roleId}
                    userRoleName={roleName}
                    authorityData={data}
                    checkData={getCheckData}
                    notData={getNotData}
                />;
                break;
            case 2:
                return <DepartmentAuthority
                    tabKey={authority}
                    tabName="部门权限"
                    userRoleMember={roleId}
                    userRoleName={roleName}
                    authorityData={data}
                    checkData={getCheckData}
                    notData={getNotData}
                />;
                break;
            case 5:
                return <SystemAuthority
                    tabKey={authority}
                    tabName="系统权限"
                    userRoleMember={roleId}
                    userRoleName={roleName}
                    authorityData={data}
                    checkData={getCheckData}
                    notData={getNotData}
                />;
                break;
            case 8:
                return <CommandAuthority
                    tabKey={authority}
                    tabName="指挥授权"
                    userRoleMember={roleId}
                    userRoleName={roleName}
                    authorityData={data}
                    checkData={getCheckData}
                    tableCheckData={commandTableCheckData}
                    notData={getNotData}
                    tableNotData={commandTableNotData}
                />;
                break;
        }
    }


    render() {

        const {userRoleIndex, userRoleMember,userRoleName,isLoodAuth, tabActiveKey} = this.props;
        const {handleAuthorityData, dataAuthorityData, departmentAuthorityData, systemAuthorityData, commandAuthorityData} = this.props;
        const {handleCheckData, handleNotData, dataCheckData, dataNotData, departmentCheckData, departmentNotData, systemCheckData, systemNotData, commandCheckData, commandNotData} = this.props;
        const authorityMap = {
            0: handleAuthorityData,
            1: dataAuthorityData,
            2: departmentAuthorityData,
            5: systemAuthorityData,
            8: commandAuthorityData
        };

        const checkDataMap = {
            0: handleCheckData,
            1: dataCheckData,
            2: departmentCheckData,
            5: systemCheckData,
            8: commandCheckData
        }

        const notDataMap = {
            0: handleNotData,
            1: dataNotData,
            2: departmentNotData,
            5: systemNotData,
            8: commandNotData
        }

        if(userRoleIndex != this.state.roleType || userRoleMember != this.state.roleId){
               this.changeAuthorityData(userRoleMember,userRoleIndex,userRoleName);
        }

        const userRoleAuthority = this.getAuthorityTypes(userRoleIndex);

        const showAuthorityTabs = data => {
            let authorityTabs = [];
            let authoritytab;
            data.forEach((item) => {
                authoritytab =  this.getAuthority(item,userRoleMember,userRoleName,authorityMap[item],checkDataMap[item],notDataMap[item]);
                authorityTabs.push(authoritytab);
            })
            return authorityTabs;
        }


        return (
            <div className="management-authority">
                {isLoodAuth && userRoleMember && userRoleMember == this.state.roleId?
                    <AuthorityTabs activeKey={tabActiveKey}>
                        {showAuthorityTabs(userRoleAuthority)}
                    </AuthorityTabs>
                    :''}
            </div>

        )
    }
}

export default ManagementAuthority