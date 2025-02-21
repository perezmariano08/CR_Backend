const express = require('express');
const { revisarToken, revisarAdmin } = require('../middlewares/auth');
const adminController = require('../controllers/adminController');
const equiposController = require('../controllers/equiposController');
const partidosController = require('../controllers/partidosController');
const zonasController = require('../controllers/zonasController');
const noticiasController = require('../controllers/noticiasController')
const temporadasController = require('../controllers/temporadasController')
const jugadoresController = require('../controllers/jugadoresController')
const planillaController = require('../controllers/planillaController')
const logMiddleware = require('../middlewares/logs');

const router = express.Router();

router.post('/crear-torneo', revisarToken, revisarAdmin, logMiddleware, adminController.crearTorneo);
router.post('/crear-sede', revisarToken, revisarAdmin, logMiddleware, adminController.crearSede);
router.post('/crear-anio', revisarToken, revisarAdmin, logMiddleware, adminController.crearAnio);
router.post('/crear-temporada', revisarToken, revisarAdmin, logMiddleware, adminController.crearTemporada);
// router.post('/crear-equipo', revisarToken, revisarAdmin, logMiddleware, adminController.crearEquipo);
router.post('/crear-division', revisarToken, revisarAdmin, logMiddleware, adminController.crearDivision);
router.post('/crear-categoria', revisarToken, revisarAdmin, logMiddleware, adminController.crearCategoria);
router.post('/crear-expulsion', revisarToken, revisarAdmin, logMiddleware, adminController.crearExpulsion);

//Partidos
router.post('/crear-partido', revisarToken, revisarAdmin, logMiddleware, partidosController.crearPartido);
router.put('/actualizar-partido', revisarToken, revisarAdmin, logMiddleware, partidosController.updatePartido);
router.post('/importar-partidos', revisarToken, revisarAdmin, logMiddleware, partidosController.importarPartidos);
router.post('/eliminar-partido', revisarToken, revisarAdmin, logMiddleware, partidosController.deletePartido);

//Categorias forAto
router.post('/insertar-equipo-temporada', revisarToken, revisarAdmin, logMiddleware, temporadasController.insertarEquipoTemporada);
router.post('/insertar-equipo-temporada-categoria', revisarToken, revisarAdmin, logMiddleware, temporadasController.insertarEquipoTemporadaCategoria);
router.put('/vaciar-vacante', revisarToken, revisarAdmin, logMiddleware, zonasController.vaciarVacante);
router.put('/eliminar-vacante', revisarToken, revisarAdmin, zonasController.eliminarVacante);

//Categorias equipos detalle
router.post('/crear-equipo', revisarToken, revisarAdmin, logMiddleware, equiposController.crearEquipo);
router.post('/crear-jugador', revisarToken, revisarAdmin, logMiddleware, jugadoresController.crearJugador);
router.post('/agregar-jugador-plantel', revisarToken, revisarAdmin, logMiddleware, jugadoresController.agregarJugadorPlantel);
router.post('/eliminar-jugador-plantel', revisarToken, revisarAdmin, logMiddleware, jugadoresController.eliminarJugadorPlantel);

router.get('/get-noticias', noticiasController.getNoticias);
router.get('/get-noticia', noticiasController.getNoticiasId);
router.get('/get-torneos', revisarToken, revisarAdmin, adminController.getTorneos);
router.get('/get-sedes', revisarToken, revisarAdmin, adminController.getSedes);
router.get('/get-anios', revisarToken, revisarAdmin, adminController.getAnios);
router.get('/get-divisiones', revisarToken, revisarAdmin, adminController.getDivisiones);
router.get('/get-usuarios', revisarToken, revisarAdmin, adminController.getUsuarios);
router.get('/get-roles', revisarToken, revisarAdmin, adminController.getRoles);
router.get('/get-categorias', revisarToken, revisarAdmin, adminController.getCategorias);
router.get('/get-categorias', revisarToken, revisarAdmin, adminController.getCategorias);
router.get('/get-jugadores-dream', planillaController.getJugadoresDream);

router.post('/delete-usuario', revisarToken, revisarAdmin, adminController.deleteUsuario);
router.post('/delete-temporada', revisarToken, revisarAdmin, adminController.deleteTemporada);
router.post('/delete-anio', revisarToken, revisarAdmin, adminController.deleteAnio);
router.post('/delete-sede', revisarToken, revisarAdmin, adminController.deleteSede);
router.post('/delete-torneo', revisarToken, revisarAdmin, adminController.deleteTorneo);
router.post('/delete-categoria', revisarToken, revisarAdmin, adminController.deleteCategoria);
router.post('/delete-jugador', revisarToken, revisarAdmin, adminController.deleteJugador);
router.post('/create-noticia', revisarToken, revisarAdmin, noticiasController.createNoticia)

router.put('/update-noticia', revisarToken, revisarAdmin, noticiasController.updateNoticia)
router.put('/update-usuario', revisarToken, revisarAdmin, adminController.updateUsuario);
router.put('/update-partido', revisarToken, revisarAdmin, adminController.updatePartido);
router.put('/update-equipo', equiposController.updateEquipo);
router.put('/update-expulsion', revisarToken, revisarAdmin, adminController.actualizarExpulsion);

router.post('/importar-anios', revisarToken, revisarAdmin, adminController.importarAnio);
router.post('/importar-jugadores', revisarToken, revisarAdmin, adminController.importarJugadores);

router.delete('/borrar-expulsion', revisarToken, revisarAdmin, adminController.borrarExpulsion);
router.delete('/eliminar-noticia', revisarToken, revisarAdmin, noticiasController.eliminarNoticia);

router.get('/get-fases', adminController.getFases);
router.post('/create-fases', adminController.createFase);
router.post('/eliminar-fase', adminController.eliminarFase);

router.get('/get-etapas', zonasController.getEtapas);
router.get('/get-partido-zona', adminController.getPartidoZona);
router.get('/get-partidos-categoria', partidosController.getPartidosCategoria);
router.get('/get-partidos-zona', partidosController.getPartidosZona);

router.put('/actualizar-zona', revisarToken, revisarAdmin, zonasController.actualizarZona);
router.post('/eliminar-zona', revisarToken, revisarAdmin, zonasController.eliminarZona);

router.post('/guardar-vacante-play-off', revisarToken, revisarAdmin, partidosController.guardarVacantePlayOff)

router.get('/check-equipo-plantel', adminController.checkEquipoPlantel);
router.post('/copiar-planteles-temporada', revisarToken, revisarAdmin, adminController.copiarPlantelesTemporada);

router.put('/eliminar-jugador-dt', revisarToken, revisarAdmin, jugadoresController.eliminarJugadorDt);
router.put('/resetear-jugadores-destacados', jugadoresController.resetearPosicionesYDT)
router.put('/actualizar-jugadores-destacados', jugadoresController.actualizarJugadorDestacado)

module.exports = router;
