const mongoose = require('mongoose');
const msgSchema = new mongoose.Schema({
	text: {
		type: String,
		trim: true
	},
	channel: {
		type: String,
		trim: true
	},
	created: {
		type: Date,
		default: new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" })
	},
	formatcreated: {
		type: String,
		trim: true
	},
	author: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
		default: null
	},
	image: {
		type: String,
		trim: true
	}
});

module.exports = mongoose.model('Tweet', msgSchema);
