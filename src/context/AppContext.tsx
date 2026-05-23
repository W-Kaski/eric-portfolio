import React, { createContext, useContext, useState, useEffect } from 'react';
import { useConfig } from './ConfigContext';

type Theme = 'light' | 'dark';
type Language = 'en' | 'zh';

interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  lang: Language;
  toggleLang: () => void;
  t: (key: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { translations } = useConfig();
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as Theme) || 'dark';
    }
    return 'dark';
  });

  const [lang, setLang] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('lang') as Language) || 'en';
    }
    return 'en';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const toggleLang = () => setLang(prev => prev === 'en' ? 'zh' : 'en');

  const t = (key: string) => {
    if (!translations) return key;
    const transMap = new Map<string, Record<string, string>>(Object.entries(translations));
    const langDict = transMap.get(lang);
    if (langDict) {
      const dictMap = new Map<string, string>(Object.entries(langDict));
      return dictMap.get(key) || key;
    }
    return key;
  };

  return (
    <AppContext.Provider value={{ theme, toggleTheme, lang, toggleLang, t }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
