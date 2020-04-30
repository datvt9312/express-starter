var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', indexRouter);


/*
  This is for router params example
*/
/*
  Route path: /users/:userId/books/:bookId
  Request URL: http://localhost:3000/users/34/books/8989
  req.params: { "userId": "34", "bookId": "8989" }
*/
app.get('/users/:userId/books/:bookId', function (req, res) {
  res.send(req.params)
})

/* -- START CHAINING MIDDLEWARES EXAMPLE */
function authenticate(req, res, next) {
  if (req.params.status === "authenticated") {
    req.isAuthenticated = true
  } else {
    req.isAuthenticated = false
  }
  next();
}


function authorize(req, res, next) {
  if (req.isAuthenticated == false) {
    next()
    return
  }
  if (req.params.role === "admin") {
    req.redirectRoute = "dashboard"
  } else if (req.params.role === "user") {
    req.redirectRoute = `homepage/${req.params.userId}`
  } else {
    req.redirectRoute = "contact-support"
  }
  next();
}


app.get('/verify/:status/:role/:userId', authenticate, authorize, function (req, res) {
  if (req.isAuthenticated == false) {
    res.status(403);
    res.send('Unauthenticated. Please signup!');
    return
  }
  res.send('Redirecting ' + req.redirectRoute);
});
/* -- END CHAINING MIDDLEWARES EXAMPLE */


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
