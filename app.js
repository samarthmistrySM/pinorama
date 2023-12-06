require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const expressSession =  require('express-session');
const flash = require("connect-flash")
const {connectMongoDb} = require('./connection')

var indexRouter = require('./routes/index');
const userModel = require('./models/userModel')

const passport = require('passport');
const localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

connectMongoDb(process.env.MONGOOSE_URI);

app.use(flash())
app.use(expressSession({
  resave: false,
  saveUninitialized: false,
  secret: "heyheyhey7",
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {

  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;