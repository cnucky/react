var React = require('react');
var ReactDOM = require('react-dom');
import { CONFIG } from './test_data';

class Test  extends React.Component {

	render () {
        return (
          <div className="url_wrap">
              <ul className="url_content">
                {_.map(CONFIG, function(configItem) {
                 	return (
      	             	<li className="list_li">
      	                	<a href={configItem.url} className="clear url_text">
	      	             	    <span className={configItem.icon}></span>
      	                    	{configItem.name}
      	  					</a>
      					</li>
      				)
  				}, this)}
              </ul>
          </div>
        )
	}

}

ReactDOM.render(<Test />, document.getElementById('test-content'));
hideLoader();