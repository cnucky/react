initLocales(require.context('../../locales/datasearch/', false, /\.js/));
require(
    [
        'nova-alert',
        'nova-notify',
        '../module/search-range',
        '../module/search-validation',
        '../module/search-system/dianwei-search'
    ],
    function (Alert,
              Notify,
              search_range,
              search_validation,
              Dianwei_search
    ) {

        $(".tab_header").click(function(){
            $('#tab-pane').empty();

            var func_type = $(this).attr("func_type");

            if(func_type == "dianwei"){
                Dianwei_search.init("#tab-pane");
            }

        });

        function init(){

            Dianwei_search.init("#tab-pane");

        }

        init();

    });