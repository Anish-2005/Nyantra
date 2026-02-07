import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import LanguageToggle from '@/components/LanguageToggle';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronRight, ArrowRight, Rocket, Sun, Moon, Zap, Settings, HelpCircle, Users, Layers } from 'lucide-react';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const { t, locale, setLocale } = useLocale();

  // Keep track of auth loading state for async operations
  const loadingRef = React.useRef(loading);
  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  // Scroll detection for navigation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [isNavigating, setIsNavigating] = useState(false);

  // Navigation helper: navigate according to authenticated user's role
  const navigateByRole = async () => {
    setIsNavigating(true);

    // wait briefly for auth loading to settle (max ~3s)
    const waitFor = (ms: number) => new Promise((res) => setTimeout(res, ms));
    const start = Date.now();

    // Use ref to check current loading state
    while (loadingRef.current && Date.now() - start < 3000) {
      // poll every 100ms while auth initializes
      // eslint-disable-next-line no-await-in-loop
      await waitFor(100);
    }

    if (!user) {
      router.push('/login');
      setIsNavigating(false); // Reset in case user comes back
      return;
    }

    const role = profile?.role;
    if (role === 'officer') router.push('/dashboard');
    else if (role === 'user') router.push('/user-dashboard');
    else router.push('/choose-role');

    // Don't reset isNavigating if we pushed a route, to prevent flickers
  };

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-xl border-b theme-border-glass ${isScrolled ? 'theme-bg-nav shadow-2xl' : 'bg-transparent'
        }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <motion.div
            className="flex items-center space-x-3 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-12 h-12 flex items-center justify-center overflow-hidden bg-transparent rounded-xl theme-bg-glass theme-border-glass border">
              <Image src={theme === 'dark' ? '/Logo-Dark.png' : '/Logo-Light.png'} alt={t('nav.brandName')} width={44} height={44} className="object-contain" />
            </div>
            <span className="text-2xl font-bold text-accent-gradient overflow-visible" style={{ lineHeight: '1.4' }}>
              {t('nav.brandName')}
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {[
              { label: t('nav.features'), id: 'features', icon: Zap },
              { label: t('nav.process'), id: 'process', icon: Settings },
              { label: t('nav.benefits'), id: 'benefits', icon: Rocket },
              { label: t('nav.integrations'), id: 'integrations', icon: Layers },
              { label: t('nav.faq'), id: 'faq', icon: HelpCircle }
            ].map((item) => (
              <motion.a
                key={item.id}
                href={`#${item.id}`}
                className="relative px-4 py-2.5 theme-text-secondary hover:text-accent-gradient transition-all font-medium rounded-xl hover:theme-bg-glass group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10">{item.label}</span>
                <div className="absolute inset-0 bg-accent-gradient opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300" />
              </motion.a>
            ))}
            <div className="w-px h-6 bg-theme-border-glass mx-2" />
            <motion.button
              onClick={() => navigateByRole()}
              disabled={isNavigating}
              aria-label={t('extracted.get_started_continue')}
              className={`px-6 py-2.5 accent-gradient rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all relative overflow-hidden group ${isNavigating ? 'opacity-80 cursor-wait' : ''}`}
              whileHover={{ scale: isNavigating ? 1 : 1.05, y: isNavigating ? 0 : -2 }}
              whileTap={{ scale: isNavigating ? 1 : 0.95 }}
            >
              <span className="relative z-10 flex items-center space-x-2">
                {isNavigating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <span>{t('nav.getStarted')}</span>
                )}
              </span>
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.button>

            {/* Language selector (toggle) */}
            <div className="ml-2">
              <LanguageToggle />
            </div>

            {/* Enhanced Theme Toggle */}
            <motion.button
              onClick={toggleTheme}
              className="ml-2 w-11 h-11 rounded-xl flex items-center justify-center theme-border-glass border theme-bg-glass hover:theme-bg-card transition-all relative group"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label={t('extracted.toggle_theme')}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={theme}
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  {theme === 'dark' ? (
                    <Sun className="w-5 h-5" style={{ color: 'var(--accent-secondary)' }} />
                  ) : (
                    <Moon className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
                  )}
                </motion.div>
              </AnimatePresence>
              <div className="absolute inset-0 bg-accent-gradient opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300" />
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden theme-text-primary p-2 rounded-xl theme-bg-glass theme-border-glass border"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileTap={{ scale: 0.9 }}
            aria-label="Toggle mobile menu"
          >
            <motion.div
              animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.div>
          </motion.button>
        </div>
      </div>

      {/* Enhanced Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden theme-bg-nav backdrop-blur-xl border-t theme-border-glass shadow-2xl"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 py-6 space-y-4">
              <div className="grid grid-cols-1 gap-2">
                {[
                  { label: t('nav.features'), id: 'features', icon: Zap },
                  { label: t('nav.process'), id: 'process', icon: Settings },
                  { label: t('nav.benefits'), id: 'benefits', icon: Rocket },
                  { label: t('nav.integrations'), id: 'integrations', icon: Layers },
                  { label: t('nav.faq'), id: 'faq', icon: HelpCircle }
                ].map((item, index) => (
                  <motion.a
                    key={item.id}
                    href={`#${item.id}`}
                    className="flex items-center justify-between theme-text-secondary hover:text-accent-gradient transition-all font-medium px-4 py-4 rounded-xl hover:theme-bg-glass group border theme-border-glass hover:border-accent-primary/20"
                    whileHover={{ x: 8, backgroundColor: "var(--glass-bg)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsMobileMenuOpen(false)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg theme-bg-glass flex items-center justify-center text-accent-gradient group-hover:scale-110 transition-transform">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <span className="text-lg">{item.label}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-accent-gradient opacity-50 group-hover:opacity-100" />
                  </motion.a>
                ))}
              </div>

              <div className="border-t theme-border-glass pt-4 space-y-4">
                <motion.button
                  onClick={() => navigateByRole()}
                  disabled={isNavigating}
                  aria-label={t('extracted.get_started_continue')}
                  className={`w-full px-6 py-3 accent-gradient rounded-xl font-semibold text-white shadow-lg relative overflow-hidden group ${isNavigating ? 'opacity-80 cursor-wait' : ''}`}
                  whileTap={{ scale: isNavigating ? 1 : 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <span className="relative z-10 flex items-center justify-center space-x-2">
                    {isNavigating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Loading...</span>
                      </>
                    ) : (
                      <span>{t('nav.getStarted')}</span>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.button>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="flex justify-center h-full">
                    <LanguageToggle className="w-full h-full flex items-center justify-center" />
                  </div>
                  <motion.button
                    onClick={() => { toggleTheme(); setIsMobileMenuOpen(false); }}
                    className="w-full px-4 py-3 rounded-xl theme-border-glass border theme-bg-glass flex items-center justify-center space-x-2 theme-text-primary hover:theme-bg-card transition-all group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {theme === 'dark' ? <Sun className="w-5 h-5" style={{ color: 'var(--accent-secondary)' }} /> : <Moon className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />}
                    <span className="font-medium text-sm">Theme</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav >
  );
};

export default Navigation;