import React from 'react';
import {render} from 'react-dom';
import {store} from '../store';
import { Tree, Button , Input} from 'antd';
const TreeNode = Tree.TreeNode;
const Search = Input.Search;


class PeoplePanel extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            searchValue: '',
            dataList: this.props.allPeople,
            checkedKeys: this.props.checkedKeys,
            expandedKeys:this.props.expandedKeys,
            selectedKeys:[],
            autoExpandParent: true
        };

    }


    componentWillReceiveProps(nextProps, nextState) {
        if (typeof nextProps !== 'undefined' &&
            nextProps !== this.props &&
            typeof nextState.dataList !== 'undefined' &&
            nextState.dataList.length > 0) {
            this.setState({
                dataList: nextState.dataList
            })
        }
    }

    componentDidMount() {

    }

    _handleInputChange(e){
        let searchValue = e.target.value.trim();
        if (this.state.searchValue == searchValue) {
            return;
        }
        let dataList = this.props.allPeople;
        let expandedKeysCopy = []
        let copyData = JSON.parse(JSON.stringify(dataList))

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

        if (value !== '') {
            function _getExpendKeys (data, departmentKey) {
                if (data.length > 0) {
                    for (let i = 0; i < data.length; i++) {
                        if (data[i].title.indexOf(value) > -1) {
                            if (data[i].extraClasses === 'nv-department') {
                                expandedKeysCopy.push(data[i].key)
                            } else if (expandedKeysCopy.indexOf(departmentKey) < 0) {
                                expandedKeysCopy.push(departmentKey)
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

        if (expandedKeysCopy.length > 0) {
            _getCopyDataSplice(copyData)
        }

        this.setState({
            expandedKeys: expandedKeysCopy.length > 0 ? expandedKeysCopy : ['dep--1'],
            searchValue: value,
            autoExpandParent: true,
            dataList: value !== '' ? copyData : dataList,
            checkedKeys: []
        });
    }

    onExpand(expandedKeys) {
        this.setState({
            expandedKeys,
            autoExpandParent: false,
        });
    }


    onCheck(checkedKeys){
        this.setState({
            checkedKeys
        });
        let getUserKeys = [];
        _.each(checkedKeys, item => {
            if(item.substr(0,3) !== "dep"){
                getUserKeys = [
                    ...getUserKeys,
                    item
                ]
            }
        })
        store.dispatch({type: 'CHECKKEYS_GET', checkedUserKeys: getUserKeys})
    }

    onSelect(selectedKeys, info){
        let getKey = info.node.props.eventKey;
        const { expandedKeys } = this.state;
        let index = expandedKeys.indexOf(getKey);
        this.setState({
            expandedKeys: index > -1? [...expandedKeys.slice(0,index),...expandedKeys.slice(index+1)]:[...expandedKeys, getKey] ,
            autoExpandParent: false,
            selectedKeys
        });
    }

    _handleSubmitClick(keysValue){
        let userId = [];
        let userName = [];
        _.each(keysValue, item => {
            let user = item.split(':');
            userId = [
                ...userId,
                user[0]
            ];
            userName = [
                ...userName,
                user[1]
            ]
        })
        store.dispatch({type: 'USERID_GET', userId: userId});
        store.dispatch({type: 'USERNAME_GET', userName: userName});
        store.dispatch({type: 'CHANGE_PEOPLEPANEL', showPeoplePanel: false});
    }

    _handleCancelClick(){
        this.setState({
            checkedKeys:[]
        });
        store.dispatch({type: 'USERID_GET', userId: []});
        store.dispatch({type: 'USERNAME_GET', userName: []});
        store.dispatch({type: 'CHECKKEYS_GET', checkedKeys: []})
        store.dispatch({type: 'CHANGE_PEOPLEPANEL', showPeoplePanel: false})
    }

    render() {

        const { checkedUserKeys} = this.props;
        const { dataList, searchValue, checkedKeys, expandedKeys, selectedKeys, autoExpandParent } = this.state
        const loop = data => data.map((item) => {
            const index = item.title.search(searchValue);
            const beforeStr = item.title.substr(0, index);
            const afterStr = item.title.substr(index + searchValue.length);
            const title = index > -1 ? (
                 <span style={{fontSize:'14px',color:'rgba(0,0,0,1)'}}>
                      {beforeStr}
                      <span style={{ color: '#f50' }}>{searchValue}</span>
                      {afterStr}
                </span>
                ) : <span style={{fontSize:'14px',color:'rgba(0,0,0,1)'}}>{item.title}</span>;
            if (item.children && item.children.length>0) {
                return <TreeNode
                    title={
                        <span>
                             <span className="fa fa-building-o root-list-icon">
                                 <span>{title}</span>
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
                            <span>{title}</span>
                       </span>
                    </span>}
                key={item.extraClasses=="nv-department"? item.key : `${item.userId}:${item.userName}`}
            />;
        });


        return (
           <div className="people-panel-wrap">
               <div className="input-wrap">
                   <Input
                       value={searchValue}
                       onChange={this._handleInputChange.bind(this)}
                       onPressEnter={this._handleInputChange.bind(this)}
                   />
               </div>
               <div className="people-panel-content">
                   <Tree
                       checkable
                       onCheck={this.onCheck.bind(this)}
                       onExpand={this.onExpand.bind(this)}
                       onSelect={this.onSelect.bind(this)}
                       checkedKeys={checkedKeys}
                       expandedKeys={expandedKeys}
                       selectedKeys={selectedKeys}
                       autoExpandParent={autoExpandParent}
                   >
                       { loop(dataList)}
                   </Tree>
               </div>
               <div className="people-panel-bton">
                   <Button onClick={this._handleSubmitClick.bind(this,checkedUserKeys)} type="primary" className="submit-btn">确定</Button>
                   <Button onClick={this._handleCancelClick.bind(this)} type="primary" className="submit-btn margin-left20">取消</Button>
               </div>
           </div>
        )
    }
}

export default PeoplePanel