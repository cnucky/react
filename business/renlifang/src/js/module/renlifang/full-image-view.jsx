import React from 'react';
import {render} from 'react-dom';
import {store} from '../../module/renlifang/store';
import {Tooltip} from 'antd';

const loader = require('utility/loaders');

const IMAGE_CACHE = {};

export default class FullImageView extends React.Component {
    constructor(props) {
        super(props);

        this.imageObj = new Image();
        this.imageObj.onload = ()=>{
            this.setState({
                imageData: this.imageObj.src
            });
        };
        let index = _.findIndex(this.props.images, img=>{
            return img.fileName == this.props.currentImage;
        });
        this.state = {
            currentIndex: index,
            width:"auto",
            height:"auto"
        };
    }

    componentWillReceiveProps(props) {
        let index = _.findIndex(props.images, img=>{
            return img.fileName == props.currentImage;
        });
        this.setState({currentIndex: index});
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.currentIndex != this.state.currentIndex) {
            this.showImage();
        }
    }

    componentDidMount() {
        let that = this;
        document.addEventListener('keyup', e => {
            switch (e.keyCode) {
                // 向左
                case 37:
                    that.prev();
                    break;
                // 向右
                case 39:
                    that.next();
                    break;
                // esc
                case 27:
                    that.close();
                    break;
            }
        });

        this.showImage();
    }

    close() {
        store.dispatch({
            type: 'CLOSE_FULL_IMAGE'
        });
    }

    showImage() {
        let fileName = this.getCurrentImage().fileName;
        if (IMAGE_CACHE[fileName]) {
            this.imageObj.src = IMAGE_CACHE[fileName];
        } else {
            this.loader = loader('#full-size-container');
            loadImage([fileName], {
                resize: false,
                width: 300,
                height: 200
            }, result=>{
                this.loader.hide();
                if (result) {
                    let imageData = 'data:image/jpg;base64,' + result[fileName].fileContent;
                    IMAGE_CACHE[fileName] = imageData;

                    this.imageObj.src = imageData;
                }
            });
        }

        var img_temp = this.imageObj;
        var mousewheelContainer = document.getElementById("full-size-container");
        mousewheelContainer.addEventListener("mousewheel", function(e){
            mouseWheelScroll(e,img_temp);
        }, false);
        var _this=this;
        function mouseWheelScroll(e,img){
            var _delta = parseInt(e.wheelDelta || -e.detail);
            //向上滚动
            if (_delta > 0) {
                _this.biggerImg(img);
            }
            //向下滚动
            else {
                _this.smallerImg(img);
            }
        }

    }

    getCurrentImage() {
        return this.props.images[this.state.currentIndex];
    }

    prev() {
        if (this.state.currentIndex > 0) {
            this.setState({
                currentIndex: this.state.currentIndex - 1,
                width:this.imageObj.naturalWidth,
                height: this.imageObj.naturalHeight,
            });
        } else {
            // this.setState({currentIndex: this.state.currentIndex--});
        }
    }

    next() {
        if (this.state.currentIndex < this.props.images.length - 1) {
            this.setState({
                currentIndex: this.state.currentIndex + 1,
                width:this.imageObj.naturalWidth,
                height: this.imageObj.naturalHeight,
            });
        } else {
            // this.setState({currentIndex: this.state.currentIndex--});
        }
    }

    rotate90() {
        rotate(this.imageObj);
        // let imageData = rotate(this.imageObj, 90);
        // this.imageObj.src = imageData;
    }

    biggerImg(){
         let imageData = biggerImage(this.imageObj);
         this.setState({
                width:imageData.nextW,
                height: imageData.nextH,
                percent:imageData.percent
            });
        // this.imageObj.src = imageData;
     
    }

    smallerImg(){
        let imageData =  smallerImage(this.imageObj);
        this.setState({
                width:imageData.nextW,
                height: imageData.nextH,
                percent:imageData.percent
            });
        //this.imageObj.src = imageData;
    }

    downloadImage(){
        let fileName = this.getCurrentImage().fileName;
        download(this.imageObj.src,fileName);
    }

    render() {
        let {images} = this.props;
        let {currentIndex} = this.state;
        let currentName = images[currentIndex].fileName;

        let maxHeight = this.props.height - 20;

        return <div className="p20" style={{width: '100%', height: '100%', backgroundColor:'rgba(0, 0, 0, 0.9)'}}>
            <div className="flex-layout" style={{width: '100%', height:'100%'}}>
                <div className="p10" style={{position: 'absolute', top: 10, right: 10}} >
                    <Tooltip title={'放大'}>
                    <a  className="ml20" href="javascript: void(0)"  onClick={()=>this.biggerImg()}>
                        <i className="fa fa-search-plus  fs30 icon_Opacity" ></i>
                    </a>
                    </Tooltip>
                    <Tooltip title={'缩小'}>
                    <a  className="ml20" href="javascript: void(0)" onClick={()=>this.smallerImg()}>
                        <i className="fa fa-search-minus  fs30 icon_Opacity" ></i>
                    </a>
                    </Tooltip>
                    <Tooltip title={'旋转'}>
                    <a  className="ml20" href="javascript: void(0)" onClick={()=>this.rotate90()}>
                        <i className="fa fa-repeat  fs30 icon_Opacity" ></i>
                    </a>
                    </Tooltip>
                    <Tooltip title={'下载'}>
                    <a  className="ml20" href="javascript: void(0)" onClick={()=>this.downloadImage()}>
                        <i className="fa fa-cloud-download  fs30 icon_Opacity" ></i>
                    </a>
                    </Tooltip>
                    <Tooltip title={'关闭'}>
                    <a  className="ml20" href="javascript: void(0)" onClick={this.close}>
                        <i className="fa fa-times-circle  fs30 icon_Opacity" ></i>
                    </a>
                    </Tooltip>
                </div>
                <div className="text-center image-view-nav" style={{width: 100, height: '100%'}} >
                    <a className="va-m fs80" href="javascript: void(0)" style={{lineHeight: maxHeight + 'px',color:"rgba(247, 247, 247, 0.6)", cursor: 'pointer'}} onClick={()=>this.prev()}>
                        <i className="fa fa-angle-left text-default" ></i>
                    </a>
                </div>
                <div id="full-size-container"  className="flex-item text-center" style={{display:'table-cell', height: '100%'}}>
                    {
                        this.state.imageData ? <div style={{lineHeight: maxHeight + 'px',height:"96%"}}>
                                <img id="Image"  src={this.state.imageData} className="va-m"
                                                    style={{width:this.state.width, height: this.state.height, maxWidth: '100%', maxHeight: maxHeight, objectFit: 'contain'}}/>
                            </div> : ''
                    }
                    <div id="percentTip" style={{display:"none"}}><span style={{color:"white",fontSize:"16px",width:"40px"}}>{this.state.percent?this.state.percent+"%":" "}</span></div>
                </div>
                <div className="text-center image-view-nav" style={{ width: 100, height: '100%'}} >
                    <a className="va-m fs80" href="javascript: void(0)" style={{lineHeight: maxHeight + 'px',color:"rgba(247, 247, 247, 0.6)", cursor: 'pointer'}} onClick={()=>this.next()}>
                        <i className="fa fa-angle-right text-default" ></i>
                    </a>
                </div>
            </div>
        </div>
    }
}

