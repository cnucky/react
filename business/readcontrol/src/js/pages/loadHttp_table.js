
initLocales(require.context('../../locales/dataprocess/', false, /\.js/));
require([], function (){

    //查看、收起情/更多
    $(document).on('click', '.cont h5 a.fa', function (e) {
        e.preventDefault();
        $(this).parent().next().fadeToggle("fast");
        if($(this).hasClass("fa-minus-square")){
            $(this).attr("class","fa fa-plus-square");
        }else{
            $(this).attr("class","fa fa-minus-square");
        }
    });
})