import React from 'react';
import {render} from 'react-dom';
import {store} from '../store';
import { Tree} from 'antd';
const TreeNode = Tree.TreeNode;


class RoleallUser extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            roleId:this.props.userRoleMember,
            expandedKeys:this.props.userExpandedKeys,
            selectedKeys: [],
            autoExpandParent: true
        };

    }


    componentWillReceiveProps(nextProps) {

    }

    componentDidMount() {

    }

    changeRoleUser(roleId){
        this.getRoleUser(roleId);
        this.setState({
            roleId:roleId
        });
    }

    getRoleUser(roleId){
        let that = this;
        $.getJSON("/userrole/getUsersOfRole", {
            roleId: roleId,
        }, function(res) {
            if(res.code==0){
                store.dispatch({type:'ROLEUSER_LIST',roleUserData:res.data});
                let expandedKeys = [];
                const getExpandedKeys = data => data.forEach((item) => {
                    expandedKeys.push(item.key)
                    if(item.children && item.children.length>0){
                        getExpandedKeys(item.children)
                    }
                });
                getExpandedKeys(res.data)
                that.setState({expandedKeys:expandedKeys});
                store.dispatch({type:'USEREXPANDKEY_GET',userExpandedKeys:expandedKeys});
            }
        })
    }

    onSelect(selectedKeys, info){
        let getKey = info.node.props.eventKey;
        const { expandedKeys } = this.state;
        let index = expandedKeys.indexOf(getKey);
        this.setState({
            expandedKeys:index > -1? [...expandedKeys.slice(0,index), ...expandedKeys.slice(index+1)]:[...expandedKeys, getKey] ,
            autoExpandParent: false,
            selectedKeys
        });
    }
    onExpand(expandedKeys) {
        this.setState({
            expandedKeys,
            autoExpandParent: false,
        });
    }

    render() {

        const {userRoleMember, roleUserData} = this.props;

        if(userRoleMember && userRoleMember != this.state.roleId){
            this.changeRoleUser(userRoleMember);
        }

        const filter = data => {
            let newData = data;
            newData.forEach((item,index) => {
                if(item.extraClasses=="nv-department"){
                   if(item.children && item.children.length>0){

                   }else{
                       newData.splice(index,1)
                   }
                }
            })

            data.forEach((item) => {
                if(item.children && item.children.length>0){
                    filter(item.children)
                }
            })
        };

        const filterData = data => {
            let newData = data;
            filter(newData);
            return newData;

        }


        const roleUser = filterData(filterData(filterData(filterData(roleUserData))));




        const loop = data => data.map((item) => {
            if (item.children && item.children.length>0) {
                return <TreeNode
                          title={
                                 <span>
                                     <span className="fa fa-building-o root-list-icon">
                                         <span style={{fontSize:'14px',color:'rgba(0,0,0,1)'}}>{item.title}</span>
                                     </span>
                                 </span>}
                          key={item.key}
                          >
                             {loop(item.children)}
                         </TreeNode>;
            }

            return  <TreeNode
                        title={
                               <span>
                                   <span className={item.extraClasses=="nv-department"?"fa fa-building-o root-list-icon":"imoon imoon-user2 root-list-icon"}>
                                        <span style={{fontSize:'14px',color:'rgba(0,0,0,1)'}}>{item.title}</span>
                                   </span>
                               </span>}
                        key={item.key}
                        />;
        });


        return (
            <div className="role-user">
                <p className="title">已授权用户</p>
                <div className="content">
                    {userRoleMember && userRoleMember == this.state.roleId?
                        <Tree
                            onExpand={this.onExpand.bind(this)}
                            onSelect={this.onSelect.bind(this)}
                            expandedKeys={this.state.expandedKeys}
                            selectedKeys={this.state.selectedKeys}
                            autoExpandParent={this.state.autoExpandParent}
                        >
                            { loop(roleUser)}
                        </Tree>
                    :''}

                </div>
            </div>
        )
    }
}

export default RoleallUser