initLocales();
var Alert = require('nova-alert');
var Notify = require('nova-notify');
var _ = require('underscore');
var Q = require('q');
var tplsearchForm = require('../../tpl/analysis/tpl-relationship-analysis-add-node');

var tplsearch = require('../../tpl/analysis/relationship-analysis-search.html');

tplsearchForm = _.template(tplsearchForm);

$('#content-container2').append(tplsearch);

hideLoader();

var srcSearchType = 1;
var dstSearchType = 1;

var certPattern = new RegExp(/^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{4}$/);
var mobilePattern = new RegExp(/^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/);
var mailPattern = new RegExp(/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/);
var ipPattern = new RegExp(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);

var categoryStabled1 = false; // 手动选择了一个类别，不要让自动匹配再生效
var categoryStabled2 = false; // 手动选择了一个类别，不要让自动匹配再生效


$('#query-node-box1 .dropdown-menu a').on('click', function() {
    var a = $(this);
    selectDropdown1(a);
    if (srcSearchType == 1) {
        categoryStabled1 = false;
    } else {
        categoryStabled1 = true;
    }
});

$('#query-node-box2 .dropdown-menu a').on('click', function() {
    var a = $(this);
    selectDropdown2(a);
    if (dstSearchType == 1) {
        categoryStabled2 = false;
    } else {
        categoryStabled2 = true;
    }
});

$("#txt-query-node-key-src").on("input", function() {
    // 没有手动选择类别才进行正则匹配
    if (!categoryStabled1) {
        var searchinput1 = $("#txt-query-node-key-src").val();
        if (certPattern.test(searchinput1)) {
            selectDropdown1($("#query-node-box1 #button_1"));
        } else if (mobilePattern.test(searchinput1)) {
            selectDropdown1($("#query-node-box1 #button_5"));
        } else if (mailPattern.test(searchinput1)) {
            selectDropdown1($("#query-node-box1 #button_12"));
        } else if (ipPattern.test(searchinput1)) {
            selectDropdown1($("#query-node-box1 #button_14"));
        } else {
            selectDropdown1($("#query-node-box1 #button_1"));
        }
    }
});

$("#txt-query-node-key-dst").on("input", function() {
    // 没有手动选择类别才进行正则匹配
    if (!categoryStabled2) {
        var searchinput2 = $("#txt-query-node-key-dst").val();
        if (certPattern.test(searchinput2)) {
            selectDropdown2($("#query-node-box2 #button_1"));
        } else if (mobilePattern.test(searchinput2)) {
            selectDropdown2($("#query-node-box2 #button_5"));
        } else if (mailPattern.test(searchinput2)) {
            selectDropdown2($("#query-node-box2 #button_12"));
        } else if (ipPattern.test(searchinput2)) {
            selectDropdown2($("#query-node-box2 #button_14"));
        } else {
            selectDropdown2($("#query-node-box2 #button_1"));
        }
    }
});

$("#search-form").on('submit', function(e) {
    e.preventDefault();

    var srcEntityId = $('#txt-query-node-key-src').val().trim();
    var dstEntityId = $('#txt-query-node-key-dst').val().trim();

    console.log('SRC SEARCH TYPE    ');
    console.log(srcSearchType);
    console.log('SRC KEYWORD    ');
    console.log(srcEntityId);
    console.log('DST SEARCH TYPE    ');
    console.log(dstSearchType);
    console.log('DST KEYWORD    ');
    console.log(dstEntityId);

    if (_.isEmpty(srcEntityId) || _.isEmpty(dstEntityId)) {
        Alert.show({
            container: $("#alert-container"),
            alertid: "alert-keyword-empty",
            alertclass: "alert-warning",
            content: "<i class='fa fa-keyboard-o pr10'></i><strong> 请输入查询关键字！ </strong>"
        });
        return;
    }

    Q.all([checkEntityExist(srcEntityId, srcSearchType), checkEntityExist(dstEntityId, dstSearchType)])
        .spread(function() {
            window.location.href = "/relationanalysis/analysis/relationship-analysis-result.html?srcentitytype=" + srcSearchType
                + "&srcentityid=" + srcEntityId + "&dstentitytype=" + dstSearchType + "&dstentityid=" + dstEntityId;
        })
        .catch(function(msg) {
            Notify.show({
                title: msg,
                type: 'error'
            })
        })
})

function checkEntityExist(entityId, entityType) {
    var checkEntityExistDefer = Q.defer();
    $.getJSON('/relationanalysis/personcore/checkentityexist', {
        entityId: entityId,
        entityType: entityType
    }).done(function(rsp) {
        if (rsp.code != 0) {
            checkEntityExistDefer.reject(rsp.message ? rsp.message : '网络请求失败');
            Alert.show({
                container: $("#alert-container"),
                alertid: "alert-keyword-no-result",
                alertclass: "alert-warning",
                content: "<i class='fa fa-keyboard-o pr10'></i><strong>" + rsp.message ? rsp.message : '网络请求失败' + "</strong>"
            });
        }
        if (rsp.data == 0) {
            checkEntityExistDefer.reject('未找到相应的实体：'+entityId+'('+entityType+')');
            Alert.show({
                container: $("#alert-container"),
                alertid: "alert-keyword-no-result",
                alertclass: "alert-warning",
                content: "<i class='fa fa-keyboard-o pr10'></i><strong> 没有符合条件的结果 </strong>"
            });
        } else if (rsp.data == 2) {
            checkEntityExistDefer.reject(rsp.message);
            Alert.show({
                container: $("#alert-container"),
                alertid: "alert-keyword-illegal",
                alertclass: "alert-danger",
                content: "<i class='fa fa-keyboard-o pr10'></i><strong>" + rsp.message + "</strong>"
            });
        } else if (rsp.data == 1) {
            checkEntityExistDefer.resolve();
        }
    });

    return checkEntityExistDefer.promise;
}

function selectDropdown1(aButton) {
    $('#query-node-box1 button').html(aButton.html());
    $('#query-node-box1').removeClass('open');
    srcSearchType = parseInt(aButton.attr('data-type'));
}

function selectDropdown2(aButton) {
    $('#query-node-box2 button').html(aButton.html());
    $('#query-node-box2').removeClass('open');
    dstSearchType = parseInt(aButton.attr('data-type'));
}
