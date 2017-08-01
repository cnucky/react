var Redux = require('redux');
/** dependency */
import uuid from 'node-uuid';

/*******************************************************************
 * store's structure 
 *******************************************************************/
/**
    {
        modelId: '7193',
        modelName: '上上下下左右左右BABA',
        modelDetail: {},

        //页面框架
        framework: [
            {
                type: 'COLUMN',
                id: 0000,
                children: [
                    {
                        type: 'CHART',
                        id: 0000,
                    },
                    {
                                            //空白页
                    },
                    {
                        type: 'TAB',
                        id: 0000,
                        children: [...]     //最多两层 && 只能为chart
                    }
                ]
            }
        ],

        //整块card设置
        card： {
            name: '',
            showName: true,
            isSelected: true,
            showPadding: true,              //card边距 
            padding：10,                    //边距值
            widthType: fix || define,       //fix:自适应 || define：自定义
            width：750,
            theme: 'macarons',
            comments: ''
        },

        //记录布局属性
        layouts: [
            {
                layoutType,
                id: uuid.v1(),
                isSelected: false,          //布局是否选中   
                activePage：0               //活动页
            }
        ],

        //charts数组,记录显示的各个图表的属性
        charts: [
            {
                详见图表初始化属性
            },
        ]
    }
 */



/*******************************************************************
 * Store
 *******************************************************************/

/** 各类图表的初始化属性 */
function defaultProps(chartType) {
    return {
        /** 样式 */
        'isSelected': false,
        'height': undefined,
        'showTitle': true,              
        'titlePosition': 'left',        
        /** 数据 */
        'dataSourceInfo': undefined, 
        'dimension': [],
        'measure': chartType === 'COMMONTABLE' ? 200 : [],
        'data': [],
        'defineData': []
    };
}

var DEFAULT_COMMONTABLE = {
    'title': '表格',
    'pagination': false,            /** 显示分页 */
    'showSequenceNumber': false,    /** 显示序号 */
    'showCheckbox': false,          /** 显示多选 */
    'showFilter': false             /** 显示过滤 */
}

var DEFAULT_CROSSTABLE = {
    'title': '交叉表',
    'pagination': true,            /** 显示分页 */
    'showCheckbox': false           /** 显示多选 */
}

var DEFAULT_LINE = {
    'title': '线图',
    'transverse': false,            /** 横向 */
    'area': false,                  /** 面积 */
    'smooth': false,                /** 曲线 */
    'showX': true,                 /** 显示X轴 */
    'showY': true,                 /** 显示y轴 */
    'showAxisName': true           /** 显示轴标题 */
};

var DEFAULT_BAR = {
    'title': '柱图',
    'transverse': false,            /** 横向 */
    'showX': true,                 /** 显示X轴 */
    'showY': true,                 /** 显示y轴 */
    'showAxisName': true           /** 显示轴标题 */
};

var DEFAULT_RADAR = {
    'area': false,                  /** 面积 */
    'showAxisName': true          /** 显示轴标题 */
}

var DEFAULT_PIE = {
    'title': '饼图',
    'showAxisName': true,           /** 显示轴标题 */
    'mode': 'default',              /** default:默认 hollow:空心 */
    'tooltipStyle': 2              /** 标签样式 tooltip */
}

var DEFAULT_COMMON = {
    'showTooltip': true,
    'showLegend': true,
    'legendPosition': 'top',
    'theme': 'customize'
}

/** 获得 layout 在 framework 树中的位置 */
function getLayoutIndex(framework, id) {
    var index = [];
    _.each(framework, function(item1, index1) {
        //第一层找到了父容器
        if(item1.id == id) {
            index.push(index1);
            return index;
        }
        //第二层找到了父容器
        else {
            _.each(item1.children, function(item2, index2) {
                if(item2.id == id) {
                    index.push(index1);
                    index.push(index2);
                    return index;
                }
            })
        }
    })
    return index;
}

/** 获得 chart 在 franework 中的位置 */
function getChartIndex(framework, id) {
    var index = [];
    _.each(framework, function(item1, index1) {
        _.each(item1.children, function(item2, index2) {
            if(item2.id == id) {
                index.push(index1);
                index.push(index2);
                return index;
            }
            else if(item2.children) {
                _.each(item2.children, function(item3, index3) {
                    if(item3.id == id) {
                    index.push(index1);
                    index.push(index2);
                    index.push(index3);                    
                    return index;
            }
                })
            }
        })
    })
    return index;
}

