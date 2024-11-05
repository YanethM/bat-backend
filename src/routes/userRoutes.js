const express = require("express");
const router = express.Router();
const userController = require("../controllers/UserController");
const verifyToken = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/users");
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

// Ruta para cargar la imagen de perfil del usuario
router.post("/user", upload.single("photo"), userController.createUser);
router.get("/", verifyToken, userController.getUsers);
router.get("/:id", verifyToken, userController.getUser);
router.get("/:id/breweries", userController.getUserBreweries);
router.patch("/:id", upload.single("photo"), userController.updateUser);
router.delete("/:id", userController.deleteUser);
router.patch("/:id/change-password", userController.changePassword);
router.patch("/:id/change-state", userController.changeUserState);

module.exports = router;
