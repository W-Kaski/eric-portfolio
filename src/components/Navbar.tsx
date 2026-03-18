import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Github, Twitter, Sun, Moon, Languages } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useApp } from '@/src/context/AppContext';
import { useConfig } from '@/src/context/ConfigContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { siteConfig } = useConfig();
  const { theme, toggleTheme, lang, toggleLang, t } = useApp();

  const navItems = siteConfig?.navItems || [];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4',
        scrolled ? 'bg-brand-bg/80 backdrop-blur-lg border-b border-brand-border py-3' : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-xl font-bold tracking-tighter flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-text rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-brand-bg rounded-sm rotate-45" />
          </div>
          <span className="hidden sm:inline-block">{siteConfig?.name}</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'text-sm font-medium transition-colors hover:text-brand-text',
                location.pathname === item.path ? 'text-brand-text' : 'text-brand-muted'
              )}
            >
              {t(item.name)}
              {location.pathname === item.path && (
                <motion.div
                  layoutId="nav-underline"
                  className="h-px bg-brand-text mt-0.5"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </div>

        {/* Controls & Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1 sm:gap-2 mr-2 border-r border-brand-border pr-2 sm:pr-4">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-brand-text/5 text-brand-muted hover:text-brand-text transition-all"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button 
              onClick={toggleLang}
              className="p-2 rounded-full hover:bg-brand-text/5 text-brand-muted hover:text-brand-text transition-all flex items-center gap-1"
              title="Toggle Language"
            >
              <Languages size={18} />
              <span className="text-[10px] font-bold uppercase">{lang}</span>
            </button>
          </div>
          
          <div className="hidden sm:flex items-center gap-4 mr-2">
            <a href={siteConfig?.socials?.github} className="text-brand-muted hover:text-brand-text transition-colors"><Github size={18} /></a>
          </div>
          
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-brand-text p-2"
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-brand-bg border-b border-brand-border p-6 md:hidden"
          >
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'text-lg font-medium',
                    location.pathname === item.path ? 'text-brand-text' : 'text-brand-muted'
                  )}
                >
                  {t(item.name)}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
