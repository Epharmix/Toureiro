var _ = require('lodash');
var express = require('express');
var router = express.Router();
var Queue = require('../models/queue');
var Job = require('../models/job');

router.all('/', function(req, res) {
  var qName = req.query.queue;
  var id = req.query.id;
  Queue.exists(qName).then(function(result) {
    if (!result) {
      res.json({
        status: 'FAIL',
        message: 'The queue does not exist.'
      });
      return
    }
    Job.get(qName, id).then(function(job) {
      if (job) {
        var data = job.toData();
        data.id = job.jobId;
        data.state = job.state;
        res.json({
          status: 'OK',
          job: data
        });
        return;
      }
      res.json({
        status: 'FAIL',
        message: 'The job does not exist.'
      });
    }).catch(function(err) {
      console.log(err.stack);
      res.json({
        status: 'FAIL',
        message: err.message
      });
    });
  });
});

router.all('/remove', function(req, res) {
  var qName = req.body.queue;
  var id = req.body.id;
  Queue.exists(qName).then(function(result) {
    if (!result) {
      res.json({
        status: 'FAIL',
        message: 'The queue does not exist.'
      });
      return
    }
    Job.remove(qName, id).then(function() {
      res.json({
        status: 'OK'
      });
    }).catch(function(err) {
      console.log(err.stack);
      res.json({
        status: 'FAIL',
        message: err.message
      });
    });
  });
});

router.all('/promote', function(req, res) {
  var qName = req.body.queue;
  var id = req.body.id;
  Queue.exists(qName).then(function(result) {
    if (!result) {
      res.json({
        status: 'FAIL',
        message: 'The queue does not exist.'
      });
      return
    }
    Job.promote(qName, id).then(function() {
      res.json({
        status: 'OK'
      });
    }).catch(function(err) {
      console.log(err.stack);
      res.json({
        status: 'FAIL',
        message: err.message
      });
    });
  });
});

router.all('/rerun', function(req, res) {
  var qName = req.body.queue;
  var id = req.body.id;
  Queue.exists(qName).then(function(result) {
    if (!result) {
      res.json({
        status: 'FAIL',
        message: 'The queue does not exist.'
      });
      return
    }
    Job.get(qName, id).then(function(job) {
      if (job) {
        if (job.state !== 'completed' && job.state !== 'failed') {
          res.json({
            status: 'FAIL',
            message: 'Cannot rerun a job that is not completed or failed.'
          });
          return
        }
        var data = job.toData();
        var opts = JSON.parse(data.opts);
        if (opts.delay) {
          delete opts.delay;
        }
        var data = JSON.parse(data.data);
        return Job.add(qName, data, opts).then(function(job) {
          var data = job.toData();
          data.id = job.jobId;
          data.state = job.state;
          res.json({
            status: 'OK',
            job: data
          });
          return;
        });
      }
      res.json({
        status: 'FAIL',
        message: 'The job does not exist.'
      });
    }).catch(function(err) {
      console.log(err.stack);
      res.json({
        status: 'FAIL',
        message: err.message
      });
    });
  });
});

router.all('/total/:type(((wait)|(active)|(delayed)|(completed)|(failed)))', function(req, res) {
  var qName = req.query.queue;
  Queue.exists(qName).then(function(result) {
    if (!result) {
      res.json({
        status: 'FAIL',
        message: 'The queue does not exist.'
      });
      return
    }
    Job.total(qName, req.params.type).then(function(total) {
      res.json({
        status: 'OK',
        total: total
      });
    }).catch(function(err) {
      console.log(err.stack);
      res.json({
        status: 'FAIL',
        message: err.message
      });
    });
  });
});

router.all('/fetch/:type(((wait)|(active)|(delayed)|(completed)|(failed)))', function(req, res) {
  var page = 0;
  if (req.query.page) {
    page = parseInt(req.query.page);
  }
  var limit = 30;
  if (req.query.limit) {
    limit = parseInt(req.query.limit);
  }
  var qName = req.query.queue;
  Queue.exists(qName).then(function(result) {
    if (!result) {
      res.json({
        status: 'FAIL',
        message: 'The queue does not exist.'
      });
      return
    }
    Job.fetch(qName, req.params.type, page * limit, limit).then(function(jobs) {
      var _jobs = [];
      for (var job in jobs) {
        if (job) {
          var data = job.toData();
          data.id = job.jobId;
          data.state = job.state;
          _jobs.push(data);
        }
      }
      Job.total(qName, req.params.type).then(function(total) {
        res.json({
          status: 'OK',
          jobs: _jobs,
          total: total,
          page: page,
          limit: limit
        });
      });
    }).catch(function(err) {
      console.log(err.stack);
      res.json({
        status: 'FAIL',
        message: err.message
      });
    });
  });
});

module.exports = router;