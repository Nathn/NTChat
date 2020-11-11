// Calling the modules
const express = require('express');
const router = express.Router();
const indexController = require('../controllers/indexController');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

// Index page
router.get('/', indexController.indexPage);

router.get('/error', indexController.errorPage);
router.get('/login', userController.loginPage);
router.get('/register', userController.registerPage);

router.get('/:something', indexController.doNotExistPage);

router.post('/register',
	userController.verifyRegister,
	userController.checkUserExists,
	userController.registerUser,
	authController.login
)
router.post('/login', authController.login);


// Exporting the module
module.exports = router;
