import { useState, useEffect } from "react";
import "./CookieBanner.css";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("cookie_consent", "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-label="Informazioni sui cookie">
      <div className="cookie-text">
        <p>
          Utilizziamo cookie tecnici essenziali per il funzionamento del sito.
          Per ulteriori informazioni, consulta la nostra{" "}
          <a href="/privacy" className="cookie-link">Informativa sulla privacy</a>.
        </p>
      </div>
      <div className="cookie-actions">
        <button className="cookie-btn cookie-btn--decline" onClick={decline}>
          Solo essenziali
        </button>
        <button className="cookie-btn cookie-btn--accept" onClick={accept}>
          Accetta tutto
        </button>
      </div>
    </div>
  );
}
