/**
 * Created by root on 10/9/16.
 */


/*	libraries	*/
const React = require('react');
const ReactDOM = require('react-dom');
const $ = require('jquery');
const _ = require('underscore');
const Q = require('q');
const Notify = require('nova-notify');

require('module/config-center/css/component.css');
require('module/config-center/css/demo.css');
require('module/config-center/css/normalize.css');
require('module/config-center/css/style.css');

/*	services	*/
import {getPermissions} from '../../module/config-center/services.jsx';

/*  sub-module  */
import {ConfCenterMenu} from '../../module/config-center/conf-center-menu.jsx';
import {ConfCenterContent} from '../../module/config-center/conf-center-content.jsx';

/*	functions	*/

import {systemComfigFunction} from '../../module/config-center/functions/system-config/system-config.jsx';
import {smartqueryConfigFunction} from '../../module/config-center/functions/smartquery-config/smartquery-config.jsx';
import {gisConfigFunction} from '../../module/config-center/functions/gis-config/gis-config.jsx';
import {codeTableManageFunction} from '../../module/config-center/functions/codetable-manage/codetable-manage.jsx';

//定义所有功能以及默认render的组件功能
let configFunctions = {
	defaultFunction : systemComfigFunction,
	systemComfigFunction,
	smartqueryConfigFunction,
	gisConfigFunction,
    codeTableManageFunction
};


const ConfCenterComponent = React.createClass  ({

  render() {
    return (
      	<div className='st-container' id='st-container'>
      		<ConfCenterMenu configFunctions={this.props.configFunctions} onSwitchFunction={this.handleSwitchFunction}/>
        	<ConfCenterContent currentFunction={this.state.currentFunction}/>
      	</div>
    );
  },
  
  getInitialState: function() {

		return {
			currentFunction:this.props.configFunctions.defaultFunction
		};
	},

  componentDidMount() {
  		const containerHeight =  window.innerHeight - $('#st-container').offset().top;
    	$('#st-container').css({'min-height':containerHeight+'px'});

  },

  handleSwitchFunction(event){
  	const functionKey = event.target.dataset.functionkey;
  	for(let key in configFunctions){
  		if(configFunctions[key].key == functionKey){
  			// const currentFunction = configFunctions[key]
  			this.setState({currentFunction:configFunctions[key]})
  			break;
  		}
  	}
  }

})


function init(){

	ReactDOM.render(<ConfCenterComponent configFunctions={configFunctions}  />, document.getElementById('rootContainer'));
	initLocales();
	hideLoader();
}





init();