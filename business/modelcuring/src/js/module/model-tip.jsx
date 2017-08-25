initLocales(require.context('../../locales/base-frame', false, /\.js/), 'zh');
import React, { PropTypes } from 'react';
import { render } from 'react-dom';
// import {store} from './store';
/*import { Popover } from 'antd';
import 'antd/dist/antd.css';*/

const labels = [
    {
        label: 'name',
        title: '名称'
    }, {
        label: 'subType',
        title: '类型'
    }, {
        label: 'path',
        title:'路径'
    }, {
        label: 'shareFlag',
        title: '是否共享'
    }, {
        label: 'creator',
        title: '创建者'
    }, {
        label: 'createTime',
        title: '创建时间'
    }, {
        label: 'lastModifyTime',
        title: '最后创建时间'
    }, {
        label: 'finishRatio',
        title: '完成率(%)'
    }, {
        label: 'recordCount',
        title: '结果数'
    }, {
        label: 'status',
        title: '状态'
    }, {
        label: 'id',
        title: '任务号'
    }, {
        label: 'desc',
        title: '描述'
    }
]

const _taskTypeCaptionMap = {
    "100": i18n.t('home.menu-SMART_QUERY'),
    "103": i18n.t('workspace.menu-INTERSECTION_ANALYSIS'),
    "104": i18n.t('workspace.menu-UNION_ANALYSIS'),
    "105": i18n.t('workspace.menu-DIFFERENCE_ANALYSIS'),
    "111": i18n.t('home.menu-SMART_QUERY'),
    "113": i18n.t('workspace.menu-INTERSECTION_ANALYSIS'),
    "114": i18n.t('workspace.menu-UNION_ANALYSIS'),
    "115": i18n.t('workspace.menu-DIFFERENCE_ANALYSIS'),
    "107": i18n.t('home.menu-STREAM_ANALYSIS'),
    "108": i18n.t('home.menu-GRAPH_ANALYSIS'),
    "440": i18n.t('workspace.menu-PERSON_IMPORT'),
    "201": i18n.t('workspace.menu-DATA_IMPORT'),
    "112": i18n.t('home.menu-PERSON_CORE'),
    "401": i18n.t('home.menu-SEARCH_ALL'),
    "402": i18n.t('home.menu-SEARCH_SORT'),
    "403": i18n.t('home.menu-SEARCH_TEMPLATE'),
    "404": i18n.t('home.menu-SEARCH_FILE'),
    "405": i18n.t('workspace.menu-ELEC_SEARCH'),
    "406": i18n.t('workspace.menu-MOBILE_ARCHIVE'),
    "421": i18n.t('workspace.menu-MINDDIAGRAM_INTERSECTION'),
    //"422": i18n.t('workspace.menu-MINDDIAGRAM_COMBINE'),
    //"423": i18n.t('workspace.menu-MINDDIAGRAM_EXCLUSIVE'),
    "422": i18n.t('workspace.menu-KEYLIST_IMPORT'),

    "460": i18n.t('workspace.menu-LOC_ANALYSIS'),
    "461": i18n.t('workspace.menu-ACCOUT_EXPAND'),
    "462": i18n.t('workspace.menu-ACCOUT_EXPAND'),
    "463": i18n.t('workspace.menu-PASWORD_EXPAND'),
    "464": i18n.t('workspace.menu-ACCOUT_SEARCH'),
    "465": i18n.t('workspace.menu-ACCOUT_SEARCH'),
    "470": i18n.t('home.menu-AREA_PERCEIVE'),
}

const _taskStatusCaptionMap = {
    queue: i18n.t('workspace.label-inqueue'),
    running: i18n.t('workspace.label-running'),
    finished: i18n.t('workspace.label-finish'),
    cancelling: i18n.t('workspace.label-canceling'),
    cancelled: i18n.t('workspace.label-canceled'),
    error: i18n.t('workspace.label-error'),
    null: i18n.t('workspace.label-null'),
    toexam: i18n.t('workspace.label-toexam'),
    examing: i18n.t('workspace.label-examing'),
    examfailed: i18n.t('workspace.label-examfailed'),
    examed: i18n.t('workspace.label-examed'),
    parterror: i18n.t('workspace.label-parterror')
}

class ModelTip extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isCollect:false
        }
        
    }

    componentWillReceiveProps(nextProps) {
    }

    componentDidMount() {
        let boxWidth = $('.content-detail').width()
        this.bodyWidth = $('body').width()
        this.boxWidth = boxWidth
    }

    _getTipItems (modelItem) {
        let tipDetail = ''
        let title = ''
        tipDetail = _.map(labels, function (labelItem, index) {
            if (modelItem[labelItem.label] && modelItem[labelItem.label] !== '') {
                title = modelItem[labelItem.label]
                if (labelItem.label === 'subType') {
                    title = _.isUndefined(_taskTypeCaptionMap[modelItem[labelItem.label]]) ? i18n.t("workspace.label-unknown") : _taskTypeCaptionMap[modelItem[labelItem.label]]
                }
                if (labelItem.label === 'shareFlag') {
                    title = modelItem[labelItem.label] == '1' || modelItem[labelItem.label] == '2' ? i18n.t('workspace.label-yes') : i18n.t('workspace.label-no')
                }
                if (labelItem.label === 'lastModifyTime') {
                    title = modelItem[labelItem.label] || modelItem.createTime
                }
                if (labelItem.label === 'status') {
                    title = _taskStatusCaptionMap[modelItem[labelItem.label]] || i18n.t('workspace.label-unknown')
                }
                return (
                    <li key={index}>
                        <span className="tips-label">{`${labelItem['title']}：`}</span>
                        <span className="tips-item">{title}</span>
                    </li>
                )
            }
        }, this)
        return tipDetail
    }

    render() {
        const { modelItem, isShowTip, location, height } = this.props
        this.tipWrapWidth = $('.tip-wrap').width()
        this.tipWrapHeight = $('.tip-wrap').width()
        let locationX = location.x
        let locationY = location.y
        if (locationX > (this.bodyWidth - this.tipWrapWidth - 30) &&
            locationY > (height - this.tipWrapHeight + 50)) {
            locationX = (locationX - this.tipWrapWidth)
            locationY = locationY - this.tipWrapHeight - 20
            locationX = location.x === locationX + this.tipWrapWidth ? locationX - 30 : locationX
            locationY = location.Y === locationY - this.tipWrapHeight ? locationY - 30 : locationY
        } else if (locationX > (this.bodyWidth - this.tipWrapWidth - 10)) {
            locationX = location.x - this.tipWrapWidth - 20
            locationX = location.x === locationX ? locationX + 10 : locationX
            locationY = locationY - 5
        } else if (locationY > (height - this.tipWrapHeight + 50)) {
            locationY = location.y - this.tipWrapHeight - 40
            locationY = location.y === locationY ? locationY + 10 : locationY
            locationX = locationX + 20
        }

        return (
            <div className="tip-wrap" style={{display: isShowTip ? 'block' : 'none', left: `${locationX + 10}px`, top: `${locationY - 50}px`}}>
                <ul>
                    {this._getTipItems(modelItem)}
                </ul>
            </div>
        )
    }
}

ModelTip.propTypes = {
    modelItem: React.PropTypes.object,
    isShowTip: React.PropTypes.bool,
    location: React.PropTypes.object,
    height: React.PropTypes.number
};

ModelTip.contextTypes = {
    i18n: React.PropTypes.object
}

export default ModelTip



