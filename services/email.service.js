const nodemailer = require('nodemailer');
const logger = require('../utilities/logger.util');

const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    logger.warn('Email credentials not configured — emails will not be sent');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

exports.sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();
  if (!transporter) {
    logger.info(`Email not sent (no config): to=${to}, subject=${subject}`);
    return false;
  }

  try {
    await transporter.sendMail({
      from: `"Store" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    logger.info(`Email sent to ${to}: ${subject}`);
    return true;
  } catch (err) {
    logger.error(`Failed to send email to ${to}: ${err.message}`);
    return false;
  }
};

exports.sendBirthdayEmail = async (user) => {
  return await exports.sendEmail({
    to: user.email,
    subject: 'Happy Birthday! 🎂',
    html: `
      <h1>Happy Birthday, ${user.name}!</h1>
      <p>Wishing you a wonderful birthday from our team!</p>
      <p>Thank you for being a valued customer.</p>
    `
  });
};
