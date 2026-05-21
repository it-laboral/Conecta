const mysql = require('mysql2/promise');
require('dotenv').config();

// Creamos un pool de conexiones, que es más eficiente para producción y trabajo en equipo
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'conecta', // Reemplaza por el nombre real de tu BD
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;