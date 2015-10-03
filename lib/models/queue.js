var _ = require('lodash');
var bull = require('bull');
var client = require('../redis').client;

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
    return client.keysAsync('bull:*:id').then(function(keys) {
      return _.map(keys, function(key) {
        return key.slice(5, -3);
      });
    });
  },

  /**
   * Get total number of jobs
   * @param {string} qName Queue name
   * @returns {Promise} A promise that resovles to the total number of jobs
   */
  total: function(qName) {
    return client.getAsync('bull:' + qName + ':id')
  },

  /**
   * Delete all data of a queue
   * @param {string} qName Queue name
   * @returns {Promise} A promise when all data of the queue is deleted 
   */
  remove: function(qName) {
    if (!qName || qName.length === 0) {
      throw new Error('You must specify a queue name.');
    }
    return client.keysAsync('bull:' + qName + ':*').then(function(keys) {
      if (keys.length) {
        return client.del(keys);
      }
    });
  },

  /**
   * Get a queue by name
   * @param {string} qName Queue name
   * @returns {Object} An instance of the queue
   */
  get: function(qName) {
    if (this._q.name !== qName) {
      this._q.name = qName;
      this._q.instance = new bull(qName);
    }
    return this._q.instance;
  }

};