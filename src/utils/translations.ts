import translations from '../assets/de.xml';

export const getTranslation = (key: string): string => {
  const entry = translations.querySelector(`entry[key="${key}"]`);
  return entry?.textContent || key;
}; 