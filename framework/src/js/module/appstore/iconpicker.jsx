var React = require('react');
var ReactDOM = require('react-dom');
var _ = require('underscore');
var $ = require('jquery');

var ROW_NUM = 8;
var NUM_PERPAGE = ROW_NUM * ROW_NUM;

var iconset_fontawesome = {
        iconClass: 'fa',
        iconClassFix: 'fa-',
        icons: [
            'adjust',
            'anchor',
            'archive',
            'area-chart',
            'arrows',
            'arrows-h',
            'arrows-v',
            'automobile',
            'asterisk',
            'at',
            'ban',
            'bank',
            'bar-chart-o',
            'barcode',
            'bars',
            'beer',
            'bell',
            'bell-o',
            'bell-slash',
            'bell-slash-o',
            'bicycle',
            'binoculars',
            'birthday-cake',
            'bolt',
            'bomb',
            'book',
            'bookmark',
            'bookmark-o',
            'briefcase',
            'bug',
            'building',
            'building-o',
            'bullhorn',
            'bullseye',
            'bus',            
            'cab',
            'calculator',
            'calendar',
            'calendar-o',
            'camera',
            'camera-retro',
            'car',
            'caret-square-o-down',
            'caret-square-o-left',
            'caret-square-o-right',
            'caret-square-o-up',
            'cc',
            'cc-amex',
            'cc-discover',
            'cc-mastercard',
            'cc-paypal',
            'cc-stripe',
            'cc-visa',
            'certificate',
            'check',
            'check-circle',
            'check-circle-o',
            'check-square',
            'check-square-o',
            'child',
            'circle',
            'circle-o',
            'circle-thin',
            'clock-o',
            'cloud',
            'cloud-download',
            'cloud-upload',
            'code',
            'code-fork',
            'coffee',
            'cog',
            'cogs',
            'comment',
            'comment-o',
            'comments',
            'comments-o',
            'compass',
            'copyright',
            'credit-card',
            'crop',            
            'crosshairs',
            'cube',
            'cubes',
            'cutlery',
            'desktop',
            'dashboard',
            'database',
            'desktop',
            'dot-circle-o',
            'download',
            'edit',
            'ellipsis-h',
            'ellipsis-v',
            'envelope',
            'envelope-o',
            'envelope-square',
            'eraser',
            'exchange',
            'exclamation',
            'exclamation-circle',
            'exclamation-triangle',
            'external-link',
            'external-link-square',
            'eye',
            'eye-slash',
            'eyedropper',
            'fax',
            'female',
            'fighter-jet',
            'file-archive-o',
            'file-audio-o',
            'file-code-o',
            'file-excel-o',
            'file-image-o',
            'file-movie-o',
            'file-pdf-o',
            'file-photo-o',
            'file-picture-o',
            'file-powerpoint-o',
            'file-sound-o',
            'file-video-o',
            'file-word-o',
            'file-zip-o',            
            'film',
            'filter',
            'fire',
            'fire-extinguisher',
            'flag',
            'flag-checkered',
            'flag-o',
            'flash',
            'flask',
            'folder',
            'folder-o',
            'folder-open',
            'folder-open-o',
            'frown-o',
            'futbol-o',
            'gamepad',
            'gavel',
            'gear',
            'gears',
            'gift',
            'glass',
            'globe',
            'graduation-cap',
            'group',
            'hdd-o',
            'headphones',
            'heart',
            'heart-o',
            'history',
            'home',
            'image',
            'inbox',
            'info',
            'info-circle',
            'institution',
            'key',
            'keyboard-o',
            'language',
            'laptop',
            'leaf',
            'legal',
            'lemon-o',
            'level-down',
            'level-up',
            'life-bouy',
            'life-ring',
            'life-saver',
            'lightbulb-o',
            'line-chart',
            'location-arrow',
            'lock',
            'magic',
            'magnet',
            'mail-forward',
            'mail-reply',
            'mail-reply-all',
            'male',
            'map-marker',
            'meh-o',
            'microphone',
            'microphone-slash',
            'minus',
            'minus-circle',
            'minus-square',
            'minus-square-o',
            'mobile',
            'mobile-phone',
            'money',
            'moon-o',
            'mortar-board',
            'music',
            'navicon',
            'newspaper-o',
            'paint-brush',
            'paper-plane',
            'paper-plane-o',
            'paw',
            'pencil',
            'pencil-square',
            'pencil-square-o',
            'phone',
            'phone-square',
            'photo',
            'picture-o',
            'pie-chart',            
            'plane',
            'plug',
            'plus',
            'plus-circle',
            'plus-square',
            'plus-square-o',
            'power-off',
            'print',
            'puzzle-piece',
            'qrcode',
            'question',
            'question-circle',
            'quote-left',
            'quote-right',
            'random',
            'refresh',
            'reorder',
            'reply',
            'reply-all',
            'retweet',
            'road',
            'rocket',
            'rss',
            'rss-square',
            'search',
            'search-minus',
            'search-plus',
            'send',
            'send-o',
            'share',
            'share-alt',
            'share-alt-square',
            'share-square',
            'share-square-o',
            'shield',
            'shopping-cart',
            'sign-in',
            'sign-out',
            'signal',
            'sitemap',
            'sliders',
            'smile-o',
            'soccer-ball-o',
            'sort',
            'sort-alpha-asc',
            'sort-alpha-desc',
            'sort-amount-asc',
            'sort-amount-desc',
            'sort-asc',
            'sort-desc',
            'sort-down',
            'sort-numeric-asc',
            'sort-numeric-desc',
            'sort-up',
            'space-shuttle',
            'spinner',
            'spoon',
            'square',
            'square-o',
            'star',
            'star-half',
            'star-half-empty',
            'star-half-full',
            'star-half-o',
            'star-o',            
            'suitcase',
            'sun-o',            
            'support',
            'tablet',
            'tachometer',
            'tag',
            'tags',
            'tasks',
            'taxi',
            'terminal',
            'thumb-tack',
            'thumbs-down',
            'thumbs-o-down',
            'thumbs-o-up',
            'thumbs-up',
            'ticket',
            'times',
            'times-circle',
            'times-circle-o',
            'tint',
            'toggle-down',
            'toggle-left',
            'toggle-off',
            'toggle-on',                        
            'toggle-right',
            'toggle-up',
            'trash',            
            'trash-o',
            'tree',
            'trophy',
            'truck',
            'tty',                        
            'umbrella',
            'university',
            'unlock',
            'unlock-alt',
            'unsorted',
            'upload',
            'user',
            'users',
            'video-camera',
            'volume-down',
            'volume-off',
            'volume-up',
            'warning',
            'wheelchair',            
            'wifi',
            'wrench',                        
            'check-square',
            'check-square-o',
            'circle',
            'circle-o',
            'dot-circle-o',
            'minus-square',
            'minus-square-o',
            'plus-square',
            'plus-square-o',
            'square',
            'square-o',
            'bitcoin',
            'btc',
            'cny',
            'dollar',
            'eur',
            'euro',
            'gbp',
            'ils',
            'inr',
            'jpy',
            'krw',
            'money',
            'rmb',
            'rouble',
            'rub',
            'ruble',
            'rupee',
            'shekel',
            'sheqel',
            'try',
            'turkish-lira',
            'usd',
            'won',
            'yen',
            'align-center',
            'align-justify',
            'align-left',
            'align-right',
            'bold',
            'chain',
            'chain-broken',
            'clipboard',
            'columns',
            'copy',
            'cut',
            'dedent',
            'eraser',
            'file',
            'file-o',
            'file-text',
            'file-text-o',
            'files-o',
            'floppy-o',
            'font',
            'header',
            'indent',
            'italic',
            'link',
            'list',
            'list-alt',
            'list-ol',
            'list-ul',
            'outdent',
            'paperclip',
            'paragraph',
            'paste',
            'repeat',
            'rotate-left',
            'rotate-right',
            'save',
            'scissors',
            'strikethrough',
            'subscript',
            'superscript',
            'table',
            'text-height',
            'text-width',
            'th',
            'th-large',
            'th-list',
            'underline',
            'undo',
            'unlink',
            'angle-double-down',
            'angle-double-left',
            'angle-double-right',
            'angle-double-up',
            'angle-down',
            'angle-left',
            'angle-right',
            'angle-up',
            'arrow-circle-down',
            'arrow-circle-left',
            'arrow-circle-o-down',
            'arrow-circle-o-left',
            'arrow-circle-o-right',
            'arrow-circle-o-up',
            'arrow-circle-right',
            'arrow-circle-up',
            'arrow-down',
            'arrow-left',
            'arrow-right',
            'arrow-up',
            'arrows',
            'arrows-alt',
            'arrows-h',
            'arrows-v',
            'caret-down',
            'caret-left',
            'caret-right',
            'caret-square-o-down',
            'caret-square-o-left',
            'caret-square-o-right',
            'caret-square-o-up',
            'caret-up',
            'chevron-circle-down',
            'chevron-circle-left',
            'chevron-circle-right',
            'chevron-circle-up',
            'chevron-down',
            'chevron-left',
            'chevron-right',
            'chevron-up',
            'hand-o-down',
            'hand-o-left',
            'hand-o-right',
            'hand-o-up',
            'long-arrow-down',
            'long-arrow-left',
            'long-arrow-right',
            'long-arrow-up',
            'toggle-down',
            'toggle-left',
            'toggle-right',
            'toggle-up',
            'arrows-alt',
            'backward',
            'compress',
            'eject',
            'expand',
            'fast-backward',
            'fast-forward',
            'forward',
            'pause',
            'play',
            'play-circle',
            'play-circle-o',
            'step-backward',
            'step-forward',
            'stop',
            'youtube-play',
            'adn',
            'android',
            'angellist',
            'apple',
            'behance',
            'behance-square',
            'bitbucket',
            'bitbucket-square',
            'bitcoin',
            'btc',
            'css3',
            'delicious',
            'digg',
            'dribbble',
            'dropbox',
            'drupal',
            'empire',
            'facebook',
            'facebook-square',
            'flickr',
            'foursquare',
            'ge',
            'git',
            'git-square',
            'github',
            'github-alt',
            'github-square',
            'gittip',
            'google',
            'google-plus',
            'google-plus-square',
            'google-wallet',
            'hacker-news',
            'html5',
            'instagram',
            'ioxhost',            
            'joomla',
            'jsfiddle',
            'lastfm',
            'lastfm-square',
            'linkedin',
            'linkedin-square',
            'linux',
            'maxcdn',
            'meanpath',
            'openid',
            'pagelines',
            'paypal',
            'pied-piper',
            'pied-piper-alt',
            'pinterest',
            'pinterest-square',
            'qq',
            'ra',
            'rebel',
            'reddit',
            'reddit-square',
            'renren',
            'share-alt',
            'share-alt-square',
            'skype',
            'slack',
            'slideshare',
            'soundcloud',
            'spotify',
            'stack-exchange',
            'stack-overflow',
            'steam',
            'steam-square',
            'stumbleupon',
            'stumbleupon-circle',
            'tencent-weibo',
            'trello',
            'tumblr',
            'tumblr-square',
            'twitch',            
            'twitter',
            'twitter-square',
            'vimeo-square',
            'vine',
            'vk',
            'wechat',
            'weibo',
            'weixin',
            'windows',
            'wordpress',
            'xing',
            'xing-square',
            'yahoo',
            'yelp',
            'youtube',
            'youtube-play',
            'youtube-square',
            'ambulance',
            'h-square',
            'hospital-o',
            'medkit',
            'plus-square',
            'stethoscope',
            'user-md',
            'wheelchair'
        ]};

