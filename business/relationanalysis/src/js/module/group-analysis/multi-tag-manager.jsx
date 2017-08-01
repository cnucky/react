import React from 'react';
import {render} from 'react-dom';
class TagManager extends React.Component {
	constructor(props) {
		super(props);
	}

	editTag(itemId){
		this.props.editEvent(itemId);
	}

	removeTag(itemId){
		this.props.removeEvent(itemId);
	}

	render(){
		return(
				<div className={"form-group ml10"+ ( _.isEmpty(this.props.addressItemList) ? "hidden" : "")}  id="show-semantic">
                    <div className="hidden">
                        <input type="hidden" id="semanticmanager" className="form-control tm-input"/>
                    </div>
                    <div>
                        <div id="collision-semantic-tag">
                        {	_.map(this.props.addressItemList, function(item,key){
                        		var editTag = this.editTag.bind(this,item.id);
								var removeTag = this.removeTag.bind(this,item.id);
				        		return(
				        			<span className="tm-tag tm-tag-info" id={item.id} key={key}>
				        				<span className={"tm-tag-icon1 back-design " + this.props.typeDetail[item.type].class} id={"TbCJP_Icon_" + item.id} 
				        					 tagidforicon={item.id} onClick={editTag} style={{color:this.props.typeDetail[item.type].color}}></span>
				        				<span id={"TbCJP_Text_"+item.id} tagidfortext={item.id} onClick={editTag}>{item.value}</span>
				        				<a href="#" class="tm-tag-remove" className="tm-tag-remove" id={"TbCJP_Remover_"+item.id} tagidtoremove={item.id} onClick={removeTag}>x</a>
				        			</span>
				        			)
				        	},this)	
                    	}	
                        </div>
                    </div>
        		</div>
			)
	}
}
module.exports = {TagManager};