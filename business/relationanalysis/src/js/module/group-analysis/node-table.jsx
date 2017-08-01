var React = require('react');
import {store, MODE} from './store';
const FileSaver = require('utility/FileSaver/FileSaver');

const PERSON_EXPORT = {
	personName:'人物名称',
	nodes:'人物实体',
	totalScore:'总得分',
    scoreDetail:'关系详情',
	personDetail:''
};
const ENTITY_EXPORT = {
	nodeId:'实体ID',
	nodeTitle:'实体标题',
	nodeTypeLabel:'实体类型',
    linkScore:'亲密度得分',
	linkDetail:'关系详情',
	detail:''
};
const PERSON_EXPORT_TARGET ={
	personName:'人物名称',
	entityNodes:'人物实体',
	linkDetail:'关系详情'
}
const ENTITY_EXPORT_TARGET ={
	nodeId:'实体ID',
	nodeTitle:'实体标题',
	nodeType:'实体类型',
	linkDetail:'关系详情'
} 
export default class NodeTable extends React.Component {
    constructor(props) {
        super(props);
        this.onExportClick = this.exportExcel.bind(this);
        this.onSearchClick = this.searchNodes.bind(this);
        this.onClearSearch = this.clearSearch.bind(this);
        this.state = {keyword: ''};
    }

    exportExcel() {
    	var tableContent = '', maxRecordCount = 0;
		var that = this;
		var keyToExport = [];
		switch (this.props.mode){
            case MODE.COHESION:
            	var nodes = _.filter(this.props.nodes, function (item) {
					return !item.nextLevelNodes;
				});
				keyToExport = this.props.isEntity ? ENTITY_EXPORT : PERSON_EXPORT;
	        	_.each(nodes, function (node, index) {
		    		var temp = {...node};
		            var first = true;
					var relationDetail = [] ,nodeDetail = [] ,detailInfo;

					_.each(temp.nodes , (i , key)=> {
		                temp.nodes = '实体ID:'+i.nodeId+'; 实体类型:'+ that.props.metadata.entityMeta[i.nodeType];
					});

		            _.each(temp.linkDetail, (link , key) => {
		                var info =`实体:${link.fromNodeId}(${link.fromNodeType})到实体:${link.toNodeId}(${link.toNodeType})`
							+ ` 关系为${link.linkedTitle}(${link.linkedType})  通联频次:${link.linkedFrequency}  亲密度得分:${link.score}`;
		                nodeDetail.push(info);
		                _.each(link.detail, (item, index) => {
							detailInfo = `${item.startTime}到${item.endTime}，${item.frequency}次`;
		                    relationDetail.push(detailInfo);
						});
		            });

					_.each(temp.scoreDetail, (link , key) => {
		                var info =`人物:${link.fromNodeId}到人物:${link.toNodeId}`
							+ ` 关系为${link.linkedTitle}(${link.linkedType}) 通联频次:${link.linkedFrequency} 亲密度得分:${link.score}`;
		                nodeDetail.push(info);
		                _.each(link.detail, (item, index) => {
		                    detailInfo = `${item.startTime}到${item.endTime}，${item.frequency}次`;
		                    relationDetail.push(detailInfo);
		                });
					});

					if (that.props.isEntity) {
		                temp.linkDetail = nodeDetail.join('；');
		                temp.detail = relationDetail.join(',');
					} else {
		                temp.scoreDetail = nodeDetail.join('；');
		                temp.personDetail = relationDetail.join(',');
					}

		            if (relationDetail.length > maxRecordCount) {
		                maxRecordCount = relationDetail.length;
		            }

					_.each(keyToExport, (item , key) => {
						if(!temp[key]){
							return;
						}
						if (!first) {
							tableContent += ',';
						}

						tableContent += temp[key];
						first = false;
					})
		            	tableContent += '\r\n';
					});
		            break;
            case MODE.MULTI_TARGET:
            	keyToExport = this.props.isEntity ? ENTITY_EXPORT_TARGET : PERSON_EXPORT_TARGET;
            	tableContent = this.getTargetExportData(this.props.analysisData,this.props.selectData,this.props.metadata.entityMeta);
            	break;

		}


    	var tableHeader = '';
        _.each(keyToExport ,(item, key)=>{
        	if (!_.isEmpty(item)) {
            	tableHeader += item + ',';
			}
        });
        for (var i = 1; i <= maxRecordCount; i++) {
        	tableHeader += '记录' + i;
        	if (i < maxRecordCount) {
        		tableHeader += ',';
			}
		}
		if(tableHeader.length>1)
		{
			tableHeader = tableHeader.substr(0,tableHeader.length-1);
		}		
		tableContent = tableHeader + '\r\n' +  tableContent;

        var fileName = '所有节点.xls'; //文件名
        FileSaver.saveAs(
            new Blob(
                ["\ufeff" + tableContent] //\ufeff防止utf8 bom防止中文乱码
                , {type: "application/vnd.ms-excel;charset=charset=utf-8"}
            ) , fileName);
	}

