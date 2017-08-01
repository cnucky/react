
var TreeNode = require("./reactTreeNode.jsx").TreeNode;
/**
 * formInput 封装对象
 */
var TreeModelObject = function(){
    this.id="";
    this.name="";
    this.children=[];
}

var ReactTree= React.createClass({

        /**
         * 调用render生成html后调用
         */
    componentDidMount:function(){
        //加载语言包
            $('#tray-right-content [data-i18n]' ).localize();

            $('.tree li:has(ul)').addClass('parent_li');


    },
    render:function(){
        /**
         * 返回materialize的input标签
         */
        var myObject = this.props.dataMap;
        var clickEvent=this.props.clickEvent;
        var options = myObject.map(function(child){
            return <TreeNode clickEvent={clickEvent} child={child}/>
        })

        return (
            <div className="tree well">
                <ul>
                {options}
                </ul>
            </div>
        )
    }
});

//ReactTree.defaultProps={
//    dataMap:[treeNode1,treeNode2],
//    clickEvent:function(e){}
//};
//treeNode={
//    child:{
//        children: [
//            {id:"1",name:'name1'},
//            {id:"2",name:'name2'},
//        ]
//    },
//    icon:"icon-folder-open",
//    isLeaf:false,
//    clickEvent:function(e){}
//};
module.exports.ReactTree = ReactTree;


