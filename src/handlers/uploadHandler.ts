import { XRechnungService } from '../services/XRechnungService';
import { ValidationResult, XRechnungData } from '../components/exports';
import { ValidationError, ErrorCode } from '../types/validation';
import { ValidationService } from '../services/ValidationService';

interface UploadResponse {
  success: boolean;
  data?: XRechnungData;
  validation?: ValidationResult;
  error?: {
    code: ErrorCode;
    message: string;
    suggestion?: string;
    severity: 'CRITICAL' | 'ERROR';
    location: string;
  };
}

async function handleXRechnungUpload(file: File): Promise<UploadResponse> {
  try {
    const content = await file.text();
    
    // XML validation
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(content, "text/xml");
    
    if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
      return {
        success: false,
        error: {
          code: 'PARSE_ERROR',
          message: 'Die Datei enthält kein gültiges XML Format.',
          suggestion: 'Bitte stellen Sie sicher, dass die Datei ein korrektes XML Format hat.',
          severity: 'CRITICAL',
          location: 'document'
        }
      };
    }

    // XRechnung validation
    const validationResult = await ValidationService.validateXRechnung(file);
    const data = await XRechnungService.parseXRechnung(content);

    return {
      success: true,
      data,
      validation: validationResult
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'PROCESSING_ERROR',
        message: 'Die XRechnung konnte nicht verarbeitet werden.',
        suggestion: 'Bitte überprüfen Sie, ob die Datei eine gültige XRechnung ist.',
        severity: 'CRITICAL',
        location: 'document'
      }
    };
  }
}

export default handleXRechnungUpload; 