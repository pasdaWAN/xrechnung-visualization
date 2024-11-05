import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { InvoiceViewer } from './components/InvoiceViewer';
import { ValidationSummary } from './components/ValidationSummary';
import { XRechnungData, ValidationResult } from './types/index';

interface AppProps {}

export const App: React.FC<AppProps> = () => {
  const [invoiceData, setInvoiceData] = useState<XRechnungData | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  return (
    <div className="app">
      <header className="app-header">
        <h1>XRechnung Validator & Viewer</h1>
      </header>
      
      <main>
        <FileUpload 
          onFileProcessed={(data, validation) => {
            setInvoiceData(data);
            setValidationResult(validation);
          }} 
        />
        
        {validationResult && (
          <ValidationSummary result={validationResult} />
        )}
        
        {invoiceData && (
          <InvoiceViewer invoiceData={invoiceData} />
        )}
      </main>
    </div>
  );
}; 