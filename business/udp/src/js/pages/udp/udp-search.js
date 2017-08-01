initLocales();
require(['jquery', 'jquery-ui', 'underscore', 'nova-alert','nova-notify', '../../module/udp/udp-datetimepicker', 'jquery.magnific-popup', 'utility/select2/select2.min', 'utility/jquery/jquery.mousewheel'],
    function($, U, _, Alert,Notify, datetime) {
        hideLoader();

        countPerPage = getCookie('udpCountPerpage');
        summaryLen = getCookie('udpSummaryLen');
        if (countPerPage != null && summaryLen != null) {
            $('#spinner1').val(countPerPage);
            $('#spinner2').val(summaryLen);
        }
        var allTextLib;
        var ythALL;

        var userId = getCookie('userid');
        var userPreferenceLibs = [];
        var newPreferenceLibs = [];
        loadLibPreference(userId);
        var libCount = 0;

        var activeIndex = 0;
        //加载资料库
        $.post("/udp/udp/getAllTextLib", function(rsp) {
            result = JSON.parse(rsp);
            if (result.code == 0) {
                $("#data-range-display").empty();
                $("#data-range-display-tab").empty();
                var panelHeight = 45 * result.data.length;
                $(".panel-body").attr("height", panelHeight + "px");
                allTextLib = result.data;

                libCount = 0;
                for (var i = 0; i < allTextLib.length; i++) {
                    libCount += allTextLib[i].children.length;
                }
                _.each(allTextLib, function(dataRangeInfo, index) {
                    //特殊处理，当没有作战指挥数据权限的时候，返回的作战指挥数据Dir中包含一个不显示的“全部”，这时候前端不显示该tab
                    if((dataRangeInfo.children.length==1) &&(dataRangeInfo.textLibDirID == -10000) && (dataRangeInfo.children[0].textLibID==-1022) && (dataRangeInfo.children[0].category==4)){
                        activeIndex ++;
                        return;
                    }

                    var dataRangeHtml = '';
                    var dataRangeTabHtml = '';



                    var activeClassString = (index == activeIndex) ? 'class="active"' : '';
                    var activeString = (index == activeIndex) ? 'active' : '';
                    dataRangeHtml = '<li ' + activeClassString + '>';
                    dataRangeTabHtml = '<div id="' + dataRangeInfo.textLibDirID + '" class="tab-pane ' + activeString + '"><br>' + '<div class="col-sm-4 result-list-tab" id="tab' + dataRangeInfo.textLibDirID + '"></div>' + '<div class="col-sm-4 result-list-tab tabb" id="tabb' + dataRangeInfo.textLibDirID + '"></div>' + '<div class="col-sm-4 result-list-tab tabc" id="tabc' + dataRangeInfo.textLibDirID + '"></div>' + '</div>';

                    dataRangeHtml = dataRangeHtml + '<a href="#" data-tab-id="' + dataRangeInfo.textLibDirID + '" >' + '<div class="udp-checkbox-custom checkbox-primary mb5 h-35 of-y-h" ' +
                        '"><input name="tabSelectedAll" ' + ' type="checkbox" id="checkbox-' + dataRangeInfo.textLibDirID + '" value="checkbox-' + dataRangeInfo.textLibDirID +
                        '"><label for="checkbox-' + dataRangeInfo.textLibDirID + '">' + '</label><p style="margin-left:26px;margin-top:-7px;">' + dataRangeInfo.textLibDirName + '</p></div></a></li>';
                    $("#data-range-display").append(dataRangeHtml);
                    $("#data-range-display-tab").append(dataRangeTabHtml);

                    if (dataRangeInfo.children.length > 0) {
                        var indexAdjust = 0;
                        _.each(dataRangeInfo.children, function(childInfo, childIndex) {
                            textLibToolTip = "名称: " + childInfo.textLibDisplayName;
                            textLibToolTip += "\n创建时间: " + childInfo.createTime;
                            textLibToolTip += "\n修改时间: " + childInfo.modifyTime;
                            textLibToolTip += "\n描述: " + childInfo.textLibDesc;

                            //默认只有一级分类时，显示的购选项是一级分类，直接传入检索条件。
                            //一体化数据具有一级分类"全部"和许多二级分类，这时钩选项为二级分类，不显示一级分类(全部)
                            // 如果有更多数据来源，三处代码添加特殊处理:此处隐藏一级分类，以及后面不添加二级分类到检索条件，以及另外添加一级分类到检索条件
                            if (childInfo.textLibID == -1022 && childInfo.category == 4) {
                                ythALL = _.extend(childInfo, {
                                    textLibDirID: dataRangeInfo.textLibDirID,
                                    textLibDirName: dataRangeInfo.textLibDirName
                                });
                                indexAdjust++;
                                return;

                            } else {
                                var checked = judgeChecked(childInfo.category, childInfo.textLibID) ? 'checked' : '';
                                html = '<div class="udp-checkbox-custom checkbox-primary mb5 h-35 of-y-h" title="' + textLibToolTip +
                                    '"><input name="textlib" ' + checked + ' type="checkbox" category ="' + childInfo.category + '"  id="' + childInfo.textLibID + '" value="' + childInfo.textLibID +
                                    '"><label for="' + childInfo.textLibID + '">' + childInfo.textLibDisplayName + '</label></div>'
                            }
                            switch ((childIndex - indexAdjust) % 3) {
                                case 0:
                                    $("#tab" + dataRangeInfo.textLibDirID).append(html);
                                    break;
                                case 1:
                                    $("#tabb" + dataRangeInfo.textLibDirID).append(html);
                                    break;
                                case 2:
                                    $("#tabc" + dataRangeInfo.textLibDirID).append(html);
                                    break;
                                default:
                                    break;
                            }
                        })
                    }
                })




                $('#data-range-display-tab .tab-pane').each(function() {
                    var context = this;
                    setTabCheckbox(context);
                })
                setAllSelectCheckbox();
                

                function setTabCheckbox(context) {
                    var tabQuanxuan = $('#checkbox-' + $(context).closest('.tab-pane').attr('id'))[0]
                    var checkboxParDiv = $(context).closest('.tab-pane').find("input[name=textlib]");
                    var tabRes = _.find(checkboxParDiv, function(checkBoxItem) {
                        return checkBoxItem.checked == true;
                    })
                    tabRes == undefined ? tabQuanxuan.checked = false : tabQuanxuan.checked = true;
                }

                function setAllSelectCheckbox() {
                    var allInputCheck = $("input[name=textlib]");
                    var res = _.find(allInputCheck, function(checkItem) {
                        return checkItem.checked == false;
                    })
                    res == null ? $("#quanxuan")[0].checked = true : $("#quanxuan")[0].checked = false;
                }


                $("input[name = tabSelectedAll]").on('click', function(e) {

                    e.stopPropagation();
                    // e.preventDefault();

                    var flag = this.checked;
                    var tabId = $(this).closest('a').attr('data-tab-id');
                    var checkboxItems = $('#' + tabId).find(':checkbox');
                    _.each(checkboxItems, function(item) {
                        item.checked = flag ? true : false;
                    })
                    if (!flag) {
                        $("#quanxuan")[0].checked = false;
                    } else {
                        setAllSelectCheckbox();
                    }
                })

                $('#data-range-display a').click(function(e) {

                    if (e.target.nodeName != 'LABEL') {
                        $('#data-range-display li').removeClass('active');
                        $(this).closest('li').addClass('active');
                        var tabId = $(this).attr('data-tab-id');
                        $('#data-range-display-tab .tab-pane').removeClass('active');
                        $('#' + tabId).addClass('active')
                    }


                })

                $("input[name=textlib]").on('click', function(e) {
                    
                    if (!this.checked) {

                        $("#quanxuan")[0].checked = false;
                        setTabCheckbox(this)



                    } else {
                        setTabCheckbox(this)
                        setAllSelectCheckbox();

                    }
                })
            }
        });

        // 加载高级检索项
        // $.getJSON('/udp/getSearchItem', function(rsp) {
        //     if (rsp.code == 0) {
        //         html = '<li><div class="row-fluid ml5 mt5"><div style="display: inline"><select style="width: 30%" class="select2-info form-control">';
        //         liHtml = "";
        //         _.each(rsp.data, function(item) {
        //             liHtml += ('<option value="' + item.semanticName + '">' + item.semanticDisplayName + '</option>');
        //         });
        //         html += liHtml;
        //         html += '</select></div><label style="width:40px;display:inline-block;height:30px;text-align: center">包含</label>';

        //         for (i = 0; i < 5; i++) {
        //             input = '<input type="text" id="input' + i + '" class="form-control" style="width:60%;height: 40px;display: inline"/></div></li>';
        //             $("#seniorsearch ul").append(html + input);
        //         }
        //     } else {
        //         console.log("get udp senior search item failed, err msg:" + rsp.message);
        //     }

        // });

        // 获取高级检索条件
        function getSerniorCond() {
            queryCond = [];
            $("#seniorsearch ul li").each(function() {
                $li = $(this);
                fieldName = $li.find('select option:selected').val();
                fieldDisplayName = $li.find('select option:selected').text();
                queryString = $li.find('input').val();
                if (!_.isEmpty(queryString)) {
                    str = {
                        fieldName: fieldName,
                        fieldDisplayName: fieldDisplayName,
                        queryString: queryString
                    };
                    queryCond.push(str);
                }
            });
            return queryCond;
        }

        function getCookie(name) {
            var val, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
            if (val = document.cookie.match(reg)) {
                return val[2];
            } else {
                return null;
            }
        }

        //库选择的全选/反选功能
        $(document).ready(function() {
            $("#quanxuan").click(function() {
                var el = $('input[name=textlib]');
                var len = el.length;

                var tabBoxs = $('input[name=tabSelectedAll]');
                if (this.checked == true) {
                    for (var i = 0; i < len; i++)
                        el[i].checked = true;
                    _.each(tabBoxs, function(elItem) {
                        elItem.checked = true;
                    })
                } else {
                    for (var i = 0; i < len; i++)
                        el[i].checked = false;
                    _.each(tabBoxs, function(elItem) {
                        elItem.checked = false;
                    })
                }
            });
        });


        // 获取查询关键字 通过 URL 传到结果页面
        $(document).on('click', "#search-button", function(event) {
            // 获取查询关键字
            var searchKeyword = $("#keyword").val();
            var precisemode = $('#precisemode').is(':checked');

            seniorQueryCond = getSerniorCond();

            var textlib = [];
            var secondaryCategoriesInfo = {
                ythItems: [],
            }
            newPreferenceLibs = [];
            _.each($("input[name=textlib]:checked"), function(item) {
                var category = $(item).attr("category");
                var libID = parseInt($(item).val());
                var libName = $(item).parent().text();
                var $closestTab = $(item).closest('.result-list-tab');
                var libDirID = $closestTab.attr('id');
                var sliceNum;
                if ($closestTab.hasClass('tabb') || $closestTab.hasClass('tabc')) {
                    sliceNum = 4;
                } else {
                    sliceNum = 3;
                }
                libDirID = parseInt(libDirID.slice(sliceNum, libDirID.length));
                var libDirName = _.find(allTextLib, function(v) {
                    return v.textLibDirID == libDirID
                }).textLibDirName;
                // var libString = libID + ':' + libName + ':' + category; 

                var foundLibDir;


                newPreferenceLibs.push({
                    category: parseInt(category),
                    libId: libID
                });

                //若检索条件textlib为空或当前钩选对应的libDirID的对象还未创建，新建一个
                if (textlib.length == 0 || !_.find(textlib, function(v) {
                        return v.libDirID == libDirID;
                    })) {
                    var newLibDir = {
                        libDirID: libDirID,
                        libDirName: libDirName,
                        textlibs: []
                    }
                    textlib.push(newLibDir);
                }

                //找到对应的目录对象
                var foundLibDir = _.find(textlib, function(v) {
                    return v.libDirID == libDirID;
                });
                //不添加二级分类到检索条件,勾选信息用于后面页面拼检索条件、对照表名
                switch (category) {
                    case '4':
                        secondaryCategoriesInfo.ythItems.push({
                            libID: libID,
                            libName: libName
                        });
                        break;
                    default:
                        foundLibDir.textlibs.push({
                            category: parseInt(category),
                            libID: parseInt(libID),
                            libName: libName
                        });
                        break;
                }
            });

            saveLibRreference(userId);
            //add item YTHall
            //添加一级分类到检索条件
            if (ythALL != undefined) {
                // console.log(ythALL)
                var foundLibDir = _.find(textlib, function(v) {
                    return (v.libDirID == ythALL.textLibDirID) && (v.libDirName == ythALL.textLibDirName);
                });

                // if (foundLibDir && foundLibDir.textlibs.length > 0) {
                if (foundLibDir) {
                    foundLibDir.textlibs.unshift({
                        category: ythALL.category,
                        libID: ythALL.textLibID,
                        libName: ythALL.textLibDisplayName
                    });
                }

            }


            if (_.isEmpty(searchKeyword) && seniorQueryCond.length == 0) {
                event.preventDefault();
                Alert.show({
                    container: $("#alert-container"),
                    alertid: "alert-keyword-empty",
                    alertclass: "alert-warning",
                    content: "<i class='fa fa-keyboard-o pr10'></i><strong> 请输入查询关键字！ </strong>"
                });
            } else if (textlib.length == 0) {
                event.preventDefault();
                Alert.show({
                    container: $("#alert-container"),
                    alertid: "alert-keyword-empty",
                    alertclass: "alert-warning",
                    content: "<i class='fa fa-keyboard-o pr10'></i><strong> 请选择资料库！ </strong>"
                });
            } else {
                event.preventDefault();

                cond = {
                    keyword: searchKeyword,
                    seniorQueryCond: seniorQueryCond,
                    bussiDateRange: $('#bussiness-date-range-input').val(),
                    fileloadDateRange: $('#fileload-date-range-input').val(),
                    textlibs: textlib,
                    countPerPage: $('#spinner1').val(),
                    summaryLen: $('#spinner2').val(),
                    secondaryCategoriesInfo: secondaryCategoriesInfo,
                    precisemode: precisemode
                };
                // console.log(cond)
                sessionStorage.setItem("cond", JSON.stringify(cond));
                var timeNow = new Date().getTime().toString();
                // window.location.href = 'index.html?keyword=' + searchKeyword;

                window.open('index.html?keyword=' + searchKeyword, '_' + searchKeyword + timeNow);
            }
            // window.open('/spycasemanage/spycasemanage.html?nodekey=8620&tableid=10091&recid=82613', '_82613');
        });

        $("#textlibchoice").on('click', function(event) {
            if ($("#textlibpane").hasClass("collapse")) {
                $("#textlibpane").removeClass("collapse");
                $("#seniorsearch").addClass("collapse");
            } else {
                $("#textlibpane").addClass("collapse");
                $("#seniorsearch").addClass("collapse");
            }
        });

        $("#senior").on('click', function(event) {
            $(".select2-primary").select2();
            $(".select2-info").select2();
            if ($("#seniorsearch").hasClass("collapse")) {
                $("#seniorsearch").removeClass("collapse");
                $("#textlibpane").addClass("collapse");
            } else {
                $("#seniorsearch").addClass("collapse");
                $("#textlibpane").addClass("collapse");
            }
        });

        datetime.setDatetime();

        $("#time a").on('click', function(event) {
            if ($(this).text() == '近一天') {
                datetime.pick('近一天');
            } else if ($(this).text() == '近三天') {
                datetime.pick('近三天');
            } else if ($(this).text() == '近一周') {
                datetime.pick('近一周');
            } else if ($(this).text() == '近一月') {
                datetime.pick('近一月');
            } else if ($(this).text() == '近半年') {
                datetime.pick('近半年');
            } else if ($(this).text() == '近一年') {
                datetime.pick('近一年');
            } else {
                var Animation = $(this).attr('data-effect');
                // Inline Admin-Form example
                $.magnificPopup.open({
                    removalDelay: 500, //delay removal by X to allow out-animation,
                    items: {
                        src: '#modal-panel'
                    },
                    // overflowY: 'hidden', //
                    callbacks: {
                        beforeOpen: function(e) {
                            this.st.mainClass = Animation;
                        }
                    },
                    midClick: true // allow opening popup on middle mouse click. Always set it to true if you don't provide alternative source.
                });
            }
        });

        $('#timeButton').on('click', function(event) {
            $.magnificPopup.close();
        });

        $('#settingButton').on('click', function(event) {
            var v = parseInt($('#spinner1').val());
            if(isNaN(v)||v<0||v>500){
                Notify.show({
                    title: '请输入1到500之间的数字!',
                    type: 'danger'
                });
                $('#spinner1').val(10)
            }
            // document.cookie = "udpSummaryLen=" + $('#spinner2').val();
            $("#setting").toggleClass('open');
        });

        $("#spinner1").spinner({
            min: 5,
            max: 20,
            step: 1,
            start: 10
        });
        $("#spinner2").spinner({
            min: 100,
            max: 500,
            step: 10,
            start: 100
        });


        function loadLibPreference(userId) {
            if (isNaN(userId)) {
                return;
            }
            var item = window.localStorage.getItem('udpLibPreference');
            if (item) {
                var udpLibPreference = JSON.parse(item);
                if (udpLibPreference[userId.toString()]) {
                    userPreferenceLibs = udpLibPreference[userId.toString()]
                }
            }
        }

        function saveLibRreference(userId) {

            var item = window.localStorage.getItem('udpLibPreference');
            var udpLibPreference;
            if (item) {
                udpLibPreference = JSON.parse(item);


                if (libCount == newPreferenceLibs.length + 1) {
                    udpLibPreference[userId.toString()] = undefined;
                } else {
                    udpLibPreference[userId.toString()] = newPreferenceLibs;
                }





            } else {
                udpLibPreference = {};
                if (libCount == newPreferenceLibs.length + 1) {
                    udpLibPreference[userId.toString()] = undefined;
                } else {
                    udpLibPreference[userId.toString()] = newPreferenceLibs;
                }

            }
            window.localStorage.setItem('udpLibPreference', JSON.stringify(udpLibPreference));

            newPreferenceLibs = [];
        }

        function judgeChecked(category, libId) {
            if (userPreferenceLibs.length == 0) {
                return true;
            } else {

                if (_.find(userPreferenceLibs, function(uP) {
                        return (uP.category == parseInt(category)) && (uP.libId == parseInt(libId));
                    })) {
                    return true;
                } else {
                    return false;
                }





            }

        }
    }
);