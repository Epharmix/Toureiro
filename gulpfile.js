var browserify = require('browserify');
var gulp = require('gulp');
var reactify = require('reactify');
var buffer = require('vinyl-buffer');
var livereload = require('gulp-livereload');
var notify = require('gulp-notify');
var shell = require('gulp-shell');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');
var watchify = require('watchify');

gulp.task('build', function() {
  var bundler = browserify({
    entries: './views/jsx/index.jsx',
    debug: true,
    transform: [reactify]
  });
  return bundler.bundle()
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({
      loadMaps: true
    }))
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./public/js/'));
});

function watch() {
  var watcher = watchify(browserify({
    entries: './views/jsx/index.jsx',
    debug: true,
    transform: [reactify],
    cache: {},
    packageCache: {},
    fullPaths: true
  }));
  watcher.on('update', function() {
    bundle(watcher);
  });
  watcher.on('log', gutil.log);
  bundle(watcher);
}

function bundle(bundler) {
  var start = Date.now();
  console.log('Bundling...');
  bundler
    .bundle()
    .on('error', gutil.log)
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(gulp.dest('./public/js/'))
    .pipe(livereload())
    .pipe(notify(function() {
      console.log('Bundled! Process took', (Date.now() - start) + 'ms');
    }));
}

gulp.task('livereload', function() {
  livereload.listen();
});

gulp.task('watch', watch);

gulp.task('server', shell.task([
  'nodemon -w ./lib ./server.js'
]));

gulp.task('dev', [
  'livereload',
  'watch', 
  'server'
]);