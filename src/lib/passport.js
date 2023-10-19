const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const pool = require('../database');
const helpers = require('./helpers');

passport.use('local.signin', new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, username, password, done) => {
  console.log(password)
  const rows = await pool.query('SELECT * FROM empleado WHERE username = ?', [username]);
  if (rows.length > 0) {
    const user = rows[0];
    console.log(user)
    const validPassword = await helpers.matchPassword(password, user.password)
    if (validPassword) {
      done(null, user, req.flash('success', 'Welcome ' + user.username));
    } else {
      done(null, false, req.flash('message', 'The Username does not exists and/or Incorrect Password'));
    }
  } else {
    return done(null, false, req.flash('message', 'The Username does not exists and/or Incorrect Password'));
  }
}));

passport.use('local.signup', new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, username, password, done) => {

  const { cedula,correo } = req.body;
  let newUser = {
    cedula,
    username,
    correo,
    password
  };
  newUser.password = await helpers.encryptPassword(password);
  // Saving in the Database
  const result = await pool.query('INSERT INTO empleado SET ? ', newUser);
  newUser.id = result.insertId;
  return done(null, newUser);
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const rows = await pool.query('SELECT * FROM empleado WHERE id = ?', [id]);
  done(null, rows[0]);
});

