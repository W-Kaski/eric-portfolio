import React, { createContext, useContext, useState, useEffect } from 'react';

interface SiteConfig {
  name: string;
  author: string;
  email: string;
  copyrightYear: number;
  footerMessage: string;
  socials: {
    github: string;
    twitter: string;
    linkedin: string;
  };
  navItems: { name: string; path: string }[];
  hero: {
    previewImage: string;
  };
}

interface AboutConfig {
  avatarUrl: string;
  resumeUrl: string;
  skills: { name: string; level: number }[];
  timeline: { year: string; role: string; company: string }[];
}



interface ConfigContextType {
  siteConfig: SiteConfig | null;
  aboutConfig: AboutConfig | null;

  translations: Record<string, Record<string, string>> | null;
  loading: boolean;
}

const ConfigContext = createContext<ConfigContextType>({
  siteConfig: null,
  aboutConfig: null,

  translations: null,
  loading: true,
});

export const useConfig = () => useContext(ConfigContext);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [aboutConfig, setAboutConfig] = useState<AboutConfig | null>(null);

  const [translations, setTranslations] = useState<Record<string, Record<string, string>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const cacheBuster = `?t=${Date.now()}`;
        const [siteRes, aboutRes, transRes] = await Promise.all([
          fetch(`/config/site.json${cacheBuster}`),
          fetch(`/config/about.json${cacheBuster}`),

          fetch(`/config/translations.json${cacheBuster}`),
        ]);

        const _siteConfig = await siteRes.json();
        const _aboutConfig = await aboutRes.json();

        const _translations = await transRes.json();

        setSiteConfig(_siteConfig);
        setAboutConfig(_aboutConfig);

        setTranslations(_translations);
      } catch (error) {
        console.error("Failed to load configs", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfigs();
  }, []);

  return (
    <ConfigContext.Provider value={{ siteConfig, aboutConfig, translations, loading }}>
      {children}
    </ConfigContext.Provider>
  );
};
