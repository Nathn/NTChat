const User = require('../models/User');
const ChatMessage = require('../models/ChatMessage');
const Channel = require('../models/Channel');
const Question = require('../models/Question');
const cloudinary = require('cloudinary').v2;
const moment = require('moment');
const levenshtein = require('js-levenshtein');
// require("copy-paste").global();

moment.locale('fr');

exports.chatPage = async (req, res) => {
	try {
		if (!req.query.chan) return res.render('error', {
			errormsg: 'No channel selected'
		});
		var channelsList = await Channel.find()
		var channel = await Channel.findOne({
			selector: req.query.chan
		})
		if (!channel) return res.render('error', {
			errormsg: 'Selected channel not found'
		});
		var messages = await ChatMessage.find({
			channel: req.query.chan
		}).populate('author').sort({
			created: 'asc'
		}).limit(300);
		if (req.query.chan == 'ann') {
			function filter_users(message) {
				return message.author.moderator == true;
			}
			messages = messages.filter(filter_users);
		}
		res.render('chat', {
			messages,
			channel,
			channelsList: channelsList,
			moment
		});
	} catch (e) {
		console.log(e);
		res.render('error', {
			errormsg: e
		});
	}
}

exports.uploadImage = async (req, res, next) => {
	try {
		if (req.files) {
			const image = req.files.image;
			if (image) {
				try {
					await cloudinary.uploader.upload(image.tempFilePath, {
							format: 'png',
							transformation: [{
								width: 500,
								crop: "scale"
							}]
						},
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
					res.render('error', {
						errormsg: e
					});
				}
			}
			next();
		} else {
			next();
		}
	} catch (e) {
		console.log(e);
		res.render('error', {
			errormsg: e
		});
	}
}

async function html(str, channels) {
	var replacedText, replacePattern1, replacePattern2, replacePattern3, replacePattern4, replacePattern5;

	//URLs starting with http://, https://, or ftp://
	replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
	replacedText = str.replace(replacePattern1, `<a href="$1" target="_blank" class="link">$1</a>`);

	//URLs starting with "www." (without // before it, or it'd re-link the ones done above).
	replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
	replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank" class="link">$2</a>');

	replacePattern3 = /\*\*([^]+)\*\*/gim;
	replacedText = replacedText.replace(replacePattern3, '<b>$1</b>')

	replacePattern4 = /\*([^*]+)\*/gim;
	replacedText = replacedText.replace(replacePattern4, '<i>$1</i>')

	replacePattern5 = /\`([^`]+)\`/gim;
	replacedText = replacedText.replace(replacePattern5, '<code>$1</code>')

	var chanList = "\\B\\#(";
	for (let i = 0; i < channels.length; i++) {
		chanList += channels[i].name.toLowerCase();
		if (i != channels.length - 1) chanList += "|"
	}
	chanList += ")\\b"
	replacedText = await replacedText.replace(new RegExp(chanList, "gim"), function (match, input) {
		for (let i = 0; i < channels.length; i++) {
			if (input.toLowerCase() == channels[i].name.toLowerCase()) chan = channels[i]
			if (i != channels.length - 1) chanList += "|"
		}
		if (chan) var chanselector = chan.selector
		var post = match
		if (chanselector) post = `<a onclick="parent.changeChannel('${chanselector}')" class="link">${match}</a>`;
		return post;
	})

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
		if (!req.user) return res.redirect('/fs');
		if (req.params.channel == 'ann' && !req.user.moderator) res.redirect('/fs');
		req.body.author = req.user._id;
		req.body.channel = req.params.channel;
		var channels = await Channel.find()
		if (req.body.text) req.body.content = await html(req.body.text.replace(/\</g, "&lt;").replace(/\>/g, "&gt;"), channels)
		// Interactive quizz implementation
		var quizzChan = await Channel.findOne({
			quizzchan: true
		})
		if (quizzChan && req.params.channel == quizzChan.selector) {
			var currentQuestion = await Question.findOne({
				current: true
			})
			if (currentQuestion.type == "maths" || currentQuestion.type == "date") {
				var maxDist = 0
			} else {
				var maxDist = 3
			}
			if (req.body.text && levenshtein(req.body.text.toLowerCase(), currentQuestion.answer.toLowerCase()) <= maxDist) {
				req.body.content = "<b>" + currentQuestion.answer + "</b>"
				const msg = new ChatMessage(req.body);
				await msg.save();
				var quizzBot = await User.findOne({
					username: "quizzbot"
				})
				var bestUser = await User.findOne({
					quizzFirst: true
				})
				await User.findOneAndUpdate({
					_id: req.user._id
				}, {
					$inc: {
						questionsAnswered: 1
					}
				})
				if (req.user.quizzFirst != true && req.user.questionsAnswered > bestUser.questionsAnswered) {
					await User.findOneAndUpdate({
						_id: req.user._id
					}, {
						$set: {
							quizzFirst: true
						}
					})
					await User.findOneAndUpdate({
						_id: bestUser._id
					}, {
						$set: {
							quizzFirst: false
						}
					})
				}
				await Question.findOneAndUpdate({
					_id: currentQuestion._id
				}, {
					$set: {
						current: false
					}
				})

				if (quizzBot) {
					if (currentQuestion.trivia) {
						var randomMessage = currentQuestion.trivia
					} else {
						var ggMessages = ["Quel crack celui là !", "GGWP.", "Juste le boss en fait.", "Poggers !", "Il doit avoir un QI d'au moins 143.", "Je suis jaloux...", "J'avais peur que personne ne soit à la hauteur...", "Tu es trop fort... That's kinda sus.", "L'humanité n'attendait plus que toi !", "Mais c'est une vraie machine de guerre celui-là !"]
						var randomMessage = ggMessages[Math.floor(Math.random() * ggMessages.length)];
					}
					var botMsg = new ChatMessage({
						author: quizzBot._id,
						channel: req.params.channel,
						text: `**C'était bien ${currentQuestion.answer}, ${req.user.name} a trouvé la bonne réponse ! ${randomMessage}**`,
						content: `<b>C'était bien ${currentQuestion.answer}, ${req.user.name} a trouvé la bonne réponse ! ${randomMessage}</b>`
					});
					setTimeout(async function saveMsg() {await botMsg.save()}, 1500);
					sendNewQuestion(req.params.channel, quizzBot)
				}
				return res.redirect('/fs?chan=' + req.params.channel);
			}
		}
		const msg = new ChatMessage(req.body);
		await msg.save();
		res.redirect('/fs?chan=' + req.params.channel);
	} catch (e) {
		console.log(e);
		res.redirect('/fs?err=400')
	}
}

