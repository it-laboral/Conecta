import { test, expect } from '@playwright/test';

test.describe('Módulo de Perfil de Empresa - ITBConecta', () => {

  test.beforeEach(async ({ page }) => {
    // 1. Ir a inicio de sesión
    await page.goto('http://localhost:4200/sesion');

    // Escuchar alerta nativa de ingreso
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('¡Bienvenida Empresa!');
      await dialog.accept();
    });

    // 2. Autenticarse
    await page.locator('input[formControlName="email"]').fill('contacto_1790889760947@empresa');
    await page.locator('input[formControlName="password"]').fill('Itb2026!');
    await page.getByRole('button', { name: /Ingresar|Iniciar Sesión/i }).click();

    // 3. Confirmar llegada a /perfil e ingresar a /perfil/empresa
    await expect(page).toHaveURL('http://localhost:4200/perfil');
    await page.getByRole('link', { name: '🏢 Perfil Empresa' }).click();

    await expect(page).toHaveURL('http://localhost:4200/perfil/empresa');
    await expect(page.locator('.loading')).not.toBeVisible();
  });

  // --- 1. COMPLETAR FORMULARIO, GUARDAR Y RE-INGRESAR A VER CARDS ---
  test('Debería cargar el formulario directo, guardar datos y permitir ver el perfil final desde el sidebar', async ({ page }) => {
    // Verificar que entra directamente a la vista de edición/formulario
    await expect(page.getByRole('heading', { name: /Actualizar Perfil Institucional/i })).toBeVisible();
    // --- Cargar Logo ("Elegir Archivo") ---
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'logo-empresa.png',
      mimeType: 'image/png',
      buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==')
    });
    await expect(page.locator('.logo-preview img')).toBeVisible();

    
    // 2. Llenar los campos del formulario
    await page.locator('select').selectOption('Híbrido');
    await page.getByRole('textbox', { name: 'Ej: Lanús / Presencial en Sede Central' }).fill('Sede Lanús / Híbrido');


    

    await page.getByRole('textbox', { name: 'https://empresa.com' }).fill('https://www.techsolutions.com');
    await page.getByRole('textbox', { name: 'https://linkedin.com/company/...' }).fill('https://linkedin.com/company/techsolutions');
    await page.getByRole('textbox', { name: 'Ej: 11 1234-5678' }).fill('1145678900');

    await page.getByRole('textbox', { name: 'Cuenta brevemente a qué se dedica la empresa...' })
      .fill('Empresa dedicada al desarrollo de software e IA para el sector industrial.');

    await page.getByRole('textbox', { name: 'Ej: Angular, Node.js, Python, PostgreSQL, PyTorch, Docker' })
      .fill('Angular 21, Node.js 22, TypeScript, PostgreSQL');

    await page.getByRole('textbox', { name: 'Años en el mercado, proyectos destacados...' })
      .fill('Más de 10 años en el mercado desarrollando soluciones a medida.');

    await page.getByRole('textbox', { name: 'Días por examen, mentoreo técnico, flexibilidad horaria...' })
      .fill('Días por estudio para exámenes del ITB y mentoreo técnico.');

    // 3. Capturar la alerta emergente "Perfil guardado con éxito"
    page.once('dialog', async dialog => {
      expect(dialog.message()).toMatch(/guardado|éxito/i);
      await dialog.accept();
    });

    // 4. Hacer clic en "Guardar Perfil"
    await page.getByRole('button', { name: '💾 Guardar Perfil' }).click();

    await expect(page.getByRole('heading', { name: /Perfil de la Empresa/i })).toBeVisible();
    await expect(page.locator('.card-hero')).toBeVisible();

    const contentGrid = page.locator('.content-grid');
    await expect(contentGrid).toContainText('Empresa dedicada al desarrollo');
    await expect(contentGrid).toContainText('Angular 21, Node.js 22');
    await expect(contentGrid).toContainText('Más de 10 años en el mercado');
    await expect(contentGrid).toContainText('Días por estudio');
  });

});