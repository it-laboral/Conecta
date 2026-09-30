# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: conecta-roles.spec.ts >> Pruebas de Intermediación Laboral - ITB Conecta >> Flujo Empresa: Login y verificación de acceso
- Location: e2e\conecta-roles.spec.ts:66:7

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/(ofertas|empresa)/
Received string:  "http://localhost:4200/"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    5 × locator resolved to <html lang="es">…</html>
      - unexpected value "http://localhost:4200/sesion"
    7 × locator resolved to <html lang="es">…</html>
      - unexpected value "http://localhost:4200/"

```

```yaml
- banner:
  - navigation:
    - link "Logo ITB":
      - /url: /principal
      - img "Logo ITB"
    - link "Inicio":
      - /url: /principal
    - link "Oportunidades":
      - /url: /ofertas
    - link "Ir al Perfil":
      - /url: /perfil
    - text: Cerrar sesión
- main:
  - text: Plataforma de Intermediación Laboral
  - heading "¡Bienvenidos a ITB Conecta!" [level=2]
  - heading "Uniendo talento y oportunidades en el ITB" [level=2]
  - paragraph:
    - text: El puente digital exclusivo que conecta a estudiantes y graduados de
    - strong: Análisis de Sistemas
    - text: e
    - strong: Inteligencia Artificial
    - text: con los proyectos más innovadores de empresas tecnológicas y de comunicación.
  - button "Buscar en las Ofertas Laborales"
  - img "ITB Conecta"
  - text: Conexión Exitosa 45+ Ofertas Publicadas 20+ Empresas Registradas 150+ Postulantes Activos 30+ Postulaciones Exitosas
  - heading "¿Cómo funciona?" [level=2]
  - paragraph: Empezá a conectar con oportunidades en 3 simples pasos.
  - text: "1"
  - heading "Creá tu perfil" [level=3]
  - paragraph: Cargá tus habilidades, estudios y links a tu portfolio en pocos minutos.
  - text: "2"
  - heading "Postulate a ofertas" [level=3]
  - paragraph: Explorá oportunidades filtradas por tecnología, empresa o modalidad.
  - text: "3"
  - heading "Conectá con empresas" [level=3]
  - paragraph: Las empresas revisan tu perfil y te contactan directamente.
  - heading "Oportunidades destacadas" [level=2]
  - paragraph: Algunas de las últimas ofertas publicadas por empresas del ecosistema.
  - heading "Desarrollador/a Frontend Angular Jr." [level=3]
  - text: TechMind Solutions Angular TypeScript CSS
  - button "Ver detalle"
  - heading "Analista de Sistemas — Soporte y Desarrollo" [level=3]
  - text: NovaSoft .NET SQL Server
  - button "Ver detalle"
  - button "Ver todas las ofertas"
  - heading "¿Por qué registrarte en ITB Conecta?" [level=2]
  - paragraph: Diseñado específicamente para las demandas del ecosistema tech actual.
  - heading "Perfil Especializado" [level=3]
  - paragraph: Mostrá tus proyectos, tus tecnologías preferidas y el estado de tu carrera. Acá las empresas buscan talento técnico específico, no perfiles genéricos.
  - heading "Oportunidades Reales" [level=3]
  - paragraph: Accedé a pasantías, modalidades híbridas o remotas y posiciones pensadas para tu crecimiento profesional en empresas de software y comunicación.
  - heading "Impulsado por IA" [level=3]
  - paragraph: Un entorno moderno optimizado para que los algoritmos de búsqueda unan la necesidad de la empresa con tus habilidades de forma inteligente y transparente.
  - text: Para empresas
  - heading "¿Buscás talento técnico para tu equipo?" [level=2]
  - paragraph: Publicá tus oportunidades y accedé a estudiantes y graduados de Análisis de Sistemas e IA del ITB, listos para sumarse a tus proyectos.
  - button "Publicar una oferta"
  - heading "Preguntas Frecuentes" [level=2]
  - paragraph: Todo lo que necesitás saber sobre ITB Conecta
  - button "¿Cómo me registro en la plataforma?"
  - button "¿Tiene algún costo el uso del sistema?"
  - button "Soy una empresa, ¿cómo puedo publicar ofertas?"
- contentinfo:
  - heading "© 2026 Nuestro Sistema de Intermediación Laboral. Todos los derechos reservados." [level=4]
  - paragraph:
    - text: "Contacto:"
    - link "info@nuestrosistema.com":
      - /url: mailto:info@nuestrosistema.com
```

```
Tearing down "context" exceeded the test timeout of 30000ms.
```