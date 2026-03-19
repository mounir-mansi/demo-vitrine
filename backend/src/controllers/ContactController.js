const { randomUUID } = require("crypto");
const { sendEmail } = require("../lib/emailSender");
const prisma = require("../lib/prisma");

const sendContactForm = async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Tous les champs sont requis." });
  }

  const html = `
    <h2>Nouveau message de contact</h2>
    <p><strong>Nom :</strong> ${name}</p>
    <p><strong>Email :</strong> ${email}</p>
    <p><strong>Message :</strong></p>
    <p>${message.replace(/\n/g, "<br>")}</p>
  `;

  const msgId = `<${randomUUID()}@site>`;

  // Sauvegarder en base même si l'email échoue
  await prisma.contactMessage.create({ data: { name, email, message, messageId: msgId } });

  // Email best-effort — échec silencieux, le message est déjà en base
  sendEmail({
    to: process.env.EMAIL_CONTACT,
    subject: `Nouveau contact : ${name}`,
    text: `Nom: ${name}\nEmail: ${email}\n\n${message}`,
    html,
    headers: { "Message-ID": msgId },
  });

  return res.status(200).json({ message: "Message envoyé avec succès." });
};

const getContactMessages = async (req, res) => {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });
  return res.json(messages);
};

const replyToMessage = async (req, res) => {
  const id = parseInt(req.params.id);
  const { replyText } = req.body;

  if (!replyText?.trim()) {
    return res.status(400).json({ error: "Réponse vide." });
  }

  const msg = await prisma.contactMessage.findUnique({ where: { id } });
  if (!msg) return res.status(404).json({ error: "Message introuvable." });

  const headers = msg.messageId
    ? { "In-Reply-To": msg.messageId, References: msg.messageId }
    : {};

  const sent = await sendEmail({
    to: msg.email,
    subject: `Re: ${msg.name}`,
    text: replyText,
    html: `<p>${replyText.replace(/\n/g, "<br>")}</p>`,
    headers,
  });

  if (!sent) return res.status(500).json({ error: "Erreur lors de l'envoi." });

  await prisma.contactMessage.update({ where: { id }, data: { replied: true } });

  return res.json({ ok: true });
};

const markMessageRead = async ({ params }, res) => {
  const id = parseInt(params.id);
  try {
    await prisma.contactMessage.update({ where: { id }, data: { read: true } });
    return res.json({ ok: true });
  } catch {
    return res.status(404).json({ error: "Message introuvable." });
  }
};

const deleteMessage = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.contactMessage.delete({ where: { id } });
    return res.json({ ok: true });
  } catch {
    return res.status(404).json({ error: "Message introuvable." });
  }
};

module.exports = { sendContactForm, getContactMessages, replyToMessage, markMessageRead, deleteMessage };
