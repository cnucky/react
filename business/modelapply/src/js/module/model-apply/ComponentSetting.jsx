var React = require('react');
var _ = require('underscore');
var MultiSelect = require('widget/multiselect');
var FancyTree = require('widget/fancytree');
var store = require('./model-apply-store');
var until = require('nova-utils');
const Notify = require('nova-notify');
var tagmanager = require('utility/tagmanager/tagmanager');
//data & mock data
const OPR_MAP = {
    stringOpr: [{key: 'equal', name: '等于'},
        {key: 'notEqual', name: '不等于'},
        {key: 'in', name: '在列表中'},
        {key: 'notIn', name: '不在列表中'},
        {key: 'startWith', name: '以...开头'},
        {key: 'notStartWith', name: '不以...开头'},
        {key: 'endWith', name: '以...结尾'},
        {key: 'notEndWith', name: '不以...结尾'},
        {key: 'like', name: '类似于'},
        {key: 'notLike', name: '不类似于'},
        {key: 'isNull', name: '为空'},
        {key: 'isNotNull', name: '不为空'}
    ],
    numberOpr: [{ key: 'equal', name: '等于', expert: true },
        { key: 'notEqual', name: '不等于', expert: true },
        { key: 'greaterThan', name: '大于', expert: true },
        { key: 'lessThan', name: '小于', expert: true },
        { key: 'between', name: '在...之间' },
        { key: 'notBetween', name: '不在...之间' },
        { key: 'isNull', name: '为空' },
        { key: 'isNotNull', name: '不为空' }
    ],
    dateTimeOpr: [{ key: 'equal', name: '等于', expert: true },
        { key: 'notEqual', name: '不等于', expert: true },
        { key: 'notLessThan', name: '起始于', expert: true },
        { key: 'notGreaterThan', name: '终止于', expert: true },
        { key: 'between', name: '在...之间' },
        { key: 'notBetween', name: '不在...之间' },
        { key: 'isNull', name: '为空', expert: true },
        { key: 'isNotNull', name: '不为空', expert: true }
    ],
    codeTagOpr: [{ key: 'in', name: '在列表中' },
        { key: 'notIn', name: '不在列表中' },
        { key: 'equal', name: '等于', expert: true, onlyExpert: true },
        { key: 'notEqual', name: '不等于', expert: true, onlyExpert: true },
        { key: 'isNull', name: '为空' },
        { key: 'isNotNull', name: '不为空' }
    ]
};
var OPR = [];
_.mapObject(OPR_MAP, function(val, key) {
    OPR = OPR.concat(val);
});

