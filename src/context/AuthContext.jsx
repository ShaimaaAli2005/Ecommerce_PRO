import React, { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // فحص الجلسة الأوتوماتيكي عند إقلاع التطبيق (Bootstrap)
  useEffect(() => {
    const bootstrapSession = async () => {
      try {
        const data = await authService.getMe();
        if (data?.user) {
          setUser(data.user);
        } else if (data?.data) {
          setUser(data.data);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapSession();
  }, []);

  const loginUser = (userData) => {
    setUser(userData);
  };

  const logoutUser = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;