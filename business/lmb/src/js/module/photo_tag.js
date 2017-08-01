/**
 * Created by maxiaodan on 2016/12/6.
 */

define([], function () {

    var tag = {
        //生成tag标签
        CreateTag: function (data, divid, submitcallback) {
            var innerHtml = '<div class="sx_updown clearfix">' +
                '<div class="content">';

            for (var i = 0; i < data.length; i++) {
                innerHtml += this.createNode(data[i]);
            }

            innerHtml += '</div></div>'; //<button id="submit" style="position:absolute;bottom:10px;left: 120px;z-index: 999">提交</button>';

            $('#' + divid).append(innerHtml);
            this.addSelectEvent(submitcallback);
        },

        createNode: function (tag) {
            var innerHtml = '';
            if (tag.CanChoose) {
                innerHtml += '<div class="updown_box">' +
                    '<h3>' + tag.typeName + '</h3>' +
                    '<ul id="' + tag.typeId + '">';
            }
            else {
                innerHtml += '<div class="updown_box_CannotChoose">' +
                    '<h3>' + tag.typeName + '</h3>' +
                    '<ul id="' + tag.typeId + '">';
            }
            for (var i = 0; i < tag.valueList.length; i++) {
                var str = this.getValueTag(tag.valueList[i], tag.valueType);
                innerHtml += '<li typeId="' + tag.typeId + '" typeName="' + tag.typeName + '" valueType="' + tag.valueType + '" val="' + tag.valueList[i] + '"><a href="javascript:;" >' + str + '</a></li>';
            }

            innerHtml += '</ul></div>';

            return innerHtml;
        },

        getValueTag: function (val, type) {

            if (type == "string") {
                return val;
            }
            if (type == "date") {
                var str = val.substring(1, val.length - 1);
                var v = str.split(",");
                if (v[1] == 'null')
                    return v[0] + "以后";
                else
                    return v[0] + '-' + v[1];
            }
            if (type == "int") {
                var str = val.substring(1, val.length - 1);
                var v = str.split(",");
                if (v[0] == "null" && v[1] == "null")
                    return "不限";
                if (v[0] == "null" && v[1] != "null")
                    return "小于" + v[1];
                if (v[0] != "null" && v[1] == "null")
                    return v[0] + "以上";
                if (v[0] != "null" && v[1] != "null")
                    return v[0] + '-' + v[1];
            }
        },

        addSelectEvent: function (callback) {
            $(".updown_box li").click(function () {
                $(this).toggleClass("selected");
                callback(tag.GetSelected());
            });
            // $("#submit").click(function(){
            //     callback(tag.GetSelected());
            // });
        },

        //获取选中的标签
        GetSelected: function () {
            var result = {};
            $('.sx_updown li.selected').each(function () {
                console.log("test");
                var tagid = $(this).attr("typeId");
                if (tagid in result) {
                    result[tagid].valueList.push($(this).attr("val"));
                }
                else {
                    var tag = {};
                    tag["typeId"] = $(this).attr("typeId");
                    tag["typeName"] = $(this).attr("typeName");
                    tag["valueType"] = $(this).attr("valueType");
                    tag["valueList"] = [$(this).attr("val")];
                    result[tagid] = tag;
                }
            });
            var selected = [];
            for (var i in result) {
                selected.push(result[i]);
            }

            return selected;
        }
    };
    return tag;
});