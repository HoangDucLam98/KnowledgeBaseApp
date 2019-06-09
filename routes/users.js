var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var passport = require('passport');

// Bring User model
const User = require('../models/user');

router.get('/register', function(req, res){
  res.render('register', {
    errors: []
  });
})

router.post('/register', function(req, res){
  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;

  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Password not match').equals(password);

  let errors = req.validationErrors();

  if(errors){
    res.render('register', {
      errors: errors
    })
  }
  else{
    let newUser = new User({
      name: name,
      email: email,
      username: username,
      password: password
    })

    bcrypt.genSalt(10, function(err, salt){
      bcrypt.hash(newUser.password, salt, function(err, hash){
        if(err){
          console.log(err)
        }
        newUser.password = hash;
        newUser.save(function(err){
          if(err){
            console.log(err);
            return;
          }
          else{
            req.flash('success', 'You are now registered and can login');
            res.redirect('/users/login');
          }
        })

      })
    })

  }

})

// Load form login
router.get('/login', function(req, res){
  res.render('login')
})

// Login Process
router.post('/login', function(req, res, next){
  passport.authenticate('local', { 
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true })(req, res, next);
});

// Logout
router.get('/logout', function(req, res){
  req.logOut();
  req.flash('success', 'You are logged out');
  res.redirect('/users/login');
})

module.exports = router;