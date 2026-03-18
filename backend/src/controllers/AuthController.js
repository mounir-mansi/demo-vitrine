const prisma = require("../lib/prisma");

// Récupère l'admin par email pour vérifier le mot de passe
const getAdminByEmail = async (req, res, next) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { email: req.body.email },
    });
    if (!admin) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }
    req.admin = admin;
    next();
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
  return null;
};

module.exports = { getAdminByEmail };
