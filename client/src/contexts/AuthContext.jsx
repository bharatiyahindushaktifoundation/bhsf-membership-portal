import React, { createContext, useState, useEffect, useCallback } from "react";

import { authService } from "../services";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    const stored = localStorage.getItem("bhsf_admin_info");

    if (!stored || stored === "undefined" || stored === "null") {
      return null;
    }

    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error("Invalid admin info in localStorage:", error);
      localStorage.removeItem("bhsf_admin_info");
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("bhsf_admin_token");

    if (!token) {
      setLoading(false);
      return;
    }

    authService
      .getCurrentAdmin()
      .then((res) => {
        setAdmin(res.data);
        localStorage.setItem(
          "bhsf_admin_info",
          JSON.stringify(res.data)
        );
      })
      .catch(() => {
        localStorage.removeItem("bhsf_admin_token");
        localStorage.removeItem("bhsf_admin_info");
        setAdmin(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback((token, adminInfo) => {
    localStorage.setItem("bhsf_admin_token", token);
    localStorage.setItem(
      "bhsf_admin_info",
      JSON.stringify(adminInfo)
    );
    setAdmin(adminInfo);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("bhsf_admin_token");
    localStorage.removeItem("bhsf_admin_info");
    setAdmin(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        admin,
        loading,
        login,
        logout,
        isAuthenticated: !!admin,
        isSuperAdmin: admin?.role === "SUPER_ADMIN",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}