/** 根据chart的 ID 和 type initChart*/
function createChart(chartType, id) {
    var chart = { 'chartType':chartType, 'id':id };
    switch(chartType) {
        case 'LINE':
            chart = _.assign(chart, defaultProps(chartType), DEFAULT_LINE, DEFAULT_COMMON);
            break;
        case 'AREALINE':
            chart = _.assign(chart, defaultProps(chartType), DEFAULT_LINE, DEFAULT_COMMON, { area: true , title:'面积线图'});
            break;        
        case 'BAR':
            chart = _.assign(chart, defaultProps(chartType), DEFAULT_BAR, DEFAULT_COMMON);
            break;
        case 'HORIZONTALBAR':
            chart = _.assign(chart, defaultProps(chartType), DEFAULT_BAR, DEFAULT_COMMON, { transverse: true , title:'横向柱图'});
            break;
        case 'RADAR':
            chart = _.assign(chart, defaultProps(chartType), DEFAULT_RADAR, DEFAULT_COMMON, { title:'雷达图'});
            break;
        case 'PIE':
            chart = _.assign(chart, defaultProps(chartType), DEFAULT_PIE, DEFAULT_COMMON);
            break;
        case 'BUBBLE':
            chart = _.assign(chart, defaultProps(chartType), DEFAULT_COMMON, { title:'气泡图'});
            break;
        case 'WORDCLOUD':
            chart = _.assign(chart, defaultProps(chartType), DEFAULT_COMMON, { title:'词云图'});
            break;
        case 'MAP':
            chart = _.assign(chart, defaultProps(chartType), DEFAULT_COMMON, { title:'热力地图'});
            break;
        case 'SCATTER':
            chart = _.assign(chart, defaultProps(chartType), DEFAULT_COMMON, { title:'散点地图'});
            break;
        case 'COMMONTABLE':
            chart = _.assign(chart, defaultProps(chartType), DEFAULT_COMMONTABLE);
            break;
        case 'CROSSTABLE':
            chart = _.assign(chart, defaultProps(chartType), DEFAULT_CROSSTABLE);
            break;
        default: 
            return undefined;
    }
    return chart;
}

/** 根据type 和 id 生成 layout */
function createLayout(layoutType, id) {
    switch(layoutType) {
        case 'COLUMN':
            return {
                'layoutType': layoutType,
                'id': id,
                'isSelected': false,
                'activePage': 0,
                'num': 1
            };
        case 'TAB':
            return {
                'layoutType': layoutType,
                'id': id,
                'isSelected': false,
                'activePage': 0,
                'num': 1,
                'titles': ["选项卡"]
            };
        case 'IFRAME':
            return {
                'layoutType': layoutType,
                'id': id,
                'isSelected': false,
                'iFrameUrl': '',
                'iFrameProportion': '80%',
                'height': 150
            };
        default:
            return undefined;
    }
}

/** 在framework中删除chart并返回chart对象 */
function deleteChart(framework, layouts, charts, id) {

    /** 从charts中删除 */
    let deleteChart = undefined;
    let index_charts = _.findIndex(charts, (chart) => { return chart.id === id });
    if(index_charts != -1) {
        deleteChart = charts[index_charts];
        charts.splice(index_charts, 1);
    }

    /** 从framework中删除 */
    let index = getChartIndex(framework, id);
    if(index.length === 2) {        
        framework[index[0]].children[index[1]] = {};
        if(framework[index[0]].id === 0)
            framework.splice(index[0], 1);
    }
    else if(index.length === 3) {        
        framework[index[0]].children[index[1]].children[index[2]] = {};
    }

    /** 从layouts中删除 */
    let index_layouts = _.findIndex(layouts, (layout) => { return layout.id === 0 });
    if(index_layouts != -1)
        layouts.splice(index_layouts, 1);

    return { framework:framework, layouts:layouts, charts:charts, deleteChart:deleteChart };
}

/** 获取现存的在framework中的id列表 */
function getChartIdsIn(node) {
    let idList = [];
    for(let i = 0; i < node.length; i++) {
        if(node[i].type === "CHART")
            idList.push(node[i].id);
        
        if(node[i].children) {
            idList = idList.concat(getChartIdsIn(node[i].children));
        }
    }
    return idList;
}

/** 清理僵尸charts */
function clearCharts(framework, charts) {
    let chartsIdlist = getChartIdsIn(framework);
    let chartsList = []
    for(let i = 0; i < chartsIdlist.length; i++) {
        let chart = _.find(charts, function(item) { return item.id === chartsIdlist[i] });
        !_.isUndefined(chart) && chartsList.push(chart);
    }
    return chartsList;
}

