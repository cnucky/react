var OPERATIONS = require('./operations');

module.exports = function(type) {
    switch (type) {
        case OPERATIONS.DATA_SOURCE:
            return "#289de9";
        case OPERATIONS.COL_EXTRACTION:
            return "#1bbc9d";
        case OPERATIONS.FILTER:
            return "#2fcc71";
        case OPERATIONS.INTERSECTION:
            return "#3598dc";
        case OPERATIONS.UNION:
            return "#9c59b8";
        case OPERATIONS.DIFFERENCE:
            return "#34495e";
        case OPERATIONS.GROUP_STATISTICS:
            return "#16a086";
        case OPERATIONS.FULL_TEXT_INDEX:
            return "#27ae61";
        case OPERATIONS.COLUMN_CONVERT:
            return "#8f44ad";
        case OPERATIONS.JOINT:
            return "#2d3e50";
        case OPERATIONS.COMBINATION:                        
            return "#ca4709";
        case OPERATIONS.RECORD_EXTRACTION:
            return "#e77e23";                        
        case OPERATIONS.Dereplication:
            return "#e84c3d";                      
        case OPERATIONS.PROFESSION:
            return "#f90018";                        
        case OPERATIONS.KMEANS_CLUSTER:
            return "#f49c14";                        
        case OPERATIONS.NAIVE_BAYES:
            return "#d55401";                        
        case OPERATIONS.LOGISTIC_REGRESSION:
            return "#be3b29";                        
        case OPERATIONS.SVM: 
            return "#c1392b";                       
        case OPERATIONS.LINEAR_REGRESSION:
            return "#808b8d";                        
        case OPERATIONS.PREDICTING:
            return "#2a80b9";
        default: 
            return "#289de9";
    }
}