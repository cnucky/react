var $ = require('jquery');
var _ = require('underscore');
var Notify = require('nova-notify');
var Property = require('./rdp-property');
var Relations = require('./rdp-relation');
var RelationsPredict = require('./rdp-relation-predict');
var ActionInfo = require('./rdp-actioninfo');


function init(data) {
    var idInfo, position, entityId, entityType, personProperty, keyValueMap;

    idInfo = data.idInfo;
    position = data.position;
    entityId = data.entityId;
    entityType = data.entityType;

    function getProfileValueByKey(key) {
        return _.find(keyValueMap, function(item) {
            return item.name == key;
        });
    }

    // 监听tab切换
    $(position + " " + "a[data-toggle='tab']").on('shown.bs.tab', function(e) { //
        var id = $(e.target).parent().attr("id");
        if (id == "tab-relations") {
            relationsInstance.render();
        } else if (id == "tab-relations-predict") {
            relationsPredictInstance.render();
        } else if (id == "tab-properties") {
            propertyInstance.render(personProperty);
        } else if (id == "tab-actioninfo") {
            actionInfoInstance.render();
        }
    })

    // 属性
    var propertyInstance = Property.init({
        position: position,
        container: $(position + " " + "#properties" + idInfo) //
    });

    // 关系
    var relationsInstance = Relations.init({
        idInfo: idInfo,
        position: position,
        container: $(position + " " + '#relations' + idInfo), //
        qqSource: function() {
            var myQQ = getProfileValueByKey('QQ');
            myQQ = myQQ ? myQQ.values : myQQ;
            if (!_.isEmpty(myQQ)) {
                return {
                    url: "/relationanalysis/personcore/getqq",
                    data: {
                        qq: myQQ
                    }
                }
            }
        },
        loadQQGroupDetail: function(number, callback) {
            // showLoader();
            $.getJSON("/relationanalysis/personcore/getqqgroup", {
                number: number
            }, function(rsp) {
                // hideLoader();
                if (rsp.code == 0) {
                    callback(rsp.data);
                }
            });
        },
        getqqtomobilelist: function(callback) {
            var qqtomobilelist = {}
            if (!_.isEmpty(getProfileValueByKey('QQ').values)) {
                qqtomobilelist.qq = getProfileValueByKey('QQ').values;
            } else {
                qqtomobilelist.qq = [];
            }
            if (!_.isEmpty(getProfileValueByKey('USER_MSISDN').values)) {
                qqtomobilelist.mobile = getProfileValueByKey('USER_MSISDN').values;
            } else {
                qqtomobilelist.mobile = [];
            }
            callback(qqtomobilelist);
        }
    });


    // 关系推测
    var relationsPredictInstance = RelationsPredict.init({
        idInfo: idInfo,
        position: position,
        container: $(position + " " + '#relations-predict' + idInfo), //
        loadList: function(type, start, end, frequency, callback) {
            var cert = getProfileValueByKey('SFZ').values[0];
            if (cert) {
                // showLoader();
                $.getJSON("/relationanalysis/personcore/getpartner", {
                    cert: cert,
                    start: start,
                    end: end,
                    frequency: frequency,
                    type: type
                }, function(rsp) {
                    // hideLoader();
                    if (rsp.code == 0) {
                        callback(rsp.data);
                    }
                })
            }
        },
        loadDetail: function(id, callback) {
            $.getJSON("/relationanalysis/personcore/getpartnerdetail", {
                id: id
            }, function(rsp) {
                if (rsp.code == 0) {
                    callback(rsp.data);
                }
            });
        },
        getAddress: function(callback) {
            var cert = getProfileValueByKey('SFZ').values[0];
            var ids = [];
            ids.push(cert);
            $.getJSON("/relationanalysis/personcore/gethujiaddressrelation", {
                ids: ids
            }, function(rsp) {
                if (rsp.code == 0) {
                    callback(rsp.data);
                }
            });
        },
        getIMEI: function(callback) {
            var imei = getProfileValueByKey('IMEI');
            imei = imei ? imei.values : imei;
            if (!_.isEmpty(imei)) {
                $.getJSON("/relationanalysis/personcore/getimeirelation", {
                    imei: imei
                }, function(rsp) {
                    if (rsp.code == 0) {
                        callback(rsp.data);
                    }
                })
            }
        },
        getRadius: function(callback) {
            var radius = getProfileValueByKey('RADIUS');
            radius = radius ? radius.values : radius;
            if (!_.isEmpty(radius)) {
                $.getJSON("/relationanalysis/personcore/getradiusrelation", {
                    radius: radius
                }, function(rsp) {
                    if (rsp.code == 0) {
                        callback(rsp.data);
                    }
                })
            }
        }
    });

    var actionInfoInstance;

    $.getJSON('/relationanalysis/personcore/getpersondetail', {
        entityid: entityId,
        entitytype: entityType ? entityType : 0
    }, function(rsp) {
        if (rsp.code != 0) {
            Notify.show({
                title: "获取详情失败",
                text: rsp.message,
                type: "error"
            });
            return;
        } else {
            personProperty = rsp.data.information;
            keyValueMap = rsp.data.keyValueMap;

            propertyInstance.render(personProperty);

            // check QQ for display relation tab
            var qq = getProfileValueByKey('QQ');
            qq = qq ? qq.values : qq;
            var mobile = getProfileValueByKey('USER_MSISDN');
            mobile = mobile ? mobile.values : mobile;
            if (!_.isEmpty(qq) || !_.isEmpty(mobile)) {
                $(position + " " + '#tab-relations').removeClass('hidden'); //
            }

            if (_.isEmpty(qq)) {
                relationsInstance.disableQQ();
            }

            // check cert for display relation predict
            var cert = getProfileValueByKey('SFZ');
            cert = cert ? cert.values : cert;
            var imei = getProfileValueByKey('IMEI');
            imei = imei ? imei.values : imei;
            var radius = getProfileValueByKey('RADIUS');
            radius = radius ? radius.values : radius;
            if (!_.isEmpty(cert) || !_.isEmpty(imei) || !_.isEmpty(radius)) {
                $(position + " " + '#tab-relations-predict').removeClass('hidden'); //
            }

            if (_.isEmpty(cert)) {
                relationsPredictInstance.disableCompanyandTickets();
            }

            if (_.isEmpty(imei)) {
                relationsPredictInstance.disableIMEI();
            }

            if (_.isEmpty(radius)) {
                relationsPredictInstance.disableRadius();
            }
            if (_.isEmpty(cert)) {
                relationsPredictInstance.disableAddress();
            }

            // ActionInfo
            var actionType;
            var actionValue;
            var passport = getProfileValueByKey('PASSPORT');
            if (!_.isEmpty(cert)) {
                actionType = 1;
                actionValue = cert[0];
            } else if (passport && !_.isEmpty(passport.values)) {
                actionType = 2;
                actionValue = passport.values[0];
            }
            if (actionType && actionValue) {
                $(position + " " + '#tab-actioninfo').removeClass('hidden'); //
                actionInfoInstance = ActionInfo.init({
                    idInfo: idInfo,
                    position: position,
                    type: actionType,
                    value: actionValue
                })
            }
        }
    });
}

module.exports = {
    init: init
};
