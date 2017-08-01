import React from 'react';
require('../../module/renlifang/styles.less');
import { Tooltip, Row, Col} from 'antd';

const ROW_HEIGHT = 38;
import appConfig from '../../../../config'


var RTDEF = {
    'DEFAULT': 0, //两者都没有
    'PASSPORTANDCAR': 1, //有SFZ
    'PASSPORT_ONLY': 2 //无SFZ有PASSPORT
}
var processType = RTDEF.DEFAULT;
var showItemsCount = 3;
var propertyItemIndex = 0;
var entityIds = []; //用来存储本次查询的所有entityId。从keyValueMap中取到，一次页面加载只可能是sfz或passport中的一种
var entityType = 1; //默认sfz
var queryExternalCount = {
    CAR: 0,
    PASSPORT: 0
};



class CollapsePanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {fold: true};
        this.toggleState = this.foldOrNot.bind(this);
    }

    componentWillReceiveProps(props) {
        if (!this.props || this.props.fold != props.fold) {
            this.setState({fold: this.props.fold});
        }
    }

    foldOrNot() {
        this.setState({fold: !this.state.fold});

    }


    render() {
        let {properties} = this.props;

        if (this.props.properties.valueList.length <= 3) {
            return<td className={"col-md-10 col-sm-10 br-n info-group-table-text info-group-table-text"} >

                {
                    _.map(properties.valueList , (list , key)=>{
                        return(
                        <Tooltip title={list.tooltip}>
                            <div className="mr10 meta-dialog" data-placement="bottom"  data-key={list.key } data-value={ list.value } data-source={list.sourcearray } style={{display:"inline-block" }}>
                                {
                                    list.value ? (
                                        <div>
                                            {
                                                (properties.jumpType)?(
                                                    <span className="fs14 data-search link" style={{marginRight:'10px'}}>

                                                        <a target="_blank"   href={UrlUtil.getProfileUrl(list.value, properties.jumpType) } >
                                                            { list.value }
                                                        </a>

                                                    </span>
                                                ):(
                                                    <span className="fs14 data-search link" style={{marginRight:'10px'}}>

                                                        { list.value }

                                                    </span>
                                                )

                                            }

                                            {
                                                list.confidence ? (<span className="panelStyle mn fs14 fw500 ">{ list.confidence + '%'}</span>):''
                                            }
                                        </div>
                                    ) :''
                                }
                            </div>
                        </Tooltip>

                        )

                    })


                }

            </td>
        } if(this.state.fold){
            return<td className={"col-md-10 col-sm-10 br-n info-group-table-text info-group-table-text"} >

                {
                    _.map(properties.valueList , (list , key)=>{
                        if(key<3){
                            return(
                            <Tooltip title={list.tooltip}>
                                <div className="mr10 meta-dialog"  data-placement="bottom"  data-key={list.key } data-value={ list.value } data-source={list.sourcearray } style={{display:"inline-block" }}>
                                    {
                                        list.value ? (
                                            <div>
                                                {
                                                    (properties.jumpType)?(
                                                        <span className="fs14 data-search link" style={{marginRight:'10px'}}>

                                                            <a target="_blank"   href={UrlUtil.getProfileUrl(list.value, properties.jumpType) } >
                                                                { list.value }
                                                            </a>

                                                        </span>
                                                    ):(
                                                        <span className="fs14 data-search link" style={{marginRight:'10px'}}>

                                                            { list.value }

                                                        </span>
                                                    )

                                                }
                                                {
                                                    list.confidence ? (<span className="panelStyle mn fs14 fw500 ">{ list.confidence + '%'}</span>):''
                                                }
                                            </div>
                                        ) :''
                                    }
                                </div>
                            </Tooltip>

                            )
                        }


                    })

                }
                <span className="ml5 glyphicon glyphicon-chevron-down text-primary fs14 fw500"  style={{cursor:'pointer'}} onClick={this.toggleState}></span>

            </td>

        } else {
            return<td className={"col-md-10 col-sm-10 br-n info-group-table-text info-group-table-text"} >

                {
                    _.map(properties.valueList , (list , key)=>{
                        if(key<3){
                            return(
                            <Tooltip title={list.tooltip}>
                                <div className="mr10 meta-dialog" data-placement="bottom"  data-key={list.key } data-value={ list.value } data-source={list.sourcearray } style={{display:"inline-block" }}>
                                    {
                                        list.value ? (
                                            <div>
                                                {
                                                    (properties.jumpType)?(
                                                        <span className="fs14 data-search link" style={{marginRight:'10px'}}>

                                                            <a target="_blank"   href={UrlUtil.getProfileUrl(list.value, properties.jumpType) } >
                                                                { list.value }
                                                            </a>

                                                        </span>
                                                    ):(
                                                        <span className="fs14 data-search link" style={{marginRight:'10px'}}>

                                                            { list.value }

                                                        </span>
                                                    )

                                                }
                                                {
                                                    list.confidence ? (<span className="panelStyle mn fs14 fw500 ">{ list.confidence + '%'}</span>):''
                                                }
                                            </div>
                                        ) :''
                                    }
                                </div>
                            </Tooltip>

                            )
                        }


                    })

                }
                <span className="ml5 glyphicon glyphicon-chevron-up  text-primary fs14 fw500" style={{cursor:'pointer'}} onClick={this.toggleState}></span>
                <div>
                    {
                        _.map(properties.valueList , (list , key)=>{
                            if(key>=3){
                                return(
                                <Tooltip title={list.tooltip}>
                                    <div className="mr10 meta-dialog"  data-placement="bottom"  data-key={list.key } data-value={ list.value } data-source={list.sourcearray } style={{display:"inline-block" }}>
                                        {
                                            list.value ? (
                                                <div>
                                                    {
                                                        (properties.jumpType)?(
                                                            <span className="fs14 data-search link" style={{marginRight:'10px'}}>

                                                            <a target="_blank"   href={UrlUtil.getProfileUrl(list.value, properties.jumpType)} >
                                                                { list.value }
                                                            </a>

                                                        </span>
                                                        ):(
                                                            <span className="fs14 data-search link" style={{marginRight:'10px'}}>

                                                            { list.value }

                                                        </span>
                                                        )

                                                    }
                                                    {
                                                        list.confidence ? (<span className="panelStyle mn fs14 fw500 ">{ list.confidence + '%'}</span>):''
                                                    }
                                                </div>
                                            ) :''
                                        }
                                    </div>
                                </Tooltip>

                                )
                            }


                        })

                    }
                </div>


            </td>
        }


    }
}

