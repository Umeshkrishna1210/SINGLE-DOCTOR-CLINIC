import { createContext, useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  const refreshAccessToken = useCallback(async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return false;
    try {
      const res = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
      localStorage.setItem("token", res.data.token);
      if (res.data.refreshToken) localStorage.setItem("refreshToken", res.data.refreshToken);
      setUser(res.data.user);
      return true;
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      setUser(null);
      return false;
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decodedUser.exp < currentTime) {
          refreshAccessToken();
          return;
        }
        setUser(decodedUser);
      } catch {
        refreshAccessToken();
      }
    } else {
      setUser(null);
    }
  }, [refreshAccessToken]);

  const login = useCallback(({ token, refreshToken, user: userData }) => {
    localStorage.setItem("token", token);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await axios.post(`${API_BASE}/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {}
    }
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setUser(null);
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, login, logout, refreshAccessToken }}>
      {children}
    </UserContext.Provider>
  );
}
