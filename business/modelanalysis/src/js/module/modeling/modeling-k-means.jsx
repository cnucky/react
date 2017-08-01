var React = require('react');
var ReactDom = require('react-dom');
var MultiSelect = require('widget/multiselect');
var _ = require('underscore');
var Provider = require('widget/i18n-provider');

var taskDetail;

var FeatureColumnComponent = React.createClass({
    contextTypes:{i18n:React.PropTypes.object},
    handleSelectField:function() {
        this.props.handleSelectField();
    },
    render:function() {
        var {i18n} = this.context;
        return (
            <div>
                <div>
                    <label>{i18n.t('kMeans.characteristicSet')}</label>
                </div>
                <MultiSelect config={{buttonWidth: '99%'}}
                            updateData={true} onChange={this.handleSelectField}
                            data={
								_.map(this.props.inputFields,function(field){
								return{
									label: field.caption,
									type: field.fieldType,
									value: field.fieldName,
									selected: _.contains(this.props.selectedFields,field.columnName)
									}
								})}>

                </MultiSelect>
            </div>
        )
    }
});

var ParametersComponent = React.createClass({
    contextTypes:{i18n:React.PropTypes.object},
    categoryNumChangedHandle: function(e) {
        this.props.categoryNumChangedHandle(e.currentTarget.value);
    },
    maxIterationsChangedHandle:function(e) {
        this.props.categoryNumChangedHandle(e.currentTarget.value);
    },
    render: function () {
        var {i18n} = this.context;
        return (
            <div>
                <div>
                    <label>{i18n.t('kMeans.numberOfClusters')}</label>

                    <div>
                       <input type="number"　id="spinner1" className="form-control" name="spinner"
                              style={{background:"#eeeeee"}}
                              defaultValue={this.props.k} aria-valuenow="8" autoComplete="off" role="spinbutton"
                              onChange={this.categoryNumChangedHandle}>
                       </input>
                    </div>
                </div>
                <br/>

                <div>
                    <label>{i18n.t('kMeans.maxNumberOfIteration')}</label>

                    <div>
                       <input type="number" id="spinner2" className="form-control" name="spinner"
                              style={{background:"#eeeeee"}}
                              defaultValue={this.props.maxIterations} aria-valuenow="8" autoComplete="off"
                              role="spinbutton"
                              onChange={this.maxIterationsChangedHandle}>
                       </input>
                    </div>
                </div>
            </div>
        )
    }
});

var KMeansConditionComponent = React.createClass({
    getInitialState(){
        return{
            k:this.props.k,
            maxIterations:this.props.selectedFields
        }
    },
    categoryNumChangedHandle:function(num) {
        this.setState(
            {
                k: num
            }
        )
    },
    maxIterationsChangedHandle:function(iters) {
        this.setState(
            {
                maxIterations: iters
            }
        )
    },
    handleSelectField:function(){

    },
    render:function() {
       return (
           <div>
               <ParametersComponent k={this.props.k}
                                    maxIterations={this.props.maxIterations}
                                    categoryNumChangedHandle={this.categoryNumChangedHandle}
                                    maxIterationsChangedHandle={this.maxIterationsChangedHandle}>
               </ParametersComponent>
           </div>
       )
   }
});

module.exports.render = function(container,data){
    var inputFields = data.input[0].outputColumnDescList;
    if (data.output && data.output.collisionList) {
        taskDetail = data.output;
    } else {
        taskDetail = {
            inputNode: data.inputIds[0],
            k:2,
            maxIterations: 100,
            outputColumnDescList: []
        }
    }
    ReactDom.render(
        <Provider.default><KMeansConditionComponent
            inputFields={inputFields}
            k={taskDetail.k}
            maxIterations={taskDetail.maxIterations}/></Provider.default>, container)
};

module.exports.constructTaskDetail = function() {
    return {
        detail: taskDetail
    };
};