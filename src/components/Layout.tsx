import React from 'react';
import Navbar from './Navbar';
import { motion } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';
import { useApp } from '../context/AppContext';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { siteConfig, loading } = useConfig();
  const { t } = useApp();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-brand-bg text-brand-text">
        <div className="w-8 h-8 border-2 border-brand-text/20 border-t-brand-text rounded-full animate-spin" />
      </div>
    );
  }

  if (!siteConfig) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-brand-bg text-brand-text gap-4">
        <h2 className="text-xl font-bold text-red-500">{t('Configuration Error')}</h2>
        <p className="text-brand-muted">{t('Failed to load site configuration. Please check your JSON files for syntax errors.')}</p>
      </div>
    );
  }

  const isPortfolio = location.pathname === '/portfolio';
  const isHome = location.pathname === '/';
  const isDetailPage = /^\/(articles|portfolio)\/.+/.test(location.pathname);
  const isFullScreen = isPortfolio || isHome;
  const hideFooter = isFullScreen || isDetailPage;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {/* MusicPlayer removed */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className={`flex-grow ${isFullScreen ? 'h-screen overflow-hidden' : 'pt-24'}`}
      >
        {children}
      </motion.main>
      
      {!hideFooter && (
        <footer className="py-12 px-6 border-t border-brand-border mt-10">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-brand-muted text-sm">
              © {siteConfig.copyrightYear} {siteConfig.author}. {siteConfig.footerMessage}
            </div>
          </div>
        </footer>
      )}

      {/* MusicPlayer removed */}
    </div>
  );
}
