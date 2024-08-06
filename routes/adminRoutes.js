const express = require('express');
const { revisarToken, revisarAdmin } = require('../middlewares/auth');
const adminController = require('../controllers/adminController');
const equiposController = require('../controllers/equiposController');

const router = express.Router();

router.post('/crear-torneo', revisarToken, revisarAdmin, adminController.crearTorneo);
router.post('/crear-sede', revisarToken, revisarAdmin, adminController.crearSede);
router.post('/crear-anio', revisarToken, revisarAdmin, adminController.crearAnio);
router.post('/crear-temporada', revisarToken, revisarAdmin, adminController.crearTemporada);
router.post('/crear-equipo', revisarToken, revisarAdmin, adminController.crearEquipo);
router.post('/crear-division', revisarToken, revisarAdmin, adminController.crearDivision);
router.post('/crear-categoria', revisarToken, revisarAdmin, adminController.crearCategoria);
router.post('/crear-jugador', revisarToken, revisarAdmin, adminController.crearJugador);
router.post('/crear-partido', revisarToken, revisarAdmin, adminController.crearPartido);

router.get('/get-torneos', revisarToken, revisarAdmin, adminController.getTorneos);
router.get('/get-sedes', revisarToken, revisarAdmin, adminController.getSedes);
router.get('/get-anios', revisarToken, revisarAdmin, adminController.getAnios);
router.get('/get-divisiones', revisarToken, revisarAdmin, adminController.getDivisiones);
router.get('/get-usuarios', revisarToken, revisarAdmin, adminController.getUsuarios);
router.get('/get-roles', revisarToken, revisarAdmin, adminController.getRoles);
router.get('/get-temporadas', revisarToken, revisarAdmin, adminController.getTemporadas);
router.get('/get-categorias', revisarToken, revisarAdmin, adminController.getCategorias);

router.post('/delete-usuario', revisarToken, revisarAdmin, adminController.deleteUsuario);
router.post('/delete-temporada', revisarToken, revisarAdmin, adminController.deleteTemporada);
router.post('/delete-anio', revisarToken, revisarAdmin, adminController.deleteAnio);
router.post('/delete-sede', revisarToken, revisarAdmin, adminController.deleteSede);
router.post('/delete-torneo', revisarToken, revisarAdmin, adminController.deleteTorneo);
router.post('/delete-categoria', revisarToken, revisarAdmin, adminController.deleteCategoria);
router.post('/delete-jugador', revisarToken, revisarAdmin, adminController.deleteJugador);

router.put('/update-usuario', revisarToken, revisarAdmin, adminController.updateUsuario);
router.put('/update-partido', revisarToken, revisarAdmin, adminController.updatePartido);
router.put('/update-equipo', revisarToken, revisarAdmin, equiposController.updateEquipo);

router.post('/importar-anios', revisarToken, revisarAdmin, adminController.importarAnio);
router.post('/importar-jugadores', revisarToken, revisarAdmin, adminController.importarJugadores);

module.exports = router;
