var _ = require('underscore');

var MODELING_PROFESSION_ANALYSIS_OPR_MAP = {
    stringOpr: [{ key: 'equal', name: '等于', expert: true },
        { key: 'notEqual', name: '不等于', expert: true },
        { key: 'in', name: '在列表中' },
        { key: 'notIn', name: '不在列表中' },
        { key: 'startWith', name: '以...开头' },
        { key: 'notStartWith', name: '不以...开头' },
        { key: 'endWith', name: '以...结尾' },
        { key: 'notEndWith', name: '不以...结尾' },
        { key: 'like', name: '类似于' },
        { key: 'notLike', name: '不类似于' },
        { key: 'isNull', name: '为空' },
        { key: 'isNotNull', name: '不为空' }
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

var SYSTEM_OPR_MAP = {
    stringOpr: [{ key: 'equal', name: '等于' },
        { key: 'notEqual', name: '不等于' },
        { key: 'in', name: '在列表中' },
        { key: 'notIn', name: '不在列表中' },
        { key: 'startWith', name: '以...开头' },
        { key: 'notStartWith', name: '不以...开头' },
        { key: 'endWith', name: '以...结尾' },
        { key: 'notEndWith', name: '不以...结尾' },
        { key: 'like', name: '类似于' },
        { key: 'notLike', name: '不类似于' },
        { key: 'isNull', name: '为空' },
        { key: 'isNotNull', name: '不为空' }
    ],
    numberOpr: [{ key: 'equal', name: '等于' },
        { key: 'notEqual', name: '不等于' },
        { key: 'greaterThan', name: '大于' },
        { key: 'lessThan', name: '小于' },
        { key: 'notLessThan', name: '大于等于' },
        { key: 'notGreaterThan', name: '小于等于' },
        { key: 'between', name: '在...之间' },
        { key: 'notBetween', name: '不在...之间' },
        { key: 'isNull', name: '为空' },
        { key: 'isNotNull', name: '不为空' }
    ],
    // dateTimeOpr: [{ key: 'notLessThan', name: '起始于' },
    //     { key: 'notGreaterThan', name: '终止于' },
    //     { key: 'equal', name: '等于' },
    //     { key: 'notEqual', name: '不等于' },
    //     { key: 'between', name: '在...之间' },
    //     { key: 'notBetween', name: '不在...之间' },
    //     { key: 'isNull', name: '为空' },
    //     { key: 'isNotNull', name: '不为空' }
    // ],
    // dateOpr: [{ key: 'notLessThan', name: '起始于' },
    //     { key: 'notGreaterThan', name: '终止于' },
    //     { key: 'equal', name: '等于' },
    //     { key: 'notEqual', name: '不等于' },
    //     { key: 'between', name: '在...之间' },
    //     { key: 'notBetween', name: '不在...之间' },
    //     { key: 'isNull', name: '为空' },
    //     { key: 'isNotNull', name: '不为空' }
    // ],
    dateTimeOpr: [
        { key: 'between', name: '在...之间' },
        { key: 'notBetween', name: '不在...之间' },
        { key: 'notLessThan', name: '起始于' },
        { key: 'notGreaterThan', name: '终止于' },
        { key: 'equal', name: '等于' },
        { key: 'notEqual', name: '不等于' },
        { key: 'isNull', name: '为空' },
        { key: 'isNotNull', name: '不为空' }
    ],
    dateOpr: [
        { key: 'between', name: '在...之间' },
        { key: 'notBetween', name: '不在...之间' },
        { key: 'notLessThan', name: '起始于' },
        { key: 'notGreaterThan', name: '终止于' },
        { key: 'equal', name: '等于' },
        { key: 'notEqual', name: '不等于' },
        { key: 'isNull', name: '为空' },
        { key: 'isNotNull', name: '不为空' }
    ],
    codeTagOpr: [{ key: 'in', name: '在列表中', expert: true },
        { key: 'notIn', name: '不在列表中', expert: true },
        { key: 'isNull', name: '为空' },
        { key: 'isNotNull', name: '不为空' }
    ],
    eventDateTimeOpr: [
        {key: 'between', name: '在...之间' }
    ],

    typeOpr: [
        { key: 'in', name: '在列表中' }, 
        { key: 'notIn', name: '不在列表中' }, 
        { key: 'isNull', name: '为空' }, 
        { key: 'isNotNull', name: '不为空' }
    ]
};

function isTime(data) {
    return _.contains(['date', 'datetime', 'timestamp'], data);
}

function isNumber(data) {
    return _.find(['int', 'bigint', 'double', 'decimal'], function(type) {
        return type == data;
    });
}

function isOprMultiple(opr) {
    return _.contains(['in', 'notIn', 'between', 'notBetween'], opr);
}

module.exports = {
    MODELING_PROFESSION_ANALYSIS_OPR_MAP: MODELING_PROFESSION_ANALYSIS_OPR_MAP,
    MODELING_FILTER_OPR_MAP: SYSTEM_OPR_MAP,
    SMARTQUERY_OPR_MAP:SYSTEM_OPR_MAP,

    isTime: isTime,
    isNumber: isNumber,
    isOprMultiple: isOprMultiple,
}
