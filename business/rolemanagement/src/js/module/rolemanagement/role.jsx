import React from 'react';
import {render} from 'react-dom';
import { Tag } from 'antd';
import _ from 'underscore';
import {store} from '../store';
import Notify from 'nova-notify';
import Dialog from 'nova-dialog';







class AllroleManagement extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            roleType:this.props.userRoleIndex,
            activeKeys:this.props.activeKeys,
            isExpandRole:false
        }

    }


    componentWillReceiveProps(nextProps) {

    }


    getUserroleList(){
        $.get('/userrole/list', res=>{
            if (res.code == 0) {
                store.dispatch({type:'USEREOLE_LIST',data:res.data});
            } else {
                Notify.simpleNotify('错误', res.message, 'error');
                hideLoader();
            }
        }, 'json');
    }


    componentDidMount() {

    }

    expandRole(index){
        let keys = this.props.activeKeys;
        let dex = keys.indexOf(index);
        if(dex > -1){
            keys = [ ...keys.slice(0,dex), ...keys.slice(dex+1)];
        } else {
            keys = [...keys, index];
        }

        store.dispatch({type:'ACTIVEKEYS_GET',activeKeys:keys});

    }

    getActiveRole(index){
        let keys = this.props.activeKeys;
        if(keys.indexOf(index)> -1){
            return "role-active"
        }else{
            return "role-item"
        }
    }

    getActiveIcon(index){
        if(this.getActiveRole(index) == "role-active"){
            return "fa fa-lg fa-caret-down"
        }else{
            return "fa fa-lg fa-caret-right"
        }
    }


    createRole(index,title){
        store.dispatch({type:'USEREOLE_INDEX',userRoleIndex:index});
        store.dispatch({type:'USEREOLE_TYPE',userRoleType:title});
        store.dispatch({type:'USEREOLE_MEMBER',userRoleMember:null});
        store.dispatch({type:'USEREOLE_ADD',roleAddShow:true});
    }

    editRole(index,dex,title,name,desc){
        store.dispatch({type:'USEREOLE_INDEX',userRoleIndex:index});
        store.dispatch({type:'USEREOLE_MEMBER',userRoleMember:dex});
        store.dispatch({type:'USEREOLE_TYPE',userRoleType:title});
        store.dispatch({type:'USEREOLE_NAME',userRoleName:name});
        store.dispatch({type:'USEREOLE_DESC',userRoleDesc:desc});
        store.dispatch({type:'USEREOLE_EDIT',roleEditShow:true})
    }

    changeRoleMember(index,dex,title,name){
        store.dispatch({type:'USEREOLE_INDEX',userRoleIndex:index});
        store.dispatch({type:'USEREOLE_MEMBER',userRoleMember:dex});
        store.dispatch({type:'USEREOLE_TYPE',userRoleType:title});
        store.dispatch({type:'USEREOLE_NAME',userRoleName:name});

    }

    deleteRoleMember(name,id){
        let that = this;
        let roleId = this.props.userRoleMember;
        $.post('/userrole/deleterole', {
            roleName: name,
            id: id
        }).done(function(result) {
            result = JSON.parse(result);
            if (result.code == 0) {
                that.getUserroleList();
                if(roleId == id){
                    store.dispatch({type:'USEREOLE_MEMBER',userRoleMember:null});
                    store.dispatch({type:'USEREOLE_NAME',userRoleName:null});
                    store.dispatch({type:'USEREOLE_DESC',userRoleDesc:null});
                }
                Notify.show({
                    title: '删除成功',
                    type: "success"
                });
            } else {
                Notify.show({
                    title: '删除失败',
                    text: result.message,
                    type: "error"
                });
            }
        });
    }

    deleteRole(name,id){
        let that = this;
        Dialog.build({
            title: '删除角色',
            content: '<div><p class="del-wrap">' + `删除角色: ${name} ？`+ '</p></div>',
            width: 400,
            minHeight: 50,
            rightBtn: '确定',
            leftBtn: '取消',
            rightBtnCallback: function(){
                that.deleteRoleMember(name,id);
                $.magnificPopup.close();
            }
        }).show(function() {
            $('#nv-dialog-body').localize();
            $('#nv-dialog-body').addClass('pn');
        });
    }

    render() {

        let userlist=this.props.userRoleData;

        return (
            <div className="role-all">
                <div id="role-list"   style={{marginLeft:'2%'}}>
                    <ul style={{marginLeft:'6%',marginTop:'2%'}}>
                        {
                            _.map(userlist, user =>{
                                return (
                                    user.folder?
                                        <li key={user.key} style={{padding:'4% 1%'}}>
                                            <p  style={{width:'100%',fontSize:'16px',cursor:'pointer',color:this.props.userRoleIndex==user.key?'rgba(48,183,245,0.9)':'rgba(0,0,0,1)'}}>
                                                <span className={(this.getActiveIcon.bind(this,user.key))()} onClick={this.expandRole.bind(this,user.key)}></span>
                                                <span>{' '}</span>
                                                <span onClick={this.expandRole.bind(this,user.key)}>{user.title}</span>
                                                <span>{' '}</span>
                                                <span onClick={this.createRole.bind(this,user.key,user.title)} style={{color:'#00a613'}} className="fs20 octicon octicon-plus"></span>
                                            </p>
                                            <div className={(this.getActiveRole.bind(this,user.key))()}>
                                                {
                                                    user.children && user.children.length > 0 ?
                                                        <div style={{margin:'5% 6%'}}>
                                                            {
                                                                _.map(user.children, child =>{
                                                                    return (
                                                                        <li key={child.roleID} style={{fontSize:'14px',cursor:'pointer',margin:'4% 2%'}}>
                                                                            <span
                                                                                className="imoon imoon-user2"
                                                                                style={{color:this.props.userRoleIndex==child.roleType && this.props.userRoleMember==child.roleID ? 'rgba(48,183,245,0.9)':'rgba(0,0,0,0.9)'}}
                                                                                onClick={this.changeRoleMember.bind(this,child.roleType,child.roleID,user.title,child.name)}
                                                                            >
                                                                            </span>
                                                                            <span
                                                                                style={{marginLeft:'3%',color:this.props.userRoleIndex==child.roleType && this.props.userRoleMember==child.roleID ? 'rgba(48,183,245,0.9)':'rgba(0,0,0,0.9)'}}
                                                                                onClick={this.changeRoleMember.bind(this,child.roleType,child.roleID,user.title,child.name)}
                                                                            >
                                                                                {child.name}
                                                                            </span>
                                                                            <span style={{width:'100px',marginRight:'-23%',float:'right'}}>
                                                                                <Tag
                                                                            color="rgba(168,202,99,0.65)"
                                                                            onClick={this.editRole.bind(this,child.roleType,child.roleID,user.title,child.name,child.desc)}
                                                                           >
                                                                                    <span className="fa fa-pencil"></span>
                                                                                </Tag>
                                                                                <Tag
                                                                            color="rgba(233,64,64,0.28)"
                                                                            onClick={this.deleteRole.bind(this,child.name,child.roleID)}
                                                                           >
                                                                                    <span  className=" octicon octicon-trashcan"></span>
                                                                                </Tag>
                                                                            </span>
                                                                        </li>
                                                                    )
                                                                })
                                                            }
                                                        </div>
                                                        :''
                                                }
                                            </div>
                                        </li> :''
                                )
                            })
                        }
                    </ul>
                </div>
            </div>
        )
    }
}

export default AllroleManagement