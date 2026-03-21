import { useState } from "react";
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
        <span className="site-nav-logo-text">Il Locale</span>
      </a>

      <button
        className="site-nav-burger"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Menu"
      >
        <i className={menuOpen ? "fas fa-times" : "fas fa-bars"} />
      </button>

      <ul className={`site-nav-links${menuOpen ? " open" : ""}`}>
        <li><a href="/#home" onClick={close}>Home</a></li>
        <li><a href="/#about" onClick={close}>Chi siamo</a></li>
        <li><a href="/#menu" onClick={close}>Menu</a></li>
        <li><a href="/#gallery" onClick={close}>Galleria</a></li>
        <li><a href="/#events" onClick={close}>Eventi</a></li>
        <li><a href="/#contact" onClick={close}>Contatti</a></li>
        {isLoggedIn && (
          <>
            <li><a href="/admin" onClick={close}>Admin</a></li>
            <li>
              <button className="site-nav-logout" onClick={handleLogout}>
                Disconnetti
              </button>
            </li>
          </>
        )}
        <li className="site-nav-call-item">
          <a href="tel:+390223456789" className="site-nav-call" onClick={close}>
            <i className="fas fa-phone" /> +39 02 2345 6789
          </a>
        </li>
      </ul>
    </nav>
  );
}
