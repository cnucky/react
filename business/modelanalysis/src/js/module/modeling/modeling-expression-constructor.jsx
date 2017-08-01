var $ = require('jquery');
var _ = require('underscore');
var React = require('react');
var ReactDOM = require('react-dom');
var Dialog = require('nova-dialog');
var Notify = require('nova-notify');
var Provider = require('widget/i18n-provider');
import Tooltip from 'widget/tooltip';

var XHR = null;

var ExpressionConstructor = React.createClass({
    contextTypes: {
        i18n: React.PropTypes.object
    },
    propTypes: {
        input: React.PropTypes.array,
        expression: React.PropTypes.string,
        hint: React.PropTypes.string
    },
    getInitialState() {
        return {
            timeoutID: 0 
        };
    },
    getExpression: function() {
        return $(this.refs.expressionInput).val();
    },
    componentDidMount: function() {
        $(this.refs.functionTree).fancytree({
            selectMode: 1,
            clickFolderMode: 1,
            source: { url: "/modelanalysis/modeling/getcoltransformfunction" },
            postProcess: function(event, data) {
                if (data.response) {
                    data.result = data.response.data;
                }
            },
            autoScroll: true,
            iconClass: function(event, data) {
                if (data.node.folder) {
                    return "fa fa-folder";
                } else {
                    return "fa fa-pie-chart";
                }
            },
            activate: _.bind(function(event, data) {
                // if (!data.node.data.hint) return;
                // $(this.refs.functionHint).removeClass('hide').text(data.node.data.hint); //update hint
            }, this),
            dblclick: this.funcDblClick
        });
        $(this.refs.expressionInput).blur(this.onInputBlur);
    },
    fieldSelectChanged: function(e) {
        /*$(this.refs.expressionHint).css({color:"grey"});
        $(this.refs.expressionHint).text($(e.target).val());//update hint*/
    },
    onInputBlur: function() {
        this.inputSelection = this.getInputSelection(this.refs.expressionInput);
    },
    funcDblClick: function(event, data) {
        var text = $(this.refs.expressionInput).val();
        var format = data.node.data.format;
        if (!format) return;
        if (this.inputSelection && this.inputSelection.end > this.inputSelection.start) {
            // 当已经选中文本时，将选中文本作为参数
            var splitFormat = format.split('*');
            var rlt = text.slice(0, this.inputSelection.start) + splitFormat[0] + text.slice(this.inputSelection.start, this.inputSelection.end);
            for (var i = 1; i < splitFormat.length; i++) {
                rlt += splitFormat[i];
            }
            rlt += text.slice(this.inputSelection.end);
            $(this.refs.expressionInput).val(rlt);
            this.setSelectionRange(this.refs.expressionInput, this.inputSelection.start + splitFormat[0].length, this.inputSelection.end + splitFormat[0].length);
        } else {
            var insertPos = this.inputSelection ? this.inputSelection.start : text.length;
            var newPos = insertPos + format.indexOf('*');
            $(this.refs.expressionInput).val(text.slice(0, insertPos) + format.replace(/\*/g, '') + text.slice(insertPos));
            this.setCaretPos(this.refs.expressionInput, newPos);
        }
        this.judgeInputField(event);
    },
    fieldDblClick: function(e) {
        var size = this.props.input.length;
        var text = $(this.refs.expressionInput).val();
        var insertPos = this.inputSelection ? this.inputSelection.end : text.length;
        var afterStr = text.substr(insertPos, 1);
        var field = $(e.target).val();
        if(size > 1) {
            var index = $(e.currentTarget).attr('data-index');
            field = 't' + index + '.' + field;
        }
        var newPos = afterStr === ',' ? insertPos + field.length + 1 : insertPos + field.length;
        $(this.refs.expressionInput).val(text.slice(0, insertPos) + field + text.slice(insertPos));
        this.setCaretPos(this.refs.expressionInput, newPos);
        this.judgeInputField(e);
    },
    getInputSelection: function(el) {
        var start = 0,
            end = 0,
            normalizedValue, range,
            textInputRange, len, endRange;

        if (typeof el.selectionStart == "number" && typeof el.selectionEnd == "number") {
            start = el.selectionStart;
            end = el.selectionEnd;
        } else {
            range = document.selection.createRange();

            if (range && range.parentElement() == el) {
                len = el.value.length;
                normalizedValue = el.value.replace(/rn/g, "n");

                // Create a working TextRange that lives only in the input
                textInputRange = el.createTextRange();
                textInputRange.moveToBookmark(range.getBookmark());

                // Check if the start and end of the selection are at the very end
                // of the input, since moveStart/moveEnd doesn't return what we want
                // in those cases
                endRange = el.createTextRange();
                endRange.collapse(false);

                if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
                    start = end = len;
                } else {
                    start = -textInputRange.moveStart("character", -len);
                    start += normalizedValue.slice(0, start).split("n").length - 1;

                    if (textInputRange.compareEndPoints("EndToEnd", endRange) > -1) {
                        end = len;
                    } else {
                        end = -textInputRange.moveEnd("character", -len);
                        end += normalizedValue.slice(0, end).split("n").length - 1;
                    }
                }
            }
        }

        return {
            start: start,
            end: end
        };
    },
    setSelectionRange: function(input, selectionStart, selectionEnd) {
        if (input.setSelectionRange) {
            input.focus();
            input.setSelectionRange(selectionStart, selectionEnd);
        } else if (input.createTextRange) {
            var range = input.createTextRange();
            range.collapse(true);
            range.moveEnd('character', selectionEnd);
            range.moveStart('character', selectionStart);
            range.select();
        }
    },
    setCaretPos: function(input, pos) {
        this.setSelectionRange(input, pos, pos);
    },
    judgeInputField: function(e) {
        clearTimeout(this.state.timeoutID);
        var expressionHint = $(this.refs.expressionHint);
        this.setState({timeoutID: setTimeout(
            function(){
                this.props.postInput(
                    (rsp) => {
                        if (rsp.code == 0 && rsp.data.isValidate) {
                            expressionHint.css({color:"grey"});
                            expressionHint.text(rsp.data.message);
                        } 
                        else {
                            expressionHint.css({color:"red"});
                            expressionHint.text(rsp.data.message || rsp.message);           
                        }
                    }
                );
            }.bind(this)   
            , 1000)});
    },
    render: function() {
        var {i18n} = this.context;
        var size = this.props.input.length;
        var inputTitles;
        if (size == 1) {
            inputTitles = (<label className="field-label">{i18n.t("field")}</label>)
        } else {
            inputTitles = (<ul className="nav nav-pills mb5">{
                    _.map(this.props.input, function(item, index) {
                        return (
                            <li className={index==0 ? 'active' : ''} key={index}>
                                <Tooltip title={item.title} placement="top" >
                                     <a href={'#fieldtab_' + index} data-toggle="tab" className="text-ellipsis" style={{padding:'5px 10px',maxWidth:'120px'}}>

                                            <span>{item.title}</span>

                                     </a>
                                </Tooltip>
                            </li>
                                )
                    })
                }</ul>)
        }
        return (
            <div className="admin-form theme-primary">
            <div className="row">
            <div className="col-md-6">
            <label className="field-label" style={size == 1 ? {} : {marginBottom: '5px', padding: '6px 0'}}>{i18n.t("function")}</label>
            <div className="field gui-input pn" style={{height:'200px'}}>
            <div ref="functionTree-container" style={{height:'100%'}}>
                <div ref="functionTree" style={{height:'100%'}}>
                </div>
            </div>
            </div>
            </div>
            <div className="col-md-6">
            {inputTitles}
            <div className="field tab-content pn">
            {
                _.map(this.props.input, function(item, index) {
                    return (
                        <div id={'fieldtab_' + index} className={index == 0 ? 'tab-pane active' : 'tab-pane'} style={{height:'200px'}} key={index}>
                        <label className="field select-multiple" style={{height:'100%'}}>
                            <select onDoubleClick={this.fieldDblClick} onChange={this.fieldSelectChanged} multiple="true" 
                            aria-required="true" aria-invalid="false" style={{height:'100%'}} data-index={index+1}>
                            {
                                _.map(item.outputColumnDescList, function(fieldItem, sIndex) {
                                    return (<option key={sIndex} value={fieldItem.aliasName}>{fieldItem.displayName + ' (' + fieldItem.aliasName + ')'}</option>)
                                })
                            }
                            </select>
                        </label>
                        </div>)
                }.bind(this))
            }
            </div>
            </div>
            </div>
            <div className="expression-input mt15">
                <textarea style={{height:'126px'}} ref="expressionInput" id={this.props.inputId} className="gui-textarea" placeholder={i18n.t("expression")} defaultValue={this.props.expression} onChange={this.judgeInputField}></textarea>
                <span ref="expressionHint" className="input-footer">{this.props.hint || i18n.t("double-click-generate-expression")}</span>
            </div>
            </div>
        )
    }
});