//view | ComponentSetting
var ComponentSetting = React.createClass({
    //Define
    propTypes: {
        index: React.PropTypes.number.isRequired,
        component: React.PropTypes.object.isRequired
    },
    getInitialState: function() {
        return {
            forceUpdate:false
        };
    },

    //title
    titleChange: function (event) {
        store.dispatch({
            type: 'CHANGE_TITLE',
            index: this.props.index,
            title: event.target.value
        });
    },

    //operationChar
    operationCharSelect: function (item, option) {
        store.dispatch({
            type: 'CHANGE_OPERATIONCHAR',
            index: this.props.index,
            operationChar: option.val()
        });

    },

    getOperationChar: function (componentName, field) {
        //根据field 修改 opr
        switch (componentName) {
            case 'string':
                return OPR_MAP.stringOpr;
            case 'date':
                return OPR_MAP.dateTimeOpr;
            case 'decimal':
                return OPR_MAP.numberOpr;
            case 'code':
                return OPR_MAP.codeTagOpr;
            default:
                return [];
        }
    },

    //hint
    hintChange: function (event) {
        store.dispatch({
            type: 'CHANGE_HINT',
            index: this.props.index,
            hint: event.target.value
        });
    },

    //isRequired
    isRequiredSelect: function (event) {
        store.dispatch({
            type: 'CHANGE_ISREQUIRED',
            index: this.props.index,
            isRequired: event.target.checked
        });
    },

    //isHide
    isHideSelect: function (event) {
        store.dispatch({
            type: 'CHANGE_ISHIDE',
            index: this.props.index,
            isHide: event.target.checked
        });
    },

    //size
    sizeSelect: function (event) {
        store.dispatch({
            type: 'CHANGE_SIZE',
            index: this.props.index,
            size: event.target.value
        });
    },
    componentWillReceiveProps: function (nextProps) {
        if (this.props.component.identity != nextProps.component.identity) {
            this.setState({
                forceUpdate:true
            })
        }
    },
    removeSelected: function (condId) {
        store.dispatch({
            type: 'REMOVE_SELECTED',
            index: this.props.index,
            condId: condId
        });
    },
    render: function () {
        var title = this.props.component.condition.title;
        var field = this.props.component.condition.field;
        var operationChar = this.props.component.condition.opr;
        var hint = this.props.component.condition.hint;
        var isRequired = this.props.component.condition.isRequired;
        var isHide = this.props.component.condition.hideOpr;
        var size = this.props.component.size;
        //获取对应的操作符集合
        var componentName = this.props.component.type;
        var OPR_SET = this.getOperationChar(componentName, field);
        var forceUpdate = this.state.forceUpdate;
        var alldata = store.getState().data;
        var source = alldata.viewDetail.source;
        //若无法获取操作符，默认隐藏且不可更改
        var forbidSelect = false;
        if (OPR_SET.length == 0) {
            forbidSelect = true;
            isHide = true;
        }

        var selectedField = this.props.component.condition.field;
        //var nodeTpl = _.template('<span class="fancytree-title unselectable"><%- title %></span><span id="favor-toggle" class="fancytree-action-icon fs12 ml10 "><%- opr %></span>');
        var fancytreeConfig = {
            filter: true,
            quicksearch: true,
            autoScroll: true,
            selectMode: 2,
            clickFolderMode: 1,
            activeVisible: true,

            source: function () {
                let selectType;
                _.each(alldata.viewDetail.components, function (item) {
                    if (item.isSelected == true) {
                        selectType = item.type;
                    }
                });
                let out = [];
                $.extend(true, out, source);
                _.each(out, (cond) => {
                    cond.children = _.filter(cond.children, (item) => {
                        item.selected = _.contains(selectedField, item.key);
                        return _.contains(item.type,selectType);
                    })
                })
                out = _.filter(out, (item)=> {
                    return item.children.length >0 ;
                })
                // console.log(out);
                return out;
            },
            iconClass: function (event, data) {
                if (data.node.folder) {
                    return "fa fa-folder fa-fw";
                } else {
                    return "fa fa-database fa-fw";
                }
            },
            beforeSelect: function (event, data) {
                /** between in 是多值 其他为单值 **/
                var alldata = store.getState().data;
                var sele;
                var codeSele;
                _.each(alldata.viewDetail.components, function (item) {
                    if (item.isSelected == true) {
                        sele = item.condition.selectData;
                    }
                    if(item.isSelected == true && item.type == 'code'){
                        codeSele = item.condition.selectData;
                    }
                });

                var oprData = data.node.data;
                // console.log(oprData);
                if (sele && sele.length > 0) {
                    var selectedOpr = sele[0].opr;
                    var isselect = oprData.opr != 'in' && oprData.opr != 'between' && oprData.opr != 'notIn' && oprData.opr != 'notBetween';
                    var selected = selectedOpr != 'in' && selectedOpr != 'between' && selectedOpr != 'notIn' && selectedOpr != 'notBetween';
                    if (isselect != selected && !data.node.isSelected()) {
                        Notify.simpleNotify('错误', '单值多值不能同时勾选', 'warning');
                        return false;
                    }
                }
                if(codeSele && codeSele.length>0){
                    let selected =codeSele[0].codeTable+codeSele[0].codeField+codeSele[0].codeDisNameField;
                    let selecting=oprData.codeTable+oprData.codeField+oprData.codeDisNameField;
                    // console.log(selected,selecting)
                    if( selected !=selecting && !data.node.isSelected()){
                        Notify.simpleNotify('错误', '代码表字段不同，不能同时勾选', 'warning');
                        return false;
                    }
                }


                let selectType;
                _.each(alldata.viewDetail.components, function (item) {
                    if (item.isSelected == true) {
                        selectType = item.type;
                    }
                });
                if (!_.contains(oprData.type,selectType) && !data.node.isSelected()) {
                    Notify.simpleNotify('错误', '类型不匹配,所选组件类型为：' + selectType + ',勾选项类型为' + oprData.type, 'warning');
                    return false;
                }
            },
            select: function (event, data) {
                var oprData = data.node.data;
                store.dispatch({
                    type: 'CHANGE_SELECTDATA',
                    index: this.props.index,
                    seledata: oprData,
                    field: oprData.condId
                });
                var alldata = store.getState().data;
                var sele, title;
                _.each(alldata.viewDetail.components, function (item) {
                    if (item.isSelected == true) {
                        sele = item.condition.selectData;
                        title = item.condition.title;
                    }
                });
                if (sele.length > 0) {
                    var name = sele[0].displayName;
                    let multiple = sele[0].opr == 'in' || sele[0].opr == 'ontIn' || sele[0].opr == 'between' || sele[0].opr == 'notBetween';
                    let isMultiple;
                    if (multiple) {
                        isMultiple = true ;
                    } else  {
                        isMultiple = false ;
                    }
                    store.dispatch({
                        type: 'CHANGE_ISMULTIPLE',
                        index: this.props.index,
                        isMultiple: isMultiple
                    });

                }
                if (title === '' || !title) {
                    store.dispatch({
                        type: 'CHANGE_TITLE',
                        index: this.props.index,
                        title: name
                    });
                }
            }.bind(this)
        };
        var sele;
        _.each(alldata.viewDetail.components, function (item) {
            if (item.isSelected == true) {
                sele = item.condition.selectData;
            }
        });
        var opr;
        _.each(sele,function (item) {
            _.map(OPR, function(oprItem) {
                if (item.opr == oprItem.key) {
                    opr = oprItem.name;
                }
            });
        })
        return (
            <form>
                <div className='ml20 mr20'>
                    <div className='row'>
                        <label className='control-label' for='title'>名称</label>
                    </div>
                    <div className='row'>
                        <input type='text' className='form-control' id='title' value={title}
                               onChange={this.titleChange}/>
                    </div>
                </div>
                {/*TODO: 映射字段 & 操作符*/}
                <div className='mt20 ml20 mr20'>
                    <div className='row'>
                        <label className='control-label' for='field'>映射字段</label>
                    </div>
                    <div className='row'>
                        {
                            _.map(sele, (item) =>
                                <span title={' 操作符为: ' + opr + ',值为: ' +(_.isArray(item.value)?item.value.join(' '):item.value)} className={"tm-tag tm-tag-info"} key={item.condId} style={{cursor: 'pointer'}}>
                                            <span>{item.displayName}</span>
                                    {/*<a href="#" className='tm-tag-remove' onClick={(e) => this.removeSelected(item.condId, e)}>x</a>*/}
                                </span>
                            )
                        }
                    </div>
                    <div className='row'>
                        <div className="pb10" style={{border: '1px solid #DDDDDD'}}>
                            <FancyTree config={fancytreeConfig} forceReload={forceUpdate}/>
                        </div>
                    </div>
                </div>

                <div className='mt20 ml20 mr20' style={isHide ? {display: 'none'} : {}}>
                    <div className='row'>
                        <label className='control-label' for='operationChar'>操作符</label>
                    </div>
                    <div className='row'>
                        <div className='col-md-6 pn'>
                            <MultiSelect
                                id="operationChar"
                                onChange={this.operationCharSelect}
                                updateData={true}
                                config={{
                                    buttonClass: 'multiselect dropdown-toggle btn btn-system fw600 fs13 mnw50',
                                    buttonWidth: '100%'
                                }}
                                data={
                                    _.map(OPR_SET, function (oprItem) {
                                        return {
                                            label: oprItem.name,
                                            title: oprItem.key,
                                            value: oprItem.name,
                                            type: 'string',
                                            selected: oprItem.name == operationChar
                                        }
                                    })
                                }/>
                        </div>
                    </div>
                </div>

                <div className='mt20 ml20 mr20'>
                    <div className='row'>
                        <label className='control-label' for='hint'>提示信息</label>
                    </div>
                    <div className='row'>
                        <textarea className="form-control" value={hint} onChange={this.hintChange} rows="3"
                                  id='hint'></textarea>
                    </div>
                </div>

                <div className='mt20 ml20 mr20'>
                    <div className='row'>
                        <label className='control-label' for='checkbox_required'>必填设置</label>
                    </div>
                    <div className='row'>
                        <div className='checkbox mn'>
                            <label>
                                <input type="checkbox" id='checkbox_required' checked={isRequired}
                                       onChange={this.isRequiredSelect}/> 设为必填
                            </label>
                        </div>
                    </div>
                </div>

                <div className='mt20 ml20 mr20'>
                    <div className='row'>
                        <label className='control-label' for='checkbox_hide'>隐藏设置</label>
                    </div>
                    <div className='row'>
                        <div className='checkbox mn'>
                            <label>
                                <input type="checkbox" id='checkbox_hide' checked={isHide}
                                       onChange={ !forbidSelect && this.isHideSelect }/> 隐藏操作符
                            </label>
                        </div>
                    </div>
                </div>

                <div className='mt20 ml20 mr20 mb20'>
                    <div className='row'>
                        <label className='control-label'>组件大小</label>
                    </div>
                    <div className='row'>
                        <div className="col-md-4 prn">
                            <label className="radio-inline">
                                <input type="radio" checked={ size == '50%' } onChange={this.sizeSelect}
                                       name="componentSize" value="50%"/> 小尺寸
                            </label>
                        </div>
                        <div className="col-md-4 prn">
                            <label className="radio-inline">
                                <input type="radio" checked={ size == '85%' } onChange={this.sizeSelect}
                                       name="componentSize" value="85%"/> 标准尺寸
                            </label>
                        </div>
                        <div className="col-md-4 prn">
                            <label className="radio-inline">
                                <input type="radio" checked={ size == '100%' } onChange={this.sizeSelect}
                                       name="componentSize" value="100%"/> 大尺寸
                            </label>
                        </div>
                    </div>
                </div>
            </form>
        );
    }
});

module.exports = ComponentSetting;