/** 将card的isSelected属性改为true, 其余layout、chart改为false */
function cardSelect(card, layouts, charts) {
    card.isSelected = true;
    _.each(charts, (chart) => { chart.isSelected = false });
    _.each(layouts, (layout) => { layout.isSelected = false });
    return { 'card':card, 'charts':charts, 'layouts':layouts };    
}

/** reducer */
var reducer = function(state = {}, action) {
    switch(action.type) {
        case 'INIT': {
            var card = { 
                isSelected:true, 
                name:'未命名图表',
                showName:true, 
                showPadding:true, 
                padding:10,
                widthType:'fix', 
                width:750, 
                theme:'none',
                comments: ''
            };
            return _.assign({}, state, { 'framework':[],'modelDetail' : {} ,'card':card, 'layouts':[], 'charts':[] });
        }
        case 'REPLACE': {
            return action.state;
        }
        case 'ADD_REPORTID': {
            return _.assign({}, state, { reportId: action.reportId});
        }
        case 'ADD_TASKID': {
            return _.assign({}, state, { taskId: action.taskId});
        }
        case 'ADD_MODELDINGINFO': {
            state.card.name =  action.modelName;
            state.reportId =  action.reportId;
            return _.assign({}, state, { modelId: action.modelId, modelName: action.modelName, modelDetail: action.modelDetail });
        }
        case 'SELECT_CARD': {
            let card = state.card;
            let charts = state.charts;
            let layouts = state.layouts;

            return _.assign({}, state, cardSelect(card, layouts, charts));      
        }
        case 'UPDATE_CARD': {
            delete action.type;
            let card = state.card;
            card = _.assign(card, action);
            return _.assign({}, state, { card:card });
        }
        case 'MOVE_CHART': {
            let framework = state.framework;
            let layouts = state.layouts;
            let charts = state.charts;
            let dragChart;

            /** 找到拖动的图 并删除*/
            let res = deleteChart(framework, layouts, charts, -1);
            framework = res.framework;
            layouts = res.layouts;
            charts = res.charts;
            dragChart = res.deleteChart;
            if(_.isUndefined(dragChart))
                dragChart = createChart(action.chartType, -1);

            /** 根据移动的目的修改id */
            var id_layout;
            if(action.purpose === 'DROP') {
                dragChart.id = uuid.v1();
                id_layout = uuid.v1();
            }
            else if(action.purpose === 'PREVIEW') {
                dragChart.id = -1;
                id_layout = 0;
            }

            /** 添加到charts数组中 */
            charts.push(dragChart);
            
            /** 添加到framework中 */
            if(action.dropTarget === 'CARD') {
                let dropTargetPosition = action.dropTargetPosition;
                framework.splice(dropTargetPosition, 0, { 'type': 'COLUMN', 'id': id_layout, 'children': [{ type:'CHART', id:dragChart.id }] });
                layouts.push(createLayout("COLUMN", id_layout));
            }
            else if(action.dropTarget === 'COLUMN') {
                let dropTargetID = action.dropTargetID;
                let dropTargetPosition = action.dropTargetPosition;
                let dropIndex = getLayoutIndex(framework, dropTargetID);
                if(dropIndex.length == 1) {
                    if(action.oprType === 'INSERT') {
                        framework[dropIndex[0]].children.splice(dropTargetPosition, 0, { type:'CHART', id:dragChart.id });
                        /** layouts数组中num++ */
                        let index_layouts = _.findIndex(layouts, (layout) => { return layout.id === dropTargetID });
                        layouts[index_layouts].num++;
                    }
                    else if(action.oprType === 'REPLACE')
                        framework[dropIndex[0]].children[dropTargetPosition] = { type:'CHART', id:dragChart.id };
                }
                else if(dropIndex.length == 2) {
                    if(action.oprType === 'INSERT') {
                        framework[dropIndex[0]].children[dropIndex[1]].children.splice(dropTargetPosition, 0, { type:'CHART', id:dragChart.id });
                        /** layouts数组中num++ */
                        let index_layouts = _.findIndex(layouts, (layout) => { return layout.id === dropTargetID });
                        layouts[index_layouts].num++;
                    }
                    else if(action.oprType === 'REPLACE')
                        framework[dropIndex[0]].children[dropIndex[1]].children[dropTargetPosition] = { type:'CHART', id:dragChart.id };  
                }
            }
            else if(action.dropTarget === 'TAB') {
                let dropTargetID = action.dropTargetID;
                let dropTargetPosition = action.dropTargetPosition;
                let dropIndex = getLayoutIndex(framework, dropTargetID);
                if(dropIndex.length == 1) {
                    if(framework[dropIndex[0]].children.length < dropTargetPosition) {
                        framework[dropIndex[0]].children.push({ type:'CHART', id:dragChart.id });
                        /** layouts数组中num++ */
                        let index_layouts = _.findIndex(layouts, (layout) => { return layout.id === framework[dropIndex[0]].id });
                        layouts[index_layouts].activePage = framework[dropIndex[0]].children.length - 1;
                        layouts[index_layouts].num++;
                        layouts[index_layouts].titles.push("选项卡");                        
                    }
                    else {
                        framework[dropIndex[0]].children[dropTargetPosition] = { type:'CHART', id:dragChart.id };                        
                        let index_layouts = _.findIndex(layouts, (layout) => { return layout.id === framework[dropIndex[0]].id });
                        layouts[index_layouts].activePage = dropTargetPosition;                        
                    }                      
                }
                else if(dropIndex.length == 2) {
                    if(framework[dropIndex[0]].children[dropIndex[1]].children.length < dropTargetPosition) {
                        framework[dropIndex[0]].children[dropIndex[1]].children.push({ type:'CHART', id:dragChart.id });
                        /** layouts数组中num++ */
                        let index_layouts = _.findIndex(layouts, (layout) => { return layout.id === framework[dropIndex[0]].children[dropIndex[1]].id });
                        layouts[index_layouts].activePage = framework[dropIndex[0]].children[dropIndex[1]].children.length - 1;
                        layouts[index_layouts].num++;                     
                        layouts[index_layouts].titles.push("选项卡");
                    }
                    else {
                        framework[dropIndex[0]].children[dropIndex[1]].children[dropTargetPosition] = { type:'CHART', id:dragChart.id };                        
                        let index_layouts = _.findIndex(layouts, (layout) => { return layout.id === framework[dropIndex[0]].children[dropIndex[1]].id });
                        layouts[index_layouts].activePage = dropTargetPosition;                        
                    }                        
                }
            }

            return _.assign({}, state, { 'framework':framework, 'layouts':layouts, 'charts':charts }); 
        }
        case 'DELETE_CHART': {
            let chartID = action.id;
            let charts = state.charts;
            let layouts = state.layouts;
            let framework = state.framework;
            let res = deleteChart(framework, layouts, charts, chartID);

            /** 删除后默认选中card */
            framework = res.framework;
            layouts = res.layouts;
            charts = res.charts;
            res = cardSelect(state.card, layouts, charts);

            return _.assign({}, state, { 'framework':framework, 'card':res.card, 'layouts':res.layouts, 'charts':res.charts });
        }
        case 'SELECT_CHART': {
            let card = state.card;
            let charts = state.charts;
            let layouts = state.layouts;

            card.isSelected = false;
            _.each(charts, (chart) => { chart.isSelected = false });
            _.each(layouts, (layout) => { layout.isSelected = false });
            let index = _.findIndex(charts, (chart) => { return chart.id == action.id });
            if(index != -1) {
                charts[index].isSelected = true;
            }
            return _.assign({}, state, { 'card':card, 'charts':charts, 'layouts':layouts });      
        }
        case 'UPDATE_CHART': {
            let charts = state.charts;
            let framework = state.framework;


            if(action.newId) {
                let index = getChartIndex(framework, action.id);
                if(index.length === 2)
                    framework[index[0]].children[index[1]].id = action.newId;
                else if(index.length === 3)
                    framework[index[0]].children[index[1]].children[index[2]].id = action.newId;

                index = _.findIndex(charts, (chart) => { return chart.id == action.id });
                charts[index].id = action.newId;
                charts[index].pagination = action.pagination;
            }
            else {
                let index = _.findIndex(charts, (chart) => { return chart.id == action.id });
                delete action.type;

                charts[index] = _.assign(charts[index], action);
            }
            return _.assign({}, state, { charts:charts, framework:framework });
        }
        case 'DROP_CHART': {
            let framework = state.framework;
            let charts = state.charts;
            let layouts = state.layouts;

            let newId_chart = uuid.v1();
            let index = getChartIndex(framework, -1);
            if(index.length === 2) {
                framework[index[0]].children[index[1]].id = newId_chart;
                let index_charts = _.findIndex(charts, (chart) => {
                    return chart.id === -1;
                })
                charts[index_charts].id = newId_chart;
            }
            else if(index.length === 3) {
                framework[index[0]].children[index[1]].children[index[2]].id = newId_chart;
                let index_charts = _.findIndex(charts, (chart) => {
                    return chart.id === -1;
                })
                charts[index_charts].id = newId_chart;
            }

            let newId_layout = uuid.v1();
            index = getLayoutIndex(framework, 0);
            if(index.length === 1) {
                framework[index[0]].id = newId_layout;
                let index_layouts = _.findIndex(layouts, (layout) => {
                    return layout.id === 0;
                })
                layouts[index_layouts].id = newId_layout;
            }
            else if(index.length === 2) {
                framework[index[0]].children[index[1]].id = newId_layout;
                let index_layouts = _.findIndex(layouts, (layout) => {
                    return layout.id === -1;
                })
                layouts[index_layouts].id = newId_layout;
            }

            return _.assign({}, state, { 'framework':framework, 'layouts':layouts, 'charts':charts });
        }
        case 'MOVE_LAYOUT': {
            let framework = state.framework;
            let layouts = state.layouts;

            /** 删除 */ 
            let index = getLayoutIndex(framework, 0);
            if(index.length === 1)
                framework.splice(index[0], 1);
            else if(index.length === 2)
                framework[index[0]].children[index[1]] = {};
            let index_layouts = _.findIndex(layouts, (layout) => { return layout.id === 0 });
            (index_layouts != -1) && (layouts.splice(index_layouts, 1));

            /** 添加 */
            let id_layout = action.layoutId;
            let layoutType = action.layoutType;
            if(action.dropTarget === 'CARD') {
                let dropTargetPosition = action.dropTargetPosition;
                framework.splice(dropTargetPosition, 0, { 'type':layoutType, 'id':id_layout, 'children':[{}] });
                layouts.push(createLayout(layoutType, id_layout));
            }
            else if(action.dropTarget === 'COLUMN' || action.dropTarget === 'TAB') {
                index = getLayoutIndex(framework, action.dropTargetID);
                let dropTargetPosition = action.dropTargetPosition;
                if(index.length == 1) {
                    framework[index[0]].children[dropTargetPosition] = {
                        'type': layoutType,
                        'id': id_layout,
                        'children': [{}]
                    };   
                    layouts.push(createLayout(layoutType, id_layout));                   
                }
            }
            return _.assign({}, state, { 'framework':framework, 'layouts':layouts }); 
        }
        case 'DELETE_LAYOUT': {
            let framework = state.framework;
            let layouts = state.layouts;
            let id = action.id;
            let index = getLayoutIndex(framework, id);
            
            /** 从framework中删除 */
            if(index.length == 1) {
                let index_layouts = _.findIndex(layouts, (layout) => {
                    return layout.id === id;
                })
                framework.splice(index[0], 1);
                layouts.splice(index_layouts, 1);
            }
            else if(index.length == 2) {
                let index_layouts = _.findIndex(layouts, (layout) => { return layout.id === id });
                framework[index[0]].children[index[1]] = {};
                layouts.splice(index_layouts, 1);
            }

            /** 删除后默认选中card */
            let charts = clearCharts(framework, state.charts);
            let res = cardSelect(state.card, layouts, charts);

            return _.assign({}, state, { 'framework':framework, 'card':res.card, 'layouts':res.layouts, 'charts':res.charts }); 
        }
        case 'EXPAND_LAYOUT': {
            let framework = state.framework;
            let layouts = state.layouts;
            let expandNum = action.expandNum;

            /** framework中扩展*/
            let index = getLayoutIndex(framework, action.id);
            let activePage = 0;
            if(index.length === 1) {
                for(let i = 0; i < expandNum; i++) {
                    framework[index[0]].children.push({});
                }
                activePage = framework[index[0]].children.length - 1;
            }
            else if(index.length === 2) {
                for(let i = 0; i < expandNum; i++) {
                    framework[index[0]].children[index[1]].children.push({});
                }
                activePage = framework[index[0]].children[index[1]].children.length - 1;
            }

            /** activePage置为最新页， 若为tab则添加title */
            let index_layouts = _.findIndex(layouts, (layout) => { return layout.id === action.id });
            if(layouts[index_layouts].layoutType === 'TAB') {
                for(let i = 0; i < expandNum; i++) {
                    layouts[index_layouts].titles.push("选项卡");
                }
            }
            layouts[index_layouts].activePage = activePage;
            layouts[index_layouts].num = activePage + 1;

            return _.assign({}, state, { framework:framework, layouts:layouts });
        }
        case 'SHRINK_LAYOUT': {
            let framework = state.framework;
            let card = state.card;
            let layouts = state.layouts;
            let charts = state.charts;

            /** 找到在layouts数组中的位置 */
            let index_layouts = _.findIndex(layouts, (layout) => { return layout.id === action.id });
            
            /** framework中缩减特定一页 */
            let index = getLayoutIndex(framework, action.id);
            if(index.length === 1) {
                framework[index[0]].children.splice(action.position, 1);
                layouts[index_layouts].activePage = (action.position - 1 >= 0) ? action.position - 1 : 0;
                layouts[index_layouts].num = framework[index[0]].children.length;
                !_.isUndefined(layouts[index_layouts].titles) && (layouts[index_layouts].titles.splice(action.position, 1));

                if(framework[index[0]].children.length === 0) {
                    framework.splice(index[0], 1);
                    layouts.splice(index_layouts, 1);
                    /** 删除后默认选中card */
                    let res = cardSelect(card, layouts, charts);
                    card = res.card;
                    layouts = res.layouts;
                    charts = res.charts;
                }
            }
            else if(index.length === 2) {
                framework[index[0]].children[index[1]].children.splice(action.position, 1);
                layouts[index_layouts].activePage = (action.position - 1 >= 0) ? action.position - 1 : 0;
                layouts[index_layouts].num = framework[index[0]].children.length;
                !_.isUndefined(layouts[index_layouts].titles) && (layouts[index_layouts].titles.splice(action.position, 1));

                if(framework[index[0]].children[index[1]].children.length === 0) {
                    framework[index[0]].children[index[1]] = {};
                    layouts.splice(index_layouts, 1);
                    /** 删除后默认选中card */
                    let res = cardSelect(card, layouts, charts);
                    card = res.card;
                    layouts = res.layouts;
                    charts = res.charts;
                }
            }

            charts = clearCharts(framework, charts);            
            return _.assign({}, state, { framework:framework, card:card, layouts:layouts, charts:charts });
        }
        case 'Multi_SHRINK_LAYOUT': {
            let framework = state.framework;
            let layouts = state.layouts;

            /** 找到在layouts数组中的位置 */
            let index_layouts = _.findIndex(layouts, (layout) => { return layout.id === action.id });

            /** framework中缩减多页 */
            let index = getLayoutIndex(framework, action.id);
            if(index.length === 1) {
                for(let i = 0; i < action.shrinkNum; i++) {
                    framework[index[0]].children.pop();
                    !_.isUndefined(layouts[index_layouts].titles) && (layouts[index_layouts].titles.pop());
                }
                layouts[index_layouts].activePage = framework[index[0]].children.length - 1;
                layouts[index_layouts].num = framework[index[0]].children.length;
            }
            else if(index.length === 2) {
                for(let i = 0; i < action.shrinkNum; i++) {
                    framework[index[0]].children[index[1]].children.pop();
                    !_.isUndefined(layouts[index_layouts].titles) && (layouts[index_layouts].titles.pop());
                }
                layouts[index_layouts].activePage = framework[index[0]].children[index[1]].children.length - 1;
                layouts[index_layouts].num = framework[index[0]].children[index[1]].children.length;
            }

            let charts = clearCharts(framework, state.charts);
            return _.assign({}, state, { framework: framework, layouts: layouts, charts: charts });
        }
        case 'SELECT_LAYOUT': {
            let card = state.card;
            let charts = state.charts;
            let layouts = state.layouts;
            
            card.isSelected = false;
            _.each(charts, (chart) => { chart.isSelected = false });
            _.each(layouts, (layout) => { layout.isSelected = false });
            let index = _.findIndex(layouts, (layout) => { return layout.id === action.id });
            if(index != -1) {
                layouts[index].isSelected = true;
            }
            return _.assign({}, state, { 'card':card, 'charts':charts, 'layouts':layouts });            
        }
        case 'UPDATE_LAYOUT': {
            let layouts = state.layouts;
            let index = _.findIndex(layouts, (layout) => { return layout.id == action.id });
            delete action.type;

            layouts[index] = _.assign(layouts[index], action);
            return _.assign({}, state, { layouts:layouts });
        }
        case 'DROP_LAYOUT': {
            let framework = state.framework;
            let layouts = state.layouts;
            let id = 0;
            let newId = uuid.v1();

            let index = getLayoutIndex(framework, id);
            if(index.length === 1) {
                framework[index[0]].id = newId;
                let index_layouts = _.findIndex(layouts, (layout) => {
                    return layout.id === id;
                })
                layouts[index_layouts].id = newId;
            }
            else if(index.length === 2) {
                framework[index[0]].children[index[1]].id = newId;
                let index_layouts = _.findIndex(layouts, (layout) => {
                    return layout.id === id;
                })
                layouts[index_layouts].id = newId;
            }
            return _.assign({}, state, { 'framework':framework, 'layouts':layouts });
        }
        default:
            return state;
    }
};
var store = Redux.createStore(reducer);



