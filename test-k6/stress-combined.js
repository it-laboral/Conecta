import http from 'k6/http';
import { check, sleep, group } from 'k6';
import encoding from 'k6/encoding';

export const options = {
  scenarios: {
    // Escenario 1: Tráfico de Postulantes (20 VUs)
    flujo_postulantes: {
      executor: 'ramping-vus',
      exec: 'testPostulante',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 10 },
        { duration: '20s', target: 20 },
        { duration: '10s', target: 0 },
      ],
    },
    // Escenario 2: Tráfico de Empresas (20 VUs en paralelo)
    flujo_empresas: {
      executor: 'ramping-vus',
      exec: 'testEmpresa',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 10 },
        { duration: '20s', target: 20 },
        { duration: '10s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% de peticiones en menos de 500ms
    checks: ['rate>0.99'],             // Más del 99% de los checks deben pasar
  },
};

const BASE_URL = 'http://localhost:3000/api';

// Función auxiliar para decodificar JWT
function obtenerIdDesdeJwt(token, campoId) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payloadTexto = encoding.b64decode(base64, 'rawstd', 's');
    const payload = JSON.parse(payloadTexto);
    return payload[campoId] || payload.id || payload.id_usuario;
  } catch (e) {
    return null;
  }
}

// ============================================================================
// 1. FLUJO DE POSTULANTE
// ============================================================================
export function testPostulante() {
  const payloadLogin = JSON.stringify({
    email: 'azucenag@itbeltran.com.ar', // ⚠️ Ajustar email real
    password: 'Itb2026!',               // ⚠️ Ajustar contraseña real
  });

  const params = { headers: { 'Content-Type': 'application/json' } };
  const resLogin = http.post(`${BASE_URL}/login`, payloadLogin, params);

  const loginOk = check(resLogin, {
    '[Postulante] Login (200)': (r) => r.status === 200,
  });

  if (!loginOk) return;

  const body = resLogin.json();
  const token = body.token;
  const idPostulante = body.usuario?.id_postulante || body.id_postulante || obtenerIdDesdeJwt(token, 'id_postulante');

  if (!idPostulante) return;

  const authHeaders = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  group('Postulante - Perfil', function () {
    const resPerfil = http.get(`${BASE_URL}/postulante/perfil/${idPostulante}`, authHeaders);
    check(resPerfil, {
      '[Postulante] Perfil (200)': (r) => r.status === 200,
    });
  });

  sleep(2);

  group('Postulante - Mis Postulaciones', function () {
    const resPostulaciones = http.get(`${BASE_URL}/postulaciones/mis-postulaciones`, authHeaders);
    check(resPostulaciones, {
      '[Postulante] Postulaciones (200)': (r) => r.status === 200,
    });
  });

  sleep(1);
}

// ============================================================================
// 2. FLUJO DE EMPRESA
// ============================================================================
export function testEmpresa() {
  const payloadLogin = JSON.stringify({
    email: 'info@tecnosolution.com.ar', // ⚠️ Ajustar email real de empresa
    password: 'Itb2026!',    // ⚠️ Ajustar contraseña real
  });

  const params = { headers: { 'Content-Type': 'application/json' } };
  const resLogin = http.post(`${BASE_URL}/login`, payloadLogin, params);

  const loginOk = check(resLogin, {
    '[Empresa] Login (200)': (r) => r.status === 200,
  });

  if (!loginOk) return;

  const body = resLogin.json();
  const token = body.token;
  const idEmpresa = body.usuario?.id_empresa || body.id_empresa || obtenerIdDesdeJwt(token, 'id_empresa');

  if (!idEmpresa) return;

  const authHeaders = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  group('Empresa - Perfil', function () {
    const resPerfil = http.get(`${BASE_URL}/empresa/perfil/${idEmpresa}`, authHeaders);
    check(resPerfil, {
      '[Empresa] Perfil (200)': (r) => r.status === 200,
    });
  });

  sleep(2);

  group('Empresa - Candidatos', function () {
    const resCandidatos = http.get(`${BASE_URL}/postulaciones/empresa/${idEmpresa}`, authHeaders);
    check(resCandidatos, {
      '[Empresa] Candidatos (200)': (r) => r.status === 200,
    });
  });

  sleep(1);
}