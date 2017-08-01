define([

], function() {

    function renderFromMetaData(metaFields) {
        var codes = [];
        _.each(metaFields, function(field) {
            var code = '<div class="col-md-1 column control-label">' + '<div class="box box-element ui-draggable"> <a href="#close" class="remove label label-danger" title="删除"><i class="glyphicon glyphicon-remove glyphicon-white"></i></a> <span class="drag label" title="拖动"><i class="glyphicon glyphicon-move"></i></span><div class="preview">标签页</div><div class="view"> <label for="' + field.name + '_C" class="control-label">' + field.label + '</label></div></div>' + '</div>' + '<div class="col-md-5 column">' + '<div class="box box-element ui-draggable"> <a href="#close" class="remove label label-danger" title="删除"><i class="glyphicon glyphicon-remove glyphicon-white"></i></a> <span class="drag label" title="拖动"><i class="glyphicon glyphicon-move"></i></span><div class="preview">输入框</div><div class="view"> ';
            switch (field.type) {
                case 'B':
                    code += '<select class="form-control" placeholder="" cfield="' + field.name + '" dict="' + field.dict + '"></select>'
                    break;
                case 'D':
                    code += '<input type="date" class="form-control" placeholder="" cfield="' + field.name + '">'
                    break;
                default:
                    code += '<input type="text" class="form-control" placeholder="" cfield="' + field.name + '">'
            }

            code += '</div></div>' + '</div>';
            codes.push(code);
        });

        var html = '<div class="lyrow ui-draggable"> <a href="#close" class="remove label label-danger" title="删除"><i class="glyphicon glyphicon-remove glyphicon-white"></i></a> <span class="drag label" title="拖动"><i class="glyphicon glyphicon-move"></i></span>';
        html += '<div class="preview">';
        html += '<input value="1 5 1 5" type="text">';
        html += '</div>';
        html += '<div class="view">';
        html += '<div class="row clearfix">';
        html += codes.join("");

        html += '</div></div></div>';


        $(".demo").append(html);

    }

    function renderFromMetaData2(metaFields) {
        var codes=['<div class="col-md-12 column"><div class="box box-element ui-draggable"> <a href="#close" class="remove label label-danger" title="删除"><i class="glyphicon glyphicon-remove glyphicon-white"></i></a> <span class="drag label" title="拖动"><i class="glyphicon glyphicon-move"></i></span><div class="preview">标题</div><div class="view"> <label class="titleLabel">标题</label></div></div></div>'];
        _.each(metaFields, function(field) {
            if (field.visible) {
                var code = '<div class="col-md-6 column halfrow">' + '<div class="box box-element ui-draggable"> <a href="#close" class="remove label label-danger" title="删除"><i class="glyphicon glyphicon-remove glyphicon-white"></i></a> <span class="drag label" title="拖动"><i class="glyphicon glyphicon-move"></i></span>'

                +'<div class="preview">输入框</div>' + '<div class="view">' + '<div class="col-md-2"><label>' + field.label + '</label></div>' + '<div class="col-md-10">'
                switch (field.type) {
                    case 'B':
                        //code+='<select class="form-control" placeholder="" cfield="'+field.name+'" dict="'+field.dict+'"></select>'       
                        code += '<div class="coder form-control" placeholder="" cfield="' + field.name + '" dict="' + field.dict + '"></div>';
                        break;
                    case 'M':
                        code += '<textarea class="form-control" placeholder="" cfield="' + field.name + '"></textarea>'
                        break;
                    case 'MS':
                        code += '<div class="summernote" placeholder="" cfield="' + field.name + '"></div>'
                        break;
                    case 'L':
                        code += '<input type="checkbox" class="form-control" placeholder="" cfield="' + field.name + '">'
                        break;
                    case 'V':
                        code += '<input type="number" class="form-control" placeholder="" cfield="' + field.name + '">'
                        break;
                    case 'D':
                        code += '<div class="dateInput form-control" placeholder="" cfield="' + field.name + '"></div>';
                        break;
                    case 'CS':
                        code += '<div class="multiInput form-control" placeholder="" cfield="' + field.name + '"></div>';
                        break;
                    case 'X':
                        code += '<div class="upload form-control" cfield="' + field.name + '"></div>';
                        break;
                    case 'P':
                        code += '<div class="photo form-control" cfield="' + field.name + '"></div>';
                        break;
                    default:
                        code += '<input type="text" class="form-control" placeholder="" cfield="' + field.name + '">'
                }

                code += '</div></div>' + '</div>' + '</div>';
                codes.push(code);
            }
        });

        var html = '<div class="lyrow ui-draggable"> <a href="#close" class="remove label label-danger" title="删除"><i class="glyphicon glyphicon-remove glyphicon-white"></i></a> <span class="drag label" title="拖动"><i class="glyphicon glyphicon-move"></i></span>';
        html += '<div class="preview">';
        html += '<input value="2 4 2 4" type="text">';
        html += '</div>';
        html += '<div class="view">';
        html += '<div class="row clearfix">';
        html += codes.join("");

        html += '</div></div></div>';


        $(".demo").append(html);

    }

    function renderFromMetaData3(metaFields,tableID) {
        $.getJSON('/tbl-design/getTableDefaultLayOutInfo',{
            tableID : tableID
        }).done(function(rsp){
            if(rsp.code == 0){
                if(_.isEmpty(rsp.data)){
                    renderFromMetaData2(metaFields);
                }else{
                    _.each(rsp.data.Layout,function(item){
                        var html = '<div class="lyrow ui-draggable"> <a href="#close" class="remove label label-danger" title="删除"><i class="glyphicon glyphicon-remove glyphicon-white"></i></a> <span class="drag label" title="拖动"><i class="glyphicon glyphicon-move"></i></span>';
                        html += '<div class="preview">';
                        html += '<input value="2 4 2 4" type="text">';
                        html += '</div>';
                        html += '<div class="view">';
                        html += '<div class="row clearfix">';

                        if(!_.isEmpty(item.Label)){
                            html += '<div class="col-md-12 column"><div class="box box-element ui-draggable"> <a href="#close" class="remove label label-danger" title="删除"><i class="glyphicon glyphicon-remove glyphicon-white"></i></a> <span class="drag label" title="拖动"><i class="glyphicon glyphicon-move"></i></span><div class="preview">'+item.Label+'</div><div class="view"> <label class="titleLabel">'+item.Label+'</label></div></div></div>';    
                        }
                        
                        html += recursionLayoutItem(metaFields,item);

                        html += '</div></div></div>';
                        $(".demo").append(html);
                    });
                    
                    $(".demo .column").each(function() {
                        var t = $(this);
                        var divs = t.children().children(".view").children("div");

                        if (divs.hasClass("col-md-4") && t.hasClass("fullrow")) {
                            divs.filter('.col-md-4').removeClass('col-md-4').addClass('col-md-2');
                            divs.filter('.col-md-8').removeClass('col-md-8').addClass('col-md-10');
                        } else if (divs.hasClass("col-md-2") && t.hasClass("halfrow")) {
                            divs.filter('.col-md-2').removeClass('col-md-2').addClass('col-md-4');
                            divs.filter('.col-md-10').removeClass('col-md-10').addClass('col-md-8');
                        }
                    });
                }
            }
        });

        
    }

    function recursionLayoutItem(metaFields,group){
        var htmlStr = '<div class="col-md-'+group.Width+' pn">';

        _.each(group.ChildrenItem,function(childItem){
            if(childItem.ElementType == 2){
                var field = _.find(metaFields,function(i){
                    return i.name == childItem.Id;
                });
                if(field.visible){
                    var isFullRow = (childItem.RealWidth>6) ? "fullrow":"halfrow";

                    var code = '<div class="col-md-'+childItem.Width+' column '+isFullRow+'">' + '<div class="box box-element ui-draggable"> <a href="#close" class="remove label label-danger" title="删除"><i class="glyphicon glyphicon-remove glyphicon-white"></i></a> <span class="drag label" title="拖动"><i class="glyphicon glyphicon-move"></i></span>'
                    +'<div class="preview">输入框</div>' + '<div class="view">' + '<div class="col-md-2"><label>' + field.label + '</label></div>' + '<div class="col-md-10">'
                    switch (field.type) {
                        case 'B':
                            //code+='<select class="form-control" placeholder="" cfield="'+field.name+'" dict="'+field.dict+'"></select>'       
                            code += '<div class="coder form-control" placeholder="" cfield="' + field.name + '" dict="' + field.dict + '"></div>';
                            break;
                        case 'M':
                            code += '<textarea class="form-control" placeholder="" cfield="' + field.name + '"></textarea>'
                            break;
                        case 'MS':
                            code += '<div class="summernote" placeholder="" cfield="' + field.name + '"></div>'
                            break;
                        case 'L':
                            code += '<input type="checkbox" class="form-control" placeholder="" cfield="' + field.name + '">'
                            break;
                        case 'V':
                            code += '<input type="number" class="form-control" placeholder="" cfield="' + field.name + '">'
                            break;
                        case 'D':
                            code += '<div class="dateInput form-control" placeholder="" cfield="' + field.name + '"></div>';
                            break;
                        case 'CS':
                            code += '<div class="multiInput form-control" placeholder="" cfield="' + field.name + '"></div>';
                            break;
                        case 'X':
                            code += '<div class="upload form-control" cfield="' + field.name + '"></div>';
                            break;
                        case 'P':
                            code += '<div class="photo form-control" cfield="' + field.name + '"></div>';
                            break;
                        default:
                            code += '<input type="text" class="form-control" placeholder="" cfield="' + field.name + '">';
                    }
                    code += '</div></div>' + '</div>' + '</div>';
                    htmlStr += code;
                }
            }else{
                htmlStr += recursionLayoutItem(metaFields,childItem);
            }
        });

        htmlStr += '</div>';

        return htmlStr;
    }

    return {
        renderFromMetaData: renderFromMetaData,
        renderFromMetaData2: renderFromMetaData3
    }
});