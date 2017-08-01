require('i18n');
registerLocales(require.context('../../../locales/workprocess', false, /\.js/));
define([
    ],function(){
        var $content;
        var multi;
        /*opt: {
            $container:$,//加载容器
            data:[{    //需要展示的用户数据
                id:'',
                name:''
            }],
            multi:boolean,//单选false,多选true
        }*/
        function init(opt){
            var html = '<div class="options-content"></div>';
            var css = '<style>.unselect {margin-right: 5px!important;font-weight: normal!important;color: #666666!important;max-width: 100px!important;overflow: hidden;text-overflow: ellipsis;}'+
                        '.selected {margin-right: 5px!important;font-weight: 600!important;color: #3078D7!important;max-width: 100px!important;overflow: hidden;text-overflow: ellipsis;}</style>'
            opt.$container.parents().find('head').append(css);
            opt.$container.empty();
            opt.$container.append(html);
            $content = opt.$container.children();
            multi = opt.multi;
            if(multi)
                $content.append('<a class="btn btn-alt btn-gradient unselect all-check options">'+i18n.t('workprocess.processoperate.allcheck')+'</a>');
            _.each(opt.data, function(data) {
                $content.append('<a class="btn btn-alt btn-gradient unselect option-check options" data-id="'+data.id+'">'+data.name+'</a>');
            });
            $content.children('.options').on('click', function() {
                $(this).toggleClass('btn-primary');
                var isselected = $(this).hasClass('btn-primary');
                if(multi){
                    if($(this).hasClass('all-check'))
                        isselected?($content.children().removeClass('unselect').addClass('selected')):($content.children().removeClass('selected btn-primary').addClass('unselect'));
                    else{
                        isselected?($(this).removeClass('unselect').addClass('selected')):($(this).removeClass('selected btn-primary').addClass('unselect'));
                        isAllCheck();
                    }
                }else{
                    isselected?($(this).removeClass('unselect').addClass('selected')):($(this).removeClass('selected btn-primary').addClass('unselect'));
                    $(this).siblings().removeClass('selected btn-primary').addClass('unselect');
                }
            })
        }
        function isAllCheck(){
            if ($content.children('.option-check.btn-primary').length == $content.children('.option-check').length)
                $content.children('.all-check').removeClass('unselect').addClass('selected btn-primary');
            else 
                $content.children('.all-check').removeClass('selected btn-primary').addClass('unselect');
        }
        function setSelectedItem(selectData){
            $content.children().removeClass('selected btn-primary').addClass('unselect');
            _.each(selectData, function(item){
                _.each($content.children(), function(check){
                    if(item.id == $(check).attr('data-id'))
                        $(check).removeClass('unselect').addClass('selected btn-primary');
                })
            });
            if(multi)
               isAllCheck(); 
        }
        function getSelectedItem(){
            var selected = [];
            _.each($content.children('.option-check.btn-primary'), function(checked) {
                selected.push({
                    id: $(checked).attr("data-id"),
                    name: $(checked).text()
                })
            });
            return selected;
        }
        return {
            init: init,
            setSelectedItem: setSelectedItem,
            getSelectedItem: getSelectedItem
        }
    })