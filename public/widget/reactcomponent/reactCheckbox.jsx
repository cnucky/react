
class Checkbox extends React.Component{
    constructor(props){
        super(props);
        this.state={option:props.option};
    }
    componentDidMount(){
        const _option=this.props.option;
        this.state.option=_option;
        var checked=_option.checked;
        this._toggleCheck(!checked);
    }

    componentWillReceiveProps(nextProps){
        const _option=nextProps.option;
        var checked=_option.checked;
        this._toggleCheck(!checked);
    }
    setChecked(value,e){
        this.state.option.checked=value;
        this._toggleCheck(!value);
        this._valueChangeHandler(e);
    }
    getOption(){
      return this.state.option;
    }

    _handleChecked(e){
        var disabled=this.refs["checkbox"].disabled;
        if(!disabled){
            var isChecked=this.refs["checkbox"].checked;
            this._toggleCheck(isChecked);
            this._valueChangeHandler(e);
        }

    }
    _valueChangeHandler(e){
        var isChecked=this.refs["checkbox"].checked;
        this.state.option.checked=isChecked;
        var clickEvent=this.props.clickEvent;
        if(clickEvent!=null && _.isFunction(clickEvent))
        {
            clickEvent(this.state.option,e);
        }
    }
    _toggleCheck(isChecked){

        if(isChecked) {
            $(this.refs["checkbox"]).removeAttr("checked");
        }
        else{
            $(this.refs["checkbox"]).prop("checked","checked");
        }
    }

    render(){
        var option=this.props.option;
        return(
        <span  onClick={this._handleChecked.bind(this)}>
           <input  ref="checkbox" type="checkbox" data-tag={option.data} className="filled-in" checked={option.checked} disabled={!option.editable} />
           <label >{option.text}</label>
         </span>

        )
    }
}

Checkbox.defaultProps={
    option: {
        data:'id',
        text:'text',
        checked:true,
        editable:true
    },
    clickEvent:function(option,e){}
};
module.exports.Checkbox=Checkbox;