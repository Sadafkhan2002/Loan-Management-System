import { createContext, useContext, useEffect, useState } from "react";

import api from "../api/axios";

// ==========================================
// Authentication Context
// ==========================================

const AuthContext = createContext(null);

// ==========================================
// Authentication Provider
// ==========================================

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ========================================
  // Logout
  // ========================================

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
  };

  // ========================================
  // Restore Authentication on Refresh
  // ========================================

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);

        if (
          parsedUser &&
          typeof parsedUser === "object" &&
          !Array.isArray(parsedUser) &&
          parsedUser.role
        ) {
          setUser(parsedUser);
        } else {
          logout();
        }
      } catch {
        logout();
      }
    } else {
      // Avoid retaining incomplete authentication data.
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }

    // Handle unauthorized responses from Axios.
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener("auth:logout", handleUnauthorized);

    setLoading(false);

    return () => {
      window.removeEventListener("auth:logout", handleUnauthorized);
    };
  }, []);

  // ========================================
  // Login
  // ========================================

  const login = async (email, password) => {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    const responseData = response.data?.data;

    if (!responseData?.token || !responseData?.user) {
      throw new Error("Invalid login response from server.");
    }

    const { token, user: loggedInUser } = responseData;

    localStorage.setItem("token", token);

    localStorage.setItem("user", JSON.stringify(loggedInUser));

    setUser(loggedInUser);

    return {
      token,
      user: loggedInUser,
    };
  };

  // ========================================
  // Role Checking
  // ========================================

  const hasRole = (roles = []) => {
    if (!user || !Array.isArray(roles)) {
      return false;
    }

    return roles.includes(user.role);
  };

  // ========================================
  // Context Provider
  // ========================================

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        hasRole,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ==========================================
// Custom Hook
// ==========================================

export const useAuth = () => useContext(AuthContext);
