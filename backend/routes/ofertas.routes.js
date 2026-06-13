const express = require('express');
const router = express.Router();
const db = require('../db'); 

// GET: Obtener ofertas vigentes con sus habilidades unificadas
router.get('/vigentes', async (req, res) => {
    try {
        // Traemos las ofertas cruzando los datos con la tabla empresa
        const [ofertas] = await db.query(`
            SELECT o.id_oferta, o.titulo, o.descripcion, o.modalidad, o.experiencia, o.dias_duracion, o.id_empresa, e.RazonSocial as razonSocial
            FROM ofertas o
            JOIN empresa e ON o.id_empresa = e.id_empresa
            ORDER BY o.id_oferta DESC
        `);

        // Por cada oferta, buscamos sus tecnologías asociadas en la tabla intermedia
        for (let oferta of ofertas) {
            const [skill] = await db.query(`
                SELECT s.nombre 
                FROM oferta_skill os
                JOIN skill s ON os.skill_id = s.skill_id
                WHERE os.id_oferta = ?
            `, [oferta.id_oferta]);
            
            oferta.skills_nombres = skill.map(s => s.nombre);
        }

        res.json(ofertas);
    } catch (error) {
        console.error('Error al obtener ofertas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// POST: Crear una nueva oferta e insertar en la tabla intermedia oferta_skill
router.post('/crear', async (req, res) => {
    const { id_empresa, titulo, descripcion, modalidad, experiencia, dias_duracion, skill, skills } = req.body;

    try {
        // 1. Insertar la oferta principal
        const fecha_publicacion = new Date();

        const [resultado] = await db.query(`
            INSERT INTO ofertas (id_empresa, titulo, descripcion, modalidad, experiencia, dias_duracion, fecha_publicacion) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [id_empresa, titulo, descripcion, modalidad, experiencia, dias_duracion, fecha_publicacion]);

        const nuevoIdOferta = resultado.insertId;

        // 2. Insertar las relaciones en la tabla intermedia oferta_skill (PK skill_id)
        const listaSkills = skill || skills; // Aceptamos ambos nombres de campo para compatibilidad
        if (listaSkills && listaSkills.length > 0) {
            for (let skillId of listaSkills) {
                await db.query(`
                    INSERT INTO oferta_skill (id_oferta, skill_id) 
                    VALUES (?, ?)
                `, [nuevoIdOferta, skillId]);
            }
        }

        res.status(201).json({ OK: true, message: 'Oferta y habilidades registradas con éxito.' });
    } catch (error) {
        console.error('Error al crear oferta:', error);
        res.status(500).json({ OK: false, error: 'Error al guardar la oferta' });
    }
});

module.exports = router;