const Channel = require('../models/Channel');
const moment = require('moment');

moment.locale('fr')

// The default controller for this app
// The home page
exports.indexPage = async (req, res) => {
	try {
		res.render('index');
	} catch (e) {
		console.log(e);
		res.render('error');
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
		res.render('error');
	}

}


exports.fullscreenPage = async (req, res) => {
	try {
		var channelsList = await Channel.find().sort({
			rank: 1
		})
		res.render('window', {
			channelsList
		});
	} catch (e) {
		console.log(e);
		res.render('error')
	}

}

exports.errorPage = async (req, res) => {
	try {
		res.render('error');
	} catch (e) {
		console.log(e);
	}

}

exports.codePage = async (req, res) => {
	try {
		const channel = req.params.channel;
		res.render('code', {
			channel
		});
	} catch (e) {
		console.log(e);
	}

}
