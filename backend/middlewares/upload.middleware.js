
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ============================================================
// 1. CARPETAS DE DESTINO
// ============================================================

const dirFotos = path.join(__dirname, '../uploads/fotoperf');
const dirLogos = path.join(__dirname, '../uploads/logose');
const dirCV = path.join(__dirname, '../uploads/cv');

// Crear carpetas si no existen

if (!fs.existsSync(dirFotos)) {
  fs.mkdirSync(dirFotos, { recursive: true });
}

if (!fs.existsSync(dirLogos)) {
  fs.mkdirSync(dirLogos, { recursive: true });
}

if (!fs.existsSync(dirCV)) {
  fs.mkdirSync(dirCV, { recursive: true });
}


// ============================================================
// 2. CONFIGURACIÓN PARA LOGOS DE EMPRESAS
// ============================================================

const storageLogo = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, dirLogos);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);

    cb(null, `logo-${Date.now()}${ext}`);
  }

});


// ============================================================
// 3. CONFIGURACIÓN PARA FOTOS DE POSTULANTES
// ============================================================

const storageFotoPerfil = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, dirFotos);
  },

  filename: (req, file, cb) => {

    const ext = path.extname(file.originalname);

    const idPostulante =
      req.params.id_postulante || 'user';

    cb(
      null,
      `foto-${idPostulante}-${Date.now()}${ext}`
    );
  }

});


// ============================================================
// 4. CONFIGURACIÓN PARA CV
// ============================================================

const storageCV = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, dirCV);
  },

  filename: (req, file, cb) => {

    const ext = path.extname(file.originalname);

    const idPostulante =
      req.params.id_postulante || 'user';

    cb(
      null,
      `cv-${idPostulante}-${Date.now()}${ext}`
    );
  }

});


// ============================================================
// 5. MULTER PARA FOTO DE PERFIL
// ============================================================

const uploadFotoPerfil = multer({

  storage: storageFotoPerfil,

  limits: {
    fileSize: 2 * 1024 * 1024
  },

  fileFilter: (req, file, cb) => {

    if (file.mimetype.startsWith('image/')) {

      cb(null, true);

    } else {

      cb(
        new Error(
          'El archivo seleccionado no es una imagen válida.'
        )
      );

    }

  }

});


// ============================================================
// 6. MULTER PARA LOGO
// ============================================================

const uploadLogo = multer({

  storage: storageLogo,

  limits: {
    fileSize: 2 * 1024 * 1024
  },

  fileFilter: (req, file, cb) => {

    if (file.mimetype.startsWith('image/')) {

      cb(null, true);

    } else {

      cb(
        new Error(
          'El archivo seleccionado no es una imagen válida.'
        )
      );

    }

  }

});


// ============================================================
// 7. MULTER PARA CV
// ============================================================

const uploadCV = multer({

  storage: storageCV,

  limits: {
    // Máximo 5 MB
    fileSize: 5 * 1024 * 1024
  },

  fileFilter: (req, file, cb) => {

    if (file.mimetype === 'application/pdf') {

      cb(null, true);

    } else {

      cb(
        new Error(
          'El CV debe estar en formato PDF.'
        )
      );

    }

  }

});


// ============================================================
// 8. EXPORTAR
// ============================================================

module.exports = {
  uploadLogo,
  uploadFotoPerfil,
  uploadCV
};