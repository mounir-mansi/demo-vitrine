import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";
import LandingPage from "./pages/LandingPage/LandingPage";
import ConnexionScreen from "./pages/ConnexionScreen/ConnexionScreen";
import AdminScreen from "./pages/AdminScreen/AdminScreen";

import { AuthProvider } from "./utils/useConnecte";
import CookieBanner from "./components/CookieBanner/CookieBanner";
import "./App.css";

function App() {
  return (
    <React.StrictMode>
      <AuthProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/connexion" element={<ConnexionScreen />} />
            <Route path="/admin" element={<AdminScreen />} />
          </Routes>
        </Router>
        <CookieBanner />
      </AuthProvider>
    </React.StrictMode>
  );
}

export default App;
