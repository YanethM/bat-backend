const express = require('express');
const router = express.Router();
const locationBreweryController = require('../controllers/LocationBreweryController');

router.get('/', locationBreweryController.getLocationBrewery);
router.get('/:cityId', locationBreweryController.getBreweriesBySpecificLocation);

module.exports = router;