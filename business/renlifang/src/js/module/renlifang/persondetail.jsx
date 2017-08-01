import React from 'react';
import AnalysisPanel from '../../../../../relationanalysis/src/js/pages/groupanalysis/analysis';

import { Affix, Button } from 'antd';

require('../../module/renlifang/styles.less');


export default class PersonDetail extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {

    }

    render() {
        let personDetail = this.props.personDetail;

        return(
            <div>
                {
                    _.map(personDetail.personProperty , (item , key) => {
                        return (
                            <div className="row mb10 ml5 mb50 " id={"spy-" + key + '-1'}  data-panel-color="false" data-panel-fullscreen="false" data-panel-remove="false" data-panel-collapse="false" data-panel-fullscreen="false">

                                <div className="panel-heading">
                                            <span className="panel-title">
                                                {item.groupName}
                                            </span>
                                </div>
                                <div className="panel-body pn">
                                    <div className="bs-component">
                                        <table className="table table-bordered">
                                            {
                                                _.map(item.children , (children , key) =>{

                                                    return(
                                                        <tbody className="group-item">
                                                        <tr>
                                                            <td className="text-primary mn fs14 fw400 text-center">
                                                                {children.itemName}
                                                            </td>
                                                            <td></td>
                                                        </tr>
                                                        {
                                                            _.map(children.properties , (properties , key)=>{
                                                                return(
                                                                    <tr>
                                                                        <td className="col-md-2 col-sm-2 mn fs14 fw400 text-center" style={{backgroundColor: "#f5f5f5"}}>
                                                                            {properties.name}
                                                                        </td>
                                                                        <td className="col-md-10 col-sm-10">

                                                                        </td>

                                                                    </tr>


                                                                )

                                                            })
                                                        }
                                                        </tbody>

                                                    )

                                                })
                                            }
                                        </table>
                                    </div>
                                </div>

                            </div>
                        )
                    })

                }

            </div>
        )


    }
}

module.exports = PersonDetail;

