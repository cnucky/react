import React from 'react';
import {render} from 'react-dom';
import {store} from './store';
import ListTable from './list-table';
import DetailTable from './detail-table';

class PageContent extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
        }
        
    }

    componentWillReceiveProps(nextProps) {
    }

    componentDidMount() {
    }

	render() {
		const { schemesummaryList, height, tasksummarylist, showDetailTable } = this.props
		return (
			<div className="page-content toBottom-deg-blue">
				<div className="list-table-wrap">
					<ListTable
						height={(height - 20) * 0.55}
						schemesummaryList={schemesummaryList}
					/>
				</div>
				<div className="detail-table-wrap">
					<DetailTable
						height={(height - 20) * 0.45}
						showDetailTable={showDetailTable}
						tasksummarylist={tasksummarylist}
					/>
				</div>
			</div>
		)
	}
}

export default PageContent


