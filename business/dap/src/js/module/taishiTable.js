/**
 * Created by songqiankun on 2017/2/13.
 */
define(["../lib/vue/vue"], function (Vue) {
    /**
     * Created by songqiankun on 2017/2/13.
     */
    Vue.component('taishi-table', {
        // 选项
        template: '<div class="echarts">\
    <div class="sqk-thead-div">\
    <table>\
    <thead>\
    <tr>\
    <th v-for="column in dataConfig.columnTitle">{{column}}</th>\
    </tr>\
    </thead>\
    </table>\
    </div>\
    <div class="sqk-tbody-div">\
    <table>\
    <tbody>\
    <tr v-for="content in dataConfig.contents">\
    <td v-for="contentItem in content" :class="(typeof contentItem) + \'-sqk\'">{{contentItem}}</tb>\
    </tr>\
    </tbody>\
    </table>\
    </div>\
    </div>\
    ',
        props: {
            dataConfig: {
                type: Object,
                default: function () {
                    var value = {};
                    value.columnTitle = ['区域名', '总人数', '重点人数', '积分'];
                    value.contents = [
                        ['奥体', 3573, 2, 355],
                        ['鼓楼', 3343, 3, 555],
                        ['栖霞', 1233, 5, 255],
                        ['仙林', 5473, 14, 1225],
                        ['万达', 2843, 2, 124],
                        ['新街口', 4883, 10, 375]
                    ];
                    return value;
                }
            },
            styleConfig: {
                type: Object
            }
        },
        data: function () {
            return {
                chart: new Object()
            };
        }
    });
});