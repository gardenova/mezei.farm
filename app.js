var express = require('express');
var compression = require('compression');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes');

var app = express();

// Enable gzip compression
app.use(compression());

// Overload prevention
var RateLimit = require('express-rate-limit');
app.enable('trust proxy'); // only if you're behind a reverse proxy (Heroku, Bluemix, AWS if you use an ELB, custom Nginx setup, etc)
var limiter = new RateLimit({
  windowMs: 60*60*1000, // time frame (1 hour)
  max: 1000, // limit each IP requests per windowMs
  delayAfter: 300,
  delayMs: 2*1000 // 2 sec delay after reaching the max limit
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Use the limiter middleware and the routes
app.use(limiter, routes);

// Generate sitemap
app.get('/sitemap.xml', function(req, res) { // send XML map
  var sitemap = require('express-sitemap')({
    url: req.hostname // rewrite url in sitemap with the current hostname based on the http request.
  });
  sitemap.generate4(routes);
  sitemap.XMLtoWeb(res);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
