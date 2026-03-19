const express = require("express");
const router = express.Router();

const { getAdminByEmail } = require("../controllers/AuthController");
const { sendContactForm, getContactMessages, replyToMessage, markMessageRead, deleteMessage } = require("../controllers/ContactController");
const { getInstagramFeed, refreshInstagramToken } = require("../controllers/InstagramController");
const { listGallery, deleteGalleryPhoto } = require("../controllers/GalleryController");
const { getSections } = require("../controllers/SectionsController");
const {
  hashPassword,
  verifyPassword,
  verifyToken,
  blacklistToken,
} = require("../middleware/auth");
const { upload, uploadFixed } = require("../middleware/handleUpload");

// ── Auth ──────────────────────────────────────────────
router.post("/login", getAdminByEmail, verifyPassword);
router.get("/logout", blacklistToken);

// ── Contact ───────────────────────────────────────────
router.post("/contact", sendContactForm);
router.get("/admin/messages", verifyToken, getContactMessages);
router.post("/admin/messages/:id/reply", verifyToken, replyToMessage);
router.patch("/admin/messages/:id/read", verifyToken, markMessageRead);
router.delete("/admin/messages/:id", verifyToken, deleteMessage);

// ── Instagram ─────────────────────────────────────────
router.get("/api/instagram", getInstagramFeed);
router.get("/api/instagram/refresh", verifyToken, refreshInstagramToken);

// ── Galerie ───────────────────────────────────────────
router.get("/api/gallery", listGallery);
router.post("/admin/gallery/upload", verifyToken, (req, res, next) => upload("gallery").single("image")(req, res, next), (req, res) => {
  res.json({ url: `${process.env.S3_PUBLIC_URL}/${req.file.key}`, key: req.file.key });
});
router.post("/admin/gallery/main", verifyToken, (req, res, next) => uploadFixed("gallery/main").single("image")(req, res, next), (req, res) => {
  res.json({ url: `${process.env.S3_PUBLIC_URL}/gallery/main`, key: "gallery/main" });
});
router.delete("/admin/gallery", verifyToken, deleteGalleryPhoto);

// ── Sections (hero, about, events) ────────────────────
const VALID_SLOTS = ["hero", "about", "events"];
router.get("/api/sections", getSections);
router.post("/admin/sections/:slot", verifyToken, (req, res, next) => {
  const { slot } = req.params;
  if (!VALID_SLOTS.includes(slot)) return res.status(400).json({ error: "Slot invalide" });
  uploadFixed(`sections/${slot}`).single("image")(req, res, next);
}, (req, res) => {
  res.json({ url: `${process.env.S3_PUBLIC_URL}/sections/${req.params.slot}`, key: req.file.key });
});

// ── Admin (routes protégées) ──────────────────────────
router.get("/admin/me", verifyToken, (req, res) => {
  res.json({ adminId: req.adminId });
});

module.exports = router;
