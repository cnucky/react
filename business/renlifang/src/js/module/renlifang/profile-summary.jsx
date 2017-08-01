import React, { PropTypes } from 'react';
const Notify = require('nova-notify');
const FileHelper = require('utility/FileSaver/FileSaver');
import {store} from '../../module/renlifang/store';
import {Tooltip} from 'antd';
import {getKeyValueMap} from './getKeyValueMap';
import {getIconSummary} from '../../module/renlifang/profile-icons';

const BORDER_STYLES = {
    style1: {
        cornerImg: '/renlifang/img/infobox/corner-blue.png',
        borderH: '/renlifang/img/infobox/border-h-blue.png',
        borderV: '/renlifang/img/infobox/border-v-blue.png'
    }, style2: {
        cornerImg: '/renlifang/img/infobox/corner-green.png',
        borderH: '/renlifang/img/infobox/border-h-green.png',
        borderV: '/renlifang/img/infobox/border-v-green.png'
    }, style3: {
        cornerImg: '/renlifang/img/infobox/corner-orange.png',
        borderH: '/renlifang/img/infobox/border-h-orange.png',
        borderV: '/renlifang/img/infobox/border-v-orange.png'
    }
};

var flag=true;
class ProfileAvatar extends React.Component {

    constructor(props) {
        super(props);
        this.state = {src: this.props.defaultSrc, defaultSrc: this.props.defaultSrc };
    }

    changeSrc(newSrc) {
        this.setState({
            src: newSrc
        });
    }

    componentDidUpdate(prevProps, prevState) {
        if (_.isEmpty(prevProps.values) && !_.isEmpty(this.props.values)&&flag) {
            this.requestPersonPhoto();
             flag = false;
        }
    }

    componentDidMount() {
        // this.requestPersonPhoto();
        //this.changeSrc("/renlifang/img/profile-photo.png")
    }

    downloadAvatar() {
        let fileName = this.props.name + '.jpg';

        let data = this.dataURLtoBlob(this.imageRef.src);
        FileHelper.saveAs(data, fileName);
    }

    dataURLtoBlob(dataurl) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type:mime});
    }

    //edit by hjw
    //修改后的获取照片逻辑
    //1.首先看接口是否返回非默认的照片，是则结束逻辑贴上照片
    //2.否则调用一次getExternalInfo获取第三方数据的公安查询户籍接口，不关心返回，为的是户籍照片记录到缓存中
    //3.成功后在调用获取照片接口拿到新照片
    //注:修改了批量获取照片接口的route层代码，返回不再是直接的图片而是带code data的Object，因此img的src需要用到data:image/png;base64
    requestPersonPhoto() {
        let mappedValues = this.props.values;
        var idList = [];
        var sfz = mappedValues.sfz;
        var passport = mappedValues.passport;
        if (sfz && sfz.values.length > 0) {
            _.map(sfz.values, function(value) {
                idList.push({
                    idType: 1,
                    idVal: value
                })
            })
        }
        if (passport && passport.values.length > 0) {
            _.map(passport.values, function(value) {
                idList.push({
                    idType: 2,
                    idVal: value
                })
            })
        }

        let that = this;
        $.getJSON('/renlifang/personcore/batchGetPersonPhoto?idList=' + JSON.stringify({
                queryList: idList
            }), function(rsp) {
            if (rsp.code == 0) {
                that.setState({src: 'data:image/jpg;base64,' + rsp.data.photos[0]});
                if (rsp.data.isDefaultPic == 1) {
                    if (sfz && !_.isEmpty(sfz.values) && sfz.values[0] != '') {
                        $.getJSON('/renlifang/personcore/getExternalInfo', {
                            entityId: sfz.values[0],
                            entityType: 1,
                            queryType: 1
                        }, function(rsp2) {
                            if (rsp2.code == 0) {
                                $.getJSON('/renlifang/personcore/batchGetPersonPhoto?idList=' + JSON.stringify({
                                        queryList: idList
                                    }), function(rsp3) {
                                    if (rsp3.code == 0) {
                                        that.setState({src: 'data:image/jpg;base64,' + rsp3.data.photos[0]});
                                    }
                                });
                            }
                        });
                    }
                }
            } else {
                Notify.show({
                    title: '获取照片失败',
                    type: 'danger'
                });
            }
        });
    }

    render () {
        const {src, defaultSrc} = this.state;
        if (src === defaultSrc) {
            return <img className="summary-avatar" src={src} />
        } else {
            return <div className="avatar-container">
                <img ref={(node)=>{this.imageRef = node}} className="summary-avatar" src={src} />
                <div className="avatar-download-panel">
                    <a className="fa fa-cloud-download btn-avatar-download" onClick={()=>this.downloadAvatar()} href="javascript:void(0);"></a>
                </div>
            </div>
        }
    }
}

