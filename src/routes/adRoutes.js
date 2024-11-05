const express = require("express");
const router = express.Router();
const adController = require("../controllers/AdController");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/ads");
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
  const allowedTypes = /jpeg|mp4|jpg|png|gif/;
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
    limits: { fileSize: 1024 * 1024 * 50 }, // Aumentar a 50MB
    fileFilter: fileFilter,
  });

  router.post(
    "/",
    (req, res, next) => {
      upload.fields([
        { name: "bgimage", maxCount: 1 },
        { name: "desktopVideoPreview", maxCount: 1 },
        { name: "mobileVideoPreview", maxCount: 1 },
        { name: "desktopFile", maxCount: 1 },
        { name: "mobileFile", maxCount: 1 },
        { name: "desktopVideoFile", maxCount: 1 },
        { name: "mobileVideoFile", maxCount: 1 },
      ])(req, res, function (err) {
        if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ message: "El archivo es demasiado grande. El tamaño máximo permitido es 50MB." });
        } else if (err) {
          return res.status(500).json({ message: "Error al cargar archivos." });
        }
        next();
      });
    },
    adController.createAd
  );
router.get("/", adController.getAds);
router.get("/:id", adController.getAdById);
router.patch("/:id", adController.updateAd);
router.delete("/:id", adController.deleteAd);

module.exports = router;
