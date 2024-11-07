import React, { useCallback, useState, useRef } from 'react';
import { Upload, File } from 'lucide-react';
import { handleXRechnungUpload } from '../handlers/uploadHandler';
import { useErrorTranslations } from '../utils/errorTranslations';
import { useTranslation } from '../contexts/TranslationContext';
import ValidationResults from './ValidationResults';

interface FileUploadProps {
  onFileProcessed: (data: XRechnungData, validation: ValidationResult) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileProcessed }) => {
  const { t } = useTranslation();
  const { translateErrorMessage, getErrorSuggestion } = useErrorTranslations();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (uploadedFile: File) => {
    setLoading(true);
    setFile(uploadedFile);
    
    try {
      const result = await handleXRechnungUpload(uploadedFile);
      
      if (!result.success) {
        setErrors([{
          ...result.error!,
          message: translateErrorMessage(result.error!.code, result.error!.message),
          suggestion: result.error!.suggestion || getErrorSuggestion(result.error!.code)
        }]);
        return;
      }
      
      if (result.validation && !result.validation.isValid) {
        const processedErrors = result.validation.errors.map(error => ({
          code: error.code as ErrorCode,
          message: translateErrorMessage(error.code, error.message),
          severity: error.severity,
          suggestion: getErrorSuggestion(error.code),
          location: error.location
        }));
        setErrors(processedErrors);
      }
      
      onFileProcessed(result.data!, result.validation!);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        processFile(droppedFile);
      }
    },
    [onFileProcessed]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const handleReset = () => {
    setFile(null);
    setErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-semibold text-gray-900">{t('uploadXRechnung')}</h3>
        <p className="mt-1 text-sm text-gray-500">{t('_description')}</p>
      </div>
      
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="mt-4 flex justify-center rounded-lg border border-dashed border-gray-300 px-6 py-10 transition-colors hover:bg-gray-50 cursor-pointer"
      >
        <div className="text-center">
          <File className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4 flex text-sm leading-6 text-gray-600">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
            >
              <span>{loading ? t('processingFile') : t('_open')}</span>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                accept=".xml"
                onChange={handleChange}
                ref={fileInputRef}
                disabled={loading}
              />
            </label>
            <p className="pl-1">{t('_description')}</p>
          </div>
          {errors.length > 0 && (
            <button 
              onClick={handleReset}
              className="mt-4 text-sm text-red-600 hover:text-red-500"
            >
              {t('uploadAnother')}
            </button>
          )}
          <p className="text-xs leading-5 text-gray-600">{t('_disclaimer')}</p>
        </div>
      </div>
      
      {errors.length > 0 && <ValidationResults result={{ errors, isValid: false, warnings: [] }} />}
    </div>
  );
};

export default FileUpload;