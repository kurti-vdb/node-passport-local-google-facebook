var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8888;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var validator = require('express-validator');

// MongoDB
var configDB = require('./config/database.js');
mongoose.connect(configDB.url, { useNewUrlParser: true }); // connect to our database

// Static files
var path = require('path')
var static = path.resolve(__dirname, 'static')

// Express setup
app.use(morgan('dev')); 
app.use(cookieParser('kensentme')); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(validator());

// Ejs templates
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Passport authentication and sessions
app.use(session({ secret: 'kensentme', resave: true, saveUninitialized: true, cookie: { maxAge: 28800000 }})); // 8 hours
app.use(passport.initialize());
app.use(passport.session()); 
app.use(flash()); 

// Routes and passport config
require('./app/routes.js')(app, passport); 
require('./config/passport')(passport);

// Run the app
app.use(express.static(static))
app.listen(port);
console.log('Server.js started on port ' + port);