	getTargetExportData(analysisData,selectData,entityMeta){
		var nodes;
		var edges;
		var tableContent = '';
		if(this.props.isEntity)
		{
			nodes = _.isEmpty(selectData.entity) ? analysisData.nodes.nodes : selectData.entity[0] ;
			edges = this.props.isEntity ? analysisData.nodes.edges : selectData.entity[1];
		}
		else
		{
			nodes = _.isEmpty(selectData.people) ? analysisData.persons.persons : selectData.people[0] ;
			edges = this.props.isEntity ? analysisData.persons.edges : selectData.people[1];
		}
		var keyToExport = this.props.isEntity ? ENTITY_EXPORT_TARGET : PERSON_EXPORT_TARGET;
		var isEntity = this.props.isEntity;
    	_.each(nodes, function (node, index) {
    		var temp = {...node};
    		if(temp.data)
    		{
    			temp = temp.data;
    		}
            var first = true;
			var linkDetail = [];
			temp.entityNodes = [];
			_.each(temp.nodes , (i , key)=> {
                i = `实体ID:${i.nodeId} 实体类型:${entityMeta[i.nodeType]}`;
                temp.entityNodes.push(i);
			});

			_.each(edges, (edge, key) =>{
				var tempLink = {...edge};
				if(tempLink.data)
				{
					tempLink = tempLink.data;
				}
				if(!isEntity)
				{
					if(tempLink.fromPersonId == temp.personId || tempLink.toPersonId == temp.personId)
					{
						_.each(tempLink.linkDetail,(link, i)=>{
							var info =`实体:${link.fromNodeId}(${link.fromNodeType})到实体:${link.toNodeId}(${link.toNodeType})`
						+ ` 关系为${link.linkedTitle}(${link.linkedType})`;
							if(!_.isEmpty(link.detail))
							{
								_.each(link.detail, (item, j) => {
				                    info = info + `${item.startTime}到${item.endTime}(${item.frequency}次);`;
				                    linkDetail.push(info);
		                		});
							}
							else
							{
								info = info+`;`;
								linkDetail.push(info);
							}
						});
					}
				}
				else
				{
					if(tempLink.fromNodeId == temp.nodeId || tempLink.toNodeId == temp.nodeId)
					{	
						var info = `实体:${tempLink.fromNodeId}(${tempLink.fromNodeType})到实体:${tempLink.toNodeId}(${tempLink.toNodeType}) `;
						_.each(tempLink.linkDetail,(link, i)=>{
							info = info + `关系为${link.linkedTitle}(${link.linkedType}) `;
							if(!_.isEmpty(link.detail))
							{
								_.each(link.detail, (item, j) => {
				                    info = info + `${item.startTime}到${item.endTime}(${item.frequency})次;`;
				                    linkDetail.push(info);
		                		});
							}
							else
							{
								info = info+`;`;
								linkDetail.push(info);
							}
							
						});
					}
				}
				
			});
			temp.linkDetail = "";
			_.each(linkDetail,(link)=>{
				temp.linkDetail = temp.linkDetail + link;
			});
			_.each(keyToExport, (item , key) => {
				if(!temp[key]){
					return;
				}
				if (!first) {
					tableContent += ',';
				}
				tableContent += temp[key];
				first = false;
			})
        	tableContent += '\r\n';
		});
		return tableContent;

	}
    searchNodes() {
		var keyword = this.refs.keywordInput.value.trim();
		if (_.isEmpty(keyword)) {
			return;
		}
		this.setState({
			keyword: keyword
		});
    }

