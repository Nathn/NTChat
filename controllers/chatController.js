const User = require('../models/User');
const ChatMessage = require('../models/ChatMessage');
const cloudinary = require('cloudinary').v2;
const moment = require('moment');
require("copy-paste").global();

moment.locale('fr');

exports.chatAnnoncesPage = async (req, res) => {
	try {
		const messages = await ChatMessage.find({
				channel: 'ann'
			}).populate('author').sort({
				created: 'asc'
			});
		res.render('chat-annonces', {
			messages,
			moment
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
			messages,
			moment
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
			messages,
			moment
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
			messages,
			moment
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
			messages,
			moment
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
  							{width: 500, crop: "scale"}
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
					res.redirect('/error')
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

function html(str) {
	var replacedText, replacePattern1, replacePattern2, replacePattern3, replacePattern4, replacePattern5;

	//URLs starting with http://, https://, or ftp://
	replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
	replacedText = str.replace(replacePattern1, `<a href="$1" target="_blank" style="text-decoration: none; color: #3ca4ff;">$1</a>`);

	//URLs starting with "www." (without // before it, or it'd re-link the ones done above).
	replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
	replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank" style="text-decoration: none; color: #3ca4ff;">$2</a>');

	replacePattern3 = /\*\*([^]+)\*\*/gim;
	replacedText = replacedText.replace(replacePattern3, '<b>$1</b>')

	replacePattern4 = /\*([^*]+)\*/gim;
	replacedText = replacedText.replace(replacePattern4, '<i>$1</i>')

	replacePattern5 = /\`([^`]+)\`/gim;
	replacedText = replacedText.replace(replacePattern5, '<code>$1</code>')

	return replacedText
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
		if (!req.user) res.redirect('/fs');
		if (req.params.channel && !req.user.moderator) res.redirect('/fs');
		req.body.author = req.user._id;
		req.body.channel = req.params.channel;
		if (req.body.text) req.body.content = html(req.body.text.replace(/\</g, "&lt;").replace(/\>/g, "&gt;"))
		const msg = new ChatMessage(req.body);
		await msg.save();
		res.redirect('/fs?chan='+req.params.channel);
	} catch (e) {
		console.log(e);
		res.redirect('/fs?err=400')
	}
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
		res.redirect('/error')
	}
}

exports.copymsg = async (req, res) => {
	try {
		const message = await ChatMessage.findOne({
				_id: req.params.id
			});
		channel = message.channel
		if (message){
			if (message.code){
				copy(message.code)
			}
		}
		res.redirect('/chat-'+channel);
	} catch (e) {
		console.log(e);
		res.redirect('/error')
	}
}

exports.postcode = async (req, res) => {
	try {
		if (!req.body.code) {
			return res.redirect('back')
		} else if (!req.body.code.replace(/\s/g, '').length) {
			return res.redirect('back')
		}
		if (!req.user) res.redirect('/fs');
		req.body.author = req.user._id;
		req.body.channel = req.params.channel;
		const msg = new ChatMessage(req.body);
		await msg.save();
		res.redirect('/fs?chan='+req.params.channel);
	} catch (e) {
		console.log(e);
		res.redirect('/error')
	}
}
