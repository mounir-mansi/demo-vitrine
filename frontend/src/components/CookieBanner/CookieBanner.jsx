import React, { useState, useEffect } from "react";
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
    <div className="cookie-banner" role="dialog" aria-label="Informations cookies">
      <div className="cookie-text">
        <p>
          Nous utilisons des cookies techniques essentiels au fonctionnement du site.
          Pour plus d&apos;informations, consultez notre{" "}
          <a href="/privacy" className="cookie-link">Politique de confidentialité</a>.
        </p>
      </div>
      <div className="cookie-actions">
        <button className="cookie-btn cookie-btn--decline" onClick={decline}>
          Essentiels uniquement
        </button>
        <button className="cookie-btn cookie-btn--accept" onClick={accept}>
          Accepter tout
        </button>
      </div>
    </div>
  );
}
