var React = require('react');
var $ = require('jquery');

var Sidebar = require('./sidebar.jsx');
var Jobs = require('./jobs.jsx');

var Toureiro = React.createClass({

  getInitialState: function() {
    var state = {
      queue: undefined,
      category: undefined
    };
    return state;
  },

  handleQueueChange: function(queue) {
    this.setState({
      queue: queue
    });
  },

  handleCategoryChange: function(category) {
    var _this = this;
    this.setState({
      category: category
    }, function() {
      _this.refs.jobs.setState({
        page: 0
      }, function() {
        _this.refs.jobs.fetchJobs();
      });
    });
  },

  render: function() {
    var _this = this;
    return (
      <div id="toureiro">
        <Sidebar onQueueChange={this.handleQueueChange} onCategoryChange={this.handleCategoryChange} />
        <div id="toureiro-canvas">
        {
          (_this.state.queue && _this.state.category) ? (
            <Jobs ref="jobs" queue={_this.state.queue} category={this.state.category} />
          ) : ''
        }
        </div>
      </div>
    );
  }
});

React.render(<Toureiro />, $('#toureiro-wrapper')[0]);