async function sendNewQuestion(channel, quizzBot) {
	await Question.countDocuments().exec(async function (err, count) {
		var random = Math.floor(Math.random() * count)
		Question.findOne().skip(random).exec(
			async function (err, result) {
				if (err) return res.render('error', {
					errormsg: err
				});
				await Question.findOneAndUpdate({
					_id: result._id
				}, {
					$set: {
						current: true
					}
				})
				var newQMessages = ["Nouvelle question : ", "Question suivante : ", "Nouvelle question ! ", "On passe à la question suivante : "]
				var randomMessage = newQMessages[Math.floor(Math.random() * newQMessages.length)];
				if (result.type == "maths") randomMessage = "Un peu de maths pour cette prochaine question : "
				var botMsg = new ChatMessage({
					author: quizzBot._id,
					channel: channel,
					text: `**${randomMessage}${result.question}**`,
					content: `<b>${randomMessage}${result.question}</b>`
				});
				// 5 seconds between each question
				setTimeout(async function saveMsg() {await botMsg.save()}, 5000);
			}
		)
	})
}


exports.deletemsg = async (req, res) => {
	try {
		const message = await ChatMessage.findOne({
			_id: req.params.id
		});
		if (message) channel = message.channel
		if (req.user && req.user.moderator && message) {
			await ChatMessage.deleteOne(message);
		}
		res.redirect('/chat?chan=' + channel);
	} catch (e) {
		console.log(e);
		res.redirect('/fs?err=400')
	}
}

exports.ban = async (req, res) => {
	try {
		if (req.user && req.user.moderator) {
			await User.findOneAndUpdate({
				_id: req.params.id
			}, {
				banned: true
			});
		}
		res.redirect('/chat?chan=' + req.params.channel);
	} catch (e) {
		console.log(e);
		res.render('error', {
			errormsg: e
		});
	}
}
/*
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
		res.render('error', {
						errormsg: e
					});
	}
}
*/
exports.postcode = async (req, res) => {
	try {
		if (!req.body.code) {
			return res.redirect('back')
		} else if (!req.body.code.replace(/\s/g, '').length) {
			return res.redirect('back')
		}
		if (!req.user) return res.redirect('/fs');
		req.body.author = req.user._id;
		req.body.channel = req.params.channel;
		const msg = new ChatMessage(req.body);
		await msg.save();
		res.redirect('/fs?chan=' + req.params.channel);
	} catch (e) {
		console.log(e);
		res.render('error', {
			errormsg: e
		});
	}
}
