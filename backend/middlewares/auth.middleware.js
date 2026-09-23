const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado: Token no proporcionado' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado' });
    }

    // 🟢 1. Normalización del Rol / Tipo (Soporta tipoUsuario, tipo_usuario, rol, tipo)
    const tipoNormalizado = (
      decoded.tipoUsuario || 
      decoded.tipo_usuario || 
      decoded.rol || 
      decoded.tipo || 
      ''
    ).toString().toLowerCase();

    // 🟢 2. Normalización de IDs de Entidad
    const idGenerico = decoded.id_usuario || decoded.id;
    const idPostulante = decoded.id_postulante || idGenerico;
    const idEmpresa = decoded.id_empresa || idGenerico;

    // 🟢 3. Asignación garantizada en req.usuario
    // Al mapear todas las variaciones aquí, NUNCA fallará un controller busque la propiedad que busque.
    req.usuario = {
      ...decoded,
      // Propiedades de tipo de usuario
      tipoUsuario: tipoNormalizado,
      tipo_usuario: tipoNormalizado,
      rol: tipoNormalizado,
      tipo: tipoNormalizado,

      // Propiedades de IDs
      id: idGenerico,
      id_usuario: idGenerico,
      id_postulante: idPostulante,
      id_empresa: idEmpresa
    };

    next();
  });
}

// 🟢 Como verificarToken YA normalizó req.usuario, estos middlewares se simplifican al máximo:

function esEmpresa(req, res, next) {
  const tipo = req.usuario.tipoUsuario;

  if (tipo === 'empresa' || tipo === 'admin') {
    return next();
  }

  return res.status(403).json({ 
    success: false, 
    error: 'Acceso denegado: No cuentas con el rol necesario para esta acción.' 
  });
}

function esDuenioDelPerfil(req, res, next) {
  const id_postulante = req.params.id_postulante || req.body.id_postulante;
  const tipo = req.usuario.tipoUsuario;

  if (
    tipo === 'admin' || 
    (id_postulante && String(req.usuario.id_postulante) === String(id_postulante))
  ) {
    return next();
  }

  return res.status(403).json({ 
    error: 'Acceso denegado: No tenés permisos para modificar este perfil' 
  });
}

function esDuenioEmpresa(req, res, next) {
  const id_empresa_solicitud = req.params.id_empresa || req.body.id_empresa;
  const tipo = req.usuario.tipoUsuario;

  if (tipo === 'admin') {
    return next();
  }

  if (!id_empresa_solicitud || String(req.usuario.id_empresa) === String(id_empresa_solicitud)) {
    return next();
  }

  return res.status(403).json({ 
    success: false, 
    error: 'Acceso denegado: No tenés permisos para modificar esta empresa' 
  });
}

module.exports = { 
  verificarToken, 
  esEmpresa,
  esDuenioDelPerfil, 
  esDuenioEmpresa 
};