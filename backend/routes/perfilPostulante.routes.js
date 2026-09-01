const { Router } = require('express');
const router = Router();
const db = require('../db');
const multer = require('multer');
const { uploadFotoPerfil, uploadCV } = require('../middlewares/upload.middleware');
// ====================================================================
// 1. GET: OBTENER PERFIL COMPLETO DEL POSTULANTE
// ====================================================================
router.get('/perfil/:id_postulante', async (req, res) => {
  const { id_postulante } = req.params;

  try {
    const [postulante] = await db.query(
      `SELECT p.nombres, p.apellidos, p.email, p.carrera,
              pf.foto, pf.ciudad, pf.pais, pf.descripcion AS sobre_mi, pf.especialidad, 
              pf.estado_academico, pf.cv_url, pf.cv_nombre, pf.otras_habilidades,
              pf.github, pf.linkedin, pf.portfolio
       FROM postulante p
       LEFT JOIN perfil_postulante pf ON p.id_postulante = pf.id_postulante
       WHERE p.id_postulante = ?`,
      [id_postulante]
    );

    if (!postulante || postulante.length === 0) {
      return res.status(404).json({ success: false, message: 'Postulante no encontrado' });
    }

    const datos = postulante[0];

    const [skills] = await db.query(
      `SELECT s.skill_id, s.categoria_id, s.nombre 
       FROM postulante_skill ps
       INNER JOIN skill s ON ps.skill_id = s.skill_id
       WHERE ps.id_postulante = ?`,
      [id_postulante]
    );

    const perfilCompleto = {
      nombres: datos.nombres || '',
      apellidos: datos.apellidos || '',
      email: datos.email || '',
      carrera: datos.carrera || '',
      foto: datos.foto || '',
      ciudad: datos.ciudad || '',
      pais: datos.pais || '',
      sobre_mi: datos.sobre_mi || '',
      especialidad: datos.especialidad || '',
      estado_academico: datos.estado_academico || 'Estudiante Avanzado',
      cv_url: datos.cv_url || '',
      cv_nombre: datos.cv_nombre || '',
      otras_habilidades: datos.otras_habilidades || '',
      skills: skills || [],
      redes: {
        github: datos.github || '',
        linkedin: datos.linkedin || '',
        portfolio: datos.portfolio || ''
      }
    };

    res.json({ success: true, data: perfilCompleto });
  } catch (error) {
    console.error('Error al obtener perfil del postulante:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// ====================================================================
// 2. GET: CATÁLOGO DE SKILLS
// ====================================================================
router.get('/skills/catalogo', async (req, res) => {
  try {
    const [categorias] = await db.query(
      `SELECT categoria_id, Nombre AS nombre_categoria FROM categoria_skill ORDER BY categoria_id ASC`
    );

    const [skills] = await db.query(
      `SELECT skill_id, categoria_id, nombre FROM skill ORDER BY nombre ASC`
    );

    const catalogo = categorias.map(cat => ({
      categoria_id: cat.categoria_id,
      nombre_categoria: cat.nombre_categoria,
      skills: skills.filter(s => s.categoria_id === cat.categoria_id)
    }));

    res.json({ success: true, data: catalogo });
  } catch (error) {
    console.error('Error al cargar catálogo de skills:', error);
    res.status(500).json({ success: false, message: 'Error al obtener catálogo de habilidades' });
  }
});

// ====================================================================
// 3. PUT: ACTUALIZAR DATOS DEL PERFIL
// ====================================================================
router.put('/perfil/:id_postulante', async (req, res) => {
  const { id_postulante } = req.params;
  const {
    ciudad, pais, sobre_mi, especialidad, estado_academico,
    otras_habilidades, redes, skills
  } = req.body;

  try {
    await db.query(
      `INSERT INTO perfil_postulante 
        (id_postulante, ciudad, pais, descripcion, especialidad, estado_academico, otras_habilidades, github, linkedin, portfolio)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        ciudad = VALUES(ciudad),
        pais = VALUES(pais),
        descripcion = VALUES(descripcion),
        especialidad = VALUES(especialidad),
        estado_academico = VALUES(estado_academico),
        otras_habilidades = VALUES(otras_habilidades),
        github = VALUES(github),
        linkedin = VALUES(linkedin),
        portfolio = VALUES(portfolio)`,
      [
        id_postulante,
        ciudad || null,
        pais || null,
        sobre_mi || null,
        especialidad || null,
        estado_academico || null,
        otras_habilidades || null,
        redes?.github || null,
        redes?.linkedin || null,
        redes?.portfolio || null
      ]
    );

    if (Array.isArray(skills)) {
      await db.query(`DELETE FROM postulante_skill WHERE id_postulante = ?`, [id_postulante]);

      if (skills.length > 0) {
        const skillValues = skills.map(skill => [id_postulante, skill.skill_id]);
        await db.query(`INSERT INTO postulante_skill (id_postulante, skill_id) VALUES ?`, [skillValues]);
      }
    }

    res.json({ success: true, message: 'Perfil actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar perfil del postulante:', error);
    res.status(500).json({ success: false, message: 'Error al guardar los cambios' });
  }
});

// ====================================================================
// 4. POST: SUBIR Y GUARDAR FOTO DE PERFIL
// ====================================================================

router.post('/perfil/:id_postulante/foto', (req, res) => {

  uploadFotoPerfil.single('foto')(req, res, async (err) => {

    // Error de Multer
    if (err instanceof multer.MulterError) {

      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'La foto es demasiado grande (máximo 2MB).'
        });
      }

      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    // Otros errores
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    // Verificar archivo
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se subió ninguna imagen o el formato no es válido.'
      });
    }

    const { id_postulante } = req.params;

    const fotoUrl = `/uploads/fotoperf/${req.file.filename}`;

    try {

      await db.query(
        `INSERT INTO perfil_postulante
          (id_postulante, foto)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE
          foto = VALUES(foto)`,
        [
          id_postulante,
          fotoUrl
        ]
      );

      return res.json({
        success: true,
        message: 'Foto de perfil actualizada correctamente',
        fotoUrl: fotoUrl
      });

    } catch (error) {

      console.error('Error al guardar foto en la BD:', error);

      return res.status(500).json({
        success: false,
        message: 'Error interno al actualizar la base de datos.'
      });
    }

  });

});


