const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.get('/get-users', userController.getUsers);
router.get('/get-roles', userController.getRoles);
router.get('/get-partidos', userController.getPartidos);
router.get('/get-equipos', userController.getEquipos);
router.get('/get-jugadores', userController.getJugadores);


module.exports = router;