class UnorderList extends React.Component {
    render() {
        let {indicatorColor, list} = this.props;
        return <ul className="ml10 mr10" style={{}}>
            {_.map(list, function (item , key) {
                return <li key={item} className="summary-text mt5 mb5"><span className="mr5" style={{color: indicatorColor}}>●</span>{item}</li>
            })}
        </ul>
    }
}

class InfoBox extends React.Component {

    render() {
        const {title, titleIconCls, titleBgColor, style, renderContent} = this.props;

        let {cornerImg, borderH, borderV} = BORDER_STYLES[style];
        let cornerBgr = `url(${cornerImg}) center no-repeat`;
        let ltStyle = {
                background: cornerBgr
            },
            mtStyle = {
                background: `url(${borderH}) top repeat-x`
            },
            rtStyle = {
                background: cornerBgr,
                transform: 'rotate(90deg)'
            },
            middleStyle = {
                background: `url(${borderV}) left repeat-y,
                url(${borderV}) right repeat-y`
            },
            lbStyle = {
                background: cornerBgr,
                transform: 'rotate(270deg)'
            },
            mbStyle = {
                background: `url(${borderH}) bottom repeat-x`
            },
            rbStyle = {
                background: cornerBgr,
                transform: 'rotate(180deg)'
            };

        return <div className="summary-info-box">
            <div className="summary-title-bar" style={{backgroundColor: titleBgColor, width: 110}}>
                <span className={"fs12 text-center va-m " + titleIconCls} style={{lineHeight: '15px', width: 28}}></span>{title}
            </div>
            <div style={{marginTop: 6, position: 'relative'}}>
                <div className="flex-layout flex-vertical" style={{position: 'absolute', left: 0, top: 0, bottom: 0, right: 0, pointerEvents: 'none'}}>
                    <div className={"info-box-top flex-layout " + this.props.style} style={{width: '100%', height: 25}}>
                        <div className="info-box-corner" style={ltStyle}></div>
                        <div className="info-box-border flex-item" style={mtStyle}></div>
                        <div className="info-box-corner" style={rtStyle}></div>
                    </div>
                    <div className="info-box-middle flex-item" style={middleStyle}></div>
                    <div className={"info-box-bottom flex-layout " + this.props.style} style={{width: '100%', height: 25}}>
                        <div className="info-box-corner" style={lbStyle}></div>
                        <div className="info-box-border flex-item" style={mbStyle}></div>
                        <div className="info-box-corner" style={rbStyle}></div>
                    </div>
                </div>
                <div className="info-box-content">
                    {renderContent()}
                </div>
            </div>
        </div>
    }
}

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

    getLinkUrl(entityId) {
        let type = this.props.type + '';
        return UrlUtil.getProfileUrl(entityId, type);
    }

    render() {
        if (this.props.items.length == 1) {

            return <div style={{display: 'inline-block',marginTop:5}}>
                    <span title={this.props.items[0]} className="link fs14">{this.props.items[0]}</span>
                </div>
        } if (this.state.fold) {
            return <div style={{display: 'inline-block',marginTop:5}}>
                    <span title={this.props.items[0]} className="link fs14">{this.props.items[0]}</span>
                    <span className="ml5 glyphicon glyphicon-chevron-down text-primary fs14 fw500"  style={{cursor:'pointer'}} onClick={this.toggleState}></span>
                </div>
        } else {
            let [first, ...restItems] = this.props.items;
            return <div style={{display: 'inline-block',marginTop:5}}>
                <span className="link fs14">{first}</span>
                <span className="ml5 glyphicon glyphicon-chevron-up  text-primary fs14 fw500" style={{cursor:'pointer'}} onClick={this.toggleState}></span>
                {_.map(restItems, (value, index)=>{
                    return <div>
                        <span title={value} className="link fs14">{value}</span>
                    </div>
                })}
            </div>
        }
    }
}

