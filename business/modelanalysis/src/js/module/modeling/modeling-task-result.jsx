var $ = require('jquery');
var _ = require('underscore');
var React = require('react');
var ReactDOM = require('react-dom');
var Q = require('q');
var Provider = require('widget/i18n-provider');

var mode = {
    DATA_SOURCE: 1,
    TASK_RESULT: 2
};
var pageSize = 100;
var infoOrDs, curMode, jqxhr, loaded;

function loadDataSource(dsDetail) {
    console.log(dsDetail);
    var dfd = Q.defer();
    var partitionArgs;
    _.isUndefined(dsDetail.partitionCond) ? partitionArgs = "" : partitionArgs = dsDetail.partitionCond
    jqxhr = $.getJSON("/modelanalysis/modeling/previewdatasource", {
        centercode: dsDetail.centerCode,
        typeid: dsDetail.typeId,
        zoneid: dsDetail.zoneId,
        partitionCond:partitionArgs
    }, function (rsp) {
        if (rsp.code == 0) {
            loaded = true;

            dfd.resolve(rsp.data);
        } else {
            dfd.reject({
                progress: undefined,
                hints: window.i18n.t("warning.fail-to-inquire-data-source")
            });
        }
    });
    return dfd.promise;
}

function loadResult(taskid, index) {
    var dfd = Q.defer();
    jqxhr = $.getJSON("/modelanalysis/collision/getresult", {
        taskid: taskid,
        needmeta: 1,
        startindex: index || 0,
        length: pageSize
    }, function (rsp) {
        if (rsp.code == 0) {
            loaded = !_.isEmpty(rsp.data);

            dfd.resolve(rsp.data);
        } else {
            dfd.reject({
                progress: undefined,
                hints: window.i18n.t("warning.fail-to-inquire-data-source") + (rsp.message ? '：' + rsp.message : '')
            });
        }
    });
    return dfd.promise;
}


function getStateLabel(taskInfo) {
    var state = taskInfo.taskState;
    switch (state) {
        case 'queue':
            state = window.i18n.t("warning.queue");
            break;
        case 'running':
            state = window.i18n.t("warning.completed-n-%", {finishRatio: taskInfo.finishRatio});
            break;
        case 'finished':
            state = taskInfo.resultCount + window.i18n.t("warning.n-results");
            break;
        case 'cancelled':
            state = window.i18n.t("warning.the-node-has-not-executed");
            break;
        case 'error':
            state = window.i18n.t("warning.running-error") + taskInfo.errMsg;
            break;
    }
    return state;
}

var Status = React.createClass({
    contextTypes: {
        i18n: React.PropTypes.object
    },
    render: function () {
        var {i18n} = this.context;
        return (<div className="text-muted text-center p20" style={{ width: "100%", marginTop: "25%", fontSize: '16px'}}>
            <span>
                {this.props.hints || i18n.t("warning.there-are-no-results-data")}
            </span>
            <span style={this.props.loading ? {} : { display: 'none' }}><i className="fa fa-spinner fa-pulse ml5"></i></span>
        </div>)
    }
})

