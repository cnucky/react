define("./rlf-relation-predict", [
    "./rlf-icon-set",
    "./rlf-auto-link.js",
    "./rlf-assist-menu",
    "../../tpl/rlf/rlf-profile-company-item",
    "../../tpl/rlf/rlf-profile-company-detail",
    "../../tpl/rlf/rlf-profile-imei-table",
    "../../tpl/rlf/rlf-profile-radius-table",
    "../../tpl/rlf/rlf-profile-address-item",
    "../../../html/profile-relations-predict",
    'moment',
    "nova-notify",
    "jquery",
    "underscore",
    "bootstrap-multiselect",
    // "utility/daterange/daterangepicker",
    "datetimepicker",
    'utility/jquery/jqmaskedinput',
    'utility/bootstrap/bootstrap-maxlength',
    'moment-locale'
], function(IconSet, AutoLink, AssistMenu, tplCompany, tplDetail, tplIMEITable, tplRadiusTable, tplAddressTable, tplPredict, moment, Notify) {
    tplCompany = _.template(tplCompany);
    tplDetail = _.template(tplDetail);
    tplIMEITable = _.template(tplIMEITable);
    tplRadiusTable = _.template(tplRadiusTable);
    tplAddressTable = _.template(tplAddressTable);

    var _opts;
    var companyType = 0,
        companyStartDate, companyEndDate, companyFrequency;
    var companyData;
    var ticketsStartDate, ticketsEndDate, ticketsFrequency;
    var ticketsData;
    var loadingCompany, loadingTickets;
    var imeiData, radiusData;
    var loadingIMEI, loadingRadius;
    var companyCert = "";
    var ticketCert = "";
    var companyPassport = [];
    var ticketPassport = [];
    var companyCertFlag = true;
    var companyPassportFlag = true;
    var ticketCertFlag = true;
    var ticketPassportFlag = true;

    var yjsPermission = false;
    var relationPredictKeyValue = "";
    var dateFormat = 'YYYY-MM-DD';

    function init(opts) {
        _opts = opts;
        $(opts.container).append(tplPredict);
        moment.locale('zh-cn');
        //=========同行/同订票==========
        _initCompany();
        _initTickets();


        $(".custom").mask("9999/99/99-9999/99/99");
        $('input[maxlength]').maxlength({
            threshold: 21,
            placement: "right"
        });
    }

    function _initCompany() {
        //选择类型
        $("#relation-company-type").multiselect({
            buttonClass: 'multiselect dropdown-toggle btn btn-default fw600 fs14',
            buttonWidth: '100%',
            onChange: function(option, checked, select) {
                companyType = parseInt($(option).val());
            }
        });

        //选择时间范围
        companyStartDate = moment().subtract(1, 'year').format("YYYY-MM-DD");
        companyEndDate = moment().format("YYYY-MM-DD");
        companyFrequency = 2;
        $('#company_dtpick_from').datetimepicker({
            format: dateFormat,
            defaultDate: companyStartDate,
            locale:'zh-cn',
            widgetPositioning: {
                horizontal: 'auto',
                vertical: 'bottom'
            },
            minDate:'1970-01-01'
        });
        $('#company_dtpick_from').mask("9999-99-99");

        $('#company_dtpick_to').datetimepicker({
            format: dateFormat,
            defaultDate: companyEndDate,
            locale:'zh-cn',
            widgetPositioning: {
                horizontal: 'auto',
                vertical: 'bottom'
            },
            minDate:'1970-01-01'
        });
        $('#company_dtpick_to').mask("9999-99-99");
        $('#relation-frequency-input').val(companyFrequency);
        $('#relation-btn-go').click(function() {
            companyFrequency = $('#relation-frequency-input').val();
            $('#relation-company-list').removeAttr('data-company');
            companyData = null;
            _loadCompanyList();
        });
    }

    function _initTickets() {
        //选择时间范围
        ticketsStartDate = moment().subtract(1, 'year').format("YYYY-MM-DD");
        ticketsEndDate = moment().format("YYYY-MM-DD");
        ticketsFrequency = 2;

        $('#tickets_dtpick_from').datetimepicker({
            format: dateFormat,
            defaultDate: ticketsStartDate,
            locale:'zh-cn',
            widgetPositioning: {
                horizontal: 'auto',
                vertical: 'bottom'
            },
            minDate:'1970-01-01'
        });
        $('#tickets_dtpick_from').mask("9999-99-99");

        $('#tickets_dtpick_to').datetimepicker({
            format: dateFormat,
            defaultDate: ticketsEndDate,
            locale:'zh-cn',
            widgetPositioning: {
                horizontal: 'auto',
                vertical: 'bottom'
            },
            minDate:'1970-01-01'
        });
        $('#tickets_dtpick_to').mask("9999-99-99");
        $('#relation-tickets-frequency-input').val(ticketsFrequency);
        $('#relation-tickets-btn-go').click(function() {
            ticketsFrequency = $('#relation-tickets-frequency-input').val();
            $('#relation-tickets-list').removeAttr('data-tickets');
            ticketsData = null;
            _loadTicketsList();
        });
    }


    function render(isPermission) {
        yjsPermission = isPermission;
        // render Company
        _renderCompany();

        // render Tickets
        _renderTickets();

        // render imei
        _renderIMEI();

        // render charge
        _renderCharge();

        //render address
        _renderAddress();

        // 点击没有隐藏的那个 tab
        _.find($("#relations-predict ul li a"), function(item) {
            if (!$(item).hasClass('hidden')) {
                $(item).click();
                return true;
            }
        });

        if (yjsPermission) {
            $("#relations-predict").on('contextmenu', function(e) {
                e.preventDefault();
                return false;
            })
        }
    }

    //add by zhangu
    function renderCertMulti(container, cert, certFlag) {
        var certList = [{
            label: "为空",
            value: "",
            title: "为空"
        }]

        if (cert.length >= 1 && certFlag) {
            $(container).show();
            $(container + "-multiselect").multiselect({
                buttonClass: 'multiselect dropdown-toggle btn btn-primary fw600 fs14',
                buttonWidth: '100%',
                onChange: function(option, checked, select) {
                    companyCert = $(option).val();
                }
            });

            _.each(cert, function(item, index) {
                certList.push({
                    label: item,
                    value: item,
                    title: item,
                })
            })
            $(container + "-multiselect").multiselect('dataprovider', certList);
            if (cert.length == 1) {
                $(container + "-multiselect").multiselect('select', certList[1].value);
                $(container + "-multiselect").multiselect('deselect', '');

                companyCert = certList[1].value;
            }
        }
    }

    function renderPassportMulti(container, passport, passportFlag) {
        var passportList = [];

        if (passport.length >= 1 && passportFlag) {
            $(container).show();
            $(container + "-multiselect").multiselect({
                buttonClass: 'multiselect dropdown-toggle btn btn-primary fw600 fs14',
                buttonWidth: '100%',
                nonSelectedText: '请选择',
                nSelectedText: 'selected',
                allSelectedText: '全选',
                numberDisplayed: 1,
                onChange: function(option, checked, select) {
                    if (checked) {
                        companyPassport.push($(option).val());
                    } else {
                        _.map(companyPassport, function(passportItem, indexNum) {
                            if (passportItem == $(option).val()) {
                                companyPassport.splice(indexNum, 1);
                            }
                        })
                    }
                }
            });

            _.each(passport, function(item, index) {
                passportList.push({
                    label: item,
                    value: item,
                    title: item,
                })
            })
            $(container + "-multiselect").multiselect('dataprovider', passportList);
            if (passport.length == 1) {
                $(container + "-multiselect").multiselect('select', passportList[0].value);
                companyPassport.push(passportList[0].value);
            }
        }
    }

    function renderCertMulti_ticket(container, cert, certFlag) {
        var certList = [{
            label: "为空",
            value: "",
            title: "为空"
        }]

        if (cert.length >= 1 && certFlag) {
            $(container).show();
            $(container + "-multiselect").multiselect({
                buttonClass: 'multiselect dropdown-toggle btn btn-primary fw600 fs14',
                buttonWidth: '100%',
                onChange: function(option, checked, select) {
                    ticketCert = $(option).val();
                }
            });


            _.each(cert, function(item, index) {
                certList.push({
                    label: item,
                    value: item,
                    title: item,
                })
            })
            $(container + "-multiselect").multiselect('dataprovider', certList);
            if (cert.length == 1) {
                $(container + "-multiselect").multiselect('select', certList[1].value);
                $(container + "-multiselect").multiselect('deselect', '');

                ticketCert = certList[1].value;
            }
        }
    }

    function renderPassportMulti_ticket(container, passport, passportFlag) {
        var passportList = [];

        if (passport.length >= 1 && passportFlag) {
            $(container).show();
            $(container + "-multiselect").multiselect({
                buttonClass: 'multiselect dropdown-toggle btn btn-primary fw600 fs14',
                buttonWidth: '100%',
                nonSelectedText: '请选择',
                nSelectedText: 'selected',
                allSelectedText: '全选',
                numberDisplayed: 1,
                onChange: function(option, checked, select) {
                    if (checked) {
                        ticketPassport.push($(option).val());
                    } else {
                        _.map(ticketPassport, function(passportItem, indexNum) {
                            if (passportItem == $(option).val()) {
                                ticketPassport.splice(indexNum, 1);
                            }
                        })
                    }
                }
            });

            _.each(passport, function(item, index) {
                passportList.push({
                    label: item,
                    value: item,
                    title: item,
                })
            })
            $(container + "-multiselect").multiselect('dataprovider', passportList);
            if (passport.length == 1) {
                $(container + "-multiselect").multiselect('select', passportList[0].value);
                ticketPassport.push(passportList[0].value);
            }
        }
    }
    //the end

    function _renderIMEI() {
        var imeiTabPane = $("#relation-imei");
        var imeiItem;

        if (!loadingIMEI) {
            _opts.getIMEI(function(data) {
                imeiData = data;

                if (imeiData) {
                    _.each(data, function(item) {
                        _.each(item.mobile, function(item1) {
                            item1.targetLink = UrlUtil.getProfileUrl(item1.phone, item1.valueType);
                        });
                        imeiItem = tplIMEITable(item);
                        imeiTabPane.append(imeiItem);

                        var a = imeiTabPane.find('.rlf-auto-link');
                        var currentHrefName = IconSet.getcurrentHrefName();
                        $(a).each(function() {
                            var targetLink = $(this).attr('target-link');
                            AutoLink.initLink(this, currentHrefName, targetLink);
                        })
                    });
                } else {
                    imeiTabPane.append("<table><thead><tr><th>暂无同机身号数据</th></tr></thead></table>");
                }
            });
            loadingIMEI = true;
        }
    }

    function _renderCharge() {
        var iconSet = IconSet.icons().icons;
        var radiusTabPane = $("#relation-charge");
        var radiusItem;

        if (!loadingRadius) {
            _opts.getRadius(function(data) {
                radiusData = data;

                if (radiusData) {
                    _.each(data, function(item) {
                        _.each(item.accounts, function(item1) {
                            item1.name = iconSet[item1.valueType].name;
                            item1.targetLink = UrlUtil.getProfileUrl(item1.account, item1.valueType);
                        });
                        radiusItem = tplRadiusTable(item);
                        radiusTabPane.append(radiusItem);

                        var a = radiusTabPane.find('.rlf-auto-link');
                        var currentHrefName = IconSet.getcurrentHrefName();
                        $(a).each(function() {
                            var targetLink = $(this).attr('target-link');
                            AutoLink.initLink(this, currentHrefName, targetLink);
                        });
                    });
                } else {
                    radiusTabPane.append("<table><thead><tr><th>暂无同计费号数据</th></tr></thead></table>");
                }
            });
            loadingRadius = true;
        }
    }

    function _renderCompany() {

        //add by zhangu
        var count = 0;
        var cert = _opts.getSfzValues();
        var passport = _opts.getPassportValues();
        if (cert) {
            renderCertMulti("#relation-parter-cert", cert, companyCertFlag);
            count++;
        }

        if (passport) {
            renderPassportMulti("#relation-parter-passport", passport, companyPassportFlag);
            count++;
        }
        if (companyCertFlag) {
            if (count == 1) {
                $("#relation-parter-rangetime").addClass("col-sm-4");
                $("#relation-parter-rangetime").removeClass("col-sm-3");
            }
            companyCertFlag = false;
            companyPassportFlag = false;
        }
        //the end

        if (companyData) {
            $('#relation-company-result').show();
            $('#relation-company-empty').hide();
            var logo = $('#relation-company-logo');
            logo.removeClass();
            if (companyType == 2) {
                logo.text("");
                logo.addClass('fa fa-lg fa-plane');
            } else if (companyType == 1) {
                logo.text("");
                logo.addClass('fa fa-lg fa-train');
            } else {
                logo.removeClass('fa fa-lg fa-train fa-plane');
                logo.text('全部');
            }
            var list = $('#relation-company-list');
            if (_.isUndefined(list.attr('data-company'))) {
                list.empty();
                list.attr('data-company', 1);
                _.each(companyData, function(item, index) {
                    _renderCompanyItem(list, item, index);
                });
                if (companyData.length > 0) {
                    list.append("<div><label>当前最多展示50条记录</lable></div>");
                }
                AssistMenu.initContextmenu("#relation-parter", "a.rlf-auto-link", yjsPermission, false);
            }
        } else if (!loadingCompany) {
            _loadCompanyList();
        }
    }

    function _renderTickets() {
        //add by zhangu
        var count = 0;
        var cert = _opts.getSfzValues();
        var passport = _opts.getPassportValues();
        if (cert) {
            renderCertMulti_ticket("#relation-tickets-cert", cert, ticketCertFlag);
            count++;
        }

        if (passport) {
            renderPassportMulti_ticket("#relation-tickets-passport", passport, ticketPassportFlag);
            count++;
        }
        if (ticketCertFlag) {
            if (count == 1) {
                $("#relation-tickets-datarange").addClass("col-sm-4");
                $("#relation-tickets-datarange").removeClass("col-sm-3");
            }
            ticketCertFlag = false;
            ticketPassportFlag = false;
        }
        //the end

        if (ticketsData) {
            $('#relation-tickets-result').show();
            $('#relation-tickets-empty').hide();
            var list = $('#relation-tickets-list');
            if (_.isUndefined(list.attr('data-tickets'))) {
                list.empty();
                list.attr('data-tickets', 1);
                _.each(ticketsData, function(item, index) {
                    _renderTicketsItem(list, item, index);
                });
                AssistMenu.initContextmenu("#relation-tickets", "a.rlf-auto-link", yjsPermission, false);
            }
        } else if (!loadingTickets) {
            _loadTicketsList();
        }
    }

    function _renderCompanyItem(list, item, index) {
        item = _.extend({
            frequency: 2,
            valueType: undefined,
            name: '',
            cert: '',
            iconId: 'iconId-' + index,
            panelId: 'panelId-' + index
        }, item);
        item.desc = "从" + companyStartDate + "到" + companyEndDate + "共同行" + item.frequency + "次";
        var tplItem = $(tplCompany(item));
        var itemBg = item.frequency < 5 ? 'bg-success' : item.frequency < 10 ? 'bg-warning' : 'bg-danger';
        tplItem.find('.timeline-icon').addClass(itemBg);
        list.append(tplItem);

        var a = tplItem.find('.rlf-auto-link');
        var currentHrefName = IconSet.getcurrentHrefName();
        AutoLink.initLink(a, currentHrefName, UrlUtil.getProfileUrl(item.cert, item.valueType));

        var panel = tplItem.find('.panel');
        tplItem.find('.panel-control-collapse,.company-collapse').click(function() {
            panel.toggleClass('panel-collapsed');
            panel.children('.panel-body, .panel-menu, .panel-footer').slideToggle('fast');
            var detailContainer = panel.find('#relation-company-detail');
            if (_.isUndefined(detailContainer.attr('data-company-id'))) {
                detailContainer.attr('data-company-id', item.id);
                // panel.addClass('panel-loader-active');
                panel.find('#relation-detail-loader').show();
                if (_opts.loadDetail && $.isFunction(_opts.loadDetail)) {
                    _opts.loadDetail(item.id, function(detail) {
                        panel.find('#relation-detail-loader').hide();
                        // panel.removeClass('panel-loader-active');
                        _renderDetail(detailContainer, detail);
                    });
                }
            }
        });
    }

    function _renderTicketsItem(list, item, index) {
        item = _.extend({
            frequency: 2,
            valueType: undefined,
            name: '',
            cert: '',
            iconId: 'iconId-' + index,
            panelId: 'panelId-' + index
        }, item);
        item.desc = "从" + ticketsStartDate + "到" + ticketsEndDate + "共同订票" + item.frequency + "次";
        var tplItem = $(tplCompany(item));
        var itemBg = item.frequency < 5 ? 'bg-success' : item.frequency < 10 ? 'bg-warning' : 'bg-danger';
        tplItem.find('.timeline-icon').addClass(itemBg);
        list.append(tplItem);

        var a = tplItem.find('.rlf-auto-link');
        var currentHrefName = IconSet.getcurrentHrefName();
        AutoLink.initLink(a, currentHrefName, UrlUtil.getProfileUrl(item.cert, item.valueType))

        var panel = tplItem.find('.panel');
        tplItem.find('.panel-control-collapse,.company-collapse').click(function() {
            panel.toggleClass('panel-collapsed');
            panel.children('.panel-body, .panel-menu, .panel-footer').slideToggle('fast');
            var detailContainer = panel.find('#relation-company-detail');
            if (_.isUndefined(detailContainer.attr('data-tickets-id'))) {
                detailContainer.attr('data-tickets-id', item.id);
                // panel.addClass('panel-loader-active');
                panel.find('#relation-detail-loader').show();
                if (_opts.loadDetail && $.isFunction(_opts.loadDetail)) {
                    _opts.loadDetail(item.id, function(detail) {
                        panel.find('#relation-detail-loader').hide();
                        // panel.removeClass('panel-loader-active');
                        _renderDetail(detailContainer, detail);
                    });
                }
            }
        });
    }

    function _renderDetail(container, detail) {
        $(container).empty().append(tplDetail(detail));
    }

    function _loadCompanyList() {
        if (_opts.loadList && $.isFunction(_opts.loadList)) {
            loadingCompany = true;
            companyStartDate = $("#company_dtpick_from").val();
            companyEndDate = $("#company_dtpick_to").val();
            if(companyStartDate == "" || companyEndDate == ""){
                Notify.show({
                    title: "起始和结束时间不能为空",
                    type: "danger"
                });
                return
            }
            var startTime = new Date(companyStartDate);
            var endTime = new Date(companyEndDate);
            console.log(startTime,endTime)
            if(startTime >= endTime){
                Notify.show({
                    title: "起始时间不能大于等于结束时间",
                    type: "danger"
                });
                return
            }
            _opts.loadList(companyPassport, companyCert, companyType, companyStartDate, companyEndDate, companyFrequency, function(data) {
                loadingCompany = false;
                if (_.isArray(data)) {
                    companyData = data;
                    _renderCompany();
                } else {
                    $('#relation-company-result').hide();
                    $('#relation-company-empty').fadeIn();
                }
            });
        }
    }

    function _loadTicketsList() {
        if (_opts.loadList && $.isFunction(_opts.loadList)) {
            loadingTickets = true;
            ticketsStartDate = $("#tickets_dtpick_from").val();
            ticketsEndDate = $("#tickets_dtpick_to").val();
            if(ticketsStartDate == "" || ticketsEndDate == ""){
                Notify.show({
                    title: "起始和结束时间不能为空",
                    type: "danger"
                });
                return
            }
            var startTime = new Date(ticketsStartDate);
            var endTime = new Date(ticketsEndDate);
            if(startTime >= endTime){
                Notify.show({
                    title: "起始时间不能大于等于结束时间",
                    type: "danger"
                });
                return
            }
            _opts.loadList(ticketPassport, ticketCert, 3, ticketsStartDate, ticketsEndDate, ticketsFrequency, function(data) {
                loadingTickets = false;
                if (_.isArray(data)) {
                    ticketsData = data;
                    _renderTickets();
                } else {
                    $('#relation-tickets-result').hide();
                    $('#relation-tickets-empty').fadeIn();
                }
            });
        }
    }

    function _renderAddress() {
        if (!_opts.getAddress && $.isFunction(_opts.getAddress)) {
            disableAddress();
        } else {
            _opts.getAddress(function(data) {
                var findList = data.sfzList[0].findList;
                if (_.isEmpty(findList)) {
                    $("#address-table").empty();
                    $("#address-table").append("<thead><tr><th>暂无地址数据</th></tr></thead>");
                } else {
                    var tbody = $("#address-tbody");
                    var column;
                    tbody.empty();
                    _.each(findList, function(item) {

                        column = $(tplAddressTable(item));
                        tbody.append(column);

                        var a = column.find('.rlf-auto-link');
                        if (item.valueType) {
                            var currentHrefName = IconSet.getcurrentHrefName();
                            AutoLink.initLink(a, currentHrefName, UrlUtil.getProfileUrl(item.sfz, item.valueType));
                        }
                    });

                    AssistMenu.initContextmenu("#relation-address", "a.rlf-auto-link", yjsPermission, false);

                }
            });
        }
    }

    function disableCompanyandTickets() {
        $('.relation-company').addClass('hidden');
        $('.relation-tickets').addClass('hidden');
    }

    function disableIMEI() {
        $('.relation-imei').addClass('hidden');
    }

    function disableRadius() {
        $('.relation-charge').addClass('hidden');
    }

    function disableAddress() {
        $('.relation-address').addClass('hidden');
    }


    return {
        init: init,
        render: render,
        disableCompanyandTickets: disableCompanyandTickets,
        disableIMEI: disableIMEI,
        disableRadius: disableRadius,
        disableAddress: disableAddress
    };
});