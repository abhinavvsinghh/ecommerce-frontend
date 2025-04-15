import React, { createContext, useState, useEffect } from "react";
import { getCurrentAuthUser, isAuthenticated } from "../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        // Check if token exists in localStorage
        const token = localStorage.getItem("authToken");

        if (!token) {
          setAuthenticated(false);
          setUser(null);
          setAuthChecked(true);
          setLoading(false);
          return;
        }

        // Verify token validity with backend
        try {
          // First check with Cognito
          const authenticated = await isAuthenticated();
          setAuthenticated(authenticated);

          if (authenticated) {
            try {
              const currentUser = await getCurrentAuthUser();
              setUser(currentUser);
            } catch (userError) {
              console.error("Error fetching user details:", userError);
              setUser({ email: localStorage.getItem("userEmail") || "" });
            }
          } else {
            // Clear invalid token
            localStorage.removeItem("authToken");
            localStorage.removeItem("userEmail");
            setUser(null);
          }

          setAuthChecked(true);
        } catch (authError) {
          console.error("Error verifying authentication:", authError);
          // Clear tokens on error
          localStorage.removeItem("authToken");
          localStorage.removeItem("userEmail");
          setAuthenticated(false);
          setUser(null);
          setAuthChecked(true);
        }
      } catch (error) {
        console.error("Error checking authentication status:", error);
        setAuthenticated(false);
        setUser(null);
        setAuthChecked(true);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();

    const handleStorageChange = (e) => {
      if (e.key === "authToken") {
        checkAuthStatus();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const value = {
    user,
    setUser,
    loading,
    authenticated,
    setAuthenticated,
    authChecked,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
