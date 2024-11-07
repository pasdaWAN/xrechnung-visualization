import React from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, ChevronDown } from 'lucide-react';
import { ValidationResult, ValidationError } from './exports';
import { useTranslation } from '../contexts/TranslationContext';
import { MessageKey } from '../translations/messages';

interface ValidationResultsProps {
  result: ValidationResult;
}

const ValidationResults: React.FC<ValidationResultsProps> = ({ result }) => {
  const { t } = useTranslation();

  return (
    <details className="group bg-white rounded-lg shadow-sm" open>
      <summary className="p-6 border-b cursor-pointer list-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">{t('validierungsfehler')}</h2>
          </div>
          <ChevronDown className="h-5 w-5 text-gray-500 transition-transform group-open:rotate-180" />
        </div>
      </summary>

      <div className="p-6 space-y-4">
        {result.isValid ? (
          <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-green-800">Valid XRechnung</h3>
              <p className="mt-1 text-sm text-green-700">
                This invoice meets all XRechnung requirements.
              </p>
            </div>
          </div>
        ) : null}

        {result.errors?.map((error, index) => (
          <div
            key={index}
            className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg"
          >
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800">
                {error.code}
              </h3>
              <p className="mt-1 text-sm text-red-700">
                {error.message}
              </p>
              {error.suggestion && (
                <p className="mt-2 text-sm text-red-600">
                  {error.suggestion}
                </p>
              )}
              {error.location && (
                <p className="mt-1 text-sm text-red-600">
                  {t('error.position' as MessageKey)}: {error.location}
                </p>
              )}
            </div>
          </div>
        ))}

        {result.warnings?.map((warning, index) => (
          <div
            key={index}
            className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg"
          >
            <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                Warning
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                {warning.message}
              </p>
              {warning.location && (
                <p className="mt-1 text-sm text-yellow-600">
                  Location: {warning.location}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </details>
  );
};

export default ValidationResults;