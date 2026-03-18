const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

const hashingOptions = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16,
  timeCost: 5,
  parallelism: 1,
};

const hashPassword = async (req, res, next) => {
  if (!req.body.password) return next();
  try {
    req.body.hashedPassword = await argon2.hash(
      req.body.password,
      hashingOptions
    );
    delete req.body.password;
    next();
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
  return null;
};

const verifyPassword = async (req, res) => {
  try {
    if (!req.admin) return res.sendStatus(401);
    const isVerified = await argon2.verify(
      req.admin.password,
      req.body.password
    );
    if (isVerified) {
      const token = jwt.sign(
        { sub: req.admin.id },
        process.env.JWT_SECRET,
        { expiresIn: "8h" }
      );
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 8 * 60 * 60 * 1000,
      });
      res.status(200).json({ message: "Connexion réussie" });
    } else {
      res.status(401).json({ error: "Mot de passe incorrect" });
    }
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
  return null;
};

const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res
        .status(401)
        .json({ error: "Vous n'êtes pas autorisé à accéder à cette ressource" });
    }

    const blacklisted = await prisma.blacklistedToken.findFirst({
      where: { token },
    });
    if (blacklisted) {
      return res.status(401).json({ error: "Session expirée. Reconnectez-vous." });
    }

    await new Promise((resolve, reject) => {
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return reject(new Error("Unauthorized"));
        req.adminId = decoded.sub;
        resolve();
      });
    });

    next();
  } catch (err) {
    return res.sendStatus(401);
  }
  return null;
};

const blacklistToken = async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (token) {
      await prisma.blacklistedToken.create({ data: { token } });
    }
    res.clearCookie("token");
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
  return null;
};

module.exports = { hashPassword, verifyPassword, verifyToken, blacklistToken };
