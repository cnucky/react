require(["../../../config"], function (config) {
    var invokeService = function (url, params, completed) {
        $.get(config["serviceRoot"] + url, params, function (res) {
            console.log(res);

            completed(res);
        });
    };

    var splits = location.hash.split('+');
    invokeService("/services/getregionsituationreport", {
        "subTypeName": "day_report_html",
        "taskType": "city",
        "params":
        {
            "task_id": splits[0].slice(1, splits[0].length),
            "time": splits[1],
        }
    }, function (result) {
        $('body').empty();
        $('body').html(result);
    });
});