import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Language = 'en' | 'ceb';

interface Translations {
  [key: string]: {
    en: string;
    ceb: string;
  };
}

export const translations: Translations = {
  // Navigation
  home: { en: 'Home', ceb: 'Main' },
  about: { en: 'About', ceb: 'Bahin' },
  transparency: { en: 'Transparency', ceb: 'Talan-awon' },
  services: { en: 'Services', ceb: 'Serbisyo' },
  tourism: { en: 'Tourism', ceb: 'Turismo' },
  downloads: { en: 'Downloads', ceb: 'Kuhaanan' },
  
  // CTAs
  payOnline: { en: 'Pay Fee Online', ceb: 'Bayad Online' },
  downloadForm: { en: 'Download Form', ceb: 'Kuhaa ang Porma' },
  readMore: { en: 'Read More', ceb: 'Basaha Pa' },
  search: { en: 'Search...', ceb: 'Pangitaa...' },
  
  // Home Page
  welcome: { en: 'Welcome to Talibon', ceb: 'Maayong Pag-abot sa Talibon' },
  tagline: { en: 'The Seafood Capital of Bohol', ceb: 'Ang Kaulohan sa Isda sa Bohol' },
  explore: { en: 'Explore Our Town', ceb: 'Susiha ang Atong Lungsod' },
  latestNews: { en: 'Latest News', ceb: 'Pinakabag-ong Balita' },
  
  // Footer / Common
  contactUs: { en: 'Contact Us', ceb: 'Kontaka Kami' },
  emergency: { en: 'Emergency', ceb: 'Emerhensya' },
  officeHours: { en: 'Office Hours', ceb: 'Oras sa Opisina' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    if (!translations[key]) return key;
    return translations[key][language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
