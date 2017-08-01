initLocales();
require([
    "../../module/renlifang/rlf-summary",
    "../../module/renlifang/rlf-property",
    "../../module/renlifang/rlf-relation",
    "../../module/renlifang/rlf-relation-predict",
    "../../module/renlifang/rlf-behaviors",
    '../../module/renlifang/rlf-actioninfo',
    '../../module/renlifang/rlf-suspicious-action',
    'nova-notify',
    'nova-utils',
    "jquery",
    "underscore",
    "../../../../config",
], function(Summary, Property, Relations, RelationsPredict, Behaviors, ActionInfo, SuspiciousAcion, Notify, Util, $, _, appConfig) {
    //将本次查询stash
    if (window.localStorage) {
        var stash = window.localStorage['/renlifang/profile.html'] || '[]';
    }
    //do some init staff
    var entityId, entityType, personSummary, personProperty, keyValueMap, tagsData;

    entityId = UrlUtil.getEntityId();
    entityType = UrlUtil.getEntityType();

    var isPermission = false; //permission for yijiansou
    var showItemsCount = 4; //fold items count

    function renderBasicInfo() {
        var cert;
        var hasCname = true;
        _.each(personSummary, function(item) {
            if (item.name == 'CNAME') {
                if (!_.isEmpty(item.valueList)) {
                    $('#profile-name').text(item.valueList[0].value);
                    $('#name-confidence-range').text(item.valueList[0].confidence + '%');
                }else{
                    hasCname = false;
                }
            } else if(item.name == 'ENAME'){
                if (!_.isEmpty(item.valueList) && !hasCname) {
                    $('#profile-name').text(item.valueList[0].value);
                    $('#name-confidence-range').text(item.valueList[0].confidence + '%');
                }
            } else if (item.name == 'SFZ') {
                if (!_.isEmpty(item.valueList)) {

                    cert = item.valueList[0].value;
                    $('#profile-cert').text(cert);
                    //$('#profile-avatar').attr('src', '/renlifang/personcore/getpersonphoto?identityid=' + cert);
                    $('#cert-confidence-range').text(item.valueList[0].confidence + '%');
                }
            } else if (item.name == 'ADDRESS') {
                if (!_.isEmpty(item.valueList)) {
                    $('#profile-address').removeClass('hidden').text(item.valueList[0].value);
                    $('#address-confidence-range').text(item.valueList[0].confidence + '%');
                }
            } else if (item.name == 'USER_MSISDN') {
                if (!_.isEmpty(item.valueList)) {
                    $('#profile-phone').siblings().removeClass('hidden');
                    $('#profile-phone').text(item.valueList[0].value);
                    $('#profile-phone').parent('a').attr('href', '/smartquery/smart-query-frame.html?mobile=' + item.valueList[0].value);
                    $('#phone-confidence-range').text(item.valueList[0].confidence + '%');
                }
            }
        });

        $('#suspicious-action-tag').removeClass('hidden');
        var tagContainer = $('#suspicious-action-tag');
        var tplTag = _.template("<span class='tm-tag tm-tag-danger'><span><%- tag %></span></span>");
        var tagList = [];


        if (!_.isEmpty(tagsData)) {
            $('#tab-suspicious-action').removeClass('hidden');
            if (_.size(tagsData) < 3) {
                for (var i = 0; i < _.size(tagsData); i++) {
                    if (_.isNull(tagsData[i].tagValue) || _.isEmpty(tagsData[i].tagValue)) {
                        tagList.push(tagsData[i].tagName);
                    } else {
                        tagList.push(tagsData[i].tagName + ":" + tagsData[i].tagValue);
                    }
                }
            } else {
                for (var j = 0; j < 3; j++) {
                    if (_.isNull(tagsData[j].tagValue) || _.isEmpty(tagsData[j].tagValue)) {
                        tagList.push(tagsData[j].tagName);
                    } else {
                        tagList.push(tagsData[j].tagName + ":" + tagsData[j].tagValue);
                    }
                }
            }
            _.each(tagList, function(item) {
                var tagItem = tplTag({
                    tag: item
                });
                tagContainer.append(tagItem);
            });
        }
    }

    //edit by hjw
    //修改后的获取照片逻辑 
    //1.首先看接口是否返回非默认的照片，是则结束逻辑贴上照片
    //2.否则调用一次getExternalInfo获取第三方数据的公安查询户籍接口，不关心返回，为的是户籍照片记录到缓存中
    //3.成功后在调用获取照片接口拿到新照片
    //注:修改了批量获取照片接口的route层代码，返回不再是直接的图片而是带code data的Object，因此img的src需要用到data:image/png;base64

    function getPersonPhoto(keyValueMap) {
        var idList = [];
        var sfz = getProfileValueByKey('SFZ');
        var passport = getProfileValueByKey('PASSPORT');
        var str = "";
        if (sfz.values.length > 0) {
            _.map(sfz.values, function(value) {
                idList.push({
                    idType: 1,
                    idVal: value
                })
            })
        }
        if (passport.values.length > 0) {
            _.map(passport.values, function(value) {
                idList.push({
                    idType: 2,
                    idVal: value
                })
            })
        }

        $.getJSON('/renlifang/personcore/batchGetPersonPhoto?idList=' + JSON.stringify({
            queryList: idList
        }), function(rsp) {
            var noCachePhoto = false;
            if (rsp.code == 0) {
                $('#profile-avatar').attr('src', 'data:image/png;base64,' + rsp.data.photos[0]);
                if (rsp.data.isDefaultPic == 1) {
                    var findSFZ = _.find(keyValueMap, function(k) {
                        return k.name == 'SFZ';
                    })
                    if (findSFZ && findSFZ.values && findSFZ.values.length > 0 && findSFZ.values[0] != '') {
                        $.getJSON('/renlifang/personcore/getExternalInfo', {
                            entityId: findSFZ.values[0],
                            entityType: 1,
                            queryType: 1
                        }, function(rsp2) {
                            if (rsp2.code == 0) {
                                $.getJSON('/renlifang/personcore/batchGetPersonPhoto?idList=' + JSON.stringify({
                                    queryList: idList
                                }), function(rsp3) {
                                    if (rsp3.code == 0) {
                                        $('#profile-avatar').attr('src', 'data:image/png;base64,' + rsp3.data.photos[0]);
                                    }
                                });
                            }
                        });
                    }

                }
            } else {
                Notify.show({
                    title: '获取照片失败',
                    type: 'danger'
                });
            }
        });
        // $('#profile-avatar').attr('src', '/personcore/batchGetPersonPhoto?idList='+ JSON.stringify({queryList:idList}));
    }

    function getProfileValueByKey(key) {
        return _.find(keyValueMap, function(item) {
            return item.name == key;
        });
    }

    // 监听tab切换
    $("a[data-toggle='tab']").on('shown.bs.tab', function(e) {
        var id = $(e.target).parent().attr("id");
        if (id == "tab-relations") {
            Relations.render(isPermission);
        } else if (id == "tab-relations-predict") {
            RelationsPredict.render(isPermission);
        } else if (id == "tab-properties") {
            console.log(personProperty , keyValueMap , showItemsCount , isPermission)
            Property.render(personProperty,keyValueMap, showItemsCount, isPermission);
        } else if (id == "tab-behavior") {
            Behaviors.render();
        } else if (id == "tab-actioninfo") {
            ActionInfo.render();
        } else if (id == 'tab-suspicious-action') {
            SuspiciousAcion.render(tagsData);
        }
    })

    // 获取详情
    var searchAllPermission = "100000:function:searchall";
    $.getJSON('/renlifang/personcore/getpersondetail', {
        entityid: entityId,
        entitytype: entityType ? entityType : 0
    }, function(rsp) {
        hideLoader();
        if (rsp.code != 0) {
            Notify.show({
                title: "获取详情失败",
                text: rsp.message,
                type: "error"
            });
            return;
        }

        personProperty = rsp.data.information;
        personSummary = rsp.data.summary;
        keyValueMap = rsp.data.keyValueMap;
        window.keyValueMap = keyValueMap;
        tagsData = rsp.data.tags;


        renderBasicInfo();

        getPersonPhoto(keyValueMap);

        $.getJSON('/workspacedir/checkPermissions', {
            permissions: [searchAllPermission]
        }).done(function(rsp) {
            if (rsp.code == 0) {
                var myPermissions = rsp.data;
                if (_.contains(myPermissions, searchAllPermission)) {
                    isPermission = true;
                }
            } else {
                Notify.show({
                    title: "获取用户权限失败!",
                    type: "error"
                });
            }
            Summary.render(personSummary, showItemsCount, isPermission);
        })

        // check QQ for display relation tab
        var qq = getProfileValueByKey('QQ');
        qq = qq ? qq.values : qq;
        var mobile = getProfileValueByKey('USER_MSISDN');
        mobile = mobile ? mobile.values : mobile;
        if (!_.isEmpty(qq) || !_.isEmpty(mobile)) {
            $('#tab-relations').removeClass('hidden');
        }

        if (_.isEmpty(qq)) {
            Relations.disableQQ();
        }

        // check cert for display relation predict
        var cert = getProfileValueByKey('SFZ');
        cert = cert ? cert.values : cert;
        var imei = getProfileValueByKey('IMEI');
        imei = imei ? imei.values : imei;
        var radius = getProfileValueByKey('RADIUS');
        radius = radius ? radius.values : radius;
        var passport = getProfileValueByKey('PASSPORT');
        if (!_.isEmpty(cert) || !_.isEmpty(imei) || !_.isEmpty(radius) || !_.isEmpty(passport.values)) {
            $('#tab-relations-predict').removeClass('hidden');
        }

        if (_.isEmpty(cert) && _.isEmpty(passport.values)) {
            RelationsPredict.disableCompanyandTickets();
        }

        if (_.isEmpty(imei)) {
            RelationsPredict.disableIMEI();
        }

        if (_.isEmpty(radius)) {
            RelationsPredict.disableRadius();
        }
        if (_.isEmpty(cert)) {
            RelationsPredict.disableAddress();
        }

        // ActionInfo
        var actionType;
        var actionValue;

        if (!_.isEmpty(cert)) {
            actionType = 1;
            actionValue = cert[0];
        } else {
            actionType = 1;
            actionValue = "";
        }
        // } else if (passport && !_.isEmpty(passport.values)) {
        //     actionType = 2;
        //     actionValue = passport.values[0];
        // }
        if (actionValue || passport.values) {
            $('#tab-actioninfo').removeClass('hidden');
            ActionInfo.init({
                type: actionType,
                value: actionValue,
                passport: passport.values
            })
        }
    });

    // 概要
    Summary.init({
        container: $("#summary")
    });

    // 属性
    Property.init({
        container: $("#properties"),
        entityId:entityId,
        entityType:entityType
    });

    // 关系
    Relations.init({
        container: $('#relations'),
        qqSource: function() {
            var myQQ = getProfileValueByKey('QQ');
            myQQ = myQQ ? myQQ.values : myQQ;
            if (!_.isEmpty(myQQ)) {
                return {
                    url: "/renlifang/personcore/getqq",
                    data: {
                        qq: myQQ
                    }
                }
            }
        },
        loadQQGroupDetail: function(number, callback) {
            showLoader();
            $.getJSON("/renlifang/personcore/getqqgroup", {
                number: number
            }, function(rsp) {
                hideLoader();
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
        },
        loadPhoneLink: function() {
            var myPhone = getProfileValueByKey('USER_MSISDN');
            if (!_.isEmpty(myPhone.values)) {
                myPhone = myPhone.values;
                return myPhone;
            } else {
                return;
            }
        }
    });


    // 关系推测
    RelationsPredict.init({
        container: $('#relations-predict'),

        // modify by zhangu
        getSfzValues: function() {
            var myCert = getProfileValueByKey('SFZ');
            if (!_.isEmpty(myCert.values)) {
                myCert = myCert.values;
                return myCert;
            } else {
                return;
            }
        },
        getPassportValues: function() {
            var myPassport = getProfileValueByKey('PASSPORT');
            if (!_.isEmpty(myPassport.values)) {
                myPassport = myPassport.values;
                return myPassport;
            } else {
                return;
            }
        },
        loadList: function(passport, cert, type, start, end, frequency, callback) {
            // var certvalue = getProfileValueByKey('SFZ').values;
            // if(!cert){
            //     cert = getProfileValueByKey('SFZ').values[0]
            // }else{
            showLoader();
            $.getJSON("/renlifang/personcore/getpartner", {
                    passport: passport,
                    cert: cert,
                    start: start,
                    end: end,
                    frequency: frequency,
                    type: type
                }, function(rsp) {
                    hideLoader();
                    if (rsp.code == 0) {
                        callback(rsp.data);
                    }
                })
                // }
        },

        //the end

        loadDetail: function(id, callback) {
            $.getJSON("/renlifang/personcore/getpartnerdetail", {
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
            $.getJSON("/renlifang/personcore/gethujiaddressrelation", {
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
                $.getJSON("/renlifang/personcore/getimeirelation", {
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
                $.getJSON("/renlifang/personcore/getradiusrelation", {
                    radius: radius
                }, function(rsp) {
                    if (rsp.code == 0) {
                        callback(rsp.data);
                    }
                })
            }
        },
        getAddress: function(callback) {
            var cert = getProfileValueByKey('SFZ').values[0];
            var ids = [];
            ids.push(cert);
            if (ids) {
                $.getJSON("/renlifang/personcore/gethujiaddressrelation", {
                    ids: ids
                }, function(rsp) {
                    if (rsp.code == 0) {
                        callback(rsp.data);
                    }
                })
            }

        }

    });


    // 行为
    Behaviors.init({
        container: $('#behaviors')
    });

    // 可疑行为
    SuspiciousAcion.init({
        container: $('#suspicious-action')
    });

    $('#btn-export-word').on('click', function() {
        $.getJSON('/renlifang/personcore/generatedoc', {
            entityid: entityId,
            entitytype: entityType ? entityType : 0
        }, function(rsp) {
            if (rsp.code != 0) {
                Notify.show({
                    title: "生成文档失败",
                    message: rsp.message,
                    type: "error"
                });
                return;
            }
            var docURL = rsp.data;
            /*var alink = document.createElement('a');
            var evt = document.createEvent("HTMLEvents");
            evt.initEvent("click", false, false);
            alink.download = docURL.substring(docURL.lastIndexOf("/")+1);
            alink.href = docURL;
            alink.click();*/
            window.open(docURL);
        })
    })
});