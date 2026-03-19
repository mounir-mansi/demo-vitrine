import { useState, useEffect } from "react";
import { hostname } from "../../HostnameConnect/Hostname";
import "./LandingPage.css";

// Galerie statique — fallback si Instagram non configuré
const GALLERY_FALLBACK = [
  { src: "/gallery/photo-1.jpg", alt: "Il Locale — atmosfera" },
  { src: "/gallery/photo-2.jpg", alt: "Il Locale — cocktail" },
  { src: "/gallery/photo-3.jpg", alt: "Il Locale — aperitivo" },
  { src: "/gallery/photo-4.jpg", alt: "Il Locale — serata" },
  { src: "/gallery/photo-5.jpg", alt: "Il Locale — dettaglio" },
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
        <img src={sections.hero || "/hero.jpg"} alt="Il Locale" className="hero-bg" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="hero-label">Bar &bull; Aperitivi &bull; Milano</p>
          <h1 className="hero-title">Il Locale</h1>
          <p className="hero-text">
            Un angolo di Milano dove il tempo si ferma.
            Aperitivi artigianali, cocktail d&apos;autore e un&apos;atmosfera
            che fa sentire a casa.
          </p>
          <div className="hero-actions">
            <a className="hero-button" href="#contact">Prenota</a>
            <a className="hero-button-outline" href="#menu">Scopri il menu</a>
          </div>
        </div>
      </section>

      {/* ── BANDE INFO ────────────────────────────────── */}
      <div className="info-band">
        <span><i className="fas fa-map-marker-alt" /> Via Brera 14, Milano</span>
        <span><i className="fas fa-clock" /> Mar&ndash;Dom&nbsp;: 17h &ndash; 01h</span>
        <a href="tel:+390223456789" className="info-tel"><i className="fas fa-phone" /> +39&nbsp;02&nbsp;2345&nbsp;6789</a>
      </div>

      {/* ── À PROPOS ──────────────────────────────────── */}
      <section id="about" className="about">
        <div className="about-wrapper">
          <div className="about-text">
            <h2 className="section-title">Chi siamo</h2>
            <p className="about-body">
              Aperto nel 2019 nel cuore di Brera, Il Locale è nato dall&apos;idea di
              creare un luogo dove la qualità degli ingredienti incontra il
              piacere della convivialità.
            </p>
            <p className="about-body">
              I nostri bartender selezionano ogni settimana distillati artigianali
              e frutta di stagione per comporre cocktail unici e aperitivi
              che cambiano con il ritmo delle stagioni.
            </p>
            <p className="about-body">
              Che tu voglia un Negroni classico al tramonto o un cocktail
              sperimentale in serata, Il Locale è il tuo posto.
            </p>
          </div>
          <div className="about-img-wrap">
            <img src={sections.about || "/about.jpg"} alt="Chi siamo" className="about-img" />
          </div>
        </div>
      </section>

      {/* ── MENU ──────────────────────────────────────── */}
      <section id="menu" className="menu">
        <h2 className="section-title">Il Nostro Menu</h2>
        <p className="section-subtitle">
          Tutto artigianale, tutto di stagione
        </p>
        <div className="menu-grid">
          <div className="menu-card">
            <div className="menu-icon"><i className="fas fa-cocktail" /></div>
            <h3>Aperitivi</h3>
            <p>
              Spritz, Negroni Sbagliato, Hugo e le nostre creazioni stagionali.
              Sempre abbinati a un ricco tagliere di stuzzichini.
            </p>
          </div>
          <div className="menu-card">
            <div className="menu-icon"><i className="fas fa-wine-glass-alt" /></div>
            <h3>Cocktail</h3>
            <p>
              Una carta di 30 cocktail curati dal nostro bar manager.
              Classici rivisitati e signature drink esclusivi.
            </p>
          </div>
          <div className="menu-card">
            <div className="menu-icon"><i className="fas fa-leaf" /></div>
            <h3>Analcolici</h3>
            <p>
              Mocktail bilanciati, infusi freddi e centrifughe fresche.
              Zero alcol, zero compromessi sul gusto.
            </p>
          </div>
          <div className="menu-card featured">
            <div className="menu-icon"><i className="fas fa-cheese" /></div>
            <h3>Taglieri</h3>
            <p>
              Salumi DOP, formaggi artigianali e bruschette tostate.
              Il perfetto accompagnamento per ogni drink.
            </p>
            <span className="menu-badge">Specialità della casa</span>
          </div>
        </div>
        <div className="menu-pdf">
          <a href="/menu.pdf" download className="menu-pdf-btn">
            <i className="fas fa-file-pdf" /> Scarica il menu completo (PDF)
          </a>
        </div>
      </section>

      {/* ── GALERIE ───────────────────────────────────── */}
      <section id="gallery" className="gallery">
        <h2 className="section-title">Galleria</h2>
        <p className="section-subtitle">
          {instaPhotos.length > 0
            ? "I nostri ultimi momenti su Instagram"
            : "Scopri l\u2019atmosfera del Locale"}
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
            {showAll ? "Vedi meno" : `Vedi tutte le foto (${photos.length})`}
          </button>
        )}
        {instaPhotos.length > 0 && (
          <a
            href="https://www.instagram.com/illocale.milano"
            target="_blank"
            rel="noreferrer"
            className="insta-link"
          >
            <i className="fab fa-instagram" /> Seguici su Instagram
          </a>
        )}
      </section>

      {/* ── ÉVÉNEMENTS ────────────────────────────────── */}
      <section id="events" className="events" style={{ backgroundImage: `url("${sections.events || "/gallery/events.jpg"}")` }}>
        <div className="events-content">
          <h2 className="section-title light">Eventi</h2>
          <p className="section-subtitle light">
            Serate a tema, live music e degustazioni riservate.
          </p>
          <div className="events-list">
            <div className="event-item">
              <i className="fas fa-music" />
              <div>
                <h4>Live Jazz &mdash; ogni venerd&igrave;</h4>
                <p>Musica dal vivo dalle 21h, ingresso libero</p>
              </div>
            </div>
            <div className="event-item">
              <i className="fas fa-wine-bottle" />
              <div>
                <h4>Degustazione mensile</h4>
                <p>Selezione di gin artigianali con il nostro bartender</p>
              </div>
            </div>
            <div className="event-item">
              <i className="fas fa-calendar-alt" />
              <div>
                <h4>Happy Hour &mdash; 17h&ndash;19h</h4>
                <p>Aperitivo + stuzzichini inclusi, tutti i giorni</p>
              </div>
            </div>
          </div>
          <a
            className="hero-button light-btn"
            href="https://www.instagram.com/illocale.milano"
            target="_blank"
            rel="noreferrer"
          >
            Seguici per i prossimi eventi
          </a>
        </div>
      </section>

      {/* ── CONTACT ───────────────────────────────────── */}
      <section id="contact" className="contact">
        <div className="contact-wrapper">
          <div className="contact-info-block">
            <h2 className="section-title">Contatti</h2>
            <ul className="contact-details">
              <li>
                <i className="fas fa-map-marker-alt" />
                <span>Via Brera 14, 20121 Milano</span>
              </li>
              <li>
                <i className="fas fa-clock" />
                <span>Mar&ndash;Dom&nbsp;: 17h &ndash; 01h &nbsp;|&nbsp; Lun&nbsp;: chiuso</span>
              </li>
              <li>
                <i className="fas fa-phone" />
                <a href="tel:+390223456789" className="contact-link">+39&nbsp;02&nbsp;2345&nbsp;6789</a>
              </li>
              <li>
                <i className="fab fa-instagram" />
                <a
                  href="https://www.instagram.com/illocale.milano"
                  target="_blank"
                  rel="noreferrer"
                  className="contact-link"
                >
                  @illocale.milano
                </a>
              </li>
            </ul>
            <iframe
              title="Localizzazione"
              className="contact-map"
              src="https://www.google.com/maps?q=Via+Brera+14+Milano&output=embed"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>

          <div className="contact-form-block">
            <h3 className="contact-cta-title">Chiamaci</h3>
            <div className="contact-cta">
              <a href="tel:+390223456789" className="res-btn res-btn--primary">
                <i className="fas fa-phone" /> Chiama&nbsp;: +39&nbsp;02&nbsp;2345&nbsp;6789
              </a>
              <a
                href="https://wa.me/390223456789?text=Ciao%2C%20vorrei%20prenotare."
                target="_blank"
                rel="noreferrer"
                className="res-btn res-btn--whatsapp"
              >
                <i className="fab fa-whatsapp" /> WhatsApp
              </a>
            </div>
            <h3>Scrivici</h3>
            <form className="contact-form" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Il tuo nome"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="La tua email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <textarea
                placeholder="Il tuo messaggio (prenotazione, informazioni...)"
                rows={9}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
              />
              <button type="submit" disabled={status === "loading"}>
                {status === "loading" ? "Invio..." : "Invia messaggio"}
              </button>
              {status === "success" && (
                <p className="form-success">Messaggio inviato&nbsp;! Ti risponderemo presto.</p>
              )}
              {status === "error" && (
                <p className="form-error">Errore durante l&apos;invio. Riprova o chiamaci.</p>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────── */}
      <footer className="footer">
        <p className="footer-name">Il Locale</p>
        <p>Via Brera 14, 20121 Milano</p>
        <p>© {new Date().getFullYear()} Il Locale. Tutti i diritti riservati.</p>
      </footer>

    </div>
  );
}
