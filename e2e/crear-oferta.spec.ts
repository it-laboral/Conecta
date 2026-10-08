import { test, expect } from '@playwright/test';

test.describe('Módulo de Ofertas Laborales - ITBConecta', () => {

  test('Debería publicar una oferta para Especialista en Datos e IA', async ({ page }) => {
    
    // Título oficial, limpio y sin códigos o marcas de tiempo
    const tituloOferta = 'Especialista en Datos e IA';

    // --- 1. INICIO DE SESIÓN ---
    await page.goto('http://localhost:4200/sesion');

    page.once('dialog', async dialog => {
      await dialog.accept();
    });

    await page.getByRole('textbox', { name: 'Tu correo' }).fill('admin@orbita.com.ar');
    await page.getByRole('textbox', { name: 'Tu contraseña' }).fill('Itb2026!');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

    await page.waitForURL((url) => !url.pathname.includes('/sesion'));
    await page.waitForLoadState('networkidle');

    // --- 2. NAVEGACIÓN A OPORTUNIDADES DESDE EL HEADER ---
    const navOportunidades = page.locator('header, nav').getByRole('link', { name: 'Oportunidades' });
    await navOportunidades.click();

    await page.waitForURL('**/ofertas**');
    await page.waitForLoadState('networkidle');

    // --- 3. ABRIR FORMULARIO (+Nueva Oferta) ---
    const btnNuevaOferta = page.locator('button, a, .btn').filter({ hasText: /\+?\s*Nueva Oferta/i }).first();
    await btnNuevaOferta.waitFor({ state: 'visible', timeout: 10000 });
    await btnNuevaOferta.click();

    // --- 4. COMPLETAR FORMULARIO CON DATOS REALES ---
    await page.locator('[formControlName="titulo"]').fill(tituloOferta);
    await page.locator('[formControlName="modalidad"]').selectOption('Remoto');
    await page.locator('[formControlName="experiencia"]').selectOption('Senior');
    await page.locator('[formControlName="tipoDuracion"]').selectOption('30');
    await page.locator('[formControlName="descripcion"]').fill(
      'Buscamos Especialista en Datos e IA para potenciar el módulo analítico del ERP/CRM. Tareas: Diseñar procesos ETL, construir tableros en Power BI e integrar APIs de LLMs para automatización.'
    );

    // --- 5. SELECCIÓN DE CHIPS ---
    const habilidadesRequeridas = ['MySQL', 'Metodologías Ágiles'];

    for (const habilidad of habilidadesRequeridas) {
      const chip = page.locator('button.chip-skill', { hasText: habilidad }).first();
      await chip.scrollIntoViewIfNeeded();
      await chip.click();
      await expect(chip).toHaveClass(/seleccionada/);
    }

    // --- 6. PUBLICAR Y CONFIRMAR ---
    const btnPublicar = page.getByRole('button', { name: 'Publicar Oferta' });
    await expect(btnPublicar).toBeEnabled();

    const [dialog] = await Promise.all([
      page.waitForEvent('dialog'),
      btnPublicar.click()
    ]);

    expect(dialog.message()).toMatch(/publicada|éxito|guardada/i);
    await dialog.accept();

    // --- 7. NAVEGAR A LA LISTA DE OFERTAS Y VERIFICAR ---
    await page.goto('http://localhost:4200/ofertas');
    await page.waitForLoadState('networkidle');

    // Ubicamos la tarjeta limpia por su nombre (toma la primera coincidencia)
    const tarjetaOferta = page.getByText(tituloOferta).first();
    await expect(tarjetaOferta).toBeVisible({ timeout: 10000 });

    await tarjetaOferta.click();

    // --- 8. CAPTURA DE PANTALLA ---
    await page.screenshot({ path: 'evidencia-oferta-publicada.png', fullPage: true });
  });

});