import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/useConnecte";
import { hostname } from "../../HostnameConnect/Hostname";
import "./Navbar.css";

export default function Navbar() {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch(`${hostname}/logout`, { method: "GET", credentials: "include" });
    } catch (err) {
      console.error(err);
    }
    logout();
    navigate("/");
  };

  const close = () => setMenuOpen(false);

  return (
    <nav className="site-nav">
      <a href="/#home" className="site-nav-brand" onClick={close}>
        <span className="site-nav-logo-text">NOM DU SITE</span>
      </a>

      <button
        className="site-nav-burger"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Menu"
      >
        <i className={menuOpen ? "fas fa-times" : "fas fa-bars"} />
      </button>

      <ul className={`site-nav-links${menuOpen ? " open" : ""}`}>
        <li><a href="/#home" onClick={close}>Accueil</a></li>
        <li><a href="/#about" onClick={close}>À propos</a></li>
        <li><a href="/#menu" onClick={close}>Menu</a></li>
        <li><a href="/#gallery" onClick={close}>Galerie</a></li>
        <li><a href="/#events" onClick={close}>Événements</a></li>
        <li><a href="/#contact" onClick={close}>Contact</a></li>
        <li>
          <a href="tel:+33XXXXXXXXXX" className="site-nav-call" onClick={close}>
            <i className="fas fa-phone" /> +33 X XX XX XX XX
          </a>
        </li>
        {isLoggedIn && (
          <>
            <li><a href="/admin" onClick={close}>Admin</a></li>
            <li>
              <button className="site-nav-logout" onClick={handleLogout}>
                Déconnexion
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
