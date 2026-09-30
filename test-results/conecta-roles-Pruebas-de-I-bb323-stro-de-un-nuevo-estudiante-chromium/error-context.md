# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: conecta-roles.spec.ts >> Pruebas de Intermediación Laboral - ITB Conecta >> Flujo Visitante: Registro de un nuevo estudiante
- Location: e2e\conecta-roles.spec.ts:5:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Tearing down "context" exceeded the test timeout of 30000ms.
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e4]:
    - navigation [ref=e5]:
      - link [ref=e6] [cursor=pointer]:
        - /url: /principal
        - img "Logo ITB" [ref=e7]
      - link "Inicio" [ref=e8] [cursor=pointer]:
        - /url: /principal
      - link "Oportunidades" [ref=e9] [cursor=pointer]:
        - /url: /ofertas
      - link "Registrarse" [ref=e10] [cursor=pointer]:
        - /url: /registrar
      - link "Iniciar sesión" [ref=e11] [cursor=pointer]:
        - /url: /sesion
  - main [ref=e12]:
    - generic [ref=e14]:
      - generic [ref=e16]:
        - heading "Acceso al Sistema" [level=2] [ref=e17]
        - paragraph [ref=e18]: Ingresa con el correo electrónico y contraseña que registraste previamente para acceder al Sistema de Intermediación Laboral.
        - img "ITB Conecta" [ref=e19]
      - generic [ref=e21]:
        - generic [ref=e22]:
          - textbox "Tu correo" [ref=e23]
          - generic [ref=e24]:
            - textbox "Tu contraseña" [ref=e25]
            - generic [ref=e26] [cursor=pointer]
          - button "Iniciar Sesión" [disabled] [ref=e28]
        - generic [ref=e29]:
          - paragraph [ref=e30]: Si aún no tienes una cuenta, puedes registrarte haciendo clic en el siguiente enlace.
          - link "Ir a Registrarse" [ref=e31] [cursor=pointer]:
            - /url: /registrar
  - contentinfo [ref=e33]:
    - heading "© 2026 Nuestro Sistema de Intermediación Laboral. Todos los derechos reservados." [level=4] [ref=e34]
    - paragraph [ref=e35]:
      - text: "Contacto:"
      - link "info@nuestrosistema.com" [ref=e36] [cursor=pointer]:
        - /url: mailto:info@nuestrosistema.com
```