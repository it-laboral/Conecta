// routes/admin.js
const express = require('express');
const router = express.Router();
const db = require('../db'); 
const nodemailer = require('nodemailer');

// ==========================================
// CONFIGURACIÓN DE EMISOR DE MAILS (Nodemailer)
// ==========================================
const transporter = nodemailer.createTransport({
  service: 'gmail', // Podés usar Gmail o tu servidor SMTP institucional
  auth: {
    user: process.env.EMAIL_USER || 'itbconecta@gmail.com',
    pass: process.env.EMAIL_PASS || 'ryxo rykp btaf jgzk'
  }
});

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

// 🟢 NUEVO: 1.b Contar usuarios pendientes de aprobación (para el badge/notificación en rojo del sidebar)
router.get('/pendientes-count', async (req, res) => {
  try {
    const [[{ totalEmpresas }]] = await db.query(
      "SELECT COUNT(*) as totalEmpresas FROM empresa WHERE estado = 'Pendiente' OR estado IS NULL"
    );
    const [[{ totalPostulantes }]] = await db.query(
      "SELECT COUNT(*) as totalPostulantes FROM postulante WHERE estado = 'Pendiente' OR estado IS NULL"
    );

    const totalPendientes = (totalEmpresas || 0) + (totalPostulantes || 0);

    res.json({
      success: true,
      totalPendientes,
      totalEmpresas,
      totalPostulantes
    });
  } catch (error) {
    console.error('Error al contar pendientes:', error);
    res.status(500).json({ success: false, message: 'Error al contar pendientes' });
  }
});

