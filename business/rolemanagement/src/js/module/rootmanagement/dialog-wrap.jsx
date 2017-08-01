var React = require('react');
var ReactDOM = require('react-dom');
var Dialog = require('nova-dialog');
var Notify = require('nova-notify');
var redux = require('redux');
var bootbox = require('nova-bootbox-dialog')
import {render} from 'react-dom';
var Provider = require('widget/i18n-provider');
import { Button, Tree, Tabs, Icon, Radio } from 'antd';
const TreeNode = Tree.TreeNode;
const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
initLocales(require.context('../../../locales/rootmanagement', false, /\.js/), 'zh');
// registerLocales(require.context('../../../locales/operator', false, /\.js/), 'operator');
// import {store} from '../store';


var state = {
	dialogData: {},
	radioValue: 1,
	ordinaryCheckedKeys: [],
	managerCheckedKeys: []
}
var reducer = function(state, action) {
	var newState = {}
    switch (action.type) {
        case 'GETDIALOGMDATA':
        	newState.dialogData = action.data.dialogData
        	newState.radioValue = 1
        	newState.rootTableListData = action.data.rootTableListData
            newState.rootCheckedKeys = action.data.rootCheckedKeys
        	newState.rootEditType = action.data.dialogData.rootEditType
        	newState.ordinaryCheckedKeys = []
        	newState.managerCheckedKeys = []
            return _.assign({}, state, newState);
        case 'RADIOVALUE':
            newState.radioValue = action.data
            return _.assign({}, state, newState)
        case 'ALLKEYS':
        	newState.ordinaryCheckedKeys = action.data.ordinaryCheckedKeys
        	newState.managerCheckedKeys = action.data.managerCheckedKeys
        	return _.assign({}, state, newState)
        case 'ORDINARYKEYS':
        	newState.ordinaryCheckedKeys = action.data
        	return _.assign({}, state, newState)
        case 'MANAGERKEYS':
        	newState.managerCheckedKeys = action.data
        	return _.assign({}, state, newState)
        case 'ROOTEDITTYPE':
        	newState.rootEditType = action.data
        	return _.assign({}, state, newState)

        default:
            return state;
    }
}
var store = redux.createStore(reducer);
var dispatch = function(action, data, callback) {
    store.dispatch({
        type: action,
        data: data
    });
    if (callback) {
        callback();
    }
}

/******************************   DialogContent  ************************************/

