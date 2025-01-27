const express = require('express');
const authController = require('../controllers/authController');
const { revisarToken } = require('../middlewares/auth');
const logMiddleware = require('../middlewares/logs');

const router = express.Router();

router.post('/check-email', authController.checkEmail);
router.post('/check-dni', authController.checkDni);
router.post('/check-login', authController.checkLogin);
router.get('/check-authentication', authController.checkAuthentication);

router.post('/crear-cuenta', authController.crearCuenta);
router.post('/logout', revisarToken, logMiddleware, authController.logout);

router.post('/forgot-password', authController.forgotPasswordHandler);
router.post('/change-password', authController.changeNewPassword);

router.get('/activar-cuenta', authController.activarCuenta);
router.get('/activar-email', authController.activarCambioEmail)

module.exports = router;
