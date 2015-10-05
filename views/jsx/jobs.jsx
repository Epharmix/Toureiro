var React = require('react');
var $ = require('jquery');
var moment = require('moment-timezone');

var Pagination = require('./pagination.jsx');

var ToureiroJobs = React.createClass({

  getInitialState: function() {
    var state = {
      jobs: [],
      page: 0,
      limit: 30, 
      total: 0
    };
    return state;
  },

  fetchJobs: function() {
    var _this = this;
    $.get('/job/fetch/' + this.props.category, {
      queue: this.props.queue,
      page: this.state.page,
      limit: this.state.limit
    }, function(response) {
      if (response.status === 'OK') {
        _this.setState({
          jobs: response.jobs,
          total: response.total
        }); 
      } else {
        console.log(response);
      }
    });
  },

  handlePageChange: function(page) {
    var _this = this;
    this.setState({
      page: page
    }, function() {
      _this.fetchJobs();
    });
  },

  render: function() {
    return (
      <div className="toureiro-jobs">
      {
        this.state.jobs.map(function(job) {
          return (
            <div key={job.id}>
              <h4>Job ID: {job.id}</h4>
              <p>Created At: {moment(job.timestamp).format('MM/DD/YYYY hh:mm:ssA')}</p>
              {
                job.delay ? (
                  <p>Delayed Till: {moment(job.timestamp + job.delay).format('MM/DD/YYYY hh:mm:ssA')}</p>
                ) : ''
              }
            </div>
          );
        })
      }
      <Pagination total={Math.ceil(this.state.total / this.state.limit)} onPageChange={this.handlePageChange} />
      </div>
    );
  }

});

module.exports = ToureiroJobs;