import React from 'react';
import {render} from 'react-dom';
import {store} from '../store';
import { Button, Tree, Input } from 'antd';
const TreeNode = Tree.TreeNode;
const Search = Input.Search;


class DetailList extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            treeVisible: true,
            searchValue: '',
            autoExpandParent: true,
            checkedKeys: [],
            selectedKeys: [],
            filterKeys: [],
            listallDataPreStatus: 0 //0: 加载中, 1: 没有数据
        }
    }


    componentWillReceiveProps(nextProps, nextState) {
        if (typeof this.state.listallDataPreStatus !== 'undefined' &&
            this.state.listallDataPreStatus === 0 &&
            typeof this.props.listallData !== 'undefined') {
            this.setState({
                listallDataPreStatus: this.props.listallData.length > 0 ? 0 : 1
            })
        }
    }

    componentDidMount() {
       const { rootExpandedKeys, rootCheckedKeys, listallData } = this.props
       if (rootExpandedKeys && rootCheckedKeys) {
            this.setState({
                checkedKeys: rootCheckedKeys,
                expandedKeys: rootExpandedKeys,
                listallData: listallData
            })
       }
    }

    componentWillUnmount() {
        store.dispatch({type: 'GETROOTEXPENDKEYS', rootExpandedKeys: this.state.expandedKeys, rootCheckedKeys: this.state.checkedKeys})
    }

    _getExpendKeys (data) {
        let keys = []
        for (let i = 0; i < data.length; i++) {
            keys.push(data[i].key)
        }
        return keys
    }

    _handleClearBtnClick () {
        if (this.state.searchValue !== '') {
            this.setState({
                searchValue: '',
                expandedKeys: ['dep--1'],
                filterKeys: [],
                checkedKeys: [],
                // listallData: this.props.listallData
            })
            if (this.props.handleFilterData) {
                this.props.handleFilterData(this.props.listallData, '', this.props.rootTableListData)
            }
        }
       
    }

    _handleInputChange (e) {
        let searchValue = e.target.value.trim();
        if (this.state.searchValue == searchValue) {
            return;
        }

        var value
        if (searchValue.indexOf('\\') > -1) {
            let valueArray = searchValue.split('\\')
            value = ''
            for (let v = 0; v < valueArray.length; v++) {
                value += valueArray[v]
            }
        } else {
            value = searchValue
        }
        let dataList = this.props.listallDataCopy
        let expandedKeys = []
        var copyData = JSON.parse(JSON.stringify(dataList))

        if (value !== '') {
            function _getExpendKeys (data, departmentKey) {
                if (data.length > 0) {
                    for (let i = 0; i < data.length; i++) {
                        if (data[i].title.indexOf(value) > -1) {
                            expandedKeys.push(data[i].key)
                            if (data[i].extraClasses === 'nv-department-people' &&
                                expandedKeys.indexOf(departmentKey) < 0) {
                                expandedKeys.push(departmentKey)
                            }
                        }
                        if (data[i].children) {
                            _getExpendKeys(data[i].children, data[i].key)
                        }
                    }
                }
            }
            _getExpendKeys(dataList, 'dep--1')
        }

        function _getCopyDataSplice (data) {
            if (typeof data !== 'undefined' && data.length > 0) {
               for (let o = 0, flag = true; o < data.length; flag ? o++ : o) {
                    var isKey = data[o].title.indexOf(value) > -1
                    if (data[o].children && data[o].children.length > 0) {
                        _getCopyDataSplice(data[o].children)
                        flag = true
                    } else {
                        if (isKey || data[o].key === 'dep--1') {
                            flag = true
                        } else {
                            data.splice(o, 1)
                            flag = false
                        }
                    }
                    if (typeof data[o] !== 'undefined' &&
                        data[o].children &&
                        data[o].children.length === 0 &&
                        !isKey &&
                        data[o].key !== 'dep--1') {
                        data.splice(o, 1)
                        flag = false
                    }
                }
            } 
        }
        if (expandedKeys.length > 0) {
            _getCopyDataSplice(copyData)
            expandedKeys.indexOf('dep--1') > -1 ? '' : expandedKeys.push('dep--1')
        }
        let rootTableListData = this.props.rootTableListData
        let listallData = this.props.listallData
        let checkedKeys = this.state.checkedKeys
        let listallKeys = []
        function _getListallKeys (data) {
            if (typeof data !== 'undefined' && data.length > 0) {
                for (let k = 0; k < data.length; k++) {
                    if (data[k].children) {
                        _getListallKeys(data[k].children)
                    } else {
                        listallKeys.push(data[k].key)
                    }
                }
            }
        }

        _getListallKeys(copyData)

        if (checkedKeys && checkedKeys.length > 0 && listallKeys.length > 0) {
            rootTableListData = this._getRootTableListDataIsChecked(this.props.rootTableListData, false)
            for (let i = 0; i <  rootTableListData.length; i++) {
                for (let j = 0; j < checkedKeys.length; j++) {
                    let isfilter = value !== '' ? checkedKeys[j] === rootTableListData[i].key && listallKeys.indexOf(checkedKeys[j]) > -1 : checkedKeys[j] === rootTableListData[i].key
                    if (isfilter) {
                        rootTableListData[i].isChecked = true
                    }
                }
            }
        }

        // store.dispatch({type: 'GETROOTTABLEDATA', rootTableListData: this.props.rootTableListData})
        if (this.props.handleFilterData) {
            this.props.handleFilterData(copyData, value, rootTableListData)
        }

        this.setState({
            treeVisible: true,
            expandedKeys: expandedKeys.length > 0 ? expandedKeys : ['dep--1'],
            filterKeys: expandedKeys,
            searchValue: value,
            autoExpandParent: true,
            checkedKeys: ['']
        });

    }
    _getRootTableListDataIsChecked (data, isFalse) {
        for (let n = 0; n < data.length; n++) {
            data[n].isChecked = isFalse
        }
        return data
    }

    _onCheck (checkedKeys, info) {
        let rootTableListData = this._getRootTableListDataIsChecked(this.props.rootTableListData, false)
        let listallData = this.props.listallData
        let listallKeys = []
        function _getListallKeys (data) {
            if (typeof data !== 'undefined' && data.length > 0) {
                for (let k = 0; k < data.length; k++) {
                    if (data[k].children) {
                        _getListallKeys(data[k].children)
                    } else {
                        listallKeys.push(data[k].key)
                    }
                }
            }
        }
        _getListallKeys(listallData)

        if (checkedKeys && checkedKeys.length > 0 && listallKeys.length > 0) {
            for (let i = 0; i <  rootTableListData.length; i++) {
                for (let j = 0; j < checkedKeys.length; j++) {
                    if (checkedKeys[j] === rootTableListData[i].key && listallKeys.indexOf(checkedKeys[j]) > -1) {
                        rootTableListData[i].isChecked = true
                    }
                }
            }
        }

        this.setState({
            checkedKeys: checkedKeys.length > 0 ? checkedKeys : ['']
        })
        if (this.props.handleOnCheck) {
            this.props.handleOnCheck({rootTableListData: rootTableListData, checkedKeys: checkedKeys})
        }
        // store.dispatch({type: 'GETROOTTABLEDATA', rootTableListData: rootTableListData, rootCheckedKeys: checkedKeys})
    }

    _onExpand (expandedKeys) {
        this.setState({
            expandedKeys,
            autoExpandParent: false
        });
    }

    _onSelect (selectedKeys, info) {
        let expandedKeys = this.state.expandedKeys
        let exSelectedKeys = this.state.selectedKeys
        let key = info.node.props.eventKey
        let index = expandedKeys.indexOf(key)
        /*if (keys.length > 0) {
            for (let s = 0; s < keys.length; s++) {
                let index = expandedKeys.indexOf(keys[s])
                if (index > -1) {
                    expandedKeys.splice(index, 1)
                } else {
                    expandedKeys.push(keys[s])
                }
            }
        }*/
        this.setState({
            selectedKeys: selectedKeys,
            expandedKeys: index > -1 ? [...expandedKeys.slice(0, index), ...expandedKeys.slice(index + 1)] : [...expandedKeys, key],
            autoExpandParent: false
        })
    }

    _getListTreestyle (extraClasses) {
        let cname = ''
        switch (extraClasses) {
            case 'nv-department':
                cname = 'fa fa-building-o root-list-icon'
                break
            case 'nv-department-people':
                cname = 'imoon imoon-user2 root-list-icon'
                break
        }
        return cname
    }

	render() {
        const { rootExpandedKeys, height, listallData } = this.props
        const { searchValue, selectedKeys, checkedKeys, expandedKeys, filterKeys, listallDataPreStatus } = this.state
        var firstFloorCheckedStyle
        var secondFloorCheckedStyle

        const loop = data => data.map((item) => {
            const index = item.title.search(searchValue);
            const beforeStr = item.title.substr(0, index);
            const afterStr = item.title.substr(index + searchValue.length);
            const title = index > -1 ? (
            <span>
                {beforeStr}
                <span style={{ color: '#f50' }}>{searchValue}</span>
                    {afterStr}
                </span>
            ) : <span>{item.title}</span>;
            if (item.children) {
                return (
                    <TreeNode
                        key={item.key}
                        title={<span style={{fontSize: '14px'}} className={this._getListTreestyle(item.extraClasses)}><span>{title}</span></span>}>
                        {loop(item.children)}
                    </TreeNode>
                );
            }
            return <TreeNode
                        key={item.key}
                        title={<span style={{fontSize: '14px'}} className={this._getListTreestyle(item.extraClasses)}><span>{title}</span></span>} />;
        });

        let nodes = listallData && listallData.length > 0 ? loop(listallData) : [];

		return (
            <div className="left-wrap">
                <div className="row mt10 pt10 mln mrn">
                    <div className="input-wrap lf">
                        <input
                            width='163'
                            data-i18n="[placeholder]usermanage.holder-filter"
                            onChange={this._handleInputChange.bind(this)}
                            onPressEnter={this._handleInputChange.bind(this)}
                            value={this.state.searchValue}
                            size="large"
                            className="form-control"
                            placeholder="过滤..."
                        />
                    </div>
                    <div className="btn-wrap lf">
                        <span
                            className="clear-btn"
                            onClick={this._handleClearBtnClick.bind(this)}
                            type="primary"
                            style={{color: this.state.searchValue !== '' ? '#fff' : '#fafafa'}}
                        >
                            清除
                            {/*<span style={{ marginLeft: 8, display: filterKeys.length > 0 ? 'inline-block' : 'none', color: '#fff'}}>({filterKeys.length}个)</span>*/}
                        </span>
                    </div>
                </div>
                <div className="row mt10 pt10 mln mrn list-tree-wrap" style={{height: `${height - 60}px`}}>
                    {listallData && listallData.length > 0 ?
                       (this.state.treeVisible ? <Tree
                            checkable
                            onCheck={this._onCheck.bind(this)}
                            onSelect={this._onSelect.bind(this)}
                            onExpand={this._onExpand.bind(this)}
                            expandedKeys={this.state.expandedKeys}
                            checkedKeys={this.state.checkedKeys}
                            autoExpandParent={this.state.autoExpandParent}
                            selectedKeys={this.state.selectedKeys}
                        >
                            {nodes}
                    </Tree> : '') : <span className="root-loading">{listallDataPreStatus === 0 ? '加载中......' : '暂时没有数据'}</span>}
                </div>
            </div>
        )
	}
}

export default DetailList