// 2. Obtener lista completa de empresas (con IFNULL default en "Pendiente")
router.get('/empresas', async (req, res) => {
  try {
    const [empresas] = await db.query(
      'SELECT *, IFNULL(estado, "Pendiente") as estado FROM empresa ORDER BY id_empresa DESC'
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

// Padrón de Postulantes (con IFNULL default en "Pendiente")
router.get('/postulantes', async (req, res) => {
  try {
    const [postulantes] = await db.query(
      'SELECT id_postulante, nombres, apellidos, dni, legajo, carrera, email, IFNULL(estado, "Pendiente") as estado FROM postulante ORDER BY id_postulante DESC'
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
    res.json({ success: true, categorias: rows });
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
// ==========================================

// Cambiar estado de una empresa y NOTIFICAR por Email si pasa a 'Activo'
router.put('/empresa/estado', async (req, res) => {
  const { id_empresa, estado } = req.body;
  try {
    // 1. Obtenemos el email y la razón social antes de actualizar
    const [[empresa]] = await db.query(
      'SELECT email, razonSocial FROM empresa WHERE id_empresa = ?', 
      [id_empresa]
    );

    // 2. Actualizamos el estado en la BD
    await db.query('UPDATE empresa SET estado = ? WHERE id_empresa = ?', [estado, id_empresa]);

    // 3. 📧 Si se aprobó (pasó a Activo), enviamos el correo automático
    if (estado === 'Activo' && empresa && empresa.email) {
      transporter.sendMail({
        from: '"ITB Conecta" <itbconecta@gmail.com>',
        to: empresa.email,
        subject: '🎉 ¡La cuenta de tu empresa ha sido activada en ITB Conecta!',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #0284c7;">¡Hola, ${empresa.razonSocial}!</h2>
            <p>Nos alegra informarte que la cuenta de tu empresa ha sido <strong>aprobada exitosamente</strong> por el equipo de administración de ITB Conecta.</p>
            <p>Ya podés ingresar a la plataforma para publicar ofertas de empleo y revisar las postulaciones de nuestros alumnos y egresados.</p>
            <br>
            <a href="http://localhost:4200/sesion" style="background-color: #06b6d4; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Iniciar Sesión</a>
          </div>
        `
      }).catch(errMail => console.error('Error enviando mail a empresa:', errMail));
    }

    res.json({ success: true, message: `Estado de empresa actualizado a ${estado}` });
  } catch (error) {
    console.error('Error al actualizar estado de empresa:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar estado' });
  }
});

// Cambiar estado de un postulante y NOTIFICAR por Email si pasa a 'Activo'
router.put('/postulante/estado', async (req, res) => {
  const { id_postulante, estado } = req.body;
  try {
    // 1. Obtenemos el email y nombre del postulante
    const [[postulante]] = await db.query(
      'SELECT email, nombres FROM postulante WHERE id_postulante = ?', 
      [id_postulante]
    );

    // 2. Actualizamos el estado en la BD
    await db.query('UPDATE postulante SET estado = ? WHERE id_postulante = ?', [estado, id_postulante]);

    // 3. 📧 Si se aprobó (pasó a Activo), enviamos el correo automático
    if (estado === 'Activo' && postulante && postulante.email) {
      transporter.sendMail({
        from: '"ITB Conecta" <itbconecta@gmail.com>',
        to: postulante.email,
        subject: '🎉 ¡Tu cuenta ha sido activada en ITB Conecta!',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #0284c7;">¡Hola, ${postulante.nombres}!</h2>
            <p>Nos alegra informarte que tu solicitud de registro ha sido <strong>aprobada exitosamente</strong> por la administración.</p>
            <p>Ya podés ingresar a la plataforma con tus credenciales, completar tu perfil profesional, adjuntar tu CV y postularte a las ofertas laborales disponibles.</p>
            <br>
            <a href="http://localhost:4200/sesion" style="background-color: #06b6d4; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Iniciar Sesión</a>
          </div>
        `
      }).catch(errMail => console.error('Error enviando mail a postulante:', errMail));
    }

    res.json({ success: true, message: `Estado de postulante actualizado a ${estado}` });
  } catch (error) {
    console.error('Error al actualizar estado de postulante:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar estado' });
  }
});

// Eliminar oferta por moderación
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

// ==========================================
// 4. REPORTES Y BÚSQUEDAS AVANZADAS
// ==========================================

// 🟢 Reporte y Consulta para Estadísticas: Postulantes con TODAS sus Skills
router.get('/reportes/postulantes-skills', async (req, res) => {
  const { skill, carrera, estado } = req.query;

  try {
    let query = `
      SELECT DISTINCT 
        p.id_postulante, 
        p.nombres, 
        p.apellidos, 
        p.email, 
        p.carrera, 
        IFNULL(p.estado, 'Activo') AS estado,
        (
          SELECT GROUP_CONCAT(DISTINCT s_sub.nombre SEPARATOR ', ')
          FROM postulante_skill ps_sub
          JOIN skill s_sub ON ps_sub.skill_id = s_sub.skill_id
          WHERE ps_sub.id_postulante = p.id_postulante
        ) AS skills
      FROM postulante p
    `;

    const conditions = [];
    const params = [];

    if (skill && skill.trim() !== '') {
      query += `
        INNER JOIN postulante_skill ps ON p.id_postulante = ps.id_postulante
        INNER JOIN skill s ON ps.skill_id = s.skill_id
      `;
      conditions.push(`s.nombre LIKE ?`);
      params.push(`%${skill.trim()}%`);
    }

    if (carrera && carrera.trim() !== '') {
      conditions.push(`p.carrera LIKE ?`);
      params.push(`%${carrera.trim()}%`);
    }

    if (estado && estado.trim() !== '') {
      conditions.push(`p.estado = ?`);
      params.push(estado.trim());
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY p.id_postulante DESC`;

    const [postulantes] = await db.query(query, params);
    res.json({ success: true, total: postulantes.length, postulantes });
  } catch (error) {
    console.error('Error en reporte de postulantes por skill:', error);
    res.status(500).json({ success: false, message: 'Error al consultar postulantes por skill' });
  }
});

// 🟢 Reporte y Consulta para Estadísticas: Empresas por Stack y Sector
router.get('/reportes/empresas-stack', async (req, res) => {
  const { tecnologia, sector } = req.query;

  try {
    let query = `
      SELECT DISTINCT 
        e.id_empresa, 
        e.razonSocial, 
        e.cuit, 
        e.email, 
        IFNULL(e.sector, 'Sin Especificar') AS sector, 
        IFNULL(e.estado, 'Pendiente') AS estado,
        pe.stack_tecnologico,
        (SELECT COUNT(*) FROM ofertas o WHERE o.id_empresa = e.id_empresa) AS total_ofertas
      FROM empresa e
      LEFT JOIN perfil_empresa pe ON e.id_empresa = pe.id_empresa
      WHERE 1=1
    `;
    const params = [];

    // Filtro por Stack Tecnológico o Razón Social
    if (tecnologia && tecnologia.trim() !== '') {
      query += ` AND (pe.stack_tecnologico LIKE ? OR e.razonSocial LIKE ?)`;
      params.push(`%${tecnologia.trim()}%`, `%${tecnologia.trim()}%`);
    }

    // Filtro por Sector / Rubro
    if (sector && sector.trim() !== '') {
      query += ` AND e.sector LIKE ?`;
      params.push(`%${sector.trim()}%`);
    }

    query += ` ORDER BY total_ofertas DESC, e.id_empresa DESC`;

    const [empresas] = await db.query(query, params);
    res.json({ success: true, total: empresas.length, empresas });
  } catch (error) {
    console.error('Error en reporte de empresas por stack:', error);
    res.status(500).json({ success: false, message: 'Error al consultar empresas por stack' });
  }
});

// 🟢 Reporte: Buscar Ofertas por Título / Puesto / Modalidad
router.get('/reportes/ofertas-busqueda', async (req, res) => {
  const { titulo, modalidad } = req.query;

  try {
    let query = `
      SELECT 
        o.id_oferta, 
        o.titulo, 
        o.modalidad, 
        o.experiencia, 
        o.fecha_publicacion,
        e.razonSocial
      FROM ofertas o
      LEFT JOIN empresa e ON o.id_empresa = e.id_empresa
      WHERE 1=1
    `;
    const params = [];

    if (titulo) {
      query += ` AND (o.titulo LIKE ? OR o.descripcion LIKE ?)`;
      params.push(`%${titulo}%`, `%${titulo}%`);
    }
    if (modalidad) {
      query += ` AND o.modalidad = ?`;
      params.push(modalidad);
    }

    query += ` ORDER BY o.fecha_publicacion DESC`;

    const [ofertas] = await db.query(query, params);
    res.json({ success: true, total: ofertas.length, ofertas });
  } catch (error) {
    console.error('Error en reporte de ofertas:', error);
    res.status(500).json({ success: false, message: 'Error al consultar ofertas' });
  }
});

module.exports = router;