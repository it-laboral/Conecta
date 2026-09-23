const { Router } = require('express');
const router = Router();
const db = require('../db');
const multer = require('multer');
const { uploadLogo } = require('../middlewares/upload.middleware');

// 🔒 Middlewares de seguridad
const { verificarToken, esDuenioEmpresa } = require('../middlewares/auth.middleware');

// ====================================================================
// 0. GET: OBTENER TODAS LAS EMPRESAS (PARA EL BUSCADOR DE POSTULANTES)
// (Acceso: Usuarios autenticados)
// ====================================================================
router.get('/', verificarToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        e.id_empresa, 
        e.razonSocial, 
        e.fantasia, 
        e.email, 
        e.sector, 
        e.ciudad AS ciudad_fiscal, 
        e.provincia AS provincia_fiscal,
        pe.logo, 
        pe.descripcion, 
        pe.modalidad, 
        pe.zona_trabajo, 
        pe.sitio_web
      FROM empresa e
      LEFT JOIN perfil_empresa pe ON e.id_empresa = pe.id_empresa
      ORDER BY COALESCE(NULLIF(e.fantasia, ''), e.razonSocial) ASC
    `;
    const [empresas] = await db.query(query);

    res.json({ 
      success: true, 
      empresas: empresas 
    });
  } catch (error) {
    console.error('Error al obtener la lista de empresas:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor al obtener la lista de empresas' 
    });
  }
});

// ====================================================================
// 1. GET: OBTENER PERFIL DE LA EMPRESA
// (Acceso: Usuarios autenticados -> Postulantes, Admins o la propia Empresa)
// ====================================================================
router.get('/perfil/:id_empresa', verificarToken, async (req, res) => {
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
// 2. PUT: CREAR O ACTUALIZAR PERFIL DE LA EMPRESA (UPSERT)
// (Acceso: Solo la empresa dueña o Admin)
// ====================================================================
router.put('/perfil/:id_empresa', verificarToken, esDuenioEmpresa, async (req, res) => {
  const { id_empresa } = req.params;
  const {
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

// ====================================================================
// 3. POST: SUBIR Y GUARDAR EL LOGO DE LA EMPRESA
// (Acceso: Solo la empresa dueña o Admin)
// ====================================================================
router.post('/perfil/:id_empresa/logo', verificarToken, esDuenioEmpresa, (req, res) => {
  uploadLogo.single('logo')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'La imagen es demasiado grande. El límite máximo es de 2 MB.'
        });
      }
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message || 'Error al subir el archivo.' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se subió ninguna imagen o el formato no es válido.' });
    }

    const { id_empresa } = req.params;
    // Usamos ruta relativa dinámicamente
    const logoUrl = `/uploads/logose/${req.file.filename}`;

    try {
      // Guardar directamente en la base de datos al subir el logo
      await db.query(
        `INSERT INTO perfil_empresa (id_empresa, logo)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE logo = VALUES(logo)`,
        [id_empresa, logoUrl]
      );

      return res.json({
        success: true,
        message: 'Logo subido correctamente',
        logoUrl: logoUrl
      });
    } catch (error) {
      console.error('Error al actualizar logo en BD:', error);
      return res.status(500).json({ success: false, message: 'Error al guardar el logo en la base de datos.' });
    }
  });
});

module.exports = router;