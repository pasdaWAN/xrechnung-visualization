import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, TranslationKey, TranslationFunction } from '../types/translations';
import deTranslationsXml from '../assets/de.xml';
import enTranslationsXml from '../assets/en.xml';
import { XMLService } from '../services/XMLService';

type TranslationMap = Partial<Record<TranslationKey, string>>;

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationFunction;
}

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('de');
  const [translations, setTranslations] = useState<Record<Language, TranslationMap>>({
    de: {},
    en: {}
  });

  useEffect(() => {
    setTranslations({
      de: XMLService.parseTranslations(deTranslationsXml),
      en: XMLService.parseTranslations(enTranslationsXml)
    });
  }, []);

  const t = (key: TranslationKey): string => {
    return translations[language][key] || key;
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}; 