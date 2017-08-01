import React from 'react';
import {render} from 'react-dom';
import {store} from './store';
import RootDetail from './rootmanagement/root-detail';
import RoleManagementDetail from './rolemanagement/role-detail';

const paddingLeft = {
    paddingLeft: '10px'
}
const paddingRight = {
    paddingLeft: '28px'
}
const positionLeft = {
    left: '-6px'
}
const positionRight = {
    right: '-6px'
}

class PageContent extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            switchState: '权限管理',
            isShowRootTabs: true
        }
        
    }


    componentWillReceiveProps(nextProps) {
        if (typeof nextProps !=='undefined' &&
            typeof nextProps.rootCheckedKeys !== 'undefined' &&
            typeof nextProps.rootTableListData !== 'undefined') {
            let rootTableListData = nextProps.rootTableListData
            let rootCheckedKeys = nextProps.rootCheckedKeys
            for (let i = 0 ; i < rootTableListData.length; i++) {
                if (rootCheckedKeys.indexOf(rootTableListData[i].key) > -1) {
                    rootTableListData[i].isChecked = true
                }
            }
            this.setState({
                rootTableListData: rootTableListData
            })
        }
    }

    componentDidMount() {
    }

    _handleTabsIcon (iconItem, index) {
        let tabsIcon = this.props.tabsIcon
        for (let i = 0; i < this.props.tabsIcon.length; i++) {
            if (index === i) {
                tabsIcon[index].isActive = true
            } else {
                tabsIcon[i].isActive = false
            }
        }
        store.dispatch({type: 'CHANGE_TABSICON', tabsIcon: tabsIcon, isShowRootTabs: index === 0})
    }

    _handleSwitchBtn () {
        let tabsIcon = this.props.tabsIcon
        let isShowRootTabs = !this.props.isShowRootTabs
        tabsIcon[0].isActive = isShowRootTabs
        tabsIcon[1].isActive = !isShowRootTabs
        /* this.setState({
            switchState: switchState,
            isShowRootTabs: isShowRootTabs
        }) */
        store.dispatch({type: 'CHANGE_TABSICON', tabsIcon: tabsIcon, isShowRootTabs: isShowRootTabs})
    }

	render() {
        const { tabsIcon, height, roleDetailShow, isLoodData, isLoodUser, roleTreeData, listallData, rootTableListData, isShowRootTabs } = this.props
        const { roleRootEditItem, rootEditType, rootExpandedKeys, rootCheckedKeys, listRoleDetail ,isLoodAuth, userExpandedKeys} = this.props

        const {roleUserData, activeKeys, tabActiveKey, userRoleData, userRoleType, userRoleName, userRoleDesc, roleEditShow, userRoleIndex, userRoleMember} = this.props;
        const {handleAuthorityData, dataAuthorityData, departmentAuthorityData, systemAuthorityData, commandAuthorityData } = this.props;
        const {handleCheckData, dataCheckData, departmentCheckData, systemCheckData, commandCheckData, commandTableCheckData} = this.props;
        const {handleNotData, dataNotData, departmentNotData, systemNotData, commandNotData, commandTableNotData} = this.props;
        const { switchState } = this.state

		return (
			<div className="rolemanagement-content">
            	<div className="rm-tab-wrap">
                    <ul>
                        {/*_.map(tabsIcon, function(iconItem, index) {
                            return (
                                <li
                                    onClick={this._handleTabsIcon.bind(this, iconItem, index)}
                                    className="lf tabs-icon-wrap">
                                    <span
                                      style={{color: iconItem.isActive ? '#fff' : '#444', backgroundColor: iconItem.isActive ? '#2db7f5' : '#e8e7e7', boxShadow: iconItem.isActive ? '0 2px 4px 0 rgba(0, 0, 0, 0.5)' : ''}}>
                                      {iconItem.name}
                                    </span>
                                </li>
                            )
                        }, this)*/}
                        <li
                            onClick={this._handleSwitchBtn.bind(this)}
                            className="switch lf">
                            <i
                                className="switch-circle"
                                style={isShowRootTabs ? positionLeft : positionRight}>
                            </i>
                            <span style={!isShowRootTabs ? paddingLeft : paddingRight}>
                                {isShowRootTabs ? '权限管理' : '角色管理'}
                            </span>
                        </li>
                    </ul>
                </div>

                <div className="rolemanagement-contaner"  style={{height: `${height - 38}px`}}>
                    {isShowRootTabs ?
                      <RootDetail
                        height={height - 58}
                        rootExpandedKeys={rootExpandedKeys}
                        rootCheckedKeys={rootCheckedKeys}
                        rootEditType={rootEditType}
                        roleTreeData={roleTreeData}
                        rootTableListData={rootTableListData}
                        listRoleDetail={listRoleDetail}
                        roleRootEditItem={roleRootEditItem}
                        listallData={listallData} /> :
                      <RoleManagementDetail
                        height={height - 58}
                        isLoodData={isLoodData}
                        isLoodUser={isLoodUser}
                        roleDetailShow={roleDetailShow}
                        listRoleDetail={listRoleDetail}
                        userRoleIndex={userRoleIndex}
                        userRoleType={userRoleType}
                        roleUserData={roleUserData}
                        activeKeys={activeKeys}
                        tabActiveKey={tabActiveKey}
                        userExpandedKeys={userExpandedKeys}
                        isLoodAuth={isLoodAuth}
                        userRoleData={userRoleData}
                        userRoleName={userRoleName}
                        userRoleDesc={userRoleDesc}
                        roleEditShow={roleEditShow}
                        userRoleMember={userRoleMember}
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
                      />
                    }
                </div>
			</div>
		)
	}
}

export default PageContent


