var Promise = require('bluebird');
var redis = require('redis');

module.exports = {

  // Redis client instance
  _client: undefined,

  // Redis connection options
  redisOpts: undefined,

  /**
   * Initialize redis client
   * @param {Object} opts Options for creating the redis client
   */
  init: function(opts) {
    this._client = Promise.promisifyAll(redis.createClient(opts));
    if (opts.db) {
      this._client.selectAsync(opts.db);
    }
    this.redisOpts = opts;
  },

  /**
   * Get redis client
   * @returns {Object} Redis client instance
   */
  client: function() {
    return this._client;
  },

  /**
   * Get a redis multi interface
   * @returns {Object} Redis multi interface
   */
  multi: function() {
    var multi = this._client.multi();
    multi.execAsync = Promise.promisify(multi.exec);
    return multi;
  }

};