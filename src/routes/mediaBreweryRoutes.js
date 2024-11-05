const express = require("express");
const router = express.Router();
const mediaBreweryController = require("../controllers/MediaController");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configuración de almacenamiento de Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/media_brewery");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// Filtro de archivos (solo imágenes y videos permitidos)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|mp4/;
  const mimeType = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (mimeType && extname) {
    return cb(null, true);
  }
  cb(
    new Error(
      "Invalid file type. Only JPEG, JPG, PNG, GIF, and MP4 files are allowed."
    )
  );
};

// Configuración de Multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 50 }, // Tamaño máximo de 50MB
  fileFilter: fileFilter,
});

// Ruta para crear media de cervecería
router.post(
  "/",
  upload.fields([
    { name: "mediaFile", maxCount: 1 }, // El campo esperado es 'mediaFile'
    { name: "thumbnail", maxCount: 1 }, // En caso de que se cargue un thumbnail para videos
  ]),
  (req, res, next) => {
    if (req.files && req.files.mediaFile && req.files.mediaFile[0]) {
      req.body.url = `/uploads/media_brewery/${req.files.mediaFile[0].filename}`;
    }
    if (req.files && req.files.thumbnail && req.files.thumbnail[0]) {
      req.body.thumbnail = `/uploads/media_brewery/${req.files.thumbnail[0].filename}`;
    }
    next();
  },
  mediaBreweryController.createMediaBrewery
);
router.get("/", mediaBreweryController.getMediaReviews);
// Ruta para revisión de media (solo admins)
router.patch("/:mediaId/review", mediaBreweryController.reviewMedia);

module.exports = router;
