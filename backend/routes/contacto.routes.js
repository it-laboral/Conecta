const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// 🔒 Si DISABLE_EMAIL=true, creamos un transporte simulado que no toca la red
const transporter = process.env.DISABLE_EMAIL === 'true'
  ? { sendMail: async () => ({ messageId: 'test-mock-id' }) }
  : nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

router.post('/', async (req, res) => {
  const { nombre, email, mensaje } = req.body;

  if (!nombre || !email || !mensaje) {
    return res.status(400).json({ error: 'Completá todos los campos.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'El email no es válido.' });
  }
  if (mensaje.length > 2000) {
    return res.status(400).json({ error: 'El mensaje es demasiado largo.' });
  }

  try {
    // Si DISABLE_EMAIL=true, esto resuelve al instante sin llamar a Gmail
    await transporter.sendMail({
      from: `"ITB Conecta" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `Nueva consulta de ${nombre}`,
      text: `Nombre: ${nombre}\nEmail: ${email}\n\nMensaje:\n${mensaje}`
    });
    
    res.json({ ok: true });
  } catch (err) {
    console.error('Error enviando mail:', err);
    res.status(500).json({ error: 'No se pudo enviar el mensaje.' });
  }
});

module.exports = router;