/*******************************************************************
 * Store API
 *******************************************************************/
/** 遍历子节点的高度，确定根结点的高度 */
function getMaxHeight(node) {
    if(node.type === 'IFRAME') {
        let layouts = store.getState().layouts;
        let layout = _.find(layouts, (layout) => { return layout.id === node.id });
        return {
            maxHeight: layout.height,
            existChart: false
        };
    }
    else if(node.type === "COLUMN") {
        let maxHeight = 0;
        let existChart = false;

        let nodeChildren = node.children;
        for(let i = 0; i < nodeChildren.length; i++) {
            if(nodeChildren[i].type) {
                if(nodeChildren[i].type === "CHART") {
                    let charts = store.getState().charts;
                    let chart = _.find(charts, (chart) => { return chart.id === nodeChildren[i].id });
                    (!_.isUndefined(chart.height)) && (maxHeight = Math.max(maxHeight, chart.height + 42));
                    existChart = true;
                }
                else if(nodeChildren[i].type === "IFRAME") {
                    let layouts = store.getState().layouts;
                    let layout = _.find(layouts, (layout) => { return layout.id === nodeChildren[i].id });
                    maxHeight = Math.max(maxHeight, layout.height + 42);
                }
                else if(nodeChildren[i].type === 'TAB' || nodeChildren[i].type === 'COLUMN') {
                    let res = getMaxHeight(nodeChildren[i]);
                    (res.maxHeight != 0) && (maxHeight = Math.max(maxHeight, res.maxHeight + 42));
                    existChart = existChart || res.existChart;
                }
            }
        }

        return {
            maxHeight: maxHeight,
            existChart: existChart
        };
    }
    else if(node.type === "TAB") {
        let maxHeight = 0;
        let existChart = false;

        let layouts = store.getState().layouts;
        let layout_1 = _.find(layouts, (layout) => { return layout.id === node.id });
        let activeChild_1 = node.children[layout_1.activePage];
        if(activeChild_1.type) {
            if(activeChild_1.type === "CHART") {
                let charts = store.getState().charts;
                let chart = _.find(charts, (chart) => { return chart.id === activeChild_1.id });
                (!_.isUndefined(chart.height)) && (maxHeight = Math.max(maxHeight, chart.height + 58));
                existChart = true;
            }
            else if(activeChild_1.type === "IFRAME") {
                let layouts = store.getState().layouts;
                let layout = _.find(layouts, (layout) => { return layout.id === activeChild_1.id });
                return layout.height + 58;
            }
            else if(activeChild_1.type === "COLUMN" || activeChild_1.type === "TAB") {
                let res = getMaxHeight(activeChild_1);
                (res.maxHeight != 0) && (maxHeight = Math.max(maxHeight, res.maxHeight + 58));
                existChart = existChart || res.existChart;
            }
        }

        return {
            maxHeight: maxHeight,
            existChart: existChart
        };
    }
}

