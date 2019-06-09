const express = require('express');
const articles = require('./models/articles');
const mongoose = require('mongoose');
const path = require('path');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const config = require('./config/database');
const passport = require('passport');


mongoose.connect(config.database, {useNewUrlParser: true});
let db  = mongoose.connection;


// Check connection
db.once('open', function(){
  console.log('Connected to MongoDB');
})

// Check for DB errors
db.on('error', function(err){
  console.log(err)
})

// Init app
const app = express();

// Load view engine
app.set('view engine', 'ejs');

// Body Parser MiddleWare
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// Set public folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session Middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

// Express Message Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express Validator Middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Passport config
require('./config/passport')(passport);
// Middleware Passport
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
  res.locals.user = req.user || null;
  next();
})

// Home route
app.get('/', (req, res) => {
  articles.find({}, function(err, data){
    if(err){
      console.log(err)
    }
    else{
      res.render('index', {
        title: 'Articles',
        articles: data});
    }
  })
});

app.use('/articles', require('./routes/articles'));
app.use('/users', require('./routes/users'));



// Start server
app.listen(process.env.PORT || 3000, function(){
  console.log('Server listening at port 3000');
})