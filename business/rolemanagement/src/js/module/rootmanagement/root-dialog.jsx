import React from 'react';
import {render} from 'react-dom';
import {store} from '../store';
import { Button, Tree, Tabs, Icon, Radio } from 'antd';
const TreeNode = Tree.TreeNode;
const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
var Notify = require('nova-notify');

class RootDialog extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            autoExpandParent: true,
            managerExpandedKeys: [],
            managerCheckedKeys: [''],
            ordinaryExpandedKeys: [''],
            ordinaryCheckedKeys: [''],
            radioValue: 1,
            isUpdata: false
        }
    }

    componentWillReceiveProps(nextProps) {
        
    }

    componentDidMount() {
        const { roleRootEditItem, roleTreeData, rootEditType } = this.props
        if (typeof roleTreeData !== 'undefined' &&
            typeof roleRootEditItem !== 'undefined' &&
            typeof rootEditType !== 'undefined') {

            let roleRootEditItemCheck = rootEditType === 3 ? roleRootEditItem : (roleRootEditItem.length === 1 ? roleRootEditItem[0] : null)

            if (roleRootEditItemCheck !== null && typeof
                roleRootEditItemCheck.roleName !== 'undefined' &&
                roleRootEditItemCheck.roleName.length > 0) {

                let ordinaryExpandedKeys = []
                let ordinaryCheckedKeys = []
                let managerExpandedKeys = []
                let managerCheckedKeys = []
                let checkedKeys = []
                for (let i = 0; i < roleRootEditItemCheck.roleName.length; i++) {
                    for (let j = 0; j < roleTreeData.length; j++) {
                        if (typeof roleTreeData[j].children !== 'undefined') {

                            for (let k = 0; k < roleTreeData[j].children.length; k++) {
                                if (roleTreeData[j].children[k].title === roleRootEditItemCheck.roleName[i].name) {
                                    if (roleTreeData[j].title === '普通角色') {
                                        ordinaryExpandedKeys.push(roleTreeData[j].key)
                                        ordinaryCheckedKeys.push(roleTreeData[j].children[k].key)
                                    } else {
                                        managerExpandedKeys.push(roleTreeData[j].key)
                                        managerCheckedKeys.push(roleTreeData[j].children[k].key)
                                    }
                                    
                                }
                            }
                        }
                    }
                }
                this.setState({
                    ordinaryExpandedKeys: ordinaryExpandedKeys,
                    ordinaryCheckedKeys: ordinaryCheckedKeys,
                    managerExpandedKeys: managerExpandedKeys,
                    managerCheckedKeys: managerCheckedKeys
                })
            }
        }
    }

    _handleRootDialogOpen () {
        let rootDialogOpen = false
        this.setState({
            expandedKeys: [],
            selectedKeys: []
        })
        
        store.dispatch({type: 'CHANGE_ROOTDIALOG_OPEN', rootDialogOpen: rootDialogOpen, editItem: {isEdit: true, data: {}, editType: this.props.rootEditType}, restoreRoleTreeData: this.props.roleTreeData})

    }

    _hgandleConfirm (type, editType) {
        let roleRootEditItem = this.props.roleRootEditItem
        let roleTreeData = this.props.roleTreeData

        let roleId = []
        let userId = []
        let checkedKeys = this.state.radioValue === 1 ? this.state.ordinaryCheckedKeys : this.state.managerCheckedKeys
        let secondItemKey = this._getItemKey(checkedKeys, 2)

        if (typeof roleRootEditItem !== 'undefined' && roleRootEditItem.length > 0) {
            for (let k = 0; k < roleRootEditItem.length; k++) {
                userId.push(roleRootEditItem[k].userId)
            }
        } else {
            userId.push(roleRootEditItem.userId)
        }


        if (type === 'confirm' && roleRootEditItem !== {}) {
            for (let i = 0; i < roleTreeData.length; i++) {
                if(roleTreeData[i].children) {
                    for (let j = 0; j < roleTreeData[i].children.length; j++) {
                        for (let k = 0; k < secondItemKey.length; k++) {
                            if (secondItemKey[k] === roleTreeData[i].children[j].key) {
                                roleId.push(roleTreeData[i].children[j].roleID)
                            }
                        }
                    }
                }
            }
            if (roleId.length === 0) {
                Notify.show({
                    title: '请勾选角色',
                    type: "info"
                });
            } else {
                let _this = this
                $.post("/userrole/updateuserrole", {
                    userid: userId,
                    roleid: roleId,
                    type: editType
                }, function(rsp) {
                     if (rsp.code == 0) {
                        Notify.show({
                            title: i18n.t('rolemanage.notify-updaterolesuccess'),
                            type: "success"
                        });
                        
                        _this._shouldUpData(userId, roleId, editType);
                    } else {
                        Notify.show({
                            title: i18n.t('rolemanage.notify-updaterolefailed'),
                            type: "danger"
                        });
                    }
                }, 'json');
                this._handleRootDialogOpen()
            }
        } else {
           this._handleRootDialogOpen() 
        }

        this.forceUpdate()
    }

    _getDataUnique (data) {
        let newData = []
        let returnData = []
        let name = ''

        for (let i = 0; i < data.length; i++) {
            name = data[i].name
            if (newData.indexOf(name) == -1) {
                newData.push(data[i].name)
                returnData.push(data[i])
            }
        }
        return returnData
    }

    _getDataReduce (data, reduceData) {
        let n = 0
        let newData = []
        for (let a = 0; a < data.length; a++) {
            for (let b = 0; b < reduceData.length; b++) {
                if (data[a].name !== reduceData[b].name) {
                    newData.push(data[a])
                }
            }
        }
        return newData
    }

    _shouldUpData (userId, roleId, editType) {
        var listallData = []
        var rootRolelist = []
        var rootTableListData = this.props.rootTableListData
        var roleTreeData = this.props.roleTreeData
        var roleNameList = []
        /*var roleName = ''
        var roleID = ''
        var roleType = ''*/
        for (let a = 0; a < roleTreeData.length; a++) {
            if (typeof roleTreeData[a].children !== 'undefined' &&roleTreeData[a].children.length > 0) {
                for (let b = 0; b < roleTreeData[a].children.length; b++) {
                    for (let c = 0; c < roleId.length; c++) {
                        if (roleId[c] === roleTreeData[a].children[b].roleID) {
                            roleNameList.push({name: roleTreeData[a].children[b].name, roleType: roleTreeData[a].children[b].roleType})
                        }
                    }
                }
            }
        }

        //1:追加，  2:回收  3: 重置
        switch (editType) {
            case 1:
                for (let j = 0; j < rootTableListData.length; j++) {
                    for (let i = 0; i < userId.length; i++) {
                        let userData = {}
                        if (userId[i] === rootTableListData[j].userId) {
                            userData = rootTableListData[j]
                            let roleName = userData.roleName.concat(roleNameList)
                            rootTableListData[j].roleName = this._getDataUnique(roleName)
                        }
                    }
                }
                break
            case 2:
                for (let j = 0; j < rootTableListData.length; j++) {
                    for (let i = 0; i < userId.length; i++) {
                        if (userId[i] === rootTableListData[j].userId) {
                            rootTableListData[j].roleName = this._getDataReduce(rootTableListData[j].roleName, roleNameList)
                        }
                    }
                }
                break
            case 3:
                for (let j = 0; j < rootTableListData.length; j++) {
                    for (let i = 0; i < userId.length; i++) {
                        let userData = {}
                        if (userId[i] === rootTableListData[j].userId) {
                            rootTableListData[j].roleName = roleNameList
                        }
                    }
                }
                break
            default:
                break
        }
        store.dispatch({type: 'GETROOTTABLEDATA', rootTableListData: rootTableListData})
    }

    _onSelect (selectedKeys, info) {
        this.setState({
            selectedKeys: selectedKeys
        })
    }

    _getItemKey (checkedKeys, len) {
        let itemsKey = []
        for (let n = 0; n < checkedKeys.length; n++) {
            if (checkedKeys[n].length === len) {
                itemsKey.push(checkedKeys[n])
            }
        }
        return itemsKey
    }

    _getRoleTreeDataIsChecked (data, isChecked) {
        for (let i = 0; i < data.length; i++) {
            data[i].isChecked = isChecked
            if (typeof data[i].children !== 'undefined' && data[i].children.length > 0) {
                for (let j = 0; j < data[i].children.length; j++) {
                    data[i].children[j].isChecked = isChecked
                }
            }
        }
        return data
    }

    _onCheck (type, checkedKeys, info) {
        let roleTreeData = this.props.roleTreeData
        if (checkedKeys && checkedKeys.length > 0) {
            let firstItemKey = this._getItemKey(checkedKeys, 1)
            let secondItemKey = this._getItemKey(checkedKeys, 2)
            for (let i = 0; i < roleTreeData.length; i++) {
                for (let f = 0; f < firstItemKey.length; f++) {
                    if (firstItemKey[f] === roleTreeData[i].key) {
                        roleTreeData[i].isChecked = true
                    }
                }
                if (typeof roleTreeData[i].children !== 'undefined' && roleTreeData[i].children.length > 0) {
                    for (let j = 0; j < roleTreeData[i].children.length; j++) {
                        for (let s = 0; s < secondItemKey.length; s++) {
                            if (secondItemKey[s] === roleTreeData[i].children[j].key) {
                                roleTreeData[i].children[j].isChecked = true
                            }
                        }
                    }
                }
            }
        } else {
            roleTreeData = this._getRoleTreeDataIsChecked(roleTreeData, false)   
        }

        store.dispatch({type: 'GETROLETREEDATA', roleTreeData: roleTreeData})
        switch (type) {
            case 'ordinary':
                this.setState({
                    ordinaryCheckedKeys: checkedKeys
                })
                break
            case 'manager':
                this.setState({
                    managerCheckedKeys: checkedKeys
                })
            break
        }
        
        
    }
    _onExpand (type, expandedKeys) {
        switch (type) {
            case 'ordinary':
                this.setState({
                    ordinaryExpandedKeys: expandedKeys,
                    autoExpandParent: false,
                });   
                break
            case 'manager':
                this.setState({
                    managerExpandedKeys: expandedKeys,
                    autoExpandParent: false,
                });
             break
        }
        
    }

    _handleChangeRadio (e) {
        this.setState({
            radioValue: e.target.value
        })
    }

    _getTreeData (data) {
        let ordinaryData = []
        let managerData = []
        for (let i = 0; i < data.length; i++) {
            if (data[i].title === '普通角色') {
                ordinaryData.push(data[i])
            } else {
                managerData.push(data[i])
            }
        }
        return {ordinaryData: ordinaryData, managerData: managerData}
    }

    _getListTreestyle (floor) {
        let cname = ''
        switch (floor) {
            case 1:
                cname = 'glyphicons glyphicons-adress_book root-list-icon'
                break
            case 2:
                cname = 'imoon imoon-user2 root-list-icon'
                break
            default:
                cname = 'imoon imoon-user2 root-list-icon'
                break
        }
        return cname
    }

    render() {
        const { rootDialogOpen, roleRootEditItem, rootEditType, roleTreeData } = this.props
        const { radioValue, expandedKeys, checkedKeys } = this.state

        const loop = data => data.map((item) => {
            if (item.children) {
                return (
                    <TreeNode 
                        key={item.key}
                        title={<span className={this._getListTreestyle(item.key.length)}><span>{item.title}</span></span>}>
                        {loop(item.children)}
                    </TreeNode>
                );
            }
            return <TreeNode 
                        disableCheckbox={typeof item.children === 'undefined' && item.key.length === 1}
                        key={item.key}
                        title={<span className={this._getListTreestyle(item.key.length)}><span>{item.title}</span></span>} />;
        });
		return (
            <div style={{display: rootDialogOpen ? 'block' : 'none'}}>
                <div className="dialog-wrap">       
                    <div className="root-dialog-content">
                        <div className="dialog-datalist-wrap">
                            <RadioGroup onChange={this._handleChangeRadio.bind(this)} value={this.state.radioValue}>
                                <Radio value={1}>普通角色</Radio>
                                <Radio value={2}>管理员角色</Radio>
                            </RadioGroup>
                            <div style={{display: radioValue === 1 ? 'block' : 'none'}}>
                                <Tree
                                    checkable
                                    onCheck={this._onCheck.bind(this, 'ordinary')}
                                    onSelect={this._onSelect.bind(this, 'ordinary')}
                                    onExpand={this._onExpand.bind(this, 'ordinary')}
                                    expandedKeys={this.state.ordinaryExpandedKeys}
                                    autoExpandParent={this.state.autoExpandParent}
                                    checkedKeys={this.state.ordinaryCheckedKeys}
                                >
                                    {loop(this._getTreeData(roleTreeData).ordinaryData)}
                                </Tree>
                            </div>
                            <div style={{display: radioValue === 2 ? 'block' : 'none'}}>
                                <Tree
                                    checkable
                                    onCheck={this._onCheck.bind(this, 'manager')}
                                    onSelect={this._onSelect.bind(this, 'manager')}
                                    onExpand={this._onExpand.bind(this, 'manager')}
                                    expandedKeys={this.state.managerExpandedKeys}
                                    autoExpandParent={this.state.autoExpandParent}
                                    checkedKeys={this.state.managerCheckedKeys}
                                >
                                    {loop(this._getTreeData(roleTreeData).managerData)}
                                </Tree>
                            </div>
                        </div>
                        <div className="but-wrap">
                            {(rootEditType === 3 || roleRootEditItem.length === 1) ?
                                (<p style={{textAlign: 'right'}}>
                                    <Button
                                        onClick={this._hgandleConfirm.bind(this, 'confirm', 3)}
                                        size="large"
                                        type="primary"
                                    >
                                        重置
                                    </Button>
                                    <Button
                                        onClick={this._hgandleConfirm.bind(this, 'cancel')}
                                        size="large"
                                        className="margin-left20"
                                        type="primary"
                                    >
                                        取消
                                    </Button>
                                </p>) :
                                (<p  style={{textAlign: 'right'}}>
                                    <Button
                                        onClick={this._hgandleConfirm.bind(this, 'confirm', 1)}
                                        size="large"
                                        type="primary"
                                    >
                                        追加
                                    </Button>
                                    <Button
                                        onClick={this._hgandleConfirm.bind(this, 'confirm', 3)}
                                        size="large"
                                        type="primary"
                                    >
                                        重置
                                    </Button>
                                    <Button
                                        onClick={this._hgandleConfirm.bind(this, 'confirm', 2)}
                                        size="large"
                                        type="primary"
                                    >
                                        回收
                                    </Button>
                                    <Button
                                        onClick={this._hgandleConfirm.bind(this, 'cancel')}
                                        size="large"
                                        className="margin-left20"
                                        type="primary"
                                    >
                                        取消
                                    </Button>
                                </p>)}
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

export default RootDialog


