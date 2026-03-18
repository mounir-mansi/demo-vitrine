const fs = require("node:fs");
const path = require("node:path");

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const app = express();

// Trust proxy — requis pour express-rate-limit derrière Nginx
app.set("trust proxy", 1);

// Helmet — headers HTTP sécurité (CSP géré par Nginx)
app.use(helmet({ contentSecurityPolicy: false }));

app.use(express.json());

// Rate limit sur les routes d'auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 10 : 50,
  message: { error: "Trop de tentatives. Réessaie dans 15 minutes." },
});

// CORS
const allowedOrigins = [
  process.env.CORS_ORIGIN,
  process.env.CORS_ORIGIN_DEV,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        process.env.NODE_ENV !== "production" &&
        /^http:\/\/localhost(:\d+)?$/.test(origin)
      ) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error("CORS: origine non autorisée"));
    },
    credentials: true,
  })
);

app.use(cookieParser());

// Rate limit sur les routes sensibles
app.use("/login", authLimiter);

// Servir le frontend React (dist/) en production
const reactIndexFile = path.join(
  __dirname,
  "..",
  "..",
  "frontend",
  "dist",
  "index.html"
);

if (fs.existsSync(reactIndexFile)) {
  app.use(
    express.static(path.join(__dirname, "..", "..", "frontend", "dist"))
  );
  app.get("*", (req, res, next) => {
    const accept = req.headers.accept || "";
    if (accept.includes("text/html")) {
      return res.sendFile(reactIndexFile);
    }
    next();
  });
}

// Routes API
const router = require("./routers/router");
app.use(router);

module.exports = app;
