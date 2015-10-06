var app = require('./lib/toureiro')({
  development: true,
  redis: {
    db: 1
  }
});
var server = app.listen(3000, function() {
  console.log('Toureiro is now listening at port 3000...');
});
