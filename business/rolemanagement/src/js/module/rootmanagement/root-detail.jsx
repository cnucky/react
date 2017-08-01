import React from 'react';
import {render} from 'react-dom';
import {store} from '../store';
import { Input } from 'antd';
import DetailList from './detail-list';
import DetailRole from './detail-role';
import DetailTable from './detail-table';


class RootDetail extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            rootTableListData: []
        }
    }


    componentWillReceiveProps(nextProps) {
        if (typeof nextProps !== 'undefined' &&
            typeof nextProps.listallData !== 'undefined' &&
            typeof nextProps.rootTableListData !== 'undefined') {
            this.setState({
                rootTableListData: nextProps.rootTableListData,
                listallData: nextProps.listallData
            })
        }
    }

    componentDidMount() {
        var roleTreeData = []
        $.getJSON("/userrole/list", function(rsp) {
            if (rsp.code == 0) {
                roleTreeData = rsp.data;
            }
            for (let fIndex = 0; fIndex < roleTreeData.length; fIndex++) {
              roleTreeData[fIndex].isChecked = false
              roleTreeData[fIndex].key = `${fIndex}`
              if (typeof roleTreeData[fIndex].children !== 'undefined' && roleTreeData[fIndex].children.length > 0) {
                for (let sIndex = 0; sIndex < roleTreeData[fIndex].children.length; sIndex++) {
                  roleTreeData[fIndex].children[sIndex].isActive = true
                  roleTreeData[fIndex].children[sIndex].isChecked = false
                  roleTreeData[fIndex].children[sIndex].key = `${fIndex}${sIndex}`
                }
              }
            }
            store.dispatch({type: 'GETROLETREEDATA', roleTreeData: roleTreeData})
        });
    }

    componentWillUnmount() {
        let listRoleDetail = this.state.listRoleDetail;
        store.dispatch({type: 'GETLISTROLEDETAIL', listRoleDetail: listRoleDetail})
    }

    _handleFilterData (data, value, rootTableListData) {
        if (value !== '') {
            this.setState({
                listallData: data.length > 0 ? data : this.props.listallData,
                rootTableListData: rootTableListData
            })
        } else {
            this.setState({
                listallData: this.props.listallData,
                rootTableListData: this.props.rootTableListData
            })
        }
    }

    _handleOnCheck (data) {
        if (typeof data !== 'undefined' &&
            typeof data.checkedKeys !== 'undefined' &&
            typeof data.rootTableListData !== 'undefined') {
            this.setState({
                rootTableListData: data.rootTableListData,
                rootCheckedKeys: data.checkedKeys
            })
        }
    }

    _updataRoleDetail (listRoleDetail) {
        this.setState({
            listRoleDetail: listRoleDetail
        })
    }

	render() {
        const { roleTreeData, roleRootEditItem, rootEditType, rootExpandedKeys, rootTableListData } = this.props
        const { rootCheckedKeys, height } = this.props
        const { listRoleDetail, listallData } = this.state

		return (
			<div className="root-wrap">
            	<div className="lf list-wrap content-wrap-common">
                    <DetailList
                        rootCheckedKeys={rootCheckedKeys}
                        handleFilterData={this._handleFilterData.bind(this)}
                        handleOnCheck={this._handleOnCheck.bind(this)}
                        height={height}
                        rootTableListData={typeof this.state.rootTableListData !== 'undefined' ? this.state.rootTableListData : rootTableListData}
                        listallData={listallData}
                        listallDataCopy={this.props.listallData}
                        rootExpandedKeys={rootExpandedKeys}
                    />
                </div>
                
                <div className="lf table-wrap content-wrap-common">
                    <DetailTable
                        updataRoleDetail={this._updataRoleDetail.bind(this)}
                        rootTableListData={typeof this.state.rootTableListData !== 'undefined' ? this.state.rootTableListData : rootTableListData}
                        rootCheckedKeys={typeof this.state.rootCheckedKeys !== 'undefined' ? this.state.rootCheckedKeys : rootCheckedKeys}
                        height={height}
                        roleTreeData={roleTreeData}
                    />
                    
                </div>
                <div className="lf role-detail-wrap content-wrap-common">
                    <DetailRole
                        listRoleDetail={typeof listRoleDetail !== 'undefined' ? listRoleDetail : this.props.listRoleDetail}/>
                </div>
                
			</div>
		)
	}
}

export default RootDetail



