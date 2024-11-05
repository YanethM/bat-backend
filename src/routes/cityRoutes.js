const express = require('express');
const multer = require('multer');
const {uploadAndProcessCSV, listStates, listCountiesByState, getCitiesByCounty,findCityByName, getCityById, listAllCities} = require('../controllers/cityController');
const router = express.Router();

// Configuración de Multer para manejar la subida de archivos
const upload = multer({ dest: 'uploads/' });

// Ruta para subir y procesar el CSV
router.post('/upload-csv', upload.single('file'), uploadAndProcessCSV);
router.get('/', listStates);
router.get('/:stateId/counties', listCountiesByState);
router.get('/county/:countyId', getCitiesByCounty);
router.get('/find/:cityName', findCityByName);
router.get('/cities/:id', getCityById);
router.get('/all-cities', listAllCities);

module.exports = router;