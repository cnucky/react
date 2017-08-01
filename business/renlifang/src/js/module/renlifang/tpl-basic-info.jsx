import React from 'react';
require('../../module/renlifang/styles.less');
const Notify = require('nova-notify');
import { Tooltip, Row, Col} from 'antd';

const ROW_HEIGHT = 38;
export default class BasicInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            nameDisplay:'none',
            addDisplay:'none',
            userDisplay:'none',
            src:'',
            infoGroup:[]

        }
    }

    componentDidMount() {
        let infoGroup = this.props.infoGroup;
        if(infoGroup.type){
            let position = _.findIndex(infoGroup.children, function(component) {
                return component.name == 'OBJECT_PHOTO';
            });
            infoGroup.children.splice(position,1);
        }

        this.setState({
            infoGroup:infoGroup
        })
        let fileId = [];
        let that = this;
        //_.each(this.props.infoGroup.children , (item , key)=>{
        //    if(item.name === 'OBJECT_PHOTO'){
        //        fileId = item.valueList[0].value;
        //
        //        $.get('/renlifang/personcore/showPhoto', {
        //            fileId: fileId
        //        }, function(rsp){
        //            rsp = JSON.parse(rsp);
        //            if(rsp.code == 0){
        //
        //                that.setState({src: 'data:image/jpg;base64,' + rsp.data});
        //
        //            }else{
        //                that.setState({src: '/img/avatar-placeholder.png'});
        //                Notify.show({
        //
        //                    title: '获取图片失败',
        //                    type: 'error'
        //                });
        //
        //            }
        //        });
        //
        //    }
        //
        //})


        



    }

    showName(){
        this.setState({
            nameDisplay:this.state.nameDisplay == 'none' ? 'block' :'none'
        })

    }
    showAdd(){
        this.setState({
            addDisplay:this.state.addDisplay == 'none' ? 'block' :'none'
        })

    }
    showUse(){
        this.setState({
            userDisplay:this.state.userDisplay == 'none' ? 'block' :'none'
        })
    }


    render() {

        let infoGroup = this.state.infoGroup;
        let info = this.props.info;

        let startRowIndex = this.props.startRowIndex || 1;
        let lengths = '';
        let add = '';


        if(infoGroup.type){
             lengths = infoGroup.children.length;
             add = Math.ceil(lengths/2) ;
        }

        let tables = [];
        for(var i=0 ; i < add ;i++){
            let r = i+add;

            tables.push(
                <tr key={i} className={"info-group-table-row " + (i % 2 == 1 ? "info-group-table-row-even" : "")}>
                    <td className={"col-md-2 col-sm-2 mn fs14 br-n fw400 text-center info-group-table-text" }>
                        {infoGroup.children[i].caption}
                    </td>

                    <td className={"col-md-4 col-sm-10 br-n info-group-table-text info-group-table-text"} >
                        {
                            _.map(infoGroup.children[i].valueList , (list , key)=>{
                                return(
                                    <Tooltip title={list.value}>
                                        <div key={key} className={"mr10 meta-dialog"} data-placement="bottom"  data-key={infoGroup.children[i].key } data-value={ list.value } data-source={list.sourcearray } style={{display:"inline-block" ,maxWidth:200}}>
                                            {
                                                list.value ? (
                                                    <div className="text-ellipsis">

                                                        <span className="fs14 data-search" style={{marginRight:'10px'}}>{ list.value }</span>

                                                    </div>
                                                ) :''
                                            }

                                        </div>
                                    </Tooltip>
                                )

                            })

                        }
                    </td>


                    <td className={"col-md-2 col-sm-2 mn fs14 br-n fw400 text-center info-group-table-text" }>
                        {infoGroup.children[r] ? infoGroup.children[r].caption : ''}
                    </td>
                    <td className={"col-md-4 col-sm-10 br-n info-group-table-text info-group-table-text"} >
                        {
                            infoGroup.children[r] ? _.map(infoGroup.children[r].valueList , (list , key)=>{
                                return(

                                <Tooltip title={list.value}>
                                    <div key={key} className={"mr10 meta-dialog"} data-placement="bottom"  data-key={infoGroup.children[r].key } data-value={ list.value } data-source={list.sourcearray } style={{display:"inline-block" ,maxWidth:200}}>
                                        {
                                            list.value ? (
                                                <div className="text-ellipsis">

                                                    <span className="fs14 data-search " style={{marginRight:'10px'}}>{ list.value }</span>

                                                </div>
                                            ) :''
                                        }

                                    </div>
                                </Tooltip>

                                )

                            }) : ''

                        }
                    </td>
                </tr>
            )

        }

        return(
                (infoGroup && !infoGroup.type) ?(

                    <div id="row-component" className="row " style={{margin:0}}>
                        <div className={"col-md-12"} style={{height:'100%',padding:0}}>
                            <table className="table table-bordered" >
                                <tbody  className="group-item">
                                {

                                    _.map(infoGroup.children , (child , key)=>{
                                        let result = (
                                            <tr key={key} className={"info-group-table-row " + (startRowIndex % 2 == 0 ? "info-group-table-row-even" : "")}>
                                                <td className={"col-md-2 col-sm-2 mn fs14 br-n fw400 text-center info-group-table-text" }>
                                                    {child.caption}
                                                </td>

                                                <td className={"col-md-10 col-sm-10 br-n info-group-table-text info-group-table-text"} >
                                                    {
                                                        _.map(child.valueList , (list , key)=>{
                                                            return(

                                                                (key < child.showItemsCount)&&(

                                                                    <Tooltip title={list.tooltip}>
                                                                        <div key={key} className={"mr10 meta-dialog"} data-placement="bottom" data-key={child.key } data-value={ list.value } data-source={list.sourcearray } style={{display:"inline-block" }}>
                                                                            {
                                                                                list.value ? (
                                                                                    <div>
                                                                                        {
                                                                                            (child.name == "SFZ" || child.name == "USER_MSISDN") ? (

                                                                                                <span className="fs14 data-search link" style={{marginRight:'10px'}}>

                                                                                                    <a target="_blank" href={UrlUtil.getProfileUrl(list.value, child.name == "SFZ" ? "1" : "5") } >
                                                                                                        { list.value }
                                                                                                    </a>

                                                                                                </span>

                                                                                            ):(

                                                                                                (child.name === "OBJECT_PHOTO" ) ?(

                                                                                                    <img className="media-object mw80" src={this.state.src ? this.state.src : "/img/avatar-placeholder.png"} alt='...'/>

                                                                                                ):(

                                                                                                    <span className="fs14 data-search" style={{marginRight:'10px'}}>{ list.value }</span>

                                                                                                )

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

                                                            )

                                                        })

                                                    }


                                                    {
                                                        _.map(child.valueList , (list , key)=>{
                                                            return(

                                                                (child.name == "CNAME" && key == child.showItemsCount)&&(

                                                                    <span onClick={this.showName.bind(this)} style={{cursor:'pointer'}} className={this.state.nameDisplay === 'none' ? ( "glyphicon glyphicon-chevron-down text-primary mn fs14 fw500" ) : ( "glyphicon glyphicon-chevron-up text-primary mn fs14 fw500" ) }data-title="summary-cname"></span>

                                                                )
                                                            )
                                                        })

                                                    }


                                                    {
                                                        (child.name == "CNAME")&&(<div id="summary-cname" style={{display:this.state.nameDisplay}}>
                                                            {
                                                                _.map(child.valueList , (list , key)=>{
                                                                    return(

                                                                        (child.name == "CNAME" && key >= child.showItemsCount) && (

                                                                            <Tooltip title={list.tooltip}>
                                                                                <div key={key} className="mr10 meta-dialog" data-placement="bottom"  data-key={child.key } data-value={ list.value } data-source={list.sourcearray } style={{display:"inline-block" }}>
                                                                                    {
                                                                                        list.value ? (
                                                                                            <div>
                                                                                                <span className="fs14 data-search" style={{marginRight:'10px'}}>{ list.value }</span>
                                                                                                {
                                                                                                    list.confidence ? (<span className="panelStyle mn fs14 fw500 ">{ list.confidence + '%'}</span>):''
                                                                                                }
                                                                                            </div>
                                                                                        ) :''
                                                                                    }
                                                                                </div>
                                                                            </Tooltip>

                                                                        )

                                                                    )

                                                                })
                                                            }
                                                        </div>)

                                                    }

                                                    {
                                                        _.map(child.valueList , (list , key)=>{
                                                            return(

                                                                (child.name === "ADDRESS" && key == child.showItemsCount)&&(

                                                                    <span onClick={this.showAdd.bind(this)} style={{cursor:'pointer'}} className={ this.state.addDisplay === 'none' ? ( "glyphicon glyphicon-chevron-down text-primary mn fs14 fw500" ) : ( "glyphicon glyphicon-chevron-up text-primary mn fs14 fw500" ) } data-title="summary-address"></span>

                                                                )
                                                            )
                                                        })

                                                    }

                                                    {
                                                        (child.name == "ADDRESS")&&(<div id="summary-address" style={{display:this.state.addDisplay}}>
                                                            {
                                                                _.map(child.valueList , (list , key)=>{
                                                                    return(

                                                                        (child.name == "ADDRESS" && key >= child.showItemsCount) && (

                                                                            <Tooltip  title={list.tooltip}>
                                                                                <div key={key} className="mr10 meta-dialog" data-placement="bottom" data-key={child.key } data-value={ list.value } data-source={list.sourcearray } style={{display:"inline-block" }}>
                                                                                    {
                                                                                        list.value ? (
                                                                                            <div>
                                                                                                <span className="fs14 data-search" style={{marginRight:'10px'}}>{ list.value }</span>
                                                                                                {
                                                                                                    list.confidence ? (<span className="panelStyle mn fs14 fw500 ">{ list.confidence + '%'}</span>):''
                                                                                                }
                                                                                            </div>
                                                                                        ) :''
                                                                                    }
                                                                                </div>
                                                                            </Tooltip>


                                                                        )

                                                                    )

                                                                })
                                                            }

                                                        </div>)

                                                    }


                                                    {
                                                        _.map(child.valueList , (list , key)=>{
                                                            return(

                                                                (child.name == "USER_MSISDN" && key == child.showItemsCount)&&(

                                                                    <span onClick={this.showUse.bind(this)} style={{cursor:'pointer'}} className={ this.state.userDisplay === 'none' ? ( "glyphicon glyphicon-chevron-down text-primary mn fs14 fw500" ) : ( "glyphicon glyphicon-chevron-up text-primary mn fs14 fw500" ) } data-title="summary-phone"></span>

                                                                )
                                                            )
                                                        })

                                                    }

                                                    {
                                                        (child.name == "USER_MSISDN")&&(<div id="summary-phone" style={{display:this.state.userDisplay}}>
                                                            {
                                                                _.map(child.valueList , (list , key)=>{
                                                                    return(

                                                                        (child.name == "USER_MSISDN" && key >= child.showItemsCount) && (

                                                                            <Tooltip title={list.tooltip}>
                                                                                <div key={key} className="mr10 meta-dialog" data-placement="bottom" data-key={child.key } data-value={ list.value } data-source={list.sourcearray } style={{display:"inline-block" }}>
                                                                                    {
                                                                                        list.value ? (
                                                                                            <div>
                                                                                            <span className="fs14 data-search link" style={{marginRight:'10px'}}>
                                                                                                <a target="_blank"  href={UrlUtil.getProfileUrl(list.value, 5)} >
                                                                                                    { list.value }
                                                                                                </a>
                                                                                            </span>
                                                                                                {
                                                                                                    list.confidence ? (<span className="panelStyle mn fs14 fw500 ">{ list.confidence + '%'}</span>):''
                                                                                                }
                                                                                            </div>
                                                                                        ) :''
                                                                                    }
                                                                                </div>
                                                                            </Tooltip>




                                                                        )

                                                                    )

                                                                })
                                                            }

                                                        </div>)

                                                    }

                                                </td>
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

                ):(
                    <div className={ "col-md-12"} style={{height:'100%',padding:0}}>
                        <table className="table table-bordered" >
                            <tbody  className="group-item">
                                {tables}
                            </tbody>
                        </table>
                    </div>
                )

        );




    }
}


module.exports = BasicInfo;