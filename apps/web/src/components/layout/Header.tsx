import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Compass, Moon, Sun, Globe, Menu, User, LogOut } from 'lucide-react';
import { useUiStore } from '../../stores/ui.store.js';
import { useSessionStore } from '../../stores/session.store.js';
import { Drawer } from '../ui/Drawer.js';
import { Button } from '../ui/Button.js';
import { Badge } from '../ui/Badge.js';

export const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const theme = useUiStore((state) => state.theme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);
  const isMobileMenuOpen = useUiStore((state) => state.isMobileMenuOpen);
  const setMobileMenuOpen = useUiStore((state) => state.setMobileMenuOpen);
  const { user, isAuthenticated, logout } = useSessionStore();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'hi' ? 'en' : 'hi';
    i18n.changeLanguage(nextLang);
  };

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/design', label: t('nav.design') },
    ...(isAuthenticated ? [{ to: '/dashboard', label: 'Dashboard' }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E8DDD2] bg-[#FFFDF9]/95 dark:bg-[#1F1A17]/95 dark:border-[#3D3430] backdrop-blur-sm">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 text-[#3A2E2A] dark:text-[#F5EFEB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4562B] rounded-[8px] p-1"
          aria-label="SAATHI home"
        >
          <div className="w-9 h-9 rounded-[8px] bg-[#C4562B] flex items-center justify-center text-white shadow-sm">
            <Compass className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading text-xl font-bold tracking-tight leading-none">
              SAATHI
            </span>
            <span className="text-[10px] tracking-wider uppercase font-semibold text-[#6A5B55] dark:text-[#B8AAA3]">
              साथी
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-semibold transition-colors px-2 py-1 rounded-[6px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4562B] ${
                  isActive
                    ? 'text-[#C4562B] dark:text-[#D86A3E]'
                    : 'text-[#6A5B55] hover:text-[#3A2E2A] dark:text-[#B8AAA3] dark:hover:text-[#F5EFEB]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Language Switch */}
          <button
            type="button"
            onClick={toggleLanguage}
            aria-label={`${t('common.languageSelect')}: currently ${i18n.language.toUpperCase()}`}
            className="inline-flex items-center gap-1.5 min-h-[44px] px-3 py-2 text-sm font-semibold rounded-[8px] border border-[#E8DDD2] text-[#3A2E2A] hover:bg-[#F3ECE4] dark:border-[#3D3430] dark:text-[#F5EFEB] dark:hover:bg-[#2A2320] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4562B]"
          >
            <Globe className="w-4 h-4 text-[#C4562B] dark:text-[#D86A3E]" aria-hidden="true" />
            <span>{i18n.language === 'hi' ? 'EN' : 'हिन्दी'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={t('common.themeToggle')}
            aria-pressed={theme === 'dark'}
            className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-[8px] border border-[#E8DDD2] text-[#3A2E2A] hover:bg-[#F3ECE4] dark:border-[#3D3430] dark:text-[#F5EFEB] dark:hover:bg-[#2A2320] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4562B]"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-[#EFA531]" aria-hidden="true" />
            ) : (
              <Moon className="w-5 h-5 text-[#6A5B55]" aria-hidden="true" />
            )}
          </button>

          {/* Auth State Button */}
          {isAuthenticated && user ? (
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/dashboard">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-[8px] border border-[#E8DDD2] bg-white dark:bg-[#1F1A17] dark:border-[#3D3430]">
                  <User className="w-4 h-4 text-[#C4562B]" />
                  <span className="text-xs font-semibold">{user.name.split(' ')[0]}</span>
                  <Badge
                    size="sm"
                    variant={
                      user.role === 'LEARNER'
                        ? 'student'
                        : user.role === 'PARENT'
                          ? 'parent'
                          : 'primary'
                    }
                  >
                    {user.role}
                  </Badge>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                aria-label="Sign out"
                className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-[8px] border border-[#E8DDD2] text-[#6A5B55] hover:text-[#B83226] hover:bg-[#FDF2F0] dark:border-[#3D3430] dark:text-[#B8AAA3] dark:hover:text-[#E56658] dark:hover:bg-[#2E1C1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4562B]"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Register
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label={t('common.menu')}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-nav-drawer"
            className="md:hidden inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-[8px] border border-[#E8DDD2] text-[#3A2E2A] hover:bg-[#F3ECE4] dark:border-[#3D3430] dark:text-[#F5EFEB] dark:hover:bg-[#2A2320] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4562B]"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <Drawer
        id="mobile-nav-drawer"
        isOpen={isMobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        title={t('common.menu')}
      >
        <nav className="flex flex-col gap-2" aria-label="Mobile navigation">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 rounded-[8px] font-semibold text-base text-[#3A2E2A] hover:bg-[#F3ECE4] dark:text-[#F5EFEB] dark:hover:bg-[#2A2320] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4562B]"
            >
              {link.label}
            </Link>
          ))}

          {/* Mobile Auth Actions */}
          <div className="pt-4 mt-2 border-t border-[#E8DDD2] dark:border-[#3D3430] flex flex-col gap-2">
            {isAuthenticated && user ? (
              <>
                <div className="px-4 py-2 text-sm text-[#6A5B55] dark:text-[#B8AAA3]">
                  Signed in as <span className="font-bold">{user.name}</span> ({user.role})
                </div>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  leftIcon={<LogOut className="w-4 h-4" />}
                >
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="md" className="w-full">
                    Sign in
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="md" className="w-full">
                    Register
                  </Button>
                </Link>
              </>
            )}

            <Button
              variant="secondary"
              size="md"
              onClick={toggleLanguage}
              leftIcon={<Globe className="w-4 h-4" />}
            >
              {i18n.language === 'hi' ? 'Switch to English' : 'हिंदी में बदलें'}
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={toggleTheme}
              leftIcon={
                theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />
              }
            >
              {theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
            </Button>
          </div>
        </nav>
      </Drawer>
    </header>
  );
};
