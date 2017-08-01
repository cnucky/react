define("./rdp-relation-predict", [
    "../renlifang/rlf-icon-set",
    "../renlifang/rlf-auto-link",
    "../../tpl/rlf/rlf-profile-company-item",
    "../../tpl/rlf/rlf-profile-company-detail",
    "../../tpl/rlf/rlf-profile-imei-table",
    "../../tpl/rlf/rlf-profile-radius-table",
    "../../tpl/rlf/rlf-profile-address-item",
    "../../tpl/rdp/rdp-relations-predict",
    'moment',
    "jquery",
    "underscore",
    "bootstrap-multiselect",
    "utility/daterange/daterangepicker",
    'utility/jquery/jqmaskedinput',
    'utility/bootstrap/bootstrap-maxlength',
    'moment-locale'
], function(IconSet, AutoLink, tplCompany, tplDetail, tplIMEITable, tplRadiusTable, tplAddressTable, tplPredict, moment) {
    tplCompany = _.template(tplCompany);
    tplDetail = _.template(tplDetail);
    tplIMEITable = _.template(tplIMEITable);
    tplRadiusTable = _.template(tplRadiusTable);
    tplAddressTable = _.template(tplAddressTable);
    tplPredict = _.template(tplPredict);


    function init(opts) {
        var _opts;
        var position, idInfo;
        var companyType = 0,
            companyStartDate, companyEndDate, companyFrequency;
        var companyData;
        var ticketsStartDate, ticketsEndDate, ticketsFrequency;
        var ticketsData;
        var loadingCompany, loadingTickets;
        var imeiData, radiusData;
        var loadingIMEI, loadingRadius;
        _opts = opts;
        idInfo = opts.idInfo;
        position = opts.position;
        var result = $(tplPredict({
            pid: "relation-parter" + opts.idInfo,
            tid: "relation-tickets" + opts.idInfo,
            iid: "relation-imei" + opts.idInfo,
            cid: "relation-charge" + opts.idInfo,
            aid: "relation-address" + opts.idInfo
        }));
        $(opts.container).append(result);
        moment().locale('zh-cn');
        //=========同行/同订票==========
        _initCompany();
        _initTickets();


        $(position + " " + ".custom").mask("9999/99/99-9999/99/99"); //
        $(position + " " + 'input[maxlength]').maxlength({ //??????
            threshold: 21,
            placement: "right"
        });

        function _initCompany() {
            //选择类型
            $(position + " " + "#relation-company-type").multiselect({ //
                buttonClass: 'multiselect dropdown-toggle btn btn-default fw600 fs14',
                buttonWidth: '100%',
                onChange: function(option, checked, select) {
                    companyType = parseInt($(option).val());
                }
            });
            //选择时间范围
            companyStartDate = moment().subtract(1, 'year');
            companyEndDate = moment();
            companyFrequency = 2;
            var dateFormat = 'YYYY/MM/DD';
            var rangeOptions = {
                showDropdowns: true,
                ranges: {
                    '昨天': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                    '过去一周': [moment().subtract(6, 'days'), moment()],
                    '过去一个月': [moment().subtract(29, 'days'), moment()],
                    '当月': [moment().startOf('month'), moment().endOf('month')],
                    '上个月': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
                    '过去一年': [moment().subtract(1, 'year'), moment()]
                },
                locale: {
                    applyLabel: '确定',
                    cancelLabel: '取消',
                    fromLabel: '从',
                    toLabel: '到',
                    customRangeLabel: '自定义'
                },
                format: dateFormat,
                startDate: companyStartDate,
                endDate: companyEndDate
            };
            $(position + " " + '#relation-frequency-input').val(companyFrequency); //
            $(position + " " + '#relation-date-range-input').val(companyStartDate.format(dateFormat) + '-' + companyEndDate.format(dateFormat)); //
            companyStartDate = companyStartDate.format("YYYY-MM-DD");
            companyEndDate = companyEndDate.format("YYYY-MM-DD");
            $(position + " " + '#relation-date-range').daterangepicker( //
                rangeOptions,
                function(start, end, input) {
                    companyStartDate = start.format("YYYY-MM-DD");
                    companyEndDate = end.format("YYYY-MM-DD");
                    $(position + " " + '#relation-date-range-input').val(start.format(dateFormat) + ' - ' + end.format(dateFormat)); //
                }
            );
            $(position + " " + '#relation-btn-go').click(function() { //
                companyFrequency = $(position + " " + '#relation-frequency-input').val(); //
                $(position + " " + '#relation-company-list').removeAttr('data-company'); //
                companyData = null;
                _loadCompanyList();
            });
        }

        function _initTickets() {
            //选择时间范围
            ticketsStartDate = moment().subtract(1, 'year');
            ticketsEndDate = moment();
            ticketsFrequency = 2;
            var dateFormat = 'YYYY/MM/DD';
            var rangeOptions = {
                showDropdowns: true,
                ranges: {
                    '昨天': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                    '过去一周': [moment().subtract(6, 'days'), moment()],
                    '过去一个月': [moment().subtract(29, 'days'), moment()],
                    '当月': [moment().startOf('month'), moment().endOf('month')],
                    '上个月': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
                    '过去一年': [moment().subtract(1, 'year'), moment()]
                },
                locale: {
                    applyLabel: '确定',
                    cancelLabel: '取消',
                    fromLabel: '从',
                    toLabel: '到',
                    customRangeLabel: '自定义'
                },
                format: dateFormat,
                startDate: ticketsStartDate,
                endDate: ticketsEndDate
            };
            $(position + " " + '#relation-tickets-frequency-input').val(ticketsFrequency); //
            $(position + " " + '#relation-tickets-date-range-input').val(ticketsStartDate.format(dateFormat) + '-' + ticketsEndDate.format(dateFormat)); //
            ticketsStartDate = ticketsStartDate.format("YYYY-MM-DD");
            ticketsEndDate = ticketsEndDate.format("YYYY-MM-DD");
            $(position + " " + '#relation-tickets-date-range').daterangepicker( //
                rangeOptions,
                function(start, end, input) {
                    ticketsStartDate = start.format("YYYY-MM-DD");
                    ticketsEndDate = end.format("YYYY-MM-DD");
                    $(position + " " + '#relation-tickets-date-range-input').val(start.format(dateFormat) + ' - ' + end.format(dateFormat)); //
                }
            );
            $(position + " " + '#relation-tickets-btn-go').click(function() { //
                ticketsFrequency = $(position + " " + '#relation-tickets-frequency-input').val(); //
                $(position + " " + '#relation-tickets-list').removeAttr('data-tickets'); //
                ticketsData = null;
                _loadTicketsList();
            });
        }


        function render() {
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
            _.find($(position + " " + "#relations-predict" + idInfo + " ul li a"), function(item) { //
                if (!$(item).hasClass('hidden')) {
                    $(item).click();
                    return true;
                }
            });
        }

        function _renderIMEI() {
            var imeiTabPane = $(position + " " + "#relation-imei"); //
            var imeiItem;

            if (!loadingIMEI) {
                _opts.getIMEI(function(data) {
                    imeiData = data;

                    if (imeiData) {
                        _.each(data, function(item) {
                            _.each(item.mobile, function(item1) {
                                item1.targetLink = '/renlifang/profile.html?entityid=' + BASE64.encoder(item1.phone) + "&entitytype=" + BASE64.encoder('' + item1.valueType);
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
                        imeiTabPane.append("<table><thead><tr><th>无同机身号数据</th></tr></thead></table>");
                    }
                });
                loadingIMEI = true;
            }
        }

        function _renderCharge() {
            var iconSet = IconSet.icons().icons;
            var radiusTabPane = $(position + " " + "#relation-charge"); //
            var radiusItem;

            if (!loadingRadius) {
                _opts.getRadius(function(data) {
                    radiusData = data;

                    if (radiusData) {
                        _.each(data, function(item) {
                            _.each(item.accounts, function(item1) {
                                item1.name = iconSet[item1.valueType].name;
                                item1.targetLink = '/renlifang/profile.html?entityid=' + BASE64.encoder(item1.account) + "&entitytype=" + BASE64.encoder('' +item1.valueType);
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
                        radiusTabPane.append("<table><thead><tr><th>无同计费号数据</th></tr></thead></table>");
                    }
                });
                loadingRadius = true;
            }
        }

        function _renderCompany() {
            if (!_.isEmpty(companyData)) {
                $(position + " " + "#relation-parter" + idInfo + " " + '#relation-company-result').show(); //
                $(position + " " + "#relation-parter" + idInfo + " " + '#relation-company-empty').hide(); //
                var logo = $(position + " " + '#relation-company-logo'); //
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
                var list = $(position + " " + '#relation-company-list'); //
                if (_.isUndefined(list.attr('data-company'))) {
                    list.empty();
                    list.attr('data-company', 1);
                    _.each(companyData, function(item,index) {
                        _renderCompanyItem(list, item,index);
                    });
                }
            } else if (!loadingCompany) {
                _loadCompanyList();
            }
        }

        function _renderTickets() {
            if (ticketsData) {
                $(position + " " + '#relation-tickets-result').show(); //
                $(position + " " + '#relation-tickets-empty').hide(); //
                var list = $(position + " " + '#relation-tickets-list'); //
                if (_.isUndefined(list.attr('data-tickets'))) {
                    list.empty();
                    list.attr('data-tickets', 1);
                    _.each(ticketsData, function(item, index) {
                        _renderTicketsItem(list, item, index);
                    });
                }
            } else if (!loadingTickets) {
                _loadTicketsList();
            }
        }

        function _renderCompanyItem(list, item,index) {
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
            AutoLink.initLink(a, currentHrefName, '/renlifang/profile.html?entityid=' + BASE64.encoder(item.cert) + "&entitytype=" + BASE64.encoder('' + item.valueType));

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
            item.desc = "从" + companyStartDate + "到" + companyEndDate + "共同订票" + item.frequency + "次";
            var tplItem = $(tplCompany(item));
            var itemBg = item.frequency < 5 ? 'bg-success' : item.frequency < 10 ? 'bg-warning' : 'bg-danger';
            tplItem.find('.timeline-icon').addClass(itemBg);
            list.append(tplItem);

            var a = tplItem.find('.rlf-auto-link');
            var currentHrefName = IconSet.getcurrentHrefName();
            AutoLink.initLink(a, currentHrefName, '/renlifang/profile.html?entityid=' + BASE64.encoder(item.cert) + "&entitytype=" + BASE64.encoder('' + item.valueType))

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
                var time = $(position + " " + '#relation-date-range-input').val().split('-');
                companyStartDate = time[0].replace(/\//g, '-');
                companyEndDate = time[1].replace(/\//g, '-');
                _opts.loadList(companyType, companyStartDate, companyEndDate, companyFrequency, function(data) {
                    loadingCompany = false;
                    if (!_.isEmpty(data)) {
                        companyData = data;
                        _renderCompany();
                    } else {
                        $(position + " " + "#relation-parter" + idInfo + " " + '#relation-company-result').hide(); //
                        $(position + " " + "#relation-parter" + idInfo + " " + '#relation-company-empty').fadeIn(); //
                    }
                });
            }
        }

        function _loadTicketsList() {
            if (_opts.loadList && $.isFunction(_opts.loadList)) {
                loadingTickets = true;
                var time = $(position + " " + '#relation-tickets-date-range-input').val().split('-');
                ticketsStartDate = time[0].replace(/\//g, '-');
                ticketsEndDate = time[1].replace(/\//g, '-');
                _opts.loadList(3, ticketsStartDate, ticketsEndDate, ticketsFrequency, function(data) {
                    loadingTickets = false;
                    if (!_.isEmpty(data)) {
                        ticketsData = data;
                        _renderTickets();
                    } else {
                        $(position + " " + '#relation-tickets-result').hide(); //
                        $(position + " " + '#relation-tickets-empty').fadeIn(); //
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
                        $(position + " " + "#address-table").empty(); //
                        $(position + " " + "#address-table").append("<thead><tr><th>无地址数据</th></tr></thead>"); //
                    } else {

                        var tbody = $(position + " " + "#address-tbody"); //
                        var column;
                        tbody.empty();

                        _.each(findList, function(item) {

                            column = $(tplAddressTable(item));
                            tbody.append(column);

                            var a = column.find('.rlf-auto-link');
                            if (item.valueType) {
                                var currentHrefName = IconSet.getcurrentHrefName();
                                AutoLink.initLink(a, currentHrefName, '/renlifang/profile.html?entityid=' + BASE64.encoder(item.sfz) + "&entitytype=" + BASE64.encoder(item.valueType.toString()));
                            }
                        });
                    }


                });
            }
        }

        function disableCompanyandTickets() {
            $(position + " " + '.relation-company').addClass('hidden'); //
            $(position + " " + '.relation-tickets').addClass('hidden'); //
        }

        function disableIMEI() {
            $(position + " " + '.relation-imei').addClass('hidden'); //
        }

        function disableRadius() {
            $(position + " " + '.relation-charge').addClass('hidden'); //
        }

        function disableAddress() {
            $(position + " " + '.relation-Address').addClass('hidden'); //
        }

        return {
            render: render,
            disableCompanyandTickets: disableCompanyandTickets,
            disableIMEI: disableIMEI,
            disableRadius: disableRadius,
            disableAddress: disableAddress
        };
    }


    return {
        init: init
    };
});
