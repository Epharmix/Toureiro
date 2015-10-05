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
      _jobs = _.map(jobs, function(job) {
        var data = job.toData();
        data.id = job.jobId;
        return data;
      });
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