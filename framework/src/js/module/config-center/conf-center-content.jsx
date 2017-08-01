const React = require('react');
const ReactDOM = require('react-dom');
const _ = require('underscore');
const $ = require('jquery');


class ConfCenterContent extends React.Component {


  render() {
  	const ContentComponent = this.props.currentFunction.component;
    return (
      <div className="st-pusher">
      		<div className="st-content">
				<div className="st-content-inner">
					<div className="btn-container" id='st-trigger-effects'>
						<button data-effect="st-effect-11" className='demo'><i className='fa fa-list-ul'></i></button>
					</div>
					<ContentComponent />
					
				</div>
			</div>
      </div>
    );
  }
  componentDidMount(){
  	// let startOffsetTop;
  	// let stopOffsetTop;
  	// $('.btn-container').draggable({
   //      cursor: 'pointer',
   //      containment: ".st-content-inner",
   //      revert: "valid",
   //      zIndex: 2000,
   //      distance: 5,
   //      axis: 'y',
   //      start: function(event, ui) {
   //          startOffsetTop = ui.offset.top;
   //      },
   //      stop: function(event, ui) {
   //          stopOffsetTop = ui.offset.top;
   //          $('.btn-container').css({
   //          	top: stopOffsetTop
   //          })
   //       },
   //  });
  }
}

module.exports.ConfCenterContent = ConfCenterContent;