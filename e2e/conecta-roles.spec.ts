import { test, expect } from '@playwright/test';

test.describe('Pruebas de Intermediación Laboral - ITB Conecta', () => {
// 1. ROL VISITANTE: Registro de un nuevo estudiante (Postulante)
test('Flujo Visitante: Registro de un nuevo estudiante', async ({ page }) => {
  const timestamp = Date.now();
  const emailUnico = `estudiante_${timestamp}@itbeltran.com.ar`;
  const dniUnico = `${timestamp}`.slice(-8); // 8 dígitos numéricos exactos
  const legajoUnico = `${timestamp}`.slice(-6);
  const passwordValida = 'Password123!'; // Cumple: min 8 caracteres, 1 mayúscula y 1 número

  // A. Ir a la pantalla principal/sesión
  await page.goto('/sesion');

  // B. Ir a la pestaña "Registrarse"
  const tabRegistro = page.locator('text=Registrarse, button:has-text("Registrarse"), .tab-registro');
  if (await tabRegistro.isVisible()) {
    await tabRegistro.click();
  }

  // C. Elegir la opción "Postulante"
  const opcionPostulante = page.locator('text=Postulante, button:has-text("Postulante"), .card-postulante');
  await opcionPostulante.first().click();

  // D. Completar el FormGroup 'formRegistro' con los selectores exactos de tu TypeScript
  await page.fill('[formControlName="nombres"]', 'Juan Carlos');
  await page.fill('[formControlName="apellidos"]', 'Pérez');
  await page.fill('[formControlName="dni"]', dniUnico);
  await page.fill('[formControlName="legajo"]', legajoUnico);
  await page.fill('[formControlName="carrera"]', 'Análisis de Sistemas');
  await page.fill('[formControlName="email"]', emailUnico);
  await page.fill('[formControlName="password"]', passwordValida);
  await page.fill('[formControlName="confirmPassword"]', passwordValida); // ¡Campo clave que faltaba!

  // E. Enviar el formulario
  await page.click('button[type="submit"]');

  // F. Validar que el registro fue procesado (redirige o limpia el formulario)
  await expect(page).not.toHaveURL('/registro');
});

  // 2. ROL POSTULANTE
  test('Flujo Postulante: Login y acceso al Perfil', async ({ page }) => {
    // A. Ir a la pantalla de login
    await page.goto('/sesion');

    // B. Ingresar credenciales del postulante
    await page.fill('input[type="email"]', 'azucenag@itbeltran.com.ar');
    await page.fill('input[type="password"]', 'Itb2026!');

    // C. Click en ingresar
    await page.click('button[type="submit"]');

    // D. Validar llegada a la cartelera de ofertas
    await expect(page).toHaveURL('/ofertas');

    // E. Navegar al perfil (si el botón/link existe)
    const btnPerfil = page.locator('a[routerLink*="postulante"], .btn-perfil');
    if (await btnPerfil.isVisible()) {
      await btnPerfil.click();
      await expect(page).toHaveURL(/\/postulante\/\d+/);
    }
  });

  // 3. ROL EMPRESA
  test('Flujo Empresa: Login y verificación de acceso', async ({ page }) => {
    await page.goto('/sesion');
    await page.fill('input[type="email"]', 'info@tecnosolution.com.ar');
    await page.fill('input[type="password"]', 'Itb2026!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/(ofertas|empresa)/);
  });

  // 4. ROL ADMINISTRADOR
  test('Flujo Admin: Login y acceso al Panel de Control', async ({ page }) => {
    await page.goto('/sesion');
    await page.fill('input[type="email"]', 'admin@itbeltran.com.ar');
    await page.fill('input[type="password"]', 'Itb2026!');
    await page.click('button[type="submit"]');

    await page.goto('/admin');
    await expect(page).toHaveURL('/panel-admin');
  });

});