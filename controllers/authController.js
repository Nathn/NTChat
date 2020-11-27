const passport = require('passport');

exports.login = passport.authenticate('local', {
	failureRedirect: '/login?err=300',
	successRedirect: '/window'
});

exports.logout = (req, res) => {
	req.logout();
	res.redirect('/window')
}

exports.isLoggedIn = (req, res, next) => {
	if (!req.isAuthenticated()) {
		res.redirect('/error');
		return;
	}

	next();
}
