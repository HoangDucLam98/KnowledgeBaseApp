var express = require('express');
var router = express.Router();

// Articles Model
const articles = require('../models/articles');

// Users Model
const User = require('../models/user');

// Load form add
router.get('/add', ensureAuthenticated, function(req, res){
  let errors = [];
  res.render('add_articles', {
    errors: errors
  });
})

// Get Single Article
router.get('/:id', function(req, res){
  articles.findById(req.params.id, function(err, data){
    User.findById(data.author, function(err, user){

      if(err) throw err;

      res.render('article', {
        article: data,
        author: user.name
      })

    })
    
  })
})

// Add POST Route
router.post('/add', function(req, res){

  req.checkBody('title', 'Title is required').notEmpty();
  // req.checkBody('author', 'Author is required').notEmpty();
  req.checkBody('body', 'Body is required').notEmpty();

  let errors = req.validationErrors();

  if(errors){
    res.render('add_articles', {
      errors: errors
    })
  }
  else{
    let article = new articles();
    article.title = req.body.title;
    article.author = req.user._id;
    article.body = req.body.body;

    article.save(function(err){
      if(err) {
        console.log(err);
        return;
      }
      else {
        req.flash('success', 'Article added');
        res.redirect('/');
      }
    })
  }

})

// Load Edit form
router.get('/edit/:id', function(req, res){

  if(!req.user){
    req.flash('danger', 'Not Authorized');
    return res.redirect('/');
  }

  articles.findById(req.params.id, function(err, article){
    if(article.author != req.user._id){
      req.flash('danger', 'Not Authorized');
      return res.redirect('/');
    }
    res.render('edit_article', {
      article: article
    })
  })
})

// Update Submit POST Route
router.post('/edit/:id', function(req, res){

  let article = {};
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;

  let query = {_id: req.params.id}

  articles.update(query, article, function(err){
    if(err) {
      console.log(err);
      return;
    }
    else {
      req.flash('success', 'Article updated');
      res.redirect('/');
    }
  })
})

// Delete Article
router.delete('/:id', function(req, res){

  if(!req.user._id){
    res.status(500).send();
  }

  let query = {_id: req.params.id};

  articles.findById(req.params.id, function(err, article){
    if(err) throw err;

    if(article.author != req.user._id){
      res.status(500).send();
    } else {
      articles.remove(query, function(err){
        console.log(err);
      })
      res.send('Success')
    }
  })
})

// Access Control
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  else {
    req.flash('danger', 'Please login');
    res.redirect('/users/login');
  }
}

module.exports = router;