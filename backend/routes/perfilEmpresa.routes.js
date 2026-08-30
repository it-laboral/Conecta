const { Router } = require('express');
const router = Router();
const db = require('../db');
const multer = require('multer'); // 👈 Necesario para capturar MulterError
const { uploadLogo } = require('../middlewares/upload.middleware');

// ====================================================================
// 1. POST: SUBIR Y GUARDAR EL LOGO DE LA EMPRESA
// ====================================================================
router.post('/perfil/logo', (req, res) => {
  uploadLogo.single('logo')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'La imagen es demasiado grande. El límite máximo es de 2 MB.'
        });
      }
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      return res.status(500).json({ success: false, message: 'Error al subir el archivo.' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se subió ninguna imagen o el formato no es válido.' });
    }

    const logoUrl = `http://localhost:3000/uploads/logose/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Logo subido correctamente',
      logoUrl: logoUrl
    });
  });
});
// ====================================================================
// 2. GET: OBTENER PERFIL DE LA EMPRESA
// ====================================================================
router.get('/perfil/:id_empresa', async (req, res) => {
  const { id_empresa } = req.params;

  try {
    const query = `
      SELECT 
        e.id_empresa, e.razonSocial, e.fantasia, e.cuit, e.email, 
        e.ciudad AS ciudad_fiscal, e.provincia AS provincia_fiscal, e.sector,
        pe.id_perfil, pe.descripcion, pe.trayectoria, pe.logo, pe.modalidad, 
        pe.zona_trabajo, pe.stack_tecnologico, pe.sitio_web, pe.linkedin, 
        pe.telefono, pe.beneficios, pe.created_at
      FROM empresa e
      LEFT JOIN perfil_empresa pe ON e.id_empresa = pe.id_empresa
      WHERE e.id_empresa = ?
    `;
    const [rows] = await db.query(query, [id_empresa]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Empresa no encontrada.' });
    }

    res.json({ success: true, perfil: rows[0] });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ success: false, message: 'Error al obtener el perfil.' });
  }
});

// ====================================================================
// 3. PUT: CREAR O ACTUALIZAR PERFIL DE LA EMPRESA (UPSERT)
// ====================================================================
router.put('/perfil', async (req, res) => {
  const {
    id_empresa,
    descripcion,
    trayectoria,
    logo,
    modalidad,
    zona_trabajo,
    stack_tecnologico,
    sitio_web,
    linkedin,
    telefono,
    beneficios
  } = req.body;

  if (!id_empresa) {
    return res.status(400).json({ success: false, message: 'Falta el id_empresa.' });
  }

  try {
    const query = `
      INSERT INTO perfil_empresa (
        id_empresa, descripcion, trayectoria, logo, modalidad,
        zona_trabajo, stack_tecnologico, sitio_web, linkedin, telefono, beneficios
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        descripcion = VALUES(descripcion),
        trayectoria = VALUES(trayectoria),
        logo = IFNULL(VALUES(logo), logo),
        modalidad = VALUES(modalidad),
        zona_trabajo = VALUES(zona_trabajo),
        stack_tecnologico = VALUES(stack_tecnologico),
        sitio_web = VALUES(sitio_web),
        linkedin = VALUES(linkedin),
        telefono = VALUES(telefono),
        beneficios = VALUES(beneficios)
    `;

    const [result] = await db.query(query, [
      id_empresa,
      descripcion || null,
      trayectoria || null,
      logo || null,
      modalidad || 'Híbrido',
      zona_trabajo || null,
      stack_tecnologico || null,
      sitio_web || null,
      linkedin || null,
      telefono || null,
      beneficios || null
    ]);

    res.json({ 
      success: true, 
      message: 'Perfil guardado con éxito.',
      id_perfil: result.insertId || true
    });
  } catch (error) {
    console.error('Error al guardar el perfil:', error);
    res.status(500).json({ success: false, message: 'Error al guardar el perfil.' });
  }
});

module.exports = router;