var DialogContent = React.createClass({
    contextTypes: {
        i18n: React.PropTypes.object
    },

	getInitialState: function () {
		return {
			autoExpandParent: true,
            managerExpandedKeys: [],
            managerCheckedKeys: [''],
            ordinaryExpandedKeys: [''],
            ordinaryCheckedKeys: [''],
            radioValue: 1,
            isUpdata: false,
            editType: 1,
            autoExpandParent: true
		}
	},
    componentWillReceiveProps: function (nextProps) {
        
    },

    componentDidMount: function () {
    	var data = store.getState();
        const { roleRootEditItem, roleTreeData, rootEditType } = data.dialogData
        if (typeof roleTreeData !== 'undefined' &&
            typeof roleRootEditItem !== 'undefined' &&
            typeof rootEditType !== 'undefined') {

            let roleRootEditItemCheck = rootEditType === 3 ? roleRootEditItem[0] : null

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
                ordinaryExpandedKeys = ordinaryExpandedKeys.length > 0 ? ordinaryExpandedKeys : ['0']
                managerExpandedKeys = managerExpandedKeys.length > 0 ? managerExpandedKeys : ['1']
                this.setState({
                    ordinaryExpandedKeys: ordinaryExpandedKeys,
                    ordinaryCheckedKeys: ordinaryCheckedKeys,
                    managerExpandedKeys: managerExpandedKeys,
                    managerCheckedKeys: managerCheckedKeys
                })
                dispatch('ALLKEYS', {
                	ordinaryCheckedKeys: ordinaryCheckedKeys,
                	managerCheckedKeys: managerCheckedKeys
                })
            } else {
                this.setState({
                    ordinaryExpandedKeys: ['0'],
                    managerExpandedKeys: ['1']
                })
            }
        }
    },

    _onSelect: function (type, selectedKeys, info) {
            let expandedKeys = type === 'manager' ? this.state.managerExpandedKeys : this.state.ordinaryExpandedKeys
            let key = info.node.props.eventKey
            let index = expandedKeys.indexOf(key)
        if (type === 'manager') {
            this.setState({
                managerExpandedKeys: index > -1 ? [...expandedKeys.slice(0, index), ...expandedKeys.slice(index + 1)] : [...expandedKeys, key],
                autoExpandParent: false
            })
        } else {
            this.setState({
                ordinaryExpandedKeys: index > -1 ? [...expandedKeys.slice(0, index), ...expandedKeys.slice(index + 1)] : [...expandedKeys, key],
                autoExpandParent: false
            })
        }
    },

    _getItemKey: function (checkedKeys, len) {
        let itemsKey = []
        for (let n = 0; n < checkedKeys.length; n++) {
            if (checkedKeys[n].length > len || checkedKeys[n].length === len) {
                itemsKey.push(checkedKeys[n])
            }
        }
        return itemsKey
    },

    _getRoleTreeDataIsChecked: function (data, isChecked) {
        for (let i = 0; i < data.length; i++) {
            data[i].isChecked = isChecked
            if (typeof data[i].children !== 'undefined' && data[i].children.length > 0) {
                for (let j = 0; j < data[i].children.length; j++) {
                    data[i].children[j].isChecked = isChecked
                }
            }
        }
        return data
    },

    _onCheck: function (type, checkedKeys, info) {
    	var data = store.getState();
        let roleTreeData = data.dialogData.roleTreeData
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

        //store.dispatch({type: 'GETROLETREEDATA', roleTreeData: roleTreeData})
        switch (type) {
            case 'ordinary':
                this.setState({
                    ordinaryCheckedKeys: checkedKeys
                })
                dispatch('ORDINARYKEYS', checkedKeys)
                break
            case 'manager':
                this.setState({
                    managerCheckedKeys: checkedKeys
                })
                dispatch('MANAGERKEYS', checkedKeys)
            break
        }
        
        
    },
    _onExpand: function (type, expandedKeys) {
        // console.log('onExpand', arguments);
        // if not set autoExpandParent to false, if children expanded, parent can not collapse.
        // or, you can remove all expanded children keys.
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
        
    },

    _handleChangeRadio: function (e) {
        let radioValue = e.target.value
        dispatch('RADIOVALUE', radioValue);
        this.setState({
        	radioValue: radioValue
        })

    },

    _getTreeData: function (data) {
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
    },

    _getListTreestyle: function (item) {
        let cname = ''
        if (item.key.length === 1) {
        	cname = 'glyphicons glyphicons-adress_book root-list-icon'
        } else {
        	cname = 'imoon imoon-users2 root-list-icon'
        }
        return cname
    },

    _handleEditTypeChange: function (e) {
    	let editType = e.target.value
    	this.setState({
    		editType: editType
    	})
    	dispatch('ROOTEDITTYPE', editType)
    },

    render() {
    	var data = store.getState();
        const { roleRootEditItem, rootEditType, roleTreeData } = data.dialogData
        const { expandedKeys, checkedKeys, radioValue, editType, ordinaryExpandedKeys, managerExpandedKeys } = this.state

        const loop = data => data.map((item) => {
            if (item.children) {
                return (
                    <TreeNode 
                        key={item.key}
                        title={<span className={this._getListTreestyle(item)}><span>{item.title}</span></span>}>
                        {loop(item.children)}
                    </TreeNode>
                );
            }
            return <TreeNode 
                        disableCheckbox={typeof item.children === 'undefined' && item.key.length === 1}
                        key={item.key}
                        title={<span className={this._getListTreestyle(item)}><span>{item.title}</span></span>} />;
        });
		return (
			<div style={{position: 'relative', height: '100%'}}>
            	<div className="dialog-wrap-content">
                	<div className="">
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
                            	expandedKeys={ordinaryExpandedKeys}
                            	checkedKeys={this.state.ordinaryCheckedKeys}
                                autoExpandParent={this.state.autoExpandParent}
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
                            	expandedKeys={managerExpandedKeys}
                            	checkedKeys={this.state.managerCheckedKeys}
                                autoExpandParent={this.state.autoExpandParent}
                        	>
                            	{loop(this._getTreeData(roleTreeData).managerData)}
                        	</Tree>
                    	</div>
                	</div>
            	</div>
            	<div className="dialog-but-wrap">
                 	{(rootEditType === 3 || roleRootEditItem.length === 1) ?
                 	('') :
                 	(<p style={{textAlign: 'right'}}>
                  		<RadioGroup onChange={this._handleEditTypeChange.bind(this)} value={editType}>
        					<Radio key="a" value={1}>追加</Radio>
                            <Radio key="b" value={2}>回收</Radio>
        					<Radio key="c" value={3}>重置</Radio>
	      				</RadioGroup>
                	</p>)}
            	</div>	
          	</div>
		)
	}
});

