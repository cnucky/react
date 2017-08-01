/**
 * Created by rhtkb on 2016/5/30.
 */
var $ = require('jquery');
var React = require('react');

//var div = document.getElementById("fullscreen-loader");
//var width = div.offsetWidth;
//var height = div.offsetHeight;



var maskerStyle={
    position: 'absolute',
    top: 0,
    left: 0,
    width:100+'%',
    height:100+'%',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    display: 'flex',
    zIndex: 9999,
}

var MaskerContainer=React.createClass({
    render:function(){
        return (
                <div style={maskerStyle}>
                    <div className="loader-container" style={{margin:'auto'}}>
                        <div className="loader-inner line-scale">
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                        </div>
                    </div>
                </div>
        );
    }
})

ReactDOM.render(
    <MaskerContainer></MaskerContainer>,
    document.getElementById('fullscreen-loader')
)

module.exports = MaskerContainer;