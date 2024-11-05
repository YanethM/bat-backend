const express = require("express");
const router = express.Router();
const breweryController = require("../controllers/BreweryController");
const multer = require('multer');
const upload = multer({ dest: 'uploads/breweries_location' });

router.get("/upload-breweries", upload.single('file'),breweryController.uploadAndProcessCSV);
router.get("/", breweryController.getBreweries);
router.get("/:id", breweryController.getBreweryById);
router.get("/city/:stateId", breweryController.getBreweriesBySpecificLocation);
router.get("/owner/:ownerId", breweryController.getBreweriesByOwner);

module.exports = router;