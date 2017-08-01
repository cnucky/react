
class ReactDialog extends React.Component{
    constructor(props){
        super(props);
        this.state={
            opts:{
                id:props.opts.id,
                width:props.opts.width==null?'600px':props.opts.width,
                content:props.opts.content,
                isOpen:props.opts.isOpen,
                hideLeft:props.opts.hideLeft,
                hideRight:props.opts.hideRight,
                leftButtonText:props.opts.leftButtonText,
                rightButtonText:props.opts.rightButtonText,
                leftBtnCallback:props. opts.leftBtnCallback || function() {
                },
                rightBtnCallback:props. opts.rightBtnCallback || function() {
                }

            }
        };
    }

    componentDidMount(){
        var opts=this.state.opts;
        $('#'+opts.id+' [data-i18n]' ).localize();
        if(opts.isOpen){
            $('#'+opts.id).modal();
            $('#'+opts.id).modal('open');
        }
        if (opts.hideLeft == true) {
            $('#btn-model-left').hide();
        }
        if (opts.hideRight == true) {
            $('#btn-model-left').hide();
        }
    }

    componentWillReceiveProps(nextProps){
        this.state=nextProps;
        var opts=this.state.opts;
        if(opts.isOpen){
            $('#'+opts.id).modal('open');
        }

        if (opts.hideLeft == true) {
            $('#btn-model-left').hide();
        }
        if (opts.hideRight == true) {
            $('#btn-model-left').hide();
        }
    }
    render(){
        var opts=this.state.opts;

         return (

            <div id={opts.id} className="modal" >
                <div className="modal-content" style={{width:opts.width,margin:'30px auto',paddingBottom:'0px'}}>
                    <h5>{opts.content}</h5>
                    <div className="modal-footer" style={{background:'#ffffff',marginTop:'20px'}}>
                        <button id="btn-model-right"
                                className="modal-action modal-close waves-effect waves-light btn-flat z-depth-1 button-blue right"
                                onClick={opts.rightBtnCallback} > {opts.rightButtonText} </button>
                        <button id="btn-model-left" className="modal-action modal-close waves-effect waves-light btn-flat z-depth-1 button-blue right"
                                 onClick={opts.leftBtnCallback} >{opts.leftButtonText} </button>
                    </div>
                </div>

            </div>
        );
    }
}
ReactDialog.defaultProps={
    opts:{
        id:1,
        width:100,
        content:'content',
        isOpen:true,
        hideLeft:false,
        hideRight:true,
        leftButtonText:'lefttext',
        rightButtonText:'righttext',
        leftBtnCallback:function() {
        },
        rightBtnCallback:function() {
        }

    }
};
module.exports.ReactDialog = ReactDialog;

module.exports.DeleteDialog=function(containerId,callBackFun){
    var opts={
        id:'delDialog',
        width:'40%',
        content:i18n.t('businessManage.deleteDialog'),
        isOpen:true,
        hideLeft:false,
        hideRight:false,
        leftButtonText:i18n.t('businessManage.button.confirm'),
        rightButtonText:i18n.t('businessManage.button.cancel'),
        leftBtnCallback: callBackFun,
        rightBtnCallback:  function() {
        }
    };
    ReactDOM.render(<ReactDialog opts={opts} />,document.getElementById(containerId));
};