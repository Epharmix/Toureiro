var _ = require('lodash');
var bull = require('bull');
var redis = require('../redis');

module.exports = {

  /**
   * Internal Queue instance
   * since each queue creates separate connections to redis, 
   * we want to store an instance of the client here for reuse
   */
  _q: {
    name: undefined,
    instance: undefined
  },

  /**
   * List all queues
   * @returns {Promise} A promise that resolves to the keys of all queues
   */
  list: function() {
    var client = redis.client();
    return client.keysAsync('bull:*:id').then(function(keys) {
      return _.map(keys, function(key) {
        return key.slice(5, -3);
      });
    });
  },

  /**
   * Check if queue exists
   * @returns {Promise} A promise that results to whether the queue exists
   */
  exists: function(qName) {
    var client = redis.client();
    return client.existsAsync('bull:' + qName + ':id');
  },

  /**
   * Get total number of jobs
   * @param {String} qName Queue name
   * @returns {Promise} A promise that resovles to the total number of jobs
   */
  total: function(qName) {
    var client = redis.client();
    return client.getAsync('bull:' + qName + ':id')
  },

  /**
   * Delete all data of a queue
   * @param {String} qName Queue name
   * @returns {Promise} A promise when all data of the queue is deleted 
   */
  remove: function(qName) {
    if (!qName || qName.length === 0) {
      throw new Error('You must specify a queue name.');
    }
    var client = redis.client();
    return client.keysAsync('bull:' + qName + ':*').then(function(keys) {
      if (keys.length) {
        return client.del(keys);
      }
    });
  },

  /**
   * Get a queue by name
   * @param {String} qName Queue name
   * @returns {Object} An instance of the queue
   */
  get: function(qName) {
    if (this._q.name !== qName) {
      this._q.name = qName;
      var queueOpts = {
        redis: {
          host: redis.redisOpts.host,
          port: redis.redisOpts.port,
          DB: redis.redisOpts.db,
          opts: {
            auth_pass: redis.redisOpts.auth_pass
          }
        }
      };
      this._q.instance = new bull(qName, queueOpts);
    }
    return this._q.instance;
  }

};