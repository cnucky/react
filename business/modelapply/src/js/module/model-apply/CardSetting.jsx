var React = require('react');
var _ = require('underscore');
import { Card } from 'antd';
import { ChromePicker } from 'react-color'
var store = require('./model-apply-store');
var Theme = require('./Theme');

//view | CardSetting
var CardSample = React.createClass({
    propTypes: {
        theme: React.PropTypes.object.isRequired,
        isSelected: React.PropTypes.bool.isRequired,
        index: React.PropTypes.number.isRequired
    },

    cardClick: function() {
        store.dispatch({
            type: 'SELECT_CARD_SAMPLE',
            index: this.props.index,
            titleBackgroundColor: this.props.theme.titleBackgroundColor,
            titleContentColor: this.props.theme.titleContentColor,
            bodyBackgroundColor: this.props.theme.bodyBackgroundColor,
            bodyContentColor: this.props.theme.bodyContentColor
        });
    },

    render: function() {

        var theme = this.props.theme;
        var classStr = "";
        if(this.props.isSelected)
            classStr = "active";

        return (
            <Card className={classStr} onClick={this.cardClick} title={<label className='card-sample-title' style={{background: theme.titleBackgroundColor, color: theme.titleContentColor}}>表单</label>} 
                    style={{ width: '100%', background: theme.titleBackgroundColor }} 
                    bodyStyle={{background: theme.bodyBackgroundColor}}>
                <p className='card-sample-content' style={{color: theme.bodyContentColor}}>██████　███████████████████</p>
                <p className='card-sample-content' style={{color: theme.bodyContentColor}}>█████　██████　█████████████</p>
            </Card>
        );
    }
});

var ColorPicker = React.createClass({
    propTypes: {
        title: React.PropTypes.string,
        color: React.PropTypes.string
    },

    getInitialState: function() {
        return { displayColorPicker: false };
    },

    handleClick: function() {
        this.state.displayColorPicker = !this.state.displayColorPicker;
        this.setState(this.state);
    },

    handleClose: function() {
        this.state.displayColorPicker = false;
        this.setState(this.state);
    },

    handleChange: function(color) {
        switch(this.props.title) {
            case '表头底色':
                store.dispatch({
                    type: "CHANGE_CARD_STYLE",
                    titleBackgroundColor: color.hex
                });
                break;
            case '表头文字':
                store.dispatch({
                    type: "CHANGE_CARD_STYLE",
                    titleContentColor: color.hex
                });
                break;
            case '内容底色':
                store.dispatch({
                    type: "CHANGE_CARD_STYLE",
                    bodyBackgroundColor: color.hex
                });
                break;
            case '内容文字':
                store.dispatch({
                    type: "CHANGE_CARD_STYLE",
                    bodyContentColor: color.hex
                });
                break;
        }
    },

    render: function() {
        var title = this.props.title;
        var color = this.props.color;
        var alignLeft = this.props.alignLeft;

        const cover = {
            position: 'fixed',
            top: '0',
            right: '0',
            bottom: '0',
            left: '0'
        };
        const popoverRight = {
            position: 'absolute',
            zIndex: '2',
            bottom: '50px',
            right: '-22px'
        };
        const popoverLeft={
            position: 'absolute',
            zIndex: '2',
            bottom: '50px',
            left: '-24px'
        };
        var colorPickerPanel =  (
            <div>   
                <div style={ alignLeft ? popoverLeft : popoverRight }>
                    <div style={ cover } onClick={ this.handleClose } />
                    <ChromePicker color={color} onChange={ this.handleChange }/>
                </div>
            </div>);

        return (
            <div>
                <a onClick={this.handleClick}>
                    <div style={{border: '1px solid #d4d4d4', borderRadius: '5px'}}>
                        <div style={{ color: 'black',  textAlign: 'center' }}> {title} </div>
                        <div style={{ background: color, margin: '1px', height: '20px', border: '1px solid #d4d4d4', borderRadius: '5px' }}></div>
                    </div>
                </a>
                { this.state.displayColorPicker && colorPickerPanel }
            </div>
        );
    }
});


