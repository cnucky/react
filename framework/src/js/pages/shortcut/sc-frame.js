require(['nova-dialog'], function(Dialog) {
    hideLoader();

  
    $('.nav-pills > li').on('click', function(e) {
        $(e.currentTarget).siblings().removeClass('buble-container')
        $(this).addClass('buble-container');
    })

    $(".btn-daotu").on('click', function(e){
        e.preventDefault();

        Dialog.build({
            title: "导图",
            width: '1000',
            content: '<img style="width: 100%;" src="../img/tmp/mind_diagram.png">',
            rightBtnCallback: function(e) {
                e.preventDefault();


                $.magnificPopup.close();
            }
        }).show();
    });

});