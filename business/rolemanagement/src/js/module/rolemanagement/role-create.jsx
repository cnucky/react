import React from 'react';
import {render} from 'react-dom';
import {store} from '../store';
import Notify from 'nova-notify';
import Dialog from 'nova-dialog';





class RoleCreate extends React.Component {
    constructor(props) {
        super(props);

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

    createRoleMember(){
        let that = this;
        let type = this.props.userRoleIndex;
        let name = this.input.value;
        let desc = this.textInput.value;
        console.log(type);

        if(!name.trim()){
            Notify.show({
                title: '角色名称不能为空',
                type: "info"
            });
        }else{
            $.post('/userrole/createrole', {
                name: name,
                type: type,
                description: desc
            }).done(function(data) {
                Dialog.dismiss();
                data = JSON.parse(data);
                if (data.code == 0) {
                    that.getUserroleList();
                    store.dispatch({type:'USEREOLE_INDEX',userRoleIndex:type});
                    store.dispatch({type:'USEREOLE_MEMBER',userRoleMember:data.data});
                    store.dispatch({type:'USEREOLE_NAME',userRoleName:name});
                    store.dispatch({type:'USEREOLE_DESC',userRoleDesc:desc});
                    Notify.show({
                        title: "创建成功",
                        type: "success"
                    });
                } else {
                    Notify.show({
                        title: "创建失败",
                        text: data.message,
                        type: "error"
                    });
                }
            });
            this.hideDilog();
        }
    }

    hideDilog(){
        store.dispatch({type:'USEREOLE_ADD',roleAddShow:false});
    }

    render() {

        const { roleAddShow, userRoleIndex, userRoleType } = this.props;

        return (
            <div style={{display: roleAddShow ? 'block' : 'none'}}>
                <div className="dialog-wrap">
                    <div className="role-dialog-content">
                        <div className="role-create">
                            <p>新增角色</p>
                            <span className="fs20 octicon octicon-x" onClick={this.hideDilog.bind(this)}></span>
                        </div>
                        <div className="datalist-wrap">
                            <div style={{margin:'1%'}}>
                                <p style={{textIndent:'-20px'}} className="role-text">角色名称:</p>
                                <input
                                    style={{width:'90%'}}
                                    className="role-text-detail"
                                    ref={(input) => this.input = input}
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
                                />
                            </div>
                        </div>
                        <div className="buton-wrap">
                            <p style={{textAlign: 'right'}}>
                                <span
                                    className="cancel-btn"
                                    onClick={this.hideDilog.bind(this)}
                                >
                                    取消
                                </span>
                                <span
                                    className="success-btn"
                                    onClick={this.createRoleMember.bind(this)}
                                >
                                    确定
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


export default RoleCreate