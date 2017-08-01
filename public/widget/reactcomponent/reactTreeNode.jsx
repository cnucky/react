

var TreeNode = React.createClass({
    /**
     * 调用render生成html后调用
     */
    componentDidMount:function(){
        if(this.props.isLeaf)
        {
            var iconClass=this.props.icon==null?"icon-minus-sign":this.props.icon;
            $(this.refs["node"]).attr("class",iconClass);
        }
        else{
            var iconClass=this.props.icon==null?"icon-folder-open":this.props.icon;
            $(this.refs["node"]).attr("class",iconClass);
        }

    },
    _handleClick:function(e){
        var _this=e.target;
        var children = $(_this).parent('li.parent_li').find(' > ul > li');
        if (children.is(":visible")) {
            children.hide('fast');
            $(_this).attr('title', 'Expand this branch').find(' > i').addClass('icon-plus-sign').removeClass('icon-minus-sign');
        } else {
            children.show('fast');
            $(_this).attr('title', 'Collapse this branch').find(' > i').addClass('icon-minus-sign').removeClass('icon-plus-sign');
        }

        var clickEvent=this.props.clickEvent;
        if(clickEvent!=null && _.isFunction(clickEvent))
        {
            clickEvent(e);
        }
    },
    render:function(){
        /**
         * 返回materialize的input标签
         */
        var child = this.props.child;
        var clickEvent=this.props.clickEvent;
        var childNodes = null;
        this.props.isLeaf=true;
        if(child.children){
            this.props.isLeaf=false;
            var childNodesList = child.children.map(function(dd){
                return  <TreeNode clickEvent={clickEvent} child={dd} />
            });
            childNodes = <ul>{childNodesList}</ul>
        }

        return (
            <li  >
                <span id={child.id}  onClick={this._handleClick.bind(this)}>
                    <i ref={'node'} className="icon-minus-sign" ></i> {child.name}
                </span>
                {childNodes}
            </li>
        )
    }
});

TreeNode.defaultProps={
    child:{
        children: [
        {id:"1",name:'name1'},
        {id:"2",name:'name2'},
    ]
    },
    icon:"icon-folder-open",
    isLeaf:false,
    clickEvent:function(e){}
};

module.exports.TreeNode = TreeNode;
