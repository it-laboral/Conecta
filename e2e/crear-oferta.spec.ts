import { test, expect } from '@playwright/test';

test.describe('Módulo de Ofertas Laborales - ITBConecta', () => {

  test('Debería publicar una oferta para Asistente de Ciencia de Datos e IA en una Empresa de Comunicación', async ({ page }) => {
    
    // Título dinámico para evitar duplicados en MySQL
    const tituloOferta = `Analista Junior de Ciencia de Datos y PLN- ${Date.now()}`;

    // --- 1. INICIO DE SESIÓN COMO EMPRESA DE COMUNICACIÓN ---
    await page.goto('http://localhost:4200/sesion');

    // Manejo preventiva de alerta emergente de login
    page.once('dialog', async dialog => {
      await dialog.accept();
    });

    await page.getByRole('textbox', { name: 'Tu correo' }).fill('rrhh@nexora.com.ar');
    await page.getByRole('textbox', { name: 'Tu contraseña' }).fill('Itb2026!');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

    // Esperar a que el backend devuelva el token y el rol de la empresa
    await page.waitForLoadState('networkidle');

    // --- 2. NAVEGACIÓN A OPORTUNIDADES ---
    await page.getByRole('link', { name: 'Oportunidades' }).click();
    await page.waitForURL('**/ofertas**');
    await page.waitForLoadState('networkidle');

    // --- 3. ABRIR FORMULARIO DE NUEVA OFERTA ---
    // Localizamos el botón/enlace específico que contenga "Nueva Oferta"
    const btnNuevaOferta = page.locator('button, a, .btn').filter({ hasText: /Nueva Oferta/i }).first();
    
    // Esperamos explícitamente a que sea visible en pantalla antes de clickear
    await btnNuevaOferta.waitFor({ state: 'visible', timeout: 10000 });
    await btnNuevaOferta.click();

    // --- 4. COMPLETAR CAMPOS DEL FORMULARIO (Usando formControlName) ---
    await page.locator('[formControlName="titulo"]').fill(tituloOferta);
    await page.locator('[formControlName="modalidad"]').selectOption('Híbrido');
    await page.locator('[formControlName="experiencia"]').selectOption('Junior');
    await page.locator('[formControlName="tipoDuracion"]').selectOption('30');
    await page.locator('[formControlName="descripcion"]').fill(
      'Buscamos un Asistente de Ciencia de Datos e IA para integrarse a nuestro departamento de comunicación. Trabajo con modelos de lenguaje, procesamiento masivo de texto y análisis de medios.'
    );
    // --- 5. SELECCIÓN DE CHIPS (Ajustado al HTML real) ---
    const habilidadesRequeridas = [
      'Python',
      'Machine Learning',
      'Deep Learning',
      'Modelos de Lenguaje (LLMs)'
    ];

    for (const habilidad of habilidadesRequeridas) {
      // Ubicar el botón del chip dentro de .chips-container por el nombre exacto
      const chip = page.locator('button.chip-skill', { hasText: habilidad }).first();

      await chip.scrollIntoViewIfNeeded();
      await chip.click();

      // Verificar que Angular aplicó [class.seleccionada]
      await expect(chip).toHaveClass(/seleccionada/);
    }

    // --- 6. PUBLICAR Y ESPERAR CONFIRMACIÓN DEL BACKEND ---
    const btnPublicar = page.getByRole('button', { name: 'Publicar Oferta' });
    await expect(btnPublicar).toBeEnabled();

    // Escuchar el evento de alerta antes de presionar el botón de envío
    const [dialog] = await Promise.all([
      page.waitForEvent('dialog'),
      btnPublicar.click()
    ]);

    expect(dialog.message()).toMatch(/publicada|éxito|guardada/i);
    await dialog.accept();

    await page.waitForLoadState('networkidle');

    // --- 7. VERIFICACIÓN EN LA LISTA Y PANEL DE DETALLE ---
    await page.locator('#searchQuery').fill(tituloOferta);

    const tarjetaOferta = page.locator('.card-oferta', { hasText: tituloOferta });
    await expect(tarjetaOferta).toBeVisible();

    await tarjetaOferta.click();

    const panelDetalle = page.locator('.card-detalle-completo');
    await expect(panelDetalle).toBeVisible();
    await expect(panelDetalle.locator('h2')).toHaveText(tituloOferta);

    // --- 8. VERIFICAR PRESENCIA DE HABILIDADES EN EL DETALLE ---
    for (const habilidad of habilidadesRequeridas) {
      await expect(panelDetalle.getByText(habilidad)).toBeVisible();
    }
  });

});