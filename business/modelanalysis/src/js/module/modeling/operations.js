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
    SORT = 214,//专家分析
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
module.exports.SORT = SORT;

var ICON_CONFIG = {
    6: {
        iconCls: 'icomoonOp icon-database',
        iconCode: '\ue90d'
    },
    201: {
        iconCls: 'icomoonOp icon-filter',
        iconCode: '\ue90f'
    },
    202: {
        iconCls: 'icomoonOp icon-intersection',
        iconCode: '\ue906'
    },
    203: {
        iconCls: 'icomoonOp icon-union',
        iconCode: '\ue905'
    },
    204: {
        iconCls: 'icomoonOp icon-difference',
        iconCode: '\ue903'
    },
    205: {
        iconCls: 'icomoonOp icon-group',
        iconCode: '\ue911'
    },
    206: {
        iconCls: 'icomoonOp icon-search',
        iconCode: '\ue913'
    },
    207: {
        iconCls: 'icomoonOp icon-column-transformation',
        iconCode: '\ue902'
    },
    208: {
        iconCls: 'icomoonOp icon-contact',
        iconCode: '\ue907'
    },
    209: {
        iconCls: 'icomoonOp icon-merge',
        iconCode: '\ue912'
    },
    210: {
        iconCls: 'icomoonOp icon-extract',
        iconCode: '\ue908'
    },
    211: {
        iconCls: 'icomoonOp icon-uniq',
        iconCode: '\ue90a'
    },
    212: {
        iconCls: 'icomoonOp icon-expert-analysis',
        iconCode: '\ue90e'
    },
    214: {
        iconCls: 'icomoonOp icon-order',
        iconCode: '\ue909'
    },
    301: {
        iconCls: 'icomoonOp icon-cluster',
        iconCode: '\ue900'
    },
    302: {
        iconCls: 'icomoonOp icon-bayes',
        iconCode: '\ue904'
    },
    303: {
        iconCls: 'icomoonOp icon-logistic-regression',
        iconCode: '\ue90c'
    },
    304: {
        iconCls: 'icomoonOp icon-SVM',
        iconCode: '\ue912'
    },
    305: {
        iconCls: 'icomoonOp icon-linear-regression',
        iconCode: '\ue90b'
    },
    306: {
        iconCls: 'icomoonOp icon-forecast',
        iconCode: '\ue910'
    }
};

module.exports.iconConfigOf = function (taskType) {
    var cfg = ICON_CONFIG[taskType];
    return cfg || {
            iconCls: 'icomoonOp icon-database',
            iconCode: '\ue90d'
        };
};
