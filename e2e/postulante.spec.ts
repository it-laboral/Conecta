import { test, expect } from '@playwright/test';

test.describe('Módulo de Perfil y Curriculum de Postulante - ITBConecta', () => {

  test('Debería completar el perfil de postulante y la carga completa del CV', async ({ page }) => {

    // --- 1. INICIO DE SESIÓN ---
    await page.goto('http://localhost:4200/sesion');

    page.once('dialog', async dialog => {
      await dialog.accept();
    });

    await page.getByRole('textbox', { name: 'Tu correo' }).fill('soledadmar@itbeltran.com.ar');
    await page.getByRole('textbox', { name: 'Tu contraseña' }).fill('Itb2026!');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

    // Navegar a Mi Perfil
    await page.getByRole('link', { name: '📄 Mi Perfil' }).click();
    await expect(page).toHaveURL('http://localhost:4200/perfil/postulante');

    // --- 2. PERFIL: SUBIR FOTO DE PERFIL Y UBICACIÓN ---
    page.getByRole('button', { name: /📷|Cambiar foto/i }).click();
    await page.locator('input[type="file"]').first().setInputFiles('e2e/assets/Marconi.png'),{ force: true };

    await page.getByRole('button', { name: '✏️ Editar Ubicación' }).click();
    await page.getByRole('textbox', { name: 'Ciudad' }).fill('Lomas de Zamora');
    await page.getByRole('textbox', { name: 'País' }).fill('Argentina');
    await page.getByRole('button', { name: '💾 Guardar ubicación' }).click();
   
// --- 3. PERFIL: DESCRIPCIÓN Y SOBRE MÍ ---
    await page.getByRole('button', { name: '✏️', description: 'Editar descripción' }).click();
    await page.getByRole('textbox', { name: 'Sobre mí' }).fill('Experiencia en análisis estadístico, machine learning y visualización de datos.');
    await page.getByRole('textbox', { name: 'Especialidad / Interés' }).fill('Me apasiona descubrir patrones en grandes volúmenes de información y transformar datos en decisiones estratégicas.');
    await page.getByLabel('Estado académico').selectOption('Graduado');
    await page.getByRole('button', { name: '💾 Guardar perfil', exact: true }).click();
    // --- 4. PERFIL: SELECCIONAR HABILIDADES ---
    await page.getByRole('button', { name: '✏️', description: 'Seleccionar habilidades' }).click();
    await page.getByRole('checkbox', { name: 'Python' }).check();
    await page.getByRole('checkbox', { name: 'Machine Learning' }).check();
    await page.getByRole('checkbox', { name: 'Ciencia de Datos' }).check();
    await page.getByRole('checkbox', { name: 'Prompt Engineering' }).check();
    await page.getByRole('checkbox', { name: 'Power BI' }).check();
    await page.getByRole('checkbox', { name: 'Modelos de Lenguaje (LLMs)' }).check();
    await page.getByRole('textbox', { name: 'Otras herramientas y' }).fill('Manejo de Big Data y librerías como Pandas y NumPy');
    await page.getByRole('button', { name: '💾 Guardar habilidades' }).click();
    // --- 5. PERFIL: ENLACES Y REDES ---
    await page.getByRole('button', { name: '✏️', description: 'Editar enlaces' }).click();
    await page.getByRole('textbox', { name: '📁 GitHub' }).fill('https://github.com/SoledadMar');
    await page.getByRole('textbox', { name: '💼 LinkedIn' }).fill('https://linkedin.com/in/Marconi-Soledad');
    await page.getByRole('textbox', { name: '🌐 Web / Portafolio' }).fill('https://github.com/SoledadMar');
    await page.getByRole('button', { name: '💾 Guardar enlaces' }).click();
    
    // --- 6. NAVEGAR AL COMPONENTE CURRICULUM ---
    await page.getByRole('button', { name: '🚀 Cargar / Ir a Curriculum' }).click();

    // Subir foto en la sección de CV
   await page.getByRole('button', { name: 'Subir foto' }).click();
    await page.locator('input[type="file"]').first().setInputFiles('e2e/assets/Marconi.png'), { force: true };

    // --- 7. CV: DATOS PERSONALES ---
    await page.getByRole('textbox', { name: 'Nombre' }).fill('Soledad');
    await page.getByRole('textbox', { name: 'Apellido' }).fill('Marconi');
    await page.getByRole('textbox', { name: 'sofia@email.com' }).fill('soledadmar@itbeltran.com.ar');
    await page.getByRole('textbox', { name: 'Ciudad' }).fill('Adrogué');
    await page.getByRole('textbox', { name: 'linkedin.com/in/usuario' }).fill('linkedin.com/in/Marconi-Soledad');
    await page.getByRole('textbox', { name: 'www.miportfolio.com' }).fill('https://github.com/SoledadMar');
    await page.getByRole('textbox', { name: 'Contanos brevemente sobre vos' }).fill('Tengo experiencia en análisis estadístico, machine learning y visualización de datos. Me apasiona descubrir patrones en grandes volúmenes de información.');

    // --- 8. CV: FORMACIÓN ACADÉMICA ---
    await page.getByRole('button', { name: '+ Agregar formación' }).click();
    await page.getByRole('textbox', { name: 'Ej: Analista de Sistemas' }).fill('Ciencia de Datos e IA');
    await page.getByRole('textbox', { name: 'Ej: Instituto Beltrán' }).fill('Instituto Beltrán - Avellaneda');
    await page.getByRole('textbox', { name: 'Ej: 2024' }).fill('2024');
    await page.getByRole('textbox', { name: 'Ej: 2026' }).fill('2026');
    await page.getByRole('button', { name: '💾 Guardar formación' }).click();

    // --- 9. CV: EXPERIENCIA LABORAL ---
    // Experiencia 1
    await page.getByRole('button', { name: '+ Agregar experiencia' }).click();
    await page.getByRole('textbox', { name: 'Ej: Desarrollador Web' }).fill('Analista de Datos');
    await page.getByRole('textbox', { name: 'Ej: Empresa S.A.' }).fill('TechSolutions S.A.');
    await page.getByRole('textbox', { name: 'Ej: 2024' }).fill('2025');
    await page.getByRole('textbox', { name: 'Ej: Actualidad' }).fill('Actualidad');
    await page.getByRole('textbox', { name: 'Describí tus principales' }).fill('Mantenimiento de pipelines de datos y generación de dashboards.');
    await page.getByRole('button', { name: '💾 Guardar experiencia' }).click();

    // Experiencia 2
    await page.getByRole('button', { name: '+ Agregar experiencia' }).click();
    await page.getByRole('textbox', { name: 'Ej: Desarrollador Web' }).fill('Data Analyst Junior');
    await page.getByRole('textbox', { name: 'Ej: Empresa S.A.' }).fill('Consultora DataVision');
    await page.getByRole('textbox', { name: 'Ej: 2024' }).fill('2024');
    await page.getByRole('textbox', { name: 'Ej: Actualidad' }).fill('2025');
    await page.getByRole('textbox', { name: 'Describí tus principales' }).fill('Análisis exploratorio de datos (EDA) y generación de reportes estadísticos.');
    await page.getByRole('button', { name: '💾 Guardar experiencia' }).click();

    // --- 10. CV: IDIOMAS ---
    // Idioma 1
    await page.getByRole('button', { name: '+ Agregar idioma' }).click();
    await page.getByRole('textbox', { name: 'Ej: Inglés' }).fill('Inglés');
    await page.getByRole('textbox', { name: 'Ej: Intermedio' }).fill('Avanzado');
    await page.getByRole('button', { name: '💾 Guardar idioma' }).click();

    // Idioma 2
    await page.getByRole('button', { name: '+ Agregar idioma' }).click();
    await page.getByRole('textbox', { name: 'Ej: Inglés' }).fill('Portugués');
    await page.getByRole('textbox', { name: 'Ej: Intermedio' }).fill('Intermedio');
    await page.getByRole('button', { name: '💾 Guardar idioma' }).click();

    // --- 11. CV: CURSOS Y CAPACITACIONES ---
    // Curso 1
    await page.getByRole('button', { name: '+ Agregar curso' }).click();
    await page.getByRole('textbox', { name: 'Ej: Angular Avanzado' }).fill('Data Science & Machine Learning');
    await page.getByRole('textbox', { name: 'Ej: Platzi' }).fill('Acámica');
    await page.getByRole('textbox', { name: 'Ej: 2026' }).fill('2024');
    await page.getByRole('textbox', { name: 'Ej: Desarrollo de SPAs con' }).fill('Desarrollo de modelos de machine learning y análisis de datos.');
    await page.getByRole('button', { name: '💾 Guardar curso' }).click();

    // Curso 2
    await page.getByRole('button', { name: '+ Agregar curso' }).click();
    await page.getByRole('textbox', { name: 'Ej: Angular Avanzado' }).fill('Big Data con Apache Spark');
    await page.getByRole('textbox', { name: 'Ej: Platzi' }).fill('Coursera');
    await page.getByRole('textbox', { name: 'Ej: 2026' }).fill('2025');
    await page.getByRole('textbox', { name: 'Ej: Desarrollo de SPAs con' }).fill('Datos masivos y procesamiento distribuido con Apache Spark.');
    await page.getByRole('button', { name: '💾 Guardar curso' }).click();

    // --- 12. CV: PROYECTOS ---
    // Proyecto 1
    await page.getByRole('button', { name: '+ Agregar proyecto' }).click();
    await page.getByRole('textbox', { name: 'Ej: ITB Conecta' }).fill('Modelo de predicción de ventas');
    await page.getByRole('textbox', { name: 'Ej: Angular, TypeScript, Node' }).fill('Machine Learning, Python, Pandas, Scikit-learn');
    await page.getByRole('textbox', { name: 'https://github.com/usuario/' }).fill('https://github.com/SoledadMar/proyecto-ventas');
    await page.getByRole('textbox', { name: 'Contá brevemente de qué trata' }).fill('Predicción de ventas para empresa retail utilizando modelos de machine learning.');
    await page.getByRole('button', { name: '💾 Guardar proyecto' }).click();

    // Proyecto 2
    await page.getByRole('button', { name: '+ Agregar proyecto' }).click();
    await page.getByRole('textbox', { name: 'Ej: ITB Conecta' }).fill('Análisis de churn de clientes');
    await page.getByRole('textbox', { name: 'Ej: Angular, TypeScript, Node' }).fill('Python, Pandas, Scikit-learn');
    await page.getByRole('textbox', { name: 'https://github.com/usuario/' }).fill('https://github.com/SoledadMar/Analisis-churn-clientes');
    await page.getByRole('textbox', { name: 'Contá brevemente de qué trata' }).fill('Análisis de churn de clientes para identificar patrones de abandono y mejorar la retención.');
    await page.getByRole('button', { name: '💾 Guardar proyecto' }).click();

    // --- 13. VISTA PREVIA Y GUARDADO FINAL DEL CV ---
    await page.getByRole('button', { name: '👁️ Vista previa' }).click();
    await page.getByRole('button', { name: '✕ Cerrar' }).click();

    // 1. Scroll hacia el botón de guardar CV
    const btnGuardarCV = page.getByRole('button', { name: '💾 Guardar CV' });
    await btnGuardarCV.scrollIntoViewIfNeeded();

    // 2. Esperar alerta nativa Y procesar el clic en simultáneo
    const [dialogCV] = await Promise.all([
      page.waitForEvent('dialog'),
      btnGuardarCV.click()
    ]);

    // 3. Confirmar la alerta del CV
    expect(dialogCV.message()).toMatch(/guardado|éxito/i);
    await dialogCV.accept();

    // 4. Esperar la confirmación de la API en el servidor
    await page.waitForLoadState('networkidle');

    // --- 14. GUARDADO FINAL DE PERFIL DEFINITIVO (SI EXISTE EN PANTALLA) ---
    const btnPerfilDefinitivo = page.getByRole('button', { name: /Guardar Perfil Definitivo|Guardar todo/i });

    if (await btnPerfilDefinitivo.isVisible()) {
      await btnPerfilDefinitivo.scrollIntoViewIfNeeded();

      // Si este botón también dispara una alerta, la capturamos limpiamente
      const [dialogPerfil] = await Promise.all([
        page.waitForEvent('dialog').catch(() => null), // catch por si guarda sin alerta
        btnPerfilDefinitivo.click()
      ]);

      if (dialogPerfil) {
        await dialogPerfil.accept();
      }

      await page.waitForLoadState('networkidle');
    }

  }); // Fin del test

}); // Fin del describe