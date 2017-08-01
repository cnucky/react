import React from 'react';
import {render} from 'react-dom';
import {store} from '../store';
import Notify from 'nova-notify';


class RoleEdit extends React.Component {

    constructor(props) {
        super(props);
        this.state={
            userRoleType:this.props.userRoleType,
            userRoleName:this.props.userRoleName,
            userRoleDesc:this.props.userRoleDesc
        };

    }

    componentDidMount() {

    }

    getUserroleList(){
        $.get('/userrole/list', res=>{
            if (res.code == 0) {
                console.log(res.data);
                store.dispatch({type:'USEREOLE_LIST',data:res.data});
            } else {
                Notify.simpleNotify('错误', res.message, 'error');
                hideLoader();
            }
        }, 'json');
    }

    editRoleMember(){
        let that = this;
        let propName = this.props.userRoleName;
        let propDesc = this.props.userRoleDesc;
        let roleId = this.props.userRoleMember;
        let name =this.input.value;
        let desc =this.textInput.value;

        if(!name.trim()){
            Notify.show({
                title:"角色名称不能为空",
                type: "info"
            });
        }else if(name == propName && desc==propDesc){
            Notify.show({
                title:"该角色已经存在",
                type: "info"
            });
        }else{
            $.post('/userrole/updaterole', {
                id: roleId,
                name: name,
                roleName:propName,
                description: desc
            }).done(function(result) {
                result = JSON.parse(result);
                if (result.code == 0) {
                    that.getUserroleList();
                    store.dispatch({type:'USEREOLE_NAME',userRoleName:name});
                    store.dispatch({type:'USEREOLE_DESC',userRoleDesc:desc});
                    Notify.show({
                        title:"更新成功",
                        type: "success"
                    });
                } else {
                    Notify.show({
                        title: "更新失败",
                        text: result.message,
                        type: "error"
                    });
                }
            });

            store.dispatch({type:'USEREOLE_EDIT',roleEditShow:false});
        }

    }

    hide(e){
        store.dispatch({type:'USEREOLE_EDIT',roleEditShow:false});
    }

    editRoleName(e) {
        const { value } = e.target
        this.setState({
            userRoleName: value
        })
    }

    editRoleDesc(e) {
        const { value } = e.target
        this.setState({
            userRoleDesc: value
        })
    }


    render() {
        const { roleEditShow , userRoleType} = this.props;

        return (
            <div style={{display: roleEditShow ? 'block' : 'none'}}>
                <div className="dialog-wrap">
                    <div className="role-dialog-content">
                        <div className="role-create">
                            <p>编辑角色</p>
                            <span className="fs20 octicon octicon-x" onClick={this.hide.bind(this)}></span>
                        </div>
                        <div className="datalist-wrap">
                            <div style={{margin:'1%'}}>
                                <p style={{textIndent:'-20px'}} className="role-text">角色名称:</p>
                                <input
                                    style={{width:'90%'}}
                                    className="role-text-detail"
                                    ref={(input) => this.input = input}
                                    value={this.state.userRoleName}
                                    onChange={this.editRoleName.bind(this)}
                                />
                            </div>
                            <div style={{margin:'1%'}}>
                                <p style={{textIndent:'-20px'}} className="role-text">角色类型:</p>
                                <span className="role-text-detail">{userRoleType}</span>
                            </div>
                            <div style={{margin:'1%'}}>
                                <p style={{textIndent:'-20px'}} className="role-text">角色描述:</p>
                                <textarea
                                    style={{width:'90%'}}
                                    className="role-text-detail"
                                    ref={(input) => this.textInput = input}
                                    rows={5}
                                    value={this.state.userRoleDesc}
                                    onChange={this.editRoleDesc.bind(this)}
                                />
                            </div>
                        </div>
                        <div className="buton-wrap">
                            <p style={{textAlign: 'right'}}>
                                <span
                                    className="cancel-btn"
                                    onClick={this.hide.bind(this)}
                                >
                                    取消
                                </span>
                                <span
                                    className="success-btn"
                                    onClick={this.editRoleMember.bind(this)}
                                >
                                    保存
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
                <div className="dialog-wrap-overlay"
                >
                </div>
            </div>
        )
    }

}

export default RoleEdit