var express = require('express');
var router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

User = require('../connection/users.js');

/* GET home page. */
router.get('/', ensureAuthenticated, function(req, res, next) {
  res.render('index', { 
  	title: 'Passport System',
  	errors: null 
  });
});

// Get login

router.get('/login', (req, res, next) => {
	res.render('login', {
		title: 'Passport System'
	})
});

// Get register

router.get('/register', (req, res, next) => {
	res.render('register', {
		title: 'Passport System',
		errors: null
	});
});

// Get logout
router.get('/logout', (req, res) => {
	req.logout();
	req.flash('success', 'You are now logged out');
	res.redirect('/login');
});

// Use LocalStrategy

passport.use(new LocalStrategy((username, password, done) => {
	User.findUserByUsername(username, (err, user) => {
		if(err) throw err;
		if(!user) {
			return done(null, false, {message: 'Incorrect username'});
		} 
		User.comparePassword(password, user.password, (err, isMatch) => {
			if(err) throw err;
			if(isMatch){
				return done(null, user);
			} else {
				return done(null, false, {message: 'Incorrect password'});
			}
		});
	});
}));

// Serialize detials

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findUserById(id, function(err, user) {
    done(err, user);
  });
});

// Post login

router.post('/login', (req, res, next) => {
	passport.authenticate('local', {
		failureRedirect: '/login',
		successRedirect: '/',
		failureFlash: true
	})(req, res, next);
});
// Post register

router.post('/register', (req, res, next) => {
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('username', 'Userame is required').notEmpty();
	req.checkBody('email', 'Email is required').isEmail();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('confirm', 'Passwords do not match').equals(req.body.password);

	let errors = req.validationErrors();

	if(errors){
		res.render('index', {
			title: 'Passport System',
			errors: errors
		});
	} else {
		 const newUser = new User({
		 	name: req.body.name,
		 	username: req.body.username,
		 	email: req.body.email,
		 	password: req.body.password
		 });

		 User.registerUser(newUser, (err, user) => {
		 	if(err) throw err;
		 	req.flash('success', 'Thank you for registering');
		 	res.redirect('/login');
		 });
	}
});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		console.log(req.isAuthenticated());
		req.flash('error', 'Please login or register');
		res.redirect('/login');
	}
}
module.exports = router;
