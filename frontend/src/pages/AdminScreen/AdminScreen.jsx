import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/useConnecte";
import { hostname } from "../../HostnameConnect/Hostname";
import "./AdminScreen.css";

export default function AdminScreen() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [replyOpen, setReplyOpen] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  // Galerie
  const [gallery, setGallery] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [galleryError, setGalleryError] = useState(null);

  // Sections (hero, about, events)
  const [sections, setSections] = useState({});
  const [sectionUploading, setSectionUploading] = useState({});
  const [sectionError, setSectionError] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) navigate("/connexion");
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetch(`${hostname}/admin/messages`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setMessages(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetch(`${hostname}/api/sections`)
      .then((r) => r.json())
      .then((data) => setSections(data))
      .catch(() => {});
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetch(`${hostname}/api/gallery`)
      .then((r) => r.json())
      .then((data) => setGallery(data.photos || []));
  }, [isLoggedIn]);

  const uploadSection = async (e, slot) => {
    const file = e.target.files[0];
    if (!file) return;
    setSectionUploading((prev) => ({ ...prev, [slot]: true }));
    setSectionError(null);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const r = await fetch(`${hostname}/admin/sections/${slot}`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!r.ok) throw new Error();
      const { url } = await r.json();
      setSections((prev) => ({ ...prev, [slot]: url }));
    } catch {
      setSectionError("Erreur lors de l'upload.");
    } finally {
      setSectionUploading((prev) => ({ ...prev, [slot]: false }));
      e.target.value = "";
    }
  };

  const uploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setGalleryError(null);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const r = await fetch(`${hostname}/admin/gallery/upload`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!r.ok) throw new Error();
      const { url, key } = await r.json();
      setGallery((prev) => [{ src: url, alt: "Photo", key }, ...prev]);
    } catch {
      setGalleryError("Erreur lors de l'upload.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const deletePhoto = async (key) => {
    if (!window.confirm("Supprimer cette photo ?")) return;
    try {
      const r = await fetch(`${hostname}/admin/gallery`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      if (!r.ok) throw new Error();
      setGallery((prev) => prev.filter((p) => p.key !== key));
    } catch {
      setGalleryError("Erreur lors de la suppression.");
    }
  };

  if (!isLoggedIn) return null;

  const fmt = (iso) =>
    new Date(iso).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const openReply = (e, id) => {
    e.stopPropagation();
    setReplyOpen(id);
    setReplyText("");
  };

  const sendReply = async (e, id) => {
    e.stopPropagation();
    if (!replyText.trim()) return;
    setSending(true);
    try {
      const r = await fetch(`${hostname}/admin/messages/${id}/reply`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replyText }),
      });
      if (!r.ok) throw new Error();
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, replied: true } : m))
      );
      setReplyOpen(null);
    } catch {
      alert("Erreur lors de l'envoi. Réessayez.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="admin-page">
      <h1 className="admin-title">Messages de contact</h1>

      {loading && <p className="admin-empty">Chargement…</p>}

      {!loading && messages.length === 0 && (
        <p className="admin-empty">Aucun message pour l&apos;instant.</p>
      )}

      <ul className="admin-list">
        {messages.map((msg) => (
          <li
            key={msg.id}
            className={`admin-card${expanded === msg.id ? " open" : ""}`}
            onClick={() => {
              setExpanded(expanded === msg.id ? null : msg.id);
              if (replyOpen === msg.id) setReplyOpen(null);
            }}
          >
            <div className="admin-card-header">
              <span className="admin-card-name">{msg.name}</span>
              <span className="admin-card-email">{msg.email}</span>
              {msg.replied && <span className="admin-badge">Répondu</span>}
              <span className="admin-card-date">{fmt(msg.createdAt)}</span>
            </div>

            {expanded === msg.id && (
              <>
                <p className="admin-card-body">{msg.message}</p>

                {replyOpen === msg.id ? (
                  <div className="admin-reply-form" onClick={(e) => e.stopPropagation()}>
                    <textarea
                      className="admin-reply-textarea"
                      placeholder="Écrivez votre réponse…"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={4}
                    />
                    <div className="admin-reply-actions">
                      <button
                        className="admin-btn admin-btn-cancel"
                        onClick={(e) => { e.stopPropagation(); setReplyOpen(null); }}
                      >
                        Annuler
                      </button>
                      <button
                        className="admin-btn admin-btn-send"
                        onClick={(e) => sendReply(e, msg.id)}
                        disabled={sending || !replyText.trim()}
                      >
                        {sending ? "Envoi…" : "Envoyer la réponse"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="admin-btn admin-btn-reply"
                    onClick={(e) => openReply(e, msg.id)}
                  >
                    Répondre
                  </button>
                )}
              </>
            )}
          </li>
        ))}
      </ul>

      {/* ── GALLERIE ────────────────────────────────── */}
      <h1 className="admin-title" style={{ marginTop: "3em" }}>Galerie</h1>

      <div className="admin-gallery-upload">
        <label className={`admin-btn admin-btn-send${uploading ? " disabled" : ""}`}>
          {uploading ? "Chargement…" : "＋ Ajouter une photo"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: "none" }}
            onChange={uploadPhoto}
            disabled={uploading}
          />
        </label>
        {galleryError && <p className="admin-gallery-error">{galleryError}</p>}
      </div>

      {gallery.length === 0 && !uploading && (
        <p className="admin-empty">Aucune photo dans la galerie.</p>
      )}

      <div className="admin-gallery-grid">
        {gallery.map((photo) => (
          <div key={photo.key} className="admin-gallery-item">
            <img src={photo.src} alt={photo.alt} />
            <button
              className="admin-gallery-delete"
              onClick={() => deletePhoto(photo.key)}
              title="Supprimer"
            >
              &#10005;
            </button>
          </div>
        ))}
      </div>

      {/* ── PHOTOS SECTIONS ──────────────────────────── */}
      <h1 className="admin-title" style={{ marginTop: "3em" }}>Photos des sections</h1>
      <p className="admin-empty" style={{ marginBottom: "1.5em" }}>
        Ces photos remplacent les images statiques du site.
      </p>
      {sectionError && <p className="admin-gallery-error">{sectionError}</p>}

      <div className="admin-sections-grid">
        {[
          { slot: "hero",   label: "Hero (bannière principale)" },
          { slot: "about",  label: "À propos" },
          { slot: "events", label: "Événements (fond)" },
        ].map(({ slot, label }) => (
          <div key={slot} className="admin-section-item">
            <p className="admin-section-label">{label}</p>
            {sections[slot] && (
              <img src={sections[slot]} alt={label} className="admin-section-preview" />
            )}
            <label className={`admin-btn admin-btn-send${sectionUploading[slot] ? " disabled" : ""}`}>
              {sectionUploading[slot] ? "Chargement…" : sections[slot] ? "Changer la photo" : "＋ Charger une photo"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: "none" }}
                onChange={(e) => uploadSection(e, slot)}
                disabled={!!sectionUploading[slot]}
              />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
