const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/check-email', authController.checkEmail);
router.post('/check-dni', authController.checkDni);
router.post('/crear-cuenta', authController.crearCuenta);
router.post('/check-login', authController.checkLogin);
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPasswordHandler);
router.post('/change-password', authController.changeNewPassword);
router.get('/check-authentication', authController.checkAuthentication);
router.get('/activar-cuenta', authController.activarCuenta);

module.exports = router;
