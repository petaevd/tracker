import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.mail.ru',
  port: 465,
  secure: true, // true для порта 465
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false // Только для разработки!
  }
});

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const mailOptions = {
      from: `"TasksApp" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, '')
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('Mail sending error:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};