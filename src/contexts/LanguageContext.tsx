import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocalStorage } from 'usehooks-ts';

// Import your translation files
import enTranslations from '@/locales/en.json';
import neTranslations from '@/locales/ne.json';
import hiTranslations from '@/locales/hi.json';

type Language = 'en' | 'ne' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: enTranslations,
  ne: neTranslations,
  hi: hiTranslations,
} as const;

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [storedLanguage, setStoredLanguage] = useLocalStorage<Language>('language', 'en');
  const [language, setLanguage] = useState<Language>(storedLanguage);

  // Update document language attribute for accessibility
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string, params?: Record<string, string | number>): string => {
    // Split the key by dots to handle nested objects
    const keys = key.split('.');
    let value: any = translations[language];
    
    try {
      // Traverse the translations object
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          // Fallback to English if translation not found
          value = keys.reduce((obj, k) => (obj && obj[k] !== undefined ? obj[k] : ''), translations.en as any);
          if (!value) {
            console.warn(`Translation not found for key: ${key}`);
            return key; // Return the key if translation not found
          }
          break;
        }
      }

      // Replace placeholders if params are provided
      if (params && typeof value === 'string') {
        return Object.entries(params).reduce(
          (str, [param, val]) => str.replace(new RegExp(`{{${param}}}`, 'g'), String(val)),
          value
        );
      }

      return value || key;
    } catch (error) {
      console.error(`Error translating key: ${key}`, error);
      return key;
    }
  };

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    setStoredLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
