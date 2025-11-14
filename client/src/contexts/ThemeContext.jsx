import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Initialize with dark mode as default
  const [isDark, setIsDark] = useState(true);

  // Run once on mount to check saved preference
  useEffect(() => {
    const saved = localStorage.getItem('farmer-theme');
    if (saved) {
      // If there's a saved preference, use it
      setIsDark(saved === 'dark');
    } else {
      // If no saved preference, default to dark mode
      setIsDark(true);
      // Save the default preference
      localStorage.setItem('farmer-theme', 'dark');
    }
  }, []);

  // Update DOM and localStorage when theme changes
  useEffect(() => {
    localStorage.setItem('farmer-theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const value = {
    isDark,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};