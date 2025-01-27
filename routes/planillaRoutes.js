const express = require('express');
const planillaController = require('../controllers/planillaController');
const actionsController = require('../controllers/actionsController');
const expulsadosController = require('../controllers/expulsadosController');
const { revisarToken, revisarPlanillero } = require('../middlewares/auth');

const router = express.Router();

// router.get('/get-partidos-planillados', planillaController.getPartidosPlanillados);
router.get('/get-partidos-planillero', revisarToken, revisarPlanillero, planillaController.getPartidosPlanillero);
router.get('/get-partidos-incidencias', planillaController.getPartidoIncidencias);
router.get('/get-partido-formaciones', planillaController.getPartidoFormaciones);
router.post('/calcular-expulsiones', revisarToken, revisarPlanillero, expulsadosController.calcularExpulsiones);

router.post('/firma-jugador', revisarToken, revisarPlanillero, planillaController.firmaJugador);

router.post('/insertar-gol', revisarToken, revisarPlanillero, actionsController.insertarGol);
router.post('/insertar-amarilla', revisarToken, revisarPlanillero, actionsController.insertarAmarilla);
router.post('/insertar-roja', revisarToken, revisarPlanillero, actionsController.insertarRoja);

router.put('/actualizar-gol', revisarToken, revisarPlanillero, actionsController.actualizarGol);
router.put('/actualizar-amarilla', revisarToken, revisarPlanillero, actionsController.actualizarAmarilla);
router.put('/actualizar-roja', revisarToken, revisarPlanillero, actionsController.actualizarGol);

router.delete('/eliminar-gol', revisarToken, revisarPlanillero, actionsController.eliminarGol);
router.delete('/eliminar-amarilla', revisarToken, revisarPlanillero, actionsController.eliminarAmarilla);
router.delete('/eliminar-roja', revisarToken, revisarPlanillero, actionsController.eliminarRoja);

router.put('/insertar-mvp-partido', revisarToken, revisarPlanillero, planillaController.updateMvpPartido);
router.get('/get-jugadores-destacados', revisarToken, revisarPlanillero, planillaController.getJugadoresDestacados);
router.post('/insertar-jugador-destacado', revisarToken, revisarPlanillero, actionsController.insertarJugadorDestacado);
router.delete('/eliminar-jugador-destacado', revisarToken, revisarPlanillero, actionsController.eliminarJugadorDestacado);

router.delete('/delete-firma-jugador', revisarToken, revisarPlanillero, actionsController.borrarFirmaJugador);
router.post('/insertar-jugador-eventual', revisarToken, revisarPlanillero, planillaController.crearJugadorEventual);

router.get('/get-edicion', planillaController.getEdicion);
router.get('/check-partidos-eventual', revisarToken, revisarPlanillero, planillaController.checkPartidosEventual)

router.put('/suspender-partido', revisarToken, revisarPlanillero, planillaController.suspenderPartido)
router.get('/verificar-comienzo-partido', revisarToken, revisarPlanillero, planillaController.verificarJugadores)
router.put('/actualizar-estado-partido', revisarToken, revisarPlanillero, planillaController.actualizarEstadoPartido)
router.put('/actualizar-partido', revisarToken, revisarPlanillero, planillaController.updatePartido)

module.exports = router;
