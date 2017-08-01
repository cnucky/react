import React from 'react';
import DataSetting from './bi-setting-data';
import StyleSetting from './bi-setting-style';
import {CrossTableSetting,CommonTableSetting,BarSetting,LineSetting,PieSetting,RadarSetting,BubbleSetting,WordCloudSetting,MapSetting,ScatterSetting} from './bi-setting-charts';

class ComponentSetting extends React.Component {
    constructor(props) {
        super(props);
        this.displayName = 'ComponentSetting';
    }

    render() {
        var compo = <LineSetting/>;
        switch(this.props.component.chartType){
            case 'LINE':
            case 'AREALINE':
                compo = <LineSetting com = {this.props.component} id = {this.props.component.id}/>;
                break;
            case 'BAR':
            case 'HORIZONTALBAR':
                compo = <BarSetting com = {this.props.component} id = {this.props.component.id}/>;
                break;
            case 'RADAR':
                compo = <RadarSetting com = {this.props.component} id = {this.props.component.id}/>;
                break;
            case 'BUBBLE':
                compo = <BubbleSetting com = {this.props.component} id = {this.props.component.id}/>;
                break;
            case 'WORDCLOUD':
                compo = <WordCloudSetting com = {this.props.component} id = {this.props.component.id}/>;
                break;
            case 'PIE':
                compo = <PieSetting com = {this.props.component} id = {this.props.component.id}/>;
                break;
            case 'MAP':
                compo = <MapSetting com = {this.props.component} id = {this.props.component.id}/>;
                break;
            case 'SCATTER':
                compo = <ScatterSetting com = {this.props.component} id = {this.props.component.id}/>;
                break;
            case 'COMMONTABLE':
                compo = <CommonTableSetting com = {this.props.component} id = {this.props.component.id}/>;
                break;
            case 'CROSSTABLE':
                compo = <CrossTableSetting com = {this.props.component} id = {this.props.component.id}/>;
                break;
            // case 'TREE':
            //     compo = <TreeSetting com = {this.props.component} id = {this.props.component.id}/>;
            //     break;
        }

        return (
            <div className="panel mbn flex-layout flex-vertical" style={{height: '100%'}}>
                <div className="panel-heading" style={{ height: '42px', lineHeight: '42px' }}>
                    <ul className="nav panel-tabs panel-tabs-left" style={{ height: '42px' }}>
                        <li className="active" style={{ height: '42px', width: "50%", textAlign: "center" }}>
                            <a href="#tab-data" data-toggle="tab" aria-expanded="true" className="fs15 fw600" style={{ height: '43px' }}>数据</a>
                        </li>
                        <li style={{ height: '42px', width: "50%", textAlign: "center" }}>
                            <a href="#tab-style" data-toggle="tab" aria-expanded="false" className="fs15 fw600" style={{ height: '43px' }}>样式</a>
                        </li>
                    </ul>
                </div>

                <div className="panel-body flex-item" style={{overflowY: 'auto'}}>
                    <div className="tab-content pn br-n">
                        <div id="tab-data" className="tab-pane active">
                            <form className="form-horizontal" role="form">
                                <DataSetting com={this.props.component} id={this.props.component.id} />
                            </form>
                        </div>

                        <div id="tab-style" className="tab-pane">
                            <form className="form-horizontal" role="form">
                                <StyleSetting com={this.props.component} id={this.props.component.id}/>
                                <hr className="alt short"/>
                                {compo}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default ComponentSetting;
