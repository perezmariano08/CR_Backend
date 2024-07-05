const express = require('express');
const { revisarCookie, revisarAdmin } = require('../middlewares/auth');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.post('/crear-categoria', revisarCookie, revisarAdmin, adminController.crearCategoria);
router.get('/get-categorias', revisarCookie, revisarAdmin, adminController.getCategorias);
router.post('/delete-categoria', revisarCookie, revisarAdmin, adminController.deleteCategoria);

router.post('/crear-torneo', revisarCookie, revisarAdmin, adminController.crearTorneo);
// router.post('/importar-torneos', revisarCookie, revisarAdmin, adminController.importarTorneo);
router.get('/get-torneos', revisarCookie, revisarAdmin, adminController.getTorneos);
router.post('/delete-torneo', revisarCookie, revisarAdmin, adminController.deleteTorneo);

router.post('/crear-sede', revisarCookie, revisarAdmin, adminController.crearSede);
// router.post('/importar-sedes', revisarCookie, revisarAdmin, adminController.importarSede);
router.get('/get-sedes', revisarCookie, revisarAdmin, adminController.getSedes);
router.post('/delete-sede', revisarCookie, revisarAdmin, adminController.deleteSede);

router.post('/crear-anio', revisarCookie, revisarAdmin, adminController.crearAnio);
router.post('/importar-anios', revisarCookie, revisarAdmin, adminController.importarAnio);
router.post('/delete-anio', revisarCookie, revisarAdmin, adminController.deleteAnio);
router.get('/get-anios', revisarCookie, revisarAdmin, adminController.getAnios);

router.post('/crear-temporada', revisarCookie, revisarAdmin, adminController.crearTemporada);
router.get('/get-temporadas', revisarCookie, revisarAdmin, adminController.getTemporadas);
router.post('/delete-temporada', revisarCookie, revisarAdmin, adminController.deleteTemporada);

router.post('/crear-equipo', revisarCookie, revisarAdmin, adminController.crearEquipo);

router.post('/crear-division', revisarCookie, revisarAdmin, adminController.crearDivision);
router.get('/get-divisiones', revisarCookie, revisarAdmin, adminController.getDivisiones);


router.get('/get-usuarios', revisarCookie, revisarAdmin, adminController.getUsuarios);





module.exports = router;
