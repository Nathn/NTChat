const mongoose = require('mongoose');
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose');
const md5 = require('md5');

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		trim: true,
		required: true,
		unique: true,
		lowercase: true
	},
	name: {
		type: String,
		trim: true,
		required: true
	},
	email: {
		type: String,
		required: true,
		unique: true,
		lowercase: true,
		validate: [validator.isEmail, 'Invalid email']
	},
	avatar: String,
	banner: String,
	created: {
		type: Date,
		default: Date.now
	},
	moderator: {
		type: Boolean,
		default: false
	},
	banned: {
		type: Boolean,
		default: false
	}
});

userSchema.plugin(passportLocalMongoose, {
	usernameField: 'username'
});
userSchema.plugin(mongodbErrorHandler);


module.exports = mongoose.model('User', userSchema);
