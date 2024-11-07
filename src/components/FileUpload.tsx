import React, { useCallback, useState, useRef } from 'react';
import { Upload, File } from 'lucide-react';
import handleXRechnungUpload from '../handlers/uploadHandler';
import { useTranslation } from '../contexts/TranslationContext';
import ValidationResults from './ValidationResults';
import { MessageKey } from '../translations/messages';
import { ErrorCode, ValidationResult, ValidationError } from '../types/validation';
import { XRechnungData } from '../types/xrechnung';

interface FileUploadProps {
  onFileProcessed: (data: XRechnungData, validation: ValidationResult) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileProcessed }) => {
  const { t } = useTranslation();
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
          message: t(`error.${result.error!.code}` as MessageKey),
          suggestion: result.error!.suggestion || t(`error.suggestion.${result.error!.code}` as MessageKey)
        }]);
        return;
      }
      
      if (result.validation && !result.validation.isValid) {
        const processedErrors = result.validation.errors.map(error => ({
          code: error.code as ErrorCode,
          message: t(`error.${error.code}` as MessageKey),
          severity: error.severity,
          suggestion: t(`error.suggestion.${error.code}` as MessageKey),
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