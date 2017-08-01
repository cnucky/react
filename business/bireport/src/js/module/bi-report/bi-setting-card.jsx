var React = require('react');
var MultiSelect = require('widget/multiselect');
import {store} from './store';
import Notify from 'nova-notify';

class SettingList extends React.Component {
    constructor(props) {
        super(props);
        this.displayName = 'CardSetting';
        this.chooseTheme = "none";
    }
	widthTypeSelectedChange(e) {
		store.dispatch({ type:'UPDATE_CARD', widthType:e.target.value });
	}

	widthValChange(e) {
		store.dispatch({ type:'UPDATE_CARD', width:e.target.value });
	}

	nameChange(e) {
		store.dispatch({ type:'UPDATE_CARD', name:e.target.value });
	}

	nameSelectedChange(e) {
		store.dispatch({ type:'UPDATE_CARD', showName:e.target.checked });
	}

	paddingSelectedChange(e) {
		store.dispatch({ type:'UPDATE_CARD', showPadding:e.target.checked });
	}

	paddingValChange(e) {
		let value = e.target.value;
		if(value >= 0 && value <= 20)
			store.dispatch({ type:'UPDATE_CARD', padding:value });
		else {
			store.dispatch({ type:'UPDATE_CARD', padding:10 });			
			Notify.simpleNotify("边距输入不合法", "请输入0~20之间的数字", 'error');
		}
	}

	themeChange(option) {
		this.chooseTheme = option;
        store.dispatch({ type: 'UPDATE_CARD', theme: option});
    }

	commentsChange(e) {
		store.dispatch({ type:'UPDATE_CARD', comments:e.target.value });
	}

    render() {
		var card = this.props.card;
		var theme = card.theme;
		this.chooseTheme = theme;
		var configType = {
            disableIfEmpty: false,
            enableFiltering: false,
            buttonClass: 'multiselect dropdown-toggle btn btn-info fw600 fs13 mnw50',
            buttonWidth: '100%'
        };

		var themeList = [
            {
                label: "默认",
                value: 'none',
                selected: theme == 'none',
                img:'/bireport/img/shine.png'
            },
             {
                label: "怀旧",
                value: 'vintage',
                selected: theme == 'vintage',
                img:'/bireport/img/vintage.png'
            }
            , {
                label: "黑暗",
                value: 'dark',
                selected: theme == 'dark',
                img:'/bireport/img/dark.png'
            }
            , {
                label: "甜美",
                value: 'macarons',
                selected: theme == 'macarons',
                img:'/bireport/img/macarons.png'
            }
            , {
                label: "明亮",
                value: 'infographic',
                selected: theme == 'infographic',
                img:'/bireport/img/infographic.png'
            }
         	// , {
          //       label: "阳光",
          //       value: 'shine',
          //       selected: theme == 'shine',
          //       img:'/bireport/img/shine.png'
          //   }
            , {
                label: "青春",
                value: 'roma',
                selected: theme == 'roma',
                img:'/bireport/img/roma.png'
            }
			
        ];

        return (
            <form className="form-horizontal" role="form">
				<div className="radio row mh10 lh30">
					<label className="col-md-4 control-label pn ml30" style={{textAlign:'left'}}>
						<input type="radio" name="widthtype" style={{marginTop: '9px'}} value="fix" checked={card.widthType === 'fix'} onChange={this.widthTypeSelectedChange} />自适应
					</label>
				</div>
				<div className="radio row mh10 lh30">
					<label className="col-md-4 control-label pn ml30" style={{textAlign:'left'}}>
						<input type="radio" name="widthtype" style={{marginTop: '9px'}} value="define" checked={card.widthType === 'define'} onChange={this.widthTypeSelectedChange} />自定义宽度
					</label>
					<span className="input-group input-group-sm col-md-6">
						<input className="form-control" type="number" min="0" value={card.width} onChange={this.widthValChange} />
						<span className="input-group-addon">像素</span>
					</span>
				</div>
                <hr className="alt short"/>

                <div className="checkbox row mh10 lh30">
					<label className="col-md-4 control-label pn ml30" style={{textAlign:'left'}}>
						<input type="checkbox" style={{marginTop: '9px'}} checked={card.showName} onChange={this.nameSelectedChange} />显示标题
						<span style={{color:'red',marginLeft:'5px'}}>*</span>
					</label>
					<span className="input-group input-group-sm col-md-6">
						<input className="form-control input-sm" type="text" value={card.name} onChange={this.nameChange} />
					</span>
				</div>
				<div className="checkbox row mh10 lh30">
					<label className="col-md-4 control-label pn ml30" style={{textAlign:'left'}}>
						<input type="checkbox" style={{marginTop: '9px'}} checked={card.showPadding} onChange={this.paddingSelectedChange} />显示边距
					</label>
					<span className="input-group input-group-sm col-md-6">
						<input className="form-control" type="number" min="0" max="20" value={card.padding} onChange={this.paddingValChange} />
						<span className="input-group-addon">像素</span>
					</span>
  				</div>
				<div className="checkbox row mh10 lh30">
					<label className="control-label pn ml30" style={{textAlign:'left'}}>
						配色主题
					</label>
					<section className="themes">
						<ul style={{width:'220px'}}>
							{ _.map(themeList,function(theme,id)
								{
									return(
									<li>										
										<img src={theme.img} onClick={this.themeChange.bind(this,theme.value)} className={theme.value == this.chooseTheme ? "imgChoose" : ""}/>
										<div>{theme.label}</div>
										
									</li>
									)
								},this)
							}
							
						</ul>
					</section>
				</div>
				<hr className="alt short"/>

				<div className="row mh20 lh30">
					<label className='control-label' for="report-comments">报表描述</label>
				</div>
				<div className="row mh20 lh30">
					<textarea id="report-comments" className="form-control" rows="3" value={card.comments} onChange={this.commentsChange}></textarea>
				</div>
			</form>
		);
    }
}

var CardSetting = React.createClass({
	
	propTypes: {
		card: React.PropTypes.object.isRequired
	},

	render: function() {
		return (
			<div className="panel mbn flex-layout flex-vertical" style={{height: '100%'}}>
				<div className="panel-heading text-center" style={{height: '42px', lineHeight: '42px'}}>
					<span className="fs15 fw600">画布</span>
				</div>

				<div className="panel-body flex-item" style={{overflowY: 'auto'}}>
					<div id='tab-setting' className="pn br-n">
						<SettingList card={this.props.card} />
					</div>
				</div>
			</div>
		);
	}
});

module.exports = CardSetting;

