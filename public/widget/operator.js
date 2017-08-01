define('widget/operator', [
    'underscore'
], function(_) {
    var MODELING_PROFESSION_ANALYSIS_OPR_MAP = {
        stringOpr: [{ key: 'equal', name: window.i18n.t("operator:equal"), expert: true },
            { key: 'notEqual', name: window.i18n.t("operator:not-equal"), expert: true },
            { key: 'in', name: window.i18n.t("operator:in") },
            { key: 'notIn', name: window.i18n.t("operator:not-in") },
            { key: 'startWith', name: window.i18n.t("operator:start-with") },
            { key: 'notStartWith', name: window.i18n.t("operator:not-start-with") },
            { key: 'endWith', name: window.i18n.t("operator:end-with") },
            { key: 'notEndWith', name: window.i18n.t("operator:not-end-with") },
            { key: 'like', name: window.i18n.t("operator:like") },
            { key: 'notLike', name: window.i18n.t("operator:not-like") },
            { key: 'isNull', name: window.i18n.t("operator:is-null") },
            { key: 'isNotNull', name: window.i18n.t("operator:is-not-null") }
        ],
        numberOpr: [{ key: 'equal', name: window.i18n.t("operator:equal"), expert: true },
            { key: 'notEqual', name: window.i18n.t("operator:not-equal"), expert: true },
            { key: 'greaterThan', name: window.i18n.t("operator:greater-than"), expert: true },
            { key: 'lessThan', name: window.i18n.t("operator:less-than"), expert: true },
            { key: 'between', name: window.i18n.t("operator:between") },
            { key: 'notBetween', name: window.i18n.t("operator:not-between") },
            { key: 'isNull', name: window.i18n.t("operator:is-null") },
            { key: 'isNotNull', name: window.i18n.t("operator:is-not-null") }
        ],
        dateTimeOpr: [{ key: 'equal', name: window.i18n.t("operator:equal"), expert: true },
            { key: 'notEqual', name: window.i18n.t("operator:not-equal"), expert: true },
            { key: 'notLessThan', name: window.i18n.t("operator:not-less-than"), expert: true },
            { key: 'notGreaterThan', name: window.i18n.t("operator:not-greater-than"), expert: true },
            { key: 'between', name: window.i18n.t("operator:between") },
            { key: 'notBetween', name: window.i18n.t("operator:not-between") },
            { key: 'isNull', name: window.i18n.t("operator:is-null"), expert: true },
            { key: 'isNotNull', name: window.i18n.t("operator:is-not-null"), expert: true }
        ],
        codeTagOpr: [{ key: 'in', name: window.i18n.t("operator:in")},
            { key: 'notIn', name: window.i18n.t("operator:not-in")},
            { key: 'equal', name: window.i18n.t("operator:equal"), expert: true, onlyExpert: true },
            { key: 'notEqual', name: window.i18n.t("operator:not-equal"), expert: true, onlyExpert: true },
            { key: 'isNull', name: window.i18n.t("operator:is-null") },
            { key: 'isNotNull', name: window.i18n.t("operator:is-not-null") }
        ]
    };

    var MODELING_FILTER_OPR_MAP = {
        stringOpr: [{ key: 'equal', name: window.i18n.t("operator:equal") },
            { key: 'notEqual', name: window.i18n.t("operator:not-equal") },
            { key: 'in', name: window.i18n.t("operator:in") },
            { key: 'notIn', name: window.i18n.t("operator:not-in") },
            { key: 'startWith', name: window.i18n.t("operator:start-with") },
            { key: 'notStartWith', name: window.i18n.t("operator:not-start-with") },
            { key: 'endWith', name: window.i18n.t("operator:end-with") },
            { key: 'notEndWith', name: window.i18n.t("operator:not-end-with") },
            { key: 'like', name: window.i18n.t("operator:like") },
            { key: 'notLike', name: window.i18n.t("operator:not-like") },
            { key: 'isNull', name: window.i18n.t("operator:is-null") },
            { key: 'isNotNull', name: window.i18n.t("operator:is-not-null") }
        ],
        numberOpr: [{ key: 'equal', name: window.i18n.t("operator:equal") },
            { key: 'notEqual', name: window.i18n.t("operator:not-equal") },
            { key: 'greaterThan', name: window.i18n.t("operator:greater-than") },
            { key: 'lessThan', name: window.i18n.t("operator:less-than") },
            { key: 'between', name: window.i18n.t("operator:between") },
            { key: 'notBetween', name: window.i18n.t("operator:not-between") },
            { key: 'isNull', name: window.i18n.t("operator:is-null") },
            { key: 'isNotNull', name: window.i18n.t("operator:is-not-null") }
        ],
        dateTimeOpr: [{ key: 'notLessThan', name: window.i18n.t("operator:not-less-than") },
            { key: 'notGreaterThan', name: window.i18n.t("operator:not-greater-than") },
            { key: 'equal', name: window.i18n.t("operator:equal") },
            { key: 'notEqual', name: window.i18n.t("operator:not-equal") },
            { key: 'between', name: window.i18n.t("operator:between") },
            { key: 'notBetween', name: window.i18n.t("operator:not-between") },
            { key: 'isNull', name: window.i18n.t("operator:is-null") },
            { key: 'isNotNull', name: window.i18n.t("operator:is-not-null") }
        ],
        codeTagOpr: [{ key: 'in', name: window.i18n.t("operator:in"), expert: true },
            { key: 'notIn', name: window.i18n.t("operator:not-in"), expert: true },
            { key: 'isNull', name: window.i18n.t("operator:is-null") },
            { key: 'isNotNull', name: window.i18n.t("operator:is-not-null") }
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

    return {
        MODELING_PROFESSION_ANALYSIS_OPR_MAP: MODELING_PROFESSION_ANALYSIS_OPR_MAP,
        MODELING_FILTER_OPR_MAP: MODELING_FILTER_OPR_MAP,
        isTime: isTime,
        isNumber: isNumber,
        isOprMultiple: isOprMultiple
    }
})