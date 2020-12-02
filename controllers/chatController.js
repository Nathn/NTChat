const User = require('../models/User');
const ChatMessage = require('../models/ChatMessage');
const cloudinary = require('cloudinary').v2;
const moment = require('moment');

moment.locale('fr')

exports.chatAnnoncesPage = async (req, res) => {
	try {
		const messages = await ChatMessage.find({
				channel: 'ann'
			}).populate('author').sort({
				created: 'asc'
			});
		res.render('chat-annonces', {
			messages
		});
	} catch (e) {
		console.log(e);
		res.render('error')
	}
}

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
		res.render('error')
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
		res.render('error')
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
		res.render('error')
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
		res.render('error')
	}
}

exports.uploadImage = async (req, res, next) => {
	try {
		if (req.files) {
			const image = req.files.image;
			if (image) {
				try {
					await cloudinary.uploader.upload(image.tempFilePath,
						{format: 'png', transformation: [
  							{width: 200, crop: "scale"}
  						]},
						async function (err, result) {
							console.log(result, err)
							if (result) {
								const imageurl = result.secure_url.toString()
								req.imageurl = imageurl
							}
						}
					)
				} catch (e) {
					console.log(e);
					res.redirect('/?err=103')
				}
			}
			next();
		} else {
			next();
		}
	} catch (e) {
		console.log(e);
		res.render('error')
	}
}

exports.sendmsg = async (req, res) => {
	try {
		if (req.imageurl) {
			req.body.image = req.imageurl
		} else if (!req.body.text) {
			return res.redirect('back')
		} else if (!req.body.text.replace(/\s/g, '').length) {
			return res.redirect('back')
		}
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
	return hours+1 + ':' + minutes.substr(-2)
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
