const express = require('express');
const { revisarCookie, revisarAdmin } = require('../middlewares/auth');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.post('/crear-torneo', revisarCookie, revisarAdmin, adminController.crearTorneo);
router.post('/crear-sede', revisarCookie, revisarAdmin, adminController.crearSede);
router.post('/crear-anio', revisarCookie, revisarAdmin, adminController.crearAnio);
router.post('/crear-temporada', revisarCookie, revisarAdmin, adminController.crearTemporada);
router.post('/crear-equipo', revisarCookie, revisarAdmin, adminController.crearEquipo);
router.post('/crear-division', revisarCookie, revisarAdmin, adminController.crearDivision);
router.post('/crear-categoria', revisarCookie, revisarAdmin, adminController.crearCategoria);
router.post('/crear-jugador', revisarCookie, revisarAdmin, adminController.crearJugador);
router.post('/crear-partido', revisarCookie, revisarAdmin, adminController.crearPartido);

router.get('/get-torneos', revisarCookie, revisarAdmin, adminController.getTorneos);
router.get('/get-sedes', revisarCookie, revisarAdmin, adminController.getSedes);
router.get('/get-anios', revisarCookie, revisarAdmin, adminController.getAnios);
router.get('/get-divisiones', revisarCookie, revisarAdmin, adminController.getDivisiones);
router.get('/get-usuarios', revisarCookie, revisarAdmin, adminController.getUsuarios);
router.get('/get-roles', revisarCookie, revisarAdmin, adminController.getRoles);
router.get('/get-temporadas', revisarCookie, revisarAdmin, adminController.getTemporadas);
router.get('/get-categorias', revisarCookie, revisarAdmin, adminController.getCategorias);

router.post('/delete-usuario', revisarCookie, revisarAdmin, adminController.deleteUsuario);
router.post('/delete-temporada', revisarCookie, revisarAdmin, adminController.deleteTemporada);
router.post('/delete-anio', revisarCookie, revisarAdmin, adminController.deleteAnio);
router.post('/delete-sede', revisarCookie, revisarAdmin, adminController.deleteSede);
router.post('/delete-torneo', revisarCookie, revisarAdmin, adminController.deleteTorneo);
router.post('/delete-categoria', revisarCookie, revisarAdmin, adminController.deleteCategoria);
router.post('/delete-jugador', revisarCookie, revisarAdmin, adminController.deleteJugador);

router.put('/update-usuario', revisarCookie, revisarAdmin, adminController.updateUsuario);
router.put('/update-partido', revisarCookie, revisarAdmin, adminController.updatePartido);

router.post('/importar-anios', revisarCookie, revisarAdmin, adminController.importarAnio);
router.post('/importar-jugadores', revisarCookie, revisarAdmin, adminController.importarJugadores);

module.exports = router;
