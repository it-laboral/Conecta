// routes/admin.js
const express = require('express');
const router = express.Router();
const db = require('../db'); 

// 1. Obtener métricas generales del sistema
router.get('/metricas', async (req, res) => {
  try {
    const [[{ totalOfertas }]] = await db.query('SELECT COUNT(*) as totalOfertas FROM ofertas');
    const [[{ totalEmpresas }]] = await db.query('SELECT COUNT(*) as totalEmpresas FROM empresa');
    const [[{ totalPostulantes }]] = await db.query('SELECT COUNT(*) as totalPostulantes FROM postulante');
    const [[{ totalPostulaciones }]] = await db.query('SELECT COUNT(*) as totalPostulaciones FROM postulacion');

    res.json({
      success: true,
      metricas: { totalOfertas, totalEmpresas, totalPostulantes, totalPostulaciones }
    });
  } catch (error) {
    console.error('Error al obtener métricas:', error);
    res.status(500).json({ success: false, message: 'Error al cargar métricas' });
  }
});

// 2. Obtener lista completa de empresas
router.get('/empresas', async (req, res) => {
  try {
    const [empresas] = await db.query(
      'SELECT *, IFNULL(estado, "Activo") as estado FROM empresa ORDER BY id_empresa DESC'
    );
    res.json({ success: true, empresas });
  } catch (error) {
    console.error('Error al obtener empresas:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

// Lista de Ofertas (con el nombre de la Empresa)
router.get('/ofertas', async (req, res) => {
  try {
    const [ofertas] = await db.query(`
      SELECT 
        o.id_oferta, 
        o.id_empresa, 
        o.titulo, 
        o.descripcion, 
        o.modalidad, 
        o.experiencia, 
        o.fecha_publicacion, 
        o.dias_duracion, 
        e.razonSocial 
      FROM ofertas o
      LEFT JOIN empresa e ON o.id_empresa = e.id_empresa
      ORDER BY o.fecha_publicacion DESC
    `);
    res.json({ success: true, ofertas });
  } catch (error) {
    console.error('Error al obtener ofertas:', error);
    res.status(500).json({ success: false, message: 'Error al obtener ofertas' });
  }
});

// Padrón de Postulantes
router.get('/postulantes', async (req, res) => {
  try {
    const [postulantes] = await db.query(
      'SELECT id_postulante, nombres, apellidos, dni, legajo, carrera, email, IFNULL(estado, "Activo") as estado FROM postulante ORDER BY id_postulante DESC'
    );
    res.json({ success: true, postulantes });
  } catch (error) {
    console.error('Error al obtener postulantes:', error);
    res.status(500).json({ success: false, message: 'Error al obtener postulantes' });
  }
});

// Categorías de Skills
router.get('/categorias-skills', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        categoria_id AS id, 
        Nombre AS nombre 
      FROM categoria_skill 
      ORDER BY Nombre ASC
    `);
    res.json({ success: true, categorias:rows });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ success: false, message: 'Error al obtener categorías' });
  }
});

// GET - Obtener Skills con su nombre de categoría
router.get('/skills', async (req, res) => {
  try {
    const query = `
      SELECT s.skill_id AS id, s.nombre, s.categoria_id, c.nombre AS categoria_nombre
      FROM skill s
      LEFT JOIN categoria_skill c ON s.categoria_id = c.categoria_id
      ORDER BY s.nombre ASC
    `;
    const [rows] = await db.query(query);
    res.json({ success: true, skills: rows });
  } catch (error) {
    console.error('Error al obtener skills:', error);
    res.status(500).json({ success: false, message: 'Error al consultar skills en BD' });
  }
});

// ==========================================
// 3. ACCIONES Y MODERACIÓN (PUT / DELETE)
// =======================================
// 3. Cambiar estado de una empresa
router.put('/empresa/estado', async (req, res) => {
  const { id_empresa, estado } = req.body;
  try {
    await db.query('UPDATE empresa SET estado = ? WHERE id_empresa = ?', [estado, id_empresa]);
    res.json({ success: true, message: `Estado actualizado a ${estado}` });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar estado' });
  }
});

// 4. Eliminar oferta por moderación
router.delete('/ofertas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM ofertas WHERE id_oferta = ?', [id]);
    res.json({ success: true, message: 'Oferta eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar oferta:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar oferta' });
  }
});
// --- CATÁLOGOS: SKILLS ---

// Crear nueva Skill
router.post('/skills', async (req, res) => {
  const { nombre, categoria_id } = req.body;
  if (!nombre || !categoria_id) {
    return res.status(400).json({ success: false, message: 'Nombre y categoría son obligatorios' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO skill (nombre, categoria_id) VALUES (?, ?)',
      [nombre.trim(), categoria_id]
    );
    res.status(201).json({ success: true, id: result.insertId, message: 'Skill creada correctamente' });
  } catch (error) {
    console.error('Error al crear skill:', error);
    res.status(500).json({ success: false, message: 'Error al guardar skill en la BD' });
  }
});

// Actualizar Skill existente
router.put('/skills/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, categoria_id } = req.body;

  try {
    await db.query(
      'UPDATE skill SET nombre = ?, categoria_id = ? WHERE skill_id = ?',
      [nombre.trim(), categoria_id, id]
    );
    res.json({ success: true, message: 'Skill actualizada correctamente' });
  } catch (error) {
    console.error('Error al actualizar skill:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar skill en la BD' });
  }
});

// Eliminar Skill
router.delete('/skills/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await db.query('DELETE FROM skill WHERE skill_id = ?', [id]);
    res.json({ success: true, message: 'Skill eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar skill:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar skill de la BD' });
  }
});

console.log('✅ Rutas de Admin cargadas: /metricas, /empresas, /ofertas, /postulantes');

module.exports = router;