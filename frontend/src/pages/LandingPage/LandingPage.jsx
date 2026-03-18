import React, { useState, useEffect } from "react";
import { hostname } from "../../HostnameConnect/Hostname";
import "./LandingPage.css";

// Galerie statique — fallback si Instagram non configuré
const GALLERY_FALLBACK = [
  { src: "/gallery/photo-1.jpg", alt: "Photo 1" },
  { src: "/gallery/photo-2.jpg", alt: "Photo 2" },
  { src: "/gallery/photo-3.jpg", alt: "Photo 3" },
  { src: "/gallery/photo-4.jpg", alt: "Photo 4" },
  { src: "/gallery/photo-5.jpg", alt: "Photo 5" },
];

export default function LandingPage() {
  const [form, setForm]       = useState({ name: "", email: "", message: "" });
  const [status, setStatus]   = useState(null);
  const [lightbox, setLightbox] = useState(null); // null | index
  const [galleryPhotos, setGalleryPhotos] = useState([]); // R2
  const [instaPhotos, setInstaPhotos] = useState([]);
  const [sections, setSections] = useState({});
  const [showAll, setShowAll] = useState(false);
  const GALLERY_MAX = 5;

  // Charge les photos Instagram (priorité 1)
  useEffect(() => {
    fetch(`${hostname}/api/instagram`)
      .then((r) => r.json())
      .then((data) => { if (data.photos?.length) setInstaPhotos(data.photos); })
      .catch(() => {});
  }, []);

  // Charge les photos R2 (priorité 2, fallback si Instagram vide)
  useEffect(() => {
    fetch(`${hostname}/api/gallery`)
      .then((r) => r.json())
      .then((data) => { if (data.photos?.length) setGalleryPhotos(data.photos); })
      .catch(() => {});
  }, []);

  // Charge les photos de section (hero, about, events)
  useEffect(() => {
    fetch(`${hostname}/api/sections`)
      .then((r) => r.json())
      .then((data) => setSections(data))
      .catch(() => {});
  }, []);

  // Priorité : Instagram > R2 > fallback statique
  const photos = instaPhotos.length > 0 ? instaPhotos : (galleryPhotos.length > 0 ? galleryPhotos : GALLERY_FALLBACK);
  const displayedPhotos = photos.slice(0, showAll ? photos.length : GALLERY_MAX);

  // Lightbox — clavier + scroll lock
  useEffect(() => {
    if (lightbox === null) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    const handler = (e) => {
      if (e.key === "Escape")     setLightbox(null);
      if (e.key === "ArrowLeft")  setLightbox((i) => (i - 1 + photos.length) % photos.length);
      if (e.key === "ArrowRight") setLightbox((i) => (i + 1) % photos.length);
    };
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [lightbox, photos.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch(`${hostname}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("success");
        setForm({ name: "", email: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="landing">

      {/* ── LIGHTBOX ───────────────────────────────────── */}
      {lightbox !== null && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <button className="lightbox-close" onClick={() => setLightbox(null)}>&#10005;</button>
          <button
            className="lightbox-prev"
            onClick={(e) => { e.stopPropagation(); setLightbox((i) => (i - 1 + photos.length) % photos.length); }}
          >
            <svg width="12" height="22" viewBox="0 0 12 22" fill="none"><path d="M10 2L2 11L10 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <img
            src={photos[lightbox].src}
            alt={photos[lightbox].alt}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="lightbox-next"
            onClick={(e) => { e.stopPropagation(); setLightbox((i) => (i + 1) % photos.length); }}
          >
            <svg width="12" height="22" viewBox="0 0 12 22" fill="none"><path d="M2 2L10 11L2 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      )}

      {/* ── HERO plein écran ───────────────────────────── */}
      <section id="home" className="hero">
        <img src={sections.hero || "/hero.jpg"} alt="NOM DU SITE" className="hero-bg" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="hero-label">Slogan du site</p>
          <h1 className="hero-title">NOM DU SITE</h1>
          <p className="hero-text">
            Texte de présentation du site. Décrivez ici l&apos;ambiance,
            les spécialités et ce qui rend l&apos;établissement unique.
          </p>
          <div className="hero-actions">
            <a className="hero-button" href="#contact">Réserver</a>
            <a className="hero-button-outline" href="#menu">Voir le menu</a>
          </div>
        </div>
      </section>

      {/* ── BANDE INFO ────────────────────────────────── */}
      <div className="info-band">
        <span><i className="fas fa-map-marker-alt" /> ADRESSE</span>
        <span><i className="fas fa-clock" /> HORAIRES</span>
        <a href="tel:+33XXXXXXXXXX" className="info-tel"><i className="fas fa-phone" /> TÉLÉPHONE</a>
      </div>

      {/* ── À PROPOS ──────────────────────────────────── */}
      <section id="about" className="about">
        <div className="about-wrapper">
          <div className="about-text">
            <h2 className="section-title">À propos</h2>
            <p className="about-body">
              Texte de présentation...
            </p>
            <p className="about-body">
              Texte de présentation...
            </p>
            <p className="about-body">
              Texte de présentation...
            </p>
          </div>
          <div className="about-img-wrap">
            {/* Remplacer /about.jpg par la vraie photo */}
            <img src={sections.about || "/about.jpg"} alt="À propos" className="about-img" />
          </div>
        </div>
      </section>

      {/* ── MENU ──────────────────────────────────────── */}
      <section id="menu" className="menu">
        <h2 className="section-title">Notre Menu</h2>
        <p className="section-subtitle">
          Découvrez notre sélection
        </p>
        <div className="menu-grid">
          <div className="menu-card">
            <div className="menu-icon"><i className="fas fa-coffee" /></div>
            <h3>Catégorie 1</h3>
            <p>
              Description de la catégorie 1. Détaillez les produits proposés.
            </p>
          </div>
          <div className="menu-card">
            <div className="menu-icon"><i className="fas fa-birthday-cake" /></div>
            <h3>Catégorie 2</h3>
            <p>
              Description de la catégorie 2. Détaillez les produits proposés.
            </p>
          </div>
          <div className="menu-card">
            <div className="menu-icon"><i className="fas fa-utensils" /></div>
            <h3>Catégorie 3</h3>
            <p>
              Description de la catégorie 3. Détaillez les produits proposés.
            </p>
          </div>
          <div className="menu-card featured">
            <div className="menu-icon"><i className="fas fa-wine-bottle" /></div>
            <h3>Catégorie 4</h3>
            <p>
              Description de la catégorie 4. Détaillez les produits proposés.
            </p>
            <span className="menu-badge">Spécialité maison</span>
          </div>
        </div>
        {/* Bouton téléchargement menu PDF — placer /menu.pdf dans frontend/public/ */}
        <div className="menu-pdf">
          <a href="/menu.pdf" download className="menu-pdf-btn">
            <i className="fas fa-file-pdf" /> Télécharger le menu complet (PDF)
          </a>
        </div>
      </section>

      {/* ── GALERIE ───────────────────────────────────── */}
      <section id="gallery" className="gallery">
        <h2 className="section-title">Galerie</h2>
        <p className="section-subtitle">
          {instaPhotos.length > 0
            ? "Nos derniers moments sur Instagram"
            : "Découvrez notre établissement en images"}
        </p>
        <div className="gallery-grid">
          {displayedPhotos.map((photo, i) => (
            <div
              key={i}
              className={`gallery-item${i === 0 ? " gallery-item--wide" : ""}`}
              onClick={() => setLightbox(i)}
            >
              <img src={photo.src} alt={photo.alt} />
              <div className="gallery-overlay" />
            </div>
          ))}
        </div>
        {photos.length > GALLERY_MAX && (
          <button className="gallery-more" onClick={() => setShowAll((v) => !v)}>
            {showAll ? "Voir moins" : `Voir toutes les photos (${photos.length})`}
          </button>
        )}
        {instaPhotos.length > 0 && (
          <a
            href="INSTAGRAM_URL"
            target="_blank"
            rel="noreferrer"
            className="insta-link"
          >
            <i className="fab fa-instagram" /> Suivez-nous sur Instagram
          </a>
        )}
      </section>

      {/* ── ÉVÉNEMENTS ────────────────────────────────── */}
      <section id="events" className="events" style={{ backgroundImage: `url("${sections.events || "/gallery/events.jpg"}")` }}>
        <div className="events-content">
          <h2 className="section-title light">Événements</h2>
          <p className="section-subtitle light">
            Découvrez nos prochains événements et animations.
          </p>
          <div className="events-list">
            <div className="event-item">
              <i className="fas fa-music" />
              <div>
                <h4>Événement 1</h4>
                <p>Description de l&apos;événement 1</p>
              </div>
            </div>
            <div className="event-item">
              <i className="fas fa-star" />
              <div>
                <h4>Événement 2</h4>
                <p>Description de l&apos;événement 2</p>
              </div>
            </div>
            <div className="event-item">
              <i className="fas fa-calendar-alt" />
              <div>
                <h4>Événement 3</h4>
                <p>Description de l&apos;événement 3</p>
              </div>
            </div>
          </div>
          <a
            className="hero-button light-btn"
            href="INSTAGRAM_URL"
            target="_blank"
            rel="noreferrer"
          >
            Suivez-nous pour les prochains événements
          </a>
        </div>
      </section>

      {/* ── CONTACT ───────────────────────────────────── */}
      <section id="contact" className="contact">
        <div className="contact-wrapper">
          <div className="contact-info-block">
            <h2 className="section-title">Contact</h2>
            <ul className="contact-details">
              <li>
                <i className="fas fa-map-marker-alt" />
                <span>ADRESSE</span>
              </li>
              <li>
                <i className="fas fa-clock" />
                <span>HORAIRES</span>
              </li>
              <li>
                <i className="fas fa-phone" />
                <a href="tel:+33XXXXXXXXXX" className="contact-link">TÉLÉPHONE</a>
              </li>
              <li>
                <i className="fab fa-instagram" />
                <a
                  href="INSTAGRAM_URL"
                  target="_blank"
                  rel="noreferrer"
                  className="contact-link"
                >
                  @INSTAGRAM_HANDLE
                </a>
              </li>
            </ul>
            {/* Google Maps — remplacer l'adresse dans l'URL */}
            <iframe
              title="Localisation"
              className="contact-map"
              src="https://www.google.com/maps?q=ADRESSE&output=embed"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>

          <div className="contact-form-block">
            <h3 className="contact-cta-title">Appelez-nous</h3>
            <div className="contact-cta">
              <a href="tel:+33XXXXXXXXXX" className="res-btn res-btn--primary">
                <i className="fas fa-phone" /> Appeler&nbsp;: TÉLÉPHONE
              </a>
              <a
                href="https://wa.me/33XXXXXXXXX?text=Bonjour%2C%20je%20voudrais%20réserver."
                target="_blank"
                rel="noreferrer"
                className="res-btn res-btn--whatsapp"
              >
                <i className="fab fa-whatsapp" /> WhatsApp
              </a>
            </div>
            <h3>Écrivez-nous</h3>
            <form className="contact-form" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Votre nom"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Votre email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <textarea
                placeholder="Votre message (réservation, informations...)"
                rows={9}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
              />
              <button type="submit" disabled={status === "loading"}>
                {status === "loading" ? "Envoi..." : "Envoyer le message"}
              </button>
              {status === "success" && (
                <p className="form-success">Message envoyé&nbsp;! Nous vous répondrons rapidement.</p>
              )}
              {status === "error" && (
                <p className="form-error">Erreur lors de l&apos;envoi. Réessayez ou appelez-nous.</p>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────── */}
      <footer className="footer">
        <p className="footer-name">NOM DU SITE</p>
        <p>ADRESSE</p>
        <p>© {new Date().getFullYear()} NOM DU SITE. Tous droits réservés.</p>
      </footer>

    </div>
  );
}
