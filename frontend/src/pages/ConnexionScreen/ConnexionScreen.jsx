import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/useConnecte";
import { hostname } from "../../HostnameConnect/Hostname";

export default function ConnexionScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        setError("Email ou mot de passe incorrect.");
      }
    } catch {
      setError("Erreur de connexion au serveur.");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: "1em",
      }}
    >
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <h1 style={{ textAlign: "center", marginBottom: "1.5em" }}>
          Connexion Admin
        </h1>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1em" }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: "0.75em", borderRadius: "8px", border: "1px solid #ddd" }}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: "0.75em", borderRadius: "8px", border: "1px solid #ddd" }}
          />
          {error && <p style={{ color: "red", margin: 0 }}>{error}</p>}
          <button
            type="submit"
            style={{
              backgroundColor: "#4a4e69",
              color: "white",
              border: "none",
              padding: "0.8em",
              borderRadius: "8px",
              fontSize: "1em",
              cursor: "pointer",
            }}
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}
