const mongoose = require('mongoose');
const msgSchema = new mongoose.Schema({
	question: {
		type: String,
		trim: true
	},
	answer: {
		type: String,
		trim: true
	},
	trivia: {
		type: String,
		trim: true
	},
	type: {
		type: String,
		trim: true,
		default: 'normal'
	},
	current: {
		type: Boolean,
		default: false
	}
});

module.exports = mongoose.model('Question', msgSchema);
