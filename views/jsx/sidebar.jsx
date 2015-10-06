var React = require('react');
var $ = require('jquery');

ToureiroSidebar = React.createClass({

  pollTimer: undefined,

  getInitialState: function() {
    var state = {
      queues: [],
      queue: undefined,
      category: undefined
    };
    return state;
  },

  componentDidMount: function() {
    var _this = this;
    this.listQueues();
    this.pollTimer = setInterval(function() {
      _this.listQueues();
      if (_this.state.queue) {
        _this.getQueue(_this.state.queue.name);
      }
    }, 2000);
  },

  listQueues: function() {
    var _this = this;
    $.get('/queue/list/', function(response) {
      if (response.status === 'OK') {
        _this.setState({
          queues: response.queues
        })
        if (!_this.state.queue && response.queues.length > 0) {
          _this.getQueue(response.queues[0]);
        }
      } else {
        console.log(response);
      }
    });
  },

  getQueue: function(queue) {
    var _this = this;
    $.get('/queue/?name=' + encodeURIComponent(queue), function(response) {
      if (response.status === 'OK') {
        var state = {
          queue: response.queue, 
        };
        if (!_this.state.queue) {
          stats = response.queue.stats;
          category = 'active';
          if (stats['active'] > 0) {
            category = 'active';
          } else if (stats['wait'] > 0) {
            category = 'wait';
          } else if (stats['delayed'] > 0) {
            category = 'delayed';
          } else if (stats['completed'] > 0) {
            category = 'completed';
          } else if (stats['failed'] > 0) {
            category = 'failed';
          }
          state.category = category;
          if (_this.props.onQueueChange) {
            _this.props.onQueueChange(queue);
            _this.props.onCategoryChange(category);
          }
        }
        _this.setState(state);
      } else {
        console.log(response);
      }
    });
  },

  changeQueue: function(event) {
    var _this = this;
    var queue = $(event.target).val();
    this.getQueue(queue);
    if (_this.props.onQueueChange) {
      _this.props.onQueueChange(queue);
    }
  },

  changeCategory: function(key, event) {
    var _this = this;
    this.setState({
      category: key
    }, function() {
      if (_this.props.onCategoryChange) {
        _this.props.onCategoryChange(key);
      }
    });
  },
 
  render: function() {
    var _this = this;
    return (
      <div id="toureiro-sidebar">
        <h4>Toureiro</h4>
        <div id="sidebar-queues">
          <label>Queues</label>
          <select name="queue" onChange={this.changeQueue}>
          {
            this.state.queues.map(function(queue) {
              return (
                <option value={queue} key={queue}>{queue}</option>
              );
            })
          }
          </select>
        </div>
        <div id="sidebar-stats">
        {(() => {
          if (_this.state.queue) {
            return ['active', 'wait', 'delayed', 'completed', 'failed'].map(function(key) {
              return (
                <div key={key}>
                  <a href="javascript:;" onClick={_this.changeCategory.bind(_this, key)}>
                    {key[0].toUpperCase() + key.slice(1)} : {_this.state.queue.stats[key]}
                  </a>
                </div>
              );
            });
          }
        })()}
        </div>
      </div>
    );
  }

});

module.exports = ToureiroSidebar;