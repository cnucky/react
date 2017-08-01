registerLocales(require.context('../../locales/dataentity/', false, /\.js/));
registerLocales(require.context('../../locales/dataprocess/', false, /\.js/));
define(
    [
        "jquery",
        'underscore',
        'nova-notify',
        'nova-empty-dialog',
        '../tpl/tpl-data-entity-item',
        './data-detail',
        './page-timeline',
        '../../../../mobilearchive/src/js/tpl/tpl-action-detail',
        '../../../../mobilearchive/src/js/module/bulit-dialog'
    ], function ($,_,Notify,Dialog,TplMobileEntityItem,MobileDetail,PageTimeline,deTail,bulit_dialog) {

        function init(container,phone_array) {
            template = _.template(TplMobileEntityItem);
            var ss=template({Data:phone_array});
            $(container).append(ss);
            $("#mobile-panel [data-i18n]").localize();
            init_card_event();
        }

        function init_card_event()
        {
            var expand=false;
            var current_phone_number='';

            function traggle_mobile_detail(phone_number)
            {
                Dialog.build({
                    title: i18n.t('mobileentity.notify.info_detail'),
                    content: deTail,
                    width: 1000,
                    //Height: 600,
                    hideLeftBtn: true,
                    hideRightBtn: true,
                    hideFooter: true
                }).show(
                    function () {
                        $("#div-Dis").siblings().addClass("item-default").removeClass("item-active");
                        $("#div-Dis").addClass("item-active").removeClass("item-default");
                        $(".SearchResult").addClass("hidden");
                        var eleId = $("#div-Dis").attr("href");
                       // var eleId="#characterContent";
                        bulit_dialog.init(eleId);
                    },"mfp-rotateDown"
                );

                return;
            }

             $(".phone-detail").on('click',function(e,item){
                var mobile_info=$(this).parents('.mobile-info');
                var child=$('.phone-number');

                var firstChild=mobile_info.find(child).first();
                var phone_number=firstChild.text().trim();
                 traggle_mobile_detail(phone_number);

            });

              $(".time-sequence").on('click',function(e,item){
                  var mobile_info=$(this).parents('.mobile-info');
                  var child=$('.phone-number');

                  var firstChild=mobile_info.find(child).first();
                  var phone_number=firstChild.text().trim();

                  PageTimeline.show_timeline(phone_number);

            });

               $(".mobile-book").on('click',function(e,item){
                   var mobile_info=$(this).parents('.mobile-info');
                   var child=$('.phone-number');

                   var firstChild=mobile_info.find(child).first();
                   var phone_number=firstChild.text().trim();
            });


             $(".mobile-info").dblclick(function() {
                 var child=$('.phone-number');

                 var firstChild=$(this).find(child).first();
                 var phone_number=firstChild.text().trim();
                 traggle_mobile_detail(phone_number);
            });


        }

        return {
            init:init,
            append:init
        };
    });
