// Importing the model for use on this controller
const User = require('../models/User');
const promisify = require('es6-promisify');
const moment = require('moment');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');
const cloudinary = require('cloudinary').v2;
const nodemailer = require('nodemailer');
const clipboardy = require('clipboardy');


require('dotenv').config({
	path: 'variables.env'
});

// The default controller for this app
exports.registerPage = (req, res) => {
	res.render('register');
}

exports.loginPage = (req, res) => {
	res.render('login');
}


// Registration page middlewares
// Verify the reg data
exports.verifyRegister = async (req, res, next) => {
	req.sanitizeBody('username');
	req.checkBody('username', '200').notEmpty();
	req.check('username', '201').custom(value => !/\s/.test(value));
	req.check('username', '202').custom(value => /^[0-9a-zA-Z_]+$/.test(value));
	req.check('username', '210').isLength({
		max: 16
	});
	req.sanitizeBody('email');
	req.checkBody('email', '203').notEmpty();
	req.checkBody('email', '204').isEmail();
	req.checkBody('password', '205').notEmpty();
	req.checkBody('password-confirm', '206').notEmpty();
	req.checkBody('password-confirm', '207').equals(req.body.password);

	const errors = req.validationErrors();
	if (errors) {
		console.log(errors);
		res.redirect(`register?err=${errors[0].msg}`)
		return;
	}
	next();
}

// Check if the user already exists Will hook it up later
exports.checkUserExists = async (req, res, next) => {
	var user = await User.find({
		username: req.body.username
	})

	// console.log(user);

	if (user.length) {
		res.redirect(`register?err=208`)
		return;
	}

	user = await User.find({
		email: req.body.email
	})

	if (user.length) {
		res.redirect(`register?err=209`)
		return;
	}
	next();
}

// Register the user into the database
exports.registerUser = async (req, res, next) => {
	try {
		const user = new User({
			username: req.body.username,
			name: req.body.username.charAt(0).toUpperCase() + req.body.username.slice(1),
			email: req.body.email,
			lang: req.body.lang
		});

		const register = promisify(User.register, User);
		await register(user, req.body.password);

		next();

	} catch (error) {
		res.redirect('/register');
		console.log(error);
	}
};