export default class ProfileSummary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open:this.props.open,
            show:false
        };
    }

    componentDidUpdate(){
        $('[data-toggle="tooltip"]').tooltip();

    }

    componentDidMount() {
        this.loadValuesOfKey();
    }

    loadValuesOfKey() {
        let personDetail = this.props.data;
        var keyValueMap = personDetail.keyValueMap;

        let keys = ['SFZ','PASSPORT'];
        let that = this;

        getKeyValueMap(keys, keyValueMap).then(function(newMap){
            var sfzValues = getProfileValueByKey('SFZ', newMap);
            var passportValues = getProfileValueByKey('PASSPORT', newMap);

            let values = {
                sfz: sfzValues,
                passport : passportValues
            };
            that.setState({
                mappedValues: values
            });
        }).catch(function(e) {
            Notify.simpleNotify("加载出错", e.message || e, 'error');
        });
    }

    getMainInfo(personData) {
        let info = {};
        if (!_.isEmpty(personData.personProperty)) {
            _.each(personData.personProperty[0].children, function(item) {
                if (item.name == 'CNAME') {
                    if (!_.isEmpty(item.valueList)) {
                        info.cName = item.valueList[0];
                    }
                } else if (item.name == 'NAME') {
                    if (!_.isEmpty(item.valueList)) {
                        info.name = item.valueList[0];
                    }
                }
            });
        }

        let sfzOrPassport ;
        if (!_.isEmpty(this.state.mappedValues)) {
            sfzOrPassport = this.state.mappedValues.sfz || this.state.mappedValues.passport;
            sfzOrPassport = sfzOrPassport.values[0];
        } else {
            _.each(personData.keyValueMap, function(item) {
                if (item.name == 'SFZ') {
                    if (!_.isEmpty(item.values)) {
                    info.sfz = item.values[0];
                }
                } else if (item.name == 'IDCARD') {
                    if (!_.isEmpty(item.values)) {
                        info.idCard = item.values[0];
                    }
                } else if (item.name == 'PASSPORT') {
                    if (!_.isEmpty(item.values)) {
                        info.passport = item.values[0];
                    }
                } else if (item.name == "COMMONPASSPORT") {
                    if (!_.isEmpty(item.values)) {
                        info.commonPassport = item.values[0];
                    }
                }
            })
            sfzOrPassport = info.sfz || info.idCard || info.passport || info.commonPassport || '未知';
        }

        let personAttributes='';
        if (!_.isEmpty(personData.focusLevel)) {
            personAttributes=personData.focusLevel[0];
        }



        return [info.cName || info.name || {value: '未知'}, sfzOrPassport, personAttributes];
    }

    togglePanel() {
        store.dispatch({
            type: 'OPEN_SUMMARY',
            summaryOpen: !this.props.open
        });
    }

    mouseHover(){
        $("#profileSummary").mouseleave(
            ()=>{if(this.state.show) {
                //this.show() ;
                $("#profileSummary").addClass("hide_animate");
                //$("#profileSummary").hide();
            }}
        )
    }

    show(){
        this.setState({
            show:!this.state.show
        })
    }

    render() {
        const personData = this.props.data;
        let mainInfo = this.getMainInfo(personData);

        _.each(personData.address , (add , key)=>{
            if (!_.isEmpty(add.source)) {
                add.tooltip = _.reduce(add.source, function(memo, source) {
                    return memo + source + "，";
                }, "数据来源：");
                add.tooltip = add.tooltip.substring(0, add.tooltip.length - 1);

                var sourceArray = _.map(add.source, function(item) {
                    return item.typeId;
                });
                add.sourcearray = sourceArray;
            } else {
                add.tooltip = "数据来源：无";
            }

        })

        let firstLineInfo = mainInfo[0];
        let secondLineInfo = mainInfo[1];
        let thirdLineInfo=mainInfo[2];
        let imgUrl;
        switch (thirdLineInfo) {
            case '普通关注':
                imgUrl='/renlifang/img/person-attributes/attention.png';
                break;
            case '重点关注':
                imgUrl='/renlifang/img/person-attributes/focus.png';
                break;
            case '在侦人员':
                imgUrl='/renlifang/img/person-attributes/investigation.png';
                break;
            default :
                imgUrl='/renlifang/img/person-attributes/natural.png';
        }
        var showAnimate,showClass,showProfile;
        if(this.state.open){
            showAnimate=" show_animate ";
            showClass="none";
        }else if(this.state.show){
            showAnimate=" show_top show_animate ";
        }else{
            //showAnimate="  hide_animate ";
            showProfile = "none";
            showClass="block";
        }

            return <div style={{height:"100%"}}>
            <div className={showAnimate+" p5 border-shadow profile-summary invisible-scroller flex-layout flex-vertical"} id="profileSummary" style={{display:showProfile}}  onMouseOut={this.mouseHover.bind(this)}>
                {/* 头像，姓名与身份证 */}
                <div className="p20 summary-card flex-layout" style={{position:'relative', boxShadow: "0 0 6px 0 rgba(0, 0, 0, 0.5"}}>
                    <Tooltip title={this.state.show ? "固定":"收起"}>
                        <a className="pull-right " style={{position: 'absolute', top: 10, right: 10}} onClick={()=>this.togglePanel()} href="javascript:void(0);">
                            <i className="fa fa-thumb-tack fs16"></i>
                        </a>
                    </Tooltip>
                    <img className="person-attributes" src={imgUrl} title={thirdLineInfo} style={{display: thirdLineInfo==='自然人' || thirdLineInfo==='' ? 'none':'block'}}/>
                    <div className="text-center mr25">
                        <ProfileAvatar defaultSrc={'/img/avatar-placeholder.png'} values={this.state.mappedValues} name={firstLineInfo.value || secondLineInfo}/>
                    </div>
                    <div className="flex-item vertical-container" style={{overflow: 'hidden'}}>
                        <div style={{width: '100%'}}>
                            <span className="person-name ">{firstLineInfo.value}</span>
                            {<span className="summary-percent mn ml10">{firstLineInfo.confidence ? (firstLineInfo.confidence + '%') : ''}</span>}
                            <hr className="mt5 mb5"/>
                            <span className="person-idnum">{secondLineInfo}</span>
                            {/*<span className="summary-percent mn ml10" >{secondLineInfo.percent}</span>*/}
                        </div>
                    </div>
                </div>
                {/* 常用码址 */}
                <div className="summary-card flex-item mt10 invisible-scroller " style={{overflow:'scroll'}}>
                    <InfoBox title="常用码址" titleBgColor="#1395e2" titleIconCls="fa fa-credit-card" style="style1"
                             renderContent={()=>{
                                 return _.isEmpty(personData.keyValueMap) ? <span className="text-center no-data-hints">暂无数据</span> :
                                _.map(personData.keyValueMap, function (item , key) {
                                    if (_.isEmpty(item.values)) {
                                        return '';
                                    }
                                    return <div className="row mln mrn" key = {key}>
                                        <div className="col-sm-4 summary-label keyValue" style={{marginRight:5 ,paddingRight:0}}>
                                            <span title={item.caption || item.name}  className={"simple-tag bg-primary light " } >
                                                <i className={'pr5 '+ getIconSummary(item.name)}></i>
                                                {(item.caption || item.name) + " :"}
                                            </span>
                                        </div>
                                        <CollapsePanel items={item.values} type={item.entityType}/>
                                    </div>;
                                })
                        }}/>
                    {/* 常用地址 */}
                    {personData.address ? <InfoBox title="常用地址" titleBgColor="#00b3c7" titleIconCls="fa fa-map-marker" style="style2"
                                                   renderContent={()=>{
                         return _.isEmpty(personData.address) ? <span className="text-center no-data-hints">暂无数据</span> :
                             <div className="">{_.map(personData.address, addr=>{
                            return <Tooltip title={addr.tooltip}>
                                <span style={{cursor:'pointer'}}  className="simple-tag bg-info light" >{addr.value}</span>
                            </Tooltip>
                         })}</div>;
                     }}/> : ''}

                    {/* 重点关注 */}
                    <InfoBox title="重点标签" titleBgColor="#f76b27" titleIconCls="fa fa-warning" style="style3"
                             renderContent={()=>{
                     return _.isEmpty(personData.tags) ? <span className="text-center no-data-hints">暂无数据</span> :
                         <div className="">{_.map(personData.tags, tag=>{
                        let tagText = _.isEmpty(tag.tagValue) ? tag.tagName : (tag.tagName + ':' + tag.tagValue);
                            return <span className="simple-tag bg-danger lights" title={tagText}>{tagText}</span>
                         })}</div>;
                     }}/>

                </div>
            </div>
            <div style={{padding: 5, width: 'auto',height:"100%", display:showClass}} onMouseMove={this.show.bind(this)}>
                <Tooltip title={'展开'}>
                    <a className="mt20 pull-right "   onClick={()=>this.togglePanel()} href="javascript:void(0);">
                        <i className="fa fa-thumb-tack fs16 btn-summary-open" style={{transform: 'rotate(90deg)'}}></i>
                    </a>
                </Tooltip>

            </div>
       </div>
    }

}

function getProfileValueByKey(key, keyValueMap) {
    return _.find(keyValueMap, function(item) {
        return item.name == key;
    });
}