var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var redis = require('./redis');

module.exports = function(config) {

  redis.init(config.redis || {});

  var app = express();

  app.use(bodyParser.urlencoded({
    extended: false
  }));
  app.use(bodyParser.json());

  app.set('views', path.join(__dirname, '../views/templates'));
  app.set('view engine', 'jade');

  app.use('/static', express.static(path.join(__dirname, '../public')));

  app.all('/', function(req, res) {
    res.render('index');
  });
  app.use('/queue', require('./routes/queue'));
  app.use('/job', require('./routes/job'));

  app.use('*', function(req, res) {
    // Catch all
    res.sendStatus(404);
  });

  var server = app.listen(config.port || 3000, function() {
    console.log('Toureiro is now listening at port', server.address().port, '...');
  });

};