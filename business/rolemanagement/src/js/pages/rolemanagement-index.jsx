// import TaskadminContent from '../module/taskadmin-content';
import React from 'react';
import ReactDOM from 'react-dom';
import {store} from '../module/store';
import PageContent from '../module/page-content';
import RootDialog from '../module/rootmanagement/root-dialog';
import RoleInit from '../module/rolemanagement/role-init';
import RoleCreate from '../module/rolemanagement/role-create';
import RoleEdit from '../module/rolemanagement/role-edit';

require ('./rolemanagement-index.less');

class RolemanagementWrapper  extends React.Component {
    
  constructor(props) {
        super(props);

    }

    componentDidMount() {
        this.unsubscribe = store.subscribe(() => {
            this.forceUpdate();
        });


        var listallData = []
        var rootRolelist = []
        var rootTableListData = []
        $.getJSON("/rolemanagement/userrole/departmentwithroles", function(rsp) {
            if (rsp.code == 0) {
                listallData = rsp.data;
            }
            store.dispatch({type: 'GETLISTALLDATA', allListData: {listallData: listallData, isFirstData: true}})
            // store.dispatch({type: 'GETLISTALLDATA', listallData: listallData})

        });
    }

    shouldComponentUpdate (nextProps, nextState) {
    }

    componentWillUpdate (nextProps, nextState) {
    }

    componentWillReceiveProps (nextProps) {
    }

    componentWillUnmount() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }

  render () {
    
    var state = store.getState();
    const { height, tabsIcon, isShowRootTabs, listallData, roleDetailShow, isLoodData, isLoodUser, listRoleDetail, rootTableListData , userExpandedKeys} = state
    const { rootDialogOpen, roleTreeData, roleRootEditItem, rootEditType, rootCheckedKeys, rootExpandedKeys, roleAddShow, userRoleIndex, userRoleType } = state
    const {roleUserData, activeKeys, tabActiveKey, userRoleData, userRoleName, userRoleDesc, roleEditShow, userRoleMember, isLoodAuth, roleNull} = state
    const {handleAuthorityData, dataAuthorityData, departmentAuthorityData, systemAuthorityData, commandAuthorityData } = state;
    const {handleCheckData, dataCheckData, departmentCheckData, systemCheckData, commandCheckData, commandTableCheckData} = state;
    const {handleNotData, dataNotData, departmentNotData, systemNotData, commandNotData, commandTableNotData} = state;

        return (
          <div className="url_wrap" style={{height: `${height}px`}}> 
                <PageContent
                  tabsIcon={tabsIcon}
                  height={height}
                  isShowRootTabs={isShowRootTabs}
                  listallData={listallData}
                  roleDetailShow={roleDetailShow}
                  isLoodData={isLoodData}
                  isLoodUser={isLoodUser}
                  listRoleDetail={listRoleDetail}
                  rootTableListData={rootTableListData}
                  rootDialogOpen={rootDialogOpen}
                  roleTreeData={roleTreeData}
                  roleRootEditItem={roleRootEditItem}
                  rootEditType={rootEditType}
                  rootCheckedKeys={rootCheckedKeys}
                  rootExpandedKeys={rootExpandedKeys}

                  userRoleIndex={userRoleIndex}
                  userRoleType={userRoleType}
                  roleUserData={roleUserData}
                  userExpandedKeys={userExpandedKeys}
                  activeKeys={activeKeys}
                  tabActiveKey={tabActiveKey}
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
                {rootDialogOpen ? <RootDialog
                    rootTableListData={rootTableListData}
                    roleRootEditItem={roleRootEditItem}
                    rootDialogOpen={rootDialogOpen}
                    roleTreeData={roleTreeData}
                    rootEditType={rootEditType}
                /> : ''}
              {roleNull ? <RoleInit
                      roleNull={roleNull}
                  />:''}
                {roleAddShow ? <RoleCreate
                    roleAddShow={roleAddShow}
                    userRoleIndex={userRoleIndex}
                    userRoleType={userRoleType}

                />:''}
              {roleEditShow?<RoleEdit
                      roleEditShow={roleEditShow}
                      userRoleMember={userRoleMember}
                      userRoleType={userRoleType}
                      userRoleName={userRoleName}
                      userRoleDesc={userRoleDesc}
                  />:''}
          </div>
        )
  }

}

ReactDOM.render(<RolemanagementWrapper />, document.getElementById('rolemanagement-content'));
hideLoader();