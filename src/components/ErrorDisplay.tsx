import React from 'react';
import { ValidationError } from './exports';
import { messages as translations, MessageKey as TranslationKey } from '../translations/messages';
import { useTranslation } from '../contexts/TranslationContext';

interface Props {
  errors: ValidationError[];
}

export const ErrorDisplay: React.FC<Props> = ({ errors }) => {
  const { t } = useTranslation();

  if (!errors.length) return null;

  const getErrorMessage = (error: ValidationError): TranslationKey => {
    const key = `error.${error.code}` as TranslationKey;
    return key;
  };

  const getErrorSuggestion = (error: ValidationError): TranslationKey => {
    const key = `error.suggestion.${error.code}` as TranslationKey;
    return key;
  };

  return (
    <div className="error-display">
      <h2 className="error-title">{t('validierungsfehler')}</h2>
      {errors.map((error, index) => (
        <div key={index} className="error-item">
          <p><strong>{error.code}</strong></p>
          <p>{t(getErrorMessage(error))}</p>
          <p className="error-suggestion">{t(getErrorSuggestion(error))}</p>
          {error.location && <p>{t('error.position' as TranslationKey)}: {error.location}</p>}
        </div>
      ))}
    </div>
  );
}; 

export default ErrorDisplay;