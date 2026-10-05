const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

const transporter = nodemailer.createTransport({
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