var React = require('react');
var $ = require('jquery');
var moment = require('moment-timezone');
var hljs = require('highlight.js');

var Pagination = require('./pagination.jsx');

var ToureiroJobs = React.createClass({

  getInitialState: function() {
    var state = {
      jobs: [],
      page: 0,
      limit: 15, 
      total: 0
    };
    return state;
  },

  componentDidUpdate: function() {
    if (this.state.page !== this.refs.pagination.state.page) {
      this.refs.pagination.setState({
        page: this.state.page
      });
    }
  },

  highlightCodeBlock: function() {
    $(this.refs.jobs.getDOMNode()).find('code').each(function(i, block) {
      hljs.highlightBlock(block);
    });
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
        }, function() {
          _this.highlightCodeBlock();
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
        <h4>{this.props.category[0].toUpperCase() + this.props.category.slice(1)}</h4>
        <div ref="jobs">
          {
            this.state.jobs.map(function(job) {
              return (
                <div className="job" key={job.id}>
                  <h4>Job ID: {job.id}</h4>
                  <p>Created At: {moment(job.timestamp).format('MM/DD/YYYY hh:mm:ssA')}</p>
                  {
                    job.delay ? (
                      <p>Delayed Till: {moment(job.timestamp + job.delay).format('MM/DD/YYYY hh:mm:ssA')}</p>
                    ) : ''
                  }
                  <pre>
                    <code dangerouslySetInnerHTML={{__html: JSON.stringify(job, null, 2)}} />
                  </pre>
                </div>
              );
            })
          }
        </div>
        <Pagination ref="pagination" total={Math.ceil(this.state.total / this.state.limit)} onPageChange={this.handlePageChange} />
      </div>
    );
  }

});

module.exports = ToureiroJobs;