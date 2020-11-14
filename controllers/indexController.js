const User = require('../models/User');
const Message = require('../models/ChatMessage');
const moment = require('moment');

moment.locale('fr')

// The default controller for this app
// The home page
exports.indexPage = async (req, res) => {
	try {
		res.render('index');
	} catch (e) {
		console.log(e);
		res.redirect('/error')
	}

}

exports.doNotExistPage = async (req, res) => {
	try {
		pagename = req.params.something;
		res.render('404', {
			pagename
		});
	} catch (e) {
		console.log(e);
		res.redirect('/error');
	}

}

exports.errorPage = async (req, res) => {
	try {
		res.render('error');
	} catch (e) {
		console.log(e);
	}

}
