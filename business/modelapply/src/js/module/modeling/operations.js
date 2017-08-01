/**
 * Created by yaco on 16-1-20.
 */
var DATA_SOURCE = 0,//数据源
    COL_EXTRACTION = 6,//
    FILTER = 201,//过滤
    INTERSECTION = 202,//交集
    UNION = 203,//并集
    DIFFERENCE = 204,//差集
    GROUP_STATISTICS = 205,//分组统计
    FULL_TEXT_INDEX = 206,//全文检索
    COLUMN_CONVERT = 207,//列变换
    JOINT = 208,//连接
    COMBINATION = 209,//合并
    RECORD_EXTRACTION = 210,//记录提取
    Dereplication = 211,//去重
    PROFESSION = 212,//专家分析
    KMEANS_CLUSTER = 301,//聚类
    NAIVE_BAYES = 302,//贝叶斯
    LOGISTIC_REGRESSION = 303,//逻辑回归
    SVM = 304,//支持向量机
    LINEAR_REGRESSION = 305,//线性回归
    PREDICTING = 306;//预测

module.exports.DATA_SOURCE = DATA_SOURCE;
module.exports.COL_EXTRACTION = COL_EXTRACTION;
module.exports.FILTER = FILTER;
module.exports.INTERSECTION = INTERSECTION;
module.exports.UNION = UNION;
module.exports.DIFFERENCE = DIFFERENCE;
module.exports.GROUP_STATISTICS = GROUP_STATISTICS;
module.exports.FULL_TEXT_INDEX = FULL_TEXT_INDEX;
module.exports.COLUMN_CONVERT = COLUMN_CONVERT;
module.exports.JOINT = JOINT;
module.exports.COMBINATION = COMBINATION;
module.exports.RECORD_EXTRACTION = RECORD_EXTRACTION;
module.exports.Dereplication = Dereplication;
module.exports.KMEANS_CLUSTER = KMEANS_CLUSTER;
module.exports.SVM = SVM;
module.exports.NAIVE_BAYES = NAIVE_BAYES;
module.exports.LOGISTIC_REGRESSION = LOGISTIC_REGRESSION;
module.exports.LINEAR_REGRESSION = LINEAR_REGRESSION;
module.exports.PROFESSION = PROFESSION;
module.exports.PREDICTING = PREDICTING; 

var ICON_CONFIG = {
    6: {
        iconCls: 'fa fa-columns',
        iconCode: '\uf0db'
    },
    201: {
        iconCls: 'icomoonOp icon-filter',
        iconCode: '\ue908'
    },
    202: {
        iconCls: 'icomoonOp icon-intersection',
        iconCode: '\ue90b'
    },
    203: {
        iconCls: 'icomoonOp icon-union',
        iconCode: '\ue910'
    },
    204: {
        iconCls: 'icomoonOp icon-difference',
        iconCode: '\ue905'
    },
    205: {
        iconCls: 'icomoonOp icon-group',
        iconCode: '\ue90a'
    },
    206: {
        iconCls: 'icomoonOp icon-search',
        iconCode: '\ue90f'
    },
    207: {
        iconCls: 'icomoonOp icon-column-transformation',
        iconCode: '\ue902'
    },
    208: {
        iconCls: 'icomoonOp icon-contact',
        iconCode: '\ue903'
    },
    209: {
        iconCls: 'icomoonOp icon-merge',
        iconCode: '\ue90e'
    },
    210: {
        iconCls: 'icomoonOp icon-extract',
        iconCode: '\ue907'
    },
    211: {
        iconCls: 'icomoonOp icon-uniq',
        iconCode: '\ue911'
    },
    212: {
        iconCls: 'icomoonOp icon-expert-analysis',
        iconCode: '\ue906'
    },
    301: {
        iconCls: 'icomoonOp icon-cluster',
        iconCode: '\ue901'
    },
    302: {
        iconCls: 'icomoonOp icon-bayes',
        iconCode: '\ue900'
    },
    303: {
        iconCls: 'icomoonOp icon-logistic-regression',
        iconCode: '\ue90d'
    },
    304: {
        iconCls: 'icomoonOp icon-vector',
        iconCode: '\ue912'
    },
    305: {
        iconCls: 'icomoonOp icon-linear-regression',
        iconCode: '\ue90c'
    },
    306: {
        iconCls: 'icomoonOp icon-forecast',
        iconCode: '\ue909'
    }
};

module.exports.iconConfigOf = function (taskType) {
    var cfg = ICON_CONFIG[taskType];
    return cfg || {
            iconCls: 'icomoonOp icon-database',
            iconCode: '\ue904'
        };
};
