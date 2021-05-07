const passport = require('passport');

exports.login = passport.authenticate('local', {
	failureRedirect: '/login?err=300',
	successRedirect: '/fs'
});

exports.logout = (req, res) => {
	req.logout();
	res.redirect('/fs')
}

exports.isLoggedIn = (req, res, next) => {
	if (!req.isAuthenticated()) {
		res.render('error', {
			errormsg: 'Not logged in'
		});
		return;
	}

	next();
}
