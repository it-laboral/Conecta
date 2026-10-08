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

function obtenerIdEmpresaDesdeJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payloadTexto = encoding.b64decode(base64, 'rawstd', 's');
    const payload = JSON.parse(payloadTexto);
    return payload.id_empresa || payload.id || payload.id_usuario;
  } catch (e) {
    return null;
  }
}

export default function () {
  const payloadLogin = JSON.stringify({
    email: 'info@tecnosolution.com.ar', // ⚠️ Colocar un email de empresa real de la BD
    password: 'Itb2026!',    // ⚠️ Colocar la contraseña real
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  // 1. Login Empresa
  const resLogin = http.post(`${BASE_URL}/login`, payloadLogin, params);

  const loginExitoso = check(resLogin, {
    'Login Empresa correcto (200)': (r) => r.status === 200,
  });

  if (!loginExitoso) {
    console.log(`[ERROR LOGIN EMPRESA ${resLogin.status}]: ${resLogin.body}`);
    return;
  }

  const body = resLogin.json();
  const token = body.token;

  const idEmpresa = 
    body.usuario?.id_empresa || 
    body.id_empresa || 
    obtenerIdEmpresaDesdeJwt(token);

  if (!idEmpresa) {
    console.log(`[ERROR CRÍTICO]: No se identificó el id_empresa.`);
    return;
  }

  const authHeaders = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  // 2. Perfil de Empresa
  group('1. Carga de Perfil Empresa', function () {
    const resPerfil = http.get(`${BASE_URL}/empresa/perfil/${idEmpresa}`, authHeaders);

    check(resPerfil, {
      'Perfil Empresa devuelto (200)': (r) => r.status === 200,
    });
  });

  sleep(2);

  // 3. Candidatos / Postulaciones de la Empresa
  group('2. Candidatos de la Empresa', function () {
    const resCandidatos = http.get(`${BASE_URL}/postulaciones/empresa/${idEmpresa}`, authHeaders);

    check(resCandidatos, {
      'Candidatos devueltos (200)': (r) => r.status === 200,
    });
  });

  sleep(1);
}