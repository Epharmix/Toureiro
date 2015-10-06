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
    this.setState({
      jobs: []
    }, function() {
      $.get('/job/fetch/' + _this.props.category, {
        queue: _this.props.queue,
        page: _this.state.page,
        limit: _this.state.limit
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

  promoteJob: function(id, event) {
    var _this = this;
    if (confirm('Are you sure you want to promote this job?')) {
      $.post('/job/promote/', {
        queue: this.props.queue,
        id: id
      }, function(response) {
        if (response.status === 'OK') {
          _this.fetchJobs();
        } else {
          console.log(response);
          alert(response.message);
        }
      });
    }
  },

  removeJob: function(id, event) {

  },

  render: function() {
    var _this = this;
    return (
      <div className="toureiro-jobs">
        <h4 className="header">{this.props.category[0].toUpperCase() + this.props.category.slice(1)} Jobs</h4>
        <div ref="jobs">
          {
            this.state.jobs.map(function(job) {
              try {
                if (typeof job.data === 'string') {
                  job.data = JSON.parse(job.data);
                }
                if (typeof job.opts === 'string') {
                  job.opts = JSON.parse(job.opts);
                }
              } catch (err) {
                console.log(err);
              }
              return (
                <div className="job clearfix" key={job.id}>
                  <div className="job-details">
                    <h4 className="job-id">Job ID: {job.id}</h4>
                    {
                      (job.data && job.data.type && job.data._category) ? (
                        <div>
                          <p className="job-category">
                            {job.data._category} : {job.data.type}
                          </p>
                        </div>
                      ) : ''
                    }
                    <p className="job-creation">Created At:
                      <br/>
                      {moment(job.timestamp).format('MM/DD/YYYY hh:mm:ssA')}
                    </p>
                    {
                      job.delay ? (
                        <div>
                          <p className="job-delay">Delayed Until:
                            <br/>
                            {moment(job.timestamp + job.delay).format('MM/DD/YYYY hh:mm:ssA')}
                          </p>
                          <button className="btn btn-embossed btn-warning" onClick={_this.promoteJob.bind(_this, job.id)}>Promote</button>
                        </div>
                      ) : ''
                    }
                  </div>
                  <pre className="job-code">
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