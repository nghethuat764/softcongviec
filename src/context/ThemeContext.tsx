import React, { createContext, useContext, useEffect, useState } from 'react';
import { getDarkerHex, getLighterHex } from '../utils/colorUtils';

type ThemeMode = 'light' | 'dark';

export const DEFAULT_PRIMARY_COLOR = '#003366';

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  resetPrimaryColor: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const savedTheme = localStorage.getItem('theme_mode') as ThemeMode | null;
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
      }
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {
      // Fallback
    }
    return 'light';
  });

  const [primaryColor, setPrimaryColorState] = useState<string>(() => {
    try {
      const savedColor = localStorage.getItem('app_primary_color');
      if (savedColor && /^#([0-9A-F]{3}){1,2}$/i.test(savedColor)) {
        return savedColor;
      }
    } catch {
      // Fallback
    }
    return DEFAULT_PRIMARY_COLOR;
  });

  const isDark = theme === 'dark';

  // Apply dark mode class and color scheme
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
    try {
      localStorage.setItem('theme_mode', theme);
    } catch {
      // Ignore
    }
  }, [theme]);

  // Apply primary color CSS variables & save to LocalStorage
  useEffect(() => {
    const root = document.documentElement;
    const hoverColor = getDarkerHex(primaryColor, 18);
    const lightColor = getLighterHex(primaryColor, 88);

    root.style.setProperty('--primary-color', primaryColor);
    root.style.setProperty('--primary-hover', hoverColor);
    root.style.setProperty('--primary-light', lightColor);

    try {
      localStorage.setItem('app_primary_color', primaryColor);
    } catch {
      // Ignore
    }
  }, [primaryColor]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  const setPrimaryColor = (color: string) => {
    setPrimaryColorState(color);
  };

  const resetPrimaryColor = () => {
    setPrimaryColorState(DEFAULT_PRIMARY_COLOR);
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      isDark, 
      toggleTheme, 
      setTheme,
      primaryColor,
      setPrimaryColor,
      resetPrimaryColor
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
