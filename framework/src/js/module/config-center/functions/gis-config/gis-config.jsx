const React = require('react');
const ReactDOM = require('react-dom');

import {gisConfigInit} from './page.jsx';
// import {smartqueryConfig as smartqueryConfigInit} from './page.jsx';

require('./style.css');




const gisConfigComponent = React.createClass  ({
  render() {
    return (
      <div>

        <section id="content" className="table-layout">
    <aside className="tray tray-left tray270 pn" data-tray-height="match">
        <div className="panel mbn flex-layout flex-vertical">
            <div className="row mt10 mln mrn">
                <div className="col-xs-8">
                    <input className="form-control input-sm" name="search-input" placeholder="过滤..." />
                </div>
                <div className="col-xs-4">
                    <button type="button" className="btn btn-primary btn-sm" id="btn-reset">清除
                        <span id="matches"></span>
                    </button>
                </div>
            </div>
            <div id="dir-tree-panel" className="panel-body flex-item" style={{border: "none"}}>
                <div id="data-tree" className="dir-tree tab-pane active">
                </div>
            </div>
        </div>
    </aside>
    <div className="tray tray-center pn">
        <div className="panel flex-layout flex-vertical" style={{position:"relative", width: "100%"}}>
            <div id="actionContent"></div>
        </div>
    </div>
</section>

      </div>
    );
  },
  componentDidMount() {
    const containerHeight =  window.innerHeight - $('#st-container').offset().top;
    $('#content').css({'min-height':containerHeight+'px'});   
    gisConfigInit();
  }

})

const gisConfigFunction = {
    component:gisConfigComponent,
    componentDisplayName: 'gis配置',
    key:'gisConfigComponent'
};

export {gisConfigFunction};