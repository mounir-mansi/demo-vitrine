const { Resend } = require("resend");

const sendEmail = async ({ to, subject, text, html, headers = {} }) => {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html,
      headers,
    });

    if (error) {
      console.error("Resend error:", error);
      return false;
    }

    console.info("Email envoyé à :", to);
    return true;
  } catch (err) {
    console.error("Erreur envoi email :", err);
    return false;
  }
};

module.exports = { sendEmail };
