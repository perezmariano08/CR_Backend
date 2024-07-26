const express = require('express');
const userController = require('../controllers/userController');
const equiposController = require('../controllers/equiposController');
const expulsadosController = require('../controllers/expulsadosController');

const router = express.Router();

router.get('/get-users', userController.getUsers);
router.get('/get-roles', userController.getRoles);
router.get('/get-partidos', userController.getPartidos);
router.get('/get-jugadores', userController.getJugadores);
router.put('/update-partido', userController.updatePartido);

router.get('/get-equipos', equiposController.getEquipos);
router.get('/get-expulsados', expulsadosController.getExpulsados);


module.exports = router;
