import React from 'react';
import {render} from 'react-dom';
import {store} from '../store';


class DetailRole extends React.Component {
    
    constructor(props) {
        super(props);
        
    }


    componentWillReceiveProps(nextProps) {
        
    }

    componentDidMount() {
    }

    _getRoleType (roleType) {
        let type = ''
        switch (roleType) {
            case 0:
                type = '普通角色'
                break
            case 1:
                type = '用户管理员'
                break
            case 2:
                type = '授权管理员'
                break
            case 3:
                type = '日志管理员'
                break
            default:
                type = ''
        }
        return type
    }

    _handleRoleEditClick() {
        let tabsIcon = [{
            name: '权限管理',
            isActive: false
        }, {
            name: '角色管理',
            isActive: true
        }]
        store.dispatch({type: 'ROLEDETAIL_GET', roleDetailShow: true})
        store.dispatch({type: 'CHANGE_TABSICON', tabsIcon: tabsIcon, isShowRootTabs: false})
    }

	render() {
        const { listRoleDetail } = this.props
        var roleListData = {
            roleName: '',
            roleType: '',
            roleDesc: ''
        }
        if (typeof listRoleDetail !== 'undefined' && listRoleDetail.isOpen) {
            roleListData.roleName = listRoleDetail.roleName
            roleListData.roleType = this._getRoleType(listRoleDetail.roleType)
            roleListData.roleDesc = listRoleDetail.desc
        }

		return (
			<div className="role-detail-content" style={{display: typeof listRoleDetail !== 'undefined' && listRoleDetail.isOpen ? 'block' : 'none'}}>
            	<p className="role-title-wrap">
                    <span>角色详情</span>
                </p>
                <p className="role-name-wrap padding-left14">
                    <span className="role-name-title">角色名称：</span>
                    <span>{roleListData.roleName}</span>
                </p>
                <p className="role-name-wrap padding-left14">
                    <span className="role-name-title">角色类型：</span>
                    <span>{roleListData.roleType}</span>
                </p>
                <div className="role-des-wrap">
                    <p className="role-name-wrap">
                        <span className="role-name-title">角色描述：</span>
                    </p>
                    <p className="role-des-content">
                        {roleListData.roleDesc}
                    </p>
                </div>
                <div className="role-icon-wrap">
                    <span
                        onClick={this._handleRoleEditClick}
                        className="fa fa-hand-o-right role-edit-icon">
                    </span>
                </div>
			</div>
		)
	}
}

export default DetailRole


