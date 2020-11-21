const User = require('../models/User');
const Message = require('../models/ChatMessage');
const moment = require('moment');

moment.locale('fr')

exports.winPage = async (req, res) => {
	try {
		res.render('window');
	} catch (e) {
		console.log(e);
		res.redirect('/error')
	}

}

exports.chatGeneralPage = async (req, res) => {
	try {
		res.render('chat-general');
	} catch (e) {
		console.log(e);
		res.redirect('/error')
	}
}

exports.chatJvPage = async (req, res) => {
	try {
		res.render('chat-jv');
	} catch (e) {
		console.log(e);
		res.redirect('/error')
	}
}

exports.chatMemesPage = async (req, res) => {
	try {
		res.render('chat-memes');
	} catch (e) {
		console.log(e);
		res.redirect('/error')
	}
}

exports.chatNsiPage = async (req, res) => {
	try {
		res.render('chat-nsi');
	} catch (e) {
		console.log(e);
		res.redirect('/error')
	}
}