var TaskResult = React.createClass({
    contextTypes: {
        i18n: React.PropTypes.object
    },
    componentDidMount: function(){
        $('#table_modeling').DataTable({
            "scrollY": 1500,
            "scrollX":2000,
            "autoWidth": true,
            'paging': false,
            'searching':false,
            'ordering': false,
            'info': false
        });
        if($('.dataTables_scrollHeadInner').width()<$('.dataTables_scrollHead').width()){
            $('.modeling_table').width("98%");
            $('.dataTables_scrollHeadInner').width("auto");
        }
        //var width_temp = $('.dataTables_scrollBody tr').width( );
        //$('.dataTables_scrollHeadInner').css("min-width",width_temp);
        $(window).on("resize", function() {
            var leftTray = $('.dataTables_scrollBody');
            var leftHeight = window.innerHeight - leftTray.offset().top-20;
            $('.dataTables_scrollBody').height(leftHeight);
            if($('.dataTables_scrollHeadInner').width()<$('.dataTables_scrollHead').width()){
                $('.modeling_table').width("98%");
                $('.dataTables_scrollHeadInner').width("auto");
            }
        });
        $(window).trigger("resize");
    },
    render: function() {
        var {i18n} = this.context;
        return (
            <div className="flex-layout flex-vertical" style={{width: '100%',height: '100%' }}>
                <div className="row p10 mn">
                    <div className="col-md-8 pn"><span>{i18n.t("warning.here-can-show-at-most-n-results", {pageSize: pageSize})}</span></div>
                    <div className="col-md-4 pn text-right" style={this.props.taskId ? {} : {display: 'none'}}>
                        <a href={'/smartquery/task-result.html?taskId=' + this.props.taskId} target='_blank'>{i18n.t("warning.view-more")}</a>
                    </div>
                </div>
                <div className="flex-item ">
                    <div>
                    <table className="table table-hover table-bordered modeling_table" id="table_modeling" style={{fontSize:'14px'}}>
                        <thead>
                        <tr>
                            {
                                _.map(this.props.result.meta, function(metaItem) {
                                    return (<th className="text-nowrap">{metaItem.caption}</th>)
                                })
                            }
                        </tr>
                        </thead>
                        <tbody>
                        {
                            _.map(this.props.result.records, function(recordItemList) {
                                return (<tr>
                                    {_.map(recordItemList, function(recordItem) {
                                        return (<td className="text-nowrap">{recordItem}</td>)
                                    })}
                                </tr>)
                            })
                        }
                        </tbody>
                    </table>
                </div>
                </div>
            </div>
        )
    }
})

function processData(data) {
    var matchedIndex = [];
    _.each(data.meta, function(metaItem, index) {
        if(metaItem.type == 'date') {
            matchedIndex.push(index);
        }
    })
    _.each(data.records, function(recordItem) {
        _.each(matchedIndex, function(index) {
            recordItem[index] = _.isString(recordItem[index]) && recordItem[index].substring(0, 10);
        })
    })
    return data;
}

module.exports.render = function (container, viewMode, taskInfoOrDataSource) {
    if (!taskInfoOrDataSource) {
        jqxhr && jqxhr.abort() && (jqxhr = null);

        ReactDOM.render(<Provider.default><Status /></Provider.default>, container);
    } else {
        //// 避免重复刷新
        //if (loaded) {
        //    if (infoOrDs && curMode == viewMode) {
        //        if (viewMode == mode.DATA_SOURCE) {
        //            if (_.isEqual(taskInfoOrDataSource, infoOrDs)) {
        //                return;
        //            }
        //        } else if (taskInfoOrDataSource.taskId == infoOrDs.taskId) {
        //            return;
        //        }
        //    }
        //    loaded = false;
        //}

        infoOrDs = taskInfoOrDataSource;
        curMode = viewMode;

        ReactDOM.render(<Provider.default><Status hints={window.i18n.t("warning.searching")} loading={true}/></Provider.default>, container);
        jqxhr && jqxhr.abort()  && (jqxhr = null);

        if (viewMode == mode.DATA_SOURCE) {
            loadDataSource(taskInfoOrDataSource).then(function (data) {
                data = processData(data);
                ReactDOM.render(<Provider.default><TaskResult result={data}/></Provider.default>, container);
            }).catch(function (data) {
                ReactDOM.render(<Provider.default><Status hints={data.hints}/></Provider.default>, container);
            })
        } else {
            if (!taskInfoOrDataSource.isSave) {
                // 没有保存中间库
                ReactDOM.render(<Provider.default><Status hints={window.i18n.t("warning.this-node-has-not-saved-middle-database")}/></Provider.default>, container);
                return;
            }
            if (taskInfoOrDataSource.taskState != 'finished') {
                ReactDOM.render(<Provider.default><Status hints={getStateLabel(taskInfoOrDataSource)}/></Provider.default>, container);
                return;
            }
            loadResult(taskInfoOrDataSource.taskId).then(function (data) {
                data = processData(data);
                ReactDOM.render(<Provider.default><TaskResult result={data} taskId={taskInfoOrDataSource.taskId}/></Provider.default>, container);
            }).catch(function (data) {
                ReactDOM.render(<Provider.default><Status hints={data.hints}/></Provider.default>, container);
            })
        }
    }
};
module.exports.mode = mode;


