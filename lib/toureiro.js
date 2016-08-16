var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var redis = require('./redis');
var slashes = require('connect-slashes');

module.exports = function(config) {

  config = config || {};

  redis.init(config.redis || {});

  var app = express();

  app.use(bodyParser.urlencoded({
    extended: false
  }));
  app.use(bodyParser.json());

  app.set('views', path.join(__dirname, '../views/templates'));
  app.set('view engine', 'jade');

  var staticPath = '../public';
  if (config.development) {
    staticPath = '../public/dev';
  }
  app.use('/static', express.static(path.join(__dirname, staticPath)));

  app.use(slashes());

  app.all('/', function(req, res) {
    res.render('index');
  });
  app.use('/queue', require('./routes/queue'));
  app.use('/job', require('./routes/job'));

  app.use('*', function(req, res) {
    // Catch all
    res.sendStatus(404);
  });

  return app;

};
