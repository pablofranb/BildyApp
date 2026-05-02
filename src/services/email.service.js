import nodemailer from 'nodemailer';

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

export const sendVerificationEmail = async (email, code) => {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"BildyApp" <${process.env.MAIL_USER}>`,
    to: email,
    subject: 'Verifica tu cuenta',
    text: `Tu código de verificación es: ${code}`,
    html: `<p>Tu código de verificación es: <strong>${code}</strong></p>`,
  });
};
