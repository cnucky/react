const React = require('react');
const ReactDOM = require('react-dom');
const _ = require('underscore');
const $ = require('jquery');


const ConfCenterMenu = React.createClass ({
  render() {
  	const configFunctions = this.props.configFunctions;
  	let links = [];
  	for (let key in configFunctions){
  		if(key != 'defaultFunction'){
  			let link = (
  			<li><a className="icon icon-data" href="#" onClick={this.props.onSwitchFunction} data-functionkey={configFunctions[key].key}>{configFunctions[key].componentDisplayName}</a></li>
  			);
  			links.push(link);
  		}
  	}
  	// configFunctions.map((v,i,a) => {

  	// 	return (
  	// 		<li><a className="icon icon-data" href="#" onClick={this.props.onSwitchFunction} data-function="shimima">{v.componentDisplayName}</a></li>
  	// 	);
  	// });



    return (
      <nav className="st-menu st-effect-11" id="menu-11">
			<h2 className="icon icon-lab">Sidebar</h2>
			<ul>
				{links}

			</ul>
	  </nav>
    );
  }
  


});

module.exports.ConfCenterMenu = ConfCenterMenu;