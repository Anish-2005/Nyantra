'use client';

import Image from 'next/image';
import { useTheme } from '../../context/ThemeContext';
import { useLocale } from '../../context/LocaleContext';
import { ChevronRight, Globe, Mail, Phone, MapPinned, Send } from 'lucide-react';
import { Reveal } from './primitives';

const Footer = () => {
  const { theme } = useTheme();
  const { t } = useLocale();

  const socials = [
    { icon: Globe, label: t('footer.social.website') },
    { icon: Mail, label: t('footer.social.email') },
    { icon: Phone, label: t('footer.social.phone') },
    { icon: MapPinned, label: t('footer.social.location') },
  ];

  const quickLinks = [
    t('footer.links.about'),
    t('footer.links.howItWorks'),
    t('footer.links.successStories'),
    t('footer.links.newsUpdates'),
    t('footer.links.careers'),
    t('footer.links.contact'),
  ];

  const legalLinks = [
    t('footer.links.privacyPolicy'),
    t('footer.links.termsOfService'),
    t('footer.links.cookiePolicy'),
    t('footer.links.accessibility'),
  ];

  return (
    <footer className="relative py-12 px-4 sm:px-6 lg:px-8 border-t theme-border-glass">
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 flex items-center justify-center overflow-hidden theme-border-glass border rounded-lg">
                  <Image src={theme === 'dark' ? '/Logo-Dark.png' : '/Logo-Light.png'} alt={t('nav.brandName')} width={32} height={32} className="object-contain" />
                </div>
                <span className="text-base font-bold text-accent-gradient">{t('nav.brandName')}</span>
              </div>
              <p className="text-[13px] theme-text-secondary leading-relaxed mb-5">{t('footer.companyDesc')}</p>
              <div className="flex gap-2">
                {socials.map((social, i) => (
                  <button
                    key={i}
                    className="w-8 h-8 theme-bg-glass theme-border-glass border rounded-lg flex items-center justify-center theme-text-secondary hover:text-white hover:bg-accent-primary hover:border-transparent transition-all"
                    aria-label={social.label}
                  >
                    <social.icon className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-4 theme-text-primary">{t('footer.quickLinks')}</h3>
              <ul className="space-y-2.5">
                {quickLinks.map((link, i) => (
                  <li key={i}>
                    <a href="#" className="group inline-flex items-center gap-1.5 text-[13px] theme-text-secondary hover:text-accent-gradient transition-colors">
                      <ChevronRight className="w-3 h-3 opacity-50 transition-transform group-hover:translate-x-0.5 group-hover:opacity-100" />
                      <span>{link}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-4 theme-text-primary">{t('footer.contact.title')}</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 shrink-0 theme-bg-glass border theme-border-glass rounded-lg flex items-center justify-center">
                    <Phone className="w-3.5 h-3.5 text-accent-gradient" />
                  </div>
                  <div>
                    <p className="text-[11px] theme-text-muted mb-0.5">{t('footer.contact.helpline')}</p>
                    <p className="text-[13px] font-semibold theme-text-primary">{t('footer.contact.helplineNumber')}</p>
                    <p className="text-[11px] theme-text-muted mt-0.5">{t('footer.contact.available247')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 shrink-0 theme-bg-glass border theme-border-glass rounded-lg flex items-center justify-center">
                    <Mail className="w-3.5 h-3.5 text-accent-gradient" />
                  </div>
                  <div>
                    <p className="text-[11px] theme-text-muted mb-0.5">{t('footer.contact.email')}</p>
                    <p className="text-[13px] font-semibold theme-text-primary">{t('footer.contact.emailAddress')}</p>
                    <p className="text-[11px] theme-text-muted mt-0.5">{t('footer.contact.responseTime')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-4 theme-text-primary">{t('footer.newsletter.title')}</h3>
              <p className="text-[13px] theme-text-secondary leading-relaxed mb-3.5">{t('footer.newsletter.description')}</p>
              <form className="flex flex-col sm:flex-row gap-2" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder={t('footer.newsletter.placeholder')}
                  className="flex-1 min-w-0 px-3 py-2 text-[13px] theme-bg-glass theme-border-glass border rounded-lg theme-text-primary placeholder-theme-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary transition-all"
                />
                <button
                  type="submit"
                  aria-label={t('footer.newsletter.subscribe')}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 accent-gradient rounded-lg text-[13px] font-semibold text-white shadow-sm whitespace-nowrap transition-all hover:shadow-md hover:-translate-y-px active:translate-y-0"
                >
                  {t('footer.newsletter.subscribe')}
                  <Send className="w-3 h-3" />
                </button>
              </form>
            </div>
          </div>
        </Reveal>

        <div className="border-t theme-border-glass pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="theme-text-secondary text-xs text-center md:text-left">
              <p>{t('footer.copyright')}</p>
              <p className="text-[11px] theme-text-muted mt-0.5">{t('footer.developedBy')}</p>
            </div>

            <nav className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-xs" aria-label="Legal">
              {legalLinks.map((link, i) => (
                <a key={i} href="#" className="theme-text-secondary hover:text-accent-gradient transition-colors">
                  {link}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
