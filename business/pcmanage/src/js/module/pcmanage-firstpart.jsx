var React = require('react');
var ReactDOM = require('react-dom');
var $ = require('jquery');
var _ = require('underscore');
var Notify = require('nova-notify');

var _stateData = [];
var _consFlag = false;
var _ruleCount = 2;

var ShowFirstPartContent = React.createClass({
    getInitialState: function() {

        var initState = [{
                caption:"规则集1",
                name:"规则集1"
            }];
        $.extend(_stateData,initState);
        return {
            selectedData:initState
        };
    },
    getInputValue:function(e){
        var index = $(e.currentTarget).attr('data-index');
        var selectedData = this.state.selectedData;
        selectedData[index].caption = $(e.currentTarget).val();
        selectedData[index].name = $(e.currentTarget).val();
        this.update(selectedData);
    },
    update: function(state) {
        _stateData = [];
        $.extend(_stateData,state);
        this.setState({selectedData:state});
    },
    addBtnClick: function(e) {
        var selectedData = this.state.selectedData;
        selectedData.push({
            caption:"规则集" +_ruleCount,
            name:"规则集" +_ruleCount
        })
        _ruleCount = _ruleCount +1;
        this.update(selectedData);
    },
    toggleDeleteMode: function() {
        this.state.deleteMode = !this.state.deleteMode;
        this.setState({setData:this.state.setData});
    },
    deleteBtnClick: function(e) {
        var index = $(e.currentTarget).attr('data-index');
        if(this.state.selectedData.length >= 2){
            this.state.selectedData.splice(index, 1);
        }
        _stateData = [];
        $.extend(_stateData,this.state.selectedData);
        this.setState({selectedData:this.state.selectedData});
    },
    render:function(){
        var selectedData = this.state.selectedData;
        if(_consFlag){
            var len = selectedData.length;
            selectedData.splice(0,len);
            _stateData = [];
            _consFlag = false;
            var initState = [{
                caption:"规则集1",
                name:"规则集1"
            }];
            _ruleCount = 2;
            $.extend(_stateData,initState);
            $.extend(selectedData,initState);
        }else{
            $.extend(true,selectedData,_stateData);
        }
        var getInputValue = this.getInputValue;
        var deleteBtnClick = this.deleteBtnClick;
        var deleteModeFlag = this.state.deleteMode;
        var btns = (<div className="col-md-12 btn-group" style={{margin :'15px -5px 10px -20px'}}>
                <div className = "col-md-2" >
                <button type="button" onClick={this.addBtnClick} className="btn btn-primary btn-sm btn-block">
                    新增
                </button>
                </div>
                <div className ="col-md-2" >
                <button type="button" onClick={this.toggleDeleteMode} className="btn btn-danger btn-sm btn-block">
                    删除
                </button>
                </div>
                </div>
            )
        if(this.state.deleteMode) {
            btns = (<div className="col-md-12 btn-group" style={{margin :'15px -5px 10px -20px'}}>
                <div className ="col-md-2">
                <button type="button" onClick={this.toggleDeleteMode} className="btn btn-system btn-sm btn-block">
                    完成
                </button>
                </div>
                </div>
            )
        }

        return (
            <div className="col-md-12 pn">
                
                <div className="col-md-12 pn">
                    {btns}
                </div>
                <div className="col-md-12 controls pn" style={{margin :'0px 0px 10px 10px'}}>
                {
                    _.map(selectedData,_.bind(function(itemData,index){
                        return (<div className="col-md-12 form-group pn"  key={index}> 
                        {
                            deleteModeFlag?<button type="button" onClick={deleteBtnClick} data-index={index} className="col-md-1 hide-show btn btn-danger" >-</button>:null
                        }
                        <div className={deleteModeFlag?"col-md-11 admin-form":"col-md-12 pn admin-form"}>
                            <input  data-index={index} type="text" className="gui-input" 
                                value={itemData.caption}  
                                onChange={getInputValue} 
                                placeholder="">
                            </input>
                        </div>
                    </div>)
                    },this))
                }
                </div>
            </div>
            )
    }
});

module.exports.getSelectedState = function(){
    return _stateData;
}

module.exports.render = function(container) {
    var inputData = {
    }
    ReactDOM.render(<ShowFirstPartContent inputData={inputData}/>, container);
}

module.exports.renderFirst = function(container,initState) {
    var inputData = {
    }

    _stateData = []
    if(initState.length > 0){
        $.extend(true,_stateData,initState);
    }else{
        _consFlag = true;
    }

    ReactDOM.render(<ShowFirstPartContent inputData={inputData}/>, container);
}

