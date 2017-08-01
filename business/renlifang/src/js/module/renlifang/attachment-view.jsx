import React from 'react';
import {render} from 'react-dom';
import {store} from '../../module/renlifang/store';
const Notify = require('nova-notify');
const loader = require('utility/loaders');
const MultiSelect = require('widget/multiselect');
import { Tooltip, Row, Col} from 'antd';

class Thumbnail extends React.Component {

    render() {
        let {name, data} = this.props;
        let ext = name.substr(name.lastIndexOf('.') + 1, name.length - 1);

        return <Tooltip title={<div>{"数据来源："+this.props.source[0]}<br/>{"文件路径：" + name}</div>}>
                <div className="m5 mb10 text-center" style={{display: 'inline-block', cursor: 'pointer',width:'140px'}}>
                    <div className="mb5 p5" style={{width: 'auto',position:'relative'}}>
                        <img className=""
                             style={{width: 'auto', height: 130, objectFit: 'contain', boxShadow: '0 0px 2px 0 rgba(0, 0, 0, 0.8)', margin: 'auto'}}
                             src={'data:image/' + (ext || 'jpg') + ';base64,' + data} onClick={()=>this.props.onClicked(this.props.name)}/>
                        <span style={{padding:'2px 10px',position:'absolute',bottom:'5px',right:'5px',backgroundColor:'rgba(0,0,0,0.5)',color:'#eee'}}>{ext}</span>
                    </div>
                    <span style={{width: '140px',textOverflow:'ellipsis',overflow:'hidden',display:'inline-block'}}>{name}</span>
                </div>
            </Tooltip>

    }
}

class ThumbnailList extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {

        return <div>
            {
                _.map(this.props.list, item=>{
                    return <Thumbnail source={item.source} name={item.fileName} data={item.fileContent} onClicked={(imageName)=>{
                        store.dispatch({
                            type: 'SHOW_FULL_IMAGE',
                            images: this.props.list,
                            currentImage: item.fileName
                        });
                    }
                    } />
                })
            }
        </div>
    }
}

export default class AttachmentInfo extends React.Component {
    constructor(props) {
        super(props);
        let selectedFlags = {};
        _.each(this.props.info, item=>{
            selectedFlags[item.entityId] = true;
        })
        this.state = {selectedFlags:selectedFlags};
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.selectedFlags != this.state.selectedFlags) {
            this.loadThumbnail();
        }
    }

    componentDidMount() {
        this.loadThumbnail();
    }

    loadThumbnail() {
        let fileAndSource = {};
        _.each(this.props.info, item => {
            if (this.state.selectedFlags[item.entityId]) {
                _.each(item.files, file=>{
                    fileAndSource[file.fileName] = file.source;
                });
            }
        });

        if (_.isEmpty(fileAndSource)) {
            this.setState({thumbnailData: []});
            return;
        }

        this.loader = loader('#attachment-container');
        loadImage(_.keys(fileAndSource), {
            resize: true,
            width: 130,
            height: 130
        }, result=>{
            this.loader.hide();
            if (result) {

                _.each(result,(res , key)=>{
                    res.source = fileAndSource[res.fileName];
                })

                this.setState({thumbnailData: result});
            } else {
                Notify.simpleNotify('请求失败', '无法获取附件图片', 'danger');
            }
        });
    }

    changeSelection(option , key) {
        let selected = _.extend({}, this.state.selectedFlags, {[option]: this.state.selectedFlags[option] ? false : true});
        this.setState({
            selectedFlags: selected
        });
    }

    render() {
        return <div className="p10">
            <div className="row">
                {
                    _.map(this.props.info,(item , key)=>{
                        return(
                            <div style={{width:180 ,float:'left',marginRight:10,marginLeft:10}} id="family-selected-cert" onClick={this.changeSelection.bind(this,item.entityId,key)}>
                                <div className="pln">
                                    <a className={"btn  btn-gradient btn-alt btn-block item-active" + ( this.state.selectedFlags[item.entityId]  ? " btn-primary  " : " " ) }data-form-skin="primary">
                                        {item.entityId}
                                    </a>
                                </div>
                            </div>
                        )
                    })
                }
            </div>

            <div id="attachment-container" className="br-a mt10 p5" style={{minHeight: 200}}>
            {
                this.state && this.state.thumbnailData ? <ThumbnailList list={this.state.thumbnailData}/> : ''
            }
            </div>
        </div>
    }
}

function loadImage(fileList, option, onFinished) {
    $.getJSON('/renlifang/personcore/getAttachment', {
        fileName: fileList,
        fileType: 'image',
        option: option
    }, rsp=>{
        if (rsp.code == 0) {
            onFinished(_.map(rsp.data, (fileInfo, fileName)=>{
                return {
                    fileName: fileName,
                    fileContent: fileInfo.fileContent
                }
            }));
        } else {
            onFinished();
        }
    })
}