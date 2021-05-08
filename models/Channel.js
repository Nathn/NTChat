const mongoose = require('mongoose');
const msgSchema = new mongoose.Schema({
	name: {
		type: String,
		trim: true
	},
	selector: {
		type: String,
		trim: true
	},
	default: {
		type: Boolean,
		default: false
	},
	rank: {
		type: Number,
		unique: true
	},
	modonly: {
		type: Boolean,
		default: false
	},
	quizzchan: {
		type: Boolean,
		default: false
	}
});

module.exports = mongoose.model('Channel', msgSchema);
