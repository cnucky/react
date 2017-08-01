import React from 'react';


import ScrollspyPanel from './scrollspy-panel';

export default class BasicInfoTab extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {

    }

    render() {
        let personDetail = this.props.personDetail;


        return (
            <ScrollspyPanel id="basic-info" height={this.props.height} personDetail={personDetail} infoData={personDetail.personProperty} />

        )
    }
}

module.exports = BasicInfoTab;

