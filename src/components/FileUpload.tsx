import { useState } from 'react';
import { validateXRechnung } from '../services/validation';
import XRechnungParser from '../services/XRechnungParser';
import { XRechnungData, ValidationResult } from '../types/index';

interface FileUploadProps {
  onFileProcessed: (data: XRechnungData, validation: ValidationResult) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileProcessed }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;
    
    setLoading(true);
    setFile(uploadedFile);
    
    try {
      const validationResult = await validateXRechnung(uploadedFile);
      const fileContent = await uploadedFile.text();
      const parser = new XRechnungParser(fileContent);
      const data = parser.parse();
      
      onFileProcessed(data, validationResult);
    } catch (error) {
      console.error('Processing failed:', error);
      onFileProcessed({} as XRechnungData, {
        isValid: false,
        errors: [{ 
          code: 'PROCESSING_ERROR', 
          message: error instanceof Error ? error.message : 'Unknown error',
          location: '',
          suggestion: 'Please try again with a valid XRechnung XML file'
        }],
        warnings: []
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="file-upload">
      <h2>Upload XRechnung File</h2>
      <div className="upload-container">
        <input
          type="file"
          accept=".xml"
          onChange={handleFileUpload}
          id="file-input"
        />
        <button 
          onClick={() => document.getElementById('file-input')?.click()}
          className="upload-button"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Choose File'}
        </button>
      </div>
      {file && <p>Selected file: {file.name}</p>}
    </div>
  );
}; 