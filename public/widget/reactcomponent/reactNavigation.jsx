/**
 * 导航栏
 */
var ReactNavigation = React.createClass({
    componentDidMount:function(){
    },

    /**
     * 选择导航后执行回调函数
     * @param child
     */
    handleClick:function(child){
        $("#navigation .active").removeClass("active");
        $("#navigation_"+child.key).addClass("active");
        var clickEvent = this.props.clickEvent;
        if(clickEvent && _.isFunction(clickEvent)){
            clickEvent(child);
        }
    },
    render:function(){
        var element = this;
        var originalDataSource = this.props.originalDataSource;
        var datas = originalDataSource==null?null:originalDataSource.map(function(child,index){
            return <a className='collection-item' onClick={element.handleClick.bind(this,child)} id={"navigation_"+child.key}
                      data-tag-key={child.key} data-tag-name={child.name}>
                {child.name}
            </a>
        });
        return (
            <div className="collection margin-top-10 text-align-center" id="navigation">
                {datas}
            </div>
        );
    }
});

module.exports.ReactNavigation = ReactNavigation;
ReactNavigation.defaultProps={
    originalDataSource:[{
        key:"defaultkey",
        name:"defaultName"
    }],
    clickEvent:function(item){}
};
