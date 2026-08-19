const router = require('express').Router();

const razasController = require('../controllers/razasController');
const potrerosController = require('../controllers/potrerosController');
const animalesController = require('../controllers/animalesController');
const pesajesController = require('../controllers/pesajesController');
const fotosController = require('../controllers/fotosController');
const sanidadController = require('../controllers/sanidadController');
const movimientosController = require('../controllers/movimientosController');
const serviciosController = require('../controllers/serviciosController');
const partosController = require('../controllers/partosController');
const eventosController = require('../controllers/eventosController');

router.get('/razas', razasController.listar);

router.get('/potreros', potrerosController.listar);
router.post('/potreros', potrerosController.crear);
router.get('/potreros/tablero', potrerosController.tablero);

router.get('/animales', animalesController.listar);
router.get('/animales/sugerencia-razas', animalesController.sugerenciaRazas);
router.get('/animales/:id', animalesController.obtener);
router.get('/animales/:id/pedigri', animalesController.pedigri);
router.post('/animales', animalesController.crear);
router.put('/animales/:id', animalesController.actualizar);
router.delete('/animales/:id', animalesController.eliminar);

router.get('/animales/:animalId/pesajes', pesajesController.listarPorAnimal);
router.post('/animales/:animalId/pesajes', pesajesController.crear);

router.get('/animales/:animalId/fotos', fotosController.listarPorAnimal);
router.post('/animales/:animalId/fotos', fotosController.crear);

router.get('/animales/:animalId/sanidad', sanidadController.listarPorAnimal);
router.post('/animales/:animalId/sanidad', sanidadController.crear);

router.get('/animales/:animalId/movimientos', movimientosController.listarPorAnimal);
router.post('/animales/:animalId/movimientos', movimientosController.crear);

router.get('/servicios', serviciosController.listar);
router.post('/servicios', serviciosController.crear);
router.put('/servicios/:id/diagnostico', serviciosController.diagnosticar);

router.post('/partos', partosController.crear);

router.get('/eventos', eventosController.listar);

module.exports = router;
