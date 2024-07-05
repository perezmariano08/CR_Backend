const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/check-email', authController.checkEmail);
router.post('/check-dni', authController.checkDni);
router.post('/crear-cuenta', authController.crearCuenta);
router.post('/check-login', authController.checkLogin);
router.post('/logout', authController.logout);
router.get('/check-authentication', authController.checkAuthentication);

module.exports = router;
