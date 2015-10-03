var _ = require('lodash');
var client = require('../redis').client;
var queue = require('./queue');

module.exports = {

  /**
   * Get a job by id
   * @param {string} qName Queue name
   * @param {string} id Job id
   */
  get: function(qName, id) {
    var q = queue.get(qName);
    return q.getJob(id);
  },

  /**
   * Remove a job by id
   * @param {string} qName Queue name
   * @param {string} id Job id
   */
  remove: function(qName, id) {
    var q = queue.get(qName);
    return q.getJob(id).then(function(job) {
      return job.remove();
    });
  },

  /**
   * Get the total number of jobs of type
   * @param {string} qName Queue name
   * @param {string} type Job type: {wait|active|delayed|completed|failed}
   * @returns {number} Total number of jobs
   */
  total: function(qName, type) {
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
   * @param {string} qName Queue name
   * @param {string} type Job type: {wait|active|delayed|completed|failed}
   * @param {number} offset Index offset (optional)
   * @param {number} limit Limit of the number of jobs returned (optional)
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
      return q.getJobs(type, 'LIST', offset, offset + limit - 1);
    } else if (type === 'delayed') {
      return q.getJobs(type, 'ZSET', offset, offset + limit - 1);
    } else if (type === 'completed' || type === 'failed') {
      var key = 'bull:' + qName + ':' + type;
      return client.smembersAsync(key).then(function(ids) {
        var _ids = ids.slice(offset, offset + limit);
        return Promise.all(_.map(_ids, function(id) {
          return q.getJob(id);
        }));
      });
    }
    throw new Error('You must provide a valid job type.');
  }

};