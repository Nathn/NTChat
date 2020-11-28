const User = require('../models/User');
const ChatMessage = require('../models/ChatMessage');
const moment = require('moment');

moment.locale('fr')


exports.chatGeneralPage = async (req, res) => {
	try {
		const messages = await ChatMessage.find({
				channel: 'gen'
			}).populate('author').sort({
				created: 'asc'
			});
		res.render('chat-general', {
			messages
		});
	} catch (e) {
		console.log(e);
		res.redirect('/error')
	}
}

exports.chatJvPage = async (req, res) => {
	try {
		const messages = await ChatMessage.find({
				channel: 'jvs'
			}).populate('author').sort({
				created: 'asc'
			});
		res.render('chat-jv', {
			messages
		});
	} catch (e) {
		console.log(e);
		res.redirect('/error')
	}
}

exports.chatMemesPage = async (req, res) => {
	try {
		const messages = await ChatMessage.find({
				channel: 'mem'
			}).populate('author').sort({
				created: 'asc'
			});
		res.render('chat-memes', {
			messages
		});
	} catch (e) {
		console.log(e);
		res.redirect('/error')
	}
}

exports.chatNsiPage = async (req, res) => {
	try {
		const messages = await ChatMessage.find({
				channel: 'nsi'
			}).populate('author').sort({
				created: 'asc'
			});
		res.render('chat-nsi', {
			messages
		});
	} catch (e) {
		console.log(e);
		res.redirect('/error')
	}
}

exports.sendmsg = async (req, res) => {
	try {
		var now = new Date()
		if (!req.user) res.redirect('/fs?err=100');
		req.body.author = req.user._id;
		req.body.channel = req.params.channel;
		req.body.formatcreated = formatHourMinutes(now)
		const msg = new ChatMessage(req.body);
		await msg.save();
		res.redirect('/fs?chan='+req.params.channel);
	} catch (e) {
		console.log(e);
		res.redirect('/fs?err=400')
	}
}

function formatHourMinutes(odate) {
	let unix_timestamp = Date.parse(odate)
	let date = new Date(unix_timestamp);
	var hours = date.getHours();
	var minutes = "0" + date.getMinutes();
	return hours + ':' + minutes.substr(-2)
}


exports.deletemsg = async (req, res) => {
	try {
		const message = await ChatMessage.findOne({
				_id: req.params.id
			});
		channel = message.channel
		if (req.user && req.user.moderator && message){
			await ChatMessage.deleteOne(message);
		}
		res.redirect('/chat-'+channel);
	} catch (e) {
		console.log(e);
		res.redirect('/fs?err=400')
	}
}

exports.ban = async (req, res) => {
	try {
		if (req.user && req.user.moderator){
			const userToBan = await User.findOneAndUpdate({
				_id: req.params.id
			},
			{
				banned: true
			});
		}
		res.redirect('/chat-'+req.params.channel);
	} catch (e) {
		console.log(e);
		res.redirect('/fs?err=400')
	}
}
