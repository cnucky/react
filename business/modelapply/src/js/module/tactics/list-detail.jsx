import React from 'react';
import {render} from 'react-dom';
import {store} from './store';
import { Provider } from 'react-redux';
import { Input } from 'antd';
var Dialog = require('nova-dialog');
var Notify = require('nova-notify');
initLocales(require.context('../../../locales/tactics', false, /\.js/), 'zh');

const inputStyle = {
    width: '100px', size: 'small',
    backgroundColor: 'transparent',
    borderColor: 'rgba(255, 255, 255, 0.5)',
    color: '#fff'
}

class ListDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentTab: 'used',
            editType: 'add',
            showIcons: false
        }
    }

    componentWillReceiveProps(nextProps) {
        /*if (typeof this.state.tacticsTypesRender !== 'undefined' &&
            this.state.tacticsTypesRender !== nextProps.tacticsTypesRender) {
            this.setState({
                tacticsTypesRender: nextProps.tacticsTypesRender
            })
        }*/
    }

    componentDidUpdate() {
        $('#input').focus()
    }
    componentDidMount() {
        let showIcons
        let _this = this
        $.getJSON('/workspacedir/checkPermissions', {
            permissions: ['10000:function:tacticsMgr']
        }).done(function(rsp) {
            if (rsp.code == 0) {
                showIcons = true
            } else {
                showIcons = false
            }
            _this.setState({
                showIcons: showIcons
            })
        })
    }


    onTabChanged(tab) {
        this.setState({
            currentTab: tab
        });
        store.dispatch({
            type: 'GET_MODELTYPE',
            modelType: tab
        })
    }

    _getCount(typeName) {
        const { modelAllData, tacticsTypes, modelData } = this.props
        let count = 0
        _.each(modelAllData, function(dataItem, index) {
            if (dataItem.label == typeName) {
                count = dataItem.data.length
            }
        })
        return count
    }

    _handleAddClick() {
        let tacticsTypesRender = typeof this.state.tacticsTypesRender !== 'undefined' ?  this.state.tacticsTypesRender : this.props.tacticsTypesRender
        if (tacticsTypesRender[tacticsTypesRender.length - 1].label !== '') {
            tacticsTypesRender.push({
                label: '',
                isEdit: true
            })
        } else {
            tacticsTypesRender = tacticsTypesRender.slice(0, tacticsTypesRender.length - 1)
        }
        this.setState({
            tacticsTypesRender: tacticsTypesRender,
            editType: 'add'
        })
    }

    _handleEditClick() {
        const {modelType} = this.props
        let tacticsTypesRender = typeof this.state.tacticsTypesRender !== 'undefined' ? this.state.tacticsTypesRender : this.props.tacticsTypesRender
        _.each(tacticsTypesRender, function(typeItem, typeIndex) {
            if (typeItem.label == modelType) {
                tacticsTypesRender[typeIndex].isEdit = !tacticsTypesRender[typeIndex].isEdit
            }
        })
        this.setState({
            tacticsTypesRender: tacticsTypesRender,
            editType: 'edit'
        })
    }

    _buildDialog(typeName, rightBtnClick, modifyType, leftBtnClick) {
        let title = modifyType == 'delete' ? '删除模型类型' : modifyType == 'add' ? '添加模型类型' : '编辑模型类型'
        Dialog.build({
            title: title,
            content: '<div id="root-dialog-wrap">是否' + title + '：' + typeName + '？</div>',
            width: 400,
            minHeight: 150,
            rightBtn: i18n.t("module.finish-btn"),
            leftBtn: i18n.t("module.cancel-btn"),
            rightBtnCallback: function() {
                rightBtnClick($.magnificPopup)
            },
            leftBtnCallback: function() {
                leftBtnClick($.magnificPopup)
            }
        }).show(function() {
            $('#root-dialog-wrap').addClass('pn');
        })
    }

    _handleDeleteClick(magnificPopup) {
        let typeIds = []
        let typeName = this.props.modelType
        let tacticsTypesRender = typeof this.state.tacticsTypesRender !== 'undefined' ? this.state.tacticsTypesRender : this.props.tacticsTypesRender
        let _this = this
        this._buildDialog(typeName, _rightBtnClick, 'delete', _leftBtnClick)

        _.each(tacticsTypesRender, function(typeItem, typeIndex) {
            if (typeName == typeItem.label) {
                typeIds.push(typeItem.typeId)
            }
        })
        function _leftBtnClick(magnificPopup) {
            magnificPopup.close()
        }

        function _rightBtnClick(magnificPopup) {
            let modify = {
                    typeIds: typeIds
            }
            let url = 'deleteTacticsType'
            $.post('/modelapply/modelapply/deleteTacticsType', modify, function (rsp) {
                if(rsp.code == 0){
                    $.post('/modelapply/modelapply/getCuringType',{
                    },function (rsp) {
                        if(rsp.code == 0){
                            let tacticsTypes = rsp.data.tacticsTypes;
                            store.dispatch({type: 'GET_TACTICSTYPES', tacticsTypes: tacticsTypes, modelType: 'all'})
                        } else {
                            Notify.simpleNotify('错误', '没有获取类型', 'error');
                        }
                    },'json');
                    Notify.simpleNotify('正确', '删除成功', 'success');
                } else if (rsp.code == 2) {
                    if (_.isEmpty(rsp.data)) {
                        Notify.simpleNotify('错误', typeName + '失败', 'error');
                    } else {
                        Notify.simpleNotify('错误', rsp.message + '失败', 'error');
                    }
                }  else {
                    Notify.simpleNotify('错误', rsp.message, 'error');
                }
            },'json');
            _this.setState({
                editType: 'delete'
            })
            magnificPopup.close()
        }
    }

    _handelOnBour(item, e) {
        let value = e.target.value
        let tacticsTypesRender = this.state.tacticsTypesRender
        let tacticstypes = this.props.tacticsTypes
        let editType = this.state.editType
        let typeName = value
        let _this = this
        let tacticsTypes = []
        let modify
        let isRepeat = false

        this._buildDialog(typeName, _rightBtnClick, editType, _leftBtnClick)
        if (editType == 'add') {
            modify = {
                typeName: value
            }
        } else if(editType == 'edit') {
            let typeId
            _.each(tacticsTypesRender, function(typeItem, typeIndex) {
                if (_this.props.modelType == typeItem.label) {
                    typeId = typeItem.typeId
                }
            })
            modify = {
                typeName: value,
                typeId: typeId
            }
        }
        function _leftBtnClick(magnificPopup) {
            _.each(tacticsTypesRender, function(typeItem, typeIndex) {
                if (typeItem.isEdit) {
                    typeItem.isEdit = false
                }
            })
            _this.setState({
                tacticsTypesRender: tacticsTypesRender
            })
            magnificPopup.close()
        }
        function _rightBtnClick(magnificPopup) {
            if (value == '') {
                Notify.show({
                    title: '请填写类型名称',
                    type: 'info'
                })
                return
            } else {
                isRepeat = _.find(tacticstypes, function(typeItem, typeIndex) {
                    if (typeItem.typeName == value || value == ('常用模型' || '所有模型')) {
                        Notify.show({
                            title: '类型名称重复',
                            type: 'info'
                        })
                        return true
                    }
                });
                if (isRepeat) {
                    editType == 'add' ?
                    magnificPopup.close() :
                    _leftBtnClick(magnificPopup);
                    return
                }
                let url = editType === 'add' ? 'createTacticsType' : 'modifyTacticsTypeName'
                $.post('/modelapply/modelapply/' + url, modify, function (rsp) {
                    if(rsp.code == 0){
                        $.post('/modelapply/modelapply/getCuringType',{
                        },function (rsp) {
                            if(rsp.code == 0){
                                tacticsTypes = rsp.data.tacticsTypes;
                                store.dispatch({type: 'GET_TACTICSTYPES', tacticsTypes: tacticsTypes, modelType: value})
                            } else {
                                Notify.simpleNotify('错误', '没有获取类型', 'error');
                            }
                        },'json');
                        _.each(tacticsTypesRender, function(typeItem, typeIndex) {
                            if (item.label == typeItem.label) {
                                tacticsTypesRender[typeIndex].label = value
                                tacticsTypesRender[typeIndex].isEdit = false
                                _this.setState({
                                    tacticsTypesRender: tacticsTypesRender
                                })
                            }
                        })
                        Notify.simpleNotify('正确', typeName + '成功', 'success');
                    } else if (rsp.code == 1) {
                        Notify.simpleNotify('错误', rsp.message + '失败', 'error');
                        _leftBtnClick(magnificPopup);
                    } else {
                        _leftBtnClick(magnificPopup)
                        Notify.simpleNotify('错误', rsp.message + '失败', 'error');
                    }
                },'json');
                magnificPopup.close()
            }
        }
    }

    render() {
        const { tacticsTypes, modelData, tacticsFavor, modelType, tacticsTypesRender } = this.props;
        let selfType = modelType !== 'all' && modelType !== 'used'
        let showIcons = this.state.showIcons
        let tabs = [];
        let types = typeof this.state.tacticsTypesRender !== 'undefined' ? this.state.tacticsTypesRender : tacticsTypesRender
        let editType = this.state.editType

        _.each(types, (cfg, index)=>{
            let isActive = modelType == cfg.label;
            let isEdit = cfg.isEdit
           
            tabs.push(
                <li key={index}>
                    {!isEdit ? <a
                        className={isActive ? 'tab-wrap ' : ''} style={{}}
                        onClick={(() => this.onTabChanged(cfg.label))}
                        title={cfg.label}
                    >
                        <div style={{textAlign:'center',minWidth: '40px',width:'94px',maxWidth: '131px',height:'52px',margin: 'auto'}}>
                            <div className='text-ellipsis' style={{width:'auto',maxWidth:95,display:'table-cell',heigt:'52px'}}>
                                <span> {cfg.label}  </span>
                            </div>

                            <span style={{marginLeft:'5px',display:'table-cell',height:'52px'}}>({this._getCount(cfg.label)})</span>
                        </div>

                    </a> :
                    <p>
                        <Input
                            placeholder={editType == 'add' ? '添加' : '编辑'}
                            id="input"
                            style={inputStyle}
                            defaultValue={cfg.label}
                            onBlur={this._handelOnBour.bind(this, cfg)}
                            autofocus="autofocus"
                        />
                    </p>}
                </li>
            );
        }, this);
        return (
            <div className="list-detail" style={{height: '100%'}}>
                {/*<div className="list-title">
                    <h1 className="list-title-text">模型分类</h1>
                </div>*/}
                <div className="list-content">
                    <div className="set-icon-wrap" style={{display: showIcons ? 'block' : 'none'}}>
                        <span
                            title="添加"
                            className="add-icon set-icon"
                            onClick={this._handleAddClick.bind(this)}
                        >
                            <i className="fa fa-plus"></i>
                        </span>
                        {selfType ? <span
                            title="编辑"
                            className="edit-icon set-icon"
                            onClick={this._handleEditClick.bind(this)}
                        >
                            <i className="fa fa-edit"></i>
                        </span> : null}
                        {selfType ? <span
                            title="删除"
                            className="delete-icon set-icon"
                            onClick={this._handleDeleteClick.bind(this)}
                        >
                            <i className="fa fa-trash-o"></i>
                        </span> : null}
                    </div>
                    <ul className="tab-ul">
                        <li>
                            <a
                                className={modelType == 'used' ? 'tab-wrap' : ''}
                                onClick={(() => this.onTabChanged('used'))}
                                title="常用模型"
                                >
                                常用模型
                                <span style={{marginLeft:'10px'}}>{typeof tacticsFavor !== 'undefined' ? `(${tacticsFavor.length})` : null}</span>
                            </a>
                        </li>
                        <li>
                            <a
                                className={modelType == 'all' ? 'tab-wrap' : ''}
                                onClick={(() => this.onTabChanged('all'))}
                                title="所有模型"
                            >
                                所有模型
                                <span style={{marginLeft:'10px'}}>({modelData.length})</span>
                            </a>                            
                        </li>

                        {tabs}
                    </ul>
                </div>
            </div>
        )
    }
}

ListDetail.propTypes = {
        tacticsTypes: React.PropTypes.array,
        modelData: React.PropTypes.array
};

export default ListDetail


