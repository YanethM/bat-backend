const express = require("express");
const multer = require("multer");
const {
  createTutorialSteps,
  getTutorialSteps, getTutorialStepById, updateTutorialStep, deleteTutorialStep
} = require("../controllers/TutorialStepsController");

const router = express.Router();
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/tutorialSteps");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// Filtro para validar el tipo de archivo (solo imágenes)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const mimeType = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (mimeType && extname) {
    return cb(null, true);
  }
  cb(
    new Error("Invalid file type. Only JPEG, PNG, and GIF files are allowed.")
  );
};

// Configuración de Multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Limitar el tamaño del archivo a 5MB
  fileFilter: fileFilter,
});

// Ruta para subir y procesar el CSV
router.post("/", upload.fields([
  { name: 'mobile_image', maxCount: 1 },
  { name: 'web_image', maxCount: 1 }
]), createTutorialSteps);

router.get("/", getTutorialSteps);
router.get("/:id", getTutorialStepById);
router.patch("/:id", upload.fields([
  { name: 'mobile_image', maxCount: 1 },
  { name: 'web_image', maxCount: 1 }
]), updateTutorialStep);
router.delete("/:id", deleteTutorialStep);

module.exports = router;