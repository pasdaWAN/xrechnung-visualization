import React, { createContext, useContext, useState, useEffect } from 'react';
import { TranslationKey, TranslationFunction } from '../types/translations';
import deTranslationsXml from '../assets/de.xml';
import { XMLService } from '../services/XMLService';

type TranslationMap = Partial<Record<TranslationKey, string>>;

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

interface TranslationContextType {
  t: TranslationFunction;
}

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [translations, setTranslations] = useState<TranslationMap>({});

  useEffect(() => {
    setTranslations(XMLService.parseTranslations(deTranslationsXml));
  }, []);

  const t = (key: TranslationKey): string => {
    return translations[key] || key;
  };

  return (
    <TranslationContext.Provider value={{ t }}>
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