// let canvas=document.createElement('canvas');
// let ctx=canvas.getContext('2d');

// function canvas_draw(img){
//     canvas.width=img.width;
//     canvas.height=img.height;
//     console.log('img size:', img.width, img.height)
//     ctx.mozImageSmoothingEnabled = true;
//     ctx.webkitImageSmoothingEnabled = true;
//     ctx.msImageSmoothingEnabled = true;
//     ctx.imageSmoothingEnabled = true;
// }

var degress = 0;
function rotate(img){
    var imgRotate =  document.getElementById("Image");
    degress += 90;
    imgRotate.style.transform = "rotate(" + degress + "deg)";
    // canvas_draw(img);
    // //移动画笔位置到画布中心点
    // ctx.translate(canvas.width / 2, canvas.height / 2);
    // //旋转90度 PI=180
    // ctx.rotate(Math.PI / 180 * degress);
    // //画图的 坐标点要跟着con平移后的位置 默认为 0 ，0
    // ctx.drawImage(img, canvas.width / -2, canvas.height/-2, canvas.width, canvas.height);
    // // con.drawImage(img,0,0,canvas.width,canvas.height);
    // var base64=canvas.toDataURL('image/jpg', 1);
    // return base64;
}

function biggerImage(img){
    var imgHeight = img.naturalHeight;
    var imgWidth = img.naturalWidth;
    var ratio  = imgWidth / imgHeight;
    var w = img.width,
        h = img.height,
        nextW = w * 1.2,
        nextH = h * 1.2;
    var wh ;
    if(nextW - w < 1) nextW = Math.ceil(nextW);
    var percent =  (nextW / imgWidth * 100).toFixed(0) ;
    if(percent > 90 && percent < 110){
        percent = 100;
        nextW = imgWidth;
        nextH = imgHeight;
    }
    else if(percent > 1600) {
        percent = 1600;
        nextW = imgWidth * 16;
        nextH = imgHeight * 16;
    }
    img.width = nextW;
    img.height = nextH;
    wh = {nextW,nextH,percent};
    showPercentTip();
    return wh;
    //showThumbnails(nextW, nextH);
}

function smallerImage(img){
    var imgHeight = img.naturalHeight;
    var imgWidth = img.naturalWidth;
    var ratio  = imgWidth / imgHeight;
    var w = img.width,
        h = img.height,
        nextW,
        nextH;
    var percent =  (w / 1.2 / imgWidth * 100).toFixed(0) ;
    var wh ;
    if(percent < 5) {
        percent = 5;
        nextW = imgWidth / 20;
        nextH = imgHeight / 20;
    }
    else if(percent > 90 && percent < 110){
        percent = 100;
        nextW = imgWidth;
        nextH = imgHeight;
    } else{
        nextW = w / 1.2;
        nextH = h / 1.2; 
    }
   
    img.width = nextW;
    img.height = nextH;
    wh = {nextW,nextH,percent};
    showPercentTip();
    return wh;
    //showThumbnails(nextW, nextH);
}

function showPercentTip(){
    $("#percentTip").show();
    $("#percentTip").fadeOut(1500);
}

function showThumbnails(width, height){
    if(isVertical) width = [height, height = width][0];
    if(width > document.body.clientWidth || height > document.body.clientHeight){
        $thumbnails.show();
        setThumbnails();
    } else{
        $thumbnails.hide();
    }
}

function loadImage(fileList, option, onFinished) {
    $.getJSON('/renlifang/personcore/getAttachment', {
        fileName: fileList,
        fileType: 'image',
        option: option
    }, rsp=>{
        if (rsp.code == 0) {
            onFinished(rsp.data);
        } else {
            onFinished();
        }
    })
}

function download(src,name){
    var $a = document.createElement('a');
    $a.setAttribute("href", src);
    $a.setAttribute("download", name);
    var evObj = document.createEvent('MouseEvents');
    evObj.initMouseEvent( 'click', true, true, window, 0, 0, 0, 0, 0, false, false, true, false, 0, null);
    $a.dispatchEvent(evObj);
}