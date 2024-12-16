const express = require("express");
const multer = require("multer");
const uploadController = require("../controllers/uploadController");

// Configurar multer para guardar temporalmente el archivo
const upload = multer({ dest: "uploads/" });

const router = express.Router();

// Endpoint para subir imágenes
router.post("/", upload.single("image"), uploadController.uploadImage);

module.exports = router;
