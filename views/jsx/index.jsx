var React = require('react');
var $ = require('jquery');

var Sidebar = require('./sidebar.jsx');

var Toureiro = React.createClass({
  render: function() {
    return (
      <div id="toureiro">
        <Sidebar />
        <div id="toureiro-canvas">
        </div>
      </div>
    );
  }
});

React.render(<Toureiro />, $('#toureiro-wrapper')[0]);