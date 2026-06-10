// ====================================================================
// 1. IMPORTACIONES, CONFIGURACIÓN E INICIALIZACIÓN
// ====================================================================
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ====================================================================
// 2. RUTAS DE CONTROL Y PRUEBAS
// ====================================================================
app.get('/', (req, res) => res.send('API de ITB Conecta funcionando correctamente.'));

app.get('/test-db', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1 + 1 AS resultado');
        res.json({ mensaje: 'Conexión exitosa.', resultado: rows[0].resultado });
    } catch (error) {
        console.error('Error en la base de datos:', error);
        res.status(500).json({ error: 'Error al conectar con la base de datos' });
    }
});

// ====================================================================
// 3. AUTENTICACIÓN (LOGIN)
// ====================================================================
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // POSTULANTE
        const [postulantes] = await db.query('SELECT * FROM postulante WHERE email = ? AND password = ?', [email, password]);
        if (postulantes.length > 0) {
            return res.json({ success: true, tipo: 'postulante', user: { nombre: postulantes[0].Nombres, id: postulantes[0].id_postulante } });
        }
        // EMPRESA
        const [empresas] = await db.query('SELECT * FROM empresa WHERE email = ? AND password = ?', [email, password]);
        if (empresas.length > 0) {
            return res.json({ success: true, tipo: 'empresa', user: { nombre: empresas[0].RazonSocial, id: empresas[0].id_empresa } });
        }
        res.status(401).json({ success: false, message: 'Usuario no encontrado' });
    } catch (error) {
        console.error('ERROR CRÍTICO EN LOGIN:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

// ====================================================================
// 4. REGISTROS (POSTULANTE Y EMPRESA)
// ====================================================================
app.post('/api/registrar/postulante', async (req, res) => {
    const { nombres, apellidos, dni, legajo, carrera, email, password } = req.body;
    try {
        const [existe] = await db.query('SELECT id_postulante FROM postulante WHERE email = ?', [email]);
        if (existe.length > 0) return res.status(409).json({ success: false, message: 'El email ya está registrado.' });

        await db.query(`INSERT INTO postulante (nombres, apellidos, dni, legajo, carrera, email, password) VALUES (?, ?, ?, ?, ?, ?, ?)`, [nombres, apellidos, dni, legajo, carrera || '', email, password]);
        res.status(201).json({ success: true, message: 'Postulante registrado con éxito.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error en el servidor.' });
    }
});

app.post('/api/registrar/empresa', async (req, res) => {
    const { razonSocial, fantasia, organizacion, cuit, sector, pais, provincia, ciudad, cp, calle, numero, piso, dpto, email, web, telefono, responsable, password } = req.body;
    try {
        const [existe] = await db.query('SELECT id_empresa FROM empresa WHERE email = ?', [email]);
        if (existe.length > 0) return res.status(409).json({ success: false, message: 'El email ya está registrado.' });

        const sqlInsert = `INSERT INTO empresa (razonSocial, fantasia, organizacion, cuit, sector, pais, provincia, ciudad, cp, calle, numero, piso, dpto, email, web, telefono, responsable, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const valores = [razonSocial, fantasia || '', organizacion, cuit, sector, pais, provincia, ciudad, cp || '', calle, numero || '', piso || '', dpto || '', email, web || '', telefono, responsable, password];
        
        await db.query(sqlInsert, valores);
        res.status(201).json({ success: true, message: 'Empresa registrada con éxito.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error en el servidor.' });
    }
});

// ====================================================================
// 5. PERFILES (Módulo temporal en server.js)
// ====================================================================
app.get('/api/perfiles', async (req, res) => {
    try {
        const [perfiles] = await db.query('SELECT * FROM perfiles');
        res.json({ success: true, perfiles });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error al obtener perfiles.' });
    }
});

app.post('/api/perfiles', async (req, res) => {
    const { usuario_id, nombre, apellido, foto, descripcion, habilidades, linkedin, github } = req.body;
    try {
        await db.query(`INSERT INTO perfiles (usuario_id, nombre, apellido, foto, descripcion, habilidades, linkedin, github) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [usuario_id, nombre, apellido, foto || '', descripcion || '', habilidades || '', linkedin || '', github || '']);
        res.status(201).json({ success: true, message: 'Perfil creado con éxito.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error al crear perfil.' });
    }
});

// ====================================================================
// 6. ENLACE DE MÓDULOS EXTERNOS Y ARRANQUE
// ====================================================================
const ofertasRoutes = require('./routes/ofertas.routes');
app.use('/api/ofertas', ofertasRoutes);

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// EXPORTACIÓN DE LA DB: Esencial para que ofertas.routes.js pueda usar el 'db' de este archivo
module.exports = db;