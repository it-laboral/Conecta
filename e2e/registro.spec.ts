import { test, expect } from '@playwright/test';

test.describe('Módulo de Registro - ITBConecta', () => {

  // --- 1. TEST POSTULANTE ---
  test('Flujo completo de registro como Postulante', async ({ page }) => {
    // Generamos datos únicos dinámicos
    const timestamp = Date.now();
    const dniUnico = `40${timestamp.toString().slice(-6)}`;
    const legajoUnico = `LEG${timestamp.toString().slice(-4)}`;
    const emailUnico = `postulante_${timestamp}@itbeltran.com.ar`;

    // 1. Ir a la página inicial
    await page.goto('http://localhost:4200/');

    // 2. Clic en "Registrarse" en el header
    await page.getByRole('banner').getByRole('link', { name: /Registrarse/i }).click();

    // 3. Seleccionar la opción de Estudiante
    await page.getByRole('button', { name: /Soy Estudiante/i }).click();

    // Validar redirección
    await expect(page).toHaveURL('http://localhost:4200/registrar-postulante');

    // Capturar alerta nativa de éxito (si tu backend responde con alert)
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('exitoso');
      await dialog.accept();
    });

    // 4. Completar el formulario usando los formControlName exactos
    await page.locator('input[formControlName="nombres"]').fill('Carlos');
    await page.locator('input[formControlName="apellidos"]').fill('Gómez');
    await page.locator('input[formControlName="dni"]').fill(dniUnico);
    await page.locator('input[formControlName="legajo"]').fill(legajoUnico);
    await page.locator('input[formControlName="carrera"]').fill('Analista de Sistemas');
    await page.locator('input[formControlName="email"]').fill(emailUnico);
    await page.locator('input[formControlName="password"]').fill('Itb2026!');
    await page.locator('input[formControlName="confirmPassword"]').fill('Itb2026!');

    // 5. Clic en el botón "Crear Cuenta"
    await page.getByRole('button', { name: 'Crear Cuenta' }).click();

    // 6. Validar que redirige a la pantalla de Inicio de Sesión
    await expect(page).toHaveURL('http://localhost:4200/sesion');
  });

/// --- 2. TEST EMPRESA ---
  test('Flujo completo de registro como Empresa', async ({ page }) => {
    const timestamp = Date.now();
    // Genera un CUIT válido de 11 dígitos con formato 30-XXXXXXXX-9
    const cuitMedio = timestamp.toString().slice(-8);
    const cuitUnico = `30-${cuitMedio}-9`;
    const emailEmpresa = `contacto_${timestamp}@empresa.com`;

    await page.goto('http://localhost:4200/');
    await page.getByRole('banner').getByRole('link', { name: /Registrarse/i }).click();

    // Clic en la opción de Empresa (ajustar el texto según el botón de selección)
    await page.getByRole('button', { name: /Soy Empresa/i }).click();

    // Captura de alerta nativa
    page.once('dialog', async dialog => {
      await dialog.accept();
    });

    // Carga de todos los campos según los formControlName del HTML
    await page.locator('input[formControlName="razonSocial"]').fill('Tech Solutions S.A.');
    await page.locator('input[formControlName="fantasia"]').fill('TechSol');
    await page.locator('input[formControlName="organizacion"]').fill('S.A.');
    await page.locator('input[formControlName="cuit"]').fill(cuitUnico);
    await page.locator('input[formControlName="sector"]').fill('Tecnología');
    await page.locator('input[formControlName="pais"]').fill('Argentina');
    await page.locator('input[formControlName="provincia"]').fill('Buenos Aires');
    await page.locator('input[formControlName="ciudad"]').fill('Lanús');
    await page.locator('input[formControlName="cp"]').fill('1824');
    await page.locator('input[formControlName="calle"]').fill('Hipólito Yrigoyen');
    await page.locator('input[formControlName="numero"]').fill('4500');
    await page.locator('input[formControlName="piso"]').fill('2');
    await page.locator('input[formControlName="dpto"]').fill('A');
    await page.locator('input[formControlName="email"]').fill(emailEmpresa);
    await page.locator('input[formControlName="web"]').fill('www.techsolutions.com');
    await page.locator('input[formControlName="telefono"]').fill('1145678900');
    await page.locator('input[formControlName="responsable"]').fill('María González');
    await page.locator('input[formControlName="password"]').fill('Itb2026!');
    await page.locator('input[formControlName="confirmPassword"]').fill('Itb2026!');

    // Clic en submit
    const btnSubmit = page.getByRole('button', { name: 'Crear Cuenta' });
    await expect(btnSubmit).toBeEnabled();
    await btnSubmit.click();

    // Verificación de navegación post-registro
    await expect(page).toHaveURL('http://localhost:4200/sesion');
  });

});


