const express = require('express');
const router = express.Router();
const db = require('../db');

// 🔒 Middlewares de autenticación
const { verificarToken } = require('../middlewares/auth.middleware');

// =========================================================================
// 1. POST: Registrar postulación (Solo Postulantes)
// URL: POST /api/postulaciones
// =========================================================================
router.post('/', verificarToken, async (req, res) => {
    if (req.usuario.tipoUsuario !== 'postulante') {
        return res.status(403).json({ error: 'Solo los postulantes pueden aplicarse a ofertas.' });
    }

    const id_oferta = req.body.id_oferta || req.body.oferta_id;
    const id_postulante = req.usuario.id_postulante || req.usuario.id;

    if (!id_oferta) {
        return res.status(400).json({ error: 'Debes proporcionar el id_oferta.' });
    }

    try {
        const [ofertas] = await db.query(`
            SELECT id_oferta 
            FROM ofertas 
            WHERE id_oferta = ? 
              AND DATE_ADD(fecha_publicacion, INTERVAL dias_duracion DAY) >= CURDATE()
        `, [id_oferta]);

        if (ofertas.length === 0) {
            return res.status(404).json({ error: 'La oferta no existe o ha expirado.' });
        }

        const [existente] = await db.query(
            'SELECT id_postulacion FROM postulacion WHERE id_postulante = ? AND id_oferta = ?',
            [id_postulante, id_oferta]
        );

        if (existente.length > 0) {
            return res.status(400).json({ mensaje: 'Ya te has postulado a esta oferta.' });
        }

        const [resultado] = await db.query(
            'INSERT INTO postulacion (id_postulante, id_oferta, fecha_postulacion, estado) VALUES (?, ?, NOW(), "Pendiente")',
            [id_postulante, id_oferta]
        );

        res.status(201).json({ 
            OK: true, 
            mensaje: 'Postulación enviada con éxito', 
            id_postulacion: resultado.insertId 
        });
    } catch (error) {
        console.error('Error al registrar postulación:', error);
        res.status(500).json({ error: 'Error interno del servidor al registrar postulación.' });
    }
});

// =========================================================================
// 2. GET: Obtener postulaciones del POSTULANTE por ID
// URL: GET /api/postulaciones/postulante/:id
// =========================================================================
router.get('/postulante/:id', verificarToken, async (req, res) => {
    const idsPostulante = [req.params.id, req.usuario.id_postulante, req.usuario.id]
        .filter(val => val && val !== 'undefined' && val !== 'null');

    try {
        const [filas] = await db.query(`
            SELECT 
                p.id_postulacion, 
                p.fecha_postulacion, 
                p.estado, 
                o.id_oferta, 
                o.titulo AS titulo_oferta, 
                e.razonSocial AS razon_social
            FROM postulacion p
            INNER JOIN ofertas o ON p.id_oferta = o.id_oferta
            INNER JOIN empresa e ON o.id_empresa = e.id_empresa
            WHERE p.id_postulante IN (?)
            ORDER BY p.fecha_postulacion DESC
        `, [idsPostulante]);

        res.json(filas);
    } catch (error) {
        console.error('Error al obtener postulaciones del postulante:', error);
        res.status(500).json({ error: 'Error al obtener tus postulaciones.' });
    }
});

// =========================================================================
// 3. GET: Obtener postulantes/candidatos de la EMPRESA por ID (CORREGIDO)
// URL: GET /api/postulaciones/empresa/:id
// =========================================================================
router.get('/empresa/:id', verificarToken, async (req, res) => {
    // Sanitizamos y juntamos todos los posibles IDs válidos de la empresa
    const idsEmpresa = [req.params.id, req.usuario.id_empresa, req.usuario.id]
        .filter(val => val && val !== 'undefined' && val !== 'null');

    if (idsEmpresa.length === 0) {
        return res.status(400).json({ error: 'No se pudo identificar el ID de la empresa.' });
    }

    try {
        const [filas] = await db.query(`
            SELECT 
                p.id_postulacion, 
                p.fecha_postulacion, 
                p.estado, 
                o.id_oferta, 
                o.titulo AS titulo_oferta,
                post.id_postulante,
                post.nombres AS nombre_postulante,
                post.apellidos AS apellido_postulante,
                post.email AS email_postulante
            FROM postulacion p
            INNER JOIN ofertas o ON p.id_oferta = o.id_oferta
            INNER JOIN postulante post ON p.id_postulante = post.id_postulante
            WHERE o.id_empresa IN (?)
            ORDER BY p.fecha_postulacion DESC
        `, [idsEmpresa]);

        res.json(filas);
    } catch (error) {
        console.error('Error al obtener postulaciones de la empresa:', error);
        res.status(500).json({ error: 'Error al obtener candidatos de la empresa.' });
    }
});

