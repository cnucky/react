define(['../../tpl/dataProcess/table','underscore'],function(tablePage,_){

    var tablePage = _.template(tablePage);

    function  load(opt){

        var info = {}
        $(opt.container).empty().append(tablePage(info));

    }
    function render(){

    }

    function test(){

    }

    return {
        load:load,
        render:render,
        test:test
    }

})