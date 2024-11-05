const express = require("express");
const router = express.Router();
const authController = require("../controllers/AuthController");
const verifyToken = require("../middleware/authMiddleware");

const multer = require("multer");
const path = require("path");


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

router.post("/signup", upload.single("photo"), authController.signup);
router.post("/login", authController.login);
router.get("/profile", verifyToken, authController.profile);
/* router.patch("/profile", verifyToken, upload.single("photo"), authController.updateProfile); */
router.patch("/reset-password", verifyToken, authController.resetPassword);


module.exports = router;
