import React from 'react';
import { render } from 'react-dom';
import { store } from '../store';
import $ from 'jquery';
import _ from 'underscore';
import Dialog from 'nova-dialog';
import Notify from 'nova-notify';
import Tree from  '../../widget/authority-tree';



class HandleAuthority extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            roleId:this.props.userRoleMember,
            roleName:this.props.userRoleName,
            handleCheckData:this.props.checkData,
            handleNotData:this.props.notData,
        };
    }

    // shouldComponentUpdate(nextProps, nextState) {
    //     if(_.isEqual(this.props,nextProps) || _.isEmpty(this.props)){
    //         return false;
    //     }
    //     return true;
    // }

    componentDidMount() {
        const { roleId,roleName } = this.state;
        this.showRoleDetail(roleId,roleName);
    }



    showRoleDetail(roleId,roleName) {
        const container = $('#handle-tab');
        let checkData=this.state.handleCheckData;
        let notData=this.state.handleNotData;
        Tree.build({
            container:container ,
            selectMode: 3,
            minExpandLevel: 2,
            source: function() {
                return {
                    url: "/userrole/roledetail",
                    data: {
                        roleId: roleId,
                        resourceType: 0,
                        roleType:2
                    }
                }
            },
            loadEnd: function(event, data) {
                $('.form-detail').localize();
            },
            select: function(event, data) {
                let allNodes = [];

                function addNodes(node) {
                    let curNode = {
                        roleId: parseInt(roleId),
                        roleName: roleName,
                        privateId: node.key,
                        privateName: node.data.name,
                        isDir: parseInt(node.data.isDir),
                        type: parseInt(node.data.resourceType),
                        selectedSubPermission: node.data.selectedSubPermission
                    };
                    allNodes.push(curNode);

                    if (node.hasChildren()) {
                        _.each(node.getChildren(), function(child) {
                            addNodes(child);
                        })
                    }
                }

                addNodes(data.node);

                if (data.node.isSelected() && data.node.data.selectedSubPermission[0] != i18n.t('rolemanage.level-none')) {
                    checkData = [...checkData, ...allNodes];
                    _.each(allNodes, data => {
                        _.each(notData, (item,index) => {
                            if(item.privateId == data.privateId){
                                notData = [...notData.slice(0,index), ...notData.slice(index+1)]
                            }
                        })
                    })
                    store.dispatch({type:'HANDLECHECKDATA_GET',handleCheckData:checkData});
                    store.dispatch({type:'HANDLENOTDATA_GET',handleNotData:notData});
                } else {
                    _.each(allNodes, data => {
                        _.each(checkData, (item,index) => {
                            if(item.privateId == data.privateId){
                                checkData = [...checkData.slice(0,index), ...checkData.slice(index+1)]
                            }
                        })
                    })
                    notData = [...notData, ...allNodes]
                    store.dispatch({type:'HANDLECHECKDATA_GET',handleCheckData:checkData});
                    store.dispatch({type:'HANDLENOTDATA_GET',handleNotData:notData});
                }
            }
        });

    }


    cancelRoleAuthority(roleId,roleName) {
        const container = $('#handle-tab');
        container.fancytree("getTree").reload();
       //this.showRoleDetail(roleId,roleName)
    }



    addRoleAuthority(checkData,notData) {
        if(checkData.length>0 && notData.length>0){
            $.post("/userrole/addresource", {
                node: checkData
            }).done(function(rsp) {
                rsp = JSON.parse(rsp);
                if (rsp.code == 0) {

                }
            });

            $.post("/userrole/removeresource", {
                node: notData
            }).done(function(rsp) {
                rsp = JSON.parse(rsp);
                if (rsp.code == 0) {
                    Notify.show({
                        title: "授权应用成功",
                        type: "success"
                    });
                }
            });
        } else if (checkData.length>0){
            $.post("/userrole/addresource", {
                node: checkData
            }).done(function(rsp) {
                rsp = JSON.parse(rsp);
                if (rsp.code == 0) {
                    Notify.show({
                        title: "授权应用成功",
                        type: "success"
                    });
                }
            });
        } else {
            $.post("/userrole/removeresource", {
                node: notData
            }).done(function(rsp) {
                rsp = JSON.parse(rsp);
                if (rsp.code == 0) {
                    Notify.show({
                        title: "授权应用成功",
                        type: "success"
                    });
                }
            });
        }
    }



    render() {
        const { userRoleMember, userRoleName, checkData, notData} = this.props;

        return (
            <div>
                 <div id="handle-tab" className="authority-tab"></div>
                 <div className="bton">
                     <span className="cancel-btn" onClick={this.cancelRoleAuthority.bind(this,userRoleMember , userRoleName)}>恢复</span>
                     <span className="success-btn" onClick={this.addRoleAuthority.bind(this,checkData , notData)}>应用</span>
                 </div>
            </div>
        )
    }
}

export default HandleAuthority