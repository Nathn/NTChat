const User = require('../models/User');
const Message = require('../models/ChatMessage');
const moment = require('moment');

moment.locale('fr')

exports.chatPage = async (req, res) => {
	try {
		res.render('chat');
	} catch (e) {
		console.log(e);
		res.redirect('/error')
	}

}
