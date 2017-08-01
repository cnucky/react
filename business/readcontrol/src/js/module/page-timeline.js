/**
 * Created by user25 on 2099/1/1.
 */
define(
    [
        '../tpl/time-line',
        '../tpl/time-day',
        'utility/datepicker/bootstrap-datetimepicker',

    ], function (timeline, timeday) {
        //添加时序
        var timelines = _.template(timeline);
        console.log($('#timelines', parent.document))
        $('#timelines', parent.document).append(timelines());

        //添加时间规律
        var timeday = _.template(timeday);
        $('#timedays', parent.document).append(timeday());

        $('.law button', parent.document).each(function (index) {
            $(this, parent.document).on('click', function () {
                $('.law button', parent.document).removeClass('fc-state-active').eq(index).addClass('fc-state-active');
                $('.fc-view-container', parent.document).hide().eq(index).show();
            })
        });
        $('.change-day', parent.document).click(function(){
            $('#timedays', parent.document).css('display', 'none');
            $('#timelines', parent.document).css('display', 'block')
        })

        $('.change-line', parent.document).click(function(){
            $('#timedays', parent.document).css('display', 'block');
            $('#timelines', parent.document).css('display', 'none')
        })

        function show_timeline(number){
            $(".navBtn-timeLaw.hbtn", parent.document).css("display", "inline-block" );
            $('.navbar-btnlist span', parent.document).removeClass('active').eq(3).addClass('active');
            $('#body-wrapper .pages', parent.document).hide().eq(3).show();
            $('.triangle', parent.document).hide().eq(3).show();
        }

        return {
            show_timeline: show_timeline
        }


    });
