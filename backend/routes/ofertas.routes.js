const express = require('express');
const router = express.Router();
const db = require('../db');

// 🔒 Importar middlewares de seguridad desde tu auth.middleware
const { verificarToken, esEmpresa } = require('../middlewares/auth.middleware');

// =========================================================================
// 1. GET: Obtener todas las categorías con sus habilidades
// (Acceso: Autenticado)
// =========================================================================
router.get('/categorias-skills', verificarToken, async (req, res) => {
    try {
        const [filas] = await db.query(`
            SELECT 
                cs.categoria_id AS categoria_id,
                cs.nombre AS categoria_nombre,
                s.skill_id AS skill_id,
                s.nombre AS skill_nombre
            FROM categoria_skill cs
            INNER JOIN skill s ON cs.categoria_id = s.categoria_id
            ORDER BY cs.nombre ASC, s.nombre ASC
        `);

        const mapaCategorias = new Map();

        for (let row of filas) {
            if (!mapaCategorias.has(row.categoria_id)) {
                mapaCategorias.set(row.categoria_id, {
                    categoria_id: row.categoria_id,
                    nombre: row.categoria_nombre,
                    skills: []
                });
            }

            if (row.skill_id) {
                mapaCategorias.get(row.categoria_id).skills.push({
                    skill_id: row.skill_id,
                    nombre: row.skill_nombre
                });
            }
        }

        res.json(Array.from(mapaCategorias.values()));
    } catch (error) {
        console.error('Error al obtener categorías y skills:', error);
        res.status(500).json({ error: 'Error al consultar habilidades en la base de datos' });
    }
});

// =========================================================================
// 2. GET: Obtener ofertas vigentes unificadas
// (Acceso: Público / Autenticado)
// =========================================================================
router.get('/vigentes', async (req, res) => {
    try {
        const [ofertas] = await db.query(`
            SELECT 
                o.id_oferta, 
                o.titulo, 
                o.descripcion, 
                o.modalidad, 
                o.experiencia, 
                o.dias_duracion, 
                o.fecha_publicacion,
                DATE_ADD(o.fecha_publicacion, INTERVAL o.dias_duracion DAY) AS fecha_vencimiento,
                o.id_empresa, 
                e.razonSocial AS razonSocial,
                GROUP_CONCAT(s.nombre SEPARATOR ',') AS skills_nombres_str
            FROM ofertas o
            JOIN empresa e ON o.id_empresa = e.id_empresa
            LEFT JOIN oferta_skill os ON o.id_oferta = os.id_oferta
            LEFT JOIN skill s ON os.skill_id = s.skill_id
            WHERE DATE_ADD(o.fecha_publicacion, INTERVAL o.dias_duracion DAY) >= CURDATE()
            GROUP BY o.id_oferta
            ORDER BY o.id_oferta DESC
        `);

        const resultado = ofertas.map(oferta => ({
            ...oferta,
            skills_nombres: oferta.skills_nombres_str ? oferta.skills_nombres_str.split(',') : []
        }));

        res.json(resultado);
    } catch (error) {
        console.error('Error al obtener ofertas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// =========================================================================
// 3. POST: Crear una nueva oferta laboral
// (Acceso: Solo rol 'empresa' o 'admin')
// =========================================================================
// =========================================================================
// 3. POST: Crear una nueva oferta laboral
// (Acceso: Solo rol 'empresa' o 'admin')
// =========================================================================
router.post('/crear', verificarToken, async (req, res) => {
    console.log('--- DATOS DE USUARIO EN TOKEN DECODEADO ---', req.usuario);
    
    // ✅ CORRECCIÓN: Leemos 'rol' o en su defecto 'tipo' si 'rol' viene vacío
    const rolUsuario = (req.usuario?.rol || req.usuario?.tipo || '').toString().toLowerCase();

    // 🔒 Verificar rol
    if (rolUsuario !== 'empresa' && rolUsuario !== 'admin') {
        return res.status(403).json({ OK: false, error: 'Solo las empresas pueden publicar ofertas.' });
    }

    // 🔒 Extraemos el id_empresa contemplando distintas propiedades del token
    const id_empresa = req.usuario?.id_empresa || req.body?.id_empresa || req.usuario?.id;
    const { titulo, descripcion, modalidad, experiencia, dias_duracion, skill, skills } = req.body;

    if (!id_empresa) {
        return res.status(400).json({ OK: false, error: 'No se identificó la empresa emisora.' });
    }

    try {
        const fecha_publicacion = new Date();

        // 1. Insertar oferta principal
        const [resultado] = await db.query(`
            INSERT INTO ofertas (id_empresa, titulo, descripcion, modalidad, experiencia, fecha_publicacion, dias_duracion) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [id_empresa, titulo, descripcion, modalidad, experiencia, fecha_publicacion, dias_duracion]);

        const nuevoIdOferta = resultado.insertId;

        // 2. Insertar las habilidades requeridas en lote
        const listaSkills = skill || skills;
        if (Array.isArray(listaSkills) && listaSkills.length > 0) {
            const skillValues = listaSkills.map(skillId => [nuevoIdOferta, skillId]);
            await db.query(`INSERT INTO oferta_skill (id_oferta, skill_id) VALUES ?`, [skillValues]);
        }

        res.status(201).json({ 
            OK: true, 
            message: 'Oferta y habilidades registradas con éxito.',
            id_oferta: nuevoIdOferta 
        });
    } catch (error) {
        console.error('Error al crear oferta:', error);
        res.status(500).json({ OK: false, error: 'Error al guardar la oferta en la base de datos' });
    }
});

module.exports = router;