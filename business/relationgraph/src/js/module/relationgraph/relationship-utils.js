/**
 * Created by root on 8/23/16.
 */
// 可计数的关联未：通联，汇款，火车同行，飞机同行，飞机同订票
var COUNTABLE_LINK_TYPES = [4, 6, 10, 11, 12];
module.exports.COUNTABLE_LINK_TYPES = COUNTABLE_LINK_TYPES;

module.exports.LINK_NAMES = {
    1: '关联',
    2: '包含',
    3: '从属',
    4: '通联',
    6: '汇款',
    8: '好友',
    10: '火车同行',
    11: '飞机同行',
    12: '飞机同订票'
};

module.exports.isEdgeCountable = function(edge) {
    var found = _.find(edge.filterAndLinkType, function(item) {
        return _.contains(COUNTABLE_LINK_TYPES, item.linkType);
    });
    return found;
};

module.exports.countFrequency = function(edge) {
    var frequency = 0;
    _.each(edge.filterAndLinkType, function (item) {
        if (_.contains(COUNTABLE_LINK_TYPES, item.linkType)) {
            frequency += item.frequency;
        }
    });
    return frequency;
}

module.exports.generateEdgeId = function (srcNodeId, destNodeId) {
    // 确保命名一致性
    var edgeId;
    if (srcNodeId <= destNodeId) {
        edgeId =  srcNodeId + '_' + destNodeId;
    } else {
        edgeId =  destNodeId + '_' + srcNodeId;
    }
    return edgeId;
}