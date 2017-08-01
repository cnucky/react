/**
 * Created by maxiaodan on 2016/12/6.
 */
define(["../lib/vue/vue"], function (Vue) {
    Vue.component('dlg', {
        template: '<div v-show="dlgshow" class="dlg-backgroud"><div class="dlg-margin animated zoomIn"><div class="dlgContent" v-html="content"></div><div class="dlg-close" v-on:click="closedlg"></div></div></div>',
        props: ['dlgshow', 'content'],
        methods: {
            closedlg: function () {
                this.$emit('close');
            }
        }
    });
});