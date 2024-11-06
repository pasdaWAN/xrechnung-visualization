import React, { useState, useRef } from 'react';
import { validateXRechnung } from '../services/validation';
import XRechnungParser from '../services/XRechnungParser';
import { XRechnungData, ValidationResult } from '../types/index';
import { ErrorModal } from './ErrorModal';
import { useErrorTranslations } from '../utils/errorTranslations';

interface FileUploadProps {
  onFileProcessed: (data: XRechnungData, validation: ValidationResult) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileProcessed }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errors, setErrors] = useState<Array<{code: string; message: string; suggestion?: string}>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { translateErrorMessage, getErrorSuggestion } = useErrorTranslations();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;
    
    setLoading(true);
    setFile(uploadedFile);
    
    try {
      const fileContent = await uploadedFile.text();
      
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(fileContent, "text/xml");
      if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
        throw new Error("Invalid XML format");
      }

      const validationResult = await validateXRechnung(uploadedFile);
      const xrechnungParser = new XRechnungParser(fileContent);
      const data = xrechnungParser.parse();
      
      if (!validationResult.isValid) {
        setErrors(validationResult.errors.map(error => ({
          code: error.code,
          message: translateErrorMessage(error.code, error.message),
          suggestion: getErrorSuggestion(error.code)
        })));
        setShowErrorModal(true);
      } else {
        onFileProcessed(data, validationResult);
      }
    } catch (error) {
      console.error('File processing error:', error);
      
      let errorMessage = 'Die XRechnung konnte nicht verarbeitet werden.';
      let suggestion = 'Bitte überprüfen Sie, ob die Datei eine gültige XRechnung ist.';
      
      if (error instanceof Error) {
        if (error.message === "Invalid XML format") {
          errorMessage = 'Die Datei enthält kein gültiges XML Format.';
          suggestion = 'Bitte stellen Sie sicher, dass die Datei ein korrektes XML Format hat.';
        }
      }
      
      setErrors([{
        code: 'PROCESSING_ERROR',
        message: errorMessage,
        suggestion: suggestion
      }]);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseError = () => {
    setShowErrorModal(false);
    setFile(null);
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <div className="file-upload">
        <h2>Upload XRechnung File</h2>
        <div className="upload-container">
          <input
            type="file"
            accept=".xml"
            onChange={handleFileUpload}
            ref={fileInputRef}
            style={{ display: 'none' }}
            id="file-input"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="upload-button"
            disabled={loading}
          >
            {loading ? 'Verarbeitung...' : 'XRechnung hochladen'}
          </button>
        </div>
        {file && <p>Ausgewählte Datei: {file.name}</p>}
      </div>
      <ErrorModal 
        errors={errors}
        isOpen={showErrorModal}
        onClose={handleCloseError}
      />
    </>
  );
}; 