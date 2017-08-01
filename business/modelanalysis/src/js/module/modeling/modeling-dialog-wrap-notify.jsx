var React = require('react');
var ReactDOM = require('react-dom');
var Dialog = require('nova-dialog');
var Notify = require('nova-notify');
var redux = require('redux');
var bootbox = require('nova-bootbox-dialog');
var Provider = require('widget/i18n-provider');
import {render} from 'react-dom';
initLocales(require.context('../../../locales/modeling', false, /\.js/), 'zh');
import { Tree, Checkbox, Row, Col, Tag } from 'antd';
const TreeNode = Tree.TreeNode;

var state = {
	dialogData: {}
}
var reducer = function(state, action) {
	var newState = {}
    switch (action.type) {
        case 'GETVALUEDATA':
            newState.valueData = action.valueData
            return _.assign({}, state, newState);
        default:
            return state;
    }
}
var store = redux.createStore(reducer);

/******************************   DialogContent  ************************************/

var DialogContent = React.createClass({
    contextTypes: {
        i18n: React.PropTypes.object
    },

	getInitialState: function () {
		return {
            expandedKeys: [''],
            autoExpandParent: true,
            checkedKeys: [],
            selectedKeys: [''],
            valueData: [],
            isCheckedAll: true
		}
	},

    componentWillReceiveProps: function (nextProps) {
        
    },

    componentDidMount: function () {
    	if (typeof this.props.dialogData !== 'undefined' &&
            typeof this.props.dialogData.value !== 'undefined') {
            this.setState({
                valueData: this.props.dialogData.value
            })
        }
    },

    _getItem: function (item) {
        let itemList = (
            <div>
                {item.value}
            </div>
        )
        return itemList
    },

    _onCheck: function () {

    },

    _onSelect: function () {

    },

    _getCheckedAll: function (valueData) {
        let isCheckedAll = true
        for (let i = 0; i < valueData.length; i++) {
            if (!valueData[i].isChecked) {
                isCheckedAll = false
                break
            }
        }
        return isCheckedAll
    },

    _onChange: function (index) {
        const { valueData } = this.state
        let isChecked = !valueData[index].isChecked
        valueData[index].isChecked = isChecked
        let isCheckedAll = this._getCheckedAll(valueData)
        this.setState({
            valueData: valueData,
            isCheckedAll: isCheckedAll
        })
        store.dispatch({type: 'GETVALUEDATA', valueData: valueData});
    },

    _onCheckAll: function () {
        let isCheckedAll = !this.state.isCheckedAll
        const { valueData } = this.state
        for (let i = 0; i < valueData.length; i++) {
            valueData[i].isChecked = isCheckedAll
        }
        this.setState({
            isCheckedAll: isCheckedAll,
            valueData: valueData
        })
        store.dispatch({type: 'GETVALUEDATA', valueData: valueData});
    },

    _getCheckStyle: function (isTrue) {
        let checkStyle = isTrue ? 'check-box check-box-check' : 'check-box check-box-uncheck'
        return checkStyle
    },

    render() {
        const { dialogData } = this.props
        const { valueData } = this.state
        var value = typeof dialogData !== 'undefined' &&
                    typeof dialogData.value !== 'undefined' ? dialogData.value : []
        const { checkedKeys, isCheckedAll } = this.state

        const loop = data => data.map((item) => {
            let _this = this
            if (item.children) {
                return (
                    <TreeNode key={item.key} title={this._getItem(item)}>
                        {loop(item.children)}
                    </TreeNode>
                );
            }
            return <TreeNode key={item.key} title={this._getItem(item)} />;
        });
		return ( 
            <div className="dialog-wrap" style={{display: value.length > 0 ? 'block' : 'none'}}>
                <div className="dialog-title-wrap">{`重复出现：`}</div>
                {/*<Checkbox.Group onChange={this._onChange}>*/}
                <div className="checkedall-wrap" style={{display: 'none'}}>
                    {/*<Checkbox onChange={this._onCheckAll} checked={isCheckedAll} value='全选'>*/}
                    <div className="check-wrap" onClick={this._onCheckAll}>
                        <span className={this._getCheckStyle(isCheckedAll)}></span>
                        <span className="dialog-notify-value">全选</span>
                    </div>
                    {/*</Checkbox>*/}
                </div>
                <div className="dialog-detail-check-wrap" style={{display: 'none'}}>
                    {typeof valueData !== 'undefined' ? _.map(valueData, function(item, index) {
                        return (
                            <div key={item.key}>
                                {/*<Checkbox onChange={this._onChange.bind(this, index)} value={item.value} checked={item.isChecked}>*/}
                                <div  onClick={this._onChange.bind(this, index)} className="check-wrap">
                                    <span className={this._getCheckStyle(item.isChecked)}></span>
                                    <span className="dialog-notify-value">
                                        {item.value}
                                    </span>
                                    <span className="dialog-notify-times">重复出现<span className="num-box">{item.count}</span>次</span>
                                </div>
                                {/*</Checkbox>*/}
                            </div>
                        )
                    }, this) : ''}
                </div>
                <div className="dialog-detail-check-wrap">
                    {typeof valueData !== 'undefined' ? _.map(valueData, function(item, index) {
                        let num = (index + 1) % 5
                        let numBottom = valueData.length % 5
                        let borderColor
                        switch (num) {
                            case 1:
                                borderColor = '#70ca63'
                                break
                            case 2:
                                borderColor = '#3498db'
                                break
                            case 3:
                                borderColor = '#3bafda'
                                break
                            case 4:
                                borderColor = '#f6bb42'
                                break
                            case 0:
                                borderColor = '#967adc'
                                break
                        }
                        numBottom = valueData.length - numBottom
                        
                        return (
                            <div key={index}>
                                <p
                                    className="item-wrap" 
                                    style={{marginRight: '10px', marginBottom: index === valueData.length - 1 ? 0 : '10px', borderLeftColor: borderColor}}
                                >
                                    {/*<Tag color="pink">{item.value}</Tag>*/}
                                    {/*<span className="item-style lf"></span>*/}
                                    <span className="value-wrap">
                                        <b>{item.value}</b>
                                        出现
                                        <b>{item.count}</b>
                                        次
                                    </span>
                                    {/*<span className="item-style rt"></span>*/}
                                    {/*<Tag color="#fafafa">{item.count}</Tag>*/}
                                </p>
                            </div>
                        )
                    }, this) : ''}
                </div>
                {/*</Checkbox.Group>*/}
            </div>
		)
	}
});

function dialogRender(dialogData, callback) {
    store.dispatch({type: 'GETVALUEDATA', valueData: dialogData.value});

    var isTrue = true
    Dialog.build({
        title: i18n.t('modeling.modeling-dialog-notify-title'),
        content: '<div id="root-dialog-wrap"></div>',
        width: 650,
        minHeight: 400,
        rightBtn: i18n.t("finish-btn"),
        leftBtn: i18n.t("cancel-btn"),
        rightBtnCallback: function() {
            var state = store.getState()
            const { valueData } = state
            let filterValus = new Array()
            for (let i = 0; i < valueData.length; i++) {
                if (valueData[i].isChecked) {
                    filterValus.push(valueData[i].value)
                }
            }
            callback(filterValus)
            $.magnificPopup.close();
        }
    }).show(function() {
        $('#root-dialog-wrap').addClass('pn');
        ReactDOM.render(<Provider.default><DialogContent dialogData={dialogData} /></Provider.default>, document.getElementById('root-dialog-wrap'));
        
    })
}


module.exports.render = dialogRender