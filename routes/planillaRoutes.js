const express = require('express');
const planillaController = require('../controllers/planillaController');
const actionsController = require('../controllers/actionsController');
const expulsadosController = require('../controllers/expulsadosController');
const { revisarToken, revisarPlanillero } = require('../middlewares/auth');

const router = express.Router();

router.get('/get-partidos-planillero', planillaController.getPartidosPlanillero);
router.get('/get-partidos-planillados', planillaController.getPartidosPlanillados);
router.get('/get-partidos-incidencias', planillaController.getPartidoIncidencias);
router.get('/get-partido-formaciones', planillaController.getPartidoFormaciones);
router.post('/calcular-expulsiones', revisarToken, revisarPlanillero, expulsadosController.calcularExpulsiones);

router.post('/firma-jugador', planillaController.firmaJugador);

router.post('/insertar-gol', actionsController.insertarGol);
router.post('/insertar-amarilla', actionsController.insertarAmarilla);
router.post('/insertar-roja', actionsController.insertarRoja);

router.put('/actualizar-gol', actionsController.actualizarGol);
router.put('/actualizar-amarilla', actionsController.actualizarAmarilla);
router.put('/actualizar-roja', actionsController.actualizarGol);

router.delete('/eliminar-gol', actionsController.eliminarGol);
router.delete('/eliminar-amarilla', actionsController.eliminarAmarilla);
router.delete('/eliminar-roja', actionsController.eliminarRoja);

router.put('/insertar-mvp-partido', planillaController.updateMvpPartido);
router.get('/get-jugadores-destacados', planillaController.getJugadoresDestacados);
router.post('/insertar-jugador-destacado', actionsController.insertarJugadorDestacado);
router.delete('/eliminar-jugador-destacado', actionsController.eliminarJugadorDestacado);

router.delete('/delete-firma-jugador', actionsController.borrarFirmaJugador);
router.post('/insertar-jugador-eventual', planillaController.crearJugadorEventual);

router.get('/get-edicion', planillaController.getEdicion);
router.get('/check-partidos-eventual', planillaController.checkPartidosEventual)

router.put('/suspender-partido', revisarToken, revisarPlanillero, planillaController.suspenderPartido)
router.get('/verificar-comienzo-partido', planillaController.verificarJugadores)
router.put('/actualizar-estado-partido', planillaController.actualizarEstadoPartido)
router.put('/actualizar-partido', planillaController.updatePartido)

module.exports = router;