    clearSearch() {
        this.refs.keywordInput.value = '';

    	this.setState({
    		keyword: ''
		});
	}

	handleClicked(e) {

	}

	handleDoubleClicked(e) {

	}
	onCloseClick(){
		store.dispatch({type: 'TOGGLE_NODE_TABLE', source: this.props.mode});
	}

	isMatched(content) {
    	if (_.isUndefined(content)) {
    		return false;
		} else if (!_.isString(content)) {
            content = content.toString();
        }
    	return this.state && !_.isEmpty(this.state.keyword) && content.indexOf(this.state.keyword) != -1;
    }

	render() {
		var nodes = this.props.nodes, inSearching = !_.isEmpty(this.state.keyword);

		if (_.isEmpty(nodes)) {
			return <div className="text-center p10 roundrect-panel">没有节点数据</div>
		}

		var columns = this.props.columns;

		if (inSearching) {
			nodes = _.filter(nodes, node=>{
				return _.find(columns, col => {
                    return this.isMatched(node[col.key]);
                });
			});
		}

		var long = 100%columns.length;
		
		var table = _.map(nodes, _.bind(function (node,index) {
			return (
				<tr key={index} onClick={(e)=>{
					this.setState({selectedKey: node.key});
                	_.isFunction(this.props.onItemClick) && this.props.onItemClick(node);
				}} className={( this.state.selectedKey == node.key )? "primary" : ""}>
				{
						_.map(columns, col => {
							return (<td  className={"p6 text-center text-ellipsis " + (this.isMatched(node[col.key]) ? 'text-primary' : '')}>{node[col.key]}</td>);
						})
				}
				</tr>
            )
        }, this));

        return (
            <div className="fixtable" style={{borderRadius: '8px', background: '#eee'}}>
				<div id="fixTable" style={{maxHeight:'250px'}}>
					<table ref="nodeTable" className="table table-hover table-striped ">
						<thead className="fixHead" style={{display:'table' ,  width:'100%', tableLayout:'fixed'}}>
							<tr className="fixTr">
							{
								_.map(columns, col => {
									return (<th className="sortable text-center">{col.text}</th>);
								})
							}
							</tr>
						</thead>
						<tbody className="fixBody" style={{display:'block' , height:'210px' , overflowY:'scroll'}}>
							{table}
						</tbody>
					</table>
				</div>
				<div className="br-a p5 admin-form theme-primary" style={{background: 'white', height: '40px'}}>
					<div className="smart-widget sm-right smr-50 col-sm-4">
						<label className="field">
							<input type="text" ref="keywordInput" className="gui-input pn pl10 pr10" placeholder="请输入搜索内容"
								   style={{height: '30px', paddingRight: '30px !important'}} onKeyUp={event=>{
								if (event.keyCode == 13) {
									this.onSearchClick();
								}
							}}/>
							<span className={(this.state && !_.isEmpty(this.state.keyword) ? "" : "hidden") + " fa fa-times btn-close-detail"}
								  onClick={this.onClearSearch} style={{position: 'absolute', right: 12, lineHeight: '30px'}}></span>
						</label>
						<button type="submit" className="button btn-xs btn-primary" style={{height: '30px', lineHeight: '30px'}} onClick={this.onSearchClick}>
							<i className="fa fa-search"></i>
						</button>
					</div>
					<div className="col-md-8 text-right">
						<button type="button" className="btn btn-xs btn-rounded btn-primary" style={{marginTop: '2px',marginRight: '15px'}}
								onClick={this.onExportClick}>导出</button>
						<button type="button" className="btn btn-xs btn-rounded btn-danger" style={{marginTop: '2px'}}
								onClick={this.onCloseClick.bind(this)}>关闭</button>
					</div>
				</div>
			</div>
        )
    }
}