// nodemailer es la librería que permite conectarse a un servidor SMTP y enviar emails reales
import nodemailer from 'nodemailer';

// crea la conexión al servidor de correo usando las variables de entorno
// se llama cada vez que se necesita enviar un email
const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.MAIL_HOST,       // servidor SMTP (ej: smtp.mailtrap.io)
    port: Number(process.env.MAIL_PORT), // puerto SMTP (ej: 587)
    auth: {
      user: process.env.MAIL_USER,     // usuario del servidor de correo
      pass: process.env.MAIL_PASS,     // contraseña del servidor de correo
    },
  });

// envía el email de verificación al usuario recién registrado
// recibe su email y el código de 6 dígitos generado en el controlador
export const sendVerificationEmail = async (email, code) => {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"BildyApp" <${process.env.MAIL_USER}>`, // quien envía el email
    to: email,                                       // quien lo recibe
    subject: 'Verifica tu cuenta',
    text: `Tu código de verificación es: ${code}`,  // versión texto plano
    html: `<p>Tu código de verificación es: <strong>${code}</strong></p>`, // versión HTML
  });
};
