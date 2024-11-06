import { useTranslation } from '../contexts/TranslationContext';
import { TranslationKey } from '../types/translations';

export const useErrorTranslations = () => {
  const { t } = useTranslation();
  
  const translateErrorMessage = (code: string, technicalMessage: string): string => {
    return t(`error.${code}` as TranslationKey) || t('error.unexpected');
  };

  const getErrorSuggestion = (code: string): string => {
    return t(`error.suggestion.${code}` as TranslationKey) || t('error.suggestion.default');
  };

  return { translateErrorMessage, getErrorSuggestion };
}; 