export default class BasicInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            infoGroup : this.props.infoGroup,
            display:'none',
            toggleId:''

        }
    }

    componentDidMount() {
        $('[data-toggle="tooltip"]').tooltip();

    }


    show(toggleId){
        this.setState({
            display:this.state.display == 'none' ? 'block' :'none',
            toggleId:toggleId
        })
    }


    render() {


        let startRowIndex = this.props.startRowIndex || 1;
        let personDetail = this.props.personDetail;

        let infoGroup = this.state.infoGroup;

        return(
                <div>
                    {
                        _.map(infoGroup.children , (info , key)=>{
                            return(
                                <div key={key}  id="row-component" className=" vertical-middle-sm" style={{margin:0}}>
                                    {
                                        info.itemName && (
                                            <div className="col1 text-center titleStyle info-group-name" title={info.itemName}>
                                                {info.itemName}
                                            </div>
                                        )
                                    }

                                    <div className={info.itemName ? "col11" : "col-md-12"} style={{height:'100%',padding:0}}>
                                        <table className="table table-bordered" >
                                            <tbody  className="group-item">
                                            {
                                                ( info.photos && info.itemName === '护照' )&& (

                                                    (info.photos.length > 0 && info.photos[0] != '') ? (

                                                        <tr>
                                                            <td className='col-md-2 col-sm-2 mn fs14 fw400 text-center'>照片</td>
                                                            <td className="col-md-10 col-sm-10">
                                                                <img className="media-object mw80" src={" data:image/png;base64," + info.photos[0] } alt='...'/>
                                                            </td>
                                                        </tr>

                                                    ):(
                                                        <tr>
                                                            <td className='col-md-2 col-sm-2 mn fs14 fw400 text-center'>照片</td>
                                                            <td className="col-md-10 col-sm-10">
                                                                <img className="media-object mw80" src="/img/avatar-placeholder.png" alt='...'/>
                                                            </td>
                                                        </tr>
                                                    )

                                                )
                                            }

                                            {
                                                info.properties && _.map(info.properties , (properties , key)=>{
                                                    let result = (
                                                        <tr key={key} className={"info-group-table-row " + (startRowIndex % 2 == 0 ? "info-group-table-row-even" : "")}>
                                                            <td className={"col-md-2 col-sm-2 mn fs14 br-n fw400 text-center info-group-table-text" }>
                                                                {properties.name}
                                                            </td>
                                                            <CollapsePanel properties={properties} />
                                                        </tr>
                                                    );
                                                    startRowIndex++;
                                                    return result
                                                })
                                            }
                                            </tbody>
                                        </table>
                                    </div>


                                </div>
                            )
                        })
                    }

                </div>
            )




    }
}


module.exports = BasicInfo;