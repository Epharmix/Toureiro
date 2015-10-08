var React = require('react');
var $ = require('jquery');
var moment = require('moment-timezone');
var hljs = require('highlight.js');

var Pagination = require('./pagination.jsx');

var Job = React.createClass({

  componentDidMount: function() {
    hljs.highlightBlock(this.refs.code.getDOMNode());
  },

  promoteJob: function(id, event) {
    var _this = this;
    if (confirm('Are you sure you want to promote this job?')) {
      $.post('job/promote/', {
        queue: this.props.queue,
        id: this.props.job.id
      }, function(response) {
        if (response.status === 'OK') {
          if (_this.props.onJobPromote) {
            _this.props.onJobPromote();
          }
        } else {
          console.log(response);
          alert(response.message);
        }
      });
    }
  },

  render: function() {
    var _this = this;
    var job = this.props.job;
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
                {
                  _this.props.enablePromote ? (
                    <button className="btn btn-embossed btn-warning" onClick={_this.promoteJob}>Promote</button>
                  ) : ''
                }
                <br />
                <br />
              </div>
            ) : ''
          }
        </div>
        <pre className="job-code">
          <code ref="code" dangerouslySetInnerHTML={{__html: JSON.stringify(job, null, 2)}} />
        </pre>
      </div>
    );
  }

});

var JobDetails = React.createClass({

  getInitialState: function() {
    var state = {
      id: undefined,
      job: undefined
    };
    return state;
  },

  handleJobSearch: function(event) {
    if (event.which === 13) {
      this.getJobById();
    }
  },

  getJobById: function() {
    var _this = this;
    var id = $(this.refs.idField.getDOMNode()).val()
    if (id) {
      $.get('/job/', {
        queue: this.props.queue,
        id: id
      }, function(response) {
        if (response.status === 'OK') {
          _this.setState({
            id: id,
            job: response.job
          });
        } else {
          console.log(response);
          _this.setState({
            id: id,
            job: null
          });
        }
      });
    } else {
      this.setState({
        id: null,
        job: null
      });
    }
  },

  render: function() {
    return (
      <div className="toureiro-jobs">
        <h4 className="header">Job Details</h4>
        <div>
          <label>Find Job by ID: </label>
          <div className="input-group">
            <input ref="idField" className="form-control" type="text" name="id" onKeyUp={this.handleJobSearch} />
            <span className="input-group-btn">
              <button className="btn btn-success" onClick={this.getJobById}>Go</button>
            </span>
          </div>
        </div>
        <br />
        {
          (this.state.job) ? (
            <Job job={this.state.job} queue={this.props.queue} enablePromote={true} />
          ) : (
            (this.state.id) ? (
              <span>Job is not found.</span>
            ) : ''
          )
        }
      </div>
    );
  }

});

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

  fetchJobs: function() {
    var _this = this;
    this.setState({
      jobs: []
    }, function() {
      $.get('job/fetch/' + _this.props.category, {
        queue: _this.props.queue,
        page: _this.state.page,
        limit: _this.state.limit
      }, function(response) {
        if (response.status === 'OK') {
          if (response.jobs.length === 0 && response.total > 0) {
            _this.setState({
              page: 0
            }, function() {
              _this.fetchJobs();
            });
          } else {
            _this.setState({
              jobs: response.jobs,
              total: response.total
            });
          }
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

  handleJobPromote: function() {
    this.fetchJobs();
  },

  render: function() {
    var _this = this;
    return (
      <div className="toureiro-jobs">
        <h4 className="header">{this.props.category[0].toUpperCase() + this.props.category.slice(1)} Jobs</h4>
        <div ref="jobs">
          {
            this.state.jobs.map(function(job) {
              return (
                <Job key={job.id} job={job} queue={_this.props.queue} onJobPromote={_this.handleJobPromote} enablePromote={_this.props.category === 'delayed'} />
              );
            })
          }
        </div>
        <Pagination ref="pagination" total={Math.ceil(this.state.total / this.state.limit)} onPageChange={this.handlePageChange} />
      </div>
    );
  }

});

module.exports.JobDetails = JobDetails;
module.exports.Jobs = ToureiroJobs;
