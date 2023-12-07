require('dotenv').config();
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
var port = process.env.PORT || 3000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

connectMongoDb(process.env.MONGOOSE_URI)
.then(()=>{console.log("Database Conneted")})
.catch((error)=>{console.log("Failed Database Connection" + error);})

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

app.listen((port),()=>{
  console.log(`server started at http://localhost:${port}`);
})