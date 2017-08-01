

class RadioGroup extends React.Component{


    componentDidMount(){
        const _options=this.props.options;
        this.props.count=_options.length;
        for(let i=0;i<_options.length;i++){
            if(_options[i].checked){
                ReactDOM.findDOMNode(this.refs['radio-'+i]).defaultChecked=true;
            }else {
                ReactDOM.findDOMNode(this.refs['radio-'+i]).defaultChecked=false;
            }
        }
    }

    componentWillReceiveProps(nextProps){
        const _options=nextProps.options;
        for(let i=0;i<_options.length;i++){
            if(_options[i].checked){
                ReactDOM.findDOMNode(this.refs['radio-'+i]).defaultChecked=true;
            }else {
                ReactDOM.findDOMNode(this.refs['radio-'+i]).defaultChecked=false;
            }
        }
        const _selectvalue=nextProps.selectvalue;
        if(_selectvalue!=null)
        {
            for(let i=0;i<this.props.count;i++) {
                var item=ReactDOM.findDOMNode(this.refs['radio-' + i]);
                if (item.value==_selectvalue) {
                    item.defaultChecked = true;
                } else {
                    item.defaultChecked = false;
                }
            }
        }
    }

    _handleChecked(index,e){
        for(let i in this.refs){
            ReactDOM.findDOMNode(this.refs[i]).defaultChecked=false;
        }
        const _this=ReactDOM.findDOMNode(this.refs['radio-'+index]);
        _this.defaultChecked=true;

        var clickEvent=this.props.clickEvent;
        if(clickEvent!=null && _.isFunction(clickEvent))
        {
            clickEvent(e);
        }
    }

    render(){
        return(
            <div className="option-item">
                {this.props.options.map((item,index)=>
                    {
                        return (
                            <span key={index} onClick={this._handleChecked.bind(this,index)}>
                                <input ref={'radio-' + index} className="input-hidden" type="radio" name={item.name} value={item.value}/>
                                <label> {item.text}</label>
                            </span>
                        )
                    })
                }
            </div>
        )
    }
}

RadioGroup.defaultProps={
    options:[
        {
            name:'name1',
            value:'value1',
            text:'text1',
            checked:true,

    },{
            name:'name2',
            value:'value2',
            text:'text2',
            checked:true,

        }
    ],
    count:2,
    selectvalue:'value2',
    clickEvent:function(e){}
};

module.exports.RadioGroup=RadioGroup;