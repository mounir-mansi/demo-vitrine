import React, {
  useState,
  useContext,
  createContext,
  useMemo,
} from "react";
import PropTypes from "prop-types";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => !!localStorage.getItem("adminLoggedIn")
  );

  const login = () => {
    localStorage.setItem("adminLoggedIn", "true");
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
  };

  const value = useMemo(
    () => ({ isLoggedIn, login, logout }),
    [isLoggedIn]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
