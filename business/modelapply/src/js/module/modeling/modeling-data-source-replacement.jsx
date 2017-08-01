var React = require('react');
var ReactDOM = require('react-dom');
var $ = require('jquery');
var _ = require('underscore');
var Q = require('q');
var Dialog = require('nova-dialog');
var Notify = require('nova-notify');
var FancyTree = require('widget/fancytree');
var MultiSelect = require('widget/multiselect');
var redux = require('redux');
var Provider = require('widget/i18n-provider');
require('./modeling-data-source-replacement.less');

registerLocales(require.context('../../../locales/ds-replace', false, /\.js/), 'module');


//==========================Store=============================
/**
state = {
    oldColumns: [],
    newColumns: [],
    columnMapping: {},
    loading: bool
}
*/
var reducer = function(state, action) {
    switch (action.type) {
        case 'INIT':
            return action.data;
        case 'UPDATE':
            {
                var newColumns = action.data.newColumns;
                return _.assign({}, state, {
                    newColumns: newColumns,
                    columnMapping: action.data.columnMapping
                });
            }
        case 'EDIT_MAPPING':
            {
                var key = action.data.key;
                var newValue = action.data.value;
                var columnMapping = {};
                $.extend(true, columnMapping, state.columnMapping);
                var existKey = _.findKey(columnMapping, function(value) {
                    return value === newValue;
                });
                if (existKey) {
                    delete columnMapping[existKey];
                }
                columnMapping[key] = newValue;
                return _.assign({}, state, { columnMapping: columnMapping });
            }
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
var nodeData;

var ReplacementRightPanel = React.createClass({
    contextTypes: {
        i18n: React.PropTypes.object
    },
    componentDidMount: function() {
        this.unsubscribe = store.subscribe(function() {
            this.forceUpdate();
        }.bind(this));
    },
    componentWillUnmount: function() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    },
    handleSelectColumn: function(identity, option, checked, select) {
        var key = identity.key;
        dispatch('EDIT_MAPPING', {
            key: key,
            value: option.val()
        });
    },
    render: function() {
        var {i18n} = this.context;
        var data = store.getState();
        var oldColumns = data.oldColumns;
        var newColumns = data.newColumns;
        var columnMapping = data.columnMapping;
        if (_.isEmpty(oldColumns) || _.isEmpty(newColumns)) {
            return (
                <div className="mt10">
                    <label className="control-label pl15 mt10">{i18n.t("module:please-select-data-source-to-field-mapping")}</label>
                </div>
            )
        }

        return (
            <div>
                <div ref="data-source-from-to-div">
                {
                    _.map(oldColumns, function(columnItem, index) {
                        return (
                            <div className="row mt10">
                                <div className="col-md-5 text-center">
                                <label className="fs15 mn pv5">{columnItem.displayName}</label>
                                </div>
                                <div className="col-md-2 text-center fs20">
                                    <i className="fa fa-arrows-h" aria-hidden="true"></i>
                                </div>
                                <div className="col-md-5 text-center">
                                    <MultiSelect multiple={false} identity={{key: columnItem.aliasName}}
                                        config={{
                                            maxHeight: 250,
                                            enableFiltering: true,
                                            nonSelectedText: i18n.t("none-selected-text"),
                                            nSelectedText: i18n.t("n-selected-text"),
                                            allSelectedText: i18n.t("all-selected"),
                                            buttonWidth: '170px',
                                            buttonClass: 'multiselect dropdown-toggle btn btn-sm btn-info',
                                            dropUp: false
                                        }}
                                        updateData={true} onChange={this.handleSelectColumn} singleDefaultNone={true}
                                        data={_.map(newColumns, function(item) {
                                            return {
                                                label: item.displayName,
                                                title: item.displayName,
                                                value: item.aliasName,
                                                selected: item.aliasName == columnMapping[columnItem.aliasName]
                                            }
                                        })
                                    }/>
                                </div>
                            </div>
                        )
                    }.bind(this))
                }
                </div>
            </div>
        )
    }
});

function getdatatypecoldef(centerCode, zoneId, typeId, userId, isWithFavor) {
    var getdatatypecoldefDefer = Q.defer();

    $.getJSON('/modelanalysis/modeling/getdatatypecoldef', {
        centercode: centerCode,
        zoneid: zoneId,
        typeid: typeId,
        userid: userId,
        iswithfavor: isWithFavor
    }, function(rsp) {
        if (rsp.code !== 0) {
            getdatatypecoldefDefer.reject(rsp);
        } else {
            getdatatypecoldefDefer.resolve(rsp.data.outputColumnDescList);
        }
    });

    return getdatatypecoldefDefer.promise;
}

function getfieldmapofdatasources(outputList1, outputList2) {
    var getfieldmapofdatasourcesDefer = Q.defer();

    $.post('/modelanalysis/modeling/fieldmapping', {
        outputlist1: outputList1,
        outputlist2: outputList2
    }, function(rsp) {
        if (rsp.code !== 0) {
            getfieldmapofdatasourcesDefer.reject(rsp);
        } else {
            getfieldmapofdatasourcesDefer.resolve(rsp.data.outputColumnNameMapList);
        }
    }, 'json');

    return getfieldmapofdatasourcesDefer.promise;
}

var FieldMapping = React.createClass({
    contextTypes: {
        i18n: React.PropTypes.object
    },
    selectDSTreeItem: function(event, data) {
        var {i18n} = this.context;
        var outputList = store.getState().oldColumns;
        if (!data.node.folder) {
            nodeData = _.omit(data.node.data, ['dirId', 'dirType', 'favored', 'parentId', 'dirName'])
            getdatatypecoldef(data.node.data.centerCode, data.node.data.zoneId, data.node.data.typeId, 0).then(function(fieldData) {
                getfieldmapofdatasources(outputList, fieldData).then(function(fieldmapData) {
                    var columnMapping = {};
                    _.each(fieldmapData, function(item) {
                        columnMapping[item.oldColumn] = item.newColumn;
                    });
                    dispatch('UPDATE', {
                        newColumns: fieldData,
                        columnMapping: columnMapping
                    });
                })
            }).catch(function(error) {
                Notify.show({
                    title: window.i18n.t("warning.an-error-occurs-when-getting-data-source-field-definition"),
                    text: error.message,
                    type: 'error'
                });
                return;
            });
        }
    },
    render: function() {
        var fancytreeConfig = {
            filter: true,
            quicksearch: true,
            autoScroll: true,
            selectMode: 2,
            clickFolderMode: 1,
            checkbox: false,
            source: this.props.dsData || {
                url: "/modelanalysis/modeling/getdatasource"
            },
            postProcess: function (event, data) {
                if(!_.isUndefined(data.response.data)){
                    data.result = data.response.data.tree
                }else{
                    data.result = data.response;
                }
            },
            iconClass: function(event, data) {
                if (data.node.folder) {
                    return "fa fa-folder fa-fw";
                } else {
                    return "fa fa-database fa-fw";
                }
            },
            lazyLoad: function(event, data) {
                data.result = {
                    url: "/modelanalysis/collision/listmodelingtask",
                    data: {
                        taskId: data.node.data.typeId
                    }
                };
            },
            activate: this.selectDSTreeItem.bind(this)
        };
        return (
            <div className="row mn">
            <div className="col-md-4 pt10" style={{height: '499px', overflow: 'auto'}}>
                <FancyTree config={fancytreeConfig}/>
            </div>
            <div className="col-md-8 pt10 pb10 br-l" style={{height: '499px', overflow: 'auto'}}>
                <ReplacementRightPanel />
            </div>
            </div>
        )
    }
})

function render(outputList, callback) {
    dispatch('INIT', {
        oldColumns: outputList
    });
    Dialog.build({
        title: window.i18n.t('module:data-source-replacement'),
        content: '<div id="replacement-dialog-content"></div>',
        width: 800,
        minHeight: 500,
        rightBtn: window.i18n.t("module:finish-btn"),
        leftBtn: window.i18n.t("module:cancel-btn"),
        rightBtnCallback: function() {
            var state = store.getState();

            if (_.size(state.columnMapping) == _.size(state.oldColumns)) {
                var columnMapping = _.map(state.columnMapping, function(value, key) {
                    return {
                        oldColumn: key,
                        newColumn: value
                    }
                });
                var differentPair;
                _.find(columnMapping, map => {
                    var oldColumn = _.find(state.oldColumns, column => {
                        return column.aliasName === map.oldColumn;
                    });
                    var newColumn = _.find(state.newColumns, column => {
                        return column.aliasName === map.newColumn;
                    });
                    if (oldColumn.columnType != newColumn.columnType) {
                        differentPair = [oldColumn, newColumn];
                    }
                    return differentPair;
                });
                if (differentPair) {
                    Notify.show({
                        title: window.i18n.t("module:unable-replace"),
                        text: '' + differentPair[0].displayName + window.i18n.t("module:and") + differentPair[1].displayName + window.i18n.t("warning.types-are-inconsistent"),
                        type: 'warning'
                    });
                    return;
                }

                var newOutput = _.values(state.columnMapping);
                var outputColumnDescList = _.filter(state.newColumns, function(columnItem) {
                    return _.contains(newOutput, columnItem.aliasName);
                });
                var outputNodeData = _.extend({}, nodeData, {isWithFavor: 0, outputColumnDescList: outputColumnDescList});
                if (callback) {
                    callback({
                        nodeData: outputNodeData,
                        columnMapping: columnMapping
                    });
                }

                $.magnificPopup.close();
            } else {
                Notify.show({
                    title: window.i18n.t("module:field-mapping-is-incomplete"),
                    text: window.i18n.t("module:you-need-map-all-output-from-old-data-source-to-new-data-source"),
                    type: 'warning'
                });
            }
        }
    }).show(function() {
        $('#nv-dialog-body').addClass('pn');
        ReactDOM.render(<Provider.default><FieldMapping /></Provider.default>, document.getElementById('replacement-dialog-content'));
    })
}


module.exports.render = render
