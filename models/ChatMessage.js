const mongoose = require('mongoose');
const msgSchema = new mongoose.Schema({
	text: {
		type: String,
		trim: true
	},
	content: {
		type: String,
		trim: true
	},
	code: {
		type: String
	},
	channel: {
		type: String,
		trim: true
	},
	created: {
		type: Date,
		default: new Date()
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