var CardSetting = React.createClass({

    propTypes: {
        card: React.PropTypes.object.isRequired
    },

    titleChange: function(event) {
        store.dispatch({
            type: 'CHANGE_CARD_STYLE',
            title: event.target.value
        });
    },
    describe: function(event) {

        store.dispatch({
            type: 'CHANGE_CARD_STYLE',
            describe: event.target.value
        });
    },

    titleFontSizeChange: function(event) {
        store.dispatch({
            type: 'CHANGE_CARD_STYLE',
            titleFontSize: event.target.value
        });
    },

    bodyFontSizeChange: function(event) {
        store.dispatch({
            type: 'CHANGE_CARD_STYLE',
            bodyFontSize: event.target.value
        });
    }, 

    cardWidthChange: function(event) {
        store.dispatch({
            type: 'CHANGE_CARD_STYLE',
            cardWidth: event.target.value
        });
    },

    render: function() {

        var title = this.props.title;
        var describe = this.props.describe;
        var themes = [Theme.Theme1, Theme.Theme2, Theme.Theme3];
        var sampleCards = this.props.card.sampleCards;
        var titleBackgroundColor = this.props.card.titleBackgroundColor;
        var titleContentColor = this.props.card.titleContentColor;
        var bodyBackgroundColor = this.props.card.bodyBackgroundColor;
        var bodyContentColor = this.props.card.bodyContentColor;
        var titleFontSize = this.props.card.titleFontSize;
        var bodyFontSize = this.props.card.bodyFontSize;
        var cardWidth = this.props.card.cardWidth;

        return (
            <form class="form-horizontal" role="form">
                <div className='ml20 mr20'>
                    <div className='row'>
                        <label className='control-label' for='title'>应用名称 <span style={{color:'red',marginLeft:'5px'}}>*</span></label>
                    </div>
                    <div className='row'>
                            <input type='text' className='form-control' id='title' onChange={this.titleChange} value={title} />
                    </div>
                </div>

                <div className='ml20 mr20 mt20'>
                    <div className='row'>
                        <label className='control-label' for='title'>模型描述</label>
                    </div>
                    <div className='row'>
                        <textarea className="form-control"  rows="3" onChange={this.describe} value={describe}></textarea>
                    </div>
                </div>

                <div className='ml20 mr20 mt20'>
                    <div className='row'>
                        <label className='control-label'>主题</label>
                    </div>            
                    {
                        _.map(themes, function(theme, index) {
                                return (
                                    <div className='row mt10'>
                                        <CardSample theme={themes[index]} isSelected={sampleCards[index].isSelected} index={index} />
                                    </div>
                                );
                            } 
                        )
                    }
                </div>

                <div className='ml20 mr20 mt20'>
                    <div className='row'>
                        <label className='control-label'>自定义颜色</label>
                    </div>   
                    <div className="row">
                        <div className="col-md-6"><ColorPicker title="表头底色" alignLeft={true} color={titleBackgroundColor} /></div>
                        <div className="col-md-6"><ColorPicker title="表头文字" alignLeft={false} color={titleContentColor} /></div>
                    </div>  
                    <div className="row mt10">                                 
                        <div className="col-md-6"><ColorPicker title="内容底色" alignLeft={true} color={bodyBackgroundColor} /></div>
                        <div className="col-md-6"><ColorPicker title="内容文字" alignLeft={false} color={bodyContentColor} /></div>
                    </div>
                </div>

                <div className='mt20 ml20 mr20'>
                    <div className='row'>
                        <label className='control-label'>表头字号</label>
                    </div>
                    <div className='row'>
                        <div className="col-md-4 prn">
                            <label className="radio-inline">
                                <input type="radio" checked={ titleFontSize == Theme.SmallTitleSize} name="titleFontSize" onChange={this.titleFontSizeChange} value={Theme.SmallTitleSize} /> 较小
                            </label>
                        </div>
                        <div className="col-md-4 prn">
                            <label className="radio-inline">
                                <input type="radio" checked={ titleFontSize == Theme.MediumTitleSize} name="titleFontSize" onChange={this.titleFontSizeChange} value={Theme.MediumTitleSize} /> 中等
                            </label>
                        </div>
                        <div className="col-md-4 prn">
                            <label className="radio-inline">
                                <input type="radio" checked={ titleFontSize == Theme.BigTitleSize} name="titleFontSize" onChange={this.titleFontSizeChange} value={Theme.BigTitleSize} /> 较大
                            </label>
                        </div>
                    </div>                    
                </div>

                <div className='mt20 ml20 mr20'>
                    <div className='row'>
                        <label className='control-label'>内容字号</label>
                    </div>
                    <div className='row'>
                        <div className="col-md-4 prn">
                            <label className="radio-inline">
                                <input type="radio" checked={ bodyFontSize == Theme.SmallContentSize } name="bodyFontSize" onChange={this.bodyFontSizeChange} value={Theme.SmallContentSize} /> 较小
                            </label>
                        </div>
                        <div className="col-md-4 prn">
                            <label className="radio-inline">
                                <input type="radio" checked={ bodyFontSize == Theme.MediumContentSize } name="bodyFontSize" onChange={this.bodyFontSizeChange} value={Theme.MediumContentSize} /> 中等
                            </label>
                        </div>
                        <div className="col-md-4 prn">
                            <label className="radio-inline">
                                <input type="radio" checked={ bodyFontSize == Theme.BigContentSize } name="bodyFontSize" onChange={this.bodyFontSizeChange} value={Theme.BigContentSize} /> 较大
                            </label>
                        </div>
                    </div>                    
                </div>              

                <div className='mt20 ml20 mr20'>
                    <div className='row'>
                        <label className='control-label'>表单宽度</label>
                    </div>
                    <div className='row'>
                        <div className="col-md-4 prn">
                            <label className="radio-inline">
                                <input type="radio" checked={ cardWidth == Theme.SmallCardWidth } name="tableWidth" onChange={this.cardWidthChange} value={Theme.SmallCardWidth} /> 较窄
                            </label>
                        </div>
                        <div className="col-md-4 prn">
                            <label className="radio-inline">
                                <input type="radio" checked={ cardWidth == Theme.MediumCardWidth } name="tableWidth" onChange={this.cardWidthChange} value={Theme.MediumCardWidth} /> 普通
                            </label>
                        </div>
                        <div className="col-md-4 prn">
                            <label className="radio-inline">
                                <input type="radio" checked={ cardWidth == Theme.BigCardWidth } name="tableWidth" onChange={this.cardWidthChange} value={Theme.BigCardWidth} /> 较宽
                            </label>
                        </div>
                    </div>                    
                </div>              
            </form>
        );
    }
});

module.exports = CardSetting;