function _shouldUpData (userId, roleId, editType) {
		var data = store.getState();
        const { roleTreeData } = data.dialogData
        const rootTableListData = data.rootTableListData
        var listallData = []
        var rootRolelist = []
        var roleNameList = []

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
                            rootTableListData[j].roleName = _getDataUnique(roleName)
                        }
                    }
                }
                break
            case 2:
                for (let j = 0; j < rootTableListData.length; j++) {
                    for (let i = 0; i < userId.length; i++) {
                        if (userId[i] === rootTableListData[j].userId) {
                            rootTableListData[j].roleName = _getDataReduce(rootTableListData[j].roleName, roleNameList)
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

        return rootTableListData

};

function _getDataUnique (data) {
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
};

function _getItemKey (checkedKeys, len) {
    let itemsKey = []
    if (checkedKeys.length > 0) {
    	for (let n = 0; n < checkedKeys.length; n++) {
        	if (checkedKeys[n].length === len || checkedKeys[n].length > len) {
            	itemsKey.push(checkedKeys[n])
        	}
    	}
    }
    
    return itemsKey
};

function _arrayCopy (data) {
    var copyData = []
    for (var i = 0; i < data.length; i++) {
        copyData.push(data[i])
    }
    return copyData
}

function _getDataReduce (data, reduceData) {
    let newData = _arrayCopy(data)
    let newReduceData = _arrayCopy(reduceData)
    for (let a = 0; a < newData.length; a++) {
        for (let b = 0; b < newReduceData.length; b++) {
            if (newData[a].name === newReduceData[b].name) {
                newData.splice(a, 1)
                newReduceData.splice(b, 1)
            }
        }
    }
    return newData
};

function dialogRender(dialogData, callback) {
    dispatch('GETDIALOGMDATA', dialogData);
    let title = dialogData.dialogData.rootEditType === 3 ? 
                    "module.role-edit-reset" :
                    "module.role-edit"
    Dialog.build({
        title: window.i18n.t(title),
        content: '<div id="root-dialog-wrap"></div>',
        width: 650,
        minHeight: 500,
        rightBtn: window.i18n.t("module.finish-btn"),
        leftBtn: window.i18n.t("module.cancel-btn"),
        rightBtnCallback: function() {
            var state = store.getState();
        	let roleRootEditItem = state.dialogData.roleRootEditItem
        	let roleTreeData = state.dialogData.roleTreeData
        	let editType = state.rootEditType
            let rootCheckedKeys = state.rootCheckedKeys

        	let roleId = []
        	let userId = []
        	let checkedKeys = state.radioValue === 1 ? state.ordinaryCheckedKeys : state.managerCheckedKeys
        	let secondItemKey = _getItemKey(checkedKeys, 2)

        	if (typeof roleRootEditItem !== 'undefined' && roleRootEditItem.length > 0) {
            	for (let k = 0; k < roleRootEditItem.length; k++) {
                	userId.push(roleRootEditItem[k].userId)
            	}
        	} else {
            	userId.push(roleRootEditItem.userId)
        	}

        	if (roleRootEditItem !== {}) {
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

            	if (roleId.length === 0 && userId.length > 1) {
               	 	Notify.show({
                    	title: i18n.t('info.notify-choose-role'),
                    	type: "info"
                	});
            	} else {
                    let postData = {
                        userid: userId,
                        roleid: roleId,
                        type: editType
                    }
                    let editMsg
                    switch (editType) {
                        case 1:
                            editMsg = "info.dialog-edit-add"
                            break
                        case 2:
                            editMsg = "info.dialog-edit-recycle"
                            break
                        case 3:
                            editMsg = "info.dialog-edit-reset"
                            break
                    }
                    var msg = i18n.t(editMsg)
                    bootbox.confirm(msg, function(rlt) {
                        if (rlt) {
                            $.post("/userrole/updateuserrole", {
                                userid: userId,
                                roleid: roleId,
                                type: editType
                            }, function(rsp) {
                                if (rsp.code == 0) {
                                    Notify.show({
                                        title: i18n.t('info.notify-editerolesuccess'),
                                        type: "success"
                                    });
                        
                                    var rootTableListData = _shouldUpData(userId, roleId, editType);
                                    if (callback) {
                                        callback({
                                            rootTableListData: rootTableListData,
                                            rootCheckedKeys: rootCheckedKeys
                                        });
                                    }

                                } else {
                                    Notify.show({
                                        title: i18n.t('info.notify-editrolefailed'),
                                        type: "danger"
                                    });
                                }
                            }, 'json');
                        }
                        $.magnificPopup.close();
                    })
            	}
        	}
        }
    }).show(function() {
        $('#nv-dialog-body').addClass('pn');
        ReactDOM.render(<Provider.default><DialogContent /></Provider.default>, document.getElementById('root-dialog-wrap'));
    })
}


module.exports.render = dialogRender

