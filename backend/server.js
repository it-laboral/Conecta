// ====================================================================
// 1. IMPORTACIONES, CONFIGURACIÓN E INICIALIZACIÓN
// ====================================================================
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path'); // 👈 1. Agregar importación de path
const fs = require('fs');     // 👈 2. Agregar importación de fs
require('dotenv').config();

const db = require('./db');
const { verificarToken } = require('./middlewares/auth.middleware');

const app = express();
// ====================================================================
// CONFIGURACIÓN DE CARPETA DE ARCHIVOS (UPLOADS)
// ====================================================================
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));
// ====================================================================

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const SALT_ROUNDS = 10; // Nivel de seguridad para bcrypt

// ====================================================================
// 2. RUTAS DE CONTROL Y PRUEBAS (PÚBLICAS)
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
// 3. AUTENTICACIÓN Y REGISTROS (RUTAS PÚBLICAS - SIN TOKEN)
// ====================================================================
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    const jwtSecret = process.env.JWT_SECRET;
    const jwtExpires = process.env.JWT_EXPIRES_IN;

    try {
        // 1. Buscar en ADMINISTRADOR
        const [administradores] = await db.query('SELECT * FROM administrador WHERE email = ?', [email]);
        
        if (administradores.length > 0) {
            const admin = administradores[0];
            const match = await bcrypt.compare(password, admin.password);

            if (!match) {
                return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
            }

            const token = jwt.sign(
                { id: admin.id, email: admin.email, tipo: 'admin' },
                jwtSecret,
                { expiresIn: jwtExpires }
            );

            return res.json({
                success: true,
                tipo: 'admin',
                token,
                user: {
                    id: admin.id,
                    nombre: admin.nombre,
                    email: admin.email
                }
            });
        }

        // 2. Buscar en POSTULANTE
        const [postulantes] = await db.query('SELECT * FROM postulante WHERE email = ?', [email]);
        if (postulantes.length > 0) {
            const postulante = postulantes[0];
            const esValida = await bcrypt.compare(password, postulante.password);

            if (!esValida) {
                return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
            }

            const token = jwt.sign(
                { id: postulante.id_postulante, email: postulante.email, tipo: 'postulante' },
                jwtSecret,
                { expiresIn: jwtExpires }
            );

            return res.json({
                success: true,
                tipo: 'postulante',
                token,
                user: { 
                    id: postulante.id_postulante, 
                    nombre: postulante.Nombres || postulante.nombres, 
                    email: postulante.email 
                }
            });
        }

        // 3. Buscar en EMPRESA
        const [empresas] = await db.query('SELECT * FROM empresa WHERE email = ?', [email]);
        if (empresas.length > 0) {
            const empresa = empresas[0];
            const esValida = await bcrypt.compare(password, empresa.password);

            if (!esValida) {
                return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
            }

            const token = jwt.sign(
                { id: empresa.id_empresa, email: empresa.email, tipo: 'empresa' },
                jwtSecret,
                { expiresIn: jwtExpires }
            );

            return res.json({
                success: true,
                tipo: 'empresa',
                token,
                user: { 
                    id: empresa.id_empresa, 
                    nombre: empresa.RazonSocial || empresa.razonSocial, 
                    email: empresa.email 
                }
            });
        }

        // Si llegó acá, no encontró el correo en ninguna tabla
        return res.status(401).json({ success: false, message: 'Usuario no encontrado' });

    } catch (error) {
        console.error('ERROR CRÍTICO EN LOGIN:', error);
        return res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

app.post('/api/registrar/postulante', async (req, res) => {
    const { nombres, apellidos, dni, legajo, carrera, email, password } = req.body;
    try {
        const [existe] = await db.query('SELECT id_postulante FROM postulante WHERE email = ?', [email]);
        if (existe.length > 0) return res.status(409).json({ success: false, message: 'El email ya está registrado.' });

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        await db.query(
            `INSERT INTO postulante (nombres, apellidos, dni, legajo, carrera, email, password) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [nombres, apellidos, dni, legajo, carrera || '', email, passwordHash]
        );
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

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        const sqlInsert = `INSERT INTO empresa (razonSocial, fantasia, organizacion, cuit, sector, pais, provincia, ciudad, cp, calle, numero, piso, dpto, email, web, telefono, responsable, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const valores = [razonSocial, fantasia || '', organizacion, cuit, sector, pais, provincia, ciudad, cp || '', calle, numero || '', piso || '', dpto || '', email, web || '', telefono, responsable, passwordHash];
        
        await db.query(sqlInsert, valores);
        res.status(201).json({ success: true, message: 'Empresa registrada con éxito.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error en el servidor.' });
    }
});

// ====================================================================
// 4. RUTAS PROTEGIDAS (REQUIEREN VERIFICARTOKEN)
// ====================================================================
const adminRoutes = require('./routes/admin');
const perfilEmpresaRoutes = require('./routes/perfilEmpresa.routes');
const perfilPostulanteRoutes = require('./routes/perfilPostulante.routes');
const ofertasRoutes = require('./routes/ofertas.routes');

app.use('/api/admin', verificarToken, adminRoutes);

// ✅ CAMBIO CLAVE: Se añade el prefijo /api/empresa para coincidir con Angular
app.use('/api/empresa', verificarToken, perfilEmpresaRoutes);

// ✅ CAMBIO CLAVE: Se añade el prefijo /api/postulante para mantener consistencia
app.use('/api/postulante', verificarToken, perfilPostulanteRoutes);

app.use('/api/ofertas', ofertasRoutes);

app.post('/api/postular', verificarToken, async (req, res) => {
    const { postulante_id, oferta_id } = req.body;

    if (!postulante_id || !oferta_id) {
        return res.status(400).json({ OK: false, mensaje: 'Faltan datos obligatorios' });
    }

    try {
        const query = 'INSERT INTO postulacion (postulante_id, oferta_id) VALUES (?, ?)';
        const [result] = await db.query(query, [postulante_id, oferta_id]);
        res.json({ OK: true, mensaje: 'Postulación registrada con éxito', id: result.insertId });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ OK: false, mensaje: 'Ya te has postulado a esta oferta anteriormente.' });
        }
        res.status(500).json({ OK: false, error: err.message });
    }
});

// ====================================================================
// 5. ARRANQUE DEL SERVIDOR
// ====================================================================
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = db;