var totalNum = iconset_fontawesome.icons.length;
var totalPages;
var iconSelected = iconset_fontawesome.iconClass + " " + iconset_fontawesome.iconClassFix + iconset_fontawesome.icons[0];

var IconPicker = React.createClass({
	getInitialState: function() {
	    return {
	         selectedIcon: this.props.icon != ""? this.props.icon.substring(6): iconset_fontawesome.icons[0],
	         currentPage: this.props.icon != ""? Math.ceil((iconset_fontawesome.icons.indexOf(this.props.icon.substring(6)) + 1) / this.props.numOfRow): 1,
	         display: "none"
	    };
	},
      componentWillReceiveProps: function(nextProps) {
            if(nextProps.icon){
                  this.setState({
                        selectedIcon: nextProps.icon.substring(6),
                        currentPage: Math.ceil((iconset_fontawesome.icons.indexOf(nextProps.icon.substring(6)) + 1) / nextProps.numOfRow)
                  })   
            }
      },
	onLeftBtnClicked: function(e) {
		this.setState({currentPage: this.state.currentPage - 1});
	},
	onRightBtnClicked: function(e) {
		this.setState({currentPage: this.state.currentPage + 1});
	},
	onIconClicked: function(e) {
            iconSelected = iconset_fontawesome.iconClass + " " + iconset_fontawesome.iconClassFix + e.target.value;
		this.setState({
			selectedIcon: e.target.value,
			display: "none"
		});
	},
	onSelectBtnClicked: function(e) {
		var index = iconset_fontawesome.icons.indexOf(this.state.selectedIcon);
		this.setState({
			display: this.state.display === "block" ? "none" : "block",
			currentPage: Math.ceil((index + 1) / NUM_PERPAGE)
		})
	},
	handleClose: function(e) {
		this.setState({display: 'none'});
	},
	render: function() {
            ROW_NUM = this.props.numOfRow;
            NUM_PERPAGE = ROW_NUM * ROW_NUM;
            totalPages = Math.ceil(totalNum / NUM_PERPAGE);

            if(ROW_NUM == 4) {
                  var leftPosition = "-70px";
            } else {
                  var leftPosition = "-153px";
            }
            
            var currentPage = this.state.currentPage;
            var iconSet = [];

            var startIndex = (currentPage - 1) * NUM_PERPAGE;
            for(let i = 1; i <= ROW_NUM; i++) {
                  if(startIndex + i * ROW_NUM > totalNum) { 
                        iconSet.push(iconset_fontawesome.icons.slice(startIndex + (i - 1) * ROW_NUM, totalNum));
                        break;
                  } else {
                        iconSet.push(iconset_fontawesome.icons.slice(startIndex + (i - 1) * ROW_NUM, startIndex + i * ROW_NUM));
                  }
            }
		if(this.state.currentPage == 1) {
			var leftBtn = (
				<button className="btn btn-arrow btn-previous btn-primary disabled" type="button" style={{minHeight: '30px',minWidth: '35px',padding: '0px', margin: '2px'}}>
					<span className="glyphicon glyphicon-arrow-left"/>
				</button>
			)
		} else {
			var leftBtn = (
				<button className="btn btn-arrow btn-previous btn-primary" onClick={this.onLeftBtnClicked} type="button" style={{minHeight: '30px',minWidth: '35px',padding: '0px', margin: '2px'}}>
					<span className="glyphicon glyphicon-arrow-left"/>
				</button>
			)
		}
		if(this.state.currentPage == totalPages) {
			var rightBtn = (
				<button className="btn btn-arrow btn-previous btn-primary disabled" type="button" style={{minHeight: '30px',minWidth: '35px',padding: '0px', margin: '2px'}}>
					<span className="glyphicon glyphicon-arrow-right"/>
				</button>
			)
		} else {
			var rightBtn = (
				<button className="btn btn-arrow btn-previous btn-primary" onClick={this.onRightBtnClicked} type="button" style={{minHeight: '30px',minWidth: '35px',padding: '0px', margin: '2px'}}>
					<span className="glyphicon glyphicon-arrow-right"/>
				</button>
			)
		}
		return (
			<div style={{position:'absolute'}}>
				<button className="btn btn-default" onClick={this.onSelectBtnClicked} type="button" style={{padding: '6px 12px',marginTop: '5px',borderRadius: '4px', borderSytle: 'solid',borderWidth: '1px'}}>
					<i className={iconset_fontawesome.iconClass + " " + iconset_fontawesome.iconClassFix + this.state.selectedIcon}></i>
					<span className="caret" style={{marginLeft: '10px'}}></span>
				</button>
				<div className="popover bottom in" style={{maxWidth: '500px', position:'relative', top:'0px', left:leftPosition, display: this.state.display}}>
					<div style={{position: 'fixed',top: '0',right: '0',left: '0',bottom: '0',zIndex: '0'}} onClick={this.handleClose}/>
					<div className="arrow"></div>
					<div className="popover-content" style={{position: 'relative',zIndex: '1'}}>
						<table>
							<thead>
								<tr>
									<td className="text-center">
										{leftBtn}
									</td>
									<td className="text-center" colSpan={ROW_NUM - 2}>
										<span className="page-count">{this.state.currentPage} / {totalPages}</span>
									</td>
									<td className="text-center">
										{rightBtn}
									</td>
								</tr>
							</thead>
							<tbody>
                                                {
                                                      _.map(iconSet, _.bind(function (info) {
                                                            return(
                                                                  <tr>
                                                                        {
                                                                              _.map(info, _.bind(function (icon){
                                                                                    if(icon == this.state.selectedIcon){
                                                                                          return(
                                                                                                <td>
                                                                                                      <button className="btn btn-default btn-icon" type="button" value={icon} style={{display: 'inlineBlock',backgroundColor: 'orange'}} onClick={this.onIconClicked}>
                                                                                                            <i className={iconset_fontawesome.iconClass + " " + iconset_fontawesome.iconClassFix + icon + " " + "fa-inverse"} style={{width: '15px', height: '15px'}} value={icon}/>
                                                                                                      </button>
                                                                                                </td>
                                                                                          )
                                                                                    } else {
                                                                                          return(
                                                                                                <td>
                                                                                                      <button className="btn btn-default btn-icon" type="button" value={icon} style={{display: 'inlineBlock'}} onClick={this.onIconClicked}>
                                                                                                            <i className={iconset_fontawesome.iconClass + " " + iconset_fontawesome.iconClassFix + icon} style={{width: '15px', height: '15px'}} value={icon}/>
                                                                                                      </button>
                                                                                                </td>
                                                                                          )
                                                                                    }
                                                                              },this))
                                                                        }
                                                                  </tr>
                                                            )  
                                                      },this))
                                                }
							</tbody>
						</table>
					</div>
				</div>
			</div>
			)
	}
});

module.exports.getSelectedIcon = function() {
	return iconSelected;
};

module.exports.IconPicker = IconPicker;