var $ = require('jquery');
var _ = require('underscore');
var React = require('react');
var ReactDOM = require('react-dom');
// require('bootstrap-multiselect');
var MultiSelect = require('widget/multiselect');
var Q = require('q');
var Notify = require('nova-notify');
var Provider = require('widget/i18n-provider');

var onDeleteMode = false;
var inputData;
var whether = false;
var selectedFields = [];
var labelStyle = {
    textAlign: 'center',
    width:'150px'
};
var tdStyle = {
    padding: '9px 0px 9px 0px'
}
var RecordExtraction = React.createClass({
    contextTypes: {
        i18n: React.PropTypes.object
    },
    getInitialState: function() {
        return {
            info: this.props.selectedFields,
            whether: this.props.whether
        };
    },
    sequentialMatchHandle: function() {
        let record = this.props.record; 
        let info = this.props.selectedFields;
        info.length = 0;

        let length = Math.max(record[0].outputColumnDescList.length, record[1].outputColumnDescList.length);
        for (let i = 0; i < length; i++) {
            let leftAliasName, rightAliasName, leftDisplayName, rightDisplayName;
            
            if (record[0].outputColumnDescList[i]) {
                leftAliasName = record[0].outputColumnDescList[i].aliasName;
                leftDisplayName = record[0].outputColumnDescList[i].displayName;
            }
            else {
                leftAliasName = "none";
                leftDisplayName = "";                
            }

            if (record[1].outputColumnDescList[i]) {
                rightAliasName = record[1].outputColumnDescList[i].aliasName;
                rightDisplayName = record[1].outputColumnDescList[i].displayName;
            }
            else {
                rightAliasName = "none";
                rightDisplayName = "";                
            }

            info.push({
                mapColumns: [leftAliasName, rightAliasName],
                displayName: leftDisplayName,
                columnName: leftAliasName
            })
        }

        this.setState({
            info: info
        });
    },
    handleSelectField: function(identity, option, checked, select) {
        this.props.selectedFields[identity.index].mapColumns[identity.leftOrRight] = option.val();
        if (identity.leftOrRight == 0) {
            this.props.selectedFields[identity.index].displayName = option.text();
            this.setState({
                info: this.props.selectedFields
            });
        }
    },
    addBtnClick: function() {
        var info = this.props.selectedFields;
        // var leftRecord = this.props.record[0].outputColumnDescList[0].aliasName;
        // var rightRecord = this.props.record[1].outputColumnDescList[0].aliasName;
        // var isExist1 = true;
        // var defaultOutput = this.props.record[0].outputColumnDescList[0].displayName;
        // _.each(this.props.record[0].outputColumnDescList, function(record) {
        //     if (isExist1) {
        //         var isExist = true;
        //         _.each(info, function(selection) {
        //             if (record.aliasName == selection.mapColumns[0]) {
        //                 isExist = false;
        //             }
        //         });
        //         if (isExist) {
        //             leftRecord = record.aliasName;
        //             defaultOutput = record.displayName;
        //             isExist1 = false;
        //         }
        //     }
        // });
        // var isExist2 = true;
        // _.each(this.props.record[1].outputColumnDescList, function(record) {
        //     if (isExist2) {
        //         var isExist = true;
        //         _.each(info, function(selection) {
        //             if (record.aliasName == selection.mapColumns[1]) {
        //                 isExist = false;
        //             }
        //         });
        //         if (isExist) {
        //             rightRecord = record.aliasName;
        //             isExist2 = false;
        //         }
        //     }
        // });
        var leftRecords = [];
        var rightRecords = [];
        _.each(info, function(item) {
            leftRecords.push(item.mapColumns[0]);
            rightRecords.push(item.mapColumns[1]);
        })
        // 寻找类型相同的两个输入
        var leftRecord = _.find(this.props.record[0].outputColumnDescList, function(item) {
            return item.columnType == "string" && _.indexOf(leftRecords, item.aliasName) == -1;
        })
        var rightRecord = _.find(this.props.record[1].outputColumnDescList, function(item) {
            return item.columnType == "string" && _.indexOf(rightRecords, item.aliasName) == -1;
        })
        if (!leftRecord || !rightRecord) {
            leftRecord = _.find(this.props.record[0].outputColumnDescList, function(item) {
                return isNumber(item.columnType) && _.indexOf(leftRecords, item.aliasName) == -1;
            })
            rightRecord = _.find(this.props.record[1].outputColumnDescList, function(item) {
                return isNumber(item.columnType) && _.indexOf(rightRecords, item.aliasName) == -1;
            })
            if (!leftRecord || !rightRecord) {
                leftRecord = _.find(this.props.record[0].outputColumnDescList, function(item) {
                    return isDate(item.columnType) && _.indexOf(leftRecords, item.aliasName) == -1;
                })
                rightRecord = _.find(this.props.record[1].outputColumnDescList, function(item) {
                    return isDate(item.columnType) && _.indexOf(rightRecords, item.aliasName) == -1;
                })
                if (!leftRecord || !rightRecord) {
                    leftRecord = this.props.record[0].outputColumnDescList[0];
                    rightRecord = this.props.record[1].outputColumnDescList[0];
                }
            }
        }
        info.push({
            mapColumns: [leftRecord.aliasName, rightRecord.aliasName],
            displayName: leftRecord.displayName,
            columnName: leftRecord.aliasName
        });
        this.setState({
            info: info
        });
    },
    deleteBtnClick: function(e) {
        var {i18n} = this.context;
        var info = this.props.selectedFields;
        if (info.length > 1) {
            info.splice($(e.currentTarget).attr('data-index'), 1);
            this.setState({
                info: info
            });
        } else {
            Notify.simpleNotify(i18n.t("warning.delete-failed"), i18n.t("warning.leave-at-least-one-condition") , 'error');
        }
    },
    deleteBtnHandle: function() {
        if (onDeleteMode) {
            onDeleteMode = false;
            $('.deleteStyle').hide();
            // $('.deleteStyle').attr('style', 'display: none');
            // $('.otherStyle').removeClass('col-md-4').addClass('col-md-5');
            $('.add-record').show();
            $('.delete-record').show();
            $('.complete-delete').hide();
        } else {
            onDeleteMode = true;
            $('.deleteStyle').show();
            // $('.deleteStyle').attr('style', '');
            // $('.otherStyle').removeClass('col-md-5').addClass('col-md-4');
            $('.add-record').hide();
            $('.delete-record').hide();
            $('.complete-delete').show();
        }
    },
    displayNameHandle: function(e) {
        var index = $(e.target).attr('data-index');
        var info = this.props.selectedFields;
        info[index].displayName = e.target.value;
        this.setState({
            info: info
        });
    },
    duplicateHandle: function(e) {
        whether = e.target.checked;
        this.setState({whether: whether});
    },
    render: function() {
        var {i18n} = this.context;
        var handleSelectField = this.handleSelectField;
        var addBtnClick = this.addBtnClick;
        var deleteBtnClick = this.deleteBtnClick;
        var deleteBtnHandle = this.deleteBtnHandle;
        var displayNameHandle = this.displayNameHandle;
        var duplicateHandle = this.duplicateHandle;
        var items = this.props.record;
        var title=this.props.record[0].title;
        var title2=this.props.record[1].title;
        var whether = this.state.whether;

        return (
            <div>
            <div style={{fontSize: "15px"}}>
                <input id="whether" type="checkbox" checked={whether} onChange={duplicateHandle} className="ml10 mt10 mb10" value="" />
                <span className="ml10 fs13 fw600">{i18n.t("merge.del-duplicate")}</span>
                <button type="button" onClick={this.sequentialMatchHandle} className="fs13 btn btn-primary btn-xs pull-right" style={{ height: "33px" }}>{i18n.t("merge.sequential-correspondence")}</button>                
            </div>
                <table className='table'>
                    <thead>
                        <tr>
                            <th className='deleteStyle' style={{display: 'none'}}></th>
                            <th style={{padding: "9px 0"}}>
                                <div className='col-md-5 text-center'>
                                    <label title={title} className='text-ellipsis'>{title}</label>
                                </div>
                                <div className='col-md-1'>
                                </div>
                                <div className='col-md-5 text-center'>
                                    <label title={title2} className='text-ellipsis'>{title2}</label>
                                </div>

                            </th>
                            <th style={{padding: "9px 0"}} className='text-center'>
                                <div className='col-md-12 text-center'>
                                    <label className='text-ellipsis'>{i18n.t("merge.output")}</label>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            _.map(this.state.info, function(info, index) {
                                return (
                                    <tr key={index}>
                                        <td className='deleteStyle' style={{display: 'none'}}>
                                            <button type="button" data-index={index} onClick={deleteBtnClick} className="btn-delete-record btn btn-rounded btn-danger btn-xs">
                                                <i className="fa fa-minus"></i>
                                            </button>
                                        </td>
                                        <td style={tdStyle}>
                                            <div className="col-md-5 text-center otherStyle" style={{padding: 0}}>
                                                <MultiSelect identity={{index: index, leftOrRight: 0}} updateData={true} config={{buttonWidth: "100%", nonSelectedText: i18n.t("merge.not-selected")}} onChange={handleSelectField} data={
                                                            _.map(items[0].outputColumnDescList, function(item) {
                                                                return {
                                                                    label: item.displayName,
                                                                    title: item.displayName,
                                                                    value: item.aliasName,
                                                                    selected: info.mapColumns[0] == item.aliasName
                                                                }
                                                            })
                                                } singleDefaultNone={true} />
                                            </div>
                                            <div className='fs18 fw600 col-md-2 text-center pn' style={{lineHeight: '40px', width: '25px'}}>
                                                <i className="fa fa-arrows-h" aria-hidden="true"></i>
                                            </div>
                                            <div className="col-md-5 text-center otherStyle" style={{padding: 0}}>
                                                <MultiSelect identity={{index: index, leftOrRight: 1}} updateData={true} config={{buttonWidth: "100%", nonSelectedText: i18n.t("merge.not-selected"), enableFiltering: true}} onChange={handleSelectField} data={
                                                            _.map(items[1].outputColumnDescList, function(item) {
                                                                return {
                                                                    label: item.displayName,
                                                                    title: item.displayName,
                                                                    value: item.aliasName,
                                                                    selected: info.mapColumns[1] == item.aliasName
                                                                }
                                                            })
                                                } singleDefaultNone={true} />
                                            </div>
                                        </td>
                                        <td className="col-md-3" style={{padding: 0, textAlign: 'text-center'}}>
                                        <input id="statisticalCondition" className="pl5 pr5" style={{width: "100%", height: "40px"}}
                                            data-index={index} onChange={displayNameHandle} value={info.displayName} /></td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
                <div className="mt10 mb10 text-right">
                        <button type="button" onClick={addBtnClick} className="add-record btn-add-record btn btn-primary btn-xs btn-rounded" style={{width:'60px'}}>{i18n.t("add-btn")}</button>
                        <button type="button" onClick={deleteBtnHandle} className="delete-record btn-delete-record btn btn-danger btn-xs btn-rounded" style={{width:'60px'}}>{i18n.t("delete-btn")}</button>
                        <button type="button" onClick={deleteBtnHandle} className="complete-delete btn btn-default btn-xs btn-rounded" style={{width:'60px',display:'none'}}>{i18n.t("complete-btn")}</button>

                </div>
            </div>
        )
    }
})

function _getRecommendMapColumns(input) {
    var defer = Q.defer();
    $.post('/modelanalysis/modeling/fieldmapping', {
        outputlist1: input[0].outputColumnDescList,
        outputlist2: input[1].outputColumnDescList
    }, function(rsp) {
        if (rsp.code == 0) {
            defer.resolve(rsp.data.outputColumnNameMapList);
        } else {
            defer.resolve([]);
        }
    }, 'json');
    return defer.promise;
}

module.exports.render = function(container, data) {
    data = checkInputData(data);
    whether = false;
    var newInputData = data;
    inputData = newInputData;
    if (newInputData.output && newInputData.output.outputColumnDescList) {
        if (newInputData.output.isDelDuplicate == 1) {
            whether = true;
        }
        selectedFields = newInputData.output.outputColumnDescList;
        ReactDOM.render(<Provider.default><RecordExtraction record={newInputData.input} whether={whether} selectedFields={selectedFields}/></Provider.default>, container);
    } else {
        _getRecommendMapColumns(newInputData.input).then(function(data) {
            if (_.isEmpty(data)) {
                // 寻找类型相同的两个输入
                var leftRecord = _.find(newInputData.input[0].outputColumnDescList, function(item) {
                    return item.columnType == "string";
                })
                var rightRecord = _.find(newInputData.input[1].outputColumnDescList, function(item) {
                    return item.columnType == "string";
                })
                if (!leftRecord || !rightRecord) {
                    leftRecord = _.find(newInputData.input[0].outputColumnDescList, function(item) {
                        return isNumber(item.columnType);
                    })
                    rightRecord = _.find(newInputData.input[1].outputColumnDescList, function(item) {
                        return isNumber(item.columnType);
                    })
                    if (!leftRecord || !rightRecord) {
                        leftRecord = _.find(newInputData.input[0].outputColumnDescList, function(item) {
                            return isDate(item.columnType);
                        })
                        rightRecord = _.find(newInputData.input[1].outputColumnDescList, function(item) {
                            return isDate(item.columnType);
                        })
                        if (!leftRecord || !rightRecord) {
                            leftRecord = newInputData.input[0].outputColumnDescList[0];
                            rightRecord = newInputData.input[1].outputColumnDescList[0];
                        }
                    }
                }
                selectedFields = [{
                    mapColumns: [leftRecord.aliasName, rightRecord.aliasName],
                    displayName: leftRecord.displayName,
                    columnName: leftRecord.aliasName
                }];
            } else {
                selectedFields = _.map(data, function(item) {
                    let match = _.find(newInputData.input[0].outputColumnDescList, (inputItem) => {return inputItem.aliasName == item.oldColumn});
                    return {
                        mapColumns: [item.oldColumn, item.newColumn],
                        displayName: match ? match.displayName : '',
                        columnName: item.oldColumn
                    }
                });
            }
            ReactDOM.render(<Provider.default><RecordExtraction record={newInputData.input} selectedFields={selectedFields} whether={whether}/></Provider.default>, container);
        })
    }
}

function checkInputData(inputData) {
    return inputData;
}

module.exports.checkInputData = checkInputData;

module.exports.constructTaskDetail = function() {
    // _.each(selectedFields, function(field) {
    //     _.each(inputData.input[0].outputColumnDescList, function(info) {
    //         if(field.mapColumns[0] == info.aliasName) {
    //             field.mapColumns[0] = info.aliasName;
    //         }
    //     });
    //     _.each(inputData.input[1].outputColumnDescList, function(info) {
    //         if(field.mapColumns[1] == info.aliasName) {
    //             field.mapColumns[1] = info.aliasName;
    //         }
    //     });
    // });
    // _.each($('input#statisticalCondition'), function(input, index) {
    //     selectedFields[index].displayName = input.value;
    // });
    for (var index in selectedFields) {
        var item = selectedFields[index];
        var leftCol = _.find(inputData.input[0].outputColumnDescList, function (input) {
            return input.aliasName == item.mapColumns[0];
        });
        var rightCol = _.find(inputData.input[1].outputColumnDescList, function (input) {
            return input.aliasName == item.mapColumns[1];
        });
        if(_.isUndefined(leftCol) || _.isUndefined(rightCol)) {
            return {
                message: window.i18n.t("warning.input-nodes-have-some-undone-ones")
            }
        }
        else if (leftCol.columnType != rightCol.columnType && !(isNumber(leftCol.columnType) && isNumber(rightCol.columnType)) && !(isDate(leftCol.columnType) && isDate(rightCol.columnType))) {
            return {
                message: leftCol.displayName + window.i18n.t("warning.and") + rightCol.displayName + window.i18n.t("warning.types-are-inconsistent")
            }
        }
    }
    var output = {
        srcDataTypes: [{
            inputNode: inputData.inputIds[0]
        }, {
            inputNode: inputData.inputIds[1]
        }],
        isDelDuplicate: whether ? 1:0,
        outputColumnDescList: selectedFields
    };
    return {
        detail: output
    };
}

function isNumber(columnType) {
    return _.contains(['int', 'bigint', 'double', 'decimal'], columnType);
}

function isDate(columnType) {
    return _.contains(['date', 'datetime', 'timestamp'], columnType);
}
