import React from 'react';
import ReactDOM from 'react-dom';
import OutputFields from './modeling-output-fields';
import Notify from 'nova-notify';
import Provider from 'widget/i18n-provider';

var dataSourceDetail = {
    selectedFields: [],
    outputFields: [],
    isWithFavor: 1
};

class DataSourceCond extends React.Component {
    /* static defaultProps = {
        outputFields: [],
        selectedFields: [],
        isDelDuplicate: 0,
        dataTable: []
    };
    static propTypes = {
        outputFields: React.PropTypes.array.isRequired,
        selectedFields: React.PropTypes.array.isRequired,
        selectedFields: React.PropTypes.bool.isRequired,
        dataTable: React.PropTypes.array.isRequired,
        onOutputChanged: React.PropTypes.func
    }; */

    constructor(props) {
        super(props);

        this.state = {
            outputFields: props.outputFields,
            selectedFields : props.selectedFields,
            isWithFavor: props.isWithFavor
        };
    }

    onSaveChecked(event) {
        dataSourceDetail.isWithFavor = event.target.checked ? 1 : 0;
        this.setState({isWithFavor: dataSourceDetail.isWithFavor});
    }

    onSelectedChanged(outputSelectedFields) {
        dataSourceDetail.selectedFields = outputSelectedFields;
        this.setState({selectedFields: dataSourceDetail.selectedFields});
    }

    showAllFields(e) {
        var instance = this;
        $.getJSON('/modelanalysis/modeling/getdatatypecoldef', {
            centercode: dataSourceDetail.centerCode,
            zoneid: dataSourceDetail.zoneId,
            typeid: dataSourceDetail.typeId,
            iswithfavor: 0
        }, function (res) {
            if (res.code == 0) {
                instance.setState({outputFields: res.data.outputColumnDescList});
            }
        });
    }

    render() {
        var {selectedFields, outputFields, isWithFavor} = this.state;
        var {i18n} = this.context;

        return (<div id="outputFields">
            <div className="row mt10 mb10">
                <label className="col-md-4" style={{fontSize: "18px", fontWeight: 'lighter'}}>{i18n.t("output-field")}</label>
                <div className="col-md-5 text-right">
                    <button type="button" className="btn btn-default btn-sm" onClick={this.showAllFields.bind(this)}>{i18n.t("data-source.all-field")}</button>
                </div>
                <div className="col-md-3 text-right pt5">
                    <input type="checkbox" checked={isWithFavor == 1} onChange={this.onSaveChecked.bind(this)}/><span
                    className="ml5 fs13 fw600">{i18n.t("data-source.save-preferance")}</span>
                </div>
            </div>
            <OutputFields inputFields={outputFields}  selectedFields={selectedFields} hideOutputs={true} tableColumnNames={[i18n.t("field"), i18n.t("type")]}
                          onChange={this.onSelectedChanged.bind(this)}/>
        </div>);
    }
}

DataSourceCond.contextTypes = {
    i18n: React.PropTypes.object
};

export function constructTaskDetail() {
    if (dataSourceDetail.selectedFields.length == 0) {
        return {message: window.i18n.t("warning.need-at-least-one-output")}
    }
    dataSourceDetail.outputColumnDescList = dataSourceDetail.selectedFields;
    return {
        detail: _.omit(dataSourceDetail, 'selectedFields', 'outputFields')
    };
}

export function render(container, outputData) {
    dataSourceDetail = _.extend({}, outputData.output);
    dataSourceDetail.outputFields = dataSourceDetail.outputColumnDescList;

    dataSourceDetail.selectedFields = _.map(dataSourceDetail.outputColumnDescList,  function(item) {
        return _.extend({}, item);
    });

    _.isUndefined(dataSourceDetail.isWithFavor) && (dataSourceDetail.isWithFavor =  1);

    ReactDOM.render(<Provider><DataSourceCond outputFields={dataSourceDetail.outputFields}
                                    selectedFields={dataSourceDetail.selectedFields} isWithFavor={dataSourceDetail.isWithFavor} /></Provider>, container);
}