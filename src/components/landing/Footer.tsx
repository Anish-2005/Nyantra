import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronRight, Globe, Mail, Phone, MapPinned, Send } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLocale } from '../../context/LocaleContext';

const Footer = () => {
  const { theme } = useTheme();
  const { t } = useLocale();

  return (
    <footer className="relative py-16 px-4 sm:px-6 lg:px-8 border-t theme-border-glass">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 flex items-center justify-center overflow-hidden bg-transparent theme-border-glass border-2 rounded-2xl">
                <Image src={theme === 'dark' ? '/Logo-Dark.png' : '/Logo-Light.png'} alt={t('nav.brandName')} width={44} height={44} className="object-contain" />
              </div>
              <span className="text-2xl font-bold text-accent-gradient overflow-visible" style={{ lineHeight: '1.4' }}>
                {t('nav.brandName')}
              </span>
            </div>
            <p className="theme-text-secondary mb-6 leading-relaxed overflow-visible py-2 text-base">
              {t('footer.companyDesc')}
            </p>
            <div className="flex space-x-3">
              {[
                { icon: Globe, label: t('footer.social.website') },
                { icon: Mail, label: t('footer.social.email') },
                { icon: Phone, label: t('footer.social.phone') },
                { icon: MapPinned, label: t('footer.social.location') }
              ].map((social, i) => (
                <motion.button
                  key={i}
                  className="w-12 h-12 theme-bg-glass theme-border-glass border rounded-xl flex items-center justify-center hover:shadow-lg transition-all group"
                  whileHover={{ scale: 1.1, backgroundColor: 'var(--accent-primary)' }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5 theme-text-primary group-hover:text-white transition-colors" />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 theme-text-primary overflow-visible">{t('footer.quickLinks')}</h3>
            <ul className="space-y-3">
              {[
                t('footer.links.about'),
                t('footer.links.howItWorks'),
                t('footer.links.successStories'),
                t('footer.links.newsUpdates'),
                t('footer.links.careers'),
                t('footer.links.contact')
              ].map((link, i) => (
                <motion.li key={i} whileHover={{ x: 5 }}>
                  <a href="#" className="theme-text-secondary hover:text-accent-gradient transition-colors flex items-center space-x-2 overflow-visible">
                    <ChevronRight className="w-4 h-4" />
                    <span>{link}</span>
                  </a>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Enhanced Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-6 theme-text-primary overflow-visible">{t('footer.contact.title')}</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 theme-bg-glass rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-accent-gradient" />
                </div>
                <div className="overflow-visible">
                  <p className="text-sm theme-text-muted mb-1">{t('footer.contact.helpline')}</p>
                  <p className="theme-text-primary font-semibold">{t('footer.contact.helplineNumber')}</p>
                  <p className="text-xs theme-text-muted overflow-visible">{t('footer.contact.available247')}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 theme-bg-glass rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-accent-gradient" />
                </div>
                <div className="overflow-visible">
                  <p className="text-sm theme-text-muted mb-1">{t('footer.contact.email')}</p>
                  <p className="theme-text-primary font-semibold">{t('footer.contact.emailAddress')}</p>
                  <p className="text-xs theme-text-muted overflow-visible">{t('footer.contact.responseTime')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-bold mb-6 theme-text-primary overflow-visible">{t('footer.newsletter.title')}</h3>
            <div className="space-y-4">
              <p className="theme-text-secondary text-sm overflow-visible">{t('footer.newsletter.description')}</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder={t('footer.newsletter.placeholder')}
                  className="flex-1 px-4 py-3 theme-bg-glass theme-border-glass border rounded-lg theme-text-primary placeholder-theme-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary transition-all"
                />
                <motion.button
                  className="px-4 sm:px-6 py-3 accent-gradient rounded-lg font-semibold flex items-center justify-center space-x-2 text-white shadow-lg whitespace-nowrap"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="hidden sm:inline">{t('footer.newsletter.subscribe')}</span>
                  <span className="sm:hidden">{t('footer.newsletter.subscribe')}</span>
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t theme-border-glass pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="theme-text-secondary text-sm text-center md:text-left overflow-visible">
              <p className="overflow-visible">{t('footer.copyright')}</p>
              <p className="text-xs mt-1 overflow-visible py-1" style={{ lineHeight: '1.4' }}>
                {t('footer.developedBy')}
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm">
              {[
                t('footer.links.privacyPolicy'),
                t('footer.links.termsOfService'),
                t('footer.links.cookiePolicy'),
                t('footer.links.accessibility')
              ].map((link, i) => (
                <motion.a
                  key={i}
                  href="#"
                  className="theme-text-secondary hover:text-accent-gradient transition-colors overflow-visible"
                  whileHover={{ scale: 1.05 }}
                >
                  {link}
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;