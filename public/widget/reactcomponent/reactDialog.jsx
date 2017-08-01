
class ReactDialog extends React.Component{
    constructor(props){
        super(props);
        this.state={
            opts:{
                id:props.opts.id,
                width:props.opts.width==null?'600px':props.opts.width,
                title:props.opts.title,
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

            <div id={opts.id} className="modal  modal-close-by-icon" >

                <div className="modal-dialog" style={{width:opts.width}}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{opts.title}</h2>
                            <a className="close modal-close" data-dismiss="modal"></a>
                        </div>
                        {opts.content}
                        <div className="modal-footer margin-top-15">
                            <button id="btn-model-right"
                                    className="waves-effect waves-light btn-flat z-depth-1 button-blue float-right closedetails modal-close margin-10-10-0-0"
                                    onClick={opts.rightBtnCallback} > {opts.rightButtonText} </button>
                            <button id="btn-model-left" className="waves-effect waves-light btn-flat z-depth-1 button-blue float-right modal-close margin-10-20-0-0"
                                     onClick={opts.leftBtnCallback} >{opts.leftButtonText} </button>
                        </div>


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
        title:'title',
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