import { useState } from "react";

export const useAuth = () => {
  const [user, setUser] = useState(null);

  const login = (username, password) => {
    // Dummy login
    setUser({ username });
  };

  const logout = () => setUser(null);

  return { user, login, logout };
};
