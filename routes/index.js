// Calling the modules
const express = require('express');
const router = express.Router();
const indexController = require('../controllers/indexController');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const chatController = require('../controllers/chatController');

// Index page
router.get('/', indexController.indexPage);

router.get('/fs', indexController.fullscreenPage);
router.get('/chat', chatController.chatPage);
router.get('/login', userController.loginPage);
router.get('/register', userController.registerPage);
router.get('/code/:channel', indexController.codePage);
router.get('/logout', authController.logout);
router.get('/del/:id', chatController.deletemsg);
router.get('/ban/:id/:channel', chatController.ban);
// router.get('/copy/:id', chatController.copymsg);

router.get('/:something', indexController.doNotExistPage);

router.post('/register',
	userController.verifyRegister,
	userController.checkUserExists,
	userController.registerUser,
	authController.login
)
router.post('/login', authController.login);
router.post('/sendmsg/:channel',
	chatController.uploadImage,
	chatController.sendmsg
);
router.post('/postcode/:channel',
	chatController.postcode
);



// Exporting the module
module.exports = router;
