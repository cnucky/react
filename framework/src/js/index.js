require(['underscore',
    'menu/menu',
    'menu/menu-permission',
    'main',
    'nova-utils',
    'widget/login-dialog',
    'nova-notify',
    'nova-code',
    '../../config',
    'tpl/message/tpl-new-message',
    'widget/icon-flash',
    'module/workprocess/processtooltip',
    'utility/stompjs/stompjs'
], function(_, menu, permission, Core, Util, LoginDialog, Notify, NovaCode, appConfig, tplNewMessage, iconFlash, processTooltip) {
    var sysConfig = window.__CONF__.config_system;
    var loginHandled = false,
        loginDialogTime = 0,
        loginDialogShowing = false;

    var MessageHanders = {};

    $(function() {
        permission.authorize(function(filter) {
            window.Core = Core;
            menu.render(filter);
            Core.init();

            var loginName = Util.getCookiekey("username") || '';

            $('.login-user').text(decodeURI(loginName));
            $('.btn-logout').click(function() {
                Util.logout();
            });
            $('.home-link-tag').attr('href', sysConfig.homeUrl);

            $("[data-toggle='tooltip']").tooltip();

            handleAjaxComplete();

            window.registerMessageHandler = registerMessageHandler;
            processTooltip();

            //消息中心相关 start
            var noticePowerName = '100000:function:noticeMgr';
            if (sysConfig.is_oversea) {
                $("#btn-message-dropdown").hide();
                $("#audit").hide();
            } else {
                $.getJSON('/workspacedir/checkPermissions', {
                    permissions: [noticePowerName]
                }).done(function(rsp) {
                    if (rsp.data) {
                        var myPermissions = rsp.data;
                        if (_.contains(myPermissions, noticePowerName)) {
                            $("#li-notice-manage").show();
                        }
                    }
                })
            }

            $('#btn-set-all-readed').on('click', function() {
                setAllReaded();
                renderMessageList();
            })
            $('#check-all-link').on('click', function() {
                ackAll();
            })

            messageList = [];
            newArrivedMsgList = [];
            realMessageMap = {};
            tplNewMessage = _.template(tplNewMessage);

            function messageAlert() {
                iconFlash.flash({
                    container: $("#span-message-number"),
                    interval: 350,
                    period: 5000
                });
            }

            function findNeedMergeMsg(mergeId) {
                var msg = _.findWhere(messageList, {
                    mergeId: mergeId
                });
                return msg;
            }

            function ackAll() {
                if (!$.isEmptyObject(realMessageMap)) {
                    _.each(_.values(realMessageMap), function(msg) {
                        msg.ack();
                    })
                    realMessageMap = {};
                }
            }

            function setAllReaded() {
                ackAll();
                if (messageList.length > 0) {
                    var msgIdList = [];
                    _.each(messageList, function(msg) {
                        msgIdList.push(msg.msgId);
                    })
                    setDBMsgReaded(msgIdList);
                    messageList = [];
                }
            }

            function mergeMessage(msgInfo) {
                var oldMsg = findNeedMergeMsg(msgInfo.mergeId);
                if (oldMsg) {
                    oldMsg.msgSendTime = msgInfo.msgSendTime;
                    oldMsg.mergeValue = oldMsg.mergeValue + msgInfo.mergeValue;
                    oldMsg.subject = msgInfo.subject.replace('%', oldMsg.mergeValue);
                    return true;
                } else {
                    msgInfo.subject = msgInfo.subject.replace('%', msgInfo.mergeValue);
                    messageList.unshift(msgInfo);
                    return false;
                }
            }

            function refreshMsg() {
                var oldNum = messageList.length;
                if (newArrivedMsgList.length == 0) {
                    return;
                }
                _.each(newArrivedMsgList, function(msg) {
                    if (msg.isMerge == 1) {
                        var isMerged = mergeMessage(msg);
                        if (isMerged) {
                            realMessageMap[msg.id].ack();
                        }
                    } else {
                        messageList.unshift(msg);
                    }
                })
                newArrivedMsgList = [];
                renderMessageList();
                if (messageList.length > oldNum) {
                    messageAlert();
                }
            }

            //message receive
            var connect_callback = function() {
                $.getJSON('/user/curuserinfo').then(function(rsp) {
                    if (rsp.data) {
                        var subscription = client.subscribe("/queue/" + rsp.data.userId, callback, {
                            ack: 'client-individual'
                        });
                    }
                });
                // called back after the client is connected and authenticated to the STOMP server
            };
            var error_callback = function(error) {
                // display the error's message header:
                console.log(error.headers.message);
            };
            var callback = function(message) {
                // called when the client receives a message from the server
                if (message.body) {
                    var msg = JSON.parse(message.body);
                    if (MessageHanders.hasOwnProperty(msg.typeId)) {
                        MessageHanders[msg.typeId](message);
                    } else {
                        newArrivedMsgList.unshift(msg);
                        realMessageMap[msg.id] = message;
                    }
                } else {
                    console.log("got empty message");
                }
            };
            var url;
            if (window.location.protocol == 'https:') {
                url = 'wss://' + appConfig["messageServerIp"] + ':61615/stomp';
            } else {
                url = 'ws://' + appConfig["messageServerIp"] + ':61614/stomp';
            }
            var client = Stomp.client(url);
            client.debug = function() {};
            if (!_.isEmpty(Util.getCookiekey('tgt'))) {
                client.connect('login', 'passcode', connect_callback);

                //定时合并消息并提醒
                setInterval(refreshMsg, 2000);
            }
            //消息中心相关 end
        });
    })


    function handleAjaxComplete() {
        $(document).ajaxComplete(function(event, xhr) {
            var rsp = xhr.responseJSON;
            if (!rsp && xhr.responseText) {
                try {
                    rsp = JSON.parse(xhr.responseText);
                } catch (e) {
                    //console.log(xhr.responseText, 'is not json');
                }
            }
            if (Util.getUrlPath() == sysConfig.loginUrl || !rsp) {
                return;
            }

            switch (rsp.code) {
                case NovaCode.TGT_INVALID:
                    // loginverify验证失败
                    notifyLogin();
                    break;
                case NovaCode.SERVICE_ERROR:
                    // Notify.simpleNotify(i18n.t('base:index.notify-errortitle'), i18n.t('base:index.notify-servererrortext'), 'error');
                    break;
            }
        });
    }

    function notifyLogin() {
        // 如果之前已手动关闭或打开登录对话框,或者离上次关闭不到5秒,则不显示

        // if (loginHandled || loginDialogShowing || (Date.now() - loginDialogTime < 5000)) {
        if (loginDialogShowing || (Date.now() - loginDialogTime < 3000)) {
            return;
        }
        Notify.show({
            title: i18n.t('base:index.notify-errortitle'),
            text: i18n.t('base:index.notify-relogintext'),
            type: 'error',
            confirm: {
                confirm: true,
                buttons: [{
                    text: i18n.t('base:index.button-login'),
                    addClass: "btn btn-primary btn-sm",
                    click: function(notice, value) {
                        loginHandled = true;
                        notice.remove();
                        LoginDialog.buildLoginDialog();
                    }
                }, {
                    text: i18n.t('base:index.button-cancel'),
                    addClass: "btn btn-default btn-sm",
                    click: function(notice) {
                        loginHandled = true;
                        notice.remove();
                    }
                }]
            },
            afterOpen: function() {
                loginHandled = false;
            },
            afterClose: function() {
                loginDialogShowing = false;
                loginDialogTime = Date.now();
            }
        });
        loginDialogShowing = true;
    }

    function registerMessageHandler(msgType, hander) {
        MessageHanders[msgType] = hander;
    }

    function renderMessageList() {
        if (messageList.length > 0) {
            $("#span-message-number").html(messageList.length);
        } else {
            iconFlash.stopflash();
            $("#span-message-number").html('');
        }
        $("#ol-message-list").empty();
        _.each(messageList, function(msg) {
            $("#ol-message-list").append($(tplNewMessage(msg)));
        })
        $("#ol-message-list a").on('click', function() {
            var msgId = $(this).attr('id');
            setReaded(msgId);
            renderMessageList();
        });
        $("#ol-message-list button").on('click', function() {
            var msgId = $(this).parent().parent().find('a').attr('id');
            setReaded(msgId);
            renderMessageList();
        })
    }

    function setDBMsgReaded(msgIdList) {
        $.getJSON('/messagecenter/setMsgIsRead', {
            ids: msgIdList,
            isRead: 1
        }, function(rsp) {
            if (rsp.code != 0) {
                console.log("failed to set readed！");
                console.log(msgIdList);
            }
        })
    }

    function setReaded(msgId) {
        realMessageMap[msgId].ack();
        delete realMessageMap[msgId];
        setDBMsgReaded([msgId]);
        deleteMessage(msgId);
    }

    function deleteMessage(msgId) {
        var msg = _.findWhere(messageList, {
            id: msgId
        });
        if (msg) {
            var index = _.indexOf(messageList, msg);
            messageList.splice(index, 1);
        }
    }

    window.externalSetMessageReaded = function(msgIds) {
        var needRender = false;
        _.each(msgIds, function(id) {
            if (realMessageMap[id] != undefined) {
                realMessageMap[id].ack();
                delete realMessageMap[id];
                deleteMessage(id);
                needRender = true;
            }
        })
        if (needRender) {
            renderMessageList();
        }
    }
});