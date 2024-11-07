import React, { useState } from 'react';
import { FileUpload, InvoiceDisplay, ValidationResults } from './components/exports';
import { XRechnungData } from './types/xrechnung';
import { ValidationResult } from './types/validation';
import { useTranslation } from './contexts/TranslationContext';
import { FileCheck } from 'lucide-react';

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'validated' | 'error'>('idle');
  const [invoice, setInvoice] = useState<XRechnungData | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const { t } = useTranslation();

  const handleFileUpload = async (data: XRechnungData, validation: ValidationResult) => {
    setValidationStatus('validating');
    
    try {
      if (!validation.isValid) {
        setValidationStatus('error');
        setValidationResult({
          isValid: false,
          errors: validation.errors || [],
          warnings: []
        });
        return;
      }

      setInvoice(data);
      setValidationStatus('validated');
      setValidationResult({
        isValid: true,
        errors: [],
        warnings: validation.warnings || []
      });
    } catch (error) {
      console.error('Error processing file:', error);
      setValidationStatus('error');
      setValidationResult({
        isValid: false,
        errors: [{
          code: 'PROCESSING_ERROR',
          message: t('error.PROCESSING_ERROR'),
          location: 'document',
          severity: 'CRITICAL'
        }],
        warnings: []
      });
    }
  };

  const handleReset = () => {
    setFile(null);
    setValidationStatus('idle');
    setInvoice(null);
    setValidationResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileCheck className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-semibold text-gray-900">XRechnung Viewer</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Mehr über Robaws</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <section className="bg-white rounded-lg shadow-sm p-6">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">{t('uploadXRechnung')}</h2>
                {file && (
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    weitere XRechnung hochladen
                  </button>
                )}
              </div>
              {!file && <FileUpload onFileProcessed={handleFileUpload} />}
            </div>
          </section>

          {validationStatus === 'validating' && (
            <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-blue-600">{t('processingFile')}</span>
            </div>
          )}

          {invoice && validationResult && (
            <div className="space-y-8">
              <InvoiceDisplay invoice={invoice} />
              <ValidationResults result={validationResult} />
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            {t('footer.text')}
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;