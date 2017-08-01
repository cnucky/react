var React = require('react');
var CardSetting = require('./bi-setting-card');
import ComponentSetting from './bi-setting-component';
import LayoutSetting from './bi-setting-layout.jsx';
import {store} from './store';

/**
 *设置面板
 */
class SettingPanel extends React.Component {
  constructor(props) {
        super(props);
        this.displayName = 'SettingPanel';
    }
    /**
     * 自动刷新
     * @return {[type]} [description]
     */
    componentDidMount() {
        this.unsubscribe = store.subscribe(() => {
            this.forceUpdate();
        })
    }

    componentWillUnmount() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }

    render() {
        var data = store.getState();
        var panel;
        
        /** 根据selected属性确定右侧面版 */
        var card = data.card;
        if(card.isSelected)
            panel = (<CardSetting card={card} />);
        else {
            var component = _.find(data.charts, _.bind(function(component) {
                return component.isSelected;
            }, this));
            var layout = _.find(data.layouts, _.bind(function(layout) {
                return layout.isSelected;
            }, this));

            if(!_.isUndefined(layout))
                panel = (<LayoutSetting layout={layout} />);
            else if(!_.isUndefined(component)) 
                panel = (<ComponentSetting component={component} />);
        }
        
        return (
             <div style={{ height: '100%' }}>{ panel }</div>
        );
    }
}

module.exports = SettingPanel;
