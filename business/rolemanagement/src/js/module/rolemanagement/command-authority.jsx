import React from 'react';
import { render } from 'react-dom';
import { store } from '../store';
import $ from 'jquery';
import _ from 'underscore';
import Dialog from 'nova-dialog';
import Notify from 'nova-notify';
import spyAuth from  '../../widget/spyDataAuthorization';

class CommandAuthority extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            roleId:this.props.userRoleMember,
            roleName:this.props.userRoleName,
            commandCheckData:this.props.checkData,
            commandTableCheckData:this.props.tableCheckData,
            commandNotData:this.props.checkData,
            commandTableNotData:this.props.tableNotData
        };
    }
    componentDidMount() {
        const { roleId,roleName } = this.state;
        this.showRoleDetail(roleId,roleName);
    }


    showRoleDetail(roleId,roleName) {
        const role = {
            roleID: roleId,
            name: roleName
        };
        const container = $('#command-tab');
        spyAuth.build({
            container: container,
            role: role,
            expandAll: true,
            initCallback: function() {

            },
        });
    }

    cancelRoleAuthority(roleId,roleName) {
        store.dispatch({type:'COMMONDCHECKDATA_GET',commandCheckData:[]});
        store.dispatch({type:'COMMONDNOTDATA_GET',commandNotData:[]});
        store.dispatch({type:'COMMONDTABLECHECKDATA_GET',commandTableCheckData:[]});
        store.dispatch({type:'COMMONDTABLENOTDATA_GET',commandTableNotData:[]});
        this.showRoleDetail(roleId,roleName);
    }

    getAddData(data){
        let idArr = [];

        for(let i=0; i<data.length; i++){
            idArr = [
                ...idArr,
                data[i].privateId
            ]
        }

        idArr = Array.from(new Set( idArr));

        let getData = [];

        for(let i=0; i< idArr.length; i++){
            getData[i] = _.find(data, item => {
                return idArr[i] == item.privateId;
            })
        }

        for(let i=0; i< getData.length; i++){
            for(let j=0; j< data.length; j++){
                if(getData[i].privateId == data[j].privateId){
                    if(getData[i].selectedSubPermission.indexOf(data[j].selectedSubPermission[0])>-1){

                    }else {
                        getData[i].selectedSubPermission = [
                            ...getData[i].selectedSubPermission,
                            data[j].selectedSubPermission[0]
                        ]
                    }
                }
            }

        }
        return getData;
    }

    addCheckAuthority(tableCheckData){

        let getTableCheckData = this.getAddData(tableCheckData);

        let tableCheckResult = {
            resource: [...getTableCheckData],
            AuditInfo: '',
        };
        tableCheckResult.resource = JSON.stringify(tableCheckResult.resource);
        $.getJSON("/spycommon/addAuthResource", tableCheckResult).done(function (rsp) {
            if (rsp.code == 0) {
                store.dispatch({type:'COMMONDCHECKDATA_GET',commandCheckData:[]});
                store.dispatch({type:'COMMONDNOTDATA_GET',commandNotData:[]});
                store.dispatch({type:'COMMONDTABLECHECKDATA_GET',commandTableCheckData:[]});
                store.dispatch({type:'COMMONDTABLENOTDATA_GET',commandTableNotData:[]});
                Notify.show({
                    title: "授权成功",
                    type: "success"
                });

            } else {
                Notify.show({
                    title: "授权失败",
                    text: rsp.message,
                    type: "error"
                });
            }
        });

    }


    addNotAuthority(tableNotData){


        let getTableNotData = this.getAddData(tableNotData);
        console.log(getTableNotData,'ggggggggggggggg')

        let tableNotResult = {
            resource: [...getTableNotData],
            AuditInfo: '',
        };
        tableNotResult.resource = JSON.stringify(tableNotResult.resource);
        $.getJSON("/spycommon/removeAuthedResource", tableNotResult).done(function (rsp) {
            if (rsp.code == 0) {
                store.dispatch({type:'COMMONDCHECKDATA_GET',commandCheckData:[]});
                store.dispatch({type:'COMMONDNOTDATA_GET',commandNotData:[]});
                store.dispatch({type:'COMMONDTABLECHECKDATA_GET',commandTableCheckData:[]});
                store.dispatch({type:'COMMONDTABLENOTDATA_GET',commandTableNotData:[]});
                Notify.show({
                    title: "取消授权成功",
                    type: "success"
                });

            } else {
                Notify.show({
                    title: "取消授权失败",
                    text: rsp.message,
                    type: "error"
                });
            }
        });
    }


    addRoleTableAuthority(tableCheckData,tableNotData){

        if(tableCheckData.length>0 && tableNotData.length>0){

            this.addCheckAuthority(tableCheckData);
            this.addNotAuthority(tableNotData);

        } else if(tableCheckData.length>0){

            this.addCheckAuthority(tableCheckData);

        }else if(tableNotData.length>0){

            this.addNotAuthority(tableNotData);

        }
    }


    addRoleAuthority(checkData,notData,tableCheckData,tableNotData) {
        let that = this;
        if(checkData.length>0 && notData.length>0){

                let checkResult = {
                    resource: [...checkData],
                    AuditInfo: '',
                };
                checkResult.resource = JSON.stringify(checkResult.resource);
                $.getJSON("/spycommon/addAuthResource", checkResult).done(function (rsp) {
                    if (rsp.code == 0) {
                       that.addRoleTableAuthority(tableCheckData,tableNotData)
                    } else {
                        Notify.show({
                            title: "授权失败",
                            text: rsp.message,
                            type: "error"
                        });
                    }
                });



                let notResult = {
                    resource: [...notData],
                    AuditInfo: '',
                };
                notResult.resource = JSON.stringify(notResult.resource);
                $.getJSON("/spycommon/removeAuthedResource", notResult).done(function (rsp) {
                    if (rsp.code == 0) {
                        that.addRoleTableAuthority(tableCheckData,tableNotData)
                    } else {
                        Notify.show({
                            title: "取消授权失败",
                            text: rsp.message,
                            type: "error"
                        });
                    }
                });



        } else if(checkData.length>0){

                let checkResult = {
                    resource: [...checkData],
                    AuditInfo: '',
                };
                checkResult.resource = JSON.stringify(checkResult.resource);
                $.getJSON("/spycommon/addAuthResource", checkResult).done(function (rsp) {
                    if (rsp.code == 0) {
                        that.addRoleTableAuthority(tableCheckData,tableNotData)
                    } else {
                        Notify.show({
                            title: "授权失败",
                            text: rsp.message,
                            type: "error"
                        });
                    }
                });


        } else if(notData.length>0){

                let notResult = {
                    resource: [...notData],
                    AuditInfo: '',
                };
                notResult.resource = JSON.stringify(notResult.resource);
                $.getJSON("/spycommon/removeAuthedResource", notResult).done(function (rsp) {
                    if (rsp.code == 0) {
                        that.addRoleTableAuthority(tableCheckData,tableNotData)
                    } else {
                        Notify.show({
                            title: "取消授权失败",
                            text: rsp.message,
                            type: "error"
                        });
                    }
                });


        } else {
            that.addRoleTableAuthority(tableCheckData,tableNotData);
        }
    }



    render() {
        const { userRoleMember, userRoleName, checkData, notData, tableCheckData, tableNotData } = this.props;

        return (
            <div>
                <div id="command-tab" className="authority-tab"></div>
                <div className="bton">
                    <span className="cancel-btn"  onClick={this.cancelRoleAuthority.bind(this,userRoleMember, userRoleName)}>恢复</span>
                    <span className="success-btn" onClick={this.addRoleAuthority.bind(this, checkData, notData, tableCheckData, tableNotData)}>应用</span>
                </div>
            </div>
        )
    }
}

export default CommandAuthority