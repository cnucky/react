import React from 'react';
import {render} from 'react-dom';
import { store } from '../store';



class AuthorityTabs extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            currentIndex : this.props.activeKey
        }
    }

    check_title_index( index ){
        return index === this.state.currentIndex ? "tab-title tab-active" : "tab-title"
    }

    check_item_index( index ){
        return index === this.state.currentIndex ? "tab-item tab-show" : "tab-item"
    }

    render(  ){
        let _this = this
        return(
            <div className="tab-wrap">
                <ul className="tab-title-wrap">
                    {
                        React.Children.map( this.props.children , element => {
                            return(
                                <li
                                onClick={ (  ) => {
                                        store.dispatch({type:'TABACTIVEKEY_GET',tabActiveKey:element.props.tabKey});
                                        this.setState({ currentIndex : element.props.tabKey })
                                     } }
                                className={ this.check_title_index( element.props.tabKey ) }
                                >
                                    { element.props.tabName }
                                </li>
                            )
                        })
                    }
                </ul>
                <div className="tab-item-wrap">
                    {
                        React.Children.map(this.props.children , element =>{
                            return(
                                <div className={ this.check_item_index( element.props.tabKey ) }>{ element }</div>
                            )
                        })
                    }
                </div>
            </div>
        )
    }
}


export default AuthorityTabs