var FancyTree = React.createClass({
    getInitialState:function(){
        return {fancyTree:null}
    },
    componentDidMount:function(){
        var element = this;

        var tree = $("#"+this.props.id).fancytree({
            source: this.props.originalDataSource,
            checkbox:false,/*添加复选框*/
            selectMode:this.props.selectMode,
            clickFolderMode: 2,

            init:function(event,data){
                var fancyTree = data.tree;
                element.setState({fancyTree:fancyTree});

            },
            activate:function(event,data){
                //$("#echoActibe1").text(data.node.name);
            },
            select:function(event,data){
                var datas = data.tree.getSelectedNodes();
                element._getChooseArray();
            }
        });
    },

    /*调用this.props.clickevent的回调函数返回当前已获取对象*/
    _getChooseArray:function(){
        var fancyTree = this.state.fancyTree;
        var nodes = fancyTree.getSelectedNodes();
        var chooseArray = this._dealChooseData(nodes);

        var returnDataEvent=this.props.returnDataEvent;
        if(returnDataEvent!=null && _.isFunction(returnDataEvent))
        {
            returnDataEvent(chooseArray);
        }
    },
    _dealChooseData:function(nodes){
        var chooseArray = [];
        $(nodes).each(function(index){
            var chooseData={};
            chooseData.id = nodes[index].key;
            chooseData.value = nodes[index].title;
            chooseArray.push(chooseData);

        });
        return chooseArray
    },
    render:function(){
        var originalDataSource = this.props.originalDataSource;
        var loadEvent = this.handleLoad;
        var treeId = this.props.id;

        return (
            <div>
                <div id={treeId}>

                </div>
            </div>
        );
    }
});
FancyTree.defaultProps={
    id:'id',
    originalDataSource:[],
    selectMode:3,
    returnDataEvent:function(chooseArray){}
};
module.exports.FancyTree = FancyTree;