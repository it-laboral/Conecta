const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const db = require('../db'); // Conexión a MySQL

const transporter = process.env.DISABLE_EMAIL === 'true'
  ? {
      sendMail: async (opts) => {
        console.log('--- [MOCK EMAIL ENVIADO] ---');
        console.log('Para:', opts.to);
        console.log('Asunto:', opts.subject);
        console.log('Contenido / Link:', opts.html);
        return { messageId: 'test-mock-id' };
      }
    }
  : nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
const SALT_ROUNDS = 10;

// ==========================================
// 1. SOLICITAR RECUPERO DE CONTRASEÑA
// ==========================================
router.post('/solicitar-recupero', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'El e-mail es obligatorio.' });
  }

  try {
    let tabla = null;
    let usuario = null;
    let idColumna = null;

    // 1. Buscar en ADMINISTRADOR
    const [administradores] = await db.query('SELECT * FROM administrador WHERE email = ?', [email]);
    if (administradores.length > 0) {
      tabla = 'administrador';
      usuario = administradores[0];
      idColumna = 'id';
    } else {
      // 2. Buscar en POSTULANTE
      const [postulantes] = await db.query('SELECT * FROM postulante WHERE email = ?', [email]);
      if (postulantes.length > 0) {
        tabla = 'postulante';
        usuario = postulantes[0];
        idColumna = 'id_postulante';
      } else {
        // 3. Buscar en EMPRESA
        const [empresas] = await db.query('SELECT * FROM empresa WHERE email = ?', [email]);
        if (empresas.length > 0) {
          tabla = 'empresa';
          usuario = empresas[0];
          idColumna = 'id_empresa';
        }
      }
    }

    // Respuesta genérica por seguridad si el e-mail no existe
    if (!usuario) {
      return res.json({ 
        success: true, 
        message: 'Si el e-mail está registrado en el sistema, recibirás un enlace de recuperación a la brevedad.' 
      });
    }

    // Generar token criptográfico único y tiempo de expiración (15 minutos)
    const token = crypto.randomBytes(32).toString('hex');
    const expira = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos a partir de ahora

    // Guardar token y expiración en la tabla correspondiente
    await db.query(
      `UPDATE ${tabla} SET reset_token = ?, reset_token_expira = ? WHERE ${idColumna} = ?`,
      [token, expira, usuario[idColumna]]
    );

    // Enlace para el frontend Angular
    const linkRecupero = `http://localhost:4200/restablecer-password?token=${token}`;

    // Enviar correo (usa EMAIL_USER del .env para prevenir rechazos del servidor SMTP)
    const remitente = process.env.EMAIL_USER ? `"ITB Conecta" <${process.env.EMAIL_USER}>` : '"ITB Conecta" <itbconecta@gmail.com>';

    await transporter.sendMail({
      from: remitente,
      to: usuario.email,
      subject: 'Recuperación de contraseña — ITB Conecta',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #0f172a; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #2d4c7e;">Restablecimiento de Contraseña</h2>
          <p>Hola,</p>
          <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>ITB Conecta</strong>.</p>
          <p>Hacé clic en el siguiente botón para ingresar una nueva clave (el enlace expira en 15 minutos):</p>
          <div style="margin: 25px 0;">
            <a href="${linkRecupero}" 
               style="background-color: #2d4c7e; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
               Restablecer Contraseña
            </a>
          </div>
          <p style="font-size: 0.85rem; color: #64748b;">Si no solicitaste este cambio, podés ignorar este mensaje.</p>
        </div>
      `
    });

    return res.json({ 
      success: true, 
      message: 'Si el e-mail está registrado en el sistema, recibirás un enlace de recuperación a la brevedad.' 
    });

  } catch (error) {
    console.error('Error al solicitar recupero:', error);
    return res.status(500).json({ success: false, message: 'Error interno en el servidor.' });
  }
});


// ==========================================
// 2. RESTABLECER CONTRASEÑA CON TOKEN (VALIDACIÓN SEGURA EN NODE)
// ==========================================
router.post('/restablecer-password', async (req, res) => {
  const { token, nuevaPassword } = req.body;

  if (!token || !nuevaPassword) {
    return res.status(400).json({ success: false, message: 'El token y la nueva contraseña son obligatorios.' });
  }

  // 🔒 REGEX: Mínimo 8 caracteres, al menos 1 mayúscula, 1 número y 1 carácter especial
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

  if (!passwordRegex.test(nuevaPassword)) {
    return res.status(400).json({
      success: false,
      message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial.'
    });
  }

  try {
    const tablas = [
      { nombre: 'administrador', idCol: 'id' },
      { nombre: 'postulante', idCol: 'id_postulante' },
      { nombre: 'empresa', idCol: 'id_empresa' }
    ];

    let tablaEncontrada = null;
    let usuarioEncontrado = null;

    // Buscar el token exacto en cada tabla y comparar el tiempo en Node.js
    for (const t of tablas) {
      const [rows] = await db.query(
        `SELECT * FROM ${t.nombre} WHERE reset_token = ?`,
        [token]
      );

      if (rows.length > 0) {
        const user = rows[0];
        const fechaExpira = new Date(user.reset_token_expira).getTime();
        const ahora = Date.now();

        // Validamos si la fecha de expiración aún es posterior al momento actual
        if (fechaExpira > ahora) {
          tablaEncontrada = t;
          usuarioEncontrado = user;
          break; // Token válido encontrado
        }
      }
    }

    if (!usuarioEncontrado) {
      return res.status(400).json({ 
        success: false, 
        message: 'El enlace de recuperación es inválido o ha expirado.' 
      });
    }

    // Encriptar la nueva clave
    const passwordHash = await bcrypt.hash(nuevaPassword, SALT_ROUNDS);

    // Actualizar la contraseña y limpiar el token para inutilizarlo tras el primer uso
    await db.query(
      `UPDATE ${tablaEncontrada.nombre} SET password = ?, reset_token = NULL, reset_token_expira = NULL WHERE ${tablaEncontrada.idCol} = ?`,
      [passwordHash, usuarioEncontrado[tablaEncontrada.idCol]]
    );

    return res.json({ 
      success: true, 
      message: 'Contraseña actualizada con éxito. Ya podés iniciar sesión con tu nueva clave.' 
    });

  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    return res.status(500).json({ success: false, message: 'Error interno en el servidor.' });
  }
});

module.exports = router;