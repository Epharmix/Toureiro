var _ = require('lodash');
var redis = require('../redis');
var queue = require('./queue');

module.exports = {

  /**
   * Get a job by id
   * @param {String} qName Queue name
   * @param {String} id Job id
   * @returns {Object} The job
   */
  get: function(qName, id) {
    var q = queue.get(qName);
    return q.getJob(id).then(function(job) {
      if (!job) {
        return job;
      }
      return job.getState().then(function(state) {
        job.state = state;
        return job;
      });
    });
  },

  /**
   * Remove a job by id
   * @param {string} qName Queue name
   * @param {string} id Job id
   * @returns {Promise} A promise that resolves when the job is removed from queue
   */
  remove: function(qName, id) {
    var q = queue.get(qName);
    return q.getJob(id).then(function(job) {
      return job.remove();
    });
  },

  /**
   * Promote a delayed job to be executed immediately
   * @param {string} qName Queue name
   * @param {string} id Job id
   * @returns {Promise} A promise that resolves when the job is promoted
   */
  promote: function(qName, id) {
    var q = queue.get(qName);
    return q.getJob(id).then(function(job) {
      return job.promote();
    });
  },

  /**
   * Get the total number of jobs of type
   * @param {String} qName Queue name
   * @param {String} type Job type: {wait|active|delayed|completed|failed}
   * @returns {Number} Total number of jobs
   */
  total: function(qName, type) {
    var client = redis.client();
    var key = 'bull:' + qName + ':' + type;
    if (type === 'wait' || type === 'active') {
      return client.llenAsync(key);
    } else if (type === 'delayed') {
      return client.zcardAsync(key);
    } else if (type === 'completed' || type === 'failed') {
      return client.scardAsync(key);
    }
    throw new Error('You must provide a valid job type.');
  },

  /**
   * Fetch a number of jobs of certain type
   * @param {String} qName Queue name
   * @param {String} type Job type: {wait|active|delayed|completed|failed}
   * @param {Number} offset Index offset (optional)
   * @param {Number} limit Limit of the number of jobs returned (optional)
   * @returns {Promise} A promise that resolves to an array of jobs
   */
  fetch: function(qName, type, offset, limit) {
    var q = queue.get(qName);
    if (!(offset >= 0)) {
      offset = 0;
    }
    if (!(limit >= 0)) {
      limit = 30;
    }
    if (type === 'wait' || type === 'active') {
      return q.getJobs(type, 'LIST', offset, offset + limit - 1).then(function(jobs) {
        return Promise.all(_.map(jobs, function(job) {
          return job.getState().then(function(state) {
            job.state = state;
            return job;
          });
        }));
      });
    } else if (type === 'delayed') {
      return q.getJobs(type, 'ZSET', offset, offset + limit - 1).then(function(jobs) {
        return Promise.all(_.map(jobs, function(job) {
          return job.getState().then(function(state) {
            job.state = state;
            return job;
          });
        }));
      });
    } else if (type === 'completed' || type === 'failed') {
      var client = redis.client();
      var key = 'bull:' + qName + ':' + type;
      return client.smembersAsync(key).then(function(ids) {
        var _ids = ids.slice(offset, offset + limit);
        return Promise.all(_.map(_ids, function(id) {
          return q.getJob(id).then(function(job) {
            return job.getState().then(function(state) {
              job.state = state;
              return job;
            });
          });
        }));
      });
    }
    throw new Error('You must provide a valid job type.');
  }

};