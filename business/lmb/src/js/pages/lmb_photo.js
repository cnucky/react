require([
    '../../../config',
    '../module/dlg',
    '../module/photo_gallery',
    '../module/photo_tag',
    '../lib/three/Detector'
  ],
  function (lmb_config, dialog, gallery, tag, Detector) {
    var dlg = dialog.getDlg();

    if (!Detector.webgl) {
      Detector.addGetWebGLMessage();
    }

    var serviceRoot = lmb_config.ServiceRoot;
    var testData = [{
        "CanChoose": true,
        "typeId": 10004,
        "typeName": "出境时间",
        "valueType": "date",
        "valueList": [
          "[2015-01-01 01:01:01,2015-06-01 01:01:01]",
          "[2015-01-01 01:01:01,2015-06-01 01:01:01]",
          "[2015-01-01 01:01:01,2015-06-01 01:01:01]",
          "[2015-01-01 01:01:01,2015-06-01 01:01:01]",
          "[2015-06-01 01:01:02,2015-12-01 01:01:01]",
          "[2015-12-01 01:01:02,2016-05-01 01:01:01]"
        ]
      },
      {
        "CanChoose": true,
        "typeId": 10000,
        "typeName": "年龄",
        "valueType": "int",
        "valueList": [
          "[null,20]",
          "[20,25]",
          "[25,30]",
          "[30,35]",
          "[35,40]",
          "[40,null]"
        ]
      },
      {
        "CanChoose": true,
        "typeId": 10002,
        "typeName": "出境国家",
        "valueType": "string",
        "valueList": [
          "英国",
          "美国",
          "俄罗斯"
        ]
      },
      {
        "CanChoose": true,
        "typeId": 9999,
        "typeName": "性别",
        "valueType": "string",
        "valueList": [
          "男",
          "女"
        ]
      }
    ];

    var timelineData = [{
        type: "Globe",
        content: "出境前往土耳其",
        time: "2016-11-23 12:23"
      },
      {
        type: "Dialogue",
        content: "访问圣战网站www.yulghun.com",
        time: "2016-11-16 04:23"
      },
      {
        type: "Mail",
        content: "使用多种即时聊天工具",
        time: "2016-11-15 21:58"
      },
      {
        type: "Dialogue",
        content: "访问涉暴恐网站www.sjrt.org",
        time: "2016-11-14 18:47"
      },
      {
        type: "Dialogue",
        content: "使用vpn",
        time: "2016-11-09 19:33"
      },
      {
        type: "Globe",
        content: "前往云南丽江",
        time: "2016-11-03 18:00"
      },
      {
        type: "Phone",
        content: "与土耳其电话通联",
        time: "2016-11-01 18:30"
      },
      {
        type: "Dialogue",
        content: "使用网盘dbankcloud.com",
        time: "2016-10-26 22:03"
      },
      {
        type: "Globe",
        content: "前往云南瑞丽",
        time: "2016-10-26 18:00"
      },
      {
        type: "Phone",
        content: "与土耳其电话通联",
        time: "2016-10-26 08:00"
      },
      {
        type: "Mail",
        content: "使用多种即时聊天工具",
        time: "2016-10-25 21:58"
      }
    ];

    $.ajaxSetup({
      cache: false
    });
    dlg.Init();
    // 初始化任务标签
    $.getJSON(serviceRoot + "gettasklist", function (data) {
      console.log(typeof data);
      dlg.initTask(data);
      $(".detail-select").click(dlg.taskChange);
      // $(".detail-select:first-child").click();

      if (data.length > 0) {
        var tid = data[0].taskId;
        $.getJSON(serviceRoot + 'gettaskinfo?taskid=' + data[0].taskId, function (data) {
          console.log('gettaskinfo');
          console.log(data);

          setReport(tid);

          gallery.setData(data, function (id, state) {
            //选择目标，触发辅屏联动
            selectTarget(id, state);
            gallery.closeOptions();
          }, function (id, code) {
            //点击目标头像，查看详情
            console.log('点击目标头像，查看详情 ' + id);
            $.getJSON(serviceRoot + 'gettargetthreateninfo?targetid=' + id, function (data) {
              console.log('gettargetthreateninfo?targetid=' + id);
              console.log(data);
              dlg.addtimeline(code, data);
              dlg.Open();
              gallery.closeOptions();

              // var ids = [];

              // data.forEach(function (element) {
              //   if (element["status"] === 'UNPROCESSED')
              //     ids.push(element.id);
              // }, this);

              // if (ids.length > 0)
              //   $.getJSON(serviceRoot + 'updatethreateninfo?id=' + ids.join(','), function (data) {
              //     console.log('updatethreateninfo?targetid=' + id);
              //     console.log(data);
              //   });
            });

          });
          gallery.init(selectTarget);
          gallery.buildGUI();
          gallery.animate();

          $.getJSON(serviceRoot + 'getalltargetsthreatennum', function (data) {
            console.log('getalltargetsthreatennum');
            console.log(data);

            gallery.warning(data);
          });
        });
      }
    });

    dlg.taskCallback = function (taskId) {
      $.getJSON(serviceRoot + 'gettaskinfo?taskid=' + taskId, function (data) {
        gallery.reset(data);
      });
    };

    selectTarget();


    // setInterval(function () {
    //   $.getJSON(serviceRoot + 'getalltargetsthreatennum', function (data) {
    //     console.log('getalltargetsthreatennum');
    //     console.log(data);

    //     gallery.warning(data);
    //   });
    // }, 100000);

    $.getJSON(serviceRoot + 'getSelectableTags', function (data) {
      console.log('getSelectableTags');
      console.log(data);

      if (data["tags"] === undefined)
        return;

      data["tags"].forEach(function (_tag) {
        _tag.CanChoose = true;
      }, this);

      tag.CreateTag(data["tags"], "options-content", function (e) {
        //    $.post(serviceRoot + 'submittagfiltertask', JSON.stringify(simudata), function (data1) {
        //      console.log('submittagfiltertask');
        //      console.log(data1);

        //      gallery.reset(data1);
        //      selectTarget('-1');
        //    });

        console.log('submittagfiltertask');
        e.push({
          typeId: 10026,
          typeName: "人员类别",
          "valueType": "string",
          valueList: ["053A"]
        });

        $.ajax({
          url: serviceRoot + 'submittagfiltertask',
          type: "POST",
          data: {
            condition: JSON.stringify(e)
          },
          success: function (data1) {
            console.log('submittagfiltertask');
            console.log(data1);
            gallery.reset(data1);
            selectTarget('-1', '');

            $.getJSON(serviceRoot + 'getalltargetsthreatennum', function (data) {
              console.log('getalltargetsthreatennum');
              console.log(data);

              gallery.warning(data);
            });
          },
          error: function (err) {
            console.log(JSON.stringify(err));
          }
        });

      });
    });



    // setTimeout(function () {
    //   gallery.reset(data);
    // }, 5000);

    // $('#result').click(function () {
    //   var r = tag.GetSelected();
    //   alert(JSON.stringify(r));
    // });

    function selectTarget(targetId, targetState) {
      if (targetId === undefined) {
        // 全选
        $.get(serviceRoot + 'setselectedtarget', {
          targetid: {
            targetid: '0',
            state: ''
          }
        });
      } else {
        $.get(serviceRoot + 'setselectedtarget', {
          targetid: {
            targetid: targetId,
            state: targetState
          }
        });
      }
    }

    function setReport(id) {
      $.getJSON(serviceRoot + "/dapservices/setrecordlog", {
        "taskType": "lmb",
        "subRpTasks": [{
          "subTypeName": "record_log",
          "param": {
            "task_id": id,
            "item": "lmb"
          }
        }]
      }, function (res) {
        console.log(res);
      });
    }
  });