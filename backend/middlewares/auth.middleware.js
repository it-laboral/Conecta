const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
  // Extrae el token del header: "Authorization: Bearer <token>"
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado: Token no proporcionado' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado' });
    }
    // Guarda el usuario decodificado en req.usuario para que las siguientes rutas lo usen
    req.usuario = decoded; 
    next();
  });
}

module.exports = { verificarToken };