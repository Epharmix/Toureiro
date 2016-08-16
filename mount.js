var express = require('express');
var bodyParser = require('body-parser');
var toureiro = require('./lib/toureiro')({
  redis: {
    db: 1
  }
});

var app = express();

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

app.use('/toureiro', toureiro);

var server = app.listen(3000, function() {
  console.log('Server is now listening at port 3000...');
});