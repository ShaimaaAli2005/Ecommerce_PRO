import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    try {
      const savedTheme = localStorage.getItem("luma_theme");
      if (savedTheme) {
        return savedTheme === "dark";
      }
      return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch (e) {
      return false;
    }
  });

  // مزامنة فئات الـ HTML والـ Meta Tags وتخزين التفضيل
  useEffect(() => {
    const root = document.documentElement;
    
    if (isDark) {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
      localStorage.setItem("luma_theme", "dark");
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
      localStorage.setItem("luma_theme", "light");
    }

    // تحديث لون واجهة المتصفح على الهواتف
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement("meta");
      metaThemeColor.name = "theme-color";
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute("content", isDark ? "#0B132B" : "#FDFBF7");
  }, [isDark]);

  // الاستماع لتغيرات نظام التشغيل عندما لا يكون هناك تفضيل يدوي محفوظ
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = (e) => {
      const hasManualChoice = localStorage.getItem("luma_theme");
      if (!hasManualChoice) {
        setIsDark(e.matches);
      }
    };

    mediaQuery.addEventListener("change", handleSystemChange);
    return () => mediaQuery.removeEventListener("change", handleSystemChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  const setTheme = useCallback((themeName) => {
    if (themeName === "dark") setIsDark(true);
    else if (themeName === "light") setIsDark(false);
  }, []);

  const theme = isDark ? "dark" : "light";

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      toggleTheme, 
      setTheme, 
      isDark, 
      setIsDark 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export default ThemeContext;