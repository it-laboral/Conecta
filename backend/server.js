// 1. IMPORTACIÓN DE LIBRERÍAS
const express = require('express');
const cors = require('cors');
//require('dotenv').config();

// 2. IMPORTACIÓN DE CONFIGURACIONES LOCALES
const db = require('./db'); // Tu archivo de conexión a la base de datos

// 3. INICIALIZACIÓN DE LA APP
const app = express();
const PORT = process.env.PORT || 3000;

// 4. MIDDLEWARES (Configuraciones de la app)
app.use(cors()); // Permite que Angular (puerto 4200) hable con Node (puerto 3000)
app.use(express.json()); // Permite que tu API entienda datos en formato JSON (vital para el login)

// 5. RUTAS DE PRUEBA (Opcionales, se pueden dejar para control)
app.get('/', (req, res) => {
    res.send('API de ITB Conecta funcionando correctamente.');
});

app.get('/test-db', async (req, res) => {
    try {
        // Hacemos una consulta simple de prueba
        const [rows] = await db.query('SELECT 1 + 1 AS resultado');
        res.json({
            mensaje: 'Conexión exitosa.',
            resultado: rows[0].resultado
        });
    } catch (error) {
        console.error('Error en la base de datos:', error);
        res.status(500).json({ error: 'Error al conectar con la base de datos' });
    }
});

// 6. RUTAS DE LOGIN Y REGISTRO
// app.use('/api/auth', authRoutes); 


app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Intentamos buscar en la tabla de Postulantes
        const [postulantes] = await db.query(
            'SELECT * FROM postulante WHERE email = ? AND password = ?',
            [email, password]
        );

        if (postulantes.length > 0) {
            return res.json({
                success: true,
                tipo: 'postulante', // <--- Etiqueta para Angular
                user: { nombre: postulantes[0].Nombres, id: postulantes[0].id_postulante }
            });
        }

        // 2. Si no es postulante, intentamos buscar en la tabla de Empresas
        const [empresas] = await db.query(
            'SELECT * FROM empresa WHERE email = ? AND password = ?',
            [email, password]
        );

        if (empresas.length > 0) {
            return res.json({
                success: true,
                tipo: 'empresa', // <--- Etiqueta para Angular
                user: { nombre: empresas[0].RazonSocial, id: empresas[0].id_empresa }
            });
        }

        // 3. Si no está en ninguna, credenciales incorrectas
        res.status(401).json({ success: false, message: 'Usuario no encontrado' });

    } catch (error){
    // ESTA LÍNEA ES CLAVE: Te va a mostrar el error real en la consola negra de Node
    console.error("ERROR CRÍTICO EN LOGIN:", error); 
    
    res.status(500).json({ success: false, message: 'Error en el servidor' });
}
});

// REGISTRO DE POSTULANTE
app.post('/api/registrar/postulante', async (req, res) => {
    const { nombres, apellidos, dni, legajo, carrera, email, password } = req.body;

    try {
        const [existe] = await db.query(
            'SELECT id_postulante FROM postulante WHERE email = ?', [email]
        );
        if (existe.length > 0) {
            return res.status(409).json({ success: false, message: 'El email ya está registrado.' });
        }

        await db.query(
            'INSERT INTO postulante (nombres, apellidos, dni, legajo, carrera, email, password) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nombres, apellidos, dni, legajo, carrera || '', email, password]
        );

        res.status(201).json({ success: true, message: 'Postulante registrado con éxito.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error en el servidor.' });
    }
});

// REGISTRO DE EMPRESA
app.post('/api/registrar/empresa', async (req, res) => {
    const { razonSocial, fantasia, organizacion, cuit, sector, pais, provincia,
            ciudad, cp, calle, numero, piso, dpto, email, web, telefono, responsable, password } = req.body;

    try {
        const [existe] = await db.query(
            'SELECT id_empresa FROM empresa WHERE email = ?', [email]
        );
        if (existe.length > 0) {
            return res.status(409).json({ success: false, message: 'El email ya está registrado.' });
        }

        await db.query(
            `INSERT INTO empresa 
            (razonSocial, fantasia, organizacion, cuit, sector, pais, provincia, ciudad, cp, calle, numero, piso, dpto, email, web, telefono, responsable, password)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [razonSocial, fantasia || '', organizacion, cuit, sector, pais, provincia,
             ciudad, cp || '', calle, numero || '', piso || '', dpto || '',
             email, web || '', telefono, responsable, password]
        );

        res.status(201).json({ success: true, message: 'Empresa registrada con éxito.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error en el servidor.' });
    }
});

// INICIO DEL SERVIDOR
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});