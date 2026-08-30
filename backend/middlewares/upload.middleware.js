const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. Asegurar que las carpetas de destino existan en el backend
const dirFotos = path.join(__dirname, '../uploads/fotoperf');
const dirLogos = path.join(__dirname, '../uploads/logose');

if (!fs.existsSync(dirFotos)) {
  fs.mkdirSync(dirFotos, { recursive: true });
}
if (!fs.existsSync(dirLogos)) {
  fs.mkdirSync(dirLogos, { recursive: true });
}

// 2. Configuración de almacenamiento para logos de empresas
const storageLogo = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, dirLogos);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `logo-${Date.now()}${ext}`);
  }
});

// 3. Configuración de almacenamiento para fotos de postulantes
const storageFotoPerfil = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, dirFotos);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const idPostulante = req.params.id_postulante || 'user';
    cb(null, `foto-${idPostulante}-${Date.now()}${ext}`);
  }
});

// 4. Middlewares de Multer con validaciones
const uploadFotoPerfil = multer({
  storage: storageFotoPerfil,
  limits: {
    fileSize: 2 * 1024 * 1024 // Máximo 2 MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('El archivo seleccionado no es una imagen válida.'));
    }
  }
});

const uploadLogo = multer({
  storage: storageLogo,
  limits: {
    fileSize: 2 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('El archivo seleccionado no es una imagen válida.'));
    }
  }
});

module.exports = {
  uploadLogo,
  uploadFotoPerfil
};