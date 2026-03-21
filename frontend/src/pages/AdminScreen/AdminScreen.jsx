import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/useConnecte";
import { hostname } from "../../HostnameConnect/Hostname";
import "./AdminScreen.css";

export default function AdminScreen() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("messages"); // "messages" | "gallery" | "sections"

  // ── Messages ─────────────────────────────────────────
  const [messages, setMessages] = useState([]);
  const [loadingMsgs, setLoadingMsgs] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [replyOpen, setReplyOpen] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  // ── Galerie ───────────────────────────────────────────
  const [gallery, setGallery] = useState([]);
  const [mainPhoto, setMainPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [galleryError, setGalleryError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // key à supprimer

  // ── Sections ──────────────────────────────────────────
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
      .finally(() => setLoadingMsgs(false));
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
      .then((data) => {
        setMainPhoto(data.main || null);
        setGallery(data.photos || []);
      });
  }, [isLoggedIn]);

  if (!isLoggedIn) return null;

  const unreadCount = messages.filter((m) => !m.read).length;

  const fmt = (iso) =>
    new Date(iso).toLocaleString("it-IT", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  // ── Handlers messages ────────────────────────────────
  const openMessage = (id) => {
    const msg = messages.find((m) => m.id === id);
    setExpanded(expanded === id ? null : id);
    if (replyOpen === id) setReplyOpen(null);
    if (msg && !msg.read) {
      fetch(`${hostname}/admin/messages/${id}/read`, { method: "PATCH", credentials: "include" });
      setMessages((prev) => prev.map((m) => m.id === id ? { ...m, read: true } : m));
    }
  };

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
      setMessages((prev) => prev.map((m) => m.id === id ? { ...m, replied: true } : m));
      setReplyOpen(null);
    } catch {
      alert("Errore durante l'invio. Riprova.");
    } finally {
      setSending(false);
    }
  };

  const deleteMsg = async (e, id) => {
    e.stopPropagation();
    try {
      await fetch(`${hostname}/admin/messages/${id}`, { method: "DELETE", credentials: "include" });
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (expanded === id) setExpanded(null);
    } catch {
      alert("Errore durante l'eliminazione.");
    }
  };

  // ── Handlers galerie ─────────────────────────────────
  const uploadMainPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingMain(true);
    setGalleryError(null);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const r = await fetch(`${hostname}/admin/gallery/main`, {
        method: "POST", credentials: "include", body: formData,
      });
      if (!r.ok) throw new Error();
      const { url } = await r.json();
      setMainPhoto({ src: `${url}?t=${Date.now()}`, alt: "Photo principale", key: "gallery/main" });
    } catch {
      setGalleryError("Errore durante l'upload della foto principale.");
    } finally {
      setUploadingMain(false);
      e.target.value = "";
    }
  };

  const uploadPhotos = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    setGalleryError(null);
    for (const file of files) {
      const formData = new FormData();
      formData.append("image", file);
      try {
        const r = await fetch(`${hostname}/admin/gallery/upload`, {
          method: "POST", credentials: "include", body: formData,
        });
        if (!r.ok) throw new Error();
        const { url, key } = await r.json();
        setGallery((prev) => [{ src: url, alt: "Photo", key }, ...prev]);
      } catch {
        setGalleryError("Errore durante l'upload di una o più foto.");
      }
    }
    setUploading(false);
    e.target.value = "";
  };

  const replacePhoto = async (e, oldKey) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = "";
    const formData = new FormData();
    formData.append("image", file);
    try {
      // Upload nouvelle photo
      const r = await fetch(`${hostname}/admin/gallery/upload`, {
        method: "POST", credentials: "include", body: formData,
      });
      if (!r.ok) throw new Error();
      const { url, key } = await r.json();
      // Supprime l'ancienne
      await fetch(`${hostname}/admin/gallery`, {
        method: "DELETE", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: oldKey }),
      });
      setGallery((prev) => prev.map((p) => p.key === oldKey ? { src: url, alt: "Photo", key } : p));
    } catch {
      setGalleryError("Errore durante la sostituzione della foto.");
    }
  };

  const confirmAndDelete = async () => {
    if (!confirmDelete) return;
    try {
      const r = await fetch(`${hostname}/admin/gallery`, {
        method: "DELETE", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: confirmDelete }),
      });
      if (!r.ok) throw new Error();
      if (confirmDelete === "gallery/main") setMainPhoto(null);
      setGallery((prev) => prev.filter((p) => p.key !== confirmDelete));
    } catch {
      setGalleryError("Errore durante l'eliminazione.");
    } finally {
      setConfirmDelete(null);
    }
  };

  // ── Handlers sections ────────────────────────────────
  const uploadSection = async (e, slot) => {
    const file = e.target.files[0];
    if (!file) return;
    setSectionUploading((prev) => ({ ...prev, [slot]: true }));
    setSectionError(null);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const r = await fetch(`${hostname}/admin/sections/${slot}`, {
        method: "POST", credentials: "include", body: formData,
      });
      if (!r.ok) throw new Error();
      const { url } = await r.json();
      setSections((prev) => ({ ...prev, [slot]: url }));
    } catch {
      setSectionError("Errore durante l'upload.");
    } finally {
      setSectionUploading((prev) => ({ ...prev, [slot]: false }));
      e.target.value = "";
    }
  };

  return (
    <div className="admin-page">

      {/* ── HEADER ────────────────────────────────────── */}
      <div className="admin-header">
        <span className="admin-brand">Il Locale — Admin</span>
        <a href="/" className="admin-view-site" target="_blank" rel="noreferrer">
          <i className="fas fa-external-link-alt" /> Vedere il sito
        </a>
      </div>

      {/* ── ONGLETS ───────────────────────────────────── */}
      <div className="admin-tabs-wrap">
      <div className="admin-tabs">
        <button
          className={`admin-tab${tab === "messages" ? " active" : ""}`}
          onClick={() => setTab("messages")}
        >
          Messaggi
          {unreadCount > 0 && <span className="admin-tab-badge">{unreadCount}</span>}
        </button>
        <button
          className={`admin-tab${tab === "gallery" ? " active" : ""}`}
          onClick={() => setTab("gallery")}
        >
          Galleria
        </button>
        <button
          className={`admin-tab${tab === "sections" ? " active" : ""}`}
          onClick={() => setTab("sections")}
        >
          Foto sezioni
        </button>
      </div>
      </div>

      {/* ── MESSAGES ──────────────────────────────────── */}
      {tab === "messages" && (
        <div className="admin-panel">
          {loadingMsgs && <p className="admin-empty">Caricamento…</p>}
          {!loadingMsgs && messages.length === 0 && (
            <p className="admin-empty">Nessun messaggio per ora.</p>
          )}
          <ul className="admin-list">
            {messages.map((msg) => (
              <li
                key={msg.id}
                className={`admin-card${expanded === msg.id ? " open" : ""}${!msg.read ? " unread" : ""}`}
                onClick={() => openMessage(msg.id)}
              >
                <div className="admin-card-header">
                  {!msg.read && <span className="admin-unread-dot" />}
                  <span className="admin-card-name">{msg.name}</span>
                  <span className="admin-card-email">{msg.email}</span>
                  {msg.replied && <span className="admin-badge">Risposto</span>}
                  <span className="admin-card-date">{fmt(msg.createdAt)}</span>
                </div>

                {expanded === msg.id && (
                  <>
                    <p className="admin-card-body">{msg.message}</p>

                    <div className="admin-card-actions">
                      {replyOpen === msg.id ? (
                        <div className="admin-reply-form" onClick={(e) => e.stopPropagation()}>
                          <textarea
                            className="admin-reply-textarea"
                            placeholder="Scrivi la tua risposta…"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            rows={4}
                          />
                          <div className="admin-reply-actions">
                            <button
                              className="admin-btn admin-btn-cancel"
                              onClick={(e) => { e.stopPropagation(); setReplyOpen(null); }}
                            >
                              Annulla
                            </button>
                            <button
                              className="admin-btn admin-btn-send"
                              onClick={(e) => sendReply(e, msg.id)}
                              disabled={sending || !replyText.trim()}
                            >
                              {sending ? "Invio…" : "Invia risposta"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button className="admin-btn admin-btn-reply" onClick={(e) => openReply(e, msg.id)}>
                          <i className="fas fa-reply" /> Rispondi
                        </button>
                      )}
                      <button className="admin-btn admin-btn-delete" onClick={(e) => deleteMsg(e, msg.id)}>
                        <i className="fas fa-trash" /> Elimina
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── GALERIE ───────────────────────────────────── */}
      {tab === "gallery" && (
        <div className="admin-panel">

          {galleryError && <p className="admin-gallery-error">{galleryError}</p>}

          {/* Top : main photo (2/3) + add slot (1/3) */}
          <div className="admin-gallery-top">
            {mainPhoto ? (
              <div className="admin-gallery-main-slot">
                <img src={mainPhoto.src} alt="principale" className="admin-gallery-main-preview" />
                <span className="admin-gallery-main-label">
                  {uploadingMain ? "Caricamento…" : "Foto principale"}
                </span>
                <label className="admin-gallery-replace" title="Sostituisci">
                  <i className="fas fa-pencil-alt" />
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    style={{ display: "none" }}
                    onChange={uploadMainPhoto}
                    disabled={uploadingMain}
                  />
                </label>
                <button className="admin-gallery-main-delete" onClick={() => setConfirmDelete("gallery/main")} title="Elimina">
                  &#10005;
                </button>
              </div>
            ) : (
              <label className={`admin-gallery-main-slot admin-gallery-main-btn${uploadingMain ? " disabled" : ""}`}>
                <span className="admin-gallery-main-placeholder"><i className="fas fa-image" /><br />Foto principale</span>
                <span className="admin-gallery-main-label">
                  {uploadingMain ? "Caricamento…" : "＋ Carica foto principale"}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: "none" }}
                  onChange={uploadMainPhoto}
                  disabled={uploadingMain}
                />
              </label>
            )}
            <label className={`admin-gallery-add-slot${uploading ? " disabled" : ""}`}>
              <i className="fas fa-plus" style={{ fontSize: "1.4rem" }} />
              {uploading ? "Caricamento…" : "Aggiungi foto"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                style={{ display: "none" }}
                onChange={uploadPhotos}
                disabled={uploading}
              />
            </label>
          </div>

          {/* Grid 3 colonnes : photos uniquement */}
          <div className="admin-gallery-grid">
            {gallery.map((photo) => (
              <div key={photo.key} className="admin-gallery-item">
                <img src={photo.src} alt={photo.alt} />
                <label className="admin-gallery-replace" title="Sostituisci">
                  <i className="fas fa-pencil-alt" />
                  <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={(e) => replacePhoto(e, photo.key)} />
                </label>
                <button className="admin-gallery-delete" onClick={() => setConfirmDelete(photo.key)} title="Elimina">
                  &#10005;
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SECTIONS ──────────────────────────────────── */}
      {tab === "sections" && (
        <div className="admin-panel">
          {sectionError && <p className="admin-gallery-error">{sectionError}</p>}
          <div className="admin-sections-grid">
            {[
              { slot: "hero",   label: "Hero (banner principale)" },
              { slot: "about",  label: "Chi siamo" },
              { slot: "events", label: "Eventi (sfondo)" },
            ].map(({ slot, label }) => (
              <div key={slot} className="admin-section-item">
                <p className="admin-section-label">{label}</p>
                {sections[slot] && (
                  <img src={sections[slot]} alt={label} className="admin-section-preview" />
                )}
                <label className={`admin-btn admin-btn-send${sectionUploading[slot] ? " disabled" : ""}`}>
                  {sectionUploading[slot] ? "Caricamento…" : sections[slot] ? "Cambia foto" : "＋ Carica foto"}
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
      )}

      {/* ── MODAL SUPPRESSION ─────────────────────────── */}
      {confirmDelete && (
        <div className="admin-modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <p className="admin-modal-text">Eliminare questa foto?</p>
            <div className="admin-modal-actions">
              <button className="admin-btn admin-btn-cancel" onClick={() => setConfirmDelete(null)}>
                Annulla
              </button>
              <button className="admin-btn admin-btn-danger" onClick={confirmAndDelete}>
                Elimina
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
