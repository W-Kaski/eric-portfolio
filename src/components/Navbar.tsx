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
        <Link to="/" className="text-xl font-bold tracking-tighter flex items-center gap-3">
          <svg viewBox="0 0 50 21" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-auto text-brand-text">
            <path d="M24.5 17C20.9101 17 18 14.0899 18 10.5C18 6.91015 20.9101 4 24.5 4C27.2712 4 29.6384 5.73448 30.5732 8.17871L31.5078 7.82129C30.4298 5.00278 27.6992 3 24.5 3C20.3579 3 17 6.35786 17 10.5C17 14.6421 20.3579 18 24.5 18C27.6992 18 30.4298 15.9972 31.5078 13.1787L30.5732 12.8213C29.6384 15.2655 27.2712 17 24.5 17Z" fill="currentColor"/>
            <path d="M24.5 20C19.2533 20 15 15.7467 15 10.5C15 5.25329 19.2533 1 24.5 1C28.5761 1 32.0542 3.56724 33.4023 7.1748L34.3389 6.8252C32.8495 2.83947 29.0069 0 24.5 0C18.701 0 14 4.70101 14 10.5C14 16.299 18.701 21 24.5 21C29.0069 21 32.8495 18.1605 34.3389 14.1748L33.4023 13.8252C32.0542 17.4328 28.5761 20 24.5 20Z" fill="currentColor"/>
            <path d="M21.5 10.5C21.5 12.1569 22.8431 13.5 24.5 13.5C25.9865 13.5 27.2199 12.4188 27.458 11H27.2861C27.0498 12.3261 25.894 13.333 24.5 13.333C22.9352 13.333 21.667 12.0648 21.667 10.5C21.667 8.93519 22.9352 7.66699 24.5 7.66699C25.894 7.66699 27.0498 8.67394 27.2861 10H27.458C27.2199 8.58118 25.9865 7.5 24.5 7.5C22.8431 7.5 21.5 8.84315 21.5 10.5Z" stroke="currentColor"/>
            <path d="M27 10.5V11H35V10.5H27Z" fill="currentColor"/>
            <path d="M27 10V10.5H35V10H27Z" fill="currentColor"/>
            <path d="M50 14C48.3838 14 46.0187 13.7162 43.6954 12.8116C41.3726 11.9071 39.0491 10.3638 37.5888 7.8157C34.045 1.63231 27.7163 0.937911 25.0546 1.09771L25 0.0208569C27.8016 -0.147223 34.6063 0.564414 38.4375 7.24938C39.7395 9.52137 41.8391 10.9432 44.0339 11.7979C46.228 12.6522 48.4751 12.9221 50 12.9221V14Z" fill="currentColor"/>
            <path d="M24 21C22.4484 21 20.1779 20.7162 17.9476 19.8116C15.7177 18.9071 13.4871 17.3638 12.0852 14.8157C8.68321 8.63231 2.60769 7.93791 0.0524419 8.09771L-7.01519e-07 7.02086C2.68951 6.85278 9.22201 7.56441 12.9 14.2494C14.1499 16.5214 16.1656 17.9432 18.2725 18.7979C20.3788 19.6522 22.5361 19.9221 24 19.9221V21Z" fill="currentColor"/>
          </svg>
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
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button 
              onClick={toggleLang}
              className="p-2 rounded-full hover:bg-brand-text/5 text-brand-muted hover:text-brand-text transition-all flex items-center gap-1"
              title="Toggle Language"
              aria-label="Toggle Language"
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
