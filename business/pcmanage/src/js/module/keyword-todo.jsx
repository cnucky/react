var $ = require('jquery');
var React = require('react');
require('tagsinput');

var KeywordToDo = React.createClass({
    componentDidMount: function() {
        $(this.refs.tagsinput).tagsinput({
            tagClass: function() {
                return 'label label-primary';
            }
        });

        var tag = document.getElementById('tagsinput');
        tag.id = this.props.data.field.columnName;

        if(!_.isEmpty(this.props.data.children)) {
            $(tag).data('restoreValue', this.props.data.children);
        }

        $(this.refs.tagsinput).each(function() {
            var that = $(tag);
            if (!_.isEmpty($(tag).data('restoreValue'))) {
                var tagsArray = $(tag).data('restoreValue');
                _.each(tagsArray, function(item) {
                    that.tagsinput('add', item);
                });
            }
        });
    },
    componentWillReceiveProps: function(nextProps) {
        // $(this.refs.tagsinput).tagsinput({
        //     tagClass: function() {
        //         return 'label label-primary';
        //     }
        // });

        var tag = this.refs.tagsinput;
        // tag.id = nextProps.data.field.fieldName;

        if(!_.isEmpty(nextProps.data.children)) {
            // $(tag).data('restoreValue', nextProps.data.children);
            $(tag).tagsinput('removeAll');
            _.each(nextProps.data.children, function(item) {
                    $(tag).tagsinput('add', item);
                });
        } else {
            $(tag).tagsinput('removeAll');
        }
        
        // if (!_.isEmpty($(tag).data('restoreValue'))) {
        //         var tagsArray = $(tag).data('restoreValue');
        //         _.each(tagsArray, function(item) {
        //             $(tag).tagsinput('add', item);
        //         });
        // } else {
        //         $(tag).tagsinput('removeAll');
        // }
    },
    render: function() {
        return (
            <input id="tagsinput" ref="tagsinput" className="col-md-6 pn tagsinput" value="" type="text"></input>
        )
    }
});

module.exports = KeywordToDo;
