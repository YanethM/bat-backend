const express = require("express");
const router = express.Router();
const adRatesController = require("../controllers/AdRatesController");

router.post("/", adRatesController.createAdRate);
router.get("/", adRatesController.getAdRates);
router.get("/:id", adRatesController.getAdRateById);
router.patch("/:id", adRatesController.updateAdRate);
router.delete("/:id", adRatesController.deleteAdRate);

module.exports = router;