function postInput(inputNodes, inputColumnDescList, callback) {
    if(XHR) {
        XHR.abort();
        XHR = null;
    }
    var currentExpression = $('#expression-input').val();
    XHR = $.post('/modelanalysis/modeling/checkexpression', {
            expression: currentExpression,
            inputnodes: JSON.stringify(inputNodes),
            inputcolumndesclist: JSON.stringify(inputColumnDescList)
        }, callback
        , 'json')
}

module.exports.ExpressionConstructor = ExpressionConstructor;
module.exports.showExpressionDialog = function(input, callback, detail) {
    var inputColumnDescList = [];
    var inputNodes = [];
    _.each(input, function(item) {
        inputColumnDescList = _.union(inputColumnDescList, item.outputColumnDescList);
        inputNodes.push({
            nodeId: item.nodeId,
            nodeName: item.title
        });
    });
    Dialog.build({
        title: window.i18n.t("edit-expression"),
        content: '<div id="expression-content"></div>',
        style: 'lg',
        rightBtn: window.i18n.t("finish-btn"),
        leftBtn: window.i18n.t("cancel-btn"),
        rightBtnCallback: () => {
            postInput(
                inputNodes, inputColumnDescList,
                (rsp) => {
                    if (rsp.code == 0 && rsp.data.isValidate) {
                        Dialog.dismiss();
                        var outputData = _.omit(rsp.data, 'sql', 'isValidate', 'message');
                        outputData.tag = {hint: rsp.data.message};
                        outputData.columnName = rsp.data.sql || $('#expression-input').val();
                        outputData.displayName = rsp.data.message;
                        callback(outputData);
                    } else {
                        Notify.show({
                            title: rsp.data.message || rsp.message,
                            type: 'warning'
                        })
                    }
                }
            )
        }
    }).show(function() {
        ReactDOM.render(<Provider.default><ExpressionConstructor input={input} inputId={'expression-input'} 
            postInput={(callback) => postInput(inputNodes, inputColumnDescList, callback)}
            expression={detail ? detail.expression: null} hint={detail ? detail.hint : null}/></Provider.default>, $('#expression-content')[0]);
    })
}
