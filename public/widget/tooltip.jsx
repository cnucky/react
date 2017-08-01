import React from 'react';

/**
can only have one child
*/
export default class Tooltip extends React.Component {
    componentDidMount() {
        this.configTooltip(this.props);
    }

    componentWillReceiveProps(newProps) {
        this.configTooltip(newProps)
    }

    configTooltip(props) {
        $(this.refs['tooltipItem']).tooltip({
            title: props.title,
            delay: props.delay || 300,
            placement: props.placement || 'auto',
            container: props.container || 'body'
        });
    }

    render() {
        var child = React.Children.only(this.props.children);
        var out = React.cloneElement(child, {
            ref: 'tooltipItem'
        });
        return out;
    }
}

Tooltip.propTypes = {
    title: React.PropTypes.string.isRequired,
    placement: React.PropTypes.oneOf(['left', 'bottom', 'top', 'right', 'auto'])
}
