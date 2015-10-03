var Promise = require('bluebird');
var redis = require('redis');

var client = redis.createClient();

module.exports.client = Promise.promisifyAll(client);

module.exports.multi = function(){
  var multi = this.client.multi();
  multi.execAsync = Promise.promisify(multi.exec);
  return multi;
};