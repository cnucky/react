var React = require('react');
var $ = require('jquery');
var _ = require('underscore');
require('fancytree-all');
require('utility/fancytree/extensions/jquery.fancytree.filter');
require('utility/fancytree/extensions/jquery.fancytree.childcounter');
require('utility/contextmenu/jquery.ui-contextmenu');
require('./fancytree.css');

/*
    config = {
        filter: filter,    // 自定义配置，是否使用过滤，true or false
        quicksearch: this.props.config.quicksearch || true,
        autoScroll: this.props.config.autoScroll || true,
        selectMode: this.props.config.selectMode || 3,
        clickFolderMode: this.props.config.clickFolderMode || 1,
        checkbox: this.props.config.checkbox || true,
        source: this.props.config.source
    }
*/

var FancyTree = React.createClass({
    componentDidMount: function() {
        var cfg = {
            extensions: this.props.config.filter ? ["filter"] : undefined,
            filter: this.props.config.filter ? { mode: "dimn", autoAppaly: true, hightlight: true} : undefined,    // 自定义配置，是否使用过滤
            quicksearch: this.props.config.quicksearch || true,
            autoScroll: this.props.config.autoScroll || true,
            selectMode: this.props.config.selectMode || 3,
            clickFolderMode: this.props.config.clickFolderMode || 1,
            checkbox: this.props.config.checkbox || true,
            source: this.props.config.source
        };

        if (this.props.config) {
            cfg = _.extend(cfg, this.props.config);
        }

        // 通用方法
        cfg.loadChildren = _.bind(function(event, data) {
            // Apply parent's state to new child nodes
            if (this.selectMode == 3) {
                data.node.fixSelection3AfterClick();
            }
            if (this.props.config.loadChildren && typeof this.props.config.loadChildren === 'function') {
                return this.props.config.loadChildren(event, data);
            }
        }, this);

        cfg.postProcess = _.bind(function(event, data) {
            if(data.response) {
                data.result = data.response.data;
            }
            if (this.props.config.postProcess && typeof this.props.config.postProcess === 'function') {
                return this.props.config.postProcess(event, data);
            }
        }, this);

        $(this.refs.treeContainer).fancytree(cfg);
    },

    componentWillReceiveProps: function(nextProps) {
        var treeInstance = $(this.refs.treeContainer).fancytree("getTree");
        if(nextProps.forceReload) {
            treeInstance.reload(nextProps.config.source);
        }
        //if(nextProps.selectedNode) {
        //    treeInstance.visit((node) => {
        //        if(_.contains(nextProps.selectedNode, node.key)) {
        //            node.setSelected(true);
        //        } else {
        //            node.setSelected(false);
        //        }
        //    })
        //}
    },

    handleFilterInput: function(event) {
        var n;
        var opts = {
            autoExpand: true
        };
        var match = $(this.refs.filterInput).val();

        if (event && event.which === $.ui.keyCode.ESCAPE || $.trim(match) === "") {
            $(this.refs.resetBtn).click();
            return;
        }
        var treeInstance = $(this.refs.treeContainer).fancytree("getTree");
        n = treeInstance.filterNodes(match, opts);

        $(this.refs.resetBtn).attr("disabled", false);
        $(this.refs.matchesSpan).text("(" + n + ")");
    },
    clearFilterInput: function(event) {
        $(this.refs.filterInput).val("");
        $(this.refs.matchesSpan).text("");
        var treeInstance = $(this.refs.treeContainer).fancytree("getTree");
        treeInstance.clearFilter();
        $(this.refs.resetBtn).attr("disabled", true);
    },

    render: function() {
        return (
            <div>
                <div ref="filterDiv" className="row mt10 mln mrn" style={{backgroundColor: 'white', display: this.props.config.filter ?  '' : 'none'}}>
                    <div className="col-xs-8">
                    <input ref="filterInput" type="text" onKeyUp={this.handleFilterInput} className="form-control input-sm" placeholder="过滤..."></input>
                    </div>
                    <div className="col-xs-4">
                        <button type="button" className="btn btn-primary btn-sm" ref="resetBtn" onClick={this.clearFilterInput}>清除
                            <span ref="matchesSpan"></span>
                        </button>
                    </div>
                </div>
                <div ref="treeContainer" className="react-fancytree">
                </div>
            </div>
        )
    }
})


module.exports = FancyTree;
