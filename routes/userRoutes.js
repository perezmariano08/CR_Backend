const express = require('express');
const userController = require('../controllers/userController');
const equiposController = require('../controllers/equiposController');
const expulsadosController = require('../controllers/expulsadosController');
const partidosController = require('../controllers/partidosController');
const temporadasController = require('../controllers/temporadasController')
const jugadoresController = require('../controllers/jugadoresController')
const edicionesController = require('../controllers/edicionesController')
const categoriasController = require('../controllers/categoriasController')
const plantelesController = require('../controllers/plantelesController')
const perfilController = require('../controllers/perfilController');
const zonasController = require('../controllers/zonasController');
const planilleroController = require('../controllers/planilleroController')
const mailerContacto = require('../utils/mailer-contacto');
const { revisarToken, revisarPlanillero } = require('../middlewares/auth');

const router = express.Router();

router.get('/get-users', userController.getUsers);
router.get('/get-roles', userController.getRoles);
// router.get('/get-partidos', userController.getPartidos);
router.get('/get-jugadores', userController.getJugadores);
router.get('/get-zonas', temporadasController.getZonas);
//router.get('/get-categorias', userController.getCategorias);

router.get('/get-equipos', equiposController.getEquipos);
router.get('/get-expulsados', expulsadosController.getExpulsados);
router.get('/get-partidos-eventuales', userController.partidosJugadorEventual)

router.post('/update-perfil',  revisarToken, revisarPlanillero, perfilController.editarPerfil)

// Gets
router.get('/get-partidos-incidencias', partidosController.getIncidenciasPartido);
router.get('/get-partidos-formaciones', partidosController.getFormacionesPartido);
router.get('/get-posiciones-zona', temporadasController.getPosicionesTemporada);
router.get('/get-estadistica-categoria', temporadasController.getEstadisticasCategoria);
router.get('/get-jugadores-equipo', equiposController.getJugadoresEquipo);
router.get('/get-novedades', perfilController.getNovedades)
router.get('/get-estadisticas-equipo-categoria', equiposController.getParticipacionesEquipo)

//router.post('/crear-jugador', userController.crearJugador);

// Jugadores
router.post('/delete-jugador', jugadoresController.deleteJugador);
router.put('/update-jugador', jugadoresController.updateJugador);
router.post('/importar-jugadores', jugadoresController.importarJugadores);

router.get('/get-jugadores', jugadoresController.getJugadores);
router.get('/verificar-jugador', jugadoresController.verificarJugadorEventual)
router.get('/get-jugador-eventual-categoria', jugadoresController.verificarCategoriaJugadorEventual)

// Planteles
router.get('/get-planteles', plantelesController.getPlanteles);

router.get('/get-partidos', partidosController.getPartidos);
router.get('/get-planteles-partido', partidosController.getPlantelesPartido);

// Ediciones
router.post('/crear-edicion', edicionesController.crearEdicion);
router.put('/actualizar-edicion', edicionesController.actualizarEdicion);
router.post('/eliminar-edicion', edicionesController.eliminarEdicion);
router.get('/get-ediciones', edicionesController.getEdiciones);

// Categorias
router.post('/crear-categoria', categoriasController.crearCategoria);
router.put('/actualizar-categoria', categoriasController.actualizarCategoria);
router.put('/publicar-categoria', categoriasController.publicarCategoria);
router.post('/eliminar-categoria', categoriasController.eliminarCategoria);

router.get('/get-categorias', categoriasController.getCategorias);

// Equipos
router.post('/eliminar-equipo', equiposController.eliminarEquipo);
router.put('/actualizar-categoria-equipo', equiposController.actualizarCategoriaEquipo);
router.put('/actualizar-apercibimientos', equiposController.actualizarApercibimientos);

//Temporadas
router.get('/get-temporadas', temporadasController.getTemporadas);
router.post('/eliminar-equipo-temporada', temporadasController.eliminarEquipoTemporada);
router.get('/determinar-ventaja', temporadasController.determinarVentaja);

//Zonas 
router.post('/crear-zona', zonasController.crearZona);
router.post('/crear-zona-vacantes-partidos', zonasController.crearZonaVacantesPartidos);

//DreamTeam
router.get('/get-dreamteam-jornada', jugadoresController.traerDreamTeamFecha)
router.get('/get-jugadores-destacados', jugadoresController.getJugadoresDestacados);
router.get('/get-jugadores-categoria', jugadoresController.traerJugadoresPorCategoria);
router.post('/armar-dreamteam', userController.armarDreamteam)

router.post('/actualizar-partido-vacante', partidosController.actualizarPartidoVacante)

router.post('/enviar-mensaje-contacto', mailerContacto.userMessageContact)

module.exports = router;
