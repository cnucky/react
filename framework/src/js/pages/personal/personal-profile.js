require([
    'tpl/perosnal/tpl-personal-info-item',
    'tpl/perosnal/tpl-renlifang-item',
    'tpl/perosnal/tpl-task-item',
    'nova-dialog',
    'nova-notify',
    'q',
    'jquery',
    'underscore',
    'jquery.validate'
], function(tplInfoItem, tplRenlifangItem, tplTaskItem, Dialog, Notify, Q, $, _) {

    hideLoader();

    var task = {
        normalType: 1,
        relationType: 2,
        renlifangType: 3
    };

    tplInfoItem = _.template(tplInfoItem);
    tplRenlifangItem = _.template(tplRenlifangItem);
    tplTaskItem = _.template(tplTaskItem);

    var detailInfo;
    var _userInfo;
    var _position;

    function loadPageData() {
        var normalDefer = Q.defer();
        $.getJSON("/log/getrecenttasks", {
            tasktype: task.normalType
        }, function(rsp) {
            if (rsp.code == 0) {
                normalDefer.resolve(rsp.data);
            } else {
                normalDefer.reject(rsp.data);
            }
        });

        var relationDefer = Q.defer();
        $.getJSON("/log/getrecenttasks", {
            tasktype: task.relationType
        }, function(rsp) {
            if (rsp.code == 0) {
                relationDefer.resolve(rsp.data);
            } else {
                relationDefer.reject(rsp.data);
            }
        });

        var renlifangDefer = Q.defer();
        $.getJSON("/log/getrecenttasks", {
            tasktype: task.renlifangType
        }, function(rsp) {
            if (rsp.code == 0) {
                renlifangDefer.resolve(rsp.data);
            } else {
                renlifangDefer.reject(rsp.data);
            }
        });

        var positionDefer = Q.defer();
        $.getJSON('/user/position', function(rsp) {
            if (rsp.code == 0) {
                positionDefer.resolve(rsp.data);
            } else {
                positionDefer.reject(rsp.data);
            }
        });

        Q.all([normalDefer.promise, relationDefer.promise, renlifangDefer.promise, positionDefer.promise])
            .spread(function(normalTaskData, relationshipTaskData, renlifangTaskData, positionData) {

                renderRenlifangTask(renlifangTaskData);
                renderRelationshipTask(relationshipTaskData);
                renderNormalTask(normalTaskData);
                _position = positionData;
                getUserProfile();
            })
            .catch(function() {
                hideLoader();
                Notify.show({
                    title: "服务器数据加载失败",
                    type: "error"
                });
            })
    }

    loadPageData();


    /*function renderRenlifangTask(taskdata) {
        var searchitemContainer = $("#search-item");
        if (_.isEmpty(taskdata)) {
            searchitemContainer.append("<tr><td>无数据</td></tr>");
        }

        var iconSet = IconSet.icons().icons;

        _.each(taskdata, function(item) {
            item = _.extend(iconSet[item.taskid], item);
            var searchItem = tplRenlifangItem(item);
            searchitemContainer.append(searchItem);
        });
    }*/


    function renderRelationshipTask(taskdata) {
        var relationshipContainer = $("#relationship-item");
        if (_.isEmpty(taskdata)) {
            relationshipContainer.append("<tr><td>无数据</td></tr>");
        }

        _.each(taskdata, function(item) {
            var relationshipItem = tplTaskItem(item);
            relationshipContainer.append(relationshipItem);
        });
    }


    function renderNormalTask(taskdata) {
        var normalContainer = $("#normal-item");
        if (_.isEmpty(taskdata)) {
            normalContainer.append("<tr><td>无数据</td></tr>");
        }

        _.each(taskdata, function(item) {
            var normalItem = tplTaskItem(item);
            normalContainer.append(normalItem);
        });
    }

    function renderBasicInfo(userinfo) {
        if (!_.isEmpty(userinfo.trueName)) {
            $("#profile-name").text(userinfo.trueName);
        } else {
            $("#profile-name").text(userinfo.loginName);
        }

        if (!_.isEmpty(userinfo.certNumber)) {
            $("#profile-cert").text(userinfo.certNumber);
            $('#profile-avatar').attr('src', '/personcore/getpersonphoto?identityid=' + userinfo.certNumber);
        }

        if (!_.isEmpty(userinfo.departmentPath)) {
            $("#profile-department").siblings().removeClass('hidden');
            $("#profile-department").text(userinfo.departmentPath);
        }

        if (!_.isEmpty(userinfo.address)) {
            $("#profile-address").siblings().removeClass('hidden');
            $("#profile-address").text(userinfo.address);
        }
    }

    function getUserProfile() {
        $.getJSON('/user/getuserprofile', {
            userid: 727    // TODO 不需要传 userid
        }, function(rsp) {
            if (rsp.code != 0) {
                Notify.show({
                    title: "获取个人信息失败",
                    text: rsp.message,
                    type: "error"
                });
            } else {
                var userInfo = rsp.data;
                _userInfo = userInfo;

                renderBasicInfo(userInfo);
                renderDetailInfo(userInfo)

            }
        })
    }

    function renderDetailInfo(userinfo) {
        var personalinfoContainer = $("#personal-info-item");
        personalinfoContainer.empty();
        detailInfo = [];

        var departmentPath = {
            key: "departmentPath",
            name: "部门",
            value: userinfo.departmentPath
        };
        detailInfo.push(departmentPath);

        var userGroupNames = {
            key: "userGroupNames",
            name: "用户组",
            value: userinfo.userGroupNames.toString()
        };
        detailInfo.push(userGroupNames);

        var loginName = {
            key: "loginName",
            name: "登录名",
            value: userinfo.loginName
        };
        detailInfo.push(loginName);

        var position = {
            key: "position",
            name: "职位",
            value: userinfo.position
        }

        _.each(_position, function(item) {
            if (userinfo.position == item.key) {
                position.value = item.caption;
            }
        });
        if (userinfo.position == 0) {
            position.value = "空";
        }
        detailInfo.push(position);

        var gender = {
            key: "gender",
            name: "性别",
            value: userinfo.gender
        };
        if (userinfo.gender == 0) {
            gender.value = "空";
        } else if (userinfo.gender == 1) {
            gender.value = "男";
        } else if (userinfo.gender == 2) {
            gender.value = "女";
        }
        detailInfo.push(gender);

        var trueName = {
            key: "trueName",
            name: "姓名",
            value: userinfo.trueName
        };
        detailInfo.push(trueName);


        var certNumber = {
            key: "certNumber",
            name: "身份证",
            value: userinfo.certNumber
        };
        detailInfo.push(certNumber);

        var birthday = {
            key: "birthday",
            name: "出生日期",
            value: userinfo.birthday
        };
        detailInfo.push(birthday);

        var telephone = {
            key: "telephone",
            name: "手机",
            value: userinfo.telphone
        };
        detailInfo.push(telephone);

        var workPhone = {
            key: "workPhone",
            name: "工作电话",
            value: userinfo.workPhone
        };
        detailInfo.push(workPhone);

        var email = {
            key: "email",
            name: "邮箱",
            value: userinfo.email
        };
        detailInfo.push(email);

        var address = {
            key: "address",
            name: "地址",
            value: userinfo.address
        };
        detailInfo.push(address);

        var personalinfoItem = tplInfoItem({
            detailInfo: detailInfo
        });
        personalinfoContainer.append(personalinfoItem);
    }

    $("#edit-profile").on("click", function() {
        $("#user-edit-footer").show();
        _.each(detailInfo, function(item) {
            if (item.key == "departmentPath" || item.key == "userGroupNames" || item.key == "loginName" || item.key == "position") {
                $("#" + item.key).hide();
            } else {
                if (item.key == "email") {
                    $("#" + item.key + "-for-input").attr('name', "user-email");
                }

                if (item.key == "birthday") {
                    $("#" + item.key + "-for-input").attr('name', "user-birthday");
                }

                if (item.key == "gender") {
                    $("#" + item.key + "-for-display").hide();
                    $("#" + item.key).find("#for-edit-gender").show();
                } else if (item.key == "address" || item.key == "birthday" || item.key == "certNumber" || item.key == "email" || item.key == "trueName" || item.key == "workPhone" || item.key == "telephone") {
                    $("#" + item.key + "-for-display").hide();
                    $("#" + item.key + "-for-input").attr('value', item.value);
                    $("#" + item.key).find("#for-edit-text").show();
                }
                // else if (item.key == "position") {
                //     $("#" + item.key + "-for-display").hide();
                //     $("#" + item.key).find("#for-edit-position").show();

                //     var position_item = $("#user-position");
                //     _.each(_position, function(item) {
                //         position_item.append("<option value=" + "'" + item.key + "'>" + item.caption + "</option>");
                //     });
                // }
            }
        });
    })

    $("#cancel-edit-user").on("click", function() {
        endEdit();
    })

    $("#complete-edit-user").on("click", function() {

        var validator = $("#user-info-form").validate({
            rules: {
                "user-email": {
                    email: true
                },
                "user-birthday": {
                    date: true
                }
            },
            messages: {
                "user-email": {
                    email: "邮箱格式不正确"
                },
                "user-birthday": {
                    date: "请输入正确的日期格式"
                }
            },
            /* @validation highlighting + error placement
            ---------------------------------------------------- */
            errorClass: "state-error",
            errorElement: "em",
            highlight: function(element, errorClass, validClass) {
                $(element).closest('.field').addClass(errorClass).removeClass(validClass);
            },
            unhighlight: function(element, errorClass, validClass) {
                $(element).closest('.field').removeClass(errorClass).addClass(validClass);
            },
            errorPlacement: function(error, element) {
                if (element.is(":radio") || element.is(":checkbox")) {
                    element.closest('.option-group').after(error);
                } else {
                    error.insertAfter(element.parent());
                }
            }
        });

        if (validator.form()) {
            _userInfo.address = $('#address-for-input').val().trim();
            _userInfo.birthday = $("#birthday-for-input").val().trim();
            _userInfo.certNumber = $('#certNumber-for-input').val().trim();
            _userInfo.email = $('#email-for-input').val().trim();
            _userInfo.gender = $('#user-gender').val().trim();
            _userInfo.telphone = $('#telephone-for-input').val().trim();
            _userInfo.trueName = $('#trueName-for-input').val().trim();
            _userInfo.workPhone = $("#workPhone-for-input").val().trim();
            // _userInfo.position = $('#user-position').val();

            $.post('/user/update', _userInfo, function(rsp) {
                if (rsp.code != 0) {
                    Notify.show({
                        title: "更新失败",
                        text: rsp.message,
                        type: "error"
                    });
                } else {
                    endEdit();
                    Notify.show({
                        title: "更新成功",
                        type: "success"
                    });
                }
            }, 'json');
        }


    })

    function endEdit() {
        $("#user-edit-footer").hide();
        renderBasicInfo(_userInfo);
        renderDetailInfo(_userInfo);
    }
})
