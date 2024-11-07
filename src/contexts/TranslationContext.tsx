import React, { createContext, useContext } from 'react';
import { messages as translations, MessageKey as TranslationKey } from '../translations/messages';

const TranslationContext = createContext<(key: TranslationKey) => string>(
  (key) => translations[key] || key
);

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const t = (key: TranslationKey) => translations[key] || key;
  return (
    <TranslationContext.Provider value={t}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const t = useContext(TranslationContext);
  return { t };
}; 