// ====================================================================
// 5. POST: SUBIR CV DEL POSTULANTE
// ====================================================================

router.post('/perfil/:id_postulante/cv', (req, res) => {

  uploadCV.single('cv')(req, res, async (err) => {

    // Error de Multer
    if (err instanceof multer.MulterError) {

      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'El CV es demasiado grande. Máximo permitido: 5 MB.'
        });
      }

      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    // Otros errores
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    // Verificar archivo
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se recibió ningún archivo PDF.'
      });
    }

    const { id_postulante } = req.params;

    // Ruta del archivo en el servidor
    const cvUrl = `/uploads/cv/${req.file.filename}`;

    // Nombre original del archivo
    const cvNombre = req.file.originalname;

    try {

      await db.query(
        `INSERT INTO perfil_postulante
          (id_postulante, cv_url, cv_nombre)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE
          cv_url = VALUES(cv_url),
          cv_nombre = VALUES(cv_nombre)`,
        [
          id_postulante,
          cvUrl,
          cvNombre
        ]
      );

      return res.json({
        success: true,
        message: 'CV subido correctamente.',
        cv_url: cvUrl,
        cv_nombre: cvNombre
      });

    } catch (error) {

      console.error('Error al guardar CV en la BD:', error);

      return res.status(500).json({
        success: false,
        message: 'El archivo se subió, pero no se pudo guardar la información en la base de datos.'
      });
    }

  });

});


// ====================================================================
// EXPORTAR ROUTER
// ====================================================================

module.exports = router;