/** 在tab页中寻找从start开始的第一个空白页 */
function getNextSpace(array, start) {
    let space = -1;
    for(let i = start; i < array.length; i++) {
        if(_.isUndefined(array[i].type)) {
            space = i;
            break;
        }
    }
    return space;
}

var storeAPI = {
    /** 根据id从layouts数组中获取实例 */
    getLayoutByID: function (id) {
        var layouts = store.getState().layouts;
        return _.find(layouts, (layout) => { return layout.id === id })
    },

    /** 根据id从charts数组中获取实例 */     
    getChartByID: function(id) {
        var charts = store.getState().charts;
        return _.find(charts, (chart) => { return chart.id === id })
    },

    /** 判断store中是否存在某一布局 */
    storeExistLayoutIdEq: function(id) {
        var layouts = store.getState().layouts;
        let index = _.findIndex(layouts, (layout) => { return layout.id === id });
        return index != -1;
    },

    /** 判断store中是否存在某一图表 */
    storeExistChartIdEq: function(id) {
        var charts = store.getState().charts;
        let index = _.findIndex(charts, (chart) => { return chart.id === id });
        return index != -1;
    },

    /** 判断card层是否存在某一布局 */
    cardExistLayoutIdEq: function(id) {
        var framework = store.getState().framework;
        for(let i = 0; i < framework.length; i++) {
            if(framework[i].id === id) {
                return true;
            }
        }
        return false;
    },

    /** 判断card层是否存在某一chart */
    cardExistChartIdEq: function(id) {
        let framework = store.getState().framework;
        let index = getChartIndex(framework, id);
        if(index.length === 2 && framework[index[0]].children.length === 1)
            return true;
        return false;
    },

    /** 判断布局内第一层元素是否存在某一元素 */
    layoutExistChildIdEq: function(layoutId, id) {
        var framework = store.getState().framework;
        let index = getLayoutIndex(framework, layoutId);

        let children = [];
        if(index.length === 1) {
            children = framework[index[0]].children;
        }
        else if(index.length === 2) {
            children = framework[index[0]].children[index[1]].children;         
        }

        for(let i = 0; i < children.length; i++) {
            if(children[i].id === id)
                return true;
        }
        return false;
    },

    /** 判断布局内position位置是否存在布局或者图表 */
    layoutExistChild: function(layoutID, position) {
        var framework = store.getState().framework;
        let index = getLayoutIndex(framework, layoutID);

        if(index.length === 1) {
            if(framework[index[0]].children[position].type) {
                return true;
            }
        }
        else if(index.length === 2) {
            if(framework[index[0]].children[index[1]].children[position].type) {
                return true;
            }            
        }
        return false;
    },

    /** 进一步判断布局内position位置是否为chart */
    layoutExistChildIsChart: function(layoutId, position) {
        var framework = store.getState().framework;
        let index = getLayoutIndex(framework, layoutId);
        if(index.length === 1) {
            if(framework[index[0]].children[position].type && framework[index[0]].children[position].type === 'CHART') {
                return true;
            }
        }
        else if(index.length === 2) {
            if(framework[index[0]].children[index[1]].children[position].type && framework[index[0]].children[index[1]].children[position].type === 'CHART') {
                return true;
            }            
        }
        return false;
    },

    /** 查找列数或者tab页数 */
    layoutChildrenNums: function(layoutId) {
        var layouts = store.getState().layouts;
        let layout = _.find(layouts, (layout) => { return layout.id === layoutId });
        return layout.num;
    },

    /** 在tab上添加图表时， 判断添加位置 */
    nextTabPagePosition(tabId, tempPosition) {
        var framework = store.getState().framework;
        let index = getLayoutIndex(framework, tabId);
        if(index.length === 1) {
            let i = getNextSpace(framework[index[0]].children, tempPosition);
            if(i === -1) 
                return framework[index[0]].children.length + 1;
            else
                return i;
        }
        else if(index.length === 2) {
            let i = getNextSpace(framework[index[0]].children[index[1]].children, tempPosition);
            if(i === -1) 
                return framework[index[0]].children[index[1]].children.length + 1;
            else
                return i;
        }
    },

    /** 获取根节点的高度 */
    getHeight(node) {
        let res = getMaxHeight(node);
        if(res.maxHeight === 0 && res.existChart)
            return 500;
        else if(res.maxHeight === 0 && !res.existChart)
            return 150;
        else
            return res.maxHeight;
    },

    /** 根据当前坐标判断，鼠标在哪两个布局之间 */
    getPositionByCoordinate: function(cardY, pointY) {
        let card = store.getState().card;
        let cardBorder = 1;
        let cardPadding = card.padding - 10;
        let titleHeight = 80; /** height:70 + marginBottom:10 */

        let tempY = undefined;
        if(card.showTitle)
            tempY = cardY + cardBorder + cardPadding ;
        else
            tempY = cardY + cardBorder + cardPadding;

        /** 计算布局下界 */
        let framework = store.getState().framework;
        let layoutMargin = 10;
        for(let i = 0; i < framework.length; i++) {
            let layout = this.getHeight(framework[i]);
            tempY = tempY + layoutMargin + layout ;

            if(pointY > tempY && i === framework.length - 1)
                return i + 1;
            else if(pointY > tempY)
                continue;
            else if(pointY === tempY)
                return i + 1;
            else if(pointY < tempY)
                return i;
        }
        return 0;
    }
}

store.dispatch({ 'type': 'INIT'});
export {store, storeAPI};