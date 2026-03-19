import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/useConnecte";
import { hostname } from "../../HostnameConnect/Hostname";
import "./ConnexionScreen.css";

export default function ConnexionScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${hostname}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        login();
        navigate("/admin");
      } else {
        setError("Email o password errati.");
      }
    } catch {
      setError("Errore di connessione al server.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-logo">
          <p className="login-logo-name">Il Locale</p>
          <p className="login-logo-sub">Accesso amministratore</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <input
            className="login-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <div className="login-password-wrap">
            <input
              className="login-input"
              type={showPwd ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className="login-eye"
              onClick={() => setShowPwd((v) => !v)}
              aria-label={showPwd ? "Nascondi password" : "Mostra password"}
            >
              <i className={showPwd ? "fas fa-eye-slash" : "fas fa-eye"} />
            </button>
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-btn">
            Accedi
          </button>
        </form>

        <a href="/" className="login-back">
          ← Torna al sito
        </a>
      </div>
    </div>
  );
}
