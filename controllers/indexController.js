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
		res.render('error', {
			errormsg: e
		});
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
		res.render('error', {
			errormsg: e
		});
	}

}


exports.fullscreenPage = async (req, res) => {
	try {
		var channelsList = await Channel.find().sort({
			rank: 1
		})
		res.render('window', {
			channelsList,
			reqChan: req.query.chan
		});
	} catch (e) {
		console.log(e);
		res.render('error', {
			errormsg: e
		});
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
