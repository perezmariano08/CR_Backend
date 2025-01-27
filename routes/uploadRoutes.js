const express = require("express");
const multer = require("multer");
const uploadController = require("../controllers/uploadController");
const path = require("path");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); 
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limitar tamaño a 10MB
  fileFilter: (req, file, cb) => {
    // Aceptar solo imágenes
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Solo se permiten archivos de imagen.'));
    }
    cb(null, true);
  }
});

router.post("/", upload.single("image"), uploadController.uploadImage);

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Error de multer
    return res.status(400).send({ error: err.message });
  }
  // Otro tipo de errores
  res.status(500).send({ error: 'Algo salió mal.' });
});

module.exports = router;