// =========================================================================
// 4. GET: Candidatos de UNA OFERTA específica
// URL: GET /api/postulaciones/oferta/:idOferta
// =========================================================================
router.get('/oferta/:idOferta', verificarToken, async (req, res) => {
    const { idOferta } = req.params;
    const { tipoUsuario } = req.usuario;

    try {
        if (tipoUsuario !== 'admin') {
            const idsEmpresa = [req.usuario.id_empresa, req.usuario.id]
                .filter(val => val && val !== 'undefined' && val !== 'null')
                .map(String);

            const [ofertaCheck] = await db.query('SELECT id_empresa FROM ofertas WHERE id_oferta = ?', [idOferta]);
            
            if (ofertaCheck.length === 0 || !idsEmpresa.includes(String(ofertaCheck[0].id_empresa))) {
                return res.status(403).json({ error: 'No tienes permiso para ver postulantes de esta oferta.' });
            }
        }

        const [filas] = await db.query(`
            SELECT 
                p.id_postulacion, 
                p.fecha_postulacion, 
                p.estado, 
                o.id_oferta,
                o.titulo AS titulo_oferta,
                post.id_postulante,
                post.nombres AS nombre_postulante,
                post.apellidos AS apellido_postulante,
                post.email AS email_postulante
            FROM postulacion p
            INNER JOIN ofertas o ON p.id_oferta = o.id_oferta
            INNER JOIN postulante post ON p.id_postulante = post.id_postulante
            WHERE p.id_oferta = ?
            ORDER BY p.fecha_postulacion DESC
        `, [idOferta]);

        res.json(filas);
    } catch (error) {
        console.error('Error al obtener candidatos de la oferta:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// =========================================================================
// 5. GET: Obtener TODAS las postulaciones (Admin - INTACTO)
// URL: GET /api/postulaciones/todas
// =========================================================================
router.get('/todas', verificarToken, async (req, res) => {
    if (req.usuario.tipoUsuario !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado: Solo administradores.' });
    }

    try {
        const [filas] = await db.query(`
            SELECT 
                p.id_postulacion, 
                p.fecha_postulacion, 
                p.estado, 
                o.id_oferta, 
                o.titulo AS titulo_oferta,
                e.razonSocial AS razon_social,
                post.id_postulante,
                post.nombres AS nombre_postulante,
                post.apellidos AS apellido_postulante,
                post.email AS email_postulante
            FROM postulacion p
            INNER JOIN ofertas o ON p.id_oferta = o.id_oferta
            INNER JOIN empresa e ON o.id_empresa = e.id_empresa
            INNER JOIN postulante post ON p.id_postulante = post.id_postulante
            ORDER BY p.fecha_postulacion DESC
        `);

        res.json(filas);
    } catch (error) {
        console.error('Error al obtener todas las postulaciones:', error);
        res.status(500).json({ error: 'Error al obtener todas las postulaciones.' });
    }
});

// =========================================================================
// 6. GET: Endpoint Unificado
// URL: GET /api/postulaciones/mis-postulaciones
// =========================================================================
router.get('/mis-postulaciones', verificarToken, async (req, res) => {
    const { tipoUsuario } = req.usuario;

    try {
        if (tipoUsuario === 'postulante') {
            const idsPostulante = [req.usuario.id_postulante, req.usuario.id]
                .filter(val => val && val !== 'undefined' && val !== 'null');

            const [filas] = await db.query(`
                SELECT 
                    p.id_postulacion, p.fecha_postulacion, p.estado, 
                    o.id_oferta, o.titulo AS titulo_oferta, e.razonSocial AS razon_social
                FROM postulacion p
                INNER JOIN ofertas o ON p.id_oferta = o.id_oferta
                INNER JOIN empresa e ON o.id_empresa = e.id_empresa
                WHERE p.id_postulante IN (?)
                ORDER BY p.fecha_postulacion DESC
            `, [idsPostulante]);

            return res.json(filas);
        }

        if (tipoUsuario === 'empresa') {
            const idsEmpresa = [req.usuario.id_empresa, req.usuario.id]
                .filter(val => val && val !== 'undefined' && val !== 'null');

            const [filas] = await db.query(`
                SELECT 
                    p.id_postulacion, p.fecha_postulacion, p.estado, 
                    o.id_oferta, o.titulo AS titulo_oferta,
                    post.id_postulante, post.nombres AS nombre_postulante,
                    post.apellidos AS apellido_postulante, post.email AS email_postulante
                FROM postulacion p
                INNER JOIN ofertas o ON p.id_oferta = o.id_oferta
                INNER JOIN postulante post ON p.id_postulante = post.id_postulante
                WHERE o.id_empresa IN (?)
                ORDER BY p.fecha_postulacion DESC
            `, [idsEmpresa]);

            return res.json(filas);
        }

        return res.status(403).json({ error: 'Tipo de usuario no autorizado.' });
    } catch (error) {
        console.error('Error al obtener mis postulaciones:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// =========================================================================
// 7. PUT: Actualizar estado de postulación (Empresa / Admin)
// URL: PUT /api/postulaciones/:idPostulacion/estado
// =========================================================================
router.put('/:idPostulacion/estado', verificarToken, async (req, res) => {
    const { idPostulacion } = req.params;
    const { estado } = req.body;
    const { tipoUsuario } = req.usuario;

    const estadosValidos = ['Pendiente', 'En Revision', 'Aceptado', 'Rechazado'];
    if (!estadosValidos.includes(estado)) {
        return res.status(400).json({ error: 'Estado no válido.' });
    }

    try {
        if (tipoUsuario !== 'admin') {
            const idsEmpresa = [req.usuario.id_empresa, req.usuario.id]
                .filter(val => val && val !== 'undefined' && val !== 'null');

            const [verificacion] = await db.query(
                'SELECT p.id_postulacion FROM postulacion p INNER JOIN ofertas o ON p.id_oferta = o.id_oferta WHERE p.id_postulacion = ? AND o.id_empresa IN (?)',
                [idPostulacion, idsEmpresa]
            );

            if (verificacion.length === 0) {
                return res.status(403).json({ error: 'No tienes permisos para modificar esta postulación.' });
            }
        }

        await db.query('UPDATE postulacion SET estado = ? WHERE id_postulacion = ?', [estado, idPostulacion]);

        res.json({ OK: true, mensaje: 'Estado actualizado con éxito.' });
    } catch (error) {
        console.error('Error al actualizar estado:', error);
        res.status(500).json({ error: 'Error al actualizar el estado.' });
    }
});

// =========================================================================
// 8. DELETE: Cancelar postulación (Solo Postulante)
// URL: DELETE /api/postulaciones/:idPostulacion
// =========================================================================
router.delete('/:idPostulacion', verificarToken, async (req, res) => {
    const { idPostulacion } = req.params;
    const idsPostulante = [req.usuario.id_postulante, req.usuario.id]
        .filter(val => val && val !== 'undefined' && val !== 'null');

    try {
        const [resultado] = await db.query(
            'DELETE FROM postulacion WHERE id_postulacion = ? AND id_postulante IN (?)', 
            [idPostulacion, idsPostulante]
        );

        if (resultado.affectedRows === 0) {
            return res.status(403).json({ error: 'No se encontró la postulación o no tienes permisos para cancelarla.' });
        }

        res.json({ OK: true, mensaje: 'Postulación cancelada con éxito.' });
    } catch (error) {
        console.error('Error al cancelar postulación:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// =========================================================================
// 9. DELETE: Eliminar por moderación (Admin - INTACTO)
// URL: DELETE /api/postulaciones/admin/:idPostulacion
// =========================================================================
router.delete('/admin/:idPostulacion', verificarToken, async (req, res) => {
    if (req.usuario.tipoUsuario !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado: Solo administradores.' });
    }

    const { idPostulacion } = req.params;

    try {
        await db.query('DELETE FROM postulacion WHERE id_postulacion = ?', [idPostulacion]);
        res.json({ OK: true, mensaje: 'Postulación eliminada por moderación.' });
    } catch (error) {
        console.error('Error al eliminar postulación:', error);
        res.status(500).json({ error: 'Error al eliminar la postulación.' });
    }
});

module.exports = router;