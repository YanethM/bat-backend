const express = require("express");
const router = express.Router();
const appTermsController = require("../controllers/AppTermsController");

router.post("/", appTermsController.createTerms);
router.get("/", appTermsController.getTerms);
router.get("/type/:type", appTermsController.getTermsByType);
router.get("/:id", appTermsController.getTermsById);
router.patch("/:id", appTermsController.updateTerms);
router.delete("/:id", appTermsController.deleteTerms);

module.exports = router;
