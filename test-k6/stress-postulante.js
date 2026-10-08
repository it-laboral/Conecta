import http from 'k6/http';
import { check, sleep, group } from 'k6';
import encoding from 'k6/encoding';

export const options = {
  stages: [
    { duration: '10s', target: 10 },
    { duration: '20s', target: 20 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
  },
};

const BASE_URL = 'http://localhost:3000/api';

// Función para decodificar la carga útil (payload) del JWT
function obtenerIdDesdeJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payloadTexto = encoding.b64decode(base64, 'rawstd', 's');
    const payload = JSON.parse(payloadTexto);
    return payload.id_postulante || payload.id || payload.id_usuario;
  } catch (e) {
    return null;
  }
}

export default function () {
  // 1. Inicio de Sesión
  const payloadLogin = JSON.stringify({
    email: 'azucenag@itbeltran.com.ar', // ⚠️ Colocar un email de postulante real de la BD
    password: 'Itb2026!', // ⚠️ Colocar la contraseña real
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const resLogin = http.post(`${BASE_URL}/login`, payloadLogin, params);

  const loginExitoso = check(resLogin, {
    'Login correcto (200)': (r) => r.status === 200,
  });

  if (!loginExitoso) {
    console.log(`[ERROR LOGIN ${resLogin.status}]: ${resLogin.body}`);
    return;
  }

  const body = resLogin.json();
  const token = body.token;

  // Busca el ID en el JSON o lo decodifica desde el Token JWT
  const idPostulante = 
    body.usuario?.id_postulante || 
    body.id_postulante || 
    obtenerIdDesdeJwt(token);

  if (!idPostulante) {
    console.log(`[ERROR CRÍTICO]: No se pudo extraer el id_postulante del login ni del JWT.`);
    return;
  }

  const authHeaders = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  // 2. Perfil con ID extrado dinámicamente
  group('1. Carga de Perfil', function () {
    const resPerfil = http.get(`${BASE_URL}/postulante/perfil/${idPostulante}`, authHeaders);
    
    if (resPerfil.status !== 200) {
      console.log(`[ERROR PERFIL ${resPerfil.status}] URL: ${BASE_URL}/postulante/perfil/${idPostulante} | Resp: ${resPerfil.body}`);
    }

    check(resPerfil, {
      'Perfil devuelto (200)': (r) => r.status === 200,
    });
  });

  sleep(2);

  // 3. Mis Postulaciones
  group('2. Consulta de Postulaciones', function () {
    const resPostulaciones = http.get(`${BASE_URL}/postulaciones/mis-postulaciones`, authHeaders);
    check(resPostulaciones, {
      'Postulaciones devueltas (200)': (r) => r.status === 200,
    });
  });

  sleep(1);
}