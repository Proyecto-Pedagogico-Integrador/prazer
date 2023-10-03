const express = require('express');
const router = express.Router();

const passport = require('passport');
const { isLoggedIn } = require('../lib/auth');

// SIGNUP
router.get('/signup', (req, res) => {
  res.render('auth/signup');
});

router.post('/signup', passport.authenticate('local.signup', {
  successRedirect: '/cliente',
  failureRedirect: '/inicio',
  failureFlash: true
}));

// SINGIN
router.get('/signin', (req, res) => {
  res.render('auth/signin');
});

router.post('/signin', (req, res, next) => {
  req.check('username', 'Username is Required').notEmpty();
  req.check('password', 'Password is Required').notEmpty();
  const errors = req.validationErrors();
  if (errors.length > 0) {
    req.flash('message', errors[0].msg);
    res.redirect('/inicio');
  }
  passport.authenticate('local.signin', {
    successRedirect: '/cliente',
    failureRedirect: '/inicio',
    failureFlash: true
  })(req, res, next);
});

// router.get('/logout', (req, res) => {
//   req.logOut();
//   res.redirect('/');
// });

router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
    }
    res.redirect('/inicio');
  });
});

router.get('/profile', isLoggedIn, (req, res) => {
  res.render('profile');
});

module.exports = router;
