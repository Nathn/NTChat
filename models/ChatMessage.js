const mongoose = require('mongoose');
const msgSchema = new mongoose.Schema({
	text: {
		type: String,
		trim: true
	},
	created: {
		type: Date,
		default: Date.now
	},
	author: {
		type: mongoose.Schema.ObjectId,
		ref: 'User'
	},
	image: {
		type: String,
		trim: true
	}
});

module.exports = mongoose.model('Tweet', msgSchema);
