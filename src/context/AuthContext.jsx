import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import authService from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // تهيئة الحالة المبدئية مباشرة من التخزين المحلي لمنع وميض الشاشة عند إعادة التحميل
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("userData");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(true);

  // مزامنة والتحقق من الجلسة مع الخادم
  const bootstrapSession = useCallback(async () => {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("admin_token") ||
      localStorage.getItem("luma_token");

    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await authService.getMe();
      const currentUser = data?.user || data?.data || (data?.success ? data : null);

      if (currentUser && (currentUser._id || currentUser.id || currentUser.email)) {
        setUser(currentUser);
        localStorage.setItem("userData", JSON.stringify(currentUser));
      } else {
        throw new Error("Invalid user session");
      }
    } catch (err) {
      // إذا كان التوكن منتهي الصلاحية أو غير صالح
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("admin_token");
        localStorage.removeItem("luma_token");
        localStorage.removeItem("userData");
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrapSession();
  }, [bootstrapSession]);

  // تسجيل دخول مرن (يقبل كائن الرد كاملاً أو كائن المستخدم الصافي)
  const loginUser = (userOrResponse, optionalToken) => {
    let userData = null;
    let token = optionalToken || null;

    if (userOrResponse && typeof userOrResponse === "object") {
      if (userOrResponse.user) {
        userData = userOrResponse.user;
        token = token || userOrResponse.token;
      } else {
        userData = userOrResponse;
      }
    }

    if (token) {
      localStorage.setItem("token", token);
      if (userData?.role === "admin") {
        localStorage.setItem("admin_token", token);
      }
    }

    if (userData) {
      setUser(userData);
      localStorage.setItem("userData", JSON.stringify(userData));
    }
  };

  // تحديث بيانات الملف الشخصي في الـ Context والتخزين المحلي فورياً
  const updateUserContext = (updatedFields) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedFields };
      localStorage.setItem("userData", JSON.stringify(merged));
      return merged;
    });
  };

  // تسجيل الخروج التام
  const logoutUser = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error("Logout failed silently:", err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("admin_token");
      localStorage.removeItem("luma_token");
      localStorage.removeItem("userData");
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
        updateUserContext,
        logoutUser,
        refreshSession: bootstrapSession,
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