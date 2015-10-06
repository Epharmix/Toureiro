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
      $.post('/job/promote/', {
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
      <div className="job">
        <h4>Job ID: {job.id}</h4>
        {
          (job.data && job.data.type && job.data._category) ? (
            <div>
              {job.data._category} : {job.data.type}
            </div>
          ) : ''
        }
        <p>Created At: {moment(job.timestamp).format('MM/DD/YYYY hh:mm:ssA')}</p>
        {
          job.delay ? (
            <div>
              <p>Delayed Till: {moment(job.timestamp + job.delay).format('MM/DD/YYYY hh:mm:ssA')}</p>
              {
                _this.props.enablePromote ? (
                  <button className="btn btn-embossed btn-warning" onClick={_this.promoteJob}>Promote</button>
                ) : ''
              }
            </div>
          ) : ''
        }
        <pre>
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
      <div>
        <h4>Job Details</h4>
        <div>
          <label>Find Job by ID: </label>
          <input ref="idField" type="text" name="id" onKeyUp={this.handleJobSearch} />
          <button className="btn btn-success" onClick={this.getJobById}>Go</button>
        </div>
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
      $.get('/job/fetch/' + _this.props.category, {
        queue: _this.props.queue,
        page: _this.state.page,
        limit: _this.state.limit
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
        <h4>{this.props.category[0].toUpperCase() + this.props.category.slice(1)}</h4>
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
