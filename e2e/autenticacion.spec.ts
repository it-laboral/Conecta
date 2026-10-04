import { test, expect } from '@playwright/test';

test.describe('Módulo de Autenticación - ITBConecta', () => {

  // 1. PRUEBA POSTULANTE 
  test('Login exitoso como Postulante', async ({ page }) => {
    await page.goto('http://localhost:4200/sesion');
    
    // Manejo de alertas del navegador (si tu app usa alert() nativo)
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('¡Bienvenido/a Postulante!');
      await dialog.accept();
    });

    // Completar credenciales de Postulante
    await page.getByPlaceholder('Tu correo' ).fill('alansa@itbeltran.com.ar');
    await page.getByPlaceholder('Tu contraseña' ).fill('Itb2026!');

    // Clic en el botón para enviar el formulario
    await page.getByRole('button', { name: /Iniciar Sesión/i }).click();

    /// ASERCIÓN EXACTA: Comprobar que llegó a la pantalla de perfil del postulante
    await expect(page).toHaveURL('http://localhost:4200/perfil');

    // Cerrar sesión
    await page.getByRole('banner').getByRole('button', { name: 'Cerrar sesión' }).click();

    // Validar que volvió a la página inicial o de login
    await expect(page).toHaveURL('http://localhost:4200/sesion');

  });

  // 2. PRUEBA EMPRESA (Repetís la estructura con las credenciales de empresa)
  test('Login exitoso como Empresa', async ({ page }) => {
    await page.goto('http://localhost:4200/sesion');

    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('¡Bienvenida Empresa!');
      await dialog.accept();
    });

    await page.getByPlaceholder('Tu correo' ).fill('info@tecnosolution.com.ar');
    await page.getByPlaceholder('Tu contraseña' ).fill('Itb2026!');
    await page.getByRole('button', { name: /Ingresar|Iniciar Sesión/i }).click();

    // 2. Navegar a la pantalla del perfil de la empresa
    await page.goto('http://localhost:4200/perfil-empresa');
    
    // Esperar a que finalice el estado de carga
    await expect(page.locator('.loading')).not.toBeVisible();
  
    // Cerrar sesión
    await page.getByRole('banner').getByRole('button', { name: 'Cerrar sesión' }).click();

    // Validar que volvió a la página inicial o de login
    await expect(page).toHaveURL('http://localhost:4200/sesion');
  });

});