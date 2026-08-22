import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import LanguageToggle from '@/components/LanguageToggle';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronRight, Sun, Moon } from 'lucide-react';

const NAV_LINKS = [
  { key: 'features' as const, id: 'features' },
  { key: 'process' as const, id: 'process' },
  { key: 'benefits' as const, id: 'benefits' },
  { key: 'integrations' as const, id: 'integrations' },
  { key: 'faq' as const, id: 'faq' },
];

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const { t } = useLocale();

  const loadingRef = React.useRef(loading);
  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [isNavigating, setIsNavigating] = useState(false);

  const navigateByRole = async () => {
    setIsNavigating(true);

    const waitFor = (ms: number) => new Promise((res) => setTimeout(res, ms));
    const start = Date.now();

    while (loadingRef.current && Date.now() - start < 3000) {
      await waitFor(100);
    }

    if (!user) {
      router.push('/login');
      setIsNavigating(false);
      return;
    }

    const role = profile?.role;
    if (role === 'officer') router.push('/dashboard');
    else if (role === 'user') router.push('/user-dashboard');
    else router.push('/choose-role');
  };

  return (
    <motion.nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'theme-bg-nav backdrop-blur-xl border-b theme-border-glass shadow-[0_1px_12px_-6px_rgba(0,0,0,0.25)]'
          : 'bg-transparent border-b border-transparent'
      }`}
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2.5 group"
            aria-label={t('nav.brandName')}
          >
            <Image
              src={theme === 'dark' ? '/Logo-Dark.png' : '/Logo-Light.png'}
              alt={t('nav.brandName')}
              width={32}
              height={32}
              className="object-contain"
            />
            <span className="text-lg font-semibold tracking-tight theme-text-primary">
              {t('nav.brandName')}
            </span>
          </button>

          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="group relative text-sm font-medium theme-text-secondary hover:text-accent-gradient transition-colors"
              >
                {t(`nav.${item.key}`)}
                <span className="pointer-events-none absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-accent-gradient transition-transform duration-300 group-hover:scale-x-100" />
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-1.5">
            <LanguageToggle compact />

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={t('extracted.toggle_theme')}
              className="w-9 h-9 rounded-lg flex items-center justify-center theme-text-secondary hover:theme-bg-glass hover:theme-text-primary transition-all"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme}
                  initial={{ opacity: 0, rotate: -30 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 30 }}
                  transition={{ duration: 0.15 }}
                  className="flex"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4" style={{ color: 'var(--accent-secondary)' }} />
                  ) : (
                    <Moon className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                  )}
                </motion.span>
              </AnimatePresence>
            </button>

            <span className="w-px h-5 theme-border-glass bg-theme-border-glass mx-1.5" />

            <button
              type="button"
              onClick={() => navigateByRole()}
              disabled={isNavigating}
              aria-label={t('extracted.get_started_continue')}
              className={`inline-flex items-center justify-center min-w-[104px] px-4 py-2 accent-gradient rounded-lg text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md hover:-translate-y-px active:translate-y-0 ${
                isNavigating ? 'opacity-80 cursor-wait' : ''
              }`}
            >
              {isNavigating ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="sr-only">Loading...</span>
                </>
              ) : (
                t('nav.getStarted')
              )}
            </button>
          </div>

          <button
            type="button"
            className="md:hidden p-2 -mr-2 rounded-lg theme-text-primary hover:theme-bg-glass transition-all"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden theme-bg-nav backdrop-blur-xl border-t theme-border-glass"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <div className="px-4 pt-2 pb-5">
              <div className="divide-y theme-border-glass">
                {NAV_LINKS.map((item, index) => (
                  <motion.a
                    key={item.id}
                    href={`#${item.id}`}
                    className="flex items-center justify-between py-3.5 text-base font-medium theme-text-secondary active:text-accent-gradient"
                    onClick={() => setIsMobileMenuOpen(false)}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04, duration: 0.25 }}
                  >
                    {t(`nav.${item.key}`)}
                    <ChevronRight className="w-4 h-4 opacity-40" />
                  </motion.a>
                ))}
              </div>

              <motion.div
                className="mt-4 space-y-3"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.25 }}
              >
                <button
                  type="button"
                  onClick={() => navigateByRole()}
                  disabled={isNavigating}
                  aria-label={t('extracted.get_started_continue')}
                  className={`w-full inline-flex items-center justify-center px-4 py-3 accent-gradient rounded-lg text-sm font-semibold text-white shadow-md ${
                    isNavigating ? 'opacity-80 cursor-wait' : ''
                  }`}
                >
                  {isNavigating ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="sr-only">Loading...</span>
                    </>
                  ) : (
                    t('nav.getStarted')
                  )}
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <LanguageToggle className="w-full [&>button]:w-full [&>button]:py-2.5" />

                  <button
                    type="button"
                    onClick={() => { toggleTheme(); setIsMobileMenuOpen(false); }}
                    className="w-full px-4 py-2.5 rounded-lg theme-bg-glass theme-border-glass border flex items-center justify-center gap-2 text-sm font-medium theme-text-primary"
                  >
                    {theme === 'dark' ? (
                      <Sun className="w-4 h-4" style={{ color: 'var(--accent-secondary)' }} />
                    ) : (
                      <Moon className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                    )}
                    Theme
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navigation;
