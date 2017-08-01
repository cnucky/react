registerLocales(require.context('../../locales/datasearch/', false, /\.js/));
define('../module/datasearch/search-validation',
    [
        'underscore',
        'utility/jquery-validate/jquery.validate.min'
    ],
    function (_) {

        function isValidDateRange(startDate,endDate){
            if (!valiDateTimes(startDate))
            {
                return false;
            }

            if (!valiDateTimes(endDate))
            {
                return false;
            }

            if (compareDates(startDate, endDate) <= 0)
            {
                return true;
            }
            else
            {
                return false;
            }
        }

        function valiDateTimes(str){
            var reg = /^(\d+)-(\d{1,2})-(\d{1,2}) (\d{1,2}):(\d{1,2}):(\d{1,2})$/;
            var r = str.match(reg);
            if(r==null)return false;
            r[2]=r[2]-1;
            var d= new Date(r[1], r[2],r[3], r[4],r[5], r[6]);
            if(d.getFullYear()!=r[1])return false;
            if(d.getMonth()!=r[2])return false;
            if(d.getDate()!=r[3])return false;
            if(d.getHours()!=r[4])return false;
            if(d.getMinutes()!=r[5])return false;
            if(d.getSeconds()!=r[6])return false;
            return true;
        }

        function compareDates(startDate, endDate){
            var reg = /^(\d+)-(\d{1,2})-(\d{1,2}) (\d{1,2}):(\d{1,2}):(\d{1,2})$/;
            var r = startDate.match(reg);
            r[2]=r[2]-1;
            var formatedStartDate = new Date(r[1], r[2],r[3], r[4],r[5], r[6]);

            r = endDate.match(reg);
            r[2]=r[2]-1;
            var formatedEndDate = new Date(r[1], r[2],r[3], r[4],r[5], r[6]);

            if (formatedStartDate > formatedEndDate)
            {
                return 1;
            } else if (formatedStartDate == formatedEndDate){
                return 0;
            } else {
                return -1;
            }
        }

        function isValidIp(startIp, endIp) {
            var startIsV4 = checkIpv4(startIp);
            var startIsV6 = checkIpv6(startIp);
            var endIsV4 = checkIpv4(endIp);
            var endIsV6 = checkIpv6(endIp);

            if (startIp != "" && !(startIsV4 || startIsV6)) {
                return false;
            }

            if (endIp != "" && !(endIsV4 || endIsV6)) {
                return false;
            }

            if ((startIsV4 && endIsV6) || (startIsV6 && endIsV4)) {
                return false;
            }

            return true;
        }

        function checkIpv4(ipvalue) {
            var exp = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
            var reg = ipvalue.match(exp);
            if (reg == null) {
                return false;
            }

            return true;
        }

        function checkIpv6(tmpstr) {
            //CDCD:910A:2222:5498:8475:1111:3900:2020
            var patrn = /^([0-9a-f]{1,4}:){7}[0-9a-f]{1,4}$/i;
            var r = patrn.exec(tmpstr)
            if (r) {
                return true;
            }
            if (tmpstr == "::") {
                return true;
            }
            //F:F:F::1:1 F:F:F:F:F::1 F::F:F:F:F:1格式
            patrn = /^(([0-9a-f]{1,4}:){0,6})((:[0-9a-f]{1,4}){0,6})$/i;
            r = patrn.exec(tmpstr);
            if (r) {
                var c = cLength(tmpstr);
                if (c <= 7 && c > 0) {
                    return true;
                }
            }
            //F:F:10F::
            patrn = /^([0-9a-f]{1,4}:){1,7}:$/i;
            r = patrn.exec(tmpstr);
            if (r) {
                return true;
            }
            //::F:F:10F
            patrn = /^:(:[0-9a-f]{1,4}){1,7}$/i;
            r = patrn.exec(tmpstr);
            if (r) {
                return true;
            }
            //F:0:0:0:0:0:10.0.0.1格式
            patrn = /^([0-9a-f]{1,4}:){6}(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/i;
            r = patrn.exec(tmpstr);
            if (r) {
                if (r[2] <= 255 && r[3] <= 255 && r[4] <= 255 && r[5] <= 255)
                    return true;
            }
            //F::10.0.0.1格式
            patrn = /^([0-9a-f]{1,4}:){1,5}:(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/i;
            r = patrn.exec(tmpstr);
            if (r) {
                if (r[2] <= 255 && r[3] <= 255 && r[4] <= 255 && r[5] <= 255)
                    return true;
            }
            //::10.0.0.1格式
            patrn = /^::(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/i;
            r = patrn.exec(tmpstr);
            if (r) {
                if (r[1] <= 255 && r[2] <= 255 && r[3] <= 255 && r[4] <= 255)
                    return true;
            }
            return false;
        }

        //统计 10F: 或者:10B的个数
        function cLength(str) {
            var reg = /([0-9a-f]{1,4}:)|(:[0-9a-f]{1,4})/gi;
            var temp = str.replace(reg, ' ');
            return temp.length;
        }

        var rules_config = {
            text: {},
            ip: {
                ip: true,
                messages: {
                    ip: i18n.t("datasearch.search-validation.wrong_ip")
                }
            },
            email: {
                email: true,
                messages: {
                    email: i18n.t("datasearch.search-validation.wrong_email")
                }
            },
            number: {
                number: true,
                messages: {
                    number: i18n.t("datasearch.search-validation.wrong_number")
                }
            },
            numbergtezero: {
                number: true,
                min: 0,
                messages: {
                    number: i18n.t("datasearch.search-validation.wrong_number"),
                    min: i18n.t("datasearch.search-validation.wrong_number")
                }
            },
            int: {
                digits: true,
                messages: {
                    digits: i18n.t("datasearch.search-validation.wrong_int")
                }
            },
            intgtezero: {
                digits: true,
                min: 0,
                messages: {
                    digits: i18n.t("datasearch.search-validation.wrong_number"),
                    min: i18n.t("datasearch.search-validation.wrong_number")
                }
            },
            date: {
                date: true,
                messages: {
                    date: i18n.t("datasearch.search-validation.wrong_time")
                }
            },
            UserPosition: {

            }
        };

        var rules_template_config = {
            text: {},
            ip: {
                ip: true,
                messages: {
                    ip: ""
                }
            },
            email: {
                email: true,
                messages: {
                    email: ""
                }
            },
            number: {
                number: true,
                messages: {
                    number: ""
                }
            },
            numbergtezero: {
                number: true,
                min: 0,
                messages: {
                    number: "",
                    min: ""
                }
            },
            int: {
                digits: true,
                messages: {
                    digits: ""
                }
            },
            intgtezero: {
                digits: true,
                min: 0,
                messages: {
                    digits: "",
                    min: ""
                }
            },
            date: {
                date: true,
                messages: {
                    date: ""
                }
            },
            UserPosition: {

            }
        };

        function init(control, submit_func) {
            /* 用户名规则 */
            $.validator.addMethod("ip", function (value, element) {
                var isvalidip = (checkIpv4(value) || checkIpv6(value));
                return this.optional(element) || isvalidip;
            }, i18n.t("datasearch.search-validation.wrong_ip"));

            $(control).validate({
                rules: {},
                messages: {},
                errorClass: "has-error",
                validClass: "has-success",
                errorElement: "em",
                highlight: function (element, errorClass) {
                    $(element).closest('.input-div').addClass(errorClass);
                },
                unhighlight: function (element, errorClass) {
                    $(element).closest('.input-div').removeClass(errorClass);
                },
                submitHandler: function () {
                    submit_func();
                    return false;
                }
            });
        }

        function init_valide(control) {

            /* 用户名规则 */
            $.validator.addMethod("ip", function (value, element) {
                var isvalidip = (checkIpv4(value) || checkIpv6(value));
                return this.optional(element) || isvalidip;
            }, i18n.t("datasearch.search-validation.wrong_ip"));

            $(control).validate({
                rules: rules_config,
                messages: {},
                errorClass: "has-error",
                validClass: "has-success",
                errorElement: "em",
                highlight: function (element, errorClass) {
                    $(element).closest('.input-div').addClass(errorClass);
                },
                unhighlight: function (element, errorClass) {
                    $(element).closest('.input-div').removeClass(errorClass);
                }
            });


        }

        function add_rules(input_elements) {
            $.each(input_elements, function () {
                var input_control = $("#" + this.id);
                if (input_control.length > 0) {
                    input_control.rules('remove');
                    if(this.rule in rules_config){
                        input_control.rules('add', rules_config[this.rule]);
                    }
                }
            });
        }

        function add_template_rules(input_elements) {
            $.each(input_elements, function () {
                var input_control = $("#" + this.id);
                if (input_control.length > 0) {
                    input_control.rules('remove');
                    input_control.rules('add', rules_template_config[this.rule]);
                }
            });
        }

        function valid(control){
            return $(control).valid();
        }

        return {
            checkIpv4: checkIpv4,
            checkIpv6: checkIpv6,
            isValidIp: isValidIp,
            isValidDateRange:isValidDateRange,
            init: init,
            init_valide: init_valide,
            add_rules: add_rules,
            add_template_rules: add_template_rules,
            valid: valid

        }
    }
);