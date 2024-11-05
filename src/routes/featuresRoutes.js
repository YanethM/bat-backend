const express = require("express");
const router = express.Router();
const featuresController = require("../controllers/FeaturesController");

router.post("/", featuresController.createFeature);
router.get("/", featuresController.getFeatures);
router.get("/:id", featuresController.getFeatureById);
router.patch("/:id", featuresController.updateFeature);
router.delete("/:id", featuresController.deleteFeature);

module.exports = router;
