var Promise = require('bluebird');
var redis = require('redis');

var client = redis.createClient();

module.exports = Promise.promisifyAll(client);